#!/usr/bin/env node
// Merges translations/chunks/*.json (todo-index -> [en, es, no]) with the auto "same in
// every language" strings into translations/{en,es,no}.json (arrays aligned with strings.json).
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(import.meta.dirname, "..");
const T = path.join(ROOT, "translations");
const src = JSON.parse(fs.readFileSync(path.join(T, "strings.json"), "utf8"));
const todo = JSON.parse(fs.readFileSync(path.join(T, "todo.json"), "utf8"));
const chunks = {};
for (const f of fs.readdirSync(path.join(T, "chunks")).filter((f) => f.endsWith(".json")).sort()) {
  const part = JSON.parse(fs.readFileSync(path.join(T, "chunks", f), "utf8"));
  for (const [k, v] of Object.entries(part)) chunks[k] = v;
}
const langs = ["en", "es", "no"];
const out = { en: [...src], es: [...src], no: [...src] };
let missing = [];
todo.forEach((t, ti) => {
  const tr = chunks[String(ti)];
  if (!tr) { missing.push(ti); return; }
  if (tr.length !== 3) throw new Error("chunk item " + ti + " does not have 3 translations");
  langs.forEach((l, li) => { out[l][t.i] = tr[li]; });
});
for (const l of langs) fs.writeFileSync(path.join(T, `${l}.json`), JSON.stringify(out[l], null, 1));
console.log(`merged ${todo.length - missing.length}/${todo.length} translated items; missing: ${missing.length}${missing.length ? " -> " + missing.slice(0, 40).join(",") : ""}`);
