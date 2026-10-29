#!/usr/bin/env node
// Marini MR-C pages: full-size pictures from Marini's own product pages (marinidrills.com/macchine-marini/mr-c-XX) instead of the 350 px copies in the PDFs.
//   main picture   the isometric render of the model where the site has one (2560 px or 1290 px); the other models keep the render taken from the catalogue
//   carousel       the job-site photos of the model, in page order, on a 1400 x 1050 canvas (portrait photos get a blurred fill, nothing is cropped)
// Reads crawl/marini/crawlers.json (tools/marini-crawlers.mjs), updates its image entries and writes assets-src/img/marini-mrc-<slug>-{iso,p1..}.webp.
// Downloads are cached in crawl/marini/official/. Then: node tools/marini-crawler-pages.mjs
//   node tools/marini-official-images.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const IMG = path.join(ROOT, "assets-src/img"), JSON_FILE = path.join(ROOT, "crawl/marini/crawlers.json"), CACHE = path.join(ROOT, "crawl/marini/official");
const BASE = "https://www.marinidrills.com/macchine-marini/";
// our model page -> the page on Marini's site; variants without a page of their own share the photos of the base model
const PAGE = { "mr-c-10": "mr-c-10", "mr-c-15": "mr-c-15", "mr-c-20": "mr-c-20", "mr-c-20p": "mr-c-20-p", "mr-c-30": "mr-c-30", "mr-c-35": "mr-c-35", "mr-c-35a": "mr-c-35", "mr-c-50": "mr-c-50", "mr-c-80": "mr-c-80", "mr-c-85": "mr-c-85", "mr-c-85a": "mr-c-85", "mr-c-90": "mr-c-90", "mr-c-95": "mr-c-95", "mr-c-95p": "mr-c-95" };
// the picture that is the model's render on the site (the first photo of a page otherwise)
const RENDER = { "mr-c-10": /ASSIEME-MR-C10/i, "mr-c-15": /MR-C15-/i, "mr-c-30": /Assieme_C30/i, "mr-c-95": /MR-C-95-IDE/i, "mr-c-20p": /MR-C-20P\.jpg/i, "mr-c-50": /MR-C-50\.jpg/i, "mr-c-80": /MR-C-80\.jpg/i, "mr-c-90": /MR-C-90\.jpg/i };
const RENDER_ANY = /ASSIEME|Assieme|MR-C15-|MR-C-95-IDE|MR-C-(20P|50|80|90)\.jpg/i;
const SKIP = /\/(ID_|MA_)|icona|favicon|logo|line\.png|dhl_|\/2025\/04\/(123ee2cb|9e59f2d2|IMG_45(67|69-1|80|86)|IMG_4601)|marini-|\/(1|4)\.jpg$/i; // heads, site furniture, the two control-screen shots of the MR-C 95
const MAX_PHOTOS = 8;
const W = 1400, H = 1050;

const data = JSON.parse(fs.readFileSync(JSON_FILE, "utf8"));
const html = {}, photosOf = {};
async function listPage(page) {
  if (photosOf[page]) return photosOf[page];
  const h = (await (await fetch(BASE + page + "/")).text()).replace(/\\\//g, "/");
  const seen = [];
  for (const m of h.matchAll(/https?:\/\/www\.marinidrills\.com\/wp-content\/uploads\/20\d\d\/\d\d\/[^"'\s)\\]+?\.(?:jpe?g|png|webp)/gi)) {
    const u = m[0]; if (/-\d+x\d+\./.test(u) || seen.includes(u)) continue; seen.push(u);
  }
  html[page] = h; return (photosOf[page] = seen);
}
async function get(url, page) {
  const dir = path.join(CACHE, page); fs.mkdirSync(dir, { recursive: true });
  const f = path.join(dir, url.split("/").pop());
  if (!fs.existsSync(f)) fs.writeFileSync(f, Buffer.from(await (await fetch(url)).arrayBuffer()));
  return f;
}
// a render: on white, trimmed, padded, at most 1600 px wide
async function saveRender(file, name) {
  let s = sharp(file).flatten({ background: "#ffffff" });
  const t = await s.png().toBuffer();
  const r = await sharp(await sharp(t).trim({ threshold: 12 }).toBuffer()).extend({ top: 16, bottom: 16, left: 16, right: 16, background: "#ffffff" }).resize({ width: 1600, withoutEnlargement: true, kernel: "lanczos3" }).webp({ quality: 88 }).toBuffer({ resolveWithObject: true });
  fs.writeFileSync(path.join(IMG, name + ".webp"), r.data);
  return { file: `/assets/img/${name}.webp`, width: r.info.width, height: r.info.height };
}
// a photo: laid on a blurred copy of itself so that every carousel picture has the same shape
async function savePhoto(file, name) {
  const src = await sharp(file).rotate().toBuffer();
  const bg = await sharp(src).resize(W, H, { fit: "cover" }).blur(30).modulate({ brightness: 0.85 }).toBuffer();
  const fg = await sharp(src).resize(W, H, { fit: "inside", kernel: "lanczos3" }).toBuffer();
  const out = await sharp(bg).composite([{ input: fg, gravity: "centre" }]).webp({ quality: 80 }).toBuffer();
  fs.writeFileSync(path.join(IMG, name + ".webp"), out);
  return { file: `/assets/img/${name}.webp`, width: W, height: H };
}

const done = {}; // official page -> its photo entries (shared by the variants)
for (const m of data.models) {
  const page = PAGE[m.slug]; if (!page) continue;
  const all = await listPage(page);
  // render
  const rx = RENDER[m.slug];
  if (rx) {
    const u = all.find((x) => rx.test(x));
    if (u) { m.images.iso = { ...(await saveRender(await get(u, page), `marini-mrc-${m.slug}-iso`)), source: "marinidrills.com" }; console.log(m.slug.padEnd(9), "render", m.images.iso.width + "x" + m.images.iso.height); }
  } else console.log(m.slug.padEnd(9), "render from the catalogue", m.images.iso ? m.images.iso.source : "-");
  // photos (the base model's, shared by its variants)
  if (!done[page]) {
    const base = { slug: Object.keys(PAGE).find((s) => PAGE[s] === page && (s === page || s === page.replace(/-p$/, "p"))) || m.slug };
    const list = all.filter((u) => !SKIP.test(u) && !RENDER_ANY.test(u)).slice(0, MAX_PHOTOS);
    const entries = [];
    let k = 1; for (const u of list) entries.push(await savePhoto(await get(u, page), `marini-mrc-${base.slug}-p${k++}`));
    done[page] = entries; console.log("  ", page, entries.length, "photos");
  }
  m.images.photos = done[page]; delete m.images.iso2; delete m.images.field;
}
fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2));
// the old low-resolution pictures are no longer used
const used = new Set(); for (const m of data.models) for (const e of [m.images.iso, m.images.side, ...(m.images.photos || [])]) if (e) used.add(path.basename(e.file));
let removed = 0;
for (const f of fs.readdirSync(IMG)) if (/^marini-mrc-.*-(iso2|photo|p\d+)\.webp$/.test(f) && !used.has(f)) { fs.unlinkSync(path.join(IMG, f)); removed++; }
console.log(`written crawlers.json; ${removed} unused old pictures removed`);
