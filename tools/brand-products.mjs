#!/usr/bin/env node
// Product pages for a brand (Mapei, Weber ...) built from a data file: tools/products-data/<brand>.mjs
//   per product: main picture and a square tile (from crawl/<brand>/<slug>.png|jpg|webp), optional extra pictures (<slug>-x1 ...), short intro, bullets,
//   consumption ("stat", the way the Ecobeton pages show it), documents (assets-src/docs/<brand>-<slug>-<type>.pdf), areas of use, application steps,
//   technical data (datasheet), extra tables, an optional BASTA badge; the brand page gets a "Products" row of tiles.
// Pages are generated (every block carries gen: true) and rewritten on every run; edit the data file, not the pages.
//   node tools/brand-products.mjs mapei
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const LANGS = ["sv", "en", "es", "no"];
const brandKey = process.argv[2];
if (!brandKey) { console.error("usage: node tools/brand-products.mjs <brand>"); process.exit(1); }
const DATA = (await import(`./products-data/${brandKey}.mjs`)).default;
const B = DATA.brand;
const IMG = path.join(ROOT, "assets-src/img"), DOCS = path.join(ROOT, "assets-src/docs"), SRC = path.join(ROOT, "crawl", brandKey);
const date = new Date().toISOString().slice(0, 10);

const L = {
  sv: { areas: "Användningsområden", apply: "Applicering", data: "Teknisk data", contact: '<a href="/kontakta-oss">Kontakta oss</a> för pris, leveranstid och mer information.', also: "Se även", products: "Produkter", photos: "Bilder", usage: "Åtgång",
    tds: "Tekniskt datablad (TDS)", sds: "Säkerhetsdatablad (SDS)", dop: "Prestandadeklaration (DoP)", epd: "Miljövarudeklaration (EPD)", basta: (n) => `BASTA: ${n} är registrerad i BASTA`, bastaCap: "Klicka för att se registreringen hos BASTA" },
  en: { areas: "Areas of use", apply: "Application", data: "Technical data", contact: '<a href="/kontakta-oss">Contact us</a> for price, delivery time and more information.', also: "See also", products: "Products", photos: "Pictures", usage: "Consumption",
    tds: "Technical data sheet (TDS)", sds: "Safety data sheet (SDS)", dop: "Declaration of performance (DoP)", epd: "Environmental product declaration (EPD)", basta: (n) => `BASTA: ${n} is registered in BASTA`, bastaCap: "Click to see the registration at BASTA" },
  es: { areas: "Campos de aplicación", apply: "Aplicación", data: "Datos técnicos", contact: '<a href="/kontakta-oss">Contáctenos</a> para precio, plazo de entrega y más información.', also: "Véase también", products: "Productos", photos: "Imágenes", usage: "Consumo",
    tds: "Ficha técnica (TDS)", sds: "Ficha de datos de seguridad (SDS)", dop: "Declaración de prestaciones (DoP)", epd: "Declaración ambiental de producto (EPD)", basta: (n) => `BASTA: ${n} está registrado en BASTA`, bastaCap: "Haga clic para ver el registro en BASTA" },
  no: { areas: "Bruksområder", apply: "Påføring", data: "Tekniske data", contact: '<a href="/kontakta-oss">Kontakt oss</a> for pris, leveringstid og mer informasjon.', also: "Se også", products: "Produkter", photos: "Bilder", usage: "Forbruk",
    tds: "Teknisk datablad (TDS)", sds: "Sikkerhetsdatablad (SDS)", dop: "Ytelseserklæring (DoP)", epd: "Miljødeklarasjon (EPD)", basta: (n) => `BASTA: ${n} er registrert i BASTA`, bastaCap: "Klikk for å se registreringen hos BASTA" },
};
// numbers are written the Swedish way in the data ("1 530", "0,5"); other languages get their own separators
const SEP = { sv: [" ", ","], no: [" ", ","], en: [",", "."], es: [".", ","] };
const loc = (s, l) => (typeof s === "string" ? s.replace(/(?<=\d)[  ](?=\d{3}(?!\d))/g, SEP[l][0]).replace(/(?<=\d),(?=\d)/g, SEP[l][1]) : s);
const pick = (v, l) => (v && typeof v === "object" && !Array.isArray(v) ? v[l] ?? v.en ?? v.sv : v);
const tx = (v, l) => loc(pick(v, l), l);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------- pictures ----------
function findSrc(name) { for (const e of ["png", "jpg", "jpeg", "webp"]) { const f = path.join(SRC, `${name}.${e}`); if (fs.existsSync(f)) return f; } return null; }
async function product(slug) {
  const f = findSrc(slug); if (!f) throw new Error("no picture for " + slug + " in " + SRC);
  const flat = await sharp(f).flatten({ background: "#ffffff" }).png().toBuffer();
  const trimmed = await sharp(flat).trim({ threshold: 12 }).toBuffer();
  const main = await sharp(trimmed).extend({ top: 24, bottom: 24, left: 24, right: 24, background: "#ffffff" }).resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true, kernel: "lanczos3" }).webp({ quality: 88 }).toBuffer({ resolveWithObject: true });
  fs.writeFileSync(path.join(IMG, `${brandKey}-${slug}-main.webp`), main.data);
  const fitted = await sharp(trimmed).resize({ width: 880, height: 820, fit: "inside", kernel: "lanczos3" }).toBuffer();
  await sharp({ create: { width: 1000, height: 1000, channels: 3, background: "#ffffff" } }).composite([{ input: fitted, gravity: "centre" }]).webp({ quality: 88 }).toFile(path.join(IMG, `${brandKey}-${slug}-tile.webp`));
  const extras = [];
  for (let n = 1; findSrc(`${slug}-x${n}`); n++) {
    const r = await sharp(findSrc(`${slug}-x${n}`)).rotate().resize({ width: 1600, withoutEnlargement: true, kernel: "lanczos3" }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    fs.writeFileSync(path.join(IMG, `${brandKey}-${slug}-x${n}.webp`), r.data); extras.push({ file: `/assets/img/${brandKey}-${slug}-x${n}.webp`, width: r.info.width, height: r.info.height });
  }
  return { main: { file: `/assets/img/${brandKey}-${slug}-main.webp`, width: main.info.width, height: main.info.height }, extras };
}

