// Compares every page of the ORIGINAL site (crawl/site-content.json) with the new content: which original paragraphs,
// headings and list items are not present (even loosely) in the new Swedish page?
import fs from "node:fs";
import path from "node:path";
const orig = JSON.parse(fs.readFileSync("crawl/full/downloads/site-clone-www.betongakuten.se/site-content.json", "utf8"));
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith(".json") ? [path.join(d, e.name)] : []));
const ours = new Map();
for (const f of walk("content/pages")) { const j = JSON.parse(fs.readFileSync(f, "utf8")); ours.set(j.path, j); }
const norm = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").toLowerCase().replace(/[^a-zåäöéèüøæ0-9% ]+/g, " ").replace(/\s+/g, " ").trim();
const strings = (o, out = []) => { if (typeof o === "string") out.push(o); else if (Array.isArray(o)) o.forEach((x) => strings(x, out)); else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) if (!["src", "href", "image", "type", "alt"].includes(k)) strings(v, out); return out; };
const only = process.argv[2];
let totalMissing = 0, pagesWith = 0;
for (const p of orig.pages) {
  const path_ = p.path === "/startsida" ? "/" : p.path;
  if (only && !path_.includes(only)) continue;
  const mine = ours.get(path_);
  if (!mine) { console.log("NO PAGE:", path_); continue; }
  const sv = mine.i18n && mine.i18n.sv;
  if (!sv) continue;
  const hay = norm(strings([sv.title, sv.h1, sv.description, sv.lead, sv.blocks]).join(" "));
  const hayWords = new Set(hay.split(" "));
  const miss = [];
  for (const b of p.blocks || []) {
    if (!["paragraph", "heading", "list"].includes(b.type)) continue;
    const parts = b.type === "list" ? (b.items || []).map((x) => (typeof x === "string" ? x : x.text || x.html)) : [b.text || b.html];
    for (const raw of parts) {
      const t = norm(raw);
      if (!t || t.length < 4) continue;
      if (/^betongakuten > /.test(String(raw).replace(/<[^>]+>/g, "").trim().toLowerCase())) continue;
      if (hay.includes(t)) continue;
      const words = t.split(" ").filter((w) => w.length > 2);
      const hit = words.filter((w) => hayWords.has(w)).length;
      if (words.length >= 3 && hit / words.length >= 0.85) continue; // loosely present (typo fixes, dash cleanup)
      miss.push((b.type === "heading" ? "[H] " : "") + String(raw).replace(/<[^>]+>/g, "").slice(0, 150));
    }
  }
  if (miss.length) { pagesWith++; totalMissing += miss.length; console.log("\n" + path_ + "  (" + miss.length + " missing)"); miss.forEach((m) => console.log("   - " + m)); }
}
console.log("\n" + totalMissing + " original text items not found, on " + pagesWith + " pages");
