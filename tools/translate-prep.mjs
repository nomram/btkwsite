#!/usr/bin/env node
// Splits translations/strings.json into "copy as is" and "needs translating".
//   node tools/translate-prep.mjs        -> translations/todo.json  [{i, s}]
//   node tools/translate-prep.mjs show a b   -> print todo items a..b
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(import.meta.dirname, "..");
const T = path.join(ROOT, "translations");
const src = JSON.parse(fs.readFileSync(path.join(T, "strings.json"), "utf8"));
// no lowercase word => model codes, units, numbers, acronyms: identical in every language
const same = (s) => !/[a-zåäö]{2,}/.test(s.replace(/<[^>]+>/g, " ")) || /^[\d\s.,–\-/+()%:@°"'a-zA-Z]{1,12}$/.test(s) && !/[a-zåäö]{4,}/.test(s);
const todo = [];
src.forEach((s, i) => { if (!same(s)) todo.push({ i, s }); });
if (process.argv[2] === "show") {
  const a = +process.argv[3] || 0, b = +process.argv[4] || todo.length;
  todo.slice(a, b).forEach((t, k) => console.log(`${a + k}\t${t.s}`));
} else {
  fs.writeFileSync(path.join(T, "todo.json"), JSON.stringify(todo, null, 1));
  console.log(`${src.length} strings: ${src.length - todo.length} copied as is, ${todo.length} to translate (${todo.reduce((n, t) => n + t.s.split(/\s+/).length, 0)} words)`);
}
