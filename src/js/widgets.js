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
        fr: {"presets":"Snabbval","p1":["Extra stark","vct 0,40"],"p2":["Vanlig utomhus","vct 0,50"],"p3":["Lättgjuten","vct 0,65"],"less":"Mindre vatten","more":"Mer vatten","add":"+ En hink vatten (10 liter)","remove":"− En hink","perM3":"Så mycket går det åt till en kubikmeter betong","bags":"säckar cement à 25 kg","buckets":"hinkar vatten à 10 liter","mStr":"Hållfasthet","mDen":"Täthet och livslängd","mWork":"Lätt att gjuta","vVeryHigh":"Mycket hög","vHigh":"Hög","vNormal":"Normal","vLow":"Låg","dVery":"Mycket tät","dDense":"Tät","dMid":"Medel","dPorous":"Porös","wStiff":"Trög, behöver flyttillsats","wOk":"Lagom","wFlow":"Lättflytande","wRunny":"Rinnig, stenen kan sjunka","s1":"Mycket stark och tät, men trög. Den behöver oftast flyttillsats för att gå att gjuta.","s2":"Stark och tät betong för krävande miljöer, till exempel ute med frost och tösalt.","s3":"Ett bra allround-recept: stark nog för de flesta jobb och lätt att gjuta.","s4":"Lättare att gjuta, men tydligt svagare och porösare. Bättre inne än ute.","s5":"För mycket vatten: lätt att hälla men svag och porös. Undvik den utomhus.","details":"Visa diagram och detaljer","adv":"Avancerat: cementhalt, konsistens och cementtyp"},
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
          [1936, "dam", "Hooverdammen och kylrören", "När Hooverdammen i USA göts lades kylrör i betongen. Utan dem hade värmen från härdningen, enligt beräkningar på den tiden, tagit mer än hundra år att försvinna."],
          [2010, "burj", "Burj Khalifa", "Burj Khalifa i Dubai är 828 meter hög. Dess kärna och stomme är av höghållfast betong som pumpades upp i höjden."],
          [2016, "print", "Betong ur en skrivare", "Under 2010-talet började man skriva ut väggar, broar och hus i betong med stora 3D-skrivare, lager för lager och utan form.", "2010-talet"]
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
      more2: {"ic":{"flow":"Hur stort flöde behöver du?","press":"Hur högt tryck behöver du?","dbl":"Jämnt flöde (dubbla kolvar)","pu":"Även injektering med polyuretan (PU)","matches":"Modeller som klarar det","best":"minsta som räcker","cap":"Max kapacitet","max":"Max tryck","pistons":"Kolvar","one":"En","two":"Två","lift":"central lyftpunkt","decSmall":"Modellnamnet: blandare HCM {h} och omrörare HRW {r} liter, och pumpen är en ZMP {z}.","decBig":"Modellnamnet: första siffran är ungefär den totala volymen i liter, {v} (blandare HCM {h} och omrörare HRW {r}). Efter snedstrecket står pumpen, ZMP {z}.","ccp":"CCP-versionen har dessutom en högtryckspump för polyuretan och dataloggning.","none":"Ingen IC-modell klarar den kombinationen. Kontakta oss, så hittar vi en annan lösning, till exempel en ZMP-pump eller en större anläggning.","note":"Högsta kapacitet och högsta tryck nås inte samtidigt, det beror på kolvstorleken. Vi hjälper dig att välja.","how":"Värdena kommer från tabellerna på våra produktsidor för Häny. Urvalet visar de modeller vars maxkapacitet och maxtryck räcker, sorterade efter storlek."},"mix":{"type":"Blandare","types":["Paddelblandare","Kolloidblandare (högskjuvande)"],"time":"Blandningstid","disp":"Hur väl cementet är spritt","bleed":"Vattenseparation efter 2 timmar","water":"separerat vatten","paddle":"En paddelblandare rör om, men bryter inte upp alla klumpar av cementkorn. Bruket separerar mer: vatten lägger sig överst.","colloid":"En kolloidblandare sliter isär klumparna med hög skjuvning. Kornen sprids jämnt och bruket blir stabilt, med lite separation.","why":"Ett väl blandat bruk tränger lättare in i fina sprickor, separerar mindre och ger jämnare kvalitet.","how":"Illustrativ modell för att visa skillnaden. Verklig separation beror på cement, vct, tillsatser och blandare. Den mäts till exempel genom att låta bruket stå i ett mätglas."},"log":{"rock":"Hur ser berget ut?","rocks":["Täta sprickor","Normalt","Öppen spricka"],"pstop":"Stopptryck","vmax":"Största volym per hål","flow":"Pumpens flöde","vol":"Injekterad volym","time":"Tid","reason":"Stoppade på","byVol":"volym","byPress":"tryck","byTime":"tid","axes":["tryck, bar","flöde, l/min","minuter"],"sVol":"Hålet tog den största tillåtna volymen innan trycket nåddes. Här kan det behövas ett tjockare bruk eller fler hål.","sPress":"Trycket nådde stopptrycket och flödet sjönk tills hålet var tätt. Det är så man vill att det ska gå.","sTime":"Injekteringen stoppades på tid.","logger":"En datalogger, till exempel från Jean Lutz, registrerar tryck, flöde och volym hela tiden. Då vet man exakt när stoppkriteriet nåddes och kan visa det i efterhand.","how":"Förenklad simulering. Trycket stiger när sprickorna fylls, och när stopptrycket nås sänks flödet tills det nästan står still. Injekteringen avslutas när antingen volymen eller trycket nått sin gräns."}},
      more: {"frost":{"air":"Luftporer i betongen","sat":"Hur vattenmättad är betongen?","freeze":"Frys betongen","thaw":"Tina igen","spacing":"Avstånd mellan luftporerna, ungefär","risk":"Risk för frostskador","levels":["Låg","Måttlig","Hög"],"before":"Blå prickar är vattenfyllda porer och vita bubblor är luftporer. Tryck på Frys och se vad som händer.","after":["Isen får plats: vattnet trycks ut i luftporerna i närheten, och betongen klarar sig.","Det blir trångt. En del porer ligger för långt från närmaste luftpor, och det bildas fina sprickor.","Isen får inte plats. Porerna långt från luftporerna spricker, och efter många frys-tö-cykler smular ytan sönder."],"dry":"Betongen är inte vattenmättad, så det finns luft kvar i porerna där isen kan ta plats.","rule":"När vatten fryser till is ökar volymen med ungefär 9 procent. Frostbeständig betong har därför ofta 4 till 6 procent små luftporer, tätt fördelade.","how":"Förenklad modell. Avståndet mellan luftporerna uppskattas från lufthalten (ungefär 0,75 / lufthalt^0,9 mm), och ett vanligt krav är omkring 0,2 mm. Under ungefär 86 procent vattenmättnad räknas risken som låg. I verkligheten spelar även porstorlek, salt och antalet frys-tö-cykler in."},"pump":{"dia":"Cylinderns diameter","stroke":"Slaglängd","spm":"Slag per minut","perMin":"per min","eff":"Fyllnadsgrad","perStroke":"Betong per slag","l":"liter","out":"Kapacitet","truck":"Tid för en betongbil (8 m³)","min":"minuter","now":"Pumpen ger ungefär {q} m³ i timmen. En platta på 50 m³ tar då ungefär {h} timmar att pumpa.","real":"I praktiken blir det mindre: byten av betongbil, flyttar och pauser gör att medelkapaciteten ofta är klart lägre än pumpens maxkapacitet.","rule":"Tumregel: rörets innerdiameter bör vara minst tre gånger så stor som den största stenen i betongen.","how":"Volym per slag = π × (diameter / 2)² × slaglängd. Kapacitet = volym per slag × slag per minut × 60 × fyllnadsgrad. Kolvarna arbetar växelvis: när den ena trycker ut betong suger den andra in ny från tratten, och en S-ventil växlar mellan dem."},"rock":{"size":"Stenens storlek (diameter)","height":"Fallhöjd","drop":"Släpp stenen","mass":"Vikt","speed":"Hastighet vid nedslag","energy":"Rörelseenergi","now":"Stenen träffar med ungefär {e} kJ, lika mycket rörelseenergi som {c} personbilar i 50 km/h.","scale":"Skyddsnät klassas efter hur mycket energi de kan ta upp, i kJ:","need":"Det kräver ett skyddsnät som är klassat för minst {n} kJ.","huge":"Det är mer energi än de flesta skyddsnät klarar. Då behövs andra åtgärder, till exempel att säkra berget där stenen sitter eller en vall.","real":"Räkningen gäller fritt fall, det värsta fallet. En sten som rullar och studsar nerför en slänt bromsas en del, men kan också få fart i sidled.","how":"Stenen räknas som en kula av berg med densiteten 2 700 kg/m³. Hastighet v = √(2 × g × h) och energi E = ½ × m × v². En personbil på 1 500 kg i 50 km/h har ungefär 145 kJ. Klasserna är typiska energinivåer för provade skyddsnät."},"marsh":{"fluid":"Vad mäter du?","fluids":["Vatten (kontroll)","Tunt bruk (vct 1,0)","Normalt bruk (vct 0,8)","Tjockt bruk (vct 0,6)","Bentonitslurry"],"speedL":"Hastighet","speeds":["Realtid","4 gånger snabbare"],"start":"Släpp fingret och starta","stop":"Stoppa klockan","ready":"Tryck på start och stoppa klockan när bruket i kannan når strecket vid 946 ml.","running":"Bruket rinner ut. Stoppa när kannan når strecket!","good":"Bra mätt! Du fick {u} sekunder, och rätt tid är cirka {t} sekunder.","result":"Du fick {u} sekunder. Rätt tid är cirka {t} sekunder. Prova igen!","missed":"Kannan rann över strecket. Rätt tid var cirka {t} sekunder.","note":"Rent vatten ska ge ungefär 26 sekunder för 946 ml. Gör det inte det är tratten smutsig eller skadad.","how":"Tiderna för bruk och slurry är illustrativa exempel. Den verkliga tiden beror på cement, tillsatser, temperatur och hur länge bruket har blandats. Tratten fylls med 1 500 ml genom silen och tiden för 946 ml mäts."}},
      chem: {"kiln":{"temp":"Temperatur i ugnen","hint":"Dra i reglaget eller klicka på ett steg och följ råmjölet genom ugnen.","after":"Klinkern kyls snabbt och mals sedan tillsammans med lite gips till cement.","how":"Förenklad bild av en roterugn. Temperaturerna är ungefärliga och skiljer sig mellan ugnar. Råmjölet matas in i den kalla änden (till höger), och lågan sitter i den heta änden (till vänster).","stages":[[20,"Torkning","råmjölet, malen kalksten och lera, värms upp och vattnet kokar bort."],[400,"Leran ger upp vatten","lermineralerna avger sitt kemiskt bundna vatten."],[650,"Kalcinering","kalkstenen sönderdelas, CaCO₃ blir CaO och CO₂. Här frigörs ungefär 60 procent av cementtillverkningens koldioxid, direkt ur stenen."],[950,"Belit bildas","kalken reagerar med kiseldioxid från leran och bildar belit, C₂S."],[1250,"Sintring och alit","en del av materialet smälter, alit (C₃S) bildas och klinkerkulor formas. Högsta temperatur är ungefär 1 450 °C."]]},"clinker":{"react":"När vatten tillsätts reagerar alit och belit och bildar C-S-H (kalciumsilikathydrat), som är det egentliga limmet i betongen, och kalciumhydroxid.","how":"Typiska värden för ett portlandcement (CEM I). Andelarna varierar mellan fabriker. Cementkemister skriver C för CaO, S för SiO₂, A för Al₂O₃ och F för Fe₂O₃.","phases":[["alit","Alit","C₃S, trikalciumsilikat",57,"#f37d03","Reagerar snabbt med vatten och ger det mesta av hållfastheten de första veckorna."],["belit","Belit","C₂S, dikalciumsilikat",18,"#d9a86a","Reagerar långsamt och fortsätter ge hållfasthet i månader och år."],["aluminat","Aluminat","C₃A, trikalciumaluminat",8,"#8fbfe0","Reagerar mycket snabbt och utvecklar värme. Utan gips skulle cementet stelna på några minuter."],["ferrit","Ferrit","C₄AF, tetrakalciumaluminatferrit",9,"#6b6466","Ger cementet dess gråa färg och bidrar lite till hållfastheten. Vitt cement har nästan ingen ferrit."],["gips","Gips","CaSO₄ · 2H₂O, kalciumsulfat",5,"#d8d1c4","Tillsätts vid malningen och styr hur snabbt cementet börjar stelna."],["ovrigt","Övrigt","bland annat magnesiumoxid och alkalier",3,"#a8a19a","Små mängder andra ämnen. I CEM II och CEM III ersätts en del av klinkern med till exempel kalksten eller slagg."]]},"carb":{"years":"Betongens ålder","yr":"år","exp":"Var sitter betongen?","exps":["Inomhus, torrt","Utomhus, skyddad mot regn","Utomhus, i regn","I mark eller vatten"],"qual":"Betongens kvalitet","quals":["Tät (vct 0,40)","Normal (vct 0,50)","Porös (vct 0,60)"],"cover":"Täckskikt till armeringen","depth":"Karbonatiseringsdjup","uptake":"Upptagen koldioxid","perM2":"kg per m² yta","car":"Motsvarar bilkörning","now":"Efter {t} år har koldioxid trängt in ungefär {d} mm i betongen.","rust":"Karbonatiseringen har nått armeringen. Där sjunker pH-värdet och stålet kan börja rosta om det finns fukt. Därför behövs tillräckligt täckskikt och tät betong.","safe":"Armeringen är fortfarande skyddad av den basiska betongen innanför.","indoor":"Inomhus går det fort, men betongen är torr, så risken för rost är liten.","slow":"Upptaget går långsamt och avtar med tiden, ungefär med roten ur tiden. Krossad betong efter rivning tar upp mer, eftersom ytan blir mycket större.","how":"Djupet räknas som d = k × √t, där k beror på miljö och betongens täthet (typiska värden 1 till 6 mm per √år). Upptaget räknas för 350 kg cement per m³, 65 procent kalk i cementet och att 75 procent av den kan karbonatiseras. En bil räknas med 0,12 kg koldioxid per km."},"lca":{"mil":true,"title":"Klimatpåverkan för en kubikmeter betong","unit":"kg koldioxidekvivalenter per m³","cem":"Cementtyp","cems":["CEM I (portlandcement)","CEM II/A-LL (med kalksten)","CEM II/B-S (med slagg)","CEM III/A (mycket slagg)"],"kg":"Cementhalt per m³","km":"Transport till bygget","up":"Upptag av koldioxid över livet","ups":["Räkna inte med","Under användning","Även efter rivning"],"r1":"Cement","r2":"Sten, sand och tillsatser","r3":"Råvarutransport och betongfabrik","r4":"Transport till bygget","r5":"Gjutning på plats","r6":"Upptag genom karbonatisering","car":"Det motsvarar ungefär {n} mil med en vanlig bil.","share":"Cementet står för ungefär {p} procent av utsläppen.","perKg":"Per kilo betong blir det ungefär {g} gram.","how":"Förenklade typvärden för att visa proportionerna, inte en miljövarudeklaration. Cement: 0,85, 0,72, 0,58 och 0,42 kg koldioxid per kg. Ballast och tillsatser 10 kg, råvarutransport och fabrik 8 kg, gjutning 3 kg per m³. Transport 0,09 kg per ton och km. Upptaget räknas som 15 respektive 25 procent av koldioxiden från kalcineringen. En bil räknas med 0,12 kg per km."}},
      illu: {
        lca: {"cap":"Betongens livscykel: koldioxid släpps ut när cementet tillverkas, och en del tas upp igen när betongen används och efter rivning.","l":["Råvaror","Cementfabrik","Betong och transport","Byggande","Användning","Rivning och återvinning","CO₂ ut","CO₂ in","Livscykel","från vagga till grav"]},
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
        fr: {"presets":"Quick picks","p1":["Extra strong","w/c 0.40"],"p2":["Ordinary outdoor","w/c 0.50"],"p3":["Easy to pour","w/c 0.65"],"less":"Less water","more":"More water","add":"+ One bucket of water (10 litres)","remove":"− One bucket","perM3":"This is what goes into one cubic metre of concrete","bags":"bags of cement, 25 kg each","buckets":"buckets of water, 10 litres each","mStr":"Strength","mDen":"Density and lifespan","mWork":"Easy to pour","vVeryHigh":"Very high","vHigh":"High","vNormal":"Normal","vLow":"Low","dVery":"Very dense","dDense":"Dense","dMid":"Medium","dPorous":"Porous","wStiff":"Stiff, needs a plasticiser","wOk":"Just right","wFlow":"Flows easily","wRunny":"Runny, the stone can sink","s1":"Very strong and dense, but stiff. It usually needs a plasticiser to be cast.","s2":"Strong, dense concrete for demanding places, for example outdoors with frost and de-icing salt.","s3":"A good all-round recipe: strong enough for most jobs and easy to pour.","s4":"Easier to pour, but clearly weaker and more porous. Better indoors than out.","s5":"Too much water: easy to pour but weak and porous. Avoid it outdoors.","details":"Show chart and details","adv":"Advanced: cement content, consistency and cement type"},
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
          [1936, "dam", "The Hoover Dam and its cooling pipes", "When the Hoover Dam in the USA was cast, cooling pipes were laid in the concrete. Without them the heat from hardening would, by the calculations of the time, have taken more than a hundred years to escape."],
          [2010, "burj", "Burj Khalifa", "Burj Khalifa in Dubai is 828 metres tall. Its core and frame are made of high-strength concrete that was pumped up to height."],
          [2016, "print", "Concrete from a printer", "During the 2010s people began to print walls, bridges and houses in concrete with large 3D printers, layer by layer and without formwork.", "2010s"]
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
      more2: {"ic":{"flow":"How much flow do you need?","press":"How much pressure do you need?","dbl":"Even flow (twin pistons)","pu":"Also polyurethane (PU) injection","matches":"Models that can do it","best":"smallest that fits","cap":"Max capacity","max":"Max pressure","pistons":"Pistons","one":"One","two":"Two","lift":"central lifting point","decSmall":"The model name: mixer HCM {h} and agitator HRW {r} litres, and the pump is a ZMP {z}.","decBig":"The model name: the first number is roughly the total volume in litres, {v} (mixer HCM {h} and agitator HRW {r}). After the slash comes the pump, ZMP {z}.","ccp":"The CCP version also has a high-pressure pump for polyurethane and data logging.","none":"No IC model can do that combination. Contact us and we will find another solution, for example a ZMP pump or a larger plant.","note":"Maximum capacity and maximum pressure are not reached at the same time, it depends on the piston size. We help you choose.","how":"The values come from the tables on our Häny product pages. The selection shows the models whose maximum capacity and pressure are enough, sorted by size."},"mix":{"type":"Mixer","types":["Paddle mixer","Colloidal mixer (high shear)"],"time":"Mixing time","disp":"How well the cement is dispersed","bleed":"Bleeding after 2 hours","water":"separated water","paddle":"A paddle mixer stirs, but does not break up all the lumps of cement grains. The grout separates more: water collects on top.","colloid":"A colloidal mixer tears the lumps apart with high shear. The grains spread evenly and the grout is stable, with little separation.","why":"A well-mixed grout penetrates fine fractures more easily, separates less and gives more even quality.","how":"An illustrative model to show the difference. Real bleeding depends on cement, w/c, admixtures and the mixer. It is measured, for example, by letting the grout stand in a measuring cylinder."},"log":{"rock":"What is the rock like?","rocks":["Tight fractures","Normal","Open fracture"],"pstop":"Stop pressure","vmax":"Largest volume per hole","flow":"Pump flow","vol":"Volume grouted","time":"Time","reason":"Stopped on","byVol":"volume","byPress":"pressure","byTime":"time","axes":["pressure, bar","flow, l/min","minutes"],"sVol":"The hole took the largest permitted volume before the pressure was reached. A thicker grout or more holes may be needed here.","sPress":"The pressure reached the stop pressure and the flow dropped until the hole was tight. That is how you want it to go.","sTime":"The grouting was stopped on time.","logger":"A data logger, for example from Jean Lutz, records pressure, flow and volume continuously. You then know exactly when the stop criterion was reached and can show it afterwards.","how":"Simplified simulation. The pressure rises as the fractures fill, and when the stop pressure is reached the flow is reduced until it almost stops. Grouting ends when either the volume or the pressure has reached its limit."}},
      more: {"frost":{"air":"Air voids in the concrete","sat":"How saturated is the concrete?","freeze":"Freeze the concrete","thaw":"Thaw again","spacing":"Spacing between air voids, roughly","risk":"Risk of frost damage","levels":["Low","Moderate","High"],"before":"Blue dots are water-filled pores and white bubbles are air voids. Press Freeze and see what happens.","after":["The ice has room: water is pushed into nearby air voids, and the concrete survives.","It gets cramped. Some pores are too far from the nearest air void, and fine cracks form.","The ice has no room. Pores far from the air voids crack, and after many freeze-thaw cycles the surface crumbles."],"dry":"The concrete is not saturated, so there is air left in the pores where the ice can go.","rule":"When water freezes into ice its volume grows by about 9 percent. That is why frost-resistant concrete often has 4 to 6 percent small, closely spaced air voids.","how":"Simplified model. The spacing between air voids is estimated from the air content (about 0.75 / air^0.9 mm), and a common requirement is around 0.2 mm. Below about 86 percent saturation the risk counts as low. In reality pore size, salt and the number of freeze-thaw cycles also matter."},"pump":{"dia":"Cylinder diameter","stroke":"Stroke length","spm":"Strokes per minute","perMin":"per min","eff":"Filling degree","perStroke":"Concrete per stroke","l":"litres","out":"Capacity","truck":"Time per mixer truck (8 m³)","min":"minutes","now":"The pump delivers about {q} m³ per hour. A 50 m³ slab then takes about {h} hours to pump.","real":"In practice it is less: truck changes, moves and pauses mean the average output is often well below the pump's maximum.","rule":"Rule of thumb: the inside diameter of the pipe should be at least three times the largest stone in the concrete.","how":"Volume per stroke = π × (diameter / 2)² × stroke length. Capacity = volume per stroke × strokes per minute × 60 × filling degree. The pistons work in turn: while one pushes concrete out, the other draws new concrete from the hopper, and an S-valve switches between them."},"rock":{"size":"Size of the stone (diameter)","height":"Fall height","drop":"Drop the stone","mass":"Weight","speed":"Speed at impact","energy":"Kinetic energy","now":"The stone hits with about {e} kJ, as much kinetic energy as {c} cars at 50 km/h.","scale":"Protection nets are classed by how much energy they can absorb, in kJ:","need":"That calls for a protection net rated for at least {n} kJ.","huge":"That is more energy than most protection nets can take. Other measures are then needed, for example securing the rock at its source or an embankment.","real":"The calculation is for free fall, the worst case. A stone that rolls and bounces down a slope is slowed somewhat, but can also pick up sideways speed.","how":"The stone is treated as a ball of rock with a density of 2,700 kg/m³. Speed v = √(2 × g × h) and energy E = ½ × m × v². A 1,500 kg car at 50 km/h has about 145 kJ. The classes are typical energy levels for tested protection nets."},"marsh":{"fluid":"What are you measuring?","fluids":["Water (check)","Thin grout (w/c 1.0)","Normal grout (w/c 0.8)","Thick grout (w/c 0.6)","Bentonite slurry"],"speedL":"Speed","speeds":["Real time","4 times faster"],"start":"Lift your finger and start","stop":"Stop the clock","ready":"Press start and stop the clock when the grout in the cup reaches the 946 ml line.","running":"The grout is running out. Stop when the cup reaches the line!","good":"Well measured! You got {u} seconds, and the right time is about {t} seconds.","result":"You got {u} seconds. The right time is about {t} seconds. Try again!","missed":"The cup ran past the line. The right time was about {t} seconds.","note":"Clean water should take about 26 seconds for 946 ml. If it does not, the funnel is dirty or damaged.","how":"The times for grout and slurry are illustrative examples. The real time depends on cement, admixtures, temperature and how long the grout has been mixed. The funnel is filled with 1,500 ml through the screen and the time for 946 ml is measured."}},
      chem: {"kiln":{"temp":"Temperature in the kiln","hint":"Drag the slider or click a step and follow the raw meal through the kiln.","after":"The clinker is cooled quickly and then ground with a little gypsum into cement.","how":"A simplified picture of a rotary kiln. The temperatures are approximate and differ between kilns. The raw meal is fed in at the cold end (right) and the flame is at the hot end (left).","stages":[[20,"Drying","the raw meal, ground limestone and clay, is heated and the water boils off."],[400,"The clay gives up water","the clay minerals release their chemically bound water."],[650,"Calcination","the limestone breaks down, CaCO₃ becomes CaO and CO₂. About 60 percent of the carbon dioxide from cement making is released here, straight out of the stone."],[950,"Belite forms","the lime reacts with silica from the clay and forms belite, C₂S."],[1250,"Sintering and alite","part of the material melts, alite (C₃S) forms and nodules of clinker take shape. The top temperature is about 1,450 °C."]]},"clinker":{"react":"When water is added, alite and belite react and form C-S-H (calcium silicate hydrate), the real glue in concrete, and calcium hydroxide.","how":"Typical values for a Portland cement (CEM I). The shares vary between plants. Cement chemists write C for CaO, S for SiO₂, A for Al₂O₃ and F for Fe₂O₃.","phases":[["alit","Alite","C₃S, tricalcium silicate",57,"#f37d03","Reacts quickly with water and gives most of the strength in the first weeks."],["belit","Belite","C₂S, dicalcium silicate",18,"#d9a86a","Reacts slowly and keeps adding strength for months and years."],["aluminat","Aluminate","C₃A, tricalcium aluminate",8,"#8fbfe0","Reacts very quickly and gives off heat. Without gypsum the cement would set within minutes."],["ferrit","Ferrite","C₄AF, tetracalcium aluminoferrite",9,"#6b6466","Gives cement its grey colour and adds a little strength. White cement contains almost no ferrite."],["gips","Gypsum","CaSO₄ · 2H₂O, calcium sulphate",5,"#d8d1c4","Added during grinding and controls how fast the cement starts to set."],["ovrigt","Other","for example magnesium oxide and alkalis",3,"#a8a19a","Small amounts of other substances. In CEM II and CEM III part of the clinker is replaced by, for example, limestone or slag."]]},"carb":{"years":"Age of the concrete","yr":"years","exp":"Where is the concrete?","exps":["Indoors, dry","Outdoors, sheltered from rain","Outdoors, in the rain","In the ground or water"],"qual":"Quality of the concrete","quals":["Dense (w/c 0.40)","Normal (w/c 0.50)","Porous (w/c 0.60)"],"cover":"Cover to the reinforcement","depth":"Carbonation depth","uptake":"Carbon dioxide taken up","perM2":"kg per m² of surface","car":"Equals driving a car","now":"After {t} years carbon dioxide has entered about {d} mm into the concrete.","rust":"The carbonation has reached the reinforcement. The pH drops there and the steel can start to rust if there is moisture. That is why enough cover and dense concrete are needed.","safe":"The reinforcement is still protected by the alkaline concrete further in.","indoor":"Indoors it goes fast, but the concrete is dry, so the risk of rust is small.","slow":"The uptake is slow and slows down further over time, roughly with the square root of time. Crushed concrete after demolition takes up more, because the surface becomes much larger.","how":"The depth is calculated as d = k × √t, where k depends on the environment and the density of the concrete (typical values 1 to 6 mm per √year). The uptake assumes 350 kg of cement per m³, 65 percent lime in the cement and that 75 percent of it can carbonate. A car is counted at 0.12 kg of carbon dioxide per km."},"lca":{"mil":false,"title":"Climate impact of one cubic metre of concrete","unit":"kg of CO₂ equivalents per m³","cem":"Cement type","cems":["CEM I (Portland cement)","CEM II/A-LL (with limestone)","CEM II/B-S (with slag)","CEM III/A (lots of slag)"],"kg":"Cement content per m³","km":"Transport to the site","up":"Carbon dioxide taken up over the life","ups":["Leave it out","During use","Also after demolition"],"r1":"Cement","r2":"Stone, sand and admixtures","r3":"Raw material transport and concrete plant","r4":"Transport to the site","r5":"Casting on site","r6":"Uptake through carbonation","car":"That is roughly {n} km in an ordinary car.","share":"The cement accounts for about {p} percent of the emissions.","perKg":"Per kilo of concrete it is about {g} grams.","how":"Simplified typical values to show the proportions, not an environmental product declaration. Cement: 0.85, 0.72, 0.58 and 0.42 kg of carbon dioxide per kg. Aggregate and admixtures 10 kg, raw material transport and plant 8 kg, casting 3 kg per m³. Transport 0.09 kg per tonne and km. The uptake is counted as 15 and 25 percent of the carbon dioxide from calcination. A car is counted at 0.12 kg per km."}},
      illu: {
        lca: {"cap":"The life cycle of concrete: carbon dioxide is released when the cement is made, and some of it is taken up again while the concrete is in use and after demolition.","l":["Raw materials","Cement plant","Concrete and transport","Construction","Use","Demolition and recycling","CO₂ out","CO₂ in","Life cycle","from cradle to grave"]},
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
    var F = W.fr;
    function setVct(v) { S.vct = Math.max(0.35, Math.min(0.75, Math.round(v * 100) / 100)); sl.input.value = S.vct; sl.input.dispatchEvent(new Event("input", { bubbles: true })); }
    var PRE = [[0.4, F.p1], [0.5, F.p2], [0.65, F.p3]], preRow = el("div", { class: "vpre", role: "group", "aria-label": F.presets });
    var preBtns = PRE.map(function (p) { var b = el("button", { type: "button", class: "vpre__b" }, [el("strong", { text: p[1][0] }), el("span", { text: p[1][1] })]); b.addEventListener("click", function () { setVct(p[0]); }); preRow.appendChild(b); return b; });
    var ends = el("div", { class: "vends", "aria-hidden": "true" }, [el("span", { text: F.less }), el("span", { text: F.more })]);
    var addB = el("button", { type: "button", class: "vbtn", text: F.add }), remB = el("button", { type: "button", class: "vbtn vbtn--ghost", text: F.remove }), bucketRow = el("div", { class: "vbtns" }, [addB, remB]);
    addB.addEventListener("click", function () { var m = calc(); setVct((m.water + 10) / m.cemKg); pulse(); });
    remB.addEventListener("click", function () { var m = calc(); setVct((m.water - 10) / m.cemKg); pulse(); });
    function vicon(kind) {
      var s = sv("svg", { viewBox: "0 0 20 24", class: "vico", "aria-hidden": "true" });
      if (kind === "bag") { s.appendChild(sv("path", { d: "M4,4 Q10,1 16,4 L18,21 Q10,24 2,21 Z", fill: "#d6cfc4", stroke: "#4a4446", "stroke-width": 1.1, "stroke-linejoin": "round" })); s.appendChild(sv("rect", { x: 4.5, y: 11, width: 11, height: 3.5, fill: "#f37d03" })); }
      else { s.appendChild(sv("path", { d: "M5,8 C5,1.5 15,1.5 15,8", fill: "none", stroke: "#4a4446", "stroke-width": 1.1 })); s.appendChild(sv("path", { d: "M2.5,8 H17.5 L15.5,22 H4.5 Z", fill: "#8fbfe0", stroke: "#4a4446", "stroke-width": 1.1, "stroke-linejoin": "round" })); s.appendChild(sv("path", { d: "M3.5,11.5 H16.5", stroke: "#fff", "stroke-width": 1, opacity: 0.7 })); }
      return s;
    }
    function mixRow(label) {
      var n = el("strong", { class: "vrow__n" }), ic = el("span", { class: "vrow__icons" }), box = el("div", { class: "vrow" }, [n, el("span", { class: "vrow__l", text: label }), ic]);
      return { box: box, set: function (val, kind) { n.textContent = num(val, 1); ic.innerHTML = ""; var k = Math.round(val), show = Math.min(28, k); for (var q = 0; q < show; q++) ic.appendChild(vicon(kind)); if (k > show) ic.appendChild(el("span", { class: "vrow__more", text: "+" + (k - show) })); } };
    }
    var rowBag = mixRow(F.bags), rowBucket = mixRow(F.buckets);
    function meter(label) {
      var fill = el("i"), v = el("span", { class: "vmeter__v" }), box = el("div", { class: "vmeter" }, [el("span", { class: "vmeter__l", text: label }), v, el("span", { class: "vmeter__bar" }, [fill])]);
      return { box: box, set: function (p, txt, tone) { fill.style.width = Math.round(Math.max(4, Math.min(100, p * 100))) + "%"; v.textContent = txt; box.setAttribute("data-tone", tone); } };
    }
    var mStr = meter(F.mStr), mDen = meter(F.mDen), mWork = meter(F.mWork), verdict = el("p", { class: "vverdict", "aria-live": "polite" });
    function pulse() { if (REDUCE) return; mStr.box.classList.remove("is-pulse"); void mStr.box.offsetWidth; mStr.box.classList.add("is-pulse"); }
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
      rowBag.set(m.cemKg / 25, "bag"); rowBucket.set(m.water / 10, "bucket");
      var fs = m.f, w = m.water;
      mStr.set(fs / 70, (fs >= 50 ? F.vVeryHigh : fs >= 40 ? F.vHigh : fs >= 30 ? F.vNormal : F.vLow) + " · " + num(fs) + " " + T.mpa, fs >= 40 ? "good" : fs >= 30 ? "ok" : "bad");
      mDen.set(1 - m.por / 0.5, m.por < 0.12 ? F.dVery : m.por < 0.22 ? F.dDense : m.por < 0.32 ? F.dMid : F.dPorous, m.por < 0.22 ? "good" : m.por < 0.32 ? "ok" : "bad");
      mWork.set((w - 110) / 160, w < 150 ? F.wStiff : w < 190 ? F.wOk : w < 230 ? F.wFlow : F.wRunny, w < 150 ? "ok" : w < 230 ? "good" : "bad");
      verdict.textContent = S.vct < 0.4 ? F.s1 : S.vct < 0.47 ? F.s2 : S.vct <= 0.55 ? F.s3 : S.vct <= 0.62 ? F.s4 : F.s5;
      preBtns.forEach(function (b, q) { b.classList.toggle("is-on", Math.abs(PRE[q][0] - S.vct) < 0.005); b.setAttribute("aria-pressed", Math.abs(PRE[q][0] - S.vct) < 0.005 ? "true" : "false"); });
      addB.disabled = S.vct >= 0.75; remB.disabled = S.vct <= 0.35; bucketRow.hidden = S.mode !== 0;
    }
    var det = el("details", { class: "vdet" }, [el("summary", { text: F.details }), el("div", { class: "vdet__body" }, [el("div", { class: "stats" }, [stC.box, stW.box, stA.box, stS.box]), el("p", { class: "wgt__cap", text: W.chartTitle }), chart, el("p", { class: "wgt__cap", text: W.barTitle }), bar, legend, pores, porCap, msg])]);
    var adv = el("details", { class: "vdet vdet--adv" }, [el("summary", { text: F.adv }), el("div", { class: "vadv" }, [mode.box, sCem.box, kons.box, cem.box])]);
    app.appendChild(preRow);
    app.appendChild(el("div", { class: "wgt__grid vgrid" }, [
      el("div", { class: "wgt__ctl" }, [sl.box, ends, bucketRow]),
      el("div", { class: "wgt__out" }, [el("div", { class: "vmeters" }, [mStr.box, mDen.box, mWork.box]), verdict, el("p", { class: "vmix__h", text: F.perM3 }), rowBag.box, rowBucket.box, extra])
    ]));
    app.appendChild(adv);
    app.appendChild(det);
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
      if (!ex.ns) { attrs.stroke = ex.stroke || C.dark; attrs["stroke-width"] = (ex.sw || 1.6) * 0.85; attrs["stroke-linejoin"] = "round"; }
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
      rgrad: function (stops) { var name = id + "r" + (++n), g = sv("radialGradient", { id: name, cx: "50%", cy: "50%", r: "50%" }); stops.forEach(function (st) { g.appendChild(sv("stop", { offset: st[0], "stop-color": st[1], "stop-opacity": st[2] == null ? 1 : st[2] })); }); defs.appendChild(g); return "url(#" + name + ")"; },
      sky: function (ground, gy, glow) {
        api.rect(0, 0, w, h, api.grad([[0, C.sky1], [1, C.sky2]]), { ns: true });
        api.ellipse(glow ? glow[0] : w * 0.78, glow ? glow[1] : h * 0.22, w * 0.42, h * 0.5, api.rgrad([[0, "#ffd9a0", 0.55], [1, "#ffd9a0", 0]]), { ns: true });
        if (ground) {
          api.path("M0," + (gy - 6) + " C" + w * 0.15 + "," + (gy - 30) + " " + w * 0.3 + "," + (gy - 14) + " " + w * 0.45 + "," + (gy - 24) + " S" + w * 0.75 + "," + (gy - 38) + " " + w + "," + (gy - 16) + " V" + gy + " H0 Z", "#ead7bd", { ns: true, opacity: 0.75 });
          api.path("M0," + (gy - 2) + " C" + w * 0.2 + "," + (gy - 16) + " " + w * 0.4 + "," + (gy - 4) + " " + w * 0.6 + "," + (gy - 12) + " S" + w * 0.9 + "," + (gy - 6) + " " + w + "," + (gy - 10) + " V" + gy + " H0 Z", "#dfc9aa", { ns: true, opacity: 0.6 });
          api.rect(0, gy, w, h - gy, api.grad([[0, ground[0]], [1, ground[1]]]), { ns: true });
          api.line(0, gy, w, gy, "rgba(255,255,255,.45)", 1);
        }
      },
      cypress: function (x, gy, hh) { api.line(x, gy, x, gy - hh * 0.12, "#5d4a3a", 2.2); api.path("M" + x + "," + (gy - hh) + " C" + (x + hh * 0.17) + "," + (gy - hh * 0.6) + " " + (x + hh * 0.14) + "," + (gy - hh * 0.18) + " " + x + "," + (gy - hh * 0.1) + " C" + (x - hh * 0.14) + "," + (gy - hh * 0.18) + " " + (x - hh * 0.17) + "," + (gy - hh * 0.6) + " " + x + "," + (gy - hh) + " Z", api.grad([[0, "#6d9a5f"], [1, "#3f6a43"]], true), { sw: 1.1 }); },
      pine: function (x, gy, hh) { api.path("M" + (x - 1.5) + "," + gy + " L" + (x - 1) + "," + (gy - hh * 0.75) + " L" + (x + 1) + "," + (gy - hh * 0.75) + " L" + (x + 1.5) + "," + gy + " Z", "#6a5442", { ns: true }); api.ellipse(x, gy - hh * 0.8, hh * 0.42, hh * 0.16, api.grad([[0, "#7aa368"], [1, "#4b7a4d"]]), { sw: 1.1 }); },
      palm: function (x, gy, hh) { api.path("M" + x + "," + gy + " Q" + (x + 4) + "," + (gy - hh * 0.5) + " " + (x + 2) + "," + (gy - hh), "none", { stroke: "#7a5f45", sw: 3 }); [[-1, -0.2], [1, -0.25], [-0.7, 0.35], [0.8, 0.3], [0, -0.6]].forEach(function (d) { var tx = x + 2 + d[0] * hh * 0.45, ty = gy - hh + d[1] * hh * 0.3; api.path("M" + (x + 2) + "," + (gy - hh) + " Q" + ((x + 2 + tx) / 2) + "," + (ty - hh * 0.18) + " " + tx + "," + ty, "none", { stroke: "#4f8350", sw: 3.2, "stroke-linecap": "round" }); }); },
      birds: function (x, y, k) { [[0, 0], [14, 6], [-10, 8]].forEach(function (b) { var bx = x + b[0] * (k || 1), by = y + b[1] * (k || 1), r = 4 * (k || 1); api.path("M" + (bx - r) + "," + by + " q" + r / 2 + "," + (-r / 1.6) + " " + r + ",0 q" + r / 2 + "," + (-r / 1.6) + " " + r + ",0", "none", { stroke: "#5d5456", sw: 1.3 }); }); },
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
      a.cloud(60, 78, 1.1); a.cloud(250, 60, 1.2); a.cloud(180, 92, 0.8); a.palm(112, 160, 34); a.palm(212, 160, 30);
    } else if (key === "dam") {
      a.sky(["#b9a98f", "#97876e"], 168, [250, 40]);
      a.poly([[0, 40], [70, 60], [96, 168], [0, 168]], a.grad([[0, "#c8a985"], [1, "#9c7f5f"]], true), { sw: 1.4 }); a.poly([[320, 36], [250, 58], [226, 168], [320, 168]], a.grad([[0, "#9c7f5f"], [1, "#c8a985"]], true), { sw: 1.4 });
      a.path("M70,62 L250,60 L238,70 L82,72 Z", a.grad([[0, C.water], [1, C.waterD]]), { sw: 1.2 });
      a.path("M82,72 Q160,82 238,70 L226,168 Q160,180 96,168 Z", a.grad([[0, "#ece6dc"], [0.5, "#d6cfc3"], [1, "#b2aa9c"]], true), { sw: 1.6 });
      for (i = 1; i < 7; i++) a.path("M" + (82 + i * 2.2) + "," + (72 + i * 14) + " Q160," + (82 + i * 15) + " " + (238 - i * 2) + "," + (70 + i * 14), "none", { stroke: "rgba(59,52,54,.22)", sw: 1 });
      a.path("M96,168 Q160,180 226,168 L230,200 H92 Z", a.grad([[0, C.water], [1, C.waterD]]), { ns: true });
      a.circle(268, 112, 30, "#fff", { sw: 2 }); a.rect(246, 96, 44, 32, "#e4ded3", { sw: 1.4 }); for (i = 0; i < 3; i++) a.path("M248," + (102 + i * 10) + " H288", "none", { stroke: "#5b9cc6", sw: 2.2 }); a.line(238, 118, 210, 120, "rgba(59,52,54,.45)", 1.2, { "stroke-dasharray": "3 3" }); a.birds(120, 34, 1);
    } else if (key === "print") {
      a.sky(["#cfc0a3", "#b6a585"], 160, [70, 50]); a.shadow(160, 166, 120, 6);
      a.rect(40, 40, 8, 120, a.grad([[0, "#8a8184"], [1, "#5b5456"]], true), { sw: 1.2 }); a.rect(272, 40, 8, 120, a.grad([[0, "#8a8184"], [1, "#5b5456"]], true), { sw: 1.2 }); a.rect(36, 34, 248, 9, "#6b6466", { sw: 1.2 });
      a.rect(150, 43, 22, 14, C.orange, { sw: 1.2 }); a.rect(158, 57, 6, 22, "#4a4446", { sw: 1 }); a.poly([[156, 79], [166, 79], [161, 87]], "#4a4446", { ns: true });
      var lay = a.grad([[0, "#e6dfd3"], [1, "#c2b9aa"]]);
      for (i = 0; i < 9; i++) { var yy2 = 156 - i * 8; a.rect(70, yy2 - 7, 180, 7.4, lay, { sw: 0.9, rx: 3.6 }); }
      a.path("M84,91 Q122,84 161,87", "none", { stroke: C.orange, sw: 2, "stroke-dasharray": "2 3" }); a.rect(120, 108, 30, 40, "#9fc3d6", { sw: 1.2 }); a.line(135, 108, 135, 148, "#fff", 1, { opacity: 0.7 });
    }
    if (key === "pantheon") { a.cypress(34, 164, 78); a.cypress(52, 164, 56); a.cypress(288, 164, 72); a.birds(250, 40, 0.9); }
    if (key === "egypt") { a.palm(300, 160, 40); a.birds(70, 40, 1); }
    if (key === "rome") { a.birds(160, 26, 0.9); }
    if (key === "lighthouse") { a.birds(230, 36, 1); a.birds(70, 56, 0.8); }
    if (key === "tower") { [100, 222].forEach(function (tx) { a.line(tx, 160, tx, 146, "#6a5442", 2); a.circle(tx, 140, 8, a.grad([[0, "#7aa368"], [1, "#4b7a4d"]]), { sw: 1 }); }); }
    if (key === "bridge") { a.birds(90, 28, 1); }
    if (key === "frame") { a.pine(292, 164, 44); }
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
    var sl = slider(W.step, 0, EV.length - 1, 1, 0, function (v) { return yearText(EV[v][0], EV[v][4]); }, function (v) { S.i = v; draw(); });
    var rail = el("ul", { class: "wrail" }), btns = [];
    EV.forEach(function (e, i) { var b = el("button", { type: "button", class: "wrail__b", text: yearShort(e[0], e[4]) }); b.addEventListener("click", function () { go(i); }); btns.push(b); rail.appendChild(el("li", {}, [b])); });
    var prev = el("button", { type: "button", class: "wbtn", text: "‹ " + W.prev }), next = el("button", { type: "button", class: "wbtn", text: W.next + " ›" });
    var art = el("div", { class: "wscene__box" }), yr = el("p", { class: "whist__yr" }), ttl = el("h3", { class: "whist__t" }), txt = el("p", { class: "whist__d", "aria-live": "polite" });
    function yearText(y, lab) { return lab || (y < 0 ? W.ca + " " + num(-y) + " " + W.bc : (y < 1000 ? W.ca + " " : "") + y); }
    function yearShort(y, lab) { return lab || (y < 0 ? num(-y) + " " + W.bc : String(y)); }
    function go(i) { S.i = Math.max(0, Math.min(EV.length - 1, i)); sl.input.value = S.i; sl.input.dispatchEvent(new Event("input", { bubbles: true })); }
    prev.addEventListener("click", function () { go(S.i - 1); }); next.addEventListener("click", function () { go(S.i + 1); });
    function draw() {
      var e = EV[S.i]; art.innerHTML = ""; art.appendChild(scene(e[1])); yr.textContent = yearText(e[0], e[4]); ttl.textContent = e[2]; txt.textContent = e[3];
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
    var svgE = key === "tbm" ? tbmScene(D.l) : key === "lca" ? lcaScene(D.l) : romanScene(D.l), fig = el("figure", { class: "wfig" }, [svgE, el("figcaption", { class: "wfig__c", text: D.cap })]);
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

  // ---------- 11. from limestone to cement: the kiln ----------
  function buildUgn(app) {
    var W = T.chem.kiln, S = { t: 20 }, ST = W.stages;
    var sl = slider(W.temp, 20, 1450, 10, 20, function (v) { return num(v) + " °C"; }, function (v) { S.t = v; draw(); });
    var A = art(420, 170, "wchart wkiln");
    A.rect(0, 0, 420, 170, A.grad([[0, "#fff7ea"], [1, "#f6ead5"]]), { ns: true });
    A.rect(0, 146, 420, 24, A.grad([[0, "#cdbb94"], [1, "#a8966c"]]), { ns: true });
    A.rect(130, 112, 14, 34, "#8f877c", { sw: 1.2 }); A.rect(292, 104, 14, 42, "#8f877c", { sw: 1.2 });
    A.rect(384, 20, 30, 126, A.grad([[0, "#cfc7ba"], [1, "#a39a8c"]], true), { sw: 1.4 }); [40, 68, 96].forEach(function (y) { A.poly([[380, y], [418, y], [399, y + 16]], "#bdb4a6", { sw: 1.1 }); });
    var kg = A.group({ transform: "rotate(-5 210 92)" });
    A.rect(40, 70, 340, 44, A.grad([[0, "#ffe3a8"], [0.22, "#f6a24a"], [0.55, "#c4b39d"], [1, "#9a9082"]], true), { sw: 1.6, rx: 8 }, kg);
    A.rect(40, 70, 340, 44, A.grad([[0, "rgba(255,255,255,.5)"], [0.45, "rgba(255,255,255,0)"], [1, "rgba(0,0,0,.2)"]]), { ns: true, rx: 8 }, kg);
    [110, 228, 330].forEach(function (x) { A.rect(x, 66, 9, 52, "#6b6466", { sw: 1 }, kg); });
    A.poly([[40, 80], [14, 72], [2, 92], [14, 112], [40, 104]], C.orange, { sw: 1.2 }, kg); A.poly([[36, 86], [18, 84], [10, 92], [18, 100], [36, 98]], "#ffe08a", { ns: true }, kg);
    var moving = sv("g"); kg.appendChild(moving);
    var steps = el("ul", { class: "wkiln__steps" }), btns = [];
    ST.forEach(function (st) { var b = el("button", { type: "button", class: "seg__b", text: st[1] }); b.addEventListener("click", function () { sl.input.value = st[0] + 40; sl.input.dispatchEvent(new Event("input", { bubbles: true })); }); btns.push(b); steps.appendChild(el("li", {}, [b])); });
    var big = el("p", { class: "wgt__big", "aria-live": "polite" }), detail = el("p", { class: "wkiln__d" });
    function idx(t) { var k = 0; ST.forEach(function (st, i) { if (t >= st[0]) k = i; }); return k; }
    function draw() {
      var t = S.t, k = idx(t), x = 372 - (t - 20) / 1430 * 318, col = t < 650 ? "#d8d0c2" : t < 950 ? "#f1ece2" : t < 1250 ? "#d3b98f" : "#ffb347", i, rr = seeded(3);
      moving.innerHTML = "";
      for (i = 0; i < 9; i++) A.circle(x - 10 + rr() * 22, 104 - rr() * 9, 2.4 + rr() * 2, t >= 1400 && i % 2 ? "#4a4446" : col, { sw: 0.8 }, moving);
      if (t >= 650 && t < 1000) for (i = 0; i < 3; i++) { var bx = x - 12 + i * 12, by = 56 - i * 9; A.circle(bx, by, 7, "rgba(120,114,108,.28)", { ns: true }, moving); var tx = A.add("text", { x: bx, y: by + 3, "text-anchor": "middle", class: "wkiln__co2" }, moving); tx.textContent = "CO₂"; }
      var lab = A.add("text", { x: x, y: 64, "text-anchor": "middle", class: "wcall" }, moving); lab.textContent = num(t) + " °C";
      big.textContent = ST[k][1] + ": " + ST[k][2];
      detail.textContent = t >= 1400 ? W.after : W.hint;
      btns.forEach(function (b, i) { b.classList.toggle("is-on", i === k); });
    }
    app.appendChild(el("div", { class: "wgt__one" }, [steps, A.svg, sl.box, big, detail]));
    app.appendChild(how(W.how));
    draw();
  }

  // ---------- 12. what cement is made of ----------
  function buildKlinker(app) {
    var W = T.chem.clinker, P = W.phases, S = { i: 0 }, A = art(240, 240, "wchart wdonut"), cx = 120, cy = 120, R = 104, r = 62, segs = [];
    var tot = P.reduce(function (a, p) { return a + p[3]; }, 0), a0 = -Math.PI / 2;
    function pt(rad, a) { return (cx + rad * Math.cos(a)).toFixed(2) + "," + (cy + rad * Math.sin(a)).toFixed(2); }
    P.forEach(function (p, i) {
      var a1 = a0 + p[3] / tot * Math.PI * 2, large = a1 - a0 > Math.PI ? 1 : 0;
      var seg = A.path("M" + pt(R, a0) + " A" + R + "," + R + " 0 " + large + " 1 " + pt(R, a1) + " L" + pt(r, a1) + " A" + r + "," + r + " 0 " + large + " 0 " + pt(r, a0) + " Z", p[4], { stroke: "#fff", sw: 2.4, class: "wdonut__s", tabindex: 0, role: "button", "aria-label": p[1] + " " + p[3] + " %" });
      seg.addEventListener("click", function () { S.i = i; draw(); }); seg.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); S.i = i; draw(); } });
      segs.push(seg); a0 = a1;
    });
    var cBig = A.add("text", { x: cx, y: cy + 4, "text-anchor": "middle", class: "wdonut__v" }), cSmall = A.add("text", { x: cx, y: cy + 24, "text-anchor": "middle", class: "wdonut__l" });
    var legend = el("ul", { class: "wdonut__leg" }), lbtns = [];
    P.forEach(function (p, i) { var b = el("button", { type: "button", class: "wdonut__b" }, [el("i", { style: "background:" + p[4] }), el("span", { text: p[1] }), el("b", { text: p[3] + " %" })]); b.addEventListener("click", function () { S.i = i; draw(); }); lbtns.push(b); legend.appendChild(el("li", {}, [b])); });
    var pName = el("h3", { class: "wdonut__h" }), pForm = el("p", { class: "wdonut__f" }), pText = el("p", { class: "wdonut__t", "aria-live": "polite" });
    function draw() {
      var p = P[S.i];
      segs.forEach(function (s, i) { s.setAttribute("opacity", i === S.i ? 1 : 0.42); s.setAttribute("transform", i === S.i ? "translate(" + (Math.cos(0) * 0) + " 0)" : ""); });
      lbtns.forEach(function (b, i) { b.classList.toggle("is-on", i === S.i); });
      cBig.textContent = p[3] + " %"; cSmall.textContent = p[1]; pName.textContent = p[1]; pForm.textContent = p[2]; pText.textContent = p[5];
    }
    app.appendChild(el("div", { class: "wgt__grid wdonut__grid" }, [el("div", { class: "wgt__ctl" }, [A.svg]), el("div", { class: "wgt__out" }, [legend, el("div", { class: "wdonut__panel" }, [pName, pForm, pText]), el("p", { class: "wgt__extra", text: W.react })])]));
    app.appendChild(how(W.how));
    draw();
  }

  // ---------- 13. carbonation: concrete takes up CO2 ----------
  function buildKarb(app) {
    var W = T.chem.carb, S = { t: 50, e: 1, q: 1, c: 30 }, K = [5, 4, 1.5, 0.8], Q = [0.6, 1, 1.5];
    var sT = slider(W.years, 0, 100, 1, 50, function (v) { return num(v) + " " + W.yr; }, function (v) { S.t = v; draw(); });
    var sE = select(W.exp, W.exps, 1, function (i) { S.e = i; draw(); });
    var sQ = segmented(W.qual, W.quals, 1, function (i) { S.q = i; draw(); });
    var sC = slider(W.cover, 10, 50, 1, 30, function (v) { return num(v) + " mm"; }, function (v) { S.c = v; draw(); });
    var stD = stat(W.depth, "mm"), stU = stat(W.uptake, W.perM2), stCar = stat(W.car, "km"), msg = el("ul", { class: "wmsg" }), big = el("p", { class: "wgt__big", "aria-live": "polite" });
    var MM = 3.6, X0 = 44, A = art(420, 200, "wchart wkarb");
    A.rect(0, 0, 420, 200, A.grad([[0, "#f3f7fa"], [1, "#e6eef3"]]), { ns: true });
    var wall = A.rect(X0, 14, 420 - X0, 172, A.grad([[0, "#d9d3c9"], [1, "#b9b1a5"]], true), { sw: 1.4 });
    A.speckle(X0, 16, 420 - X0, 168, 90, 12, ["#a69d90", "#efe9df", "#8b8378"], 1.6);
    var zone = A.rect(X0, 14, 0, 172, "rgba(255,255,255,.55)", { ns: true }), front = A.line(X0, 14, X0, 186, C.orange, 2.4, { "stroke-dasharray": "5 4" });
    for (var i = 0; i < 4; i++) { var y = 40 + i * 40; A.line(8, y, X0 - 6, y, "#5b9cc6", 2); A.poly([[X0 - 6, y - 4], [X0, y], [X0 - 6, y + 4]], "#5b9cc6", { ns: true }); }
    var co2 = A.add("text", { x: 20, y: 26, "text-anchor": "middle", class: "wkiln__co2" }); co2.textContent = "CO₂";
    var bars = [60, 140].map(function (y) { return A.circle(0, y, 8, "#8a8184", { sw: 1.4 }); });
    var ticks = A.group(); [0, 20, 40, 60, 80, 100].forEach(function (mm) { var tx = X0 + mm * MM; if (tx > 416) return; A.line(tx, 186, tx, 192, C.dark, 1, null, ticks); var t = A.add("text", { x: tx, y: 199, "text-anchor": "middle", class: "wtxt" }, ticks); t.textContent = mm + " mm"; });
    function draw() {
      var d = K[S.e] * Q[S.q] * Math.sqrt(S.t), up = d / 1000 * 350 * 0.65 * 0.75 * 44 / 56, reached = d >= S.c;
      zone.setAttribute("width", Math.min(420 - X0, d * MM)); front.setAttribute("x1", X0 + d * MM); front.setAttribute("x2", X0 + d * MM);
      bars.forEach(function (b) { b.setAttribute("cx", X0 + S.c * MM); b.setAttribute("fill", reached && S.e !== 0 ? "#b5552f" : "#8a8184"); });
      stD.set(num(d, d < 10 ? 1 : 0)); stU.set(num(up, 1)); stCar.set(num(up / 0.12));
      big.textContent = W.now.replace("{t}", num(S.t)).replace("{d}", num(d, d < 10 ? 1 : 0));
      msg.innerHTML = "";
      if (S.e === 0) msg.appendChild(el("li", { class: "wmsg__info", text: W.indoor }));
      if (reached && S.e !== 0) msg.appendChild(el("li", { class: "wmsg__warn", text: W.rust })); else if (S.e !== 0) msg.appendChild(el("li", { class: "wmsg__ok", text: W.safe }));
      msg.appendChild(el("li", { class: "wmsg__info", text: W.slow }));
    }
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [sT.box, sE.box, sQ.box, sC.box]), el("div", { class: "wgt__out" }, [big, A.svg, el("div", { class: "stats" }, [stD.box, stU.box, stCar.box]), msg])]));
    app.appendChild(how(W.how));
    draw();
  }

  // ---------- 14. the climate footprint of a cubic metre ----------
  function buildKlimat(app) {
    var W = T.chem.lca, S = { c: 0, kg: 330, km: 25, u: 1 }, CEM = [[0.85, 0.95], [0.72, 0.82], [0.58, 0.68], [0.42, 0.45]], UP = [0, 0.15, 0.25];
    var sCem = select(W.cem, W.cems, 0, function (i) { S.c = i; draw(); });
    var sKg = slider(W.kg, 250, 450, 10, 330, function (v) { return num(v) + " kg"; }, function (v) { S.kg = v; draw(); });
    var sKm = slider(W.km, 0, 100, 5, 25, function (v) { return num(v) + " km"; }, function (v) { S.km = v; draw(); });
    var sU = segmented(W.up, W.ups, 1, function (i) { S.u = i; draw(); });
    var total = el("p", { class: "wlca__total", "aria-live": "polite" }), rows = el("ul", { class: "wlca" }), cmp = el("ul", { class: "wmsg" });
    function draw() {
      var cem = S.kg * CEM[S.c][0], agg = 10, plant = 8, tr = 2.4 * S.km * 0.09, cast = 3, up = -S.kg * CEM[S.c][1] * 0.53 * UP[S.u];
      var parts = [[W.r1, cem, "c"], [W.r2, agg, "o"], [W.r3, plant, "o"], [W.r4, tr, "o"], [W.r5, cast, "o"], [W.r6, up, "u"]], sum = 0, max = 0;
      parts.forEach(function (p) { sum += p[1]; max = Math.max(max, Math.abs(p[1])); });
      rows.innerHTML = "";
      parts.forEach(function (p) { if (p[2] === "u" && !p[1]) return; rows.appendChild(el("li", { class: "wlca__r wlca__r--" + p[2] }, [el("span", { class: "wlca__l", text: p[0] }), el("span", { class: "wlca__bar" }, [el("i", { style: "width:" + Math.max(1.5, Math.abs(p[1]) / max * 100) + "%" })]), el("b", { text: (p[1] < 0 ? "−" : "") + num(Math.abs(p[1])) + " kg" })])); });
      total.innerHTML = ""; total.appendChild(el("strong", { text: num(sum) })); total.appendChild(el("span", { text: W.unit }));
      cmp.innerHTML = "";
      cmp.appendChild(el("li", { class: "wmsg__info", text: W.car.replace("{n}", num(W.mil ? sum / 1.2 : sum / 0.12)) }));
      cmp.appendChild(el("li", { class: "wmsg__info", text: W.share.replace("{p}", num(cem / (sum - up) * 100)) }));
      cmp.appendChild(el("li", { class: "wmsg__info", text: W.perKg.replace("{g}", num(sum / 2.4)) }));
    }
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [sCem.box, sKg.box, sKm.box, sU.box]), el("div", { class: "wgt__out" }, [el("p", { class: "vmix__h", text: W.title }), total, rows, cmp])]));
    app.appendChild(how(W.how));
    draw();
  }

  // ---------- life cycle illustration ----------
  function lcaScene(L) {
    var a = art(460, 300, "wchart wlcafig"), cx = 230, cy = 150, RX = 165, RY = 104, i, nodes = [];
    a.rect(0, 0, 460, 300, a.grad([[0, "#fff7ea"], [1, "#f4ead9"]]), { ns: true });
    a.ellipse(cx, cy, RX, RY, "none", { stroke: "#cfc6b8", sw: 2.4, "stroke-dasharray": "2 7", "stroke-linecap": "round" });
    var ang = [-90, -30, 30, 90, 150, 210];
    ang.forEach(function (d, k) { var r = d * Math.PI / 180; nodes.push([cx + RX * Math.cos(r), cy + RY * Math.sin(r)]); });
    for (i = 0; i < 6; i++) { var m = (ang[i] + 30) * Math.PI / 180, mx = cx + RX * Math.cos(m), my = cy + RY * Math.sin(m), tg = Math.atan2(RY * Math.cos(m), -RX * Math.sin(m)); a.add("polygon", { points: "-5,-5 6,0 -5,5", fill: "#a39a8c", transform: "translate(" + mx.toFixed(1) + " " + my.toFixed(1) + ") rotate(" + (tg * 180 / Math.PI).toFixed(1) + ")" }); }
    var grad = a.grad([[0, "#ffffff"], [1, "#f1ebe1"]]);
    nodes.forEach(function (p, k) {
      a.circle(p[0], p[1], 27, grad, { sw: 1.4 });
      var g = a.group({ transform: "translate(" + p[0].toFixed(1) + " " + p[1].toFixed(1) + ")" });
      if (k === 0) { a.poly([[-15, 10], [-5, -8], [3, 2], [9, -4], [16, 10]], "#b9a98a", { sw: 1.1 }, g); a.circle(-2, 7, 3, "#8a8184", { ns: true }, g); a.circle(5, 8, 2.4, "#a69d90", { ns: true }, g); }
      if (k === 1) { a.rect(-15, -2, 30, 13, "#cfc6b8", { sw: 1.1 }, g); a.rect(5, -16, 6, 15, "#a39a8c", { sw: 1.1 }, g); a.circle(10, -20, 4, "rgba(120,114,108,.35)", { ns: true }, g); a.rect(-10, 3, 6, 5, C.glass, { sw: 0.8 }, g); }
      if (k === 2) { a.rect(-16, -2, 22, 10, C.orange, { sw: 1.1 }, g); a.rect(6, -4, 9, 12, C.glass, { sw: 1 }, g); a.ellipse(-6, -6, 9, 6, "#d6cfc3", { sw: 1.1 }, g); a.circle(-10, 10, 3, "#2d282a", { ns: true }, g); a.circle(8, 10, 3, "#2d282a", { ns: true }, g); }
      if (k === 3) { a.line(-6, 14, -6, -16, C.dark, 2.2, null, g); a.line(-12, -14, 14, -14, C.dark, 2.2, null, g); a.line(10, -14, 10, -4, C.dark, 1.2, null, g); a.rect(6, -4, 8, 6, C.orange, { sw: 0.8 }, g); a.rect(-14, 6, 14, 8, "#d6cfc3", { sw: 1 }, g); }
      if (k === 4) { a.rect(-12, -12, 24, 26, "#d6cfc3", { sw: 1.1 }, g); for (var q = 0; q < 3; q++) for (var w2 = 0; w2 < 2; w2++) a.rect(-8 + w2 * 10, -8 + q * 7, 6, 4, C.glass, { sw: 0.6 }, g); }
      if (k === 5) { a.path("M-10,-4 A11,11 0 0 1 10,-4", "none", { stroke: "#4b9a55", sw: 2.2 }, g); a.poly([[10, -10], [13, -2], [5, -3]], "#4b9a55", { ns: true }, g); a.path("M10,5 A11,11 0 0 1 -10,5", "none", { stroke: "#4b9a55", sw: 2.2 }, g); a.poly([[-10, 11], [-13, 3], [-5, 4]], "#4b9a55", { ns: true }, g); }
      if (L) { var t = a.add("text", { x: p[0], y: p[1] + (k === 3 ? 44 : k === 0 ? -36 : 42), "text-anchor": "middle", class: "wcall" }); t.textContent = L[k]; }
    });
    function arrow(x, y, up, col) { a.line(x, y, x, y + (up ? -26 : 26), col, 3); a.poly(up ? [[x - 6, y - 22], [x + 6, y - 22], [x, y - 32]] : [[x - 6, y + 22], [x + 6, y + 22], [x, y + 32]], col, { ns: true }); }
    arrow(nodes[1][0] + 30, nodes[1][1] - 20, true, "#8a8184"); arrow(nodes[0][0] + 40, nodes[0][1] + 8, true, "#8a8184");
    arrow(nodes[5][0] - 54, nodes[5][1] - 24, false, "#4b9a55"); arrow(nodes[4][0] - 54, nodes[4][1] - 24, false, "#4b9a55");
    if (L) { var o = a.add("text", { x: nodes[1][0] + 30, y: nodes[1][1] - 56, "text-anchor": "middle", class: "wcall" }); o.textContent = L[6]; var n2 = a.add("text", { x: nodes[5][0] - 54, y: nodes[5][1] - 32, "text-anchor": "middle", class: "wcall wcall--g" }); n2.textContent = L[7]; }
    var c1 = a.add("text", { x: cx, y: cy - 2, "text-anchor": "middle", class: "wlcafig__c" }); c1.textContent = L ? L[8] : "";
    var c2 = a.add("text", { x: cx, y: cy + 18, "text-anchor": "middle", class: "wtxt" }); c2.textContent = L ? L[9] : "";
    return a.svg;
  }

  // ---------- 15. frost and air voids ----------
  function frostScene(air, sat, frozen, risk) {
    var a = art(360, 220, "wchart wfrost"), r = seeded(21), rv = seeded(5), i, voids = [];
    a.rect(0, 0, 360, 220, a.grad([[0, "#eef3f6"], [1, "#dfe7ec"]]), { ns: true });
    a.rect(14, 12, 332, 196, a.grad([[0, "#e6e0d6"], [1, "#cdc5b8"]]), { sw: 1.3, rx: 6 });
    a.speckle(16, 14, 328, 192, 80, 4, ["#b9b0a2", "#f1ebe1"], 1.2);
    var nAir = Math.round(air * 3.4);
    for (i = 0; i < nAir; i++) { var vx = 28 + rv() * 304, vy = 26 + rv() * 168, vr = 5 + rv() * 6; voids.push([vx, vy, vr]); a.circle(vx, vy, vr, "#fbfdff", { stroke: "#93a3ad", sw: 1.1 }); a.circle(vx - vr * 0.3, vy - vr * 0.3, vr * 0.25, "#ffffff", { ns: true }); }
    for (i = 0; i < 120; i++) {
      var px = 24 + r() * 312, py = 22 + r() * 176, pr = 1.5 + r() * 2.2, wet = r() < sat, near = voids.some(function (v) { return Math.hypot(v[0] - px, v[1] - py) < v[2] + 24; }), roll = r();
      a.circle(px, py, pr, wet ? (frozen ? "#eef9ff" : "#7fb6dc") : "#f7f3ed", { stroke: wet && frozen ? "#6aa8d2" : "rgba(59,52,54,.25)", sw: 0.8 });
      if (frozen && wet && risk >= 2 && !near && roll < 0.4) a.path("M" + px.toFixed(1) + "," + py.toFixed(1) + " l" + (7 - r() * 14).toFixed(1) + "," + (7 - r() * 14).toFixed(1) + " l" + (7 - r() * 14).toFixed(1) + "," + (7 - r() * 14).toFixed(1), "none", { stroke: "#5b4a44", sw: 1.1 });
      if (frozen && wet && risk === 1 && !near && roll < 0.15) a.path("M" + px.toFixed(1) + "," + py.toFixed(1) + " l" + (5 - r() * 10).toFixed(1) + "," + (5 - r() * 10).toFixed(1), "none", { stroke: "#7a6a62", sw: 0.9 });
    }
    return a.svg;
  }
  function buildFrost(app) {
    var W = T.more.frost, S = { air: 2, sat: 92, frozen: false };
    var sA = slider(W.air, 0.5, 8, 0.5, 2, function (v) { return num(v, 1) + " %"; }, function (v) { S.air = v; S.frozen = false; draw(); });
    var sS = slider(W.sat, 50, 100, 1, 92, function (v) { return num(v) + " %"; }, function (v) { S.sat = v; S.frozen = false; draw(); });
    var btn = el("button", { type: "button", class: "vbtn" }); btn.addEventListener("click", function () { S.frozen = !S.frozen; draw(); });
    var box = el("div", { class: "wfrost__pic" }), big = el("p", { class: "wgt__big", "aria-live": "polite" }), stL = stat(W.spacing, "mm"), stR = stat(W.risk), msg = el("ul", { class: "wmsg" });
    function draw() {
      var L = 0.75 / Math.pow(S.air, 0.9), risk = S.sat < 86 ? 0 : L <= 0.2 ? 0 : L <= 0.3 ? 1 : 2;
      box.innerHTML = ""; box.appendChild(frostScene(S.air, S.sat / 100, S.frozen, risk));
      btn.textContent = S.frozen ? W.thaw : W.freeze;
      stL.set(num(L, 2)); stR.set(W.levels[risk]); stR.box.setAttribute("data-tone", ["good", "ok", "bad"][risk]);
      big.textContent = S.frozen ? W.after[risk] : W.before;
      msg.innerHTML = "";
      if (S.sat < 86) msg.appendChild(el("li", { class: "wmsg__ok", text: W.dry }));
      msg.appendChild(el("li", { class: "wmsg__info", text: W.rule }));
    }
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [sA.box, sS.box, btn, el("div", { class: "stats" }, [stL.box, stR.box])]), el("div", { class: "wgt__out" }, [big, box, msg])]));
    app.appendChild(how(W.how));
    draw();
  }

  // ---------- 16. how a concrete pump works ----------
  function pumpParts(a) {
    a.rect(0, 0, 420, 200, a.grad([[0, "#fff7ea"], [1, "#f4ead9"]]), { ns: true });
    a.rect(0, 176, 420, 24, a.grad([[0, "#cdbb94"], [1, "#a8966c"]]), { ns: true });
    a.poly([[6, 40], [74, 40], [64, 150], [16, 150]], a.grad([[0, "#ffa63a"], [1, "#d96a00"]], true), { sw: 1.4 });
    a.poly([[12, 62], [68, 62], [63, 146], [17, 146]], a.grad([[0, "#a49b8f"], [1, "#7d756c"]]), { ns: true });
    a.speckle(14, 64, 52, 80, 30, 8, ["#5d5448", "#c9c0b4"], 1.6);
    var cyl = [], k;
    for (k = 0; k < 2; k++) {
      var y = 66 + k * 54;
      a.rect(84, y, 206, 34, a.grad([[0, "#e5e8ea"], [0.5, "#b8bec3"], [1, "#868c92"]]), { sw: 1.4 });
      var conc = a.rect(150, y + 3, 138, 28, a.grad([[0, "#a49b8f"], [1, "#7d756c"]]), { ns: true });
      var rod = a.rect(84, y + 13, 70, 8, "#6b6466", { sw: 1 });
      var pis = a.rect(146, y + 2, 10, 30, "#3f393b", { sw: 1 });
      cyl.push({ y: y, conc: conc, rod: rod, pis: pis });
    }
    var sv2 = a.path("M290,83 C318,83 318,103 340,103", "none", { stroke: "#5b5456", sw: 12, "stroke-linecap": "round" });
    a.rect(330, 96, 90, 14, "#6b6466", { sw: 1.2 });
    var flow = a.line(334, 103, 420, 103, "#a49b8f", 6, { "stroke-dasharray": "10 8" });
    a.rect(300, 140, 16, 36, "#8f877c", { sw: 1.2 }); a.rect(88, 150, 16, 26, "#8f877c", { sw: 1.2 });
    return function (ph, dash) {
      var act = Math.floor(ph) % 2, f = ph - Math.floor(ph), e = 0.5 - Math.cos(f * Math.PI) / 2;
      cyl.forEach(function (c, i) {
        var pos = i === act ? 146 + e * 128 : 274 - e * 128;
        c.pis.setAttribute("x", pos.toFixed(1)); c.rod.setAttribute("width", (pos - 84).toFixed(1)); c.conc.setAttribute("x", (pos + 10).toFixed(1)); c.conc.setAttribute("width", Math.max(0, 278 - pos).toFixed(1));
      });
      sv2.setAttribute("d", act === 0 ? "M290,83 C318,83 318,103 340,103" : "M290,137 C318,137 318,103 340,103");
      flow.setAttribute("stroke-dashoffset", (-dash).toFixed(1));
    };
  }
  function buildPump(app) {
    var W = T.more.pump, S = { d: 230, L: 2100, n: 18, eff: 85 }, raf = 0, ph = 0, dash = 0, last = 0;
    var sD = slider(W.dia, 150, 280, 10, 230, function (v) { return num(v) + " mm"; }, function (v) { S.d = v; calc(); });
    var sL = slider(W.stroke, 1000, 2500, 100, 2100, function (v) { return num(v) + " mm"; }, function (v) { S.L = v; calc(); });
    var sN = slider(W.spm, 5, 30, 1, 18, function (v) { return num(v) + " " + W.perMin; }, function (v) { S.n = v; calc(); });
    var sE = slider(W.eff, 70, 95, 1, 85, function (v) { return num(v) + " %"; }, function (v) { S.eff = v; calc(); });
    var A = art(420, 200, "wchart wpump"), upd = pumpParts(A);
    var stV = stat(W.perStroke, W.l), stQ = stat(W.out, "m³/h"), stT = stat(W.truck, W.min), big = el("p", { class: "wgt__big", "aria-live": "polite" }), msg = el("ul", { class: "wmsg" });
    var q = 0;
    function calc() {
      var vol = Math.PI * Math.pow(S.d / 2000, 2) * (S.L / 1000); q = vol * S.n * 60 * S.eff / 100;
      stV.set(num(vol * 1000)); stQ.set(num(q)); stT.set(num(8 / q * 60, 1));
      big.textContent = W.now.replace("{q}", num(q)).replace("{h}", num(50 / q, 1));
      msg.innerHTML = ""; msg.appendChild(el("li", { class: "wmsg__info", text: W.real })); msg.appendChild(el("li", { class: "wmsg__info", text: W.rule }));
    }
    function frame(t) { var dt = Math.min(50, t - (last || t)); last = t; ph += dt / 1000 * S.n / 60; dash += dt * q / 900; upd(ph, dash); if (!REDUCE) raf = requestAnimationFrame(frame); }
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [sD.box, sL.box, sN.box, sE.box]), el("div", { class: "wgt__out" }, [big, A.svg, el("div", { class: "stats" }, [stV.box, stQ.box, stT.box]), msg])]));
    app.appendChild(how(W.how));
    calc(); upd(0.3, 0);
    if (!REDUCE) { if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { cancelAnimationFrame(raf); if (e[0].isIntersecting) { last = 0; raf = requestAnimationFrame(frame); } }).observe(A.svg); else raf = requestAnimationFrame(frame); }
  }

  // ---------- 17. rockfall energy ----------
  var NETS = [100, 250, 500, 1000, 1500, 2000, 3000, 4500, 5000];
  function rockParts(a) {
    a.rect(0, 0, 420, 240, a.grad([[0, "#fff7ea"], [1, "#f3e6d0"]]), { ns: true });
    a.poly([[0, 20], [70, 26], [110, 60], [150, 120], [230, 176], [420, 200], [420, 240], [0, 240]], a.grad([[0, C.rock], [1, C.rockD]], true), { sw: 1.4 });
    a.speckle(0, 40, 260, 200, 70, 13, ["#8e806d", "#d8cbb8"], 1.6);
    a.cypress(380, 200, 40); a.pine(330, 196, 34);
    a.rect(300, 196, 120, 8, "#6b6466", { ns: true }); a.line(300, 200, 420, 200, "#fff", 1, { "stroke-dasharray": "8 6" });
    a.line(248, 180, 248, 140, "#5b5456", 3); a.line(282, 186, 282, 146, "#5b5456", 3);
    var net = a.path("M248,142 Q265,150 282,148 L282,186 Q265,184 248,180 Z", "rgba(91,84,86,.18)", { stroke: "#5b5456", sw: 1.2 });
    for (var i = 0; i < 5; i++) a.line(248, 148 + i * 8, 282, 152 + i * 8, "rgba(91,84,86,.6)", 0.8);
    var path = a.path("M70,24", "none", { stroke: "rgba(59,52,54,.35)", sw: 1.2, "stroke-dasharray": "3 4" });
    var rock = a.circle(70, 20, 8, a.grad([[0, "#9a8f84"], [1, "#5d5448"]]), { sw: 1.2 });
    var hl = a.line(36, 24, 36, 176, C.orange, 1.6), ht = a.add("text", { x: 42, y: 104, class: "wcall" });
    return function (rad, h, u) {
      var x0 = 70, y0 = 22, x1 = 252, y1 = 160, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u * u;
      path.setAttribute("d", "M" + x0 + "," + y0 + " Q" + (x0 + 120) + "," + (y0 + 6) + " " + x1 + "," + y1);
      rock.setAttribute("r", rad.toFixed(1)); rock.setAttribute("cx", x.toFixed(1)); rock.setAttribute("cy", (y - rad + 4).toFixed(1));
      ht.textContent = Math.round(h) + " m";
      net.setAttribute("d", u > 0.98 ? "M248,142 Q272,158 282,148 L282,186 Q272,192 248,180 Z" : "M248,142 Q265,150 282,148 L282,186 Q265,184 248,180 Z");
    };
  }
  function buildSten(app) {
    var W = T.more.rock, S = { d: 0.6, h: 20, u: 0 }, raf = 0;
    var sD = slider(W.size, 0.2, 2, 0.1, 0.6, function (v) { return num(v, 1) + " m"; }, function (v) { S.d = v; draw(); });
    var sH = slider(W.height, 2, 100, 1, 20, function (v) { return num(v) + " m"; }, function (v) { S.h = v; draw(); });
    var drop = el("button", { type: "button", class: "vbtn", text: W.drop });
    var A = art(420, 240, "wchart wrock"), upd = rockParts(A);
    var stM = stat(W.mass, "kg"), stV = stat(W.speed, "km/h"), stE = stat(W.energy, "kJ"), big = el("p", { class: "wgt__big", "aria-live": "polite" });
    var scale = el("ul", { class: "wnets" }), msg = el("ul", { class: "wmsg" });
    NETS.forEach(function (n, i) { scale.appendChild(el("li", { text: (i === NETS.length - 1 ? "> " : "") + num(i === NETS.length - 1 ? 4500 : n) })); });
    function draw() {
      var vol = Math.PI / 6 * Math.pow(S.d, 3), m = vol * 2700, v = Math.sqrt(2 * 9.81 * S.h), E = 0.5 * m * v * v / 1000, cars = E / 145, k = 0;
      while (k < NETS.length - 1 && NETS[k] < E) k++;
      stM.set(num(m)); stV.set(num(v * 3.6)); stE.set(num(E));
      big.textContent = W.now.replace("{e}", num(E)).replace("{c}", num(cars, cars < 10 ? 1 : 0));
      [].forEach.call(scale.children, function (li, i) { li.classList.toggle("is-on", i === k); li.classList.toggle("is-low", i < k); });
      msg.innerHTML = ""; msg.appendChild(el("li", { class: E > 4500 ? "wmsg__warn" : "wmsg__info", text: E > 4500 ? W.huge : W.need.replace("{n}", num(NETS[k])) })); msg.appendChild(el("li", { class: "wmsg__info", text: W.real }));
      upd(4 + S.d * 7, S.h, S.u);
    }
    drop.addEventListener("click", function () {
      cancelAnimationFrame(raf); var t0 = performance.now(), D = REDUCE ? 1 : 900 + Math.sqrt(S.h) * 60;
      (function step(now) { S.u = Math.min(1, (now - t0) / D); S.u = S.u * S.u; upd(4 + S.d * 7, S.h, S.u); if (S.u < 1) raf = requestAnimationFrame(step); })(t0);
    });
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [sD.box, sH.box, drop, el("div", { class: "stats" }, [stM.box, stV.box, stE.box])]), el("div", { class: "wgt__out" }, [big, A.svg, el("p", { class: "wgt__cap", text: W.scale }), scale, msg])]));
    app.appendChild(how(W.how));
    draw();
  }

  // ---------- 18. Marsh funnel ----------
  function marshParts(a) {
    a.rect(0, 0, 300, 280, a.grad([[0, "#fff7ea"], [1, "#f4ead9"]]), { ns: true });
    a.rect(0, 256, 300, 24, a.grad([[0, "#cdbb94"], [1, "#a8966c"]]), { ns: true });
    a.line(232, 40, 232, 256, "#6b6466", 4); a.line(214, 62, 252, 62, "#6b6466", 3); a.rect(226, 248, 40, 8, "#6b6466", { ns: true });
    var funnel = "M70,30 L230,30 L162,150 L162,170 L138,170 L138,150 Z", clipF = a.clip(funnel);
    a.path(funnel, "rgba(255,255,255,.75)", { ns: true });
    var lvl = a.rect(60, 40, 180, 140, a.grad([[0, "#a49b8f"], [1, "#7d756c"]]), { ns: true, "clip-path": clipF });
    a.path(funnel, "none", { stroke: "#3b3436", sw: 2 }); a.line(76, 40, 224, 40, "rgba(59,52,54,.5)", 1, { "stroke-dasharray": "4 3" });
    a.rect(70, 26, 160, 6, "#8a8184", { sw: 1 });
    var stream = a.rect(147, 170, 6, 0, "#8f877c", { ns: true });
    var cupClip = a.clip("M110,196 L190,196 L184,254 L116,254 Z");
    var cupFill = a.rect(100, 254, 100, 0, a.grad([[0, "#a49b8f"], [1, "#7d756c"]]), { ns: true, "clip-path": cupClip });
    a.path("M110,196 L190,196 L184,254 L116,254 Z", "rgba(255,255,255,.25)", { stroke: "#3b3436", sw: 1.6 });
    a.line(112, 212, 188, 212, C.orange, 1.4); var mk = a.add("text", { x: 194, y: 215, class: "wcall" }); mk.textContent = "946 ml";
    return function (f, running) {
      var top = 40 + 112 * f; lvl.setAttribute("y", top.toFixed(1)); lvl.setAttribute("height", Math.max(0, 180 - top).toFixed(1));
      stream.setAttribute("height", running && f < 0.995 ? 84 : 0);
      var h = 42 * Math.min(1, f) * (946 / 946); cupFill.setAttribute("y", (254 - h).toFixed(1)); cupFill.setAttribute("height", h.toFixed(1));
    };
  }
  function buildMarsh(app) {
    var W = T.more.marsh, TIMES = [26, 32, 37, 48, 42], S = { i: 2, x: 1, run: false, t0: 0, user: null }, raf = 0;
    var sF = select(W.fluid, W.fluids, 2, function (i) { S.i = i; reset(); });
    var sX = segmented(W.speedL, W.speeds, 0, function (i) { S.x = [1, 4][i]; reset(); }); S.x = 1;
    var start = el("button", { type: "button", class: "vbtn", text: W.start }), stop = el("button", { type: "button", class: "vbtn vbtn--ghost", text: W.stop });
    var A = art(300, 280, "wchart wmarsh"), upd = marshParts(A), clock = el("p", { class: "wmarsh__clock", "aria-live": "off" }), big = el("p", { class: "wgt__big", "aria-live": "polite" });
    function T0() { return TIMES[S.i]; }
    function reset() { cancelAnimationFrame(raf); S.run = false; S.user = null; upd(0, false); clock.textContent = "0,0 s"; big.textContent = W.ready; stop.disabled = true; start.disabled = false; }
    function frame(now) {
      var el2 = (now - S.t0) / 1000 * S.x, f = Math.min(1.15, el2 / T0());
      upd(Math.min(1, f), true); clock.textContent = num(el2, 1).replace(".", ",") + " s";
      if (S.user === null && f >= 1.15) { S.run = false; upd(1, false); big.textContent = W.missed.replace("{t}", num(T0())); stop.disabled = true; start.disabled = false; return; }
      if (S.run) raf = requestAnimationFrame(frame);
    }
    start.addEventListener("click", function () { reset(); S.run = true; S.t0 = performance.now(); start.disabled = true; stop.disabled = false; big.textContent = W.running; raf = requestAnimationFrame(frame); });
    stop.addEventListener("click", function () {
      if (!S.run) return; S.run = false; cancelAnimationFrame(raf);
      var el2 = (performance.now() - S.t0) / 1000 * S.x; S.user = el2; upd(Math.min(1, el2 / T0()), false); clock.textContent = num(el2, 1) + " s";
      var diff = Math.abs(el2 - T0()); big.textContent = (diff < 1 ? W.good : W.result).replace("{u}", num(el2, 1)).replace("{t}", num(T0())); stop.disabled = true; start.disabled = false;
    });
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [sF.box, sX.box, el("div", { class: "vbtns" }, [start, stop]), clock]), el("div", { class: "wgt__out" }, [big, el("div", { class: "wmarsh__pic" }, [A.svg]), el("ul", { class: "wmsg" }, [el("li", { class: "wmsg__info", text: W.note })])])]));
    app.appendChild(how(W.how));
    reset();
  }

  // ---------- 19. Häny INJECTO-COMPACT: choose a model ----------
  var ICM = [
    ["IC 310", 100, 150, 610, 1.5, 100, 9.1, 1], ["IC 311", 100, 150, 611, 2.0, 75, 9.1, 1], ["IC 325", 100, 150, 625, 2.0, 100, 9.1, 2], ["IC 325 CCP", 100, 150, 625, 2.0, 100, 0, 2, 1],
    ["IC 650/710", 300, 350, 710, 5.0, 100, 17.5, 1], ["IC 650/712", 300, 350, 712, 4.9, 88, 17.5, 1], ["IC 650/725", 300, 350, 725, 5.0, 100, 19.0, 2],
    ["IC 1100/710", 300, 800, 710, 5.0, 100, 17.5, 1], ["IC 1100/712", 300, 800, 712, 4.9, 88, 17.5, 1], ["IC 1100/725", 300, 800, 725, 5.0, 100, 19.0, 2], ["IC 1100/726", 300, 800, 726, 5.0, 100, 39.8, 2],
    ["IC 1400/710", 600, 800, 710, 7.5, 100, 17.5, 1], ["IC 1400/712", 600, 800, 712, 4.9, 88, 17.5, 1], ["IC 1400/725", 600, 800, 725, 8.0, 100, 19.0, 2], ["IC 1400/726", 600, 800, 726, 8.0, 100, 39.8, 2]
  ];
  // IC plant, side view like an IC 325: colloidal mixer (HCM) with a high-shear impeller, agitator (HRW) with slow paddles,
  // ZMP piston pump with vertical plungers on a hydraulic power pack, control cabinet, and optionally the Jean Lutz DPV-H logger.
  // Returns the svg; svg.__step(t) animates it (impeller, paddles, plungers, flow and the logger's readings).
  function icScene(m, labels, opt) {
    opt = opt || {};
    var a = art(490, 280, "wchart wic"), Y = 230, i, yel = a.grad([[0, "#ffd84a"], [0.55, "#f2bf12"], [1, "#d99e00"]], true), yelV = a.grad([[0, "#ffdd55"], [1, "#e0a600"]]);
    var steel = a.grad([[0, "#eef0f2"], [0.5, "#b9bfc4"], [1, "#858b91"]], true), dark = a.grad([[0, "#4a4446"], [1, "#2a2527"]], true), grout = a.grad([[0, "#a8a39b"], [1, "#7f7a72"]]);
    a.rect(0, 0, 490, 280, a.grad([[0, "#fff7ea"], [1, "#f4ead9"]]), { ns: true });
    a.rect(0, 252, 490, 28, a.grad([[0, "#d6c6a2"], [1, "#b3a07a"]]), { ns: true });
    a.shadow(230, 253, 214, 6);
    var hm = 74 + Math.min(m[1], 600) / 600 * 58, ha = 62 + Math.min(m[2], 800) / 800 * 66;
    // lifting point and slings
    var top = Y - Math.max(hm + 74, ha + 40, 168) - 14;
    a.line(230, top, 40, Y - 4, "rgba(59,52,54,.28)", 1, { "stroke-dasharray": "3 3" }); a.line(230, top, 428, Y - 4, "rgba(59,52,54,.28)", 1, { "stroke-dasharray": "3 3" });
    a.circle(230, top - 4, 5, "none", { stroke: C.dark, sw: 2 });
    // skid frame with fork pockets
    a.rect(18, Y, 424, 10, yel, { sw: 1.3 }); a.rect(18, Y + 10, 424, 10, a.grad([[0, "#e6ad00"], [1, "#c48f00"]]), { sw: 1.3 });
    [70, 170, 290, 390].forEach(function (x) { a.rect(x, Y + 11, 26, 8, "#3b3436", { ns: true }); });
    // --- HCM colloidal mixer (left): a tank with a grid on top; under its side a high-shear pump (motor standing on the rotor housing)
    // does the mixing, pumping the grout round a loop back up into the tank until a three-way valve sends it on to the agitator
    var mx0 = 24, mx1 = 98, mcx = (mx0 + mx1) / 2, mtop = Y - hm - 8, mbot = Y - 30;
    a.line(mx0 + 8, mbot - 6, mx0 + 8, Y, "#c48f00", 4); a.line(mx1 - 8, mbot - 6, mx1 - 8, Y, "#c48f00", 4);
    a.path("M" + mx0 + "," + mtop + " H" + mx1 + " V" + (mbot - 10) + " Q" + mx1 + "," + mbot + " " + (mcx + 10) + "," + mbot + " H" + (mcx - 10) + " Q" + mx0 + "," + mbot + " " + mx0 + "," + (mbot - 10) + " Z", yel, { sw: 1.5 });
    a.rect(mx0 - 3, mtop - 5, mx1 - mx0 + 6, 6, yelV, { sw: 1.2 });
    for (i = 1; i < 7; i++) a.line(mx0 + i * (mx1 - mx0) / 7, mtop - 5, mx0 + i * (mx1 - mx0) / 7, mtop + 1, "#9b7a00", 1);
    a.path("M" + (mx0 + 8) + "," + (mtop - 5) + " V" + (mtop - 24) + " H" + (mx0 - 8), "none", { stroke: "#5b9cc6", sw: 4, "stroke-linecap": "round" });
    var wx0 = mx0 + 10, wx1 = mx1 - 10, wy0 = mtop + 12, wy1 = mbot - 8;
    a.rect(wx0, wy0, wx1 - wx0, wy1 - wy0, "#2f2a2c", { sw: 1.2 });
    var lvl = wy0 + (wy1 - wy0) * 0.28;
    a.rect(wx0 + 1, lvl, wx1 - wx0 - 2, wy1 - lvl - 1, grout, { ns: true });
    a.rect(mcx - 22, mtop - 9, 44, 5, yelV, { sw: 1 });
    a.rect(mcx - 11, mtop - 46, 22, 37, yel, { sw: 1.3 }); for (i = 0; i < 4; i++) a.line(mcx - 8, mtop - 40 + i * 8, mcx + 8, mtop - 40 + i * 8, "rgba(120,80,0,.35)", 1);
    a.ellipse(mcx, mtop - 46, 11, 4, "#ffe066", { sw: 1.1 }); a.rect(mcx - 7, mtop - 55, 14, 9, yelV, { sw: 1, rx: 3 });
    a.line(mcx, wy0, mcx, wy1 - 10, "#cfd3d6", 2.6);
    var impY = wy1 - 13;
    a.rect(mcx - 4, impY - 1, 8, 7, "#5b5456", { ns: true });
    var bladeA = a.rect(mcx - 16, impY, 32, 5, steel, { sw: 0.8 }), bladeB = a.rect(mcx - 16, impY, 32, 5, a.grad([[0, "#9aa0a6"], [1, "#6b7177"]]), { sw: 0.8 });
    var swirl = [];
    for (i = 0; i < 3; i++) swirl.push(a.path("M" + (wx0 + 5) + "," + (wy1 - 10 - i * 11) + " C" + (mcx - 10) + "," + (wy1 - 24 - i * 11) + " " + (mcx + 10) + "," + (wy1 + 2 - i * 11) + " " + (wx1 - 5) + "," + (wy1 - 14 - i * 11), "none", { stroke: "rgba(255,255,255,.45)", sw: 1.3, "stroke-dasharray": "6 7" }));
    // the high-shear pump: rotor housing with a window onto the spinning rotor, the motor standing on it
    var hx = mx1 + 22, hy = Y - 17;
    a.path("M" + mcx + "," + mbot + " V" + (hy + 6) + " H" + (hx - 12), "none", { stroke: "#5b5456", sw: 6 });
    a.rect(hx - 12, hy - 60, 24, 44, yel, { sw: 1.3 }); for (i = 0; i < 5; i++) a.line(hx - 9, hy - 55 + i * 8, hx + 9, hy - 55 + i * 8, "rgba(120,80,0,.35)", 1);
    a.ellipse(hx, hy - 60, 12, 4, "#ffe066", { sw: 1.1 });
    a.rect(hx - 6, hy - 70, 12, 8, "#c9ccce", { sw: 0.9 }); a.rect(hx - 3, hy - 68, 6, 4, "#d23b2a", { ns: true });
    a.circle(hx, hy, 15, yel, { sw: 1.4 }); a.circle(hx, hy, 10.5, "#2f2a2c", { sw: 1 });
    var rotor = a.group({});
    for (i = 0; i < 6; i++) { var va = i * Math.PI / 3; a.line(hx, hy, hx + Math.cos(va) * 9, hy + Math.sin(va) * 9, "#d9dde0", 1.8, {}, rotor); }
    a.circle(hx, hy, 2.4, "#8a8184", { ns: true }, rotor);
    // the loop back into the tank, with the three-way valve that sends the finished grout to the agitator
    var rx = hx + 22, vy = mtop + 18, loop = "M" + (hx + 15) + "," + hy + " H" + rx + " V" + (mtop - 16) + " H" + (mcx + 14) + " V" + (mtop + 6);
    a.path(loop, "none", { stroke: "#5b5456", sw: 6 });
    var loopFlow = a.path(loop, "none", { stroke: "rgba(214,207,197,.9)", sw: 2, "stroke-dasharray": "3 7" });
    a.rect(rx - 6, vy - 6, 12, 12, "#4a4446", { sw: 1 }); a.line(rx, vy, rx + 14, vy - 12, "#d23b2a", 2.6);
    // --- HRW agitator (middle): motor and gearbox on top, one small paddle at the bottom next to the outlet
    var ax0 = rx + 34, ax1 = ax0 + 98, acx = (ax0 + ax1) / 2, atop = Y - ha, abot = Y - 8;
    a.path("M" + rx + "," + vy + " H" + (ax0 + 22) + " V" + (atop + 2), "none", { stroke: "#5b5456", sw: 5 });
    a.line(ax0 + 6, abot, ax0 + 6, Y, "#c48f00", 4); a.line(ax1 - 6, abot, ax1 - 6, Y, "#c48f00", 4);
    a.rect(ax0, atop, ax1 - ax0, abot - atop, yel, { sw: 1.5 });
    a.rect(ax0 - 3, atop - 4, ax1 - ax0 + 6, 6, yelV, { sw: 1.2 });
    for (i = 1; i < 8; i++) a.line(ax0 + i * (ax1 - ax0) / 8, atop - 4, ax0 + i * (ax1 - ax0) / 8, atop + 2, "#9b7a00", 1);
    a.rect(acx - 30, atop - 8, 60, 5, yelV, { sw: 1 });
    a.rect(acx - 9, atop - 26, 18, 18, yel, { sw: 1.2 });
    a.rect(acx + 9, atop - 24, 30, 14, yel, { sw: 1.2 }); for (i = 0; i < 4; i++) a.line(acx + 14 + i * 6, atop - 23, acx + 14 + i * 6, atop - 11, "rgba(120,80,0,.35)", 1);
    a.rect(acx - 30, atop - 30, 16, 14, "#c9ccce", { sw: 0.9 }); a.circle(acx - 22, atop - 23, 3, "#d23b2a", { ns: true });
    var ax2 = ax0 + 10, ay0 = atop + 10, ay1 = abot - 6;
    a.rect(ax2, ay0, ax1 - ax0 - 20, ay1 - ay0, "#2f2a2c", { sw: 1.2 });
    a.rect(ax2 + 1, ay0 + (ay1 - ay0) * 0.2, ax1 - ax0 - 22, (ay1 - ay0) * 0.8 - 1, grout, { ns: true });
    a.line(acx, ay0, acx, ay1 - 7, "#cfd3d6", 2.4);
    var pad = [a.rect(acx - 12, ay1 - 9, 24, 4, steel, { sw: 0.7 })]; pad[0].__w = 24;
    // outlet at the bottom, next to the paddle, with its valve, to the pump
    a.path("M" + ax1 + "," + (abot - 8) + " H292", "none", { stroke: "#5b5456", sw: 6 });
    a.rect(ax1 + 8, abot - 15, 6, 14, "#d23b2a", { sw: 0.8 });
    // --- ZMP piston pump: vertical plungers on a hydraulic block
    var n = m[7] === 2 ? 2 : 1, px0 = 292, px1 = 352, cyl = [];
    a.rect(px0, Y - 34, px1 - px0, 34, dark, { sw: 1.3 });
    a.line(px0 + 3, Y - 34, px0 + 3, Y - 138, "#6b6466", 2.4); a.line(px1 - 3, Y - 34, px1 - 3, Y - 138, "#6b6466", 2.4); a.rect(px0, Y - 142, px1 - px0, 5, "#6b6466", { ns: true });
    for (i = 0; i < n; i++) {
      var cx = n === 2 ? px0 + 17 + i * 26 : (px0 + px1) / 2;
      a.rect(cx - 9, Y - 134, 18, 38, steel, { sw: 1.2 });
      a.rect(cx - 11, Y - 138, 22, 6, "#6b6466", { ns: true }); a.rect(cx - 11, Y - 98, 22, 5, "#6b6466", { ns: true });
      a.rect(cx - 7, Y - 66, 14, 32, a.grad([[0, "#ffdd55"], [1, "#d49a00"]], true), { sw: 1.1 });
      var rod = a.rect(cx - 3, Y - 95, 6, 30, a.grad([[0, "#f6f7f8"], [1, "#a9aeb3"]], true), { sw: 0.7 });
      cyl.push({ rod: rod, cx: cx });
    }
    // power pack: oil tank with the black motor on top
    a.rect(358, Y - 42, 66, 42, yel, { sw: 1.4 });
    a.rect(366, Y - 92, 34, 50, "#1f1b1c", { sw: 1.2 }); for (i = 0; i < 6; i++) a.line(368, Y - 86 + i * 8, 398, Y - 86 + i * 8, "#4a4446", 1.2);
    a.rect(370, Y - 100, 26, 8, "#2f2a2c", { ns: true });
    a.rect(402, Y - 56, 18, 14, "#c9ccce", { sw: 0.9 }); a.rect(404, Y - 52, 4, 6, "#d23b2a", { ns: true }); a.rect(411, Y - 52, 4, 6, "#d23b2a", { ns: true });
    // control cabinet
    a.rect(358, Y - 176, 62, 66, a.grad([[0, "#f4f5f6"], [1, "#c9cdd0"]], true), { sw: 1.3 });
    a.circle(374, Y - 160, 4, "#3fa34d", { sw: 0.8 }); a.circle(386, Y - 160, 4, "#d23b2a", { sw: 0.8 }); a.circle(404, Y - 132, 8, "#2f6fb5", { sw: 1 });
    a.rect(368, Y - 146, 22, 5, "#3b3436", { ns: true }); a.rect(368, Y - 136, 16, 5, "#3b3436", { ns: true });
    a.path("M402," + (Y - 116) + " l7,-12 l7,12 z", "#f2bf12", { sw: 0.8 });
    // CCP: the extra polyurethane pump
    if (m[8]) { a.rect(258, Y - 72, 30, 40, a.grad([[0, "#d7dadc"], [1, "#9aa0a6"]], true), { sw: 1.2 }); var pu = a.add("text", { x: 273, y: Y - 48, "text-anchor": "middle", class: "wcall" }); pu.textContent = "PU"; }
    // discharge: gauge and hose
    a.path("M" + px1 + "," + (Y - 22) + " H" + 440, "none", { stroke: "#5b5456", sw: 6 });
    a.line(436, Y - 22, 436, Y - 38, "#5b5456", 3); a.circle(436, Y - 46, 9, "#fff", { sw: 1.4 });
    var needle = a.line(436, Y - 46, 442, Y - 50, "#d23b2a", 1.6);
    var flow = a.path("M440," + (Y - 22) + " C462," + (Y - 22) + " 470," + (Y - 2) + " 490," + (Y + 4), "none", { stroke: C.orange, sw: 6, "stroke-linecap": "round" });
    var flowDash = a.path("M440," + (Y - 22) + " C462," + (Y - 22) + " 470," + (Y - 2) + " 490," + (Y + 4), "none", { stroke: "rgba(255,255,255,.55)", sw: 2, "stroke-dasharray": "4 8" });
    // Jean Lutz DPV-H: inline flow and pressure sensor, cable, and the display on a bracket
    var dQ = null, dP = null, dV = null;
    if (opt.log) {
      a.rect(404, Y - 30, 22, 16, steel, { sw: 1.1 }); a.rect(410, Y - 36, 10, 6, "#2f2a2c", { ns: true });
      a.path("M415," + (Y - 36) + " C415," + (Y - 70) + " 458," + (Y - 70) + " 457," + (Y - 108), "none", { stroke: "#2f2a2c", sw: 1.6 });
      var dx = 428, dy = Y - 172;
      a.rect(dx + 18, dy - 6, 22, 6, "#6b6466", { sw: 0.8, rx: 3 });
      a.rect(dx, dy, 58, 64, "#f2bf12", { sw: 1.4, rx: 6 });
      a.rect(dx + 4, dy + 4, 50, 56, "#1f1b1c", { ns: true, rx: 4 });
      a.circle(dx + 12, dy + 12, 4.5, "#2f8fd8", { ns: true }); a.circle(dx + 46, dy + 12, 4.5, "#2f8fd8", { ns: true }); a.circle(dx + 29, dy + 12, 4, "#3a3a3a", { ns: true });
      a.rect(dx + 8, dy + 22, 42, 32, "#0e1a26", { ns: true });
      a.path("M" + (dx + 12) + "," + (dy + 34) + " a8,8 0 0 1 16,0", "none", { stroke: "#4aa3e0", sw: 1.2 }); a.path("M" + (dx + 30) + "," + (dy + 34) + " a8,8 0 0 1 16,0", "none", { stroke: "#4aa3e0", sw: 1.2 });
      dQ = a.add("text", { x: dx + 20, y: dy + 44, "text-anchor": "middle", fill: "#ffffff", "font-size": "6", "font-family": "Arial", "font-weight": "700" });
      dP = a.add("text", { x: dx + 38, y: dy + 44, "text-anchor": "middle", fill: "#ffffff", "font-size": "6", "font-family": "Arial", "font-weight": "700" });
      dV = a.add("text", { x: dx + 29, y: dy + 52, "text-anchor": "middle", fill: "#ffb35c", "font-size": "5.5", "font-family": "Arial", "font-weight": "700" });
      var lb = a.add("text", { x: dx + 29, y: dy - 12, "text-anchor": "middle", class: "wcall" }); lb.textContent = "DPV-H";
    }
    if (labels) {
      [[mcx, "HCM " + m[1]], [acx, "HRW " + m[2]], [(px0 + px1) / 2, "ZMP " + m[3]]].forEach(function (t) { var e = a.add("text", { x: t[0], y: Y + 38, "text-anchor": "middle", class: "wcall" }); e.textContent = t[1]; });
      var lp = a.add("text", { x: 238, y: top - 2, class: "wtxt" }); lp.textContent = labels;
    }
    var Qlpm = m[4] * 1000 / 60, vol = 120, lastT = 0;
    a.svg.__step = function (t) {
      var ang = t / 1000 * 22, c = Math.cos(ang), s2 = Math.cos(ang + Math.PI / 2);
      rotor.setAttribute("transform", "rotate(" + ((ang * 180 / Math.PI) % 360).toFixed(1) + " " + hx + " " + hy + ")");
      bladeA.setAttribute("x", (mcx - 16 * Math.abs(c)).toFixed(1)); bladeA.setAttribute("width", (32 * Math.abs(c)).toFixed(1));
      bladeB.setAttribute("x", (mcx - 16 * Math.abs(s2)).toFixed(1)); bladeB.setAttribute("width", (32 * Math.abs(s2)).toFixed(1));
      loopFlow.setAttribute("stroke-dashoffset", (-(t / 14)).toFixed(1));
      swirl.forEach(function (p, k) { p.setAttribute("stroke-dashoffset", (-(t / 18) * (1 + k * 0.2)).toFixed(1)); });
      var pa = t / 1000 * 1.6;
      pad.forEach(function (p, k) { var w = p.__w * Math.abs(Math.cos(pa + k * 0.9)); p.setAttribute("x", (acx - w / 2).toFixed(1)); p.setAttribute("width", w.toFixed(1)); });
      var ph = t / 1000 * 1.1;
      cyl.forEach(function (cy, k) { var u = 0.5 - 0.5 * Math.cos((ph + k * 0.5) * Math.PI * 2); cy.rod.setAttribute("y", (Y - 95 + u * 22).toFixed(1)); cy.rod.setAttribute("height", (30).toFixed(1)); });
      var puls = n === 2 ? 0.92 + 0.08 * Math.abs(Math.sin(ph * Math.PI * 2)) : 0.55 + 0.45 * Math.abs(Math.sin(ph * Math.PI * 2));
      flowDash.setAttribute("stroke-dashoffset", (-(t / 30)).toFixed(1));
      var bar = 0.5 * m[5] * (0.85 + 0.15 * puls), angN = -2.2 + bar / m[5] * 2.6;
      needle.setAttribute("x2", (436 + Math.cos(angN) * 7).toFixed(1)); needle.setAttribute("y2", (Y - 46 + Math.sin(angN) * 7).toFixed(1));
      var dts = lastT ? Math.min(0.1, (t - lastT) / 1000) : 0; lastT = t;
      if (dQ) { vol += Qlpm * puls / 60 * dts; dQ.textContent = (Qlpm * puls).toFixed(1); dP.textContent = bar.toFixed(1); dV.textContent = Math.round(vol) + " L"; }
    };
    a.svg.__step(400);
    return a.svg;
  }
  function buildIc(app) {
    var W = T.more2.ic, S = { q: 2, p: 60, dbl: false, pu: false, sel: 2, log: false };
    var sQ = slider(W.flow, 0.5, 8, 0.5, 2, function (v) { return num(v, 1) + " m³/h"; }, function (v) { S.q = v; pick(); });
    var sP = slider(W.press, 20, 100, 5, 60, function (v) { return num(v) + " bar"; }, function (v) { S.p = v; pick(); });
    var dbl = el("label", { class: "wchk" }, [el("input", { type: "checkbox" }), el("span", { text: W.dbl })]), pu = el("label", { class: "wchk" }, [el("input", { type: "checkbox" }), el("span", { text: W.pu })]);
    dbl.firstChild.addEventListener("change", function () { S.dbl = this.checked; pick(); }); pu.firstChild.addEventListener("change", function () { S.pu = this.checked; pick(); });
    var LG = LANG === "sv" ? { log: "Lägg till dataloggning (Jean Lutz DPV-H)", on: "DPV-H mäter flöde, tryck och volym i realtid, visar dem på skärmen och sparar varje hål, så att arbetet kan visas i efterhand." } : { log: "Add data logging (Jean Lutz DPV-H)", on: "The DPV-H measures flow, pressure and volume in real time, shows them on screen and records every hole, so the work can be shown afterwards." };
    var lg = el("label", { class: "wchk" }, [el("input", { type: "checkbox" }), el("span", { text: LG.log })]);
    lg.firstChild.addEventListener("change", function () { S.log = this.checked; show(S.sel); });
    var cur = null, T0 = 0;
    var list = el("ul", { class: "wic__list" }), pic = el("div", { class: "wic__pic" }), name = el("h3", { class: "wdonut__h" }), dec = el("p", { class: "wdonut__t" });
    var stQ = stat(W.cap, "m³/h"), stP = stat(W.max, "bar"), stK = stat(W.pistons), msg = el("ul", { class: "wmsg" });
    function show(i) {
      var m = ICM[i]; S.sel = i; pic.innerHTML = ""; cur = icScene(m, W.lift, { log: S.log }); pic.appendChild(cur); name.textContent = m[0];
      logMsg.hidden = !S.log;
      dec.textContent = (m[0].indexOf("/") > 0 ? W.decBig : W.decSmall).replace("{v}", num(m[1] + m[2])).replace("{h}", m[1]).replace("{r}", m[2]).replace("{z}", m[3]) + (m[8] ? " " + W.ccp : "");
      stQ.set(num(m[4], 1)); stP.set(num(m[5])); stK.set(m[7] === 2 ? W.two : W.one);
      [].forEach.call(list.children, function (li) { var b = li.firstChild; b.classList.toggle("is-on", Number(b.getAttribute("data-i")) === i); });
    }
    function pick() {
      var ok = []; ICM.forEach(function (m, i) { if (m[4] >= S.q && m[5] >= S.p && (!S.dbl || m[7] === 2) && (!S.pu || m[8]) && (S.pu || !m[8])) ok.push(i); });
      ok.sort(function (x, y) { return (ICM[x][1] + ICM[x][2]) - (ICM[y][1] + ICM[y][2]) || ICM[x][6] - ICM[y][6] || x - y; });
      list.innerHTML = ""; msg.innerHTML = "";
      if (!ok.length) { msg.appendChild(el("li", { class: "wmsg__warn", text: W.none })); return; }
      ok.slice(0, 5).forEach(function (i, k) { var b = el("button", { type: "button", class: "wic__b", "data-i": i }, [el("strong", { text: ICM[i][0] }), el("span", { text: num(ICM[i][4], 1) + " m³/h · " + ICM[i][5] + " bar" + (k === 0 ? " · " + W.best : "") })]); b.addEventListener("click", function () { show(i); }); list.appendChild(el("li", {}, [b])); });
      msg.appendChild(el("li", { class: "wmsg__info", text: W.note }));
      show(ok[0]);
    }
    var logMsg = el("p", { class: "wic__log", text: LG.on }); logMsg.hidden = true;
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [sQ.box, sP.box, dbl, pu, lg, el("p", { class: "vmix__h", text: W.matches }), list]), el("div", { class: "wgt__out" }, [pic, name, dec, logMsg, el("div", { class: "stats" }, [stQ.box, stP.box, stK.box]), msg])]));
    app.appendChild(how(W.how));
    pick();
    playWhenVisible(pic, function (dt) { T0 += dt; if (cur && cur.__step) cur.__step(T0); });
  }

  // ---------- 20. colloidal versus paddle mixing ----------
  function mixScene(type, t, labels) {
    var a = art(300, 250, "wchart wmix"), r = seeded(17), d = type ? 1 - Math.exp(-t / 0.6) : 0.35 * (1 - Math.exp(-t / 2.5)), bleed = type ? 1.5 + 2 * (1 - d) : 4 + 7 * (1 - d), i;
    a.rect(0, 0, 300, 250, a.grad([[0, "#fff7ea"], [1, "#f4ead9"]]), { ns: true });
    var top = 40, bot = 226, bl = top + 8 + bleed * 6;
    a.path("M60," + top + " L60," + bot + " Q60,236 72,236 L228,236 Q240,236 240," + bot + " L240," + top, "rgba(255,255,255,.6)", { ns: true });
    a.rect(62, bl, 176, bot - bl + 8, a.grad([[0, "#b9b1a5"], [1, "#958c80"]]), { ns: true });
    a.rect(62, top + 8, 176, bl - top - 8, "rgba(143,191,224,.45)", { ns: true });
    var centers = []; for (i = 0; i < 9; i++) centers.push([80 + r() * 140, bl + 12 + r() * (bot - bl - 20)]);
    for (i = 0; i < 90; i++) { var c = centers[i % 9], spread = 5 + d * 70, ang = r() * 6.283, rr = r() * spread, x = Math.max(66, Math.min(234, c[0] + Math.cos(ang) * rr)), y = Math.max(bl + 4, Math.min(bot + 4, c[1] + Math.sin(ang) * rr * 0.8)); a.circle(x, y, 1.6 + r() * 1.4, "#4a4446", { ns: true, opacity: 0.85 }); }
    a.path("M60," + top + " L60," + bot + " Q60,236 72,236 L228,236 Q240,236 240," + bot + " L240," + top, "none", { stroke: C.dark, sw: 2 });
    for (i = 0; i < 4; i++) a.line(240, 80 + i * 36, 248, 80 + i * 36, C.dark, 1);
    if (labels) { var t1 = a.add("text", { x: 150, y: top - 6, "text-anchor": "middle", class: "wtxt" }); t1.textContent = "↓ " + labels; }
    return { svg: a.svg, d: d, bleed: bleed };
  }
  function buildMix(app) {
    var W = T.more2.mix, S = { type: 1, t: 2 };
    var sT = segmented(W.type, W.types, 1, function (i) { S.type = i; draw(); });
    var sM = slider(W.time, 0.5, 5, 0.5, 2, function (v) { return num(v, 1) + " min"; }, function (v) { S.t = v; draw(); });
    var pic = el("div", { class: "wmix__pic" }), big = el("p", { class: "wgt__big", "aria-live": "polite" }), stD = stat(W.disp, "%"), stB = stat(W.bleed, "%"), msg = el("ul", { class: "wmsg" });
    function draw() {
      var res = mixScene(S.type, S.t, W.water); pic.innerHTML = ""; pic.appendChild(res.svg);
      stD.set(num(res.d * 100)); stB.set(num(res.bleed, 1)); stB.box.setAttribute("data-tone", res.bleed < 3 ? "good" : res.bleed < 6 ? "ok" : "bad");
      big.textContent = S.type ? W.colloid : W.paddle;
      msg.innerHTML = ""; msg.appendChild(el("li", { class: "wmsg__info", text: W.why }));
    }
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [sT.box, sM.box, el("div", { class: "stats" }, [stD.box, stB.box])]), el("div", { class: "wgt__out" }, [big, pic, msg])]));
    app.appendChild(how(W.how));
    draw();
  }

  // ---------- 21. data logging during grouting ----------
  function simLog(rock, Pstop, Vmax, Qp) {
    var Vc = [40, 150, 600][rock], dt = 0.1, t = 0, V = 0, Q = Qp, P = 2, tp = -1, out = [], why = 0;
    while (t < 90) {
      var Prock = 2 + 80 * (1 - Math.exp(-V / Vc));
      if (tp < 0 && Prock >= Pstop) tp = t;
      if (tp >= 0) { P = Pstop; Q = Qp * Math.exp(-(t - tp) / Math.max(0.6, Vc / Qp * 0.35)); } else { P = Prock; Q = Qp; }
      out.push([t, P, Q, V]);
      if (V >= Vmax) { why = 1; break; }
      if (tp >= 0 && Q < 1.5) { why = 2; break; }
      V += Q * dt; t += dt;
    }
    return { pts: out, why: why, t: t, V: V };
  }
  function logChart(res, Pstop, labels) {
    var a = art(460, 240, "wchart wlog"), X0 = 44, X1 = 420, Y0 = 16, Y1 = 196, T = Math.max(4, Math.ceil(res.t / 2) * 2), i;
    a.rect(0, 0, 460, 240, "#fff", { ns: true });
    function x(t) { return X0 + t / T * (X1 - X0); } function yp(p) { return Y1 - p / 80 * (Y1 - Y0); } function yq(q) { return Y1 - q / 50 * (Y1 - Y0); }
    for (i = 0; i <= 4; i++) { var yy = Y0 + i * (Y1 - Y0) / 4; a.line(X0, yy, X1, yy, "#eee9e2", 1); var tl = a.add("text", { x: X0 - 6, y: yy + 3, "text-anchor": "end", class: "wtxt wlog__p" }); tl.textContent = 80 - i * 20; var tr = a.add("text", { x: X1 + 6, y: yy + 3, class: "wtxt wlog__q" }); tr.textContent = 50 - i * 12.5; }
    for (i = 0; i <= 4; i++) { var tx = a.add("text", { x: x(T * i / 4), y: Y1 + 14, "text-anchor": "middle", class: "wtxt" }); tx.textContent = num(T * i / 4, T < 8 ? 1 : 0); }
    a.line(X0, yp(Pstop), X1, yp(Pstop), C.orange, 1, { "stroke-dasharray": "4 4", opacity: 0.7 });
    var pp = res.pts.map(function (p) { return x(p[0]).toFixed(1) + "," + yp(p[1]).toFixed(1); }), qq = res.pts.map(function (p) { return x(p[0]).toFixed(1) + "," + yq(p[2]).toFixed(1); });
    a.add("polyline", { points: qq.join(" "), fill: "none", stroke: "#5b9cc6", "stroke-width": 2.2, "stroke-linejoin": "round" });
    a.add("polyline", { points: pp.join(" "), fill: "none", stroke: C.orange, "stroke-width": 2.4, "stroke-linejoin": "round" });
    if (labels) { var l1 = a.add("text", { x: X0, y: 10, class: "wtxt wlog__p" }); l1.textContent = labels[0]; var l2 = a.add("text", { x: X1, y: 10, "text-anchor": "end", class: "wtxt wlog__q" }); l2.textContent = labels[1]; var l3 = a.add("text", { x: (X0 + X1) / 2, y: 234, "text-anchor": "middle", class: "wtxt" }); l3.textContent = labels[2]; }
    return a.svg;
  }
  function buildLog(app) {
    var W = T.more2.log, S = { rock: 1, P: 30, V: 200, Q: 20 };
    var sR = segmented(W.rock, W.rocks, 1, function (i) { S.rock = i; draw(); });
    var sP = slider(W.pstop, 10, 60, 1, 30, function (v) { return num(v) + " bar"; }, function (v) { S.P = v; draw(); });
    var sV = slider(W.vmax, 50, 500, 10, 200, function (v) { return num(v) + " l"; }, function (v) { S.V = v; draw(); });
    var sQ = slider(W.flow, 5, 40, 1, 20, function (v) { return num(v) + " l/min"; }, function (v) { S.Q = v; draw(); });
    var pic = el("div", { class: "wlog__pic" }), big = el("p", { class: "wgt__big", "aria-live": "polite" }), stV = stat(W.vol, "l"), stT = stat(W.time, "min"), stW = stat(W.reason), msg = el("ul", { class: "wmsg" });
    function draw() {
      var res = simLog(S.rock, S.P, S.V, S.Q); pic.innerHTML = ""; pic.appendChild(logChart(res, S.P, W.axes));
      stV.set(num(res.V)); stT.set(num(res.t, 1)); stW.set(res.why === 1 ? W.byVol : res.why === 2 ? W.byPress : W.byTime);
      big.textContent = res.why === 1 ? W.sVol : res.why === 2 ? W.sPress : W.sTime;
      msg.innerHTML = ""; msg.appendChild(el("li", { class: "wmsg__info", text: W.logger }));
    }
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [sR.box, sQ.box, sP.box, sV.box]), el("div", { class: "wgt__out" }, [big, pic, el("div", { class: "stats" }, [stV.box, stT.box, stW.box]), msg])]));
    app.appendChild(how(W.how));
    draw();
  }

  // =====================================================================================================
  // r29: calculators you type into, and four new scenes (mixing by bucket, sealing rock, jet grouting, drying)
  // =====================================================================================================
  var TX3 = {
    sv: {
      calc: { modes: ["Räkna ut vct", "Hur mycket vatten?", "Hur mycket cement?"], cem: "Cement", water: "Vatten", target: "Önskat vct", kg: "kg", l: "liter", wet: "Räkna med fukten i sanden", sand: "Sand", moist: "Fukthalt i sanden", pct: "%",
        res: ["Vattencementtal", "Så mycket vatten", "Så mycket cement"], calc: "Uträkningen", bucket: "hinkar à 10 liter", bag: "säckar à 25 kg", strength: "Hållfasthet ungefär", mpa: "MPa efter 28 dygn", sandW: "vatten från sanden",
        zones: ["Mycket stark", "Bra utomhus", "Inomhus", "För vattnig"], v: ["Mycket tät och stark, men trög att gjuta. Räkna med flyttillsats.", "Ett bra vct för betong utomhus, även med frost.", "Fungerar inomhus och för enklare jobb, men är porösare.", "För mycket vatten. Betongen blir svag och porös och kan separera."],
        zero: "Fyll i cementmängden, den måste vara större än noll.", odd: "Kontrollera siffrorna, vct brukar ligga mellan 0,35 och 0,80.", note: "Tillsatsmedel som flyttillsats räknas inte som vatten. Fritt vatten i sand och sten gör det.",
        how: "vct = vatten (kg) ÷ cement (kg). En liter vatten väger ett kilo. Med fuktig sand räknas fukten in: vatten från sanden = sandens vikt × fukthalt. Hållfastheten följer en vanlig tumregel (ungefär 163 × e^(−2,71 × vct) MPa för ett normalt cement) och ska bara ses som en fingervisning." },
      rec: { use: "Vad ska du gjuta?", uses: ["Betong, stark (1 : 2 : 3)", "Betong, allround (1 : 2,5 : 3,5)", "Cementbruk (1 : 3)"], by: "Jag utgår från", bys: ["Volymen", "Antal säckar cement"], vol: "Hur mycket färdig betong?", bags: "Säckar cement à 25 kg", l: "liter",
        quick: "Snabbval", quicks: [["Stolpfundament", 30], ["Trappsteg", 120], ["Liten platta", 1000]], cement: "Cement", sand: "Sand 0 till 8 mm", stone: "Sten 8 till 16 mm", water: "Vatten", buckets: "hinkar", kgL: "kg", total: "Det blir ungefär", out: "liter färdig betong",
        meas: "Mät med samma hink, 10 liter, för allt", order: ["Häll i hälften av vattnet i blandaren.", "Tillsätt sten, sedan cement och sand.", "Fyll på resten av vattnet lite i taget tills betongen är jämn och lagom trögflytande.", "Blanda i några minuter och använd betongen inom en timme."],
        vct: "vct ungefär", big: "Behöver du mer än ungefär en kubikmeter lönar det sig nästan alltid att beställa färdigblandad betong.",
        how: "Delarna är räknade i volym. Torra material packar ihop när de blandas, så det går åt ungefär 1,5 liter torrt material per liter färdig betong (1,3 för bruk). Cement räknas som 1,3 kg per liter, sand 1,55 och sten 1,5. Vattnet är cementets vikt × vct. Sanden är oftast fuktig, så börja med lite mindre vatten." },
      tat: { rock: "Hur sprickigt är berget?", rocks: ["Lite sprickigt", "Normalt", "Mycket sprickigt"], drill: "1. Borra injekteringshål", grout: "2. Injektera", again: "Börja om", leak: "Inläckage", unit: "liter per minut och 100 m tunnel",
        s0: "Vatten tränger in genom sprickorna i berget och droppar in i tunneln. Börja med att borra en solfjäder av hål runt tunneln.", s1: "Hålen är borrade och korsar sprickorna. Nu pumpas injekteringsbruk in under tryck.", s2: "Bruket sprider sig ut i sprickorna medan det pumpas.", s3: "Sprickorna är fyllda och bruket har hårdnat. Inläckaget har minskat kraftigt.",
        how: "Illustration av principen. Hålen borras i en solfjäder runt tunneln, ofta 15 till 25 meter långa, och bruket pumpas in tills ett stopptryck eller en största volym nås. Hur mycket inläckaget minskar beror på berget, bruket och hur tätt hålen sitter. Värdena för inläckage är exempel." },
      jet: { method: "Metod", methods: ["Enkel (bruk)", "Dubbel (bruk och luft)", "Trippel (vatten, luft och bruk)"], soil: "Jordart", soils: ["Sand och grus", "Silt", "Lera"], len: "Pelarens längd", m: "m", start: "Starta", again: "Gör en till",
        dia: "Diameter, ungefär", per: "Volym per meter", tot: "Jordcement totalt", m3: "m³", p0: "Riggen står klar. Tryck på Starta.", p1: "Borrstången borras ner till rätt djup.", p2: "Strålen skär upp jorden medan stången roterar och dras upp långsamt. Jorden blandas med bruket.", p3: "Klart. Pelaren av jordcement hårdnar under de närmaste veckorna.",
        how: "Typiska diametrar enligt erfarenhet: enkel metod 0,5 till 0,8 m, dubbel 1,0 till 1,5 m och trippel 1,3 till 2,0 m. Sand ger störst pelare och lera minst. Den verkliga storleken provas fram med provpelare på platsen. Volym per meter = π × diameter² ÷ 4." },
      tork: { th: "Plattans tjocklek", side: "Torkar åt", sides: ["Ett håll (uppåt)", "Två håll"], vct: "Betongens vct", vcts: ["0,40 (självuttorkande)", "0,55 (vanlig)", "0,70 (vattnig)"], clim: "Klimat under torkningen", clims: ["Kallt och fuktigt, 10 °C", "Normalt, 20 °C och 50 % RF", "Varmt och avfuktat, 25 °C"],
        factor: "Torktid jämfört med referensplattan", times: "gånger", depth: "Mät fukten på djupet", mm: "mm", ref: "Referensplatta: 100 mm, torkar uppåt, vct 0,55, 20 °C.", refT: "Referensplattan behöver ofta flera månader innan den är torr nog för ett tätt golv.",
        bar1: "Referens", bar2: "Din platta", deep: "Mätdjupet är 40 procent av tjockleken när plattan torkar åt ett håll och 20 procent när den torkar åt två.", fast: "Betong med lågt vct torkar till stor del inifrån, eftersom cementet själv förbrukar vattnet.",
        how: "Förenklad modell för att visa sambanden. Torktiden växer ungefär med kvadraten på tjockleken, så dubbla tjockleken ger runt fyra gånger så lång tid. Torkar plattan åt två håll halveras den verksamma tjockleken. Faktorerna för vct och klimat är ungefärliga. Använd fuktmätning och beräkningsprogram, till exempel TorkaS, i verkliga projekt." }
    },
    en: {
      calc: { modes: ["Work out w/c", "How much water?", "How much cement?"], cem: "Cement", water: "Water", target: "Target w/c", kg: "kg", l: "litres", wet: "Include the moisture in the sand", sand: "Sand", moist: "Moisture in the sand", pct: "%",
        res: ["Water/cement ratio", "Water needed", "Cement needed"], calc: "The sum", bucket: "buckets of 10 litres", bag: "bags of 25 kg", strength: "Strength roughly", mpa: "MPa after 28 days", sandW: "water from the sand",
        zones: ["Very strong", "Good outdoors", "Indoors", "Too wet"], v: ["Very dense and strong, but stiff to place. Expect to need a plasticiser.", "A good w/c for outdoor concrete, frost included.", "Fine indoors and for simple jobs, but more porous.", "Too much water. The concrete will be weak and porous and may separate."],
        zero: "Enter the amount of cement, it has to be more than zero.", odd: "Check the numbers, w/c is usually between 0.35 and 0.80.", note: "Admixtures such as plasticisers do not count as water. Free water in sand and stone does.",
        how: "w/c = water (kg) ÷ cement (kg). One litre of water weighs one kilo. With damp sand the moisture is included: water from the sand = weight of sand × moisture content. Strength follows a common rule of thumb (about 163 × e^(−2.71 × w/c) MPa for an ordinary cement) and is only a rough guide." },
      rec: { use: "What are you casting?", uses: ["Concrete, strong (1 : 2 : 3)", "Concrete, general (1 : 2.5 : 3.5)", "Cement mortar (1 : 3)"], by: "Start from", bys: ["The volume", "Number of cement bags"], vol: "How much finished concrete?", bags: "Bags of cement, 25 kg", l: "litres",
        quick: "Quick pick", quicks: [["Post footing", 30], ["Step", 120], ["Small slab", 1000]], cement: "Cement", sand: "Sand 0 to 8 mm", stone: "Stone 8 to 16 mm", water: "Water", buckets: "buckets", kgL: "kg", total: "That makes about", out: "litres of finished concrete",
        meas: "Measure everything with the same 10 litre bucket", order: ["Pour half of the water into the mixer.", "Add the stone, then the cement and the sand.", "Add the rest of the water a little at a time until the concrete is even and stiff but workable.", "Mix for a few minutes and use the concrete within an hour."],
        vct: "w/c roughly", big: "If you need more than about one cubic metre, ordering ready-mixed concrete almost always pays off.",
        how: "The parts are by volume. Dry materials pack together when mixed, so it takes about 1.5 litres of dry material per litre of finished concrete (1.3 for mortar). Cement is counted at 1.3 kg per litre, sand 1.55 and stone 1.5. The water is the weight of cement × w/c. Sand is usually damp, so start with a little less water." },
      tat: { rock: "How fractured is the rock?", rocks: ["Slightly fractured", "Normal", "Heavily fractured"], drill: "1. Drill grout holes", grout: "2. Grout", again: "Start again", leak: "Water inflow", unit: "litres per minute and 100 m of tunnel",
        s0: "Water seeps through the fractures in the rock and drips into the tunnel. Start by drilling a fan of holes around the tunnel.", s1: "The holes are drilled and cross the fractures. Now grout is pumped in under pressure.", s2: "The grout spreads into the fractures while it is pumped.", s3: "The fractures are filled and the grout has hardened. The inflow has dropped sharply.",
        how: "An illustration of the principle. The holes are drilled in a fan around the tunnel, often 15 to 25 metres long, and grout is pumped in until a stop pressure or a largest volume is reached. How much the inflow drops depends on the rock, the grout and how close the holes are. The inflow values are examples." },
      jet: { method: "Method", methods: ["Single (grout)", "Double (grout and air)", "Triple (water, air and grout)"], soil: "Soil", soils: ["Sand and gravel", "Silt", "Clay"], len: "Column length", m: "m", start: "Start", again: "Make another",
        dia: "Diameter, roughly", per: "Volume per metre", tot: "Soilcrete in total", m3: "m³", p0: "The rig is ready. Press Start.", p1: "The rod is drilled down to the right depth.", p2: "The jet cuts the soil while the rod rotates and is slowly pulled up. The soil is mixed with the grout.", p3: "Done. The soilcrete column hardens over the coming weeks.",
        how: "Typical diameters from experience: single fluid 0.5 to 0.8 m, double 1.0 to 1.5 m and triple 1.3 to 2.0 m. Sand gives the largest columns and clay the smallest. The real size is found with trial columns on site. Volume per metre = π × diameter² ÷ 4." },
      tork: { th: "Slab thickness", side: "Dries towards", sides: ["One side (up)", "Both sides"], vct: "W/c of the concrete", vcts: ["0.40 (self-desiccating)", "0.55 (ordinary)", "0.70 (wet)"], clim: "Climate while drying", clims: ["Cold and damp, 10 °C", "Normal, 20 °C and 50 % RH", "Warm and dehumidified, 25 °C"],
        factor: "Drying time compared with the reference slab", times: "times", depth: "Measure the moisture at a depth of", mm: "mm", ref: "Reference slab: 100 mm, dries upwards, w/c 0.55, 20 °C.", refT: "The reference slab often needs several months before it is dry enough for a tight floor covering.",
        bar1: "Reference", bar2: "Your slab", deep: "The measuring depth is 40 percent of the thickness when the slab dries one way and 20 percent when it dries both ways.", fast: "Concrete with a low w/c largely dries from within, because the cement itself uses up the water.",
        how: "A simplified model to show the relationships. Drying time grows roughly with the square of the thickness, so double the thickness gives around four times the time. If the slab dries both ways, the effective thickness is halved. The factors for w/c and climate are approximate. Use moisture measurement and calculation software such as TorkaS on real projects." }
    }
  };
  var T3 = TX3[LANG];
  function parseNum(s) { var v = parseFloat(String(s).replace(/\s/g, "").replace(",", ".")); return isFinite(v) ? v : NaN; }
  function fmtIn(v) { return LANG === "sv" ? String(v).replace(".", ",") : String(v); }
  function numIn(label, val, unit, onChange) {
    var id = "wg" + (++uid), inp = el("input", { type: "text", inputmode: "decimal", id: id, class: "wn__i", value: fmtIn(val), autocomplete: "off", spellcheck: "false" });
    var box = el("div", { class: "wc wn" }, [el("label", { class: "wc__l", for: id, text: label }), el("div", { class: "wn__row" }, [inp, unit ? el("span", { class: "wn__u", text: unit }) : null])]);
    inp.addEventListener("input", function () { var v = parseNum(inp.value); if (isFinite(v) && v >= 0) { inp.removeAttribute("aria-invalid"); onChange(v); } else inp.setAttribute("aria-invalid", "true"); });
    inp.addEventListener("focus", function () { inp.select(); });
    return { box: box, input: inp, set: function (v) { inp.value = fmtIn(v); } };
  }
  function playWhenVisible(node, frame) {
    var raf = 0, last = 0, on = false;
    function loop(t) { var dt = Math.min(60, t - (last || t)); last = t; frame(dt); if (on) raf = requestAnimationFrame(loop); }
    function start() { if (on || REDUCE) return; on = true; last = 0; raf = requestAnimationFrame(loop); }
    function stop() { on = false; cancelAnimationFrame(raf); }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { if (e[0].isIntersecting) start(); else stop(); }).observe(node); else start();
    return { start: start, stop: stop };
  }

  // ---------- vct calculator: type your own numbers ----------
  function buildVctCalc(app) {
    var W = T3.calc, S = { m: 0, c: 360, w: 180, t: 0.5, wet: false, s: 800, mo: 4 };
    var modeSeg = segmented("", W.modes, 0, function (i) { S.m = i; layout(); draw(); });
    var iC = numIn(W.cem, 360, W.kg, function (v) { S.c = v; draw(); }), iW = numIn(W.water, 180, W.l, function (v) { S.w = v; draw(); }), iT = numIn(W.target, "0.50", "", function (v) { S.t = v; draw(); });
    var wetCb = el("input", { type: "checkbox", id: "wg" + (++uid) }), wetBox = el("label", { class: "wck", for: wetCb.id }, [wetCb, el("span", { text: W.wet })]);
    var iS = numIn(W.sand, 800, W.kg, function (v) { S.s = v; draw(); }), iM = numIn(W.moist, 4, W.pct, function (v) { S.mo = v; draw(); });
    var wetGrp = el("div", { class: "wn__wet" }, [iS.box, iM.box]);
    wetCb.addEventListener("change", function () { S.wet = wetCb.checked; wetGrp.hidden = !S.wet; draw(); }); wetGrp.hidden = true;
    var resL = el("span", { class: "wcalc__l" }), resV = el("strong", { class: "wcalc__v" }), resU = el("span", { class: "wcalc__u" }), sum = el("p", { class: "wcalc__sum" });
    var scale = el("div", { class: "wscale", "aria-hidden": "true" }), mark = el("i", { class: "wscale__m" }), verdict = el("p", { class: "wcalc__verdict", "aria-live": "polite" });
    [[0.30, 0.40, "a"], [0.40, 0.55, "b"], [0.55, 0.65, "c"], [0.65, 0.90, "d"]].forEach(function (z, i) { scale.appendChild(el("span", { class: "wscale__z wscale__z--" + z[2], style: "flex:" + Math.round((z[1] - z[0]) * 100), text: W.zones[i] })); });
    scale.appendChild(mark);
    var axis = el("div", { class: "wscale__ax", "aria-hidden": "true" }); [0.3, 0.4, 0.55, 0.65, 0.9].forEach(function (v) { axis.appendChild(el("span", { style: "left:" + ((v - 0.3) / 0.6 * 100) + "%", text: num(v, 2) })); });
    var stS = stat(W.strength, W.mpa), extra = el("p", { class: "wcalc__extra" }), msg = el("ul", { class: "wmsg" });
    function layout() { iW.box.hidden = S.m === 2 ? false : S.m === 1; iT.box.hidden = S.m === 0; iC.box.hidden = S.m === 2; }
    function draw() {
      var sandW = S.wet ? S.s * S.mo / 100 : 0, v, line;
      msg.innerHTML = ""; extra.textContent = "";
      if (S.m === 0) {
        if (!(S.c > 0)) { resV.textContent = "–"; sum.textContent = ""; msg.appendChild(el("li", { class: "wmsg__warn", text: W.zero })); return; }
        v = (S.w + sandW) / S.c; resL.textContent = W.res[0]; resV.textContent = num(v, 2); resU.textContent = "";
        line = "vct = " + (sandW ? "(" + num(S.w) + " + " + num(sandW, 1) + ")" : num(S.w)) + " ÷ " + num(S.c) + " = " + num(v, 2);
      } else if (S.m === 1) {
        v = S.t; var tw = S.c * S.t, add = Math.max(0, tw - sandW); resL.textContent = W.res[1]; resV.textContent = num(add, add < 20 ? 1 : 0); resU.textContent = W.l;
        line = (LANG === "sv" ? "vatten = " : "water = ") + num(S.c) + " × " + num(S.t, 2) + " = " + num(tw, 1) + (sandW ? " − " + num(sandW, 1) + " (" + W.sandW + ") = " + num(add, 1) : "") + " " + W.l;
        extra.textContent = "= " + num(add / 10, 1) + " " + W.bucket;
      } else {
        v = S.t; if (!(S.t > 0)) { resV.textContent = "–"; return; }
        var cem = (S.w + sandW) / S.t; resL.textContent = W.res[2]; resV.textContent = num(cem); resU.textContent = W.kg;
        line = "cement = " + (sandW ? "(" + num(S.w) + " + " + num(sandW, 1) + ")" : num(S.w)) + " ÷ " + num(S.t, 2) + " = " + num(cem) + " kg";
        extra.textContent = "= " + num(cem / 25, 1) + " " + W.bag;
      }
      sum.textContent = line;
      var p = Math.max(0, Math.min(1, (v - 0.3) / 0.6)); mark.style.left = (p * 100) + "%";
      var z = v < 0.40 ? 0 : v < 0.55 ? 1 : v <= 0.65 ? 2 : 3; verdict.textContent = W.v[z]; verdict.setAttribute("data-z", z);
      stS.set(num(162.6 * Math.exp(-2.71 * v)));
      if (v < 0.3 || v > 0.9) msg.appendChild(el("li", { class: "wmsg__warn", text: W.odd }));
      msg.appendChild(el("li", { class: "wmsg__info", text: W.note }));
    }
    var ctl = el("div", { class: "wgt__ctl" }, [iC.box, iW.box, iT.box, wetBox, wetGrp]);
    var out = el("div", { class: "wgt__out wcalc" }, [el("div", { class: "wcalc__res" }, [resL, el("div", {}, [resV, resU])]), extra, el("p", { class: "wcalc__cap", text: W.calc }), sum, scale, axis, verdict, el("div", { class: "stats" }, [stS.box]), msg]);
    app.appendChild(modeSeg.box);
    app.appendChild(el("div", { class: "wgt__grid" }, [ctl, out]));
    app.appendChild(how(W.how));
    layout(); draw();
  }

  // ---------- mix concrete yourself: measured in buckets ----------
  function bucketRow(n, cls) {
    var row = el("div", { class: "wbk__row" }), whole = Math.floor(n), part = n - whole, show = Math.min(whole, 24), i;
    for (i = 0; i < show; i++) row.appendChild(el("i", { class: "wbk__b " + cls, style: "animation-delay:" + (i * 25) + "ms" }));
    if (whole <= 24 && part > 0.05) row.appendChild(el("i", { class: "wbk__b wbk__b--part " + cls, style: "--f:" + part.toFixed(2) }));
    if (whole > 24) row.appendChild(el("span", { class: "wbags__more", text: "+" + num(whole - 24) }));
    return row;
  }
  function buildRecept(app) {
    var W = T3.rec, S = { u: 0, by: 0, V: 120, bags: 4 }, R = [[1, 2, 3], [1, 2.5, 3.5], [1, 3, 0]], VCT = [0.5, 0.55, 0.6], DRY = [1.54, 1.54, 1.33];
    var useSel = select(W.use, W.uses, 0, function (i) { S.u = i; draw(); });
    var bySeg = segmented(W.by, W.bys, 0, function (i) { S.by = i; iV.box.hidden = i === 1; quick.hidden = i === 1; iB.box.hidden = i === 0; draw(); });
    var iV = numIn(W.vol, 120, W.l, function (v) { S.V = v; draw(); }), iB = numIn(W.bags, 4, "", function (v) { S.bags = v; draw(); }); iB.box.hidden = true;
    var quick = el("div", { class: "wchips" }, [el("span", { class: "wc__l", text: W.quick })]);
    W.quicks.forEach(function (q) { var b = el("button", { type: "button", class: "wchip", text: q[0] + " · " + num(q[1]) + " l" }); b.addEventListener("click", function () { S.V = q[1]; iV.set(q[1]); draw(); }); quick.appendChild(b); });
    var head = el("p", { class: "wgt__big", "aria-live": "polite" }), table = el("div", { class: "wbk" }), msg = el("ul", { class: "wmsg" });
    var steps = el("ol", { class: "wsteps" }); W.order.forEach(function (t) { steps.appendChild(el("li", { text: t })); });
    function draw() {
      var r = R[S.u], parts = r[0] + r[1] + r[2], cemL, V;
      if (S.by === 0) { V = S.V; cemL = V * DRY[S.u] / parts * r[0]; } else { cemL = S.bags * 25 / 1.3; V = cemL * parts / r[0] / DRY[S.u]; }
      var sandL = cemL * r[1], stoneL = cemL * r[2], cemKg = cemL * 1.3, waterL = cemKg * VCT[S.u];
      head.textContent = W.total + " " + num(V) + " " + W.out + (S.by === 1 ? "" : "") + ".";
      table.innerHTML = "";
      [[W.cement, cemL, cemKg, "wbk__b--c", num(cemKg / 25, 1) + " " + (LANG === "sv" ? "säckar" : "bags")], [W.sand, sandL, sandL * 1.55, "wbk__b--s"], [W.stone, stoneL, stoneL * 1.5, "wbk__b--g"], [W.water, waterL, waterL, "wbk__b--w", null, W.l]].forEach(function (it) {
        if (it[1] <= 0) return;
        table.appendChild(el("div", { class: "wbk__item" }, [el("div", { class: "wbk__h" }, [el("strong", { text: it[0] }), el("span", { text: num(it[1] / 10, 1) + " " + W.buckets + " · " + num(it[2]) + " " + (it[5] || W.kgL) + (it[4] ? " · " + it[4] : "") })]), bucketRow(it[1] / 10, it[3])]));
      });
      msg.innerHTML = ""; msg.appendChild(el("li", { class: "wmsg__info", text: W.vct + " " + num(VCT[S.u], 2) + ". " + W.meas + "." }));
      if (V > 900) msg.appendChild(el("li", { class: "wmsg__ok", text: W.big }));
    }
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [useSel.box, bySeg.box, iV.box, quick, iB.box]), el("div", { class: "wgt__out" }, [head, table, msg, steps])]));
    app.appendChild(how(W.how));
    draw();
  }

  // ---------- sealing rock: what grouting does. Holes are grouted one at a time through a packer on a hose, in stages from the bottom
  // of the hole outwards; as the pressure builds the packer and hose are pushed back (kick), then the packer is pulled back a stage ----------
  function tatScene(level) {
    var a = art(440, 270, "wchart wtat"), r = seeded(7 + level * 13), cx = 220, cy = 196, R0 = 66, i, nH = 9, HL = 150;
    a.rect(0, 0, 440, 270, a.grad([[0, "#d9cdbb"], [1, "#b9a993"]]), { ns: true });
    a.speckle(0, 0, 440, 270, 260, 31, ["#a39079", "#e6dccd", "#8f7d68"], 2.2);
    var holes = [];
    for (i = 0; i < nH; i++) { var ang = Math.PI * (1.06 + i / (nH - 1) * 0.88); holes.push({ ang: ang, sx: cx + Math.cos(ang) * (R0 + 2), sy: cy + Math.sin(ang) * (R0 + 2), dx: Math.cos(ang), dy: Math.sin(ang) }); }
    var nF = [4, 7, 11][level], fr = [], g = a.group({}), gg = a.group({}), hg = a.group({}), dropsG;
    for (i = 0; i < nF; i++) {
      var th = Math.PI * (1.08 + r() * 0.84), px = cx + Math.cos(th) * R0, py = cy + Math.sin(th) * R0, dir = th + (r() - 0.5) * 1.6, L1 = 120 + r() * 160;
      var ax = px + Math.cos(dir) * L1, ay = py + Math.sin(dir) * L1, mx = (px + ax) / 2 + (r() - 0.5) * 30, my = (py + ay) / 2 + (r() - 0.5) * 30;
      var d1 = "M" + px.toFixed(1) + "," + py.toFixed(1) + " Q" + mx.toFixed(1) + "," + my.toFixed(1) + " " + ax.toFixed(1) + "," + ay.toFixed(1);
      a.path(d1, "none", { stroke: "#6e5f50", sw: 1.4 + r() * 1.2 }, g);
      var w1 = a.path(d1, "none", { stroke: "#6fa3c7", sw: 2.2, opacity: 0.75, "stroke-linecap": "round" }, g);
      var g1 = a.path(d1, "none", { stroke: "#8b8f92", sw: 4.2, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1 }, gg);
      var best = 0, bd = 9; holes.forEach(function (h, k) { var dd = Math.abs(h.ang - th); if (dd < bd) { bd = dd; best = k; } });
      fr.push({ x: px, y: py, wat: w1, gr: g1, k: 0.5 + r() * 0.5, ph: r(), hole: best });
    }
    var tun = "M" + (cx - R0) + "," + cy + " A" + R0 + "," + R0 + " 0 0 1 " + (cx + R0) + "," + cy + " L" + (cx + R0) + ",270 L" + (cx - R0) + ",270 Z";
    a.path(tun, "#efe6d8", { stroke: "#9a8b78", sw: 5 });
    a.path(tun, a.grad([[0, "#3d3633"], [1, "#2b2523"]]), { ns: true });
    a.rect(cx - R0 + 6, 252, 2 * R0 - 12, 18, "#4a4240", { ns: true });
    var pool = a.ellipse(cx, 251, 40, 3, "#6fa3c7", { ns: true, opacity: 0 });
    dropsG = a.group({});
    holes.forEach(function (h) { h.el = a.line(h.sx, h.sy, h.sx, h.sy, "#2d2a2b", 2.4, {}, hg); h.fill = a.line(h.sx, h.sy, h.sx, h.sy, "#8b8f92", 3.2, { opacity: 0 }, hg); });
    // grout plant on the tunnel floor, the hose and the packer
    a.rect(cx - 56, 234, 34, 18, a.grad([[0, "#ffd84a"], [1, "#e0a600"]], true), { sw: 1.2 });
    a.rect(cx - 52, 228, 12, 6, "#5b5456", { ns: true });
    var gauge = a.circle(cx - 30, 230, 5, "#fff", { sw: 1 }), needle = a.line(cx - 30, 230, cx - 33, 227, "#d23b2a", 1.2);
    var hose = a.path("", "none", { stroke: C.orange, sw: 3, "stroke-linecap": "round", opacity: 0 });
    var hoseIn = a.line(0, 0, 0, 0, C.orange, 2.2, { opacity: 0 });
    var packer = a.rect(-4, -3, 8, 6, "#1f1b1c", { ns: true, opacity: 0 });
    var drops = fr.map(function (f) { return a.ellipse(f.x, f.y, 1.8, 2.6, "#7fb6dc", { ns: true }, dropsG); });
    var ST = [0.8, 0.5, 0.2];
    function holeProg(gp, k) { return Math.max(0, Math.min(1, gp * nH - k)); }
    return {
      svg: a.svg,
      // holeP: drilling 0..1, gp: grouting 0..1, t: time in ms. Returns what is happening for the caption and the meters.
      set: function (holeP, gp, t) {
        holes.forEach(function (h, k) {
          h.el.setAttribute("x2", (h.sx + h.dx * HL * holeP).toFixed(1)); h.el.setAttribute("y2", (h.sy + h.dy * HL * holeP).toFixed(1));
          var hp = holeProg(gp, k); h.fill.setAttribute("opacity", hp >= 1 ? 1 : 0); h.fill.setAttribute("x2", (h.sx + h.dx * HL).toFixed(1)); h.fill.setAttribute("y2", (h.sy + h.dy * HL).toFixed(1));
        });
        var leakSum = 0;
        fr.forEach(function (f, k) {
          var fp = holeProg(gp, f.hole), gpf = Math.max(0, Math.min(1, fp * 1.3 - f.ph * 0.3));
          f.gr.setAttribute("stroke-dashoffset", (1 - gpf).toFixed(3)); f.wat.setAttribute("opacity", (0.75 * (1 - gpf)).toFixed(2));
          var leak = 1 - gpf, cyc = ((t / 1000) * (0.6 + f.k) + f.ph) % 1, yy = f.y + cyc * (251 - f.y); leakSum += leak;
          drops[k].setAttribute("cy", yy.toFixed(1)); drops[k].setAttribute("cx", (f.x + (cx - f.x) * 0.04 * cyc).toFixed(1)); drops[k].setAttribute("opacity", leak > 0.08 ? (0.9 * leak * (1 - cyc * 0.3)).toFixed(2) : 0);
        });
        pool.setAttribute("opacity", (0.6 * leakSum / fr.length).toFixed(2));
        var info = { hole: -1, stage: -1, p: 0, kick: false, pull: false, leak: leakSum / fr.length };
        var active = gp > 0 && gp < 1 ? Math.min(nH - 1, Math.floor(gp * nH)) : -1;
        if (active < 0) { hose.setAttribute("opacity", 0); hoseIn.setAttribute("opacity", 0); packer.setAttribute("opacity", 0); needle.setAttribute("x2", cx - 33); needle.setAttribute("y2", 227); return info; }
        var h = holes[active], lp = gp * nH - active, st = Math.min(2, Math.floor(lp * 3)), sp = lp * 3 - st;
        // the first part of a stage pulls the packer back from the previous stage; then the pressure builds; near the top it kicks
        var dPrev = st ? ST[st - 1] : ST[0], d = st ? dPrev + (ST[st] - dPrev) * Math.min(1, sp / 0.18) : ST[0];
        var press = sp < 0.18 && st ? 0.15 : Math.min(1, Math.max(0, (sp - 0.18) / 0.62));
        var kick = sp > 0.72 && sp < 0.9 ? Math.sin((sp - 0.72) / 0.18 * Math.PI) : 0;
        var depth = HL * d - kick * 5;
        var pxk = h.sx + h.dx * depth, pyk = h.sy + h.dy * depth;
        var ang = Math.atan2(h.dy, h.dx) * 180 / Math.PI;
        packer.setAttribute("opacity", 1); packer.setAttribute("transform", "translate(" + pxk.toFixed(1) + "," + pyk.toFixed(1) + ") rotate(" + ang.toFixed(1) + ")");
        hoseIn.setAttribute("opacity", 1); hoseIn.setAttribute("x1", h.sx.toFixed(1)); hoseIn.setAttribute("y1", h.sy.toFixed(1)); hoseIn.setAttribute("x2", pxk.toFixed(1)); hoseIn.setAttribute("y2", pyk.toFixed(1));
        var bx = cx - 38, by = 234, mxh = (bx + h.sx) / 2 + h.dx * kick * 10 - 4, myh = Math.max(by, h.sy) - 10 + kick * 12;
        hose.setAttribute("opacity", 1); hose.setAttribute("d", "M" + bx + "," + by + " Q" + mxh.toFixed(1) + "," + myh.toFixed(1) + " " + h.sx.toFixed(1) + "," + h.sy.toFixed(1));
        var na = -2.4 + press * 2.2; needle.setAttribute("x2", (cx - 30 + Math.cos(na) * 4.5).toFixed(1)); needle.setAttribute("y2", (230 + Math.sin(na) * 4.5).toFixed(1));
        info.hole = active; info.stage = st; info.p = press; info.kick = kick > 0.15; info.pull = st > 0 && sp < 0.18; info.depth = d;
        return info;
      }
    };
  }
  function buildTat(app) {
    var W = T3.tat, S = { lv: 1, hole: 0, gr: 0, phase: 0, t: 0 }, Q0 = [6, 18, 45], P0 = 30, sc;
    var X = LANG === "sv"
      ? { press: "Tryck vid packern", bar: "bar", where: "Hål {h} av 9, etapp {e} av 3", pull: "Packern dras tillbaka till nästa etapp, närmare hålets mynning.", build: "Bruket pumpas in genom packern och trycket byggs upp.", kick: "Trycket trycker tillbaka mot packern, och slangen rycker till. Därför måste packern sitta stadigt och slangen vara säkrad." }
      : { press: "Pressure at the packer", bar: "bar", where: "Hole {h} of 9, stage {e} of 3", pull: "The packer is pulled back to the next stage, closer to the collar.", build: "Grout is pumped in through the packer and the pressure builds.", kick: "The pressure pushes back on the packer, and the hose jerks. That is why the packer must sit firmly and the hose must be secured." };
    var box = el("div", { class: "wtat__pic" }), big = el("p", { class: "wgt__big", "aria-live": "polite" }), sub = el("p", { class: "wtat__sub" }), stQ = stat(W.leak, W.unit), stP = stat(X.press, X.bar), meter = el("div", { class: "wmeter" }, [el("i")]), pm = el("div", { class: "wmeter wmeter--p" }, [el("i")]);
    var rockSeg = segmented(W.rock, W.rocks, 1, function (i) { S.lv = i; reset(); });
    var bD = el("button", { type: "button", class: "vbtn", text: W.drill }), bG = el("button", { type: "button", class: "vbtn vbtn--alt", text: W.grout }), bR = el("button", { type: "button", class: "wlink", text: W.again });
    bD.addEventListener("click", function () { if (S.phase === 0) { S.phase = 1; if (REDUCE) { S.hole = 1; S.phase = 2; } kick(); } });
    bG.addEventListener("click", function () { if (S.phase === 2) { S.phase = 3; if (REDUCE) { S.gr = 1; S.phase = 4; } kick(); } });
    bR.addEventListener("click", reset);
    function reset() { S.hole = 0; S.gr = 0; S.phase = 0; box.innerHTML = ""; sc = tatScene(S.lv); box.appendChild(sc.svg); upd(); kick(); }
    function upd() {
      var info = sc.set(S.hole, S.gr, S.t);
      var q = Q0[S.lv] * (0.12 + 0.88 * info.leak); stQ.set(num(q, q < 10 ? 1 : 0)); meter.firstChild.style.width = Math.min(100, q / 45 * 100) + "%";
      var p = info.hole >= 0 ? P0 * info.p : 0; stP.set(num(p)); pm.firstChild.style.width = (p / P0 * 100) + "%"; pm.classList.toggle("is-kick", !!info.kick);
      if (S.phase === 3 && info.hole >= 0) { big.textContent = X.where.replace("{h}", info.hole + 1).replace("{e}", info.stage + 1); sub.textContent = info.kick ? X.kick : info.pull ? X.pull : X.build; }
      else { big.textContent = S.phase === 0 ? W.s0 : S.phase < 3 ? W.s1 : W.s3; sub.textContent = ""; }
      box.classList.toggle("is-kick", !!info.kick);
      bD.disabled = S.phase !== 0; bG.disabled = S.phase !== 2;
    }
    function frame(dt) {
      S.t += dt;
      if (S.phase === 1) { S.hole = Math.min(1, S.hole + dt / 1600); if (S.hole >= 1) S.phase = 2; }
      if (S.phase === 3) { S.gr = Math.min(1, S.gr + dt / 16200); if (S.gr >= 1) S.phase = 4; }
      upd();
    }
    var player;
    function kick() { if (player) player.start(); else upd(); }
    reset();
    player = playWhenVisible(box, frame);
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [rockSeg.box, el("div", { class: "wbtns" }, [bD, bG, bR]), el("div", { class: "stats" }, [stQ.box, stP.box]), meter, pm]), el("div", { class: "wgt__out" }, [big, sub, box])]));
    app.appendChild(how(W.how));
  }

  // ---------- jet grouting: a column of soilcrete ----------
  var JETD = [[0.8, 0.65, 0.5], [1.5, 1.25, 1.0], [2.0, 1.65, 1.3]];
  function jetScene() {
    var a = art(440, 300, "wchart wjet"), gy = 122;
    a.sky(null);
    a.rect(0, gy, 440, 22, a.grad([[0, "#b49a78"], [1, "#a08766"]]), { ns: true });
    a.rect(0, gy + 22, 440, 80, a.grad([[0, "#d8c49a"], [1, "#cbb488"]]), { ns: true }); a.speckle(0, gy + 22, 440, 80, 140, 3, ["#b39d70", "#efe1c0"], 1.6);
    a.rect(0, gy + 102, 440, 80, a.grad([[0, "#a89a8c"], [1, "#958879"]]), { ns: true }); a.speckle(0, gy + 102, 440, 80, 60, 5, ["#857868", "#bdb2a6"], 1.2);
    a.line(0, gy, 440, gy, "#7a6650", 2);
    var cx = 200, col = a.rect(cx, 284, 0, 0, a.grad([[0, "#9c9a96"], [0.5, "#c7c4bf"], [1, "#8d8b87"]], true), { stroke: "#6e6b68", sw: 1 });
    var spoil = a.ellipse(cx + 20, gy - 1, 0, 0, "#9a948c", { stroke: "#6e6b68", sw: 0.8 });
    var rod = a.rect(cx - 3, gy - 60, 6, 60, "#4a4446", { ns: true });
    var jetL = a.path("", "none", { stroke: "#ffffff", sw: 2.2, opacity: 0.9, "stroke-linecap": "round" }), jetR = a.path("", "none", { stroke: "#ffffff", sw: 2.2, opacity: 0.9, "stroke-linecap": "round" });
    // the rig: crawler, body and mast
    a.rect(cx - 70, gy - 16, 110, 14, a.grad([[0, "#5c5557"], [1, "#3b3436"]]), { sw: 1 }); [cx - 62, cx - 40, cx - 18, cx + 4, cx + 26].forEach(function (x) { a.circle(x, gy - 9, 5, "#7b7375", { sw: 0.8 }); });
    a.rect(cx - 62, gy - 44, 54, 28, a.grad([[0, "#ffa63a"], [1, "#d96a00"]]), { sw: 1.2 }); a.rect(cx - 56, gy - 40, 18, 12, "#bfe0f0", { sw: 0.8 });
    a.rect(cx - 9, gy - 112, 6, 96, a.grad([[0, "#f6a23a"], [1, "#d07300"]], true), { sw: 1 }); a.rect(cx - 12, gy - 118, 12, 8, "#3b3436", { ns: true });
    var head = a.rect(cx - 8, gy - 70, 16, 12, "#3b3436", { ns: true });
    a.path("M" + (cx - 40) + "," + (gy - 30) + " C" + (cx - 60) + "," + (gy - 60) + " " + (cx - 110) + "," + (gy - 40) + " " + (cx - 150) + "," + (gy - 6), "none", { stroke: "#2d2a2b", sw: 2.4 });
    a.rect(cx - 200, gy - 30, 50, 30, a.grad([[0, "#e5e8ea"], [1, "#a9afb4"]]), { sw: 1.2 });
    return {
      svg: a.svg,
      set: function (depth, lift, dPx, t) {
        // depth: 0..1 drilled, lift: 0..1 jetted from bottom to top
        var bottom = 284, top = gy + 30, tipY = gy + (bottom - gy) * depth - (bottom - top) * lift;
        rod.setAttribute("height", (tipY - (gy - 60)).toFixed(1)); head.setAttribute("y", (gy - 70 - (depth < 1 ? 0 : 0)).toFixed(1));
        var colTop = bottom - (bottom - top) * lift;
        col.setAttribute("x", (cx - dPx / 2).toFixed(1)); col.setAttribute("width", lift > 0 ? dPx.toFixed(1) : 0); col.setAttribute("y", colTop.toFixed(1)); col.setAttribute("height", (bottom - colTop).toFixed(1)); col.setAttribute("rx", (dPx * 0.18).toFixed(1));
        var jetting = lift > 0 && lift < 1, s = Math.sin(t / 90), len = dPx / 2 * (0.75 + 0.25 * Math.abs(s));
        jetL.setAttribute("d", jetting ? "M" + cx + "," + tipY.toFixed(1) + " l" + (-len * (s > 0 ? 1 : 0.35)).toFixed(1) + ",-1" : "");
        jetR.setAttribute("d", jetting ? "M" + cx + "," + tipY.toFixed(1) + " l" + (len * (s > 0 ? 0.35 : 1)).toFixed(1) + ",-1" : "");
        spoil.setAttribute("rx", (lift * 34).toFixed(1)); spoil.setAttribute("ry", (lift * 3.5).toFixed(1));
      }
    };
  }
  function buildJet(app) {
    var W = T3.jet, S = { m: 1, s: 0, L: 8, depth: 0, lift: 0, phase: 0, t: 0 };
    var sc = jetScene(), big = el("p", { class: "wgt__big", "aria-live": "polite" });
    var mSel = select(W.method, W.methods, 1, function (i) { S.m = i; calc(); }), sSeg = segmented(W.soil, W.soils, 0, function (i) { S.s = i; calc(); });
    var sL = slider(W.len, 2, 15, 1, 8, function (v) { return num(v) + " m"; }, function (v) { S.L = v; calc(); });
    var bS = el("button", { type: "button", class: "vbtn" }); bS.addEventListener("click", function () { S.depth = 0; S.lift = 0; S.phase = 1; if (REDUCE) { S.depth = 1; S.lift = 1; S.phase = 3; } player.start(); upd(); });
    var stD = stat(W.dia, W.m), stV = stat(W.per, W.m3), stT = stat(W.tot, W.m3);
    function D() { return JETD[S.m][S.s]; }
    function calc() { var d = D(), a = Math.PI * d * d / 4; stD.set(num(d, 2)); stV.set(num(a, 2)); stT.set(num(a * S.L, 1)); upd(); }
    function upd() { sc.set(S.depth, S.lift, 30 + D() * 46, S.t); big.textContent = [W.p0, W.p1, W.p2, W.p3][S.phase]; bS.textContent = S.phase === 3 ? W.again : W.start; bS.disabled = S.phase === 1 || S.phase === 2; }
    var player = playWhenVisible(sc.svg, function (dt) {
      S.t += dt;
      if (S.phase === 1) { S.depth = Math.min(1, S.depth + dt / 1800); if (S.depth >= 1) S.phase = 2; }
      else if (S.phase === 2) { S.lift = Math.min(1, S.lift + dt / 5200); if (S.lift >= 1) S.phase = 3; }
      upd();
    });
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [mSel.box, sSeg.box, sL.box, bS, el("div", { class: "stats" }, [stD.box, stV.box, stT.box])]), el("div", { class: "wgt__out" }, [big, sc.svg])]));
    app.appendChild(how(W.how));
    calc();
  }

  // ---------- drying of a slab ----------
  function torkScene(th, two, t) {
    var a = art(440, 230, "wchart wtork"), x0 = 40, w = 360, h = 22 + (th - 50) / 250 * 98, y0 = 120 - h / 2;
    a.rect(0, 0, 440, 230, a.grad([[0, "#fbf6ee"], [1, "#f1e8da"]]), { ns: true });
    if (!two) { a.rect(x0 - 10, y0 + h, w + 20, 230 - y0 - h, a.grad([[0, "#d7c8ae"], [1, "#c4b296"]]), { ns: true }); a.speckle(x0 - 10, y0 + h + 4, w + 20, 80, 70, 4, ["#b09c7c", "#e8dcc6"], 1.5); }
    else { a.rect(x0 + 20, y0 + h, 14, 230, "#b8b0a3", { sw: 1 }); a.rect(x0 + w - 34, y0 + h, 14, 230, "#b8b0a3", { sw: 1 }); }
    var stops = two ? [[0, "#e9e3d9"], [0.5, "#7fa9c9"], [1, "#e9e3d9"]] : [[0, "#e9e3d9"], [0.55, "#9bbdd6"], [1, "#6f9fc4"]];
    a.rect(x0, y0, w, h, a.grad(stops), { sw: 1.4 });
    a.speckle(x0 + 2, y0 + 2, w - 4, h - 4, Math.round(w * h / 90), 9, ["#8a8378", "#d9d2c6"], 1.3);
    var md = y0 + h * (two ? 0.2 : 0.4);
    a.line(x0 + w - 70, y0 - 16, x0 + w - 70, md, "#3b3436", 2.2); a.circle(x0 + w - 70, md, 3.4, C.orange, { sw: 1 }); a.rect(x0 + w - 84, y0 - 30, 28, 14, "#3b3436", { ns: true });
    a.line(x0 + w - 60, md, x0 + w + 12, md, C.orange, 1, { "stroke-dasharray": "3 3" });
    var vap = [], k;
    for (k = 0; k < 6; k++) { vap.push([a.path("", "none", { stroke: "#7fa9c9", sw: 1.6 }), two ? a.path("", "none", { stroke: "#7fa9c9", sw: 1.6 }) : null, x0 + 30 + k * 52, k * 0.17]); }
    function step(tt) {
      var ph = (tt / 2600) % 1;
      vap.forEach(function (v) {
        var p = (ph + v[3]) % 1, op = (Math.sin(p * Math.PI) * 0.55).toFixed(2), yy = y0 - 6 - p * 40;
        v[0].setAttribute("d", "M" + v[2] + "," + yy.toFixed(1) + " q5,-6 0,-12 q-5,-6 0,-12"); v[0].setAttribute("opacity", op);
        if (v[1]) { var yb = y0 + h + 6 + p * 34; v[1].setAttribute("d", "M" + (v[2] + 20) + "," + yb.toFixed(1) + " q5,6 0,12 q-5,6 0,12"); v[1].setAttribute("opacity", op); }
      });
    }
    step(t || 900);
    return { svg: a.svg, md: md, step: step };
  }
  function buildTork(app) {
    var W = T3.tork, S = { th: 100, two: 0, v: 1, c: 1, t: 0 }, VF = [0.35, 1, 1.6], CF = [2.4, 1, 0.7];
    var sT = slider(W.th, 50, 300, 10, 100, function (v) { return num(v) + " mm"; }, function (v) { S.th = v; draw(); });
    var sideSeg = segmented(W.side, W.sides, 0, function (i) { S.two = i; draw(); }), vSel = select(W.vct, W.vcts, 1, function (i) { S.v = i; draw(); }), cSel = select(W.clim, W.clims, 1, function (i) { S.c = i; draw(); });
    var box = el("div", { class: "wtork__pic" }), stF = stat(W.factor, W.times), stD = stat(W.depth, W.mm), bars = el("div", { class: "wbars" }), msg = el("ul", { class: "wmsg" });
    function factor() { var de = S.two ? S.th / 2 : S.th; return Math.pow(de / 100, 2) * VF[S.v] * CF[S.c]; }
    var cur = null;
    function pic() { box.innerHTML = ""; cur = torkScene(S.th, S.two, S.t); box.appendChild(cur.svg); }
    function draw() {
      var f = factor(); pic(); stF.set(num(f, f < 10 ? 1 : 0)); stD.set(num(S.th * (S.two ? 0.2 : 0.4)));
      var mx = Math.max(1, f); bars.innerHTML = "";
      [[W.bar1, 1, "ref"], [W.bar2, f, "you"]].forEach(function (b) { bars.appendChild(el("div", { class: "wbars__r wbars__r--" + b[2] }, [el("span", { class: "wbars__l", text: b[0] }), el("span", { class: "wbars__t" }, [el("i", { style: "width:" + (b[1] / mx * 100).toFixed(1) + "%" })]), el("span", { class: "wbars__v", text: "× " + num(b[1], b[1] < 10 ? 1 : 0) })])); });
      msg.innerHTML = ""; msg.appendChild(el("li", { class: "wmsg__info", text: W.ref + " " + W.refT })); msg.appendChild(el("li", { class: "wmsg__info", text: W.deep }));
      if (S.v === 0) msg.appendChild(el("li", { class: "wmsg__ok", text: W.fast }));
    }
    var player = playWhenVisible(box, function (dt) { S.t += dt; if (cur) cur.step(S.t); });
    app.appendChild(el("div", { class: "wgt__grid" }, [el("div", { class: "wgt__ctl" }, [sT.box, sideSeg.box, vSel.box, cSel.box]), el("div", { class: "wgt__out" }, [box, el("div", { class: "stats" }, [stF.box, stD.box]), bars, msg])]));
    app.appendChild(how(W.how));
    draw();
  }

  var BUILD = { vct: buildVct, harda: buildHarda, injektering: buildInj, atgang: buildAtg, vadarvad: buildVad, volym: buildVolym, klass: buildKlass, tidslinje: buildTid, pantheon: buildPantheon, armering: buildArm, hojd: buildHojd, tunnelcykel: buildTunCycle, tunnelval: buildTunVal, spruta: buildSpruta, illu: buildIllu, ugn: buildUgn, klinker: buildKlinker, karbonatisering: buildKarb, klimat: buildKlimat, frost: buildFrost, pump: buildPump, sten: buildSten, marsh: buildMarsh, ic: buildIc, blandning: buildMix, logg: buildLog, vctcalc: buildVctCalc, recept: buildRecept, tatning: buildTat, jet: buildJet, tork: buildTork };
  if (window.__WIDGET_TEST) { window.__WIDGET_TEST.scene = scene; window.__WIDGET_TEST.tunnelScene = tunnelScene; window.__WIDGET_TEST.tbmScene = tbmScene; window.__WIDGET_TEST.romanScene = romanScene; window.__WIDGET_TEST.lcaScene = lcaScene; window.__WIDGET_TEST.frostScene = frostScene; window.__WIDGET_TEST.pumpParts = pumpParts; window.__WIDGET_TEST.rockParts = rockParts; window.__WIDGET_TEST.marshParts = marshParts; window.__WIDGET_TEST.art = art; window.__WIDGET_TEST.icScene = icScene; window.__WIDGET_TEST.ICM = ICM; window.__WIDGET_TEST.mixScene = mixScene; window.__WIDGET_TEST.simLog = simLog; window.__WIDGET_TEST.logChart = logChart; window.__WIDGET_TEST.T = T; window.__WIDGET_TEST.tatScene = tatScene; window.__WIDGET_TEST.jetScene = jetScene; window.__WIDGET_TEST.torkScene = torkScene; }
  [].forEach.call(document.querySelectorAll("[data-widget]"), function (box) {
    var app = box.querySelector(".wgt__app"), fn = BUILD[box.getAttribute("data-widget")];
    if (!app || !fn) return;
    app.innerHTML = ""; fn(app, box); box.classList.add("is-live");
  });
})();
