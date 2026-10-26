#!/usr/bin/env node
// Ecobeton: consumption / coverage per product, as a "stat" block at the bottom right of the intro text.
// The figures are from each product's technical data sheet (assets-src/docs/ecobeton-*-tds.pdf; the sheets are scanned text, read by eye):
//   Vetrofluid 2-4 m2 per litre (400 g/m2), Everwood 6-8 m2 per litre, Brickcover 4-7 m2 per litre, Ercole 15 m2 per 25 kg in two coats (about 1.5 kg/m2),
//   Ercole Ecoactive 1.5 kg/m2 in two coats, Microbond 30 m2 per 25 kg (the page text: about 1.5 kg/m2 at 1 mm).
//   node tools/ecobeton-usage.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LANGS = ["sv", "en", "es", "no"];
const LABEL = { sv: "Åtgång", en: "Consumption", es: "Consumo", no: "Forbruk" };
const PER_L = { sv: "per liter", en: "per litre", es: "por litro", no: "per liter" };
const PER_PAIL = { sv: "per 25 kg hink", en: "per 25 kg bucket", es: "por cubo de 25 kg", no: "per 25 kg bøtte" };
const TWO = { sv: "två skikt", en: "two coats", es: "dos capas", no: "to strøk" };

const DATA = {
  "evercrete-vetrofluid": { value: { sv: "2-4 m²", en: "2-4 m²", es: "2-4 m²", no: "2-4 m²" }, unit: PER_L,
    note: { sv: "Beror på hur sugande betongen är. Tekniska data gäller dosering 400 g/m².", en: "Depends on how absorbent the concrete is. The technical data apply to a dosage of 400 g/m².", es: "Depende de lo absorbente que sea el hormigón. Los datos técnicos corresponden a una dosificación de 400 g/m².", no: "Avhenger av hvor sugende betongen er. De tekniske dataene gjelder dosering 400 g/m²." } },
  everwood: { value: { sv: "6-8 m²", en: "6-8 m²", es: "6-8 m²", no: "6-8 m²" }, unit: PER_L,
    note: { sv: "Beror på träets porositet.", en: "Depends on the porosity of the wood.", es: "Depende de la porosidad de la madera.", no: "Avhenger av trevirkets porøsitet." } },
  brickcover: { value: { sv: "4-7 m²", en: "4-7 m²", es: "4-7 m²", no: "4-7 m²" }, unit: PER_L,
    note: { sv: "Beror på materialets porositet.", en: "Depends on the porosity of the material.", es: "Depende de la porosidad del material.", no: "Avhenger av materialets porøsitet." } },
  ercole: { value: { sv: "15 m²", en: "15 m²", es: "15 m²", no: "15 m²" }, unit: PER_PAIL,
    note: { sv: "Två skikt på jämnt underlag, ca 1,5 kg/m². Verklig täckning beror på underlagets förhållanden och porositet.", en: "Two coats on an even substrate, about 1.5 kg/m². The actual coverage depends on the substrate and its porosity.", es: "Dos capas sobre un soporte regular, unos 1,5 kg/m². El rendimiento real depende del soporte y de su porosidad.", no: "To strøk på jevnt underlag, ca. 1,5 kg/m². Faktisk dekning avhenger av underlaget og dets porøsitet." } },
  "ercole-ecoactive": { value: { sv: "1,5 kg/m²", en: "1.5 kg/m²", es: "1,5 kg/m²", no: "1,5 kg/m²" }, unit: { sv: `(${TWO.sv})`, en: `(${TWO.en})`, es: `(${TWO.es})`, no: `(${TWO.no})` },
    note: { sv: "På slät, oskadad yta. Verklig täckning beror på underlag och porositet.", en: "On a smooth, undamaged surface. The actual coverage depends on the substrate and its porosity.", es: "Sobre una superficie lisa y sin daños. El rendimiento real depende del soporte y de su porosidad.", no: "På glatt, uskadet underlag. Faktisk dekning avhenger av underlaget og dets porøsitet." } },
  microbond: { value: { sv: "30 m²", en: "30 m²", es: "30 m²", no: "30 m²" }, unit: PER_PAIL,
    note: { sv: "Tunt skikt. Vid ca 1 mm går det åt ca 1,5 kg/m² (15-16 m² per hink).", en: "Thin coat. At about 1 mm it takes about 1.5 kg/m² (15-16 m² per bucket).", es: "Capa fina. Con unos 1 mm se necesitan unos 1,5 kg/m² (15-16 m² por cubo).", no: "Tynt lag. Ved ca. 1 mm går det med ca. 1,5 kg/m² (15-16 m² per bøtte)." } }
};

for (const [slug, d] of Object.entries(DATA)) {
  const f = path.join(ROOT, "content/pages/produkter/ecobeton", slug + ".json");
  const raw = fs.readFileSync(f, "utf8"); const eol = raw.includes("\r\n") ? "\r\n" : "\n"; const j = JSON.parse(raw);
  for (const l of LANGS) {
    const bl = j.i18n[l].blocks.filter((b) => !b.usage);
    const first = bl.findIndex((b) => b.type === "text");
    let at = bl.findIndex((b, i) => i > first && b.type !== "text");
    if (at < 0) at = bl.length;
    bl.splice(at, 0, { type: "stat", label: LABEL[l], value: d.value[l], unit: d.unit[l], note: d.note[l], usage: true });
    j.i18n[l].blocks = bl;
  }
  fs.writeFileSync(f, JSON.stringify(j, null, 2).replace(/\n/g, eol) + eol);
  console.log("usage added:", slug);
}
