#!/usr/bin/env node
// Downloads the poster picture of every YouTube video used on the site, once, and stores it in
// assets-src/yt/<id>.webp (the build also does this by itself for videos that have no picture yet).
// The site then shows the local picture until the visitor clicks play, so no request goes to YouTube/Google before that click.
//   node tools/fetch-yt-thumbs.mjs          fetch missing thumbnails
//   node tools/fetch-yt-thumbs.mjs --force  fetch all again
import fs from "node:fs";
import path from "node:path";
import { videoIds, ensureThumbs } from "../src/lib/yt-thumbs.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith(".json") ? [path.join(d, e.name)] : []));
const ids = new Set();
for (const f of walk(path.join(ROOT, "content/pages"))) videoIds(JSON.parse(fs.readFileSync(f, "utf8")), ids);

const { got, had, missing } = await ensureThumbs(ids, path.join(ROOT, "assets-src/yt"), { force: process.argv.includes("--force") });
console.log(`video thumbnails: ${got} fetched, ${had} already there, ${missing.length} unavailable${missing.length ? " (" + missing.join(", ") + ")" : ""}`);
