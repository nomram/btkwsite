// Data and texts for tools/marini-quarry.mjs (Marini quarry line: wire saws and quarry drill rigs).
// Figures come from Marini's "Catalogo Prodotti Quarry" (2025) and the brochures of the models; written Swedish style
// ("1 300", "0,5") and localised by the generator. Metric units only.

// ---------- wire saws (children of /produkter/marini/vajersågar) ----------
// img.main: [pdf, page, image no.] of the picture shown first, or "draw" for the line drawing of the catalogue
export const SAWS = [
  { slug: "mini-fil-electronic", name: "Mini Fil Electronic", group: "granite", motors: ["11", "15", "18"], len: "1 300", wid: "900", hei: "1 000", weights: ["800", "820", "850"], speed: "0 - 33", fly: "420/550", rails: { kg: "49", gauge: "800" }, rot: "manualOrElectric", trans: "none", ctrl: "wired", draw: "mini-fil",
    versions: [["Mini Fil Electronic", "manual", "none"], ["Mini Fil Electronic R 360°", "electric", "none"]], main: ["saw", 3, 1] },
  { slug: "mini-fil-super-electronic", name: "Mini Fil Super Electronic", group: "granite", motors: ["11", "15", "18"], len: "1 300", wid: "900", hei: "1 000", weights: ["900", "920", "950"], speed: null, fly: "420/550", rails: { kg: "49", gauge: "800" }, rot: "manualOrElectric", trans: "manualOrElectric", ctrl: "wired", draw: "mini-fil-super",
    versions: [["Mini Fil Super Electronic", "manual", "manual"], ["Mini Fil Super Electronic R 360°", "electric", "manual"], ["Mini Fil Super Electronic R 360° T", "electric", "electric"]], main: ["saw", 3, 1] },
  { slug: "gran-fil-electronic", name: "Gran Fil Electronic", group: "granite", motors: ["37", "45"], len: "2 100", wid: "1 350", hei: "1 500", weights: ["1 620", "1 700"], speed: "0 - 40", fly: "820", rails: { kg: "55/59" }, rot: "manualOrElectric", trans: "manualOrElectric", ctrl: "wiredOptRemote", draw: "gran-fil",
    versions: [["Gran Fil Electronic", "manual", "manual"], ["Gran Fil Electronic R 360°", "electric", "manual"], ["Gran Fil Electronic Standard", "electric", "electric"]], main: ["saw", 4, 1] },
  { slug: "gran-fil-super-electronic", name: "Gran Fil Super Electronic", group: "granite", motors: ["45", "55"], len: "2 200", wid: "1 450", hei: "1 550", weights: ["1 860", "1 900"], speed: "0 - 40", fly: "820/960", rails: { kg: "55/59" }, rot: "electric", trans: "electric", ctrl: "wiredOptRemote", draw: "gran-fil-super",
    versions: [["Gran Fil Super Electronic", "electric", "electric"]], main: ["saw", 5, 1], video: { id: "SGpf3tV2n1c", title: "Marini Quarries Group - Gran Fil Super Electronic 75 Hp" } },
  { slug: "gran-fil-super-electronic-sp", name: "Gran Fil Super Electronic SP", group: "granite", motors: ["55", "75"], len: "2 300", wid: "1 500", hei: "1 550", weights: ["2 200", "2 400"], speed: "0 - 40", fly: "820/960", rails: { kg: "55/59" }, rot: "electric", trans: "electric", ctrl: "wiredOptRemote", draw: "sp",
    versions: [["Gran Fil Super Electronic SP", "electric", "electric"]], main: ["saw", 6, 1] },
  { slug: "min-fil", name: "Min Fil", group: "marble", motors: ["11", "15", "18"], len: "1 300", wid: "900", hei: "1 000", weights: ["700", "720", "750"], speed: "38", rot: "manual", trans: "none", ctrl: "wired", draw: "mini-fil" },
  { slug: "min-fil-super", name: "Min Fil Super", group: "marble", motors: ["11", "15", "18"], len: "1 300", wid: "900", hei: "1 000", weights: ["800", "820", "850"], speed: "38", rot: "optElectric", trans: "optElectric", ctrl: "wired", draw: "mini-fil-super" },
  { slug: "mar-fil", name: "Mar Fil", group: "marble", motors: ["37", "45"], len: "2 100", wid: "1 350", hei: "1 500", weights: ["1 480", "1 560"], speed: "38", rot: "electric", trans: "electric", ctrl: "wired", draw: "gran-fil" },
  { slug: "mar-fil-super", name: "Mar Fil Super", group: "marble", motors: ["45", "55"], len: "2 200", wid: "1 450", hei: "1 550", weights: ["1 760", "1 820"], speed: "38", rot: "electric", trans: "electric", ctrl: "wired", draw: "gran-fil-super" },
  { slug: "mar-fil-super-sp", name: "Mar Fil Super SP", group: "marble", motors: ["55", "75"], len: "2 300", wid: "1 500", hei: "1 550", weights: ["2 100", "2 300"], speed: "38", rot: "electric", trans: "electric", ctrl: "wired", draw: "sp" },
  { slug: "mini-mobil-fil", name: "Mini Mobil Fil", group: "mobile", motors: ["17"], lenClosed: "3 100", lenOpen: "8 400", wid: "2 000", heiClosed: "3 900", heiOpen: "1 420", weights: ["1 650"], draw: "mini-mobil-fil" },
  { slug: "mobil-fil", name: "Mobil Fil", group: "mobile", motors: ["33"], lenClosed: "4 500", lenOpen: "9 000", wid: "2 500", heiClosed: "3 200", heiOpen: "1 800", weights: ["5 900"], draw: "mobil-fil", main: ["saw", 7, 1] }
];

// ---------- quarry drill rigs (children of /produkter/marini/stenbrottsborrning) ----------
export const DRILLS = [
  { slug: "voyager", name: "Voyager", kind: "hydraulic" },
  { slug: "big-driller", name: "Big Driller", kind: "hydraulic" },
  { slug: "driller-id", name: "Driller ID", kind: "hydraulic" },
  { slug: "hor-drill-id", name: "Hor Drill ID", kind: "hydraulic" },
  { slug: "driller", name: "Driller", kind: "pneumatic" },
  { slug: "hor-drill", name: "Hor Drill", kind: "pneumatic" }
];

export const LANGS = ["sv", "en", "es", "no"];

