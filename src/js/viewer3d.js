/* 3D viewer for machine models (no libraries, no third parties).
   Markup (render.mjs, block "model3d"):
     <figure class="m3d" data-src="/assets/3d/x.bkm" data-label="..."> <img class="m3d__poster"> <button class="m3d__go">..</button> </figure>
   The model file is only fetched when the visitor asks for it. Format: see tools/glb-compact.mjs.
   Modes (buttons): turn (drag orbits), move (drag moves the camera sideways and up/down) and, with a mouse and keyboard,
   walk: a person on the floor in first person (Counter-Strike: Source movement, a pointing hand, a round minimap).
   Wheel / pinch zoom, right drag or two fingers move, double click = start view.
   Every machine is turned to face the same way (its mast, the highest part, front right). */
(function () {
  "use strict";
  var figs = [].slice.call(document.querySelectorAll(".m3d"));
  var LANGS = {
    sv: { loading: "Hämtar 3D-modellen", failed: "3D-modellen kunde inte visas i den här webbläsaren.", spin: "Rotera automatiskt", reset: "Startvy", full: "Helskärm", close: "Tillbaka till bilden",
      orbit: "Vrid", pan: "Flytta", hOrbit: "Dra för att vrida, scrolla eller nyp för att zooma.", hPan: "Dra för att flytta kameran i sidled och höjdled.",
      modes: "Kameraläge", walk: "Gå", hWalk: "Gå runt maskinen. Klicka i bilden och styr med musen. W A S D går, mellanslag hoppar, Ctrl eller C hukar, Shift smyger. Klicka för att peka. Esc släpper musen." },
    en: { loading: "Loading the 3D model", failed: "The 3D model cannot be shown in this browser.", spin: "Rotate automatically", reset: "Start view", full: "Full screen", close: "Back to the picture",
      orbit: "Turn", pan: "Move", hOrbit: "Drag to turn, scroll or pinch to zoom.", hPan: "Drag to move the camera sideways and up or down.",
      modes: "Camera mode", walk: "Walk", hWalk: "Walk around the machine. Click the view and steer with the mouse. W A S D walks, Space jumps, Ctrl or C crouches, Shift walks quietly. Click to point. Esc releases the mouse." },
    es: { loading: "Cargando el modelo 3D", failed: "El modelo 3D no se puede mostrar en este navegador.", spin: "Girar automáticamente", reset: "Vista inicial", full: "Pantalla completa", close: "Volver a la imagen",
      orbit: "Girar", pan: "Mover", hOrbit: "Arrastra para girar, desplaza o pellizca para ampliar.", hPan: "Arrastra para mover la cámara a los lados y en altura.",
      modes: "Modo de cámara", walk: "Caminar", hWalk: "Camina alrededor de la máquina. Haz clic en la vista y dirige con el ratón. W A S D para caminar, espacio salta, Ctrl o C se agacha, Mayús camina despacio. Haz clic para señalar. Esc suelta el ratón." },
    no: { loading: "Henter 3D-modellen", failed: "3D-modellen kan ikke vises i denne nettleseren.", spin: "Roter automatisk", reset: "Startvisning", full: "Fullskjerm", close: "Tilbake til bildet",
      orbit: "Drei", pan: "Flytt", hOrbit: "Dra for å dreie, rull eller klyp for å zoome.", hPan: "Dra for å flytte kameraet sideveis og i høyden.",
      modes: "Kameramodus", walk: "Gå", hWalk: "Gå rundt maskinen. Klikk i bildet og styr med musen. W A S D går, mellomrom hopper, Ctrl eller C huker, Shift lister. Klikk for å peke. Esc slipper musen." },
    lt: { loading: "Įkeliamas 3D modelis", failed: "Šioje naršyklėje 3D modelio parodyti nepavyksta.", spin: "Sukti automatiškai", reset: "Pradinis vaizdas", full: "Visas ekranas", close: "Atgal į nuotrauką",
      orbit: "Sukti", pan: "Perkelti", hOrbit: "Tempkite, kad pasuktumėte, slinkite arba suimkite pirštais, kad priartintumėte.", hPan: "Tempkite, kad perkeltumėte kamerą į šonus ir aukštyn ar žemyn.",
      modes: "Kameros režimas", walk: "Eiti", hWalk: "Apeikite mašiną. Spustelėkite vaizdą ir valdykite pele. W A S D eiti, tarpas šokti, Ctrl arba C pritūpti, Shift eiti tyliai. Spustelėkite, kad parodytumėte pirštu. Esc atlaisvina pelę." },
    lv: { loading: "Ielādē 3D modeli", failed: "Šajā pārlūkā 3D modeli nevar parādīt.", spin: "Griezt automātiski", reset: "Sākuma skats", full: "Pilnekrāns", close: "Atpakaļ uz attēlu",
      orbit: "Griezt", pan: "Pārvietot", hOrbit: "Velciet, lai pagrieztu, ritiniet vai saspiediet, lai tuvinātu.", hPan: "Velciet, lai pārvietotu kameru uz sāniem un augšup vai lejup.",
      modes: "Kameras režīms", walk: "Iet", hWalk: "Apstaigājiet mašīnu. Noklikšķiniet uz skata un vadiet ar peli. W A S D iet, atstarpe lec, Ctrl vai C notupjas, Shift iet klusi. Noklikšķiniet, lai norādītu. Esc atbrīvo peli." },
    et: { loading: "3D-mudeli laadimine", failed: "Selles brauseris ei saa 3D-mudelit näidata.", spin: "Pööra automaatselt", reset: "Algvaade", full: "Täisekraan", close: "Tagasi pildi juurde",
      orbit: "Pööra", pan: "Liiguta", hOrbit: "Lohista pööramiseks, keri või näpista suumimiseks.", hPan: "Lohista, et liigutada kaamerat külgedele ja üles-alla.",
      modes: "Kaamera režiim", walk: "Kõnni", hWalk: "Kõnni ümber masina. Klõpsa vaatel ja juhi hiirega. W A S D kõnnib, tühik hüppab, Ctrl või C kükitab, Shift hiilib. Klõpsa, et osutada. Esc vabastab hiire." },
    ru: { loading: "Загрузка 3D-модели", failed: "В этом браузере 3D-модель показать нельзя.", spin: "Автоматическое вращение", reset: "Исходный вид", full: "Во весь экран", close: "Назад к изображению",
      orbit: "Вращать", pan: "Сдвигать", hOrbit: "Тяните, чтобы вращать, прокрутите или сведите пальцы для масштаба.", hPan: "Тяните, чтобы сдвигать камеру вбок и вверх или вниз.",
      modes: "Режим камеры", walk: "Ходьба", hWalk: "Обойдите машину. Щёлкните по изображению и управляйте мышью. W A S D: ходьба, пробел: прыжок, Ctrl или C: присесть, Shift: тихий шаг. Щелчок: показать пальцем. Esc отпускает мышь." }
  };
  var lang = (document.documentElement.lang || "en").toLowerCase(), L = LANGS[lang.slice(0, 2)] || (/^(nb|nn)/.test(lang) ? LANGS.no : LANGS.en);
  var ICON = {
    orbit: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><ellipse cx="12" cy="12" rx="9" ry="3.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M16.5 6.2 19 8.6l-3 1"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/></svg>',
    pan: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M12 3v18M3 12h18M12 3 9.5 5.5M12 3l2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5M3 12l2.5-2.5M3 12l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5"/></svg>',
    walk: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="4.2" r="2.3" fill="currentColor"/><path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" d="M5.2 8.6 12 9.6l6.8-1M12 9.6v5.6M12 15.2l-2.9 6.3M12 15.2l2.9 6.3"/></svg>',
    spin: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4.5h-4.5"/></svg>',
    reset: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M12 3 4 7.5v9L12 21l8-4.5v-9zM4 7.5 12 12l8-4.5M12 12v9"/></svg>',
    full: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M6 6l12 12M18 6 6 18"/></svg>'
  };

  // ---------- file ----------
  function fetchModel(url, progress) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      var total = +r.headers.get("content-length") || 0;
      if (!r.body || !r.body.getReader) return r.arrayBuffer();
      var reader = r.body.getReader(), chunks = [], got = 0;
      function pump() {
        return reader.read().then(function (x) {
          if (x.done) { var out = new Uint8Array(got), o = 0; chunks.forEach(function (c) { out.set(c, o); o += c.length; }); return out.buffer; }
          chunks.push(x.value); got += x.value.length; if (total) progress(got / total); return pump();
        });
      }
      return pump();
    }).then(function (ab) {
      var u = new Uint8Array(ab);
      if (u[0] === 0x1f && u[1] === 0x8b) {
        if (typeof DecompressionStream === "undefined") throw new Error("no gzip");
        return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
      }
      return ab;
    }).then(parse);
  }
  function parse(ab) {
    var dv = new DataView(ab);
    if (String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3)) !== "BKM2") throw new Error("format");
    var hl = dv.getUint32(4, true);
    var head = JSON.parse(new TextDecoder().decode(new Uint8Array(ab, 8, hl)));
    var b = new Uint8Array(ab), o = 8 + hl, draws = [];
    // byte planes: x, y, z (low bytes, then high bytes), octahedral normal u, v, index deltas (low, then high)
    function plane16(n) { var out = new Uint16Array(n); for (var k = 0; k < n; k++) out[k] = b[o + k] | (b[o + n + k] << 8); o += 2 * n; return out; }
    head.draws.forEach(function (d) {
      var n = d.n, X = plane16(n), Y = plane16(n), Z = plane16(n);
      var p = new Uint16Array(n * 3), nr = new Int8Array(n * 4);
      for (var k = 0; k < n; k++) { p[k * 3] = X[k]; p[k * 3 + 1] = Y[k]; p[k * 3 + 2] = Z[k]; }
      for (k = 0; k < n; k++) {
        var u = ((b[o + k] << 24) >> 24) / 127, v = ((b[o + n + k] << 24) >> 24) / 127, z = 1 - Math.abs(u) - Math.abs(v), x = u, y = v;
        if (z < 0) { x = (1 - Math.abs(v)) * (u < 0 ? -1 : 1); y = (1 - Math.abs(u)) * (v < 0 ? -1 : 1); }
        var l = Math.sqrt(x * x + y * y + z * z) || 1;
        nr[k * 4] = Math.round(x / l * 127); nr[k * 4 + 1] = Math.round(y / l * 127); nr[k * 4 + 2] = Math.round(z / l * 127);
      }
      o += 2 * n;
      var D = plane16(d.i), ix = new Uint16Array(d.i), acc = 0;
      for (k = 0; k < d.i; k++) { acc = (acc + D[k]) & 0xffff; ix[k] = acc; }
      draws.push({ mat: head.mats[d.m], p: p, n: nr, ix: ix });
    });
    return { min: head.min, max: head.max, draws: draws };
  }

  // ---------- small maths ----------
  function persp(fov, asp, n, f) { var t = 1 / Math.tan(fov / 2); return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]; }
  function ortho(l, r, b, t, n, f) { return [2 / (r - l), 0, 0, 0, 0, 2 / (t - b), 0, 0, 0, 0, -2 / (f - n), 0, -(r + l) / (r - l), -(t + b) / (t - b), -(f + n) / (f - n), 1]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function lookAt(e, c, up) { var z = norm(sub(e, c)), x = norm(cross(up, z)), y = cross(z, x); return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1]; }
  function mul(a, b) { var o = new Array(16); for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) { var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; }

  // ---------- shaders ----------
  var VS = "#version 300 es\nlayout(location=0) in vec3 aP; layout(location=1) in vec4 aN;\nuniform mat4 uVP; uniform mat4 uLVP; uniform vec3 uMin; uniform vec3 uSpan; uniform vec3 uShift; uniform vec2 uYaw;\nout vec3 vW; out vec3 vN; out vec4 vL;\nvec3 yaw(vec3 p){ return vec3(uYaw.x*p.x + uYaw.y*p.z, p.y, -uYaw.y*p.x + uYaw.x*p.z); }\nvoid main(){ vec3 w = yaw(uMin + aP * uSpan + uShift); vW = w; vN = yaw(aN.xyz); vL = uLVP * vec4(w,1.0); gl_Position = uVP * vec4(w,1.0); }";
  var FS = "#version 300 es\nprecision highp float; precision highp sampler2DShadow;\nin vec3 vW; in vec3 vN; in vec4 vL;\nuniform vec3 uCol; uniform float uMet; uniform float uRgh; uniform float uA; uniform float uCC; uniform vec3 uEye; uniform vec3 uKey; uniform vec3 uFill; uniform sampler2DShadow uSh; uniform float uTex;\nout vec4 o;\n" +
    "float shadow(){ vec3 p = vL.xyz / vL.w * 0.5 + 0.5; if(p.x<0.0||p.x>1.0||p.y<0.0||p.y>1.0) return 1.0; float s=0.0; for(int x=-1;x<=1;x++) for(int y=-1;y<=1;y++) s += texture(uSh, vec3(p.xy + vec2(x,y)*uTex, p.z - 0.0015)); return s/9.0; }\n" +
    "vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0); }\n" +
    "void main(){ vec3 N = normalize(vN); vec3 V = normalize(uEye - vW); if(dot(N,V) < 0.0) N = -N;\n" +
    " vec3 base = uCol; float rough = clamp(uRgh, 0.08, 1.0); vec3 F0 = mix(vec3(0.04), base, uMet); vec3 dif = base * (1.0 - uMet);\n" +
    " float sh = shadow(); float shp = mix(4.0, 160.0, pow(1.0 - rough, 2.0));\n" +
    " vec3 c = vec3(0.0);\n" +
    " float nk = max(dot(N,uKey),0.0); vec3 hk = normalize(uKey+V); c += (dif + F0 * pow(max(dot(N,hk),0.0), shp) * (shp+8.0)/25.0) * nk * 2.3 * sh;\n" +
    " float nf = max(dot(N,uFill),0.0); vec3 hf = normalize(uFill+V); c += (dif + F0 * pow(max(dot(N,hf),0.0), shp) * (shp+8.0)/40.0) * nf * 0.75;\n" +
    " float up = N.y*0.5+0.5; vec3 amb = mix(vec3(0.42,0.40,0.38), vec3(1.0,0.99,0.97), up); c += dif * amb * 0.55;\n" +
    " vec3 R = reflect(-V, N); vec3 env = mix(vec3(0.25,0.24,0.23), vec3(1.15,1.13,1.1), smoothstep(-0.25, 0.6, R.y)); float fr = pow(1.0 - max(dot(N,V),0.0), 5.0); vec3 F = F0 + (1.0 - F0) * fr * (1.0 - rough);\n" +
    " c += env * F * (1.0 - rough*0.75) * 0.9;\n" +
    " if(uCC > 0.5){ vec3 hc = normalize(uKey+V); c += vec3(0.6) * pow(max(dot(N,hc),0.0), 220.0) * sh + env * 0.04 + fr*0.25; }\n" +
    " c = aces(c * 1.05); o = vec4(pow(c, vec3(1.0/2.2)), uA); }";
  var DVS = "#version 300 es\nlayout(location=0) in vec3 aP; uniform mat4 uLVP; uniform vec3 uMin; uniform vec3 uSpan; uniform vec3 uShift; uniform vec2 uYaw; void main(){ vec3 p = uMin + aP*uSpan + uShift; gl_Position = uLVP * vec4(uYaw.x*p.x + uYaw.y*p.z, p.y, -uYaw.y*p.x + uYaw.x*p.z, 1.0); }";
  var DFS = "#version 300 es\nprecision mediump float; out vec4 o; void main(){ o = vec4(1.0); }";
  var GVS = "#version 300 es\nlayout(location=0) in vec2 aG; uniform mat4 uVP; uniform mat4 uLVP; uniform float uR; out vec2 vG; out vec4 vL; void main(){ vec3 w = vec3(aG.x*uR, 0.0, aG.y*uR); vG = aG; vL = uLVP*vec4(w,1.0); gl_Position = uVP*vec4(w,1.0); }";
  var GFS = "#version 300 es\nprecision highp float; precision highp sampler2DShadow; in vec2 vG; in vec4 vL; uniform sampler2DShadow uSh; uniform float uTex; uniform vec3 uBg; out vec4 o;\n" +
    "void main(){ vec3 p = vL.xyz/vL.w*0.5+0.5; float s=0.0; for(int x=-2;x<=2;x++) for(int y=-2;y<=2;y++) s += texture(uSh, vec3(p.xy+vec2(x,y)*uTex*1.6, p.z-0.002)); s/=25.0; float d = length(vG); float fade = smoothstep(1.0, 0.25, d);\n" +
    " vec3 floorC = uBg * 0.985; vec3 c = mix(floorC*0.72, floorC, s); c = mix(uBg, c, fade); o = vec4(c, 1.0); }";

  // the walker's right hand (drawn in camera space, on top of everything)
  var HVS = "#version 300 es\nlayout(location=0) in vec3 aP; layout(location=1) in vec3 aN; layout(location=2) in vec3 aC; uniform mat4 uP; uniform mat4 uM; out vec3 vN; out vec3 vC; out vec3 vV;\nvoid main(){ vec4 p = uM * vec4(aP,1.0); vV = p.xyz; vN = mat3(uM) * aN; vC = aC; gl_Position = uP * p; }";
  var HFS = "#version 300 es\nprecision highp float; in vec3 vN; in vec3 vC; in vec3 vV; uniform vec3 uL; out vec4 o;\n" +
    "void main(){ vec3 N = normalize(vN); vec3 V = normalize(-vV); float d = max(dot(N,uL),0.0); float w = dot(N,uL)*0.5+0.5; vec3 c = vC*(0.2 + 0.5*w*w + 0.5*d);\n" +
    " float rim = pow(1.0 - max(dot(N,V),0.0), 3.0); c += vC*rim*0.35 + vec3(0.02)*rim; vec3 H = normalize(uL+V); c += vec3(0.07)*pow(max(dot(N,H),0.0), 20.0);\n" +
    " c = clamp((c*(2.51*c+0.03))/(c*(2.43*c+0.59)+0.14),0.0,1.0); o = vec4(pow(c, vec3(1.0/2.2)), 1.0); }";
  function handMesh() {
    var P = [], N = [], C = [];
    var SKIN = [0.50, 0.29, 0.19], SLEEVE = [0.03, 0.032, 0.036], BAND = [0.86, 0.22, 0.02];
    function tri(a, b, c, na, nb, nc, col) { [a, b, c].forEach(function (p) { P.push(p[0], p[1], p[2]); }); [na, nb, nc].forEach(function (n) { N.push(n[0], n[1], n[2]); C.push(col[0], col[1], col[2]); }); }
    function add(a, b, k) { return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
    // a tube from a to b (radius r0 to r1) with round ends, or flat ends where cap is false
    function capsule(a, b, r0, r1, col, capA, capB) {
      var ax = norm(sub(b, a)), t = Math.abs(ax[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], u = norm(cross(ax, t)), v = cross(ax, u), S = 14, rings = [];
      var R = capA === false ? [[a, r0, 0]] : [];
      if (capA !== false) for (var i = 0; i <= 4; i++) R.push([a, r0, -Math.PI / 2 + i * Math.PI / 8]);
      if (capB !== false) for (i = 0; i <= 4; i++) R.push([b, r1, i * Math.PI / 8]); else R.push([b, r1, 0]);
      R.forEach(function (q) {
        var ring = [];
        for (var s = 0; s <= S; s++) { var th = s / S * 2 * Math.PI, ct = Math.cos(th), st = Math.sin(th), cp = Math.cos(q[2]), sp = Math.sin(q[2]);
          var n = [cp * (ct * u[0] + st * v[0]) + sp * ax[0], cp * (ct * u[1] + st * v[1]) + sp * ax[1], cp * (ct * u[2] + st * v[2]) + sp * ax[2]];
          ring.push([add(q[0], n, q[1]), n]); }
        rings.push(ring);
      });
      for (var j = 0; j + 1 < rings.length; j++) for (var s = 0; s < S; s++) {
        var p00 = rings[j][s], p01 = rings[j][s + 1], p10 = rings[j + 1][s], p11 = rings[j + 1][s + 1];
        tri(p00[0], p10[0], p11[0], p00[1], p10[1], p11[1], col); tri(p00[0], p11[0], p01[0], p00[1], p11[1], p01[1], col);
      }
      [[capA, a, rings[0], -1], [capB, b, rings[rings.length - 1], 1]].forEach(function (e) {
        if (e[0] !== false) return; var n = [ax[0] * e[3], ax[1] * e[3], ax[2] * e[3]];
        for (var s = 0; s < S; s++) tri(e[1], e[2][s][0], e[2][s + 1][0], n, n, n, e[3] < 0 ? [0.012, 0.012, 0.014] : col);
      });
    }
    function ellipsoid(c, r, col) {
      var S = 18, T = 10, g = [];
      for (var i = 0; i <= T; i++) { var ph = -Math.PI / 2 + i / T * Math.PI, row = [];
        for (var s = 0; s <= S; s++) { var th = s / S * 2 * Math.PI, d = [Math.cos(ph) * Math.cos(th), Math.sin(ph), Math.cos(ph) * Math.sin(th)];
          row.push([[c[0] + d[0] * r[0], c[1] + d[1] * r[1], c[2] + d[2] * r[2]], norm([d[0] / r[0], d[1] / r[1], d[2] / r[2]])]); }
        g.push(row); }
      for (i = 0; i < T; i++) for (s = 0; s < S; s++) { var a = g[i][s], b = g[i][s + 1], e = g[i + 1][s], f = g[i + 1][s + 1]; tri(a[0], e[0], f[0], a[1], e[1], f[1], col); tri(a[0], f[0], b[0], a[1], f[1], b[1], col); }
    }
    function finger(pts, rs) { for (var i = 0; i + 1 < pts.length; i++) capsule(pts[i], pts[i + 1], rs[i], rs[i + 1], SKIN); }
    // right hand, palm down, index finger pointing forward (-z); x right, y up, z back towards the wrist
    ellipsoid([0, 0, 0], [0.042, 0.019, 0.048], SKIN);
    finger([[-0.026, 0.003, -0.038], [-0.028, 0.004, -0.083], [-0.029, 0.003, -0.112], [-0.029, 0.0, -0.134]], [0.0108, 0.0099, 0.0092, 0.0084]);
    function curled(k, sc, rs) { var p1 = add(k, [0, -0.016, -0.028], sc), p2 = add(p1, [0, -0.024, 0.006], sc), p3 = add(p2, [0, -0.004, 0.018], sc); finger([k, p1, p2, p3], rs); }
    curled([-0.007, 0.004, -0.042], 1, [0.0108, 0.0103, 0.0096, 0.0088]);
    curled([0.011, 0.003, -0.040], 0.95, [0.0103, 0.0098, 0.0091, 0.0084]);
    curled([0.028, 0.0, -0.034], 0.78, [0.0089, 0.0084, 0.0078, 0.0072]);
    finger([[-0.028, -0.006, 0.012], [-0.047, -0.012, -0.012], [-0.043, -0.02, -0.035], [-0.03, -0.027, -0.049]], [0.015, 0.0125, 0.0108, 0.0096]);
    capsule([0.002, -0.002, 0.03], [0.007, -0.005, 0.1], 0.029, 0.031, SKIN, true, false);
    capsule([0.006, -0.004, 0.09], [0.034, -0.022, 0.46], 0.043, 0.05, SLEEVE, false, false);
    capsule([0.0105, -0.007, 0.15], [0.0125, -0.0085, 0.175], 0.0452, 0.0456, BAND, false, false);
    return { p: new Float32Array(P), n: new Float32Array(N), c: new Float32Array(C), count: P.length / 3 };
  }
  function rotY(a) { var c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; }
  function rotX(a) { var c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]; }
  function rotZ(a) { var c = Math.cos(a), s = Math.sin(a); return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; }
  function trans(x, y, z) { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]; }

  function compile(gl, vs, fs) {
    function sh(t, s) { var x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; }
    var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var a = gl.getActiveUniform(p, i); u[a.name] = gl.getUniformLocation(p, a.name); }
    return { p: p, u: u };
  }

  // ---------- one viewer ----------
  function Viewer(canvas, model, opt) {
    opt = opt || {};
    var gl = canvas.getContext("webgl2", { antialias: true, preserveDrawingBuffer: !!opt.keep, alpha: false });
    if (!gl) throw new Error("webgl2");
    var bg = opt.bg || [1, 1, 1];
    var P = compile(gl, VS, FS), D = compile(gl, DVS, DFS), Gp = compile(gl, GVS, GFS);
    var mn = model.min, mx = model.max, span = [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]];
    var size = Math.max(span[0], span[1], span[2]);
    // stand the machine on the floor at the origin
    var shift = [-(mn[0] + mx[0]) / 2, -mn[1], -(mn[2] + mx[2]) / 2];
    var center = [0, span[1] * 0.5, 0], radius = 0.5 * Math.hypot(span[0], span[1], span[2]);
    // the highest part (the mast) marks the front; every machine is turned so that it points the same way
    var FRONT = 1.45, yawA = 0;
    (function () {
      var top = 0, sx = 0, sz = 0, n = 0;
      model.draws.forEach(function (d) { for (var k = 1; k < d.p.length; k += 3) if (d.p[k] > top) top = d.p[k]; });
      var lim = top * 0.86;
      model.draws.forEach(function (d) { var p = d.p; for (var k = 0; k < p.length; k += 3) if (p[k + 1] >= lim) { sx += p[k]; sz += p[k + 2]; n++; } });
      if (!n) return;
      var x = mn[0] + sx / n / 65535 * span[0] + shift[0], z = mn[2] + sz / n / 65535 * span[2] + shift[2];
      if (Math.hypot(x, z) > size * 0.06) yawA = Math.atan2(z, x) - FRONT;
    })();
    if (opt.yaw) yawA += opt.yaw * Math.PI / 180;
    var yawU = [Math.cos(yawA), Math.sin(yawA)];
    var draws = model.draws.map(function (d) {
      var vao = gl.createVertexArray(); gl.bindVertexArray(vao);
      var pb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pb); gl.bufferData(gl.ARRAY_BUFFER, d.p, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.UNSIGNED_SHORT, true, 6, 0);
      var nb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, nb); gl.bufferData(gl.ARRAY_BUFFER, d.n, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.BYTE, true, 4, 0);
      var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, d.ix, gl.STATIC_DRAW);
      gl.bindVertexArray(null);
      var c = d.mat.c; // linear colours from the file
      return { vao: vao, count: d.ix.length, col: c, met: d.mat.m, rgh: d.mat.r, a: d.mat.a, cc: d.mat.cc };
    });
    draws.sort(function (a, b) { return b.a - a.a; }); // glass last
    var gvao = gl.createVertexArray(); gl.bindVertexArray(gvao);
    var gb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, gb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.bindVertexArray(null);
    // shadow map from a light above, in front, to the left
    var SM = 2048, smTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, smTex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, SM, SM);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, smTex, 0); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    var key = norm([-0.45, 1, 0.55]), fill = norm([0.8, 0.35, -0.5]);
    var R = size * 0.95;
    var lvp = mul(ortho(-R, R, -R, R, 0.01, size * 5), lookAt([key[0] * size * 2.2, key[1] * size * 2.2 + center[1], key[2] * size * 2.2], [0, center[1], 0], [0, 1, 0]));
    var shadowDirty = true;

    // camera
    var fov = opt.fov || 0.52, spin = !opt.still, dirty = true, alive = true;
    // the whole machine in view: its bounding sphere fits the (narrower) field of view
    function fitDist() { var r = canvas.getBoundingClientRect(), asp = r.width && r.height ? r.width / r.height : 1.3, f = asp < 1 ? 2 * Math.atan(Math.tan(fov / 2) * asp) : fov; return radius / Math.sin(f / 2) * (opt.dist || 0.97); }
    var START = { th: opt.theta != null ? opt.theta : -0.75, ph: opt.phi != null ? opt.phi : 0.45, d: fitDist(), t: center.slice() };
    var cam = { th: START.th, ph: START.ph, d: START.d, t: START.t.slice() };

    function eye() { return [cam.t[0] + cam.d * Math.cos(cam.ph) * Math.sin(cam.th), cam.t[1] + cam.d * Math.sin(cam.ph), cam.t[2] + cam.d * Math.cos(cam.ph) * Math.cos(cam.th)]; }
    function setCommon(prog) { gl.uniform3fv(prog.u.uMin, mn); gl.uniform3fv(prog.u.uSpan, span); gl.uniform3fv(prog.u.uShift, shift); gl.uniform2fv(prog.u.uYaw, yawU); }
    function draw() {
      var w = canvas.width, h = canvas.height;
      if (shadowDirty) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(0, 0, SM, SM); gl.clear(gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
        gl.useProgram(D.p); setCommon(D); gl.uniformMatrix4fv(D.u.uLVP, false, lvp);
        draws.forEach(function (d) { if (d.a < 0.5) return; gl.bindVertexArray(d.vao); gl.drawElements(gl.TRIANGLES, d.count, gl.UNSIGNED_SHORT, 0); });
        gl.bindFramebuffer(gl.FRAMEBUFFER, null); shadowDirty = false;
      }
      gl.viewport(0, 0, w, h); gl.clearColor(bg[0], bg[1], bg[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      var e = eye(), far = Math.hypot(e[0], e[1] - center[1], e[2]) + radius * 2.5 + size, vf = mode === "walk" ? Math.min(1.45, 2 * Math.atan(1 / (w / h))) : fov, vp = mul(persp(vf, w / h, mode === "walk" ? 0.02 : size * 0.004, far), lookAt(e, cam.t, [0, 1, 0]));
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, smTex);
      // floor
      gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND);
      gl.useProgram(Gp.p); gl.uniformMatrix4fv(Gp.u.uVP, false, vp); gl.uniformMatrix4fv(Gp.u.uLVP, false, lvp); gl.uniform1f(Gp.u.uR, mode === "walk" ? Math.max(size * 2.2, 12) : size * 2.2); gl.uniform1i(Gp.u.uSh, 0); gl.uniform1f(Gp.u.uTex, 1 / SM); gl.uniform3fv(Gp.u.uBg, bg);
      if (opt.floor !== false) { gl.bindVertexArray(gvao); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
      // machine
      gl.useProgram(P.p); setCommon(P); gl.uniformMatrix4fv(P.u.uVP, false, vp); gl.uniformMatrix4fv(P.u.uLVP, false, lvp); gl.uniform3fv(P.u.uEye, e); gl.uniform3fv(P.u.uKey, key); gl.uniform3fv(P.u.uFill, fill); gl.uniform1i(P.u.uSh, 0); gl.uniform1f(P.u.uTex, 1 / SM);
      gl.disable(gl.CULL_FACE);
      draws.forEach(function (d) {
        if (d.a < 1) { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); } else { gl.disable(gl.BLEND); gl.depthMask(true); }
        gl.uniform3fv(P.u.uCol, d.col); gl.uniform1f(P.u.uMet, d.met); gl.uniform1f(P.u.uRgh, d.rgh); gl.uniform1f(P.u.uA, d.a); gl.uniform1f(P.u.uCC, d.cc);
        gl.bindVertexArray(d.vao); gl.drawElements(gl.TRIANGLES, d.count, gl.UNSIGNED_SHORT, 0);
      });
      gl.depthMask(true); gl.disable(gl.BLEND); gl.bindVertexArray(null);
      if (mode === "walk" && pl) { drawHand(w, h); drawMap(w / h); }
    }
    function size2() {
      var dpr = Math.min(window.devicePixelRatio || 1, opt.dpr || 2), r = canvas.getBoundingClientRect();
      var w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; dirty = true; }
    }
    var last = 0, anim = null;
    function frame(t) {
      if (!alive) return;
      var dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
      size2();
      if (anim) { var k = Math.min(1, (t - anim.t0) / 700), e = 1 - Math.pow(1 - k, 3); ["th", "ph", "d"].forEach(function (q) { cam[q] = anim.from[q] + (anim.to[q] - anim.from[q]) * e; }); for (var i = 0; i < 3; i++) cam.t[i] = anim.from.t[i] + (anim.to.t[i] - anim.from.t[i]) * e; dirty = true; if (k >= 1) anim = null; }
      if (spin && !drag) { cam.th += dt * 0.22; dirty = true; }
      if (mode === "walk" && dt && pl) walk(dt, (keys.w ? 1 : 0) - (keys.s ? 1 : 0), (keys.d ? 1 : 0) - (keys.a ? 1 : 0));
      if (dirty) { draw(); dirty = false; }
      requestAnimationFrame(frame);
    }
    if (!opt.manual) requestAnimationFrame(frame);

    // pointer controls
    var drag = null, pts = {}, keys = {}, mode = "orbit";
    var locked = function () { return document.pointerLockElement === canvas; };
    document.addEventListener("pointerlockchange", function () { if (!locked()) keys = {}; });
    function stopSpin() { if (spin) { spin = false; if (opt.onSpin) opt.onSpin(false); } }
    canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    canvas.addEventListener("pointerdown", function (e) {
      if (mode === "walk" && e.pointerType === "mouse" && e.button === 0) {
        canvas.focus({ preventScroll: true }); stopSpin(); anim = null; if (opt.onUse) opt.onUse();
        if (pl) pl.poke = 1;
        if (!locked()) lockMouse();
        if (locked()) return;
      }
      canvas.setPointerCapture(e.pointerId); pts[e.pointerId] = { x: e.clientX, y: e.clientY }; canvas.focus({ preventScroll: true });
      drag = { pan: mode !== "walk" && (e.button === 2 || e.shiftKey || mode === "pan"), x: e.clientX, y: e.clientY }; stopSpin(); anim = null; if (opt.onUse) opt.onUse();
    });
    // raw mouse movement where the browser has it (no acceleration, fewer glitches), otherwise the normal kind
    function lockMouse() {
      if (!canvas.requestPointerLock) return;
      var plain = function () { try { var q = canvas.requestPointerLock(); if (q && q.catch) q.catch(function () {}); } catch (err) { /* drag to look instead */ } };
      try { var pr = canvas.requestPointerLock({ unadjustedMovement: true }); if (pr && pr.catch) pr.catch(plain); else if (!pr) plain(); } catch (err) { plain(); }
    }
    var lastMx = 0, lastMy = 0;
    canvas.addEventListener("mousemove", function (e) {
      if (!locked()) return;
      var mx = e.movementX || 0, my = e.movementY || 0;
      // a sudden jump many times larger than the movement just before is a glitch, not the hand on the mouse
      var lim = Math.max(160, 6 * Math.max(Math.abs(lastMx), Math.abs(lastMy)));
      if (Math.abs(mx) > lim || Math.abs(my) > lim) return;
      lastMx = mx; lastMy = my;
      look(mx, my, 0.0022); if (pl) { pl.sx += mx; pl.sy += my; }
    });
    canvas.addEventListener("pointermove", function (e) {
      if (locked() || !pts[e.pointerId]) return;
      var ids = Object.keys(pts);
      if (ids.length === 2) { // pinch zoom + two-finger move
        var a = pts[ids[0]], b = pts[ids[1]], d0 = Math.hypot(a.x - b.x, a.y - b.y), mx0 = (a.x + b.x) / 2, my0 = (a.y + b.y) / 2;
        pts[e.pointerId] = { x: e.clientX, y: e.clientY };
        a = pts[ids[0]]; b = pts[ids[1]];
        var d1 = Math.hypot(a.x - b.x, a.y - b.y);
        if (d0 > 0 && d1 > 0) zoom(d0 / d1);
        pan((a.x + b.x) / 2 - mx0, (a.y + b.y) / 2 - my0);
        return;
      }
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
      if (drag.pan) pan(dx, dy); else if (mode === "walk") look(dx, dy); else { cam.th -= dx * 0.008; cam.ph = Math.max(-0.05, Math.min(1.45, cam.ph + dy * 0.006)); }
      dirty = true;
    });
    function up(e) { delete pts[e.pointerId]; if (!Object.keys(pts).length) drag = null; }
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("wheel", function (e) { e.preventDefault(); stopSpin(); if (mode === "walk") return; zoom(Math.exp(e.deltaY * (e.deltaMode ? 0.05 : 0.0012))); }, { passive: false });
    canvas.addEventListener("dblclick", function () { if (mode !== "walk") reset(); });
    var KEYMAP = { w: "w", a: "a", s: "s", d: "d", q: "q", e: "e", space: "space", c: "q", controlleft: "slow", controlright: "slow" };
    function keyOf(e) { var c = (e.code || "").replace(/^Key/, "").toLowerCase(); return KEYMAP[c] || KEYMAP[(e.key || "").toLowerCase()]; }
    canvas.addEventListener("keyup", function (e) { var k = keyOf(e); if (k) keys[k] = false; keys.shift = e.shiftKey; });
    canvas.addEventListener("blur", function () { if (!locked()) keys = {}; });
    canvas.addEventListener("keydown", function (e) {
      var fk = keyOf(e); keys.shift = e.shiftKey;
      if (fk && mode === "walk") { keys[fk] = true; keys.shift = e.shiftKey; e.preventDefault(); anim = null; if (opt.onUse) opt.onUse(); return; }
      if (mode === "walk" && /^Arrow/.test(e.key)) { e.preventDefault(); stopSpin(); look(e.key === "ArrowLeft" ? -30 : e.key === "ArrowRight" ? 30 : 0, e.key === "ArrowUp" ? -24 : e.key === "ArrowDown" ? 24 : 0); return; }
      var k = e.key, used = true;
      if (mode === "walk") return;
      if (k === "ArrowLeft") cam.th += 0.12; else if (k === "ArrowRight") cam.th -= 0.12; else if (k === "ArrowUp") cam.ph = Math.min(1.45, cam.ph + 0.08); else if (k === "ArrowDown") cam.ph = Math.max(-0.05, cam.ph - 0.08);
      else if (k === "+" || k === "=") zoom(0.85); else if (k === "-") zoom(1.18); else if (k === "0" || k === "Home") reset(); else used = false;
      if (used) { e.preventDefault(); stopSpin(); dirty = true; }
    });
    function zoom(f) { cam.d = Math.max(size * 0.3, Math.min(START.d * 2.5, cam.d * f)); dirty = true; }
    function pan(dx, dy) {
      var e = eye(), f = norm(sub(cam.t, e)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f);
      var s = cam.d * Math.tan(fov / 2) * 2 / (canvas.getBoundingClientRect().height || 1);
      for (var i = 0; i < 3; i++) cam.t[i] += (-r[i] * dx + u[i] * dy) * s;
      cam.t[1] = Math.max(-size * 0.2, Math.min(size * 1.2, cam.t[1])); dirty = true;
    }
    // walking: turn the view about the eye (up and down stop just short of straight, as in the game)
    function look(dx, dy, k) {
      var e = eye(); k = k || 0.004;
      cam.th = (cam.th - dx * k) % (2 * Math.PI); cam.ph = Math.max(-1.53, Math.min(1.53, cam.ph + dy * k));
      var c = Math.cos(cam.ph);
      cam.t = [e[0] - cam.d * c * Math.sin(cam.th), e[1] - cam.d * Math.sin(cam.ph), e[2] - cam.d * c * Math.cos(cam.th)];
      dirty = true;
    }
    // ---------- walking: a person on the floor, first person, moving like Counter-Strike: Source ----------
    // Source units are inches; the numbers are the game's defaults (speeds, friction, acceleration, gravity, jump, step, player box).
    var IN = 0.0254, PM = { run: 250 * IN, walk: 250 * IN * 0.52, duck: 250 * IN * 0.34, acc: 5, air: 10, airCap: 30 * IN, fric: 4, stop: 75 * IN, grav: 800 * IN,
      jump: Math.sqrt(2 * 800 * 21) * IN, step: 18 * IN, r: 16 * IN, hS: 72 * IN, hD: 36 * IN, eS: 64 * IN, eD: 28 * IN };
    var HF = null, pl = null, hand = null;
    // the machine as columns of small boxes (8 cm wide, 5 cm high), filled from points spread over every triangle
    function buildHF() {
      var cell = 0.08, hb = 0.05, half = radius + 0.6, n = Math.ceil(2 * half / cell), B = Math.ceil(span[1] / hb) + 2, occ = new Uint8Array(n * n * B), c = yawU[0], s = yawU[1];
      function put(x, y, z) { var cx = Math.floor((x + half) / cell), cz = Math.floor((z + half) / cell), b = Math.floor(y / hb); if (cx < 0 || cz < 0 || cx >= n || cz >= n || b < 0) return; if (b >= B) b = B - 1; occ[(cz * n + cx) * B + b] = 1; }
      model.draws.forEach(function (d) {
        var p = d.p, k, m = p.length / 3, W = new Float32Array(p.length), ix = d.ix;
        for (k = 0; k < m; k++) { var x = mn[0] + p[k * 3] / 65535 * span[0] + shift[0], y = mn[1] + p[k * 3 + 1] / 65535 * span[1] + shift[1], z = mn[2] + p[k * 3 + 2] / 65535 * span[2] + shift[2]; W[k * 3] = c * x + s * z; W[k * 3 + 1] = y; W[k * 3 + 2] = -s * x + c * z; }
        for (k = 0; k < ix.length; k += 3) {
          var a = ix[k] * 3, b = ix[k + 1] * 3, e = ix[k + 2] * 3;
          var L = Math.max(Math.hypot(W[a] - W[b], W[a + 1] - W[b + 1], W[a + 2] - W[b + 2]), Math.hypot(W[a] - W[e], W[a + 1] - W[e + 1], W[a + 2] - W[e + 2]), Math.hypot(W[b] - W[e], W[b + 1] - W[e + 1], W[b + 2] - W[e + 2]));
          var q = Math.min(300, Math.max(1, Math.ceil(L / 0.035)));
          for (var i = 0; i <= q; i++) for (var j = 0; i + j <= q; j++) { var u = i / q, v = j / q, w = 1 - u - v; put(W[a] * w + W[b] * u + W[e] * v, W[a + 1] * w + W[b + 1] * u + W[e + 1] * v, W[a + 2] * w + W[b + 2] * u + W[e + 2] * v); }
        }
      });
      HF = { cell: cell, hb: hb, half: half, n: n, B: B, occ: occ };
    }
    // calls f(base index) for every column under a person standing at x, z
    function cols(x, z, f) {
      var H = HF, r = PM.r, c0 = Math.floor((x - r + H.half) / H.cell), c1 = Math.floor((x + r + H.half) / H.cell), r0 = Math.floor((z - r + H.half) / H.cell), r1 = Math.floor((z + r + H.half) / H.cell);
      for (var cz = Math.max(0, r0); cz <= Math.min(H.n - 1, r1); cz++) for (var cx = Math.max(0, c0); cx <= Math.min(H.n - 1, c1); cx++) {
        var px = (cx + 0.5) * H.cell - H.half, pz = (cz + 0.5) * H.cell - H.half;
        if (Math.hypot(px - x, pz - z) > r + H.cell * 0.5) continue;
        if (f((cz * H.n + cx) * H.B) === false) return;
      }
    }
    // anything of the machine inside the person's body between heights y0 and y1?
    function solid(x, z, y0, y1) {
      var H = HF, b0 = Math.max(0, Math.floor(y0 / H.hb)), b1 = Math.min(H.B - 1, Math.floor(y1 / H.hb)), hit = false;
      if (b1 < b0) return false;
      cols(x, z, function (o) { for (var b = b0; b <= b1; b++) if (H.occ[o + b]) { hit = true; return false; } });
      return hit;
    }
    // the highest surface under the person that is no higher than y
    function ground(x, z, y) {
      var H = HF, top = Math.min(H.B - 1, Math.floor(y / H.hb) - 1), g = 0;
      if (top < 0) return 0;
      cols(x, z, function (o) { for (var b = top; b >= 0; b--) if (H.occ[o + b]) { if ((b + 1) * H.hb > g) g = (b + 1) * H.hb; break; } });
      return g;
    }
    function walkStart() {
      if (!HF) buildHF();
      var e = eye(), l = Math.hypot(e[0], e[2]) || 1, dist = Math.max(radius + 1.4, 3.2), x = e[0] / l * dist, z = e[2] / l * dist;
      pl = { x: x, z: z, y: ground(x, z, 50), vx: 0, vz: 0, vy: 0, on: true, duck: 0, jh: false, eo: 0, bob: 0, poke: 0, sx: 0, sy: 0, hx: 0, hy: 0, land: 0, amp: 0 };
      cam.th = Math.atan2(x, z); cam.ph = 0.04; cam.d = 0.3; mapR = 0;
      walkCam();
    }
    function walkCam() {
      var ey = pl.y + PM.eS + (PM.eD - PM.eS) * pl.duck + pl.eo, c = Math.cos(cam.ph);
      cam.t = [pl.x - cam.d * c * Math.sin(cam.th), ey - cam.d * Math.sin(cam.ph), pl.z - cam.d * c * Math.cos(cam.th)];
      dirty = true;
    }
    function walk(dt, kf, kr) {
      var p = pl, h = PM.hS + (PM.hD - PM.hS) * p.duck;
      // crouch (in the air the legs come up: crouch jump)
      var want = keys.slow || keys.q, d0 = p.duck;
      if (want) p.duck = Math.min(1, p.duck + dt / 0.2);
      else if (p.duck > 0 && !solid(p.x, p.z, p.y + h + 0.01, p.y + PM.hS)) p.duck = Math.max(0, p.duck - dt / 0.2);
      if (!p.on && p.duck !== d0) { var lift = (p.duck - d0) * (PM.hS - PM.hD); p.y += lift; if (lift < 0) p.y = Math.max(p.y, ground(p.x, p.z, p.y - lift + 0.01)); }
      h = PM.hS + (PM.hD - PM.hS) * p.duck;
      // jump (one per press, as in the game)
      if (keys.space && !p.jh && p.on) { p.vy = PM.jump; p.on = false; }
      p.jh = !!keys.space;
      // friction, then acceleration towards the keys
      var sp = Math.hypot(p.vx, p.vz);
      if (p.on && sp > 0) { var drop = Math.max(sp, PM.stop) * PM.fric * dt, ns = Math.max(sp - drop, 0) / sp; p.vx *= ns; p.vz *= ns; }
      var fx = -Math.sin(cam.th), fz = -Math.cos(cam.th), wx = fx * kf + Math.cos(cam.th) * kr, wz = fz * kf - Math.sin(cam.th) * kr, wl = Math.hypot(wx, wz);
      if (wl) {
        wx /= wl; wz /= wl;
        var ws = p.duck > 0.5 ? PM.duck : keys.shift ? PM.walk : PM.run, cap = p.on ? ws : PM.airCap, a = p.on ? PM.acc : PM.air;
        var add = Math.min(ws, cap) - (p.vx * wx + p.vz * wz);
        if (add > 0) { var as = Math.min(a * ws * dt, add); p.vx += as * wx; p.vz += as * wz; }
      }
      // move, sliding along whatever is in the way; on the ground small steps are climbed
      var lo = p.y + (p.on ? PM.step : 0.02), hi = p.y + h, nx = p.x + p.vx * dt, nz = p.z + p.vz * dt;
      var lim = Math.max(size * 2, 10), free = function (x, z) { return Math.hypot(x, z) < lim && !solid(x, z, lo, hi); };
      if (free(nx, nz)) { p.x = nx; p.z = nz; }
      else if (free(nx, p.z)) { p.x = nx; p.vz = 0; }
      else if (free(p.x, nz)) { p.z = nz; p.vx = 0; }
      else { p.vx = 0; p.vz = 0; }
      // up and down
      if (p.on) {
        var g = ground(p.x, p.z, p.y + PM.step + 0.001);
        if (g >= p.y - PM.step) { if (g > p.y) p.eo -= g - p.y; p.y = g; } else p.on = false;
      }
      if (!p.on) {
        p.vy -= PM.grav * dt;
        var ny = p.y + p.vy * dt;
        if (p.vy > 0 && solid(p.x, p.z, p.y + h + 0.01, ny + h + 0.02)) { p.vy = 0; ny = p.y; }
        var g2 = ground(p.x, p.z, p.y + 0.03);
        if (ny <= g2) { p.land = Math.min(1, -p.vy / 6); p.y = g2; p.vy = 0; p.on = true; } else p.y = ny;
      }
      p.eo *= Math.exp(-dt * 12); if (Math.abs(p.eo) < 0.001) p.eo = 0;
      // the hand: bob while walking, lag behind the mouse, dip on landing, poke on click
      var hs = Math.hypot(p.vx, p.vz);
      if (p.on) p.bob += dt * hs / PM.run * (2 * Math.PI / 0.8);
      p.hx += (Math.max(-0.025, Math.min(0.025, -p.sx * 0.00012)) - p.hx) * Math.min(1, dt * 10); p.hy += (Math.max(-0.02, Math.min(0.02, p.sy * 0.0001)) - p.hy) * Math.min(1, dt * 10); p.sx = 0; p.sy = 0;
      p.land *= Math.exp(-dt * 7); p.poke = Math.max(0, p.poke - dt / 0.28);
      p.amp = (p.amp || 0) + ((p.on ? Math.min(1, hs / PM.run) : 0) - (p.amp || 0)) * Math.min(1, dt * 8);
      walkCam();
    }
    function drawHand(w, h) {
      if (!hand) {
        var m = handMesh(), prog = compile(gl, HVS, HFS), vao = gl.createVertexArray(); gl.bindVertexArray(vao);
        [m.p, m.n, m.c].forEach(function (arr, i) { var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW); gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 0, 0); });
        gl.bindVertexArray(null); hand = { prog: prog, vao: vao, count: m.count };
      }
      var p = pl, bx = Math.sin(p.bob) * 0.006 * p.amp, by = -Math.abs(Math.cos(p.bob)) * 0.005 * p.amp, k = 1 - p.poke, poke = p.poke > 0 ? Math.sin(Math.PI * k) * 0.055 : 0;
      var air = p.on ? 0 : Math.max(-0.012, Math.min(0.012, -p.vy * 0.003));
      var M = mul(trans(0.175 + bx + p.hx, -0.118 + by + p.hy - p.land * 0.02 + air - p.duck * 0.006, -0.37 - poke), mul(rotY(0.24 - poke * 0.3), mul(rotX(0.1 + poke * 0.3), rotZ(0.42))));
      gl.clear(gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE);
      gl.useProgram(hand.prog.p); gl.uniformMatrix4fv(hand.prog.u.uP, false, persp(0.95, w / h, 0.01, 3)); gl.uniformMatrix4fv(hand.prog.u.uM, false, M); gl.uniform3fv(hand.prog.u.uL, norm([-0.35, 0.8, 0.45]));
      gl.bindVertexArray(hand.vao); gl.drawArrays(gl.TRIANGLES, 0, hand.count); gl.bindVertexArray(null);
    }
    // round minimap, north up: the machine seen from above (darker = higher), you as an orange dot with your field of view
    var foot = null, mapR = 0;
    function footprint() {
      var H = HF, c = document.createElement("canvas"); c.width = c.height = H.n;
      var g = c.getContext("2d"), img = g.createImageData(H.n, H.n), d = img.data;
      for (var cz = 0; cz < H.n; cz++) for (var cx = 0; cx < H.n; cx++) {
        var o = (cz * H.n + cx) * H.B, top = -1;
        for (var b = H.B - 1; b >= 0; b--) if (H.occ[o + b]) { top = b; break; }
        if (top < 0) continue;
        var k = (cz * H.n + cx) * 4, h = top / (H.B - 1);
        d[k] = 74; d[k + 1] = 68; d[k + 2] = 70; d[k + 3] = Math.round(70 + 185 * Math.sqrt(h));
      }
      g.putImageData(img, 0, 0); foot = c;
    }
    function drawMap(asp) {
      var mc = opt.map; if (!mc || !pl || !HF) return;
      if (!foot) footprint();
      var dpr = Math.min(2, window.devicePixelRatio || 1), W = Math.round((mc.clientWidth || 150) * dpr);
      if (!W) return;
      if (mc.width !== W) { mc.width = W; mc.height = W; }
      var g = mc.getContext("2d"), R = W / 2, want = Math.max(radius * 1.6, Math.hypot(pl.x, pl.z) * 1.18 + 1);
      mapR = mapR ? mapR + (want - mapR) * 0.06 : want;
      var s = (R - 3 * dpr) / mapR, px = R + pl.x * s, py = R + pl.z * s;
      g.clearRect(0, 0, W, W); g.save();
      g.beginPath(); g.arc(R, R, R - dpr, 0, 2 * Math.PI); g.clip();
      g.fillStyle = "rgba(255,255,255,.93)"; g.fillRect(0, 0, W, W);
      // rings every metre (every 5 m a little darker)
      g.lineWidth = dpr;
      for (var m = 1; m * s < R * 1.5; m++) { g.strokeStyle = m % 5 ? "rgba(35,31,32,.06)" : "rgba(35,31,32,.13)"; g.beginPath(); g.arc(R, R, m * s, 0, 2 * Math.PI); g.stroke(); }
      g.imageSmoothingEnabled = true; g.drawImage(foot, R - HF.half * s, R - HF.half * s, 2 * HF.half * s, 2 * HF.half * s);
      // field of view and the walker
      var a = Math.atan2(-Math.cos(cam.th), -Math.sin(cam.th)), half = Math.atan(asp * Math.tan(Math.min(1.45, 2 * Math.atan(1 / asp)) / 2)), len = R * 0.55;
      var cone = g.createRadialGradient(px, py, 0, px, py, len); cone.addColorStop(0, "rgba(243,125,3,.38)"); cone.addColorStop(1, "rgba(243,125,3,0)");
      g.fillStyle = cone; g.beginPath(); g.moveTo(px, py); g.arc(px, py, len, a - half, a + half); g.closePath(); g.fill();
      g.fillStyle = "#f37d03"; g.strokeStyle = "#fff"; g.lineWidth = 2 * dpr;
      g.beginPath(); g.arc(px, py, 4.5 * dpr, 0, 2 * Math.PI); g.fill(); g.stroke();
      g.restore();
      g.strokeStyle = "rgba(35,31,32,.28)"; g.lineWidth = dpr; g.beginPath(); g.arc(R, R, R - dpr * 0.5, 0, 2 * Math.PI); g.stroke();
      // north
      g.fillStyle = "rgba(35,31,32,.55)"; g.font = "700 " + Math.round(9 * dpr) + "px Montserrat, sans-serif"; g.textAlign = "center"; g.textBaseline = "top"; g.fillText("N", R, 4 * dpr);
    }
    function setMode(m) {
      var was = mode;
      mode = m; keys = {};
      if (m !== "walk" && locked()) document.exitPointerLock();
      if (opt.map) opt.map.hidden = m !== "walk";
      if (m === "walk") { anim = null; walkStart(); stopSpin(); return; }
      if (was === "walk") { pl = null; cam.d = START.d; cam.t = START.t.slice(); cam.ph = START.ph; anim = null; }
      cam.ph = Math.max(-0.05, Math.min(1.45, cam.ph));
      stopSpin(); dirty = true;
    }
    function reset() { anim = { t0: performance.now(), from: { th: cam.th, ph: cam.ph, d: cam.d, t: cam.t.slice() }, to: { th: START.th + Math.round((cam.th - START.th) / (2 * Math.PI)) * 2 * Math.PI, ph: START.ph, d: START.d, t: START.t.slice() } }; }
    return {
      reset: reset,
      mode: setMode,
      key: function (k, on) { keys[k] = on; if (on) { stopSpin(); anim = null; } },
      spin: function (v) { spin = v; dirty = true; },
      spinning: function () { return spin; },
      redraw: function () { size2(); draw(); },
      view: function (th, ph, d) { cam.th = th; cam.ph = ph; if (d) cam.d = size * d; dirty = true; },
      destroy: function () { alive = false; if (locked()) document.exitPointerLock(); var ext = gl.getExtension("WEBGL_lose_context"); if (ext) ext.loseContext(); }
    };
  }
  window.BK3D = { fetchModel: fetchModel, Viewer: Viewer };

  // ---------- page wiring ----------
  figs.forEach(function (fig) {
    var go = fig.querySelector(".m3d__go");
    if (!go) return;
    if (!window.WebGL2RenderingContext) { go.hidden = true; return; }
    go.addEventListener("click", function () { open(fig); });
  });
  // phones and tablets (touch only): turn and move. With a mouse and keyboard there is also walking.
  var TOUCH = !!(window.matchMedia && matchMedia("(pointer: coarse)").matches && !matchMedia("(any-pointer: fine)").matches);
  function button(cls, label, icon) { var b = document.createElement("button"); b.type = "button"; b.className = "m3d__btn " + cls; b.setAttribute("aria-label", label); b.title = label; b.innerHTML = icon; return b; }
  function open(fig) {
    if (fig.classList.contains("is-3d")) return;
    fig.classList.add("is-3d", "is-loading");
    var stage = document.createElement("div"); stage.className = "m3d__stage";
    var bar = document.createElement("div"); bar.className = "m3d__load"; bar.innerHTML = '<span class="m3d__loadt">' + L.loading + '</span><span class="m3d__track"><span class="m3d__fill"></span></span>';
    stage.appendChild(bar); fig.appendChild(stage);
    var fill = bar.querySelector(".m3d__fill");
    fetchModel(fig.getAttribute("data-src"), function (k) { fill.style.width = Math.round(k * 100) + "%"; }).then(function (model) {
      var canvas = document.createElement("canvas"); canvas.className = "m3d__canvas"; canvas.tabIndex = 0;
      canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", (fig.getAttribute("data-label") || "") + ". " + L.hOrbit + (TOUCH ? "" : " " + L.hWalk));
      stage.appendChild(canvas);
      var tools = document.createElement("div"); tools.className = "m3d__tools";
      var bSpin = button("m3d__spin is-on", L.spin, ICON.spin), bReset = button("", L.reset, ICON.reset), bFull = button("", L.full, ICON.full), bClose = button("", L.close, ICON.close);
      bSpin.setAttribute("aria-pressed", "true");
      [bSpin, bReset, bFull, bClose].forEach(function (b) { tools.appendChild(b); });
      if (!(document.fullscreenEnabled || document.webkitFullscreenEnabled)) bFull.hidden = true;
      var hint = document.createElement("p"); hint.className = "m3d__hint"; hint.textContent = L.hOrbit;
      // camera modes: turn, move, walk
      var modes = document.createElement("div"); modes.className = "m3d__modes"; modes.setAttribute("role", "group"); modes.setAttribute("aria-label", L.modes);
      var MB = {};
      function addMode(m) {
        var b = button("m3d__mode" + (m === "orbit" ? " is-on" : ""), L[m], ICON[m]); b.setAttribute("aria-pressed", m === "orbit" ? "true" : "false");
        b.addEventListener("click", function () { pick(m); canvas.focus({ preventScroll: true }); });
        modes.appendChild(b); MB[m] = b;
      }
      (TOUCH ? ["orbit", "pan"] : ["orbit", "pan", "walk"]).forEach(addMode);
      var map = document.createElement("canvas"); map.className = "m3d__map"; map.hidden = true; map.setAttribute("aria-hidden", "true");
      tools.insertBefore(modes, tools.firstChild);
      var cross = document.createElement("span"); cross.className = "m3d__cross"; cross.setAttribute("aria-hidden", "true");
      document.addEventListener("pointerlockchange", function () { stage.classList.toggle("is-locked", document.pointerLockElement === canvas); });
      function pick(m) {
        Object.keys(MB).forEach(function (k) { MB[k].classList.toggle("is-on", k === m); MB[k].setAttribute("aria-pressed", k === m ? "true" : "false"); });
        stage.classList.toggle("is-fly", m === "walk"); stage.classList.toggle("is-walk", m === "walk");
        hint.textContent = L["h" + m.charAt(0).toUpperCase() + m.slice(1)]; hint.classList.remove("is-gone");
        clearTimeout(pick.t); pick.t = setTimeout(function () { hint.classList.add("is-gone"); }, 7000);
        if (v) { v.mode(m); bSpin.classList.remove("is-on"); bSpin.setAttribute("aria-pressed", "false"); }
      }
      stage.appendChild(map); stage.appendChild(tools); stage.appendChild(hint); stage.appendChild(cross);
      // versions of the same machine (e.g. pneumatic and hydraulic): switch the model in place
      var variants = []; try { variants = JSON.parse(fig.getAttribute("data-variants") || "[]"); } catch (err) { variants = []; }
      if (variants.length > 1) {
        var vs = document.createElement("div"); vs.className = "m3d__variants"; vs.setAttribute("role", "group");
        variants.forEach(function (x) {
          var b = document.createElement("button"); b.type = "button"; b.className = "m3d__variant" + (x.src === fig.getAttribute("data-src") ? " is-on" : ""); b.textContent = x.name;
          b.setAttribute("aria-pressed", x.src === fig.getAttribute("data-src") ? "true" : "false");
          b.addEventListener("click", function () {
            if (x.src === fig.getAttribute("data-src")) return;
            if (document.fullscreenElement) document.exitFullscreen();
            if (v) v.destroy(); stage.remove(); fig.classList.remove("is-3d");
            fig.setAttribute("data-src", x.src); fig.setAttribute("data-yaw", x.yaw || 0); open(fig);
          });
          vs.appendChild(b);
        });
        stage.appendChild(vs); stage.classList.add("has-variants");
      }
      var v = null;
      try {
        v = Viewer(canvas, model, { map: map, yaw: +(fig.getAttribute("data-yaw") || 0), onUse: function () { hint.classList.add("is-gone"); }, onSpin: function (on) { bSpin.classList.toggle("is-on", on); bSpin.setAttribute("aria-pressed", on ? "true" : "false"); } });
      } catch (err) { fail(); return; }
      bSpin.addEventListener("click", function () { var on = !v.spinning(); v.spin(on); bSpin.classList.toggle("is-on", on); bSpin.setAttribute("aria-pressed", on ? "true" : "false"); });
      bReset.addEventListener("click", function () { pick("orbit"); v.reset(); });
      bFull.addEventListener("click", function () {
        var fs = document.fullscreenElement || document.webkitFullscreenElement;
        if (fs) (document.exitFullscreen || document.webkitExitFullscreen).call(document); else (stage.requestFullscreen || stage.webkitRequestFullscreen).call(stage);
      });
      bClose.addEventListener("click", function () {
        if (document.fullscreenElement) document.exitFullscreen();
        v.destroy(); stage.remove(); fig.classList.remove("is-3d"); var g = fig.querySelector(".m3d__go"); if (g) g.focus();
      });
      fig.classList.remove("is-loading");
      bar.remove();
      canvas.focus({ preventScroll: true });
    }).catch(fail);
    function fail() { fig.classList.remove("is-loading", "is-3d"); stage.remove(); var p = document.createElement("p"); p.className = "m3d__fail"; p.textContent = L.failed; fig.appendChild(p); var g = fig.querySelector(".m3d__go"); if (g) g.hidden = true; }
  }
})();
