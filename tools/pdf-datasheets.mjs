#!/usr/bin/env node
// Parses TEI-style product datasheet PDFs (pdftotext -layout) into structured data:
//   title, tagline, intro paragraphs, spec groups (label | US | metric).
// Output: crawl/datasheets.json  (reviewed/translated by hand, then merged into pages
// by tools/apply-datasheets.mjs). Needs poppler's `pdftotext` on PATH (authoring only).
//
//   node tools/pdf-datasheets.mjs [path/to/pages-filter-regex]
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const filter = process.argv[2] ? new RegExp(process.argv[2]) : /\/produkter\/tei\//;

function pages() {
  const out = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".json")) out.push(JSON.parse(fs.readFileSync(p, "utf8")));
    }
  })(path.join(ROOT, "content/pages"));
  return out;
}

const upper = (s) => s === s.toUpperCase() && /[A-Z]/.test(s);
const clean = (s) => s.replace(/\s+/g, " ").trim();
const UNITS = /^(?:[\d.,\- ]+\s*(?:lbf-?ft|lbf|lbs?|gpm|lpm|psi|bar|hp|kW|kN|Nm|rpm|bpm|Hz|kg|inches|in|ft|mm|m|M|N|lb|cc|%|V|A|deg|°)\b.*|Specify.*|\d[\d.,\- /]*|[A-Z0-9][\w\-/. ]*)$/i;

function parse(text) {
  const lines = text.split(/\r?\n/).map((l) => l.replace(/\f/g, "").replace(/\s+$/, ""));
  const nonEmpty = lines.filter((l) => l.trim());
  const title = clean(nonEmpty[0] || "");
  let tagline = "";
  const intro = [];
  const groups = [];
  const notes = [];
  // intro: paragraphs from the left column until the first spec header
  let i = 0;
  while (i < lines.length && !lines[i].trim()) i++;
  i++; // title
  while (i < lines.length && !lines[i].trim()) i++;
  if (i < lines.length && upper(clean(lines[i]))) { tagline = clean(lines[i]); i++; }
  let para = [];
  const flush = () => { if (para.length) { intro.push(clean(para.join(" ")).replace(/(\w)- (\w)/g, "$1$2")); para = []; } };
  for (; i < lines.length; i++) {
    const raw = lines[i];
    const l = raw.trim();
    if (/SPECIFICATIONS|^\s*U\.S\.\s+Metric/i.test(l)) break;
    if (/QUALITY POLICY|WWW\.TEI|Specifications subject/i.test(l)) break;
    if (!l) { flush(); continue; }
    // right-hand columns (diagrams/measurements) are separated by wide gaps
    const left = raw.split(/\s{4,}/)[0].trim();
    if (!left) continue;
    if (/^[\d.,\[\] ]+(in|mm)?$/.test(left)) continue;
    if (upper(left) && left.length > 4 && !/[a-z]/.test(left)) { flush(); if (left.length < 45) intro.push("§" + clean(left)); continue; }
    para.push(left);
  }
  flush();
  // spec section(s)
  let current = null;
  for (; i < lines.length; i++) {
    const l = lines[i];
    if (/QUALITY POLICY|WWW\.TEI|Specifications subject|TEI technical|CONTINUAL IMPROVEMENT/i.test(l)) { if (/TEI technical/i.test(l)) notes.push(clean(l)); continue; }
    const t = l.trim();
    if (!t) continue;
    const cells = t.split(/\s{2,}/).map(clean).filter(Boolean);
    const heads = cells.filter((c) => /SPECIFICATIONS$/i.test(c));
    if (heads.length) { current = heads.map((h) => ({ title: h.replace(/\s*SPECIFICATIONS$/i, ""), rows: [] })); groups.push(...current); continue; }
    if (/^U\.S\.|^Metric/i.test(t)) continue;
    if (/^SHANKS AVAILABLE/i.test(t)) { notes.push("Shanks available: " + (lines[i + 1] || "").trim().replace(/\s+/g, " ")); i++; continue; }
    // rows: LABEL  us  metric [LABEL2  us2  metric2]
    if (!current) continue;
    const triples = [];
    for (let k = 0; k < cells.length;) {
      if (/^[A-Z][A-Z0-9 /\-().]+$/.test(cells[k]) && !/^\d/.test(cells[k])) {
        const lab = cells[k], us = cells[k + 1], me = cells[k + 2];
        const isLab = (c) => c && /^[A-Z][A-Z0-9 /\-().]+$/.test(c) && !/\d/.test(c);
        if (us && isLab(us)) { triples.push({ label: lab }); k += 1; continue; }
        if (me && isLab(me)) { triples.push({ label: lab, us }); k += 2; continue; }
        triples.push({ label: lab, us, metric: me }); k += me ? 3 : 2;
      } else k++;
    }
    triples.forEach((r, idx) => {
      const g = current[Math.min(idx, current.length - 1)];
      if (r.us || r.metric) g.rows.push(r);
    });
  }
  return { title, tagline, intro: intro.filter((p) => !p.startsWith("§")), subtitle: intro.filter((p) => p.startsWith("§")).map((p) => p.slice(1)), groups: groups.filter((g) => g.rows.length), notes };
}

const result = {};
for (const p of pages()) {
  if (!filter.test(p.path)) continue;
  const doc = (p.i18n.sv.blocks.find((b) => b.type === "button" && /\.pdf$/.test(b.href)) || {}).href;
  if (!doc) continue;
  const file = path.join(ROOT, "assets-src/docs", path.basename(doc));
  if (!fs.existsSync(file)) continue;
  let text = "";
  try { text = execFileSync("pdftotext", ["-layout", "-f", "1", "-l", "2", file, "-"], { encoding: "utf8", maxBuffer: 1 << 24 }); } catch { continue; }
  result[p.path] = { doc, ...parse(text) };
}
fs.writeFileSync(path.join(ROOT, "crawl/datasheets.json"), JSON.stringify(result, null, 2));
for (const [p, d] of Object.entries(result)) {
  console.log(`\n## ${p}  [${d.title} | ${d.tagline}]  intro=${d.intro.length} (${d.intro.join(" ").split(" ").length}w) groups=${d.groups.map((g) => g.title + ":" + g.rows.length).join(", ")}`);
}
