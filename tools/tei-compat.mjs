#!/usr/bin/env node
// TEI: which drifters (TE) and rotary heads (RDS) fit which mast. One table here, applied to the pages:
//   /produkter/tei/borrmaster/<mast>               "Passande topphammare / rotationshuvuden" (related cards)
//   /produkter/tei/topphammare/<te>, rotationshammare/<rds>   "Passande master" first among the related cards
//   /produkter/tei/topphammare, rotationshammare   the hole-size selector gets a "Kompatibla master" row that lights up for the heads that fit
//   /produkter/tei/borrmaster                      the mast table (with pull-back, weight and possible heads) lives here, not on the rig page
//   /produkter/tei/borriggar                       TD50 removed, the mast table moved out
// Generated blocks carry "gen": true (related) or "masts" (on the selector block) and are replaced on every run.
//   node tools/tei-compat.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PAGES = path.join(ROOT, "content/pages/produkter/tei");
const LANGS = ["sv", "en", "es", "no"];
const file = (rel) => path.join(PAGES, rel + ".json");
const read = (rel) => { const raw = fs.readFileSync(file(rel), "utf8"); return { j: JSON.parse(raw), eol: raw.includes("\r\n") ? "\r\n" : "\n" }; };
const write = (rel, { j, eol }) => fs.writeFileSync(file(rel), JSON.stringify(j, null, 2).replace(/\n/g, eol) + eol);

// ---- the compatibility table (TEI's mast table; the portable masts from their own pages: MP260 takes the 200 series, MPH the 200 and 300 series) ----
const MASTS = [
  { key: "mme", name: "MME", heads: ["TE260", "TE260HT", "TE326", "RDS250"] },
  { key: "mem", name: "MEM", heads: ["TE360", "TE326", "RDS350"] },
  { key: "hem", name: "HEM", heads: ["TE360", "TE326", "TE760", "RDS350", "RDS550"] },
  { key: "hemh", name: "HEMH", heads: ["TE726", "TE760", "TE1000", "RDS550", "RDS1004"] },
  { key: "mp260", name: "MP260", heads: ["TE260HT", "TE260", "RDS250"] },
  { key: "mph", name: "MPH", heads: ["TE260", "TE260HT", "TE326", "TE360", "RDS250", "RDS350"] }
];
const headPath = (h) => (h.startsWith("RDS") ? `/produkter/tei/rotationshammare/${h.toLowerCase()}` : `/produkter/tei/topphammare/${h.toLowerCase()}`);
const mastPath = (m) => `/produkter/tei/borrmaster/${m.key}`;
const isTE = (h) => h.startsWith("TE");
const exists = (p) => fs.existsSync(file(p.replace("/produkter/tei/", "")));

const T = {
  sv: { te: "Passande topphammare", rds: "Passande rotationshuvuden", masts: "Passande master", mTitle: "Kompatibla master", mHint: "Välj ett hål med reglaget ovan: de master som passar maskinerna för hålet lyser upp.", mFit: "Passar", mFor: "För", mNone: "Ingen mast i listan passar den här storleken.", mMore: "Markerade master passar", exc: "För grävare", port: "Bärbar mast" },
  en: { te: "Compatible drifters", rds: "Compatible rotary heads", masts: "Compatible masts", mTitle: "Compatible masts", mHint: "Choose a hole with the slider above: the masts that fit the machines for that hole light up.", mFit: "Fits", mFor: "For", mNone: "No mast in the list fits this size.", mMore: "Highlighted masts fit", exc: "For excavators", port: "Man-portable mast" },
  es: { te: "Martillos de percusión compatibles", rds: "Cabezales rotativos compatibles", masts: "Mástiles compatibles", mTitle: "Mástiles compatibles", mHint: "Elija un barreno con el control deslizante: se iluminan los mástiles que admiten las máquinas para ese barreno.", mFit: "Compatible", mFor: "Para", mNone: "Ningún mástil de la lista admite este tamaño.", mMore: "Los mástiles resaltados admiten", exc: "Para excavadoras", port: "Mástil portátil" },
  no: { te: "Passende topphammere", rds: "Passende rotasjonshoder", masts: "Passende master", mTitle: "Kompatible master", mHint: "Velg et hull med glideren over: mastene som passer maskinene for hullet lyser opp.", mFit: "Passer", mFor: "For", mNone: "Ingen mast i listen passer denne størrelsen.", mMore: "Markerte master passer", exc: "For gravemaskiner", port: "Bærbar mast" }
};