// ---------- texts ----------
export const TX = {
  sv: {
    data: "Teknisk data", spec: "Specifikationer", versionsT: "Utföranden", drawings: "Ritningar", side: "Sidovy", sideHint: "Håll muspekaren över ritningen (eller tryck och dra) för 2× förstoring.", up: "Se även", models: "Modeller", all: "Alla modeller",
    contact: '<a href="/kontakta-oss">Kontakta oss</a> för pris, leveranstid eller hjälp att välja rätt modell.',
    source: "Uppgifterna är hämtade ur Marinis produktkatalog för stenbrott och broschyrer (engelska).",
    note: "Motorer och vikter anges i samma ordning.",
    docCat: "Produktkatalog stenbrott (ENG)", docSaw: "Broschyr vajersågar för granit (ENG)", docModel: (n) => `Broschyr ${n} (ENG)`,
    groups: { granite: "Granit: variabel trådhastighet", marble: "Marmor: fast trådhastighet", mobile: "Mobila plattformar" },
    sawFamily: "Vajersågar", drillFamily: "Borriggar för stenbrott",
    manual: "Manuell", electric: "Elektrisk", optElectric: "Elektrisk (tillval)", manualOrElectric: "Manuell eller elektrisk", none: "Ingen", wired: "Via kabel", wiredOptRemote: "Via kabel (fjärrkontroll som tillval)",
    closed: "stängd", open: "utfälld",
    lab: { motor: "Huvudmotor (el)", engine: "Motor", len: "Längd", wid: "Bredd", hei: "Höjd", weight: "Vikt", rot: "Rotation av svänghjulsgrupp (360°)", trans: "Förflyttning av svänghjul", ctrl: "Styrning", speed: "Trådhastighet", fly: "Svänghjul", rails: "Skenor", model: "Modell" },
    key: { motor: "Huvudmotor", weight: "Vikt", speed: "Trådhastighet", engine: "Motor", len: "Längd", wid: "Bredd" },
    sawIntro: { granite: (n, m, w, v) => `${n} är en vajersåg ur Marinis granitserie med variabel trådhastighet${v ? ` (${v} m/s)` : ""} som styrs av frekvensomriktare. Huvudmotor ${m} kW, vikt ${w} kg.`, marble: (n, m, w) => `${n} är en vajersåg ur Marinis marmorserie med fast trådhastighet (38 m/s). Huvudmotor ${m} kW, vikt ${w} kg.`, mobile: (n, m, w) => `${n} är en mobil plattform för Marinis vajersågar, med motor ${m} kW och vikt ${w} kg.` },
    sawBody: {
      granite: "Maskinen positioneras snabbt på skenor och håller diamantvajern jämnt och noggrant spänd under sågningen. Svänghjulsgruppen kan vridas 360° och förflyttas med elmotorer (beroende på utförande), så att sågen snabbt riktas in och parallella snitt kan göras utan att skenorna flyttas. Den kan såga på lutande ytor i alla riktningar och i plan med brottbotten. Den lätta manöverpanelen kan placeras på säkert avstånd från sågen.",
      marble: "Marmorserien saknar frekvensomriktare och arbetar med fast trådhastighet. Start sker med stjärn-triangelkoppling och maskinen styrs från en kabelansluten tryckknappspanel, vilket ger enkel och säker användning samt jämn och tillförlitlig skärprestanda.",
      mobile: "Plattformen gör att vajersågen kan flyttas i stenbrottet och ställas upp för nästa snitt. Längd och höjd anges med plattformen stängd (hopfälld) och utfälld (öppen)."
    },
    drillFamilyIntro: "Marinis borrenheter för stenbrott används för att borra de hål som diamantvajern ska passera, för kärnborrning och för stora hål till så kallade blinda snitt. Det finns hydrauliska modeller med hydrauliskt rotationshuvud (Voyager, Big Driller, Driller ID, Hor Drill ID) och pneumatiska modeller med tryckluftsdrivet rotationshuvud (Driller, Hor Drill).",
    hyd: "Hydrauliska", pneu: "Pneumatiska", hydraulic: "Hydraulisk", pneumatic: "Pneumatisk",
    tbl: { model: "Modell", type: "Drift", stroke: "Mastens slaglängd", head: "Rotationshuvud", torque: "Vridmoment", rpm: "Varvtal", weight: "Vikt" },
    tblNote: "Tryckluftsbehovet för Driller och Hor Drill är cirka 8 m³/min.",
    drillSpec: { groupBase: "Grundenhet" }
  },
  en: {
    data: "Technical data", spec: "Specifications", versionsT: "Versions", drawings: "Drawings", side: "Side view", sideHint: "Hover over the drawing (or touch and drag) for a 2× magnifier.", up: "See also", models: "Models", all: "All models",
    contact: '<a href="/kontakta-oss">Contact us</a> for price, delivery time or help choosing the right model.',
    source: "Information taken from Marini's quarry product catalogue and the model brochures.",
    note: "Motors and weights are listed in the same order.",
    docCat: "Quarry product catalogue (ENG)", docSaw: "Granite wire saws brochure (ENG)", docModel: (n) => `${n} brochure (ENG)`,
    groups: { granite: "Granite: variable wire speed", marble: "Marble: fixed wire speed", mobile: "Mobile platforms" },
    sawFamily: "Wire saws", drillFamily: "Quarry drill rigs",
    manual: "Manual", electric: "Electric", optElectric: "Electric (option)", manualOrElectric: "Manual or electric", none: "None", wired: "Wired", wiredOptRemote: "Wired (remote control optional)",
    closed: "closed", open: "open",
    lab: { motor: "Main motor (electric)", engine: "Engine", len: "Length", wid: "Width", hei: "Height", weight: "Weight", rot: "Flywheel group rotation (360°)", trans: "Flywheel translation", ctrl: "Control", speed: "Wire speed", fly: "Flywheel", rails: "Rails", model: "Model" },
    key: { motor: "Main motor", weight: "Weight", speed: "Wire speed", engine: "Engine", len: "Length", wid: "Width" },
    sawIntro: { granite: (n, m, w, v) => `${n} is a diamond wire saw from Marini's granite line with variable wire speed${v ? ` (${v} m/s)` : ""} controlled by an inverter. Main motor ${m} kW, weight ${w} kg.`, marble: (n, m, w) => `${n} is a diamond wire saw from Marini's marble line with a fixed wire speed (38 m/s). Main motor ${m} kW, weight ${w} kg.`, mobile: (n, m, w) => `${n} is a mobile platform for Marini's wire saws, with a ${m} kW engine and a weight of ${w} kg.` },
    sawBody: {
      granite: "The machine positions quickly on its rails and keeps the diamond wire evenly and accurately tensioned during the cut. The flywheel group can rotate 360° and move on electric motors (depending on version), so the saw is aligned quickly and parallel cuts can be made without moving the rails. It can cut on inclined surfaces in any direction and flush with the quarry floor. The light control panel can be placed at a safe distance from the saw.",
      marble: "The marble line has no inverter and works at a fixed wire speed. It starts with a star-delta system and is operated from a wired push-button panel, which gives simple, safe use and consistent, reliable cutting.",
      mobile: "The platform lets the wire saw be moved around the quarry and set up for the next cut. Length and height are given with the platform closed (folded) and open (unfolded)."
    },
    drillFamilyIntro: "Marini's quarry drilling units are used to drill the holes the diamond wire passes through, for core drilling and for large holes for so-called blind cuts. There are hydraulic models with a hydraulic rotary head (Voyager, Big Driller, Driller ID, Hor Drill ID) and pneumatic models with an air-driven rotary head (Driller, Hor Drill).",
    hyd: "Hydraulic", pneu: "Pneumatic", hydraulic: "Hydraulic", pneumatic: "Pneumatic",
    tbl: { model: "Model", type: "Drive", stroke: "Mast stroke", head: "Rotary head", torque: "Rotary torque", rpm: "Rotary speed", weight: "Weight" },
    tblNote: "The compressed-air demand of Driller and Hor Drill is about 8 m³/min.",
    drillSpec: { groupBase: "Base unit" }
  },
  es: {
    data: "Datos técnicos", spec: "Especificaciones", versionsT: "Versiones", drawings: "Planos", side: "Vista lateral", sideHint: "Pase el cursor sobre el plano (o toque y arrastre) para una lupa 2×.", up: "Véase también", models: "Modelos", all: "Todos los modelos",
    contact: '<a href="/kontakta-oss">Contáctenos</a> para precio, plazo de entrega o ayuda para elegir el modelo adecuado.',
    source: "Información tomada del catálogo de productos para canteras de Marini y de los folletos de los modelos.",
    note: "Los motores y los pesos se indican en el mismo orden.",
    docCat: "Catálogo de productos para canteras (ENG)", docSaw: "Folleto sierras de hilo para granito (ENG)", docModel: (n) => `Folleto ${n} (ENG)`,
    groups: { granite: "Granito: velocidad de hilo variable", marble: "Mármol: velocidad de hilo fija", mobile: "Plataformas móviles" },
    sawFamily: "Sierras de hilo", drillFamily: "Perforadoras para canteras",
    manual: "Manual", electric: "Eléctrica", optElectric: "Eléctrica (opcional)", manualOrElectric: "Manual o eléctrica", none: "Ninguna", wired: "Con cable", wiredOptRemote: "Con cable (radiomando opcional)",
    closed: "cerrada", open: "abierta",
    lab: { motor: "Motor principal (eléctrico)", engine: "Motor", len: "Longitud", wid: "Anchura", hei: "Altura", weight: "Peso", rot: "Rotación del grupo del volante (360°)", trans: "Traslación del volante", ctrl: "Mando", speed: "Velocidad del hilo", fly: "Volante", rails: "Carriles", model: "Modelo" },
    key: { motor: "Motor principal", weight: "Peso", speed: "Velocidad del hilo", engine: "Motor", len: "Longitud", wid: "Anchura" },
    sawIntro: { granite: (n, m, w, v) => `${n} es una sierra de hilo diamantado de la línea de granito de Marini, con velocidad de hilo variable${v ? ` (${v} m/s)` : ""} controlada por inversor. Motor principal de ${m} kW y un peso de ${w} kg.`, marble: (n, m, w) => `${n} es una sierra de hilo diamantado de la línea de mármol de Marini, con velocidad de hilo fija (38 m/s). Motor principal de ${m} kW y un peso de ${w} kg.`, mobile: (n, m, w) => `${n} es una plataforma móvil para las sierras de hilo de Marini, con un motor de ${m} kW y un peso de ${w} kg.` },
    sawBody: {
      granite: "La máquina se posiciona con rapidez sobre los carriles y mantiene el hilo diamantado tensado de forma uniforme y precisa durante el corte. El grupo del volante puede girar 360° y desplazarse con motores eléctricos (según la versión), de modo que la sierra se alinea con rapidez y se pueden hacer cortes paralelos sin mover los carriles. Puede cortar sobre superficies inclinadas en cualquier dirección y a ras del suelo de la cantera. El panel de mando, ligero, puede colocarse a una distancia segura de la sierra.",
      marble: "La línea para mármol no lleva inversor y trabaja a velocidad de hilo fija. El arranque es estrella-triángulo y el manejo se hace desde una botonera con cable, lo que ofrece un uso sencillo y seguro y un corte constante y fiable.",
      mobile: "La plataforma permite trasladar la sierra de hilo por la cantera y prepararla para el siguiente corte. La longitud y la altura se indican con la plataforma cerrada (plegada) y abierta (desplegada)."
    },
    drillFamilyIntro: "Las unidades de perforación para canteras de Marini se utilizan para perforar los barrenos por los que pasa el hilo diamantado, para sondeos con corona y para barrenos grandes destinados a los llamados cortes ciegos. Hay modelos hidráulicos con cabezal de rotación hidráulico (Voyager, Big Driller, Driller ID, Hor Drill ID) y modelos neumáticos con cabezal accionado por aire comprimido (Driller, Hor Drill).",
    hyd: "Hidráulicas", pneu: "Neumáticas", hydraulic: "Hidráulica", pneumatic: "Neumática",
    tbl: { model: "Modelo", type: "Accionamiento", stroke: "Carrera del mástil", head: "Cabezal de rotación", torque: "Par de rotación", rpm: "Velocidad de rotación", weight: "Peso" },
    tblNote: "El consumo de aire comprimido de Driller y Hor Drill es de unos 8 m³/min.",
    drillSpec: { groupBase: "Unidad básica" }
  },
  no: {
    data: "Tekniske data", spec: "Spesifikasjoner", versionsT: "Utførelser", drawings: "Tegninger", side: "Sideriss", sideHint: "Hold musepekeren over tegningen (eller trykk og dra) for 2× forstørrelse.", up: "Se også", models: "Modeller", all: "Alle modeller",
    contact: '<a href="/kontakta-oss">Kontakt oss</a> for pris, leveringstid eller hjelp til å velge riktig modell.',
    source: "Opplysningene er hentet fra Marinis produktkatalog for steinbrudd og brosjyrene for modellene (engelsk).",
    note: "Motorer og vekter er oppgitt i samme rekkefølge.",
    docCat: "Produktkatalog steinbrudd (ENG)", docSaw: "Brosjyre wiresager for granitt (ENG)", docModel: (n) => `Brosjyre ${n} (ENG)`,
    groups: { granite: "Granitt: variabel wirehastighet", marble: "Marmor: fast wirehastighet", mobile: "Mobile plattformer" },
    sawFamily: "Wiresager", drillFamily: "Borerigger for steinbrudd",
    manual: "Manuell", electric: "Elektrisk", optElectric: "Elektrisk (tilvalg)", manualOrElectric: "Manuell eller elektrisk", none: "Ingen", wired: "Med kabel", wiredOptRemote: "Med kabel (fjernkontroll som tilvalg)",
    closed: "lukket", open: "utfoldet",
    lab: { motor: "Hovedmotor (el)", engine: "Motor", len: "Lengde", wid: "Bredde", hei: "Høyde", weight: "Vekt", rot: "Rotasjon av svinghjulsgruppe (360°)", trans: "Forflytting av svinghjul", ctrl: "Styring", speed: "Wirehastighet", fly: "Svinghjul", rails: "Skinner", model: "Modell" },
    key: { motor: "Hovedmotor", weight: "Vekt", speed: "Wirehastighet", engine: "Motor", len: "Lengde", wid: "Bredde" },
    sawIntro: { granite: (n, m, w, v) => `${n} er en diamantwiresag fra Marinis granittserie med variabel wirehastighet${v ? ` (${v} m/s)` : ""} styrt av frekvensomformer. Hovedmotor ${m} kW, vekt ${w} kg.`, marble: (n, m, w) => `${n} er en diamantwiresag fra Marinis marmorserie med fast wirehastighet (38 m/s). Hovedmotor ${m} kW, vekt ${w} kg.`, mobile: (n, m, w) => `${n} er en mobil plattform for Marinis wiresager, med motor på ${m} kW og vekt ${w} kg.` },
    sawBody: {
      granite: "Maskinen posisjoneres raskt på skinnene og holder diamantwiren jevnt og nøyaktig stram under kappingen. Svinghjulsgruppen kan dreies 360° og forflyttes med elektriske motorer (avhengig av utførelse), slik at sagen raskt rettes inn og parallelle snitt kan tas uten å flytte skinnene. Den kan sage på skrå flater i alle retninger og i plan med bruddbunnen. Det lette betjeningspanelet kan plasseres i trygg avstand fra sagen.",
      marble: "Marmorserien har ingen frekvensomformer og arbeider med fast wirehastighet. Starten skjer med stjerne-trekant-kobling, og maskinen styres fra et kablet trykknappepanel, noe som gir enkel og sikker bruk og jevn, pålitelig skjæreytelse.",
      mobile: "Plattformen gjør at wiresagen kan flyttes rundt i steinbruddet og settes opp for neste snitt. Lengde og høyde er oppgitt med plattformen lukket (sammenfoldet) og utfoldet (åpen)."
    },
    drillFamilyIntro: "Marinis borenheter for steinbrudd brukes til å bore hullene som diamantwiren skal gå gjennom, til kjerneboring og til store hull for såkalte blinde snitt. Det finnes hydrauliske modeller med hydraulisk rotasjonshode (Voyager, Big Driller, Driller ID, Hor Drill ID) og pneumatiske modeller med trykkluftdrevet rotasjonshode (Driller, Hor Drill).",
    hyd: "Hydrauliske", pneu: "Pneumatiske", hydraulic: "Hydraulisk", pneumatic: "Pneumatisk",
    tbl: { model: "Modell", type: "Drift", stroke: "Mastens slaglengde", head: "Rotasjonshode", torque: "Dreiemoment", rpm: "Turtall", weight: "Vekt" },
    tblNote: "Behovet for trykkluft for Driller og Hor Drill er cirka 8 m³/min.",
    drillSpec: { groupBase: "Grunnenhet" }
  }
};

