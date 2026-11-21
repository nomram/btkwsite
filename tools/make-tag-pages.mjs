#!/usr/bin/env node
// One page per tag of the articles: /artiklar/tagg/<tag> (list of the articles with that tag; the chips there filter in place).
// Reads content/tags.json (tag names) and the tags of the article pages; run again when an article gets a new tag. Safe to run again.
//   node tools/make-tag-pages.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PAGES = path.join(ROOT, "content/pages");
const tags = JSON.parse(fs.readFileSync(path.join(ROOT, "content/tags.json"), "utf8"));
const dir = path.join(PAGES, "artiklar");
const used = new Map(); // tag -> { languages, newest }
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".json")) continue;
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  if (j.template !== "article") continue;
  for (const t of j.tags || []) { const o = used.get(t) || { langs: new Set(), date: "" }; Object.keys(j.i18n).forEach((l) => o.langs.add(l)); if ((j.date || "") > o.date) o.date = j.date; used.set(t, o); }
}
const TXT = {
  sv: { title: (n) => `Artiklar om ${n}`, seo: (n) => `Artiklar och guider om ${n} | Betongakuten`, desc: (n) => `Alla artiklar och guider om ${n} från Betongakuten. Sök eller filtrera på fler taggar.` },
  en: { title: (n) => `Articles about ${n}`, seo: (n) => `Articles and guides about ${n} | Betongakuten`, desc: (n) => `All articles and guides about ${n} from Betongakuten. Search or filter by more tags.` },
};
const tagDir = path.join(dir, "tagg");
fs.mkdirSync(tagDir, { recursive: true });
for (const f of fs.readdirSync(tagDir)) if (f.endsWith(".json") && !used.has(f.slice(0, -5))) fs.rmSync(path.join(tagDir, f)); // a tag nobody uses any more
let n = 0;
for (const [slug, o] of used) {
  const i18n = {};
  for (const l of Object.keys(TXT)) {
    if (!o.langs.has(l)) continue;
    const name = (tags[slug] && (tags[slug][l] || tags[slug].en)) || slug;
    i18n[l] = { title: TXT[l].title(name), h1: TXT[l].title(name), seoTitle: TXT[l].seo(name), description: TXT[l].desc(name), blocks: [{ type: "articles", tag: slug }] };
  }
  const page = { path: `/artiklar/tagg/${slug}`, updated: o.date, template: "articles", order: 10, published: true, hideIn: ["es", "no", "lt", "lv", "et", "ru"], i18n };
  fs.writeFileSync(path.join(tagDir, slug + ".json"), JSON.stringify(page, null, 2) + "\n");
  n++;
}
console.log(`${n} tag pages in content/pages/artiklar/tagg`);
