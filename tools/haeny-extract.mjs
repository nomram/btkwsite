#!/usr/bin/env node
// Pulls the content out of the Häny product brochures (assets-src/docs/haeny-*-brochure-en.pdf, 4 pages each):
//   title + model, introduction, key features, typical applications, every spec table (label / value), "optional" lists,
//   footnotes, and three pictures per model when the brochure has them: the 3D model, the pump performance chart and the
//   dimension drawing. Output: crawl/haeny/<model>.json and assets-src/img/haeny-<model>-{model,chart,dim}.webp.
//
//   node tools/haeny-extract.mjs            (all brochures)
//   node tools/haeny-extract.mjs hcm100     (one)
//
// The brochures share one layout: black section bars (Eurostile Bold 8 pt) over two columns; rows are "label: value" on one
// baseline, so label and value are paired by position, not by reading order.
import fs from "node:fs";
import path from "node:path";
import * as mupdf from "mupdf";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const DOCS = path.join(ROOT, "assets-src/docs");
const IMG = path.join(ROOT, "assets-src/img");
const OUT = path.join(ROOT, "crawl/haeny");
fs.mkdirSync(OUT, { recursive: true });
const SCALE = 5; // only the vector figures (chart, dimension drawing) are rendered; the product pictures are the PDF's own embedded images

const clean = (s) => s.replace(/\s+/g, " ").replace(/ /g, " ").trim();
const BULLET = /^[►•▪·–-]\s*/;

function readLines(page) {
  const j = JSON.parse(page.toStructuredText("preserve-images").asJSON());
  const out = [];
  for (const b of j.blocks) {
    if (b.type !== "text") continue;
    for (const l of b.lines) {
      const text = clean(l.text);
      if (!text || text === "►") continue;
      out.push({ x: l.bbox.x, y: l.bbox.y, w: l.bbox.w, h: l.bbox.h, text, bold: /bold/i.test((l.font && (l.font.name + l.font.weight)) || ""), size: (l.font && l.font.size) || 9, font: (l.font && l.font.name) || "" });
    }
  }
  return out.sort((a, b) => a.y - b.y || a.x - b.x);
}

// section bars: Eurostile bold ~8 pt
const isBar = (l) => /Eurostile/i.test(l.font) && l.bold && l.size >= 7 && l.size <= 9.5;
const footer = (l) => l.y > 800 || /www\.haeny\.com|^\d?:?\s*Water to cement|Filling ratio/i.test(l.text) && l.y > 740;