// ---------- the drill rigs: text and figures per language ----------
// rows: [label, value] pairs per group; values written Swedish style
const L = (sv, en, es, no) => ({ sv, en, es, no });

// row labels (language neutral keys used in DRILL_TEXT)
export const RL = {
  wheelbase: L("Axelavstånd", "Wheel base", "Distancia entre ejes", "Akselavstand"), track: L("Spårvidd", "Track", "Ancho de vía", "Sporvidde"), pad: L("Bandplattornas bredd", "Pad width", "Ancho de las zapatas", "Bredde på beltepanelene"),
  climb: L("Max stigförmåga", "Max. climbing ability", "Pendiente máxima", "Maks. stigningsevne"), speed: L("Max hastighet", "Max. speed", "Velocidad máxima", "Maks. hastighet"),
  engineDiesel: L("Dieselmotor", "Diesel engine", "Motor diésel", "Dieselmotor"), engineElectric: L("Elmotor", "Electric motor", "Motor eléctrico", "Elmotor"), pump: L("Huvudpump", "Main pump", "Bomba principal", "Hovedpumpe"),
  oil: L("Oljetank", "Oil tank", "Depósito de aceite", "Oljetank"), fuel: L("Bränsletank", "Fuel tank", "Depósito de combustible", "Drivstofftank"), cons: L("Bränsleförbrukning", "Fuel consumption", "Consumo de combustible", "Drivstofforbruk"), cool: L("Kylning", "Cooling", "Refrigeración", "Kjøling"),
  mast: L("Mast", "Mast", "Mástil", "Mast"), stroke: L("Slaglängd", "Feed stroke", "Carrera", "Slaglengde"), mlen: L("Total längd", "Total length", "Longitud total", "Total lengde"), feed: L("Matningskraft", "Feed force", "Fuerza de empuje", "Matekraft"), retract: L("Dragkraft (indragning)", "Retract force", "Fuerza de retroceso", "Trekkraft (inndraging)"),
  head: L("Rotationshuvud", "Rotary head", "Cabezal de rotación", "Rotasjonshode"), torque: L("Max vridmoment", "Max. torque", "Par máximo", "Maks. dreiemoment"), rpm: L("Varvtal", "Rotary speed", "Velocidad de rotación", "Turtall"), gears: L("Växlar", "Gears", "Marchas", "Gir"), pass: L("Genomgång i huvudet", "Head passage", "Paso del cabezal", "Gjennomgang i hodet"),
  drill: L("Typ", "Type", "Tipo", "Type"), dtorque: L("Max vridmoment", "Max. torque", "Par máximo", "Maks. dreiemoment"), drpm: L("Max varvtal", "Max. speed", "Velocidad máxima", "Maks. turtall"), impact: L("Slagenergi", "Impact energy", "Energía de impacto", "Slagenergi"), freq: L("Slagfrekvens", "Impact frequency", "Frecuencia de golpeo", "Slagfrekvens"), rods: L("Gängade och självborrande stänger", "Threaded and self-anchoring rods", "Varillas roscadas y autoperforantes", "Gjengede og selvborrende stenger"),
  slide: L("Borrsläde", "Drilling slide", "Corredera de perforación", "Borslede"), dth: L("Sänkhammare (DTH)", "DTH hammer", "Martillo de fondo (DTH)", "Senkhammer (DTH)"), air: L("Luftförbrukning", "Air consumption", "Consumo de aire", "Luftforbruk"),
  slidew: L("Borrsläde med rotationshuvud", "Drilling slide with rotary head", "Corredera con cabezal de rotación", "Borslede med rotasjonshode"), packw: L("Hydraulaggregat (diesel / bensin / el)", "Power pack (diesel / petrol / electric)", "Grupo hidráulico (diésel / gasolina / eléctrico)", "Hydraulikkaggregat (diesel / bensin / el)"),
  dthw: L("Sänkhammare med krona", "DTH hammer with bit", "Martillo de fondo con broca", "Senkhammer med krone"), rodw: L("Borrstång", "Drill rod", "Varilla de perforación", "Borstang"),
  col1000: L("Kolonnlängd, stänger 1 000 mm", "Column length, rods 1,000 mm", "Longitud de columna, varillas de 1.000 mm", "Kolonnelengde, stenger 1 000 mm"), col1500: L("Kolonnlängd, stänger 1 500 mm", "Column length, rods 1,500 mm", "Longitud de columna, varillas de 1.500 mm", "Kolonnelengde, stenger 1 500 mm"),
  colDth: L("Kolonn för sänkhammarstänger", "Column for DTH hammer rods", "Columna para varillas de martillo de fondo", "Kolonne for senkhammerstenger"), colSteel: L("Kolonn för borrstål", "Column for drill steel", "Columna para barrenas", "Kolonne for borstål"),
  feedP: L("Matningskraft, kolvmotor", "Feed force, piston motor", "Fuerza de empuje, motor de pistones", "Matekraft, stempelmotor"), feedV: L("Matningskraft, lamellmotor", "Feed force, vane motor", "Fuerza de empuje, motor de paletas", "Matekraft, lamellmotor"),
  dust: L("Dammuppsamling", "Dust collector", "Aspirador de polvo", "Støvsuger"), comp: L("Kompressor", "Compressor", "Compresor", "Kompressor"), rock: L("Bergborrmaskin", "Rock drill", "Perforadora", "Bergboremaskin"), weight: L("Vikt", "Weight", "Peso", "Vekt")
};
export const PHRASES = {
  opt: L("Finns som tillval", "Available as an option", "Disponible como opción", "Finnes som tilvalg"), sep: L("Separat", "Separate", "Separado", "Separat"),
  dth3: L("upp till 3 tum, hål upp till 95 mm", "up to 3 inches, holes up to 95 mm", "hasta 3 pulgadas, barrenos de hasta 95 mm", "opptil 3 tommer, hull opptil 95 mm"),
  inch1: L("1 tum", "1 inch", "1 pulgada", "1 tomme")
};

