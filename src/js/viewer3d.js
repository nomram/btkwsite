/* 3D viewer for machine models (no libraries, no third parties).
   Markup (render.mjs, block "model3d"):
     <figure class="m3d" data-src="/assets/3d/x.bkm" data-label="..."> <img class="m3d__poster"> <button class="m3d__go">..</button> </figure>
   The model file is only fetched when the visitor asks for it. Format: see tools/glb-compact.mjs.
   Three modes (buttons): turn (drag orbits), move (drag moves the camera sideways and up/down) and fly (drag looks around).
   In every mode: W A S D flies, Q / E down and up, Shift faster, wheel / pinch zoom, right drag or two fingers move,
   double click = start view. Every machine is turned to face the same way (its mast, the highest part, front right). */
(function () {
  "use strict";
  var figs = [].slice.call(document.querySelectorAll(".m3d"));
  var LANGS = {
    sv: { loading: "Hämtar 3D-modellen", failed: "3D-modellen kunde inte visas i den här webbläsaren.", spin: "Rotera automatiskt", reset: "Startvy", full: "Helskärm", close: "Tillbaka till bilden",
      orbit: "Vrid", pan: "Flytta", fly: "Flyg", hOrbit: "Dra för att vrida, scrolla eller nyp för att zooma.", hPan: "Dra för att flytta kameran i sidled och höjdled.", hFly: "Dra för att titta runt. W A S D flyttar, Q och E ner och upp, Shift går fortare.",
      fwd: "Framåt", back: "Bakåt", left: "Vänster", right: "Höger", up: "Upp", down: "Ner", modes: "Kameraläge" },
    en: { loading: "Loading the 3D model", failed: "The 3D model cannot be shown in this browser.", spin: "Rotate automatically", reset: "Start view", full: "Full screen", close: "Back to the picture",
      orbit: "Turn", pan: "Move", fly: "Fly", hOrbit: "Drag to turn, scroll or pinch to zoom.", hPan: "Drag to move the camera sideways and up or down.", hFly: "Drag to look around. W A S D moves, Q and E down and up, Shift goes faster.",
      fwd: "Forward", back: "Back", left: "Left", right: "Right", up: "Up", down: "Down", modes: "Camera mode" },
    es: { loading: "Cargando el modelo 3D", failed: "El modelo 3D no se puede mostrar en este navegador.", spin: "Girar automáticamente", reset: "Vista inicial", full: "Pantalla completa", close: "Volver a la imagen",
      orbit: "Girar", pan: "Mover", fly: "Volar", hOrbit: "Arrastra para girar, desplaza o pellizca para ampliar.", hPan: "Arrastra para mover la cámara a los lados y en altura.", hFly: "Arrastra para mirar alrededor. W A S D mueve, Q y E bajan y suben, Mayús va más rápido.",
      fwd: "Adelante", back: "Atrás", left: "Izquierda", right: "Derecha", up: "Arriba", down: "Abajo", modes: "Modo de cámara" },
    no: { loading: "Henter 3D-modellen", failed: "3D-modellen kan ikke vises i denne nettleseren.", spin: "Roter automatisk", reset: "Startvisning", full: "Fullskjerm", close: "Tilbake til bildet",
      orbit: "Drei", pan: "Flytt", fly: "Fly", hOrbit: "Dra for å dreie, rull eller klyp for å zoome.", hPan: "Dra for å flytte kameraet sideveis og i høyden.", hFly: "Dra for å se deg rundt. W A S D flytter, Q og E ned og opp, Shift går fortere.",
      fwd: "Fremover", back: "Bakover", left: "Venstre", right: "Høyre", up: "Opp", down: "Ned", modes: "Kameramodus" },
    lt: { loading: "Įkeliamas 3D modelis", failed: "Šioje naršyklėje 3D modelio parodyti nepavyksta.", spin: "Sukti automatiškai", reset: "Pradinis vaizdas", full: "Visas ekranas", close: "Atgal į nuotrauką",
      orbit: "Sukti", pan: "Perkelti", fly: "Skristi", hOrbit: "Tempkite, kad pasuktumėte, slinkite arba suimkite pirštais, kad priartintumėte.", hPan: "Tempkite, kad perkeltumėte kamerą į šonus ir aukštyn ar žemyn.", hFly: "Tempkite, kad apsidairytumėte. W A S D judina, Q ir E žemyn ir aukštyn, Shift greičiau.",
      fwd: "Pirmyn", back: "Atgal", left: "Kairėn", right: "Dešinėn", up: "Aukštyn", down: "Žemyn", modes: "Kameros režimas" },
    lv: { loading: "Ielādē 3D modeli", failed: "Šajā pārlūkā 3D modeli nevar parādīt.", spin: "Griezt automātiski", reset: "Sākuma skats", full: "Pilnekrāns", close: "Atpakaļ uz attēlu",
      orbit: "Griezt", pan: "Pārvietot", fly: "Lidot", hOrbit: "Velciet, lai pagrieztu, ritiniet vai saspiediet, lai tuvinātu.", hPan: "Velciet, lai pārvietotu kameru uz sāniem un augšup vai lejup.", hFly: "Velciet, lai paskatītos apkārt. W A S D pārvieto, Q un E lejup un augšup, Shift ātrāk.",
      fwd: "Uz priekšu", back: "Atpakaļ", left: "Pa kreisi", right: "Pa labi", up: "Augšup", down: "Lejup", modes: "Kameras režīms" },
    et: { loading: "3D-mudeli laadimine", failed: "Selles brauseris ei saa 3D-mudelit näidata.", spin: "Pööra automaatselt", reset: "Algvaade", full: "Täisekraan", close: "Tagasi pildi juurde",
      orbit: "Pööra", pan: "Liiguta", fly: "Lenda", hOrbit: "Lohista pööramiseks, keri või näpista suumimiseks.", hPan: "Lohista, et liigutada kaamerat külgedele ja üles-alla.", hFly: "Lohista ringi vaatamiseks. W A S D liigutab, Q ja E alla ja üles, Shift kiiremini.",
      fwd: "Edasi", back: "Tagasi", left: "Vasakule", right: "Paremale", up: "Üles", down: "Alla", modes: "Kaamera režiim" },
    ru: { loading: "Загрузка 3D-модели", failed: "В этом браузере 3D-модель показать нельзя.", spin: "Автоматическое вращение", reset: "Исходный вид", full: "Во весь экран", close: "Назад к изображению",
      orbit: "Вращать", pan: "Сдвигать", fly: "Полёт", hOrbit: "Тяните, чтобы вращать, прокрутите или сведите пальцы для масштаба.", hPan: "Тяните, чтобы сдвигать камеру вбок и вверх или вниз.", hFly: "Тяните, чтобы осмотреться. W A S D — движение, Q и E — вниз и вверх, Shift — быстрее.",
      fwd: "Вперёд", back: "Назад", left: "Влево", right: "Вправо", up: "Вверх", down: "Вниз", modes: "Режим камеры" }
  };
  var lang = (document.documentElement.lang || "en").toLowerCase(), L = LANGS[lang.slice(0, 2)] || (/^(nb|nn)/.test(lang) ? LANGS.no : LANGS.en);
  var ICON = {
    orbit: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><ellipse cx="12" cy="12" rx="9" ry="3.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M16.5 6.2 19 8.6l-3 1"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/></svg>',
    pan: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M12 3v18M3 12h18M12 3 9.5 5.5M12 3l2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5M3 12l2.5-2.5M3 12l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5"/></svg>',
    fly: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" d="M2.5 13.5 21.5 5l-6.5 15-3.2-6.4z"/><path fill="none" stroke="currentColor" stroke-width="1.6" d="m11.8 13.6 9.7-8.6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6 14l6-6 6 6"/></svg>',
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
      var e = eye(), far = Math.hypot(e[0], e[1] - center[1], e[2]) + radius * 2.5 + size, vp = mul(persp(fov, w / h, size * 0.004, far), lookAt(e, cam.t, [0, 1, 0]));
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, smTex);
      // floor
      gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND);
      gl.useProgram(Gp.p); gl.uniformMatrix4fv(Gp.u.uVP, false, vp); gl.uniformMatrix4fv(Gp.u.uLVP, false, lvp); gl.uniform1f(Gp.u.uR, size * 2.2); gl.uniform1i(Gp.u.uSh, 0); gl.uniform1f(Gp.u.uTex, 1 / SM); gl.uniform3fv(Gp.u.uBg, bg);
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
      var kf = (keys.w ? 1 : 0) - (keys.s ? 1 : 0), kr = (keys.d ? 1 : 0) - (keys.a ? 1 : 0), ku = (keys.e ? 1 : 0) - (keys.q ? 1 : 0);
      if ((kf || kr || ku) && dt) { var sp = size * 0.45 * (keys.shift ? 3 : 1) * dt; move(kf * sp, kr * sp, ku * sp); }
      if (dirty) { draw(); dirty = false; }
      requestAnimationFrame(frame);
    }
    if (!opt.manual) requestAnimationFrame(frame);

    // pointer controls
    var drag = null, pts = {}, keys = {}, mode = "orbit";
    function stopSpin() { if (spin) { spin = false; if (opt.onSpin) opt.onSpin(false); } }
    canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    canvas.addEventListener("pointerdown", function (e) {
      canvas.setPointerCapture(e.pointerId); pts[e.pointerId] = { x: e.clientX, y: e.clientY }; canvas.focus({ preventScroll: true });
      drag = { pan: e.button === 2 || (e.shiftKey && mode !== "fly") || mode === "pan", x: e.clientX, y: e.clientY }; stopSpin(); anim = null; if (opt.onUse) opt.onUse();
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!pts[e.pointerId]) return;
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
      if (drag.pan) pan(dx, dy); else if (mode === "fly") look(dx, dy); else { cam.th -= dx * 0.008; cam.ph = Math.max(-0.05, Math.min(1.45, cam.ph + dy * 0.006)); }
      dirty = true;
    });
    function up(e) { delete pts[e.pointerId]; if (!Object.keys(pts).length) drag = null; }
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("wheel", function (e) { e.preventDefault(); stopSpin(); if (mode === "fly") move(-e.deltaY * (e.deltaMode ? 0.03 : 0.0009) * size, 0, 0); else zoom(Math.exp(e.deltaY * (e.deltaMode ? 0.05 : 0.0012))); }, { passive: false });
    canvas.addEventListener("dblclick", function () { reset(); });
    var KEYMAP = { w: "w", a: "a", s: "s", d: "d", q: "q", e: "e" };
    function keyOf(e) { var c = (e.code || "").replace(/^Key/, "").toLowerCase(); return KEYMAP[c] || KEYMAP[(e.key || "").toLowerCase()]; }
    canvas.addEventListener("keyup", function (e) { var k = keyOf(e); if (k) keys[k] = false; keys.shift = e.shiftKey; });
    canvas.addEventListener("blur", function () { keys = {}; });
    canvas.addEventListener("keydown", function (e) {
      var fk = keyOf(e);
      if (fk) { keys[fk] = true; keys.shift = e.shiftKey; e.preventDefault(); stopSpin(); anim = null; if (opt.onUse) opt.onUse(); return; }
      if (mode === "fly" && /^Arrow/.test(e.key)) { e.preventDefault(); stopSpin(); look(e.key === "ArrowLeft" ? -30 : e.key === "ArrowRight" ? 30 : 0, e.key === "ArrowUp" ? -24 : e.key === "ArrowDown" ? 24 : 0); return; }
      var k = e.key, used = true;
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
    // fly: move the camera (and the point it looks at) along the view, sideways and straight up
    function move(f, r, u) {
      var e = eye(), fw = norm(sub(cam.t, e)), rt = norm(cross(fw, [0, 1, 0]));
      for (var i = 0; i < 3; i++) cam.t[i] += fw[i] * f + rt[i] * r + (i === 1 ? u : 0);
      var e2 = eye(), low = size * 0.02; if (e2[1] < low) cam.t[1] += low - e2[1];
      dirty = true;
    }
    // fly: turn the view about the camera itself
    function look(dx, dy) {
      var e = eye();
      cam.th -= dx * 0.004; cam.ph = Math.max(-1.4, Math.min(1.4, cam.ph + dy * 0.004));
      var c = Math.cos(cam.ph);
      cam.t = [e[0] - cam.d * c * Math.sin(cam.th), e[1] - cam.d * Math.sin(cam.ph), e[2] - cam.d * c * Math.cos(cam.th)];
      dirty = true;
    }
    function setMode(m) {
      mode = m; keys = {};
      if (m === "fly") { var e = eye(), d = Math.max(size * 0.25, Math.min(cam.d, size * 0.6)), c = Math.cos(cam.ph); cam.d = d; cam.t = [e[0] - d * c * Math.sin(cam.th), e[1] - d * Math.sin(cam.ph), e[2] - d * c * Math.cos(cam.th)]; }
      else cam.ph = Math.max(-0.05, Math.min(1.45, cam.ph));
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
      destroy: function () { alive = false; var ext = gl.getExtension("WEBGL_lose_context"); if (ext) ext.loseContext(); }
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
      canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", (fig.getAttribute("data-label") || "") + ". " + L.hOrbit + " " + L.hFly);
      stage.appendChild(canvas);
      var tools = document.createElement("div"); tools.className = "m3d__tools";
      var bSpin = button("m3d__spin is-on", L.spin, ICON.spin), bReset = button("", L.reset, ICON.reset), bFull = button("", L.full, ICON.full), bClose = button("", L.close, ICON.close);
      bSpin.setAttribute("aria-pressed", "true");
      [bSpin, bReset, bFull, bClose].forEach(function (b) { tools.appendChild(b); });
      if (!(document.fullscreenEnabled || document.webkitFullscreenEnabled)) bFull.hidden = true;
      var hint = document.createElement("p"); hint.className = "m3d__hint"; hint.textContent = L.hOrbit;
      // camera modes: turn, move, fly
      var modes = document.createElement("div"); modes.className = "m3d__modes"; modes.setAttribute("role", "group"); modes.setAttribute("aria-label", L.modes);
      var MB = {};
      ["orbit", "pan", "fly"].forEach(function (m) {
        var b = document.createElement("button"); b.type = "button"; b.className = "m3d__mode" + (m === "orbit" ? " is-on" : ""); b.setAttribute("aria-pressed", m === "orbit" ? "true" : "false");
        b.innerHTML = ICON[m] + "<span>" + L[m] + "</span>"; b.title = L["h" + m.charAt(0).toUpperCase() + m.slice(1)];
        b.addEventListener("click", function () { pick(m); canvas.focus({ preventScroll: true }); });
        modes.appendChild(b); MB[m] = b;
      });
      // on-screen flying for touch screens (and anyone without a keyboard)
      var pad = document.createElement("div"); pad.className = "m3d__pad"; pad.hidden = true;
      [["w", L.fwd, 0], ["a", L.left, -90], ["s", L.back, 180], ["d", L.right, 90], ["e", L.up, 0], ["q", L.down, 180]].forEach(function (k) {
        var b = document.createElement("button"); b.type = "button"; b.className = "m3d__key m3d__key--" + k[0]; b.setAttribute("aria-label", k[1]); b.title = k[1];
        b.innerHTML = '<span style="transform:rotate(' + k[2] + 'deg)">' + ICON.arrow + "</span>" + (k[0] === "e" || k[0] === "q" ? "<small>" + (k[0] === "e" ? L.up : L.down) + "</small>" : "");
        var on = function (e) { e.preventDefault(); if (v) v.key(k[0], true); b.classList.add("is-down"); }, off = function () { if (v) v.key(k[0], false); b.classList.remove("is-down"); };
        b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointerleave", off); b.addEventListener("pointercancel", off);
        pad.appendChild(b);
      });
      function pick(m) {
        Object.keys(MB).forEach(function (k) { MB[k].classList.toggle("is-on", k === m); MB[k].setAttribute("aria-pressed", k === m ? "true" : "false"); });
        pad.hidden = m !== "fly"; stage.classList.toggle("is-fly", m === "fly");
        hint.textContent = L["h" + m.charAt(0).toUpperCase() + m.slice(1)]; hint.classList.remove("is-gone");
        clearTimeout(pick.t); pick.t = setTimeout(function () { hint.classList.add("is-gone"); }, 7000);
        if (v) { v.mode(m); bSpin.classList.remove("is-on"); bSpin.setAttribute("aria-pressed", "false"); }
      }
      stage.appendChild(modes); stage.appendChild(pad); stage.appendChild(tools); stage.appendChild(hint);
      var v = null;
      try {
        v = Viewer(canvas, model, { yaw: +(fig.getAttribute("data-yaw") || 0), onUse: function () { hint.classList.add("is-gone"); }, onSpin: function (on) { bSpin.classList.toggle("is-on", on); bSpin.setAttribute("aria-pressed", on ? "true" : "false"); } });
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