function parseSections(lines, colX) {
  // returns {sections:[{title,subtitle,col,y,rows:[[l,v]],lists:{name:[..]},singles:[..]}], bars}
  const bars = lines.filter(isBar).sort((a, b) => a.y - b.y || a.x - b.x);
  const sections = [];
  const colOf = (l) => (l.x < colX ? 0 : 1);
  const starts = [];
  for (const b of bars) {
    const c = colOf(b);
    const prev = starts.find((s) => s.col === c && Math.abs(s.y - b.y) < 3 && b.x > s.x + 60);
    if (prev) { prev.subtitle = b.text; continue; } // the model name at the right end of the bar ("Grout pump | ZMP 710")
    starts.push({ title: b.text, subtitle: "", col: c, y: b.y, x: b.x });
  }
  for (const s of starts) {
    const next = starts.filter((t) => t.col === s.col && t.y > s.y + 3).sort((a, b) => a.y - b.y)[0];
    s.yEnd = next ? next.y - 2 : 800;
  }
  for (const s of starts) {
    const body = lines.filter((l) => !isBar(l) && !footer(l) && colOf(l) === s.col && l.y > s.y + 8 && l.y < s.yEnd);
    const sec = { title: s.title, subtitle: s.subtitle, col: s.col, y: s.y, yEnd: s.yEnd, rows: [], lists: {}, notes: [] };
    let cur = null; // current list name
    let prevItem = null;
    // group by baseline
    const rowsByY = [];
    for (const l of body) { const r = rowsByY.find((q) => Math.abs(q.y - l.y) < 3); if (r) r.items.push(l); else rowsByY.push({ y: l.y, items: [l] }); }
    rowsByY.sort((a, b) => a.y - b.y);
    const x0 = s.x;
    for (const r of rowsByY) {
      r.items.sort((a, b) => a.x - b.x);
      const first = r.items[0];
      if (r.items.length >= 2 && first.x < x0 + 20 && r.items[1].x > x0 + 50 && !BULLET.test(first.text)) {
        sec.rows.push([first.text.replace(/:$/, ""), r.items.slice(1).map((i) => i.text).join(" ")]);
        prevItem = null; continue;
      }
      const t = r.items.map((i) => i.text).join(" ");
      if (first.bold && !BULLET.test(t) && t.length < 60) { cur = t.replace(/:$/, ""); sec.lists[cur] = sec.lists[cur] || []; prevItem = null; continue; }
      if (BULLET.test(t)) { cur = cur || "items"; (sec.lists[cur] = sec.lists[cur] || []).push(t.replace(BULLET, "")); prevItem = sec.lists[cur]; continue; }
      if (prevItem && prevItem.length && first.x > x0 + 6) { prevItem[prevItem.length - 1] += " " + t; continue; } // wrapped bullet
      sec.rows.push([t, ""]);
    }
    // join words broken by a hyphen at the end of a line ("tur- bulence")
    for (const k of Object.keys(sec.lists)) sec.lists[k] = sec.lists[k].map((x) => x.replace(/(\w)- (?=[a-z])/g, "$1").replace(/\s+/g, " ").trim());
    sections.push(sec);
  }
  return sections;
}

async function cropImage(pixPng, pageW, pageH, box, name) {
  // box in PDF points; pixPng rendered at SCALE
  const left = Math.max(0, Math.round(box.x0 * SCALE)), top = Math.max(0, Math.round(box.y0 * SCALE));
  const width = Math.min(Math.round((box.x1 - box.x0) * SCALE), Math.round(pageW * SCALE) - left), height = Math.min(Math.round((box.y1 - box.y0) * SCALE), Math.round(pageH * SCALE) - top);
  if (width < 60 || height < 60) return null;
  let img = sharp(pixPng).extract({ left, top, width, height }).flatten({ background: "#ffffff" });
  const buf = await img.toBuffer();
  let trimmed;
  try { trimmed = await sharp(buf).trim({ threshold: 14 }).toBuffer({ resolveWithObject: true }); } catch { return null; }
  if (trimmed.info.width < 90 || trimmed.info.height < 90) return null;
  const padded = await sharp(trimmed.data).extend({ top: 12, bottom: 12, left: 12, right: 12, background: "#ffffff" }).resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 86 }).toBuffer({ resolveWithObject: true });
  fs.writeFileSync(path.join(IMG, name + ".webp"), padded.data);
  return { file: `/assets/img/${name}.webp`, width: padded.info.width, height: padded.info.height };
}