// ---------- pages ----------
const writeJson = (f, o, eol = "\n") => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2).replace(/\n/g, eol) + eol); };
const pageDir = path.join(ROOT, "content/pages/produkter", B.slug);
const pathOf = (s) => `/produkter/${B.slug}/${s}`;
const brandFile = path.join(ROOT, "content/pages/produkter", B.slug + ".json");
const brandRaw = fs.readFileSync(brandFile, "utf8"), eol = brandRaw.includes("\r\n") ? "\r\n" : "\n", brand = JSON.parse(brandRaw);

const imgs = {};
for (const p of DATA.products) imgs[p.slug] = await product(p.slug);

let order = 0;
for (const p of DATA.products) {
  const i18n = {}, im = imgs[p.slug];
  for (const l of LANGS) {
    const T = L[l], bl = [];
    bl.push({ type: "image", alt: B.logo.alt, href: `/produkter/${B.slug}`, width: B.logo.width, height: B.logo.height, src: B.logo.src });
    bl.push({ type: "image", alt: `${B.name} ${p.name}`, src: im.main.file, width: im.main.width, height: im.main.height });
    if (p.basta) bl.push({ type: "image", alt: T.basta(p.name), href: p.basta.url, width: 960, height: 546, src: `/assets/img/${p.basta.image}-${l === "sv" ? "se" : "en"}.webp`, maxWidth: 250, caption: T.bastaCap });
    bl.push({ type: "text", html: esc(tx(p.intro, l)) });
    bl.push({ type: "list", ordered: false, items: p.bullets[l] ? p.bullets[l].map((x) => loc(x, l)) : p.bullets.sv });
    if (p.usage) bl.push({ type: "stat", label: T.usage, value: loc(p.usage.value, l), unit: tx(p.usage.unit, l), ...(p.usage.meta ? { meta: tx(p.usage.meta, l) } : {}), ...(p.usage.note ? { note: tx(p.usage.note, l) } : {}), usage: true });
    for (const d of p.docs) bl.push({ type: "button", kind: "download", text: d.label ? tx(d.label, l) : T[d.type], href: `/assets/docs/${brandKey}-${p.slug}-${d.file}.pdf` });
    if (p.areas) { bl.push({ type: "heading", level: 2, text: T.areas }); bl.push({ type: "list", ordered: false, items: p.areas[l].map((x) => loc(x, l)) }); }
    if (p.steps) { bl.push({ type: "heading", level: 2, text: T.apply }); bl.push({ type: "list", ordered: false, items: p.steps[l].map((x) => loc(x, l)) }); }
    if (p.groups) bl.push({ type: "datasheet", title: T.data, tagline: `${B.name} ${p.name}`, intro: [], groups: p.groups.map((g) => ({ title: tx(g.title, l), rows: g.rows.map(([label, value]) => ({ label: tx(label, l), metric: tx(value, l) })) })), note: p.note ? tx(p.note, l) : "", source: tx(B.source, l) });
    for (const t of p.tables || []) {
      if (t.title) bl.push({ type: "heading", level: 3, text: tx(t.title, l) });
      bl.push({ type: "table", header: true, ...(t.align ? { align: t.align } : {}), rows: [t.header.map((h) => tx(h, l)), ...t.rows.map((r) => r.map((c) => tx(c, l)))] });
    }
    if (im.extras.length) { bl.push({ type: "heading", level: 2, text: T.photos }); bl.push({ type: "modules", layout: "tiles", columns: Math.min(3, im.extras.length), more: false, items: im.extras.map((e, k) => ({ image: e.file, alt: `${B.name} ${p.name} (${k + 1}/${im.extras.length})`, width: e.width, height: e.height })) }); }
    bl.push({ type: "text", html: T.contact });
    const rel = DATA.products.filter((x) => x.slug !== p.slug && (p.related ? p.related.includes(x.slug) : true)).slice(0, 3);
    bl.push({ type: "related", title: T.also, items: [{ href: `/produkter/${B.slug}`, mutual: false }, ...rel.map((x) => ({ href: pathOf(x.slug) }))] });
    i18n[l] = { title: p.name, h1: `${B.name} ${p.name}`, description: tx(p.intro, l).split(/(?<=[.!?])\s/)[0].slice(0, 220), blocks: bl.map((b) => ({ ...b, gen: true })) };
  }
  writeJson(path.join(pageDir, p.slug + ".json"), { path: pathOf(p.slug), updated: date, template: "product", order: order++, published: true, hero: { image: B.hero }, i18n }, eol);
}

// ---------- the brand page: a row of product tiles after the introduction ----------
for (const l of LANGS) {
  const blocks = brand.i18n[l].blocks.filter((b) => !b.gen);
  const t = blocks.findIndex((b) => b.type === "text");
  let at = t + 1; while (at < blocks.length && blocks[at].type === "text") at++;
  const tiles = [{ type: "heading", level: 2, text: L[l].products, gen: true },
    { type: "modules", layout: "tiles", columns: Math.min(4, DATA.products.length), square: true, more: false, gen: true, items: DATA.products.map((p) => ({ title: p.name, image: `/assets/img/${brandKey}-${p.slug}-tile.webp`, alt: `${B.name} ${p.name}`, href: pathOf(p.slug), bullets: (p.tile[l] || p.tile.sv).map((x) => loc(x, l)), width: 1000, height: 1000 })) }];
  blocks.splice(at, 0, ...tiles);
  brand.i18n[l].blocks = blocks;
}
brand.updated = date;
writeJson(brandFile, brand, eol);
console.log(`${B.name}: ${DATA.products.length} product pages and the tiles on the brand page`);
