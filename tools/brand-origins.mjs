#!/usr/bin/env node
// The "Product of ..." line of the brand pages (opens on hover: where the brand is designed or built and since when: page.origin = { country, since, more })
// Only what the company's own material or several independent sources say is written here; a brand without a
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

// (the Häny story text is part of the page itself, see content/pages/produkter/haeny.json)
console.log("ok");
