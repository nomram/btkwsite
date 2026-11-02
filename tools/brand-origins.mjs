#!/usr/bin/env node
// The "Product of ..." line of the brand pages (opens on hover: where the brand is designed or built and since when: page.origin = { country, since, more })
// and the story text on the Häny page. Only what the company's own material or several independent sources say is written here; a brand without a
// year or a place is left without it on purpose (see the notes). Safe to run again.
//   node tools/brand-origins.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LANGS = ["sv", "en", "es", "no"];
const rw = (f, fn) => {
  const file = path.join(ROOT, f), raw = fs.readFileSync(file, "utf8"), eol = raw.includes("\r\n") ? "\r\n" : "\n", j = JSON.parse(raw);
  fn(j);
  fs.writeFileSync(file, JSON.stringify(j, null, 2).replace(/\n/g, eol) + eol);
};
const L = (sv, en, es, no) => ({ sv, en, es, no });

// country: the place of the company; since: first year of the business (the company's own history where there is one); more: one line per language
const ORIGINS = {
  geobrugg: { country: "ch", since: 1951, more: L("Med huvudkontor i Romanshorn", "Headquartered in Romanshorn", "Con sede central en Romanshorn", "Med hovedkontor i Romanshorn") },       // 1951: avalanche nets of the Brugg cable works (geobrugg.com, About us)
  mapei: { country: "it", since: 1937, more: L("Grundat i Milano och fortfarande familjeägt", "Founded in Milan and still family-owned", "Fundada en Milán y todavía de propiedad familiar", "Grunnlagt i Milano og fortsatt familieeid") },      // mapei.com, Our history
  tei: { country: "us", since: 1980, more: L("Konstruerad och byggd i Montrose, Colorado", "Designed and built in Montrose, Colorado", "Diseñada y fabricada en Montrose, Colorado", "Konstruert og bygget i Montrose, Colorado") },      // started in Littleton 1980, in Montrose since 1988
  marini: { country: "it", since: 1975, more: L("Konstruerad och byggd i Villadossola, norra Italien", "Designed and built in Villadossola, northern Italy", "Diseñada y fabricada en Villadossola, norte de Italia", "Konstruert og bygget i Villadossola, Nord-Italia") },      // Marini's catalogue 2025: company history from 1975
  reed: { country: "us", since: 1957, more: L("Baserat i Chino, Kalifornien", "Based in Chino, California", "Con sede en Chino, California", "Basert i Chino, California") },
  "kraft-tool": { country: "us", since: 1981, more: L("Baserat i Shawnee, Kansas", "Based in Shawnee, Kansas", "Con sede en Shawnee, Kansas", "Basert i Shawnee, Kansas") },
  ecobeton: { country: "it", since: 1993, more: L("Grundat i Oslo, i Italien sedan 1998 med produktion och laboratorium i Costabissara", "Founded in Oslo, in Italy since 1998 with production and a laboratory in Costabissara", "Fundada en Oslo, en Italia desde 1998 con producción y laboratorio en Costabissara", "Grunnlagt i Oslo, i Italia siden 1998 med produksjon og laboratorium i Costabissara") },
  "ram-board": { country: "us", since: 1999, more: L("Baserat i Kalifornien", "Based in California", "Con sede en California", "Basert i California") },
  "jean-lutz": { country: "fr", since: 1975 },
  "flexo-tekniikka": { country: "fi", since: 1987, more: L("Baserat i Borgå (Porvoo)", "Based in Porvoo", "Con sede en Porvoo", "Basert i Porvoo") },
  "terra-infrastructure": { country: "de", more: L("Baserat i Alsfeld, tidigare thyssenkrupp Infrastructure (nytt namn 2022)", "Based in Alsfeld, formerly thyssenkrupp Infrastructure (renamed 2022)", "Con sede en Alsfeld, antes thyssenkrupp Infrastructure (nuevo nombre en 2022)", "Basert i Alsfeld, tidligere thyssenkrupp Infrastructure (nytt navn 2022)") },
  weber: { country: "fr", more: L("Franskt ursprung, sedan 1996 en del av Saint-Gobain", "French origin, part of Saint-Gobain since 1996", "De origen francés, parte de Saint-Gobain desde 1996", "Fransk opprinnelse, del av Saint-Gobain siden 1996") }
};
for (const [slug, o] of Object.entries(ORIGINS)) {
  rw(`content/pages/produkter/${slug}.json`, (j) => {
    const keep = j.origin || {};
    j.origin = { country: o.country, ...(o.since ? { since: o.since } : {}), ...(o.more ? { more: o.more } : keep.more ? { more: keep.more } : {}) };
  });
}

