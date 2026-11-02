#!/usr/bin/env node
// Alignment app for the picture effects and the thumbnails. Run it, open http://localhost:4190 and drag things into place:
//   Dots        dots and their labels on the IC 310 machine, and the dot on the Häny pumps whose "label" is the cutaway picture
//   Thumbnails  placement and zoom of the photo of every brand card on the products page
//   X-ray       (on hold) the mirrored cutaway of the pump module laid over the ZMP 610 photo
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
const LANGS = ["sv", "en", "es", "no"]; // the languages the app has a text field for
// positions and zoom are the same in every language: written to all of them. The text of a language without a field here is left as it is.
const ALL_LANGS = Object.keys(JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "../content/site.json"), "utf8")).languages);
const IC_FILE = "content/pages/produkter/haeny/manuella-pumpar/ic-310-ic-311.json", HAENY_FILE = "content/pages/produkter/haeny.json", PRODUCTS_FILE = "content/pages/produkter.json";
const rw = (f, fn) => {
  const file = path.join(ROOT, f), raw = fs.readFileSync(file, "utf8"), eol = raw.includes("\r\n") ? "\r\n" : "\n", j = JSON.parse(raw);
  const out = fn(j);
  fs.writeFileSync(file, JSON.stringify(j, null, 2).replace(/\n/g, eol) + eol);
  return out;
};
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8"));

// the pictures that carry callouts: where they are in the content
const TARGETS = {
  ic310: { file: IC_FILE, find: (j, l) => j.i18n[l].blocks.find((b) => b.type === "image" && /ic-310-ic-311-2\.webp$/.test(b.src || "")) },
  ic325: { file: "content/pages/produkter/haeny/manuella-pumpar/ic-325-ccp.json", find: (j, l) => j.i18n[l].blocks.find((b) => b.type === "image" && /haeny-ic325-ccp-combo\.webp$/.test(b.src || "")) },
  haeny: { file: HAENY_FILE, find: (j, l) => j.i18n[l].blocks.flatMap((b) => b.left || []).find((x) => x.type === "image" && /haeny-tech-plunger\.webp$/.test(x.src || "")) }
};

async function state(target = "ic310") {
  const t = TARGETS[target], j = read(t.file), img = t.find(j, "sv");
  const baseMeta = await sharp(BASE).metadata(), cut = await cutout();
  const callouts = (img.callouts || []).map((c, i) => ({
    kind: c.kind || "", x: c.x, y: c.y, lx: c.lx, ly: c.ly, x1: c.x1, y1: c.y1, x2: c.x2, y2: c.y2, tick: c.tick || 3, side: c.side === -1 ? -1 : 1, dir: c.dir || "r", v: c.v || "u", iw: c.iw || 30, image: c.image || "", text: Object.fromEntries(LANGS.map((l) => [l, ((t.find(j, l).callouts || [])[i] || {}).text || ""]))
  }));
  const meta = await sharp(path.join(ROOT, "assets-src/img", img.src.split("/").pop())).metadata();
  let pic = null;
  if (callouts.some((c) => c.image)) { const m = await sharp(path.join(ROOT, "assets-src/img", callouts.find((c) => c.image).image.split("/").pop())).metadata(); pic = { width: m.width, height: m.height }; }
  return { target, place: readPlace(), base: { width: baseMeta.width, height: baseMeta.height }, cut: { width: cut.width, height: cut.height }, machine: { src: img.src.split("/").pop(), width: meta.width, height: meta.height }, callouts, pic };
}

