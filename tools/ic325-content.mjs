#!/usr/bin/env node
// IC 325 CCP:
//  1. the tiles that show the IC 325 CCP in the lists (/produkter/haeny/manuella-pumpar and the Häny page, and its menu) get the full, glossy picture
//     "ic325ccpfull with gloss.jpg" (default ~/Downloads); the product page itself keeps its own picture (white IC 325 + yellow WIWA 2K)
//  2. on that picture: two brackets drawn when the pointer is on their dot: the bottom of the white part (IC 325) and the rest (WIWA 2K).
//     The start and end of each bracket and the dots are set by hand in the alignment app (tools/fx-align.mjs, tab Dots, picture "IC 325 CCP").
//   node tools/ic325-content.mjs        (safe to run again: a placement made in the app is kept)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = process.env.IC325_IMAGE || path.join(os.homedir(), "Downloads", "ic325ccpfull with gloss.jpg");
const IMG = path.join(ROOT, "assets-src/img");
if (fs.existsSync(SRC)) {
  const tile = await sharp(SRC).flatten({ background: "#ffffff" }).resize(1000, 1000, { fit: "cover" }).webp({ quality: 86 }).toBuffer();
  for (const name of ["haeny-ccp-tile.webp", "haeny-tile-ccp.webp"]) fs.writeFileSync(path.join(IMG, name), tile);
  console.log("tiles replaced");
}

const rw = (f, fn) => {
  const file = path.join(ROOT, f), raw = fs.readFileSync(file, "utf8"), eol = raw.includes("\r\n") ? "\r\n" : "\n", j = JSON.parse(raw);
  fn(j);
  fs.writeFileSync(file, JSON.stringify(j, null, 2).replace(/\n/g, eol) + eol);
};
const START = [
  { kind: "bracket", x: 26, y: 50, x1: 1.5, y1: 60, x2: 40, y2: 79.5, tick: 3, side: 1, text: "IC 325" },
  { kind: "bracket", x: 62, y: 56, x1: 41.5, y1: 79.5, x2: 77, y2: 72.5, tick: 3, side: 1, text: "WIWA 2K" }
];
rw("content/pages/produkter/haeny/manuella-pumpar/ic-325-ccp.json", (j) => {
  for (const l of ["sv", "en", "es", "no"]) {
    const img = j.i18n[l].blocks.find((b) => b.type === "image" && /haeny-ic325-ccp-combo\.webp$/.test(b.src || ""));
    if (!img) throw new Error(`no machine picture in ${l}`);
    if (!(img.callouts && img.callouts.length)) img.callouts = START.map((c) => ({ ...c }));
  }
});
console.log("ok");
