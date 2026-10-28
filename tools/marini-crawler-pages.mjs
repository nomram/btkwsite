#!/usr/bin/env node
// One page per Marini MR-C crawler (/produkter/marini/crawlers/<model>) from crawl/marini/crawlers.json (tools/marini-crawlers.mjs), in sv / en / es / no.
// The family page /produkter/marini/crawlers gets a tile per model and a specification table rebuilt from the same data (it linked nothing and had the
// rotary torque in daNm labelled as Nm). Run again after changing the data: generated blocks carry "gen": true.
//   node tools/marini-crawlers.mjs && node tools/marini-crawler-pages.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const IMG = path.join(ROOT, "assets-src/img");
const FAMILY = "/produkter/marini/crawlers";
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, "crawl/marini/crawlers.json"), "utf8"));
const LANGS = ["sv", "en", "es", "no"];
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const date = new Date().toISOString().slice(0, 10);
const dimOf = async (file) => { const m = await sharp(path.join(IMG, path.basename(file))).metadata(); return { width: m.width, height: m.height }; };

// ---------- numbers: the brochure writes 1.260 for 1,260 and 4.26 for 4.26 ----------
const nums = (s) => (String(s).replace(/(\d)\.(\d{3})(?!\d)/g, "$1$2").match(/\d+(?:\.\d+)?/g) || []).map(Number);
const SEP = { en: [",", "."], es: [".", ","], sv: [" ", ","], no: [" ", ","] };
const num = (n, l, group = true) => {
  const [th, dec] = SEP[l]; const [i, f] = String(Math.round(n * 100) / 100).split(".");
  return (group ? i.replace(/\B(?=(\d{3})+(?!\d))/g, th) : i) + (f ? dec + f : "");
};
const joiner = (s) => (/\+/.test(s) ? " + " : " - ");
const rng = (s, l, f = (x) => x, group = true) => nums(s).map((n) => num(f(n), l, group)).join(joiner(s));
// "1.260 - 1.760 mm / 4.1 - 5.7 ft" -> { metric: "1,260 - 1,760 mm", us: "4.1 - 5.7 ft" }
function pair(raw, l, key) {
  const [a, b = ""] = String(raw).split(" / ");
  const unit = (x) => x.replace(/\bKw\b/i, "kW").replace(/\bHp\b/i, "hp").replace(/\bKg\b/, "kg").replace(/\bft\*lb\b/, "ft·lb");
  const one = (x) => { const u = (x.match(/[A-Za-z·*]+(?:\*[a-z]+)?\s*$/) || [""])[0].trim(); return rng(x, l) + (u ? " " + unit(u) : ""); };
  let us = b ? one(b) : "";
  if (key === "stroke") us = us.replace(/lbf$/, "ft"); // the catalogue prints "lbf" for the feet of MR-C 20 and 20P
  return { metric: one(a), us };
}

