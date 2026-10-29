#!/usr/bin/env node
// Marini quarry line: one page per wire saw (/produkter/marini/vajersågar/<model>) and a new family "Quarry drill rigs"
// (/produkter/marini/stenbrottsborrning) with Voyager, Big Driller, Driller (+ ID) and Hor Drill (+ ID), in sv / en / es / no.
// Pictures are taken out of Marini's PDFs at full size (not screenshots), the PDFs themselves are copied to assets-src/docs.
//   MARINI_PDF_DIR=<folder with the PDFs>  (default: ~/Downloads)
//   node tools/marini-quarry.mjs
// Data and texts: tools/marini-quarry-data.mjs. Generated blocks carry "gen": true, so running it again replaces them.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as mupdf from "mupdf";
import sharp from "sharp";
import { SAWS, LANGS, TX, DRILL_TEXT, RL, PHRASES } from "./marini-quarry-data.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const IMG = path.join(ROOT, "assets-src/img"), DOCS = path.join(ROOT, "assets-src/docs"), PAGES = path.join(ROOT, "content/pages/produkter/marini");
const DL = process.env.MARINI_PDF_DIR || path.join(os.homedir(), "Downloads");
const SAWFAM = "/produkter/marini/vajersågar";
const date = new Date().toISOString().slice(0, 10);

// ---------- the PDFs (name in the folder -> name on the site) ----------
const PDF = {
  cat: { from: "marini catalogue quarry.pdf", to: "marini-stenbrott-produktkatalog.pdf" },
  saw: { from: "marini wiresaw gran 1.pdf", to: "marini-vajersagar-granit-broschyr.pdf" },
  voy: { from: "ma voyager 1.pdf", to: "marini-voyager-broschyr.pdf" },
  big: { from: "marini bigdriller 1.pdf", to: "marini-big-driller-broschyr.pdf" },
  drl: { from: "marini driller 1.pdf", to: "marini-driller-broschyr.pdf" },
  hor: { from: "MARINI HORDRILL.pdf", to: "marini-hor-drill-broschyr.pdf" }
};
const docs = {};
for (const [k, d] of Object.entries(PDF)) {
  const src = path.join(DL, d.from), dst = path.join(DOCS, d.to);
  if (!fs.existsSync(dst) || (fs.existsSync(src) && fs.statSync(src).size !== fs.statSync(dst).size)) {
    if (!fs.existsSync(src)) throw new Error(`missing ${src} (set MARINI_PDF_DIR)`);
    fs.copyFileSync(src, dst);
  }
  docs[k] = mupdf.Document.openDocument(fs.readFileSync(dst), "application/pdf");
}
// the language of these brochures cannot be told from their text (Italian + English, German/French tables): say so
{
  const f = path.join(ROOT, "content/doc-langs.json");
  const j = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const d of Object.values(PDF)) j[d.to] = "it+en";
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + "\n");
}

