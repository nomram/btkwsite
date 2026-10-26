#!/usr/bin/env node
// Ram Board: the products of the brochure (assets-src/docs/ram-board-broschyr-svenska.pdf, 3 pages, Swedish) as pages under /produkter/ram-board.
//  - pictures are the PDF's own embedded images at their native size (no page screenshots): one main picture and three detail photos per product
//  - assets-src/img/ram-board-<slug>-main.webp, -1..-3.webp and a square tile ram-board-<slug>-tile.webp for the brand page
//  - content/pages/produkter/ram-board/<slug>.json in sv / en / es / no; the brand page gets a product tile group and the brochure button says it is Swedish
//  - the PDF's own title ("Ram Board Broschyr 2024") is shortened to "Ram Board Broschyr"
//   node tools/ramboard-build.mjs
import fs from "node:fs";
import path from "node:path";
import * as mupdf from "mupdf";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const PDF = path.join(ROOT, "assets-src/docs/ram-board-broschyr-svenska.pdf");
const IMG = path.join(ROOT, "assets-src/img");
const PAGES = path.join(ROOT, "content/pages/produkter/ram-board");
const LANGS = ["sv", "en", "es", "no"];
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// where each product sits on its page (PDF points, y from the top)
const REGION = {
  golvskydd: { page: 0, y0: 0, y1: 400 }, karmskydd: { page: 0, y0: 400, y1: 700 },
  "seam-tape": { page: 1, y0: 0, y1: 290 }, "edge-tape": { page: 1, y0: 290, y1: 550 }, "vapor-cure": { page: 1, y0: 550, y1: 830 },
  seamer: { page: 2, y0: 0, y1: 300 }, "multi-cutter": { page: 2, y0: 300, y1: 650 }
};

async function toPng(image) {
  let png = Buffer.from(image.toPixmap().asPNG());
  const mask = image.getMask && image.getMask();
  if (mask) {
    const { width, height } = await sharp(png).metadata();
    const alpha = await sharp(Buffer.from(mask.toPixmap().asPNG())).resize(width, height).extractChannel(0).raw().toBuffer();
    const rgb = await sharp(png).removeAlpha().raw().toBuffer();
    const rgba = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) { rgba[i * 4] = rgb[i * 3]; rgba[i * 4 + 1] = rgb[i * 3 + 1]; rgba[i * 4 + 2] = rgb[i * 3 + 2]; rgba[i * 4 + 3] = alpha[i]; }
    png = await sharp(rgba, { raw: { width, height, channels: 4 } }).png().toBuffer();
  }
  return png;
}

// ---------- pictures ----------
const doc = mupdf.Document.openDocument(fs.readFileSync(PDF), "application/pdf");
const found = {};
for (let pn = 0; pn < doc.countPages(); pn++) {
  const imgs = [];
  doc.loadPage(pn).toStructuredText("preserve-images").walk({ onImageBlock(b, _t, image) { imgs.push({ x: b[0], y: b[1], w: b[2] - b[0], h: b[3] - b[1], image }); } });
  for (const [slug, r] of Object.entries(REGION)) {
    if (r.page !== pn) continue;
    const mine = imgs.filter((q) => q.y >= r.y0 && q.y < r.y1 && q.w > 70 && q.h > 40 && !(q.y < 60 && q.x > 480)); // not the corner logo
    const main = mine.slice().sort((a, b) => b.w * b.h - a.w * a.h)[0];
    const rest = mine.filter((q) => q !== main && q.w * q.h < main.w * main.h * 0.6).sort((a, b) => a.x - b.x);
    found[slug] = { main, details: rest };
  }
}
const save = async (q, name, bg = "#ffffff") => {
  const png = await toPng(q.image);
  const out = await sharp(png).flatten({ background: bg }).resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true }).webp({ quality: 90 }).toBuffer({ resolveWithObject: true });
  fs.writeFileSync(path.join(IMG, name + ".webp"), out.data);
  return { src: `/assets/img/${name}.webp`, width: out.info.width, height: out.info.height };
};
const pics = {};
for (const [slug, f] of Object.entries(found)) {
  pics[slug] = { main: await save(f.main, `ram-board-${slug}-main`), details: [] };
  let n = 1;
  for (const d of f.details.slice(0, 3)) pics[slug].details.push(await save(d, `ram-board-${slug}-${n++}`));
  // square tile for the brand page: roughly square photos fill it, others are fitted on white
  const meta = pics[slug.valueOf()].main;
  const sq = Math.abs(meta.width / meta.height - 1) < 0.12;
  const buf = await sharp(path.join(IMG, `ram-board-${slug}-main.webp`)).resize(1000, 1000, sq ? { fit: "cover" } : { fit: "contain", background: "#ffffff" }).webp({ quality: 88 }).toBuffer();
  fs.writeFileSync(path.join(IMG, `ram-board-${slug}-tile.webp`), buf);
  console.log(slug.padEnd(14), "main", `${found[slug].main.image.getWidth()}x${found[slug].main.image.getHeight()}`, "details", found[slug].details.map((d) => `${d.image.getWidth()}x${d.image.getHeight()}`).join(" "));
}

