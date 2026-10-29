#!/usr/bin/env node
// "Registrerad i BASTA" badge (logo + QR code to the article on bastaonline.se) for a product that is registered there.
// Same look as the badges of the Ecobeton pages (made with BASTA's own sticker generator): their picture is the template, the QR code is replaced.
//   node tools/basta-badge.mjs <out-name> <bastaonline article url> [<template-name>]      e.g.  mapei-basta-montocryl  https://www.bastaonline.se/foretag/206-mapei-ab/artiklar/736738-montocryl-comp-b
// writes assets-src/img/<out-name>-se.webp and -en.webp (needs the "qrcode" package: npm i qrcode in a temporary folder and set QRCODE_DIR)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const [name, url, tpl = "ecobeton-basta-vetrofluid"] = process.argv.slice(2);
if (!name || !url) { console.error("usage: node tools/basta-badge.mjs <out-name> <article-url> [<template-name>]"); process.exit(1); }
const QR = createRequire(path.join(process.env.QRCODE_DIR || ROOT, "x.js"))("qrcode");

const qr = QR.create(url, { errorCorrectionLevel: "M" }), n = qr.modules.size, bits = qr.modules.data;
for (const l of ["se", "en"]) {
  const src = path.join(ROOT, `assets-src/img/${tpl}-${l}.webp`);
  const { data, info } = await sharp(src).flatten({ background: "#fff" }).raw().toBuffer({ resolveWithObject: true });
  // the template's QR code: dark pixels in the right half
  let x0 = info.width, x1 = 0, y0 = info.height, y1 = 0;
  for (let y = 40; y < info.height - 40; y++) for (let x = Math.round(info.width * 0.5); x < info.width - 40; x++) { const i = (y * info.width + x) * info.channels; if (data[i] < 90 && data[i + 1] < 90 && data[i + 2] < 90) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
  const size = Math.max(x1 - x0, y1 - y0) + 1, cell = Math.floor(size / n), qrPx = cell * n;
  // the new code, one square of cell x cell pixels per module, centred where the old one was
  const px = Buffer.alloc(qrPx * qrPx * 3, 255);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (bits[r * n + c]) for (let dy = 0; dy < cell; dy++) for (let dx = 0; dx < cell; dx++) { const i = ((r * cell + dy) * qrPx + c * cell + dx) * 3; px[i] = px[i + 1] = px[i + 2] = 20; }
  const code = await sharp(px, { raw: { width: qrPx, height: qrPx, channels: 3 } }).png().toBuffer();
  const cx = Math.round((x0 + x1) / 2), cy = Math.round((y0 + y1) / 2), pad = 12;
  const white = await sharp({ create: { width: size + 2 * pad, height: size + 2 * pad, channels: 3, background: "#ffffff" } }).png().toBuffer();
  const out = path.join(ROOT, `assets-src/img/${name}-${l}.webp`);
  await sharp(src).flatten({ background: "#fff" })
    .composite([{ input: white, left: cx - Math.round(size / 2) - pad, top: cy - Math.round(size / 2) - pad }, { input: code, left: cx - Math.round(qrPx / 2), top: cy - Math.round(qrPx / 2) }])
    .webp({ quality: 92 }).toFile(out);
  console.log(l, `qr ${n}x${n} modules at ${cell}px, old code ${x0},${y0}-${x1},${y1} ->`, path.relative(ROOT, out));
}