// ---------- pictures ----------
const cache = new Map();
function pageImages(key, page) {
  const id = key + page;
  if (cache.has(id)) return cache.get(id);
  const out = [];
  docs[key].loadPage(page - 1).toStructuredText("preserve-images").walk({ onImageBlock(_b, _t, image) { if (image.getWidth() >= 150 && image.getHeight() >= 150) out.push(image); } });
  cache.set(id, out);
  return out;
}
async function pngOf(image) {
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
const grab = async ([key, page, n]) => pngOf(pageImages(key, page)[n - 1]);

// the line drawings above the tables of the catalogue (vector art): found by where the ink is, rendered large
const drawings = {};
async function loadDrawings() {
  const S = 5, Y0 = 466, Y1 = 561;
  const NAMES = ["mini-fil", "mini-fil-super", "gran-fil", "gran-fil-super", "sp", "mini-mobil-fil", "mobil-fil"];
  for (const [page, tag] of [[13, "granite"], [15, "marble"]]) {
    const pix = docs.cat.loadPage(page - 1).toPixmap(mupdf.Matrix.scale(S, S), mupdf.ColorSpace.DeviceRGB, false, true);
    const full = await sharp(Buffer.from(pix.asPNG())).toBuffer();
    const W = pix.getWidth(), bh = (Y1 - Y0) * S;
    const band = await sharp(full).extract({ left: 0, top: Y0 * S, width: W, height: bh }).greyscale().raw().toBuffer();
    const occ = new Uint8Array(W);
    for (let y = 0; y < bh; y++) for (let x = 0; x < W; x++) if (band[y * W + x] < 215) occ[x] = 1;
    const runs = []; let start = -1, gap = 0;
    for (let x = 0; x < W; x++) { if (occ[x]) { if (start < 0) start = x; gap = 0; } else if (start >= 0 && ++gap > 4 * S) { runs.push([start, x - gap]); start = -1; gap = 0; } }
    if (start >= 0) runs.push([start, W - 1]);
    const real = runs.filter(([a, b]) => b - a > 40 * S);
    if (real.length !== NAMES.length) throw new Error(`catalogue page ${page}: found ${real.length} drawings, expected ${NAMES.length}`);
    for (let i = 0; i < real.length; i++) {
      const [a, b] = real[i], left = Math.max(0, a - 6);
      const crop = await sharp(full).extract({ left, top: Y0 * S, width: Math.min(W - left, b - a + 12), height: bh }).png().toBuffer();
      drawings[`${tag}:${NAMES[i]}`] = await sharp(crop).trim({ threshold: 12 }).png().toBuffer();
    }
  }
}

// thin catalogue lines get a little weight so a drawing holds its own as a picture on a page or tile
async function thicken(buf) {
  const inv = await sharp(buf).flatten({ background: "#fff" }).greyscale().negate().png().toBuffer();
  const grown = await sharp(inv).blur(1.2).linear(4, 0).png().toBuffer();
  return sharp(grown).negate().png().toBuffer();
}
const out = (name) => path.join(IMG, name);
async function save(buf, name, { max = 2000, quality = 86, trim = false, pad = 0, rotate = 0 } = {}) {
  let s = sharp(buf).flatten({ background: "#ffffff" });
  if (rotate) s = s.rotate(rotate);
  if (trim) s = sharp(await s.png().toBuffer()).trim({ threshold: 14 });
  if (pad) { const b = await s.png().toBuffer(); const m = await sharp(b).metadata(); s = sharp(b).extend({ top: Math.round(m.height * pad), bottom: Math.round(m.height * pad), left: Math.round(m.width * pad), right: Math.round(m.width * pad), background: "#ffffff" }); }
  const b = await s.resize({ width: max, height: max, fit: "inside", withoutEnlargement: true, kernel: "lanczos3" }).webp({ quality }).toBuffer();
  fs.writeFileSync(out(name), b);
  const m = await sharp(b).metadata();
  return { file: `/assets/img/${name}`, width: m.width, height: m.height };
}
// square tile: a machine on white (trimmed, same box for all) or a photo on a blurred copy of itself
async function tile(buf, name, photo = false) {
  const base = sharp(buf).flatten({ background: "#ffffff" });
  if (photo) {
    const b = await base.png().toBuffer();
    const bg = await sharp(b).resize(1000, 1000, { fit: "cover" }).blur(28).modulate({ brightness: 1.05 }).toBuffer();
    const fg = await sharp(b).resize(1000, 1000, { fit: "inside" }).toBuffer();
    await sharp(bg).composite([{ input: fg, gravity: "centre" }]).webp({ quality: 84 }).toFile(out(name));
  } else {
    const t = await base.png().toBuffer().then((x) => sharp(x).trim({ threshold: 14 }).toBuffer());
    const fitted = await sharp(t).resize({ width: 880, height: 820, fit: "inside", kernel: "lanczos3" }).toBuffer();
    await sharp({ create: { width: 1000, height: 1000, channels: 3, background: "#ffffff" } }).composite([{ input: fitted, gravity: "centre" }]).webp({ quality: 88 }).toFile(out(name));
  }
  return { file: `/assets/img/${name}`, width: 1000, height: 1000 };
}

// ---------- number and text helpers ----------
const SEP = { sv: [" ", ","], no: [" ", ","], en: [",", "."], es: [".", ","] };
const nl = (s, l) => String(s).replace(/(?<=\d),(?=\d)/g, "\u0001").replace(/(?<=\d)[  ](?=\d{3}(?!\d))/g, SEP[l][0]).replace(/\u0001/g, SEP[l][1]); // decimal comma first, so the thousands separator put in next is not taken for one
const lv = (v, l) => (v && typeof v === "object" ? v[l] : v);
const val = (v, l) => (v && typeof v === "object" ? v[l] : typeof v === "string" && v.startsWith("@") ? PHRASES[v.slice(1)][l] : nl(v, l)); // per-language texts already carry their own number format
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const slash = (list, l) => nl(list.join(" / "), l);

// ---------- JSON helpers ----------
const eolOf = (raw) => (raw.includes("\r\n") ? "\r\n" : "\n");
const readPage = (f) => { const raw = fs.readFileSync(f, "utf8"); return { raw, eol: eolOf(raw), j: JSON.parse(raw) }; };
const writeJson = (f, o, eol = "\r\n") => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2).replace(/\n/g, eol) + eol); };
const logoBlock = { type: "image", alt: "Marini logotyp", href: "/produkter/marini", width: 637, height: 86, src: "/assets/img/logo-marini.webp" };
const dl = (text, file) => ({ type: "button", kind: "download", text, href: `/assets/docs/${file}` });
const tag = (blocks) => blocks.map((b) => ({ ...b, gen: true }));
const carousel = (items, alt) => (items.length ? [{ type: "carousel", autoplay: items.length > 1, interval: 6, items: items.map((p, k) => ({ src: p.file, alt: `${alt} (${k + 1}/${items.length})`, width: p.width, height: p.height })) }] : []);

