// Pure rendering functions: no Node APIs, so the exact same code runs in the
// static build and in the CMS live preview (browser).
//
// ctx = {
//   site, lang, defaultLang, ui,                       // settings + UI dictionary for ctx.lang
//   pages: Map<path, page>,                            // every page object
//   url(path, lang?) -> site-relative href              // honours language prefix + urlStyle
//   abs(href) -> absolute URL
//   tr(path, lang?) -> translation object | null
//   children(path) -> [paths] sorted
//   image(src) -> { w, h, name, ext, widths:[…] } | null
//   fileSize(href) -> bytes | null
//   docInfo(href) -> { pages, thumb } | null
// }

import { renderPerfChart, perfChartEmpty } from "./perfchart.mjs";

export const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const stripTags = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const fmtSize = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace(".", ",") + " MB" : Math.max(1, Math.round(n / 1e3)) + " kB");
// Shown the Swedish way on the Swedish site and internationally (+46 ...) in every other language
export const phoneText = (ctx, v) => {
  const raw = String(v == null ? "" : v).trim();
  if (!ctx || !ctx.lang || ctx.lang === ctx.defaultLang || raw.startsWith("+") || !raw.startsWith("0")) return raw;
  return raw.replace(/^0\s*/, "+46 ").replace("-", " ");
};
export const telHref = (v) => {
  const d = String(v).replace(/[^\d+]/g, "");
  return "tel:" + (d.startsWith("+") ? d : d.startsWith("0") ? "+46" + d.slice(1) : d);
};
// ---------- edit mode (CMS visual editor only; the build never sets ctx.edit) ----------
// Every rendered block gets data-bk-i / data-bk-type on its top-level element(s) and
// every editable text gets data-bk-field, so the editor can map clicks back to the content model.
// ctx._fp is the field-path prefix while rendering blocks nested inside a "columns" block ("left.2.")
const editFld = (ctx, name, kind = "plain", ph = "") =>
  ctx.edit ? ` data-bk-field="${esc((ctx._fp || "") + name)}" data-bk-kind="${kind}"${ph ? ` data-bk-ph="${esc(ph)}"` : ""}` : "";

// Blocks with the contents of "columns" blocks spliced in (search index, description, share image)
export function flatBlocks(blocks) {
  return (blocks || []).flatMap((b) => (b && b.type === "columns" ? flatBlocks([...(b.left || []), ...(b.right || [])]) : [b]));
}
const VOID_TAGS = new Set(["img", "br", "hr", "input", "meta", "link", "source", "area", "base", "col", "embed", "param", "track", "wbr"]);
function tagTop(html, attrs) {
  let depth = 0, out = "", last = 0, m;
  const re = /<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g;
  while ((m = re.exec(html))) {
    const [full, close, name, rest, selfc] = m;
    if (close) { depth = Math.max(0, depth - 1); continue; }
    if (depth === 0) { out += html.slice(last, m.index) + `<${name}${attrs}${rest}${selfc}>`; last = m.index + full.length; }
    if (!VOID_TAGS.has(name.toLowerCase()) && selfc !== "/") depth++;
  }
  return out + html.slice(last);
}
function blockIsEmpty(b) {
  switch (b.type) {
    case "image": return !b.src;
    case "cards": return !(b.items || []).length;
    case "video": return !b.id;
    case "table": return !(b.rows || []).some((r) => r.some(Boolean));
    case "datasheet": return !((b.groups || []).length || (b.intro || []).some(Boolean));
    case "chips": case "list": return !(b.items || []).some(Boolean);
    case "cta": return !b.title;
    case "stat": return !b.value;
    case "sizeselect": return !(b.sizes || []).length;
    case "carousel": return !(b.items || []).some((x) => x && x.src);
    case "compare": return !b.src || !b.src2;
    case "perfchart": return perfChartEmpty(b);
    case "finder": return !(b.groups || []).some((g) => g && g.title);
    case "modules": return !(b.items || []).length;
    case "related": return !(b.items || []).some((it) => it && it.href);
    case "rangechart": return !(b.items || []).some((it) => it && it.label);
    case "html": return !(b.html || "").trim();
    case "columns": return !((b.left || []).length || (b.right || []).length);
    case "heading": case "text": return false;
    default: return false;
  }
}

const ICON = {
  swap: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chevronDown: '<svg viewBox="0 0 24 12" width="26" height="13" aria-hidden="true"><path d="M2 2l10 8 10-8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chevron: '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  pdf: '<svg viewBox="0 0 32 40" width="32" height="40" aria-hidden="true"><path d="M2 2h20l8 8v28H2z" fill="#fff" stroke="#c9c3bb" stroke-width="1.5"/><path d="M22 2v8h8" fill="#f4f2ef" stroke="#c9c3bb" stroke-width="1.5"/><rect x="2" y="20" width="22" height="11" rx="1.5" fill="#d93025"/><text x="13" y="28.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" font-weight="700" fill="#fff">PDF</text></svg>',
  eye: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  down: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0l-5-5m5 5l5-5M4 20h16"/></svg>',
  prev: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  hand: '<svg viewBox="0 0 24 24" width="30" height="30" fill="#fff" stroke="#231f20" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15V4a2 2 0 1 1 4 0v6"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/></svg>',
  info: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  external: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6l6 6-6 6"/></svg>',
  mail: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  layers: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 12.5l9 5 9-5M3 17l9 5 9-5"/></svg>',
  rig: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="2.5" y="17" width="14" height="4" rx="2"/><path d="M5 17v-4.5h7V17M16 3v14M14 6.5h4M14 11h4M12 12.5l4-5"/></svg>',
  silo: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 7c0-2.2 2.2-4 5-4s5 1.8 5 4v7H7z"/><path d="M7 10.5h10M7 14l3.5 4.5h3L17 14M9.5 18.5 8 21.5M14.5 18.5l1.5 3"/></svg>',
  boxes: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="7.5" y="3.5" width="9" height="8" rx="1"/><rect x="2.5" y="12.5" width="9" height="8" rx="1"/><rect x="12.5" y="12.5" width="9" height="8" rx="1"/><path d="M10 7.5h4M5 16.5h4M15 16.5h4"/></svg>',
  bucket: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 9h14l-1.6 11a1 1 0 0 1-1 .86H7.6a1 1 0 0 1-1-.86z"/><path d="M5 9c.3-3.2 3.2-5.5 7-5.5s6.7 2.3 7 5.5M8.3 13.5h7.4"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  phone: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>'
};

// ---------- languages ----------
export const htmlLang = (ctx, code) => (ctx.site.languages && ctx.site.languages[code] && ctx.site.languages[code].htmlLang) || code;
export const flagSrc = (code) => `/assets/flags/${code}.svg`;