export const DRILL_TEXT = {
  voyager: {
    title: L("Voyager", "Voyager", "Voyager", "Voyager"),
    intro: L(
      "Voyager är en hydraulisk, självgående borrenhet på gummiband för horisontella, vertikala och lutande hål. Den drivs av ett hydraulaggregat med diesel- eller bensinmotor på 17 kW eller en elmotor på 15 kW.",
      "Voyager is a hydraulic, self-propelled drilling unit on rubber tracks for horizontal, vertical and inclined holes. It is powered by a hydraulic power pack with a 17 kW diesel or petrol engine or a 15 kW electric motor.",
      "Voyager es una unidad de perforación hidráulica autopropulsada sobre orugas de goma para barrenos horizontales, verticales e inclinados. La acciona un grupo hidráulico con motor diésel o de gasolina de 17 kW o con motor eléctrico de 15 kW.",
      "Voyager er en hydraulisk, selvgående borenhet på gummibelter for horisontale, vertikale og skrå hull. Den drives av et hydraulikkaggregat med diesel- eller bensinmotor på 17 kW eller en elmotor på 15 kW."),
    body: L(
      "Med hydrauliskt rotationshuvud och pneumatisk sänkhammare (DTH) borrar den stora hål för diamantvajern. Med rotationshuvud och diamantkronor kärnborrar den över 30 meter med diametrar på 64 - 90 mm, och med hydro-pneumatiska bergborrmaskiner borrar den hål med olika diametrar.",
      "With the hydraulic rotary head and a pneumatic down-the-hole (DTH) hammer it drills large holes for the diamond wire. With the rotary head and diamond crowns it core drills more than 30 metres with diameters of 64 - 90 mm, and with hydro-pneumatic rock drills it makes holes of various diameters.",
      "Con el cabezal de rotación hidráulico y un martillo de fondo (DTH) neumático perfora barrenos grandes para el hilo diamantado. Con el cabezal y coronas diamantadas realiza sondeos de más de 30 metros con diámetros de 64 - 90 mm, y con perforadoras hidroneumáticas hace barrenos de distintos diámetros.",
      "Med hydraulisk rotasjonshode og pneumatisk senkhammer (DTH) borer den store hull for diamantwiren. Med rotasjonshode og diamantkroner kjerneborer den over 30 meter med diametre på 64 - 90 mm, og med hydropneumatiske bergboremaskiner borer den hull med ulike diametre."),
    bullets: { motor: ["17 kW (diesel) / 15 kW (el)", "17 kW (diesel/petrol) / 15 kW (electric)", "17 kW (diésel/gasolina) / 15 kW (eléctrico)", "17 kW (diesel) / 15 kW (el)"], },
    groups: [
      { t: L("Underrede", "Undercarriage", "Tren de rodaje", "Understell"), rows: [
        ["wheelbase", "1 080 mm"], ["track", "1 000 mm"], ["pad", "230 mm"], ["climb", "80 %"], ["speed", "1,67 km/h"]] },
      { t: L("Hydraulaggregat", "Power pack", "Grupo hidráulico", "Hydraulikkaggregat"), rows: [
        ["engineDiesel", L("Lombardini LDW 1003, 17 kW vid 3 000 rpm", "Lombardini LDW 1003, 17 kW at 3,000 rpm", "Lombardini LDW 1003, 17 kW a 3.000 rpm", "Lombardini LDW 1003, 17 kW ved 3 000 rpm")], ["engineElectric", L("15 kW vid 2 900 rpm", "15 kW at 2,900 rpm", "15 kW a 2.900 rpm", "15 kW ved 2 900 rpm")], ["pump", L("40 l/min vid 200 bar", "40 l/min at 200 bar", "40 l/min a 200 bar", "40 l/min ved 200 bar")], ["oil", "50 l"], ["fuel", "20 l"], ["cons", "2,5 l/h"], ["cool", L("Separat olje-/luftkylare", "Separate oil/air cooler", "Enfriador aceite/aire independiente", "Separat olje-/luftkjøler")]] },
      { t: L("Mast", "Mast", "Mástil", "Mast"), rows: [
        ["mast", "CID 80 / CID 100"], ["stroke", "1 760 mm"], ["mlen", "3 300 mm / 3 400 mm"], ["feed", "6 kN / 10 kN"], ["retract", "10 kN / 15 kN"]] },
      { t: L("Rotationshuvud", "Rotary head", "Cabezal de rotación", "Rotasjonshode"), rows: [
        ["head", L("ID 160 / ID CD (kärnborrning)", "ID 160 / ID CD (coring)", "ID 160 / ID CD (sondeo)", "ID 160 / ID CD (kjerneboring)")], ["torque", "1 600 Nm / 35 Nm"], ["rpm", "60 / 1 300 rpm"], ["gears", "1"], ["pass", "@inch1"]] },
      { t: L("Bergborrmaskin", "Rock drill", "Perforadora", "Bergboremaskin"), rows: [
        ["drill", "MA 90 / MA 100 S ID"], ["dtorque", "- / 1 000 Nm"], ["drpm", "190 / 100 rpm"], ["impact", "180 Nm"], ["freq", L("2 500 / 2 800 slag/min", "2,500 / 2,800 blows/min", "2.500 / 2.800 golpes/min", "2 500 / 2 800 slag/min")], ["rods", L("R32 / R38 LH, skaft 22x108 eller 25x108 mm", "R32 / R38 LH, shank 22x108 or 25x108 mm", "R32 / R38 LH, mango 22x108 o 25x108 mm", "R32 / R38 LH, skaft 22x108 eller 25x108 mm")]] }
    ],
    key: [["engine", "17 kW / 15 kW"], ["stroke", "1 260 - 1 760 mm"], ["torque", "1 600 Nm"], ["weight", "1 400 kg"]]
  },
  "big-driller": {
    title: L("Big Driller", "Big Driller", "Big Driller", "Big Driller"),
    intro: L(
      "Big Driller är en oljepneumatisk borrenhet för hål med stor diameter (255 mm) till så kallade blinda snitt. Den har hydrauliskt rotationshuvud och drivs av ett hydraulaggregat med diesel- eller bensinmotor på 17 kW eller elmotor på 15 kW.",
      "Big Driller is an oleopneumatic drilling unit for large-diameter holes (255 mm) used for so-called blind cuts. It has a hydraulic rotary head and is powered by a hydraulic power pack with a 17 kW diesel or petrol engine or a 15 kW electric motor.",
      "Big Driller es una unidad de perforación oleoneumática para barrenos de gran diámetro (255 mm) destinados a los llamados cortes ciegos. Lleva un cabezal de rotación hidráulico y la acciona un grupo hidráulico con motor diésel o de gasolina de 17 kW o con motor eléctrico de 15 kW.",
      "Big Driller er en oljepneumatisk borenhet for hull med stor diameter (255 mm) til såkalte blinde snitt. Den har hydraulisk rotasjonshode og drives av et hydraulikkaggregat med diesel- eller bensinmotor på 17 kW eller elmotor på 15 kW."),
    body: L(
      "Robust konstruktion för att borra i olika riktningar. Borrsläden CID 120 tar förlängningsstänger på 1 200 mm och bär rotationshuvudet ID 300. Hålen borras med en 6-tums sänkhammare (DTH) med knappkrona på 255 mm. Ett stöd förankrar enheten i marken, och ett hydrauliskt manöverorgan styr matning och rotation medan hammaren styrs pneumatiskt.",
      "Sturdy structure for drilling in various directions. The CID 120 drilling slide takes extension rods of 1,200 mm and carries the ID 300 rotary head. Holes are drilled with a 6-inch down-the-hole (DTH) hammer with a 255 mm button bit. A base frame anchors the unit to the ground, and a hydraulic control panel runs feed and rotation while the hammer is controlled pneumatically.",
      "Estructura robusta para perforar en distintas direcciones. La corredera CID 120 admite varillas de prolongación de 1.200 mm y lleva el cabezal de rotación ID 300. Los barrenos se perforan con un martillo de fondo (DTH) de 6 pulgadas con broca de botones de 255 mm. Un bastidor ancla la unidad al suelo y un panel de mando hidráulico controla el avance y la rotación, mientras que el martillo se controla de forma neumática.",
      "Robust konstruksjon for boring i ulike retninger. Borslæden CID 120 tar skjøtestenger på 1 200 mm og bærer rotasjonshodet ID 300. Hullene bores med en 6-tommers senkhammer (DTH) med knappekrone på 255 mm. Et fundament forankrer enheten i bakken, og et hydraulisk betjeningspanel styrer mating og rotasjon, mens hammeren styres pneumatisk."),
    groups: [
      { t: L("Borrenhet", "Drilling unit", "Unidad de perforación", "Borenhet"), rows: [
        ["slide", "CID 120"], ["stroke", "1 260 mm"], ["mlen", L("3 000 mm (med stänger på 1 270 mm)", "3,000 mm (with 1,270 mm rods)", "3.000 mm (con varillas de 1.270 mm)", "3 000 mm (med stenger på 1 270 mm)")], ["head", "ID 300"], ["torque", "3 000 Nm"], ["rpm", "20 - 40 rpm"], ["dth", L("6 tum, krona 255 mm", "6 inch, 255 mm bit", "6 pulgadas, broca de 255 mm", "6 tommer, krone 255 mm")], ["air", "10 000 l/min vid 7 bar"]] },
      { t: L("Vikter", "Weights", "Pesos", "Vekter"), rows: [
        ["slidew", "550 kg"], ["packw", "280 / 150 / 260 kg"], ["dthw", "150 kg"], ["rodw", L("40 kg per stång (Ø 127 mm, längd 1 200 mm)", "40 kg each (Ø 127 mm, length 1,200 mm)", "40 kg cada una (Ø 127 mm, longitud 1.200 mm)", "40 kg per stang (Ø 127 mm, lengde 1 200 mm)")]] }
    ],
    key: [["stroke", "1 260 mm"], ["torque", "3 000 Nm"], ["hole", "255 mm"], ["engine", "17 kW / 15 kW"]]
  },
  driller: {
    title: L("Driller", "Driller", "Driller", "Driller"),
    intro: L(
      "Driller är en pneumatisk borrenhet för hål där diamantvajern ska passera. Med pneumatiskt rotationshuvud och sänkhammare (DTH) når den 25 - 30 meters djup även i berg med naturliga ojämnheter, med hög borrhastighet.",
      "Driller is a pneumatic drilling unit for the holes the diamond wire passes through. With a pneumatic rotary head and a down-the-hole (DTH) hammer it reaches depths of 25 - 30 metres even in rock with natural irregularities, at a high drilling speed.",
      "Driller es una unidad de perforación neumática para los barrenos por los que pasa el hilo diamantado. Con cabezal de rotación neumático y martillo de fondo (DTH) alcanza profundidades de 25 - 30 metros incluso en roca con irregularidades naturales, con una alta velocidad de perforación.",
      "Driller er en pneumatisk borenhet for hull som diamantwiren skal gå gjennom. Med pneumatisk rotasjonshode og senkhammer (DTH) når den 25 - 30 meters dybde selv i fjell med naturlige ujevnheter, med høy borehastighet."),
    body: L(
      "Lätt och mångsidig konstruktion för borrning i alla riktningar och i plan med brottbotten. Kolonn för förlängningsstänger på 1 000 eller 1 500 mm, sänkhammare upp till 3 tum för hål upp till 95 mm och ett stöd med kulled för att borra i valfri riktning. Pneumatiskt manöverorgan med centralsmörjning kan riktas som man vill. Med matningsmotor med kolvar (8,5 kN) eller lameller (4,8 kN). Hydraulisk version finns som Driller ID.",
      "Light and versatile structure for drilling in any direction and flush with the quarry floor. Column for extension rods of 1,000 or 1,500 mm, a down-the-hole hammer up to 3 inches for holes up to 95 mm, and a down jack with a ball joint for drilling in any direction. The pneumatic control panel with centralised lubrication can be turned in any direction. Feed by a piston motor (8.5 kN) or a vane motor (4.8 kN). A hydraulic version is available as Driller ID.",
      "Estructura ligera y versátil para perforar en cualquier dirección y a ras del suelo de la cantera. Columna para varillas de prolongación de 1.000 o 1.500 mm, martillo de fondo de hasta 3 pulgadas para barrenos de hasta 95 mm y un puntal con rótula para perforar en cualquier dirección. El panel de mando neumático con lubricación centralizada puede orientarse como se desee. Avance con motor de pistones (8,5 kN) o de paletas (4,8 kN). Existe una versión hidráulica, Driller ID.",
      "Lett og allsidig konstruksjon for boring i alle retninger og i plan med bruddbunnen. Kolonne for skjøtestenger på 1 000 eller 1 500 mm, senkhammer opptil 3 tommer for hull opptil 95 mm og en støtte med kuleledd for boring i valgfri retning. Det pneumatiske betjeningspanelet med sentralsmøring kan vendes i alle retninger. Matemotor med stempler (8,5 kN) eller lameller (4,8 kN). En hydraulisk utgave finnes som Driller ID."),
    groups: [
      { t: L("Grundenhet", "Base unit", "Unidad básica", "Grunnenhet"), rows: [
        ["stroke", "1 000 - 1 500 mm"], ["col1000", "2 500 mm"], ["col1500", "3 000 mm"], ["head", "EP 95"], ["torque", "850 Nm"], ["rpm", "40 rpm"], ["feedP", "8,5 kN"], ["feedV", "4,8 kN"], ["dth", "@dth3"], ["air", L("8 m³/min (8 000 l/min vid 7 bar)", "8 m³/min (8,000 l/min at 7 bar)", "8 m³/min (8.000 l/min a 7 bar)", "8 m³/min (8 000 l/min ved 7 bar)")], ["dust", "@opt"], ["weight", "180 kg"], ["dthw", L("35 kg (3 tum, krona 90 mm)", "35 kg (3 inch, 90 mm bit)", "35 kg (3 pulgadas, broca de 90 mm)", "35 kg (3 tommer, krone 90 mm)")], ["rodw", L("16 kg per stång (Ø 76 mm, längd 1 500 mm)", "16 kg each (Ø 76 mm, length 1,500 mm)", "16 kg cada una (Ø 76 mm, longitud 1.500 mm)", "16 kg per stang (Ø 76 mm, lengde 1 500 mm)")]] }
    ],
    key: [["stroke", "1 000 - 1 500 mm"], ["torque", "850 Nm"], ["air", "8 m³/min"], ["weight", "180 kg"]]
  },
  "driller-id": {
    title: L("Driller ID", "Driller ID", "Driller ID", "Driller ID"),
    intro: L(
      "Driller ID är den hydrauliska versionen av Driller: samma lätta borrenhet för hål där diamantvajern ska passera, men med hydrauliskt rotationshuvud och hydraulisk matning från ett hydraulaggregat med bensin-, diesel- eller elmotor.",
      "Driller ID is the hydraulic version of Driller: the same light drilling unit for the holes the diamond wire passes through, but with a hydraulic rotary head and hydraulic feed from a power pack with a petrol, diesel or electric motor.",
      "Driller ID es la versión hidráulica de Driller: la misma unidad de perforación ligera para los barrenos por los que pasa el hilo diamantado, pero con cabezal de rotación hidráulico y avance hidráulico desde un grupo con motor de gasolina, diésel o eléctrico.",
      "Driller ID er den hydrauliske utgaven av Driller: den samme lette borenheten for hull som diamantwiren skal gå gjennom, men med hydraulisk rotasjonshode og hydraulisk mating fra et hydraulikkaggregat med bensin-, diesel- eller elmotor."),
    body: L(
      "Rotationshuvudet ID 160 ger högre vridmoment än det pneumatiska huvudet. Kolonn för förlängningsstänger på 1 000 eller 1 500 mm, sänkhammare upp till 3 tum för hål upp till 95 mm och ett stöd med kulled för att borra i valfri riktning.",
      "The ID 160 rotary head gives a higher torque than the pneumatic head. Column for extension rods of 1,000 or 1,500 mm, a down-the-hole hammer up to 3 inches for holes up to 95 mm, and a down jack with a ball joint for drilling in any direction.",
      "El cabezal de rotación ID 160 da un par superior al del cabezal neumático. Columna para varillas de prolongación de 1.000 o 1.500 mm, martillo de fondo de hasta 3 pulgadas para barrenos de hasta 95 mm y un puntal con rótula para perforar en cualquier dirección.",
      "Rotasjonshodet ID 160 gir høyere dreiemoment enn det pneumatiske hodet. Kolonne for skjøtestenger på 1 000 eller 1 500 mm, senkhammer opptil 3 tommer for hull opptil 95 mm og en støtte med kuleledd for boring i valgfri retning."),
    groups: [
      { t: L("Grundenhet", "Base unit", "Unidad básica", "Grunnenhet"), rows: [
        ["stroke", "1 760 mm"], ["head", "ID 160"], ["torque", "1 600 Nm"], ["rpm", "35 - 100 rpm"], ["comp", "@sep"], ["dust", "@opt"], ["weight", "145 kg"], ["dth", "@dth3"]] }
    ],
    key: [["stroke", "1 760 mm"], ["torque", "1 600 Nm"], ["rpm", "35 - 100 rpm"], ["weight", "145 kg"]]
  },
  "hor-drill": {
    title: L("Hor Drill", "Hor Drill", "Hor Drill", "Hor Drill"),
    intro: L(
      "Hor Drill är en pneumatisk borrenhet för horisontella hål där diamantvajern ska passera. Med pneumatiskt rotationshuvud och sänkhammare (DTH) når den 25 - 30 meters djup även i berg med naturliga ojämnheter.",
      "Hor Drill is a pneumatic drilling unit for horizontal holes the diamond wire passes through. With a pneumatic rotary head and a down-the-hole (DTH) hammer it reaches depths of 25 - 30 metres even in rock with natural irregularities.",
      "Hor Drill es una unidad de perforación neumática para barrenos horizontales por los que pasa el hilo diamantado. Con cabezal de rotación neumático y martillo de fondo (DTH) alcanza profundidades de 25 - 30 metros incluso en roca con irregularidades naturales.",
      "Hor Drill er en pneumatisk borenhet for horisontale hull som diamantwiren skal gå gjennom. Med pneumatisk rotasjonshode og senkhammer (DTH) når den 25 - 30 meters dybde selv i fjell med naturlige ujevnheter."),
    body: L(
      "Lätt konstruktion som är enkel att placera för horisontell borrning i plan med blocket. Kolonn för sänkhammarstänger på 1 500 mm och för borrstål på 2 400 mm. Samma enhet kan utrustas med en pneumatisk bergborrmaskin MA 90 för hål med liten diameter med borrstål eller koniska stänger. Ett stöd med horisontell bärpelare gör att kolonnen kan flyttas i borrlinjen.",
      "Light structure that is easy to position for horizontal drilling flush with the block. Column for DTH hammer rods of 1,500 mm and for drill steel of 2,400 mm. The same unit can be fitted with a pneumatic rock drill MA 90 for small-diameter holes with drill steel or conical rods. A down jack with a horizontal pipe lets the column be moved along the drilling line.",
      "Estructura ligera y fácil de colocar para perforar en horizontal a ras del bloque. Columna para varillas de martillo de fondo de 1.500 mm y para barrenas de 2.400 mm. La misma unidad puede equiparse con una perforadora neumática MA 90 para barrenos de pequeño diámetro con barrenas o varillas cónicas. Un puntal con barra horizontal permite desplazar la columna sobre la línea de perforación.",
      "Lett konstruksjon som er enkel å plassere for horisontal boring i plan med blokken. Kolonne for senkhammerstenger på 1 500 mm og for borstål på 2 400 mm. Den samme enheten kan utstyres med en pneumatisk bergboremaskin MA 90 for hull med liten diameter med borstål eller koniske stenger. En støtte med horisontal bjelke gjør at kolonnen kan flyttes langs boringslinjen."),
    groups: [
      { t: L("Grundenhet", "Base unit", "Unidad básica", "Grunnenhet"), rows: [
        ["stroke", "1 000 - 1 500 mm"], ["colDth", "1 500 mm"], ["colSteel", "2 400 mm"], ["head", "EP 95"], ["torque", "850 Nm"], ["rpm", "40 rpm"], ["feedV", "4,8 kN"], ["dth", "@dth3"], ["rock", L("MA 90, skaft 22x108 eller 25x108 mm (tillval)", "MA 90, shank 22x108 or 25x108 mm (option)", "MA 90, mango 22x108 o 25x108 mm (opcional)", "MA 90, skaft 22x108 eller 25x108 mm (tilvalg)")], ["air", L("8 m³/min (8 000 l/min vid 7 bar)", "8 m³/min (8,000 l/min at 7 bar)", "8 m³/min (8.000 l/min a 7 bar)", "8 m³/min (8 000 l/min ved 7 bar)")], ["dust", "@opt"], ["weight", "230 kg"]] }
    ],
    key: [["stroke", "1 000 - 1 500 mm"], ["torque", "850 Nm"], ["air", "8 m³/min"], ["weight", "230 kg"]]
  },
  "hor-drill-id": {
    title: L("Hor Drill ID", "Hor Drill ID", "Hor Drill ID", "Hor Drill ID"),
    intro: L(
      "Hor Drill ID är den hydrauliska versionen av Hor Drill för horisontella hål där diamantvajern ska passera, med hydrauliskt rotationshuvud och hydraulisk matning från ett hydraulaggregat med bensin-, diesel- eller elmotor.",
      "Hor Drill ID is the hydraulic version of Hor Drill for horizontal holes the diamond wire passes through, with a hydraulic rotary head and hydraulic feed from a power pack with a petrol, diesel or electric motor.",
      "Hor Drill ID es la versión hidráulica de Hor Drill para barrenos horizontales por los que pasa el hilo diamantado, con cabezal de rotación hidráulico y avance hidráulico desde un grupo con motor de gasolina, diésel o eléctrico.",
      "Hor Drill ID er den hydrauliske utgaven av Hor Drill for horisontale hull som diamantwiren skal gå gjennom, med hydraulisk rotasjonshode og hydraulisk mating fra et hydraulikkaggregat med bensin-, diesel- eller elmotor."),
    body: L(
      "Rotationshuvudet ID 160 ger högre vridmoment än det pneumatiska huvudet. Lätt konstruktion som är enkel att placera för horisontell borrning i plan med blocket, med sänkhammare upp till 3 tum för hål upp till 95 mm.",
      "The ID 160 rotary head gives a higher torque than the pneumatic head. Light structure that is easy to position for horizontal drilling flush with the block, with a down-the-hole hammer up to 3 inches for holes up to 95 mm.",
      "El cabezal de rotación ID 160 da un par superior al del cabezal neumático. Estructura ligera y fácil de colocar para perforar en horizontal a ras del bloque, con martillo de fondo de hasta 3 pulgadas para barrenos de hasta 95 mm.",
      "Rotasjonshodet ID 160 gir høyere dreiemoment enn det pneumatiske hodet. Lett konstruksjon som er enkel å plassere for horisontal boring i plan med blokken, med senkhammer opptil 3 tommer for hull opptil 95 mm."),
    groups: [
      { t: L("Grundenhet", "Base unit", "Unidad básica", "Grunnenhet"), rows: [
        ["stroke", "1 760 mm"], ["head", "ID 160"], ["torque", "1 600 Nm"], ["rpm", "35 - 100 rpm"], ["comp", "@sep"], ["dust", "@opt"], ["weight", "230 kg"], ["dth", "@dth3"]] }
    ],
    key: [["stroke", "1 760 mm"], ["torque", "1 600 Nm"], ["rpm", "35 - 100 rpm"], ["weight", "230 kg"]]
  }
};
