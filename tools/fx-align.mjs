#!/usr/bin/env node
// Alignment app for the two picture effects on the Häny pages. Run it, open http://localhost:4190 and drag things into place:
//   Dots   the three dots and their labels on the IC 310 machine (page /produkter/haeny/manuella-pumpar/ic-310-ic-311)
//   X-ray  the mirrored cutaway of the pump module over the ZMP 610 photo (page /produkter/haeny, "Hänys teknologi")
// "Save" writes the content files (all four languages) and, for the x-ray, makes the overlay picture again (tools/haeny-xray.mjs).
// Stop the dev server (tools/serve.mjs) first: it holds the picture files open. Then run the dev server or the build to see the result on the site.
//   node tools/fx-align.mjs [--port 4190]
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import sharp from "sharp";
import { build, cutout, readPlace, PLACE_FILE, BASE } from "./haeny-xray.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const PORT = Number((process.argv.includes("--port") && process.argv[process.argv.indexOf("--port") + 1]) || 4190);
const LANGS = ["sv", "en", "es", "no"];
const IC_FILE = "content/pages/produkter/haeny/manuella-pumpar/ic-310-ic-311.json", HAENY_FILE = "content/pages/produkter/haeny.json";
const rw = (f, fn) => {
  const file = path.join(ROOT, f), raw = fs.readFileSync(file, "utf8"), eol = raw.includes("\r\n") ? "\r\n" : "\n", j = JSON.parse(raw);
  const out = fn(j);
  fs.writeFileSync(file, JSON.stringify(j, null, 2).replace(/\n/g, eol) + eol);
  return out;
};
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8"));
const icImage = (j, l) => j.i18n[l].blocks.find((b) => b.type === "image" && /ic-310-ic-311-2\.webp$/.test(b.src || ""));

async function state() {
  const ic = read(IC_FILE);
  const img = icImage(ic, "sv");
  const baseMeta = await sharp(BASE).metadata(), cut = await cutout();
  const callouts = (img.callouts || []).map((c, i) => ({ x: c.x, y: c.y, lx: c.lx, ly: c.ly, dir: c.dir || "r", text: Object.fromEntries(LANGS.map((l) => [l, ((icImage(ic, l).callouts || [])[i] || {}).text || ""])) }));
  return { place: readPlace(), base: { width: baseMeta.width, height: baseMeta.height }, cut: { width: cut.width, height: cut.height }, machine: { src: img.src.split("/").pop(), width: img.width, height: img.height }, callouts };
}

function saveCallouts(list) {
  rw(IC_FILE, (j) => {
    for (const l of LANGS) {
      const img = icImage(j, l);
      img.callouts = list.map((c) => ({ x: +c.x, y: +c.y, lx: +c.lx, ly: +c.ly, dir: c.dir === "l" ? "l" : "r", text: String((c.text && c.text[l]) || (c.text && c.text.sv) || "") }));
    }
  });
}
async function saveXray(place) {
  fs.writeFileSync(PLACE_FILE, JSON.stringify(place, null, 2) + "\n");
  const area = await build(place);
  const pad = 1.5, box = { x: Math.max(0, area.x - pad), y: Math.max(0, area.y - pad), w: Math.min(100, area.w + 2 * pad), h: Math.min(100, area.h + 2 * pad) };
  rw(HAENY_FILE, (j) => {
    for (const l of LANGS) for (const b of j.i18n[l].blocks) for (const x of b.left || []) if (x.type === "image" && x.overlay) x.overlayArea = Object.fromEntries(Object.entries(box).map(([k, v]) => [k, Math.round(v * 10) / 10]));
  });
  return area;
}

const body = (req) => new Promise((res) => { let s = ""; req.on("data", (c) => (s += c)); req.on("end", () => { try { res(JSON.parse(s || "{}")); } catch { res({}); } }); });
const json = (res, o, code = 200) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(o)); };

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/") { res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }); return res.end(fs.readFileSync(path.join(import.meta.dirname, "fx-align.html"))); }
    if (url.pathname.startsWith("/img/")) {
      const name = path.basename(decodeURIComponent(url.pathname.slice(5)));
      const file = path.join(ROOT, "assets-src/img", name);
      if (!/^[\w.-]+\.(webp|png|jpg)$/.test(name) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { "Content-Type": name.endsWith(".webp") ? "image/webp" : name.endsWith(".png") ? "image/png" : "image/jpeg", "Cache-Control": "no-store" });
      return res.end(fs.readFileSync(file));
    }
    if (url.pathname === "/cutout.png") { res.writeHead(200, { "Content-Type": "image/png" }); return res.end((await cutout()).png); }
    if (url.pathname === "/api/state") return json(res, await state());
    if (url.pathname === "/api/callouts" && req.method === "POST") { saveCallouts((await body(req)).callouts || []); return json(res, { ok: true }); }
    if (url.pathname === "/api/xray" && req.method === "POST") { const { place } = await body(req); return json(res, { ok: true, area: await saveXray(place) }); }
    res.writeHead(404); res.end();
  } catch (e) { console.error(e); json(res, { ok: false, error: String(e.message || e) }, 500); }
}).listen(PORT, () => console.log(`alignment app: http://localhost:${PORT}/  (stop the dev server first; Ctrl+C to quit)`));