// ---- 0. what the pages say today about the masts is kept in tools/tei-mast-data.json (the rig page's mast table + note, the mast page's own table),
// so the merge below can be repeated after the rig page has lost them ----
const DATA = path.join(ROOT, "tools/tei-mast-data.json");
if (!fs.existsSync(DATA)) {
  const rig = read("borriggar"), bm = read("borrmaster"), out = {};
  for (const l of LANGS) {
    const bl = rig.j.i18n[l].blocks, mi = bl.findIndex((b) => b.type === "table" && b.rows.some((r) => r[0] === "MME"));
    const mb = bm.j.i18n[l].blocks.find((b) => b.type === "table" && !b.feeds && b.rows[0] && /^(Mast|Mástil)$/.test(b.rows[0][0]));
    out[l] = { rig: bl[mi].rows.slice(1), base: mb.rows, note: bl[mi + 1].html };
  }
  fs.writeFileSync(DATA, JSON.stringify(out, null, 2) + "\n");
}
const orig = JSON.parse(fs.readFileSync(DATA, "utf8"));

// ---- 1. the rig page loses TD50 and the mast table ----
{
  const p = read("borriggar");
  for (const l of LANGS) {
    const bl = p.j.i18n[l].blocks;
    for (const b of bl) if (b.type === "table") b.rows = b.rows.filter((r) => r[0] !== "TD50");
    if (l === "sv") for (const b of bl) if (b.type === "table" && b.rows[0] && b.rows[0][0] === "Model") b.rows[0] = ["Modell", "Vridmoment (Nm)", "Elmotor (kW)", "Generatorbehov (kW)", "Vikt (kg)"];
    const mi = bl.findIndex((b) => b.type === "table" && b.rows.some((r) => r[0] === "MME"));
    if (mi >= 0) { // the table and the note about power loss right after it
      const note = bl[mi + 1] && bl[mi + 1].type === "text" ? 1 : 0;
      bl.splice(mi, 1 + note);
    }
    const h = bl.find((b) => b.type === "heading" && b.text === "Specifications");
    if (h && l === "sv") h.text = "Specifikationer";
  }
  write("borriggar", p);
}

// ---- 2. the mast page gets the table: pull-back, weight and the possible heads next to the existing columns ----
const wide = {
  sv: { h: ["Mast", "Grävmaskin", "Borrslag", "Dragkraft (kN)", "Vikt (kg)", "Möjliga borraggregat", "Utrustning / övrigt"], port: "Bärbar", acf: "ACF-matning (aluminium)", scf: "SCF5-matning" },
  en: { h: ["Mast", "Excavator", "Stroke", "Pullback force (kN)", "Weight (kg)", "Possible drills", "Equipment / notes"], port: "Man portable", acf: "ACF feed (aluminium)", scf: "SCF5 feed" },
  es: { h: ["Mástil", "Excavadora", "Carrera", "Fuerza de retroceso (kN)", "Peso (kg)", "Martillos posibles", "Equipamiento / observaciones"], port: "Portátil", acf: "Avance ACF (aluminio)", scf: "Avance SCF5" },
  no: { h: ["Mast", "Gravemaskin", "Slaglengde", "Trekkraft (kN)", "Vekt (kg)", "Mulige borehammere", "Utstyr / merknader"], port: "Bærbar", acf: "ACF-mating (aluminium)", scf: "SCF5-mating" }
};
const heads = (m) => { const te = m.heads.filter(isTE), rds = m.heads.filter((h) => !isTE(h)); return te.join(", ") + (rds.length ? " & " + rds.join(", ") : ""); };
{
  const p = read("borrmaster");
  for (const l of LANGS) {
    const bl = p.j.i18n[l].blocks;
    const i = bl.findIndex((b) => b.type === "table" && !b.feeds && b.rows[0] && /^(Mast|Mástil)$/.test(b.rows[0][0]));
    if (i < 0) throw new Error("mast table missing " + l);
    const old = bl[i];
    // (rows may already be merged by an earlier run: the original four-column rows are kept in the cache file)
    const base = orig[l].base, src = orig[l].rig; // base: [Mast, Excavator, Stroke, Equipment]; rig: rows of TEI's table
    const W = wide[l];
    const rig = Object.fromEntries(src.map((r) => [r[0], r]));
    const rows = [W.h];
    for (const r of base.slice(1)) { const g = rig[r[0]]; const m = MASTS.find((x) => x.name === r[0]); rows.push([r[0], r[1], r[2], l === "en" ? g[4] : g[4].replace(".", ","), g[2], g[5], r[3]]); }
    rows.push(["MP260", W.port, "1,67 m", "6,7", "-", heads(MASTS[4]), W.acf]);
    rows.push(["MPH", W.port, "2 m (SCF5)", "11,1", "435", heads(MASTS[5]), W.scf]);
    bl[i] = { ...old, rows, links: MASTS.map(mastPath) };
    // the note about the 40 % power loss comes with the table (once)
    const note = orig[l].note;
    const hasNote = bl[i + 1] && bl[i + 1].type === "text" && bl[i + 1].tableNote;
    if (!hasNote) bl.splice(i + 1, 0, { type: "text", html: `<small>${note}</small>`, tableNote: true });
  }
  write("borrmaster", p);
}

