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
        vct: "Vattencementtal (vct)", mode: "Hur ändrar du vct?", mode0: "Mer eller mindre vatten", mode1: "Mer eller mindre cement", cemKg: "Cementhalt", chartTitle: "Hållfasthet efter 28 dygn för olika vct (pricken är ditt val)", axisVct: "vattencementtal (vct)", axisMpa: "MPa", band: "vanligt område", overfull: "Det blir för mycket vatten och cement för att få plats i en kubikmeter. Sänk cementhalten.", kons: "Konsistens", cem: "Cementtyp", kStel: "Stel", kPlast: "Plastisk", kFlyt: "Flytande",
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
      },
      hist: {
        prev: "Föregående", next: "Nästa", yr: "År", bc: "f.Kr.", ca: "ca", step: "Tidsresa",
        ev: [
          [-2500, "egypt", "Lera, kalk och gips", "Långt före cementet band man sten med lera, kalkbruk och gipsbruk. Det användes till exempel i Egypten."],
          [-200, "rome", "Romarna blandar betong", "Romarna blandade kalk, vulkanaska, vatten och sten till opus caementicium. Det gjorde att de kunde bygga valv, hamnar och akvedukter."],
          [126, "pantheon", "Pantheons kupol", "Omkring år 126 stod Pantheon i Rom färdigt. Dess kupol av oarmerad betong är fortfarande världens största i sitt slag."],
          [1756, "lighthouse", "Smeaton och fyren", "John Smeaton upptäckte att kalk som innehåller lera hårdnar även under vatten. Han använde det i Eddystonefyren utanför England."],
          [1824, "kiln", "Portlandcement", "Joseph Aspdin tog patent på en cement han kallade portlandcement, efter den ljusa Portlandstenen. Det är grunden till dagens cement."],
          [1867, "pot", "Järn i betongen", "Trädgårdsmästaren Joseph Monier patenterade krukor och kärl av betong med järnnät i. Idén att armera betong var född."],
          [1892, "frame", "Hela hus av armerad betong", "François Hennebique utvecklade ett system med pelare och balkar av armerad betong. Därefter kunde man bygga hela hus och broar på det sättet."],
          [1903, "tower", "Första betongskrapan", "Ingalls Building i Cincinnati blev ett av de första höghusen med betongstomme, 16 våningar och 64 meter högt."],
          [1928, "bridge", "Spänd betong", "Eugène Freyssinet tog patent på spännbetong, där stålet spänns i förväg. Det gjorde det möjligt att bygga längre och smäckrare broar."],
          [2010, "burj", "Burj Khalifa", "Burj Khalifa i Dubai är 828 meter hög. Dess kärna och stomme är av höghållfast betong som pumpades upp i höjden."]
        ],
        ph: {
          h: "Hur högt upp i kupolen?", sz: "Snitt genom Pantheons kupol", thick: "Tjocklek ungefär", height: "Höjd över kupolens fot ungefär", mat: "Material",
          z1: "Tung betong med travertin och tuff", z2: "Tuff och tegel", z3: "Lätt vulkanisk sten", base: "Kupolens fot", top: "Öppningen (oculus)",
          note: "Ju högre upp, desto tunnare kupol och lättare sten. På så sätt blir kupolen inte tyngre än att den kan bära sig själv.",
          how: "Måtten är de som vanligen anges: kupolens innerdiameter 43,3 m, tjocklek cirka 6,4 m vid foten och cirka 1,2 m vid öppningen på 8,2 m. Materialzonerna är förenklade."
        },
        ar: {
          load: "Belastning", mode: "Balk", m0: "Utan armering", m1: "Med armering", press: "tryck", tens: "drag",
          a0: "Balken är hel och bär lasten.", a1: "Det börjar komma en spricka i undersidan. Betong tål drag dåligt.", a2: "Balken går av! Utan armering finns inget som håller ihop undersidan.",
          b0: "Balken är hel.", b1: "Fina sprickor syns i undersidan, men stålet tar dragkraften.", b2: "Balken böjer sig mycket men håller. Armeringen tar dragkraften i undersidan.",
          hint: "Betong tål tryck mycket bra men drag dåligt, ungefär en tiondel så bra. När balken böjs trycks överkanten ihop och undersidan dras isär. Därför läggs stålstänger i undersidan.",
          how: "Det här är en principskiss, inte en beräkning. Betongens draghållfasthet är bara omkring en tiondel av tryckhållfastheten, så en oarmerad balk spricker där det blir drag. Stålet placeras där och tar kraften."
        },
        hh: {
          step: "Tidsresa", note0: "Efter romarna dröjde det länge innan man byggde högt i betong igen. Ingenting av det som visas här är högre än Pantheons kupol förrän 1900-talet.",
          now: "Byggd {y}: {n}, {h} meter", items: [[126, 43, "Pantheon", "Pantheon, Rom"], [1903, 64, "Ingalls", "Ingalls Building, Cincinnati"], [1936, 221, "Hoover", "Hooverdammen (damm)"], [1967, 155, "Kaknäs", "Kaknästornet, Stockholm"], [1976, 553, "CN Tower", "CN Tower, Toronto"], [2005, 190, "Turning Torso", "Turning Torso, Malmö"], [2010, 828, "Burj Khalifa", "Burj Khalifa, Dubai"]],
          how: "Höjderna är de som vanligen anges för byggnaderna. Alla har betong som en viktig del av bärande delar, men inte alla är av bara betong (Burj Khalifas spira är av stål). Samma skala gäller för alla staplar."
        }
      },
      illu: {
        tbm: { cap: "En tunnelborrmaskin i genomskärning: skärhuvudet borrar, domkrafter trycker maskinen framåt mot den senaste ringen och en bandtransportör för ut massorna.", l: ["Skärhuvud", "Sköld", "Domkrafter", "Tubbingar", "Bandtransportör"] },
        roman: { cap: "Ett snitt genom en romersk mur: en kärna av betong med stenbitar, och tegel på båda sidorna.", l: ["Tegelbeklädnad", "Betongkärna: stenbitar (caementa) i bruk", "Kalk", "Vulkanisk aska (puzzolan)", "Vatten", "Stenbitar", "Receptet"] }
      },
      spr: {
        method: "Metod", m0: "Torrsprutning", m1: "Våtsprutning", dist: "Avstånd till ytan", ang: "Vinkel mot ytan", area: "Yta", thick: "Tjocklek på lagret",
        rebound: "Studs (material som faller ned)", need: "Du behöver spruta", inplace: "Blir kvar på ytan", lost: "Studsar ned", m3: "m³",
        good: "Bra läge: ungefär en meter från ytan och rakt mot den ger minst studs.", near: "För nära: studsen ökar och lagret blir ojämnt.", far: "För långt: sämre kompaktering och mer studs.", slant: "Sprutar du snett mot ytan ökar studsen.",
        note: "Studsen varierar mycket med blandning, tryck, accelerator och underlag. Siffrorna är typiska ungefärliga värden.",
        how: "Torrsprutning ger i regel mer studs än våtsprutning. Avstånd och vinkel påverkar studsen. Materialbehovet = yta × tjocklek / (1 − studs). Det som studsar ned räknas som förlust."
      },
      tun: {
        "cyc": {
          "play": "Spela upp",
          "pause": "Pausa",
          "prev": "Föregående",
          "next": "Nästa",
          "step": "Steg",
          "of": "av",
          "steps": [
            [
              "Borra",
              "Borrjumbon borrar rader av hål i ortsbrösten, ofta flera tiotal hål, enligt en plan som datorn styr. Hålens läge avgör hur berget brister och vilken form tunneln får."
            ],
            [
              "Ladda",
              "Hålen fylls med sprängämne och kopplas ihop med tändare. Laddningen planeras så att tunneln får rätt form och berget runt omkring skadas så lite som möjligt."
            ],
            [
              "Spräng",
              "Salvan avfyras när alla har lämnat tunneln. Berget spricker och faller som en hög sprängsten, och tunneln har blivit några meter längre."
            ],
            [
              "Vädra",
              "Sprängrök och damm ventileras ut innan någon får gå in igen. Stora fläktar blåser frisk luft genom tunneln."
            ],
            [
              "Lasta ut",
              "Hjullastare och dumpers kör ut sprängstenen. Den används ofta som fyllnadsmassor eller krossas till bergmaterial."
            ],
            [
              "Skrota",
              "Lösa stenar tas ned från tak och väggar med en maskin som kallas skrotare, så att inget faller ned senare."
            ],
            [
              "Spruta betong",
              "Berget sprutas med ett lager sprutbetong som håller ihop ytan och stabiliserar tunneln."
            ],
            [
              "Bulta och injektera",
              "Bergbultar sätts för att binda ihop berget. Vid behov injekteras sprickor för att täta mot vatten. Sedan börjar nästa salva, och det upprepas meter för meter."
            ]
          ],
          "how": "Förenklad bild av borra och spräng. Hur lång tid ett varv tar, ofta flera timmar upp till ett halvt dygn, och hur många meter varje salva ger varierar med berget, tunnelns storlek och kraven i projektet."
        },
        "val": {
          "ground": "Mark och berg",
          "length": "Tunnelns längd",
          "g": [
            "Hårt, tätt berg",
            "Sprickigt berg med vatten",
            "Jord eller lera (mjuk mark)"
          ],
          "l": [
            "Kort (under 1 km)",
            "Medellång (1 till 5 km)",
            "Lång (över 5 km)"
          ],
          "method": "Metod som ofta väljs",
          "risks": "Vanliga risker",
          "fixes": "Vanliga åtgärder",
          "note": "En förenklad översikt. Varje tunnel kräver geologisk undersökning och projektering av ansvarig konstruktör.",
          "m": {
            "10": "Borra och spräng med förinjektering.",
            "11": "Borra och spräng med förinjektering, eller TBM med injektering vid behov.",
            "12": "TBM med injektering vid behov, eller borra och spräng med förinjektering.",
            "20": "Rörpressning eller en liten tunnelborrmaskin.",
            "21": "TBM med jordtrycksbalans (EPB) eller slurryskärm.",
            "22": "TBM med jordtrycksbalans (EPB) eller slurryskärm.",
            "00": "Borra och spräng med borrjumbo.",
            "01": "Borra och spräng, eller TBM om tunneln är rak och berget är jämnt.",
            "02": "TBM, ofta tillsammans med borra och spräng på delar av sträckan."
          },
          "r": [
            [
              "Lösa block och bergfall",
              "Sprängskador på berget runt tunneln",
              "Damm och buller i arbetsmiljön"
            ],
            [
              "Vatteninläckage i tunneln",
              "Sänkt grundvattennivå som kan ge sättningar och påverka miljön",
              "Instabila sprickzoner och bergfall"
            ],
            [
              "Sättningar i marken ovanför, som kan skada byggnader",
              "Ortsbröstet kan rasa om stödtrycket är fel",
              "Grundvatten och mjuk, vattenmättad jord"
            ]
          ],
          "rLong": [
            "Slitage på verktyg i hårt, slipande berg",
            "En TBM kan fastna i krossat berg eller sprickzoner",
            "Hinder i marken, till exempel block eller gamla grundläggningar"
          ],
          "f": [
            [
              "Skrotning, bultning och sprutbetong",
              "Sonderborrning framför ortsbröstet för att hitta sprickzoner i tid"
            ],
            [
              "Förinjektering för att täta berget innan man sprängs",
              "Sprutbetong och bultning",
              "Mätning av grundvattennivå och sättningar"
            ],
            [
              "Rätt stödtryck mot ortsbröstet",
              "Betongtubbingar som bildar en tät ring bakom maskinen",
              "Mätning av sättningar och injektering av marken vid behov"
            ]
          ]
        }
      }
    },
    en: {
      mpa: "MPa", model: "How we calculate", disclaimer: "A simplified model to understand how things relate. It does not replace calculation, testing or the data sheet of a product.",
      vct: {
        vct: "Water/cement ratio (w/c)", mode: "How do you change w/c?", mode0: "More or less water", mode1: "More or less cement", cemKg: "Cement content", chartTitle: "Strength after 28 days for different w/c (the dot is your choice)", axisVct: "water/cement ratio (w/c)", axisMpa: "MPa", band: "common range", overfull: "There is too much water and cement to fit in one cubic metre. Lower the cement content.", kons: "Consistency", cem: "Cement type", kStel: "Stiff", kPlast: "Plastic", kFlyt: "Flowing",
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
      },
      hist: {
        prev: "Previous", next: "Next", yr: "Year", bc: "BC", ca: "c.", step: "Time travel",
        ev: [
          [-2500, "egypt", "Clay, lime and gypsum", "Long before cement, stone was bound with clay, lime mortar and gypsum mortar. It was used in Egypt, for example."],
          [-200, "rome", "The Romans mix concrete", "The Romans mixed lime, volcanic ash, water and stone into opus caementicium. It let them build vaults, harbours and aqueducts."],
          [126, "pantheon", "The Pantheon dome", "Around the year 126 the Pantheon in Rome was finished. Its dome of unreinforced concrete is still the largest of its kind in the world."],
          [1756, "lighthouse", "Smeaton and the lighthouse", "John Smeaton found that lime containing clay hardens even under water. He used it in the Eddystone lighthouse off the coast of England."],
          [1824, "kiln", "Portland cement", "Joseph Aspdin patented a cement he called Portland cement, after the pale Portland stone. It is the basis of today’s cement."],
          [1867, "pot", "Iron in the concrete", "The gardener Joseph Monier patented pots and vessels of concrete with an iron mesh inside. The idea of reinforcing concrete was born."],
          [1892, "frame", "Whole buildings in reinforced concrete", "François Hennebique developed a system of columns and beams of reinforced concrete. After that, whole buildings and bridges could be built that way."],
          [1903, "tower", "The first concrete skyscraper", "The Ingalls Building in Cincinnati became one of the first tall buildings with a concrete frame, 16 storeys and 64 metres high."],
          [1928, "bridge", "Prestressed concrete", "Eugène Freyssinet patented prestressed concrete, where the steel is tensioned in advance. It made longer and slimmer bridges possible."],
          [2010, "burj", "Burj Khalifa", "Burj Khalifa in Dubai is 828 metres tall. Its core and frame are made of high-strength concrete that was pumped up to height."]
        ],
        ph: {
          h: "How high up in the dome?", sz: "Cross-section of the Pantheon dome", thick: "Thickness about", height: "Height above the base of the dome about", mat: "Material",
          z1: "Heavy concrete with travertine and tuff", z2: "Tuff and brick", z3: "Light volcanic stone", base: "Base of the dome", top: "The opening (oculus)",
          note: "The higher up, the thinner the dome and the lighter the stone. That way the dome is no heavier than it can carry itself.",
          how: "The dimensions are the commonly stated ones: inner diameter of the dome 43.3 m, thickness about 6.4 m at the base and about 1.2 m at the 8.2 m opening. The material zones are simplified."
        },
        ar: {
          load: "Load", mode: "Beam", m0: "Without reinforcement", m1: "With reinforcement", press: "compression", tens: "tension",
          a0: "The beam is whole and carries the load.", a1: "A crack starts to form in the underside. Concrete is weak in tension.", a2: "The beam breaks! Without reinforcement nothing holds the underside together.",
          b0: "The beam is whole.", b1: "Fine cracks show in the underside, but the steel takes the tension.", b2: "The beam bends a lot but holds. The reinforcement takes the tension in the underside.",
          hint: "Concrete is very good in compression but poor in tension, about a tenth as good. When the beam bends, the top is squeezed together and the underside is pulled apart. That is why steel bars are placed in the underside.",
          how: "This is a principle sketch, not a calculation. The tensile strength of concrete is only about a tenth of its compressive strength, so an unreinforced beam cracks where there is tension. The steel is placed there and takes the force."
        },
        hh: {
          step: "Time travel", note0: "After the Romans it took a long time before anyone built high in concrete again. Nothing shown here is taller than the dome of the Pantheon until the 20th century.",
          now: "Built {y}: {n}, {h} metres", items: [[126, 43, "Pantheon", "The Pantheon, Rome"], [1903, 64, "Ingalls", "Ingalls Building, Cincinnati"], [1936, 221, "Hoover", "Hoover Dam (dam)"], [1967, 155, "Kaknäs", "Kaknästornet, Stockholm"], [1976, 553, "CN Tower", "CN Tower, Toronto"], [2005, 190, "Turning Torso", "Turning Torso, Malmö"], [2010, 828, "Burj Khalifa", "Burj Khalifa, Dubai"]],
          how: "The heights are the ones commonly stated for the structures. All have concrete as an important part of the load-bearing parts, but not all are made of concrete alone (the spire of Burj Khalifa is steel). The scale is the same for all bars."
        }
      },
      illu: {
        tbm: { cap: "A tunnel boring machine in cross-section: the cutterhead bores, jacks push the machine forward against the latest ring and a conveyor belt carries the spoil out.", l: ["Cutterhead", "Shield", "Jacks", "Segments", "Conveyor belt"] },
        roman: { cap: "A cut through a Roman wall: a core of concrete with pieces of stone, and brick on both sides.", l: ["Brick facing", "Concrete core: pieces of stone (caementa) in mortar", "Lime", "Volcanic ash (pozzolana)", "Water", "Stone pieces", "The recipe"] }
      },
      spr: {
        method: "Process", m0: "Dry spraying", m1: "Wet spraying", dist: "Distance to the surface", ang: "Angle to the surface", area: "Area", thick: "Thickness of the layer",
        rebound: "Rebound (material that falls off)", need: "You need to spray", inplace: "Stays on the surface", lost: "Bounces off", m3: "m³",
        good: "Good position: about one metre from the surface and straight at it gives the least rebound.", near: "Too close: rebound increases and the layer becomes uneven.", far: "Too far: poorer compaction and more rebound.", slant: "Spraying at an angle to the surface increases rebound.",
        note: "Rebound varies a lot with the mix, pressure, accelerator and substrate. The numbers are typical approximate values.",
        how: "Dry spraying usually gives more rebound than wet spraying. Distance and angle affect the rebound. Material needed = area × thickness / (1 − rebound). What bounces off counts as loss."
      },
      tun: {
        "cyc": {
          "play": "Play",
          "pause": "Pause",
          "prev": "Previous",
          "next": "Next",
          "step": "Step",
          "of": "of",
          "steps": [
            [
              "Drill",
              "The drill jumbo drills rows of holes in the face, often several dozen holes, to a plan controlled by the computer. The position of the holes decides how the rock breaks and what shape the tunnel gets."
            ],
            [
              "Charge",
              "The holes are filled with explosives and connected with detonators. The charge is planned so the tunnel gets the right shape and the surrounding rock is damaged as little as possible."
            ],
            [
              "Blast",
              "The round is fired when everyone has left the tunnel. The rock cracks and falls as a pile of blasted rock, and the tunnel has become a few metres longer."
            ],
            [
              "Ventilate",
              "Blast fumes and dust are ventilated out before anyone may go back in. Big fans blow fresh air through the tunnel."
            ],
            [
              "Remove the rock",
              "Wheel loaders and dump trucks carry out the blasted rock. It is often used as fill or crushed into rock aggregate."
            ],
            [
              "Scale",
              "Loose stones are brought down from the roof and walls with a machine called a scaler, so nothing falls later."
            ],
            [
              "Spray concrete",
              "The rock is sprayed with a layer of shotcrete that holds the surface together and stabilises the tunnel."
            ],
            [
              "Bolt and grout",
              "Rock bolts are installed to tie the rock together. If needed, cracks are grouted to seal against water. Then the next round begins, and it is repeated metre by metre."
            ]
          ],
          "how": "A simplified picture of drill and blast. How long a round takes, often several hours up to half a day, and how many metres each round gives varies with the rock, the size of the tunnel and the requirements of the project."
        },
        "val": {
          "ground": "Ground and rock",
          "length": "Length of the tunnel",
          "g": [
            "Hard, tight rock",
            "Fractured rock with water",
            "Soil or clay (soft ground)"
          ],
          "l": [
            "Short (under 1 km)",
            "Medium (1 to 5 km)",
            "Long (over 5 km)"
          ],
          "method": "Method often chosen",
          "risks": "Common risks",
          "fixes": "Common measures",
          "note": "A simplified overview. Every tunnel requires a geological investigation and design by the responsible engineer.",
          "m": {
            "10": "Drill and blast with pre-grouting.",
            "11": "Drill and blast with pre-grouting, or a TBM with grouting when needed.",
            "12": "A TBM with grouting when needed, or drill and blast with pre-grouting.",
            "20": "Pipe jacking or a small tunnel boring machine.",
            "21": "A TBM with earth pressure balance (EPB) or slurry shield.",
            "22": "A TBM with earth pressure balance (EPB) or slurry shield.",
            "00": "Drill and blast with a drill jumbo.",
            "01": "Drill and blast, or a TBM if the tunnel is straight and the rock is even.",
            "02": "A TBM, often together with drill and blast on parts of the route."
          },
          "r": [
            [
              "Loose blocks and rockfall",
              "Blast damage to the rock around the tunnel",
              "Dust and noise in the working environment"
            ],
            [
              "Water leaking into the tunnel",
              "A lowered groundwater level that can cause settlement and affect the environment",
              "Unstable fracture zones and rockfall"
            ],
            [
              "Settlement of the ground above, which can damage buildings",
              "The face can collapse if the support pressure is wrong",
              "Groundwater and soft, saturated soil"
            ]
          ],
          "rLong": [
            "Wear on tools in hard, abrasive rock",
            "A TBM can get stuck in crushed rock or fracture zones",
            "Obstacles in the ground, for example boulders or old foundations"
          ],
          "f": [
            [
              "Scaling, bolting and shotcrete",
              "Probe drilling ahead of the face to find fracture zones in time"
            ],
            [
              "Pre-grouting to seal the rock before blasting",
              "Shotcrete and bolting",
              "Monitoring of groundwater level and settlement"
            ],
            [
              "The right support pressure on the face",
              "Concrete segments that form a tight ring behind the machine",
              "Monitoring of settlement and grouting of the ground when needed"
            ]
          ]
        }
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
  // Two ways to change the ratio: add water to the same amount of cement (what happens on site), or change the cement for the same water (how a mix is designed).
  function buildVct(app) {
    var S = { vct: 0.5, mode: 0, cem: 350, k: 1, c: 1 }, WATER = [165, 180, 195], CF = [0.8, 1, 1.12];
    var W = T.vct;
    function strength(v, c) { return 162.6 * Math.exp(-2.71 * v) * CF[c]; }
    var sl = slider(W.vct, 0.35, 0.75, 0.01, 0.5, function (v) { return num(v, 2); }, function (v) { S.vct = v; draw(); });
    var mode = segmented(W.mode, [W.mode0, W.mode1], 0, function (i) { S.mode = i; sCem.box.hidden = i !== 0; kons.box.hidden = i !== 1; draw(); });
    var sCem = slider(W.cemKg, 250, 500, 10, 350, function (v) { return num(v) + " kg"; }, function (v) { S.cem = v; draw(); });
    var kons = segmented(W.kons, [W.kStel, W.kPlast, W.kFlyt], 1, function (i) { S.k = i; draw(); });
    kons.box.hidden = true;
    var cem = select(W.cem, ["CEM 32,5 N", "CEM 42,5 N", "CEM 52,5 R"].map(function (x) { return LANG === "en" ? x.replace(",", ".") : x; }), 1, function (i) { S.c = i; draw(); });
    var stC = stat(W.rCem, W.unitKgM3), stW = stat(W.rWater, W.unitLM3), stA = stat(W.rAgg, W.unitKgM3), stS = stat(W.rStr, T.mpa);
    var msg = el("ul", { class: "wmsg" }), extra = el("p", { class: "wgt__extra" });
    // composition bar (HTML, so the parts glide when you drag)
    var KEYS = ["agg", "cem", "wat", "air"], bar = el("div", { class: "wbar", role: "img", "aria-label": W.barTitle }), segs = KEYS.map(function (k) { var s = el("span", { class: "wbar__s seg-" + k }); bar.appendChild(s); return s; });
    var legend = el("ul", { class: "wleg" });
    // strength against w/c: the line you move along
    var CX0 = 44, CY0 = 14, CW = 500, CH = 170;
    function px(v) { return CX0 + (v - 0.35) / 0.4 * CW; } function py(f) { return CY0 + CH - f / 80 * CH; }
    var chart = sv("svg", { viewBox: "0 0 560 236", class: "wchart", role: "img", "aria-label": W.chartTitle });
    chart.appendChild(sv("rect", { x: px(0.4), y: CY0, width: px(0.55) - px(0.4), height: CH, class: "wband" })); chart.appendChild(sv("text", { x: (px(0.4) + px(0.55)) / 2, y: CY0 + 14, "text-anchor": "middle", class: "wax", text: W.band }));
    var grid = sv("g", { class: "wgrid" });
    [0, 20, 40, 60, 80].forEach(function (f) { grid.appendChild(sv("line", { x1: CX0, x2: CX0 + CW, y1: py(f), y2: py(f) })); grid.appendChild(sv("text", { x: CX0 - 6, y: py(f) + 4, "text-anchor": "end", text: f })); });
    [0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75].forEach(function (v) { grid.appendChild(sv("text", { x: px(v), y: CY0 + CH + 18, "text-anchor": "middle", text: num(v, 2) })); });
    grid.appendChild(sv("text", { x: CX0 + CW / 2, y: 232, "text-anchor": "middle", class: "wax", text: W.axisVct })); grid.appendChild(sv("text", { x: CX0 + 6, y: CY0 - 3, class: "wax", text: W.axisMpa }));
    chart.appendChild(grid);
    var curve = sv("path", { class: "wcurve", fill: "none" }), drop = sv("line", { class: "w28", y2: CY0 + CH }), mark = sv("circle", { r: 7, class: "wmark" }), tag = sv("text", { class: "wlbl", "text-anchor": "middle" });
    chart.appendChild(curve); chart.appendChild(drop); chart.appendChild(mark); chart.appendChild(tag);
    // pores
    var COLS = 30, ROWS = 14, rnd = seeded(7), cells = [], pores = sv("svg", { viewBox: "0 0 " + COLS * 10 + " " + ROWS * 10, class: "wchart wpores", role: "img", "aria-label": W.pores });
    for (var i = 0; i < COLS * ROWS; i++) { var r = rnd(), c = sv("rect", { x: (i % COLS) * 10 + 0.8, y: Math.floor(i / COLS) * 10 + 0.8, width: 8.4, height: 8.4, rx: 1.6 }); c._r = r; cells.push(c); pores.appendChild(c); }
    var porCap = el("p", { class: "wgt__cap" });
    function calc() {
      var water, cemKg;
      if (S.mode === 0) { cemKg = S.cem; water = S.vct * cemKg; } else { water = WATER[S.k]; cemKg = water / S.vct; }
      var cemL = cemKg / 3.1, air = 20, aggL = Math.max(0, 1000 - water - cemL - air), aggKg = aggL * 2.65;
      var f = strength(S.vct, S.c), wc2 = (water + 10) / cemKg, f2 = strength(wc2, S.c);
      var por = Math.max(0, (S.vct - 0.36 * 0.85) / (S.vct + 0.32));
      return { water: water, cemKg: cemKg, cemL: cemL, air: air, aggL: aggL, aggKg: aggKg, f: f, df: f - f2, wc2: wc2, por: por, over: 1000 - water - cemL - air < 0 };
    }
    function draw() {
      var m = calc(), tot = m.aggL + m.cemL + m.water + m.air, parts = [m.aggL, m.cemL, m.water, m.air];
      segs.forEach(function (s, i) { var p = parts[i] / tot * 100; s.style.width = p + "%"; s.textContent = p >= 9 ? num(p) + " %" : ""; });
      legend.innerHTML = "";
      [["agg", W.rAgg, m.aggL], ["cem", W.rCem, m.cemL], ["wat", W.rWater, m.water], ["air", W.air, m.air]].forEach(function (p) { legend.appendChild(el("li", {}, [el("i", { class: "sw sw-" + p[0] }), el("span", { text: p[1] + " " + num(p[2]) + " l" })])); });
      stC.set(num(m.cemKg)); stW.set(num(m.water)); stA.set(num(m.aggKg)); stS.set("≈ " + num(m.f));
      var pts = []; for (var v = 0.35; v <= 0.7501; v += 0.01) pts.push(px(v).toFixed(1) + " " + py(strength(v, S.c)).toFixed(1));
      curve.setAttribute("d", "M" + pts.join("L"));
      var mx = px(S.vct), my = py(m.f); mark.setAttribute("cx", mx); mark.setAttribute("cy", my);
      drop.setAttribute("x1", mx); drop.setAttribute("x2", mx); drop.setAttribute("y1", my);
      tag.setAttribute("x", Math.min(CX0 + CW - 40, Math.max(CX0 + 40, mx))); tag.setAttribute("y", Math.max(CY0 + 28, my - 14)); tag.textContent = num(S.vct, 2) + " → " + num(m.f) + " " + T.mpa;
      cells.forEach(function (c) { c.setAttribute("class", c._r < m.por ? "pore" : "paste"); });
      porCap.textContent = num(m.por * 100) + " % " + W.porPct;
      extra.textContent = W.extra.replace("{a}", num(m.wc2, 2)).replace("{b}", num(m.df, 1));
      msg.innerHTML = "";
      var notes = [];
      if (m.over) notes.push(["warn", W.overfull]);
      if (S.vct < 0.4) notes.push(["info", W.lowVct]);
      if (m.cemKg < 260) notes.push(["warn", W.lowCem]);
      if (m.cemKg > 450) notes.push(["warn", W.highCem]);
      if (S.vct > 0.6) notes.push(["warn", W.highVct]); else if (S.vct >= 0.4 && S.vct <= 0.55) notes.push(["ok", W.goodVct]);
      notes.forEach(function (n) { msg.appendChild(el("li", { class: "wmsg__" + n[0], text: n[1] })); });
    }
    app.appendChild(el("div", { class: "wgt__grid" }, [
      el("div", { class: "wgt__ctl" }, [sl.box, mode.box, sCem.box, kons.box, cem.box, extra]),
      el("div", { class: "wgt__out" }, [el("div", { class: "stats" }, [stC.box, stW.box, stA.box, stS.box]), el("p", { class: "wgt__cap", text: W.chartTitle }), chart, el("p", { class: "wgt__cap", text: W.barTitle }), bar, legend, pores, porCap, msg])
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
      for (var i = 0; i < show; i++) { var f = i < full ? 100 : Math.round(part * 100); trucks.appendChild(el("span", { class: "wtruck" }, [el("b", {}, [el("i", { style: "width:" + f + "%" })])])); }
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

  // ---------- 8. the history of concrete: timeline, Pantheon dome, reinforced beam, how high ----------
  // ---------- illustration kit: gradients, shading and texture for the scenes ----------
  var C = { sky1: "#fff7ea", sky2: "#fbe7cb", sand: "#ecdcae", sandD: "#c9b27a", stone: "#e9e1d4", stoneD: "#c8bdab", rock: "#c9baa6", rockD: "#a89883", conc: "#dcd6cc", concD: "#b8b0a3", water: "#8fbfe0", waterD: "#5b9cc6", orange: "#f37d03", orangeL: "#ffb35c", green: "#6fa76a", greenD: "#4a8150", glass: "#b3d4e6", glassD: "#6d9db6", dark: "#3b3436", metal: "#8a8184" };
  function art(w, h, cls) {
    var id = "ia" + (++uid), s = sv("svg", { viewBox: "0 0 " + w + " " + h, class: cls || "wscene", role: "img", "aria-hidden": "true" }), defs = sv("defs"), n = 0;
    s.appendChild(defs);
    function pts(a) { return a.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "); }
    function style(attrs, ex) {
      var k; ex = ex || {};
      if (!ex.ns) { attrs.stroke = ex.stroke || C.dark; attrs["stroke-width"] = ex.sw || 1.6; attrs["stroke-linejoin"] = "round"; }
      for (k in ex) if (k !== "ns" && k !== "stroke" && k !== "sw") attrs[k] = ex[k];
      return attrs;
    }
    var api = {
      svg: s,
      grad: function (stops, horizontal) { var name = id + "g" + (++n), g = sv("linearGradient", { id: name, x1: 0, y1: 0, x2: horizontal ? 1 : 0, y2: horizontal ? 0 : 1 }); stops.forEach(function (st) { g.appendChild(sv("stop", { offset: st[0], "stop-color": st[1] })); }); defs.appendChild(g); return "url(#" + name + ")"; },
      clip: function (d) { var name = id + "c" + (++n), c = sv("clipPath", { id: name }); c.appendChild(sv("path", { d: d })); defs.appendChild(c); return "url(#" + name + ")"; },
      add: function (tag, attrs, parent) { var e = sv(tag, attrs); (parent || s).appendChild(e); return e; },
      group: function (attrs) { var g = sv("g", attrs || {}); s.appendChild(g); return g; },
      rect: function (x, y, w2, h2, fill, ex, parent) { return api.add("rect", style({ x: x, y: y, width: w2, height: h2, fill: fill }, ex), parent); },
      poly: function (p, fill, ex, parent) { return api.add("polygon", style({ points: pts(p), fill: fill }, ex), parent); },
      path: function (d, fill, ex, parent) { return api.add("path", style({ d: d, fill: fill }, ex), parent); },
      circle: function (cx, cy, r, fill, ex, parent) { return api.add("circle", style({ cx: cx, cy: cy, r: r, fill: fill }, ex), parent); },
      ellipse: function (cx, cy, rx, ry, fill, ex, parent) { return api.add("ellipse", style({ cx: cx, cy: cy, rx: rx, ry: ry, fill: fill }, ex), parent); },
      line: function (x1, y1, x2, y2, stroke, sw, ex, parent) { var a = { x1: x1, y1: y1, x2: x2, y2: y2, stroke: stroke || C.dark, "stroke-width": sw || 1.4, "stroke-linecap": "round" }; if (ex) for (var k in ex) a[k] = ex[k]; return api.add("line", a, parent); },
      shadow: function (cx, cy, rx, ry) { return api.ellipse(cx, cy, rx, ry || rx / 7, C.dark, { ns: true, opacity: 0.15 }); },
      speckle: function (x, y, w2, h2, count, seed, cols, rmax, parent) { var r = seeded(seed); for (var i = 0; i < count; i++) api.circle(x + r() * w2, y + r() * h2, 0.5 + r() * (rmax || 1.4), cols[Math.floor(r() * cols.length)], { ns: true, opacity: 0.55 }, parent); },
      cube: function (x, y, sz, top, left, right) { var d = sz * 0.5; api.poly([[x, y], [x + sz, y - d], [x + 2 * sz, y], [x + sz, y + d]], top, { sw: 1.2 }); api.poly([[x, y], [x + sz, y + d], [x + sz, y + d + sz], [x, y + sz]], left, { sw: 1.2 }); api.poly([[x + sz, y + d], [x + 2 * sz, y], [x + 2 * sz, y + sz], [x + sz, y + d + sz]], right, { sw: 1.2 }); },
      sky: function (ground, gy) { api.rect(0, 0, w, h, api.grad([[0, C.sky1], [1, C.sky2]]), { ns: true }); if (ground) api.rect(0, gy, w, h - gy, api.grad([[0, ground[0]], [1, ground[1]]]), { ns: true }); },
      cloud: function (x, y, k) { var g = api.group({ opacity: 0.85 }); [[0, 0, 16, 7], [14, -4, 14, 8], [28, 0, 16, 7]].forEach(function (c) { api.ellipse(x + c[0] * (k || 1), y + c[1] * (k || 1), c[2] * (k || 1), c[3] * (k || 1), "#fff", { ns: true }, g); }); }
    };
    return api;
  }

  // ---------- timeline scenes ----------
  function scene(key) {
    var a = art(320, 200), i, c;
    if (key === "egypt") {
      a.sky([C.sand, "#d8c48f"], 156); a.circle(264, 46, 38, "rgba(243,125,3,.16)", { ns: true }); a.circle(264, 46, 18, C.orange, { sw: 1.4 });
      a.path("M0,160 Q70,140 140,158 T290,150 T320,152 V200 H0 Z", a.grad([[0, "#efdfb2"], [1, "#d3bd85"]]), { ns: true }); a.shadow(160, 184, 120, 9);
      var A = [168, 34], L = [50, 164], F = [158, 184], R = [274, 162];
      a.poly([A, L, F], a.grad([[0, "#f3e6bd"], [1, "#e0cc98"]], true), { sw: 1.8 }); a.poly([A, F, R], a.grad([[0, "#d3ba80"], [1, "#b99b5a"]], true), { sw: 1.8 });
      for (i = 1; i < 9; i++) { var t = i / 9, pl = [A[0] + (L[0] - A[0]) * t, A[1] + (L[1] - A[1]) * t], pf = [A[0] + (F[0] - A[0]) * t, A[1] + (F[1] - A[1]) * t], pr = [A[0] + (R[0] - A[0]) * t, A[1] + (R[1] - A[1]) * t]; a.line(pl[0], pl[1], pf[0], pf[1], "rgba(59,52,54,.3)", 1); a.line(pf[0], pf[1], pr[0], pr[1], "rgba(59,52,54,.3)", 1); }
      a.cube(30, 176, 14, "#f3e6bd", "#e0cc98", "#c4a965"); a.cube(60, 182, 14, "#f3e6bd", "#e0cc98", "#c4a965"); a.line(32, 168, 56, 168, "#fff", 2.4, { opacity: 0.7 });
    } else if (key === "rome") {
      a.sky(["#d6c9a5", "#bfae86"], 160); a.cloud(60, 30, 1.2); a.cloud(250, 46, 1); a.shadow(160, 168, 140, 7);
      a.rect(20, 104, 280, 56, a.grad([[0, C.stone], [1, C.stoneD]]), {}); a.rect(20, 64, 280, 40, a.grad([[0, "#eee6d8"], [1, C.stone]]), {});
      for (i = 0; i < 6; i++) a.line(20, 112 + i * 8, 300, 112 + i * 8, "rgba(59,52,54,.13)", 1); for (i = 0; i < 4; i++) a.line(20, 72 + i * 8, 300, 72 + i * 8, "rgba(59,52,54,.13)", 1);
      [62, 132, 202, 272].forEach(function (cx) { a.path("M" + (cx - 22) + ",160 V128 A22,22 0 0 1 " + (cx + 22) + ",128 V160 Z", a.grad([[0, "#8d806d"], [1, "#b8ab94"]]), {}); a.rect(cx - 5, 100, 10, 8, "#f4eee3", { sw: 1.1 }); });
      for (i = 0; i < 8; i++) { var cx2 = 37.5 + i * 35; a.path("M" + (cx2 - 11) + ",104 V90 A11,11 0 0 1 " + (cx2 + 11) + ",90 V104 Z", a.grad([[0, "#8d806d"], [1, "#b8ab94"]]), { sw: 1.4 }); }
      a.rect(14, 52, 292, 13, C.stoneD, {}); a.rect(18, 55, 284, 6, a.grad([[0, C.water], [1, C.waterD]]), { ns: true }); a.line(20, 56, 300, 56, "#fff", 1, { opacity: 0.6 });
    } else if (key === "pantheon") {
      a.sky(["#d6c9a5", "#bfae86"], 164); a.cloud(40, 36, 1.1); a.cloud(262, 30, 0.9); a.shadow(160, 170, 110, 6);
      a.path("M72,94 A88,68 0 0 1 248,94 Z", a.grad([[0, "#e4ddd0"], [1, "#c1b7a5"]], true), { sw: 1.8 });
      [[92, 0.78], [114, 0.56], [136, 0.34]].forEach(function (p) { a.path("M" + p[0] + ",94 A" + (88 - (p[0] - 72)) + "," + (68 * (1 - (p[0] - 72) / 88 + 0.0)) + " 0 0 1 " + (320 - p[0]) + ",94", "none", { stroke: "rgba(59,52,54,.35)", sw: 1 }); });
      a.ellipse(160, 28, 10, 3.6, "#fff7ea", { sw: 1.2 });
      a.rect(72, 94, 176, 56, a.grad([[0, "#d4c9b7"], [1, "#b9ad99"]]), {}); for (i = 0; i < 3; i++) a.line(72, 108 + i * 14, 248, 108 + i * 14, "rgba(59,52,54,.18)", 1);
      a.poly([[84, 104], [160, 74], [236, 104]], C.stone, {}); a.poly([[96, 102], [160, 79], [224, 102]], "#d9cfbd", { sw: 1 }); a.rect(82, 102, 156, 9, "#f1eadd", {});
      var colG = a.grad([[0, "#f6f1e8"], [0.55, "#e6ddcd"], [1, "#bfb4a1"]], true);
      a.rect(148, 118, 24, 42, "#5d5046", { sw: 1.4 });
      for (i = 0; i < 8; i++) { var x = 92 + i * 19.5; a.rect(x - 5, 111, 10, 49, colG, { sw: 1.2 }); a.rect(x - 6.5, 109, 13, 3, "#f1eadd", { sw: 1 }); }
      a.rect(78, 160, 164, 5, "#efe8da", {}); a.rect(74, 165, 172, 5, "#e2d9c8", {});
    } else if (key === "lighthouse") {
      a.rect(0, 0, 320, 200, a.grad([[0, "#fbe2bd"], [1, "#fff4e0"]]), { ns: true }); a.rect(0, 126, 320, 74, a.grad([[0, C.water], [1, C.waterD]]), { ns: true });
      for (i = 0; i < 6; i++) { a.path("M" + (10 + i * 54) + "," + (140 + (i % 3) * 14) + " q12,-8 24,0 t24,0", "none", { stroke: "rgba(255,255,255,.55)", sw: 2 }); }
      a.poly([[104, 160], [128, 140], [150, 148], [176, 138], [214, 160]], a.grad([[0, "#9b9094"], [1, "#6d6366"]]), { sw: 1.6 });
      var tw = "M130,150 C144,142 150,112 153,66 L169,66 C172,112 178,142 192,150 Z"; a.path(tw, a.grad([[0, "#f0e9db"], [0.6, "#d9cfbc"], [1, "#b3a792"]], true), { sw: 1.8 });
      var cg = a.group({ "clip-path": a.clip(tw) }); for (i = 0; i < 12; i++) a.line(120, 72 + i * 7, 200, 72 + i * 7, "rgba(59,52,54,.25)", 1, null, cg);
      a.poly([[150, 28], [172, 28], [161, 14]], C.dark, { sw: 1.2 }); a.rect(150, 40, 22, 20, a.grad([[0, "#ffe7a6"], [1, C.orange]]), { sw: 1.4 }); a.rect(146, 60, 30, 6, C.dark, { ns: true }); a.rect(148, 34, 26, 6, C.dark, { ns: true });
      a.poly([[150, 48], [0, 30], [0, 70]], "rgba(255,214,120,.38)", { ns: true }); a.poly([[172, 48], [320, 30], [320, 70]], "rgba(255,214,120,.38)", { ns: true });
      a.path("M112,160 q10,-10 20,0 t20,0 t20,0 t20,0", "none", { stroke: "#fff", sw: 3, opacity: 0.8 });
    } else if (key === "kiln") {
      a.rect(0, 0, 320, 200, a.grad([[0, "#efe6d6"], [1, "#dccfb8"]]), { ns: true }); a.rect(0, 160, 320, 40, a.grad([[0, "#b9ab95"], [1, "#988a74"]]), { ns: true }); a.shadow(160, 168, 130, 6);
      a.rect(276, 44, 30, 116, a.grad([[0, "#cfc7ba"], [1, "#a39a8c"]], true), {}); [66, 92, 118].forEach(function (y) { a.poly([[270, y], [312, y], [291, y + 18]], "#bdb4a6", { sw: 1.3 }); });
      a.ellipse(290, 28, 22, 11, "rgba(120,110,104,.35)", { ns: true }); a.ellipse(302, 14, 16, 8, "rgba(120,110,104,.25)", { ns: true });
      a.rect(78, 126, 18, 34, "#8f877c", {}); a.rect(190, 118, 18, 42, "#8f877c", {});
      var kg = a.group({ transform: "rotate(-6 150 104)" }); var kb = a.grad([[0, "#f3eee5"], [0.45, "#d9d1c3"], [1, "#9a9082"]]);
      a.rect(36, 84, 238, 40, kb, { sw: 1.8 }, kg); [84, 150, 214].forEach(function (x) { a.rect(x, 80, 9, 48, "#7b7168", { sw: 1.2 }, kg); }); a.rect(118, 78, 22, 52, "#a99f90", { sw: 1.2 }, kg);
      a.poly([[38, 92], [10, 82], [0, 104], [10, 124], [38, 116]], C.orange, { sw: 1.4 }, kg); a.poly([[30, 98], [12, 94], [6, 104], [12, 114], [30, 110]], "#ffd57a", { ns: true }, kg);
      a.rect(30, 150, 30, 18, "#f3ede1", { sw: 1.4 }); a.rect(30, 156, 30, 5, C.orange, { ns: true });
    } else if (key === "pot") {
      a.sky(["#cdbb98", "#b3a07c"], 164); a.shadow(160, 172, 80, 6);
      var body = [[98, 96], [222, 96], [208, 170], [112, 170]], cg2 = a.grad([[0, "#d2cbc0"], [0.5, "#e6e0d6"], [1, "#b4ac9f"]], true);
      var leaf = a.grad([[0, C.green], [1, C.greenD]]);
      a.path("M160,84 C158,60 140,40 108,34 C108,64 128,80 160,84 Z", leaf, { sw: 1.4 }); a.path("M160,84 C162,56 184,36 214,30 C216,62 194,80 160,84 Z", leaf, { sw: 1.4 }); a.path("M160,84 C160,60 160,44 160,20 C148,38 150,66 160,84 Z", a.grad([[0, "#85b97c"], [1, C.green]]), { sw: 1.4 });
      a.poly(body, cg2, { sw: 1.8 }); a.rect(90, 82, 140, 15, a.grad([[0, "#e6e0d6"], [1, "#c1b9ab"]]), { sw: 1.8 });
      var cut = a.group({ "clip-path": a.clip("M98,96 L222,96 L208,170 L112,170 Z") }); a.rect(158, 96, 70, 76, "#f1ece3", { sw: 1.4, "stroke-dasharray": "5 3" }, cut); a.speckle(160, 98, 66, 70, 46, 5, ["#a69d90", "#c9c1b5", "#8b8378"], 1.4, cut);
      for (i = 0; i < 6; i++) { a.line(158, 108 + i * 11, 228, 108 + i * 11, C.orange, 2, null, cut); a.line(172 + i * 11, 96, 172 + i * 11 - 3, 172, C.orange, 2, null, cut); }
    } else if (key === "frame") {
      a.sky(["#c9b99a", "#b09f7e"], 164); a.shadow(160, 170, 130, 6);
      var cc = a.grad([[0, "#e0dad0"], [1, "#b9b1a4"]], true);
      a.rect(78, 66, 80, 40, "#f1eadc", { sw: 1.2 }); a.rect(158, 66, 90, 40, "#f1eadc", { sw: 1.2 }); a.rect(78, 112, 80, 48, "#f1eadc", { sw: 1.2 }); a.rect(158, 112, 90, 48, "#f1eadc", { sw: 1.2 });
      a.rect(100, 76, 36, 22, C.glass, { sw: 1.2 }); a.rect(190, 76, 36, 22, C.glass, { sw: 1.2 }); a.rect(100, 126, 36, 24, C.glass, { sw: 1.2 }); a.rect(190, 126, 36, 24, C.glass, { sw: 1.2 });
      [70, 152, 240].forEach(function (x) { a.rect(x, 54, 14, 108, cc, { sw: 1.6 }); }); a.rect(62, 100, 202, 12, cc, { sw: 1.6 }); a.rect(62, 54, 202, 12, cc, { sw: 1.6 }); a.rect(58, 160, 210, 8, "#a69c8e", { sw: 1.4 });
      a.line(70, 106, 262, 106, C.orange, 2.2); a.line(70, 60, 262, 60, C.orange, 2.2);
      a.circle(48, 40, 32, "#fff", { sw: 2 }); a.rect(30, 28, 36, 26, "#e4ded3", { sw: 1.5 }); a.speckle(30, 28, 36, 26, 16, 3, ["#a69d90", "#8b8378"], 1, a.svg);
      a.rect(34, 32, 28, 18, "none", { stroke: C.orange, sw: 1.4 }); [[38, 46], [46, 46], [54, 46], [42, 36], [50, 36]].forEach(function (p) { a.circle(p[0], p[1], 2.2, C.orange, { ns: true }); });
      a.line(64, 58, 82, 98, "rgba(59,52,54,.45)", 1.2, { "stroke-dasharray": "3 3" });
    } else if (key === "tower") {
      a.sky(["#8e8a88", "#6e6a68"], 160); a.rect(0, 160, 320, 40, a.grad([[0, "#7d7878"], [1, "#5d5859"]]), { ns: true }); a.line(0, 182, 320, 182, "#d9d3c9", 2, { "stroke-dasharray": "14 10" });
      [[0, 98, 40, 62], [34, 120, 30, 40], [226, 112, 34, 48], [256, 92, 36, 68], [288, 130, 32, 30]].forEach(function (b) { a.rect(b[0], b[1], b[2], b[3], a.grad([[0, "#cbc5bb"], [1, "#b3ada3"]]), { sw: 1.2 }); });
      a.shadow(170, 164, 90, 5);
      a.rect(116, 24, 80, 136, a.grad([[0, "#ece5d8"], [1, "#d3c9b8"]]), { sw: 1.8 }); a.poly([[196, 24], [212, 32], [212, 158], [196, 160]], "#b3a994", { sw: 1.6 });
      a.rect(112, 18, 88, 8, "#f4eee3", { sw: 1.6 }); a.rect(140, 8, 40, 10, "#d3c9b8", { sw: 1.4 }); a.line(160, 8, 160, 0, C.dark, 1.4);
      var gg = a.grad([[0, "#c4dbe8"], [1, C.glassD]]);
      for (var r = 0; r < 16; r++) for (c = 0; c < 6; c++) a.rect(121 + c * 12.5, 30 + r * 7.2, 8, 5, gg, { sw: 0.8 });
      a.rect(124, 146, 70, 14, "#c9bfae", { sw: 1.4 }); [132, 150, 168].forEach(function (x) { a.path("M" + x + ",160 V153 A5,5 0 0 1 " + (x + 10) + ",153 V160 Z", "#5d5046", { sw: 1 }); });
    } else if (key === "bridge") {
      a.rect(0, 0, 320, 200, a.grad([[0, "#fdf0dc"], [1, "#e6efef"]]), { ns: true }); a.rect(0, 140, 320, 60, a.grad([[0, C.water], [1, C.waterD]]), { ns: true });
      for (i = 0; i < 7; i++) a.path("M" + (6 + i * 48) + "," + (156 + (i % 3) * 12) + " q10,-5 20,0 t20,0", "none", { stroke: "rgba(255,255,255,.55)", sw: 1.6 });
      a.cloud(220, 34, 1.1); a.cloud(60, 50, 0.9);
      [64, 160, 256].forEach(function (x) { a.poly([[x - 9, 98], [x + 9, 98], [x + 6, 146], [x - 6, 146]], a.grad([[0, "#e6e0d6"], [1, "#b4ac9f"]], true), { sw: 1.6 }); a.ellipse(x, 146, 12, 2.5, "rgba(255,255,255,.7)", { ns: true }); });
      a.rect(-4, 90, 328, 11, a.grad([[0, "#ece6dc"], [1, "#c1b9ab"]]), { sw: 1.8 }); a.line(0, 86, 320, 86, C.dark, 1.6); for (i = 0; i < 33; i++) a.line(i * 10, 86, i * 10, 90, C.dark, 1);
      a.circle(262, 46, 33, "#fff", { sw: 2 }); a.rect(240, 34, 44, 24, "#e4ded3", { sw: 1.5 }); a.path("M240,42 Q262,56 284,42", "none", { stroke: C.orange, sw: 2.6 }); [[250, 52], [262, 55], [274, 52]].forEach(function (p) { a.circle(p[0], p[1], 2, C.orange, { ns: true }); });
      a.line(250, 76, 238, 92, "rgba(59,52,54,.45)", 1.2, { "stroke-dasharray": "3 3" });
    } else if (key === "burj") {
      a.rect(0, 0, 320, 200, a.grad([[0, "#fdeccf"], [1, "#fbf3e6"]]), { ns: true }); a.circle(226, 150, 46, "rgba(243,125,3,.18)", { ns: true });
      a.rect(0, 160, 320, 40, a.grad([[0, "#d7cdb9"], [1, "#b9ae98"]]), { ns: true });
      [[8, 112, 26], [36, 126, 22], [70, 104, 24], [226, 120, 24], [254, 100, 26], [286, 124, 24]].forEach(function (b) { a.rect(b[0], b[1], b[2], 160 - b[1], a.grad([[0, "#c1cdd4"], [1, "#9fb0ba"]]), { sw: 1.2 }); });
      var tiers = [[124, 196, 150], [130, 190, 118], [136, 184, 90], [142, 178, 64], [148, 172, 42], [153, 167, 26]], tg = a.grad([[0, "#d6e8f1"], [1, C.glassD]], true);
      tiers.forEach(function (tr) { a.rect(tr[0], tr[2], tr[1] - tr[0], 160 - tr[2], tg, { sw: 1.5 }); });
      tiers.forEach(function (tr) {
        var mid = (tr[0] + tr[1]) / 2; a.rect(mid, tr[2], tr[1] - mid, 160 - tr[2], "rgba(59,52,54,.16)", { ns: true });
        for (var m = tr[0] + 8; m < tr[1] - 2; m += 8) a.line(m, tr[2] + 1, m, 160, "rgba(255,255,255,.4)", 1);
        for (var yy = tr[2] + 8; yy < 160; yy += 9) a.line(tr[0], yy, tr[1], yy, "rgba(59,52,54,.12)", 1);
      });
      a.poly([[158, 26], [162, 26], [160, 2]], C.dark, { sw: 1.2 });
      a.cloud(60, 78, 1.1); a.cloud(250, 60, 1.2); a.cloud(180, 92, 0.8);
    }
    return a.svg;
  }

  // ---------- tunnel scene (longitudinal section) ----------
  function tunnelScene(step) {
    var a = art(360, 200, "wchart wtun"), FACE = step >= 3 ? 296 : 268, i, r = seeded(4), cx;
    a.rect(0, 0, 360, 200, a.grad([[0, C.rock], [1, C.rockD]]), { ns: true });
    for (i = 0; i < 4; i++) a.path("M0," + (20 + i * 44) + " C90," + (10 + i * 44) + " 200," + (34 + i * 44) + " 360," + (18 + i * 44), "none", { stroke: "rgba(59,52,54,.14)", sw: 2 });
    a.speckle(0, 0, 360, 200, 120, 21, ["#8e806d", "#d8cbb8", "#7a6d5d"], 1.8);
    a.rect(0, 56, FACE, 92, a.grad([[0, "#f6f0e4"], [1, "#e4dccd"]]), { ns: true }); a.rect(0, 148, FACE, 10, a.grad([[0, "#8c8584"], [1, "#6b6566"]]), { ns: true }); a.line(0, 148, FACE, 148, C.dark, 1.6);
    a.rect(0, 52, FACE, 5, step >= 6 ? "#9a9189" : "#b3a996", { ns: true });
    a.rect(0, 62, Math.min(FACE - 54, 240), 9, a.grad([[0, "#c7c1b8"], [1, "#8b857d"]]), { sw: 1.2 }); for (i = 0; i < 8; i++) a.line(18 + i * 30, 62, 18 + i * 30, 71, "rgba(59,52,54,.45)", 1);
    for (i = 0; i < 7; i++) { a.circle(24 + i * 36, 78, 2.6, C.orange, { ns: true }); a.circle(24 + i * 36, 78, 6, "rgba(243,125,3,.18)", { ns: true }); }
    var fp = "M" + FACE + ",56 L" + (FACE + 6) + ",70 L" + (FACE - 2) + ",84 L" + (FACE + 7) + ",100 L" + (FACE - 1) + ",116 L" + (FACE + 6) + ",132 L" + FACE + ",148 L" + (FACE + 24) + ",148 L" + (FACE + 24) + ",56 Z";
    a.path(fp, a.grad([[0, "#b6a78f"], [1, C.rockD]], true), { sw: 1.4 }); a.speckle(FACE, 58, 20, 88, 14, 9, ["#7a6d5d", "#d8cbb8"], 1.2);
    function wheel(x, y, rr) { a.circle(x, y, rr, "#2d282a", { sw: 1.2 }); a.circle(x, y, rr * 0.45, "#9a9190", { ns: true }); }
    var oBody = a.grad([[0, "#ffa63a"], [1, "#d96a00"]]), gBody = a.grad([[0, "#e7e1d6"], [1, "#a79e91"]]);
    function holes(n, charged) { for (var k = 0; k < n; k++) { var y = 66 + k * 14; a.line(FACE - 22, y, FACE, y, "#2d282a", 3.4); if (charged) a.line(FACE - 12, y, FACE, y, C.orange, 3.4); } }
    if (step === 0) {
      a.rect(100, 120, 96, 22, oBody, { sw: 1.8 }); a.rect(166, 96, 34, 26, C.glass, { sw: 1.6 }); a.rect(104, 112, 60, 8, "#e0e0e0", { sw: 1.2 }); wheel(120, 144, 11); wheel(176, 144, 11);
      a.add("polyline", { points: "194,118 226,96 " + (FACE - 6) + ",86", fill: "none", stroke: C.dark, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }); a.add("polyline", { points: "194,130 230,126 " + (FACE - 6) + ",114", fill: "none", stroke: "#5b5456", "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" });
      a.rect(FACE - 34, 82, 30, 8, "#5b5456", { sw: 1.2 }); a.rect(FACE - 34, 110, 30, 8, "#5b5456", { sw: 1.2 }); holes(6, false);
    }
    if (step === 1) {
      holes(6, true); a.rect(110, 124, 80, 20, gBody, { sw: 1.8 }); a.rect(166, 104, 28, 22, C.glass, { sw: 1.6 }); wheel(126, 146, 10); wheel(176, 146, 10);
      a.add("polyline", { points: "192,122 224,112 " + (FACE - 30) + ",92", fill: "none", stroke: C.dark, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }); a.rect(FACE - 52, 80, 30, 22, "#d0c8bb", { sw: 1.5 }); a.line(FACE - 48, 91, FACE - 4, 92, "#2d282a", 1.6, { "stroke-dasharray": "3 3" });
    }
    if (step === 2) {
      a.rect(FACE, 56, 28, 92, "#f3ece0", { sw: 1.2, "stroke-dasharray": "5 4", opacity: 0.9 });
      var st = []; for (i = 0; i < 20; i++) { var ang = i * Math.PI / 10, rr = i % 2 ? 16 : 40; st.push([FACE + 14 + Math.cos(ang) * rr, 102 + Math.sin(ang) * rr]); }
      a.poly(st, "#ffd57a", { ns: true, opacity: 0.9 }); a.poly(st.map(function (p) { return [FACE + 14 + (p[0] - FACE - 14) * 0.62, 102 + (p[1] - 102) * 0.62]; }), C.orange, { ns: true }); a.circle(FACE + 14, 102, 9, "#fff7e0", { ns: true });
      for (i = 0; i < 9; i++) a.poly([[FACE - 6 - i * 9, 96 + (i % 4) * 12], [FACE - 1 - i * 9, 92 + (i % 4) * 12], [FACE - 2 - i * 9, 101 + (i % 4) * 12]], "#6d6258", { sw: 1 });
      a.path("M" + (FACE - 40) + ",84 q-14,18 0,36", "none", { stroke: "rgba(243,125,3,.5)", sw: 2.4 }); a.path("M" + (FACE - 56) + ",78 q-20,24 0,48", "none", { stroke: "rgba(243,125,3,.3)", sw: 2.4 });
    }
    if (step === 3) {
      for (i = 0; i < 3; i++) { var yy = 92 + i * 16; a.line(FACE - 12, yy, 118, yy, "#5b9cc6", 3, { "stroke-dasharray": "10 7" }); a.poly([[118, yy - 6], [104, yy], [118, yy + 6]], "#5b9cc6", { ns: true }); }
      a.ellipse(FACE - 10, 100, 24, 36, "rgba(120,110,104,.38)", { ns: true }); a.ellipse(FACE - 36, 112, 18, 26, "rgba(120,110,104,.22)", { ns: true });
      a.circle(30, 100, 20, "#b9b1a5", { sw: 1.6 }); for (i = 0; i < 4; i++) a.line(30, 100, 30 + Math.cos(i * 1.57 + 0.4) * 17, 100 + Math.sin(i * 1.57 + 0.4) * 17, C.dark, 3);
    }
    if (step === 4) {
      a.poly([[196, 148], [FACE + 4, 148], [FACE - 6, 118], [FACE - 26, 104], [236, 112], [212, 130]], a.grad([[0, "#9d8f7e"], [1, "#6d6258"]]), { sw: 1.6 }); a.speckle(206, 108, 78, 40, 28, 12, ["#d8cbb8", "#5d5448"], 2);
      a.rect(76, 122, 70, 22, oBody, { sw: 1.8 }); a.rect(108, 100, 34, 24, C.glass, { sw: 1.6 }); wheel(92, 146, 12); wheel(132, 146, 12);
      a.add("polyline", { points: "146,130 176,128 184,138", fill: "none", stroke: C.dark, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }); a.poly([[176, 120], [200, 124], [196, 144], [176, 144]], "#5b5456", { sw: 1.6 });
    }
    if (step === 5) {
      a.rect(90, 122, 84, 22, gBody, { sw: 1.8 }); a.rect(140, 100, 32, 24, C.glass, { sw: 1.6 }); wheel(106, 146, 11); wheel(156, 146, 11);
      a.add("polyline", { points: "170,114 214,92 " + (FACE - 40) + ",66", fill: "none", stroke: C.dark, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }); a.poly([[FACE - 46, 62], [FACE - 30, 62], [FACE - 38, 74]], C.orange, { sw: 1.4 });
      for (i = 0; i < 4; i++) a.poly([[FACE - 30 + i * 9, 78 + i * 12], [FACE - 25 + i * 9, 75 + i * 12], [FACE - 24 + i * 9, 82 + i * 12]], "#6d6258", { sw: 1 }); a.ellipse(FACE - 20, 80, 22, 10, "rgba(120,110,104,.3)", { ns: true });
    }
    if (step === 6) {
      a.path("M0,52 H" + (FACE - 6) + " V64 H0 Z", a.grad([[0, "#bdb6ac"], [1, "#8d867e"]]), { sw: 1.2 }); a.speckle(0, 52, FACE - 6, 12, 60, 17, ["#6d6860", "#d4cec4"], 1);
      a.rect(80, 122, 92, 22, oBody, { sw: 1.8 }); a.rect(140, 100, 32, 24, C.glass, { sw: 1.6 }); wheel(98, 146, 11); wheel(152, 146, 11);
      a.add("polyline", { points: "168,114 208,92 " + (FACE - 66) + ",72", fill: "none", stroke: C.dark, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }); a.rect(FACE - 72, 64, 12, 18, "#5b5456", { sw: 1.2 });
      a.poly([[FACE - 62, 70], [FACE - 20, 52], [FACE - 20, 66]], "rgba(120,114,108,.4)", { ns: true }); for (i = 0; i < 12; i++) a.circle(FACE - 60 + r() * 40, 56 + r() * 12, 1.3, "#6d6860", { ns: true });
    }
    if (step === 7) {
      a.path("M0,52 H" + (FACE - 6) + " V64 H0 Z", a.grad([[0, "#bdb6ac"], [1, "#8d867e"]]), { sw: 1.2 });
      for (i = 0; i < 7; i++) { cx = 30 + i * 40; a.line(cx, 58, cx, 20, C.orange, 3); a.rect(cx - 6, 56, 12, 5, "#5b5456", { sw: 1 }); a.circle(cx, 20, 2.6, "#ffd57a", { sw: 1 }); }
      a.path("M232,52 l8,-14 l-6,-12 l8,-14", "none", { stroke: "#2d282a", sw: 3 }); a.path("M232,52 l8,-14 l-6,-12 l8,-14", "none", { stroke: "#ffb35c", sw: 1.4 });
      a.rect(90, 122, 92, 22, gBody, { sw: 1.8 }); a.rect(150, 100, 32, 24, C.glass, { sw: 1.6 }); wheel(108, 146, 11); wheel(162, 146, 11);
      a.add("polyline", { points: "178,114 206,92 232,72", fill: "none", stroke: C.dark, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }); a.add("path", { d: "M0,134 C60,124 90,140 100,132", fill: "none", stroke: "#5b9cc6", "stroke-width": 0 });
    }
    return a.svg;
  }

  function buildTid(app) {
    var W = T.hist, EV = W.ev, S = { i: 0 };
    var sl = slider(W.step, 0, EV.length - 1, 1, 0, function (v) { return yearText(EV[v][0]); }, function (v) { S.i = v; draw(); });
    var rail = el("ul", { class: "wrail" }), btns = [];
    EV.forEach(function (e, i) { var b = el("button", { type: "button", class: "wrail__b", text: yearShort(e[0]) }); b.addEventListener("click", function () { go(i); }); btns.push(b); rail.appendChild(el("li", {}, [b])); });
    var prev = el("button", { type: "button", class: "wbtn", text: "‹ " + W.prev }), next = el("button", { type: "button", class: "wbtn", text: W.next + " ›" });
    var art = el("div", { class: "wscene__box" }), yr = el("p", { class: "whist__yr" }), ttl = el("h3", { class: "whist__t" }), txt = el("p", { class: "whist__d", "aria-live": "polite" });
    function yearText(y) { return y < 0 ? W.ca + " " + num(-y) + " " + W.bc : (y < 1000 ? W.ca + " " : "") + y; }
    function yearShort(y) { return y < 0 ? num(-y) + " " + W.bc : String(y); }
    function go(i) { S.i = Math.max(0, Math.min(EV.length - 1, i)); sl.input.value = S.i; sl.input.dispatchEvent(new Event("input", { bubbles: true })); }
    prev.addEventListener("click", function () { go(S.i - 1); }); next.addEventListener("click", function () { go(S.i + 1); });
    function draw() {
      var e = EV[S.i]; art.innerHTML = ""; art.appendChild(scene(e[1])); yr.textContent = yearText(e[0]); ttl.textContent = e[2]; txt.textContent = e[3];
      btns.forEach(function (b, i) { b.classList.toggle("is-on", i === S.i); b.setAttribute("aria-current", i === S.i ? "true" : "false"); });
      prev.disabled = S.i === 0; next.disabled = S.i === EV.length - 1;
    }
    app.appendChild(el("div", { class: "whist" }, [art, el("div", { class: "whist__card" }, [yr, ttl, txt, el("div", { class: "whist__nav" }, [prev, next])])]));
    app.appendChild(el("div", { class: "wgt__one" }, [sl.box, rail]));
    draw();
  }

  function buildPantheon(app) {
    var W = T.hist.ph, S = { p: 35 }, R = 21.65, SC = 4.1, CX = 130, BASE = 108, TH1 = 79.1, N = 26;
    function thick(deg) { return 6.4 + (1.2 - 6.4) * deg / TH1; }
    function zone(p) { return p < 30 ? 1 : p < 65 ? 2 : 3; }
    var sl = slider(W.h, 0, 100, 1, 35, function (v) { return num(v) + " %"; }, function (v) { S.p = v; draw(); });
    var A = art(260, 150, "wchart wdome"), svgE = A.svg, segs = [], i, side;
    A.rect(0, 0, 260, 150, A.grad([[0, "#fff7ea"], [1, "#f6ead5"]]), { ns: true });
    A.poly([[CX - SC * 4.1, BASE - SC * (R + 1.2)], [CX + SC * 4.1, BASE - SC * (R + 1.2)], [CX + 74, BASE + 30], [CX - 74, BASE + 30]], "rgba(255,206,110,.3)", { ns: true });
    A.rect(0, BASE + 30, 260, 20, A.grad([[0, "#cdbb94"], [1, "#a8966c"]]), { ns: true });
    function pt(side, deg, rr) { var a = deg * Math.PI / 180; return (CX + side * SC * rr * Math.cos(a)).toFixed(1) + "," + (BASE - SC * rr * Math.sin(a)).toFixed(1); }
    for (side = -1; side <= 1; side += 2) for (i = 0; i < N; i++) {
      var a0 = i * TH1 / N, a1 = (i + 1) * TH1 / N, mid = (i + 0.5) / N * 100, p = sv("polygon", { points: [pt(side, a0, R), pt(side, a1, R), pt(side, a1, R + thick(a1)), pt(side, a0, R + thick(a0))].join(" "), class: "wz wz" + zone(mid) });
      p._m = mid; segs.push(p); svgE.appendChild(p);
    }
    [-1, 1].forEach(function (sd) { svgE.appendChild(sv("rect", { x: sd < 0 ? CX - SC * (R + 6.4) : CX + SC * R, y: BASE, width: SC * 6.4, height: 30, class: "wz wz1" })); });
    var mk = sv("line", { class: "wzmark" }), dot = sv("circle", { r: 4, class: "wmark" });
    svgE.appendChild(mk); svgE.appendChild(dot);
    svgE.appendChild(sv("text", { x: CX, y: BASE + 24, "text-anchor": "middle", class: "wtxt", text: W.base })); svgE.appendChild(sv("text", { x: CX, y: 12, "text-anchor": "middle", class: "wtxt", text: W.top }));
    A.line(CX - SC * R + 2, BASE + 12, CX + SC * R - 2, BASE + 12, C.dark, 1.2); A.poly([[CX - SC * R + 2, BASE + 12], [CX - SC * R + 8, BASE + 9], [CX - SC * R + 8, BASE + 15]], C.dark, { ns: true }); A.poly([[CX + SC * R - 2, BASE + 12], [CX + SC * R - 8, BASE + 9], [CX + SC * R - 8, BASE + 15]], C.dark, { ns: true });
    var dim = A.add("text", { x: CX, y: BASE + 9, "text-anchor": "middle", class: "wcall" }); dim.textContent = "43,3 m";
    var stT = stat(W.thick, "m"), stH = stat(W.height, "m"), stM = el("div", { class: "st st--wide" }), mTxt = el("strong", { class: "st__v st__v--s" }); stM.appendChild(mTxt); stM.appendChild(el("span", { class: "st__l", text: W.mat }));
    var legend = el("ul", { class: "wleg" }); [[1, W.z1], [2, W.z2], [3, W.z3]].forEach(function (z) { legend.appendChild(el("li", {}, [el("i", { class: "sw swz" + z[0] }), el("span", { text: z[1] })])); });
    function draw() {
      var deg = S.p / 100 * TH1, t = thick(deg), z = zone(S.p), sd = 1;
      segs.forEach(function (s) { s.classList.toggle("is-hot", Math.abs(s._m - S.p) < 100 / N * 0.75); });
      var p1 = pt(sd, deg, R).split(","), p2 = pt(sd, deg, R + t).split(",");
      mk.setAttribute("x1", p1[0]); mk.setAttribute("y1", p1[1]); mk.setAttribute("x2", p2[0]); mk.setAttribute("y2", p2[1]); dot.setAttribute("cx", (Number(p1[0]) + Number(p2[0])) / 2); dot.setAttribute("cy", (Number(p1[1]) + Number(p2[1])) / 2);
      stT.set(num(t, 1)); stH.set(num(R * Math.sin(deg * Math.PI / 180), 1)); mTxt.textContent = z === 1 ? W.z1 : z === 2 ? W.z2 : W.z3;
    }
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [sl.box, el("p", { class: "wgt__extra", text: W.note })]), el("div", { class: "wgt__out" }, [svgE, legend, el("div", { class: "stats" }, [stT.box, stH.box, stM])])]));
    app.appendChild(how(W.how));
    draw();
  }

  function buildArm(app) {
    var W = T.hist.ar, S = { m: 0, l: 0 };
    var mode = segmented(W.mode, [W.m0, W.m1], 0, function (i) { S.m = i; draw(); });
    var ld = slider(W.load, 0, 100, 1, 0, function (v) { return num(v) + " %"; }, function (v) { S.l = v; draw(); });
    var A = art(300, 160, "wchart wbeam"), svgE = A.svg, bg = A.grad([[0, "#ece6dc"], [1, "#bdb4a5"]]), body = sv("g"), msg = el("p", { class: "wgt__big", "aria-live": "polite" });
    var XL = 40, XR = 260, YT = 76, H = 26;
    function beamPath(d) { var top = [], bot = [], k; for (k = 0; k <= 14; k++) { var x = XL + (XR - XL) * k / 14, dy = d * (1 - Math.pow((x - 150) / 110, 2)); top.push(x.toFixed(1) + "," + (YT + dy).toFixed(1)); bot.unshift(x.toFixed(1) + "," + (YT + H + dy).toFixed(1)); } return top.concat(bot).join(" "); }
    function line(x1, y1, x2, y2, cls) { return sv("line", { x1: x1, y1: y1, x2: x2, y2: y2, class: cls }); }
    function draw() {
      var P = S.l, broken = S.m === 0 && P >= 18, d = S.m === 0 ? Math.min(P, 8) / 8 * 2 : P / 100 * 22, k, st;
      body.innerHTML = "";
      body.appendChild(sv("polygon", { points: "44," + (YT + H + 24) + " 56," + (YT + H) + " 68," + (YT + H + 24), class: "wsup" })); body.appendChild(sv("polygon", { points: "232," + (YT + H + 24) + " 244," + (YT + H) + " 256," + (YT + H + 24), class: "wsup" }));
      if (broken) {
        var l = sv("g", { transform: "rotate(8 56 " + (YT + H) + ")" }), r = sv("g", { transform: "rotate(-8 244 " + (YT + H) + ")" });
        l.appendChild(sv("polygon", { points: XL + "," + YT + " 150," + YT + " 150," + (YT + H) + " " + XL + "," + (YT + H), fill: bg, stroke: "#3b3436", "stroke-width": 1.8, "stroke-linejoin": "round" })); r.appendChild(sv("polygon", { points: "150," + YT + " " + XR + "," + YT + " " + XR + "," + (YT + H) + " 150," + (YT + H), fill: bg, stroke: "#3b3436", "stroke-width": 1.8, "stroke-linejoin": "round" }));
        body.appendChild(l); body.appendChild(r); st = 2;
      } else {
        body.appendChild(sv("polygon", { points: beamPath(d), fill: bg, stroke: "#3b3436", "stroke-width": 1.8, "stroke-linejoin": "round" }));
        if (S.m === 0 && P >= 8) { var cl = (P - 8) / 10 * H; body.appendChild(line(150, YT + H + d, 150, YT + H + d - cl, "wcrack")); st = 1; } else st = 0;
        if (S.m === 1) {
          if (P >= 12) for (k = -3; k <= 3; k++) { var cx2 = 150 + k * 16, cdy = d * (1 - Math.pow((cx2 - 150) / 110, 2)), cl2 = Math.max(3, (6 - Math.abs(k) * 1.5)) * (0.5 + P / 100); body.appendChild(line(cx2, YT + H + cdy, cx2, YT + H + cdy - cl2, "wcrack")); }
          st = P < 12 ? 0 : P < 60 ? 1 : 2;
          var rb = []; for (k = 0; k <= 14; k++) { var xr = XL + 8 + (XR - XL - 16) * k / 14, dy = d * (1 - Math.pow((xr - 150) / 110, 2)); rb.push((k ? "L" : "M") + xr.toFixed(1) + " " + (YT + H - 5 + dy).toFixed(1)); }
          body.appendChild(sv("path", { d: rb.join(""), class: "hr", fill: "none" }));
        }
      }
      if (P > 0) {
        var topY = broken ? YT + 10 : YT + d, ax = 150, len = 8 + P * 0.35, y0 = topY - 4 - len;
        body.appendChild(line(ax, y0, ax, topY - 3, "wload")); body.appendChild(sv("polygon", { points: (ax - 6) + "," + (topY - 10) + " " + (ax + 6) + "," + (topY - 10) + " " + ax + "," + (topY - 2), class: "wloadhead" }));
        if (!broken) { body.appendChild(sv("text", { x: 150, y: YT + 17 + d, "text-anchor": "middle", class: "wtxt", text: W.press })); body.appendChild(sv("text", { x: 150, y: YT + H + 14 + d, "text-anchor": "middle", class: "wtxt", text: W.tens })); }
      }
      msg.textContent = (S.m === 0 ? [W.a0, W.a1, W.a2] : [W.b0, W.b1, W.b2])[st];
    }
    A.rect(0, 0, 300, 160, "#faf7f3", { ns: true }); A.rect(0, 126, 300, 34, A.grad([[0, "#cdbb94"], [1, "#a8966c"]]), { ns: true }); svgE.appendChild(body);
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [mode.box, ld.box, el("p", { class: "wgt__extra", text: W.hint })]), el("div", { class: "wgt__out" }, [svgE, msg])]));
    app.appendChild(how(W.how));
    draw();
  }

  function buildHojd(app) {
    var W = T.hist.hh, IT = W.items, S = { i: 0 }, GY = 262, K = 220 / 828, cur = IT.map(function () { return 0; }), raf = 0;
    var sl = slider(W.step, 0, IT.length - 1, 1, 0, function (v) { return String(IT[v][0]); }, function (v) { S.i = v; draw(); });
    var A = art(560, 300, "wchart whigh"), svgE = A.svg, msg = el("p", { class: "wgt__big", "aria-live": "polite" }), note = el("p", { class: "wgt__extra" });
    A.rect(0, 0, 560, 300, A.grad([[0, "#fff7ea"], [1, "#fdeed8"]]), { ns: true }); A.rect(0, GY, 560, 300 - GY, A.grad([[0, "#cdbb94"], [1, "#a8966c"]]), { ns: true });
    var patId = "wpat" + (++uid), pat = sv("pattern", { id: patId, patternUnits: "userSpaceOnUse", width: 6, height: 8 }); pat.appendChild(sv("rect", { x: 1.5, y: 2, width: 3, height: 4, fill: "rgba(255,255,255,.6)" })); svgE.firstChild.appendChild(pat);
    var gradG = A.grad([[0, "#a39b9e"], [1, "#6b6366"]], true), gradO = A.grad([[0, "#ffa63a"], [1, "#d96a00"]], true);
    [100, 300, 500, 800].forEach(function (m) { svgE.appendChild(sv("line", { x1: 40, x2: 550, y1: GY - m * K, y2: GY - m * K, class: "wgrid-l" })); svgE.appendChild(sv("text", { x: 36, y: GY - m * K + 4, "text-anchor": "end", class: "wtxt", text: m + " m" })); });
    svgE.appendChild(sv("line", { x1: 40, x2: 550, y1: GY, y2: GY, class: "hg" }));
    var WID = [54, 30, 58, 20, 14, 24, 28], bars = IT.map(function (it, i) {
      var cx = 90 + i * 74, w = WID[i], r = sv("rect", { x: cx - w / 2, y: GY, width: w, height: 0, fill: i === IT.length - 1 ? gradO : gradG, stroke: "#3b3436", "stroke-width": 1.4 }), ov = sv("rect", { x: cx - w / 2, y: GY, width: w, height: 0, fill: "url(#" + patId + ")", opacity: 0.8 }), lab = sv("text", { x: cx, y: GY + 16, "text-anchor": "middle", class: "wtxt", text: it[2] }), hv = sv("text", { x: cx, y: GY - 6, "text-anchor": "middle", class: "wlbl wlbl--s" });
      svgE.appendChild(r); svgE.appendChild(ov); svgE.appendChild(lab); svgE.appendChild(hv); return { r: r, ov: ov, hv: hv, lab: lab, w: w, cx: cx };
    });
    function paint() { bars.forEach(function (b, i) { var h = cur[i]; b.r.setAttribute("height", Math.max(0, h)); b.r.setAttribute("y", GY - h); b.ov.setAttribute("height", Math.max(0, h)); b.ov.setAttribute("y", GY - h); b.hv.setAttribute("y", GY - h - 6); b.hv.textContent = h > 1 ? num(Math.round(h / K)) + " m" : ""; b.lab.setAttribute("opacity", i <= S.i ? 1 : 0.25); }); }
    function draw() {
      cancelAnimationFrame(raf);
      var from = cur.slice(), to = IT.map(function (it, i) { return i <= S.i ? it[1] * K : 0; }), t0 = performance.now(), D = REDUCE ? 1 : 650;
      (function step(now) { var u = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - u, 3); cur = from.map(function (f, i) { return f + (to[i] - f) * e; }); paint(); if (u < 1) raf = requestAnimationFrame(step); })(t0);
      var it = IT[S.i]; msg.textContent = W.now.replace("{y}", it[0]).replace("{n}", it[3]).replace("{h}", num(it[1]));
      note.textContent = S.i <= 1 ? W.note0 : ""; note.hidden = S.i > 1;
    }
    app.appendChild(el("div", { class: "wgt__one" }, [sl.box, msg, svgE, note]));
    app.appendChild(how(W.how));
    draw();
  }

  // ---------- 9. tunnelling: the drill-and-blast cycle, and what ground means for method and risk ----------

  // ---------- labelled illustrations: TBM cutaway and Roman wall section ----------
  function callout(a, x, y, tx, ty, text, anchor) {
    a.line(x, y + 2, tx, ty, C.dark, 1.2, { "stroke-dasharray": "2 2" });
    a.circle(tx, ty, 2.4, C.orange, { sw: 1 });
    var t = a.add("text", { x: x, y: y, "text-anchor": anchor || "middle", class: "wcall" }); t.textContent = text;
  }
  function tbmScene(L) {
    var a = art(400, 232, "wchart wtbm"), i, r = seeded(8);
    a.rect(0, 0, 400, 232, a.grad([[0, C.rock], [1, C.rockD]]), { ns: true });
    for (i = 0; i < 4; i++) a.path("M0," + (20 + i * 56) + " C100," + (10 + i * 56) + " 240," + (32 + i * 56) + " 400," + (18 + i * 56), "none", { stroke: "rgba(59,52,54,.14)", sw: 2 });
    a.speckle(0, 0, 400, 232, 160, 31, ["#8e806d", "#d8cbb8", "#7a6d5d"], 1.8);
    a.rect(0, 62, 336, 108, a.grad([[0, "#f7f1e5"], [1, "#e0d7c6"]]), { ns: true });
    for (i = 0; i < 11; i++) { var x = 34 + i * 14; a.rect(x, 50, 14, 14, i % 2 ? "#cdc6bb" : "#e3ddd3", { sw: 1 }); a.rect(x, 168, 14, 14, i % 2 ? "#cdc6bb" : "#e3ddd3", { sw: 1 }); }
    a.rect(0, 50, 34, 14, "#b3a996", { ns: true }); a.rect(0, 168, 34, 14, "#b3a996", { ns: true });
    a.rect(0, 164, 188, 4, "#8c8584", { ns: true });
    var steel = a.grad([[0, "#d7dadc"], [0.5, "#aeb4b8"], [1, "#7b8186"]]);
    a.rect(192, 62, 124, 106, steel, { sw: 1.8 }); a.rect(204, 76, 96, 78, "#e9e4da", { sw: 1.2 }); a.rect(206, 96, 92, 4, "#b8b0a3", { ns: true });
    a.line(252, 118, 220, 80, C.dark, 5); a.rect(206, 70, 26, 8, "#e3ddd3", { sw: 1.2, transform: "rotate(-24 219 74)" }); a.circle(252, 118, 7, "#6b6466", { sw: 1.4 });
    for (i = 0; i < 5; i++) { a.rect(176, 70 + i * 20, 18, 8, "#4a4446", { sw: 1.2 }); a.rect(166, 72 + i * 20, 12, 4, "#9a9190", { sw: 1 }); }
    a.poly([[316, 62], [336, 72], [336, 160], [316, 170]], a.grad([[0, "#5b5456"], [1, "#2f2a2c"]], true), { sw: 1.8 });
    for (i = 0; i < 5; i++) { a.circle(337, 78 + i * 19, 5.2, C.orange, { sw: 1.3 }); a.circle(337, 78 + i * 19, 1.8, "#fff1d6", { ns: true }); }
    a.rect(0, 124, 306, 6, "#2f2a2c", { sw: 1 }); for (i = 0; i < 31; i++) a.circle(6 + i * 10, 127, 1.6, "#9a9190", { ns: true });
    for (i = 0; i < 9; i++) a.poly([[300 - i * 34 - 6, 124], [300 - i * 34 + 6, 124], [300 - i * 34 + 4, 116 - (i % 2) * 2], [300 - i * 34 - 4, 117]], "#7a6d5d", { sw: 1 });
    a.rect(30, 134, 124, 30, "#d6cfc2", { sw: 1.6 }); a.rect(38, 140, 24, 12, C.glass, { sw: 1 }); a.rect(70, 140, 24, 12, C.glass, { sw: 1 }); a.circle(44, 168, 5, "#2d282a", { ns: true }); a.circle(140, 168, 5, "#2d282a", { ns: true });
    if (L) { callout(a, 324, 22, 330, 80, L[0]); callout(a, 246, 22, 246, 64, L[1]); callout(a, 170, 22, 184, 88, L[2]); callout(a, 100, 22, 100, 54, L[3]); callout(a, 56, 212, 56, 126, L[4]); }
    return a.svg;
  }
  function romanScene(L) {
    var a = art(460, 230, "wchart wroman"), i, r = seeded(14);
    a.rect(0, 0, 460, 230, a.grad([[0, C.sky1], [1, C.sky2]]), { ns: true });
    a.rect(0, 206, 460, 24, a.grad([[0, "#cbb990"], [1, "#a8966c"]]), { ns: true });
    a.rect(60, 196, 200, 12, "#9a9190", { sw: 1.4 });
    a.rect(98, 16, 124, 182, "#d9cdb4", { sw: 1.6 }); a.speckle(98, 16, 124, 182, 110, 3, ["#b9a98a", "#efe5cf", "#9d8e72"], 1.1);
    var cols = ["#a99d90", "#c9b9a0", "#9b8f84", "#b7a58a", "#8e8378", "#c59a79"];
    for (i = 0; i < 46; i++) {
      var cx = 104 + r() * 112, cy = 22 + r() * 170, rr = 7 + r() * 9, pts = [], n = 7, k;
      for (k = 0; k < n; k++) { var an = k / n * 6.283 + r() * 0.5, rd = rr * (0.7 + r() * 0.5); pts.push([Math.max(100, Math.min(220, cx + Math.cos(an) * rd)), Math.max(18, Math.min(196, cy + Math.sin(an) * rd * 0.85))]); }
      a.poly(pts, cols[i % cols.length], { sw: 1, opacity: 0.95 });
    }
    function bricks(x0) {
      for (var row = 0; row < 18; row++) {
        var y = 16 + row * 10.1, off = row % 2 ? 7 : 0;
        for (var b = 0; b < 3; b++) { var bx = x0 + b * 15 - off, w = 14; if (bx < x0) { w -= x0 - bx; bx = x0; } if (bx + w > x0 + 30) w = x0 + 30 - bx; if (w > 1) a.rect(bx, y, w, 9.2, row % 3 === 0 ? "#bf6f4f" : row % 3 === 1 ? "#cc7d5a" : "#b5644a", { sw: 0.9, stroke: "#e9dcc2" }); }
      }
    }
    bricks(68); bricks(222);
    a.rect(66, 12, 32, 4, "#8e8378", { ns: true }); a.rect(222, 12, 32, 4, "#8e8378", { ns: true }); a.rect(94, 12, 132, 4, "#8e8378", { ns: true });
    callout(a, 70, 224, 82, 140, L[0], "middle"); callout(a, 160, 8, 160, 60, L[1], "middle"); callout(a, 236, 224, 238, 150, L[0], "middle");
    var ix = 296, ing = [[L[2], "#f3ede1"], [L[3], "#7d7068"], [L[4], "#8fbfe0"], [L[5], "#a99d90"]];
    a.rect(278, 30, 172, 170, "#fff", { sw: 1.4, opacity: 0.92 }); var tt = a.add("text", { x: 292, y: 52, class: "wcall wcall--h" }); tt.textContent = L[6];
    ing.forEach(function (g, k) { var y = 80 + k * 28; a.circle(300, y, 9, g[1], { sw: 1.4 }); if (k === 1) a.speckle(292, y - 8, 16, 16, 8, 6, ["#b9a98a", "#4a4446"], 1); var t2 = a.add("text", { x: 318, y: y + 4, class: "wcall" }); t2.textContent = g[0]; });
    return a.svg;
  }
  function buildIllu(app, box) {
    var key = box && box.getAttribute("data-scene"), D = T.illu[key]; if (!D) return;
    var svgE = key === "tbm" ? tbmScene(D.l) : romanScene(D.l), fig = el("figure", { class: "wfig" }, [svgE, el("figcaption", { class: "wfig__c", text: D.cap })]);
    app.appendChild(fig);
  }

  function buildTunCycle(app) {
    var W = T.tun.cyc, S = { i: 0, timer: 0 }, ST = W.steps;
    var art = el("div", { class: "wscene__box wscene__box--wide" }), yr = el("p", { class: "whist__yr" }), ttl = el("h3", { class: "whist__t" }), txt = el("p", { class: "whist__d", "aria-live": "polite" });
    var prev = el("button", { type: "button", class: "wbtn", text: "‹ " + W.prev }), next = el("button", { type: "button", class: "wbtn", text: W.next + " ›" }), play = el("button", { type: "button", class: "wbtn", text: W.play });
    var rail = el("ul", { class: "wrail" }), btns = [];
    ST.forEach(function (s, i) { var b = el("button", { type: "button", class: "wrail__b", text: (i + 1) + ". " + s[0] }); b.addEventListener("click", function () { stop(); go(i); }); btns.push(b); rail.appendChild(el("li", {}, [b])); });
    function go(i) { S.i = (i + ST.length) % ST.length; draw(); }
    function stop() { if (S.timer) { clearInterval(S.timer); S.timer = 0; play.textContent = W.play; } }
    play.addEventListener("click", function () { if (S.timer) { stop(); return; } play.textContent = W.pause; go(S.i + 1); S.timer = setInterval(function () { go(S.i + 1); }, 2600); });
    prev.addEventListener("click", function () { stop(); go(S.i - 1); }); next.addEventListener("click", function () { stop(); go(S.i + 1); });
    function draw() {
      var s = ST[S.i]; art.innerHTML = ""; art.appendChild(tunnelScene(S.i)); yr.textContent = W.step + " " + (S.i + 1) + " " + W.of + " " + ST.length; ttl.textContent = s[0]; txt.textContent = s[1];
      btns.forEach(function (b, i) { b.classList.toggle("is-on", i === S.i); b.setAttribute("aria-current", i === S.i ? "true" : "false"); });
    }
    app.appendChild(el("div", { class: "whist whist--tun" }, [art, el("div", { class: "whist__card" }, [yr, ttl, txt, el("div", { class: "whist__nav" }, [prev, play, next])])]));
    app.appendChild(rail); app.appendChild(how(W.how));
    draw();
  }
  function buildTunVal(app) {
    var W = T.tun.val, S = { g: 0, l: 0 };
    var g = select(W.ground, W.g, 0, function (i) { S.g = i; draw(); }), l = select(W.length, W.l, 0, function (i) { S.l = i; draw(); });
    var meth = el("p", { class: "wgt__big", "aria-live": "polite" }), rUl = el("ul", { class: "wlist wlist--risk" }), fUl = el("ul", { class: "wlist wlist--fix" });
    function fill(ul, items) { ul.innerHTML = ""; items.forEach(function (t) { ul.appendChild(el("li", { text: t })); }); }
    function draw() {
      meth.textContent = W.m["" + S.g + S.l];
      var risks = W.r[S.g].slice(); if (S.l === 2) risks.push(W.rLong[S.g]); fill(rUl, risks); fill(fUl, W.f[S.g]);
    }
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [g.box, l.box, el("p", { class: "wgt__extra", text: W.note })]), el("div", { class: "wgt__out" }, [el("h3", { class: "wgt__sub", text: W.method }), meth, el("h3", { class: "wgt__sub", text: W.risks }), rUl, el("h3", { class: "wgt__sub", text: W.fixes }), fUl])]));
    draw();
  }

  // ---------- 10. shotcrete: rebound, distance and angle ----------
  function buildSpruta(app) {
    var W = T.spr, S = { m: 0, d: 1, a: 90, A: 50, t: 60 }, BASE = [0.25, 0.1], raf = 0;
    var mode = segmented(W.method, [W.m0, W.m1], 0, function (i) { S.m = i; draw(); });
    var sd = slider(W.dist, 0.3, 3, 0.1, 1, function (v) { return num(v, 1) + " m"; }, function (v) { S.d = v; draw(); });
    var sa = slider(W.ang, 45, 90, 5, 90, function (v) { return num(v) + "°"; }, function (v) { S.a = v; draw(); });
    var sA = slider(W.area, 5, 500, 5, 50, function (v) { return num(v) + " m²"; }, function (v) { S.A = v; draw(); });
    var sT = slider(W.thick, 20, 200, 10, 60, function (v) { return num(v) + " mm"; }, function (v) { S.t = v; draw(); });
    var stR = stat(W.rebound, "%"), stN = stat(W.need, W.m3), stI = stat(W.inplace, W.m3), stL = stat(W.lost, W.m3), msg = el("ul", { class: "wmsg" });
    var VW = 320, VH = 150, WX = 276, WY = 72, FY = 134;
    var A = art(VW, VH, "wchart wspray"), svgE = A.svg;
    A.rect(0, 0, VW, VH, A.grad([[0, "#fff7ea"], [1, "#f3e6d0"]]), { ns: true });
    A.rect(WX, 0, 44, VH, A.grad([[0, C.rock], [1, C.rockD]], true), { ns: true }); A.speckle(WX, 0, 44, FY, 46, 6, ["#8e806d", "#d8cbb8", "#7a6d5d"], 1.7);
    A.rect(0, FY, VW, VH - FY, A.grad([[0, "#b5a68f"], [1, "#8f806b"]]), { ns: true }); A.line(0, FY, VW, FY, C.dark, 1.4);
    var layer = A.rect(WX - 6, 0, 6, FY, A.grad([[0, "#b3aca3"], [1, "#7d766f"]], true), { sw: 1.2 }), pile = A.path("M0,0", "#8a8279", { sw: 1.4 }), cone = A.poly([[0, 0], [1, 1], [2, 2]], "rgba(243,125,3,.18)", { ns: true }), nozzle = A.group(), parts = [];
    var N = 22, seed = seeded(11), i;
    for (i = 0; i < N; i++) { var c = A.circle(0, 0, 2.2, "#6d6860", { ns: true }); c._p = { o: seed(), j: seed() * 2 - 1, k: seed() }; parts.push(c); }
    function model() {
      var base = BASE[S.m], fd = S.d < 0.8 ? 1 + (0.8 - S.d) * 0.8 : S.d <= 1.5 ? 1 : 1 + (S.d - 1.5) * 0.5, fa = 1 + (90 - S.a) / 45 * 0.6;
      return Math.min(0.6, base * fd * fa);
    }
    var L = 80, sx = 0, sy = 0, r = 0;
    function geometry() { var len = S.d * L, rad = S.a * Math.PI / 180; sx = WX - len * Math.sin(rad); sy = WY + len * Math.cos(rad); }
    function frame(now) {
      var tt = now / 1000;
      parts.forEach(function (c) {
        var u = (tt * 0.9 + c._p.o) % 1, hit = c._p.k < r;
        if (u < 0.55) { var q = u / 0.55; c.setAttribute("cx", sx + (WX - 6 - sx) * q + c._p.j * 3); c.setAttribute("cy", sy + (WY + c._p.j * 8 - sy) * q); c.setAttribute("opacity", 1); }
        else if (hit) { var f = (u - 0.55) / 0.45; c.setAttribute("cx", WX - 6 - f * 34 * (0.6 + c._p.o)); c.setAttribute("cy", WY + c._p.j * 8 + f * f * (FY - WY - c._p.j * 8)); c.setAttribute("opacity", 1 - f * 0.4); }
        else { c.setAttribute("cx", WX - 6); c.setAttribute("cy", WY + c._p.j * 8); c.setAttribute("opacity", 1 - (u - 0.55) / 0.45); }
      });
      if (!REDUCE) raf = requestAnimationFrame(frame);
    }
    function draw() {
      r = model(); geometry();
      var need = S.A * S.t / 1000 / (1 - r), inPlace = S.A * S.t / 1000;
      stR.set(num(r * 100)); stN.set(num(need, need < 10 ? 2 : 1)); stI.set(num(inPlace, inPlace < 10 ? 2 : 1)); stL.set(num(need - inPlace, need - inPlace < 10 ? 2 : 1));
      layer.setAttribute("width", 4 + S.t / 200 * 12); layer.setAttribute("x", WX - 4 - S.t / 200 * 12);
      var ph = 4 + r * 40; pile.setAttribute("d", "M" + (WX - 70) + "," + FY + " Q" + (WX - 30) + "," + (FY - ph * 1.6) + " " + (WX - 4) + "," + FY + " Z");
      var half = 5 + S.d * 2; cone.setAttribute("points", sx + "," + sy + " " + (WX - 6) + "," + (WY - 12) + " " + (WX - 6) + "," + (WY + 12));
      nozzle.innerHTML = ""; var ang = Math.atan2(WY - sy, WX - sx) * 180 / Math.PI;
      var ng = A.group({ transform: "translate(" + sx.toFixed(1) + " " + sy.toFixed(1) + ") rotate(" + ang.toFixed(1) + ")" }); nozzle.appendChild(ng);
      A.path("M-30,0 C-50,0 -52,22 -80,22", "none", { stroke: "#2d282a", sw: 4 }, ng); A.rect(-32, -6, 30, 12, A.grad([[0, "#6b6466"], [1, "#3f393b"]]), { sw: 1.4 }, ng); A.rect(-4, -4, 12, 8, C.orange, { sw: 1.2 }, ng);
      msg.innerHTML = "";
      if (S.d < 0.8) msg.appendChild(el("li", { class: "wmsg__warn", text: W.near })); else if (S.d > 1.5) msg.appendChild(el("li", { class: "wmsg__warn", text: W.far }));
      if (S.a < 75) msg.appendChild(el("li", { class: "wmsg__warn", text: W.slant }));
      if (S.d >= 0.8 && S.d <= 1.5 && S.a >= 75) msg.appendChild(el("li", { class: "wmsg__ok", text: W.good }));
      msg.appendChild(el("li", { class: "wmsg__info", text: W.note }));
      cancelAnimationFrame(raf); if (REDUCE) frame(1500); else raf = requestAnimationFrame(frame);
    }
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [mode.box, sd.box, sa.box, sA.box, sT.box]), el("div", { class: "wgt__out" }, [svgE, el("div", { class: "stats" }, [stR.box, stN.box, stI.box, stL.box]), msg])]));
    app.appendChild(how(W.how));
    draw();
  }

  var BUILD = { vct: buildVct, harda: buildHarda, injektering: buildInj, atgang: buildAtg, vadarvad: buildVad, volym: buildVolym, klass: buildKlass, tidslinje: buildTid, pantheon: buildPantheon, armering: buildArm, hojd: buildHojd, tunnelcykel: buildTunCycle, tunnelval: buildTunVal, spruta: buildSpruta, illu: buildIllu };
  if (window.__WIDGET_TEST) { window.__WIDGET_TEST.scene = scene; window.__WIDGET_TEST.tunnelScene = tunnelScene; window.__WIDGET_TEST.tbmScene = tbmScene; window.__WIDGET_TEST.romanScene = romanScene; window.__WIDGET_TEST.T = T; }
  [].forEach.call(document.querySelectorAll("[data-widget]"), function (box) {
    var app = box.querySelector(".wgt__app"), fn = BUILD[box.getAttribute("data-widget")];
    if (!app || !fn) return;
    app.innerHTML = ""; fn(app, box); box.classList.add("is-live");
  });
})();