function saveCallouts(target, list) {
  const t = TARGETS[target];
  rw(t.file, (j) => {
    for (const l of ALL_LANGS) {
      const img = t.find(j, l);
      if (!img) continue;
      const old = img.callouts || [];
      const own = (c, i) => String((c.text && c.text[l]) || (LANGS.includes(l) ? "" : (old[i] && old[i].text) || "") || (c.text && c.text.sv) || "");
      img.callouts = list.map((c, i) => c.kind === "bracket" ? ({
        kind: "bracket", x: +c.x, y: +c.y, x1: +c.x1, y1: +c.y1, x2: +c.x2, y2: +c.y2, tick: +c.tick || 3, side: +c.side === -1 ? -1 : 1,
        text: own(c, i)
      }) : ({
        x: +c.x, y: +c.y, lx: +c.lx, ly: +c.ly, dir: c.dir === "l" ? "l" : "r",
        ...(c.image ? { v: c.v === "d" ? "d" : "u", iw: +c.iw || 30, image: c.image } : {}),
        text: own(c, i)
      }));
    }
  });
}
async function saveXray(input) {
  const place = Object.fromEntries(["x", "y", "scaleX", "scaleY", "rotate", "skewX", "skewY"].map((k) => [k, Math.round((Number(input[k]) || 0) * 1e4) / 1e4]));
  fs.writeFileSync(PLACE_FILE, JSON.stringify(place, null, 2) + "\n");
  const area = await build(place);
  const pad = 1.5, box = { x: Math.max(0, area.x - pad), y: Math.max(0, area.y - pad), w: Math.min(100, area.w + 2 * pad), h: Math.min(100, area.h + 2 * pad) };
  rw(HAENY_FILE, (j) => {
    for (const l of ALL_LANGS) if (j.i18n[l]) for (const b of j.i18n[l].blocks) for (const x of b.left || []) if (x.type === "image" && x.overlay) x.overlayArea = Object.fromEntries(Object.entries(box).map(([k, v]) => [k, Math.round(v * 10) / 10]));
  });
  return area;
}

// ---- thumbnails of the brand cards
async function thumbs() {
  const items = read(PRODUCTS_FILE).i18n.sv.blocks[0].items.filter((it) => it.photo);
  const out = [];
  for (const it of items) {
    const name = it.photo.split("/").pop(), m = await sharp(path.join(ROOT, "assets-src/img", name)).metadata();
    const page = read(`content/pages${it.href}.json`);
    out.push({ slug: it.href.split("/").pop(), name: page.i18n.sv.title, file: name, width: m.width, height: m.height, x: it.photoX ?? 50, y: it.photoY ?? 50, zoom: it.photoZoom ?? 1 });
  }
  return out;
}
function saveThumbs(list) {
  const by = Object.fromEntries(list.map((t) => [t.slug, t]));
  rw(PRODUCTS_FILE, (j) => {
    for (const l of ALL_LANGS) if (j.i18n[l]) for (const b of j.i18n[l].blocks) for (const it of b.items || []) {
      const t = by[(it.href || "").split("/").pop()];
      if (t && it.photo) { it.photoX = Math.round(+t.x * 10) / 10; it.photoY = Math.round(+t.y * 10) / 10; it.photoZoom = Math.round(+t.zoom * 100) / 100; }
    }
  });
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
    if (url.pathname === "/api/state") return json(res, await state(url.searchParams.get("target") || "ic310"));
    if (url.pathname === "/api/callouts" && req.method === "POST") { const b = await body(req); saveCallouts(b.target || "ic310", b.callouts || []); return json(res, { ok: true }); }
    if (url.pathname === "/api/xray" && req.method === "POST") { const { place } = await body(req); return json(res, { ok: true, area: await saveXray(place) }); }
    if (url.pathname === "/api/thumbs" && req.method === "GET") return json(res, await thumbs());
    if (url.pathname === "/api/thumbs" && req.method === "POST") { saveThumbs((await body(req)).thumbs || []); return json(res, { ok: true }); }
    res.writeHead(404); res.end();
  } catch (e) { console.error(e); json(res, { ok: false, error: String(e.message || e) }, 500); }
}).listen(PORT, () => console.log(`alignment app: http://localhost:${PORT}/  (stop the dev server first; Ctrl+C to quit)`));
