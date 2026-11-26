#!/usr/bin/env node
// Marini MR line (släntstabilisering): a page for each of the 12 rigs, like the MR-C pages, with the picture that turns into a 3D model,
// job-site photos, the key figures, technical data and the variant's brochure. Swedish and English (hidden in the other languages).
// Data: the specification table on /produkter/marini/släntstabilisering (Marini's brochure) and Marini's own model pages (marinidrills.com).
// Also: model tiles on the släntstabilisering page and on the family pages (MR 2, MR 3, MR 5, MR 6), and the 3D option on the MR-C pages.
//   node tools/marini-mr-pages.mjs
import fs from "node:fs";
import path from "node:path";
import { DESC, TX } from "./marini-mr-i18n.mjs";
const ROOT = path.resolve(import.meta.dirname, "..");
const PAGES = path.join(ROOT, "content/pages/produkter/marini");
const SL = "/produkter/marini/släntstabilisering";
const HIDE = ["lt", "lv", "et", "ru"]; // the Marini section is published in sv, en, es and no
const LANGS = ["sv", "en", "es", "no"];
// machines whose mast stands in the middle: turned by hand so they face like the rest (degrees, see src/js/viewer3d.js)
const YAW = { "mr-3-pn": -90, "mr-4-id": -90 };
const PIC = JSON.parse(fs.readFileSync(path.join(ROOT, "crawl/marini/3d-pictures.json"), "utf8"));
const PHOTOS = JSON.parse(fs.readFileSync(path.join(ROOT, "crawl/marini/mr-photos.json"), "utf8"));
const mb = (f, lang) => { const n = fs.statSync(path.join(ROOT, "assets-src/3d", f)).size / 1e6; return (n < 1 ? n.toFixed(1) : n.toFixed(1)).replace(".", lang === "en" ? "." : ",") + " MB"; };
const DOC = (n) => `/assets/docs/marini-slantstabilisering-${n}.pdf`;
const ACC = { ep120: "EP 120", ep95: "EP 95", ep160: "EP 160", ma3r: "MA 100 S 3R", ma90: "MA 90", id160: "ID 160", id300: "ID 300", id500: "ID 500", masid: "MA 100 S ID", mas2id: "MA 100 S 2 ID", maid: "MA 100 ID" };
// spec: drive, stroke (mm), weight (kg), feed (kN), retract (kN), clamp (mm), torque (Nm), speed (rpm), power unit (kW), max passage (mm)
const M = [
  { slug: "mr-1-pn", name: "MR 1", fam: null, pneu: true, spec: ["1260 - 1760", "180 - 200", "5.0", "5.0", "", "850", "40"], heads: ["ep120"], drifters: ["ma3r", "ma90"], doc: [DOC("las-mer"), "short"], photos: "mr-1-pn", wheels: "two",
    sv: "MR 1 är Marinis lättaste borrenhet för branta slänter. Den drivs med tryckluft och står på en rörram med två hjul, så den följer ojämn mark när den flyttas. MR 1 utrustas med en pneumatisk borrhammare, och matningen drivs av en pneumatisk lamell- eller kolvmotor.",
    en: "MR 1 is Marini's lightest drilling unit for steep slopes. It runs on compressed air and stands on a tubular frame with two wheels, so it follows uneven ground as it is moved. MR 1 is fitted with a pneumatic drifter, and the feed is driven by a pneumatic vane or piston motor." },
  { slug: "mr-2-pn", name: "MR 2 PN", fam: "mr-2", pneu: true, spec: ["1260 - 1760", "310 - 340", "9.5", "9.5", "", "850", "40 - 45"], heads: ["ep120"], drifters: ["ma3r"], doc: [DOC("mr-2-broschyr-2"), "pn"], photos: "mr-2-pn",
    sv: "MR 2 PN är Marinis storsäljare: en pneumatisk borrenhet för arbete i branta slänter. Den breda rörramen står på tre vridbara stöd som följer ojämn mark, och stöden kan vridas 90 grader så att riggen enkelt flyttas i sidled. MR 2 PN kan utrustas med ett pneumatiskt rotationshuvud för sänkhammare på 2, 3 och 4 tum eller med en pneumatisk borrhammare. Matningen drivs av en pneumatisk kolvmotor.",
    en: "MR 2 PN is Marini's best seller: a pneumatic drilling unit for work on steep slopes. The wide tubular frame stands on three swivelling supports that follow uneven ground, and the supports turn 90 degrees so the rig is easy to move sideways. MR 2 PN can take a pneumatic rotary head for 2, 3 and 4 inch down-the-hole hammers or a pneumatic drifter. The feed is driven by a pneumatic piston motor." },
  { slug: "mr-2-pn-80", name: "MR 2 PN 80", fam: "mr-2", pneu: true, spec: ["1260 - 1760", "380 - 410", "9.5", "9.5", "", "1200", "40 - 45"], heads: ["ep95", "ep120", "ep160"], drifters: ["ma3r"], doc: [DOC("mr-2-broschyr-2"), "pn"], photos: "mr-2-pn",
    sv: "MR 2 PN 80 bygger på samma breda ram med tre vridbara stöd som MR 2 PN, men tar större pneumatiska rotationshuvuden (EP 95, EP 120 och EP 160) och ger högre vridmoment, 1 200 Nm. Stöden kan vridas 90 grader för enkel förflyttning i sidled, och matningen drivs av en pneumatisk kolvmotor.",
    en: "MR 2 PN 80 is built on the same wide frame with three swivelling supports as the MR 2 PN, but takes larger pneumatic rotary heads (EP 95, EP 120 and EP 160) and gives more torque, 1,200 Nm. The supports turn 90 degrees for easy sideways moves, and the feed is driven by a pneumatic piston motor." },
  { slug: "mr-2-id-80", name: "MR 2 ID 80", fam: "mr-2", pneu: false, spec: ["1260 - 1760", "390 - 430", "10.0", "10.0", "25 - 115", "1600", "40 - 80"], unit: "20-E, 23-D", kw: "15 / 17 / 22", pass: "115 - 188", heads: ["id160"], drifters: ["masid"], doc: [DOC("mr-2-broschyr"), "id"], photos: "mr-2-id",
    sv: "MR 2 ID 80 är den hydrauliska versionen av MR 2: samma breda ram med tre vridbara stöd, men med hydraulisk matning via en inbyggd cylinder. Den kan utrustas med ett hydrauliskt rotationshuvud för sänkhammare upp till 5 tum eller med en hydropneumatisk borrhammare, och drivs av ett separat hydraulaggregat.",
    en: "MR 2 ID 80 is the hydraulic version of the MR 2: the same wide frame with three swivelling supports, but with hydraulic feed from a built-in cylinder. It can take a hydraulic rotary head for down-the-hole hammers up to 5 inches or a hydro-pneumatic drifter, and runs on a separate hydraulic power unit." },
  { slug: "mr-2-id-100", name: "MR 2 ID 100", fam: "mr-2", pneu: false, spec: ["1260 - 1760", "600 - 650", "15.0", "15.0", "25 - 118", "3500", "40"], unit: "40-E, 45-D", kw: "15 / 17 / 22", pass: "115 - 188", heads: ["id300"], drifters: ["mas2id"], doc: [DOC("mr-2-broschyr"), "id"], photos: "mr-2-id",
    sv: "MR 2 ID 100 är den kraftigaste i MR 2-familjen, med 15 kN matnings- och dragkraft och 3 500 Nm vridmoment. Ramen står på tre vridbara stöd som följer ojämn mark och kan vridas 90 grader för förflyttning i sidled. Matningen är hydraulisk med inbyggd cylinder, och riggen tar hydrauliska rotationshuvuden för sänkhammare upp till 5 tum eller en hydropneumatisk borrhammare.",
    en: "MR 2 ID 100 is the most powerful of the MR 2 family, with 15 kN of feed and retract force and 3,500 Nm of torque. The frame stands on three swivelling supports that follow uneven ground and turn 90 degrees for sideways moves. The feed is hydraulic with a built-in cylinder, and the rig takes hydraulic rotary heads for down-the-hole hammers up to 5 inches or a hydro-pneumatic drifter." },
  { slug: "mr-3-pn", name: "MR 3 PN", fam: "mr-3", pneu: true, spec: ["", "300", "", "9.5", "", "", ""], heads: ["ep120"], drifters: ["ma3r"], doc: [DOC("mr-3-broschyr-2"), "pn"], photos: "mr-3-pn",
    sv: "MR 3 PN är en pneumatisk borrenhet för branta slänter. Den breda rörramen står på medar som glider fram över ojämn mark när riggen flyttas. MR 3 PN kan utrustas med ett pneumatiskt rotationshuvud för sänkhammare på 2, 3 och 4 tum eller med en pneumatisk borrhammare, och matningen drivs av en pneumatisk kolvmotor.",
    en: "MR 3 PN is a pneumatic drilling unit for steep slopes. The wide tubular frame stands on skids that slide over uneven ground as the rig is moved. MR 3 PN can take a pneumatic rotary head for 2, 3 and 4 inch down-the-hole hammers or a pneumatic drifter, and the feed is driven by a pneumatic piston motor." },
  { slug: "mr-3-id", name: "MR 3 ID", fam: "mr-3", pneu: false, spec: ["", "450 - 650", "", "10.0 - 15.0", "", "", ""], unit: "20-E, 23-D", kw: "15 / 17 / 22", pass: "115 - 188", heads: ["id160"], drifters: ["masid"], doc: [DOC("mr-3-broschyr"), "id"], photos: "mr-3-id",
    sv: "MR 3 ID är den hydrauliska versionen av MR 3, med samma breda ram på medar som glider fram över ojämn mark. Matningen är hydraulisk med inbyggd cylinder, och riggen kan utrustas med ett hydrauliskt rotationshuvud för sänkhammare upp till 4 tum eller med en hydropneumatisk borrhammare.",
    en: "MR 3 ID is the hydraulic version of the MR 3, with the same wide frame on skids that slide over uneven ground. The feed is hydraulic with a built-in cylinder, and the rig can take a hydraulic rotary head for down-the-hole hammers up to 4 inches or a hydro-pneumatic drifter." },
  { slug: "mr-4-id", name: "MR 4 ID", fam: null, pneu: false, spec: ["1260 - 1760", "850 - 1100", "15.0", "25.0", "25 - 188", "5000", "40 - 80"], unit: "40-E, 45-D", kw: "15 / 17 / 22", pass: "115 - 188", heads: ["id500"], drifters: ["maid"], doc: [DOC("las-mer"), "short"], photos: "mr-4-id",
    sv: "MR 4 ID är den tyngsta riggen i MR-serien, byggd på en kraftig med för arbete i branta slänter. Den har 25 kN dragkraft och 5 000 Nm vridmoment, och tar hydrauliska rotationshuvuden för sänkhammare upp till 6 tum eller en hydraulisk borrhammare. Matningen sker med en inbyggd hydraulcylinder.",
    en: "MR 4 ID is the heaviest rig in the MR line, built on a heavy-duty skid for work on steep slopes. It has 25 kN of retract force and 5,000 Nm of torque, and takes hydraulic rotary heads for down-the-hole hammers up to 6 inches or a hydraulic drifter. The feed comes from a built-in hydraulic cylinder." },
  { slug: "mr-5-pn", name: "MR 5 PN", fam: "mr-5", pneu: true, spec: ["1260 - 1760", "390 - 460", "9.5", "9.5", "25 - 115", "1200", "40 - 45"], heads: ["ep120"], drifters: ["ma3r"], doc: [DOC("mr-5-broschyr-2"), "pn"], photos: "mr-5-pn",
    sv: "MR 5 PN står på en bred ram med fyra hjul som följer ojämn mark, och stöden kan vridas 90 grader så att riggen enkelt flyttas i sidled. Den drivs med tryckluft och kan utrustas med ett pneumatiskt rotationshuvud för sänkhammare upp till 4 tum eller med en pneumatisk borrhammare. Matningen drivs av en pneumatisk kolvmotor.",
    en: "MR 5 PN stands on a wide frame with four wheels that follow uneven ground, and the supports turn 90 degrees so the rig is easy to move sideways. It runs on compressed air and can take a pneumatic rotary head for down-the-hole hammers up to 4 inches or a pneumatic drifter. The feed is driven by a pneumatic piston motor." },
  { slug: "mr-5-id", name: "MR 5 ID", fam: "mr-5", pneu: false, spec: ["1260 - 1760", "400 - 460", "10.0", "10.0", "", "1600", "40 - 80"], unit: "20-E, 23-D", kw: "15 / 17 / 22", pass: "115 - 188", heads: ["id160"], drifters: ["masid"], doc: [DOC("mr-5-broschyr"), "id"], photos: "mr-5-id",
    sv: "MR 5 ID är den hydrauliska versionen av MR 5: samma breda ram med fyra hjul och stöd som vrids 90 grader för förflyttning i sidled. Matningen är hydraulisk med inbyggd cylinder, och riggen tar hydrauliska rotationshuvuden för sänkhammare upp till 4 tum eller en hydropneumatisk borrhammare.",
    en: "MR 5 ID is the hydraulic version of the MR 5: the same wide frame with four wheels and supports that turn 90 degrees for sideways moves. The feed is hydraulic with a built-in cylinder, and the rig takes hydraulic rotary heads for down-the-hole hammers up to 4 inches or a hydro-pneumatic drifter." },
  { slug: "mr-6-pn", name: "MR 6 PN", fam: "mr-6", pneu: true, spec: ["700 - 1200", "300 - 330", "9.5", "9.5", "25 - 115", "1200", "40 - 45"], heads: ["ep120"], drifters: ["ma3r"], doc: [DOC("mr-6-broschyr-ny-flik-2"), "pn"], photos: "mr-6-pn",
    sv: "MR 6 PN är en bärbar pneumatisk borrenhet för mikropålar inne i byggnader och i trånga utrymmen. Masten är modulär, så längden kan anpassas efter utrymmet, och allt styrs från en vridbar manöverpanel.",
    en: "MR 6 PN is a portable pneumatic drilling unit for micropiles inside buildings and in confined spaces. The mast is modular, so its length can be adapted to the space, and everything is controlled from a swivelling control panel." },
  { slug: "mr-6-id", name: "MR 6 ID", fam: "mr-6", pneu: false, spec: ["700 - 1200", "300 - 330", "6.0", "10.0", "25 - 115", "1600", "60"], unit: "20-E, 23-D", heads: [], drifters: [], doc: [DOC("mr-6-broschyr-ny-flik"), "id"], photos: null,
    sv: "MR 6 ID är en bärbar hydraulisk borrenhet för mikropålar inne i byggnader och i trånga utrymmen. Masten är modulär, så längden kan anpassas efter utrymmet, och allt styrs från en vridbar manöverpanel. Den drivs av ett separat hydraulaggregat.",
    en: "MR 6 ID is a portable hydraulic drilling unit for micropiles inside buildings and in confined spaces. The mast is modular, so its length can be adapted to the space, and everything is controlled from a swivelling control panel. It runs on a separate hydraulic power unit." },
];
const FAM = { "mr-2": "MR 2", "mr-3": "MR 3", "mr-5": "MR 5", "mr-6": "MR 6" };
const pathOf = (m) => `${SL}/${m.slug}`;

