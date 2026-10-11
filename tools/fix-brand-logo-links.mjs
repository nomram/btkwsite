#!/usr/bin/env node
// Some crawled product pages carry the brand logo as an unlinked first image, so it was shown as a
// big picture instead of the small logo in the corner. Link those logo blocks to their brand page
// (all languages); the renderer then moves them into the breadcrumb row.
//   node tools/fix-brand-logo-links.mjs [--dry]
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const dry = process.argv.includes("--dry");
// image file -> brand page it is the logo of; only pages BELOW the brand are touched
const LOGOS = {
  "ahlm-st-1-1.webp": "/produkter/ahlm",
  "haeny-automatiska-pumpar-1.webp": "/produkter/haeny"
};
let changed = 0;
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!e.name.endsWith(".json")) continue;
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    let touched = false;
    for (const t of Object.values(j.i18n || {})) {
      (t.blocks || []).slice(0, 2).forEach((b) => {
        const brand = b.type === "image" && LOGOS[path.basename(b.src || "")];
        if (!brand || b.href || !j.path.startsWith(brand + "/")) return;
        b.href = brand; touched = true;
      });
    }
    if (touched) { changed++; console.log((dry ? "would fix " : "fixed     ") + j.path); if (!dry) fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n"); }
  }
})(path.join(ROOT, "content/pages"));
console.log(`${changed} page(s) ${dry ? "need" : "updated"}`);
