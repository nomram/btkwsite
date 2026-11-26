#!/usr/bin/env node
// Marini MR and MR-C: the model pictures made from Marini's own 3D models (rendered by src/js/viewer3d.js at 2400 px, same angle and light for
// every machine, see tools/_scratch/renders/f-<model>.png), so all tiles look alike and are sharp.
//   iso   the machine trimmed, on white, at most 1800 px  -> assets-src/img/marini-mr-<slug>-iso.webp / marini-mrc-<slug>-iso.webp
//   tile  the machine fitted in the same box on a 1000 px square, like the other Marini tiles
// MR-C variants without a model of their own use the base model's picture (35A -> 35, 85A -> 85, 95P -> 95).
//   node tools/marini-3d-pictures.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
const ROOT = path.resolve(import.meta.dirname, "..");
const IMG = path.join(ROOT, "assets-src/img"), R = path.join(ROOT, "tools/_scratch/renders");
const MR = ["mr-1-pn", "mr-2-id-100", "mr-2-id-80", "mr-2-pn", "mr-2-pn-80", "mr-3-id", "mr-3-pn", "mr-4-id", "mr-5-id", "mr-5-pn", "mr-6-id", "mr-6-pn"];
const MRC = { "mr-c-10": "mr-c-10", "mr-c-15": "mr-c-15", "mr-c-20": "mr-c-20", "mr-c-20p": "mr-c-20-p", "mr-c-30": "mr-c-30", "mr-c-35": "mr-c-35", "mr-c-35a": "mr-c-35", "mr-c-50": "mr-c-50", "mr-c-80": "mr-c-80", "mr-c-85": "mr-c-85", "mr-c-85a": "mr-c-85", "mr-c-90": "mr-c-90", "mr-c-95": "mr-c-95", "mr-c-95p": "mr-c-95" };
const out = {};
async function make(render, iso, tile) {
  const t = await sharp(path.join(R, `f-${render}.png`)).flatten({ background: "#fff" }).trim({ threshold: 4 }).toBuffer({ resolveWithObject: true });
  const pad = Math.round(Math.max(t.info.width, t.info.height) * 0.04);
  const r = await sharp(t.data).extend({ top: pad, bottom: pad, left: pad, right: pad, background: "#ffffff" }).resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true, kernel: "lanczos3" }).webp({ quality: 90 }).toBuffer({ resolveWithObject: true });
  fs.writeFileSync(path.join(IMG, iso + ".webp"), r.data);
  const fitted = await sharp(t.data).resize({ width: 880, height: 820, fit: "inside", kernel: "lanczos3" }).toBuffer();
  await sharp({ create: { width: 1000, height: 1000, channels: 3, background: "#ffffff" } }).composite([{ input: fitted, gravity: "centre" }]).webp({ quality: 90 }).toFile(path.join(IMG, tile + ".webp"));
  return { width: r.info.width, height: r.info.height };
}
for (const s of MR) out[s] = await make(s, `marini-mr-${s}-iso`, `marini-mr-${s}-tile`);
for (const [slug, model] of Object.entries(MRC)) out[slug] = await make(model, `marini-mrc-${slug}-iso`, `marini-mrc-${slug}-tile`);
fs.writeFileSync(path.join(ROOT, "crawl/marini/3d-pictures.json"), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(12), v.width + "x" + v.height);
