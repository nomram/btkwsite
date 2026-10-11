#!/usr/bin/env node
// One-off content authoring step (output is committed as page JSON):
//   1. gives download buttons meaningful titles ("Produktblad", "Broschyr", …)
//   2. adds a `datasheet` block (Swedish intro + spec tables) to product pages whose
//      real content lives in the PDF datasheet only.
// Source data: crawl/datasheets.json (tools/pdf-datasheets.mjs) + the hand-written
// Swedish texts and transcriptions below. Safe to re-run (replaces existing datasheet).
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const parsed = JSON.parse(fs.readFileSync(path.join(ROOT, "crawl/datasheets.json"), "utf8"));
const note40 = "TEI:s tekniska data förutsätter 40 % hydraulisk effektförlust.";

// ---- translation glossary for parsed label / group names ----
const LABELS = {
  "ROTATION TORQUE": "Rotationsmoment", "ROTATION FLOW": "Rotationsflöde", "ROTATION PRESSURE": "Rotationstryck",
  WEIGHT: "Vikt", SPEED: "Varvtal", "OUTPUT POWER": "Uteffekt", "HAMMER FLOW": "Hammarflöde",
  "HAMMER PRESSURE": "Hammartryck", "HAMMER FREQUENCY": "Slagfrekvens", "FLUSH SHAFT ID": "Spolaxelns innerdiameter",
  "WATER PRESSURE": "Vattentryck", "WATER FLOW": "Vattenflöde", "AIR PRESSURE": "Lufttryck", "AIR FLOW": "Luftflöde"
};
const GROUPS = { ROTATION: "Rotation", HAMMER: "Slagverk", FLUSHING: "Spolning" };
const TAGLINES = {
  "HYDRAULIC DRIFTER": "Hydraulisk topphammare", "ROTARY DRILL HEAD": "Rotationsborrhuvud"
};

// ---- Swedish intro texts (faithful translations of the datasheets) ----
const RDS = [
  "TEI Rock Drills tillverkar robusta hydrauliska rotationshuvuden som är byggda för jämn gång och enkelt underhåll vid rotationsborrning, till exempel jordspik och mikropålar.",
  "RDS-huvudena genomgår samma bänktest före leverans som våra patenterade hydrauliska topphammare. TEI är ett förstahandsval som ersättningshuvud i branschen tack vare sina överlägsna prestanda."
];
const te160 = (m, two) => [
  `${m} har vår patenterade ASA-teknik (Automatic Stroke Adjustment, automatisk slagjustering) som en del av slagverket. ASA-systemets höga frekvens och mjuka gång förlänger topphammarens livslängd, vilket ger högre produktivitet och bättre lönsamhet. ${two ? "Två effektlägen" : "Flera effektlägen"} ger exakt kontroll över slagverkets energi och frekvens.`,
  "Reversibla rotationsmotorer ger effektiv borrning och minskar risken för att borrsträngen kärvar. Den låga profilen gör det möjligt att borra intill väggar och nå in i trånga utrymmen. Den kompakta storleken och det höga effekt-till-viktförhållandet gör TEI:s borrmaskiner unika på marknaden."
];
const INTRO = {
  rds: RDS,
  "/produkter/tei/topphammare/te160": te160("TE160", true),
  "/produkter/tei/topphammare/te160ht": te160("TE160HT", true),
  "/produkter/tei/topphammare/te260": te160("TE260", false),
  "/produkter/tei/topphammare/te260ht": te160("TE260HT", true),
  "/produkter/tei/topphammare/te326": te160("TE326", true),
  "/produkter/tei/topphammare/te360": te160("TE360", true),
  "/produkter/tei/topphammare/te726": [
    "TE726 har tre effektlägen så att topphammaren klarar alla borrkrav inom sitt arbetsområde, för hål med diameter 2,0–4,0 tum (52–101 mm). ASA-funktionen (automatisk slagjustering) ger jämn gång, högre effektivitet och bästa skydd för topphammaren. Den dämpar dessutom både vid slagpunkten och vid returpunkten, vilket förlänger livslängden på tätningar och borrverktyg.",
    "Den kraftiga framändeskonstruktionen med större lager är optimal för både horisontell ortborrning och vertikal sprängborrning."
  ],
  "/produkter/tei/topphammare/te760": [
    "TE760 har tre effektlägen så att topphammaren klarar alla borrkrav inom sitt arbetsområde. ASA-funktionen (automatisk slagjustering) ger jämn gång, högre effektivitet och bästa skydd för topphammaren (längre livslängd). Funktionen ger även dämpning vid både slagpunkt och returpunkt, vilket förlänger livslängden på tätningar och borrverktyg.",
    "Den kraftiga framdelen med högre vridmoment är optimal för både långhålsborrning i front och vertikal sprängborrning."
  ],
  "/produkter/tei/topphammare/te1000": [
    "TE1000 är den största topphammaren i TEI:s sortiment, avsedd för installation av hollow bar med hål på 3–7 tum (76,2–177,8 mm) och för borrning av mikropålar i alla jordtyper. Det kraftfulla slagverket har det patenterade ASA-systemet (automatisk slagjustering) som anpassar effekten efter varierande jord- och bergförhållanden.",
    "Systemet har tre olika slagnivåer som kan ställas in manuellt eller automatiskt så att de följer borriggens matningskraft. En andra ackumulator för högtrycksslaget ger jämnare gång och dämpning.",
    "Rotationen i TE1000 använder överdimensionerade lager på radial- och axialaxlarna för att klara dagens ankarriggars tryckkrafter. Systemet har två motorer för olika vridmoment och jämnare borrning."
  ]
};

