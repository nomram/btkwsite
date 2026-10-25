#!/usr/bin/env node
// Builds the Häny product-family pages from the data pulled out of the brochures (tools/haeny-extract.mjs -> crawl/haeny/*.json):
//   /produkter/haeny/hitta-ratt-maskin                       landing page: parts and complete units as picture tiles
//   /produkter/haeny/hitta-ratt-maskin/<family>              one page per family: overview (bullets), then every model with picture,
//                                                            key features, technical data, performance chart, dimension drawing, brochure
// The brochure text is English; headings and labels are written in all four languages. es/no model text stays English until it is translated.
//   node tools/haeny-extract.mjs && node tools/haeny-build-pages.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const DATA = path.join(ROOT, "crawl/haeny");
const PAGES = path.join(ROOT, "content/pages/produkter/haeny/hitta-ratt-maskin");
const LANGS = ["sv", "en", "es", "no"];
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const dim = async (src) => { const m = await sharp(path.join(ROOT, "assets-src", src.replace(/^\/assets\//, ""))).metadata(); return { width: m.width, height: m.height }; };
const load = (k) => JSON.parse(fs.readFileSync(path.join(DATA, k + ".json"), "utf8"));

// ---------- labels ----------
const L = {
  sv: { overview: "Översikt", models: "Modeller", data: "Teknisk data", opts: "Standard- och tillvalsutrustning", perf: "Pumpprestanda", dims: "Mått och ritning", brochure: "Broschyr", features: "Egenskaper", uses: "Användning", back: "Se även", contact: '<a href="/kontakta-oss">Kontakta oss</a> för pris, leveranstid eller hjälp att välja rätt modell.', pdfName: (m) => `Broschyr ${m} (PDF, engelska)`, parts: "Delar", units: "Kompletta enheter", note: "Uppgifterna är hämtade ur tillverkarens broschyrer (engelska)." },
  en: { overview: "Overview", models: "Models", data: "Technical data", opts: "Standard and optional equipment", perf: "Pump performance", dims: "Dimensions and drawing", brochure: "Brochure", features: "Key features", uses: "Typical applications", back: "See also", contact: '<a href="/kontakta-oss">Contact us</a> for price, delivery time or help choosing the right model.', pdfName: (m) => `Brochure ${m} (PDF)`, parts: "Parts", units: "Complete units", note: "Information taken from the manufacturer's brochures." },
  es: { overview: "Resumen", models: "Modelos", data: "Datos técnicos", opts: "Equipamiento estándar y opcional", perf: "Rendimiento de la bomba", dims: "Dimensiones y plano", brochure: "Folleto", features: "Características", uses: "Aplicaciones típicas", back: "Véase también", contact: '<a href="/kontakta-oss">Contáctenos</a> para precio, plazo de entrega o ayuda para elegir el modelo adecuado.', pdfName: (m) => `Folleto ${m} (PDF, inglés)`, parts: "Componentes", units: "Equipos completos", note: "Información tomada de los folletos del fabricante (en inglés)." },
  no: { overview: "Oversikt", models: "Modeller", data: "Tekniske data", opts: "Standard- og tilvalgsutstyr", perf: "Pumpeytelse", dims: "Mål og tegning", brochure: "Brosjyre", features: "Egenskaper", uses: "Bruksområder", back: "Se også", contact: '<a href="/kontakta-oss">Kontakt oss</a> for pris, leveringstid eller hjelp til å velge riktig modell.', pdfName: (m) => `Brosjyre ${m} (PDF, engelsk)`, parts: "Deler", units: "Komplette enheter", note: "Opplysningene er hentet fra produsentens brosjyrer (engelsk)." }
};

const FAMILIES = [
  { slug: "blandare", group: "parts", image: "haeny-finder-hcm", models: ["hcm100", "hcm300", "hcm600", "hcm800", "hcm2500"], tiles: true,
    title: { sv: "Blandare (HCM)", en: "Mixers (HCM)", es: "Mezcladores (HCM)", no: "Miksere (HCM)" },
    intro: { sv: "Häny HCM är högskjuvande kolloidblandare för cement, ultrafint cement, bentonit och andra tillsatser. Utmärkt blandningskvalitet, hög kapacitet och lågt slitage. Blandarna kan användas fristående eller tillsammans med omrörare och injekteringspump, med manuell drift eller automatisk invägning.", en: "Häny HCM high-shear (colloidal) mixers are made for cement, ultra-fine cement, bentonite and other admixtures: excellent mixing quality, high capacity and low wear. Use them stand-alone or together with an agitator and a grout pump, manually operated or with automatic weigh-batching.", es: "Los mezcladores coloidales de alta cizalladura Häny HCM están pensados para cemento, cemento ultrafino, bentonita y otros aditivos: excelente calidad de mezcla, gran capacidad y poco desgaste. Se pueden usar solos o junto con un agitador y una bomba de inyección.", no: "Häny HCM er høyskjærende kolloidmiksere for sement, ultrafin sement, bentonitt og andre tilsetninger: utmerket blandekvalitet, høy kapasitet og lite slitasje. Kan brukes alene eller sammen med røreverk og injeksjonspumpe." } },
  { slug: "omrorare", group: "parts", image: "haeny-finder-hrw", models: ["hrw150", "hrw350", "hrw800", "hrw1200", "hrw2000", "hrw3000"], tiles: true,
    title: { sv: "Omrörare (HRW)", en: "Agitators (HRW)", es: "Agitadores (HRW)", no: "Røreverk (HRW)" },
    intro: { sv: "Häny HRW används som mellanlager mellan blandaren och pumpen. I den långsamt roterande omröraren homogeniseras injekteringsmassan och eventuella luftbubblor avlägsnas.", en: "The Häny HRW agitators are used as holding tanks between the HCM mixer and the pump. In the slowly revolving agitator the grout suspension is homogenised and air bubbles are removed.", es: "Los agitadores Häny HRW se utilizan como depósito intermedio entre la mezcladora HCM y la bomba. En el agitador, de giro lento, la suspensión se homogeneiza y se eliminan las burbujas de aire.", no: "Häny HRW brukes som mellomlager mellom blanderen og pumpen. I det sakte roterende røreverket homogeniseres injeksjonsmassen og luftbobler fjernes." } },
  { slug: "injekteringspumpar", group: "parts", image: "haeny-finder-zmp", models: ["zmp610", "zmp611", "zmp625", "zmp710", "zmp712", "zmp725", "zmp726", "zmp936"],
    extra: { sv: "Längst ner finns triplexpumpen ZMP 936 för de största flödena: slitagesnål, med pulsation under 1 % och kylvattenanslutning för kontinuerlig drift.", en: "At the end is the triplex pump ZMP 936 for the largest flows: low wear, pulsation below 1 % and a cooling water connection for continuous operation.", es: "Al final está la bomba triplex ZMP 936 para los mayores caudales: poco desgaste, pulsación inferior al 1 % y conexión de agua de refrigeración para funcionamiento continuo.", no: "Til slutt kommer triplexpumpen ZMP 936 for de største ytelsene: lite slitasje, pulsering under 1 % og kjølevanntilkobling for kontinuerlig drift." },
    title: { sv: "Injekteringspumpar (ZMP)", en: "Grout pumps (ZMP)", es: "Bombas de inyección (ZMP)", no: "Injeksjonspumper (ZMP)" },
    intro: { sv: "Slitagesnåla kolvpumpar från Häny, enkel- eller dubbelverkande. Tryck upp till 200 bar, flöde upp till 13 m³/h och partikelstorlek upp till 8 mm. ZMP 600-serien är kompakta stående pumpar, ZMP 700-serien är kraftigare.", en: "Low-wear plunger pumps from Häny, single or double acting. Pressures up to 200 bar, output up to 13 m³/h and particle size up to 8 mm. The ZMP 600 series are compact vertical pumps, the ZMP 700 series are the heavier ones.", es: "Bombas de émbolo de bajo desgaste de Häny, de simple o doble efecto. Presiones de hasta 200 bar, caudal de hasta 13 m³/h y tamaño de partícula de hasta 8 mm. La serie ZMP 600 son bombas verticales compactas; la serie ZMP 700, las más potentes.", no: "Slitesvake stempelpumper fra Häny, enkelt- eller dobbeltvirkende. Trykk opptil 200 bar, ytelse opptil 13 m³/h og partikkelstørrelse opptil 8 mm. ZMP 600-serien er kompakte stående pumper, ZMP 700-serien er de kraftigere." } },
  { slug: "kompakta-anlaggningar", group: "units", image: "haeny-manuella-pumpar-ic-310-ic-311", models: ["ic310", "ic311", "ic325", "ic650-710v", "ic650-712v", "ic650-725v", "ic1100-710v", "ic1100-712v", "ic1100-725v", "ic1400-710v", "ic1400-712v", "ic1400-725v", "ic1400-726v"], see: "/produkter/haeny/manuella-pumpar",
    title: { sv: "Kompakta anläggningar (IC)", en: "Compact grout plants (IC)", es: "Plantas de inyección compactas (IC)", no: "Kompakte injeksjonsanlegg (IC)" },
    intro: { sv: "INJECTO-COMPACT: blandare, omrörare och pump i en enhet. För all injektering med cement och ultrafint cement samt bentonit för mikrotunnling, rörpressning och styrd borrning. Ergonomiska, platsbesparande och med central lyftpunkt.", en: "INJECTO-COMPACT: a mixer, an agitator and a grout pump in one unit. For all grouting with cement and ultra-fine cement, and bentonite suspensions for microtunnelling, pipe jacking and directional drilling. Ergonomic, space-saving, with a central lifting point.", es: "INJECTO-COMPACT: mezcladora, agitador y bomba de inyección en una sola unidad. Para toda inyección con cemento y cemento ultrafino y suspensiones de bentonita para microtúneles, hincado de tuberías y perforación dirigida.", no: "INJECTO-COMPACT: blander, røreverk og pumpe i én enhet. For all injeksjon med sement og ultrafin sement samt bentonitt for mikrotunnelering, rørpressing og styrt boring." } },
  { slug: "automatiska-anlaggningar", base: "/produkter/haeny/automatiska-pumpar", group: "units", image: "haeny-automatiska-pumpar", models: ["faic650-710", "faic650-712", "faic650-725", "faic1100-725", "faic1400-725"],
    title: { sv: "Automatiska anläggningar (FAIC)", en: "Automated grout plants (FAIC)", es: "Plantas de inyección automáticas (FAIC)", no: "Automatiske injeksjonsanlegg (FAIC)" },
    intro: { sv: "Automatiserade anläggningar för att bereda och injektera cement, bentonit, mikrofina bindemedel och bruk. Noggrann dosering, förbrukningsregistrering, integrerad tryck- och flödesregistrering samt radiostyrning.", en: "Automated plants for preparing and injecting cement, bentonite, microfine binders and mortar. Accurate dosing, consumption record, integrated pressure and flow recording and radio remote control.", es: "Plantas automatizadas para preparar e inyectar cemento, bentonita, ligantes microfinos y mortero. Dosificación precisa, registro de consumo, registro integrado de presión y caudal y mando por radio.", no: "Automatiserte anlegg for klargjøring og injeksjon av sement, bentonitt, mikrofine bindemidler og mørtel. Nøyaktig dosering, forbruksregistrering, integrert trykk- og strømningsregistrering og radiostyring." } }
];
const MODEL_IMG = (k) => /^ic(310|311|325)$/.test(k) ? "haeny-manuella-pumpar-ic-310-ic-311" : /^ic650/.test(k) ? "haeny-finder-ic" : /^ic(1100|1400)/.test(k) ? "haeny-finder-ic1100" : /^zmp6/.test(k) ? "haeny-finder-zmp600" : /^zmp7/.test(k) ? "haeny-finder-zmp" : k === "zmp936" ? "haeny-finder-zmp936" : /^faic/.test(k) ? "haeny-finder-faic" : null;

// ---------- translations of the brochure text (tools/haeny-i18n.json: English text -> sv / es / no) ----------
const I18N = Object.assign({}, ...fs.readdirSync(path.join(ROOT, "tools")).filter((x) => /^haeny-i18n.*.json$/.test(x)).map((x) => JSON.parse(fs.readFileSync(path.join(ROOT, "tools", x), "utf8"))));
const tr = (l, text) => (l === "en" || !text ? text : (I18N[text] && I18N[text][l]) || text);
const STRINGS = new Set(), MISSING = new Set();
const collect = (d) => {
  const add = (x) => { if (x && /[A-Za-z]{3,}/.test(x)) STRINGS.add(x); };
  add(d.title); add(d.intro); d.features.forEach(add); d.applications.forEach(add); d.notes.forEach(add);
  for (const t of d.tables) { add(t.title); t.rows.forEach(([a, b]) => { add(a); add(b); }); for (const [n, items] of Object.entries(t.lists || {})) { add(n); items.forEach(add); } }
};

// ---------- data fixes for the few wrapped rows ----------
function fixData(k, d) {
  for (const t of d.tables) {
    t.title = t.title.replace(/^Electrical system$/i, "Electrical data");
    t.rows = t.rows.map(([l, v]) => [l.replace(/^Tension$/i, "Voltage"), v]);
    if (k === "hcm800" || k === "hcm2500") {
      const i = t.rows.findIndex(([l]) => /^Dry component feed-?$/i.test(l));
      if (i >= 0) { const n = t.rows[i + 1][0]; t.rows.splice(i, 3, ["Dry component feed-through", n]); }
    }
    if (k === "zmp936" && t.title === "Grout pump") {
      t.rows = [["Max. capacity", "1,000 l/min (60 m³/h)"], ["Min. capacity", "200 l/min (12 m³/h)"], ["Max. pressure (at max. output)", "40 bar"], ["Motor rating", "121 kW"], ["Plunger Ø", "210 mm"], ["Max. aggregate size", "8 mm"], ["No. of plunger pumps", "3"], ["Suction connection", "3x BSP 3\""], ["Discharge manifold", "BSP 3\" or Ø 100 mm, connection GF 45M-LC 4-1/2\""]];
    }
    if (k === "zmp936" && t.title === "Hydraulic system") {
      t.rows = [["Hydraulic tank", "400 l"], ["Counterflow oil/water cooler, consumption", "27 l/min"], ["Cooling water connection", "IN G¾\", GEKA; OUT G1\", GEKA"]];
    }
    // "Control" tables are lists of functions, not label/value pairs
    if (/control/i.test(t.title)) { t.lists = { ...t.lists, [""]: t.rows.map(([l, v]) => (v ? l + ": " + v : l)) }; t.rows = []; }
  }
  collect(d);
  return d;
}

const clean = (s) => esc(s).replace(/\s+/g, " ").trim();
const keyFigures = (d) => {
  const rows = d.tables.flatMap((t) => t.rows);
  const pick = (re) => { const r = rows.find(([l]) => re.test(l)); return r ? r[1] : null; };
  return [pick(/^(approx\. )?capacity|^max\. capacity/i), pick(/^max\. pressure/i), pick(/circulation capacity/i) && null, pick(/usable content( mixer)?$/i), pick(/^nominal power/i)].filter(Boolean).slice(0, 3);
};
const pumpOf = (d) => { const t = d.tables.find((x) => /grout pump/i.test(x.title) && x.subtitle); return t ? t.subtitle : ""; };

function modelBlocks(l, fam, k, d) {
  const T = L[l]; const out = [];
  const img = d.images.model || d.images.unit || null;
  const fallback = MODEL_IMG(k);
  out.push({ type: "heading", level: 2, text: d.model || k.toUpperCase(), anchor: k });
  out.push({ type: "__cols", img: img ? { src: img.file, width: img.width, height: img.height } : fallback ? { src: `/assets/img/${fallback}.webp` } : null, alt: `${tr(l, d.title)} ${d.model}`,
    html: clean(tr(l, d.intro)), features: d.features.map((x) => clean(tr(l, x))), uses: d.applications.map((x) => clean(tr(l, x))), usesLabel: T.uses });
  const groups = d.tables.filter((t) => t.rows.length).map((t) => ({ title: tr(l, t.title) + (t.subtitle ? ` (${t.subtitle})` : ""), rows: t.rows.map(([label, metric]) => ({ label: tr(l, label), metric: tr(l, metric) })) }));
  if (groups.length) out.push({ type: "datasheet", title: T.data, tagline: `${tr(l, d.title)} ${d.model}`, intro: [], groups, note: d.notes.length ? d.notes.map((n, i) => `${i + 1}: ${tr(l, n)}`).join(" · ") : "" });
  const lists = [];
  for (const t of d.tables) for (const [name, items] of Object.entries(t.lists || {})) for (const it of items) lists.push(name ? `${tr(l, name)} (${tr(l, t.title)}): ${tr(l, it)}` : `${tr(l, t.title)}: ${tr(l, it)}`);
  if (lists.length) { out.push({ type: "heading", level: 3, text: T.opts }); out.push({ type: "list", ordered: false, items: lists.map(clean) }); }
  const tiles = [];
  if (d.images.chart) tiles.push({ title: T.perf, image: d.images.chart.file, alt: `${T.perf} ${d.model}` });
  if (d.images.dim) tiles.push({ title: T.dims, image: d.images.dim.file, alt: `${T.dims} ${d.model}` });
  if (tiles.length) out.push({ type: "modules", layout: "tiles", columns: Math.min(2, tiles.length), more: false, items: tiles });
  out.push({ type: "button", kind: "download", text: T.pdfName(d.model), href: d.file });
  return out;
}

async function resolveBlocks(blocks) {
  const res = [];
  for (const b of blocks) {
    if (b.type === "__cols") {
      const left = b.img ? [{ type: "image", alt: b.alt, ...(b.img.width ? { width: b.img.width, height: b.img.height } : await dim(b.img.src)), src: b.img.src }] : [];
      const right = [{ type: "text", html: b.html }];
      if (b.features.length) right.push({ type: "list", ordered: false, items: b.features });
      res.push({ type: "columns", ratio: "40-60", left, right });
      if (b.uses.length) { res.push({ type: "heading", level: 3, text: b.usesLabel }); res.push({ type: "list", ordered: false, items: b.uses }); }
      continue;
    }
    if (b.type === "modules") { for (const it of b.items) Object.assign(it, await dim(it.image)); }
    res.push(b);
  }
  return res;
}

const out = (rel, o) => { const f = path.join(ROOT, "content/pages", rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2) + "\n"); console.log("wrote", rel); };
const crumb = { type: "image", alt: "HÄNY", href: "/produkter/haeny", width: 832, height: 143, src: "/assets/img/haeny-1.webp" };
const date = "2026-10-23";
const HUB = "/produkter/haeny/hitta-ratt-maskin";

// ---------- family pages ----------
// A family that has an older page of its own (base) keeps that page: its address, its translated text and its brochure stay,
// and the generated overview and model sections are added to it. Generated blocks carry "gen": true so a re-run replaces them.
const genBlocks = (arr) => arr.map((b) => ({ ...b, gen: true }));
let order = 0;
for (const fam of FAMILIES) {
  const data = Object.fromEntries(fam.models.map((k) => [k, fixData(k, load(k))]));
  const baseFile = fam.base ? path.join(ROOT, "content/pages", fam.base + ".json") : null;
  const baseJson = baseFile && fs.existsSync(baseFile) ? JSON.parse(fs.readFileSync(baseFile, "utf8")) : null;
  const i18n = {};
  for (const l of LANGS) {
    const T = L[l];
    const introText = fam.intro[l] + (fam.extra ? " " + fam.extra[l] : "");
    const head = [{ ...crumb }, { type: "image", alt: fam.title[l], ...(await dim(`/assets/img/${fam.image}.webp`)), src: `/assets/img/${fam.image}.webp` }, { type: "text", html: esc(introText) }];
    const body = [];
    const first = data[fam.models[0]];
    body.push({ type: "heading", level: 2, text: T.overview });
    if (first.features.length) body.push({ type: "list", ordered: false, items: first.features.map((x) => clean(tr(l, x))) });
    body.push({ type: "heading", level: 3, text: T.models });
    body.push({ type: "list", ordered: false, items: fam.models.map((k) => { const d = data[k]; const p = pumpOf(d); return `<a href="#${k}">${esc(d.model)}</a>${p ? ` (${esc(p)})` : ""}: ${keyFigures(d).map(esc).join(" · ")}`; }) });
    if (first.applications.length) { body.push({ type: "heading", level: 3, text: T.uses }); body.push({ type: "list", ordered: false, items: first.applications.map((x) => clean(tr(l, x))) }); }
    const pagePath = fam.base || `${HUB}/${fam.slug}`;
    if (fam.tiles) body.push({ type: "modules", layout: "tiles", columns: 3, more: false, items: await Promise.all(fam.models.map(async (k) => { const d = data[k]; const im = d.images.model ? d.images.model.file : `/assets/img/${fam.image}.webp`; return { title: d.model, image: im, alt: d.model, href: `${pagePath}#${k}`, ...(d.images.model ? { width: d.images.model.width, height: d.images.model.height } : await dim(im)) }; })) });
    for (const k of fam.models) body.push(...(await resolveBlocks(modelBlocks(l, fam, k, data[k]))));
    if (fam.see) body.push({ type: "related", items: [{ href: fam.see, mutual: true }] });
    let blocks;
    if (baseJson && baseJson.i18n[l]) {
      // the existing page is the base: its picture, heading and introduction first, the generated sections, then its brochure and notes
      const old = baseJson.i18n[l].blocks.filter((b) => !b.gen);
      const li = old.findIndex((b) => b.type === "list");
      const top = old.slice(0, li < 0 ? 4 : li).map((b) => (b.type === "heading" && /FAIC/.test(b.text) ? { ...b, text: "Häny FAIC" } : b));
      const tail = old.slice(li < 0 ? 4 : li + 1).filter((b) => b.type !== "modules" && !(b.type === "text" && /kontakta-oss/.test(b.html) && b.html.length < 140));
      blocks = [...top, ...genBlocks(body), ...tail, { type: "text", html: T.contact }, ...genBlocks([{ type: "text", html: `<small>${esc(T.note)}</small>` }])];
      blocks = blocks.filter((b, i, a) => !(b.type === "text" && b.html === T.contact && a.findIndex((x) => x.type === "text" && x.html === T.contact) !== i));
    } else {
      blocks = [...head, ...genBlocks(body), { type: "text", html: T.contact }, { type: "text", html: `<small>${esc(T.note)}</small>` }];
    }
    i18n[l] = { title: fam.title[l], h1: fam.title[l], description: introText.slice(0, 200), blocks };
  }
  if (baseJson) {
    fs.writeFileSync(baseFile, JSON.stringify({ ...baseJson, updated: date, i18n }, null, 2) + "\n"); console.log("merged into", fam.base);
  } else out(`produkter/haeny/hitta-ratt-maskin/${fam.slug}.json`, { path: `${HUB}/${fam.slug}`, updated: date, template: "product", order: order++, published: true, i18n });
}

// ---------- MCM: no brochure, short page ----------
{
  const T = {
    sv: { title: "Mobila anläggningar (MCM)", text: "Häny MCM är mobila blandningsanläggningar för bentonit, flygaska, cement, filler, lera och liknande suspensioner till slitsmurar, jet grouting och alla typer av injekteringsprojekt. Broschyr finns på begäran." },
    en: { title: "Portable mixing plants (MCM)", text: "Häny's range of portable MCM mixing plants is suitable for mixing bentonite, fly ash, cement, filler, clay and similar suspensions for diaphragm walls, slurry walls, jet grouting and all types of grouting projects. A brochure is available on request." },
    es: { title: "Plantas de mezcla móviles (MCM)", text: "Las plantas de mezcla móviles Häny MCM son adecuadas para mezclar bentonita, cenizas volantes, cemento, filler, arcilla y suspensiones similares para muros pantalla, jet grouting y todo tipo de proyectos de inyección. Folleto disponible bajo pedido." },
    no: { title: "Mobile blandeanlegg (MCM)", text: "Härnys mobile MCM-blandeanlegg egner seg for blanding av bentonitt, flyveaske, sement, filler, leire og lignende suspensjoner til slissemurer, jet grouting og alle typer injeksjonsprosjekter. Brosjyre på forespørsel." }
  };
  const i18n = {};
  for (const l of LANGS) i18n[l] = { title: T[l].title, h1: T[l].title, description: T[l].text.slice(0, 200), blocks: [{ ...crumb }, { type: "image", alt: T[l].title, ...(await dim("/assets/img/haeny-finder-mcm.webp")), src: "/assets/img/haeny-finder-mcm.webp" }, { type: "text", html: esc(T[l].text) }, { type: "text", html: L[l].contact }] };
  out("produkter/haeny/hitta-ratt-maskin/mobila-anlaggningar.json", { path: `${HUB}/mobila-anlaggningar`, updated: date, template: "product", order: order++, published: true, i18n });
}

// ---------- the tile groups (parts / complete units / registration), used by the landing page and the Häny brand page ----------
const famHref = (fam) => fam.base || `${HUB}/${fam.slug}`;
async function tileGroups(l) {
  const T = L[l];
  const tile = async (fam) => ({ title: fam.title[l], image: `/assets/img/${fam.image}.webp`, alt: fam.title[l], href: famHref(fam), ...(await dim(`/assets/img/${fam.image}.webp`)) });
  const ccpTitle = { sv: "Kompakta PU-anläggningar (IC 325 CCP)", en: "Compact PU plants (IC 325 CCP)", es: "Plantas compactas PU (IC 325 CCP)", no: "Kompakte PU-anlegg (IC 325 CCP)" };
  const mcmTitle = { sv: "Mobila anläggningar (MCM)", en: "Portable mixing plants (MCM)", es: "Plantas de mezcla móviles (MCM)", no: "Mobile blandeanlegg (MCM)" };
  const dpvTitle = { sv: "Dataloggare (DPV-H)", en: "Data logger (DPV-H)", es: "Registrador de datos (DPV-H)", no: "Datalogger (DPV-H)" };
  const regTitle = { sv: "Registrering och styrning", en: "Recording and control", es: "Registro y control", no: "Registrering og styring" };
  const parts = FAMILIES.filter((f) => f.group === "parts"), units = FAMILIES.filter((f) => f.group === "units");
  const unitItems = [];
  for (const f of units) {
    unitItems.push(await tile(f));
    if (f.slug === "kompakta-anlaggningar") unitItems.push({ title: ccpTitle[l], image: "/assets/img/haeny-finder-ccp.webp", alt: ccpTitle[l], href: "/produkter/haeny/manuella-pumpar/ic-325-ic325-ccp#ic325-ccp", ...(await dim("/assets/img/haeny-finder-ccp.webp")) });
  }
  unitItems.push({ title: mcmTitle[l], image: "/assets/img/haeny-finder-mcm.webp", alt: mcmTitle[l], href: `${HUB}/mobila-anlaggningar`, ...(await dim("/assets/img/haeny-finder-mcm.webp")) });
  const dpvImg = "/assets/img/haeny-manuella-pumpar-dataloggare-dpv-2.webp";
  return genBlocks([
    { type: "heading", level: 2, text: T.units }, { type: "modules", layout: "tiles", columns: 4, more: false, items: unitItems },
    { type: "heading", level: 2, text: T.parts }, { type: "modules", layout: "tiles", columns: 3, more: false, items: await Promise.all(parts.map(tile)) },
    { type: "heading", level: 2, text: regTitle[l] }, { type: "modules", layout: "tiles", columns: 4, more: false, items: [{ title: dpvTitle[l], image: dpvImg, alt: dpvTitle[l], href: "/produkter/haeny/manuella-pumpar/dataloggare-dpv", ...(await dim(dpvImg)) }] }
  ]);
}

// ---------- the landing page ----------
{
  const intro = {
    sv: "Häny har ett komplett sortiment för blandning och injektering. Börja med att välja: enskilda delar (blandare, omrörare, pumpar) eller kompletta enheter där allt sitter ihop. Varje sida visar översikt, modeller, teknisk data, diagram och broschyrer. Osäker? <a href=\"/kontakta-oss\">Kontakta oss</a>, så hjälper vi dig välja.",
    en: "Häny has a complete range for mixing and injection. Start by choosing: individual parts (mixers, agitators, pumps) or complete units where everything is combined. Every page shows an overview, the models, technical data, diagrams and brochures. Not sure? <a href=\"/kontakta-oss\">Contact us</a> and we will help you choose.",
    es: "Häny ofrece una gama completa para mezcla e inyección. Empiece eligiendo: componentes individuales (mezcladoras, agitadores, bombas) o equipos completos. Cada página muestra un resumen, los modelos, datos técnicos, diagramas y folletos. ¿Duda? <a href=\"/kontakta-oss\">Contáctenos</a> y le ayudamos a elegir.",
    no: "Häny har et komplett sortiment for blanding og injeksjon. Start med å velge: enkeltdeler (miksere, røreverk, pumper) eller komplette enheter. Hver side viser oversikt, modeller, tekniske data, diagrammer og brosjyrer. Usikker? <a href=\"/kontakta-oss\">Kontakt oss</a>, så hjelper vi deg å velge."
  };
  const name = { sv: "Hitta rätt maskin", en: "Find the right machine", es: "Encuentre la máquina adecuada", no: "Finn riktig maskin" };
  const i18n = {};
  for (const l of LANGS) {
    i18n[l] = {
      title: name[l], h1: name[l], description: intro[l].replace(/<[^>]+>/g, "").slice(0, 200),
      blocks: [{ ...crumb }, { type: "text", html: intro[l] }, ...(await tileGroups(l)),
        { type: "button", kind: "download", text: { sv: "Huvudbroschyr (produktportfölj)", en: "Main brochure (product portfolio)", es: "Folleto principal (cartera de productos)", no: "Hovedbrosjyre (produktportefølje)" }[l], href: "/assets/docs/haeny-portfolio-brochure-en.pdf" },
        { type: "button", kind: "download", text: { sv: "Komplett broschyr: blandning och injektering", en: "Complete brochure: mixing and injection", es: "Folleto completo: mezcla e inyección", no: "Komplett brosjyre: blanding og injeksjon" }[l], href: "/assets/docs/haeny-gesamt-mit-brochure-en.pdf" }]
    };
  }
  out("produkter/haeny/hitta-ratt-maskin.json", { path: HUB, updated: date, template: "product", order: 0, published: true, i18n });
}

// ---------- the Häny brand page: the same tile groups replace its old tiles ----------
{
  const bf = path.join(ROOT, "content/pages/produkter/haeny.json");
  const raw = fs.readFileSync(bf, "utf8"); const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  const j = JSON.parse(raw);
  for (const l of LANGS) {
    const all = j.i18n[l].blocks;
    let at = all.findIndex((b) => b.gen), replace = 0;
    const bl = all.filter((b) => !b.gen);
    if (at < 0) { at = bl.findIndex((b) => b.type === "modules"); replace = 1; }
    if (at < 0) continue;
    bl.splice(at, replace, ...(await tileGroups(l)));
    j.i18n[l].blocks = bl;
  }
  fs.writeFileSync(bf, JSON.stringify(j, null, 2).replace(/\n/g, eol) + eol); console.log("updated produkter/haeny.json");
}

// ---------- tidy up what the merge made obsolete ----------
for (const gone of ["triplexpump", "automatiska-anlaggningar"]) { const p = path.join(PAGES, gone + ".json"); if (fs.existsSync(p)) { fs.rmSync(p); console.log("removed", gone); } }
{
  const rf = path.join(ROOT, "content/redirects.json"); const r = JSON.parse(fs.readFileSync(rf, "utf8"));
  r[`${HUB}/triplexpump`] = `${HUB}/injekteringspumpar`; r[`${HUB}/automatiska-anlaggningar`] = "/produkter/haeny/automatiska-pumpar";
  fs.writeFileSync(rf, JSON.stringify(r, null, 2) + "\n");
}

if (process.argv.includes("--strings")) { fs.writeFileSync(path.join(ROOT, "crawl/haeny-strings.json"), JSON.stringify([...STRINGS].sort(), null, 1)); console.log(STRINGS.size, "texts to translate -> crawl/haeny-strings.json"); }
const NOISE = /(BSP|TMP|GEKA|OUT|IN|GF|LC|min|bar|kVA|mm|Max)/g;
const untranslated = [...STRINGS].filter((x) => !I18N[x] && /[A-Za-z]{4,}/.test(x.replace(NOISE, ""))); if (untranslated.length) console.log("not translated yet:", untranslated.length, JSON.stringify(untranslated, null, 1));