// ====================================================================================================================
await loadDrawings();
const heroSaw = readPage(path.join(PAGES, "vajersagar.json")).j.hero;
const heroDrill = readPage(path.join(PAGES, "rustica.json")).j.hero;

// ---------- pictures: saws ----------
const photo = {
  granite: await save(await grab(["cat", 13, 2]), "marini-quarry-granite-photo.webp", { max: 1800, quality: 80 }),
  marble: await save(await grab(["cat", 15, 1]), "marini-quarry-marble-photo.webp", { max: 1800, quality: 80 }),
  mobile: await save(await grab(["cat", 13, 1]), "marini-quarry-mobile-photo.webp", { max: 1800, quality: 80 }),
  yard: await save(await grab(["saw", 7, 7]), "marini-quarry-mobile-photo-2.webp", { max: 1800, quality: 80 })
};
for (const s of SAWS) {
  const draw = drawings[`${s.group === "marble" ? "marble" : "granite"}:${s.draw}`];
  s.drawBuf = draw;
  if (s.main) { const buf = await grab(s.main); s.mainImg = await save(buf, `marini-saw-${s.slug}.webp`, { trim: true, pad: 0.03, max: 1600 }); s.tileImg = await tile(buf, `marini-saw-${s.slug}-tile.webp`); }
  else { const bold = await thicken(draw); s.mainImg = await save(bold, `marini-saw-${s.slug}.webp`, { pad: 0.04, max: 2000, quality: 92 }); s.tileImg = await tile(bold, `marini-saw-${s.slug}-tile.webp`); }
  if (s.main) s.sideImg = await save(draw, `marini-saw-${s.slug}-side.webp`, { pad: 0.03, max: 2000, quality: 92 });
}