// ---------- texts ----------
const TX = {
  sv: { data: "Teknisk data", spec: "Specifikationer", methods: "Borrmetoder", docs: "Dokument", source: "Uppgifterna är hämtade ur Marinis produktkatalog (engelska).", side: "Sidovy", sideHint: "Håll muspekaren över ritningen (eller tryck och dra) för 2× förstoring.", variants: "Varianter", up: "Se även", all: "Alla larvriggar", contact: '<a href="/kontakta-oss">Kontakta oss</a> för pris, leveranstid eller hjälp att välja rätt modell.', models: "Modeller", family: "Larvriggar i MR-C-serien",
    lab: { engine: "Motoreffekt", stroke: "Mastens slaglängd", feed: "Matningskraft", retract: "Dragkraft (indragning)", torque: "Vridmoment, rotation", speed: "Varvtal, rotation", clamp: "Klämområde", weight: "Vikt" },
    key: { engine: "Motoreffekt", feed: "Matningskraft", torque: "Vridmoment", weight: "Vikt", stroke: "Mastens slaglängd" },
    meth: { rotation: "Rotationsborrning", percussion: "Slagborrning", doubleHead: "Dubbelhuvud (två borrhuvuden)", jet: "Jet grouting", hollow: "Slagborrning med självborrande stänger (hollow bar)" },
    intro: (d, e, w) => `${d} är en hydraulisk larvrigg ur Marinis MR-C-serie med ${e} motor och en vikt på ${w}.`,
    A: "A efter modellnumret står för Attachment: masten är avtagbar, vilket gör riggen lättare att transportera.", P: "P efter modellnumret står för Power: en kraftfullare version av modellen med högre motoreffekt.",
    use: { small: "Kompakt och kraftfull nog för mindre projekt.", indoor: "Optimal modell, specialanpassad för inomhusarbete.", big: "Konstruerad för större och djupare borrhål, med högre kapacitet och kraft." } },
  en: { data: "Technical data", spec: "Specifications", methods: "Drilling methods", docs: "Documents", source: "Information taken from Marini's product catalogue.", side: "Side view", sideHint: "Hover over the drawing (or touch and drag) for a 2× magnifier.", variants: "Variants", up: "See also", all: "All crawler rigs", contact: '<a href="/kontakta-oss">Contact us</a> for price, delivery time or help choosing the right model.', models: "Models", family: "Crawler drill rigs of the MR-C line",
    lab: { engine: "Engine power", stroke: "Mast stroke", feed: "Feed force", retract: "Retract force", torque: "Rotary torque", speed: "Rotary speed range", clamp: "Clamp range", weight: "Weight" },
    key: { engine: "Engine power", feed: "Feed force", torque: "Rotary torque", weight: "Weight", stroke: "Mast stroke" },
    meth: { rotation: "Rotation drilling", percussion: "Percussion drilling", doubleHead: "Double head (two drill heads)", jet: "Jet grouting", hollow: "Percussion drilling with hollow bars" },
    intro: (d, e, w) => `${d} is a hydraulic crawler drill rig from Marini's MR-C line with a ${e} engine and a weight of ${w}.`,
    A: "The A after the model number stands for Attachment: the mast can be removed, which makes the rig easier to transport.", P: "The P after the model number stands for Power: a stronger version of the model with a higher engine output.",
    use: { small: "Compact and powerful enough for smaller projects.", indoor: "The optimal model, specially adapted for indoor work.", big: "Built for larger and deeper holes, with higher capacity and force." } },
  es: { data: "Datos técnicos", spec: "Especificaciones", methods: "Métodos de perforación", docs: "Documentos", source: "Información tomada del catálogo de productos de Marini.", side: "Vista lateral", sideHint: "Pase el cursor sobre el plano (o toque y arrastre) para una lupa 2×.", variants: "Variantes", up: "Véase también", all: "Todas las perforadoras de orugas", contact: '<a href="/kontakta-oss">Contáctenos</a> para precio, plazo de entrega o ayuda para elegir el modelo adecuado.', models: "Modelos", family: "Perforadoras de orugas de la serie MR-C",
    lab: { engine: "Potencia del motor", stroke: "Carrera del mástil", feed: "Fuerza de empuje", retract: "Fuerza de retroceso", torque: "Par de rotación", speed: "Velocidad de rotación", clamp: "Rango de mordaza", weight: "Peso" },
    key: { engine: "Potencia del motor", feed: "Fuerza de empuje", torque: "Par de rotación", weight: "Peso", stroke: "Carrera del mástil" },
    meth: { rotation: "Perforación a rotación", percussion: "Perforación a percusión", doubleHead: "Doble cabezal (dos cabezales de perforación)", jet: "Jet grouting", hollow: "Perforación a percusión con barras huecas" },
    intro: (d, e, w) => `${d} es una perforadora hidráulica de orugas de la serie MR-C de Marini, con motor de ${e} y un peso de ${w}.`,
    A: "La A tras el número del modelo significa Attachment: el mástil es desmontable, lo que facilita el transporte de la máquina.", P: "La P tras el número del modelo significa Power: una versión más potente del modelo, con mayor potencia de motor.",
    use: { small: "Compacta y lo bastante potente para proyectos pequeños.", indoor: "El modelo óptimo, adaptado especialmente para trabajos en interiores.", big: "Diseñada para barrenos más grandes y profundos, con mayor capacidad y fuerza." } },
  no: { data: "Tekniske data", spec: "Spesifikasjoner", methods: "Boremetoder", docs: "Dokumenter", source: "Opplysningene er hentet fra Marinis produktkatalog (engelsk).", side: "Sideriss", sideHint: "Hold musepekeren over tegningen (eller trykk og dra) for 2× forstørrelse.", variants: "Varianter", up: "Se også", all: "Alle beltegående borerigger", contact: '<a href="/kontakta-oss">Kontakt oss</a> for pris, leveringstid eller hjelp til å velge riktig modell.', models: "Modeller", family: "Beltegående borerigger i MR-C-serien",
    lab: { engine: "Motoreffekt", stroke: "Mastens slaglengde", feed: "Matekraft", retract: "Trekkraft (inndraging)", torque: "Dreiemoment, rotasjon", speed: "Turtall, rotasjon", clamp: "Klemmeområde", weight: "Vekt" },
    key: { engine: "Motoreffekt", feed: "Matekraft", torque: "Dreiemoment", weight: "Vekt", stroke: "Mastens slaglengde" },
    meth: { rotation: "Rotasjonsboring", percussion: "Slagboring", doubleHead: "Dobbelthode (to borhoder)", jet: "Jet grouting", hollow: "Slagboring med hule stenger (hollow bar)" },
    intro: (d, e, w) => `${d} er en hydraulisk beltegående borerigg i Marinis MR-C-serie med ${e} motor og en vekt på ${w}.`,
    A: "A etter modellnummeret står for Attachment: masten kan tas av, noe som gjør riggen lettere å transportere.", P: "P etter modellnummeret står for Power: en kraftigere versjon av modellen med høyere motoreffekt.",
    use: { small: "Kompakt og kraftig nok for mindre prosjekter.", indoor: "Den optimale modellen, spesialtilpasset for innendørs arbeid.", big: "Konstruert for større og dypere borehull, med høyere kapasitet og kraft." } }
};
const USE = { "mr-c-10": "small", "mr-c-15": "small", "mr-c-30": "indoor", "mr-c-90": "big", "mr-c-95": "big", "mr-c-95p": "big" };
const VIDEO = { "mr-c-20": { id: "5y1Mfj7Iy6E", title: "Marini Srl - MR-C 20 crawler drill rig" }, "mr-c-90": { id: "lh-WhCWMr9I", title: "Marini Srl - MR-C 90 long reach drill rig (technical info)" } };
const COUNTERPART = { "mr-c-20": "mr-c-20p", "mr-c-20p": "mr-c-20", "mr-c-35": "mr-c-35a", "mr-c-35a": "mr-c-35", "mr-c-85": "mr-c-85a", "mr-c-85a": "mr-c-85", "mr-c-95": "mr-c-95p", "mr-c-95p": "mr-c-95" };
const metricOf = (spec) => Object.fromEntries(Object.entries(spec).map(([k, v]) => [k, String(v).split(" / ")[0]]));
const hpOf = (spec) => String(spec.engine).split(" / ")[1] || "";
const pathOf = (s) => `${FAMILY}/${s}`;

