// Which text is BOLD on the original site (font-weight >= 600 on the saved Google Sites HTML), and is it bold in the new version?
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
const base = "crawl/extracted/site/";
const orig = JSON.parse(fs.readFileSync("crawl/full/downloads/site-clone-www.betongakuten.se/site-content.json", "utf8"));
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith(".json") ? [path.join(d, e.name)] : []));
const ours = new Map();
for (const f of walk("content/pages")) { const j = JSON.parse(fs.readFileSync(f, "utf8")); ours.set(j.path, { j, f }); }
const norm = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").toLowerCase().replace(/[^a-zåäöéèüøæ0-9% ]+/g, " ").replace(/\s+/g, " ").trim();
const isBoldStyle = (st) => /font-weight:\s*(bold|[6-9]00)/i.test(st || "");
const only = process.argv[2];
const out = [];
for (const p of orig.pages) {
  const pth = p.path === "/startsida" ? "/" : p.path;
  if (only && !pth.includes(only)) continue;
  const file = path.join(base, p.cloneFile || "");
  if (!p.cloneFile || !fs.existsSync(file)) continue;
  const $ = cheerio.load(fs.readFileSync(file, "utf8"));
  const blockTexts = new Set((p.blocks || []).filter((b) => ["paragraph", "heading", "list"].includes(b.type)).flatMap((b) => (b.type === "list" ? (b.items || []).map((x) => norm(typeof x === "string" ? x : x.text)) : [norm(b.text)])));
  const seen = new Set();
  $("p").each((_, el) => {
    const $p = $(el);
    const full = $p.text().replace(/\s+/g, " ").trim();
    if (!full || full.length < 3) return;
    const nf = norm(full);
    if (!blockTexts.has(nf) || seen.has(nf)) return; // only the page's own content, once
    seen.add(nf);
    let bold = "", plain = "";
    $p.find("span").each((__, s) => { if ($(s).find("span").length || $(s).closest("a").length) return; const t = $(s).text(); if (isBoldStyle($(s).attr("style"))) bold += t; else plain += t; });
    bold = bold.replace(/\s+/g, " ").trim();
    if (!bold) return;
    const kind = bold.length >= full.length * 0.9 ? "WHOLE" : "PART";
    out.push({ path: pth, kind, bold, full, inList: $p.closest("li").length > 0 });
  });
}
const byPage = {};
for (const o of out) (byPage[o.path] = byPage[o.path] || []).push(o);
// ours: is the bold text bold there?
const nb = (h) => norm(h);
let missingBold = 0, report = [];
for (const [pth, items] of Object.entries(byPage)) {
  const mine = ours.get(pth);
  const sv = mine && mine.j.i18n && mine.j.i18n.sv;
  for (const it of items) {
    let status = "no page";
    if (sv) {
      const target = nb(it.kind === "WHOLE" ? it.full : it.bold);
      let found = null;
      const scan = (blocks) => { for (const b of blocks || []) {
        if (b.type === "heading" && nb(b.text).includes(nb(it.bold))) found = "heading";
        else if (b.type === "text" && nb(b.html).includes(target)) { const m = (b.html || "").match(/<(b|strong)>([^<]*)<\/(b|strong)>/g) || []; found = m.some((x) => nb(x).includes(nb(it.bold))) ? "bold" : "plain"; }
        else if (b.type === "list") { for (const x of b.items || []) if (nb(x).includes(target)) found = /<(b|strong)>/.test(x) ? "bold" : "plain"; }
        else if (b.type === "columns") { scan(b.left); scan(b.right); }
        else if (b.type === "modules" || b.type === "cards") { for (const x of b.items || []) { if (nb(x.title).includes(nb(it.bold))) found = "title"; } }
        else if (b.type === "datasheet") { if (nb(JSON.stringify(b)).includes(nb(it.bold))) found = "datasheet"; }
        else if (b.type === "table") { if (nb(JSON.stringify(b)).includes(nb(it.bold))) found = "table"; }
      } };
      scan(sv.blocks);
      status = found || "not found";
    }
    report.push({ ...it, status });
    if (status === "plain") missingBold++;
  }
}
const only2 = process.argv[3];
for (const r of report) if (!only2 || r.status === only2) console.log(r.path.padEnd(46), r.kind, r.status.padEnd(9), r.inList ? "li " : "p  ", JSON.stringify(r.kind === "WHOLE" ? r.full.slice(0, 90) : r.bold.slice(0, 50) + "  <in>  " + r.full.slice(0, 60)));
console.log("\n" + report.length + " bold passages in the original; plain in the new version:", missingBold);