// ---------- texts ----------
const L = {
  sv: { products: "Produkter", spec: "Egenskaper", broschyr: "Broschyr (pÃ¥ svenska)", broschyrNote: "Broschyren Ã¤r pÃ¥ svenska.", also: "Se Ã¤ven", contact: '<a href="/kontakta-oss">Kontakta oss</a> fÃ¶r pris, leveranstid och mer information.', photos: "Bilder", size: "MÃ¥tt", weight: "Vikt", sizes: "Storlekar" },
  en: { products: "Products", spec: "Features", broschyr: "Brochure (in Swedish)", broschyrNote: "The brochure is in Swedish.", also: "See also", contact: '<a href="/kontakta-oss">Contact us</a> for price, delivery time and more information.', photos: "Pictures", size: "Size", weight: "Weight", sizes: "Sizes" },
  es: { products: "Productos", spec: "CaracterÃ­sticas", broschyr: "Folleto (en sueco)", broschyrNote: "El folleto estÃ¡ en sueco.", also: "VÃ©ase tambiÃ©n", contact: '<a href="/kontakta-oss">ContÃ¡ctenos</a> para precio, plazo de entrega y mÃ¡s informaciÃ³n.', photos: "ImÃ¡genes", size: "Medidas", weight: "Peso", sizes: "TamaÃ±os" },
  no: { products: "Produkter", spec: "Egenskaper", broschyr: "Brosjyre (pÃ¥ svensk)", broschyrNote: "Brosjyren er pÃ¥ svensk.", also: "Se ogsÃ¥", contact: '<a href="/kontakta-oss">Kontakt oss</a> for pris, leveringstid og mer informasjon.', photos: "Bilder", size: "MÃ¥l", weight: "Vekt", sizes: "StÃ¸rrelser" }
};
const P = {
  golvskydd: { order: 0, title: { sv: "Golvskydd", en: "Floor protection", es: "ProtecciÃ³n de suelos", no: "Gulvbeskyttelse" },
    size: { sv: "1 mm x 965 mm x 30,48 m (29,4 mÂ²)", en: "1 mm x 965 mm x 30.48 m (29.4 mÂ²)", es: "1 mm x 965 mm x 30,48 m (29,4 mÂ²)", no: "1 mm x 965 mm x 30,48 m (29,4 mÂ²)" }, weight: "22 kg",
    intro: { sv: "Golvskydd frÃ¥n Ram Board pÃ¥ rulle, gjort av 100 % Ã¥tervunnet material och tillverkat fÃ¶r Ã¥teranvÃ¤ndning.", en: "Ram Board floor protection on a roll, made of 100 % recycled material and designed to be reused.", es: "ProtecciÃ³n de suelos Ram Board en rollo, de material 100 % reciclado y pensada para reutilizarse.", no: "Gulvbeskyttelse fra Ram Board pÃ¥ rull, laget av 100 % resirkulert materiale og laget for gjenbruk." },
    feats: { sv: ["Ã…teranvÃ¤ndbar", "DiffusionsÃ¶ppen", "Vikbar", "Vatten- och smutsavvisande", "TrucktÃ¥lig", "100 % Ã¥tervunnet material"], en: ["Reusable", "Breathable (vapour permeable)", "Foldable", "Water and dirt repellent", "Forklift-proof", "100 % recycled material"], es: ["Reutilizable", "Permeable al vapor", "Plegable", "Repele el agua y la suciedad", "Resistente a carretillas", "100 % material reciclado"], no: ["Gjenbrukbar", "DiffusjonsÃ¥pen", "Foldbar", "Vann- og smussavvisende", "TrucktÃ¥lig", "100 % resirkulert materiale"] } },
  karmskydd: { order: 1, title: { sv: "Karmskydd", en: "Door frame protection", es: "ProtecciÃ³n de marcos", no: "Karmbeskyttelse" },
    size: { sv: "1,65 m x 0,91 m och 1,65 m x 1,52 m", en: "1.65 m x 0.91 m and 1.65 m x 1.52 m", es: "1,65 m x 0,91 m y 1,65 m x 1,52 m", no: "1,65 m x 0,91 m og 1,65 m x 1,52 m" },
    intro: { sv: "Karmskydd frÃ¥n Ram Board i Ã¥tervunnet material, Ã¥teranvÃ¤ndbart och kraftigt.", en: "Ram Board door frame protection in recycled material: strong and reusable.", es: "ProtecciÃ³n de marcos Ram Board en material reciclado: resistente y reutilizable.", no: "Karmbeskyttelse fra Ram Board i resirkulert materiale: kraftig og gjenbrukbar." },
    feats: { sv: ["102 mm - 228 mm karmbredd", "Kraftig", "Ã…teranvÃ¤ndbar", "Ã…tervunnet material"], en: ["102 mm - 228 mm frame width", "Strong", "Reusable", "Recycled material"], es: ["Ancho de marco de 102 mm a 228 mm", "Resistente", "Reutilizable", "Material reciclado"], no: ["102 mm - 228 mm karmbredde", "Kraftig", "Gjenbrukbar", "Resirkulert materiale"] } },
  "seam-tape": { order: 2, title: { sv: "Seam tape", en: "Seam tape", es: "Seam tape", no: "Seam tape" },
    size: { sv: "72 mm x 50 m", en: "72 mm x 50 m", es: "72 mm x 50 m", no: "72 mm x 50 m" }, weight: "0,4 kg",
    intro: { sv: "Skarvtejp fÃ¶r Ram Board golvskydd.", en: "Seam tape for Ram Board floor protection.", es: "Cinta para uniones del protector de suelos Ram Board.", no: "SkjÃ¸tetape for Ram Board gulvbeskyttelse." },
    feats: { sv: ["Skarvtejp", "TÃ¥lig", "Vattenavvisande"], en: ["Seam tape", "Durable", "Water repellent"], es: ["Cinta para uniones", "Resistente", "Repele el agua"], no: ["SkjÃ¸tetape", "Slitesterk", "Vannavvisende"] },
    note: { sv: "OBS! Skall inte tejpas direkt pÃ¥ golvet.", en: "Note: do not tape directly onto the floor.", es: "AtenciÃ³n: no pegar directamente sobre el suelo.", no: "Obs! Skal ikke teipes direkte pÃ¥ gulvet." } },
  "edge-tape": { order: 3, title: { sv: "Edge Tape 90-day", en: "Edge Tape 90-day", es: "Edge Tape 90-day", no: "Edge Tape 90-day" },
    size: { sv: "50 mm x 25 m", en: "50 mm x 25 m", es: "50 mm x 25 m", no: "50 mm x 25 m" }, weight: "0,45 kg",
    intro: { sv: "Golv- och kanttejp som kan sitta i upp till 90 dagar utan att lÃ¤mna mÃ¤rken.", en: "Floor and edge tape that can stay on for up to 90 days without leaving marks.", es: "Cinta para suelos y bordes que puede dejarse hasta 90 dÃ­as sin dejar marcas.", no: "Gulv- og kanttape som kan sitte i opptil 90 dager uten Ã¥ sette merker." },
    feats: { sv: ["Kanttejp", "MÃ¤rkfri i upp till 90 dagar", "Golv och kanttejp"], en: ["Edge tape", "Mark-free for up to 90 days", "Floor and edge tape"], es: ["Cinta de borde", "Sin marcas hasta 90 dÃ­as", "Cinta para suelo y bordes"], no: ["Kanttape", "Merkefri i opptil 90 dager", "Gulv- og kanttape"] } },
  "vapor-cure": { order: 4, title: { sv: "Vapor-Cure", en: "Vapor-Cure", es: "Vapor-Cure", no: "Vapor-Cure" },
    size: { sv: "76 mm x 50 m", en: "76 mm x 50 m", es: "76 mm x 50 m", no: "76 mm x 50 m" }, weight: "0,35 kg",
    intro: { sv: "DiffusionsÃ¶ppen skarvtejp fÃ¶r Ram Board golvskydd.", en: "Breathable (vapour permeable) seam tape for Ram Board floor protection.", es: "Cinta para uniones permeable al vapor para el protector de suelos Ram Board.", no: "DiffusjonsÃ¥pen skjÃ¸tetape for Ram Board gulvbeskyttelse." },
    feats: { sv: ["Skarvtejp", "TÃ¥lig", "DiffusionsÃ¶ppen"], en: ["Seam tape", "Durable", "Breathable (vapour permeable)"], es: ["Cinta para uniones", "Resistente", "Permeable al vapor"], no: ["SkjÃ¸tetape", "Slitesterk", "DiffusjonsÃ¥pen"] },
    note: { sv: "OBS! Skall inte tejpas direkt pÃ¥ golvet.", en: "Note: do not tape directly onto the floor.", es: "AtenciÃ³n: no pegar directamente sobre el suelo.", no: "Obs! Skal ikke teipes direkte pÃ¥ gulvet." } },
  seamer: { order: 5, title: { sv: "Seamer", en: "Seamer", es: "Seamer", no: "Seamer" },
    size: { sv: "116 Ã— 20 Ã— 15 cm", en: "116 Ã— 20 Ã— 15 cm", es: "116 Ã— 20 Ã— 15 cm", no: "116 Ã— 20 Ã— 15 cm" }, weight: "4,5 kg",
    intro: { sv: "Skarvrullare fÃ¶r att lÃ¤gga tejp pÃ¥ skarvarna i golvskyddet.", en: "Seam roller for applying tape to the seams of the floor protection.", es: "Rodillo para colocar la cinta en las uniones del protector de suelos.", no: "SkjÃ¸terulle for Ã¥ legge tape pÃ¥ skjÃ¸tene i gulvbeskyttelsen." },
    feats: { sv: ["Skarvrullare", "60 % snabbare installation"], en: ["Seam roller", "60 % faster installation"], es: ["Rodillo para uniones", "InstalaciÃ³n un 60 % mÃ¡s rÃ¡pida"], no: ["SkjÃ¸terulle", "60 % raskere montering"] } },
  "multi-cutter": { order: 6, title: { sv: "Multi Cutter", en: "Multi Cutter", es: "Multi Cutter", no: "Multi Cutter" },
    size: { sv: "23 Ã— 6 Ã— 3 cm", en: "23 Ã— 6 Ã— 3 cm", es: "23 Ã— 6 Ã— 3 cm", no: "23 Ã— 6 Ã— 3 cm" }, weight: "0,2 kg",
    intro: { sv: "Multikniv fÃ¶r att skÃ¤ra golvskyddet utan att skada golvet under.", en: "Multi knife for cutting the floor protection without damaging the floor underneath.", es: "Cuchilla multiuso para cortar el protector sin daÃ±ar el suelo.", no: "Multikniv for Ã¥ skjÃ¦re gulvbeskyttelsen uten Ã¥ skade gulvet under." },
    feats: { sv: ["Multikniv", "SkÃ¤r utan att skada golvet"], en: ["Multi knife", "Cuts without damaging the floor"], es: ["Cuchilla multiuso", "Corta sin daÃ±ar el suelo"], no: ["Multikniv", "SkjÃ¦rer uten Ã¥ skade gulvet"] } }
};

