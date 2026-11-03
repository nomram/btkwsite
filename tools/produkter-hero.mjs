#!/usr/bin/env node
// Banner of the products page: machines (left) and material (right) meet in an orange diagonal.
// Writes three pictures to assets-src/img: the two halves (each a full banner, so the page can grey one of them out) and the
// finished composite (used for link previews and as the fallback). The diagonal in CSS (.hero--split) uses the same numbers.
//   node tools/produkter-hero.mjs
import sharp from "sharp";

const W = 1920, H = 360;
// The diagonal is placed by CSS (.hero--split, custom properties --cut-t / --cut-b), and moves with the filter. The finished
// composite uses the resting state (both selected): percent of the width where the diagonal meets the top and the bottom edge.
const CUT = { top: 50, bottom: 50, seam: 0.2 }; // seam: half the width of the orange line, percent of the width
const IMG = (n) => `assets-src/img/${n}.webp`;

// machines: the drill rig, a little in from the left edge so the page title sits on dark soil; the picture fades into soil on the
// left and into the blurred concrete wall on the right (the diagonal can sit as far right as 75%)
const TH = 746, Y0 = 215, rigX = 95, FADE_L = 160, FADE_R = 160;
const tei0 = await sharp(IMG("tei-hero")).resize({ height: TH }).toBuffer();
const tw = (await sharp(tei0).metadata()).width;
const teiCrop = await sharp(tei0).extract({ left: 0, top: Y0, width: tw, height: H }).ensureAlpha().toBuffer();
const fade = Buffer.from(`<svg width="${tw}" height="${H}"><defs><linearGradient id="g"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="${FADE_L / tw}" stop-color="#fff"/><stop offset="${1 - FADE_R / tw}" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`);
const rig = await sharp(teiCrop).composite([{ input: fade, blend: "dest-in" }]).png().toBuffer();
const edge = (left) => sharp(teiCrop).extract({ left, top: 0, width: 24, height: H });
const soil = await edge(0).resize(rigX + FADE_L + 40, H, { fit: "fill" }).blur(14).toBuffer();
const rightX = rigX + tw - FADE_R, wallW = W - rightX;
const wall = await edge(tw - 24).resize(wallW, H, { fit: "fill" }).blur(14).toBuffer();
const machines = await sharp({ create: { width: W, height: H, channels: 3, background: "#2a211b" } })
  .composite([{ input: soil, left: 0, top: 0 }, { input: wall, left: rightX, top: 0 }, { input: rig, left: rigX, top: 0 }]).png().toBuffer();

// material: fresh concrete on the reinforcement, boots and hose only (no faces); the diagonal can sit as far left as 25%
const matX = 480, matW = W - matX, matY = 170;
const mat = await sharp(IMG("reed-hero")).resize({ width: matW }).extract({ left: 0, top: matY, width: matW, height: H }).toBuffer();
const material = await sharp(mat).extend({ left: matX, extendWith: "mirror" }).toBuffer();

const px = (pct) => (W * pct) / 100;
const mask = Buffer.from(`<svg width="${W}" height="${H}"><polygon points="${px(CUT.top)},0 ${W},0 ${W},${H} ${px(CUT.bottom)},${H}" fill="#fff"/></svg>`);
const seam = Buffer.from(`<svg width="${W}" height="${H}"><polygon points="${px(CUT.top - CUT.seam)},0 ${px(CUT.top + CUT.seam)},0 ${px(CUT.bottom + CUT.seam)},${H} ${px(CUT.bottom - CUT.seam)},${H}" fill="#f37d03"/></svg>`);
const right = await sharp(material).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
const both = await sharp(machines).composite([{ input: right }, { input: seam }]).toBuffer();

const out = (b, n) => sharp(b).webp({ quality: 80 }).toFile(IMG(n)).then((i) => console.log(n, i.width + "x" + i.height, Math.round(i.size / 1024) + " kB"));
// material on its own (a language without machine brands): the whole banner is the concrete picture, no diagonal
const wide = await sharp(IMG("reed-hero")).resize({ width: W }).extract({ left: 0, top: 330, width: W, height: H }).toBuffer();
await out(wide, "produkter-hero-material-wide");
await out(machines, "produkter-hero-machines");
await out(material, "produkter-hero-material");
await out(both, "produkter-hero");
