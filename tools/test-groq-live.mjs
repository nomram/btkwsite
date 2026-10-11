#!/usr/bin/env node
// Live check of the CMS's AI client against a real provider (default Groq).
// The key is read from the environment and never written anywhere:
//   GROQ_API_KEY=gsk_... node tools/test-groq-live.mjs [model] [effort]
import { listModels, translateStrings, validateTranslation } from "../admin/ai.js";

const key = process.env.GROQ_API_KEY;
if (!key) { console.error("Set GROQ_API_KEY first."); process.exit(2); }
const model = process.argv[2] || "openai/gpt-oss-120b";
const effort = process.argv[3] || "high";
const cfg = { baseUrl: process.env.AI_BASE_URL || "https://api.groq.com/openai/v1", key, model, effort };

const samples = [
  "Hydraulisk borrigg med högt moment",
  "Passar de flesta medelstora ankarriggar",
  "Rotationsmoment: 4067 Nm",
  "Vikt",
  "Kontakta oss för mer information om <a href=\"/produkter/tei\">TEI Rock Drills</a> och våra <strong>topphammare</strong>.",
  "Företaget är en leverantör och konsult inom byggindustrin, med en stark inriktning på betong, ytskydd, geoteknik, betongpumpar och borriggar.",
  "Slagenergi",
  "TE760"
];

try {
  const t0 = Date.now();
  const models = await listModels(cfg);
  console.log(`models (${models.length}):`, models.slice(0, 12).join(", "));
  console.log(`using ${model}, thinking=${effort}`);
  const { map, warnings } = await translateStrings(cfg, samples, { from: "sv", to: "en", glossary: ["TEI Rock Drills", "TE760"] });
  for (const s of samples) {
    const tr = map.get(s);
    console.log(`  ${validateTranslation(s, tr).length ? "!!" : "ok"}  ${s.slice(0, 70)}\n      -> ${tr}`);
  }
  const no = await translateStrings(cfg, samples.slice(0, 3), { from: "sv", to: "no" });
  console.log("Norwegian:", [...no.map.values()].join(" | "));
  console.log(`warnings: ${warnings.length}, total ${((Date.now() - t0) / 1000).toFixed(1)}s`);
} catch (e) {
  console.error("FAILED:", e.message, e.detail ? String(e.detail).slice(0, 300) : "");
  process.exit(1);
}