// ---------- tiles: every picture the same square, the machine trimmed and fitted in the same box ----------
for (const m of DATA.models) {
  const src = path.join(IMG, `marini-mrc-${m.slug}-iso.webp`);
  const t = await sharp(src).flatten({ background: "#fff" }).trim({ threshold: 12 }).toBuffer();
  const fitted = await sharp(t).resize({ width: 880, height: 820, fit: "inside", kernel: "lanczos3" }).toBuffer();
  await sharp({ create: { width: 1000, height: 1000, channels: 3, background: "#ffffff" } }).composite([{ input: fitted, gravity: "centre" }]).webp({ quality: 88 }).toFile(path.join(IMG, `marini-mrc-${m.slug}-tile.webp`));
}

// ---------- the family page (read first: documents and logo are taken from it) ----------
const famFile = path.join(ROOT, "content/pages/produkter/marini/crawlers.json");
const famRaw = fs.readFileSync(famFile, "utf8"); const eol = famRaw.includes("\r\n") ? "\r\n" : "\n"; const fam = JSON.parse(famRaw);
const writeJson = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2).replace(/\n/g, eol) + eol); };

// ---------- one page per model ----------
const bullet = (l, m) => {
  const s = metricOf(m.spec), T = TX[l];
  const out = [];
  out.push(`${T.key.engine}: ${rng(s.engine, l)} kW`);
  out.push(`${T.key.feed}: ${rng(s.feed, l, (x) => x / 100)} kN`);
  out.push(`${T.key.torque}: ${rng(s.torque, l, (x) => x * 10)} Nm`);
  out.push(`${T.key.stroke}: ${rng(s.stroke, l)} mm`);
  out.push(`${T.key.weight}: ${rng(s.weight, l)} kg`);
  return out;
};
const order = DATA.models.map((m) => m.slug);
let n = 0;
for (const m of DATA.models) {
  const i18n = {};
  const iso = m.images.iso;
  const photos = [m.images.iso2, ...m.images.photos, m.images.field].filter(Boolean);
  const mi = order.indexOf(m.slug);
  const near = [COUNTERPART[m.slug], order[mi - 1], order[mi + 1], order[mi + 2]].filter(Boolean).filter((x, i, a) => a.indexOf(x) === i && x !== m.slug).slice(0, 3);
  for (const l of LANGS) {
    const T = TX[l], s = metricOf(m.spec);
    const keyHead = (m.name.endsWith("A") ? 1 : 0) + (m.name.endsWith("P") ? 2 : 0);
    const intro = [T.intro(m.name, `${rng(s.engine, l)} kW`, `${rng(s.weight, l)} kg`), keyHead === 1 ? T.A : keyHead === 2 ? T.P : "", T.use[USE[m.slug]] || ""].filter(Boolean).join(" ");
    const methods = [];
    for (const k of ["rotation", "percussion", "doubleHead", "jet"]) if (m.apps[k]) methods.push(T.meth[k]);
    if (m.hollowBars) methods.push(T.meth.hollow);
    const rows = Object.keys(T.lab).map((k) => ({ label: T.lab[k], metric: pair(m.spec[k], l, k).metric })); // metric only, the catalogue's imperial figures are left out
    const docsBlocks = fam.i18n[l].blocks.filter((b) => b.type === "button" && b.kind === "download" && /produktkatalog/.test(b.href)); // the full catalogue, not the short brochure
    const blocks = [
      { type: "image", alt: "Marini logotyp", href: "/produkter/marini", width: 637, height: 86, src: "/assets/img/logo-marini.webp" },
      { type: "image", alt: `Marini ${m.name}`, ...iso, src: iso.file },
      ...(photos.length ? [{ type: "carousel", autoplay: photos.length > 1, interval: 6, items: photos.map((p, k) => ({ src: p.file, alt: `Marini ${m.name} (${k + 1}/${photos.length})`, width: p.width, height: p.height })) }] : []),
      { type: "text", html: esc(intro) },
      { type: "list", ordered: false, items: bullet(l, m) },
      { type: "heading", level: 3, text: T.methods },
      { type: "list", ordered: false, items: methods },
      { type: "text", html: T.contact },
      ...docsBlocks,
      { type: "datasheet", title: T.data, tagline: `Marini ${m.name}`, intro: [], groups: [{ title: T.spec, rows }], note: "", source: T.source },
      ...(m.images.side ? [{ type: "modules", layout: "tiles", columns: 1, narrow: true, zoom: true, more: false, items: [{ title: T.side, image: m.images.side.file, alt: `${T.side} ${m.name}`, text: T.sideHint, ...m.images.side }] }] : []),
      ...(VIDEO[m.slug] ? [{ type: "video", provider: "youtube", id: VIDEO[m.slug].id, title: VIDEO[m.slug].title }] : []),
      { type: "related", title: T.up, items: [{ href: FAMILY, mutual: false }, ...near.map((x) => ({ href: pathOf(x) }))] }
    ].map((b) => ({ ...b, gen: true }));
    i18n[l] = { title: m.name, h1: `Marini ${m.name}`, description: intro.slice(0, 200), blocks };
  }
  writeJson(path.join(ROOT, "content/pages/produkter/marini/crawlers", m.slug + ".json"), { path: pathOf(m.slug), updated: date, template: "product", order: n++, published: true, hero: fam.hero, i18n });
}

