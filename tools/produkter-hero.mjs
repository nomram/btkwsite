#!/usr/bin/env node
// Banner of the products page: machines (left) and material (right) meet in an orange diagonal.
// Writes three pictures to assets-src/img: the two halves (each a full banner, so the page can grey one of them out) and the
// finished composite (used for link previews and as the fallback). The diagonal in CSS (.hero--split) uses the same numbers.
//   node tools/produkter-hero.mjs
import sharp from "sharp";

const W = 1920, H = 520;
const CUT = { top: 56, bottom: 47, seam: 0.7 }; // percent of the width: where the diagonal meets the top and the bottom edge
const IMG = (n) => `assets-src/img/${n}.webp`;

// machines: the whole drill rig, pushed a little right of the left edge so the page title sits on the dark soil
const rigX = 250;
const rigRaw = await sharp(IMG("tei-hero")).resize({ height: H }).toBuffer();
const rigMeta = await sharp(rigRaw).metadata();
// the rig fades in from the soil over its first 200 pixels, so there is no hard edge
const fade = Buffer.from(`<svg width="${rigMeta.width}" height="${H}"><defs><linearGradient id="g"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="${200 / rigMeta.width}" stop-color="#fff"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`);
const rig = await sharp(rigRaw).ensureAlpha().composite([{ input: fade, blend: "dest-in" }]).png().toBuffer();
// the strip to the left of the rig: the soil at the edge of the picture, stretched and blurred
const soil = await sharp(rig).extract({ left: 0, top: 0, width: 24, height: H }).resize(rigX + 40, H, { fit: "fill" }).blur(14).extract({ left: 0, top: 0, width: rigX, height: H }).toBuffer();
const machines = await sharp({ create: { width: W, height: H, channels: 3, background: "#2a211b" } })
  .composite([{ input: soil, left: 0, top: 0 }, { input: rig, left: rigX, top: 0 }]).png().toBuffer();

// material: fresh concrete on the reinforcement, boots and hose only (no faces)
const matW = W - 820, matY = 40;
const mat = await sharp(IMG("reed-hero")).resize({ width: matW }).extract({ left: 0, top: matY, width: matW, height: H }).toBuffer();
const material = await sharp(mat).extend({ left: W - matW, extendWith: "mirror" }).toBuffer();

const px = (pct) => (W * pct) / 100;
const mask = Buffer.from(`<svg width="${W}" height="${H}"><polygon points="${px(CUT.top)},0 ${W},0 ${W},${H} ${px(CUT.bottom)},${H}" fill="#fff"/></svg>`);
const seam = Buffer.from(`<svg width="${W}" height="${H}"><polygon points="${px(CUT.top - CUT.seam)},0 ${px(CUT.top + CUT.seam)},0 ${px(CUT.bottom + CUT.seam)},${H} ${px(CUT.bottom - CUT.seam)},${H}" fill="#f37d03"/></svg>`);
const right = await sharp(material).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
const both = await sharp(machines).composite([{ input: right }, { input: seam }]).toBuffer();

const out = (b, n) => sharp(b).webp({ quality: 80 }).toFile(IMG(n)).then((i) => console.log(n, i.width + "x" + i.height, Math.round(i.size / 1024) + " kB"));
await out(machines, "produkter-hero-machines");
await out(material, "produkter-hero-material");
await out(both, "produkter-hero");
