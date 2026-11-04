#!/usr/bin/env node
// Häny: the pictures for the "150 years" reveal at the bottom of the Häny page (image block with anim: "haeny150").
//   haeny-1.webp         the finished logo with the 150 (kept as it is)
//   haeny-150-years.webp the "150 YEARS" lettering alone (cut out of haeny-1: everything that is not the black plate)
//   haeny-plate.webp     the logo without the 150 (haeny-6.webp, white background removed), scaled and placed so that its plate
//                        sits exactly over the plate of haeny-1. All three have the same size, so the page just stacks them.
//   node tools/haeny-logo-anim.mjs
import sharp from "sharp";

const IMG = (n) => `assets-src/img/${n}.webp`;
const raw = async (file) => { const r = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); return { data: r.data, w: r.info.width, h: r.info.height }; };
const lum = (d, i) => (d[i] + d[i + 1] + d[i + 2]) / 3;

// ---- connected pieces of the finished logo (the lettering and the plate are separate pieces: a gap of background between them)
const A = await raw(IMG("haeny-1"));
const { w: W, h: H } = A;
const label = new Int32Array(W * H).fill(-1), sizes = [];
for (let s = 0; s < W * H; s++) {
  if (label[s] >= 0 || A.data[s * 4 + 3] < 30) continue;
  const id = sizes.length; let n = 0; const stack = [s]; label[s] = id;
  while (stack.length) {
    const p = stack.pop(); n++;
    const x = p % W, y = (p - x) / W;
    for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) if (q >= 0 && label[q] < 0 && A.data[q * 4 + 3] >= 30) { label[q] = id; stack.push(q); }
  }
  sizes.push(n);
}
const plateId = sizes.indexOf(Math.max(...sizes));
console.log("pieces:", sizes.length, "plate piece:", sizes[plateId], "px");

// the plate and a 3 px rim around it
const near = new Uint8Array(W * H);
for (let p = 0; p < W * H; p++) if (label[p] === plateId) {
  const x = p % W, y = (p - x) / W;
  for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && xx < W && yy >= 0 && yy < H) near[yy * W + xx] = 1; }
}
const years = Buffer.from(A.data);
for (let p = 0; p < W * H; p++) if (near[p]) years[p * 4 + 3] = 0;
await sharp(years, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 92, alphaQuality: 100 }).toFile(IMG("haeny-150-years"));

// ---- box of the lettering inside the plate (white pixels of the plate piece) in the finished logo
const box = (test, w, h) => { let x0 = w, y0 = h, x1 = -1, y1 = -1; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (test(x, y)) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 }; };
const tA = box((x, y) => { const p = y * W + x; return label[p] === plateId && A.data[p * 4 + 3] > 200 && lum(A.data, p * 4) > 225; }, W, H);
const plateA = box((x, y) => label[y * W + x] === plateId, W, H);
console.log("150 logo: plate", plateA, "text", tA);

