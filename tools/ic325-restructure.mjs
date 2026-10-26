#!/usr/bin/env node
// /produkter/haeny/manuella-pumpar/ic-325-ic325-ccp: the way the original page was laid out, with the newer picture for the CCP.
//   1. "Häny IC325": the regular IC325 picture on the left, the text on the right (the page's opening split), brochure button
//   2. "Häny IC325 CCP": the render that goes from the IC 325 into the CCP module (ic325ccp.jpg from ~/Downloads) on the left, the CCP text on the right,
//      then the photos, the brochure button and the video
// The brochure data blocks (gen) are added by tools/haeny-build-pages.mjs. Safe to run again.
//   node tools/ic325-restructure.mjs [path to ic325ccp.jpg]
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const NAME = "haeny-ic325-ccp-combo";
const REGULAR = "/assets/img/haeny-manuella-pumpar-ic-325-ic325-ccp-2.webp";
const SRC = process.argv[2] || path.join(os.homedir(), "Downloads", "ic325ccp.jpg");
const outFile = path.join(ROOT, "assets-src/img", NAME + ".webp");
if (fs.existsSync(SRC)) {
  const out = await sharp(SRC).flatten({ background: "#ffffff" }).resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true }).webp({ quality: 90 }).toFile(outFile);
  console.log("picture:", out.width + "x" + out.height);
}
const combo = await sharp(outFile).metadata();
const regular = await sharp(path.join(ROOT, "assets-src/img", path.basename(REGULAR))).metadata();

const f = path.join(ROOT, "content/pages/produkter/haeny/manuella-pumpar/ic-325-ic325-ccp.json");
const raw = fs.readFileSync(f, "utf8"); const eol = raw.includes("\r\n") ? "\r\n" : "\n"; const j = JSON.parse(raw);
const ALT = { sv: "Häny IC325 CCP: IC325 med CCP-modul", en: "Häny IC325 CCP: IC325 with CCP module", es: "Häny IC325 CCP: IC325 con módulo CCP", no: "Häny IC325 CCP: IC325 med CCP-modul" };
for (const l of Object.keys(j.i18n)) {
  const bl = j.i18n[l].blocks;
  // the opening picture is the regular IC325 again
  const top = bl.find((b, i) => i <= 2 && b.type === "image" && !b.href);
  Object.assign(top, { src: REGULAR, width: regular.width, height: regular.height });
  const done = bl.findIndex((b) => b.type === "columns" && b.left && b.left.some((x) => x.src && x.src.includes(NAME)));
  if (done >= 0) { // already restructured: the photos still go under the picture (a carousel that plays by itself) if they are a block of their own
    const own = bl.findIndex((b, i) => i > done && b.type === "carousel");
    if (own >= 0 && own <= done + 2) bl[done].left.push(...bl.splice(own, 1));
    for (const x of bl[done].left) if (x.type === "carousel") Object.assign(x, { autoplay: true, interval: 5 });
    continue;
  }
  const h = bl.findIndex((b) => b.type === "heading" && b.anchor === "ic325-ccp");
  if (h < 0) throw new Error("CCP heading missing in " + l);
  const btn = bl.findIndex((b, i) => i > h && b.type === "button");
  const photos = bl.findIndex((b, i) => i < h && b.type === "carousel");
  const oldPic = bl.findIndex((b, i) => i < h && b.type === "image" && /-ic325-ccp-3\.webp$/.test(b.src || ""));
  const right = bl.slice(h, btn);
  const columns = { type: "columns", ratio: "40-60", left: [{ type: "image", alt: ALT[l], src: `/assets/img/${NAME}.webp`, width: combo.width, height: combo.height }], right };
  if (photos >= 0) columns.left.push({ ...bl[photos], autoplay: true, interval: 5 }); // under the picture, left of the text, plays by itself
  const keepPhotos = [];
  const drop = new Set([oldPic, photos, ...Array.from({ length: btn - h }, (_, k) => h + k)]);
  const before = bl.filter((_, i) => i < h && !drop.has(i));
  const after = bl.filter((_, i) => i >= btn);
  j.i18n[l].blocks = [...before, columns, ...keepPhotos, ...after];
}
fs.writeFileSync(f, JSON.stringify(j, null, 2).replace(/\n/g, eol) + eol);
console.log("IC325 page restructured");