// ---- Häny: the story
const STORY = {
  sv: [
    "Häny började som specialister på strömning, alltså hur vätskor rör sig i rör, ventiler och pumpar. Kunskapen har lett till avancerade pumpar och system för vatten, från dricksvatten till avlopp, och till turbiner som tar vara på energin i vattenflöden. Samma kunnande finns i injektions- och blandningsutrustningen.",
    "Företaget grundades 1875 och är ett av de äldsta namnen inom pumpteknik. Häny är inte det billigaste alternativet på marknaden, men det är ett av dem som håller längst. Det finns Häny-pumpar som har varit i drift i flera decennier, och med rätt kärlek, det vill säga rengöring och underhåll, håller en Häny-pump väldigt länge."
  ],
  en: [
    "Häny started as specialists in flow: how liquids move in pipes, valves and pumps. That knowledge has led to advanced pumps and systems for water, from drinking water to wastewater, and to turbines that recover the energy in water flows. The same know-how is found in the grouting and mixing equipment.",
    "The company was founded in 1875 and is one of the oldest names in pump technology. Häny is not the cheapest option on the market, but it is one of those that last the longest. Some Häny pumps have been in service for several decades, and with the right care, that is cleaning and maintenance, a Häny pump lasts a very long time."
  ],
  es: [
    "Häny empezó como especialista en flujo, es decir, en cómo se mueven los líquidos en tuberías, válvulas y bombas. Ese conocimiento ha dado lugar a bombas y sistemas avanzados para el agua, desde el agua potable hasta las aguas residuales, y a turbinas que aprovechan la energía de los caudales de agua. El mismo saber hacer está en los equipos de inyección y mezcla.",
    "La empresa se fundó en 1875 y es uno de los nombres más antiguos de la tecnología de bombas. Häny no es la opción más barata del mercado, pero sí una de las que más duran. Hay bombas Häny que llevan varias décadas en servicio y, con el cuidado adecuado, es decir, limpieza y mantenimiento, una bomba Häny dura muchísimo."
  ],
  no: [
    "Häny startet som spesialister på strømning, altså hvordan væsker beveger seg i rør, ventiler og pumper. Kunnskapen har ført til avanserte pumper og systemer for vann, fra drikkevann til avløp, og til turbiner som tar vare på energien i vannstrømmer. Den samme kompetansen finnes i injeksjons- og blandeutstyret.",
    "Selskapet ble grunnlagt i 1875 og er et av de eldste navnene innen pumpeteknikk. Häny er ikke det billigste alternativet på markedet, men det er et av dem som varer lengst. Det finnes Häny-pumper som har vært i drift i flere tiår, og med riktig omsorg, det vil si rengjøring og vedlikehold, holder en Häny-pumpe svært lenge."
  ]
};
rw("content/pages/produkter/haeny.json", (j) => {
  for (const l of LANGS) {
    const bl = j.i18n[l].blocks.filter((b) => b.tag !== "haeny-story");
    const at = bl.findIndex((b) => b.type === "text") + 1; // right after the first text of the page
    bl.splice(at, 0, ...STORY[l].map((html) => ({ type: "text", html, tag: "haeny-story" })));
    j.i18n[l].blocks = bl;
  }
});
console.log("ok");
