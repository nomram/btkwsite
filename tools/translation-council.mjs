#!/usr/bin/env node
// Translation council: several large models review every translation of the site, a chair settles the disagreements.
//
//   node tools/translation-council.mjs --dry-run                 how many units / requests it would take (no network)
//   node tools/translation-council.mjs --lang es --limit 200     review Spanish, at most 200 new units
//   node tools/translation-council.mjs --lang en --page /produkter/haeny
//   node tools/translation-council.mjs --lang no --apply         also write the chair's corrections into the pages
//
// How it works (fast and cheap on purpose)
//  1. Pairs are taken from the pages with the same extractor as the CMS (src/lib/translatable.mjs): default language (sv) against the target language, plus content/ui/*.json.
//  2. Only NEW or CHANGED pairs are sent (a hash of source + translation + prompt version is cached in .cache/translation-council.json), so a re-run after an edit costs almost nothing.
//  3. Units go to every expert in batches (25 per request, several requests in parallel). Each expert answers per unit: score 1-5, a better translation if it is not a 5, and why.
//  4. A unit is "contested" when at least two experts score it 3 or lower (or one scores it 1-2). Only the contested units go to the chair, which gets the source, the current text, the
//     experts' suggestions and the glossary and returns keep / change + the final text.
//  5. Result: translations/review/<lang>.json (machine readable) and <lang>.md (read it, fix what you agree with). Nothing is changed unless you pass --apply.
// Experts and chair are listed in tools/council.json (any OpenAI-compatible endpoint: OpenRouter, NVIDIA build, a local server).
// Keys come from the environment only (OPENROUTER_API_KEY, NVIDIA_API_KEY, ...) and are never written anywhere.
// Terms that must be translated the same way every time live in tools/glossary.json (and are given to every model).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { visit } from "../src/lib/translatable.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : d; };
const flag = (n) => args.includes("--" + n);
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "content/site.json"), "utf8"));
const DEF = site.defaultLang || "sv";
const LANGS = opt("lang", "") ? opt("lang").split(",") : Object.keys(site.languages || {}).filter((l) => l !== DEF);
const PAGE = opt("page", "");
const LIMIT = Number(opt("limit", "0")) || Infinity;
const BATCH = Number(opt("batch", "25"));
const PARALLEL = Number(opt("parallel", "4"));
const PROMPT_V = "v1";
const NAMES = { sv: "Swedish", en: "English", es: "Spanish", no: "Norwegian (bokmål)", da: "Danish", de: "German", fi: "Finnish", fr: "French", it: "Italian", nl: "Dutch", pl: "Polish" };
const council = JSON.parse(fs.readFileSync(path.join(ROOT, "tools/council.json"), "utf8"));
const glossary = fs.existsSync(path.join(ROOT, "tools/glossary.json")) ? JSON.parse(fs.readFileSync(path.join(ROOT, "tools/glossary.json"), "utf8")) : {};
const CACHE = path.join(ROOT, ".cache/translation-council.json");
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};
const sha = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 16);
const strip = (h) => String(h).replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

// ---------- pairs ----------
function* pageFiles(dir = path.join(ROOT, "content/pages")) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) yield* pageFiles(p); else if (e.name.endsWith(".json")) yield p; }
}
function collect(lang) {
  const out = [];
  for (const f of pageFiles()) {
    const page = JSON.parse(fs.readFileSync(f, "utf8"));
    if (PAGE && !String(page.path).startsWith(PAGE)) continue;
    const src = page.i18n && page.i18n[DEF], tgt = page.i18n && page.i18n[lang];
    if (!src || !tgt) continue;
    const from = {}, to = {};
    visit(page, src, (id, v) => { from[id] = v; });
    visit(page, tgt, (id, v) => { to[id] = v; });
    for (const id of Object.keys(from)) if (to[id] && typeof from[id] === "string" && typeof to[id] === "string" && strip(from[id]).length > 1) out.push({ id, file: f, source: from[id], target: to[id] });
  }
  const uiDir = path.join(ROOT, "content/ui");
  if (!PAGE && fs.existsSync(path.join(uiDir, DEF + ".json")) && fs.existsSync(path.join(uiDir, lang + ".json"))) {
    const a = JSON.parse(fs.readFileSync(path.join(uiDir, DEF + ".json"), "utf8")), b = JSON.parse(fs.readFileSync(path.join(uiDir, lang + ".json"), "utf8"));
    for (const k of Object.keys(a)) if (typeof a[k] === "string" && typeof b[k] === "string") out.push({ id: `ui|${k}`, file: null, source: a[k], target: b[k] });
  }
  // a unit that is the same in both languages (a model name, a number) needs no review
  return out.filter((u) => u.source !== u.target || /[a-zåäö]{5,}/i.test(strip(u.source)));
}

