#!/usr/bin/env node
// Marini MR-C crawler drill rigs: data and pictures taken out of the PDFs, not from screenshots.
//   assets-src/docs/marini-crawlers-produktkatalog.pdf   pages 18-22 (the MR-C line): per model an isometric render (the main picture), photos, spec table
//   assets-src/docs/marini-broschyr-borr-grund-eng.pdf   pages 34-39: the intro text, two field photos per page, side-view line drawings above each table
// Output: crawl/marini/crawlers.json and assets-src/img/marini-mrc-<slug>-{iso,iso2,p1,p2,photo,side}.webp, marini-mrc-line-photo.webp
//   node tools/marini-crawlers.mjs
import fs from "node:fs";
import path from "node:path";
import * as mupdf from "mupdf";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const DOCS = path.join(ROOT, "assets-src/docs"), IMG = path.join(ROOT, "assets-src/img"), OUT = path.join(ROOT, "crawl/marini");
fs.mkdirSync(OUT, { recursive: true });
const slug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const clean = (s) => String(s).replace(/\s+/g, " ").trim();

function lines(page) {
  const j = JSON.parse(page.toStructuredText("preserve-images").asJSON());
  const out = [];
  for (const b of j.blocks) if (b.type === "text") for (const l of b.lines) { const t = clean(l.text); if (t) out.push({ x: l.bbox.x, y: l.bbox.y, w: l.bbox.w, h: l.bbox.h, t }); }
  return out;
}
function images(page) {
  const out = [];
  page.toStructuredText("preserve-images").walk({ onImageBlock(b, _t, image) { out.push({ x: b[0], y: b[1], w: b[2] - b[0], h: b[3] - b[1], image, mask: !!(image.getMask && image.getMask()) }); } });
  return out;
}
async function png(image) {
  let buf = Buffer.from(image.toPixmap().asPNG());
  const mask = image.getMask && image.getMask();
  if (mask) {
    const { width, height } = await sharp(buf).metadata();
    const alpha = await sharp(Buffer.from(mask.toPixmap().asPNG())).resize(width, height).extractChannel(0).raw().toBuffer();
    const rgb = await sharp(buf).removeAlpha().raw().toBuffer();
    const rgba = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) { rgba[i * 4] = rgb[i * 3]; rgba[i * 4 + 1] = rgb[i * 3 + 1]; rgba[i * 4 + 2] = rgb[i * 3 + 2]; rgba[i * 4 + 3] = alpha[i]; }
    buf = await sharp(rgba, { raw: { width, height, channels: 4 } }).png().toBuffer();
  }
  return buf;
}
// a render (transparent background): trimmed and padded on white; a photo: as it is
async function save(c, name, { trim }) {
  const buf = await png(c.image);
  const turned = (c.image.getWidth() > c.image.getHeight()) !== (c.w > c.h);
  let s = sharp(buf).flatten({ background: "#ffffff" });
  if (turned) s = sharp(await s.png().toBuffer()).rotate(90);
  if (trim) { const t = await s.png().toBuffer(); s = sharp(await sharp(t).trim({ threshold: 12 }).toBuffer()).extend({ top: 16, bottom: 16, left: 16, right: 16, background: "#ffffff" }); }
  const r = await s.webp({ quality: 90 }).toBuffer({ resolveWithObject: true });
  fs.writeFileSync(path.join(IMG, name + ".webp"), r.data);
  return { file: `/assets/img/${name}.webp`, width: r.info.width, height: r.info.height, source: `${c.image.getWidth()}x${c.image.getHeight()}` };
}

const LABELS = { "engine power": "engine", "mast stroke": "stroke", "feed force": "feed", "retract force": "retract", "rotary torque": "torque", "rotary speed range": "speed", "clamp range": "clamp", weight: "weight" };
const MODEL = /^MR-C ?\d+[AP]?$/;

