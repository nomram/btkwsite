#!/usr/bin/env node
// Converts the extension's crawl output into the site's content model:
//   content/pages/**.json   one file per page (all languages inside)
//   content/site.json       global settings
//   assets-src/img/*.webp   optimised masters (build creates the srcset variants)
//   assets-src/docs/*.pdf   brochures renamed from their Drive ids
//
// Usage: node tools/import-crawl.mjs          (re-runnable; overwrites generated files)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import * as cheerio from "cheerio";

const ROOT = path.resolve(import.meta.dirname, "..");
const CRAWL = path.join(ROOT, "crawl/full/downloads/site-clone-www.betongakuten.se");
const EXTR = path.join(ROOT, "crawl/extracted/site");
const OUT_PAGES = path.join(ROOT, "content/pages");
const OUT_IMG = path.join(ROOT, "assets-src/img");
const OUT_DOC = path.join(ROOT, "assets-src/docs");
const MASTER_MAX_W = 1920;

// One-time migration: the CMS owns content/ afterwards. Re-running would wipe manual edits.
const MARKER = path.join(ROOT, "content/.imported");
if (fs.existsSync(MARKER) && !process.argv.includes("--force")) {
  console.error("content/ was already imported and may contain edits made in the CMS.\nRe-run with --force to overwrite everything from the crawl.");
  process.exit(1);
}
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const content = readJson(path.join(CRAWL, "site-content.json"));
const navTree = readJson(path.join(CRAWL, "nav-tree.json"));
const customEmbeds = readJson(path.join(ROOT, "crawl/custom-embeds.json"));
const sheetInner = readJson(path.join(ROOT, "crawl/sheets.json")); // embed url -> inner sheet url
const driveFiles = readJson(path.join(EXTR, "drive-files.json")); // [{driveId, localFile, ...}]

const warnings = [];
const warn = (m) => { warnings.push(m); console.warn("WARN", m); };

// ---------- helpers ----------
const translit = (s) => String(s).normalize("NFKD").replace(/ß/g, "ss").replace(/[̀-ͯ]/g, "").replace(/[øØ]/g, "o").replace(/[æÆ]/g, "ae");
const slug = (s) => translit(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const HOST_RE = /^(www\.)?betongakuten\.se$/i;
function internalPath(href) {
  if (!href) return null;
  try {
    const u = new URL(href, "https://www.betongakuten.se/");
    if (!HOST_RE.test(u.hostname)) return null;
    let p = decodeURIComponent(u.pathname).normalize("NFC").replace(/\/+$/, "") || "/";
    if (p === "/startsida") p = "/";
    return p;
  } catch { return null; }
}
const pageSlug = (p) => (p === "/" ? "start" : slug(p.replace(/^\/produkter\/?/, "") || "produkter"));
const stripTags = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const sha1 = (buf) => crypto.createHash("sha1").update(buf).digest("hex");
function rewriteInternalLinks(html) {
  return String(html || "").replace(/href="([^"]+)"/g, (m, h) => {
    const p = internalPath(h.replace(/&amp;/g, "&"));
    return p ? `href="${encodeURI(p)}"` : m;
  });
}

// ---------- page inventory ----------
const pages = content.pages.filter((p) => !p.isAliasOf).map((p) => ({ ...p, path: p.path === "/startsida" ? "/" : p.path }));
const byPath = new Map(pages.map((p) => [p.path, p]));
const known = new Set(byPath.keys());
console.log("pages:", pages.length);

// sibling order from the nav tree
const order = new Map();
(function walk(n) {
  n.children.forEach((c, i) => { order.set(c.path === "/startsida" ? "/" : c.path, i); walk(c); });
})(navTree);

// ---------- images ----------
fs.rmSync(OUT_IMG, { recursive: true, force: true });
fs.rmSync(OUT_DOC, { recursive: true, force: true });
fs.mkdirSync(OUT_IMG, { recursive: true });
fs.mkdirSync(OUT_DOC, { recursive: true });

const imgByHash = new Map(); // sha1 -> {name, file, ext, w, h}
const usedNames = new Set();
const imgNameCounter = new Map();
const imgOfSource = new Map(); // crawl localFile -> record (cache)

function uniqueName(base) {
  let n = base || "bild";
  let i = 2;
  while (usedNames.has(n)) n = `${base}-${i++}`;
  usedNames.add(n);
  return n;
}

