#!/usr/bin/env node
// Builds the Häny product pages from the data pulled out of the brochures (tools/haeny-extract.mjs -> crawl/haeny/*.json):
//   /produkter/haeny                     the brand page: complete units, parts, technology, recording equipment (picture tiles)
//   /produkter/haeny/<family>            one page per family: overview, a tile for every model, comparison of the models
//   /produkter/haeny/<family>/<model>    one page per model: picture, key features, technical data, performance chart, dimension drawing, brochure
// IC 310 and IC 325 (with the CCP version) keep their older pages and get the brochure data added after the brochure button.
// The brochure text is English; headings and labels are written in all four languages, the brochure text goes through tools/haeny-i18n*.json.
//   node tools/haeny-extract.mjs && node tools/haeny-tiles.mjs && node tools/haeny-build-pages.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const CRAWL = path.join(ROOT, "crawl/haeny");
const LANGS = ["sv", "en", "es", "no"];
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const dim = async (src) => { const m = await sharp(path.join(ROOT, "assets-src", src.replace(/^\/assets\//, ""))).metadata(); return { width: m.width, height: m.height }; };
const load = (k) => JSON.parse(fs.readFileSync(path.join(CRAWL, k + ".json"), "utf8"));

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
const PC = {
  sv: { x: "Tryck", y: "Flöde", plunger: "Kolv", low: "Lågt tryck", high: "Högt tryck", chips: "Visa kurvor", show: "Visa originaldiagrammet från broschyren", hide: "Dölj originaldiagrammet", hint: "Håll muspekaren över diagrammet, tryck på det eller använd piltangenterna för att läsa av värden. Klicka på en kolvstorlek för att dölja eller visa den (dubbelklicka för att visa bara den)." },
  en: { x: "Pressure", y: "Output", plunger: "Plunger", low: "Low pressure", high: "High pressure", chips: "Show curves", show: "Show the original chart from the brochure", hide: "Hide the original chart", hint: "Hover over the chart, tap it or use the arrow keys to read values. Click a plunger size to hide or show it (double-click to show only that one)." },
  es: { x: "Presión", y: "Caudal", plunger: "Émbolo", low: "Baja presión", high: "Alta presión", chips: "Mostrar curvas", show: "Ver el diagrama original del folleto", hide: "Ocultar el diagrama original", hint: "Pase el cursor sobre el gráfico, púlselo o use las flechas del teclado para leer valores. Pulse un tamaño de émbolo para ocultarlo o mostrarlo (doble clic para mostrar solo ese)." },
  no: { x: "Trykk", y: "Ytelse", plunger: "Stempel", low: "Lavt trykk", high: "Høyt trykk", chips: "Vis kurver", show: "Vis originaldiagrammet fra brosjyren", hide: "Skjul originaldiagrammet", hint: "Hold musepekeren over diagrammet, trykk på det eller bruk piltastene for å lese av verdier. Klikk på en stempelstørrelse for å skjule eller vise den (dobbeltklikk for å vise bare den)." }
};
const PC_COLOR = { "#0000ff": "#2f5aa8", "#ff0000": "#cf3a2e", "#000000": "#2b2b2b" };
const seriesName = (l, n) => n.replace(/^Plunger/i, PC[l].plunger).replace(/^Low pressure/i, PC[l].low).replace(/^High pressure/i, PC[l].high);
Object.assign(L.sv, { sizeAll: "Alla", kPlunger: "Kolv Ø", kFlow: "Flöde", kPressure: "Tryck", kContent: "Volym", kPower: "Effekt", zoomHint: "Håll muspekaren över ritningen (eller tryck och dra) för 2× förstoring.", compare: "Jämförelse av modellerna", reg: "Registrering och styrning", dpv: "Dataloggare (DPV-H)" });
Object.assign(L.en, { sizeAll: "All", kPlunger: "Plunger Ø", kFlow: "Flow", kPressure: "Pressure", kContent: "Volume", kPower: "Power", zoomHint: "Hover over the drawing (or touch and drag) for a 2× magnifier.", compare: "Model comparison", reg: "Recording and control", dpv: "Data logger (DPV-H)" });
Object.assign(L.es, { sizeAll: "Todos", kPlunger: "Émbolo Ø", kFlow: "Caudal", kPressure: "Presión", kContent: "Volumen", kPower: "Potencia", zoomHint: "Pase el cursor sobre el plano (o toque y arrastre) para una lupa 2×.", compare: "Comparación de modelos", reg: "Registro y control", dpv: "Registrador de datos (DPV-H)" });
Object.assign(L.no, { sizeAll: "Alle", kPlunger: "Stempel Ø", kFlow: "Ytelse", kPressure: "Trykk", kContent: "Volum", kPower: "Effekt", zoomHint: "Hold musepekeren over tegningen (eller trykk og dra) for 2× forstørrelse.", compare: "Sammenligning av modellene", reg: "Registrering og styring", dpv: "Datalogger (DPV-H)" });
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
// the brochure bullets are long sentences: tools/haeny-short.json holds a short English version of each (the translations are made from the short one)
const SHORT = JSON.parse(fs.readFileSync(path.join(ROOT, "tools/haeny-short.json"), "utf8"));
const shorten = (list) => [...new Set(list.map((x) => SHORT[x] || x))];
function fixData(k, d) {
  // one row can hold the values of several plunger sizes: write them as "85 / 105 / 120 mm", not "85 105 120 mm"
  const slashed = (v) => { const m = String(v).match(/^(\d+(?:[.,]\d+)?(?: \d+(?:[.,]\d+)?)+)(\s*[^\d\s].*)?$/); return m ? m[1].split(" ").join(" / ") + (m[2] || "") : v; };
  for (const t of d.tables) t.rows = t.rows.map(([a, b]) => [a, slashed(b)]);
  d.features = shorten(d.features); d.applications = shorten(d.applications);
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
const keyFigures = (d, l) => {
  const rows = d.tables.flatMap((t) => t.rows);
  const pick = (re) => { const r = rows.find(([lab, v]) => re.test(lab) && v && v !== "-"); return r ? r[1] : null; };
  const lab = (k, v) => (v ? `${L[l][k]}: ${tr(l, v)}` : null);
  return [lab("kPlunger", /^plunger/i.test((rows.find(([x]) => /^plunger/i.test(x)) || [""])[0]) ? pick(/^plunger/i) : null), lab("kFlow", pick(/^(approx. )?capacity|^max. capacity/i)), lab("kPressure", pick(/^max. pressure/i)), lab("kContent", pick(/usable content( mixer)?$/i)), lab("kPower", pick(/^nominal power/i))].filter(Boolean).slice(0, 3);
};
// the plunger sizes of a pump ("85 / 105 / 120 mm" -> [85, 105, 120]); a pump with one size has none to choose
const sizesOf = (d) => { const r = d.tables.flatMap((t) => t.rows).find(([lab]) => /^plunger/i.test(lab)); const m = r && String(r[1]).match(/^(\d+(?: \/ \d+)+)/); return m ? m[1].split(" / ").map(Number) : []; };
const sizeBlock = (l, sizes) => (sizes.length > 1 ? { type: "sizeselect", label: L[l].kPlunger, all: L[l].sizeAll, unit: "mm", sizes } : null);
const pumpOf = (d) => { const t = d.tables.find((x) => /grout pump/i.test(x.title) && x.subtitle); return t ? t.subtitle : ""; };


// ---------- addresses ----------
const BASE = "/produkter/haeny";
const FAM_PATH = { blandare: `${BASE}/blandare`, omrorare: `${BASE}/omrorare`, injekteringspumpar: `${BASE}/injekteringspumpar`, "kompakta-anlaggningar": `${BASE}/manuella-pumpar`, "automatiska-anlaggningar": `${BASE}/automatiska-pumpar` };
const FAM_TILE = { blandare: "hcm", omrorare: "hrw", injekteringspumpar: "zmp", "kompakta-anlaggningar": "ic", "automatiska-anlaggningar": "faic" };
const slugOf = (k) => k.replace(/^([a-z]+)/, "$1-");
// the two older IC pages stay where they were (the ranking addresses): IC 310 (the page that also described IC311) and IC 325 together with the CCP version
const MODEL_PATH = (fam, k) => (k === "ic310" ? `${FAM_PATH[fam.slug]}/ic-310-ic-311` : k === "ic325" ? `${FAM_PATH[fam.slug]}/ic-325-ic325-ccp` : `${FAM_PATH[fam.slug]}/${slugOf(k)}`);
const famOf = (k) => FAMILIES.find((f) => f.models.includes(k));

// ---------- blocks of one model ----------
const tileOf = (k) => `/assets/img/haeny-${k}-tile.webp`;
function topBlocks(l, k, d) {
  const T = L[l]; const out = [];
  const img = d.images.model || d.images.unit || null;
  out.push({ type: "__cols", img: img ? { src: img.file, width: img.width, height: img.height } : null, alt: `${tr(l, d.title)} ${d.model}`,
    html: clean(tr(l, d.intro)), features: d.features.map((x) => clean(tr(l, x))), uses: d.applications.map((x) => clean(tr(l, x))), usesLabel: T.uses });
  return out;
}
function dataBlocks(l, k, d, { download = true } = {}) {
  const T = L[l]; const out = [];
  const groups = d.tables.filter((t) => t.rows.length).map((t) => ({ title: tr(l, t.title) + (t.subtitle ? ` (${t.subtitle})` : ""), rows: t.rows.map(([label, metric]) => ({ label: tr(l, label), metric: tr(l, metric) })) }));
  const sb = sizeBlock(l, sizesOf(d)); if (sb) out.push(sb);
  if (groups.length) out.push({ type: "datasheet", title: T.data, tagline: `${tr(l, d.title)} ${d.model}`, intro: [], groups, note: d.notes.length ? d.notes.map((n, i) => `${i + 1}: ${tr(l, n)}`).join(" · ") : "", source: T.note });
  const lists = [];
  for (const t of d.tables) for (const [name, items] of Object.entries(t.lists || {})) for (const it of items) lists.push(name ? `${tr(l, name)} (${tr(l, t.title)}): ${tr(l, it)}` : `${tr(l, t.title)}: ${tr(l, it)}`);
  const tiles = [];
  let chartBlock = null;
  // a closed box in the chart (the ZMP 936 working range) is an area, not a curve: that chart stays a picture
  const curves = d.chartData ? d.chartData.series.filter((q) => !(q.points.length <= 6 && q.points[0][0] === q.points[q.points.length - 1][0] && q.points[0][1] === q.points[q.points.length - 1][1])) : [];
  const cd = d.chartData && curves.length ? { ...d.chartData, series: curves } : null;
  if (cd) {
    chartBlock = { type: "perfchart", title: `${T.perf}: ${d.model}`, hint: PC[l].hint, chipsLabel: PC[l].chips, xName: PC[l].x, yName: PC[l].y, x: cd.x, y: cd.y,
      series: cd.series.map((q) => ({ name: seriesName(l, q.name), color: PC_COLOR[q.color] || q.color, points: q.points.map(([px, py]) => [Math.max(cd.x.min, px), Math.max(cd.y.min, py)]) })), ...(cd.areas ? { areas: cd.areas } : {}),
      ...(d.images.chart ? { alt: { src: d.images.chart.file, text: `${T.perf} ${d.model}`, show: PC[l].show, hide: PC[l].hide } } : {}) };
  } else if (d.images.chart) tiles.push({ title: T.perf, image: d.images.chart.file, alt: `${T.perf} ${d.model}` });
  const dimTile = d.images.dim ? { title: T.dims, image: d.images.dim.file, alt: `${T.dims} ${d.model}`, text: T.zoomHint } : null;
  // after the technical data: the graph and the drawing on one row (stacked on a phone) ...
  if (chartBlock && dimTile) out.push({ type: "columns", ratio: "50-50", left: [chartBlock], right: [{ type: "modules", layout: "tiles", columns: 1, narrow: true, zoom: true, more: false, items: [dimTile] }] });
  else if (chartBlock) out.push(chartBlock);
  else {
    const all = dimTile ? [...tiles, dimTile] : tiles;
    if (all.length) out.push({ type: "modules", layout: "tiles", columns: Math.min(2, all.length), ...(all.length === 1 ? { narrow: true, zoom: true } : {}), more: false, items: all });
  }
  // ... and under them, closed, the standard and optional equipment
  if (lists.length) out.push({ type: "list", ordered: false, collapsible: true, title: T.opts, items: lists.map(clean) });
  if (download) out.push({ type: "button", kind: "download", text: T.pdfName(d.model), href: d.file });
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
    if (b.type === "columns") for (const side of ["left", "right"]) for (const x of b[side] || []) if (x.type === "modules") for (const it of x.items) Object.assign(it, await dim(it.image));
    res.push(b);
  }
  return res;
}

const out = (rel, o) => { const f = path.join(ROOT, "content/pages", rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2) + "\n"); console.log("wrote", rel); };
const crumb = { type: "image", alt: "HÄNY", href: "/produkter/haeny", width: 832, height: 143, src: "/assets/img/haeny-1.webp" };
const date = "2026-10-25";
const genBlocks = (arr) => arr.map((b) => ({ ...b, gen: true }));
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const writeJson = (p, j) => { const raw = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : ""; const eol = raw.includes("\r\n") ? "\r\n" : "\n"; fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(j, null, 2).replace(/\n/g, eol) + eol); };
const pageFile = (p) => path.join(ROOT, "content/pages", p + ".json");

// ---------- the data of every model ----------
const DATA = {};
for (const fam of FAMILIES) for (const k of fam.models) DATA[k] = fixData(k, load(k));
const CCP = fixData("ccp", load("ccp"));

const modelTitle = (d) => `Häny ${d.model}`;

// ---------- one page per model ----------
// New pages are generated whole. The two older IC pages (IC 310 and IC 325 with CCP) keep their own text; the brochure data is added
// after their brochure button (gen blocks, replaced on every run).
const stripGen = (bl) => bl.filter((b) => !b.gen);
function insertAfterDownload(blocks, nth, add) {
  let seen = -1, at = -1;
  blocks.forEach((b, i) => { if (b.type === "button" && b.kind === "download") { seen++; if (seen === nth) at = i; } });
  if (at < 0) at = blocks.length - 1;
  return [...blocks.slice(0, at + 1), ...add, ...blocks.slice(at + 1)];
}
for (const fam of FAMILIES) {
  let n = 0;
  for (const k of fam.models) {
    const d = DATA[k]; const p = MODEL_PATH(fam, k); const file = pageFile(p);
    const sibs = fam.models.filter((x) => x !== k);
    const i18n = {};
    const existing = fs.existsSync(file) ? readJson(file) : null;
    for (const l of LANGS) {
      const T = L[l];
      const relatedItems = [{ href: FAM_PATH[fam.slug], mutual: false }, ...sibs.slice(Math.max(0, fam.models.indexOf(k) - 1), Math.max(0, fam.models.indexOf(k) - 1) + 3).map((x) => ({ href: MODEL_PATH(fam, x) }))];
      const keepOld = existing && existing.i18n[l] && (k === "ic310" || k === "ic325");
      if (keepOld) {
        const old = stripGen(existing.i18n[l].blocks);
        const add = genBlocks([{ type: "heading", level: 2, text: `${T.data}: ${d.model}` }, ...(await resolveBlocks(dataBlocks(l, k, d, { download: false })))]);
        let blocks = insertAfterDownload(old, 0, add);
        if (k === "ic325") {
          const addC = genBlocks([{ type: "heading", level: 2, text: `${T.data}: ${CCP.model}` }, ...(await resolveBlocks([...topBlocks(l, "ccp", CCP).slice(0, 0), ...dataBlocks(l, "ccp", CCP, { download: false })]))]);
          blocks = insertAfterDownload(blocks, 2, addC);
        }
        const last = blocks[blocks.length - 1];
        i18n[l] = { ...existing.i18n[l], title: k === "ic310" ? "IC 310" : existing.i18n[l].title, h1: k === "ic310" ? "HÄNY IC 310" : existing.i18n[l].h1, blocks };
      } else {
        const blocks = [{ ...crumb }, ...(await resolveBlocks([...topBlocks(l, k, d), { type: "button", kind: "download", text: T.pdfName(d.model), href: d.file }, ...dataBlocks(l, k, d, { download: false })])), { type: "text", html: T.contact }, { type: "related", title: T.back, items: relatedItems }];
        i18n[l] = { title: modelTitle(d), h1: modelTitle(d), description: `${tr(l, d.title)} ${d.model}. ${tr(l, d.intro)}`.slice(0, 200), blocks: genBlocks(blocks) };
        // the crumb picture is not generated content that a later run may drop: keep every block marked, the page is rebuilt whole
      }
    }
    writeJson(file, existing && (k === "ic310" || k === "ic325") ? { ...existing, path: p, updated: date, i18n } : { path: p, updated: date, template: "product", order: n, published: true, i18n });
    n++;
  }
}

// ---------- the family pages ----------
const keyOf = (fam, k, l) => { const d = DATA[k]; const p = pumpOf(d); return { title: d.model, image: tileOf(k), alt: `${d.title} ${d.model}`, href: MODEL_PATH(fam, k), bullets: [...(p ? [p] : []), ...keyFigures(d, l)] }; };
async function modelTiles(fam, l) {
  const items = [];
  for (const k of fam.models) {
    const it = keyOf(fam, k, l); const dd = await dim(it.image); items.push({ ...it, ...dd });
  }
  return { type: "modules", layout: "tiles", columns: fam.models.length > 8 ? 4 : 3, square: true, more: false, items };
}
// a comparison of the models: the labels that most models share, one column per model
function comparison(l, fam) {
  const ds = fam.models.map((k) => DATA[k]);
  const labels = [];
  const val = ds.map((d) => { const m = new Map(); for (const t of d.tables) for (const [lab, v] of t.rows) if (v && !m.has(lab)) m.set(lab, v); return m; });
  for (const m of val) for (const lab of m.keys()) if (!labels.includes(lab)) labels.push(lab);
  const keep = labels.filter((lab) => val.filter((m) => m.has(lab)).length >= Math.max(2, Math.ceil(ds.length * 0.6)) && !/connection|manifold/i.test(lab));
  if (ds.length < 2 || keep.length < 3) return null;
  return { type: "table", header: true, align: "center", rows: [[""].concat(ds.map((d) => d.model)), ...keep.map((lab) => [tr(l, lab)].concat(val.map((m) => (m.has(lab) ? tr(l, m.get(lab)) : "-"))))], links: [] };
}
for (const fam of FAMILIES) {
  const first = DATA[fam.models[0]];
  const pagePath = FAM_PATH[fam.slug];
  const file = pageFile(pagePath);
  const existing = fs.existsSync(file) ? readJson(file) : null;
  const i18n = {};
  for (const l of LANGS) {
    const T = L[l];
    const introText = fam.intro[l] + (fam.extra ? " " + fam.extra[l] : "");
    const tileImg = `/assets/img/haeny-tile-${FAM_TILE[fam.slug]}.webp`;
    const overview = [{ type: "heading", level: 2, text: T.overview }];
    if (first.features.length) overview.push({ type: "list", ordered: false, items: first.features.map((x) => clean(tr(l, x))) });
    const tilesBlock = await modelTiles(fam, l);
    const models = [{ type: "heading", level: 2, text: T.models }, tilesBlock];
    const uses = first.applications.length ? [{ type: "heading", level: 3, text: T.uses }, { type: "list", ordered: false, items: first.applications.map((x) => clean(tr(l, x))) }] : [];
    const cmp = fam.slug === "kompakta-anlaggningar" ? null : comparison(l, fam);
    const famSizes = [...new Set(fam.models.flatMap((k) => sizesOf(DATA[k])))].sort((a, b) => a - b);
    const compare = cmp ? [{ type: "heading", level: 2, text: T.compare }, ...(sizeBlock(l, famSizes) ? [sizeBlock(l, famSizes)] : []), cmp] : [];
    const see = fam.see ? [{ type: "related", items: [{ href: fam.see, mutual: true }] }] : [];
    let blocks;
    if (existing && fam.base) {
      // the older page is the base: its picture, heading and text stay, the generated sections come after the introduction
      const old = stripGen(existing.i18n[l].blocks);
      const li = old.findIndex((b) => b.type === "list");
      const top = old.slice(0, li < 0 ? 4 : li).map((b) => (b.type === "heading" && /FAIC/.test(b.text) ? { ...b, text: "Häny FAIC" } : b));
      const tail = old.slice(li < 0 ? 4 : li + 1).filter((b) => b.type !== "modules" && !(b.type === "text" && /kontakta-oss/.test(b.html) && b.html.length < 140));
      blocks = [...top, ...genBlocks([...overview, ...models, ...uses, ...compare]), ...tail, { type: "text", html: T.contact }];
      blocks = blocks.filter((b, i, a) => !(b.type === "text" && b.html === T.contact && a.findIndex((x) => x.type === "text" && x.html === T.contact) !== i));
    } else if (existing && fam.slug === "kompakta-anlaggningar") {
      // the IC page keeps its own text and its specification table: the three model tiles are replaced by tiles for every IC model
      const all = existing.i18n[l].blocks;
      let at = all.findIndex((b) => b.gen);
      const old = stripGen(all);
      let replace = 0;
      if (at < 0) { at = old.findIndex((b) => b.type === "modules"); replace = 1; }
      old.splice(at, replace, ...genBlocks([{ type: "heading", level: 2, text: T.models }, models[1]]));
      blocks = old;
    } else {
      blocks = [{ ...crumb }, { type: "columns", ratio: "40-60", left: [{ type: "image", alt: fam.title[l], ...(await dim(tileImg)), src: tileImg }], right: [{ type: "text", html: esc(introText) }, ...(first.features.length ? [{ type: "list", ordered: false, items: first.features.map((x) => clean(tr(l, x))) }] : [])] },
        ...genBlocks([{ type: "heading", level: 2, text: T.models }, models[1], ...uses, ...compare]), { type: "text", html: T.contact }, ...see];
    }
    i18n[l] = { title: existing && fam.base ? existing.i18n[l].title : fam.title[l], h1: existing && fam.base ? (fam.base ? fam.title[l] : existing.i18n[l].h1) : fam.title[l], description: introText.slice(0, 200), blocks };
    if (existing && fam.slug === "kompakta-anlaggningar") { i18n[l].title = existing.i18n[l].title; i18n[l].h1 = existing.i18n[l].h1; i18n[l].description = existing.i18n[l].description; }
  }
  if (existing) writeJson(file, { ...existing, updated: date, i18n });
  else writeJson(file, { path: pagePath, updated: date, template: "product", order: { blandare: 3, omrorare: 4, injekteringspumpar: 5 }[fam.slug] ?? 6, published: true, i18n });
  console.log("family", pagePath);
}

// ---------- MCM: no brochure, short page ----------
{
  const T = {
    sv: { title: "Mobila anläggningar (MCM)", text: "Häny MCM är mobila blandningsanläggningar för bentonit, flygaska, cement, filler, lera och liknande suspensioner till slitsmurar, jet grouting och alla typer av injekteringsprojekt. Broschyr finns på begäran." },
    en: { title: "Portable mixing plants (MCM)", text: "Häny's range of portable MCM mixing plants is suitable for mixing bentonite, fly ash, cement, filler, clay and similar suspensions for diaphragm walls, slurry walls, jet grouting and all types of grouting projects. A brochure is available on request." },
    es: { title: "Plantas de mezcla móviles (MCM)", text: "Las plantas de mezcla móviles Häny MCM son adecuadas para mezclar bentonita, cenizas volantes, cemento, filler, arcilla y suspensiones similares para muros pantalla, jet grouting y todo tipo de proyectos de inyección. Folleto disponible bajo pedido." },
    no: { title: "Mobile blandeanlegg (MCM)", text: "Häny MCM-blandeanlegg er mobile og egner seg for blanding av bentonitt, flyveaske, sement, filler, leire og lignende suspensjoner til slissemurer, jet grouting og alle typer injeksjonsprosjekter. Brosjyre på forespørsel." }
  };
  const i18n = {};
  for (const l of LANGS) i18n[l] = { title: T[l].title, h1: T[l].title, description: T[l].text.slice(0, 200), blocks: [{ ...crumb }, { type: "image", alt: T[l].title, ...(await dim("/assets/img/haeny-tile-mcm.webp")), src: "/assets/img/haeny-tile-mcm.webp" }, { type: "text", html: esc(T[l].text) }, { type: "text", html: L[l].contact }] };
  writeJson(pageFile(`${BASE}/mobila-anlaggningar`), { path: `${BASE}/mobila-anlaggningar`, updated: date, template: "product", order: 2, published: true, i18n });
}

// ---------- the Häny brand page: units, parts and (above the silos) the recording equipment as picture tiles ----------
const tileImage = (n) => `/assets/img/haeny-tile-${n}.webp`;
async function tileGroups(l) {
  const T = L[l];
  const tile = async (title, img, href) => ({ title, image: tileImage(img), alt: title, href, ...(await dim(tileImage(img))) });
  const fam = (slug) => FAMILIES.find((f) => f.slug === slug);
  const ccpTitle = { sv: "Kompakta PU-anläggningar (CCP)", en: "Compact PU plants (CCP)", es: "Plantas compactas PU (CCP)", no: "Kompakte PU-anlegg (CCP)" };
  const mcmTitle = { sv: "Mobila anläggningar (MCM)", en: "Portable mixing plants (MCM)", es: "Plantas de mezcla móviles (MCM)", no: "Mobile blandeanlegg (MCM)" };
  // complete units: IC, FAIC, CCP, MCM (CCP is the third)
  const units = [
    await tile(fam("kompakta-anlaggningar").title[l], "ic", FAM_PATH["kompakta-anlaggningar"]),
    await tile(fam("automatiska-anlaggningar").title[l], "faic", FAM_PATH["automatiska-anlaggningar"]),
    await tile(ccpTitle[l], "ccp", `${BASE}/manuella-pumpar/ic-325-ic325-ccp#ic325-ccp`),
    await tile(mcmTitle[l], "mcm", `${BASE}/mobila-anlaggningar`)
  ];
  const parts = [];
  for (const slug of ["blandare", "omrorare", "injekteringspumpar"]) parts.push(await tile(fam(slug).title[l], FAM_TILE[slug], FAM_PATH[slug]));
  const dpvTile = await tile(T.dpv, "dpv", `${BASE}/manuella-pumpar/dataloggare-dpv`);
  const mi = (it) => ({ title: it.title, href: it.href, image: it.image });
  return {
    menu: [{ title: T.units, items: units.map(mi) }, { title: T.parts, items: parts.map(mi) }, { title: T.reg, items: [mi(dpvTile)] }],
    main: genBlocks([{ type: "heading", level: 2, text: T.units }, { type: "modules", layout: "tiles", columns: 4, square: true, more: false, items: units }, { type: "heading", level: 2, text: T.parts }, { type: "modules", layout: "tiles", columns: 3, square: true, more: false, items: parts }]),
    reg: genBlocks([{ type: "heading", level: 2, text: T.reg }, { type: "modules", layout: "tiles", columns: 4, square: true, more: false, items: [await tile(T.dpv, "dpv", `${BASE}/manuella-pumpar/dataloggare-dpv`)] }])
  };
}
{
  const bf = path.join(ROOT, "content/pages/produkter/haeny.json");
  const j = readJson(bf);
  const REL = { mixer: "blandare", impeller: "blandare", agitator: "omrorare", plunger: "injekteringspumpar", pressure: "injekteringspumpar" };
  const OLD_PLUNGER = { sv: "Genomskärning av pumpmodulen", en: "Cross-section of the pump module", es: "Sección de la unidad de bomba", no: "Tverrsnitt av pumpemodulen" };
  for (const l of LANGS) {
    const bl = j.i18n[l].blocks.filter((b) => !b.gen);
    // where the old tile blocks were: before the technology heading
    const techAt = (() => { const c = bl.findIndex((b) => b.type === "columns"); return c > 0 && bl[c - 1].type === "heading" ? c - 1 : c; })();
    const tg = await tileGroups(l);
    bl.splice(techAt, 0, ...tg.main);
    const silo = bl.findIndex((b) => b.type === "columns" && b.left && b.left[0] && /ahlm-st-5-2/.test(b.left[0].src || ""));
    bl.splice(silo < 0 ? bl.length : silo, 0, ...tg.reg);
    // links of the technology sections now go to the family pages
    for (const b of bl) if (b.type === "columns") {
      const src = (b.left[0] && b.left[0].src) || "";
      const key = /tech-mixer|haeny-2\./.test(src) ? "mixer" : /haeny-3\./.test(src) ? "impeller" : /tech-agitator/.test(src) ? "agitator" : /tech-plunger|haeny-4\./.test(src) ? "plunger" : /haeny-5\./.test(src) ? "pressure" : null;
      if (!key) continue;
      // the flow-control section (picture 5) has no link to the pumps: the pumps are one section up
      // (and the impeller is part of the mixer: the one link under the mixer is enough)
      if (key === "pressure" || key === "impeller") { b.right = b.right.filter((x) => !(x.type === "related" && x.tech)); continue; }
      for (const x of b.right) if (x.type === "related" && x.tech) x.items = [{ href: FAM_PATH[REL[key]] }];
      // the plunger: the new single/double picture and, below it, the old cross-section drawing
      if (key === "plunger" && !b.left.some((x) => /haeny-4\.webp$/.test(x.src || ""))) {
        b.left.push({ type: "image", alt: OLD_PLUNGER[l], ...(await dim("/assets/img/haeny-4.webp")), src: "/assets/img/haeny-4.webp", caption: OLD_PLUNGER[l] });
      }
      // the cross-section is a tall drawing: shown at about a quarter of the width of the column (half of its earlier size)
      if (key === "plunger") for (const x of b.left) if (/haeny-4\.webp$/.test(x.src || "")) { delete x.maxWidth; delete x.align; x.imgWidth = 120; };
    }
    j.i18n[l].blocks = bl;
    j.i18n[l].menu = tg.menu;
  }
  writeJson(bf, j); console.log("updated produkter/haeny.json");
}

// ---------- tidy up: the finder hub and its sub pages are gone, their addresses forward to the pages that replace them ----------
{
  const HUB = `${BASE}/hitta-ratt-maskin`;
  const gone = [["", BASE], ["/blandare", FAM_PATH.blandare], ["/omrorare", FAM_PATH.omrorare], ["/injekteringspumpar", FAM_PATH.injekteringspumpar], ["/kompakta-anlaggningar", FAM_PATH["kompakta-anlaggningar"]], ["/mobila-anlaggningar", `${BASE}/mobila-anlaggningar`], ["/triplexpump", FAM_PATH.injekteringspumpar], ["/automatiska-anlaggningar", FAM_PATH["automatiska-anlaggningar"]]];
  for (const [sub] of gone) { const q = path.join(ROOT, "content/pages/produkter/haeny/hitta-ratt-maskin" + sub + ".json"); if (fs.existsSync(q)) { fs.rmSync(q); console.log("removed", HUB + sub); } }
  const dir = path.join(ROOT, "content/pages/produkter/haeny/hitta-ratt-maskin"); if (fs.existsSync(dir) && !fs.readdirSync(dir).length) fs.rmdirSync(dir);
  const rf = path.join(ROOT, "content/redirects.json"); const r = readJson(rf);
  for (const [sub, to] of gone) r[HUB + sub] = to;
  fs.writeFileSync(rf, JSON.stringify(r, null, 2) + "\n");
}

if (process.argv.includes("--strings")) { fs.writeFileSync(path.join(ROOT, "crawl/haeny-strings.json"), JSON.stringify([...STRINGS].sort(), null, 1)); console.log(STRINGS.size, "texts to translate -> crawl/haeny-strings.json"); }
const NOISE = /(BSP|TMP|GEKA|OUT|IN|GF|LC|min|bar|kVA|mm|Max)/g;
const untranslated = [...STRINGS].filter((x) => !I18N[x] && /[A-Za-z]{4,}/.test(x.replace(NOISE, ""))); if (untranslated.length) console.log("not translated yet:", untranslated.length, JSON.stringify(untranslated, null, 1));
