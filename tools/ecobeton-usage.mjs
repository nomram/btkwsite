#!/usr/bin/env node
// Ecobeton: consumption / coverage per product, as a quiet "stat" block at the bottom right of the intro text (the right column of the product page).
// The figures and the assumptions behind them are from each product's technical data sheet (assets-src/docs/ecobeton-*-tds.pdf; the sheets are
// scanned text, read by eye):
//   Vetrofluid  2-4 m2 per litre, two coats (the second once the first has dried), the technical data use a dosage of 400 g/m2
//   Everwood    6-8 m2 per litre, normally one treatment (until the surface is saturated)
//   Brickcover  4-7 m2 per litre, one coat (no second coat)
//   Ercole      15 m2 per 25 kg in two coats (about 1.5 kg/m2); the technical data use 3.5 litres of water per 25 kg
//   Ercole Ecoactive  1.5 kg/m2 in two coats on smooth, undamaged surfaces
//   Microbond   30 m2 per 25 kg, several thin coats until smooth (the page text: about 1.5 kg/m2 at 1 mm)
//   node tools/ecobeton-usage.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LANGS = ["sv", "en", "es", "no"];
const LABEL = { sv: "Åtgång", en: "Consumption", es: "Consumo", no: "Forbruk" };
const PER_L = { sv: "per liter", en: "per litre", es: "por litro", no: "per liter" };
const PER_PAIL = { sv: "per 25 kg hink", en: "per 25 kg bucket", es: "por cubo de 25 kg", no: "per 25 kg bøtte" };
const same = (v) => ({ sv: v, en: v, es: v, no: v });
const TWO = { sv: "2 skikt", en: "2 coats", es: "2 capas", no: "2 strøk" };

const DATA = {
  "evercrete-vetrofluid": { value: same("2-4 m²"), unit: PER_L,
    meta: { sv: "2 lager, det andra när det första torkat", en: "2 coats, the second once the first has dried", es: "2 capas, la segunda cuando la primera se ha secado", no: "2 lag, det andre når det første har tørket" },
    note: { sv: "Beror på hur sugande betongen är. Tekniska data gäller dosering 400 g/m².", en: "Depends on how absorbent the concrete is. The technical data apply to a dosage of 400 g/m².", es: "Depende de lo absorbente que sea el hormigón. Los datos técnicos corresponden a una dosificación de 400 g/m².", no: "Avhenger av hvor sugende betongen er. De tekniske dataene gjelder dosering 400 g/m²." } },
  everwood: { value: same("6-8 m²"), unit: PER_L,
    meta: { sv: "1 behandling, tills ytan är mättad", en: "1 treatment, until the surface is saturated", es: "1 tratamiento, hasta saturar la superficie", no: "1 behandling, til underlaget er mettet" },
    note: { sv: "Beror på träets porositet.", en: "Depends on the porosity of the wood.", es: "Depende de la porosidad de la madera.", no: "Avhenger av trevirkets porøsitet." } },
  brickcover: { value: same("4-7 m²"), unit: PER_L,
    meta: { sv: "1 skikt, lägg inte på ett andra", en: "1 coat, do not apply a second", es: "1 capa, no aplicar una segunda", no: "1 strøk, ikke legg på et andre" },
    note: { sv: "Beror på materialets porositet.", en: "Depends on the porosity of the material.", es: "Depende de la porosidad del material.", no: "Avhenger av materialets porøsitet." } },
  ercole: { value: same("15 m²"), unit: PER_PAIL,
    meta: { sv: "2 skikt, ca 1,5 kg/m²", en: "2 coats, about 1.5 kg/m²", es: "2 capas, unos 1,5 kg/m²", no: "2 strøk, ca. 1,5 kg/m²" },
    note: { sv: "På jämnt underlag. Tekniska data gäller 3,5 liter vatten per 25 kg. Verklig täckning beror på underlagets förhållanden och porositet.", en: "On an even substrate. The technical data apply to 3.5 litres of water per 25 kg. The actual coverage depends on the substrate and its porosity.", es: "Sobre un soporte regular. Los datos técnicos corresponden a 3,5 litros de agua por 25 kg. El rendimiento real depende del soporte y de su porosidad.", no: "På jevnt underlag. De tekniske dataene gjelder 3,5 liter vann per 25 kg. Faktisk dekning avhenger av underlaget og dets porøsitet." } },
  "ercole-ecoactive": { value: { sv: "1,5 kg/m²", en: "1.5 kg/m²", es: "1,5 kg/m²", no: "1,5 kg/m²" }, unit: same(""),
    meta: TWO,
    note: { sv: "På slät, oskadad yta. Verklig täckning beror på underlag och porositet.", en: "On a smooth, undamaged surface. The actual coverage depends on the substrate and its porosity.", es: "Sobre una superficie lisa y sin daños. El rendimiento real depende del soporte y de su porosidad.", no: "På glatt, uskadet underlag. Faktisk dekning avhenger av underlaget og dets porøsitet." } },
  microbond: { value: same("30 m²"), unit: PER_PAIL,
    meta: { sv: "Flera tunna skikt tills ytan är slät", en: "Several thin coats until the surface is smooth", es: "Varias capas finas hasta lograr una superficie lisa", no: "Flere tynne lag til flaten er glatt" },
    note: { sv: "Vid ca 1 mm går det åt ca 1,5 kg/m² (15-16 m² per hink).", en: "At about 1 mm it takes about 1.5 kg/m² (15-16 m² per bucket).", es: "Con unos 1 mm se necesitan unos 1,5 kg/m² (15-16 m² por cubo).", no: "Ved ca. 1 mm går det med ca. 1,5 kg/m² (15-16 m² per bøtte)." } }
};

for (const [slug, d] of Object.entries(DATA)) {
  const f = path.join(ROOT, "content/pages/produkter/ecobeton", slug + ".json");
  const raw = fs.readFileSync(f, "utf8"); const eol = raw.includes("\r\n") ? "\r\n" : "\n"; const j = JSON.parse(raw);
  for (const l of LANGS) {
    const bl = j.i18n[l].blocks.filter((b) => !b.usage);
    const first = bl.findIndex((b) => b.type === "text");
    let at = bl.findIndex((b, i) => i > first && b.type !== "text");
    if (at < 0) at = bl.length;
    bl.splice(at, 0, { type: "stat", label: LABEL[l], value: d.value[l], unit: d.unit[l], meta: d.meta[l], note: d.note[l], usage: true });
    j.i18n[l].blocks = bl;
  }
  fs.writeFileSync(f, JSON.stringify(j, null, 2).replace(/\n/g, eol) + eol);
  console.log("usage added:", slug);
}