// ---- 3. related cards ----
const withGen = (bl, gen, at) => { const keep = bl.filter((b) => !b.compat); const i = at(keep); keep.splice(i < 0 ? keep.length : i, 0, ...gen.map((g) => ({ ...g, compat: true }))); return keep; };
for (const m of MASTS) {
  const p = read(`borrmaster/${m.key}`);
  for (const l of LANGS) {
    const te = m.heads.filter(isTE).map(headPath).filter(exists), rds = m.heads.filter((h) => !isTE(h)).map(headPath).filter(exists);
    const gen = [];
    if (te.length) gen.push({ type: "related", title: T[l].te, items: te.map((href) => ({ href })) });
    if (rds.length) gen.push({ type: "related", title: T[l].rds, items: rds.map((href) => ({ href })) });
    p.j.i18n[l].blocks = withGen(p.j.i18n[l].blocks, gen, (bl) => { const r = bl.findIndex((b) => b.type === "related"); return r; });
  }
  write(`borrmaster/${m.key}`, p);
}
const allHeads = [...new Set(MASTS.flatMap((m) => m.heads))];
for (const h of allHeads) {
  const rel = headPath(h).replace("/produkter/tei/", "");
  if (!exists(headPath(h))) continue;
  const p = read(rel);
  const ms = MASTS.filter((m) => m.heads.includes(h));
  for (const l of LANGS) {
    const gen = [{ type: "related", title: T[l].masts, items: ms.map((m) => ({ href: mastPath(m) })) }];
    p.j.i18n[l].blocks = withGen(p.j.i18n[l].blocks, gen, (bl) => { const r = bl.findIndex((b) => b.type === "related"); return r; });
  }
  write(rel, p);
}

// ---- 4. the hole-size selector: a row of masts that lights up for the heads that fit ----
{
  const bm = read("borrmaster");
  for (const rel of ["topphammare", "rotationshammare"]) {
    const p = read(rel);
    const own = (h) => (rel === "topphammare" ? isTE(h) : !isTE(h));
    for (const l of LANGS) {
      const cards = Object.fromEntries(bm.j.i18n[l].blocks.filter((b) => b.type === "cards").flatMap((b) => b.items).map((it) => [it.title, it]));
      const masts = MASTS.filter((m) => m.heads.some(own)).map((m) => {
        const c = cards[m.name] || {};
        return { href: mastPath(m), title: m.name, image: c.image, sub: m.key === "mp260" || m.key === "mph" ? T[l].port : (c.text || "").replace(/^.*?:\s*/, "") ? `${T[l].exc}: ${(c.text || "").replace(/^.*?:\s*/, "")}` : T[l].exc, for: m.heads.filter(own) };
      });
      const rc = p.j.i18n[l].blocks.find((b) => b.type === "rangechart" && b.layout === "selector");
      if (!rc) throw new Error("selector missing " + rel + " " + l);
      rc.masts = { title: T[l].mTitle, hint: T[l].mHint, fit: T[l].mFit, forLabel: T[l].mFor, none: T[l].mNone, more: T[l].mMore, items: masts };
    }
    write(rel, p);
  }
}
console.log("tei compat applied");
