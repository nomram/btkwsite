// Live check: every video block of the build has a poster picture in its HTML and that picture comes back from the published site (node tools/check-live-posters.mjs, after a deploy)
import fs from "node:fs";
import path from "node:path";
const BASE = "https://nomram.github.io/btkwsite";
const dist = "dist";
const pages = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== "assets" && e.name !== "cms") walk(p); } else if (e.name.endsWith(".html")) pages.push(p); } })(dist);
const withVideo = pages.filter((p) => fs.readFileSync(p, "utf8").includes('data-yt="'));
console.log("pages with a video in the build:", withVideo.length);
const bad = [], seen = new Map();
let figs = 0;
for (const p of withVideo) {
  const html = fs.readFileSync(p, "utf8");
  const url = BASE + "/" + path.relative(dist, p).split(path.sep).join("/").replace(/\.html$/, "");
  const figures = [...html.matchAll(/<figure class="video([^"]*)" data-yt="([^"]+)"[^>]*>(.*?)<\/figure>/g)];
  for (const m of figures) {
    figs++;
    const poster = (m[3].match(/<img class="video__poster" src="([^"]+)"/) || [])[1];
    if (!poster) { bad.push(`${url}: no poster in the HTML (${m[2]})`); continue; }
    if (!seen.has(poster)) {
      const r = await fetch(BASE + poster);
      const b = r.ok ? Buffer.from(await r.arrayBuffer()) : null;
      seen.set(poster, r.ok && b.length > 5000 ? "ok" : `HTTP ${r.status} ${b ? b.length : 0} bytes`);
    }
    if (seen.get(poster) !== "ok") bad.push(`${url}: poster ${poster} -> ${seen.get(poster)}`);
  }
}
console.log("video blocks:", figs, "| distinct poster files:", seen.size, "| problems:", bad.length);
bad.forEach((b) => console.log(" ", b));