// ---------- the catalogue ----------
const cat = mupdf.Document.openDocument(fs.readFileSync(path.join(DOCS, "marini-crawlers-produktkatalog.pdf")), "application/pdf");
const models = {}; // name -> data
const order = [];
const apps = { rotation: {}, percussion: {}, doubleHead: {}, jet: {}, hollowBars: {} };
for (let pn = 17; pn <= 21; pn++) {
  const page = cat.loadPage(pn), L = lines(page), I = images(page);
  // application tables (page 18): header row with model names, rows of V / -
  if (pn === 17) {
    for (const hdr of L.filter((l) => l.t === "MODEL" && l.x > 700 && l.y < 400)) {
      const names = L.filter((l) => Math.abs(l.y - hdr.y) < 6 && MODEL.test(l.t) && l.x > hdr.x);
      const rowsL = L.filter((l) => l.x > 700 && l.x < 800 && l.y > hdr.y + 8 && l.y < hdr.y + 90 && /drilling|head|grouting/i.test(l.t));
      for (const r of rowsL) {
        const key = /rotation/i.test(r.t) ? "rotation" : /percussion/i.test(r.t) ? "percussion" : /double/i.test(r.t) ? "doubleHead" : "jet";
        for (const n of names) { const cell = L.find((l) => Math.abs(l.y - r.y) < 8 && Math.abs(l.x + l.w / 2 - (n.x + n.w / 2)) < 20 && /^(V|-)$/.test(l.t)); if (cell) apps[key][n.t.replace(/ +/g, " ")] = cell.t === "V"; }
      }
    }
    const hb = L.find((l) => l.t === "HOLLOW BARS");
    if (hb) for (const n of L.filter((l) => MODEL.test(l.t) && l.x < 640 && l.y > hb.y && l.y < hb.y + 80)) apps.hollowBars[n.t] = true;
  }
  const heads = L.filter((l) => l.h > 30 && l.x < 100 && MODEL.test(l.t.replace(/ +/g, " "))).sort((a, b) => a.y - b.y);
  heads.forEach((h, i) => {
    const y1 = heads[i + 1] ? heads[i + 1].y : 842;
    const name = h.t.replace(/ +/g, " ");
    const hdr = L.find((l) => l.x > 900 && l.y >= h.y && l.y < y1 && MODEL.test(l.t.replace(/ +/g, " ")));
    const rows = {};
    for (const lab of L.filter((l) => l.x > 725 && l.x < 745 && l.y > h.y && l.y < y1 && LABELS[l.t.toLowerCase()])) {
      const v = L.find((l) => l.x > 800 && Math.abs(l.y - lab.y) < 4);
      if (v) rows[LABELS[lab.t.toLowerCase()]] = v.t;
    }
    const mine = I.filter((c) => c.y >= h.y - 6 && c.y < y1 && c.w > 60);
    // the renders have a transparent background (a soft mask) and sit in the first two picture slots; everything else is a photo
    const renders = mine.filter((c) => c.mask && c.x < 250).sort((a, b) => a.x - b.x), photos = mine.filter((c) => !(c.mask && c.x < 250)).sort((a, b) => a.x - b.x);
    models[name] = { name, tableName: hdr ? hdr.t : name, rows, renders, photos, page: pn + 1 };
    order.push(name);
  });
}
console.log("catalogue models:", order.join(", "));

