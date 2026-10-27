#!/usr/bin/env node
// IC 325 and IC 325 CCP were one page. Now two pages that link to each other:
//   /produkter/haeny/manuella-pumpar/ic-325-ic325-ccp   IC 325 only (the old address stays: it is a ranking URL)
//   /produkter/haeny/manuella-pumpar/ic-325-ccp         IC 325 CCP (new): the CCP picture and photos on the left, the text on the right, brochure, video
// The brochure data blocks (gen) are added by tools/haeny-build-pages.mjs. Safe to run again.
//   node tools/ic325-split.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "content/pages/produkter/haeny/manuella-pumpar");
const OLD = path.join(DIR, "ic-325-ic325-ccp.json"), NEW = path.join(DIR, "ic-325-ccp.json");
const P_IC = "/produkter/haeny/manuella-pumpar/ic-325-ic325-ccp", P_CCP = "/produkter/haeny/manuella-pumpar/ic-325-ccp";
const raw = fs.readFileSync(OLD, "utf8"); const eol = raw.includes("\r\n") ? "\r\n" : "\n"; const page = JSON.parse(raw);
const LANGS = Object.keys(page.i18n);
const T = {
  sv: { up: "Uppgraderad version", base: "Grundmodellen", more: `Vill du även kunna injektera polyuretan? Se uppgraderingen <a href="${P_CCP}">IC 325 CCP</a>.`, ic: "IC 325", ccp: "IC 325 CCP" },
  en: { up: "Upgraded version", base: "The base model", more: `Need polyurethane injection too? See the upgrade, the <a href="${P_CCP}">IC 325 CCP</a>.`, ic: "IC 325", ccp: "IC 325 CCP" },
  es: { up: "Versión mejorada", base: "El modelo base", more: `¿Necesita también inyectar poliuretano? Vea la versión mejorada, el <a href="${P_CCP}">IC 325 CCP</a>.`, ic: "IC 325", ccp: "IC 325 CCP" },
  no: { up: "Oppgradert versjon", base: "Grunnmodellen", more: `Trenger du også å injisere polyuretan? Se oppgraderingen <a href="${P_CCP}">IC 325 CCP</a>.`, ic: "IC 325", ccp: "IC 325 CCP" }
};
const link = (html) => html.replace(/IC325 \((?:från ovan|from above|descrito arriba|fra ovenfor)\)/, `<a href="${P_IC}">IC325</a>`);

const ccpI18n = {}, icI18n = {};
for (const l of LANGS) {
  const t = page.i18n[l], bl = t.blocks;
  const ci = bl.findIndex((b) => b.type === "columns" && !b.gen && b.left && b.left.some((x) => x.src && /ic325-ccp-combo/.test(x.src)));
  if (ci < 0) { if (fs.existsSync(NEW)) { console.log("already split"); process.exit(0); } throw new Error("CCP columns not found in " + l); }
  const cols = bl[ci];
  const media = cols.left; // the picture and the photo carousel
  const text = cols.right.map((b) => (b.type === "text" ? { ...b, html: link(b.html) } : b));
  const tail = bl.slice(ci + 1).filter((b) => !b.gen); // brochure button, video, video text
  const crumb = bl[0];
  const descr = (text.find((b) => b.type === "text") || {}).html || "";
  ccpI18n[l] = {
    title: T[l].ccp, h1: "HÄNY " + T[l].ccp, description: descr.replace(/<[^>]+>/g, "").slice(0, 200),
    blocks: [{ ...crumb }, ...media, ...text, ...tail, { type: "related", title: T[l].base, items: [{ href: P_IC }] }]
  };
  // IC 325 keeps everything before the CCP section, loses the CCP data, and points to the upgrade
  const keep = bl.slice(0, ci).filter((b, i) => !(b.gen && i > ci));
  const contact = keep.findIndex((b) => b.type === "text" && /kontakta-oss/.test(b.html));
  keep.splice(contact >= 0 ? contact + 1 : keep.length, 0, { type: "text", html: T[l].more });
  icI18n[l] = { ...t, title: T[l].ic, h1: "HÄNY " + T[l].ic, blocks: [...keep, { type: "related", title: T[l].up, items: [{ href: P_CCP }] }] };
}
const write = (f, o) => fs.writeFileSync(f, JSON.stringify(o, null, 2).replace(/\n/g, eol) + eol);
write(NEW, { path: P_CCP, updated: new Date().toISOString().slice(0, 10), template: "product", order: 1.5, published: true, ...(page.hero ? { hero: page.hero } : {}), i18n: ccpI18n });
write(OLD, { ...page, i18n: icI18n });
console.log("IC 325 and IC 325 CCP are two pages");
