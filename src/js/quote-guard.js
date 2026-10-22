/* Human check for the quote form. No third parties except one optional public clock, no cookies, nothing stored.
   Three light layers, friction rather than a wall:
     1. "Press and hold, release when it turns green": one familiar gesture, no text to read or puzzle to solve. The moment it turns
        green is random (about 1 to 2 seconds in) and lives only inside this script, so a script that fires instantly or a screenshot
        taken a few seconds later misses the window. People have a generous 1.5 seconds; keyboard (Space/Enter) works as well, and the
        e-mail address is always offered as the way around it.
     2. the form cannot be sent faster than a person could write it (minimum fill time, checked in the browser).
     3. a small proof of work tied to a public clock: the browser asks the drand randomness beacon (a free, public service run by a
        consortium of universities and companies) for its latest round. Each round carries a value nobody can know in advance, so the
        proof can only have been computed AFTER that round was published: proofs cannot be stockpiled or sold, and they go stale by
        themselves after a few minutes. Anyone can re-check a proof later with tools/verify-quotes.mjs. No database trigger and no
        server of ours is needed for that. If the beacon cannot be reached the page falls back to its own clock (weaker, and marked
        as such in the data). */
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

  // ---------- the public clock: latest drand round (quicknet: a new round every 3 s, value unknowable before it is published) ----------
  var BEACON = "https://api.drand.sh/v2/beacons/quicknet/rounds/latest";
  function beacon() {
    return new Promise(function (resolve) {
      if (!window.fetch) { resolve(null); return; }
      var done = false, timer = setTimeout(function () { if (!done) { done = true; resolve(null); } }, 2500);
      fetch(BEACON, { cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer" })
        .then(function (r) { if (!r.ok) throw new Error("beacon"); return r.json(); })
        .then(function (j) { if (!done) { done = true; clearTimeout(timer); resolve(j && j.round && j.signature ? { round: Number(j.round), sig: String(j.signature) } : null); } })
        .catch(function () { if (!done) { done = true; clearTimeout(timer); resolve(null); } });
    });
  }

  // ---------- proof of work: sha256(seed|nonce) must start with four zero hex digits (16 bits) ----------
  // seed = <round>:<beacon signature>|<e-mail>  (or "local:<time>|<e-mail>" without the beacon)
  function work(email) {
    return beacon().then(function (b) {
      var ts = Math.floor(Date.now() / 1000);
      var seed = (b ? b.round + ":" + b.sig : "local:" + ts) + "|" + email;
      return new Promise(function (resolve) {
        var n = 0;
        (function chunk() {
          var stop = n + 3000;
          for (; n < stop; n++) if (sha256(seed + "|" + n).slice(0, 4) === "0000") { resolve({ pow_round: b ? b.round : 0, pow_ts: ts, pow_nonce: n }); return; }
          setTimeout(chunk, 0);
        })();
      });
    });
  }

  // ---------- the control: press and hold, release when it turns green ----------
  function mount(form, tx) {
    var T = tx || {};
    var box = document.createElement("div");
    box.className = "qg";
    box.innerHTML =
      '<button type="button" class="qg__btn" aria-describedby="qg-help">' +
        '<svg class="qg__ring" viewBox="0 0 44 44" aria-hidden="true"><circle class="qg__track" cx="22" cy="22" r="18"/><circle class="qg__prog" cx="22" cy="22" r="18" pathLength="100"/><path class="qg__tick" d="M14 23l6 6 11-13"/></svg>' +
        '<span class="qg__label"></span>' +
      '</button>' +
      '<p class="qg__help" id="qg-help"></p><span class="sr-only qg__sr" role="status" aria-live="polite"></span>' +
      '<p class="qg__alt"></p>';
    var anchor = form.querySelector(".qf__consent") || form.querySelector("button[type=submit]");
    anchor.parentNode.insertBefore(box, anchor);
    var btn = box.querySelector(".qg__btn"), label = box.querySelector(".qg__label"), help = box.querySelector(".qg__help"), prog = box.querySelector(".qg__prog"), sr = box.querySelector(".qg__sr");
    var alt = box.querySelector(".qg__alt");
    if (T.mail) { alt.appendChild(document.createTextNode((T.alt || "") + " ")); var a = document.createElement("a"); a.href = "mailto:" + T.mail; a.textContent = T.mail; alt.appendChild(a); } else alt.hidden = true;

    var S = { passed: false, down: false, t0: 0, fill: 0, win: 1500, phase: "idle", fails: 0, lock: 0, reaction: 0, raf: 0 };
    function say(txt) { help.textContent = txt || ""; if (txt) sr.textContent = txt; }
    function setPhase(p, text, helpText) {
      S.phase = p; box.setAttribute("data-phase", p);
      if (text != null) label.textContent = text;
      if (helpText !== undefined) say(helpText);
    }
    function ring(frac) { prog.style.strokeDashoffset = String(100 - Math.max(0, Math.min(1, frac)) * 100); }
    function reset(helpText) { cancelAnimationFrame(S.raf); S.down = false; ring(0); setPhase("idle", T.start || "", helpText === undefined ? T.help : helpText); }
    reset();

    function frame(now) {
      if (!S.down) return;
      var el = now - S.t0;
      if (el < S.fill) { ring(el / S.fill); }
      else if (el < S.fill + S.win) { if (S.phase !== "go") { ring(1); setPhase("go", T.go || "", ""); sr.textContent = T.go || ""; } }
      else if (S.phase !== "late") { setPhase("late", T.late || "", T.late || ""); }
      S.raf = requestAnimationFrame(frame);
    }
    function begin() {
      if (S.passed || S.down) return;
      var now = performance.now();
      if (S.lock && now < S.lock) { say((T.lock || "").replace("{s}", String(Math.ceil((S.lock - now) / 1000)))); return; }
      S.down = true; S.t0 = now; S.fill = 1100 + Math.random() * 900; S.win = 1500;
      setPhase("hold", T.hold || "", T.holdHelp);
      S.raf = requestAnimationFrame(frame);
    }
    function finish() {
      if (!S.down || S.passed) return;
      var now = performance.now(), el = now - S.t0;
      cancelAnimationFrame(S.raf); S.down = false;
      if (el >= S.fill && el < S.fill + S.win) {
        S.passed = true; S.reaction = Math.round(el - S.fill);
        ring(1); setPhase("ok", T.ok || "", ""); sr.textContent = T.ok || ""; box.classList.add("is-ok"); btn.disabled = false; btn.setAttribute("aria-disabled", "true");
      } else {
        S.fails++; ring(0);
        if (S.fails % 4 === 0) S.lock = now + 6000;
        setPhase("miss", T.start || "", el < S.fill ? T.early : T.late);
        setTimeout(function () { if (S.phase === "miss") reset(T.help); }, 1800);
      }
    }
    // mouse / finger / pen
    btn.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      try { btn.setPointerCapture(e.pointerId); } catch (x) { /* older browsers */ }
      begin();
    });
    btn.addEventListener("pointerup", finish);
    btn.addEventListener("pointercancel", function () { if (S.down) { cancelAnimationFrame(S.raf); S.down = false; reset(T.help); } });
    btn.addEventListener("contextmenu", function (e) { e.preventDefault(); }); // a long press must not open the phone's context menu
    // keyboard: hold Space or Enter
    btn.addEventListener("keydown", function (e) { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); begin(); } });
    btn.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); finish(); } });
    btn.addEventListener("blur", function () { if (S.down) { cancelAnimationFrame(S.raf); S.down = false; reset(T.help); } });
    btn.addEventListener("click", function (e) { e.preventDefault(); }); // a plain click does nothing: it has to be held

    return {
      passed: function () { return S.passed; },
      nudge: function () { box.classList.add("is-need"); setTimeout(function () { box.classList.remove("is-need"); }, 1600); try { box.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) { /* ignore */ } btn.focus({ preventScroll: true }); },
      stats: function () { return { game_hits: S.passed ? 1 : 0, game_misses: S.fails, game_ms: S.reaction }; }
    };
  }

  window.bkGuard = { mount: mount, work: work, sha256: sha256, beacon: beacon };
})();