// ---------- links ----------
// Authored links are default-language paths ("/produkter/marini"). In another
// language they point at that language's page when it exists, else fall back.
export function localizeHref(ctx, href) {
  if (!href || !href.startsWith("/") || href.startsWith("//") || href.startsWith("/assets/")) return href;
  let p = href, tail = "";
  const m = href.match(/^([^?#]*)([?#].*)?$/);
  if (m) { p = m[1]; tail = m[2] || ""; }
  try { p = decodeURIComponent(p); } catch { /* keep */ }
  p = p.replace(/\/+$/, "") || "/";
  if (ctx.hidden && ctx.hidden(p, ctx.lang) && ctx.visibleAncestor) return ctx.url(ctx.visibleAncestor(p, ctx.lang), ctx.lang) + tail;
  const lang = ctx.tr(p, ctx.lang) ? ctx.lang : ctx.defaultLang;
  return ctx.url(p, lang) + tail;
}
// Marker for outbound links: an arrow icon (CSS .ext::after) plus a hidden label for screen readers
const extLabel = (ctx) => `<span class="sr-only"> (${esc(ctx.ui.external_link || "extern länk")})</span>`;
export function localizeHtml(ctx, html) {
  return String(html || "").replace(/href="(\/[^"]*)"/g, (m, h) => `href="${esc(localizeHref(ctx, h.replace(/&amp;/g, "&")))}"`)
    .replace(/<a\s([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>([\s\S]*?)<\/a>/g, (m, pre, h, post, inner) => {
      if (isOwn(ctx, h)) return m;
      let attrs = `${pre}href="${h}"${post}`;
      if (!/\brel=/.test(attrs)) attrs += ' rel="noopener"';
      if (/<img\b/i.test(inner)) return `<a ${attrs.trim()}>${inner}</a>`; // image links get no icon
      attrs = /\bclass="/.test(attrs) ? attrs.replace(/\bclass="/, 'class="ext ') : attrs + ' class="ext"';
      return `<a ${attrs.trim()}>${inner}${extLabel(ctx)}</a>`;
    });
}
function isOwn(ctx, h) {
  try { return new URL(h).origin === new URL(ctx.site.origin).origin; } catch { return false; }
}

// ---------- images ----------
export function imgTag(ctx, src, alt, o = {}) {
  const info = ctx.image(src);
  const cls = o.cls ? ` class="${esc(o.cls)}"` : "";
  const loading = o.eager ? ` loading="eager" fetchpriority="high"` : ` loading="lazy" decoding="async"`;
  if (!info) return `<img src="${esc(src)}" alt="${esc(alt || "")}"${cls}${loading}>`;
  const dims = info.w && info.h ? ` width="${info.w}" height="${info.h}"` : "";
  if (info.ext === "svg" || info.ext === "gif" || !info.widths || !info.widths.length) {
    return `<img src="${esc(src)}" alt="${esc(alt || "")}"${dims}${cls}${loading}>`;
  }
  const srcset = info.widths.map((w) => `/assets/img/${info.name}-${w}.webp ${w}w`).join(", ");
  const i800 = info.widths.findIndex((w) => w >= 800);
  const fallback = `/assets/img/${info.name}-${info.widths[i800 >= 0 ? i800 : info.widths.length - 1]}.webp`;
  const sizes = o.sizes || "(min-width: 1200px) 1100px, 100vw";
  return `<img src="${fallback}" srcset="${srcset}" sizes="${esc(sizes)}" alt="${esc(alt || "")}"${dims}${cls}${loading}>`;
}

// Banner picture. When the picture is bigger than the banner it is cropped (object-fit: cover); page.hero.anchor picks which
// part stays in view: one of nine positions. Without it the picture is centred, as before.
const HERO_ANCHOR = { tl: "0% 0%", t: "50% 0%", tr: "100% 0%", l: "0% 50%", c: "50% 50%", r: "100% 50%", bl: "0% 100%", b: "50% 100%", br: "100% 100%" };
function heroImgTag(ctx, page, src) {
  const tag = imgTag(ctx, src, "", { cls: "hero__img", eager: true, sizes: "100vw" });
  const pos = page.hero && HERO_ANCHOR[page.hero.anchor];
  return pos ? tag.replace("<img ", `<img style="object-position:${pos}" `) : tag;
}

// Corner logo height by shape: every logo gets roughly the same visual weight (area), so a compact emblem is taller than a long word-mark
function crumbLogoHeight(ctx, b) {
  const i = ctx.image && ctx.image(b.src);
  const w = (i && i.w) || b.width, h = (i && i.h) || b.height;
  const ratio = w && h ? w / h : 3;
  return Math.round(Math.min(46, Math.max(20, Math.sqrt(3000 / ratio))));
}

// ---------- helpers ----------
// A page is listed (menus, cards, strips, crumbs) when it is not hidden for this language and exists in it or in the default language.
const shown = (ctx, p) => !(ctx.hidden && ctx.hidden(p, ctx.lang)) && !(ctx.pages.get(p) && ctx.pages.get(p).unlisted) && !!(ctx.tr(p, ctx.lang) || ctx.tr(p, ctx.defaultLang));
function titleOf(ctx, path) {
  const t = ctx.tr(path, ctx.lang) || ctx.tr(path, ctx.defaultLang);
  return t ? (t.h1 || t.title || path) : path;
}
const navTitleOf = (ctx, path) => {
  const t = ctx.tr(path, ctx.lang) || ctx.tr(path, ctx.defaultLang);
  return t ? (t.navTitle || t.title || t.h1 || path) : path;
};
const isUnder = (path, root) => path === root || path.startsWith(root + "/");
const ancestorsOf = (path) => {
  const out = [];
  const segs = path.split("/").filter(Boolean);
  let acc = "";
  for (let i = 0; i < segs.length - 1; i++) { acc += "/" + segs[i]; out.push(acc); }
  return out;
};

// ---------- blocks ----------
// Square pictures in a 4:3 tile leave empty bars at the sides: when every picture of the block is about square, the tiles are square too
function cardsAreSquare(ctx, b) {
  const ratios = (b.items || []).filter((it) => it && it.image).map((it) => {
    const i = ctx.image && ctx.image(it.image);
    const w = (i && i.w) || it.width, h = (i && i.h) || it.height;
    return w && h ? w / h : null;
  });
  return ratios.length > 0 && ratios.every((r) => r !== null && r >= 0.85 && r <= 1.2);
}
function renderCards(ctx, b) {
  const square = cardsAreSquare(ctx, b);
  const shownItems = (b.items || []).map((it, idx) => [it, idx]).filter(([it]) => shown(ctx, it.href));
  const li = ([it, idx]) => {
    const title = it.title || titleOf(ctx, it.href);
    const href = localizeHref(ctx, it.href);
    const cinfo = it.image && !ctx.edit ? ctx.image(it.image) : null;
    const cbaked = !!(cinfo && (square ? cinfo.tilesq : cinfo.tile43));
    const img = cbaked ? `<img class="card__img" src="/assets/img/${esc(cinfo.name)}-${square ? "tilesq" : "tile43"}.webp" width="640" height="${square ? 640 : 480}" alt="${esc(it.alt || title)}" loading="lazy" decoding="async">` : it.image ? imgTag(ctx, it.image, it.alt || title, { cls: "card__img", sizes: "(min-width: 1000px) 280px, (min-width: 560px) 45vw, 100vw" }) : "";
    const text = it.text || ctx.edit ? `<p class="card__text"${editFld(ctx, `items.${idx}.text`)}>${esc(it.text || "")}</p>` : "";
    return `<li class="card"><a class="card__link" href="${esc(href)}">` +
      (img ? `<span class="card__media${cbaked ? " card__media--tile" : ""}">${img}</span>` : "") +
      `<span class="card__body"><h${ctx._cardLevel || 3} class="card__title"${editFld(ctx, `items.${idx}.title`)}>${esc(title)}</h${ctx._cardLevel || 3}>${text}<span class="card__more">${esc(ctx.ui.read_more || "Läs mer")}${ICON.arrow}</span></span></a></li>`;
  };
  const ul = (list) => `<ul class="cards${square ? " cards--square" : ""}">${list.map(li).join("")}</ul>`;
  // Items marked with a group (machines / material) are listed under a heading each; site.js adds the buttons that show or hide a group
  const groups = ["machines", "material"].filter((g) => shownItems.some(([it]) => it.group === g));
  if (ctx.edit || !groups.length) return ul(shownItems);
  const label = { machines: ctx.ui.filter_machines || "Maskiner", material: ctx.ui.filter_material || "Material" };
  const unit = (n) => `${n} ${esc(n === 1 ? ctx.ui.filter_supplier || "leverantör" : ctx.ui.filter_suppliers || "leverantörer")}`;
  const part = (g) => shownItems.filter(([it]) => it.group === g);
  const rest = shownItems.filter(([it]) => !groups.includes(it.group));
  const ICONS = { machines: [ICON.rig, ICON.silo], material: [ICON.boxes, ICON.bucket] };
  // the buttons go into the breadcrumb row (renderMain picks them up from ctx._pfilter); two pictures per button roll over on hover
  ctx._pfilter = `<div class="pfilter" role="group" aria-label="${esc(ctx.ui.filter_show || "Visa")}">` +
    groups.map((g) => `<button class="pfilter__btn" type="button" aria-pressed="true" data-g="${g}"><span class="pfilter__ico"><span class="pfilter__roll">${ICONS[g].join("")}</span></span><span class="pfilter__txt">${esc(label[g])}</span><em>${part(g).length}</em><span class="pfilter__ck">${ICON.check}</span></button>`).join("") + "</div>";
  return groups.map((g) => `<section class="pgroup" id="${g === "machines" ? "maskiner" : "material"}" data-g="${g}"><h2 class="pgroup__h"><span class="pgroup__ico">${ICONS[g][0]}</span>${esc(label[g])}<span class="pgroup__n">${unit(part(g).length)}</span></h2>${ul(part(g))}</section>`).join("") + (rest.length ? ul(rest) : "");
}

function renderVideo(ctx, b) {
  const title = b.title || ctx.ui.video_play || "Video";
  const watch = `https://www.youtube.com/watch?v=${encodeURIComponent(b.id)}${b.start ? "&t=" + b.start + "s" : ""}`;
  const poster = ctx.ytThumb ? ctx.ytThumb(b.id) : null;
  return `<figure class="video${poster ? " video--poster" : ""}" data-yt="${esc(b.id)}"${b.start ? ` data-start="${esc(b.start)}"` : ""} data-title="${esc(title)}" data-watch="${esc(ctx.ui.video_watch || "Titta på YouTube")}">` +
    (poster ? `<img class="video__poster" src="${esc(poster)}" alt="" width="960" height="540" loading="lazy" decoding="async">` : "") +
    `<button class="video__play" type="button"><span class="video__icon" aria-hidden="true"></span>` +
    `<span class="video__label">${esc(ctx.ui.video_play || "Spela upp video")}</span>` +
    (b.title ? `<span class="video__title">${esc(b.title)}</span>` : "") +
    `<span class="video__note">${esc(ctx.ui.video_notice || "")}</span></button>` +
    `<noscript><a href="${esc(watch)}" rel="noopener">${esc(ctx.ui.video_watch || "Titta på YouTube")}</a></noscript></figure>`;
}

// Data table. rows[0] is the header row (unless header:false). Optional `groups` [{text, span}] adds a banded
// header row above it (column groups such as "Hollow bar drilling"); `caption` is the table's title.
function renderTable(ctx, b) {
  const rows = b.rows || [];
  if (!rows.length) return "";
  const head = b.header !== false ? rows[0] : null;
  const body = head ? rows.slice(1) : rows;
  const off = head ? 1 : 0;
  const groups = (Array.isArray(b.groups) ? b.groups : []).filter((g) => g && Number(g.span) > 0);
  const colGroup = [];
  groups.forEach((g, gi) => { for (let k = 0; k < Number(g.span); k++) colGroup.push(gi); });
  const tone = (i) => (colGroup[i] === undefined ? "" : ` class="g${colGroup[i] % 4}${colGroup[i - 1] !== colGroup[i] ? " gs" : ""}"`);
  const grp = groups.length
    ? `<tr class="tbl__groups">${groups.map((g, gi) => `<th scope="colgroup" colspan="${Number(g.span)}" class="g${gi % 4}${gi ? " gs" : ""}">${esc(g.text || "")}</th>`).join("")}</tr>`
    : "";
  const th = head || grp
    ? `<thead>${grp}${head ? `<tr class="tbl__cols">${head.map((c, x) => `<th scope="col"${tone(x)}${editFld(ctx, `rows.0.${x}`)}>${esc(c)}</th>`).join("")}</tr>` : ""}</thead>`
    : "";
  const linkOf = (y) => (!ctx.edit && Array.isArray(b.links) && b.links[y] ? localizeHref(ctx, b.links[y]) : "");
  const tb = `<tbody>${body.map((r, y) => `<tr>${r.map((c, i) => (i === 0
    ? `<th scope="row"${editFld(ctx, `rows.${y + off}.${i}`)}>${linkOf(y) ? `<a href="${esc(linkOf(y))}">${esc(c)}</a>` : esc(c)}</th>`
    : `<td${tone(i)}${editFld(ctx, `rows.${y + off}.${i}`)}>${esc(c)}</td>`)).join("")}</tr>`).join("")}</tbody>`;
  // short numeric cells read better centred; text-heavy tables stay left-aligned
  const cells = body.flatMap((r) => r.slice(1));
  const avg = cells.length ? cells.reduce((n, c) => n + String(c).length, 0) / cells.length : 0;
  const centre = b.align === "center" || (b.align !== "left" && avg <= 16);
  const cls = ["table-wrap", groups.length ? "table-wrap--groups" : "", centre ? "table-wrap--center" : "", b.narrow ? "table-wrap--narrow" : "", b.compact ? "table-wrap--compact" : ""].filter(Boolean).join(" ");
  const nCols = Math.max(...rows.map((r) => r.length)), canCompare = !ctx.edit && b.compare !== false && body.length >= 3 && nCols >= 3;
  const cmpUi = canCompare ? " data-compare data-cmp=\"" + esc(JSON.stringify(Object.fromEntries(Object.entries(ctx.ui).filter(([k]) => k.startsWith("cmp_"))))) + "\"" : "";
  return `<div class="${cls}" tabindex="0" role="region" aria-label="${esc(b.caption || ctx.ui.table_label || "Tabell")}"${cmpUi}><table>${b.caption ? `<caption>${esc(b.caption)}</caption>` : ""}${th}${tb}</table></div>`;
}

// Technical data sheet: intro + one table per group (label | metric | imperial)
function renderDatasheet(ctx, b) {
  const groups = (b.groups || []).map((g, gi) => {
    const hasUs = g.rows.some((r) => r.us);
    const hasMetric = g.rows.some((r) => r.metric);
    const head = hasUs
      ? `<thead><tr><th scope="col"><span class="sr-only">${esc(ctx.ui.spec_property || "Egenskap")}</span></th>${hasMetric ? `<th scope="col">${esc(ctx.ui.spec_metric || "Metriskt")}</th>` : ""}${hasUs ? `<th scope="col">${esc(ctx.ui.spec_us || "Imperial")}</th>` : ""}</tr></thead>`
      : "";
    return `<div class="spec">${g.title ? `<h3 class="spec__title"${editFld(ctx, `groups.${gi}.title`)}>${esc(g.title)}</h3>` : ""}<table>${head}<tbody>${g.rows.map((r, ri) =>
      `<tr><th scope="row"${editFld(ctx, `groups.${gi}.rows.${ri}.label`)}>${esc(r.label)}</th>${hasMetric ? `<td${editFld(ctx, `groups.${gi}.rows.${ri}.${r.metric === undefined && r.value !== undefined ? "value" : "metric"}`)}>${esc(r.metric || r.value || "")}</td>` : ""}${hasUs ? `<td class="spec__us"${editFld(ctx, `groups.${gi}.rows.${ri}.us`)}>${esc(r.us || "")}</td>` : ""}</tr>`).join("")}</tbody></table></div>`;
  }).join("");
  const intro = (b.intro || []).map((p, j) => `<p${editFld(ctx, `intro.${j}`, "inline")}>${ctx.edit ? p : localizeHtml(ctx, p)}</p>`).join("");
  return `<section class="datasheet"><h2${editFld(ctx, "title")}>${esc(b.title || ctx.ui.technical_data || "Teknisk data")}</h2>` +
    (b.tagline ? `<p class="datasheet__tag"${editFld(ctx, "tagline")}>${esc(b.tagline)}</p>` : "") +
    (intro ? `<div class="datasheet__intro">${intro}</div>` : "") +
    (groups ? `<div class="spec-grid">${groups}</div>` : "") +
    (b.note ? `<p class="datasheet__note"${editFld(ctx, "note")}>${esc(b.note)}</p>` : "") +
    (b.source ? `<p class="datasheet__source"${editFld(ctx, "source")}>${esc(b.source)}</p>` : "") + `</section>`;
}

function hoursText(ctx) {
  const h = (ctx.site.contact || {}).hours;
  if (!h || !h.opens || !h.closes) return "";
  return `${ctx.ui.hours_weekdays || "Måndag-fredag"} ${h.opens}-${h.closes}`;
}

function renderContact(ctx) {
  const c = ctx.site.contact || {};
  const parts = [];
  if (c.person && c.person.name) parts.push(`<li><span class="contact__label">${esc(ctx.ui.contact_person || "Kontaktperson")}</span><span>${esc(c.person.name)}</span></li>`);
  if (c.email) parts.push(`<li><span class="contact__label">${esc(ctx.ui.contact_email || "E-post")}</span><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>`);
  for (const p of c.phones || []) parts.push(`<li><span class="contact__label">${esc(p.label || ctx.ui.contact_phone || "Telefon")}</span><a href="${esc(telHref(p.value))}">${esc(phoneText(ctx, p.value))}</a></li>`);
  if (c.address) parts.push(`<li><span class="contact__label">${esc(ctx.ui.contact_address || "Adress")}</span><span>${esc(c.address)}</span></li>`);
  const hours = hoursText(ctx);
  if (hours) parts.push(`<li><span class="contact__label">${esc(ctx.ui.contact_hours || "Kontorstid")}</span><span>${esc(hours)}</span></li>`);
  const social = (ctx.site.social || []).map((s) => `<a class="social__link ext" href="${esc(s.url)}" rel="noopener me" target="_blank">${esc(s.name)}${extLabel(ctx)}</a>`).join("");
  return `<div class="contact"><ul class="contact__list">${parts.join("")}</ul>` +
    (social ? `<p class="contact__social">${social}</p>` : "") +
    `<p class="contact__org">${esc(ctx.site.legalName || ctx.site.name)}${ctx.site.orgNumber ? ` · ${esc(ctx.ui.org_no || "Org.nr")} ${esc(ctx.site.orgNumber)}` : ""}</p></div>`;
}

function renderChips(ctx, b) {
  return `<section class="chips">${b.title ? `<h2${editFld(ctx, "title")}>${esc(b.title)}</h2>` : ""}<ul class="chips__list">${(b.items || []).map((i, j) => `<li${editFld(ctx, `items.${j}`)}>${esc(i)}</li>`).join("")}</ul></section>`;
}

// Key figure that sits at the bottom right of the text above it (consumption of a product): label, big value, unit, small note
function renderStat(ctx, b) {
  const f = (n, v, cls, tag = "span") => (v || ctx.edit ? `<${tag} class="${cls}"${editFld(ctx, n)}>${esc(v || "")}</${tag}>` : "");
  return `<aside class="stat" aria-label="${esc(b.label || "")}"><div class="stat__card">${f("label", b.label, "stat__label")}<p class="stat__main"><b class="stat__value"${editFld(ctx, "value")}>${esc(b.value || "")}</b>${f("unit", b.unit, "stat__unit")}</p>${f("meta", b.meta, "stat__meta", "p")}${f("note", b.note, "stat__note", "p")}</div></aside>`;
}

function renderCta(ctx, b) {
  const href = b.href ? localizeHref(ctx, b.href) : "";
  const label = ctx.edit ? `<span${editFld(ctx, "button")}>${esc(b.button || ctx.ui.contact_us || "Kontakta oss")}</span>` : esc(b.button || ctx.ui.contact_us || "Kontakta oss");
  return `<section class="cta"><div class="container cta__inner"><div class="cta__text"><h2${editFld(ctx, "title")}>${esc(b.title || "")}</h2>${b.text || ctx.edit ? `<p${editFld(ctx, "text")}>${esc(b.text || "")}</p>` : ""}</div>` +
    (href ? `<a class="btn btn--light" href="${esc(href)}">${label}${ICON.arrow}</a>` : "") + `</div></section>`;
}

// One document row: thumbnail, name, meta, View + Download
// the language of a brochure is shown on its own (meta line), so a tag such as "(ENG)" or "(PDF, engelska)" at the end of the name goes
const DOC_TAG = /\s*\((?:pdf,?\s*)?(?:eng|en|sv|se|de|fi|english|engelska|swedish|svenska|engelsk|svensk|inglés|ingles|sueco|englisch)\)\s*$/i;
const docName = (t) => String(t || "").replace(DOC_TAG, "").trim() || String(t || "");
const docLang = (ctx, b) => b.lang || (!/^https?:/.test(b.href || "") && ctx.docInfo && ctx.docInfo(b.href) ? ctx.docInfo(b.href).lang : null) || null;
const langName = (ctx, code) => String(code).split("+").map((c) => { try { const n = new Intl.DisplayNames([ctx.lang || "sv"], { type: "language" }).of(c); return n ? n.charAt(0).toUpperCase() + n.slice(1) : ""; } catch { return ""; } }).filter(Boolean).join(" / ");
function renderDoc(ctx, b) {
  const external = b.external || /^https?:/.test(b.href || "");
  const info = !external && ctx.docInfo ? ctx.docInfo(b.href) : null;
  const size = !external && ctx.fileSize ? ctx.fileSize(b.href) : null;
  const meta = ["PDF"];
  const lg = docLang(ctx, b); if (lg) meta.push(langName(ctx, lg));
  if (info && info.pages) meta.push(`${info.pages} ${info.pages === 1 ? ctx.ui.page_one || "sida" : ctx.ui.page_many || "sidor"}`);
  if (size) meta.push(fmtSize(size));
  const view = external ? b.href : localizeHref(ctx, b.href);
  const dl = external && b.driveId ? `https://drive.google.com/uc?export=download&id=${encodeURIComponent(b.driveId)}` : view;
  const thumb = info && info.thumb
    ? `<img src="${esc(info.thumb)}" alt="" loading="lazy" decoding="async" width="${info.thumbW || 120}" height="${info.thumbH || 160}">`
    : ICON.pdf;
  const dattr = ctx.edit && b.__i != null ? ` data-bk-i="${b.__i}" data-bk-type="button"` : "";
  return `<li class="doc"${dattr}><a class="doc__thumb" href="${esc(view)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">${thumb}</a>` +
    `<div class="doc__info"><span class="doc__name"${editFld(ctx, "text")}>${esc(ctx.edit ? b.text : docName(b.text))}</span><span class="doc__meta">${esc(meta.join(" · "))}</span></div>` +
    `<div class="doc__actions"><a class="btn btn--sm" href="${esc(view)}" target="_blank" rel="noopener">${ICON.eye}<span>${esc(ctx.ui.doc_view || "Visa")}</span><span class="sr-only"> ${esc(b.text)}</span></a>` +
    `<a class="btn btn--sm btn--ghost" href="${esc(dl)}"${external ? ' rel="noopener"' : " download"}>${ICON.down}<span>${esc(ctx.ui.download || "Ladda ner")}</span><span class="sr-only"> ${esc(b.text)}</span></a></div></li>`;
}

// Two-column section: left / right hold ordinary blocks. ratio: "60-40" (default), "40-60", "50-50", "between".
function renderColumns(ctx, b) {
  const side = (key) => (b[key] || []).map((nb, j) => {
    const prev = ctx._fp;
    ctx._fp = `${prev || ""}${key}.${j}.`;
    try { return renderBlockInner(ctx, nb); } finally { ctx._fp = prev; }
  }).join("\n");
  const ratio = ["60-40", "40-60", "50-50", "between"].includes(b.ratio) ? b.ratio : "60-40";
  return `<div class="cols cols--${ratio}${b.valign === "center" ? " cols--center" : ""}"><div class="cols__a">${side("left")}</div><div class="cols__b">${side("right")}</div></div>`;
}

const SOCIAL_ICON = {
  facebook: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="#fff" d="M13.5 21v-8h2.7l.5-3.2h-3.2V7.8c0-.9.4-1.6 1.7-1.6h1.6V3.4c-.3 0-1.3-.1-2.4-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.6V13h2.7v8z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="1.9" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.8" cy="7.2" r=".7" fill="#fff"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="#fff" d="M5.2 9.4h3.1V19H5.2zM6.8 4.6a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zM10.4 9.4h3v1.3c.5-.8 1.5-1.5 3-1.5 3.1 0 3.7 2 3.7 4.700V19H17v-4.600c0-1.100 0-2.500-1.500-2.500s-1.800 1.200-1.800 2.400V19h-3.300z"/></svg>'
};
// A row of small "module" cards side by side: picture, title, short text, bullet points, link and optional brochure.
// layout "cards": picture on top, up to three per row. layout "compact": picture left, text right, two per row.
// "You might also be interested in": a slim rail of linked pages. Picture, title and brand come from the target page unless
// the item overrides them. Items marked "mutual" also show up, automatically, on the page they point to (ctx.incomingRelated).
function relatedInfo(ctx, it) {
  const ext = /^https?:/.test(it.href || "");
  if (ext) return { title: it.title || it.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""), sub: it.text || "", image: it.image || "" };
  const p = it.href.split(/[?#]/)[0];
  const segs = p.split("/").filter(Boolean);
  const brand = segs.length >= 3 ? navTitleOf(ctx, "/" + segs[0] + "/" + segs[1]) : "";
  let image = it.image || "";
  if (!image) {
    const par = "/" + segs.slice(0, -1).join("/");
    const pt = ctx.tr(par, ctx.lang) || ctx.tr(par, ctx.defaultLang);
    for (const x of flatBlocks((pt && pt.blocks) || [])) if ((x.type === "cards" || x.type === "modules") && !image) for (const c of x.items || []) if (c.image && c.href && c.href.split(/[?#]/)[0] === p) { image = c.image; break; }
  }
  if (!image) { const pg = ctx.pages.get(p); if (pg && pg.hero && pg.hero.image) image = pg.hero.image; }
  if (!image) {
    const t = ctx.tr(p, ctx.lang) || ctx.tr(p, ctx.defaultLang);
    const im = t && flatBlocks(t.blocks || []).find((x) => (x.type === "image" && x.src && !x.href) || (x.type === "carousel" && x.items && x.items[0]) || (x.type === "compare" && x.src));
    if (im) image = im.type === "carousel" ? im.items[0].src : im.src;
  }
  return { title: it.title || navTitleOf(ctx, p), sub: it.text || brand, image };
}
// "Which model for my size?": every model is a bar on a shared scale (hole size in mm). Layouts: bars (default), selector (bars plus
// a slider that marks a size and lists the models that fit) and matrix (stepped table of the size brackets each model covers).
let _rcId = 0;
function renderRangeChart(ctx, b) {
  const rows = (b.items || []).filter((it) => it && it.label && Number.isFinite(Number(it.min)) && Number.isFinite(Number(it.max)) && String(it.min) !== "" && String(it.max) !== "" && Number(it.max) >= Number(it.min))
    .map((it) => ({ ...it, min: Number(it.min), max: Number(it.max) }));
  if (!rows.length) return "";
  if (b.sort !== false) rows.sort((x, y) => x.min - y.min || x.max - y.max);
  const u = ctx.ui, unit = b.unit || "mm";
  const step = Math.max(1, Number(b.step) || 25);
  const top = Math.max(step, Math.ceil(Math.max(...rows.map((r) => r.max)) / step) * step);
  const layout = b.layout === "selector" || b.layout === "matrix" ? b.layout : "bars";
  const id = "rc" + ++_rcId;
  const pct = (v) => ((v / top) * 100).toFixed(2);
  const fmt = (r) => (r.min === r.max ? String(r.min) : r.min + "-" + r.max) + " " + unit;
  // small picture of the model (the same finished square as in the products menu: already multiplied onto the panel colour)
  const icoOf = (r) => {
    if (layout === "matrix" || !r.href || /^https?:/.test(r.href)) return "";
    const info = relatedInfo(ctx, { href: r.href });
    const im = info.image && ctx.image(info.image);
    if (!im) return "";
    return im.menu ? `<img class="rc__ico" src="/assets/img/${esc(im.name)}-menu.webp" width="30" height="30" alt="" loading="lazy" decoding="async">` : "";
  };
  const label = (r) => (r.href ? `<a class="rc__label" href="${esc(localizeHref(ctx, r.href))}">${esc(r.label)}</a>` : `<span class="rc__label">${esc(r.label)}</span>`);
  const head = `<h2 class="rc__title"${editFld(ctx, "title")}>${esc(b.title || u.rc_title || "Vilken modell passar ditt mått?")}</h2>` +
    (b.intro || ctx.edit ? `<p class="rc__intro"${editFld(ctx, "intro")}>${esc(b.intro || "")}</p>` : "");
  const foot = b.note || ctx.edit ? `<p class="rc__note"${editFld(ctx, "note")}>${esc(b.note || "")}</p>` : "";
  if (layout === "matrix") {
    const bins = []; for (let s = 0; s < top; s += step) bins.push([s, s + step]);
    const first = bins.findIndex(([s, e]) => rows.some((r) => r.max > s && r.min < e));
    const use = bins.slice(Math.max(0, first));
    const th = use.map(([s, e]) => `<th scope="col">${s}-${e}</th>`).join("");
    const body = rows.map((r) => `<tr><th scope="row">${label(r)}<span class="rc__sub">${esc(fmt(r))}</span></th>` + use.map(([s, e]) => {
      const cov = r.max > s && r.min < e;
      const full = r.min <= s && r.max >= e;
      return `<td class="${cov ? (full ? "is-full" : "is-part") : ""}"${cov ? ` aria-label="${esc(r.label)} ${s}-${e} ${esc(unit)}"` : ""}>${cov ? "<span></span>" : ""}</td>`;
    }).join("") + "</tr>").join("");
    return `<section class="rc rc--matrix">${head}<div class="rc__scroll" tabindex="0" role="region" aria-label="${esc(b.title || u.rc_title || "")}"><table class="rc__matrix"><thead><tr><th scope="col">${esc(u.rc_hole || "Hålstorlek")} (${esc(unit)})</th>${th}</tr></thead><tbody>${body}</tbody></table></div>${foot}</section>`;
  }
  const ticks = []; for (let v = 0; v <= top; v += step) ticks.push(v);
  const axis = ticks.map((v, i) => `<span style="left:${pct(v)}%"${i === 0 ? ' class="is-first"' : i === ticks.length - 1 ? ' class="is-last"' : ""}>${v}</span>`).join("");
  const body = rows.map((r) => {
    const w = r.max - r.min, wide = (w / top) * 100 >= 22;
    const bar = `<span class="rc__bar${wide ? "" : " rc__bar--out"}${(w / top) * 100 >= 45 ? " rc__bar--big" : ""}" style="left:${pct(r.min)}%;width:${Math.max(((w / top) * 100), 1.2).toFixed(2)}%"><span class="rc__val">${esc(fmt(r))}</span></span>`;
    return `<li class="rc__row" data-min="${r.min}" data-max="${r.max}"><span class="rc__lab">${icoOf(r)}${label(r)}</span><div class="rc__track">${bar}</div></li>`;
  }).join("");
  // the slider starts a little below the smallest model and opens on a size that fits at least one model
  const lo = Math.max(0, Math.floor((Math.min(...rows.map((r) => r.min)) - 5) / 5) * 5);
  const sstep = top > 300 ? 5 : 1;
  const mid = Math.round((rows[0].min + rows[0].max) / 2 / sstep) * sstep;
  const pick = layout === "selector"
    ? `<div class="rc__pick"><label for="${id}">${esc(u.rc_pick || "Ditt hål")}</label><output class="rc__out" for="${id}"></output><div class="rc__slider"><input id="${id}" type="range" min="${lo}" max="${top}" step="${top > 300 ? 5 : 1}" value="${mid}"><span class="rc__hand" aria-hidden="true">${ICON.hand}</span></div><p class="rc__result" aria-live="polite" data-fits="${esc(u.rc_fits || "Passar")}" data-none="${esc(u.rc_none || "Ingen modell täcker detta mått")}" data-unit="${esc(unit)}"></p></div>`
    : "";
  // masts that fit: every mast of the list, lit up by site.js for the machines that cover the chosen size (data-for = the models it takes)
  const mm = layout === "selector" && b.masts && (b.masts.items || []).length ? b.masts : null;
  const mastsHtml = mm ? `<div class="rc__masts" data-masts data-more="${esc(mm.more || "")}" data-none="${esc(mm.none || "")}" data-hint="${esc(mm.hint || "")}" data-for-label="${esc(mm.forLabel || "")}"><h3 class="rc__mtitle">${esc(mm.title || "")}</h3><p class="rc__mhint" aria-live="polite">${esc(mm.hint || "")}</p><ul class="rc__mlist">` +
    mm.items.map((m) => {
      const im = m.image && ctx.image(m.image);
      const thumb = im && im.menu ? `<img src="/assets/img/${esc(im.name)}-menu.webp" width="44" height="44" alt="" loading="lazy" decoding="async">` : m.image ? imgTag(ctx, m.image, "", { cls: "rc__mimg", sizes: "44px" }) : "";
      return `<li class="rc__mast" data-for="${esc((m.for || []).join(" "))}"><a href="${esc(localizeHref(ctx, m.href))}"><span class="rc__mthumb">${thumb}</span><span class="rc__mtxt"><b>${esc(m.title)}</b><small>${esc(m.sub || "")}</small><em class="rc__mfor"></em></span><span class="rc__mbadge">${esc(mm.fit || "")}</span></a></li>`;
    }).join("") + "</ul></div>" : "";
  return `<section class="rc rc--${layout}"${layout === "selector" ? ' data-rc="selector"' : ""} data-top="${top}" style="--top:${top};--ticks:${ticks.length - 1}">${head}${pick}<div class="rc__chart"><div class="rc__axis" aria-hidden="true"><span class="rc__unit">${esc(u.rc_hole || "Hålstorlek")} (${esc(unit)})</span><div class="rc__scale">${axis}</div></div><ol class="rc__rows">${body}</ol>${layout === "selector" ? '<span class="rc__marker" aria-hidden="true"></span>' : ""}</div>${mastsHtml}${foot}${layout === "selector" ? `<p class="rc__caution">${ICON.info}<span${editFld(ctx, "caution")}>${esc(b.caution || u.rc_caution || "")}</span></p>` : ""}</section>`;
}

function renderRelated(ctx, b) {
  const extra = ctx._relExtra || [];
  ctx._relExtra = [];
  const seen = new Set();
  const items = [...(b.items || []), ...extra].filter((it) => {
    if (!it || !it.href || seen.has(it.href)) return false;
    seen.add(it.href);
    return /^https?:/.test(it.href) || (ctx.pages.has(it.href.split(/[?#]/)[0]) && shown(ctx, it.href.split(/[?#]/)[0]));
  });
  if (!items.length) return "";
  const title = b.title || ctx.ui.related_title || "Du kanske också är intresserad av:";
  const tiles = items.map((it) => {
    const ext = /^https?:/.test(it.href);
    const href = ext ? it.href : localizeHref(ctx, it.href);
    const info = relatedInfo(ctx, it);
    const img = info.image ? imgTag(ctx, info.image, "", { cls: "rel__img", sizes: "80px" }) : "";
    return `<a class="rel__item" href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ""}><span class="rel__thumb">${img}</span><span class="rel__txt"><span class="rel__t">${esc(info.title)}</span>${info.sub ? `<span class="rel__s">${esc(info.sub)}</span>` : ""}</span><span class="rel__arrow">${ext ? ICON.external : ICON.arrow}</span></a>`;
  }).join("");
  return `<section class="related"><h2 class="related__title"${editFld(ctx, "title")}>${esc(title)}</h2><div class="related__rail">${tiles}</div></section>`;
}

function renderModules(ctx, b) {
  const items = (b.items || []).filter((it) => it && !(it.href && ctx.pages && ctx.pages.has(it.href) && !shown(ctx, it.href)));
  if (!items.length) return "";
  const layout = b.layout === "compact" ? "compact" : b.layout === "tiles" ? "tiles" : "cards";
  const cols = Math.max(1, Math.min(4, Number(b.columns) || (layout === "compact" ? 2 : Math.min(items.length, 3))));
  const lvl = ctx._cardLevel || 3;
  const more = esc(ctx.ui.read_more || "Läs mer");
  const li = items.map((it, i) => {
    const href = it.href ? (/^https?:/.test(it.href) ? it.href : localizeHref(ctx, it.href)) : "";
    const minfo = it.image && !ctx.edit && layout !== "tiles" ? ctx.image(it.image) : null;
    const mbaked = !!(minfo && minfo.tilesq);
    const img = mbaked ? `<img class="module__img" src="/assets/img/${esc(minfo.name)}-tilesq.webp" width="640" height="640" alt="${esc(it.alt || it.title || "")}" loading="lazy" decoding="async">` : it.image ? imgTag(ctx, it.image, it.alt || it.title || "", { cls: "module__img", sizes: layout === "compact" ? "180px" : layout === "tiles" ? "(min-width: 900px) 560px, 100vw" : "(min-width: 900px) 330px, 90vw" }) : "";
    const media = img ? (href ? `<a class="module__media${mbaked ? " module__media--tile" : ""}" href="${esc(href)}" tabindex="-1" aria-hidden="true">${img}</a>` : `<span class="module__media${mbaked ? " module__media--tile" : ""}">${img}</span>`) : "";
    const title = it.title ? `<h${lvl} class="module__title"${editFld(ctx, `items.${i}.title`)}>${href ? `<a href="${esc(href)}">${esc(it.title)}</a>` : esc(it.title)}</h${lvl}>` : "";
    const text = it.text || ctx.edit ? `<p class="module__text"${editFld(ctx, `items.${i}.text`)}>${esc(it.text || "")}</p>` : "";
    const bullets = (it.bullets || []).length ? `<ul class="module__list">${it.bullets.map((x) => `<li>${ctx.edit ? esc(x) : localizeHtml(ctx, x)}</li>`).join("")}</ul>` : "";
    let doc = "";
    if (it.doc && it.doc.href) {
      const ext = /^https?:/.test(it.doc.href);
      const view = ext ? it.doc.href : localizeHref(ctx, it.doc.href);
      const dl = ext && it.doc.driveId ? `https://drive.google.com/uc?export=download&id=${encodeURIComponent(it.doc.driveId)}` : view;
      doc = `<span class="module__doc"><span class="module__doc-name">${esc(it.doc.text || ctx.ui.documents || "PDF")}</span>` +
        `<a class="btn btn--sm btn--ghost" href="${esc(view)}" target="_blank" rel="noopener">${ICON.eye}<span>${esc(ctx.ui.doc_view || "Visa")}</span></a>` +
        `<a class="btn btn--sm btn--ghost" href="${esc(dl)}"${ext ? ' rel="noopener"' : " download"}>${ICON.down}<span>${esc(ctx.ui.download || "Ladda ner")}</span></a></span>`;
    }
    const isExt = /^https?:/.test(it.href || "");
    const go = href && b.more !== false
      ? (isExt
        ? `<a class="module__more" href="${esc(href)}" target="_blank" rel="noopener"><span>${it.cta ? esc(it.cta) : more}</span>${ICON.external}</a>`
        : `<a class="module__more" href="${esc(href)}"><span>${it.cta ? esc(it.cta) : more}</span>${ICON.arrow}</a>`)
      : "";
    return `<li class="module">${media}<div class="module__body">${title}${text}${bullets}${go || doc ? `<div class="module__actions">${go}${doc}</div>` : ""}</div></li>`;
  }).join("");
  return `<ul class="modules modules--${layout}${b.square ? " modules--sq" : ""}${b.narrow ? " modules--narrow" : ""}${b.zoom ? " modules--zoom" : ""}" style="--cols:${cols}">${li}</ul>`;
}

// Image carousel. Native scroll-snap: swipe, trackpad and keyboard work without JavaScript; site.js adds arrows, dots
// and the optional autoplay (never with prefers-reduced-motion, stops as soon as the visitor touches it).
// "Find the right machine": cards for the product families; choosing one shows its models, each with its brochure. Without JavaScript
// every family is listed one after the other, so nothing is hidden from a visitor or a search engine.
function renderFinder(ctx, b) {
  const groups = (b.groups || []).filter((g) => g && g.title);
  if (!groups.length) return "";
  const u = ctx.ui;
  const slug = (g, i) => "fn-" + String(g.key || g.title).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + i;
  const count = (g) => { const n = (g.items || []).length; return n ? (n === 1 ? u.finder_count_one || "1 broschyr" : String(u.finder_count_many || "{n} broschyrer").replace("{n}", String(n))) : u.finder_count_none || "På begäran"; };
  const cards = groups.map((g, i) => `<a class="finder__card" href="#${slug(g, i)}">` +
    `<span class="finder__img">${g.image ? imgTag(ctx, g.image, "", { sizes: "(min-width: 900px) 200px, 45vw" }) : ""}</span>` +
    `<span class="finder__name">${esc(g.title)}</span><span class="finder__count">${esc(count(g))}</span></a>`).join("");
  const panels = groups.map((g, i) => {
    const items = (g.items || []).filter((x) => x && x.href);
    const list = items.length
      ? `<ul class="docs finder__docs">${items.map((x) => renderDoc(ctx, { text: x.label || x.href.split("/").pop(), href: x.href, external: /^https?:/.test(x.href) })).join("")}</ul>`
      : `<p class="finder__none">${esc(u.finder_none || "Broschyr på begäran. Kontakta oss så skickar vi den.")} <a href="${esc(localizeHref(ctx, "/kontakta-oss"))}">${esc(u.contact_us || "Kontakta oss")}</a></p>`;
    return `<section class="finder__panel" id="${slug(g, i)}" aria-label="${esc(g.title)}"><h3>${esc(g.title)}</h3>${g.text ? `<p class="finder__text">${esc(g.text)}</p>` : ""}${list}</section>`;
  }).join("");
  return `<section class="finder" data-finder>${b.title ? `<h2${editFld(ctx, "title", "plain")}>${esc(b.title)}</h2>` : ""}${b.intro ? `<p class="finder__intro"${editFld(ctx, "intro")}>${esc(b.intro)}</p>` : ""}` +
    `<div class="finder__cards">${cards}</div><p class="finder__hint" hidden>${esc(b.hint || u.finder_hint || "Välj en produkttyp ovan för att se modeller och broschyrer.")}</p><div class="finder__panels">${panels}</div></section>`;
}

// Two pictures of the same thing in the same pose on top of each other, with a divider the visitor drags (before / after, outside / inside).
// The stage takes the proportions of the first picture and both are fitted inside it, so the join stays seamless at any width.
function renderCompare(ctx, b) {
  if (!b.src || !b.src2) return "";
  const info = ctx.image(b.src);
  const ratio = info && info.w && info.h ? info.w / info.h : b.width && b.height ? b.width / b.height : 1.4;
  const sizes = "(min-width: 900px) 520px, 100vw";
  const tag = (k, cls) => (b[k] ? `<span class="cmp__tag cmp__tag--${cls}">${esc(b[k])}</span>` : "");
  const label = b.ariaLabel || (ctx.ui && ctx.ui.compare_label) || "Dra reglaget för att jämföra bilderna";
  return `<figure class="cmp" data-cmp style="--ar:${ratio.toFixed(4)}"><div class="cmp__stage">` +
    imgTag(ctx, b.src2, b.alt2 || "", { cls: "cmp__img", sizes }) +
    `<div class="cmp__over">${imgTag(ctx, b.src, b.alt || "", { cls: "cmp__img", sizes })}</div>` +
    tag("label", "l") + tag("label2", "r") +
    `<span class="cmp__bar" aria-hidden="true"><span class="cmp__knob">${ICON.swap}</span></span>` +
    (ctx.edit ? "" : `<input class="cmp__range" type="range" min="0" max="100" step="0.5" value="50" aria-label="${esc(label)}">`) +
    `</div>${b.caption ? `<figcaption${editFld(ctx, "caption")}>${esc(b.caption)}</figcaption>` : ""}</figure>`;
}

function renderCarousel(ctx, items, o = {}) {
  const slides = (items || []).filter((x) => x && x.src);
  if (!slides.length) return "";
  if (slides.length === 1) return renderBlockInner(ctx, { type: "image", ...slides[0] });
  const u = ctx.ui;
  const first = ctx.image(slides[0].src);
  const ratio = first && first.w && first.h ? Math.min(2, Math.max(1, first.w / first.h)) : 4 / 3;
  const secs = Math.max(2, Math.min(20, Number(o.interval) || 5));
  const auto = o.autoplay ? ` data-autoplay="${secs * 1000}"` : "";
  const li = slides.map((s, i) => {
    const img = imgTag(ctx, s.src, s.alt || "", { cls: "carousel__img", sizes: "(min-width: 900px) 760px, 100vw" });
    const inner = s.href ? `<a href="${esc(localizeHref(ctx, s.href))}"${/^https?:/.test(s.href) ? ' rel="noopener"' : ""}>${img}</a>` : img;
    const label = String(u.carousel_slide || "Bild {n} av {total}").replace("{n}", i + 1).replace("{total}", slides.length);
    return `<li class="carousel__slide" role="group" aria-roledescription="slide" aria-label="${esc(label)}">${inner}` +
      `${s.caption ? `<span class="carousel__cap">${esc(s.caption)}</span>` : ""}</li>`;
  }).join("");
  const dots = slides.map((_, i) => `<button type="button" class="carousel__dot" aria-label="${i + 1}"${i === 0 ? ' aria-current="true"' : ""}></button>`).join("");
  return `<section class="carousel" data-carousel${auto} style="--car-ar:${ratio.toFixed(3)}" aria-roledescription="carousel" aria-label="${esc(o.label || u.carousel_label || "Bildspel")}">` +
    `<ul class="carousel__track" tabindex="0">${li}</ul>` +
    `<button type="button" class="carousel__btn carousel__btn--prev" aria-label="${esc(u.carousel_prev || "Föregående")}">${ICON.prev}</button>` +
    `<button type="button" class="carousel__btn carousel__btn--next" aria-label="${esc(u.carousel_next || "Nästa")}">${ICON.next}</button>` +
    `<div class="carousel__dots">${dots}</div></section>`;
}

// Quote request form. Works without any third party: with no endpoint configured it opens the visitor's own
// e-mail program with the filled-in text. With site.quoteForm.endpoint set, site.js posts it there instead.
function renderQuote(ctx, b = {}) {
  const u = ctx.ui, q = ctx.site.quoteForm || {}, c = ctx.site.contact || {};
  const T = (k, d) => esc(u[k] || d);
  const privacy = ctx.site.privacyPath && ctx.pages.has(ctx.site.privacyPath) ? ctx.url(ctx.site.privacyPath) : "";
  const f = (id, label, type, auto, req) =>
    `<p class="qf__f"><label for="q-${id}">${label}${req ? ` <span class="qf__req" aria-hidden="true">*</span>` : ""}</label>` +
    `<input id="q-${id}" name="${id}" type="${type}" autocomplete="${auto}"${req ? " required" : ""}></p>`;
  const langLabel = (ctx.site.languages && ctx.site.languages[ctx.lang] && ctx.site.languages[ctx.lang].label) || ctx.lang;
  const guard = {
    start: u.guard_start || "Håll nere för att verifiera", help: u.guard_help || "Håll nere knappen tills cirkeln blir grön, släpp sedan.", hold: u.guard_hold || "Håll…",
    holdHelp: u.guard_hold_help || "Fortsätt hålla, snart blir den grön.", go: u.guard_go || "Släpp nu", early: u.guard_early || "Du släppte för tidigt. Försök igen.",
    late: u.guard_late || "För sent. Försök igen, släpp när den är grön.", ok: u.guard_ok || "Verifierad", lock: u.guard_lock || "Vila en stund. Försök igen om {s} s.",
    need: u.guard_need || "En sak kvar: håll nere knappen ovan tills den blir grön och släpp.", alt: u.guard_alt || "Funkar det inte för dig? Skriv till oss på", checking: u.guard_checking || "Kontrollerar…", mail: c.email || ""
  };
  const extra = Object.entries(q.extra || {}).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join("");
  return `<section class="quote" id="offert" data-quote data-endpoint="${esc(q.endpoint || "")}" data-key="${esc(q.apiKey || "")}" data-mailto="${esc(c.email || "")}" data-lang-label="${esc(langLabel)}" data-hole-short="${T("quote_hole_short", "håldiameter")}" data-v-required="${T("quote_v_required", "Fyll i det här fältet.")}" data-v-email="${T("quote_v_email", "Ange en giltig e-postadress.")}" data-v-consent="${T("quote_v_consent", "Bocka i rutan för att godkänna att vi använder dina uppgifter, så kan du skicka förfrågan.")}" data-guard="${esc(JSON.stringify(guard))}" ` +
    `data-subject="${T("quote_subject", "Offertförfrågan")}" data-about="${T("quote_about", "Gäller:")}" data-sending="${T("quote_sending", "Skickar…")}" data-ok="${T("quote_ok", "Tack! Vi återkommer så snart vi kan.")}" ` +
    `data-err="${T("quote_err", "Det gick inte att skicka. Ring oss eller skriv till oss direkt.")}" data-mail="${T("quote_mail", "Ditt e-postprogram öppnas med meddelandet ifyllt, tryck på Skicka där.")}">` +
    `${b.bare ? "" : `<h2>${T("quote_title", "Få offert")}</h2>`}<p class="muted">${T("quote_intro", "Berätta kort vad du behöver, så återkommer vi.")}</p>` +
    `<form class="qf" method="post" action="${esc(q.endpoint || "#")}" novalidate>` +
    `<div class="qf__grid">${f("name", T("quote_name", "Namn"), "text", "name", true)}${f("company", T("quote_company", "Företag"), "text", "organization")}` +
    `${f("email", T("quote_email", "E-post"), "email", "email", true)}${f("phone", T("quote_phone", "Telefon"), "tel", "tel")}</div>` +
    `<p class="qf__f"><label for="q-message">${T("quote_message", "Vad behöver du hjälp med?")} <span class="qf__req" aria-hidden="true">*</span></label>` +
    `<textarea id="q-message" name="message" rows="5" required></textarea></p>` +
    `<input type="hidden" name="product" value=""><input type="hidden" name="lang" value="${esc(ctx.lang)}"><input type="hidden" name="lang_label" value="${esc(langLabel)}">` +
    `<p class="qf__trap" aria-hidden="true"><label>Website <input name="website" type="text" tabindex="-1" autocomplete="off"></label></p>` +
    `${extra}<input type="hidden" name="subject" value="${T("quote_subject", "Offertförfrågan")}">` +
    `<p class="qf__consent"><label><input type="checkbox" name="consent" required> <span>${T("quote_consent", "Jag godkänner att mina uppgifter används för att besvara min förfrågan.")}` +
    `${privacy ? ` <a href="${esc(privacy)}">${T("quote_privacy", "Läs mer i integritetspolicyn")}</a>` : ""}</span></label></p>` +
    `<p><button class="btn" type="submit">${T("quote_send", "Skicka förfrågan")}${ICON.arrow}</button></p>` +
    `<p class="qf__status" role="status" aria-live="polite"></p></form></section>`;
}

function renderSocial(ctx) {
  const items = (ctx.site.social || []).map((s) => {
    const key = String(s.name || "").toLowerCase();
    const icon = SOCIAL_ICON[key];
    return `<a class="social__icon social__icon--${esc(key)}" href="${esc(s.url)}" rel="noopener me" target="_blank" aria-label="${esc(s.name)}">${icon || esc(String(s.name || "").slice(0, 1))}</a>`;
  }).join("");
  return items ? `<p class="social">${items}</p>` : "";
}

export function renderBlock(ctx, b) {
  const html = renderBlockInner(ctx, b);
  if (!ctx.edit || b.__i == null) return html;
  if (b.type === "button" && b.kind === "download") return html; // renderDoc tags its own <li>
  const attrs = ` data-bk-i="${b.__i}" data-bk-type="${esc(b.type)}"`;
  if (!html.trim() || blockIsEmpty(b)) return `<div class="bk-empty"${attrs}>${esc((ctx.editLabels && ctx.editLabels[b.type]) || b.type)}</div>`;
  return tagTop(html, attrs);
}

function renderBlockInner(ctx, b) {
  switch (b.type) {
    case "heading": {
      const lvl = Math.min(4, Math.max(2, b.level || 2));
      return `<h${lvl}${b.anchor ? ` id="${esc(b.anchor)}"` : ""}${editFld(ctx, "text", "plain", "Rubrik")}>${esc(b.text)}</h${lvl}>`;
    }
    case "text":
      return `<p${editFld(ctx, "html", "inline", "Skriv text här…")}>${ctx.edit ? b.html || "" : localizeHtml(ctx, b.html)}</p>`;
    case "list": {
      const tag = b.ordered ? "ol" : "ul";
      const list = `<${tag}>${(b.items || []).map((x, j) => `<li${editFld(ctx, `items.${j}`, "inline")}>${ctx.edit ? x : localizeHtml(ctx, x)}</li>`).join("")}</${tag}>`;
      // a list that is a closed section with a heading (the standard and optional equipment of a pump): <details>
      if (b.collapsible && b.title) return `<details class="collapse"><summary class="collapse__sum"><span class="collapse__t"${editFld(ctx, "title")}>${esc(b.title)}</span><span class="collapse__chev" aria-hidden="true">${ICON.chevron}</span></summary><div class="collapse__body">${list}</div></details>`;
      return list;
    }
    case "image": {
      // imgWidth: a small picture (px) centred in its column while the caption keeps the full width
      const img = imgTag(ctx, b.src, b.alt || "", { sizes: "(min-width: 900px) 520px, 100vw" }).replace("<img ", b.imgWidth ? `<img style="max-width:${Math.round(Number(b.imgWidth))}px" ` : "<img ");
      const inner = b.href ? `<a href="${esc(localizeHref(ctx, b.href))}"${/^https?:/.test(b.href) ? ' target="_blank" rel="noopener"' : ""}>${img}</a>` : img;
      return `<figure class="figure${b.align === "right" ? " figure--right" : b.align === "center" ? " figure--center" : ""}${b.imgWidth ? " figure--small" : ""}"${b.maxWidth ? ` style="max-width:${Math.round(Number(b.maxWidth))}px"` : ""}>${inner}${b.caption ? `<figcaption${editFld(ctx, "caption")}>${esc(b.caption)}</figcaption>` : ""}</figure>`;
    }
    case "button": {
      const external = b.external || /^https?:/.test(b.href || "");
      if (b.kind === "download") return `<ul class="docs docs--single">${renderDoc(ctx, b)}</ul>`;
      const label = ctx.edit ? `<span${editFld(ctx, "text", "plain", "Knapptext")}>${esc(b.text)}</span>` : esc(b.text);
      return `<p class="btn-row"><a class="btn${b.full ? " btn--block" : ""}" href="${esc(external ? b.href : localizeHref(ctx, b.href))}"${external ? ' target="_blank" rel="noopener"' : ""}>${label}${external ? extLabel(ctx) : ""}${b.full ? "" : external ? ICON.external : ICON.arrow}</a></p>`;
    }
    case "cards": return renderCards(ctx, b);
    case "video": return renderVideo(ctx, b);
    case "table": return renderTable(ctx, b);
    case "datasheet": return renderDatasheet(ctx, b);
    case "contact": return renderContact(ctx);
    case "columns": return renderColumns(ctx, b);
    case "social": return renderSocial(ctx);
    case "quote": return renderQuote(ctx, b);
    case "carousel": return renderCarousel(ctx, b.items, b);
    case "compare": return renderCompare(ctx, b);
    case "perfchart": return renderPerfChart(ctx, b, (n) => editFld(ctx, n), (src, alt, o) => imgTag(ctx, src, alt, o));
    case "finder": return renderFinder(ctx, b);
    case "modules": return renderModules(ctx, b);
    case "related": return renderRelated(ctx, b);
    case "rangechart": return renderRangeChart(ctx, b);
    case "chips": return renderChips(ctx, b);
    case "cta": return renderCta(ctx, b);
    case "stat": return renderStat(ctx, b);
    case "sizeselect": {
      const sizes = (b.sizes || []).map(String);
      return `<div class="sizesel" data-sizesel="${esc(sizes.join(","))}"><span class="sizesel__label"${editFld(ctx, "label")}>${esc(b.label || "")}</span><div class="sizesel__seg" role="radiogroup" aria-label="${esc(b.label || "")}"><button type="button" role="radio" aria-checked="true" data-k="-1">${esc(b.all || "Alla")}</button>${sizes.map((x, k) => `<button type="button" role="radio" aria-checked="false" data-k="${k}">${esc(x)}${b.unit ? " " + esc(b.unit) : ""}</button>`).join("")}</div></div>`;
    }
    case "html": return b.html || "";
    default: return "";
  }
}

// Group the flow into: normal content (inside .container.prose) and full-bleed
// sections (document band, call-to-action) so they can break out of the column.
export function renderBlocks(ctx, blocks) {
  const out = [];
  let prose = [];
  let imgRun = [];
  const flushImgs = () => {
    if (!imgRun.length) return;
    // two or more pictures in a row become a carousel (the editor keeps them as separate, directly editable blocks)
    if (imgRun.length === 1) prose.push(renderBlock(ctx, imgRun[0]));
    else if (ctx.edit) prose.push(`<div class="gallery">${imgRun.map((x) => renderBlock(ctx, x)).join("")}</div>`);
    else prose.push(renderCarousel(ctx, imgRun));
    imgRun = [];
  };
  const flushProse = () => {
    flushImgs();
    if (prose.length) out.push(`<div class="container prose">${prose.join("\n")}</div>`);
    prose = [];
  };
  const list = blocks || [];
  let seenHeading = false; // card titles are h2 until the page has had a heading of its own, then h3 (no skipped levels)
  for (let i = 0; i < list.length; i++) {
    const b = list[i];
    ctx._cardLevel = seenHeading ? 3 : 2;
    if (b.type === "heading" || b.type === "datasheet" || (b.type === "button" && b.kind === "download")) seenHeading = true;
    if (b.type === "image") { imgRun.push(b); continue; }
    flushImgs();
    if (b.type === "button" && b.kind === "download") {
      let run = [];
      while (i < list.length && list[i].type === "button" && list[i].kind === "download") run.push(list[i++]);
      i--;
      flushProse();
      // outside Swedish a Swedish brochure is left out when the page has one in another language
      if (!ctx.edit && ctx.lang !== "sv" && run.some((d) => { const l = docLang(ctx, d); return l && l !== "sv"; })) run = run.filter((d) => docLang(ctx, d) !== "sv");
      out.push(`<section class="docbar" aria-label="${esc(ctx.ui.documents || "Dokument")}"><div class="container"><h2 class="docbar__title">${esc(ctx.ui.documents || "Dokument")}</h2><ul class="docs">${run.map((d) => renderDoc(ctx, d)).join("")}</ul></div></section>`);
      continue;
    }
    if (!ctx.edit && b.type === "button" && b.kind !== "download") {
      const run = [];
      while (i < list.length && list[i].type === "button" && list[i].kind !== "download") run.push(list[i++]);
      i--;
      prose.push(run.length === 1 ? renderBlock(ctx, run[0]) : `<p class="btn-row btn-row--group">${run.map((x) => renderBlockInner(ctx, x).replace(/^<p class="btn-row">|<\/p>$/g, "")).join("")}</p>`);
      continue;
    }
    if (b.type === "cta" || b.type === "datasheet" && false) { flushProse(); out.push(renderBlock(ctx, b)); continue; }
    if (b.type === "columns" || b.type === "social" || b.type === "quote") { flushProse(); out.push(`<div class="container prose sect">${renderBlock(ctx, b)}</div>`); continue; }
    prose.push(renderBlock(ctx, b));
  }
  flushProse();
  return out.join("\n");
}

// ---------- chrome ----------
export function breadcrumbItems(ctx, path) {
  if (path === "/") return [];
  const segs = path.split("/").filter(Boolean);
  const items = [{ path: "/", name: ctx.ui.home || "Startsida" }];
  let acc = "";
  for (const s of segs) {
    acc += "/" + s;
    if (ctx.pages.has(acc) && shown(ctx, acc)) items.push({ path: acc, name: navTitleOf(ctx, acc) });
  }
  return items;
}

function renderBreadcrumbs(ctx, path) {
  const items = breadcrumbItems(ctx, path);
  if (items.length < 2) return "";
  const li = items.map((it, i) => {
    const last = i === items.length - 1;
    return last
      ? `<li aria-current="page"><span>${esc(it.name)}</span></li>`
      : `<li><a href="${esc(ctx.url(it.path))}">${esc(it.name)}</a></li>`;
  }).join("");
  return `<nav class="breadcrumbs" aria-label="${esc(ctx.ui.breadcrumbs || "Brödsmulor")}"><ol>${li}</ol></nav>`;
}

// Same page in another language; if it does not exist (or is hidden) there, the nearest page above it that does
function langLink(ctx, code, path) {
  let p = path;
  for (let guard = 0; guard < 12; guard++) {
    if (ctx.tr(p, code)) return ctx.url(p, code);
    const i = p.lastIndexOf("/");
    if (i <= 0) break;
    p = p.slice(0, i);
  }
  return ctx.url("/", code);
}

function renderLangSwitch(ctx, path) {
  const langs = Object.entries(ctx.site.languages || {}).filter(([code, l]) => l.published && (code === ctx.defaultLang || ctx.tr("/", code) || ctx.tr(path, code)));
  if (langs.length < 2) return "";
  const cur = ctx.lang;
  const label = (c) => (ctx.site.languages[c] && ctx.site.languages[c].label) || c;
  return `<details class="lang"><summary aria-label="${esc(ctx.ui.language || "Språk")}: ${esc(label(cur))}">` +
    `<img src="${flagSrc(cur)}" alt="" width="22" height="15"><span class="lang__code">${esc(cur.toUpperCase())}</span>${ICON.chevron}</summary>` +
    `<ul class="lang__list">${langs.map(([code]) =>
      `<li><a href="${esc(langLink(ctx, code, path))}" hreflang="${esc(htmlLang(ctx, code))}" lang="${esc(htmlLang(ctx, code))}"${code === cur ? ' aria-current="true"' : ""}>` +
      `<img src="${flagSrc(code)}" alt="" width="22" height="15"><span>${esc(label(code))}</span></a></li>`).join("")}</ul></details>`;
}

// brand logos come from a section's own listing cards (so the CMS keeps them in sync)
function brandLogoMap(ctx, root) {
  const rootT = ctx.tr(root, ctx.lang) || ctx.tr(root, ctx.defaultLang);
  const logos = new Map();
  for (const b of (rootT && rootT.blocks) || []) {
    if (b.type === "cards") for (const it of b.items) if (it.image && !logos.has(it.href)) logos.set(it.href, it.image);
  }
  return logos;
}

function renderLangRow(ctx, path) {
  const langs = Object.entries(ctx.site.languages || {}).filter(([code, l]) => l.published && (code === ctx.defaultLang || ctx.tr("/", code) || ctx.tr(path, code)));
  if (langs.length < 2) return "";
  const label = (c) => (ctx.site.languages[c] && ctx.site.languages[c].label) || c;
  return `<ul class="nav__langs" aria-label="${esc(ctx.ui.language || "Språk")}">` + langs.map(([code]) =>
    `<li><a href="${esc(langLink(ctx, code, path))}" hreflang="${esc(htmlLang(ctx, code))}" lang="${esc(htmlLang(ctx, code))}"${code === ctx.lang ? ' aria-current="true"' : ""}>` +
    `<img src="${flagSrc(code)}" alt="" width="22" height="15"><span>${esc(label(code))}</span></a></li>`).join("") + "</ul>";
}

// Range picture in the products panel: the baked square from the build when there is one (no blending, nothing to flash)
function menuThumb(ctx, src) {
  const info = ctx.image(src);
  if (info && info.menu) return `<img class="mega__thumb" src="/assets/img/${esc(info.name)}-menu.webp" width="48" height="48" alt="" loading="lazy" decoding="async">`;
  return imgTag(ctx, src, "", { cls: "mega__thumb", sizes: "48px" });
}

// A long word-mark (much wider than high) gets the full tile width, otherwise it shrinks to a few pixels of height
function logoIsWide(ctx, src) {
  const i = ctx.image && ctx.image(src);
  return !!(i && i.w && i.h && i.w / i.h > 7);
}

// Second level of the products dropdown: pointing at a manufacturer shows its ranges and models in a panel below the logos
function megaPanel(ctx, k, id) {
  const t = ctx.tr(k, ctx.lang) || ctx.tr(k, ctx.defaultLang) || {};
  const name = navTitleOf(ctx, k);
  const cardImg = new Map();
  for (const b of flatBlocks(t.blocks || [])) {
    if (b.type === "cards" || b.type === "modules") for (const it of b.items || []) if (it.href && it.image) cardImg.set(it.href.split(/[?#]/)[0], it.image);
  }
  // a range without a card on the brand page uses the first picture of its own page (not the small logo link)
  const ownImage = (p) => {
    const pt = ctx.tr(p, ctx.lang) || ctx.tr(p, ctx.defaultLang);
    const im = pt && flatBlocks(pt.blocks || []).find((x) => (x.type === "image" && x.src && !x.href) || (x.type === "carousel" && x.items && x.items[0]) || (x.type === "compare" && x.src));
    return im ? (im.type === "carousel" ? im.items[0].src : im.src) : null;
  };
  const LIMIT = 6;
  // A brand page can lay its panel out by hand ("menu": [{title, items: [{title, href, image}]}]): groups with a heading, one link
  // with a picture per item and no list of sub pages. Without it the panel lists the child pages and their children.
  const curated = Array.isArray(t.menu) && t.menu.length ? t.menu.map((g) =>
    (g.title ? `<p class="mega__group">${esc(g.title)}</p>` : "") + (g.items || []).map((it) => {
      const base = String(it.href || "").split(/[?#]/)[0];
      if (!/^https?:/.test(base) && !(ctx.pages.has(base) && shown(ctx, base))) return "";
      const img = it.image || cardImg.get(base) || ownImage(base);
      return `<div class="mega__cat${img ? " has-thumb" : ""}"><a class="mega__cat-title" href="${esc(localizeHref(ctx, it.href))}">` + (img ? menuThumb(ctx, img) : "") + `<span>${esc(it.title || navTitleOf(ctx, base))}</span></a></div>`;
    }).join("")).join("") : "";
  const cats = curated || ctx.children(k).filter((c) => shown(ctx, c)).map((c) => {
    const kids = ctx.children(c).filter((x) => shown(ctx, x));
    const img = cardImg.get(c) || ownImage(c);
    const lis = kids.slice(0, LIMIT).map((x) => `<li><a href="${esc(ctx.url(x))}">${esc(navTitleOf(ctx, x))}</a></li>`).join("") +
      (kids.length > LIMIT ? `<li class="mega__more"><a href="${esc(ctx.url(c))}">${esc((ctx.ui.mega_more || "Visa alla ({n})").replace("{n}", String(kids.length)))}</a></li>` : "");
    return `<div class="mega__cat${img ? " has-thumb" : ""}"><a class="mega__cat-title" href="${esc(ctx.url(c))}">` +
      (img ? menuThumb(ctx, img) : "") + `<span>${esc(navTitleOf(ctx, c))}</span></a>` + (lis ? `<ul>${lis}</ul>` : "") + "</div>";
  }).join("");
  const desc = String(t.description || "").replace(/<[^>]+>/g, "").trim();
  // one tidy sentence: the first sentence if it is short, else cut back to the last comma (or last whole word)
  // and never end on a dangling little word. Descriptions that were cut off with an ellipsis are treated the same way.
  const cut = (txt) => {
    let x = txt.replace(/(\.\.\.|…)$/, "").trim();
    const comma = Math.max(x.lastIndexOf(","), x.lastIndexOf(";"));
    if (comma > x.length * 0.45) x = x.slice(0, comma);
    x = x.replace(/(\s+(?:\S{1,3}|och|med|för|som|till|från|inom|eller|samt|and|for|with|from|that|their|which|into|para|con|del|desde|como|sobre|entre|til|fra))+$/i, "").replace(/[,;:.]$/, "");
    return x + "…";
  };
  const first = (desc.match(/^.{20,260}?[.!?](\s|$)/) || [""])[0].trim();
  let short = first || desc;
  if (/(\.\.\.|…)$/.test(short)) short = cut(short);
  else if (short.length > 260) short = cut(short.slice(0, short.lastIndexOf(" ", 240)));
  return `<section class="mega__panel${cats ? "" : " mega__panel--solo"}" id="${id}" aria-label="${esc(name)}">` +
    `<div class="mega__intro"><p class="mega__kicker">${esc(ctx.ui.mega_brand || "Tillverkare")}</p><a class="mega__name" href="${esc(ctx.url(k))}">${esc(name)}</a>` +
    `<a class="btn btn--sm mega__profile" href="${esc(ctx.url(k))}"><span>${esc((ctx.ui.mega_all || "Hela {name}").replace("{name}", name))}</span>${ICON.arrow}</a>` +
    (short ? `<p class="mega__desc">${esc(short)}</p>` : "") + "</div>" +
    (cats ? `<div class="mega__cats">${cats}</div>` : "") + "</section>";
}

function renderHeader(ctx, current) {
  const site = ctx.site;
  const navPaths = (site.nav && site.nav.length ? site.nav : []).filter((p) => ctx.pages.has(p) && shown(ctx, p));
  const items = navPaths.map((p) => {
    const kids = ctx.children(p).filter((c) => shown(ctx, c));
    const active = isUnder(current, p);
    const label = navTitleOf(ctx, p);
    const link = `<a href="${esc(ctx.url(p))}"${active && current === p ? ' aria-current="page"' : ""}>${esc(label)}</a>`;
    if (!kids.length || !(site.megaMenu !== false)) return `<li class="nav__item${active ? " is-active" : ""}">${link}</li>`;
    // dropdown = the brand logos straight away (a row that follows the mouse sideways), no section label
    const logos = brandLogoMap(ctx, p);
    const tiles = kids.map((k, n) => {
      const src = (ctx.pages.get(k) && (ctx.pages.get(k).menuLogo || ctx.pages.get(k).logo)) || logos.get(k);
      const name = navTitleOf(ctx, k);
      return `<li><a class="logorow__item" href="${esc(ctx.url(k))}" data-panel="mp-${n}" aria-describedby="mp-${n}">` +
        (src ? `<span class="logorow__img">${imgTag(ctx, src, name, { cls: logoIsWide(ctx, src) ? "logorow__logo logorow__logo--wide" : "logorow__logo", sizes: "160px" })}</span>` : "") +
        `<span class="logorow__name">${esc(name)}</span></a></li>`;
    }).join("");
    return `<li class="nav__item nav__item--mega${active ? " is-active" : ""}">${link}` +
      `<button class="nav__toggle" type="button" aria-expanded="false" aria-label="${esc(ctx.ui.submenu || "Visa undermeny")}: ${esc(label)}">${ICON.chevron}</button>` +
      `<div class="mega mega--logos"><div class="container"><ul class="logorow">${tiles}</ul></div>` +
      `<div class="mega__stage"><div class="container mega__panels">${kids.map((k, n) => megaPanel(ctx, k, `mp-${n}`)).join("")}</div></div></div></li>`;
  }).join("");
  return `<header class="site-header" data-header><div class="container site-header__inner">` +
    `<a class="logo" href="${esc(ctx.url("/"))}" aria-label="${esc(site.name)}, ${esc(ctx.ui.home || "Startsida")}"><img src="/assets/brand/logo.svg" alt="${esc(site.name)}" width="200" height="32"></a>` +
    `<nav class="nav" id="site-nav" aria-label="${esc(ctx.ui.main_nav || "Huvudmeny")}"><ul class="nav__list">${items}</ul>${renderLangRow(ctx, current)}</nav>` +
    `<div class="header-tools"><button class="icon-btn" type="button" data-search-open aria-label="${esc(ctx.ui.search || "Sök")}">${ICON.search}</button>` +
    `${renderLangSwitch(ctx, current)}` +
    `<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle__bars" aria-hidden="true"></span><span class="sr-only">${esc(ctx.ui.menu || "Meny")}</span></button></div>` +
    `</div></header>`;
}

// Section bar (the orange bar): while inside a section with a catalogue tree
// (default: /produkter) show its direct children, and the active child's children below.
function renderSubnav(ctx, current) {
  const roots = ctx.site.sectionBars || ["/produkter"];
  const root = roots.find((r) => isUnder(current, r) && ctx.pages.has(r));
  if (!root) return "";
  const avail = (p) => shown(ctx, p);
  const l1 = ctx.children(root).filter(avail);
  if (!l1.length) return "";
  const act1 = l1.find((p) => isUnder(current, p));
  const link = (p, cur, extra = "") => `<li><a class="subnav__link${cur ? " is-current" : ""}${extra}" href="${esc(ctx.url(p))}"${cur ? ' aria-current="true"' : ""}>${esc(navTitleOf(ctx, p))}</a></li>`;
  // brand logos come from the section's own listing cards (so the CMS keeps them in sync)
  const logos = brandLogoMap(ctx, root);
  const logoLink = (p, cur) => {
    const src = (ctx.pages.get(p) && ctx.pages.get(p).logo) || logos.get(p);
    const name = navTitleOf(ctx, p);
    if (!src) return link(p, cur);
    return `<li><a class="subnav__link subnav__link--logo${cur ? " is-current" : ""}" href="${esc(ctx.url(p))}"${cur ? ' aria-current="true"' : ""}>` +
      `${imgTag(ctx, src, name, { cls: "subnav__logo", sizes: "120px" })}</a></li>`;
  };
  // logos straight away (no "PRODUKTER" label); the row follows the mouse sideways (data-scrub)
  // The pinned logo strip duplicates the logo dropdown in the header; kept behind a switch (site.json: sectionBarLogos)
  const bar1 = ctx.site.sectionBarLogos !== true ? "" : `<nav class="subnav subnav--1" aria-label="${esc(navTitleOf(ctx, root))}"><div class="container"><ul data-scrub>` +
    l1.map((p) => logoLink(p, p === act1)).join("") + `</ul></div></nav>`;
  let bar2 = "";
  if (act1) {
    const l2 = ctx.children(act1).filter(avail);
    if (l2.length) {
      const act2 = l2.find((p) => isUnder(current, p));
      bar2 = `<nav class="subnav subnav--2" aria-label="${esc(navTitleOf(ctx, act1))}"><div class="container"><ul data-scrub>` +
        `<li class="subnav__root"><a class="subnav__link${current === act1 ? " is-current" : ""}" href="${esc(ctx.url(act1))}">${esc(navTitleOf(ctx, act1))}</a></li>` +
        l2.map((p) => link(p, p === act2)).join("") + `</ul></div></nav>`;
    }
  }
  return bar1 + bar2;
}

// Sticky "call us" bar for phones: visitors are often on a building site with one hand free
function renderCallBar(ctx) {
  const phones = (ctx.site.contact || {}).phones || [];
  const p = phones.find((x) => /^\s*(\+?46|0)\s*-?\s*7/.test(x.value || "")) || phones.find((x) => /mobil|mobile|móvil/i.test(x.label || "")) || phones[0];
  if (!p) return "";
  return `<div class="callbar" data-callbar><span class="callbar__fire" aria-hidden="true"><span class="callbar__flow"></span><span class="callbar__blob b1"></span><span class="callbar__blob b2"></span><span class="callbar__blob b3"></span><span class="callbar__glow"><i></i></span></span><a class="callbar__link" href="${esc(telHref(p.value))}">${ICON.phone}<span class="callbar__text">${esc(ctx.ui.call_us || "Ring oss")}</span><span class="callbar__num">${esc(phoneText(ctx, p.value))}</span></a></div>`;
}

function renderFooter(ctx) {
  const s = ctx.site;
  const c = s.contact || {};
  const avail = (p) => shown(ctx, p);
  const brands = ctx.pages.has("/produkter") ? ctx.children("/produkter").filter(avail) : [];
  const company = (s.nav || []).filter((p) => p !== "/produkter" && ctx.pages.has(p) && avail(p));
  const privacyPath = s.privacyPath && ctx.pages.has(s.privacyPath) && avail(s.privacyPath) ? s.privacyPath : null;
  const social = (s.social || []).map((x) => `<li><a class="ext" href="${esc(x.url)}" rel="noopener me" target="_blank">${esc(x.name)}${extLabel(ctx)}</a></li>`).join("");
  const analyticsOn = s.analytics && s.analytics.enabled && s.analytics.measurementId;
  const phones = (c.phones || []).map((p) => `<li>${ICON.phone}<span class="sr-only">${esc(p.label || "")}: </span><a href="${esc(telHref(p.value))}">${esc(phoneText(ctx, p.value))}</a></li>`).join("");
  return `<footer class="site-footer"><div class="container site-footer__grid">` +
    `<div class="site-footer__about"><img class="site-footer__logo" src="/assets/brand/logo-white.svg" alt="${esc(s.name)}" width="190" height="30" loading="lazy">` +
    `<p>${esc(s.legalName || s.name)}</p>${s.orgNumber ? `<p class="muted">${esc(ctx.ui.org_no || "Org.nr")} ${esc(s.orgNumber)}</p>` : ""}${s.tagline ? `<p class="muted">${esc(ctx.site.tagline)}</p>` : ""}</div>` +
    (brands.length ? `<nav aria-label="${esc(navTitleOf(ctx, "/produkter"))}"><h2 class="site-footer__h">${esc(navTitleOf(ctx, "/produkter"))}</h2><ul class="site-footer__links site-footer__links--cols">${brands.map((b) => `<li><a href="${esc(ctx.url(b))}">${esc(navTitleOf(ctx, b))}</a></li>`).join("")}</ul></nav>` : "") +
    `<nav aria-label="${esc(ctx.ui.footer_nav || "Sidfot")}"><h2 class="site-footer__h">${esc(ctx.ui.company || "Företaget")}</h2><ul class="site-footer__links">${company.map((p) => `<li><a href="${esc(ctx.url(p))}">${esc(navTitleOf(ctx, p))}</a></li>`).join("")}` +
    `${privacyPath ? `<li><a href="${esc(ctx.url(privacyPath))}">${esc(navTitleOf(ctx, privacyPath))}</a></li>` : ""}` +
    `${analyticsOn ? `<li><button type="button" class="linklike" data-consent-open>${esc(ctx.ui.cookie_settings || "Cookie-inställningar")}</button></li>` : ""}</ul></nav>` +
    `<div><h2 class="site-footer__h">${esc(ctx.ui.contact_us || "Kontakt")}</h2><ul class="site-footer__contact">` +
    `${c.email ? `<li>${ICON.mail}<a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>` : ""}${phones}</ul>` +
    `${c.address ? `<p class="muted">${esc(c.address)}</p>` : ""}${hoursText(ctx) ? `<p class="muted">${esc(ctx.ui.contact_hours || "Kontorstid")}: ${esc(hoursText(ctx))}</p>` : ""}${social ? `<ul class="site-footer__links site-footer__social">${social}</ul>` : ""}</div>` +
    `</div><div class="site-footer__legal"><div class="container"><small>© ${new Date().getFullYear()} ${esc(s.legalName || s.name)}</small></div></div></footer>`;
}

// ---------- SEO ----------
export function seoTitle(ctx, page, t) {
  const s = ctx.site;
  if (t.seoTitle) return t.seoTitle;
  if (page.path === "/") return `${s.name} | ${t.tagline || s.tagline || t.h1}`;
  const base = t.h1 || t.title;
  const segs = page.path.split("/").filter(Boolean);
  let brand = "";
  if (segs.length >= 3) {
    const bp = "/" + segs.slice(0, 2).join("/");
    const bt = ctx.tr(bp, ctx.lang) || ctx.tr(bp, ctx.defaultLang);
    if (bt) brand = bt.h1 || bt.title;
  }
  const withBrand = brand && brand !== base ? `${base} | ${brand}` : base;
  const full = `${withBrand} | ${s.name}`;
  return full.length <= 62 ? full : `${base} | ${s.name}`;
}

// Keep meta descriptions at snippet length (search engines cut at ~155-160 chars)
const clip = (s, n = 160) => (s.length <= n + 6 ? s : s.slice(0, s.lastIndexOf(" ", n - 2)).replace(/[,.;:s-]+$/, "") + "…");
function pageDescription(ctx, page, t) {
  if (t.description && t.description.trim()) return clip(t.description.trim());
  const first = flatBlocks(t.blocks).find((b) => b.type === "text");
  const txt = first ? stripTags(first.html) : t.lead || "";
  if (txt.length > 50) return txt.length > 158 ? txt.slice(0, txt.lastIndexOf(" ", 155)) + "…" : txt;
  return `${t.h1 || t.title}: ${ctx.site.tagline || ctx.site.name}`;
}

function ogImage(ctx, page, t) {
  const cand = (page.hero && page.hero.image) || (flatBlocks(t.blocks).find((b) => b.type === "image") || {}).src
    || ((t.blocks || []).flatMap((b) => (b.type === "cards" ? b.items : [])).find((i) => i.image) || {}).image;
  if (cand) {
    const info = ctx.image(cand);
    if (info && info.widths && info.widths.length) {
      const w = info.widths.find((x) => x >= 1200) || info.widths[info.widths.length - 1];
      return ctx.abs(`/assets/img/${info.name}-${w}.webp`);
    }
    return ctx.abs(cand);
  }
  return ctx.abs("/assets/brand/og-default.png");
}

function jsonLd(ctx, page, t, canonical, crumbs) {
  const s = ctx.site;
  const org = {
    "@type": "Organization",
    "@id": ctx.abs("/") + "#org",
    name: s.legalName || s.name,
    alternateName: s.name,
    url: ctx.abs("/"),
    logo: ctx.abs("/assets/brand/logo.png"),
    ...(s.contact && s.contact.email ? { email: s.contact.email } : {}),
    ...(s.contact && s.contact.phones && s.contact.phones.length ? { telephone: s.contact.phones.map((p) => telHref(p.value).replace("tel:", "")) } : {}),
    ...(s.contact && s.contact.addressDetail ? { address: { "@type": "PostalAddress", streetAddress: s.contact.addressDetail.street, postalCode: s.contact.addressDetail.postalCode, addressLocality: s.contact.addressDetail.locality, addressRegion: s.contact.addressDetail.region, addressCountry: s.contact.addressDetail.country || "SE" } } : {}),
    ...(s.contact && s.contact.hours && s.contact.hours.opens && s.contact.phones && s.contact.phones.length ? { contactPoint: { "@type": "ContactPoint", contactType: "customer service", telephone: telHref(s.contact.phones[0].value).replace("tel:", ""), ...(s.contact.email ? { email: s.contact.email } : {}), areaServed: "SE", availableLanguage: ["sv", "en"], hoursAvailable: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: s.contact.hours.opens, closes: s.contact.hours.closes } } } : {}),
    ...(s.orgNumber ? { identifier: s.orgNumber } : {}),
    ...(s.social && s.social.length ? { sameAs: s.social.map((x) => x.url) } : {})
  };
  const graph = [org];
  if (page.path === "/") {
    graph.push({ "@type": "WebSite", "@id": ctx.abs("/") + "#website", url: ctx.abs("/"), name: s.name, inLanguage: htmlLang(ctx, ctx.lang), publisher: { "@id": org["@id"] } });
  }
  const type = page.template === "contact" ? "ContactPage" : "WebPage";
  graph.push({
    "@type": type, "@id": canonical + "#webpage", url: canonical, name: seoTitle(ctx, page, t),
    description: pageDescription(ctx, page, t), inLanguage: htmlLang(ctx, ctx.lang), isPartOf: { "@id": ctx.abs("/") + "#website" },
    ...(crumbs.length > 1 ? { breadcrumb: { "@id": canonical + "#breadcrumb" } } : {}),
    primaryImageOfPage: { "@type": "ImageObject", url: ogImage(ctx, page, t) }
  });
  if (crumbs.length > 1) {
    graph.push({
      "@type": "BreadcrumbList", "@id": canonical + "#breadcrumb",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: ctx.abs(ctx.url(c.path)) }))
    });
  }
  if (page.template === "product") {
    const segs = page.path.split("/").filter(Boolean);
    const brandT = segs.length >= 2 ? (ctx.tr("/" + segs.slice(0, 2).join("/"), ctx.lang) || ctx.tr("/" + segs.slice(0, 2).join("/"), ctx.defaultLang)) : null;
    graph.push({
      "@type": "Product", "@id": canonical + "#product", name: t.h1 || t.title, description: pageDescription(ctx, page, t),
      url: canonical, image: ogImage(ctx, page, t),
      ...(brandT ? { brand: { "@type": "Brand", name: brandT.h1 || brandT.title } } : {}),
      mainEntityOfPage: { "@id": canonical + "#webpage" }
    });
  }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

// ---------- main entry ----------
// Product / brand pages: [logo | photo(s)] left, [intro text | spec list] right,
// the way the original page was laid out. The brand logo that links back to the
// brand moves into the breadcrumb row.
function composeBody(ctx, page, t) {
  // a block with "hidden": true is kept in the content but not shown on the site (the editor still shows it)
  const blocks = (ctx.edit ? t.blocks || [] : (t.blocks || []).filter((b) => !(b && b.hidden))).map((b, i) => (ctx.edit ? { ...b, __i: i } : b));
  let crumbLogo = null;
  const anc = ancestorsOf(page.path);
  const li = blocks.findIndex((b) => b.type === "image" && b.href && anc.includes(b.href));
  if (li >= 0 && li <= 1) { crumbLogo = blocks.splice(li, 1)[0]; }
  let splitHtml = "";
  const template = page.template || "page";
  if (template === "brand" || template === "product") {
    let n = 0;
    while (n < blocks.length && ["image", "carousel", "compare", "text", "list", "heading", "stat"].includes(blocks[n].type)) n++;
    // a heading that introduces what comes after the opening split (a row of tiles, a table, ...) belongs to that, not to the text column
    while (n > 0 && blocks[n - 1].type === "heading" && n < blocks.length) n--;
    const lead = blocks.slice(0, n);
    const isMedia = (b) => (b.type === "image" && !b.inline) || b.type === "carousel" || b.type === "compare";
    const media = lead.filter(isMedia);
    const text = lead.filter((b) => !isMedia(b));
    if (media.length && text.length) {
      blocks.splice(0, n);
      splitHtml = `<div class="container"><div class="split"><div class="split__media">${media.map((b) => renderBlock(ctx, b)).join("")}</div>` +
        `<div class="split__body prose">${text.map((b) => renderBlock(ctx, b)).join("\n")}</div></div></div>`;
    }
  }
  return { crumbLogo, splitHtml, rest: blocks };
}

// Closing "request a quote" band on product and brand pages (not in the editor; skipped when the page has its own cta/quote block;
// switch off with site.productQuoteCta = false). The product name travels in ?produkt= and pre-fills the form.
function productQuoteCta(ctx, page, t, name) {
  if (ctx.edit || (page.template !== "product" && page.template !== "brand") || ctx.site.productQuoteCta === false) return "";
  if (!ctx.pages.has("/offert")) return "";
  if (flatBlocks(t.blocks || []).some((b) => b.type === "cta" || b.type === "quote")) return "";
  const u = ctx.ui;
  if (page.template === "product" && t.title && t.title !== name && t.title.length <= 12) name = `${t.title}, ${name}`; // short model code + name, e.g. "ST-5, Silon"
  const href = localizeHref(ctx, "/offert") + "?produkt=" + encodeURIComponent(name);
  // the product name gets a slow orange underline when the band scrolls into view (site.js adds .is-seen): a quiet nudge, not an alarm
  const titleHtml = String(u.quote_cta_title || "Få offert på {name}").split("{name}").map(esc).join(`<span class="cta__name">${esc(name)}</span>`);
  return `<section class="cta"><div class="container cta__inner"><div class="cta__text"><h2>${titleHtml}</h2><p>${esc(u.quote_cta_text || "Berätta kort vad du behöver, så återkommer vi med pris och leveranstid.")}</p></div>` +
    `<a class="btn btn--light" href="${esc(href)}">${esc(u.quote_title || "Få offert")}${ICON.arrow}</a></div></section>`;
}

// "Product of Switzerland": only on the first page of a brand (the brand page; further down the small logo sits in this place). Quiet by default,
// it opens on hover, focus or tap with what else is known: page.origin = { country: "ch", since: 1875, more: { sv: "…", en: "…" } }
function renderOrigin(ctx, page, t) {
  const o = page.template === "brand" ? page.origin : null;
  if (!o || !o.country) return "";
  let name = ""; try { name = new Intl.DisplayNames([ctx.lang || "sv"], { type: "region" }).of(String(o.country).toUpperCase()) || ""; } catch { /* no region names */ }
  if (!name) return "";
  const years = o.since ? new Date().getFullYear() - Number(o.since) : 0;
  const more = [(o.more && (o.more[ctx.lang] || o.more[ctx.defaultLang] || o.more.en)) || "", o.since ? fmtTpl(ctx.ui.origin_since || "Since {y} ({n} years)", { y: o.since, n: years }) : ""].filter(Boolean);
  return `<div class="origin"><button type="button" class="origin__btn" aria-expanded="false"><img src="${flagSrc(o.country)}" alt="" width="20" height="14"><span class="origin__main">${esc(ctx.ui.origin_of || "Product of")} <b>${esc(name)}</b></span>${more.length ? `<span class="origin__more">${more.map((x) => "· " + esc(x)).join(" ")}</span>` : ""}</button></div>`;
}
const fmtTpl = (s, o) => String(s).replace(/\{(\w+)\}/g, (m, k) => (o[k] != null ? o[k] : m));

export function renderMain(ctx, page, t) {
  const { crumbLogo, splitHtml, rest } = composeBody(ctx, page, t);
  const crumbs = renderBreadcrumbs(ctx, page.path);
  const logo = crumbLogo
    ? `<a class="crumbs__logo" href="${esc(localizeHref(ctx, crumbLogo.href))}" style="--crumb-h:${crumbLogoHeight(ctx, crumbLogo)}px${crumbLogo.maxWidth ? `;--crumb-logo-w:${Math.round(Number(crumbLogo.maxWidth))}px` : ""}"${ctx.edit && crumbLogo.__i != null ? ` data-bk-i="${crumbLogo.__i}" data-bk-type="image"` : ""}>${imgTag(ctx, crumbLogo.src, crumbLogo.alt || "", { sizes: "120px" }).replace('loading="lazy"', 'loading="eager"')}</a>`
    : "";
  const origin = renderOrigin(ctx, page, t);
  const heroImg = page.hero && page.hero.image ? page.hero.image : null;
  const title = t.h1 || t.title;
  const isHome = page.path === "/";
  const anc = ancestorsOf(page.path).filter((p) => ctx.pages.has(p) && shown(ctx, p));
  const eyebrow = !isHome && anc.length ? `<p class="hero__eyebrow">${anc.slice(-2).map((p) => esc(navTitleOf(ctx, p))).join(" · ")}</p>` : "";
  const ctas = (t.ctas || []).map((c, i) => `<a class="btn${i ? " btn--ghost-light" : ""}" href="${esc(localizeHref(ctx, c.href))}">${esc(c.text)}${i ? "" : ICON.arrow}</a>`).join("");
  const pageFld = (k) => (ctx.edit ? ` data-bk-page="${k}" data-bk-kind="plain"` : "");
  const heroInner = `<div class="container hero__inner">${eyebrow}<h1 class="hero__title"${pageFld("h1")}>${esc(title)}</h1>${t.lead || (ctx.edit && heroImg) ? `<p class="hero__lead"${pageFld("lead")}>${esc(t.lead || "")}</p>` : ""}${ctas ? `<div class="hero__ctas">${ctas}</div>` : ""}</div>`;
  const hero = heroImg
    ? `<section class="hero${isHome ? " hero--home" : ""}">${heroImgTag(ctx, page, heroImg)}<div class="hero__shade"></div>${heroInner}${isHome && !ctx.edit ? `<a class="hero__scroll" href="#start" aria-label="${esc(ctx.ui.scroll_down || "Scrolla ner")}">${ICON.chevronDown}</a>` : ""}</section>`
    : `<section class="page-head${page.template === "about" ? " page-head--center" : ""}"><div class="container">${page.template === "about" ? "" : eyebrow}<h1${pageFld("h1")}>${esc(title)}</h1></div></section>`;
  const ownRel = flatBlocks(t.blocks || []).filter((x) => x.type === "related");
  const ownHrefs = new Set(ownRel.flatMap((x) => (x.items || []).map((i) => i && i.href)));
  ctx._relExtra = ctx.edit || !ctx.incomingRelated ? [] : ctx.incomingRelated(page.path).filter((x) => !ownHrefs.has(x.href));
  // The first pictures of the page body (what is in view when the page opens) load at once; everything further down stays lazy
  // and is fetched top to bottom in quiet time by site.js. Without a banner, the very first picture is the most important one.
  const prioritise = (h) => { let n = 0; return h.replace(/<img ([^>]*?)loading="lazy" decoding="async"/g, (m, a) => (++n <= 3 ? `<img ${a}loading="eager" decoding="async"${n === 1 && !heroImg ? ' fetchpriority="high"' : ""}` : m)); };
  ctx._pfilter = "";
  const bodyHtml = ctx.edit ? `${splitHtml}${renderBlocks(ctx, rest)}` : prioritise(`${splitHtml}${renderBlocks(ctx, rest)}`);
  const crumbRow = crumbs || logo || origin || ctx._pfilter ? `<div class="container crumbs${page.template === "about" && !heroImg ? " crumbs--center" : ""}">${crumbs}${ctx._pfilter || ""}${logo && origin ? `<div class="crumbs__brand">${logo}${origin}</div>` : `${logo}${origin}`}</div>` : "";
  const autoRel = !ownRel.length && ctx._relExtra.length ? `<div class="container">${renderRelated(ctx, { type: "related", items: [] })}</div>` : "";
  ctx._relExtra = [];
  return `${hero}${crumbRow}<div class="page-body page--${esc(page.template || "page")}"${isHome ? ' id="start"' : ""}>${bodyHtml}${autoRel}${productQuoteCta(ctx, page, t, title)}</div>`;
}

export function renderDocument(ctx, page, t, opts = {}) {
  const s = ctx.site;
  const lang = ctx.lang;
  const canonical = ctx.abs(ctx.url(page.path, lang));
  const crumbs = breadcrumbItems(ctx, page.path);
  const title = seoTitle(ctx, page, t);
  const desc = pageDescription(ctx, page, t);
  const img = ogImage(ctx, page, t);
  const robots = page.unlisted ? "noindex,nofollow,noarchive,nosnippet,noimageai" : page.published === false || t.noindex ? "noindex,nofollow" : "index,follow,max-image-preview:large,max-snippet:-1";
  const alts = Object.entries(s.languages || {}).filter(([code, l]) => l.published && ctx.tr(page.path, code));
  const alternates = alts.length > 1
    ? alts.map(([code]) => `<link rel="alternate" hreflang="${esc(htmlLang(ctx, code))}" href="${esc(ctx.abs(ctx.url(page.path, code)))}">`).join("\n") +
      `\n<link rel="alternate" hreflang="x-default" href="${esc(ctx.abs(ctx.url(page.path, ctx.defaultLang)))}">`
    : "";
  const theme = s.theme || {};
  const cssVars = `:root{--primary:${theme.primary || "#f37d03"};--dark:${theme.dark || "#231f20"};--surface:${theme.surface || "#f4f2ef"};--text:${theme.text || theme.dark || "#231f20"}}`;
  const analytics = s.analytics && s.analytics.enabled && s.analytics.measurementId
    ? { provider: s.analytics.provider || "ga4", id: s.analytics.measurementId }
    : null;
  const uiForJs = {
    title: ctx.ui.cookie_title, text: ctx.ui.cookie_text, accept: ctx.ui.cookie_accept, reject: ctx.ui.cookie_reject,
    policy: ctx.ui.cookie_policy_link, play: ctx.ui.video_play, loading: ctx.ui.video_loading,
    search: ctx.ui.search, searchPlaceholder: ctx.ui.search_placeholder, searchNone: ctx.ui.search_no_results, searchClose: ctx.ui.search_close,
    searchClear: ctx.ui.search_clear, searchNav: ctx.ui.search_nav, searchOpen: ctx.ui.search_open, searchSuppliers: ctx.ui.search_suppliers, searchBrowse: ctx.ui.search_browse,
    searchDym: ctx.ui.search_dym, searchHit: ctx.ui.search_hit, searchHits: ctx.ui.search_hits, loading: ctx.ui.video_loading
  };
  const privacyPath = s.privacyPath && ctx.pages.has(s.privacyPath) && (ctx.tr(s.privacyPath, lang) || ctx.tr(s.privacyPath, ctx.defaultLang)) ? ctx.url(s.privacyPath) : "";
  const cfg = JSON.stringify({ analytics, ui: uiForJs, privacy: privacyPath, searchIndex: ctx.searchIndexUrl ? ctx.searchIndexUrl : "/search-index.json" }).replace(/</g, "\\u003c");
  const ver = opts.assetVersion ? `?v=${opts.assetVersion}` : "";
  const hasQuote = flatBlocks(t.blocks || []).some((x) => x.type === "quote");
  return `<!doctype html>
<html lang="${esc(htmlLang(ctx, lang))}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(canonical)}">
<meta name="robots" content="${robots}">
${alternates}
<meta property="og:site_name" content="${esc(s.name)}">
<meta property="og:type" content="${page.path === "/" ? "website" : "article"}">
<meta property="og:locale" content="${esc((s.languages[lang] && s.languages[lang].locale) || lang)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(img)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="${esc(theme.dark || "#231f20")}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/montserrat-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/site.css${ver}">
<style>${cssVars}</style>
<script>document.documentElement.className="js"</script>
<script type="application/ld+json">${jsonLd(ctx, page, t, canonical, crumbs).replace(/</g, "\\u003c")}</script>
</head>
<body>
<a class="skip-link" href="#main">${esc(ctx.ui.skip || "Hoppa till innehåll")}</a>
${renderHeader(ctx, page.path)}
${renderSubnav(ctx, page.path)}
<main id="main">
${renderMain(ctx, page, t)}
</main>
${renderFooter(ctx)}
${renderCallBar(ctx)}
<script type="application/json" id="bk-config">${cfg}</script>
<script src="/js/site.js${ver}" defer></script>${hasQuote ? `<script src="/js/quote-guard.js${ver}" defer></script>` : ""}
</body>
</html>
`;
}

export function renderNotFound(ctx) {
  const t = { title: ctx.ui.not_found_title || "Sidan hittades inte", h1: ctx.ui.not_found_title || "Sidan hittades inte", blocks: [
    { type: "text", html: esc(ctx.ui.not_found_text || "Sidan du söker finns inte eller har flyttats.") },
    { type: "button", kind: "link", text: ctx.ui.back_home || "Till startsidan", href: "/" }
  ], noindex: true };
  const page = { path: "/404", template: "page", published: false, hero: null };
  return renderDocument(ctx, page, t);
}