// ---------- pictures: drills ----------
const DI = {};
{
  const mk = async (slug, mainSrc, opts = {}, extras = [], noTile = false) => {
    const buf = await grab(mainSrc);
    const d = { main: await save(buf, `marini-drill-${slug}.webp`, { trim: !opts.photo, pad: opts.photo ? 0 : 0.03, max: 1800, rotate: opts.rotate || 0, quality: opts.photo ? 80 : 86 }) };
    if (!noTile) d.tile = await tile(buf, `marini-drill-${slug}-tile.webp`);
    d.photos = [];
    for (const [k, src] of extras.entries()) d.photos.push(await save(await grab(src), `marini-drill-${slug}-p${k + 1}.webp`, { max: 1800, quality: 80 }));
    DI[slug] = d;
  };
  await mk("voyager", ["voy", 1, 1], { photo: true, rotate: 90 }, [["voy", 2, 1], ["voy", 2, 2]], true);
  { // the Voyager is the MR-C 10: its render is the main picture, its photos follow the quarry photos of the brochure
    const crawlers = JSON.parse(fs.readFileSync(path.join(ROOT, "crawl/marini/crawlers.json"), "utf8")).models.find((m) => m.slug === "mr-c-10");
    const iso = crawlers.images.iso;
    DI.voyager.photos = [DI.voyager.main, ...DI.voyager.photos, ...crawlers.images.photos.map((p) => ({ file: p.file, width: p.width, height: p.height }))];
    DI.voyager.main = { file: iso.file, width: iso.width, height: iso.height };
  }
  await mk("big-driller", ["big", 2, 1], {}, [["big", 3, 1], ["big", 1, 1]]);
  await mk("driller", ["drl", 2, 1]);
  await mk("driller-id", ["drl", 2, 4], {}, [], true);
  await mk("hor-drill", ["hor", 2, 1], {}, [["hor", 2, 3]]);
  await mk("hor-drill-id", ["hor", 2, 2], {}, [["hor", 2, 5], ["hor", 2, 6]], true);
  // drawings of the Voyager (dimensions, working area) and the blind-cut picture of the Big Driller
  const dr = async (src, name) => save(await grab(src), name, { max: 1600, quality: 90 });
  DI.voyagerDraw = {
    vertical: await dr(["voy", 2, 5], "marini-drill-voyager-vertical.webp"), horizontal: await dr(["voy", 2, 6], "marini-drill-voyager-horizontal.webp"),
    areaSide: await dr(["voy", 2, 3], "marini-drill-voyager-area-side.webp"), areaPlan: await dr(["voy", 2, 4], "marini-drill-voyager-area-plan.webp")
  };
  DI.blind = await dr(["big", 2, 2], "marini-drill-big-driller-blind-cut.webp");
}

