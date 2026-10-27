#!/usr/bin/env node
// Product pages: the documents (brochure) come straight after the introduction, above the technical data, not below it.
// Moves a download button that sits after a datasheet to just before that datasheet (and before the heading that introduces it).
// Generated Häny pages are already built that way (tools/haeny-build-pages.mjs). Safe to run again.
//   node tools/docs-before-specs.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
function* files(dir) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) yield* files(p); else if (e.name.endsWith(".json")) yield p; } }
const isDoc = (b) => b && b.type === "button" && b.kind === "download";
let moved = 0, pages = 0;
for (const f of files(path.join(ROOT, "content/pages/produkter"))) {
  const raw = fs.readFileSync(f, "utf8"); const eol = raw.includes("\r\n") ? "\r\n" : "\n"; const page = JSON.parse(raw);
  let changed = false;
  for (const l of Object.keys(page.i18n || {})) {
    const bl = page.i18n[l].blocks || [];
    const d = bl.findIndex((b) => b.type === "datasheet");
    if (d < 0) continue;
    if (bl.slice(0, d).some(isDoc)) continue; // already above
    const run = []; // the download buttons after the datasheet, in order
    for (let i = d + 1; i < bl.length; i++) if (isDoc(bl[i])) run.push(i);
    if (!run.length) continue;
    const docs = run.map((i) => bl[i]);
    for (const i of run.slice().reverse()) bl.splice(i, 1);
    let at = d; if (bl[at - 1] && bl[at - 1].type === "heading") at--; // keep a heading with its datasheet
    bl.splice(at, 0, ...docs);
    changed = true; moved += docs.length;
  }
  if (changed) { pages++; fs.writeFileSync(f, JSON.stringify(page, null, 2).replace(/\n/g, eol) + eol); }
}
console.log(`documents moved above the technical data: ${moved} buttons on ${pages} pages`);
