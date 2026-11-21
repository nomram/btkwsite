/* Small models and simulations for non-technical visitors (loaded only on pages that have a "widget" block).
   Everything runs in the browser, nothing is sent or stored. The models are deliberately simple rules of thumb: they show how things
   move together, they do not replace a design or the data sheet of a product. */
(function () {
  "use strict";
  var LANG = ((document.documentElement.lang || "sv") + "").slice(0, 2) === "en" ? "en" : "sv";
  var NS = "http://www.w3.org/2000/svg";
  var REDUCE = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var TX = {
    sv: {
      mpa: "MPa", model: "Så räknar vi", disclaimer: "Förenklad modell för att förstå sambanden. Den ersätter inte beräkning, provning eller produktens datablad.",
      vct: {
        vct: "Vattencementtal (vct)", kons: "Konsistens", cem: "Cementtyp", kStel: "Stel", kPlast: "Plastisk", kFlyt: "Flytande",
        rCem: "Cement", rWater: "Vatten", rAgg: "Sten och sand", rStr: "Hållfasthet efter 28 dygn", unitKgM3: "kg per m³", unitLM3: "liter per m³", approx: "ungefär",
        barTitle: "En kubikmeter betong, uppdelad på volym", air: "Luft", pores: "Cementpastan förstorad: de blå rutorna är porer (hålrum)", porPct: "porer i cementpastan",
        extra: "Häller du i 10 liter extra vatten per kubikmeter blir vct {a} och hållfastheten sjunker med ungefär {b} MPa.",
        lowVct: "Under cirka 0,40 räcker vattnet inte för att all cement ska reagera. Då används oftast flyttillsats för att betongen ska gå att gjuta.",
        lowCem: "Mycket lite cement: betongen blir svag och svår att arbeta med.", highCem: "Hög cementhalt: mer värmeutveckling och krympning, och därmed större risk för sprickor.",
        highVct: "Hög vct ger en porös betong som är mindre tät och tål frost och vatten sämre.", goodVct: "Ett vct i det här området är vanligt för många konstruktioner utomhus.",
        how: "Cement = vatten / vct. Volymen fylls ut med sten och sand (cement 3,1 kg/l, ballast 2,65 kg/l, 2 % luft). Hållfastheten följer en vanlig tumregel där den sjunker ungefär exponentiellt med vct, och porerna i pastan räknas med Powers modell för kapillärporer."
      },
      harda: {
        cem: "Cementtyp", temp: "Temperatur", f28: "Hållfasthet efter 28 dygn", day: "Tid efter gjutning", day1: "dygn",
        c1: "Långsamt härdande (32,5 N)", c2: "Normal (32,5 R, 42,5 N)", c3: "Snabb (42,5 R, 52,5)", now: "Efter {d} dygn: {p} % av 28-dygnshållfastheten, ungefär {m} MPa", reach: "Så lång tid tar det att nå", pct: "{p} % av slutstyrkan efter 28 dygn",
        days: "dygn", axisX: "dygn efter gjutning", axisY: "% av 28 dygn", cold: "Under cirka +5 °C går härdningen mycket långsamt. Skydda betongen mot kyla.", frozen: "Vid frost står härdningen i praktiken still, och ung betong kan skadas av frost. Skydda och värm.",
        wet: "Betong torkar inte, den reagerar kemiskt med vatten. Håll den fuktig i början så att reaktionen kan fortsätta.", never: "mer än 90",
        how: "Formeln är den som används i Eurocode 2: styrka(t) = exp(s · (1 − √(28/t))) av 28-dygnsstyrkan, där s beror på cementtyp. Temperaturen räknas om till en ”mognadstid” enligt standarden: kallare betong åldras långsammare."
      },
      inj: {
        press: "Injekteringstryck", gap: "Spricköppning", mix: "Bruk", grain: "Cement", unitBar: "bar", unitMm: "mm", m1: "Mycket tunt (vct 1,2)", m2: "Tunt (vct 0,8)", m3: "Normalt (vct 0,6)", m4: "Tjockt (vct 0,45)",
        g1: "Vanligt cement", g2: "Mikrocement (finare)", reach: "Räckvidd ungefär", tooNarrow: "Sprickan är för smal: kornen i bruket fastnar vid mynningen och bruket kommer inte in.", over: "mer än {n} m (teoretiskt)",
        compare: "Samma tryck och spricka, olika bruk", pump: "Pumpa igen", rock: "berg", hole: "borrhål", note: "Räckvidden är den teoretiska gränsen när bruket slutar flyta. I praktiken begränsas den också av tid, mängd och hur sprickorna ser ut.",
        rule: "Tumregel: sprickan bör vara minst fyra gånger större än de största kornen ({n} mm här).",
        how: "För ett bruk med sträckgräns (Bingham) är den största räckvidden R = tryck × spricköppning / (2 × sträckgräns). Sträckgränsen är hur ”seg” bruket är innan det börjar flyta: tunna bruk når långt, tjocka kort. Värdena för sträckgräns är ungefärliga och beror på cement och tillsatser."
      },
      atg: {
        area: "Yta", thick: "Tjocklek", prod: "Material", spill: "Spill och marginal", p1: "Flytspackel (cirka 1,8 kg per m² och mm)", p2: "Cementbaserat bruk eller puts (cirka 1,6)", p3: "Reparationsbruk (cirka 2,0)", custom: "Egen åtgång (kg per m² och mm)",
        total: "Totalt material", bags: "Säckar à 25 kg", big: "Storsäckar à 1 000 kg", water: "Vatten (cirka 0,2 l per kg)", silo: "Av en torrbruksilo på cirka 10 ton", mixer: "Blandningstid i en ST-5 (200 till 400 kg per minut)", min: "minuter", l: "liter",
        note: "Åtgången varierar med produkt och underlag. Använd värdena i produktens datablad när du beställer.",
        how: "Material = yta × tjocklek × åtgång per mm × (1 + marginal). Säckar och storsäckar avrundas uppåt. Vattenmängden är ett typiskt värde för flytspackel, kontrollera databladet."
      },
      vad: {
        t1: "Cement", t2: "Cementpasta", t3: "Bruk", t4: "Betong", cement: "Cement", water: "Vatten", sand: "Sand", stone: "Sten", air: "Luft",
        d1: "Ett fint grått pulver som är bindemedlet. Cement är inte samma sak som betong.", d2: "Cement och vatten rörs ihop. Det hårdnar till en stenhård massa och är limmet i allt annat.",
        d3: "Cementpasta och sand. Används till murning, putsning och som torrbruk i silo.", d4: "Cementpasta, sand och sten. Sten gör betongen billig, stark och formstabil. Ofta med armering av stål.", vol: "ungefärliga volymandelar"
      },
      vol: {
        shape: "Form", s1: "Platta", s2: "Vägg eller sträckfundament", s3: "Pelare", len: "Längd", wid: "Bredd", tSlab: "Tjocklek", tWall: "Tjocklek", hgt: "Höjd", dia: "Diameter", cnt: "Antal pelare", margin: "Marginal",
        vol: "Volym", order: "Beställ ungefär", weight: "Vikt", trucks: "Betongbilar à 8 m³", cars: "Motsvarar personbilar i vikt", bags: "Torrbetongsäckar à 25 kg", tn: "ton", m3: "m³", pcs: "st",
        note: "Volymen är ren geometri. Lägg på marginal för ojämn botten, spill och att formen buktar. Betongleverantören har egna lastvolymer och minimimängder, så fråga dem.",
        small: "Under en kubikmeter kan torrbetong i säck vara enklare än att beställa bil.", sizeSlab: "{a} × {b} m, {c} cm tjock", sizeWall: "{a} m lång, {b} m hög, {c} cm tjock", sizeCol: "{n} pelare, {a} cm i diameter, {b} m höga",
        how: "Platta = längd × bredd × tjocklek. Vägg = längd × höjd × tjocklek. Pelare = π × (diameter / 2)² × höjd × antal. Vikten räknas med 2 400 kg per m³ (vanlig betong), en betongbil med 8 m³ och en personbil på 1,5 ton. Säckarna räknas med cirka 80 säckar per m³."
      },
      kl: {
        cls: "Hållfasthetsklass", side: "Kubens sida", cyl: "Cylinderhållfasthet", cube: "Kubhållfasthet", force: "Last innan kuben krossas", own: "Kubens egen vikt", times: "Gånger sin egen vikt", tn: "ton", kg: "kg", cm: "cm", cars: "Det motsvarar i vikt ungefär {n} personbilar", more: "Det är cirka {n} gånger kubens egen vikt.",
        note: "Så skulle det gå i ett laboratorium, där lasten läggs jämnt över hela ytan. I en riktig konstruktion delas lasten mellan flera delar och man räknar med säkerhetsfaktorer.",
        min: "Siffrorna efter C är minimivärden (karakteristiska värden) efter 28 dygn: först cylinder, sedan kub.",
        how: "Hållfasthetsklassen C25/30 betyder att betongen ska klara minst 25 MPa på en cylinder och 30 MPa på en kub efter 28 dygn. Lasten som kuben tål = kubhållfasthet × sidans area (1 MPa = 1 N per mm²), omräknat till ton. Vikten räknas med 2 400 kg per m³ och personbilen med 1,5 ton."
      }
    },
    en: {
      mpa: "MPa", model: "How we calculate", disclaimer: "A simplified model to understand how things relate. It does not replace calculation, testing or the data sheet of a product.",
      vct: {
        vct: "Water/cement ratio (w/c)", kons: "Consistency", cem: "Cement type", kStel: "Stiff", kPlast: "Plastic", kFlyt: "Flowing",
        rCem: "Cement", rWater: "Water", rAgg: "Stone and sand", rStr: "Strength after 28 days", unitKgM3: "kg per m³", unitLM3: "litres per m³", approx: "about",
        barTitle: "One cubic metre of concrete, split by volume", air: "Air", pores: "The cement paste enlarged: the blue squares are pores (voids)", porPct: "pores in the cement paste",
        extra: "If you pour in 10 litres of extra water per cubic metre the w/c becomes {a} and the strength drops by about {b} MPa.",
        lowVct: "Below about 0.40 there is not enough water for all the cement to react. A plasticiser is then usually used so the concrete can still be cast.",
        lowCem: "Very little cement: the concrete will be weak and hard to work with.", highCem: "High cement content: more heat and shrinkage, and so a higher risk of cracks.",
        highVct: "A high w/c gives a porous concrete that is less dense and resists frost and water less well.", goodVct: "A w/c in this range is common for many outdoor structures.",
        how: "Cement = water / w/c. The volume is filled with stone and sand (cement 3.1 kg/l, aggregate 2.65 kg/l, 2 % air). Strength follows a common rule of thumb in which it falls roughly exponentially with w/c, and the pores in the paste use Powers’ model for capillary pores."
      },
      harda: {
        cem: "Cement type", temp: "Temperature", f28: "Strength after 28 days", day: "Time after casting", day1: "days",
        c1: "Slow hardening (32.5 N)", c2: "Normal (32.5 R, 42.5 N)", c3: "Fast (42.5 R, 52.5)", now: "After {d} days: {p} % of the 28-day strength, about {m} MPa", reach: "How long it takes to reach", pct: "{p} % of the 28-day strength",
        days: "days", axisX: "days after casting", axisY: "% of 28 days", cold: "Below about +5 °C hardening is very slow. Protect the concrete from the cold.", frozen: "In frost hardening practically stops, and young concrete can be damaged by freezing. Protect and heat.",
        wet: "Concrete does not dry, it reacts chemically with water. Keep it moist at the start so the reaction can continue.", never: "more than 90",
        how: "The formula is the one used in Eurocode 2: strength(t) = exp(s · (1 − √(28/t))) of the 28-day strength, where s depends on the cement type. Temperature is converted to a “maturity age” as in the standard: colder concrete ages more slowly."
      },
      inj: {
        press: "Grouting pressure", gap: "Fracture aperture", mix: "Grout", grain: "Cement", unitBar: "bar", unitMm: "mm", m1: "Very thin (w/c 1.2)", m2: "Thin (w/c 0.8)", m3: "Normal (w/c 0.6)", m4: "Thick (w/c 0.45)",
        g1: "Ordinary cement", g2: "Microfine cement", reach: "Reach about", tooNarrow: "The fracture is too narrow: the grains in the grout block the entrance and the grout does not get in.", over: "more than {n} m (theoretical)",
        compare: "Same pressure and fracture, different grouts", pump: "Pump again", rock: "rock", hole: "borehole", note: "The reach is the theoretical limit where the grout stops flowing. In practice it is also limited by time, volume and the shape of the fractures.",
        rule: "Rule of thumb: the fracture should be at least four times larger than the largest grains ({n} mm here).",
        how: "For a grout with a yield stress (Bingham fluid) the maximum reach is R = pressure × aperture / (2 × yield stress). The yield stress is how “stiff” the grout is before it starts to flow: thin grouts reach far, thick ones short. The yield stress values are approximate and depend on the cement and additives."
      },
      atg: {
        area: "Area", thick: "Thickness", prod: "Material", spill: "Waste and margin", p1: "Self-levelling screed (about 1.8 kg per m² and mm)", p2: "Cement-based mortar or render (about 1.6)", p3: "Repair mortar (about 2.0)", custom: "Own consumption (kg per m² and mm)",
        total: "Total material", bags: "Bags of 25 kg", big: "Big bags of 1,000 kg", water: "Water (about 0.2 l per kg)", silo: "Of a dry mortar silo of about 10 tonnes", mixer: "Mixing time in an ST-5 (200 to 400 kg per minute)", min: "minutes", l: "litres",
        note: "Consumption varies with product and substrate. Use the values in the product’s data sheet when you order.",
        how: "Material = area × thickness × consumption per mm × (1 + margin). Bags and big bags are rounded up. The water amount is a typical value for self-levelling screed, check the data sheet."
      },
      vad: {
        t1: "Cement", t2: "Cement paste", t3: "Mortar", t4: "Concrete", cement: "Cement", water: "Water", sand: "Sand", stone: "Stone", air: "Air",
        d1: "A fine grey powder that is the binder. Cement is not the same thing as concrete.", d2: "Cement and water mixed together. It hardens into a rock-hard mass and is the glue in everything else.",
        d3: "Cement paste and sand. Used for bricklaying, rendering and as dry mortar in a silo.", d4: "Cement paste, sand and stone. The stone makes the concrete cheap, strong and stable. Often reinforced with steel.", vol: "approximate shares by volume"
      },
      vol: {
        shape: "Shape", s1: "Slab", s2: "Wall or strip footing", s3: "Column", len: "Length", wid: "Width", tSlab: "Thickness", tWall: "Thickness", hgt: "Height", dia: "Diameter", cnt: "Number of columns", margin: "Margin",
        vol: "Volume", order: "Order about", weight: "Weight", trucks: "Mixer trucks of 8 m³", cars: "Weighs as many cars as", bags: "Dry concrete bags of 25 kg", tn: "tonnes", m3: "m³", pcs: "pcs",
        note: "The volume is pure geometry. Add a margin for an uneven base, waste and formwork that bulges. The concrete supplier has its own load sizes and minimum volumes, so ask them.",
        small: "Under one cubic metre, bagged dry concrete can be easier than ordering a truck.", sizeSlab: "{a} × {b} m, {c} cm thick", sizeWall: "{a} m long, {b} m high, {c} cm thick", sizeCol: "{n} columns, {a} cm in diameter, {b} m high",
        how: "Slab = length × width × thickness. Wall = length × height × thickness. Column = π × (diameter / 2)² × height × number. The weight uses 2,400 kg per m³ (ordinary concrete), a mixer truck of 8 m³ and a car of 1.5 tonnes. Bags are counted at about 80 bags per m³."
      },
      kl: {
        cls: "Strength class", side: "Side of the cube", cyl: "Cylinder strength", cube: "Cube strength", force: "Load before the cube is crushed", own: "Weight of the cube", times: "Times its own weight", tn: "tonnes", kg: "kg", cm: "cm", cars: "That is about the weight of {n} cars", more: "That is about {n} times the weight of the cube itself.",
        note: "This is how it would go in a laboratory, where the load is spread evenly over the whole face. In a real structure the load is shared between several parts and safety factors are used.",
        min: "The numbers after C are minimum values (characteristic values) after 28 days: first cylinder, then cube.",
        how: "Strength class C25/30 means the concrete must withstand at least 25 MPa on a cylinder and 30 MPa on a cube after 28 days. The load the cube takes = cube strength × area of the face (1 MPa = 1 N per mm²), converted to tonnes. Weight uses 2,400 kg per m³ and a car of 1.5 tonnes."
      }
    }
  };
  var T = TX[LANG];

  // ---------- helpers ----------
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === "text") e.textContent = attrs[k]; else if (k === "html") e.innerHTML = attrs[k]; else e.setAttribute(k, attrs[k]); }
    (kids || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }
  function sv(tag, attrs, kids) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) { if (k === "text") e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); }
    (kids || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }
  function num(n, d) { return Number(n).toLocaleString(LANG === "sv" ? "sv-SE" : "en-GB", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  var uid = 0;
  function slider(label, min, max, step, val, fmt, onChange) {
    var id = "wg" + (++uid), out = el("output", { class: "wc__v", for: id }), inp = el("input", { type: "range", id: id, min: min, max: max, step: step, value: val });
    var box = el("div", { class: "wc" }, [el("label", { class: "wc__l", for: id, text: label }), out, inp]);
    function sync() { out.textContent = fmt(Number(inp.value)); var p = (inp.value - min) / (max - min) * 100; inp.style.setProperty("--p", p + "%"); }
    inp.addEventListener("input", function () { sync(); onChange(Number(inp.value)); });
    sync();
    return { box: box, input: inp, value: function () { return Number(inp.value); } };
  }
  function segmented(label, options, idx, onChange) {
    var name = "wg" + (++uid), box = el("div", { class: "wc", role: "radiogroup", "aria-label": label }, [el("span", { class: "wc__l", text: label })]), row = el("div", { class: "seg" });
    options.forEach(function (o, i) {
      var b = el("button", { type: "button", class: "seg__b" + (i === idx ? " is-on" : ""), role: "radio", "aria-checked": i === idx ? "true" : "false", text: o });
      b.addEventListener("click", function () { [].forEach.call(row.children, function (x, k) { x.classList.toggle("is-on", k === i); x.setAttribute("aria-checked", k === i ? "true" : "false"); }); onChange(i); });
      row.appendChild(b);
    });
    box.appendChild(row);
    return { box: box };
  }
  function select(label, options, idx, onChange) {
    var id = "wg" + (++uid), s = el("select", { id: id, class: "wc__sel" });
    options.forEach(function (o, i) { var op = el("option", { value: i, text: o }); if (i === idx) op.selected = true; s.appendChild(op); });
    s.addEventListener("change", function () { onChange(Number(s.value)); });
    return { box: el("div", { class: "wc" }, [el("label", { class: "wc__l", for: id, text: label }), s]) };
  }
  function stat(label, unit) { var v = el("strong", { class: "st__v" }), box = el("div", { class: "st" }, [v, el("span", { class: "st__l", text: label }), unit ? el("span", { class: "st__u", text: unit }) : null]); return { box: box, set: function (t) { v.textContent = t; } }; }
  function how(text) { return el("details", { class: "wgt__how" }, [el("summary", { text: T.model }), el("p", { text: text }), el("p", { class: "wgt__disc", text: T.disclaimer })]); }
  function seeded(seed) { var a = seed; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // ---------- 1. concrete mix and water/cement ratio ----------
  function buildVct(app) {
    var S = { vct: 0.5, k: 1, c: 1 }, WATER = [165, 180, 195], CF = [0.8, 1, 1.12];
    var W = T.vct;
    var sl = slider(W.vct, 0.35, 0.75, 0.01, 0.5, function (v) { return num(v, 2); }, function (v) { S.vct = v; draw(); });
    var kons = segmented(W.kons, [W.kStel, W.kPlast, W.kFlyt], 1, function (i) { S.k = i; draw(); });
    var cem = select(W.cem, ["CEM 32,5 N", "CEM 42,5 N", "CEM 52,5 R"].map(function (x) { return LANG === "en" ? x.replace(",", ".") : x; }), 1, function (i) { S.c = i; draw(); });
    var stC = stat(W.rCem, W.unitKgM3), stW = stat(W.rWater, W.unitLM3), stA = stat(W.rAgg, W.unitKgM3), stS = stat(W.rStr, T.mpa);
    var msg = el("ul", { class: "wmsg" }), extra = el("p", { class: "wgt__extra" });
    // composition bar
    var bar = sv("svg", { viewBox: "0 0 600 70", class: "wchart", role: "img", "aria-label": W.barTitle });
    var segs = ["agg", "cem", "wat", "air"].map(function (k) { var r = sv("rect", { y: 6, height: 32, class: "seg-" + k }); bar.appendChild(r); return r; });
    var legend = el("ul", { class: "wleg" });
    // pores
    var COLS = 30, ROWS = 14, rnd = seeded(7), cells = [], pores = sv("svg", { viewBox: "0 0 " + COLS * 10 + " " + ROWS * 10, class: "wchart wpores", role: "img", "aria-label": W.pores });
    for (var i = 0; i < COLS * ROWS; i++) { var r = rnd(), c = sv("rect", { x: (i % COLS) * 10 + 0.8, y: Math.floor(i / COLS) * 10 + 0.8, width: 8.4, height: 8.4, rx: 1.6 }); c._r = r; cells.push(c); pores.appendChild(c); }
    var porCap = el("p", { class: "wgt__cap" });
    function calc() {
      var water = WATER[S.k], cemKg = water / S.vct, cemL = cemKg / 3.1, air = 20, aggL = Math.max(0, 1000 - water - cemL - air), aggKg = aggL * 2.65;
      var f = 162.6 * Math.exp(-2.71 * S.vct) * CF[S.c], wc2 = (water + 10) / cemKg, f2 = 162.6 * Math.exp(-2.71 * wc2) * CF[S.c];
      var por = Math.max(0, (S.vct - 0.36 * 0.85) / (S.vct + 0.32));
      return { water: water, cemKg: cemKg, cemL: cemL, air: air, aggL: aggL, aggKg: aggKg, f: f, df: f - f2, wc2: wc2, por: por };
    }
    function draw() {
      var m = calc(), x = 0, tot = m.aggL + m.cemL + m.water + m.air;
      [["agg", m.aggL], ["cem", m.cemL], ["wat", m.water], ["air", m.air]].forEach(function (p, i) { var w = p[1] / tot * 600; segs[i].setAttribute("x", x); segs[i].setAttribute("width", Math.max(0, w)); x += w; });
      legend.innerHTML = "";
      [["agg", W.rAgg, m.aggL], ["cem", W.rCem, m.cemL], ["wat", W.rWater, m.water], ["air", W.air, m.air]].forEach(function (p) { legend.appendChild(el("li", {}, [el("i", { class: "sw sw-" + p[0] }), el("span", { text: p[1] + " " + num(p[2]) + " l" })])); });
      stC.set(num(m.cemKg)); stW.set(num(m.water)); stA.set(num(m.aggKg)); stS.set("≈ " + num(m.f));
      cells.forEach(function (c) { c.setAttribute("class", c._r < m.por ? "pore" : "paste"); });
      porCap.textContent = num(m.por * 100) + " % " + W.porPct;
      extra.textContent = W.extra.replace("{a}", num(m.wc2, 2)).replace("{b}", num(m.df, 1));
      msg.innerHTML = "";
      var notes = [];
      if (S.vct < 0.4) notes.push(["info", W.lowVct]);
      if (m.cemKg < 260) notes.push(["warn", W.lowCem]);
      if (m.cemKg > 450) notes.push(["warn", W.highCem]);
      if (S.vct > 0.6) notes.push(["warn", W.highVct]); else if (S.vct >= 0.4 && S.vct <= 0.55) notes.push(["ok", W.goodVct]);
      notes.forEach(function (n) { msg.appendChild(el("li", { class: "wmsg__" + n[0], text: n[1] })); });
    }
    app.appendChild(el("div", { class: "wgt__grid" }, [
      el("div", { class: "wgt__ctl" }, [sl.box, kons.box, cem.box, extra]),
      el("div", { class: "wgt__out" }, [el("div", { class: "stats" }, [stC.box, stW.box, stA.box, stS.box]), el("p", { class: "wgt__cap", text: W.barTitle }), bar, legend, pores, porCap, msg])
    ]));
    app.appendChild(how(W.how));
    draw();
  }

  // ---------- 2. strength development ----------
  function buildHarda(app, box) {
    var W = T.harda, S = { c: 1, T: 20, f: 30, d: 7 }, SV = [0.38, 0.25, 0.2];
    var pT = box && box.getAttribute("data-temp"), pC = box && box.getAttribute("data-cement");
    if (pT !== null && pT !== "" && !isNaN(Number(pT))) S.T = Math.max(-5, Math.min(35, Number(pT))); if (pC !== null && pC !== "" && !isNaN(Number(pC))) S.c = Math.max(0, Math.min(2, Number(pC)));
    var c = select(W.cem, [W.c1, W.c2, W.c3], S.c, function (i) { S.c = i; draw(); });
    var t = slider(W.temp, -5, 35, 1, S.T, function (v) { return num(v) + " °C"; }, function (v) { S.T = v; draw(); });
    var f = slider(W.f28, 20, 60, 5, 30, function (v) { return num(v) + " " + T.mpa; }, function (v) { S.f = v; draw(); });
    var d = slider(W.day, 1, 90, 1, 7, function (v) { return num(v) + " " + W.day1; }, function (v) { S.d = v; draw(); });
    var big = el("p", { class: "wgt__big", "aria-live": "polite" }), msg = el("ul", { class: "wmsg" }), miles = el("ul", { class: "wmiles" });
    var X0 = 44, Y0 = 18, CW = 500, CH = 190;
    var chart = sv("svg", { viewBox: "0 0 560 250", class: "wchart", role: "img", "aria-label": W.axisX });
    var grid = sv("g", { class: "wgrid" });
    [0, 25, 50, 75, 100].forEach(function (p) { var y = Y0 + CH - p / 120 * CH; grid.appendChild(sv("line", { x1: X0, x2: X0 + CW, y1: y, y2: y })); grid.appendChild(sv("text", { x: X0 - 6, y: y + 4, "text-anchor": "end", text: p })); });
    [0, 15, 30, 45, 60, 75, 90].forEach(function (dd) { var x = X0 + dd / 90 * CW; grid.appendChild(sv("text", { x: x, y: Y0 + CH + 18, "text-anchor": "middle", text: dd })); });
    grid.appendChild(sv("text", { x: X0 + CW / 2, y: 246, "text-anchor": "middle", class: "wax", text: W.axisX })); grid.appendChild(sv("text", { x: 4, y: 12, class: "wax", text: W.axisY }));
    var curve = sv("path", { class: "wcurve", fill: "none" }), area = sv("path", { class: "warea" }), mark = sv("circle", { r: 6, class: "wmark" }), line28 = sv("line", { class: "w28", y1: Y0, y2: Y0 + CH });
    chart.appendChild(grid); chart.appendChild(area); chart.appendChild(curve); chart.appendChild(line28); chart.appendChild(mark);
    function beta(day) {
      var rate = S.T <= 0 ? 0.02 : Math.exp(-(4000 / (273 + S.T) - 13.65)), tt = Math.max(0.3, day * rate);
      return Math.min(1.25, Math.exp(SV[S.c] * (1 - Math.sqrt(28 / tt))));
    }
    function daysFor(p) { for (var dd = 0.25; dd <= 90; dd += 0.25) if (beta(dd) >= p) return dd; return null; }
    function draw() {
      var pts = [], i;
      for (i = 0; i <= 90; i += 1) pts.push([X0 + i / 90 * CW, Y0 + CH - (i === 0 ? 0 : Math.min(1.2, beta(i))) * 100 / 120 * CH]);
      curve.setAttribute("d", "M" + pts.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join("L"));
      area.setAttribute("d", "M" + X0 + " " + (Y0 + CH) + "L" + pts.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join("L") + "L" + (X0 + CW) + " " + (Y0 + CH) + "Z");
      var b = beta(S.d), mx = X0 + S.d / 90 * CW, my = Y0 + CH - Math.min(1.2, b) * 100 / 120 * CH;
      mark.setAttribute("cx", mx); mark.setAttribute("cy", my); var x28 = X0 + 28 / 90 * CW; line28.setAttribute("x1", x28); line28.setAttribute("x2", x28);
      big.textContent = W.now.replace("{d}", S.d).replace("{p}", num(b * 100)).replace("{m}", num(b * S.f, 1));
      miles.innerHTML = "";
      [0.5, 0.7, 0.9].forEach(function (p) { var dd = daysFor(p); miles.appendChild(el("li", {}, [el("strong", { text: dd === null ? W.never : num(Math.ceil(dd)) }), el("span", { text: " " + W.days + " · " + W.pct.replace("{p}", Math.round(p * 100)) })])); });
      msg.innerHTML = "";
      if (S.T <= 0) msg.appendChild(el("li", { class: "wmsg__warn", text: W.frozen })); else if (S.T < 5) msg.appendChild(el("li", { class: "wmsg__warn", text: W.cold }));
      msg.appendChild(el("li", { class: "wmsg__info", text: W.wet }));
    }
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [c.box, t.box, f.box, d.box]), el("div", { class: "wgt__out" }, [big, chart, el("p", { class: "wgt__cap", text: W.reach }), miles, msg])]));
    app.appendChild(how(W.how));
    draw();
  }

  // ---------- 3. how far does grout reach ----------
  function buildInj(app) {
    var W = T.inj, S = { p: 8, b: 0.5, m: 2, g: 0 }, TAU = [2, 6, 15, 40], D95 = [0.08, 0.015];
    var p = slider(W.press, 1, 30, 1, 8, function (v) { return num(v) + " " + W.unitBar; }, function (v) { S.p = v; run(false); });
    var b = slider(W.gap, 0.1, 3, 0.05, 0.5, function (v) { return num(v, 2) + " " + W.unitMm; }, function (v) { S.b = v; run(false); });
    var mix = select(W.mix, [W.m1, W.m2, W.m3, W.m4], 2, function (i) { S.m = i; run(false); });
    var gr = select(W.grain, [W.g1, W.g2], 0, function (i) { S.g = i; run(false); });
    var big = el("p", { class: "wgt__big", "aria-live": "polite" }), msg = el("ul", { class: "wmsg" }), cmp = el("ul", { class: "wcmp" });
    var pump = el("button", { type: "button", class: "wbtn", text: W.pump });
    var VW = 600, VH = 250, X0 = 74, X1 = 580, Y = 125;
    var svgE = sv("svg", { viewBox: "0 0 " + VW + " " + VH, class: "wchart winj", role: "img", "aria-label": W.reach });
    var defs = sv("defs"), grad = sv("linearGradient", { id: "wgrout" + (++uid), x1: 0, x2: 1 }); grad.appendChild(sv("stop", { offset: "0", "stop-color": "#f37d03" })); grad.appendChild(sv("stop", { offset: "1", "stop-color": "#ffb866" })); defs.appendChild(grad); svgE.appendChild(defs);
    svgE.appendChild(sv("rect", { x: 0, y: 0, width: VW, height: VH, rx: 10, class: "wrock" }));
    var gapRect = sv("rect", { x: X0, y: Y - 2, width: X1 - X0, height: 4, class: "wgap" }), front = sv("rect", { x: X0, y: Y - 2, height: 4, width: 0, fill: "url(#" + grad.id + ")" }), tipDot = sv("circle", { r: 5, cy: Y, class: "wtip" });
    svgE.appendChild(gapRect); svgE.appendChild(front); svgE.appendChild(tipDot);
    svgE.appendChild(sv("rect", { x: 18, y: Y - 9, width: X0 - 18, height: 18, class: "whole" })); svgE.appendChild(sv("text", { x: 40, y: Y - 16, class: "wtxt", text: W.hole }));
    var ticks = sv("g", { class: "wgrid" });
    [0, 25, 50, 75, 100].forEach(function (m) { var x = X0 + m / 100 * (X1 - X0); ticks.appendChild(sv("line", { x1: x, x2: x, y1: Y + 30, y2: Y + 38 })); ticks.appendChild(sv("text", { x: x, y: Y + 54, "text-anchor": "middle", text: m + " m" })); });
    svgE.appendChild(ticks);
    var lbl = sv("text", { class: "wlbl", "text-anchor": "middle", y: Y - 22 }); svgE.appendChild(lbl);
    var cur = 0, raf = 0;
    function reach(tau) { return S.p * 1e5 * (S.b / 1000) / (2 * tau); }
    function target() { var minB = 4 * D95[S.g]; if (S.b < minB) return { r: 0, blocked: true, minB: minB }; return { r: reach(TAU[S.m]), blocked: false, minB: minB }; }
    function setFront(m, r, blocked) {
      var capped = Math.min(100, m), x = X0 + capped / 100 * (X1 - X0);
      front.setAttribute("width", Math.max(0, x - X0)); tipDot.setAttribute("cx", x); tipDot.setAttribute("opacity", blocked || m <= 0.01 ? 0 : 1);
      var th = 4 + S.b * 4; gapRect.setAttribute("height", th); gapRect.setAttribute("y", Y - th / 2); front.setAttribute("height", th); front.setAttribute("y", Y - th / 2);
      lbl.setAttribute("x", Math.min(VW - 50, Math.max(X0 + 30, x))); lbl.textContent = blocked ? "" : (m >= 100 ? "> 100 m" : "≈ " + num(m, m < 10 ? 1 : 0) + " m");
    }
    function run(replay) {
      var t = target(); cancelAnimationFrame(raf);
      big.textContent = t.blocked ? "" : W.reach + " " + (t.r > 100 ? W.over.replace("{n}", 100) : "≈ " + num(t.r, t.r < 10 ? 1 : 0) + " m");
      msg.innerHTML = "";
      if (t.blocked) msg.appendChild(el("li", { class: "wmsg__warn", text: W.tooNarrow }));
      msg.appendChild(el("li", { class: "wmsg__info", text: W.rule.replace("{n}", num(t.minB, 2)) })); msg.appendChild(el("li", { class: "wmsg__info", text: W.note }));
      cmp.innerHTML = "";
      [W.m1, W.m2, W.m3, W.m4].forEach(function (n, i) { var r = t.blocked ? 0 : reach(TAU[i]); cmp.appendChild(el("li", { class: i === S.m ? "is-on" : "" }, [el("span", { text: n }), el("span", { class: "wcmp__bar" }, [el("i", { style: "width:" + Math.min(100, r) + "%" })]), el("b", { text: t.blocked ? "–" : (r > 100 ? "> 100 m" : num(r, r < 10 ? 1 : 0) + " m") })])); });
      var from = replay ? 0 : cur, to = t.blocked ? 0 : t.r;
      if (REDUCE || from === to) { cur = to; setFront(to, t.r, t.blocked); return; }
      var t0 = performance.now(), D = replay ? 1400 : 500;
      (function step(now) { var u = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - u, 3); cur = from + (to - from) * e; setFront(cur, t.r, t.blocked); if (u < 1) raf = requestAnimationFrame(step); })(t0);
    }
    pump.addEventListener("click", function () { run(true); });
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [p.box, b.box, mix.box, gr.box, pump]), el("div", { class: "wgt__out" }, [big, svgE, el("p", { class: "wgt__cap", text: W.compare }), cmp, msg])]));
    app.appendChild(how(W.how));
    setFront(0, 0, false); run(true);
  }

  // ---------- 4. how much material ----------
  function buildAtg(app) {
    var W = T.atg, S = { a: 120, t: 10, p: 0, own: 1.8, s: 5 }, CONS = [1.8, 1.6, 2.0];
    var area = slider(W.area, 5, 1000, 5, 120, function (v) { return num(v) + " m²"; }, function (v) { S.a = v; draw(); });
    var th = slider(W.thick, 1, 100, 1, 10, function (v) { return num(v) + " mm"; }, function (v) { S.t = v; draw(); });
    var prod = select(W.prod, [W.p1, W.p2, W.p3, W.custom], 0, function (i) { S.p = i; own.box.hidden = i !== 3; draw(); });
    var own = slider(W.custom, 0.5, 3, 0.1, 1.8, function (v) { return num(v, 1); }, function (v) { S.own = v; draw(); });
    own.box.hidden = true;
    var sp = slider(W.spill, 0, 15, 1, 5, function (v) { return num(v) + " %"; }, function (v) { S.s = v; draw(); });
    var sTot = stat(W.total, "kg"), sBag = stat(W.bags), sBig = stat(W.big), sWat = stat(W.water, W.l), sSilo = stat(W.silo, "%"), sMix = stat(W.mixer, W.min);
    var icons = el("div", { class: "wbags", "aria-hidden": "true" }), msg = el("ul", { class: "wmsg" });
    function draw() {
      var cons = S.p === 3 ? S.own : CONS[S.p], kg = S.a * S.t * cons * (1 + S.s / 100), bags = Math.ceil(kg / 25), big = Math.ceil(kg / 1000);
      sTot.set(num(kg)); sBag.set(num(bags)); sBig.set(num(big)); sWat.set(num(kg * 0.2)); sSilo.set(num(kg / 10000 * 100, kg < 1000 ? 1 : 0)); sMix.set(num(kg / 400, 0) + "–" + num(kg / 200, 0));
      icons.innerHTML = ""; var show = Math.min(bags, 60);
      for (var i = 0; i < show; i++) icons.appendChild(el("i", { class: "wbag" })); if (bags > show) icons.appendChild(el("span", { class: "wbags__more", text: "+" + num(bags - show) }));
    }
    msg.appendChild(el("li", { class: "wmsg__info", text: W.note }));
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [area.box, th.box, prod.box, own.box, sp.box]), el("div", { class: "wgt__out" }, [el("div", { class: "stats" }, [sTot.box, sBag.box, sBig.box, sWat.box, sSilo.box, sMix.box]), icons, msg])]));
    app.appendChild(how(W.how));
    draw();
  }

  // ---------- 5. what is what ----------
  function buildVad(app) {
    var W = T.vad, idx = 3;
    var TABS = [
      { t: W.t1, d: W.d1, parts: [["cement", 100]] },
      { t: W.t2, d: W.d2, parts: [["cement", 39], ["water", 61]] },
      { t: W.t3, d: W.d3, parts: [["cement", 14], ["water", 21], ["sand", 62], ["air", 3]] },
      { t: W.t4, d: W.d4, parts: [["cement", 11], ["water", 18], ["sand", 28], ["stone", 41], ["air", 2]] }
    ];
    var tabs = el("div", { class: "seg seg--big", role: "tablist" }), bar = sv("svg", { viewBox: "0 0 600 90", class: "wchart", role: "img" }), rects = ["cement", "water", "sand", "stone", "air"].map(function (k) { var r = sv("rect", { y: 8, height: 54, class: "seg-" + k }); bar.appendChild(r); return r; });
    var desc = el("p", { class: "wgt__big wgt__big--text" }), leg = el("ul", { class: "wleg" }), cap = el("p", { class: "wgt__cap", text: W.vol });
    var NAMES = { cement: W.cement, water: W.water, sand: W.sand, stone: W.stone, air: W.air }, ORDER = ["cement", "water", "sand", "stone", "air"];
    function draw() {
      var tab = TABS[idx], x = 0; leg.innerHTML = "";
      ORDER.forEach(function (k, i) {
        var part = tab.parts.filter(function (p) { return p[0] === k; })[0], v = part ? part[1] : 0, w = v / 100 * 600;
        rects[i].setAttribute("x", x); rects[i].setAttribute("width", w); x += w;
        if (v) leg.appendChild(el("li", {}, [el("i", { class: "sw sw-" + (k === "water" ? "wat" : k === "stone" || k === "sand" ? (k === "sand" ? "sand" : "agg") : k) }), el("span", { text: NAMES[k] + " " + v + " %" })]));
      });
      desc.textContent = tab.d;
      [].forEach.call(tabs.children, function (b, i) { b.classList.toggle("is-on", i === idx); b.setAttribute("aria-selected", i === idx ? "true" : "false"); });
    }
    TABS.forEach(function (tb, i) { var b = el("button", { type: "button", class: "seg__b", role: "tab", text: tb.t }); b.addEventListener("click", function () { idx = i; draw(); }); tabs.appendChild(b); });
    app.appendChild(el("div", { class: "wgt__one" }, [tabs, desc, bar, leg, cap]));
    app.appendChild(how(LANG === "sv" ? "Andelarna är typiska värden för en vanlig betong och ett vanligt murbruk, räknade på volym. Varje blandning har sitt eget recept." : "The shares are typical values for an ordinary concrete and mortar, by volume. Every mix has its own recipe."));
    draw();
  }

  // ---------- 6. how much concrete to order ----------
  function isoBox(a, b, h) {
    var k = Math.min(190 / ((a + b) * 0.866), 100 / ((a + b) * 0.5 + h)), A = Math.max(6, a * k), B = Math.max(6, b * k), H = Math.max(6, h * k);
    var ox = 120 - 0.433 * (A - B), oy = 78 - ((A + B) * 0.5 - H) / 2;
    function P(x, y, z) { return (ox + (x - y) * 0.866).toFixed(1) + "," + (oy + (x + y) * 0.5 - z).toFixed(1); }
    var g = sv("g");
    g.appendChild(sv("polygon", { class: "sh2", points: [P(A, 0, 0), P(A, B, 0), P(A, B, H), P(A, 0, H)].join(" ") }));
    g.appendChild(sv("polygon", { class: "sh3", points: [P(0, B, 0), P(A, B, 0), P(A, B, H), P(0, B, H)].join(" ") }));
    g.appendChild(sv("polygon", { class: "sh", points: [P(0, 0, H), P(A, 0, H), P(A, B, H), P(0, B, H)].join(" ") }));
    return g;
  }
  function cylinder(dm, hm) {
    var k = Math.min(100 / dm, 100 / hm), rx = Math.max(5, dm * k / 2), ry = rx / 2, hh = Math.max(8, hm * k), cx = 120, y0 = 80 - hh / 2 - ry / 2 + ry, y1 = y0 + hh, g = sv("g");
    g.appendChild(sv("path", { class: "sh3", d: "M" + (cx - rx) + "," + y0 + "L" + (cx - rx) + "," + y1 + "A" + rx + "," + ry + " 0 0 0 " + (cx + rx) + "," + y1 + "L" + (cx + rx) + "," + y0 + "Z" }));
    g.appendChild(sv("ellipse", { class: "sh", cx: cx, cy: y0, rx: rx, ry: ry }));
    return g;
  }
  function buildVolym(app) {
    var W = T.vol, S = { s: 0, L: 8, B: 6, tS: 15, Lw: 10, tW: 25, Hw: 2.5, d: 40, Hc: 3, n: 4, m: 5 };
    var shape = segmented(W.shape, [W.s1, W.s2, W.s3], 0, function (i) { S.s = i; vis(); draw(); });
    var m1 = function (v) { return num(v, v % 1 ? 1 : 0) + " m"; };
    var sLen = slider(W.len, 1, 40, 0.5, 8, m1, function (v) { S.L = v; draw(); }), sWid = slider(W.wid, 1, 30, 0.5, 6, m1, function (v) { S.B = v; draw(); });
    var sTs = slider(W.tSlab, 5, 60, 1, 15, function (v) { return num(v) + " cm"; }, function (v) { S.tS = v; draw(); });
    var sLw = slider(W.len, 1, 60, 0.5, 10, m1, function (v) { S.Lw = v; draw(); }), sHw = slider(W.hgt, 0.2, 5, 0.1, 2.5, function (v) { return num(v, 1) + " m"; }, function (v) { S.Hw = v; draw(); });
    var sTw = slider(W.tWall, 10, 80, 1, 25, function (v) { return num(v) + " cm"; }, function (v) { S.tW = v; draw(); });
    var sD = slider(W.dia, 20, 120, 5, 40, function (v) { return num(v) + " cm"; }, function (v) { S.d = v; draw(); }), sHc = slider(W.hgt, 0.5, 8, 0.1, 3, function (v) { return num(v, 1) + " m"; }, function (v) { S.Hc = v; draw(); });
    var sN = slider(W.cnt, 1, 40, 1, 4, function (v) { return num(v); }, function (v) { S.n = v; draw(); });
    var sM = slider(W.margin, 0, 15, 1, 5, function (v) { return num(v) + " %"; }, function (v) { S.m = v; draw(); });
    var groups = [[sLen, sWid, sTs], [sLw, sHw, sTw], [sD, sHc, sN]];
    var stV = stat(W.vol, W.m3), stO = stat(W.order, W.m3), stW = stat(W.weight, W.tn), stT = stat(W.trucks), stC = stat(W.cars), stB = stat(W.bags);
    var pic = sv("svg", { viewBox: "0 0 240 150", class: "wshape", role: "img", "aria-label": W.shape }), cap = el("p", { class: "wgt__cap" }), trucks = el("div", { class: "wtrucks", "aria-hidden": "true" }), msg = el("ul", { class: "wmsg" });
    function vis() { groups.forEach(function (g, i) { g.forEach(function (c) { c.box.hidden = i !== S.s; }); }); }
    function draw() {
      var v, size;
      pic.innerHTML = "";
      if (S.s === 0) { v = S.L * S.B * S.tS / 100; pic.appendChild(isoBox(S.L, S.B, S.tS / 100 * 3 + 0)); size = W.sizeSlab.replace("{a}", num(S.L, S.L % 1 ? 1 : 0)).replace("{b}", num(S.B, S.B % 1 ? 1 : 0)).replace("{c}", num(S.tS)); }
      else if (S.s === 1) { v = S.Lw * S.Hw * S.tW / 100; pic.appendChild(isoBox(S.Lw, S.tW / 100 * 2, S.Hw)); size = W.sizeWall.replace("{a}", num(S.Lw, S.Lw % 1 ? 1 : 0)).replace("{b}", num(S.Hw, 1)).replace("{c}", num(S.tW)); }
      else { v = S.n * Math.PI * Math.pow(S.d / 200, 2) * S.Hc; pic.appendChild(cylinder(S.d / 100, S.Hc)); size = W.sizeCol.replace("{n}", num(S.n)).replace("{a}", num(S.d)).replace("{b}", num(S.Hc, 1)); }
      var ord = Math.ceil(v * (1 + S.m / 100) * 2) / 2, tn = ord * 2.4, tr = ord / 8, dec = v < 10 ? 2 : 1;
      cap.textContent = size;
      stV.set(num(v, dec)); stO.set(num(ord, 1)); stW.set(num(tn, tn < 10 ? 1 : 0)); stT.set(num(tr, tr < 10 ? 1 : 0)); stC.set(num(tn / 1.5)); stB.set(num(Math.ceil(v * (1 + S.m / 100) * 80)));
      trucks.innerHTML = "";
      var full = Math.floor(tr), part = tr - full, show = Math.min(10, Math.ceil(tr));
      for (var i = 0; i < show; i++) { var f = i < full ? 100 : Math.round(part * 100); trucks.appendChild(el("i", { class: "wtruck" }, [el("i", { style: "width:" + f + "%" })])); }
      if (Math.ceil(tr) > 10) trucks.appendChild(el("span", { class: "wtrucks__n", text: "+" + num(Math.ceil(tr) - 10) }));
      msg.innerHTML = "";
      if (ord <= 1) msg.appendChild(el("li", { class: "wmsg__ok", text: W.small }));
      msg.appendChild(el("li", { class: "wmsg__info", text: W.note }));
    }
    app.appendChild(el("div", { class: "wgt__grid" }, [
      el("div", { class: "wgt__ctl" }, [shape.box].concat(groups.reduce(function (a, g) { return a.concat(g.map(function (c) { return c.box; })); }, [])).concat([sM.box])),
      el("div", { class: "wgt__out" }, [pic, cap, el("div", { class: "stats" }, [stV.box, stO.box, stW.box, stT.box, stC.box, stB.box]), trucks, msg])
    ]));
    app.appendChild(how(W.how));
    vis(); draw();
  }

  // ---------- 7. how much load does a cube of concrete take ----------
  function buildKlass(app, box) {
    var W = T.kl, CLS = [[20, 25], [25, 30], [30, 37], [35, 45], [40, 50], [50, 60]], S = { c: 2, s: 10 };
    var want = box && box.getAttribute("data-klass"); if (want) CLS.forEach(function (x, i) { if (("C" + x[0] + "/" + x[1]) === want) S.c = i; });
    var cl = segmented(W.cls, CLS.map(function (x) { return "C" + x[0] + "/" + x[1]; }), S.c, function (i) { S.c = i; draw(); });
    var sd = slider(W.side, 5, 30, 1, 10, function (v) { return num(v) + " " + W.cm; }, function (v) { S.s = v; draw(); });
    var stCyl = stat(W.cyl, T.mpa), stCube = stat(W.cube, T.mpa), stLoad = stat(W.force, W.tn), stOwn = stat(W.own, W.kg);
    var big = el("p", { class: "wgt__big", "aria-live": "polite" }), cars = el("div", { class: "wcars", "aria-hidden": "true" }), msg = el("ul", { class: "wmsg" });
    function draw() {
      var c = CLS[S.c], mm = S.s * 10, tn = c[1] * mm * mm / 9806.65, own = Math.pow(S.s / 100, 3) * 2400, nCars = tn / 1.5;
      stCyl.set(num(c[0])); stCube.set(num(c[1])); stLoad.set(num(tn, tn < 10 ? 1 : 0)); stOwn.set(num(own, own < 10 ? 1 : 0));
      big.textContent = W.cars.replace("{n}", num(nCars, nCars < 10 ? 1 : 0)) + ". " + W.more.replace("{n}", num(Math.round(tn * 1000 / own)));
      cars.innerHTML = ""; var show = Math.min(40, Math.round(nCars));
      for (var i = 0; i < show; i++) cars.appendChild(el("i", { class: "wcar" }));
      if (nCars > 40) cars.appendChild(el("span", { class: "wcars__more", text: "+" + num(Math.round(nCars) - 40) }));
    }
    msg.appendChild(el("li", { class: "wmsg__info", text: W.min })); msg.appendChild(el("li", { class: "wmsg__info", text: W.note }));
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [cl.box, sd.box]), el("div", { class: "wgt__out" }, [big, el("div", { class: "stats" }, [stCyl.box, stCube.box, stLoad.box, stOwn.box]), cars, msg])]));
    app.appendChild(how(W.how));
    draw();
  }

  var BUILD = { vct: buildVct, harda: buildHarda, injektering: buildInj, atgang: buildAtg, vadarvad: buildVad, volym: buildVolym, klass: buildKlass };
  [].forEach.call(document.querySelectorAll("[data-widget]"), function (box) {
    var app = box.querySelector(".wgt__app"), fn = BUILD[box.getAttribute("data-widget")];
    if (!app || !fn) return;
    app.innerHTML = ""; fn(app, box); box.classList.add("is-live");
  });
})();