// ====================================================================================================================
// saw pages
const GROUPS = ["granite", "marble", "mobile"];
const RAIL = { sv: (kg, g) => `2 × 3 m, ${kg} kg per skena${g ? `, spårvidd ${g} mm` : ""}`, en: (kg, g) => `2 × 3 m, ${kg} kg each${g ? `, gauge ${g} mm` : ""}`, es: (kg, g) => `2 × 3 m, ${kg} kg cada uno${g ? `, ancho de vía ${g} mm` : ""}`, no: (kg, g) => `2 × 3 m, ${kg} kg per skinne${g ? `, sporvidde ${g} mm` : ""}` };
const GUIDE = { sv: (n) => (n === 2 ? "två styrhjul 350 mm" : "styrhjul 350 mm"), en: (n) => (n === 2 ? "two guide wheels 350 mm" : "guide wheel 350 mm"), es: (n) => (n === 2 ? "dos poleas guía de 350 mm" : "polea guía de 350 mm"), no: (n) => (n === 2 ? "to styrehjul 350 mm" : "styrehjul 350 mm") };
const sawPath = (s) => `${SAWFAM}/${s.slug}`;
const sawRows = (s, l) => {
  const T = TX[l], r = [];
  const add = (k, v) => r.push({ label: T.lab[k], metric: nl(v, l) });
  if (s.group === "mobile") {
    add("engine", `${s.motors[0]} kW`);
    add("len", `${s.lenClosed} mm (${T.closed}) - ${s.lenOpen} mm (${T.open})`);
    add("wid", `${s.wid} mm`);
    add("hei", `${s.heiClosed} mm (${T.closed}) - ${s.heiOpen} mm (${T.open})`);
    add("weight", `${s.weights[0]} kg`);
    return r;
  }
  add("motor", `${s.motors.join(" / ")} kW`);
  add("len", `${s.len} mm`); add("wid", `${s.wid} mm`); add("hei", `${s.hei} mm`);
  add("weight", `${s.weights.join(" / ")} kg`);
  if (s.speed) add("speed", `${s.speed} m/s`);
  if (s.fly) add("fly", `${s.fly.split("/").join(" / ")} mm, ${GUIDE[l](s.fly === "820" ? 2 : s.fly === "420/550" ? 1 : 2)}`);
  if (s.rails) r.push({ label: T.lab.rails, metric: nl(RAIL[l](s.rails.kg, s.rails.gauge), l) });
  r.push({ label: T.lab.rot, metric: T[s.rot] }, { label: T.lab.trans, metric: T[s.trans] }, { label: T.lab.ctrl, metric: T[s.ctrl] });
  return r;
};
const sawBullets = (s, l) => {
  const T = TX[l];
  if (s.group === "mobile") return [`${T.key.engine}: ${nl(s.motors[0], l)} kW`, `${T.key.len}: ${nl(`${s.lenClosed} - ${s.lenOpen}`, l)} mm`, `${T.key.wid}: ${nl(s.wid, l)} mm`, `${T.key.weight}: ${nl(s.weights[0], l)} kg`];
  return [`${T.key.motor}: ${slash(s.motors, l)} kW`, `${T.key.weight}: ${slash(s.weights, l)} kg`, ...(s.speed ? [`${T.key.speed}: ${nl(s.speed, l)} m/s`] : [])];
};
const sawIntro = (s, l) => {
  const T = TX[l], m = slash(s.motors, l), w = slash(s.weights, l);
  if (s.group === "mobile") return T.sawIntro.mobile(s.name, m, w);
  if (s.group === "marble") return T.sawIntro.marble(s.name, m, w);
  return T.sawIntro.granite(s.name, m, w, s.speed ? nl(s.speed, l) : "");
};
const dash = "–";
let order = 0;
for (const s of SAWS) {
  const near = SAWS.filter((x) => x.group === s.group && x !== s);
  const i18n = {};
  for (const l of LANGS) {
    const T = TX[l];
    const intro = sawIntro(s, l);
    const photos = s.group === "granite" ? [photo.granite] : s.group === "marble" ? [photo.marble] : s.slug === "mobil-fil" ? [photo.mobile, photo.yard] : [photo.yard];
    const docBtns = [...(s.group === "granite" ? [dl(T.docSaw, PDF.saw.to)] : []), dl(T.docCat, PDF.cat.to)];
    const blocks = [
      logoBlock,
      { type: "image", alt: `Marini ${s.name}`, ...s.mainImg, src: s.mainImg.file },
      ...carousel(photos, `Marini ${s.name}`),
      { type: "text", html: esc(intro) },
      { type: "text", html: esc(T.sawBody[s.group]) },
      { type: "list", ordered: false, items: sawBullets(s, l) },
      { type: "text", html: T.contact },
      ...docBtns,
      { type: "datasheet", title: T.data, tagline: `Marini ${s.name}`, intro: [], groups: [{ title: T.spec, rows: sawRows(s, l) }], note: s.group === "mobile" ? "" : T.note, source: T.source },
      ...(s.versions && s.versions.length > 1 ? [{ type: "heading", level: 3, text: T.versionsT }, { type: "table", header: true, rows: [[T.lab.model, T.lab.rot, T.lab.trans], ...s.versions.map(([n, r, t]) => [n, T[r] || dash, t === "none" ? dash : T[t]])] }] : []),
      ...(s.sideImg ? [{ type: "modules", layout: "tiles", columns: 1, narrow: true, zoom: true, more: false, items: [{ title: T.side, image: s.sideImg.file, alt: `${T.side} ${s.name}`, text: T.sideHint, width: s.sideImg.width, height: s.sideImg.height }] }] : []),
      ...(s.video ? [{ type: "video", provider: "youtube", id: s.video.id, title: s.video.title }] : []),
      { type: "related", title: T.up, items: [{ href: SAWFAM, mutual: false }, ...near.slice(0, 3).map((x) => ({ href: sawPath(x) }))] }
    ];
    i18n[l] = { title: s.name, h1: `Marini ${s.name}`, description: intro.slice(0, 200), blocks: tag(blocks) };
  }
  writeJson(path.join(PAGES, "vajersagar", s.slug + ".json"), { path: sawPath(s), updated: date, template: "product", order: order++, published: true, hero: heroSaw, i18n });
}

// the wire saw family page: tiles per group and the new documents
{
  const f = path.join(PAGES, "vajersagar.json");
  const { eol, j } = readPage(f);
  for (const l of LANGS) {
    const T = TX[l];
    const bl = j.i18n[l].blocks.filter((b) => !b.gen);
    const at = bl.findIndex((b) => b.type === "text" && /kontakta-oss|contact|contáct|kontakt/i.test(b.html || "")); // before the "contact us" line
    const tiles = GROUPS.flatMap((g) => [
      { type: "heading", level: 2, text: T.groups[g] },
      { type: "modules", layout: "tiles", columns: 4, square: true, more: false, items: SAWS.filter((s) => s.group === g).map((s) => ({ title: s.name, image: s.tileImg.file, alt: `Marini ${s.name}`, href: sawPath(s), bullets: sawBullets(s, l).slice(0, 2), width: 1000, height: 1000 })) }
    ]);
    const docBtns = [dl(T.docSaw, PDF.saw.to), dl(T.docCat, PDF.cat.to)];
    const first = bl.findIndex((b) => b.type === "button" && b.kind === "download");
    bl.splice(at >= 0 ? at : bl.length, 0, ...tag(tiles));
    const fi = bl.findIndex((b) => b.type === "button" && b.kind === "download");
    bl.splice(fi >= 0 ? fi : bl.length, 0, ...tag(docBtns));
    j.i18n[l].blocks = bl;
    void first;
  }
  j.updated = date;
  writeJson(f, j, eol);
}