const crumbLogo = { type: "image", alt: "Ram Board", href: "/produkter/ram-board", width: 250, height: 103, src: "/assets/img/ram-board-1.webp", maxWidth: 300 };
const date = new Date().toISOString().slice(0, 10);
const slugs = Object.keys(P);
for (const slug of slugs) {
  const p = P[slug], pic = pics[slug];
  const i18n = {};
  for (const l of LANGS) {
    const T = L[l];
    const specs = [`${p.weight ? T.size : T.sizes}: ${p.size[l]}`, ...(p.weight ? [`${T.weight}: ${p.weight.replace(",", l === "en" ? "." : ",")}`] : []), ...p.feats[l]].map(esc);
    const blocks = [
      { ...crumbLogo },
      { type: "image", alt: `Ram Board ${p.title[l]}`, ...pic.main, src: pic.main.src },
      { type: "text", html: esc(p.intro[l]) },
      { type: "list", ordered: false, items: specs },
      ...(p.note ? [{ type: "text", html: `<strong>${esc(p.note[l])}</strong>` }] : []),
      ...(pic.details.length ? [{ type: "carousel", autoplay: false, items: pic.details.map((d, i) => ({ src: d.src, alt: `Ram Board ${p.title[l]}, ${T.photos.toLowerCase()} ${i + 1}`, width: d.width, height: d.height })) }] : []),
      { type: "button", kind: "download", text: T.broschyr, href: "/assets/docs/ram-board-broschyr-svenska.pdf" },
      { type: "text", html: T.contact },
      { type: "related", title: T.also, items: slugs.filter((s) => s !== slug).slice(0, 3).map((s) => ({ href: `/produkter/ram-board/${s}` })) }
    ];
    i18n[l] = { title: p.title[l], h1: `Ram Board ${p.title[l]}`, description: `${p.intro[l]} ${p.size[l]}. ${p.feats[l].join(", ")}.`.slice(0, 200), blocks };
  }
  const file = path.join(PAGES, slug + ".json");
  fs.mkdirSync(PAGES, { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ path: `/produkter/ram-board/${slug}`, updated: date, template: "product", order: p.order, published: true, i18n }, null, 2) + "\n");
}