// ---------- the main brochure: intro text, field photos, side-view drawings ----------
const main = mupdf.Document.openDocument(fs.readFileSync(path.join(DOCS, "marini-broschyr-borr-grund-eng.pdf")), "application/pdf");
const intro = (() => { const t = main.loadPage(33).toStructuredText().asText(); const m = t.match(/The MR-C line[\s\S]*?applications in the deep foundations industry\./); return m ? clean(m[0]) : ""; })();
const extra = {}; // model -> { photo, side }
const SIDE_SCALE = 5;
for (const pn of [35, 36, 37, 38]) {
  const page = main.loadPage(pn), L = lines(page), I = images(page).filter((c) => c.w > 150 && c.h > 150 && c.y > 100).sort((a, b) => a.x - b.x);
  const hdr = L.find((l) => l.t === "MODELLO"); if (!hdr) continue;
  const cols = L.filter((l) => Math.abs(l.y - hdr.y) < 22 && /^MR-C/.test(l.t)).sort((a, b) => a.x - b.x);
  // a column is "MR-C 10" or "MR-C 20 / MR-C 20P" (the text may come as two lines)
  const colModels = []; for (const c of cols) { const names = c.t.split("/").map((x) => x.trim().replace(/ +/g, " ")).filter(Boolean); const prev = colModels[colModels.length - 1]; if (prev && Math.abs(c.x - prev.x) < 60 && Math.abs(c.y - prev.y) < 30) prev.names.push(...names); else colModels.push({ x: c.x + c.w / 2, y: c.y, names }); }
  const photoBottom = Math.max(0, ...images(page).filter((c) => c.w > 150 && c.h > 150 && c.y > 100).map((c) => c.y + c.h));
  const pix = page.toPixmap(mupdf.Matrix.scale(SIDE_SCALE, SIDE_SCALE), mupdf.ColorSpace.DeviceRGB, false, true);
  const pagePng = Buffer.from(pix.asPNG());
  // the drawings are vector art between the photos and the table: collect the bounding boxes of their strokes, group them sideways (gaps of 12 pt
  // start a new drawing) and give every drawing to the column it sits over
  const yTop = photoBottom + 8, yBot = hdr.y - 10, boxes = [];
  const collect = (path, ctm) => {
    const T = (x, y) => [ctm[0] * x + ctm[2] * y + ctm[4], ctm[1] * x + ctm[3] * y + ctm[5]]; const pts = [];
    path.walk({ moveTo(x, y) { pts.push(T(x, y)); }, lineTo(x, y) { pts.push(T(x, y)); }, curveTo(a, b, c, d, x, y) { pts.push(T(a, b), T(c, d), T(x, y)); }, closePath() {} });
    if (!pts.length) return;
    const x0 = Math.min(...pts.map((p) => p[0])), x1 = Math.max(...pts.map((p) => p[0])), y0 = Math.min(...pts.map((p) => p[1])), y1 = Math.max(...pts.map((p) => p[1]));
    if (y0 >= yTop && y1 <= yBot && x1 - x0 < 300) boxes.push({ x0, x1, y0, y1 });
  };
  const dev = new mupdf.Device({ strokePath(path, _s, ctm) { collect(path, ctm); }, fillPath(path, _e, ctm) { collect(path, ctm); } });
  page.run(dev, mupdf.Matrix.identity); dev.close();
  boxes.sort((p, q) => p.x0 - q.x0);
  const groups = [];
  for (const bx of boxes) { const g = groups[groups.length - 1]; if (g && bx.x0 <= g.x1 + 12) { g.x1 = Math.max(g.x1, bx.x1); g.y0 = Math.min(g.y0, bx.y0); g.y1 = Math.max(g.y1, bx.y1); } else groups.push({ ...bx }); }
  const drawings = groups.filter((g) => g.x1 - g.x0 > 25 && g.y1 - g.y0 > 40);
  const pm = await sharp(pagePng).metadata();
  const byCol = colModels.map(() => null);
  for (const g of drawings) {
    const cx = (g.x0 + g.x1) / 2; let best = 0; colModels.forEach((c, i) => { if (Math.abs(c.x - cx) < Math.abs(colModels[best].x - cx)) best = i; });
    byCol[best] = byCol[best] ? { x0: Math.min(byCol[best].x0, g.x0), x1: Math.max(byCol[best].x1, g.x1), y0: Math.min(byCol[best].y0, g.y0), y1: Math.max(byCol[best].y1, g.y1) } : { ...g };
  }
  for (let i = 0; i < colModels.length; i++) {
    const c = colModels[i], g = byCol[i];
    let side = null;
    if (g) {
      const left = Math.max(0, Math.round((g.x0 - 4) * SIDE_SCALE)), top = Math.max(0, Math.round((g.y0 - 4) * SIDE_SCALE));
      const box = { left, top, width: Math.min(pm.width - left, Math.round((g.x1 - g.x0 + 8) * SIDE_SCALE)), height: Math.min(pm.height - top, Math.round((g.y1 - g.y0 + 8) * SIDE_SCALE)) };
      try {
        const cut = await sharp(pagePng).extract(box).flatten({ background: "#fff" }).png().toBuffer();
        side = { buf: await sharp(cut).extend({ top: 24, bottom: 24, left: 24, right: 24, background: "#fff" }).webp({ quality: 88 }).toBuffer(), w: box.width + 48, h: box.height + 48 };
      } catch (e) { if (process.env.DEBUG) console.log("  side failed", c.names.join("/"), e.message); }
    }
    // the photos sit above the columns: the left one over the first column, the right one over the last
    const photo = I.length ? (i === 0 ? I[0] : i === colModels.length - 1 && I.length > 1 ? I[I.length - 1] : null) : null;
    for (const n of c.names) extra[n] = { side, photo, page: pn + 1 };
  }
}
console.log("main brochure drawings/photos for:", Object.keys(extra).join(", "));

// ---------- write ----------
const res = { intro, models: [] };
for (const name of order) {
  const m = models[name], s = slug(name);
  const d = { name, slug: s, spec: m.rows, images: {}, apps: {}, hollowBars: !!apps.hollowBars[name] };
  for (const k of Object.keys(apps)) if (k !== "hollowBars" && name in apps[k]) d.apps[k] = apps[k][name];
  if (m.renders[0]) d.images.iso = await save(m.renders[0], `marini-mrc-${s}-iso`, { trim: true });
  if (m.renders[1]) d.images.iso2 = await save(m.renders[1], `marini-mrc-${s}-iso2`, { trim: true });
  d.images.photos = [];
  let k = 1; for (const p of m.photos) d.images.photos.push(await save(p, `marini-mrc-${s}-p${k++}`, { trim: false }));
  const e = extra[name] || extra[m.tableName];
  if (e && e.photo) d.images.field = await save(e.photo, `marini-mrc-${s}-photo`, { trim: false });
  if (e && e.side) { fs.writeFileSync(path.join(IMG, `marini-mrc-${s}-side.webp`), e.side.buf); d.images.side = { file: `/assets/img/marini-mrc-${s}-side.webp`, width: e.side.w, height: e.side.h }; }
  res.models.push(d);
  console.log(name.padEnd(10), "spec", Object.keys(d.spec).length, "iso", d.images.iso ? d.images.iso.source : "-", "iso2", d.images.iso2 ? "y" : "-", "photos", d.images.photos.length, "field", d.images.field ? "y" : "-", "side", d.images.side ? "y" : "-", JSON.stringify(d.apps), d.hollowBars ? "hollow" : "");
}
// the line's own photo (page 35)
{
  const p = images(main.loadPage(34)).sort((a, b) => b.w * b.h - a.w * a.h)[0];
  if (p) res.linePhoto = await save(p, "marini-mrc-line-photo", { trim: false });
}
fs.writeFileSync(path.join(OUT, "crawlers.json"), JSON.stringify(res, null, 2));
console.log("written crawl/marini/crawlers.json");