// ---------- the family page: tiles and the table ----------
const tileItems = async (l) => Promise.all(DATA.models.map(async (m) => ({ title: m.name, image: `/assets/img/marini-mrc-${m.slug}-tile.webp`, alt: `Marini ${m.name}`, href: pathOf(m.slug), bullets: [`${TX[l].key.engine}: ${rng(metricOf(m.spec).engine, l)} kW`, `${TX[l].key.weight}: ${rng(metricOf(m.spec).weight, l)} kg`], ...(await dimOf(`marini-mrc-${m.slug}-tile.webp`)) })));
const tableRows = (head) => {
  const plain = (s, f) => nums(s).map((x) => Math.round(f(x) * 100) / 100);
  const join = (a, sp) => a.join(sp);
  return [head.filter((h) => !/horsepower|\bhp\b|hästkrafter|caballos|hestekrefter/i.test(h)), ...DATA.models.map((m) => {
    const s = metricOf(m.spec), id = (x) => x;
    return [m.name, join(plain(s.feed, (x) => x / 100), "-"), join(plain(s.engine, id), "-"), join(plain(s.weight, id), " + "), join(plain(s.stroke, id), " - "), join(plain(s.torque, (x) => x * 10), " - "), join(plain(s.speed, id), " - "), join(plain(s.clamp, id), " - ")];
  })];
};
for (const l of LANGS) {
  const bl = fam.i18n[l].blocks.filter((b) => !(b.gen && b.type !== "table") && !(b.type === "button" && /kort-broschyr/.test(b.href || ""))); // (the table stays where it is and is rebuilt in place)
  const ti = bl.findIndex((b) => b.type === "table");
  const old = bl[ti];
  bl[ti] = { ...old, rows: tableRows(old.rows[0]), links: DATA.models.map((m) => pathOf(m.slug)), gen: true };
  const tiles = [{ type: "heading", level: 2, text: TX[l].models, gen: true }, { type: "modules", layout: "tiles", columns: 4, square: true, more: false, items: await tileItems(l), gen: true }];
  const firstTextAfterIntro = bl.findIndex((b) => b.type === "button" && b.kind === "download");
  bl.splice(Math.max(0, firstTextAfterIntro), 0, ...tiles);
  fam.i18n[l].blocks = bl;
}
fam.updated = date;
writeJson(famFile, fam);
console.log(`Marini crawlers: ${DATA.models.length} model pages and the family page`);