// ---------- the brand page: product tiles, the brochure is Swedish ----------
{
  const f = path.join(ROOT, "content/pages/produkter/ram-board.json");
  const raw = fs.readFileSync(f, "utf8"); const eol = raw.includes("\r\n") ? "\r\n" : "\n"; const j = JSON.parse(raw);
  for (const l of LANGS) {
    const T = L[l];
    if (!j.i18n[l]) continue;
    const bl = j.i18n[l].blocks.filter((b) => !b.gen);
    const btn = bl.find((b) => b.type === "button" && /ram-board-broschyr/.test(b.href || ""));
    if (btn) btn.text = T.broschyr;
    const items = slugs.map((s) => ({ title: P[s].title[l], image: `/assets/img/ram-board-${s}-tile.webp`, alt: P[s].title[l], href: `/produkter/ram-board/${s}`, width: 1000, height: 1000 }));
    const at = bl.findIndex((b) => b.type === "button");
    bl.splice(at + 1, 0, { type: "heading", level: 2, text: T.products, gen: true }, { type: "modules", layout: "tiles", columns: 4, square: true, more: false, items, gen: true });
    j.i18n[l].blocks = bl;
  }
  fs.writeFileSync(f, JSON.stringify(j, null, 2).replace(/\n/g, eol) + eol);
}

// ---------- the PDF's own title without the year ----------
{
  const pdf = mupdf.Document.openDocument(fs.readFileSync(PDF), "application/pdf");
  const title = pdf.getMetaData("info:Title") || "";
  if (/2024/.test(title)) {
    pdf.setMetaData("info:Title", title.replace(/\s*2024\s*/g, " ").trim());
    fs.writeFileSync(PDF, Buffer.from(pdf.saveToBuffer("garbage=compact").asUint8Array()));
    console.log("PDF title:", title, "->", title.replace(/\s*2024\s*/g, " ").trim());
  }
}
console.log("Ram Board pages built:", slugs.length);