// ---------- model calls ----------
const ENDPOINT = { openrouter: "https://openrouter.ai/api/v1/chat/completions", nvidia: "https://integrate.api.nvidia.com/v1/chat/completions" };
const KEY = { openrouter: "OPENROUTER_API_KEY", nvidia: "NVIDIA_API_KEY" };
async function ask(m, system, user, tries = 4) {
  const url = m.url || ENDPOINT[m.provider];
  const key = process.env[m.keyEnv || KEY[m.provider]];
  if (!key) throw new Error(`no key: set ${m.keyEnv || KEY[m.provider]} (used by ${m.model})`);
  for (let a = 0; a < tries; a++) {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + key }, body: JSON.stringify({ model: m.model, temperature: 0.1, messages: [{ role: "system", content: system }, { role: "user", content: user }] }) });
    if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 1500 * 2 ** a)); continue; }
    if (!res.ok) throw new Error(`${m.model}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    const j = await res.json();
    return (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "";
  }
  throw new Error(`${m.model}: still failing after ${tries} tries`);
}
const parseJson = (t) => { const m = String(t).match(/\[[\s\S]*\]/); if (!m) return null; try { return JSON.parse(m[0]); } catch { return null; } };
const gloss = (lang) => Object.entries(glossary).filter(([, v]) => v[lang]).map(([k, v]) => `${k} = ${v[lang]}`).join("\n");

function expertPrompt(lang) {
  return `You review translations on the website of a Swedish distributor of construction and drilling equipment (rock drills, grouting pumps, floor protection, concrete protection).
The source language is ${NAMES[DEF]}; the target language is ${NAMES[lang] || lang}. Judge each translation for: accuracy (nothing added, nothing missing), correct technical terminology, natural wording a native professional would use, grammar and spelling, text left untranslated by mistake, and consistency with the glossary. Keep numbers, units, brand and model names, and HTML tags exactly as in the source. Do not rewrite for style alone.
Glossary (use these translations):
${gloss(lang) || "(none)"}
Reply with ONLY a JSON array, one object per unit, in the same order: {"i": <number>, "score": 1-5, "fix": "<better translation, or empty string if score is 5>", "why": "<short reason, empty if 5>"}. 5 = perfect, 4 = fine, 3 = noticeable problem, 2 = wrong term or clear error, 1 = wrong meaning.`;
}
const unitsText = (batch) => batch.map((u, i) => `#${i}\nSOURCE: ${u.source}\nTRANSLATION: ${u.target}`).join("\n\n");

async function pool(items, n, fn) { let i = 0; const run = async () => { while (i < items.length) { const k = i++; await fn(items[k], k); } }; await Promise.all(Array.from({ length: Math.min(n, items.length) }, run)); }

// ---------- main ----------
for (const lang of LANGS) {
  const all = collect(lang);
  const todo = all.filter((u) => !cache[sha([u.source, u.target, lang, PROMPT_V].join("|"))]).slice(0, LIMIT);
  const batches = []; for (let i = 0; i < todo.length; i += BATCH) batches.push(todo.slice(i, i + BATCH));
  const chars = todo.reduce((n, u) => n + u.source.length + u.target.length, 0);
  console.log(`${lang}: ${all.length} units, ${all.length - todo.length} already reviewed, ${todo.length} to review in ${batches.length} requests per expert (${council.experts.length} experts, about ${Math.round(chars / 4 * council.experts.length / 1000)}k input tokens)`);
  if (flag("dry-run") || !todo.length) continue;
  // 1. every expert scores every unit
  const sys = expertPrompt(lang);
  const votes = new Map(); // unit -> [{model, score, fix, why}]
  await pool(batches.flatMap((b) => council.experts.map((e) => ({ b, e }))), PARALLEL, async ({ b, e }) => {
    try {
      const rows = parseJson(await ask(e, sys, unitsText(b)));
      if (!rows) return;
      for (const r of rows) { const u = b[r.i]; if (!u) continue; if (!votes.has(u)) votes.set(u, []); votes.get(u).push({ model: e.model, score: Number(r.score) || 0, fix: r.fix || "", why: r.why || "" }); }
    } catch (err) { console.warn("  !", err.message); }
  });
  // 2. contested units go to the chair
  const contested = [...votes].filter(([, v]) => v.filter((x) => x.score <= 3).length >= 2 || v.some((x) => x.score <= 2 && x.score > 0));
  console.log(`  ${votes.size} units scored, ${contested.length} contested`);
  const decisions = new Map();
  const chairSys = `You are the chair of a translation review council for a Swedish construction-equipment website. Source language ${NAMES[DEF]}, target ${NAMES[lang] || lang}. For each unit you get the source, the current translation and the experts' scores and suggestions. Decide: "keep" the current translation, or "change" to a final translation (you may pick an expert's suggestion or write your own). Keep numbers, units, model names and HTML tags exactly. Glossary:\n${gloss(lang) || "(none)"}\nReply with ONLY a JSON array: {"i": <number>, "verdict": "keep"|"change", "final": "<final translation>", "reason": "<short>"}.`;
  const cBatches = []; for (let i = 0; i < contested.length; i += 15) cBatches.push(contested.slice(i, i + 15));
  await pool(cBatches, PARALLEL, async (cb) => {
    const txt = cb.map(([u, v], i) => `#${i}\nSOURCE: ${u.source}\nCURRENT: ${u.target}\n` + v.map((x) => `- ${x.model}: score ${x.score}${x.fix ? `, suggests: ${x.fix}` : ""}${x.why ? ` (${x.why})` : ""}`).join("\n")).join("\n\n");
    try {
      const rows = parseJson(await ask(council.chair, chairSys, txt));
      for (const r of rows || []) { const e = cb[r.i]; if (e) decisions.set(e[0], r); }
    } catch (err) { console.warn("  !", err.message); }
  });
  // 3. cache, report, optional apply
  const report = [];
  for (const [u, v] of votes) {
    const d = decisions.get(u);
    const avg = v.reduce((n, x) => n + x.score, 0) / v.length;
    cache[sha([u.source, u.target, lang, PROMPT_V].join("|"))] = { avg: Math.round(avg * 10) / 10, verdict: d ? d.verdict : "ok" };
    if (d && d.verdict === "change" && d.final && d.final !== u.target) report.push({ id: u.id, source: u.source, current: u.target, final: d.final, reason: d.reason || "", avg, votes: v });
  }
  fs.mkdirSync(path.join(ROOT, "translations/review"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, `translations/review/${lang}.json`), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(ROOT, `translations/review/${lang}.md`), `# ${lang}: ${report.length} suggested changes\n\n` + report.map((r) => `### ${r.id}\n- source: ${r.source}\n- now: ${r.current}\n- **suggested:** ${r.final}\n- why: ${r.reason} (average score ${r.avg.toFixed(1)})\n`).join("\n"));
  console.log(`  ${report.length} changes suggested -> translations/review/${lang}.md`);
  if (flag("apply") && report.length) {
    const byFile = new Map();
    for (const r of report) { const u = [...votes.keys()].find((x) => x.id === r.id); if (u && u.file) { if (!byFile.has(u.file)) byFile.set(u.file, []); byFile.get(u.file).push(r); } }
    for (const [f, rs] of byFile) {
      const raw = fs.readFileSync(f, "utf8"); const eol = raw.includes("\r\n") ? "\r\n" : "\n"; const page = JSON.parse(raw);
      visit(page, page.i18n[lang], (id, v, set) => { const r = rs.find((x) => x.id === id); if (r && v === r.current) set(r.final); });
      fs.writeFileSync(f, JSON.stringify(page, null, 2).replace(/\n/g, eol) + eol);
    }
    console.log(`  applied to ${byFile.size} pages`);
  }
}
fs.mkdirSync(path.dirname(CACHE), { recursive: true });
fs.writeFileSync(CACHE, JSON.stringify(cache));
