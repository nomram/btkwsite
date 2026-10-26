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

// ---------- the performance chart as data ----------
// The brochure chart is vector art: grid lines, one stroked path per curve, the tick numbers and the curve names as text. Read them back
// (device callbacks of mupdf), calibrate the axes from the grid lines and the tick numbers, and keep the curves as points in real units.
const cmykToHex = ([c, m, y, k]) => "#" + [(1 - c) * (1 - k), (1 - m) * (1 - k), (1 - y) * (1 - k)].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
function chartData(page, box, lines) {
  const strokes = [], fills = [];
  const grab = (path, ctm) => {
    const T = (x, y) => [ctm[0] * x + ctm[2] * y + ctm[4], ctm[1] * x + ctm[3] * y + ctm[5]];
    const subs = []; let cur = null, last = null;
    path.walk({
      moveTo(x, y) { cur = [T(x, y)]; subs.push(cur); last = [x, y]; },
      lineTo(x, y) { if (!cur) return; cur.push(T(x, y)); last = [x, y]; },
      curveTo(x1, y1, x2, y2, x3, y3) {
        if (!cur) return;
        for (let i = 1; i <= 12; i++) { const t = i / 12, u = 1 - t; cur.push(T(u * u * u * last[0] + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * last[1] + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3)); }
        last = [x3, y3];
      },
      closePath() { if (cur && cur.length) cur.push(cur[0]); }
    });
    return subs;
  };
  const dev = new mupdf.Device({
    strokePath(path, stroke, ctm, cs, color) { const sc = Math.sqrt(Math.abs(ctm[0] * ctm[3] - ctm[1] * ctm[2])); for (const pts of grab(path, ctm)) strokes.push({ color: cs.getName() === "DeviceCMYK" ? color : cs.getName() === "DeviceGray" ? [0, 0, 0, 1 - color[0]] : [1 - color[0], 1 - color[1], 1 - color[2], 0], w: stroke.getLineWidth() * sc, pts }); },
    fillPath(path, even, ctm, cs, color) { for (const pts of grab(path, ctm)) fills.push({ color: cs.getName() === "DeviceCMYK" ? color : cs.getName() === "DeviceGray" ? [0, 0, 0, 1 - color[0]] : [1 - color[0], 1 - color[1], 1 - color[2], 0], pts }); }
  });
  page.run(dev, mupdf.Matrix.identity);
  dev.close();
  const pad = 4;
  const inside = (pts) => pts.every(([x, y]) => x >= box.x0 - pad && x <= box.x1 + pad && y >= box.y0 - pad && y <= box.y1 + pad);
  const mine = strokes.filter((q) => inside(q.pts));
  const uniq = (a) => a.sort((p, q) => p - q).filter((v, i, r) => !i || Math.abs(v - r[i - 1]) > 0.6);
  const thin = mine.filter((q) => q.w < 0.6 && q.pts.length === 2);
  const vert = uniq(thin.filter((q) => Math.abs(q.pts[0][0] - q.pts[1][0]) < 0.05 && Math.abs(q.pts[0][1] - q.pts[1][1]) > 40).map((q) => q.pts[0][0]));
  const horiz = uniq(thin.filter((q) => Math.abs(q.pts[0][1] - q.pts[1][1]) < 0.05 && Math.abs(q.pts[0][0] - q.pts[1][0]) > 40).map((q) => q.pts[0][1])).reverse(); // bottom first
  if (process.env.HDEBUG) console.log("chart", JSON.stringify(box), "strokes", strokes.length, "mine", mine.length, "thin", thin.length, "vert", vert.length, "horiz", horiz.length);
  if (vert.length < 3 || horiz.length < 3) return null;
  const inBox = lines.filter((l) => l.x >= box.x0 - 12 && l.x <= box.x1 + 12 && l.y >= box.y0 - 12 && l.y <= box.y1 + 30);
  const num = (t) => (/^-?\d+([.,]\d+)?$/.test(t) ? parseFloat(t.replace(",", ".")) : NaN);
  const ylab = inBox.filter((l) => !isNaN(num(l.text)) && l.x + l.w <= vert[0] + 3 && l.y + l.h / 2 < horiz[0] + 6).sort((a, b) => b.y - a.y);
  const xlab = inBox.filter((l) => l.y > horiz[0] - 2 && l.x >= vert[0] - 8).flatMap((l) => l.text.split(" ").map((t, i, a) => ({ v: num(t), x: l.x, w: l.w, n: a.length }))).filter((q) => !isNaN(q.v)).sort((a, b) => a.x - b.x);
  if (process.env.HDEBUG) console.log("labels", ylab.length, xlab.length, "v0", vert[0], "h0", horiz[0], "inBox", inBox.length);
  if (ylab.length < 2 || xlab.length < 2) return null;
  const y0v = num(ylab[0].text), ystep = num(ylab[1].text) - y0v, x0v = xlab[0].v, xstep = xlab[1].v - x0v;
  if (!(ystep > 0) || !(xstep > 0)) return null;
  const toX = (px) => x0v + ((px - vert[0]) / (vert[1] - vert[0])) * xstep;
  const toY = (py) => y0v + ((horiz[0] - py) / (horiz[0] - horiz[1])) * ystep;
  const xmax = x0v + (vert.length - 1) * xstep, ymax = y0v + (horiz.length - 1) * ystep;
  const r = (v) => Math.round(v * 10) / 10;
  // A curve is drawn in several pieces (a thin and a thick stroke, a straight drop at the end), so every stroke that is not a grid line
  // counts: the grid has its own colour. Pieces of one colour are chained end to end into one polyline.
  const ck = (q) => q.color.map((v) => v.toFixed(2)).join(",");
  const gridKeys = new Set(thin.filter((q) => vert.concat(horiz).length).map(ck));
  const gridKey = [...gridKeys].sort((a, b) => thin.filter((q) => ck(q) === b).length - thin.filter((q) => ck(q) === a).length)[0];
  const plot = { x0: vert[0], x1: vert[vert.length - 1], y0: horiz[horiz.length - 1], y1: horiz[0] };
  const inPlot = (q) => q.pts.every(([x, y]) => x >= plot.x0 - 2 && x <= plot.x1 + 2 && y >= plot.y0 - 2 && y <= plot.y1 + 2);
  const bent = (q) => q.pts.some((p, i) => i && Math.abs(p[0] - q.pts[i - 1][0]) > 0.3 && Math.abs(p[1] - q.pts[i - 1][1]) > 0.3);
  const pieces = mine.filter((q) => ck(q) !== gridKey && inPlot(q) && q.pts.length >= 2);
  const byColour = {};
  for (const q of pieces) (byColour[ck(q)] ||= { color: q.color, list: [] }).list.push(q.pts.slice());
  const curves = [];
  for (const g of Object.values(byColour)) {
    const list = g.list.filter((p) => Math.max(...p.map((a) => a[0])) - Math.min(...p.map((a) => a[0])) > 0.3 || Math.max(...p.map((a) => a[1])) - Math.min(...p.map((a) => a[1])) > 6);
    const chains = [];
    while (list.length) {
      list.sort((a, b) => Math.min(a[0][0], a[a.length - 1][0]) - Math.min(b[0][0], b[b.length - 1][0]));
      let cur = list.shift(); if (cur[0][0] > cur[cur.length - 1][0]) cur.reverse();
      for (let grew = true; grew;) {
        grew = false;
        const e = cur[cur.length - 1];
        for (let i = 0; i < list.length; i++) {
          const p = list[i];
          if (Math.hypot(e[0] - p[0][0], e[1] - p[0][1]) < 3) { cur = cur.concat(p.slice(1)); list.splice(i, 1); grew = true; break; }
          if (Math.hypot(e[0] - p[p.length - 1][0], e[1] - p[p.length - 1][1]) < 3) { cur = cur.concat(p.slice(0, -1).reverse()); list.splice(i, 1); grew = true; break; }
        }
      }
      chains.push(cur);
    }
    const good = chains.filter((c) => Math.max(...c.map((a) => a[0])) - Math.min(...c.map((a) => a[0])) > 20 || c.length > 6);
    if (good.length) curves.push({ color: g.color, pts: good.sort((a, b) => a[0][0] - b[0][0]).flat() });
  }
  // the curve's name is the legend text nearest to it
  const labels = inBox.filter((l) => isNaN(num(l.text)) && !/\[.*\]/.test(l.text) && l.x > vert[0] - 2 && l.x < vert[vert.length - 1] && l.y > horiz[horiz.length - 1] - 4 && l.y < horiz[0]);
  const dist = (l, q) => Math.min(...q.pts.map(([x, y]) => Math.hypot(x - (l.x + l.w / 2), y - (l.y + l.h / 2))));
  const series = curves.map((q) => ({ q, color: cmykToHex(q.color), name: "" }));
  const free = new Set(series.keys());
  for (const l of labels.map((l) => ({ l, d: series.map((sr, i) => [dist(l, sr.q), i]).sort((a, b) => a[0] - b[0]) })).sort((a, b) => a.d[0][0] - b.d[0][0])) {
    const hit = l.d.find(([, i]) => free.has(i)); if (hit && hit[0] < 70) { series[hit[1]].name = clean(l.l.text); free.delete(hit[1]); }
  }
  // a curve still without a name takes the nearest legend text that is still unused, however far it is
  for (const i of [...free]) {
    const spare = labels.filter((l) => !series.some((sr) => sr.name === clean(l.text))).sort((p, q) => dist(p, series[i].q) - dist(q, series[i].q))[0];
    if (spare) { series[i].name = clean(spare.text); free.delete(i); }
  }
  const xt = inBox.find((l) => /pressure/i.test(l.text) && /\[/.test(l.text)), yt = inBox.find((l) => /(output|flow)/i.test(l.text) && /\[/.test(l.text));
  const unit = (l, d) => { const m = l && l.text.match(/\[(.*?)\]/); return m ? m[1] : d; };
  const area = fills.filter((q) => q.pts.length >= 4 && inside(q.pts) && !(q.color[3] > 0.9) && q.color.slice(0, 3).some((v) => v > 0.05) && Math.max(...q.pts.map((p) => p[0])) - Math.min(...q.pts.map((p) => p[0])) > 40);
  const out = {
    x: { label: "Pressure", unit: unit(xt, "bar"), min: x0v, max: xmax, step: xstep },
    y: { label: yt ? yt.text.replace(/\s*\[.*$/, "") : "Output", unit: unit(yt, "l/min"), min: y0v, max: ymax, step: ystep },
    series: series.map((sr, i) => ({ name: sr.name || `#${i + 1}`, color: sr.color, points: sr.q.pts.map(([px, py]) => [r(toX(px)), r(toY(py))]).filter((p, i, a) => !i || p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1]) })).sort((a, b) => b.points[0][1] - a.points[0][1])
  };
  if (area.length) { const q = area.sort((a, b) => b.pts.length - a.pts.length)[0]; out.areas = [{ color: cmykToHex(q.color), points: q.pts.map(([px, py]) => [r(toX(px)), r(toY(py))]) }]; }
  return out;
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
        const cd = kind === "chart" ? chartData(page, { x0, y0: s.y + 14, x1, y1: Math.min(s.yEnd, 520) }, lines) : null;
        if (cd) res.chartData = cd;
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
