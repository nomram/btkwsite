#!/usr/bin/env node
// Mapei banner without the Danish words: the source picture (a portrait advertisement, 748 x 1405) has a Danish slogan over its lower part
// (MALERE, MURERE, FLISELEGGERE ...). Only the top part (the hand with the trowel and the ribbed adhesive) is used: it sits at its own scale on the
// right of a 2560 x 740 banner, its left edge fades into a blurred, darkened copy of itself.
//   crawl/mapei/hero-source.webp  (the original picture, kept out of git)  ->  assets-src/img/mapei-hero.webp
//   node tools/mapei-banner.mjs        (safe to run again; sets hero.anchor "r" on the Mapei pages)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "crawl/mapei/hero-source.webp"), OUT = path.join(ROOT, "assets-src/img/mapei-hero.webp");
const PAGES = path.join(ROOT, "content/pages/produkter");
const W = 2560, H = 740, KEEP = 0.58; // the share of the picture's height that is kept (the slogan starts at about 61 %)
if (!fs.existsSync(SRC)) throw new Error(`missing ${SRC}: copy the original mapei-hero.webp there first`);

const meta = await sharp(SRC).metadata();
const top = await sharp(SRC).extract({ left: 0, top: 0, width: meta.width, height: Math.round(meta.height * KEEP) }).toBuffer();
// backdrop: the clean ribbed adhesive at the very bottom of the picture (below the slogan), stretched, softened and darkened
const lower = await sharp(SRC).extract({ left: 0, top: Math.round(meta.height * 0.88), width: meta.width, height: meta.height - Math.round(meta.height * 0.88) }).toBuffer();
const bg = await sharp(lower).resize(W, H, { fit: "cover", kernel: "cubic" }).blur(2.2).modulate({ brightness: 0.62 }).toBuffer();
const tm = await sharp(top).metadata();
const fw = Math.round(tm.width * H / tm.height);
const fg = await sharp(top).resize({ height: H, width: fw, kernel: "lanczos3" }).ensureAlpha().toBuffer();
const fade = Math.round(fw * 0.55);
const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${fw}" height="${H}"><defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" x2="${fade}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient></defs><rect width="${fw}" height="${H}" fill="url(#g)"/><rect x="${fade}" width="${fw - fade}" height="${H}" fill="#fff"/></svg>`);
const faded = await sharp(fg).composite([{ input: await sharp(mask).png().toBuffer(), blend: "dest-in" }]).png().toBuffer();
await sharp(bg).composite([{ input: faded, left: W - fw, top: 0 }]).webp({ quality: 80 }).toFile(OUT);
console.log(`mapei-hero.webp ${W}x${H}, picture ${fw}x${H} (${(fs.statSync(OUT).size / 1024).toFixed(0)} kB)`);

for (const f of [path.join(PAGES, "mapei.json"), ...fs.readdirSync(path.join(PAGES, "mapei")).filter((x) => x.endsWith(".json")).map((x) => path.join(PAGES, "mapei", x))]) {
  const raw = fs.readFileSync(f, "utf8"), eol = raw.includes("\r\n") ? "\r\n" : "\n", page = JSON.parse(raw);
  page.hero = { image: "/assets/img/mapei-hero.webp", anchor: "r" };
  fs.writeFileSync(f, JSON.stringify(page, null, 2).replace(/\n/g, eol) + eol);
}
