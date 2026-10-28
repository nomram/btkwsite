#!/usr/bin/env node
// Ram Board product pages: one of the product's own photos becomes the page banner (hero).
// The photos are small (300-600 px), so they are not stretched across the width: the photo sits at its own scale on the right, its left edge
// fades into a blurred, darkened copy of itself, and the title is read against that quiet part on the left (the banner's shade does the rest).
//   assets-src/img/ram-board-<slug>-banner.webp (2560 x 740, the same ratio as the banner) and  hero: { image, anchor: "r" }  in the page JSON
//   node tools/ramboard-banners.mjs        (safe to run again)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const IMG = path.join(ROOT, "assets-src/img"), PAGES = path.join(ROOT, "content/pages/produkter/ram-board");
const W = 2560, H = 740;
const PICK = { golvskydd: 3, karmskydd: 1, "seam-tape": 1, "edge-tape": 1, "vapor-cure": 3, seamer: 1, "multi-cutter": 1 };

for (const [slug, n] of Object.entries(PICK)) {
  const src = path.join(IMG, `ram-board-${slug}-${n}.webp`);
  const meta = await sharp(src).metadata();
  // backdrop: the photo blown up, blurred and darkened
  const bg = await sharp(src).resize(160, Math.round(160 * H / W), { fit: "cover" }).blur(3).resize(W, H, { kernel: "cubic" }).modulate({ brightness: 0.72, saturation: 1.1 }).blur(18).toBuffer();
  // photo: full banner height, right edge on the edge, left side faded out
  const fw = Math.round(meta.width * H / meta.height);
  const fg = await sharp(src).resize({ height: H, width: fw, kernel: "lanczos3" }).ensureAlpha().toBuffer();
  const fade = Math.round(fw * 0.6);
  const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${fw}" height="${H}"><defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" x2="${fade}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient></defs><rect width="${fw}" height="${H}" fill="url(#g)"/></svg>`); // (dest-in keeps the photo where the mask is opaque: it reads the alpha, not the brightness)
  const faded = await sharp(fg).composite([{ input: await sharp(mask).png().toBuffer(), blend: "dest-in" }]).png().toBuffer();
  const out = path.join(IMG, `ram-board-${slug}-banner.webp`);
  await sharp(bg).composite([{ input: faded, left: W - fw, top: 0 }]).webp({ quality: 80 }).toFile(out);
  console.log(slug.padEnd(13), `${meta.width}x${meta.height} -> photo ${fw}x${H}`, (fs.statSync(out).size / 1024).toFixed(0) + " kB");

  const f = path.join(PAGES, slug + ".json");
  const raw = fs.readFileSync(f, "utf8"), eol = raw.includes("\r\n") ? "\r\n" : "\n", page = JSON.parse(raw);
  page.hero = { image: `/assets/img/ram-board-${slug}-banner.webp`, anchor: "r" };
  fs.writeFileSync(f, JSON.stringify(page, null, 2).replace(/\n/g, eol) + eol);
}
