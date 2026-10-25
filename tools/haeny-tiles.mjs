#!/usr/bin/env node
// Picture tiles for the Häny pages. Every tile is the same 1000 x 1000 white square with the product trimmed and fitted into the same
// inner box (860 x 800), so pictures of different shapes and with different white margins look equally big side by side.
//   assets-src/img/haeny-tile-<name>.webp   for the family / unit / registration tiles on the brand page
//   assets-src/img/haeny-<model>-tile.webp  for the model tiles on the family pages (from the model picture extracted from each brochure)
//   node tools/haeny-extract.mjs && node tools/haeny-tiles.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const IMG = path.join(ROOT, "assets-src/img");
const BOX = { w: 860, h: 800 };

async function tile(srcName, outName) {
  const file = path.join(IMG, srcName + ".webp");
  if (!fs.existsSync(file)) { console.log("missing", srcName); return false; }
  const flat = await sharp(file).flatten({ background: "#ffffff" }).toBuffer();
  const t = await sharp(flat).trim({ threshold: 12 }).toBuffer({ resolveWithObject: true });
  const fitted = await sharp(t.data).resize({ width: BOX.w, height: BOX.h, fit: "inside", kernel: "lanczos3" }).toBuffer();
  await sharp({ create: { width: 1000, height: 1000, channels: 3, background: "#ffffff" } })
    .composite([{ input: fitted, gravity: "centre" }]).webp({ quality: 88 }).toFile(path.join(IMG, outName + ".webp"));
  return true;
}

const SET = {
  ic: "haeny-manuella-pumpar-ic-310-ic-311", faic: "haeny-automatiska-pumpar", ccp: "haeny-ccp-model", mcm: "haeny-finder-mcm",
  hcm: "haeny-hcm300-model", hrw: "haeny-hrw350-model", zmp: "haeny-zmp725-model", dpv: "haeny-manuella-pumpar-dataloggare-dpv-2"
};
for (const [k, src] of Object.entries(SET)) await tile(src, "haeny-tile-" + k);

let n = 0;
for (const f of fs.readdirSync(path.join(ROOT, "crawl/haeny")).filter((x) => x.endsWith(".json") && !/strings/.test(x))) {
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, "crawl/haeny", f), "utf8"));
  const im = d.images && (d.images.model || d.images.unit);
  if (im && await tile(path.basename(im.file, ".webp"), `haeny-${d.key}-tile`)) n++;
}
console.log("tiles:", Object.keys(SET).length, "families,", n, "models");
