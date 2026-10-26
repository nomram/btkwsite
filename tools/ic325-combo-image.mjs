#!/usr/bin/env node
// The IC 325 / IC 325 CCP page opens with one picture that goes from the IC 325 into the CCP module (the user's render, ~/Downloads/ic325ccp.jpg).
//   node tools/ic325-combo-image.mjs [path to the jpg]
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = process.argv[2] || path.join(os.homedir(), "Downloads", "ic325ccp.jpg");
const NAME = "haeny-ic325-ccp-combo";
const out = await sharp(SRC).flatten({ background: "#ffffff" }).resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true }).webp({ quality: 90 }).toBuffer({ resolveWithObject: true });
fs.writeFileSync(path.join(ROOT, "assets-src/img", NAME + ".webp"), out.data);
const f = path.join(ROOT, "content/pages/produkter/haeny/manuella-pumpar/ic-325-ic325-ccp.json");
const raw = fs.readFileSync(f, "utf8"); const eol = raw.includes("\r\n") ? "\r\n" : "\n"; const j = JSON.parse(raw);
for (const l of Object.keys(j.i18n)) {
  const b = j.i18n[l].blocks.find((x, i) => i <= 2 && x.type === "image" && !x.href);
  if (!b) throw new Error("no picture block in " + l);
  Object.assign(b, { src: `/assets/img/${NAME}.webp`, width: out.info.width, height: out.info.height });
}
fs.writeFileSync(f, JSON.stringify(j, null, 2).replace(/\n/g, eol) + eol);
console.log("combo picture set:", out.info.width + "x" + out.info.height);
