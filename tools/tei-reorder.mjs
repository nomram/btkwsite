#!/usr/bin/env node
// /produkter/tei/borrmaster: the man-portable masts (MP260, MPH) come straight after the regular masts, then the tables
// (mast comparison, feed systems). Also fixes "olikastorleksklasser". Safe to run again.
import fs from "node:fs";
import path from "node:path";
const f = path.join(path.resolve(import.meta.dirname, ".."), "content/pages/produkter/tei/borrmaster.json");
const raw = fs.readFileSync(f, "utf8"); const eol = raw.includes("\r\n") ? "\r\n" : "\n"; const j = JSON.parse(raw);
for (const l of Object.keys(j.i18n)) {
  const bl = j.i18n[l].blocks;
  for (const b of bl) if (b.type === "text" && /olikastorleksklasser/.test(b.html)) b.html = b.html.replace("olikastorleksklasser", "olika storleksklasser");
  const cards = bl.map((b, i) => (b.type === "cards" ? i : -1)).filter((i) => i >= 0);
  if (cards.length < 2) continue;
  const portCards = cards[cards.length - 1];
  const intro = portCards - 1;                                  // "In addition there are man-portable masts ..."
  const port = bl[portCards + 1] && bl[portCards + 1].feeds ? portCards + 1 : -1; // MP260 vs MPH feed text
  const firstTable = bl.findIndex((b) => b.type === "table");
  if (firstTable < 0 || firstTable > intro) continue;           // already reordered
  const tables = bl.slice(firstTable, intro);                   // comparison table, its note, the feed section
  const portable = bl.slice(intro, port >= 0 ? port + 1 : portCards + 1);
  const after = bl.slice(port >= 0 ? port + 1 : portCards + 1);
  j.i18n[l].blocks = [...bl.slice(0, firstTable), ...portable, ...tables, ...after];
}
fs.writeFileSync(f, JSON.stringify(j, null, 2).replace(/\n/g, eol) + eol);
console.log("borrmaster reordered");
