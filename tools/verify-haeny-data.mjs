#!/usr/bin/env node
// Cross-check of the data pulled out of the Häny brochures: the numbers in the technical-data table must agree with the performance curves drawn
// in the same brochure (two independent parts of the PDF): the capacity of a plunger size = where its curve starts (l/min), the max pressure =
// where it ends (bar). Reports every model where they disagree by more than the tolerance. node tools/verify-haeny-data.mjs
import fs from "node:fs";
import path from "node:path";
const DIR = path.resolve(import.meta.dirname, "../crawl/haeny");
const nums = (v) => String(v).replace(/,/g, "").match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
let bad = 0;
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".json") && !/strings|spez/.test(x)).sort()) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const cd = d.chartData; if (!cd) continue;
  const rows = d.tables.flatMap((t) => t.rows);
  const row = (re) => (rows.find(([l]) => re.test(l)) || [])[1];
  const cap = nums(row(/^(approx\. )?capacity|^max\. capacity/i)), pr = nums(row(/^max\. pressure/i)), pl = nums(row(/^plunger/i));
  const issues = [];
  for (const s of cd.series) {
    const size = (s.name.match(/(\d+)\s*$/) || [])[1];
    let k = size ? pl.indexOf(Number(size)) : -1;
    const start = Math.max(...s.points.filter((p) => p[0] < 6).map((p) => p[1])), end = Math.max(...s.points.filter((p) => p[1] < 3).map((p) => p[0]));
    if (k < 0 && cd.series.length === cap.length) k = cd.series.indexOf(s);
    if (k < 0) continue;
    if (cap[k] != null) { const l = cap[k] * 1000 / 60; if (Math.abs(start - l) / l > 0.1) issues.push(`${s.name}: capacity ${cap[k]} m³/h = ${l.toFixed(0)} l/min, curve starts at ${start.toFixed(0)}`); }
    if (pr[k] != null && Math.abs(end - pr[k]) > Math.max(4, pr[k] * 0.1)) issues.push(`${s.name}: max pressure ${pr[k]} bar, curve ends at ${end.toFixed(0)}`);
  }
  if (issues.length) { bad++; console.log(d.key.padEnd(14), d.model.padEnd(14), "capacity", JSON.stringify(row(/capacity/i)), "pressure", JSON.stringify(row(/^max\. pressure/i))); issues.forEach((x) => console.log("    ", x)); }
}
console.log(bad ? `${bad} models with differences` : "all models agree");

