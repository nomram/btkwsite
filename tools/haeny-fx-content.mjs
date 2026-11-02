#!/usr/bin/env node
// Page content for the two picture effects on the Häny pages (see "Pictures with an effect" in src/lib/render.mjs):
//  1. /produkter/haeny  "Hänys teknologi": a dot on the ZMP 610 shows the cutaway of the pump module when the pointer is on it
//  2. /produkter/haeny/manuella-pumpar/ic-310-ic-311: dots on the machine picture: mixer, agitator, pump (their names write themselves on a line when the pointer is on the dot)
//   node tools/haeny-fx-content.mjs        (safe to run again)
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LANGS = ["sv", "en", "es", "no"];
const rw = (f, fn) => {
  const file = path.join(ROOT, f), raw = fs.readFileSync(file, "utf8"), eol = raw.includes("\r\n") ? "\r\n" : "\n", j = JSON.parse(raw);
  fn(j);
  fs.writeFileSync(file, JSON.stringify(j, null, 2).replace(/\n/g, eol) + eol);
};

// ---- 1. a dot on the ZMP 610 whose "label" is the cutaway picture (the x-ray lens of tools/haeny-xray.mjs is on hold; the picture and the code stay)
const TXT = {
  sv: { cap: "Genomskärning", hint: "Håll muspekaren över (eller tryck på) pricken på ZMP 610 för att se genomskärningen av pumpmodulen." },
  en: { cap: "Cutaway", hint: "Hold the pointer over (or tap) the dot on the ZMP 610 to see the cutaway of the pump module." },
  es: { cap: "Corte", hint: "Pase el cursor sobre el punto de la ZMP 610 (o tóquelo) para ver el corte de la unidad de bomba." },
  no: { cap: "Snitt", hint: "Hold musepekeren over (eller trykk på) prikken på ZMP 610 for å se tverrsnittet av pumpemodulen." }
};
rw("content/pages/produkter/haeny.json", (j) => {
  for (const l of LANGS) {
    for (const b of j.i18n[l].blocks) {
      if (b.type !== "columns") continue;
      const left = b.left || [];
      const img = left.find((x) => x.type === "image" && /haeny-tech-plunger.webp$/.test(x.src || ""));
      if (!img) continue;
      delete img.overlay; delete img.overlayArea;
      img.hint = TXT[l].hint;
      const keep = (img.callouts || [])[0]; // a placement made in the alignment app stays
      img.callouts = [keep && keep.image ? { ...keep, text: TXT[l].cap } : { x: 35, y: 50, lx: 52, ly: 96, dir: "r", v: "u", iw: 26, image: "/assets/img/haeny-4.webp", text: TXT[l].cap }];
      b.left = left.filter((x) => !(x.type === "image" && /haeny-4.webp$/.test(x.src || "")));
    }
  }
});

// ---- 2. labelled dots on the IC 310 machine
const NAMES = { sv: ["Blandare", "Omrörare", "Pump"], en: ["Mixer", "Agitator", "Pump"], es: ["Mezclador", "Agitador", "Bomba"], no: ["Mikser", "Rører", "Pumpe"] };
rw("content/pages/produkter/haeny/manuella-pumpar/ic-310-ic-311.json", (j) => {
  for (const l of LANGS) {
    const img = j.i18n[l].blocks.find((b) => b.type === "image" && /ic-310-ic-311-2\.webp$/.test(b.src || ""));
    if (!img) throw new Error(`no machine picture in ${l}`);
    const [mixer, agitator, pump] = NAMES[l];
    if (!(img.callouts && img.callouts.length)) img.callouts = [ // (a placement made in the alignment app stays)
      
      { x: 24, y: 27.5, lx: 3, ly: 14, dir: "r", text: mixer },
      { x: 44, y: 55, lx: 40, ly: 106, dir: "r", text: agitator },
      { x: 73, y: 52, lx: 94, ly: 106, dir: "l", text: pump }
    ];
  }
});
console.log("ok");
