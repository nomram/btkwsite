#!/usr/bin/env node
// Marini quarry machines (drills, wire saws) and the MR-SB shotcrete unit: the main picture becomes the picture that turns into Marini's 3D model
// (src/js/viewer3d.js). The picture stays as it is (it is the poster); the gallery moves below the text so the 3D picture sits beside the text.
// Models: assets-src/3d/marini-<model>.bkm, made with tools/glb-compact.mjs from Marini's files in assets-src/3d-original/.
//   node tools/marini-quarry-3d.mjs
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(import.meta.dirname, "..");
const P = path.join(ROOT, "content/pages/produkter/marini");
// page file -> model(s); several models = versions the visitor can switch between
const MAP = {
  "driller.json": [["Driller", "driller"], ["Driller ID", "driller-id"]],
  "hor-drill.json": [["Hor Drill", "hor-drill"]],
  "sprutbetong.json": [["MR-SB", "mr-sb"]],
  "vajersagar/gran-fil-electronic.json": [["Gran Fil Electronic", "gran-fil-electronic"]],
  "vajersagar/gran-fil-super-electronic.json": [["Gran Fil Super Electronic", "gran-fil-super-electronic"]],
  "vajersagar/gran-fil-super-electronic-sp.json": [["Gran Fil Super Electronic SP", "gran-fil-electronic"]], // Marini publishes the same file for both,
  "vajersagar/mini-fil-electronic.json": [["Mini Fil Electronic", "mini-fil-electronic"]],
  "vajersagar/mini-fil-super-electronic.json": [["Mini Fil Super Electronic", "mini-fil-electronic"]],
  "vajersagar/mini-mobil-fil.json": [["Mini Mobil Fil", "mini-mobil-fil"]],
  "vajersagar/mobil-fil.json": [["Mobil Fil", "mobil-fil"]],
};
const W3D = { sv: "3D-modell", en: "3D model", es: "modelo 3D", no: "3D-modell", lt: "3D modelis", lv: "3D modelis", et: "3D-mudel", ru: "3D-модель" };
const mb = (model, lang) => { const n = fs.statSync(path.join(ROOT, "assets-src/3d", `marini-${model}.bkm`)).size / 1e6; return n.toFixed(1).replace(".", lang === "en" ? "." : ",") + " MB"; };
for (const [file, models] of Object.entries(MAP)) {
  const f = path.join(P, file), raw = fs.readFileSync(f, "utf8"), p = JSON.parse(raw);
  for (const [l, t] of Object.entries(p.i18n)) {
    const b = t.blocks;
    let k = b.findIndex((x) => x.type === "model3d");
    if (k < 0) k = b.findIndex((x, i) => x.type === "image" && i > 0 && !/logo/.test(x.src || "") && !x.href); // the main picture after the logo
    if (k < 0) { console.log("no picture:", file, l); continue; }
    const old = b[k], poster = old.type === "model3d" ? old.poster : old.src, name = (old.alt || models[0][0]).replace(/[:,].*$/, "").trim() || models[0][0];
    b[k] = { type: "model3d", src: `/assets/3d/marini-${models[0][1]}.bkm`, poster, alt: old.alt || name, label: `Marini ${models[0][0]}, ${W3D[l] || W3D.en}`, size: mb(models[0][1], l), ...(models.length > 1 ? { variants: models.map(([n, m]) => ({ name: n, src: `/assets/3d/marini-${m}.bkm` })) } : {}), gen: true };
    // a gallery right after the 3D picture goes below the text that follows
    if (b[k + 1] && b[k + 1].type === "carousel") {
      const [car] = b.splice(k + 1, 1);
      let j = k + 1; while (b[j] && /^(text|list|heading)$/.test(b[j].type) && !(b[j].type === "heading" && (b[j].level || 2) < 3)) j++;
      b.splice(j, 0, car);
    }
  }
  p.updated = "2026-11-26";
  fs.writeFileSync(f, JSON.stringify(p, null, 2) + (raw.endsWith("\n") ? "\n" : ""));
  console.log("3D:", file, models.map((m) => m[1]).join(" + "));
}