// The product pictures are raster images embedded in the PDF (the same objects pdf.js lists as paintImageXObject): take them out at their
// own resolution instead of cropping a page render. A cover page holds the page background, a grey shadow mask and the colour picture.
function nativeImages(page) {
  const out = [];
  page.toStructuredText("preserve-images").walk({ onImageBlock(bbox, _t, image) {
    out.push({ x: bbox[0], y: bbox[1], w: bbox[2] - bbox[0], h: bbox[3] - bbox[1], image, px: image.getWidth() * image.getHeight(), comps: image.getNumberOfComponents() });
  } });
  return out;
}
async function saveNative(c, name) {
  let png = Buffer.from(c.image.toPixmap().asPNG());
  // the picture's soft mask (a second embedded image, 255 = opaque) is its transparency: without it the cut-out area comes out black
  const mask = c.image.getMask && c.image.getMask();
  if (mask) {
    const { width, height } = await sharp(png).metadata();
    const alpha = await sharp(Buffer.from(mask.toPixmap().asPNG())).resize(width, height).extractChannel(0).raw().toBuffer();
    const rgb = await sharp(png).removeAlpha().raw().toBuffer(); // 3 channels
    const rgba = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) { rgba[i * 4] = rgb[i * 3]; rgba[i * 4 + 1] = rgb[i * 3 + 1]; rgba[i * 4 + 2] = rgb[i * 3 + 2]; rgba[i * 4 + 3] = alpha[i]; }
    png = await sharp(rgba, { raw: { width, height, channels: 4 } }).png().toBuffer();
  }
  let t;
  try { t = await sharp(png).flatten({ background: "#ffffff" }).trim({ threshold: 10 }).toBuffer({ resolveWithObject: true }); } catch { return null; }
  if (t.info.width < 90 || t.info.height < 90) return null;
  const r = await sharp(t.data).extend({ top: 14, bottom: 14, left: 14, right: 14, background: "#ffffff" }).resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true }).webp({ quality: 90 }).toBuffer({ resolveWithObject: true });
  fs.writeFileSync(path.join(IMG, name + ".webp"), r.data);
  return { file: `/assets/img/${name}.webp`, width: r.info.width, height: r.info.height, source: `${c.image.getWidth()}x${c.image.getHeight()}` };
}