// ---- fully transcribed sheets (layouts too irregular for the parser) ----
const row = (label, metric, us) => ({ label, metric, us });
const MANUAL = {
  "/produkter/tei/borriggar/td100": {
    tagline: "Borrigg för begränsade utrymmen",
    intro: [
      "TD100 är en elektrisk/hydraulisk borrigg för begränsade utrymmen, konstruerad för att säkert installera mantlade mikropålar och stora mikropålar med hollow bar. Gummibanden kan dras ihop till 48 tum (1 219 mm) så att riggen kan köras in i svåråtkomliga borrpositioner.",
      "Den 100 hk starka motorn gör att TD100 kan driva alla topphammare och rotationshuvuden från TEI. Möjligheterna med TD100 är många."
    ],
    groups: [
      { title: "Maskin", rows: [row("Mastens dragkraft", "25 379 N", "12 000 lbf"), row("Matningstryck", "207 bar", "3000 psi"), row("Elmotor", "75 kW", "100 hp"), row("Hydraultank", "151 l", "40 gal"), row("Elmatning", "3-fas 480 V / 50 Hz", "3-fas 480 V / 60 Hz"), row("Mjukstartsgenerator", "185 kW", "185 kW"), row("Ungefärlig vikt", "5 207 kg", "11 480 lbm")] },
      { title: "TD100 med TE1000", rows: [row("Hydraulflöde", "276 lpm", "73 gpm"), row("Hydraultryck", "207 bar", "3000 psi"), row("Håldiameter", "76–178 mm", "3–7 tum"), row("Total matningslängd", "3,28 m", "129,13 tum"), row("Borrslag", "2,44 m", "96 tum"), row("Rotationsmoment", "13 605 Nm", "10 000 lbf-ft")] },
      { title: "TD100 med RDS1004", rows: [row("Hydraulflöde", "227 lpm", "60 gpm"), row("Hydraultryck", "207 bar", "3000 psi"), row("Håldiameter", "127–610 mm", "5–24 tum"), row("Total matningslängd", "3,28 m", "129,13 tum"), row("Borrslag", "2,44 m", "96 tum"), row("Rotationsmoment", "13 605 Nm", "10 000 lbf-ft")] },
      { title: "TD100 med RDS1500", rows: [row("Hydraulflöde", "227 lpm", "60 gpm"), row("Hydraultryck", "207 bar", "3000 psi"), row("Håldiameter", "127–750 mm", "5–30 tum"), row("Total matningslängd", "3,28 m", "129,13 tum"), row("Borrslag", "2,44 m", "96 tum"), row("Rotationsmoment", "20 408 Nm", "15 000 lbf-ft")] }
    ]
  },
  "/produkter/tei/borriggar/td75": {
    tagline: "Borrigg för begränsade utrymmen",
    intro: [
      "TEI tillverkar TD75, en elektriskt driven borrigg för begränsade utrymmen, konstruerad för att säkert och tyst installera mikropålar och injekteringshål. Alla modeller av TEI:s patenterade topphammare och rotationshuvuden kan kombineras med den elektriska bandborrriggen TD75.",
      "Det breda utbudet av eldrivna borrlösningar gör riggarna för begränsade utrymmen perfekta för arbete genom smala eller låga in- och utgångar, under byggnader och i tunnlar och gruvor.",
      "TEI:s elhydrauliska bandborriggar är fristående enheter som bara kräver en yttre elkälla, vilket minskar buller och avgaser och tar bort behovet av skrymmande hydraulslangar i borrområdet."
    ],
    groups: [
      { title: "Maskin", rows: [row("Mastens dragkraft", "53 379 N", "12 000 lbf"), row("Matningstryck", "207 bar", "3000 psi"), row("Elmotor", "56 kW", "75 hp"), row("Hydraultank", "151 l", "40 gal"), row("Elmatning", "3-fas 480 V / 50 Hz", "3-fas 480 V / 60 Hz"), row("Mjukstartsgenerator", "150 kW", "150 kW"), row("Ungefärlig vikt", "3 123 kg", "6 886 lbm")] },
      { title: "TD75 med TE760", rows: [row("Hydraulflöde", "197 lpm", "52 gpm"), row("Hydraultryck", "172 bar", "2500 psi"), row("Håldiameter", "52 mm", "2 tum"), row("Total matningslängd", "2,67 m", "105,13 tum"), row("Borrslag", "1,83 m", "72 tum"), row("Rotationsmoment", "4 071 Nm", "3000 lbf-ft")] },
      { title: "TD75 med RDS550", rows: [row("Hydraulflöde", "151 lpm", "40 gpm"), row("Hydraultryck", "207 bar", "3000 psi"), row("Håldiameter", "102–305 mm", "4–12 tum"), row("Total matningslängd", "2,67 m", "105,13 tum"), row("Borrslag", "1,83 m", "72 tum"), row("Rotationsmoment", "6 779 Nm", "5000 lbf-ft")] }
    ]
  },
  "/produkter/tei/borrmaster/hem": {
    tagline: "Hydraulisk grävmaskinsmonterad borrenhet",
    intro: [
      "HEM (Hydraulic Excavator Mount) är den mest populära borrenheten som tillverkas av TEI Rock Drills. Den stabila grävmaskinsbasen och den långa bommen bildar tillsammans en utmärkt borrplattform. HEM får sin hydraulkraft från grävmaskinens hammarkrets, så ingen extra hydraulinstallation krävs.",
      "TEI använder uteslutande sina patenterade hydrauliska topphammare och matningssystem i HEM. Dessa avancerade topphammare har automatisk slagjustering (ASA): när borrsträngen inte är ansluten går hammaren i viloläge, och när föraren trycker på borrsträngen ökar ASA automatiskt hammaren till full effekt. Den inbyggda swivelen tar emot luft, vatten eller injekteringsbruk för alla typer av borrning, inklusive installation av de populära hollow bar-stängerna."
    ],
    groups: ["HEM 360 med TE360", "HEM 350R med RDS350", "HEM 760 med TE760", "HEM 550R med RDS550"].map((title, i) => {
      const d = [
        [["Hydraulflöde", "136 lpm", "36 gpm"], ["Hydraultryck", "155 bar", "2250 psi"], ["Håldiameter", "35–76 mm", "1 3/8–3 tum"], ["Total längd", "4,9 m", "16 ft"], ["Borrslag", "3,6 m", "11,75 ft"], ["Dragkraft", "33 kN", "7 350 lbf"], ["Ungefärlig vikt", "1 492 kg", "3 290 lbs"], ["Minsta grävmaskin", "13 ton", "13 ton"]],
        [["Hydraulflöde", "114 lpm", "30 gpm"], ["Hydraultryck", "207 bar", "3000 psi"], ["Håldiameter", "70–203 mm", "2 3/4–8 tum"], ["Total längd", "4,9 m", "16 ft"], ["Borrslag", "3,6 m", "11,75 ft"], ["Dragkraft", "33 kN", "7 350 lbf"], ["Ungefärlig vikt", "1 440 kg", "3 175 lbs"], ["Minsta grävmaskin", "13 ton", "13 ton"]],
        [["Hydraulflöde", "178 lpm", "47 gpm"], ["Hydraultryck", "172 bar", "2500 psi"], ["Håldiameter", "52–127 mm", "2–5 tum"], ["Total längd", "4,9 m", "16 ft"], ["Borrslag", "3,6 m", "11,75 ft"], ["Dragkraft", "33 kN", "7 350 lbf"], ["Ungefärlig vikt", "1 700 kg", "3 750 lbs"], ["Minsta grävmaskin", "20 ton", "20 ton"]],
        [["Hydraulflöde", "152 lpm", "40 gpm"], ["Hydraultryck", "207 bar", "3000 psi"], ["Håldiameter", "102–305 mm", "4–12 tum"], ["Total längd", "4,9 m", "16 ft"], ["Borrslag", "3,6 m", "11,75 ft"], ["Dragkraft", "33 kN", "7 350 lbf"], ["Ungefärlig vikt", "2 177 kg", "4 800 lbs"], ["Minsta grävmaskin", "20 ton", "20 ton"]]
      ][i];
      return { title, rows: d.map((r) => row(...r)) };
    })
  },
  "/produkter/tei/borrmaster/hemh": {
    tagline: "Hydraulisk borrenhet för tunga grävmaskiner",
    intro: [
      "HEMH (Hydraulic Excavator Mount ”Heavy”) är den största och kraftfullaste av TEI:s grävmaskinsborrar. Trots sin storlek behåller HEMH fördelarna med att vara ett riktigt tillbehör som inte kräver att grävmaskinen byggs om. Konstruktionen är enkel så att utrustningen snabbt kan monteras och demonteras.",
      "HEMH får sin hydraulkraft från grävmaskinens hammarkrets och kräver ingen extra hydraulik. TEI använder egenkonstruerade och egentillverkade komponenter för jämn kvalitet i alla delar av borrsystemet. Våra rotations- och slagsystem har den kraftfulla, lätta konstruktion som vi är kända för. HEMH är byggd för att monteras på maskiner på 25–30 ton och kan konfigureras för de flesta borrmetoder."
    ],
    groups: [
      { title: "Med topphammare (TE726 / TE760 / TE1000)", rows: [row("Hydraulflöde", "178 / 197 / 269 lpm", "47 / 52 / 71 gpm"), row("Hydraultryck", "172 / 172 / 207 bar", "2500 / 2500 / 3000 psi"), row("Total matningslängd", "5,23 m", "206 tum"), row("Borrslag", "3,96 m", "13 ft"), row("Dragkraft", "53 kN", "12 000 lbf"), row("Vikt", "2 839 / 2 925 / 3 134 kg", "6260 / 6450 / 6910 lbs")] },
      { title: "Med rotationshuvud (RDS550 / RDS1004)", rows: [row("Hydraulflöde", "151 / 227 lpm", "40 / 60 gpm"), row("Hydraultryck", "207 bar", "3000 psi"), row("Total matningslängd", "5,23 m", "206 tum"), row("Borrslag", "3,96 m", "13 ft"), row("Dragkraft", "53 kN", "12 000 lbf"), row("Vikt", "2 862 / 3 040 kg", "6310 / 6704 lbs")] }
    ]
  },
  "/produkter/tei/borrmaster/mem": {
    tagline: "Grävmaskinsmonterad borrenhet, mellanklass",
    intro: [
      "MEM är den mellanstora grävmaskinsmonterade borrenheten för grävmaskiner på 12–15 ton. MEM har många av de egenskaper som finns hos den större HEM och har ett nydesignat, lättare SCF-matningssystem.",
      "MEM ingår i TEI:s familj för begränsade utrymmen och fyller en viktig plats i sortimentet av borrtillbehör. MEM är konstruerad för 300-serien av borrhuvuden och klarar både rotations- och slagborrhuvuden. MEM är ett utmärkt verktyg för installation av jordspik, förankringar, bergborrning och installation av de populära ankarna med hollow bar."
    ],
    groups: [{ title: "Specifikationer", rows: [row("Dragkraft", "11 121 N", "2500 lbf"), row("Borrslag", "3,35 m", "11 ft"), row("Vikt", "1 089 kg", "2400 lbs"), row("Spänning", "12 V eller 24 V (ange vid beställning)", "12 V or 24 V")] }]
  },
  "/produkter/tei/borrmaster/mme": {
    tagline: "Hydraulisk borrenhet för grävmaskin",
    intro: [
      "MME är en lätt borrenhet för grävmaskiner på 5–10 ton, med många av samma egenskaper som den mycket större HEM. MME använder samma matningssystem i aluminium som de manuellt bärbara borrarna.",
      "Därför betraktar många entreprenörer MME som sin ”utomhusborr” medan den bärbara borren är ”inomhusborren”. Med TEI:s patenterade topphammarteknik är MME ett utmärkt verktyg för installation av mikropålar, jordspik, förankringar, bergborrning och de populära hollow bar-stängerna."
    ],
    groups: [{ title: "Specifikationer", rows: [row("MME260 – systemflöde och tryck", "95 lpm @ 155 bar", "25 gpm @ 2250 psi"), row("MME250R – systemflöde och tryck", "69 lpm @ 172 bar", "18 gpm @ 2500 psi"), row("MME260 – håldiameter", "35–52 mm", "1,375–2,0 tum"), row("MME250R – håldiameter", "70–102 mm", "2,75–4,0 tum"), row("ACF 10 – borrlängd", "4,1 m", "13,5 ft"), row("ACF 10 – borrslag", "3,2 m", "10,5 ft"), row("ACF 10 – dragkraft", "6,5 kN", "1500 lbf"), row("Ungefärlig vikt, borrverktyg", "488 kg", "1080 lbs"), row("Minsta grävmaskin", "5 ton", "5 tons")] }]
  },
  "/produkter/tei/borrmaster/mp260": {
    tagline: "Bärbart borrsystem",
    intro: [
      "MP är en bärbar borrplattform som är konstruerad för att nå de mest svåråtkomliga platserna på arbetsplatsen. Tillsammans med TEI:s lätta komponenter av hög kvalitet blir den en kraftfull och pålitlig maskin för nästan allt arbete i begränsade utrymmen.",
      "MP-plattformen blir ett mycket mångsidigt verktyg för varje entreprenör. Möjligheten att installera hollow bar/mikropålar var som helst ger entreprenören stora möjligheter till lönsamhet. MP-borren har i många år varit en stöttepelare inom borrning i begränsade utrymmen hos TEI."
    ],
    groups: [
      { title: "Maskin", rows: [row("Dragkraft", "6 672 N", "1500 lbf"), row("Total längd", "2,57 m", "101,5 tum"), row("Borrslag", "1,67 m", "66 tum")] },
      { title: "MP med TE260HT", rows: [row("Hydraulflöde", "144 lpm", "38 gpm"), row("Hydraultryck", "155 bar", "2250 psi"), row("Håldiameter", "35–64 mm", "1 3/8–2 1/2 tum"), row("Vridmoment", "1 351 Nm", "1000 lbf-ft"), row("Uteffekt", "10 kW", "13 hp")] },
      { title: "MP med RDS250", rows: [row("Hydraulflöde", "76 lpm", "20 gpm"), row("Hydraultryck", "172 bar", "2500 psi"), row("Håldiameter", "70–102 mm", "2 3/4–4 tum"), row("Vridmoment", "1 631 Nm", "1000 lbf-ft")] }
    ]
  },
  "/produkter/tei/borrmaster/mph": {
    tagline: "Bärbart borrsystem",
    intro: [
      "MPH-systemet för bärbar borrning tar borrning i begränsade utrymmen till en ny nivå. MPH hämtade inspiration från det manuellt bärbara MP-systemet, kombinerat med den nydesignade SCF-matningen.",
      "MPH placerar sig mellan MP- och PD-systemen och ger en kraftigare matning än MP med ACF-matning, och tillåter användning av både 300-serien och 200-serien av borrhuvuden, vilket gör MPH till marknadens mest mångsidiga bärbara borrsystem."
    ],
    groups: [{ title: "Specifikationer", rows: [row("Dragkraft", "11 121 N", "2500 lbf"), row("Borrslag (SCF5)", "2 m", "6 ft"), row("Vikt", "435 kg", "960 lbs")] }]
  }
};
// shanks known from the datasheets
const SHANKS = {
  "/produkter/tei/topphammare/te760": "R32 (hona), R38, R51, T38, T45, T40, T51, T52, W38, W51, H552H, H55RH, T52RH",
  "/produkter/tei/topphammare/te726": "Rope 1.25, T38, T45"
};

