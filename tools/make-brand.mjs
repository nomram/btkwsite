#!/usr/bin/env node
// Derives favicons / OG image / PNG logo from the two brand SVGs in static/assets/brand.
// Re-run after replacing logo.svg or mark-source.svg.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
const ROOT = path.resolve(import.meta.dirname, "..");
const B = path.join(ROOT, "static/assets/brand");
const S = path.join(ROOT, "static");
const logo = fs.readFileSync(path.join(B, "logo.svg"));
let mark = fs.readFileSync(path.join(B, "mark-source.svg"), "utf8");
// the mark lives in a 10000x18000 canvas with lots of padding: crop to the artwork, with room for a white outline
// (the dark part of the mark disappears on a dark browser tab without it). The outline is drawn behind the fill;
// 333 path units (the group is scaled 3x) show as about 2 px at 32 px and 1 px at 16 px.
const OUTLINE = 333;
mark = mark.replace(/viewBox="[^"]+"/, 'viewBox="730 5680 9040 7540"');
mark = mark.replace(/stroke: none;/g, `stroke: #ffffff; stroke-opacity: 1; stroke-width: ${OUTLINE}; stroke-linejoin: round; paint-order: stroke;`);
fs.writeFileSync(path.join(S, "favicon.svg"), mark);
// raster copy with explicit size: the source canvas is huge, never rasterise it at its own size
const markSized = mark.replace("<svg ", '<svg width="904" height="754" ');

await sharp(logo, { density: 300 }).resize({ width: 800 }).png().toFile(path.join(B, "logo.png"));
const logoPng = await sharp(logo, { density: 300 }).resize({ width: 820 }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#ffffff" } })
  .composite([{ input: logoPng, gravity: "center" }]).png().toFile(path.join(B, "og-default.png"));
const markPng = (size, pad, bg) => sharp(Buffer.from(markSized))
  .resize({ width: size - pad * 2, height: size - pad * 2, fit: "contain", background: bg })
  .extend({ top: pad, bottom: pad, left: pad, right: pad, background: bg }).png().toBuffer();
fs.writeFileSync(path.join(S, "apple-touch-icon.png"), await markPng(180, 24, "#ffffff"));
fs.writeFileSync(path.join(S, "favicon.ico"), await markPng(32, 2, { r: 255, g: 255, b: 255, alpha: 0 }));
console.log("brand assets written");
