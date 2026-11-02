#!/usr/bin/env node
// Häny technology section: the cutaway of the pump module (haeny-4.webp) is laid exactly over the ZMP 610 module of the photo
// (haeny-tech-plunger.webp) so that site.js can show it through a round "x-ray" lens that follows the mouse.
// The cutaway is drawn from the other side than the photo (its pressure gauge is on the left, on the machine it is on the right), so it is
// mirrored first. Its white background is removed (only what is enclosed by the drawing's own outline stays), the two arrows are erased,
// and it is scaled and placed on a transparent canvas of the photo's size.
//   assets-src/img/haeny-tech-plunger-xray.webp   (894 x 786, transparent)
//   node tools/haeny-xray.mjs [--preview]         --preview also writes check pictures to the temp folder
// The placement lives in tools/haeny-xray.json: { scale, left, top, splitY, shear }. Tune it by hand or with the alignment app (tools/fx-align.mjs).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const IMG = path.join(ROOT, "assets-src/img");
export const BASE = path.join(IMG, "haeny-tech-plunger.webp"), CUT = path.join(IMG, "haeny-4.webp"), OUT = path.join(IMG, "haeny-tech-plunger-xray.webp");
export const PLACE_FILE = path.join(import.meta.dirname, "haeny-xray.json");
// scale of the (mirrored) cutaway on the photo, where its top left corner goes (photo pixels); below `splitY` (drawing pixels, the pump head) the
// body leans to the right by `shear` pixels per pixel: on the photo the pump is seen from an angle
export const DEFAULT_PLACE = { scale: 0.325, left: 217.6, top: 162.9, splitY: 1000, shear: 0.148 };
export const readPlace = () => (fs.existsSync(PLACE_FILE) ? { ...DEFAULT_PLACE, ...JSON.parse(fs.readFileSync(PLACE_FILE, "utf8")) } : { ...DEFAULT_PLACE });

// the cutaway as it is used: arrows erased, mirrored, white background transparent (PNG at the drawing's own size)
let cutCache = null;
export async function cutout() {
  if (cutCache) return cutCache;
  const cm = await sharp(CUT).metadata();
  const rgba = await sharp(CUT).flatten({ background: "#ffffff" }).ensureAlpha().raw().toBuffer();
  const cw = cm.width, ch = cm.height;
  const whiteOut = (x0, y0, x1, y1) => { for (let y = y0; y < Math.min(ch, y1); y++) for (let x = x0; x < Math.min(cw, x1); x++) { const i = (y * cw + x) * 4; rgba[i] = rgba[i + 1] = rgba[i + 2] = 255; } };
  whiteOut(0, 740, 165, 840);   // the arrow at the left
  whiteOut(190, 1455, 365, ch); // the arrow at the bottom
  const isWhite = (i) => rgba[i] > 232 && rgba[i + 1] > 232 && rgba[i + 2] > 232;
  const gone = new Uint8Array(cw * ch), stack = [];
  const push = (x, y) => { if (x < 0 || y < 0 || x >= cw || y >= ch) return; const p = y * cw + x; if (gone[p] || !isWhite(p * 4)) return; gone[p] = 1; stack.push(p); };
  for (let x = 0; x < cw; x++) { push(x, 0); push(x, ch - 1); }
  for (let y = 0; y < ch; y++) { push(0, y); push(cw - 1, y); }
  while (stack.length) { const p = stack.pop(), x = p % cw, y = (p - x) / cw; push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }
  // soft edge: light pixels next to the removed background get partly transparent, so no white fringe is left around the outline
  for (let pass = 0; pass < 2; pass++) {
    const next = new Uint8Array(gone);
    for (let y = 1; y < ch - 1; y++) for (let x = 1; x < cw - 1; x++) {
      const p = y * cw + x; if (gone[p]) continue;
      if (!(gone[p - 1] || gone[p + 1] || gone[p - cw] || gone[p + cw])) continue;
      const i = p * 4, lum = (rgba[i] + rgba[i + 1] + rgba[i + 2]) / 3;
      if (lum > 205) next[p] = 1; else if (lum > 150) rgba[i + 3] = Math.round(255 * (205 - lum) / 55);
    }
    gone.set(next);
  }
  for (let p = 0; p < cw * ch; p++) if (gone[p]) rgba[p * 4 + 3] = 0;
  cutCache = { png: await sharp(rgba, { raw: { width: cw, height: ch, channels: 4 } }).flop().png().toBuffer(), width: cw, height: ch };
  return cutCache;
}