// ---- helpers ----
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : e.name.endsWith(".json") && files.push(p); } })(path.join(ROOT, "content/pages"));
const clean = (s) => s.replace(/ ?\([^)]*\)/g, "").trim();

function parsedBlock(p) {
  const d = parsed[p];
  if (!d) return null;
  const key = /rotationshammare\/rds/.test(p) ? "rds" : p;
  const intro = INTRO[key];
  if (!intro) return null;
  const groups = d.groups.map((g) => ({
    title: GROUPS[g.title] || g.title,
    rows: g.rows
      .filter((r) => LABELS[r.label])
      .map((r) => {
        let metric = r.metric || "", us = r.us || "";
        if (!metric && us && /rpm$/.test(us)) metric = us; // speed is unit-less between systems
        if (/m3 - mn/.test(metric)) metric = metric.replace(/m3 - mn/, "m³/min");
        return { label: LABELS[r.label], metric, us };
      })
      .filter((r) => r.metric || r.us)
  })).filter((g) => g.rows.length);
  const out = { type: "datasheet", title: "Teknisk data", tagline: TAGLINES[d.tagline] || d.tagline, intro, groups };
  const notes = [note40];
  if (SHANKS[p]) notes.unshift(`Tillgängliga gängtyper (shanks): ${SHANKS[p]}.`);
  out.note = notes.join(" ");
  return out;
}