// ====================================================================================================================
// quarry drill rigs: direct children of the Marini page. Driller and Hor Drill each come in two versions, pneumatic and hydraulic
// ("ID" in the model name = hydraulic); both are written out on one page. Voyager is the same machine as the MR-C 10 and borrows its pictures.
const BASE = "/produkter/marini";
const drillPath = (slug) => `${BASE}/${slug}`;
const MRC10 = "/produkter/marini/crawlers/mr-c-10";
const PAGESET = [
  { slug: "voyager", name: "Voyager", parts: ["voyager"], order: 8 },
  { slug: "big-driller", name: "Big Driller", parts: ["big-driller"], order: 9 },
  { slug: "driller", name: "Driller", parts: ["driller", "driller-id"], order: 10 },
  { slug: "hor-drill", name: "Hor Drill", parts: ["hor-drill", "hor-drill-id"], order: 11 }
];
const VX = {
  sv: { two: "Två versioner", pneu: "Pneumatisk", hyd: "Hydraulisk", idNote: "ID i modellnamnet står för den hydrauliska versionen.", both: "Pneumatisk och hydraulisk (ID)", section: "Borrenheter för stenbrott", same: (a) => `Voyager är samma maskin som ${a} i Marinis larvriggsserie.` },
  en: { two: "Two versions", pneu: "Pneumatic", hyd: "Hydraulic", idNote: "ID in the model name stands for the hydraulic version.", both: "Pneumatic and hydraulic (ID)", section: "Quarry drilling units", same: (a) => `Voyager is the same machine as the ${a} in Marini's crawler rig line.` },
  es: { two: "Dos versiones", pneu: "Neumática", hyd: "Hidráulica", idNote: "ID en el nombre del modelo indica la versión hidráulica.", both: "Neumática e hidráulica (ID)", section: "Unidades de perforación para canteras", same: (a) => `Voyager es la misma máquina que la ${a} de la serie de perforadoras de orugas de Marini.` },
  no: { two: "To utgaver", pneu: "Pneumatisk", hyd: "Hydraulisk", idNote: "ID i modellnavnet står for den hydrauliske utgaven.", both: "Pneumatisk og hydraulisk (ID)", section: "Borenheter for steinbrudd", same: (a) => `Voyager er den samme maskinen som ${a} i Marinis serie med beltegående borerigger.` }
};
const KL = { engine: { sv: "Motor", en: "Engine", es: "Motor", no: "Motor" }, torque: { sv: "Vridmoment", en: "Rotary torque", es: "Par de rotación", no: "Dreiemoment" }, hole: { sv: "Håldiameter", en: "Hole diameter", es: "Diámetro del barreno", no: "Hulldiameter" } };
const keyLabel = (k, l) => (KL[k] ? KL[k][l] : RL[k][l]);
const keyText = (slug, l) => DRILL_TEXT[slug].key.map(([k, v]) => `${keyLabel(k, l)}: ${nl(v, l)}`);
const BROCHURE = { voyager: "voy", "big-driller": "big", driller: "drl", "hor-drill": "hor" };

