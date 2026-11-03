#!/usr/bin/env node
// Titles of the YouTube videos: read from YouTube (public oEmbed data, no key) and written into every video block of the pages.
//   title    only where the block has none (titles that were written by hand, e.g. translated ones, are kept)
//   channel  always (the name of the channel that published the video; shown under the title on the poster)
//   node tools/fetch-yt-titles.mjs            fill in the pages
//   node tools/fetch-yt-titles.mjs --check    only list what is missing
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PAGES = path.join(ROOT, "content/pages");
const CHECK = process.argv.includes("--check");

function* files(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* files(p); else if (e.name.endsWith(".json")) yield p;
  }
}
const clean = (s) => String(s || "").replace(/[​-‏⁠﻿]/g, "").replace(/\s+/g, " ").trim();
const videos = (o, out = []) => {
  if (Array.isArray(o)) o.forEach((x) => videos(x, out));
  else if (o && typeof o === "object") { if (o.type === "video" && o.id) out.push(o); for (const v of Object.values(o)) if (v && typeof v === "object") videos(v, out); }
  return out;
};

const pages = [...files(PAGES)].map((f) => { const raw = fs.readFileSync(f, "utf8"); return { f, raw, j: JSON.parse(raw) }; });
const ids = new Set();
for (const p of pages) for (const t of Object.values(p.j.i18n || {})) for (const v of videos(t)) ids.add(v.id);

const info = new Map();
for (const id of ids) {
  try {
    const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent("https://www.youtube.com/watch?v=" + id)}&format=json`);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    info.set(id, { title: clean(j.title), channel: clean(j.author_name) });
  } catch (e) { console.warn(`! ${id}: ${e.message}`); }
}

let filled = 0, channels = 0;
for (const p of pages) {
  let changed = false;
  for (const t of Object.values(p.j.i18n || {})) for (const v of videos(t)) {
    const i = info.get(v.id);
    if (!i) continue;
    if (!v.title && i.title) { v.title = i.title; filled++; changed = true; }
    if (i.channel && v.channel !== i.channel) { v.channel = i.channel; channels++; changed = true; }
  }
  if (changed && !CHECK) {
    const eol = p.raw.includes("\r\n") ? "\r\n" : "\n";
    fs.writeFileSync(p.f, JSON.stringify(p.j, null, 2).replace(/\n/g, eol) + eol);
  }
}
console.log(`${ids.size} videos, ${info.size} found at YouTube; titles filled in: ${filled}, channel names set: ${channels}${CHECK ? " (dry run)" : ""}`);