let docsRenamed = 0, sheets = 0;
for (const f of files) {
  const page = JSON.parse(fs.readFileSync(f, "utf8"));
  const t = page.i18n.sv;
  const depth = page.path.split("/").length - 1;
  let changed = false;

  // 1) document titles
  t.blocks.forEach((b, i) => {
    if (b.type !== "button" || b.kind !== "download") return;
    const x = b.text.trim();
    let name = null;
    if (/^(ladda ner|visa)\b.*\b(pdf|i ny flik)\b/i.test(x) || /^ladda ner \(pdf\)$/i.test(x) || /^produktblad \(pdf\)$/i.test(x)) name = depth <= 2 ? "Broschyr" : "Produktblad";
    else if (/^ladda ner broschyr/i.test(x) || /^broschyr i ny flik$/i.test(x)) name = "Broschyr";
    else if (/^visa huvudbroschyr/i.test(x)) name = "Huvudbroschyr";
    else if (/^visa i ny flik$/i.test(x)) name = "Broschyr";
    else if (/^läs mer$/i.test(x)) {
      // use the nearest short title above, else the page title
      let title = "";
      for (let k = i - 1; k >= Math.max(0, i - 4); k--) {
        const c = t.blocks[k];
        const txt = c.type === "heading" ? c.text : c.type === "text" ? c.html.replace(/<[^>]+>/g, "").trim() : "";
        if (txt && txt.length <= 40) { title = txt; break; }
        if (c.type === "cards" || c.type === "datasheet") break;
      }
      name = title ? `Broschyr ${title}` : "Broschyr";
    }
    if (name && name !== b.text) { b.text = name; docsRenamed++; changed = true; }
  });

  // 2) datasheet
  const block = MANUAL[page.path]
    ? { type: "datasheet", title: "Teknisk data", note: note40, ...MANUAL[page.path] }
    : parsedBlock(page.path);
  if (block) {
    t.blocks = t.blocks.filter((b) => b.type !== "datasheet");
    // after the leading image/text/list/heading run (the split section), before docs/cards/videos
    let n = 0;
    while (n < t.blocks.length && ["image", "text", "list", "heading"].includes(t.blocks[n].type)) n++;
    t.blocks.splice(n, 0, block);
    sheets++; changed = true;
    // richer description from the datasheet intro
    const first = block.intro[0];
    if (first && (!t.description || t.description.length < 70)) t.description = first.length <= 155 ? first : first.slice(0, first.lastIndexOf(" ", 152)) + "…";
  }
  if (changed) fs.writeFileSync(f, JSON.stringify(page, null, 2) + "\n");
}
console.log(`document titles renamed: ${docsRenamed} | datasheets added: ${sheets}`);
void clean;
