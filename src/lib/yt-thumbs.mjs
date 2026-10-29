// Poster pictures of the YouTube videos: downloaded once into assets-src/yt/<id>.webp and served from the site itself,
// so no request goes to YouTube/Google before the visitor presses play (GDPR friendly, and the picture is there instantly).
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SIZES = ["maxresdefault", "sddefault", "hqdefault"]; // 16:9 first; hqdefault has black bars

// every video id used in a content tree (page JSON or any nested object)
export function videoIds(node, out = new Set()) {
  if (Array.isArray(node)) node.forEach((n) => videoIds(n, out));
  else if (node && typeof node === "object") {
    if (node.type === "video" && typeof node.id === "string" && node.id) out.add(node.id);
    Object.values(node).forEach((n) => videoIds(n, out));
  }
  return out;
}

async function fetchOne(id, file, timeoutMs) {
  for (const size of SIZES) {
    try {
      const r = await fetch(`https://i.ytimg.com/vi/${encodeURIComponent(id)}/${size}.jpg`, { signal: AbortSignal.timeout(timeoutMs) });
      if (!r.ok) continue;
      let img = sharp(Buffer.from(await r.arrayBuffer()));
      const m = await img.metadata();
      if (size === "hqdefault" || (m.height && m.width / m.height < 1.5)) {
        // 4:3 frame with black bars: cut them away to get the 16:9 picture
        const h = Math.round((m.width * 9) / 16);
        img = img.extract({ left: 0, top: Math.max(0, Math.round((m.height - h) / 2)), width: m.width, height: Math.min(h, m.height) });
      }
      await img.resize({ width: 960, withoutEnlargement: true }).webp({ quality: 74 }).toFile(file);
      return true;
    } catch { /* try the next size */ }
  }
  return false;
}

// Makes sure every id has a picture in `dir`. Returns { got, had, missing }.
export async function ensureThumbs(ids, dir, { force = false, timeoutMs = 10000 } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  let got = 0, had = 0;
  const missing = [];
  for (const id of ids) {
    const file = path.join(dir, `${id}.webp`);
    if (!force && fs.existsSync(file)) { had++; continue; }
    if (await fetchOne(id, file, timeoutMs)) got++; else missing.push(id);
  }
  return { got, had, missing };
}