// ---- the logo without the 150: white background -> transparent
const B = await raw(IMG("haeny-6"));
const bw = B.w, bh = B.h, bg = new Uint8Array(bw * bh);
{
  const stack = [];
  const white = (p) => lum(B.data, p * 4) > 238 && Math.max(B.data[p * 4], B.data[p * 4 + 1], B.data[p * 4 + 2]) - Math.min(B.data[p * 4], B.data[p * 4 + 1], B.data[p * 4 + 2]) < 24;
  for (let x = 0; x < bw; x++) for (const y of [0, bh - 1]) { const p = y * bw + x; if (white(p) && !bg[p]) { bg[p] = 1; stack.push(p); } }
  for (let y = 0; y < bh; y++) for (const x of [0, bw - 1]) { const p = y * bw + x; if (white(p) && !bg[p]) { bg[p] = 1; stack.push(p); } }
  while (stack.length) {
    const p = stack.pop(), x = p % bw, y = (p - x) / bw;
    for (const q of [x > 0 ? p - 1 : -1, x < bw - 1 ? p + 1 : -1, y > 0 ? p - bw : -1, y < bh - 1 ? p + bw : -1]) if (q >= 0 && !bg[q] && white(q)) { bg[q] = 1; stack.push(q); }
  }
}
const plain = Buffer.from(B.data);
for (let p = 0; p < bw * bh; p++) {
  const i = p * 4;
  if (bg[p]) { plain[i + 3] = 0; continue; }
  // the soft edge of the plate: a mix of plate colour and white. alpha = how much plate; the colour is un-mixed from the white
  const x = p % bw, y = (p - x) / bw;
  let edge = false;
  for (let dy = -2; dy <= 2 && !edge; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && xx < bw && yy >= 0 && yy < bh && bg[yy * bw + xx]) { edge = true; break; } }
  if (edge) {
    const m = Math.min(B.data[i], B.data[i + 1], B.data[i + 2]);
    const a = Math.max(0.04, Math.min(1, 1 - m / 255));
    for (let k = 0; k < 3; k++) plain[i + k] = Math.max(0, Math.min(255, Math.round((B.data[i + k] - 255 * (1 - a)) / a)));
    plain[i + 3] = Math.round(a * 255);
  }
}
const plateB = box((x, y) => !bg[y * bw + x], bw, bh);
// pixels further than 10 px from the outside: the lettering must not be confused with the pale rim of the plate
const deep = new Uint8Array(bw * bh);
{
  const dist = new Int16Array(bw * bh).fill(-1); let cur = [];
  for (let p = 0; p < bw * bh; p++) if (bg[p]) { dist[p] = 0; cur.push(p); }
  for (let d = 1; d <= 10; d++) {
    const nxt = [];
    for (const p of cur) { const x = p % bw, y = (p - x) / bw; for (const q of [x > 0 ? p - 1 : -1, x < bw - 1 ? p + 1 : -1, y > 0 ? p - bw : -1, y < bh - 1 ? p + bw : -1]) if (q >= 0 && dist[q] < 0) { dist[q] = d; nxt.push(q); } }
    cur = nxt;
  }
  for (let p = 0; p < bw * bh; p++) deep[p] = dist[p] < 0 ? 1 : 0;
}
const tB = box((x, y) => { const p = y * bw + x; return deep[p] && lum(B.data, p * 4) > 225 && x > plateB.x0 + plateB.w * 0.25; }, bw, bh);
console.log("plain logo: plate", plateB, "text", tB);
const sx = tA.w / tB.w, sy = tA.h / tB.h, s = (sx + sy) / 2;
console.log("scale", sx.toFixed(3), sy.toFixed(3), "-> using", s.toFixed(3));
const ox = Math.round(tA.x0 - tB.x0 * s), oy = Math.round(tA.y0 - tB.y0 * s);
const pw = Math.round(bw * s), ph = Math.round(bh * s);
console.log("plain plate placed at", ox, oy, "size", pw, ph, "plate box:", { x0: Math.round(ox + plateB.x0 * s), x1: Math.round(ox + plateB.x1 * s), y0: Math.round(oy + plateB.y0 * s), y1: Math.round(oy + plateB.y1 * s) });

const scaled = await sharp(plain, { raw: { width: bw, height: bh, channels: 4 } }).resize(pw, ph, { kernel: "lanczos3" }).png().toBuffer();
// cut what falls outside the stage, then place
const left = Math.max(0, -ox), top = Math.max(0, -oy);
const cw = Math.min(pw - left, W - Math.max(0, ox)), ch = Math.min(ph - top, H - Math.max(0, oy));
const cut = await sharp(scaled).extract({ left, top, width: cw, height: ch }).toBuffer();
await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: cut, left: Math.max(0, ox), top: Math.max(0, oy) }]).webp({ quality: 92, alphaQuality: 100 }).toFile(IMG("haeny-plate"));
console.log("written: haeny-150-years.webp, haeny-plate.webp");
