#!/usr/bin/env node
// Translation of a chosen part of the site into extra languages (Lithuanian, Latvian, Estonian, Russian).
// Only the brands in SCOPE and the global pages are translated; every other brand page is hidden in these
// languages with `hideIn` (so the visitor never lands on a Swedish page inside a Lithuanian shell).
//
//   node tools/i18n-scope.mjs collect   -> translations/scope/strings.json  [{ sv, en }]  (unique strings of the scope, in page order)
//   node tools/i18n-scope.mjs apply     -> reads translations/scope/chunk-*.json  ({ "<index>": [lt, lv, et, ru] })
//                                          writes i18n.<lang> into the pages of the scope and sets `hideIn` on the other brands
//   node tools/i18n-scope.mjs check     -> reports strings with no translation yet, and tag / link / placeholder differences
import fs from "node:fs";
import path from "node:path";
import { visit } from "../src/lib/translatable.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const LANGS = ["lt", "lv", "et", "ru"];
const DEF = "sv", REF = "en";
const BRANDS = ["haeny", "tei", "ahlm", "jean-lutz"];
const GLOBAL = ["index", "produkter", "om-oss", "kontakta-oss", "offert", "referenser"];
const DIR = path.join(ROOT, "translations/scope");

function* pageFiles(dir = path.join(ROOT, "content/pages")) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* pageFiles(p); else if (e.name.endsWith(".json")) yield p;
  }
}
const relOf = (f) => path.relative(path.join(ROOT, "content/pages"), f).split(path.sep).join("/");
const inScope = (rel) => GLOBAL.includes(rel.replace(/\.json$/, "")) || new RegExp(`^produkter/(${BRANDS.join("|")})(/|\\.json$)`).test(rel);
const isBrandRoot = (rel) => /^produkter\/[^/]+\.json$/.test(rel);
const load = () => [...pageFiles()].map((f) => ({ f, rel: relOf(f), page: JSON.parse(fs.readFileSync(f, "utf8")) }));
const save = (f, page, raw) => fs.writeFileSync(f, JSON.stringify(page, null, 2).replace(/\n/g, raw.includes("\r\n") ? "\r\n" : "\n") + (raw.includes("\r\n") ? "\r\n" : "\n"));

function collect() {
  const seen = new Map();
  for (const { rel, page } of load()) {
    if (!inScope(rel)) continue;
    const s = page.i18n && page.i18n[DEF];
    if (!s) continue;
    const ref = {};
    if (page.i18n[REF]) visitAll(page, JSON.parse(JSON.stringify(page.i18n[REF])), (id, v) => { ref[id] = v; });
    visitAll(page, JSON.parse(JSON.stringify(s)), (id, v) => { if (!seen.has(v)) seen.set(v, ref[id] || ""); });
  }
  // keep the order of an earlier run (the chunk files address strings by number); new strings go to the end
  const file = path.join(DIR, "strings.json");
  const old = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : [];
  const known = new Set(old.map((x) => x.sv));
  const list = [...old, ...[...seen].filter(([sv]) => !known.has(sv)).map(([sv, en]) => ({ sv, en }))];
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(path.join(DIR, "strings.json"), JSON.stringify(list, null, 1));
  console.log(`${list.length} unique strings -> translations/scope/strings.json`);
}

function readChunks() {
  const src = JSON.parse(fs.readFileSync(path.join(DIR, "strings.json"), "utf8"));
  const tr = new Map(); // sv -> { lang: text }
  for (const f of fs.readdirSync(DIR).filter((n) => /^chunk-.*\.json$/.test(n)).sort()) {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
    for (const [i, arr] of Object.entries(j)) {
      if (!src[+i]) { console.warn(`${f}: no string number ${i}`); continue; }
      tr.set(src[+i].sv, Object.fromEntries(LANGS.map((l, n) => [l, arr[n]])));
    }
  }
  return { src, tr };
}

