/* Human check for the quote form. No third parties, no cookies, nothing stored.
   Friction rather than a wall, in three layers:
     1. a short reaction game on a canvas: press Stop when the moving drill is over the hole, twice in a row. The target and speed are
        random every round and live only inside the canvas, so there is nothing in the page text for a script to read, and a screenshot
        a second later is already out of date. The game is easy for people (wide target, slow motion, unlimited tries, a keyboard
        works) and the e-mail address is always offered as the way around it.
     2. the form cannot be sent faster than a person could write it (minimum fill time).
     3. a small proof of work (a few tenths of a second for one visitor, expensive for thousands of submissions) whose result travels
        with the request so the database can check it itself (see tools/supabase-quotes.sql). */
(function () {
  "use strict";

  // ---------- SHA-256 (synchronous, for the proof of work) ----------
  var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  var W = new Array(64);
  function sha256(str) {
    var s = unescape(encodeURIComponent(str)), len = s.length, words = [], i, j, t;
    for (i = 0; i < len; i++) words[i >> 2] |= s.charCodeAt(i) << (24 - (i % 4) * 8);
    words[len >> 2] |= 0x80 << (24 - (len % 4) * 8);
    var total = (((len + 8) >> 6) + 1) << 4;
    for (i = 0; i < total; i++) if (!words[i]) words[i] = 0;
    words[total - 1] = len * 8;
    var h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a, h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    for (j = 0; j < total; j += 16) {
      for (t = 0; t < 64; t++) {
        if (t < 16) W[t] = words[j + t];
        else {
          var a15 = W[t - 15], a2 = W[t - 2];
          W[t] = (((a2 >>> 17) | (a2 << 15)) ^ ((a2 >>> 19) | (a2 << 13)) ^ (a2 >>> 10)) + W[t - 7] + (((a15 >>> 7) | (a15 << 25)) ^ ((a15 >>> 18) | (a15 << 14)) ^ (a15 >>> 3)) + W[t - 16] | 0;
        }
      }
      var a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      for (t = 0; t < 64; t++) {
        var t1 = h + (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) + ((e & f) ^ (~e & g)) + K[t] + W[t] | 0;
        var t2 = (((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) + ((a & b) ^ (a & c) ^ (b & c)) | 0;
        h = g; g = f; f = e; e = d + t1 | 0; d = c; c = b; b = a; a = t1 + t2 | 0;
      }
      h0 = h0 + a | 0; h1 = h1 + b | 0; h2 = h2 + c | 0; h3 = h3 + d | 0; h4 = h4 + e | 0; h5 = h5 + f | 0; h6 = h6 + g | 0; h7 = h7 + h | 0;
    }
    return [h0, h1, h2, h3, h4, h5, h6, h7].map(function (x) { return ("00000000" + (x >>> 0).toString(16)).slice(-8); }).join("");
  }

  // ---------- proof of work: find a number so that sha256(email|time|number) starts with four zero hex digits (16 bits) ----------
  function work(seed, onTick) {
    return new Promise(function (resolve) {
      var n = 0;
      (function chunk() {
        var stop = n + 3000;
        for (; n < stop; n++) if (sha256(seed + "|" + n).slice(0, 4) === "0000") { resolve(n); return; }
        if (onTick) onTick(n);
        setTimeout(chunk, 0);
      })();
    });
  }

  // ---------- the reaction game ----------
  function mount(form, tx) {
    var T = tx || {};
    var box = document.createElement("div");
    box.className = "qg";
    box.innerHTML =
      '<p class="qg__t"><b></b> <span class="qg__dots" aria-hidden="true"></span></p>' +
      '<p class="qg__h"></p>' +
      '<canvas class="qg__c" width="420" height="96" role="img"></canvas>' +
      '<div class="qg__row"><button type="button" class="btn qg__stop"></button><span class="qg__msg" role="status" aria-live="polite"></span></div>' +
      '<p class="qg__alt"></p>';
    var anchor = form.querySelector(".qf__consent") || form.querySelector("button[type=submit]");
    anchor.parentNode.insertBefore(box, anchor);
    box.querySelector(".qg__t b").textContent = T.title || "";
    box.querySelector(".qg__h").textContent = T.help || "";
    var canvas = box.querySelector("canvas"), stopBtn = box.querySelector(".qg__stop"), msg = box.querySelector(".qg__msg"), dots = box.querySelector(".qg__dots");
    canvas.setAttribute("aria-label", T.canvas || "");
    stopBtn.textContent = T.stop || "Stop";
    var alt = box.querySelector(".qg__alt");
    if (T.mail) { alt.innerHTML = ""; alt.appendChild(document.createTextNode((T.alt || "") + " ")); var a = document.createElement("a"); a.href = "mailto:" + T.mail; a.textContent = T.mail; alt.appendChild(a); } else alt.hidden = true;

    var ctx = canvas.getContext("2d"), ratio = Math.min(2, window.devicePixelRatio || 1), cw = 0, chh = 0;
    function size() {
      var w = Math.max(240, Math.min(560, canvas.parentNode.clientWidth)), h = 96;
      cw = w; chh = h; canvas.style.width = w + "px"; canvas.style.height = h + "px";
      canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio); ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    size();
    window.addEventListener("resize", function () { size(); draw(performance.now()); });

    var NEED = 2, state = { hits: 0, misses: 0, passed: false, running: false, lockUntil: 0, t0: 0, started: 0 };
    var round = null, flash = null, raf = 0;
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function newRound(now) {
      var slow = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var zw = slow ? 0.3 : 0.25;
      round = { period: rnd(2.3, 3.4) * 1000 * (slow ? 1.2 : 1), phase: Math.random(), zc: rnd(zw / 2 + 0.08, 1 - zw / 2 - 0.08), zw: zw, t0: now };
    }
    function posAt(now) { var q = ((now - round.t0) / round.period + round.phase) % 1; return q < 0.5 ? q * 2 : 2 - q * 2; } // 0..1..0
    function paintDots() { var s = ""; for (var i = 0; i < NEED; i++) s += i < state.hits ? "● " : "○ "; dots.textContent = s.trim(); }
    paintDots();

    function draw(now) {
      var w = cw, h = chh, pad = 14, bit = 30, x0 = pad + bit / 2, x1 = w - pad - bit / 2;
      ctx.clearRect(0, 0, w, h);
      // ground
      ctx.fillStyle = "#231f20"; ctx.fillRect(0, 0, w, h);
      var gy = h - 26;
      ctx.fillStyle = "#4a4446"; ctx.fillRect(0, gy, w, 26);
      if (round) {
        // the hole in the ground
        var zx = x0 + (round.zc - round.zw / 2) * (x1 - x0), zwpx = round.zw * (x1 - x0);
        ctx.fillStyle = "#f58220"; ctx.fillRect(zx, gy, zwpx, 26);
        ctx.fillStyle = "rgba(0,0,0,.28)"; for (var i = 0; i < zwpx; i += 8) ctx.fillRect(zx + i, gy, 3, 26);
        // the drill
        var x = state.passed ? w / 2 : x0 + posAt(now) * (x1 - x0);
        ctx.fillStyle = "#ffffff"; ctx.fillRect(x - bit / 2, 10, bit, 24);
        ctx.fillStyle = "#f58220"; ctx.fillRect(x - bit / 2, 10, bit, 6);
        ctx.fillStyle = "#d9d5d0"; ctx.beginPath(); ctx.moveTo(x - 7, 34); ctx.lineTo(x + 7, 34); ctx.lineTo(x, gy - 2); ctx.closePath(); ctx.fill();
      }
      if (flash && now - flash.t < 450) {
        ctx.fillStyle = flash.ok ? "rgba(46,160,67,.35)" : "rgba(179,38,30,.4)"; ctx.fillRect(0, 0, w, h);
      }
      if (state.passed) {
        ctx.fillStyle = "rgba(46,160,67,.9)"; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#fff"; ctx.font = "700 18px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("✓ " + (T.ok || "OK"), w / 2, h / 2);
      }
    }
    function loop(now) {
      if (!state.running) return;
      draw(now); raf = requestAnimationFrame(loop);
      if (state.lockUntil) {
        var left = Math.ceil((state.lockUntil - now) / 1000);
        if (left <= 0) { state.lockUntil = 0; stopBtn.disabled = false; msg.textContent = ""; }
        else msg.textContent = (T.lock || "Wait {s} s").replace("{s}", String(left));
      }
    }
    function start() { if (state.running || state.passed) return; state.running = true; state.started = state.started || performance.now(); if (!round) newRound(performance.now()); raf = requestAnimationFrame(loop); }
    function pause() { state.running = false; cancelAnimationFrame(raf); }
    function press() {
      if (state.passed) return;
      var now = performance.now();
      if (!state.running) { start(); return; }
      if (state.lockUntil && now < state.lockUntil) return;
      var x = posAt(now), hit = Math.abs(x - round.zc) <= round.zw / 2;
      flash = { t: now, ok: hit };
      if (hit) {
        state.hits++; paintDots();
        if (state.hits >= NEED) { state.passed = true; state.ms = Math.round(now - state.started); pause(); draw(now); msg.textContent = T.ok || ""; box.classList.add("is-ok"); stopBtn.disabled = true; return; }
        msg.textContent = T.next || "";
        newRound(now);
      } else {
        state.misses++; state.hits = 0; paintDots(); newRound(now);
        msg.textContent = T.miss || "";
        if (state.misses % 4 === 0) { state.lockUntil = now + 10000; stopBtn.disabled = true; }
      }
    }
    stopBtn.addEventListener("click", press);
    canvas.addEventListener("pointerdown", function (e) { if (e.pointerType === "mouse" && e.button !== 0) return; press(); });
    // it only moves while it is on screen, and starts when the visitor reaches the form
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { if (state.passed) return; if (en[0].isIntersecting) start(); else pause(); }, { threshold: 0.4 }).observe(box);
    else start();
    draw(performance.now());

    return {
      passed: function () { return state.passed; },
      nudge: function () { box.classList.add("is-need"); setTimeout(function () { box.classList.remove("is-need"); }, 1600); try { box.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) { /* ignore */ } stopBtn.focus({ preventScroll: true }); },
      stats: function () { return { hits: state.hits, misses: state.misses, game_ms: state.ms || 0 }; }
    };
  }

  window.bkGuard = { mount: mount, work: work, sha256: sha256 };
})();