async function ingestImage(localFile, nameBase) {
  if (!localFile) return null;
  if (imgOfSource.has(localFile)) return imgOfSource.get(localFile);
  const abs = path.join(EXTR, localFile);
  if (!fs.existsSync(abs)) { warn("missing image file " + localFile); return null; }
  const buf = fs.readFileSync(abs);
  const h = sha1(buf);
  if (imgByHash.has(h)) { imgOfSource.set(localFile, imgByHash.get(h)); return imgByHash.get(h); }
  const name = uniqueName(nameBase);
  let rec;
  try {
    const meta = await sharp(buf, { animated: false }).metadata();
    const fmt = meta.format;
    if (fmt === "svg") {
      fs.writeFileSync(path.join(OUT_IMG, name + ".svg"), buf);
      rec = { name, ext: "svg", w: meta.width || 0, h: meta.height || 0 };
    } else if (fmt === "gif") {
      fs.writeFileSync(path.join(OUT_IMG, name + ".gif"), buf);
      rec = { name, ext: "gif", w: meta.width, h: meta.height };
    } else {
      const out = await sharp(buf).rotate().resize({ width: MASTER_MAX_W, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toBuffer({ resolveWithObject: true });
      fs.writeFileSync(path.join(OUT_IMG, name + ".webp"), out.data);
      rec = { name, ext: "webp", w: out.info.width, h: out.info.height };
    }
  } catch (e) {
    warn(`image ${localFile} could not be processed: ${e.message}`);
    usedNames.delete(name);
    return null;
  }
  imgByHash.set(h, rec);
  imgOfSource.set(localFile, rec);
  return rec;
}

// ---------- documents ----------
const driveLocal = new Map(); // driveId -> crawl local file (relative to EXTR, e.g. assets/docs/x.pdf)
for (const d of driveFiles) if (d.localFile && d.downloadOk) driveLocal.set(d.driveId, d.localFile.replace(/^site\//, ""));
const docByDrive = new Map(); // driveId -> public path
const docByHash = new Map();
const usedDocNames = new Set();
function ingestDoc(driveId, localFile, label, pagePath) {
  if (driveId && docByDrive.has(driveId)) return docByDrive.get(driveId);
  const lf = localFile || (driveId && driveLocal.get(driveId));
  if (!lf) return null;
  const abs = path.join(EXTR, lf);
  if (!fs.existsSync(abs)) return null;
  const buf = fs.readFileSync(abs);
  const h = sha1(buf);
  if (docByHash.has(h)) { if (driveId) docByDrive.set(driveId, docByHash.get(h)); return docByHash.get(h); }
  const ext = (path.extname(lf) || ".pdf").toLowerCase();
  let base = slug(`${pageSlug(pagePath)}-${label || "dokument"}`).slice(0, 80) || "dokument";
  let n = base, i = 2;
  while (usedDocNames.has(n)) n = `${base}-${i++}`;
  usedDocNames.add(n);
  fs.writeFileSync(path.join(OUT_DOC, n + ext), buf);
  const pub = `/assets/docs/${n}${ext}`;
  docByHash.set(h, pub);
  if (driveId) docByDrive.set(driveId, pub);
  return pub;
}

// ---------- sheets -> tables ----------
const sheetCache = new Map();
async function sheetTable(embedUrl) {
  if (sheetCache.has(embedUrl)) return sheetCache.get(embedUrl);
  const inner = sheetInner[embedUrl];
  let table = null;
  if (inner) {
    try {
      const html = await (await fetch(inner)).text();
      const $ = cheerio.load(html);
      const rows = [];
      $("table tr").each((_, tr) => {
        const cells = [];
        $(tr).children("td,th").each((__, c) => {
          const $c = $(c);
          if ($c.hasClass("row-headers-background") || $c.hasClass("freezebar-cell")) return;
          $c.find("br").replaceWith(" ");
          const t = $c.text().replace(/\s+/g, " ").trim();
          const span = parseInt($c.attr("colspan") || "1", 10) || 1;
          cells.push(t);
          for (let k = 1; k < span; k++) cells.push("");
        });
        rows.push(cells);
      });
      let r = rows.filter((cells) => cells.some((c) => c));
      const width = Math.max(0, ...r.map((x) => x.length));
      const keep = [];
      for (let col = 0; col < width; col++) if (r.some((x) => x[col])) keep.push(col);
      r = r.map((x) => keep.map((col) => x[col] || ""));
      if (r.length >= 2 && keep.length >= 2) table = { type: "table", header: true, rows: r };
    } catch (e) { warn("sheet fetch failed " + embedUrl + ": " + e.message); }
  }
  sheetCache.set(embedUrl, table);
  return table;
}

// ---------- block conversion ----------
function ytParse(src) {
  try {
    const u = new URL(src);
    const m = u.pathname.match(/\/embed\/([\w-]{6,})/);
    if (!m) return null;
    const start = parseInt(u.searchParams.get("start") || "0", 10) || 0;
    return { id: m[1], start };
  } catch { return null; }
}

const imgJobs = []; // collected during conversion, resolved later (names depend on all usage)

async function convertPage(p) {
  let b = p.blocks.map((x) => ({ ...x }));
  const out = { hero: null, blocks: [], title: p.title, h1: "" };
  const pPath = p.path;

  // 1. noise
  b = b.filter((x) => !(x.type === "paragraph" && /^Betongakuten\s*>/.test(x.text || "")));
  b = b.filter((x) => !(x.type === "image" && x.href && /(facebook|instagram|linkedin)\.com/i.test(x.href)));
  b = b.filter((x) => !(x.type === "image" && x.width && x.width < 40));

  // 2. hero
  let heroTitle = "";
  if (b[0] && b[0].type === "image" && b[0].role === "background") {
    out.hero = { imageFile: b[0].localFile || null };
    b.shift();
    if (b[0] && b[0].type === "heading") { heroTitle = b[0].text; b.shift(); }
  } else if (b[0] && b[0].type === "heading" && b[0].level === 1) {
    heroTitle = b[0].text; b.shift();
  }
  out.h1 = heroTitle || p.seo?.h1 || p.title;
  b = b.filter((x) => !(x.type === "heading" && x.text === out.h1));
  // empty background hero (home had a different shape): keep title only
  if (out.hero && !out.hero.imageFile) out.hero = null;

  // 3. cards
  const used = new Set();
  const cards = new Map(); // first index -> [cardObjs]
  const isPara = (x) => x && x.type === "paragraph" && (x.text || "").trim().length > 0;
  const internalKnown = (h) => { const q = internalPath(h); return q && known.has(q) ? q : null; };
  const scan = (from, step, max, pred) => {
    for (let k = 0, i = from; k < max && i >= 0 && i < b.length; k++, i += step) if (!used.has(i) && pred(b[i], i)) return i;
    return -1;
  };
  const titleLike = (x) => isPara(x) && x.text.length <= 60 && !/[.!?]$/.test(x.text.trim());

  b.forEach((blk, i) => {
    if (blk.type !== "button" || !/^läs mer/i.test(blk.text || "")) return;
    const target = internalKnown(blk.href);
    if (!target) return;
    const card = { href: target, label: "Läs mer" };
    const idxs = [i];
    let ii = scan(i - 1, -1, 3, (x) => x.type === "image");
    if (ii < 0) ii = scan(i + 1, 1, 2, (x) => x.type === "image");
    if (ii >= 0) { card.imageFile = b[ii].localFile; card.alt = b[ii].alt; idxs.push(ii); }
    const ti = ii >= 0 ? scan(ii - 1, -1, 1, titleLike) : scan(i - 1, -1, 1, titleLike);
    if (ti >= 0) { card.title = b[ti].text.trim(); idxs.push(ti); }
    // description: between image and button, else right after the button
    let di = -1;
    if (ii >= 0 && ii < i) di = scan(ii + 1, 1, Math.max(0, i - ii - 1), (x) => isPara(x) && x.text.length > 20);
    if (di < 0) di = scan(i + 1, 1, 2, (x) => isPara(x) && x.text.length > 20 && !(titleLike(x) && b[idxs.length] && false));
    if (di >= 0) { card.html = b[di].html || b[di].text; card.text = b[di].text; idxs.push(di); }
    idxs.forEach((k) => used.add(k));
    const first = Math.min(...idxs);
    if (!cards.has(first)) cards.set(first, []);
    cards.get(first).push(card);
  });
  // listing pattern: linked image followed by its description
  const linkedImgs = b.map((x, i) => (x.type === "image" && internalKnown(x.href) && !used.has(i) ? i : -1)).filter((i) => i >= 0);
  const listingPairs = linkedImgs.filter((i) => isPara(b[i + 1]) && !used.has(i + 1) && b[i + 1].text.length > 20);
  if (listingPairs.length >= 2) {
    for (const i of listingPairs) {
      const target = internalKnown(b[i].href);
      used.add(i); used.add(i + 1);
      if (!cards.has(i)) cards.set(i, []);
      cards.get(i).push({ href: target, label: "Läs mer", imageFile: b[i].localFile, alt: b[i].alt, html: b[i + 1].html || b[i + 1].text, text: b[i + 1].text });
    }
  }

  // 4. emit
  const emitted = [];
  const customQueue = [...(customEmbeds[pPath] || [])];
  let imgCount = 0;
  for (let i = 0; i < b.length; i++) {
    if (cards.has(i)) {
      const prev = emitted[emitted.length - 1];
      if (prev && prev.type === "cards") prev.items.push(...cards.get(i));
      else emitted.push({ type: "cards", items: [...cards.get(i)] });
    }
    if (used.has(i)) continue;
    const x = b[i];
    if (x.type === "heading") {
      const level = x.level <= 3 ? 2 : 3;
      emitted.push({ type: "heading", level, text: x.text });
    } else if (x.type === "paragraph") {
      const html = rewriteInternalLinks(x.html || x.text);
      const text = (x.text || "").trim();
      if (!text || text === " ") continue;
      const next = b[i + 1];
      const promote = text.length <= 40 && !/[.!?:]$/.test(text) && !/<a /.test(html) && next && (next.type === "list" || next.type === "embed" && /spreadsheets/.test(next.src) || next.type === "table");
      emitted.push(promote ? { type: "heading", level: 2, text } : { type: "text", html });
    } else if (x.type === "list") {
      emitted.push({ type: "list", ordered: !!x.ordered, items: x.items.map((it) => rewriteInternalLinks(it.html || it.text)) });
    } else if (x.type === "image") {
      imgCount++;
      emitted.push({ type: "image", _file: x.localFile, alt: (x.alt || "").trim(), href: internalKnown(x.href) || (x.href && !internalPath(x.href) ? x.href : undefined), width: x.width, height: x.height, _n: imgCount });
    } else if (x.type === "button") {
      const internal = internalPath(x.href);
      if (x.driveId || /\.pdf(\?|$)/i.test(x.href || "")) {
        const pub = ingestDoc(x.driveId, x.localFile && x.localFile.replace(/^site\//, ""), x.text, pPath);
        if (pub) emitted.push({ type: "button", kind: "download", text: x.text, href: pub, driveId: x.driveId });
        else if (x.driveId) emitted.push({ type: "button", kind: "download", text: x.text, href: `https://drive.google.com/file/d/${x.driveId}/view`, external: true, driveId: x.driveId });
        else emitted.push({ type: "button", kind: "link", text: x.text, href: x.href, external: true });
      } else if (internal !== null) {
        emitted.push({ type: "button", kind: "link", text: x.text, href: internal });
      } else {
        emitted.push({ type: "button", kind: "link", text: x.text, href: x.href, external: true });
      }
    } else if (x.type === "embed") {
      const src = x.src;
      if (/youtube\.com\/embed|youtube-nocookie\.com\/embed/.test(src)) {
        const y = ytParse(src);
        if (y) emitted.push({ type: "video", provider: "youtube", id: y.id, start: y.start || undefined, title: (x.title || "").trim() });
      } else if (/docs\.google\.com\/spreadsheets/.test(src)) {
        const t = await sheetTable(src);
        if (t) emitted.push(t); else warn(`sheet table lost on ${pPath}`);
      } else if (/gstatic\.com\/atari\/embeds/.test(src)) {
        const real = customQueue.shift();
        if (!real) { warn(`custom embed unresolved on ${pPath}`); continue; }
        const y = ytParse(real);
        if (y) emitted.push({ type: "video", provider: "youtube", id: y.id, start: y.start || undefined, title: "" });
        else {
          const m = real.match(/drive\.google\.com\/file\/d\/([^/]+)/);
          if (m) {
            const pub = ingestDoc(m[1], null, "produktblad", pPath);
            emitted.push(pub
              ? { type: "button", kind: "download", text: "Produktblad (PDF)", href: pub, driveId: m[1] }
              : { type: "button", kind: "download", text: "Produktblad (PDF)", href: `https://drive.google.com/file/d/${m[1]}/view`, external: true, driveId: m[1] });
          } else warn(`custom embed unknown on ${pPath}: ${real}`);
        }
      } else {
        warn(`unhandled embed on ${pPath}: ${src.slice(0, 80)}`);
      }
    }
  }
  out.blocks = emitted;
  return out;
}

// ---------- main ----------
const HOME_HERO = "/assets/img/haeny-hero.webp";
const PRETTY_H1 = { "/produkter/terra-infrastructure": "Terra Infrastructure" };
const converted = new Map();
for (const p of pages) converted.set(p.path, await convertPage(p));

// Known authoring mistakes on the live site, corrected on import (reported at the end).
const CARD_FIXES = [
  // "Robust utrustning för sprutbetong, betongpumpar…" is Reed, but the card links to Kraft Tool.
  { on: ["/", "/produkter"], match: /sprutbetong.*betongpumpar|betongpumpar.*gunite/i, from: "/produkter/kraft-tool", to: "/produkter/reed" }
];
const fixesApplied = [];
for (const fx of CARD_FIXES) {
  for (const pp of fx.on) {
    const c = converted.get(pp);
    if (!c) continue;
    for (const b of c.blocks) if (b.type === "cards") for (const it of b.items) {
      if (it.href === fx.from && fx.match.test(it.text || "")) { it.href = fx.to; fixesApplied.push(`${pp}: card ${fx.from} -> ${fx.to}`); }
    }
  }
}

// Tidy: video caption before video, collapse identical consecutive download buttons.
function tidy(blocks) {
  const o = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i], n = blocks[i + 1];
    if (b.type === "video" && n && n.type === "heading" && b.title && b.title.toLowerCase().includes(n.text.toLowerCase())) {
      o.push(n, b); i++; continue;
    }
    const prev = o[o.length - 1];
    if (b.type === "button" && prev && prev.type === "button" && prev.href === b.href) { o[o.length - 1] = b; continue; }
    o.push(b);
  }
  return o;
}
for (const c of converted.values()) c.blocks = tidy(c.blocks);

// image naming pass 1: images that link to an internal page get that page's slug
const claim = (rec, nameBase) => rec; // placeholder to keep intent readable
for (const p of pages) {
  const c = converted.get(p.path);
  for (const blk of [...c.blocks, ...c.blocks.flatMap((x) => (x.type === "cards" ? x.items : []))]) {
    const f = blk._file || blk.imageFile;
    if (!f) continue;
    const href = blk.href;
    if (href && href.startsWith("/") && known.has(href)) {
      const rec = await ingestImage(f, pageSlug(href));
      if (rec) blk._rec = rec;
    }
  }
}
// pass 2: everything else
for (const p of pages) {
  const c = converted.get(p.path);
  const base = pageSlug(p.path);
  if (p.path === "/" && c.hero) {
    // The live home hero is a 550x144 animated GIF stretched full width (4 MB, blurry).
    // Use a sharp photo from the site instead; editable in the CMS.
    c.hero.image = HOME_HERO;
  } else if (c.hero && c.hero.imageFile) {
    const rec = await ingestImage(c.hero.imageFile, `${base}-hero`);
    c.hero.image = rec ? `/assets/img/${rec.name}.${rec.ext}` : null;
    c.hero.w = rec && rec.w; c.hero.h = rec && rec.h;
  }
  for (const blk of c.blocks) {
    if (blk.type === "image") {
      let rec = blk._rec || (await ingestImage(blk._file, `${base}-${blk._n}`));
      if (rec) {
        blk.src = `/assets/img/${rec.name}.${rec.ext}`;
        blk.width = rec.w; blk.height = rec.h;
      } else { blk._drop = true; }
      delete blk._file; delete blk._rec; delete blk._n;
    }
    if (blk.type === "cards") {
      for (const it of blk.items) {
        const rec = it._rec || (await ingestImage(it.imageFile, `${pageSlug(it.href)}`));
        if (rec) { it.image = `/assets/img/${rec.name}.${rec.ext}`; it.width = rec.w; it.height = rec.h; }
        delete it.imageFile; delete it._rec;
        if (!it.title) delete it.title;
        if (!it.alt) delete it.alt;
      }
    }
  }
  c.blocks = c.blocks.filter((x) => !x._drop);
}

// ---------- orphans: pages that no listing links to ----------
function linkedSet() {
  const linked = new Set(["/"]);
  for (const p of pages) {
    for (const b of converted.get(p.path).blocks) {
      if (b.type === "cards") b.items.forEach((i) => linked.add(i.href));
      if ((b.type === "button" || b.type === "image") && b.href && b.href.startsWith("/")) linked.add(b.href);
      for (const m of String(b.html || "").matchAll(/href="([^"]+)"/g)) { try { linked.add(decodeURIComponent(m[1])); } catch { /* ignore */ } }
    }
  }
  return linked;
}
const addedCards = [];
{
  const linked = linkedSet();
  for (const p of pages) {
    if (linked.has(p.path) || p.path === "/om-oss" || p.path === "/kontakta-oss") continue;
    const parentPath = p.path.split("/").slice(0, -1).join("/") || "/";
    const parent = converted.get(parentPath);
    if (!parent) continue;
    const me = converted.get(p.path);
    const img = me.blocks.find((x) => x.type === "image" && x.src) || null;
    const heroSrc = me.hero && me.hero.image;
    const card = { href: p.path, label: "Läs mer", image: (img && img.src) || heroSrc || undefined, width: img && img.width, height: img && img.height, text: descriptionFrom(me.blocks, ""), html: undefined };
    if (!card.image) delete card.image;
    if (!card.width) { delete card.width; delete card.height; }
    delete card.html;
    let cb = parent.blocks.filter((x) => x.type === "cards").pop();
    if (!cb) { cb = { type: "cards", items: [] }; parent.blocks.push(cb); }
    cb.items.push(card);
    addedCards.push(`${p.path} -> listed on ${parentPath}`);
  }
}

// ---------- write pages ----------
// keep pages that were authored in the CMS / by hand (not part of the crawl)
const keptPages = [];
(function scan(d) {
  if (!fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) scan(f);
    else if (e.name.endsWith(".json")) {
      try { const j = JSON.parse(fs.readFileSync(f, "utf8")); if (j.path && !known.has(j.path)) keptPages.push({ f, txt: fs.readFileSync(f, "utf8") }); } catch { /* ignore */ }
    }
  }
})(OUT_PAGES);
fs.rmSync(OUT_PAGES, { recursive: true, force: true });
for (const k of keptPages) { fs.mkdirSync(path.dirname(k.f), { recursive: true }); fs.writeFileSync(k.f, k.txt); }
const fileFor = (p) => path.join(OUT_PAGES, (p === "/" ? "index" : p.slice(1).split("/").map(slug).join("/")) + ".json");

function descriptionFrom(blocks, fallback, h1 = "", brand = "") {
  const trim = (t) => {
    if (t.length <= 158) return t;
    const cut = t.slice(0, 156);
    return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:s-]+$/, "") + "…";
  };
  for (const b of blocks) {
    if (b.type !== "text") continue;
    const t = stripTags(b.html);
    if (t.length < 60 || /^kontakta oss/i.test(t)) continue;
    return trim(t);
  }
  // spec-only pages: build a description from the heading, the first facts and the brand
  const bits = [];
  for (const b of blocks) {
    if (b.type === "text") { const t = stripTags(b.html); if (t && !/^kontakta oss/i.test(t)) bits.push(t.replace(/[.!]+$/, "")); }
    if (b.type === "list") bits.push(...b.items.map((i) => stripTags(i).replace(/[.!]+$/, "")));
    if (bits.join("; ").length > 110) break;
  }
  let d = [h1, bits.join("; ")].filter(Boolean).join(" – ");
  if (brand && d.length < 120) d += `. Från ${brand} hos Betongakuten.`;
  else if (d.length < 70) d += ". Betongakuten – leverantör och konsult inom byggindustrin.";
  return d ? trim(d) : fallback;
}

const kids = new Map();
for (const p of pages) {
  const parent = p.path === "/" ? null : p.path.split("/").slice(0, -1).join("/") || "/";
  if (parent !== null) kids.set(parent, (kids.get(parent) || 0) + 1);
}

let written = 0;
const report = { pages: [], orphans: [] };
for (const p of pages) {
  const c = converted.get(p.path);
  const depth = p.path === "/" ? 0 : p.path.split("/").length - 1;
  const template = p.path === "/" ? "home" : p.path === "/kontakta-oss" ? "contact" : p.path === "/produkter" ? "listing" : depth === 2 ? "brand" : depth >= 3 ? "product" : "page";
  let blocks = c.blocks;
  if (template === "contact") {
    // replace the loose paragraphs by a contact block rendered from site.json
    const intro = blocks.find((b) => b.type === "text" && b.html.length > 40);
    blocks = [...(intro ? [intro] : []), { type: "contact" }];
  }
  let h1 = c.h1;
  if (PRETTY_H1[p.path]) h1 = PRETTY_H1[p.path];
  else if (h1 === h1.toLowerCase() && p.title && p.title !== p.title.toLowerCase() && p.title.toLowerCase().replace(/s+/g, "-") === h1) h1 = p.title;
  const page = {
    path: p.path,
    updated: (content.site.crawledAt || new Date().toISOString()).slice(0, 10),
    template,
    order: order.has(p.path) ? order.get(p.path) : 100,
    published: true,
    ...(c.hero && c.hero.image ? { hero: { image: c.hero.image } } : {}),
    i18n: {
      sv: {
        title: p.title || h1,
        h1,
        description: descriptionFrom(blocks, "", h1, (() => { const sg = p.path.split("/").filter(Boolean); if (sg.length < 3) return ""; const bp = "/" + sg.slice(0, 2).join("/"); const bc = converted.get(bp); return bc ? (PRETTY_H1[bp] || bc.h1) : ""; })()),
        blocks
      }
    },
    source: { url: p.url }
  };
  const f = fileFor(p.path);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(page, null, 2) + "\n");
  written++;
  report.pages.push({ path: p.path, template, blocks: blocks.length, cards: blocks.filter((b) => b.type === "cards").reduce((n, b) => n + b.items.length, 0), hasHero: !!page.hero, descLen: page.i18n.sv.description.length });
}