// Fields the shared extractor (src/lib/translatable.mjs, used by the CMS) does not list: chart labels, picture callouts, the mast picker,
// the sub-menu of a page, captions. Same id scheme, so a field the shared extractor already knows is never visited twice.
const TEXT_KEYS = new Set(["hint", "title", "chipsLabel", "xName", "yName", "caption", "show", "hide", "sub", "fit", "none", "more", "metric", "us"]);
const SKIP_VALUE = /^(\/|https?:|#|mailto:|tel:)|\.(webp|png|jpe?g|pdf|svg|mp4)$/i;
const isText = (v, key) => typeof v === "string" && !SKIP_VALUE.test(v) && new RegExp(`[A-Za-zÅÄÖåäö]{${key === "metric" || key === "us" ? 4 : 3},}`).test(v.replace(/<[^>]+>/g, ""));
function visitExtra(page, t, cb, covered) {
  const P = page.path;
  let curType = ""; // type of the block that is being walked (the alt text of a map block is plain text of its own)
  const walk = (node, id, key, parentKey) => {
    if (typeof node === "string") {
      const ok = TEXT_KEYS.has(key) || (key === "name" && parentKey === "series") || (key === "text" && (parentKey === "callouts" || parentKey === "alt")) || (key === "html" && parentKey === "items") || (key === "alt" && curType === "map");
      if (ok && isText(node, key) && !covered.has(id)) cb(id, node, null);
      return;
    }
    if (Array.isArray(node)) { node.forEach((v, i) => walk(v, `${id}.${i}`, key, key)); return; }
    if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) {
      if (k === "type" || k === "src" || k === "href" || k === "image") continue;
      walk(v, `${id}.${k}`, k, key);
    }
  };
  const setter = (id, set) => (v) => set(v);
  void setter;
  (t.blocks || []).forEach((b, i) => walkBlock(b, `b${i}`));
  if (t.menu) walk(t.menu, "menu", "menu", "");
  function walkBlock(b, pre) {
    if (!b || typeof b !== "object") return;
    curType = b.type;
    if (b.type === "columns") { for (const side of ["left", "right"]) (b[side] || []).forEach((nb, j) => walkBlock(nb, `${pre}.${side}.${j}`)); return; }
    for (const [k, v] of Object.entries(b)) { if (k === "type" || k === "left" || k === "right" || k === "src" || k === "href") continue; walk(v, `${pre}.${k}`, k, ""); }
  }
}
// visit() + visitExtra() with a uniform callback cb(id, value, set); set writes into the language object by walking the same id
function visitAll(page, t, cb) {
  const covered = new Set();
  visit(page, t, (id, v, set) => { covered.add(id.slice(page.path.length + 1)); cb(id, v, set); });
  const P = page.path;
  const setById = (id, v) => {
    const parts = id.split(".");
    let node = parts[0] === "menu" ? t : t.blocks;
    const path = parts[0] === "menu" ? parts : [parts[0].slice(1), ...parts.slice(1)];
    for (let i = 0; i < path.length - 1; i++) node = node[path[i]];
    node[path[path.length - 1]] = v;
  };
  visitExtra(page, t, (id, v) => cb(`${P}|${id}`, v, (nv) => setById(id, nv)), covered);
}