async function extract(file, key) {
  const doc = mupdf.Document.openDocument(fs.readFileSync(file), "application/pdf");
  const n = doc.countPages();
  const res = { key, file: "/assets/docs/" + path.basename(file), title: "", model: "", intro: "", features: [], applications: [], tables: [], notes: [], images: {} };
  for (let i = 0; i < n; i++) {
    const page = doc.loadPage(i);
    const b = page.getBounds(); const pw = b[2] - b[0], ph = b[3] - b[1];
    const lines = readLines(page);
    if (i === 0) {
      const big = lines.filter((l) => /Eurostile/i.test(l.font) && l.size > 20).sort((a, b) => a.y - b.y);
      res.title = clean((big[0] || {}).text || "");
      res.model = clean(big.slice(1).map((l) => l.text).join(" "));
      // cover: the colour picture is the biggest colour image that is not the full-page background
      // a cover can also be one full-page colour image on top of the page background (the picture is then positioned inside it): take the last full-page one
      const colour = nativeImages(page).filter((c) => c.comps >= 3);
      const fullPage = (c) => c.w >= pw - 4 && c.h >= ph - 4;
      const pick = colour.filter((c) => !fullPage(c)).sort((a, b) => b.px - a.px)[0] || (colour.filter(fullPage).length > 1 ? colour.filter(fullPage).pop() : null);
      if (pick) { const im = await saveNative(pick, `haeny-${key}-model`); if (im) res.images.model = im; }
      res.intro = clean(lines.filter((l) => l.y > 450 && l.x > 100 && !isBar(l) && l.size >= 9 && l.size < 13 && !footer(l)).map((l) => l.text).join(" ")).replace(/(\w)- (?=[a-z])/g, "$1");
      continue;
    }
    const capLine = lines.find((l) => /(design|construction).*dimensions/i.test(l.text) && l.bold);
    const textLines = capLine ? lines.filter((l) => l.y < capLine.y - 1) : lines; // the drawing's own numbers are not table rows
    const secs = parseSections(textLines, pw / 2 + 5);
    const pix = page.toPixmap(mupdf.Matrix.scale(SCALE, SCALE), mupdf.ColorSpace.DeviceRGB, false, true);
    // pictures of the page (the unit render sits next to the dimension drawing) are not part of the chart or the drawing: paint them out of the render
    const pics = nativeImages(page).filter((c) => !(c.w >= pw - 4 && c.h >= ph - 100)).map((c) => ({ input: { create: { width: Math.max(1, Math.round(c.w * SCALE)), height: Math.max(1, Math.round(c.h * SCALE)), channels: 3, background: "#ffffff" } }, left: Math.max(0, Math.round(c.x * SCALE)), top: Math.max(0, Math.round(c.y * SCALE)) }));
    const png = pics.length ? await sharp(Buffer.from(pix.asPNG())).composite(pics).png().toBuffer() : Buffer.from(pix.asPNG());
    for (const s of secs) {
      const t = s.title.toLowerCase();
      const x0 = s.col === 0 ? 50 : pw / 2 + 2, x1 = s.col === 0 ? pw / 2 - 2 : pw - 45;
      if (t === "key features") {
        for (const [name, items] of Object.entries(s.lists)) { if (/typical/i.test(name)) res.applications.push(...items); else res.features.push(...items); }
        continue;
      }
      if (t === "3d model" || /performance/.test(t)) {
        const kind = t === "3d model" ? "model" : "chart";
        if (kind === "model") continue;
        const img = await cropImage(png, pw, ph, { x0, y0: s.y + 14, x1, y1: Math.min(s.yEnd, 520) }, `haeny-${key}-${kind}`);
        if (img) res.images[kind] = img;
        continue;
      }
      const tidy = (x) => x.replace(/\bm3\b/g, "m³").replace(/\bmin-1\b/g, "min⁻¹").replace(/\bm2\b/g, "m²");
      const rows = s.rows.filter(([l]) => !/^_+$/.test(l) && !/^\d{2,5}$/.test(l)).map(([l, v]) => [tidy(l.replace(/([A-Za-z])\d$/, "$1")), tidy(v)]);
      const lists = Object.fromEntries(Object.entries(s.lists).filter(([, v]) => v.length).map(([k, v]) => [k, v.map(tidy)]));
      if (rows.length || Object.keys(lists).length) res.tables.push({ title: s.title, subtitle: s.subtitle, rows, lists, page: i + 1 });
    }
    // the picture of the unit itself (a render on white, bottom of page 3): it differs from model to model
    if (i === 2) {
      const c = nativeImages(page).filter((q) => q.comps >= 3 && q.w > 80 && q.w < 400 && q.h > 80 && q.h < 400 && q.y > 300).sort((a, b) => b.px - a.px)[0];
      if (c) { const im = await saveNative(c, `haeny-${key}-unit`); if (im) res.images.unit = im; }
    }
    // dimension drawing: from the "Design/Construction and dimensions" caption to the footer
    const cap = capLine;
    if (cap) {
      const img = await cropImage(png, pw, ph, { x0: 40, y0: cap.y + 14, x1: pw - 40, y1: 805 }, `haeny-${key}-dim`);
      if (img) res.images.dim = img;
    }
    for (const l of lines) if (/^\d\s*[:]?\s+\S/.test(l.text) && l.y > 740 && l.y < 800 && !/www/.test(l.text)) res.notes.push(l.text.replace(/^\d\s*:?\s*/, ""));
  }
  res.notes = [...new Set(res.notes)];
  return res;
}

const only = process.argv[2];
const files = fs.readdirSync(DOCS).filter((f) => /^haeny-.*-brochure-en\.pdf$/.test(f) && !/portfolio|gesamt/.test(f));
const summary = [];
for (const f of files) {
  const key = f.replace(/^haeny-/, "").replace(/-brochure-en\.pdf$/, "");
  if (only && key !== only) continue;
  try {
    const r = await extract(path.join(DOCS, f), key);
    fs.writeFileSync(path.join(OUT, key + ".json"), JSON.stringify(r, null, 2));
    summary.push(`${key.padEnd(14)} ${r.model.padEnd(16)} feat:${r.features.length} apps:${r.applications.length} tables:${r.tables.length} rows:${r.tables.reduce((n, t) => n + t.rows.length, 0)} img:${Object.keys(r.images).join(",")}`);
  } catch (e) { summary.push(`${key} FAILED ${e.message}`); }
}
console.log(summary.join("\n"));