// stale pages of the first layout (a family page "Quarry drill rigs" with six pages below it)
fs.rmSync(path.join(PAGES, "stenbrottsborrning"), { recursive: true, force: true });
fs.rmSync(path.join(PAGES, "stenbrottsborrning.json"), { force: true });
for (const f of ["marini-drill-family.webp", "marini-drill-driller-id-tile.webp", "marini-drill-hor-drill-id-tile.webp"]) fs.rmSync(path.join(IMG, f), { force: true });
{
  const f = path.join(ROOT, "content/redirects.json");
  const raw = fs.readFileSync(f, "utf8"), eol = eolOf(raw), r = JSON.parse(raw), old = "/produkter/marini/stenbrottsborrning";
  Object.assign(r, { [old]: BASE, [`${old}/voyager`]: drillPath("voyager"), [`${old}/big-driller`]: drillPath("big-driller"), [`${old}/driller`]: drillPath("driller"), [`${old}/driller-id`]: drillPath("driller"), [`${old}/hor-drill`]: drillPath("hor-drill"), [`${old}/hor-drill-id`]: drillPath("hor-drill") });
  fs.writeFileSync(f, JSON.stringify(r, null, 2).replace(/\n/g, eol) + eol);
}

for (const pg of PAGESET) {
  const parts = pg.parts.map((s) => ({ slug: s, X: DRILL_TEXT[s], im: DI[s] }));
  const base = parts[0], two = parts.length === 2;
  const i18n = {};
  const near = PAGESET.filter((x) => x.slug !== pg.slug).map((x) => x.slug);
  for (const l of LANGS) {
    const T = TX[l], V = VX[l], X = base.X;
    const groups = parts.flatMap((p, i) => p.X.groups.map((g) => ({ title: two ? `${i === 0 ? V.pneu : V.hyd} (${p.X.title[l]})` : g.t[l], rows: g.rows.map(([k, v]) => ({ label: RL[k][l], metric: val(v, l) })) })));
    const draws = pg.slug === "voyager"
      ? [["v", DI.voyagerDraw.vertical, { sv: "Vertikal borrning: mått", en: "Vertical drilling: dimensions", es: "Perforación vertical: dimensiones", no: "Vertikal boring: mål" }], ["h", DI.voyagerDraw.horizontal, { sv: "Horisontell borrning: mått", en: "Horizontal drilling: dimensions", es: "Perforación horizontal: dimensiones", no: "Horisontal boring: mål" }],
        ["s", DI.voyagerDraw.areaSide, { sv: "Arbetsområde, sidovy", en: "Working area, side view", es: "Área de trabajo, vista lateral", no: "Arbeidsområde, sideriss" }], ["p", DI.voyagerDraw.areaPlan, { sv: "Arbetsområde, planvy (250°)", en: "Working area, plan view (250°)", es: "Área de trabajo, vista en planta (250°)", no: "Arbeidsområde, planriss (250°)" }]]
      : pg.slug === "big-driller" ? [["b", DI.blind, { sv: "Hål för blinda snitt (principbild)", en: "Holes for blind cuts (principle)", es: "Barrenos para cortes ciegos (esquema)", no: "Hull for blinde snitt (prinsippskisse)" }]] : [];
    const drawBlock = draws.length ? [{ type: "modules", layout: "tiles", columns: pg.slug === "voyager" ? 2 : 1, narrow: pg.slug !== "voyager", zoom: true, more: false, items: draws.map(([, img, title]) => ({ title: title[l], image: img.file, alt: `${X.title[l]}: ${title[l]}`, width: img.width, height: img.height })) }] : [];
    // the pictures: the first part's picture is the main one, the other versions and the extra photos follow in the slideshow
    const main = base.im.main, extra = [...parts.slice(1).map((p) => p.im.main), ...parts.flatMap((p) => p.im.photos || [])];
    const altOf = (img) => { const p = parts.find((x) => x.im.main === img); return `Marini ${p ? p.X.title[l] : X.title[l]}`; };
    const versionBullets = two ? parts.map((p, i) => `${i === 0 ? V.pneu : V.hyd} (${p.X.title[l]}): ${p.X.key.map(([k, v]) => `${keyLabel(k, l).toLowerCase()} ${nl(v, l)}`).join(", ")}`) : keyText(base.slug, l);
    const blocks = [
      logoBlock,
      { type: "image", alt: `Marini ${X.title[l]}`, ...main, src: main.file },
      ...(extra.length ? [{ type: "carousel", autoplay: false, interval: 6, items: extra.map((p, k) => ({ src: p.file, alt: `${altOf(p)} (${k + 1}/${extra.length})`, width: p.width, height: p.height })) }] : []),
      { type: "text", html: esc(X.intro[l]) },
      { type: "text", html: esc(X.body[l]) },
      ...(pg.slug === "voyager" ? [{ type: "text", html: V.same(`<a href="${MRC10}">MR-C 10</a>`) }] : []),
      ...(two ? [{ type: "heading", level: 3, text: V.two }, { type: "text", html: esc(V.idNote) }] : []),
      { type: "list", ordered: false, items: versionBullets },
      { type: "text", html: T.contact },
      dl(T.docModel(X.title[l]), PDF[BROCHURE[pg.slug]].to), dl(T.docCat, PDF.cat.to),
      { type: "datasheet", title: T.data, tagline: `Marini ${X.title[l]}`, intro: [], groups, note: "", source: T.source },
      ...drawBlock,
      { type: "related", title: T.up, items: [...(pg.slug === "voyager" ? [{ href: MRC10, mutual: true }] : []), { href: BASE, mutual: false }, ...near.map((x) => ({ href: drillPath(x) }))].slice(0, 4) }
    ];
    i18n[l] = { title: X.title[l], h1: `Marini ${X.title[l]}`, description: X.intro[l].slice(0, 200), blocks: tag(blocks) };
  }
  writeJson(path.join(PAGES, pg.slug + ".json"), { path: drillPath(pg.slug), updated: date, template: "product", order: pg.order, published: true, hero: heroDrill, i18n });
}