const tagsOf = (h) => (String(h).match(/<\/?[a-z][^>]*>/gi) || []).map((t) => t.replace(/\s+/g, " ").replace(/>$/, "").toLowerCase());
const hrefsOf = (h) => (String(h).match(/href="[^"]*"/g) || []).sort().join("|");
const phOf = (h) => (String(h).match(/\{[a-z]+\}/g) || []).sort().join("|");
function problems(sv, tr) {
  const out = [];
  if (tagsOf(sv).map((t) => t.split(" ")[0]).join() !== tagsOf(tr).map((t) => t.split(" ")[0]).join()) out.push("tags differ");
  if (hrefsOf(sv) !== hrefsOf(tr)) out.push("links differ");
  if (phOf(sv) !== phOf(tr)) out.push("placeholders differ");
  return out;
}

// "Designed and built in ..." line of the brand pages (page.origin.more), in the new languages. A colon keeps the place name in its own form.
const ORIGIN_MORE = {
  haeny: ["Sukurta ir pagaminta: Jona", "Izstrādāts un ražots: Jona", "Disainitud ja ehitatud: Jona", "Разработано и изготовлено: Jona"],
  ahlm: ["Įkūrė broliai Stigas ir Gunderis Ahlmai, gaminama Skurupe, Skonėje", "Dibināja brāļi Stigs un Gunders Ahlmi, ražo Skurupā, Skonē", "Asutasid vennad Stig ja Gunder Ahlm, toodetud Skurupis, Skånes", "Основана братьями Стигом и Гундером Алм, производство в Скуруп, Сконе"],
  tei: ["Sukurta ir pagaminta: Montrose, Kolorado", "Izstrādāts un ražots: Montrose, Kolorādo", "Disainitud ja ehitatud: Montrose, Colorado", "Разработано и изготовлено: Монтроз, Колорадо"]
};

function apply() {
  const { src, tr } = readChunks();
  const bad = [];
  for (const { sv } of src) { const t = tr.get(sv); if (t) for (const l of LANGS) if (t[l]) { const p = problems(sv, t[l]); if (p.length) bad.push(`${l}: ${p.join(", ")}: ${sv.slice(0, 60)} => ${t[l].slice(0, 60)}`); } }
  if (bad.length) { console.error(bad.length + " problem(s):\n  " + bad.slice(0, 40).join("\n  ")); process.exit(1); }
  let pages = 0, applied = 0, kept = 0, hidden = 0;
  for (const { f, rel, page } of load()) {
    const raw = fs.readFileSync(f, "utf8");
    const s = page.i18n && page.i18n[DEF];
    if (inScope(rel)) {
      if (!s) continue;
      for (const l of LANGS) {
        const t = JSON.parse(JSON.stringify(s));
        visitAll(page, t, (id, v, set) => { const x = tr.get(v); if (x && x[l] && String(x[l]).trim()) { set(String(x[l]).trim()); applied++; } else kept++; });
        t.published = s.published === false ? false : true;
        page.i18n[l] = t;
      }
      const slug = rel.replace(/.json$/, "").split("/")[1];
      if (isBrandRoot(rel) && ORIGIN_MORE[slug] && page.origin && page.origin.more) LANGS.forEach((l, n) => { page.origin.more[l] = ORIGIN_MORE[slug][n]; });
      pages++;
      save(f, page, raw);
    } else if (isBrandRoot(rel)) {
      const cur = new Set(page.hideIn || []);
      const before = cur.size;
      for (const l of LANGS) cur.add(l);
      if (cur.size !== before) { page.hideIn = [...cur]; hidden++; save(f, page, raw); }
    }
  }
  console.log(`applied: ${applied} strings, ${kept} left as in ${DEF} (names, numbers), ${pages} pages written, ${hidden} other brands hidden in ${LANGS.join(", ")}`);
}

function check() {
  const { src, tr } = readChunks();
  const missing = src.map((x, i) => [x, i]).filter(([x]) => !tr.has(x.sv) && /[A-Za-zÅÄÖåäö]{3,}/.test(x.sv.replace(/<[^>]+>/g, "")));
  console.log(`${src.length} strings, ${tr.size} translated, ${missing.length} with letters still missing`);
  missing.slice(0, 15).forEach(([x, i]) => console.log(`  ${i}: ${x.sv.slice(0, 80)}`));
}

const cmd = process.argv[2];
if (cmd === "collect") collect(); else if (cmd === "apply") apply(); else if (cmd === "check") check();
else console.log("usage: node tools/i18n-scope.mjs collect | apply | check");
