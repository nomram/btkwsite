#!/usr/bin/env node
// Häny technology section: the cutaway of the pump module (haeny-4.webp) is laid exactly over the ZMP 610 module of the photo
// (haeny-tech-plunger.webp) so that site.js can show it through a round "x-ray" lens that follows the mouse.
// The cutaway is drawn from the other side than the photo (its pressure gauge is on the left, on the machine it is on the right), so it is
// mirrored first. Its white background is removed (only what is enclosed by the drawing's own outline stays), the two arrows are erased,
// and it is moved, scaled, rotated and skewed onto a transparent canvas of the photo's size.
//   assets-src/img/haeny-tech-plunger-xray.webp   (894 x 786, transparent)
//   node tools/haeny-xray.mjs [--preview]         --preview also writes check pictures to the temp folder
// The placement lives in tools/haeny-xray.json; tune it by hand or with the alignment app (tools/fx-align.mjs):
//   x, y       where the middle of the cutaway sits on the photo (photo pixels)
//   scaleX, scaleY   photo pixels per drawing pixel
//   rotate     degrees, clockwise
//   skewX, skewY     degrees
// The picture is built as the matrix  M = Rotate · SkewX · SkewY · Scale  around its middle; the alignment app shows the very same transform with CSS.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const IMG = path.join(ROOT, "assets-src/img");
export const BASE = path.join(IMG, "haeny-tech-plunger.webp"), CUT = path.join(IMG, "haeny-4.webp"), OUT = path.join(IMG, "haeny-tech-plunger-xray.webp");
export const PLACE_FILE = path.join(import.meta.dirname, "haeny-xray.json");
export const DEFAULT_PLACE = { x: 328.4, y: 414.5, scaleX: 0.325, scaleY: 0.325, rotate: 0, skewX: 0, skewY: 0 };
export const readPlace = () => {
  const saved = fs.existsSync(PLACE_FILE) ? JSON.parse(fs.readFileSync(PLACE_FILE, "utf8")) : {};
  const p = { ...DEFAULT_PLACE, ...saved };
  if (saved.left !== undefined && saved.x === undefined) { // the first version of the file: top left corner and one scale
    const s = saved.scale || 0.325;
    p.scaleX = p.scaleY = s; p.x = saved.left + 682 * s / 2; p.y = (saved.top || 0) + 1548 * s / 2;
  }
  return Object.fromEntries(Object.keys(DEFAULT_PLACE).map((k) => [k, p[k]]));
};

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

// M = Rotate · SkewX · SkewY · Scale as [[a, b], [c, d]] (x' = a x + b y, y' = c x + d y; y points down)
export function matrixOf(p) {
  const r = (deg) => (deg * Math.PI) / 180, mul = (A, B) => [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]], [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]];
  const S = [[p.scaleX, 0], [0, p.scaleY]], KY = [[1, 0], [Math.tan(r(p.skewY)), 1]], KX = [[1, Math.tan(r(p.skewX))], [0, 1]];
  const c = Math.cos(r(p.rotate)), s = Math.sin(r(p.rotate)), R = [[c, -s], [s, c]];
  return mul(R, mul(KX, mul(KY, S)));
}

// writes the overlay picture; returns the area (percent of the photo) in which the cutaway has something to show
export async function build(place = readPlace(), { preview = false } = {}) {
  const { width: W, height: H } = await sharp(BASE).metadata();
  const cut = await cutout();
  // the drawing is first brought to about the size it has on the photo (a good filter), the rest of the transform is done by sampling it
  const s0 = Math.sqrt(Math.abs(place.scaleX * place.scaleY)) || 0.3;
  const sw = Math.max(2, Math.round(cut.width * s0)), sh = Math.max(2, Math.round(cut.height * s0));
  const src = await sharp(cut.png).resize({ width: sw, height: sh, kernel: "lanczos3" }).ensureAlpha().raw().toBuffer();
  const M = matrixOf(place), det = M[0][0] * M[1][1] - M[0][1] * M[1][0];
  const out = Buffer.alloc(W * H * 4);
  if (Math.abs(det) > 1e-9) {
    // output pixel -> position in the small drawing: p = (M / s0)^-1 · (pixel - middle) + middle of the drawing
    const inv = [[M[1][1] / det * s0, -M[0][1] / det * s0], [-M[1][0] / det * s0, M[0][0] / det * s0]];
    const mx = sw / 2, my = sh / 2, SS = 2;
    const at = (x, y, o) => { // premultiplied bilinear sample; o = accumulator [r, g, b, a]
      const x0 = Math.floor(x - 0.5), y0 = Math.floor(y - 0.5), fx = x - 0.5 - x0, fy = y - 0.5 - y0;
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
        const xx = x0 + i, yy = y0 + j; if (xx < 0 || yy < 0 || xx >= sw || yy >= sh) continue;
        const w = (i ? fx : 1 - fx) * (j ? fy : 1 - fy), k = (yy * sw + xx) * 4, a = src[k + 3] / 255;
        o[0] += src[k] * a * w; o[1] += src[k + 1] * a * w; o[2] += src[k + 2] * a * w; o[3] += a * w;
      }
    };
    const acc = [0, 0, 0, 0];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      acc[0] = acc[1] = acc[2] = acc[3] = 0;
      for (let j = 0; j < SS; j++) for (let i = 0; i < SS; i++) {
        const dx = x + (i + 0.5) / SS - place.x, dy = y + (j + 0.5) / SS - place.y;
        at(inv[0][0] * dx + inv[0][1] * dy + mx, inv[1][0] * dx + inv[1][1] * dy + my, acc);
      }
      const k = (y * W + x) * 4, a = acc[3] / (SS * SS);
      if (a > 0.002) { out[k] = Math.min(255, Math.round(acc[0] / acc[3])); out[k + 1] = Math.min(255, Math.round(acc[1] / acc[3])); out[k + 2] = Math.min(255, Math.round(acc[2] / acc[3])); out[k + 3] = Math.min(255, Math.round(a * 255)); }
    }
  }
  const canvas = await sharp(out, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
  await sharp(canvas).webp({ quality: 90, alphaQuality: 100 }).toFile(OUT);
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (out[(y * W + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
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