// writes the overlay picture; returns the area (percent of the photo) in which the cutaway has something to show
export async function build(place = readPlace(), { preview = false } = {}) {
  const { width: W, height: H } = await sharp(BASE).metadata();
  const cut = await cutout();
  const sw = Math.round(cut.width * place.scale), sh = Math.round(cut.height * place.scale);
  let placed = await sharp(cut.png).resize({ width: sw, height: sh, kernel: "lanczos3" }).png().toBuffer();
  if (place.shear) {
    const yH = Math.max(1, Math.min(sh - 1, Math.round(place.splitY * place.scale)));
    const upper = await sharp(placed).extract({ left: 0, top: 0, width: sw, height: yH }).png().toBuffer();
    const lowerRaw = await sharp(placed).extract({ left: 0, top: yH, width: sw, height: sh - yH }).png().toBuffer();
    const lower = await sharp(lowerRaw).affine([[1, place.shear], [0, 1]], { background: { r: 0, g: 0, b: 0, alpha: 0 }, interpolator: sharp.interpolators.bicubic }).png().toBuffer();
    const lm = await sharp(lower).metadata();
    placed = await sharp({ create: { width: Math.max(sw, lm.width), height: sh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: upper, left: 0, top: 0 }, { input: lower, left: 0, top: yH }]).png().toBuffer();
  }
  const pm = await sharp(placed).metadata();
  const L = Math.round(place.left), T = Math.round(place.top);
  const cropL = Math.max(0, -L), cropT = Math.max(0, -T);
  const visW = Math.min(pm.width - cropL, W - Math.max(0, L)), visH = Math.min(pm.height - cropT, H - Math.max(0, T));
  const empty = { create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } };
  const canvas = visW > 0 && visH > 0
    ? await sharp(empty).composite([{ input: await sharp(placed).extract({ left: cropL, top: cropT, width: visW, height: visH }).png().toBuffer(), left: Math.max(0, L), top: Math.max(0, T) }]).png().toBuffer()
    : await sharp(empty).png().toBuffer();
  await sharp(canvas).webp({ quality: 90, alphaQuality: 100 }).toFile(OUT);
  const raw = await sharp(canvas).raw().toBuffer();
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (raw[(y * W + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const pct = (v, t) => Math.round((v / t) * 1000) / 10;
  const area = x1 > x0 ? { x: pct(x0, W), y: pct(y0, H), w: pct(x1 - x0, W), h: pct(y1 - y0, H) } : { x: 0, y: 0, w: 0, h: 0 };
  if (preview) {
    const base = await sharp(BASE).flatten({ background: "#fff" }).png().toBuffer();
    const crop = (b, name) => sharp(b).extract({ left: 150, top: 120, width: 330, height: 620 }).resize({ height: 1000 }).jpeg({ quality: 88 }).toFile(path.join(os.tmpdir(), name));
    await crop(await sharp(base).composite([{ input: canvas }]).png().toBuffer(), "haeny-xray-full.jpg");
    const half = await sharp(canvas).linear([1, 1, 1, 0.55], [0, 0, 0, 0]).png().toBuffer();
    await crop(await sharp(base).composite([{ input: half }]).png().toBuffer(), "haeny-xray-half.jpg");
  }
  return area;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const area = await build(readPlace(), { preview: process.argv.includes("--preview") });
  console.log(`haeny-tech-plunger-xray.webp; area x ${area.x}-${Math.round((area.x + area.w) * 10) / 10} %, y ${area.y}-${Math.round((area.y + area.h) * 10) / 10} %`);
}
