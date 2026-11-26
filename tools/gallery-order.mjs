#!/usr/bin/env node
// Product pages: a photo gallery (carousel) goes after the documents (PDFs) and the technical data,
// unless it is the main picture at the top (nothing but pictures, 3D or logo before it).
//   node tools/gallery-order.mjs          (all product pages, all languages)
// The page generators (tools/marini-*.mjs, tools/ramboard-build.mjs) put galleries earlier, so run this after them.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "content/pages/produkter");
const MEDIA = new Set(["image", "model3d", "carousel"]);

const isDoc = (b) => b && (b.type === "datasheet" || (b.type === "button" && b.kind === "download"));

// returns true when the order changed
export function galleryAfterDocs(blocks) {
  if (!Array.isArray(blocks)) return false;
  let e = -1;
  blocks.forEach((b, i) => { if (isDoc(b)) e = i; });
  if (e < 0) return false;
  // the last document or data sheet, then any buttons and spec tables (with their heading) right after it
  for (;;) {
    const n = blocks[e + 1];
    if (n && (n.type === "button" || n.type === "table")) { e++; continue; }
    if (n && n.type === "heading" && (n.level || 2) >= 3 && blocks[e + 2] && blocks[e + 2].type === "table") { e += 2; continue; }
    break;
  }
  // a carousel is the main picture only when nothing but the maker's logo (a linked picture) comes before it
  const move = [];
  for (let i = 0; i < e; i++) {
    if (blocks[i].type !== "carousel") continue;
    const main = blocks.slice(0, i).every((b) => b.type === "image" && (b.href || /logo/i.test((b.src || "") + " " + (b.alt || ""))));
    if (!main) move.push(i);
  }
  if (!move.length) return false;
  const picked = move.map((i) => blocks[i]);
  const at = e + 1 - move.length; // index after the run once the galleries are taken out
  for (let k = move.length - 1; k >= 0; k--) blocks.splice(move[k], 1);
  blocks.splice(at, 0, ...picked);
  return true;
}

function walk(d, out = []) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p, out); else if (f.endsWith(".json")) out.push(p);
  }
  return out;
}

export function run() {
  let n = 0;
  for (const f of walk(DIR)) {
    const raw = fs.readFileSync(f, "utf8"), p = JSON.parse(raw);
    let changed = false;
    for (const t of Object.values(p.i18n || {})) if (galleryAfterDocs(t.blocks)) changed = true;
    if (!changed) continue;
    const eol = raw.includes("\r\n") ? "\r\n" : "\n";
    fs.writeFileSync(f, JSON.stringify(p, null, 2).replace(/\n/g, eol) + (/\r?\n$/.test(raw) ? eol : ""));
    n++;
    console.log("gallery moved:", path.relative(DIR, f));
  }
  console.log(n, "pages changed");
}
if ((process.argv[1] || "").split(String.fromCharCode(92)).join("/").endsWith("tools/gallery-order.mjs")) run();
