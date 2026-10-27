#!/usr/bin/env node
// The IC specification table (/produkter/haeny/manuella-pumpar) had no column names: the model was split over a group row (310, 650, 1100 ...) and the
// pump row (ZMP 610 ...). Give it a real header row ("IC 310", "IC 650/710" ...) so a column can be selected and compared. Safe to run again.
import fs from "node:fs";
import path from "node:path";
const f = path.join(path.resolve(import.meta.dirname, ".."), "content/pages/produkter/haeny/manuella-pumpar.json");
const raw = fs.readFileSync(f, "utf8"); const eol = raw.includes("\r\n") ? "\r\n" : "\n"; const j = JSON.parse(raw);
const CORNER = { sv: "Modell", en: "Model", es: "Modelo", no: "Modell" };
for (const l of Object.keys(j.i18n)) {
  const t = j.i18n[l].blocks.find((b) => b.type === "table" && b.groups && b.groups.some((g) => g.text === "1400"));
  if (!t || t.header === true) continue;
  const names = []; // one per value column (after the label and the unit)
  const groups = t.groups.slice(1); // the first group covers the label and the unit
  const pump = t.rows[1].slice(2);
  let i = 0;
  for (const g of groups) for (let k = 0; k < Number(g.span); k++, i++) names.push(Number(g.span) > 1 ? `IC ${g.text}/${pump[i]}` : `IC ${g.text}`);
  t.rows.unshift([CORNER[l] || "Model", "", ...names]);
  t.header = true;
}
fs.writeFileSync(f, JSON.stringify(j, null, 2).replace(/\n/g, eol) + eol);
console.log("IC table header done");