// the Marini page: the family card of the first layout goes, the four machines get tiles of their own below the cards
{
  const f = path.join(PAGES, "..", "marini.json");
  const { eol, j } = readPage(f);
  for (const l of LANGS) {
    const V = VX[l], T = TX[l];
    const cards = j.i18n[l].blocks.find((b) => b.type === "cards");
    cards.items = cards.items.filter((it) => it.href !== "/produkter/marini/stenbrottsborrning");
    const tileOf = {
      voyager: { image: "/assets/img/marini-mrc-mr-c-10-tile.webp", bullets: [T.hydraulic, `${KL.engine[l]}: ${nl("17 kW / 15 kW", l)}`] },
      "big-driller": { image: DI["big-driller"].tile.file, bullets: [T.hydraulic, `${KL.hole[l]}: 255 mm`] },
      driller: { image: DI.driller.tile.file, bullets: [V.both, `${RL.weight[l]}: ${nl("145 - 180 kg", l)}`] },
      "hor-drill": { image: DI["hor-drill"].tile.file, bullets: [V.both, `${RL.weight[l]}: 230 kg`] }
    };
    const bl = j.i18n[l].blocks.filter((b) => !b.gen || b.type === "button"); // (the generated catalogue button stays)
    const tiles = [{ type: "heading", level: 2, text: V.section }, { type: "modules", layout: "tiles", columns: 4, square: true, more: false, items: PAGESET.map((pg) => ({ title: pg.name, image: tileOf[pg.slug].image, alt: `Marini ${pg.name}`, href: drillPath(pg.slug), bullets: tileOf[pg.slug].bullets, width: 1000, height: 1000 })) }];
    j.i18n[l].blocks = [...bl, ...tag(tiles)];
  }
  j.updated = date;
  writeJson(f, j, eol);
}

// ====================================================================================================================
// the old quarry brochure: hidden (kept in the content), the new quarry catalogue shown instead
{
  const OLD = /marini-broschyr-stenbrott-(eng|sv)\.pdf$/;
  let hidden = 0;
  for (const rel of ["../marini.json", "giraffa.json", "rustica.json"]) {
    const f = path.join(PAGES, rel);
    const { eol, j } = readPage(f);
    for (const l of LANGS) {
      const T = TX[l];
      const bl = j.i18n[l].blocks.filter((b) => !(b.gen && b.type === "button"));
      for (const b of bl) if (b.type === "button" && OLD.test(b.href || "")) { b.hidden = true; hidden++; }
      const first = bl.findIndex((b) => b.type === "button" && OLD.test(b.href || ""));
      if (first >= 0) bl.splice(first, 0, ...tag([dl(T.docCat, PDF.cat.to)]));
      j.i18n[l].blocks = bl;
    }
    writeJson(f, j, eol);
  }
  console.log(`old quarry brochure: ${hidden} buttons hidden`);
}
console.log(`Marini quarry: ${SAWS.length} wire saw pages, ${PAGESET.length} drill rig pages (Voyager, Big Driller, Driller, Hor Drill)`);
