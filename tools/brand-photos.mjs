#!/usr/bin/env node
// Photos of the compact brand cards on the products page: the pictures of the folder "dude" (default ~/Downloads/dude) become
// assets-src/img/brand-photo-<brand>.webp, and every card of content/pages/produkter.json gets  photo, photoX, photoY, photoZoom.
// photoX / photoY (percent) say which part of the picture stays in view, photoZoom (1 or more) how close it is cropped; the alignment app
// (tools/fx-align.mjs, tab Thumbnails) sets them by hand. Values that are already there are kept.
//   DUDE_DIR=<folder> node tools/brand-photos.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const DUDE = process.env.DUDE_DIR || path.join(os.homedir(), "Downloads", "dude");
const PHOTO = { ahlm: "ahlmst5menu.jpg", geobrugg: "brugg.png", brutus: "brutusnew.jpg", ecobeton: "ecobeton.png", haeny: "haenymenu.png", "kraft-tool": "img-p2_18.png", "jean-lutz": "jeanmenu.jpg", marini: "marini.png", "ram-board": "ramboard.png", reed: "reed.png", tei: "tei.png", "terra-infrastructure": "terramenu.png", weber: "webermenu.png", mapei: "mapei.png", "flexo-tekniikka": "flexo.jpg" };
// the subject of these two sits off centre: a zoom and a placement that bring it to the middle of the frame (the alignment app finishes the job by hand)
const START = { "flexo-tekniikka": { x: 0, y: 32, zoom: 1.55 }, mapei: { x: 32, y: 62, zoom: 1.2 } };
const TRIM = new Set(["mapei"]); // the picture comes with light bands above and below it

for (const [slug, file] of Object.entries(PHOTO)) {
  const src = path.join(DUDE, file), dst = path.join(ROOT, "assets-src/img", `brand-photo-${slug}.webp`);
  if (fs.existsSync(dst) && !fs.existsSync(src)) continue;
  if (!fs.existsSync(src)) throw new Error(`missing ${src} (set DUDE_DIR)`);
  let img = sharp(src).flatten({ background: "#ffffff" });
  if (TRIM.has(slug)) img = sharp(await img.png().toBuffer()).trim({ threshold: 18 });
  await img.resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 80 }).toFile(dst);
}

const f = path.join(ROOT, "content/pages/produkter.json");
const raw = fs.readFileSync(f, "utf8"), eol = raw.includes("\r\n") ? "\r\n" : "\n", j = JSON.parse(raw);
let n = 0;
for (const l of Object.keys(j.i18n)) for (const b of j.i18n[l].blocks) for (const it of b.items || []) {
  const slug = (it.href || "").split("/").pop();
  if (!PHOTO[slug]) continue;
  it.photo = `/assets/img/brand-photo-${slug}.webp`;
  const st = START[slug] || { x: 50, y: 50, zoom: 1 };
  if (it.photoX === undefined) it.photoX = st.x;
  if (it.photoY === undefined) it.photoY = st.y;
  if (it.photoZoom === undefined) it.photoZoom = st.zoom;
  n++;
}
fs.writeFileSync(f, JSON.stringify(j, null, 2).replace(/\n/g, eol) + eol);
console.log(`${Object.keys(PHOTO).length} photos, ${n} cards updated`);