// ---------- numbers ----------
function num(v, lang) { // "1260 - 1760" -> "1 260 - 1 760" (sv) / "1,260 - 1,760" (en); "9.5" -> "9,5" (sv)
  return String(v).split(" - ").map((x) => { const [i, d] = x.trim().split("."); const g = i.replace(/\B(?=(\d{3})+(?!\d))/g, lang === "en" ? "," : " "); return d ? g + (lang === "en" ? "." : ",") + d : g; }).join(" - ");
}
const T = {
  sv: { drive: "Drift", air: "Pneumatisk (tryckluft)", hyd: "Hydraulisk", stroke: "Mastens slaglängd", weight: "Vikt", feed: "Matningskraft", retract: "Dragkraft (indragning)", clamp: "Klämområde", torque: "Vridmoment, rotation", speed: "Varvtal, rotation", unit: "Hydraulaggregat", kw: "Aggregatets effekt", pass: "Största genomgång", heads: "Rotationshuvuden", drifters: "Borrhammare", models: "Modeller", tech: "Teknisk data", specs: "Specifikationer", seeAlso: "Se även", contact: "<a href=\"/kontakta-oss\">Kontakta oss</a> för pris, leveranstid eller hjälp att välja rätt modell.", fits: "Passande utrustning", source: "Uppgifterna är hämtade ur Marinis broschyr och från marinidrills.com.", brochure: { pn: "Broschyr (pneumatisk)", id: "Broschyr (hydraulisk)", short: "Kort broschyr (ENG)" }, threeD: "3D-modell", logo: "Marini logotyp", seo: "borrigg för släntstabilisering", desc: (m) => `${m.name} är en ${m.pneu ? "pneumatisk" : "hydraulisk"} borrenhet ur Marinis MR-serie för släntstabilisering och mikropålning. Se den i 3D, med teknisk data och broschyr.`, tile: (m) => [m.pneu ? "Pneumatisk" : "Hydraulisk", `Vikt: ${num(m.spec[1], "sv")} kg`] },
  en: { drive: "Drive", air: "Pneumatic (compressed air)", hyd: "Hydraulic", stroke: "Mast stroke", weight: "Weight", feed: "Feed force", retract: "Retract force", clamp: "Clamp range", torque: "Rotary torque", speed: "Rotary speed", unit: "Hydraulic power unit", kw: "Power unit output", pass: "Max. passage", heads: "Rotary heads", drifters: "Drifters", models: "Models", tech: "Technical data", specs: "Specifications", seeAlso: "See also", contact: "<a href=\"/kontakta-oss\">Contact us</a> for price, delivery time or help choosing the right model.", fits: "Matching equipment", source: "The figures come from Marini's brochure and marinidrills.com.", brochure: { pn: "Brochure (pneumatic)", id: "Brochure (hydraulic)", short: "Short brochure (ENG)" }, threeD: "3D model", logo: "Marini logo", seo: "drill rig for slope stabilisation", desc: (m) => `${m.name} is a ${m.pneu ? "pneumatic" : "hydraulic"} drilling unit from Marini's MR line for slope stabilisation and micropiling. See it in 3D, with technical data and brochure.`, tile: (m) => [m.pneu ? "Pneumatic" : "Hydraulic", `Weight: ${num(m.spec[1], "en")} kg`] },
  ...TX,
};
function rows(m, l) {
  const t = T[l], [stroke, weight, feed, retract, clamp, torque, speed] = m.spec, r = [];
  r.push([t.drive, m.pneu ? t.air : t.hyd]);
  if (stroke) r.push([t.stroke, num(stroke, l) + " mm"]);
  if (feed) r.push([t.feed, num(feed, l) + " kN"]);
  if (retract) r.push([t.retract, num(retract, l) + " kN"]);
  if (torque) r.push([t.torque, num(torque, l) + " Nm"]);
  if (speed) r.push([t.speed, num(speed, l) + " rpm"]);
  if (clamp) r.push([t.clamp, num(clamp, l) + " mm"]);
  if (m.pass) r.push([t.pass, num(m.pass, l) + " mm"]);
  r.push([t.weight, num(weight, l) + " kg"]);
  if (m.unit) r.push([t.unit, m.unit]);
  if (m.kw) r.push([t.kw, m.kw + " kW"]);
  return r;
}
function keyList(m, l) {
  const all = rows(m, l), want = [T[l].drive, T[l].feed, T[l].retract, T[l].torque, T[l].stroke, T[l].weight];
  return want.map((w) => all.find((r) => r[0] === w)).filter(Boolean).map((r) => `${r[0]}: ${r[1]}`);
}
const siblings = (m) => M.filter((x) => x !== m && (m.fam ? x.fam === m.fam : false));
function page(m, i) {
  const pic = PIC[m.slug], photos = m.photos ? PHOTOS[m.photos] : [];
  const i18n = {};
  for (const l of LANGS) {
    const t = T[l], name = `Marini ${m.name}`, text = m[l] || DESC[m.slug][l];
    const fits = [...(m.heads.length ? [`${t.heads}: ${m.heads.map((k) => ACC[k]).join(", ")}`] : []), ...(m.drifters.length ? [`${t.drifters}: ${m.drifters.map((k) => ACC[k]).join(", ")}`] : []), ...(m.unit ? [`${t.unit}: ${m.unit}`] : [])];
    const rel = [...(m.fam ? [{ href: `${SL}/${m.fam}` }] : [{ href: SL, mutual: false }]), ...siblings(m).map((x) => ({ href: pathOf(x) }))].slice(0, 4);
    i18n[l] = {
      title: m.name, h1: name,
      seoTitle: `${name} ${t.seo} | Betongakuten`,
      description: t.desc(m),
      blocks: [
        { type: "image", alt: t.logo, href: "/produkter/marini", width: 637, height: 86, src: "/assets/img/logo-marini.webp", gen: true },
        { type: "model3d", src: `/assets/3d/marini-${m.slug}.bkm`, poster: `/assets/img/marini-mr-${m.slug}-iso.webp`, alt: name, label: `${name}, ${t.threeD}`, size: mb(`marini-${m.slug}.bkm`, l), ...(YAW[m.slug] ? { yaw: YAW[m.slug] } : {}), gen: true },
        { type: "text", html: text, gen: true },
        { type: "list", ordered: false, items: keyList(m, l), gen: true },
        ...(fits.length ? [{ type: "heading", level: 3, text: t.fits, gen: true }, { type: "list", ordered: false, items: fits, gen: true }] : []),
        { type: "text", html: t.contact, gen: true },
        ...(photos.length > 1 ? [{ type: "carousel", autoplay: true, interval: 6, items: photos.map((p, k) => ({ src: `/assets/img/${p}.webp`, alt: `${name} (${k + 1}/${photos.length})`, width: 1400, height: 1050 })), gen: true }] : photos.length === 1 ? [{ type: "image", src: `/assets/img/${photos[0]}.webp`, alt: name, width: 1400, height: 1050, gen: true }] : []),
        { type: "button", kind: "download", text: t.brochure[m.doc[1]], href: m.doc[0], gen: true },
        { type: "datasheet", title: t.tech, tagline: name, intro: [], groups: [{ title: t.specs, rows: rows(m, l).map(([label, metric]) => ({ label, metric })) }], note: "", source: t.source, gen: true },
        { type: "related", title: t.seeAlso, items: rel, gen: true },
      ],
    };
  }
  return { path: pathOf(m), updated: "2026-11-26", template: "product", order: 10 + i, published: true, hideIn: HIDE, hero: { image: "/assets/img/marini-slantstabilisering-hero.webp" }, source: { url: `https://www.marinidrills.com/en/macchine-marini/${m.slug}/` }, i18n };
}
// ---------- write the model pages ----------
fs.mkdirSync(path.join(PAGES, "slantstabilisering"), { recursive: true });
M.forEach((m, i) => fs.writeFileSync(path.join(PAGES, "slantstabilisering", m.slug + ".json"), JSON.stringify(page(m, i), null, 2) + "\n"));
// ---------- tiles ----------
const tiles = (list, l) => ({ type: "modules", layout: "tiles", columns: 4, square: true, more: false, items: list.map((m) => ({ title: m.name, image: `/assets/img/marini-mr-${m.slug}-tile.webp`, alt: `Marini ${m.name}`, href: pathOf(m), bullets: T[l].tile(m, num), width: 1000, height: 1000 })), gen: true });
const ORDER = ["mr-1-pn", "mr-2-pn", "mr-2-pn-80", "mr-2-id-80", "mr-2-id-100", "mr-3-pn", "mr-3-id", "mr-4-id", "mr-5-pn", "mr-5-id", "mr-6-pn", "mr-6-id"].map((s) => M.find((m) => m.slug === s));
function edit(file, fn) { const f = path.join(PAGES, file), raw = fs.readFileSync(f, "utf8"), p = JSON.parse(raw); fn(p); p.updated = "2026-11-26"; fs.writeFileSync(f, JSON.stringify(p, null, 2) + (raw.endsWith("\n") ? "\n" : "")); }
// the släntstabilisering page: the family cards become one tile per rig (sv, en, es, no)
edit("slantstabilisering.json", (p) => {
  for (const l of LANGS) {
    if (!p.i18n[l]) continue;
    const b = p.i18n[l].blocks.filter((x) => !(x.gen && (x.type === "modules" || (x.type === "heading" && x.text === T[l].models))));
    const k = b.findIndex((x) => x.type === "modules");
    const add = [{ type: "heading", level: 2, text: T[l].models, gen: true }, { ...tiles(ORDER, l) }];
    if (k >= 0) b.splice(k, 1, ...add); else b.splice(b.findIndex((x) => x.type === "heading"), 0, ...add);
    p.i18n[l].blocks = b;
  }
});
// the family pages: their rigs as tiles after the intro (sv, en, es, no)
for (const [fam, title] of Object.entries(FAM)) {
  edit(`slantstabilisering/${fam}.json`, (p) => {
    for (const l of LANGS) {
      if (!p.i18n[l]) continue;
      const b = p.i18n[l].blocks.filter((x) => !x.gen || x.type === "image");
      const k = b.findIndex((x) => x.type === "modules");
      const list = ORDER.filter((m) => m.fam === fam);
      b.splice(k >= 0 ? k : b.length, 0, { type: "heading", level: 2, text: `${T[l].models} ${title}`, gen: true }, { ...tiles(list, l), columns: Math.min(4, Math.max(2, list.length)) });
      p.i18n[l].blocks = b;
    }
  });
}
// ---------- MR-C: the picture becomes the 3D picture ----------
const MRC = { "mr-c-10": "mr-c-10", "mr-c-15": "mr-c-15", "mr-c-20": "mr-c-20", "mr-c-20p": "mr-c-20-p", "mr-c-30": "mr-c-30", "mr-c-35": "mr-c-35", "mr-c-50": "mr-c-50", "mr-c-80": "mr-c-80", "mr-c-85": "mr-c-85", "mr-c-90": "mr-c-90", "mr-c-95": "mr-c-95" };
for (const f of fs.readdirSync(path.join(PAGES, "crawlers"))) {
  const slug = f.replace(".json", ""), model = MRC[slug], pic = PIC[slug];
  edit(`crawlers/${f}`, (p) => {
    for (const [l, t] of Object.entries(p.i18n)) {
      t.blocks = t.blocks.map((b) => {
        const isIso = (b.type === "image" && /marini-mrc-.*-iso\.webp$/.test(b.src || "")) || (b.type === "model3d");
        if (!isIso) return b;
        const name = (b.alt || b.label || "").replace(/, 3D.*$/, "") || `Marini ${slug.toUpperCase()}`;
        if (!model) return { type: "image", alt: name, src: `/assets/img/marini-mrc-${slug}-iso.webp`, file: `/assets/img/marini-mrc-${slug}-iso.webp`, width: pic.width, height: pic.height, source: "3D model, marinidrills.com", gen: true };
        return { type: "model3d", src: `/assets/3d/marini-${model}.bkm`, poster: `/assets/img/marini-mrc-${slug}-iso.webp`, alt: name, label: `${name}, ${(T[l] || T.en).threeD}`, size: mb(`marini-${model}.bkm`, l), gen: true };
      });
      const k = t.blocks.findIndex((b) => b.type === "model3d");
      if (k >= 0 && t.blocks[k + 1] && t.blocks[k + 1].type === "carousel") {
        const [car] = t.blocks.splice(k + 1, 1);
        let j = k + 1; while (t.blocks[j] && /^(text|list|heading)$/.test(t.blocks[j].type)) j++;
        t.blocks.splice(j, 0, car);
      }
    }
  });
}
console.log("written", M.length, "MR pages; släntstabilisering, families and MR-C pages updated");
// galleries go after the documents and technical data
(await import("./gallery-order.mjs")).run();
