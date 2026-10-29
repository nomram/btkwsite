// Mapei products (concrete repair and anchoring). Source: Mapei's product pages and technical data sheets (mapei.com/se, Swedish versions); documents downloaded
// to assets-src/docs/mapei-<slug>-<type>.pdf, product pictures in crawl/mapei/<slug>.png.
// Numbers are written the Swedish way ("1 530", "0,5"); the generator (tools/brand-products.mjs) localises them.
const t = (sv, en, es, no) => ({ sv, en, es, no });
const sfx = (o, s) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v + s]));
const L = {
  mix: t("Blandningsförhållande", "Mixing ratio", "Proporción de mezcla", "Blandingsforhold"),
  colour: t("Färg", "Colour", "Color", "Farge"),
  consistency: t("Konsistens", "Consistency", "Consistencia", "Konsistens"),
  density: t("Densitet, färsk blandning", "Density, fresh mix", "Densidad de la mezcla fresca", "Densitet, fersk blanding"),
  temp: t("Appliceringstemperatur", "Application temperature", "Temperatura de aplicación", "Påføringstemperatur"),
  pot: t("Brukstid", "Pot life", "Tiempo de trabajabilidad", "Brukstid"),
  open: t("Öppentid", "Open time", "Tiempo abierto", "Åpen tid"),
  layer: t("Skikttjocklek", "Layer thickness", "Espesor de capa", "Lagtykkelse"),
  comp: t("Tryckhållfasthet", "Compressive strength", "Resistencia a compresión", "Trykkfasthet"),
  flex: t("Böjhållfasthet", "Flexural strength", "Resistencia a flexión", "Bøyefasthet"),
  shear: t("Skjuvhållfasthet", "Shear strength", "Resistencia a cortante", "Skjærfasthet"),
  maxgrain: t("Största kornstorlek", "Maximum grain size", "Tamaño máximo de grano", "Største kornstørrelse"),
  chloride: t("Kloridjoninnehåll", "Chloride ion content", "Contenido de iones cloruro", "Kloridinnhold"),
  pack: t("Förpackning", "Packaging", "Envase", "Emballasje"),
  storage: t("Lagring", "Storage", "Almacenamiento", "Lagring"),
  fire: t("Brandklass", "Reaction to fire", "Reacción al fuego", "Brannklasse"),
  elastic: t("Elasticitetsmodul", "Modulus of elasticity", "Módulo de elasticidad", "Elastisitetsmodul"),
  adhesion: t("Vidhäftning mot betong", "Adhesion to concrete", "Adherencia al hormigón", "Heft til betong"),
  type: t("Typ", "Type", "Tipo", "Type"),
};
const G = {
  product: t("Produkt", "Product", "Producto", "Produkt"),
  application: t("Applicering", "Application", "Aplicación", "Påføring"),
  final: t("Slutegenskaper", "Final properties", "Propiedades finales", "Sluttegenskaper"),
  pack: t("Förpackning och lagring", "Packaging and storage", "Envase y almacenamiento", "Emballasje og lagring"),
};
const grey = t("grå", "grey", "gris", "grå");
const powder = t("pulver", "powder", "polvo", "pulver");
const thickLiquid = t("tjock vätska", "thick liquid", "líquido espeso", "tykk væske");
const SOURCE = t("Uppgifterna är hämtade ur Mapeis tekniska datablad (svenska).", "Information taken from Mapei's technical data sheets (in Swedish).", "Información tomada de las fichas técnicas de Mapei (en sueco).", "Opplysningene er hentet fra Mapeis tekniske datablader (på svensk).");
const months = (n) => t(`${n} månader`, `${n} months`, `${n} meses`, `${n} måneder`);
const dry = t("oöppnad förpackning, torrt", "unopened packaging, dry", "envase cerrado, en seco", "uåpnet emballasje, tørt");
const D = (file, type) => ({ type, file });