const linkedFinal = linkedSet();
for (const p of pages) if (!linkedFinal.has(p.path)) report.orphans.push(p.path);
report.fixesApplied = fixesApplied;
report.addedCards = addedCards;

// ---------- site.json ----------
const contactPage = byPath.get("/kontakta-oss");
const social = [];
for (const b of content.pages.find((x) => x.path === "/kontakta-oss").blocks)
  if (b.type === "image" && b.href && /(facebook|instagram|linkedin)\.com/i.test(b.href)) social.push({ name: b.alt || new URL(b.href).hostname, url: b.href });
void contactPage;
const site = {
  name: "Betongakuten",
  legalName: "Betongakuten i Sverige AB",
  orgNumber: "556931-7497",
  origin: "https://www.betongakuten.se",
  defaultLang: "sv",
  languages: {
    sv: { label: "Svenska", locale: "sv_SE", published: true },
    en: { label: "English", locale: "en_GB", published: false },
    es: { label: "Español", locale: "es_ES", published: false }
  },
  tagline: "Leverantör och konsult inom byggindustrin",
  contact: {
    email: "johnny@betongakuten.se",
    phones: [
      { label: "Kontor", value: "040-15 00 57" },
      { label: "Mobil", value: "0700-37 94 11" }
    ],
    address: null
  },
  social,
  nav: ["/produkter", "/om-oss", "/kontakta-oss"],
  analytics: { enabled: false, provider: "ga4", measurementId: "" },
  theme: { primary: "#f37d03", dark: "#231f20", surface: "#f4f2ef", text: "#231f20" },
  adminPath: "/cms/",
  urlStyle: "file",
  github: { owner: "", repo: "", branch: "main" }
};
fs.writeFileSync(path.join(ROOT, "content/site.json"), JSON.stringify(site, null, 2) + "\n");
fs.writeFileSync(path.join(ROOT, "content/redirects.json"), JSON.stringify({ "/startsida": "/" }, null, 2) + "\n");

fs.writeFileSync(MARKER, new Date().toISOString() + "\n");
fs.writeFileSync(path.join(ROOT, "crawl/import-report.json"), JSON.stringify({ at: new Date().toISOString(), warnings, ...report }, null, 2));
const imgBytes = fs.readdirSync(OUT_IMG).reduce((n, f) => n + fs.statSync(path.join(OUT_IMG, f)).size, 0);
console.log(`\nwritten ${written} pages | ${imgByHash.size} images (${(imgBytes / 1e6).toFixed(1)} MB) | ${docByHash.size} docs | warnings ${warnings.length}`);
console.log("source fixes:", fixesApplied.join("; ") || "none");
console.log("cards added for orphans:", addedCards.join("; ") || "none");
console.log("still unlinked (nav only):", report.orphans.join(", ") || "none");
void claim;
