// One entry of the site search index (search-index.json, one file per language). site.js ranks these in the browser.
//   u url · t title · c breadcrumb (parent page titles) · h headings · x body text · i thumbnail · w weight (1 when left out)
import { flatBlocks } from "./render.mjs";

const SKIP_KEYS = new Set(["type", "href", "src", "image", "id", "provider", "kind", "file", "url", "anchor", "align", "start", "width", "height", "columns", "square", "gen", "thumb", "icon", "poster", "mime", "maxWidth", "hideIn", "usage"]);
const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " ", "&shy;": "" };
const plain = (s) => String(s).replace(/<[^>]+>/g, " ").replace(/&(?:amp|lt|gt|quot|nbsp|shy|#39);/g, (m) => ENTITIES[m]).replace(/\s+/g, " ").trim();

// every readable string of a block (skipping links, picture paths, ids and other machine values)
function strings(node, out) {
  if (typeof node === "string") { if (!/^(\/|https?:|#|mailto:|tel:)/.test(node)) out.push(plain(node)); }
  else if (Array.isArray(node)) node.forEach((n) => strings(n, out));
  else if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) if (!SKIP_KEYS.has(k)) strings(v, out);
  return out;
}

// Pages that matter more for a visitor looking for something: brand pages and products over the legal text
function weightOf(path) {
  const depth = path.split("/").filter(Boolean).length;
  if (/^\/(integritetspolicy|offert)/.test(path)) return 0.6;
  if (path === "/") return 0.9;
  if (depth === 2 && path.startsWith("/produkter/")) return 1.25; // a brand
  if (depth >= 3 && path.startsWith("/produkter/")) return 1.1; // a product
  return 1;
}

export function searchEntry(ctx, page, t, url, titleOf) {
  const blocks = flatBlocks(t.blocks).filter((b) => !(b && b.hidden));
  const heads = [], body = [];
  for (const b of blocks) {
    if (b.type === "heading") heads.push(plain(b.text || ""));
    else if (b.type === "button" && b.kind === "download") body.push(plain(b.text || b.label || ""));
    else body.push(...strings(b, []));
  }
  const crumbs = [];
  const segs = page.path.split("/").filter(Boolean);
  for (let n = segs.length - 1; n >= 1; n--) { const tt = titleOf("/" + segs.slice(0, n).join("/")); if (tt) crumbs.unshift(tt); }
  const firstImg = blocks.find((b) => b.type === "image" && b.src && !b.href && !b.maxWidth);
  let thumb = null;
  if (firstImg) {
    const info = ctx.image(firstImg.src);
    if (info && info.widths && info.widths.length && info.ext !== "svg" && info.ext !== "gif") thumb = `/assets/img/${info.name}-${info.widths.find((w) => w >= 200) || info.widths[info.widths.length - 1]}.webp`;
  }
  const e = { u: url, t: t.h1 || t.title, c: crumbs.join(" › "), h: heads.filter(Boolean).join(" · ").slice(0, 400), x: [plain(t.description || ""), ...body].filter(Boolean).join(" ").slice(0, 1600) };
  if (thumb) e.i = thumb;
  const w = weightOf(page.path);
  if (w !== 1) e.w = w;
  return e;
}