export default {
  brand: { slug: "mapei", name: "Mapei", logo: { src: "/assets/img/mapei-1.webp", width: 1920, height: 493, alt: "Mapei logotyp" }, hero: "/assets/img/mapei-hero.webp", source: SOURCE },
  products: [
    // ------------------------------------------------------------------ Mapepoxy L
    {
      slug: "mapepoxy-l", name: "Mapepoxy L", related: ["redirep-45-rsf", "montocryl", "planitop-rasa-ripara-r4"],
      intro: t(
        "Mapepoxy L är ett tvåkomponents, snabbhärdande epoxilim för kraftöverförande limning av färsk betong mot gammal betong, gammal betong mot gammal betong samt stål mot betong. Det kan också användas som slitstark skyddsbeläggning på betong och stål och för förankring av bultar i borrade hål. Endast för professionellt bruk.",
        "Mapepoxy L is a two-component, fast-curing epoxy adhesive for load-bearing bonding of fresh concrete to old concrete, old concrete to old concrete and steel to concrete. It can also be used as a hard-wearing protective coating on concrete and steel and for anchoring bolts in drilled holes. For professional use only.",
        "Mapepoxy L es un adhesivo epoxi bicomponente de curado rápido para el pegado estructural de hormigón fresco sobre hormigón antiguo, hormigón antiguo sobre hormigón antiguo y acero sobre hormigón. También puede usarse como revestimiento protector resistente al desgaste sobre hormigón y acero y para anclar pernos en agujeros taladrados. Solo para uso profesional.",
        "Mapepoxy L er en todelt, hurtigherdende epoksylim for kraftoverførende liming av fersk betong mot gammel betong, gammel betong mot gammel betong og stål mot betong. Den kan også brukes som slitesterkt beskyttelsesbelegg på betong og stål og til forankring av bolter i borede hull. Kun for profesjonell bruk."),
      bullets: {
        sv: ["Låg emission, uppfyller M1", "God vidhäftning till betong, även i fuktig miljö", "Inga mjukgörare eller benzylalkohol", "Uppfyller EN 1504-4", "Appliceras med pensel, rakel eller trattspruta", "Färg: grå"],
        en: ["Low emission, meets M1", "Good adhesion to concrete, also in damp conditions", "No plasticisers or benzyl alcohol", "Meets EN 1504-4", "Applied by brush, trowel or funnel sprayer", "Colour: grey"],
        es: ["Bajas emisiones, cumple M1", "Buena adherencia al hormigón, también en ambiente húmedo", "Sin plastificantes ni alcohol bencílico", "Cumple EN 1504-4", "Se aplica con brocha, espátula o pistola de embudo", "Color: gris"],
        no: ["Lave utslipp, oppfyller M1", "God heft til betong, også i fuktig miljø", "Ingen myknere eller benzylalkohol", "Oppfyller EN 1504-4", "Påføres med pensel, rakel eller traktspray", "Farge: grå"] },
      tile: { sv: ["Epoxilim, 2 komponenter", "Åtgång: 0,5-1,5 kg/m²"], en: ["Epoxy adhesive, 2 components", "Consumption: 0.5-1.5 kg/m²"], es: ["Adhesivo epoxi, 2 componentes", "Consumo: 0,5-1,5 kg/m²"], no: ["Epoksylim, 2 komponenter", "Forbruk: 0,5-1,5 kg/m²"] },
      usage: { value: "0,5-1,5 kg/m²", unit: t("som lim", "as adhesive", "como adhesivo", "som lim"), meta: t("beroende på ytans jämnhet", "depending on the surface", "según la superficie", "avhengig av underlaget"),
        note: t("Åtgången varierar med ytans jämnhet, temperaturen och appliceringssättet.", "Consumption varies with the evenness of the surface, the temperature and the method of application.", "El consumo varía con la regularidad de la superficie, la temperatura y el método de aplicación.", "Forbruket varierer med underlagets jevnhet, temperaturen og påføringsmåten.") },
      docs: [D("tekniskt-datablad", "tds"), D("sakerhetsdatablad", "sds"), D("prestandadeklaration", "dop"), D("epd", "epd")],
      areas: {
        sv: ["Limning av färsk betong på härdad betong", "Limning av härdad betong på härdad betong", "Limning av stål på betong eller stål på stål (endast vågräta ytor)", "Förankring av bultar i borrade hål", "Skyddsbeläggning på betong och stål, minst 2 lager med sandavströning emellan"],
        en: ["Bonding fresh concrete to hardened concrete", "Bonding hardened concrete to hardened concrete", "Bonding steel to concrete or steel to steel (horizontal surfaces only)", "Anchoring bolts in drilled holes", "Protective coating on concrete and steel, at least 2 coats with a sand broadcast in between"],
        es: ["Pegado de hormigón fresco sobre hormigón endurecido", "Pegado de hormigón endurecido sobre hormigón endurecido", "Pegado de acero sobre hormigón o acero sobre acero (solo superficies horizontales)", "Anclaje de pernos en agujeros taladrados", "Revestimiento protector sobre hormigón y acero, al menos 2 capas con espolvoreo de arena entre ellas"],
        no: ["Liming av fersk betong på herdet betong", "Liming av herdet betong på herdet betong", "Liming av stål på betong eller stål på stål (kun horisontale flater)", "Forankring av bolter i borede hull", "Beskyttelsesbelegg på betong og stål, minst 2 lag med sandstrø imellom"] },
      steps: {
        sv: ["Betongen ska vara ren, dammfri och fast, helst sandblästrad. Stål ska vara fritt från rost (sandblästring till SA 2½)", "Häll komponent B i komponent A och blanda i cirka 3 minuter med borrvisp på låg hastighet. Produkten får inte spädas", "Applicera med pensel, rakel eller trattspruta inom brukstiden", "Färsk betong ska gjutas inom öppentiden, annars strös limmet av med sand och ett nytt skikt läggs"],
        en: ["The concrete must be clean, dust-free and sound, preferably sandblasted. Steel must be free of rust (sandblasting to SA 2½)", "Pour component B into component A and mix for about 3 minutes with a drill and paddle at low speed. Do not dilute the product", "Apply with a brush, trowel or funnel sprayer within the pot life", "Fresh concrete must be placed within the open time, otherwise sand is broadcast over the adhesive and a new coat is applied"],
        es: ["El hormigón debe estar limpio, sin polvo y firme, preferiblemente arenado. El acero debe estar libre de óxido (chorreado a SA 2½)", "Vierta el componente B en el componente A y mezcle unos 3 minutos con taladro y mezclador a baja velocidad. No diluir el producto", "Aplique con brocha, espátula o pistola de embudo dentro del tiempo de trabajabilidad", "El hormigón fresco debe colocarse dentro del tiempo abierto; de lo contrario se espolvorea arena sobre el adhesivo y se aplica una nueva capa"],
        no: ["Betongen skal være ren, støvfri og fast, helst sandblåst. Stål skal være fritt for rust (sandblåsing til SA 2½)", "Hell komponent B i komponent A og bland i omtrent 3 minutter med visp på lav hastighet. Produktet skal ikke tynnes", "Påfør med pensel, rakel eller traktspray innenfor brukstiden", "Fersk betong skal støpes innenfor åpen tid, ellers strøs limet med sand og et nytt lag legges"] },
      groups: [
        { title: G.application, rows: [[L.mix, "8 : 1 (A : B)"], [L.colour, grey], [L.consistency, thickLiquid], [L.density, "ca 1 530 kg/m³"], [L.temp, "+5 °C till +30 °C"], [sfx(L.pot, " (+5 / +20 / +30 °C)"), "28 / 20 / 14 min"], [sfx(L.open, " (+5 / +20 / +30 °C)"), "240 / 70 / 60 min"]] },
        { title: G.final, rows: [
          [sfx(L.comp, " (+20 °C, 2,5 tim / 7 d)"), "40 / 110 N/mm²"], [sfx(L.comp, " (+5 °C, 16 tim / 28 d)"), "60 / 95 N/mm²"], [sfx(L.flex, " (7 d)"), "39,5 N/mm²"], [L.shear, "23 N/mm²"], [L.elastic, "7 680 N/mm²"],
          [t("Glasomvandlingstemperatur", "Glass transition temperature", "Temperatura de transición vítrea", "Glassovergangstemperatur"), "50,8 °C"], [L.fire, "B-s1"]] },
        { title: G.pack, rows: [[L.pack, t("Satser om 1,25 / 4,5 / 9 kg (komponent A + B)", "Kits of 1.25 / 4.5 / 9 kg (component A + B)", "Kits de 1,25 / 4,5 / 9 kg (componente A + B)", "Sett på 1,25 / 4,5 / 9 kg (komponent A + B)")], [L.storage, t("24 månader, +5 °C till +30 °C, oöppnad förpackning", "24 months, +5 °C to +30 °C, unopened packaging", "24 meses, +5 °C a +30 °C, envase cerrado", "24 måneder, +5 °C til +30 °C, uåpnet emballasje")]] },
      ],
    },
    // ------------------------------------------------------------------ Redirep 45 RSF
    {
      slug: "redirep-45-rsf", name: "Redirep 45 RSF", related: ["planitop-rasa-ripara-r4", "mapepoxy-l", "montocryl"],
      intro: t(
        "Redirep 45 RSF är ett fiberarmerat, krympkompenserat och tixotropt reparationsbruk för betong med snabb bindning och hög frostbeständighet. Det är avsett för reparation av sår och skador i betongunderlag och uppfyller EN 1504-3, klass R4. Levereras i 25 kg säck.",
        "Redirep 45 RSF is a fibre-reinforced, shrinkage-compensated, thixotropic repair mortar for concrete with fast setting and high frost resistance. It is intended for repairing damage in concrete substrates and meets EN 1504-3, class R4. Supplied in 25 kg bags.",
        "Redirep 45 RSF es un mortero de reparación para hormigón reforzado con fibras, de retracción compensada y tixotrópico, de fraguado rápido y alta resistencia a las heladas. Está pensado para reparar daños en soportes de hormigón y cumple EN 1504-3, clase R4. Se suministra en sacos de 25 kg.",
        "Redirep 45 RSF er en fiberarmert, krympkompensert og tiksotrop reparasjonsmørtel for betong med rask binding og høy frostbestandighet. Den er beregnet for reparasjon av skader i betongunderlag og oppfyller EN 1504-3, klasse R4. Leveres i 25 kg sekk."),
      bullets: {
        sv: ["Snabb bindning och snabb hållfasthetsutveckling", "Krympkompenserat, formstabilt", "Mycket god vidhäftning mot betong", "Frostbeständigt, lämpar sig för nordiskt klimat", "Låg permeabilitet, tål marin miljö", "Klass R4 enligt EN 1504-3, EC1 Plus"],
        en: ["Fast setting and fast strength development", "Shrinkage-compensated, dimensionally stable", "Very good adhesion to concrete", "Frost resistant, suited to the Nordic climate", "Low permeability, withstands marine environments", "Class R4 to EN 1504-3, EC1 Plus"],
        es: ["Fraguado rápido y rápido desarrollo de resistencia", "Retracción compensada, estable dimensionalmente", "Muy buena adherencia al hormigón", "Resistente a las heladas, apto para el clima nórdico", "Baja permeabilidad, resiste el ambiente marino", "Clase R4 según EN 1504-3, EC1 Plus"],
        no: ["Rask binding og rask fasthetsutvikling", "Krympkompensert, formstabil", "Svært god heft til betong", "Frostbestandig, egnet for nordisk klima", "Lav permeabilitet, tåler marint miljø", "Klasse R4 etter EN 1504-3, EC1 Plus"] },
      tile: { sv: ["Reparationsbruk R4, 25 kg", "Åtgång: 2 kg/m² per mm"], en: ["Repair mortar R4, 25 kg", "Consumption: 2 kg/m² per mm"], es: ["Mortero de reparación R4, 25 kg", "Consumo: 2 kg/m² por mm"], no: ["Reparasjonsmørtel R4, 25 kg", "Forbruk: 2 kg/m² per mm"] },
      usage: { value: "2 kg/m²", unit: t("per mm tjocklek", "per mm of thickness", "por mm de espesor", "per mm tykkelse"), meta: t("3-40 mm per skikt", "3-40 mm per layer", "3-40 mm por capa", "3-40 mm per lag"),
        note: t("Teoretisk åtgång. Verklig åtgång beror på underlagets ojämnheter.", "Theoretical consumption. Actual consumption depends on the unevenness of the substrate.", "Consumo teórico. El consumo real depende de las irregularidades del soporte.", "Teoretisk forbruk. Faktisk forbruk avhenger av underlagets ujevnheter.") },
      docs: [D("tekniskt-datablad", "tds"), D("sakerhetsdatablad", "sds"), D("prestandadeklaration", "dop"), D("epd", "epd")],
      areas: {
        sv: ["Reparation av sår och skador i betongunderlag", "Bärande och icke bärande reparationer (klass R4)", "Reparationer där frostbeständighet och tätt bruk krävs, även i marin miljö"],
        en: ["Repair of damage and defects in concrete substrates", "Structural and non-structural repairs (class R4)", "Repairs where frost resistance and a dense mortar are required, also in marine environments"],
        es: ["Reparación de daños y defectos en soportes de hormigón", "Reparaciones estructurales y no estructurales (clase R4)", "Reparaciones que requieren resistencia a las heladas y un mortero denso, también en ambiente marino"],
        no: ["Reparasjon av skader og feil i betongunderlag", "Bærende og ikke-bærende reparasjoner (klasse R4)", "Reparasjoner der frostbestandighet og tett mørtel kreves, også i marint miljø"] },
      steps: {
        sv: ["Rengör ytan från damm och lösa partiklar och förvattna sugande underlag. Inget fritt vatten får finnas kvar", "Blanda 3,2-3,45 liter vatten per 25 kg säck maskinellt i 2-3 minuter, låt dra i 3 minuter och blanda igen", "Vid behov, lägg ett vidhäftningsskikt av Redisit eller Mapepoxy L och applicera bruket vått i vått", "Applicera för hand med murarverktyg eller med spruta, 3-40 mm per skikt. Brukstid cirka 20 minuter vid +20 °C"],
        en: ["Clean the surface of dust and loose particles and pre-wet absorbent substrates. No free water may remain", "Mix 3.2-3.45 litres of water per 25 kg bag with a machine for 2-3 minutes, let it rest for 3 minutes and mix again", "If needed, apply a bonding layer of Redisit or Mapepoxy L and apply the mortar wet-on-wet", "Apply by hand with a trowel or by spray, 3-40 mm per layer. Pot life about 20 minutes at +20 °C"],
        es: ["Limpie la superficie de polvo y partículas sueltas y humedezca previamente los soportes absorbentes. No debe quedar agua libre", "Mezcle 3,2-3,45 litros de agua por saco de 25 kg con máquina durante 2-3 minutos, deje reposar 3 minutos y vuelva a mezclar", "Si es necesario, aplique una capa de adherencia de Redisit o Mapepoxy L y aplique el mortero fresco sobre fresco", "Aplique a mano con llana o con proyección, 3-40 mm por capa. Tiempo de trabajabilidad de unos 20 minutos a +20 °C"],
        no: ["Rengjør overflaten for støv og løse partikler og forvann sugende underlag. Det må ikke stå fritt vann igjen", "Bland 3,2-3,45 liter vann per 25 kg sekk maskinelt i 2-3 minutter, la den trekke i 3 minutter og bland igjen", "Ved behov legges et heftsjikt av Redisit eller Mapepoxy L, og mørtelen påføres vått i vått", "Påfør for hånd med murerverktøy eller med sprøyte, 3-40 mm per lag. Brukstid cirka 20 minutter ved +20 °C"] },
      groups: [
        { title: G.product, rows: [[t("Hållfasthetsklass (EN 1504-3)", "Strength class (EN 1504-3)", "Clase de resistencia (EN 1504-3)", "Fasthetsklasse (EN 1504-3)"), "R4"], [L.type, "PCC"], [L.consistency, powder], [L.colour, grey], [L.maxgrain, "1,0 mm"], [L.chloride, "≤ 0,05 %"], ["EMICODE", "EC1 Plus"]] },
        { title: G.application, rows: [[L.mix, t("12,8-13,8 delar vatten per 100 delar (3,2-3,45 l per 25 kg)", "12.8-13.8 parts water per 100 parts (3.2-3.45 l per 25 kg)", "12,8-13,8 partes de agua por 100 partes (3,2-3,45 l por 25 kg)", "12,8-13,8 deler vann per 100 deler (3,2-3,45 l per 25 kg)")], [L.density, "2,05 g/cm³"], ["pH", "> 12"], [L.temp, "+5 °C till +35 °C"], [L.pot, t("ca 20 min (+20 °C), ca 35 min (+10 °C)", "about 20 min (+20 °C), about 35 min (+10 °C)", "unos 20 min (+20 °C), unos 35 min (+10 °C)", "ca. 20 min (+20 °C), ca. 35 min (+10 °C)")], [L.layer, "3-40 mm"]] },
        { title: G.final, rows: [
          [sfx(L.comp, " (EN 12190, 1 / 7 / 28 d)"), "> 20 / > 30 / > 45 N/mm²"], [sfx(L.flex, " (EN 196-1, 1 / 7 / 28 d)"), "> 3 / > 4 / > 6 N/mm²"], [sfx(L.elastic, " (28 d)"), "22 GPa"], [sfx(L.adhesion, " (EN 1542, 28 d)"), "> 2,0 N/mm²"],
          [t("Kapillärsugning (EN 13057)", "Capillary absorption (EN 13057)", "Absorción capilar (EN 13057)", "Kapillær sugning (EN 13057)"), "0,11 kg/m²·h⁰˒⁵"],
          [t("Frys-/töcykler med tösalter (50 cykler)", "Freeze-thaw cycles with de-icing salts (50 cycles)", "Ciclos hielo-deshielo con sales fundentes (50 ciclos)", "Frost-/tinesykluser med tinesalter (50 sykluser)"), "3,5 N/mm²"], [L.fire, "A1"]] },
        { title: G.pack, rows: [[L.pack, t("25 kg säck", "25 kg bag", "saco de 25 kg", "25 kg sekk")], [L.storage, t("12 månader, oöppnad originalförpackning, torr miljö", "12 months, unopened original packaging, dry conditions", "12 meses, envase original cerrado, en seco", "12 måneder, uåpnet originalemballasje, tørt")]] },
      ],
    },
    // ------------------------------------------------------------------ Planitop Rasa & Ripara R4
    {
      slug: "planitop-rasa-ripara-r4", name: "Planitop Rasa & Ripara R4", related: ["redirep-45-rsf", "mapepoxy-l", "montocryl"],
      intro: t(
        "Planitop Rasa & Ripara R4 (Planitop Smooth & Repair R4) är ett snabbhärdande, tixotropt och fiberarmerat cementbruk i klass R4 för strukturella reparationer och skrapning av inre och yttre betongytor, både horisontella och vertikala. Bruket har mycket god utmattningshållfasthet, minst 300 000 cykler, och är klimatkompenserat över hela livscykeln.",
        "Planitop Rasa & Ripara R4 (Planitop Smooth & Repair R4) is a fast-curing, thixotropic, fibre-reinforced cementitious mortar of class R4 for structural repairs and skim-coating of interior and exterior concrete surfaces, both horizontal and vertical. The mortar has very good fatigue behaviour, at least 300,000 cycles, and is climate-compensated over its whole life cycle.",
        "Planitop Rasa & Ripara R4 (Planitop Smooth & Repair R4) es un mortero cementoso de curado rápido, tixotrópico y reforzado con fibras, de clase R4, para reparaciones estructurales y enlucido de superficies de hormigón interiores y exteriores, tanto horizontales como verticales. El mortero tiene un comportamiento a fatiga muy bueno, al menos 300.000 ciclos, y está compensado climáticamente durante todo su ciclo de vida.",
        "Planitop Rasa & Ripara R4 (Planitop Smooth & Repair R4) er en hurtigherdende, tiksotrop og fiberarmert sementmørtel i klasse R4 for strukturelle reparasjoner og avretting av innvendige og utvendige betongflater, både horisontale og vertikale. Mørtelen har svært god utmattingsfasthet, minst 300 000 sykluser, og er klimakompensert over hele livssyklusen."),
      bullets: {
        sv: ["Klass R4 enligt EN 1504-3, typ CC", "Snabb härdning, kan appliceras i tunna skikt", "Förbättrad vidhäftning och lätt att bygga upp i tjocka skikt", "Slät finish", "Utmärkt utmattningsbeteende, minst 300 000 cykler", "Uppfyller även EN 1504-2 (beläggning)"],
        en: ["Class R4 to EN 1504-3, type CC", "Fast curing, can be applied in thin layers", "Improved adhesion and easy to build up in thick layers", "Smooth finish", "Excellent fatigue behaviour, at least 300,000 cycles", "Also meets EN 1504-2 (coating)"],
        es: ["Clase R4 según EN 1504-3, tipo CC", "Curado rápido, aplicable en capas finas", "Mejor adherencia y fácil de aplicar en capas gruesas", "Acabado liso", "Excelente comportamiento a fatiga, al menos 300.000 ciclos", "Cumple también EN 1504-2 (revestimiento)"],
        no: ["Klasse R4 etter EN 1504-3, type CC", "Hurtigherdende, kan påføres i tynne lag", "Bedre heft og lett å bygge opp i tykke lag", "Glatt finish", "Utmerket utmattingsfasthet, minst 300 000 sykluser", "Oppfyller også EN 1504-2 (belegg)"] },
      tile: { sv: ["Strukturbruk R4, 25 kg", "Åtgång: 17 kg/m² per cm"], en: ["Structural mortar R4, 25 kg", "Consumption: 17 kg/m² per cm"], es: ["Mortero estructural R4, 25 kg", "Consumo: 17 kg/m² por cm"], no: ["Strukturmørtel R4, 25 kg", "Forbruk: 17 kg/m² per cm"] },
      usage: { value: "17 kg/m²", unit: t("per cm tjocklek", "per cm of thickness", "por cm de espesor", "per cm tykkelse"), meta: t("3-40 mm per skikt", "3-40 mm per layer", "3-40 mm por capa", "3-40 mm per lag"),
        note: t("Ungefärlig åtgång. Verklig åtgång beror på underlagets ojämnheter.", "Approximate consumption. Actual consumption depends on the unevenness of the substrate.", "Consumo aproximado. El consumo real depende de las irregularidades del soporte.", "Omtrentlig forbruk. Faktisk forbruk avhenger av underlagets ujevnheter.") },
      docs: [D("tekniskt-datablad", "tds"), D("sakerhetsdatablad", "sds"),
        { type: "dop", file: "prestandadeklaration-en-1504-3", label: t("Prestandadeklaration (DoP), EN 1504-3", "Declaration of performance (DoP), EN 1504-3", "Declaración de prestaciones (DoP), EN 1504-3", "Ytelseserklæring (DoP), EN 1504-3") },
        { type: "dop", file: "prestandadeklaration-en-1504-2", label: t("Prestandadeklaration (DoP), EN 1504-2", "Declaration of performance (DoP), EN 1504-2", "Declaración de prestaciones (DoP), EN 1504-2", "Ytelseserklæring (DoP), EN 1504-2") },
        D("epd", "epd")],
      areas: {
        sv: ["Strukturella reparationer av betong, invändigt och utvändigt", "Skrapning och avjämning av horisontella och vertikala betongytor", "Reparation av konstruktioner som utsätts för luft eller är i permanent kontakt med vatten"],
        en: ["Structural repairs of concrete, indoors and outdoors", "Skim-coating and levelling of horizontal and vertical concrete surfaces", "Repair of structures exposed to air or in permanent contact with water"],
        es: ["Reparaciones estructurales de hormigón, en interior y exterior", "Enlucido y nivelación de superficies de hormigón horizontales y verticales", "Reparación de estructuras expuestas al aire o en contacto permanente con agua"],
        no: ["Strukturelle reparasjoner av betong, innvendig og utvendig", "Avretting og utjevning av horisontale og vertikale betongflater", "Reparasjon av konstruksjoner som utsettes for luft eller er i permanent kontakt med vann"] },
      groups: [
        { title: G.product, rows: [[t("Klassificering", "Classification", "Clasificación", "Klassifisering"), "EN 1504-3, klass R4"], [L.type, "CC (EN 1504-1)"], [L.colour, grey], [L.consistency, powder], [L.maxgrain, "0,4 mm"], [L.chloride, "≤ 0,05 %"]] },
        { title: G.application, rows: [[L.mix, t("100 delar produkt + 18 % vatten", "100 parts product + 18 % water", "100 partes de producto + 18 % de agua", "100 deler produkt + 18 % vann")], [L.density, "ca 2 000 kg/m³"], [L.layer, "3-40 mm"], [sfx(L.pot, " (+20 °C)"), "ca 10 min"], [t("Härdningstid", "Curing time", "Tiempo de curado", "Herdetid"), "ca 30 min"], [L.temp, "+5 °C till +35 °C"]] },
        { title: G.pack, rows: [[L.pack, t("25 kg säckar", "25 kg bags", "sacos de 25 kg", "25 kg sekker")], [L.storage, t("upp till 12 månader, torrt och skyddat, +5 °C till +35 °C", "up to 12 months, dry and protected, +5 °C to +35 °C", "hasta 12 meses, en seco y protegido, +5 °C a +35 °C", "opptil 12 måneder, tørt og beskyttet, +5 °C til +35 °C")]] },
      ],
    },
    // ------------------------------------------------------------------ Montocryl
    {
      slug: "montocryl", name: "Montocryl", related: ["mapepoxy-l", "redirep-45-rsf", "planitop-rasa-ripara-r4"],
      basta: { url: "https://www.bastaonline.se/foretag/206-mapei-ab/artiklar/736738-montocryl-comp-b", image: "mapei-basta-montocryl" },
      intro: t(
        "Montocryl är ett tvåkomponents, snabbhärdande monteringsbruk baserat på metylmetakrylat (PMMA) för förankring av bultar och armeringsjärn i berg och betong och för montering av betongelement. Det fungerar även vid låga temperaturer, ned till -15 °C, och kan användas som reparationsbruk på horisontella betongytor och för undergjutning av mindre fundament.",
        "Montocryl is a two-component, fast-curing mounting mortar based on methyl methacrylate (PMMA) for anchoring bolts and reinforcing bars in rock and concrete and for fixing concrete elements. It also works at low temperatures, down to -15 °C, and can be used as a repair mortar on horizontal concrete surfaces and for grouting under small foundations.",
        "Montocryl es un mortero de montaje bicomponente de curado rápido a base de metacrilato de metilo (PMMA) para el anclaje de pernos y barras de armadura en roca y hormigón y para el montaje de elementos de hormigón. También funciona a bajas temperaturas, hasta -15 °C, y puede usarse como mortero de reparación en superficies horizontales de hormigón y para el relleno bajo pequeñas cimentaciones.",
        "Montocryl er en todelt, hurtigherdende monteringsmørtel basert på metylmetakrylat (PMMA) for forankring av bolter og armeringsjern i berg og betong og for montering av betongelementer. Den fungerer også ved lave temperaturer, ned til -15 °C, og kan brukes som reparasjonsmørtel på horisontale betongflater og til understøpning av mindre fundamenter."),
      bullets: {
        sv: ["Härdar snabbt, även vid -15 °C", "Hög hållfasthet: tryckhållfasthet 80 N/mm² efter 1 timme (+20 °C)", "Förankring av bultar och armeringsjärn i berg och betong", "Montering av betongelement, ingjutna hylsor och kärnborrade hål", "Följer EN 1504-6", "Montocryl Comp. B är registrerad i BASTA"],
        en: ["Cures fast, even at -15 °C", "High strength: compressive strength 80 N/mm² after 1 hour (+20 °C)", "Anchoring of bolts and reinforcing bars in rock and concrete", "Fixing of concrete elements, cast-in sleeves and core-drilled holes", "Complies with EN 1504-6", "Montocryl Comp. B is registered in BASTA"],
        es: ["Cura rápido, incluso a -15 °C", "Alta resistencia: resistencia a compresión de 80 N/mm² tras 1 hora (+20 °C)", "Anclaje de pernos y barras de armadura en roca y hormigón", "Montaje de elementos de hormigón, manguitos embebidos y taladros con corona", "Cumple EN 1504-6", "Montocryl Comp. B está registrado en BASTA"],
        no: ["Herder raskt, selv ved -15 °C", "Høy fasthet: trykkfasthet 80 N/mm² etter 1 time (+20 °C)", "Forankring av bolter og armeringsjern i berg og betong", "Montering av betongelementer, innstøpte hylser og kjernebor-hull", "Følger EN 1504-6", "Montocryl Comp. B er registrert i BASTA"] },
      tile: { sv: ["Förankringsbruk (PMMA), 13,9 kg", "Åtgång: 2,3 kg/l"], en: ["Anchoring mortar (PMMA), 13.9 kg", "Consumption: 2.3 kg/l"], es: ["Mortero de anclaje (PMMA), 13,9 kg", "Consumo: 2,3 kg/l"], no: ["Forankringsmørtel (PMMA), 13,9 kg", "Forbruk: 2,3 kg/l"] },
      usage: { value: "2,3 kg/l", unit: t("färdig massa", "of mixed mortar", "de mortero mezclado", "ferdig masse"), meta: t("vid undergjutning", "for grouting", "para relleno bajo placas", "ved understøpning"),
        note: t("Vid bultförankring beror åtgången på hål- och bultdiameter och förankringsdjup, se tabellen nedan.", "For bolt anchoring the consumption depends on the hole and bolt diameters and the anchoring depth, see the table below.", "En el anclaje de pernos el consumo depende de los diámetros del agujero y del perno y de la profundidad de anclaje, véase la tabla siguiente.", "Ved boltforankring avhenger forbruket av hull- og boltdiameter og forankringsdybde, se tabellen nedenfor.") },
      docs: [D("tekniskt-datablad", "tds"), D("sakerhetsdatablad", "sds"), D("prestandadeklaration", "dop")],
      areas: {
        sv: ["Förankring av bultar och armeringsjärn i berg och betong", "Montering av betongelement: ingjutna hylsor och kärnborrade hål", "Undergjutning av mindre fundament som kräver bruk med hög hållfasthet och snabb härdning", "Reparationsbruk på horisontella betongytor"],
        en: ["Anchoring of bolts and reinforcing bars in rock and concrete", "Fixing of concrete elements: cast-in sleeves and core-drilled holes", "Grouting under small foundations that need a high-strength, fast-curing mortar", "Repair mortar on horizontal concrete surfaces"],
        es: ["Anclaje de pernos y barras de armadura en roca y hormigón", "Montaje de elementos de hormigón: manguitos embebidos y taladros con corona", "Relleno bajo pequeñas cimentaciones que requieren un mortero de alta resistencia y curado rápido", "Mortero de reparación en superficies horizontales de hormigón"],
        no: ["Forankring av bolter og armeringsjern i berg og betong", "Montering av betongelementer: innstøpte hylser og kjerneborede hull", "Understøpning av mindre fundamenter som krever mørtel med høy fasthet og rask herding", "Reparasjonsmørtel på horisontale betongflater"] },
      steps: {
        sv: ["Betongen eller stenen ska vara ren och torr, fri från damm, olja och andra föroreningar. Luft och underlag ska vara varmare än -15 °C", "Häll komponent A i komponent B och blanda med långsamgående borr och visp i minst 3 minuter. Produkten får inte spädas. Brukstid cirka 10 minuter", "Vid bultförankring: borra hålet minst 10 mm större än bultens diameter, rengör hålet och häll i Montocryl, t.ex. med tratt. Pressa bulten på plats och fixera tills bruket härdat"],
        en: ["The concrete or stone must be clean and dry, free of dust, oil and other contaminants. Air and substrate must be warmer than -15 °C", "Pour component A into component B and mix with a slow-speed drill and paddle for at least 3 minutes. Do not dilute the product. Pot life about 10 minutes", "For bolt anchoring: drill the hole at least 10 mm larger than the bolt diameter, clean the hole and pour in Montocryl, e.g. with a funnel. Press the bolt into place and fix it until the mortar has cured"],
        es: ["El hormigón o la piedra debe estar limpio y seco, sin polvo, aceite ni otros contaminantes. El aire y el soporte deben estar por encima de -15 °C", "Vierta el componente A en el componente B y mezcle con un taladro de baja velocidad y mezclador durante al menos 3 minutos. No diluir el producto. Tiempo de trabajabilidad de unos 10 minutos", "Para el anclaje de pernos: taladre el agujero al menos 10 mm mayor que el diámetro del perno, límpielo y vierta Montocryl, p. ej. con un embudo. Presione el perno en su sitio y fíjelo hasta que el mortero haya curado"],
        no: ["Betongen eller steinen skal være ren og tørr, fri for støv, olje og andre forurensninger. Luft og underlag skal være varmere enn -15 °C", "Hell komponent A i komponent B og bland med saktegående bor og visp i minst 3 minutter. Produktet skal ikke tynnes. Brukstid cirka 10 minutter", "Ved boltforankring: bor hullet minst 10 mm større enn boltens diameter, rengjør hullet og hell i Montocryl, f.eks. med trakt. Press bolten på plass og fikser den til mørtelen er herdet"] },
      groups: [
        { title: G.product, rows: [[t("Komponent A", "Component A", "Componente A", "Komponent A"), t("transparent vätska", "transparent liquid", "líquido transparente", "gjennomsiktig væske")], [t("Komponent B", "Component B", "Componente B", "Komponent B"), t("grå, pulver", "grey, powder", "gris, polvo", "grå, pulver")]] },
        { title: G.application, rows: [[L.mix, "1,7 : 12,2 (A : B)"], [t("Färg efter blandning", "Colour after mixing", "Color tras la mezcla", "Farge etter blanding"), grey], [L.consistency, thickLiquid], [L.density, "2 250 kg/m³"], [t("Brukstemperatur", "Working temperature", "Temperatura de trabajo", "Brukstemperatur"), "-15 °C till +20 °C"], [L.pot, "ca 10 min"]] },
        { title: G.pack, rows: [[L.pack, t("13,9 kg sats (komponent A 1,7 kg + komponent B 12,2 kg)", "13.9 kg kit (component A 1.7 kg + component B 12.2 kg)", "kit de 13,9 kg (componente A 1,7 kg + componente B 12,2 kg)", "13,9 kg sett (komponent A 1,7 kg + komponent B 12,2 kg)")], [L.storage, t("6 månader, torrt och svalt, skyddat mot värmekällor", "6 months, dry and cool, protected from heat sources", "6 meses, en seco y fresco, protegido de fuentes de calor", "6 måneder, tørt og kjølig, beskyttet mot varmekilder")]] },
      ],
      tables: [
        { title: t("Åtgång vid bultförankring", "Consumption for bolt anchoring", "Consumo en el anclaje de pernos", "Forbruk ved boltforankring"),
          header: [t("Bult Ø (mm)", "Bolt Ø (mm)", "Perno Ø (mm)", "Bolt Ø (mm)"), t("Hål Ø (mm)", "Hole Ø (mm)", "Agujero Ø (mm)", "Hull Ø (mm)"), t("Djup (mm)", "Depth (mm)", "Profundidad (mm)", "Dybde (mm)"), t("Åtgång per bult (kg)", "Consumption per bolt (kg)", "Consumo por perno (kg)", "Forbruk per bolt (kg)")],
          rows: [["16", "26", "500", "0,37"], ["20", "30", "500", "0,44"], ["24", "34", "500", "0,51"], ["32", "42", "500", "0,65"]], align: "center" },
        { title: t("Hållfasthetsutveckling", "Strength development", "Desarrollo de la resistencia", "Fasthetsutvikling"),
          header: [t("N/mm²", "N/mm²", "N/mm²", "N/mm²"), t("1 tim", "1 h", "1 h", "1 t"), t("2 tim", "2 h", "2 h", "2 t"), t("3 tim", "3 h", "3 h", "3 t"), t("24 tim", "24 h", "24 h", "24 t"), t("7 dygn", "7 days", "7 días", "7 døgn")],
          rows: [
            [t("Tryckhållfasthet +20 °C", "Compressive strength +20 °C", "Resistencia a compresión +20 °C", "Trykkfasthet +20 °C"), "80", "85", "87", "93", "98"],
            [t("Tryckhållfasthet -15 °C", "Compressive strength -15 °C", "Resistencia a compresión -15 °C", "Trykkfasthet -15 °C"), "-", "40", "50", "66", "85"],
            [t("Böjhållfasthet +20 °C", "Flexural strength +20 °C", "Resistencia a flexión +20 °C", "Bøyefasthet +20 °C"), "21", "24", "24", "24", "27"],
            [t("Böjhållfasthet -15 °C", "Flexural strength -15 °C", "Resistencia a flexión -15 °C", "Bøyefasthet -15 °C"), "-", "19", "23", "26", "28"]], align: "center" },
      ],
    },
  ],
};
