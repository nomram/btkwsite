#!/usr/bin/env node
// Page content for the two picture effects on the Häny pages (see "Pictures with an effect" in src/lib/render.mjs):
//  1. /produkter/haeny  "Hänys teknologi": the ZMP 610 / ZMP 625 picture gets the cutaway of the pump module as an x-ray lens (tools/haeny-xray.mjs makes the overlay);
//     the separate cutaway picture below it goes (it is the overlay now)
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

// ---- 1. x-ray lens on the pump modules
const HINT = {
  sv: "Håll muspekaren över (eller tryck på) ZMP 610 till vänster för att se genomskärningen av pumpmodulen.",
  en: "Hold the pointer over (or tap) the ZMP 610 on the left to see the cutaway of the pump module.",
  es: "Pase el cursor sobre la ZMP 610 de la izquierda (o tóquela) para ver el corte de la unidad de bomba.",
  no: "Hold musepekeren over (eller trykk på) ZMP 610 til venstre for å se tverrsnittet av pumpemodulen."
};
rw("content/pages/produkter/haeny.json", (j) => {
  for (const l of LANGS) {
    for (const b of j.i18n[l].blocks) {
      if (b.type !== "columns") continue;
      const left = b.left || [];
      const i = left.findIndex((x) => x.type === "image" && /haeny-tech-plunger\.webp$/.test(x.src || ""));
      if (i < 0) continue;
      const img = left[i];
      img.overlay = "/assets/img/haeny-tech-plunger-xray.webp";
      img.overlayArea = { x: 22, y: 18, w: 23.5, h: 70 };
      img.hint = HINT[l];
      b.left = left.filter((x) => !(x.type === "image" && /haeny-4\.webp$/.test(x.src || "")));
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
    img.callouts = [
      { x: 24, y: 27.5, lx: 3, ly: 14, dir: "r", text: mixer },
      { x: 44, y: 55, lx: 40, ly: 106, dir: "r", text: agitator },
      { x: 73, y: 52, lx: 94, ly: 106, dir: "l", text: pump }
    ];
  }
});
console.log("ok");
