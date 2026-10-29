/* Progressive enhancement. No frameworks, no third-party requests
   until the visitor asks for them (video click) or consents (analytics). */
(function () {
  "use strict";
  // A page the browser prerenders in the background runs its scripts early: anything that costs data or counts a visit
  // (prefetching, idle picture loading, analytics) waits until the visitor actually arrives on it.
  function onActive(fn) { if (document.prerendering) document.addEventListener("prerenderingchange", fn, { once: true }); else fn(); }
  var cfg = {};
  try { cfg = JSON.parse(document.getElementById("bk-config").textContent) || {}; } catch (e) { /* defaults */ }
  var ui = cfg.ui || {};

  // ---------- quote request form ----------
  // Nothing leaves the page until the visitor presses send. Without an endpoint the visitor's own mail program is used.
  // The request carries its context: which product it is about, the hole diameter picked in a size chart (if any) and the language of
  // the page the visitor was reading. quote-guard.js adds the human check (a small reaction game, a minimum fill time, a proof of work).
  var HOLE_KEY = "bk_hole";
  function storedHole() { try { var v = Number(sessionStorage.getItem(HOLE_KEY)); return v > 0 ? v : 0; } catch (e) { return 0; } }
  function holeFromUrl() { var m = /[?&]hal=(\d{1,4})(?:[&#]|$)/.exec(window.location.search); return m ? Number(m[1]) : 0; }
  Array.prototype.forEach.call(document.querySelectorAll("[data-quote]"), function (box) {
    var form = box.querySelector("form");
    var status = box.querySelector(".qf__status");
    if (!form) return;
    var productInput = form.querySelector("[name=product]"), ta = form.querySelector("textarea");
    // arrived from a product page: ?produkt=<name> (and the size picked in a chart, ?hal=<mm>) pre-fill the message text (no separate field)
    var product = "", hole = holeFromUrl();
    try { var m = /[?&]produkt=([^&#]*)/.exec(window.location.search); if (m) product = decodeURIComponent(m[1].replace(/\+/g, " ")).slice(0, 120); } catch (e) { /* ignore malformed encoding */ }
    if (productInput) productInput.value = product;
    if (ta && !ta.value && (product || hole)) {
      var about = (product || "") + (product && hole ? ", " : "") + (hole ? box.getAttribute("data-hole-short") + " " + hole + " mm" : "");
      ta.value = box.getAttribute("data-about") + " " + about + "\n\n";
    }
    function say(msg, bad) { status.textContent = msg; status.className = "qf__status" + (bad ? " is-bad" : " is-ok"); }
    // human check
    var guard = null, touched = 0, MIN_FILL = 7000, tx = {};
    try { tx = JSON.parse(box.getAttribute("data-guard") || "{}"); } catch (e) { tx = {}; }
    function mountGuard() { if (!guard && window.bkGuard) guard = window.bkGuard.mount(form, tx); }
    ["focusin", "input"].forEach(function (ev) { form.addEventListener(ev, function () { if (!touched) touched = Date.now(); mountGuard(); }, { passive: true }); });
    if (document.readyState === "complete") mountGuard(); else window.addEventListener("load", mountGuard);
    function proof(email) {
      if (!window.bkGuard || !guard) return Promise.resolve({});
      return window.bkGuard.work(email).then(function (pw) {
        var wait = Math.max(0, MIN_FILL - (Date.now() - (touched || Date.now())));
        return new Promise(function (res) {
          setTimeout(function () {
            var s = guard.stats();
            res({ pow_round: pw.pow_round, pow_ts: pw.pow_ts, pow_nonce: pw.pow_nonce, fill_ms: Date.now() - (touched || Date.now()), game_hits: s.game_hits, game_misses: s.game_misses, game_ms: s.game_ms });
          }, wait);
        });
      });
    }
    // The browser's own "please tick this box" bubble is English whatever the page says and sits far out at the field; the message
    // is written next to the field instead, in the language of the page.
    function wrapOf(el) { return el.closest(".qf__f, .qf__consent"); }
    function clearErr(el) { var w = wrapOf(el); if (!w) return; el.removeAttribute("aria-invalid"); var x = w.querySelector(".qf__err"); if (x) x.parentNode.removeChild(x); }
    function msgFor(el) {
      if (el.type === "checkbox") return box.getAttribute("data-v-consent");
      if (el.validity.typeMismatch || el.validity.patternMismatch) return box.getAttribute("data-v-email");
      return box.getAttribute("data-v-required");
    }
    function validate() {
      var first = null;
      [].forEach.call(form.querySelectorAll("input, textarea, select"), function (el) {
        if (el.type === "hidden" || el.name === "website") return;
        clearErr(el);
        if (el.checkValidity()) return;
        var w = wrapOf(el); if (!w) return;
        el.setAttribute("aria-invalid", "true");
        var p = document.createElement("p"); p.className = "qf__err"; p.setAttribute("role", "alert"); p.textContent = msgFor(el); w.appendChild(p);
        if (!first) first = el;
      });
      if (first) { say(""); try { first.focus({ preventScroll: true }); first.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) { /* ignore */ } return false; }
      return true;
    }
    ["input", "change"].forEach(function (ev) { form.addEventListener(ev, function (e) { if (e.target && e.target.getAttribute && e.target.getAttribute("aria-invalid")) { if (e.target.checkValidity()) clearErr(e.target); } }); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;
      var data = new FormData(form);
      if (data.get("website")) { say(box.getAttribute("data-ok")); form.reset(); return; } // honeypot: pretend success
      var endpoint = box.getAttribute("data-endpoint");
      var btn = form.querySelector("button[type=submit]");
      if (window.bkGuard && guard && !guard.passed()) { say(tx.need || "", true); guard.nudge(); return; }
      var langLabel = box.getAttribute("data-lang-label") || "", lang = document.documentElement.lang || "";
      var prod = String(data.get("product") || "");
      btn.disabled = true; say(tx.checking || box.getAttribute("data-sending"));
      var email = String(data.get("email") || "").trim();
      proof(email).then(function (extra) {
        if (endpoint) {
          say(box.getAttribute("data-sending"));
          var key = box.getAttribute("data-key");
          var opts = { method: "POST", body: data, headers: { Accept: "application/json" } };
          if (key) {
            // Supabase REST: JSON row into the quote_requests table; the public key may only insert (row-level security)
            var row = { message: String(data.get("message") || ""), consent: true, lang: lang, lang_label: langLabel, page: location.pathname, product: prod || null };
            ["name", "company", "email", "phone"].forEach(function (k) { row[k] = String(data.get(k) || ""); });
            row.email = email;
            Object.keys(extra).forEach(function (k) { row[k] = extra[k]; });
            opts = { method: "POST", body: JSON.stringify(row),
              headers: { "Content-Type": "application/json", apikey: key, Authorization: "Bearer " + key, Prefer: "return=minimal" } };
          }
          return fetch(endpoint, opts).then(function (r) { if (!r.ok) throw new Error(String(r.status)); say(box.getAttribute("data-ok")); form.reset(); });
        }
        var to = box.getAttribute("data-mailto");
        var lines = ["name", "company", "email", "phone"].map(function (k) { return data.get(k) ? k + ": " + data.get(k) : ""; });
        lines.push(prod ? "product: " + prod : "", langLabel ? "language: " + langLabel + " (" + lang + ")" : "");
        var body = lines.filter(Boolean).join("\n") + "\n\n" + data.get("message");
        say(box.getAttribute("data-mail"));
        window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(box.getAttribute("data-subject")) + "&body=" + encodeURIComponent(body);
      }).catch(function () { say(box.getAttribute("data-err"), true); })
        .then(function () { btn.disabled = false; });
    });
  });

  // ---------- the size picked in a chart travels with the quote buttons ----------
  // On the TEI pages the links to the quote form get ?hal=<mm> as soon as a size has been picked (here or earlier in this visit);
  // the number is kept only for this browser tab (sessionStorage), nothing is sent anywhere until a quote is submitted.
  function quoteLinks() { if (!/\/produkter\/tei(\/|$)/.test(location.pathname)) return []; return [].slice.call(document.querySelectorAll("a[href*='/offert']")).filter(function (a) { return /[?&]produkt=/.test(a.getAttribute("href") || ""); }); }
  window.bkHole = {
    set: function (mm) {
      try { if (mm > 0) sessionStorage.setItem(HOLE_KEY, String(mm)); } catch (e) { /* private mode: the links still get it below */ }
      quoteLinks().forEach(function (a) {
        var href = a.getAttribute("href").replace(/([?&])hal=\d*&?/, "$1").replace(/[?&]$/, "");
        var hash = ""; var i = href.indexOf("#"); if (i >= 0) { hash = href.slice(i); href = href.slice(0, i); }
        a.setAttribute("href", href + (href.indexOf("?") >= 0 ? "&" : "?") + "hal=" + mm + hash);
      });
    }
  };
  if (storedHole()) window.bkHole.set(storedHole());

  // ---------- image carousels ----------
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  Array.prototype.forEach.call(document.querySelectorAll("[data-carousel]"), function (box) {
    var track = box.querySelector(".carousel__track");
    if (!track || track.children.length < 2) return;
    var count = track.children.length;
    var dots = box.querySelectorAll(".carousel__dot");
    var prev = box.querySelector(".carousel__btn--prev");
    var next = box.querySelector(".carousel__btn--next");
    var idx = 0, stopped = false, hovering = false, visible = false, raf = 0;
    function go(i, instant) {
      i = Math.max(0, Math.min(count - 1, i));
      track.scrollTo({ left: i * track.clientWidth, behavior: instant || reduceMotion ? "auto" : "smooth" });
    }
    function sync() {
      idx = Math.max(0, Math.min(count - 1, Math.round(track.scrollLeft / Math.max(1, track.clientWidth))));
      Array.prototype.forEach.call(dots, function (d, k) { if (k === idx) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
      if (prev) prev.disabled = idx === 0;
      if (next) next.disabled = idx === count - 1;
    }
    track.addEventListener("scroll", function () {
      if (raf) return;
      raf = window.requestAnimationFrame(function () { raf = 0; sync(); });
    }, { passive: true });
    if (prev) prev.addEventListener("click", function () { stopped = true; go(idx - 1); });
    if (next) next.addEventListener("click", function () { stopped = true; go(idx + 1); });
    Array.prototype.forEach.call(dots, function (d, k) { d.addEventListener("click", function () { stopped = true; go(k); }); });
    ["touchstart", "keydown", "wheel"].forEach(function (ev) { track.addEventListener(ev, function () { stopped = true; }, { passive: true }); });
    window.addEventListener("resize", function () { go(idx, true); });
    var ms = parseInt(box.getAttribute("data-autoplay"), 10);
    if (ms && !reduceMotion && "IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0.5 }).observe(box);
      box.addEventListener("mouseenter", function () { hovering = true; });
      box.addEventListener("mouseleave", function () { hovering = false; });
      box.addEventListener("focusin", function () { stopped = true; });
      window.setInterval(function () {
        if (stopped || hovering || !visible || document.hidden) return;
        go(idx >= count - 1 ? 0 : idx + 1);
      }, Math.max(2000, ms));
    }
    sync();
  });

  // ---------- mobile navigation ----------
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    ["touchstart", "pointerdown", "focus"].forEach(function (ev) { toggle.addEventListener(ev, function () { document.dispatchEvent(new Event("bk-warm-menu")); }, { once: true, passive: true }); });
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); toggle.focus(); }
    });
  }

  // ---------- mega menu (hover works in CSS; this adds touch + keyboard) ----------
  document.querySelectorAll(".nav__toggle").forEach(function (btn) {
    ["touchstart", "pointerdown"].forEach(function (ev) { btn.addEventListener(ev, function () { document.dispatchEvent(new Event("bk-warm-menu")); }, { once: true, passive: true }); });
    btn.addEventListener("click", function () {
      var li = btn.closest(".nav__item");
      var open = li.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  // ---------- products menu: hovering a brand shows its ranges and models in the panel below ----------
  document.querySelectorAll(".mega--logos").forEach(function (mega) {
    var tiles = [].slice.call(mega.querySelectorAll(".logorow__item[data-panel]"));
    var panels = [].slice.call(mega.querySelectorAll(".mega__panel"));
    if (!tiles.length || !panels.length) return;
    var timer = 0, lastType = "mouse";
    var pointerNav = false;
    document.addEventListener("pointerdown", function () { pointerNav = true; }, true);
    document.addEventListener("keydown", function () { pointerNav = false; }, true);
    var host = mega.querySelector(".mega__panels");
    var small = window.matchMedia ? window.matchMedia("(max-width: 980px)") : { matches: false };
    // small screens: every panel sits directly under its manufacturer (an accordion); wide screens: one shared panel below the row
    function place() {
      tiles.forEach(function (tile) {
        var p = document.getElementById(tile.getAttribute("data-panel"));
        var li = tile.closest("li");
        if (!p || !li) return;
        if (small.matches) { if (p.parentNode !== li) li.appendChild(p); }
        else if (host && p.parentNode !== host) host.appendChild(p);
      });
    }
    place();
    if (small.addEventListener) small.addEventListener("change", function () { reset(); place(); });
    else if (small.addListener) small.addListener(function () { reset(); place(); });
    // "waiting for the pointer to settle" marker: the tile fills its bottom edge while the panel is about to switch,
    // and the open panel dims a little, so the pause reads as loading and not as a lag
    function clearPending() {
      tiles.forEach(function (t) { t.classList.remove("is-pending"); });
      mega.classList.remove("is-switching");
    }
    function show(tile) {
      clearPending();
      var id = tile.getAttribute("data-panel");
      tiles.forEach(function (t) { var on = t === tile; t.classList.toggle("is-on", on); t.setAttribute("aria-expanded", on ? "true" : "false"); });
      panels.forEach(function (p) { p.classList.toggle("is-on", p.id === id); });
      mega.classList.add("has-panel");
      // a description that is cut off can be read in full by pointing at it (or tabbing to it)
      var opened = document.getElementById(id), desc = opened && opened.querySelector(".mega__desc");
      if (desc && !desc.hasAttribute("data-checked")) {
        requestAnimationFrame(function () {
          desc.setAttribute("data-checked", "");
          if (desc.scrollHeight > desc.clientHeight + 1) { desc.setAttribute("data-cut", ""); desc.setAttribute("tabindex", "0"); }
        });
      }
    }
    // back to the plain row of logos when the menu is left or closed
    function reset() {
      clearTimeout(timer);
      clearPending();
      mega.classList.remove("has-panel");
      tiles.forEach(function (t) { t.classList.remove("is-on"); t.setAttribute("aria-expanded", "false"); });
      panels.forEach(function (p) { p.classList.remove("is-on"); });
    }
    // the small preview pictures load as soon as the menu is first touched, so they are ready when a brand is picked
    var warmed = false;
    function warm() {
      if (warmed) return;
      warmed = true;
      [].forEach.call(mega.querySelectorAll(".logorow img"), function (im) { im.loading = "eager"; if (im.decode) im.decode().catch(function () { /* paints when loaded */ }); });
      panels.forEach(function (p) {
        [].forEach.call(p.querySelectorAll("img"), function (im) {
          im.loading = "eager";
          // decoded now, so showing the panel later paints them at once
          if (im.decode) im.decode().catch(function () { /* not decodable yet: it will paint when loaded */ });
        });
      });
    }
    // on a wide screen they are fetched in a quiet moment after the page has loaded (small files, cached for every other page)
    var lowData = navigator.connection && (navigator.connection.saveData || /(^|-)2g$/.test(navigator.connection.effectiveType || ""));
    document.addEventListener("bk-warm-menu", warm); // the hamburger button was touched: the logos are needed next
    if (!lowData) {
      var later = function () { if (document.hidden) { document.addEventListener("visibilitychange", later, { once: true }); } else warm(); };
      var kick = function () { if (window.requestIdleCallback) window.requestIdleCallback(later, { timeout: 5000 }); else setTimeout(later, 2500); };
      if (document.readyState === "complete") kick(); else window.addEventListener("load", kick, { once: true });
    }
    var item = mega.closest(".nav__item");
    if (item) {
      ["pointerenter", "focusin", "touchstart"].forEach(function (ev) { item.addEventListener(ev, warm, { once: true, passive: true }); });
      // wide layout: leaving the menu folds the panel; in the narrow list the rows stay as the visitor left them
      item.addEventListener("pointerleave", function (e) { if (e.pointerType !== "touch" && !small.matches) reset(); });
      item.addEventListener("focusout", function (e) { if (!item.contains(e.relatedTarget)) reset(); });
      var tog = item.querySelector(".nav__toggle");
      if (tog) tog.addEventListener("click", reset);
    }
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") reset(); });
    document.addEventListener("click", function (e) { if (!e.target.closest(".nav__item--mega")) reset(); });
    tiles.forEach(function (tile, i) {
      tile.addEventListener("pointerdown", function (e) { lastType = e.pointerType || "mouse"; });
      // Switching brand waits until the pointer has settled on a tile: moving down from the logos to the panel
      // crosses other tiles on the way, and the panel must not flip to them. A bit longer once a panel is open.
      function arm(delay) {
        clearTimeout(timer);
        clearPending();
        if (!tile.classList.contains("is-on")) {
          tile.style.setProperty("--intent", delay + "ms");
          void tile.offsetWidth; // restart the fill animation
          tile.classList.add("is-pending");
          if (mega.classList.contains("has-panel")) mega.classList.add("is-switching");
        }
        timer = setTimeout(function () { show(tile); }, delay);
      }
      tile.addEventListener("pointerenter", function (e) {
        // in the narrow list a manufacturer unfolds on click (an unfolding row would move the next one under the pointer)
        if (e.pointerType === "touch" || small.matches) return;
        arm(mega.classList.contains("has-panel") ? 280 : 150);
      });
      tile.addEventListener("pointerleave", function () { clearTimeout(timer); tile.classList.remove("is-pending"); mega.classList.remove("is-switching"); });
      // keyboard focus previews the brand; a pointer press already decides by itself (click toggles)
      tile.addEventListener("focus", function () { if (!pointerNav) show(tile); });
      tile.addEventListener("click", function (e) {
        if (small.matches) {
          // phone: a tap unfolds / folds the manufacturer; the "view full range" button inside goes to its page
          e.preventDefault();
          // pin the list open: it may have been opened by hovering, and unfolding a row moves things under the pointer
          if (item) { item.classList.add("is-open"); var tg = item.querySelector(".nav__toggle"); if (tg) tg.setAttribute("aria-expanded", "true"); }
          if (tile.classList.contains("is-on")) reset();
          else {
            show(tile);
            var p = document.getElementById(tile.getAttribute("data-panel"));
            setTimeout(function () { if (p && p.scrollIntoView) p.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, 260);
          }
          return;
        }
        // wide screen with touch: the first tap previews the brand, the second one opens it
        if (lastType === "touch" && !tile.classList.contains("is-on")) { e.preventDefault(); show(tile); }
      });
      tile.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        var n = tiles[i + d];
        if (n) { e.preventDefault(); n.focus(); }
      });
    });
  });

  // ---------- logo rows follow the mouse sideways ----------
  // A row of logos that is wider than its box scrolls to match the pointer, so the rest of the
  // logos can be reached without a scrollbar. Touch keeps native swiping.
  document.querySelectorAll("[data-scrub]").forEach(function (row) {
    var target = null, raf = 0;
    function step() {
      raf = 0;
      if (target === null) return;
      var d = target - row.scrollLeft;
      if (Math.abs(d) < 1) { row.scrollLeft = target; return; }
      row.scrollLeft += d * 0.14;
      raf = requestAnimationFrame(step);
    }
    row.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") return;
      var max = row.scrollWidth - row.clientWidth;
      if (max <= 2) return;
      var r = row.getBoundingClientRect();
      var x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      // the outer 15 % on each side reach the ends, the middle maps smoothly
      var p = x < 0.15 ? 0 : x > 0.85 ? 1 : (x - 0.15) / 0.7;
      target = p * max;
      if (!raf) raf = requestAnimationFrame(step);
    });
    row.addEventListener("pointerleave", function () { target = null; });
  });

  // ---------- call bar (phones): slides in while the banner scrolls away, back out when you return to the top ----------
  (function () {
    var bar = document.querySelector("[data-callbar]");
    if (!bar) return;
    var link = bar.querySelector(".callbar__link"), glow = bar.querySelector(".callbar__glow");
    var heroEl = document.querySelector(".hero");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var cur = 0, tgt = 0, gx = 0.5, gxT = 0.5, raf = 0, lastY = window.pageYOffset || 0, settle = 0, started = false;
    bar.classList.add("is-live");
    // the bar is fully in when most of the banner has gone; pages without a banner use a short distance
    function distance() { return Math.max(180, (heroEl ? heroEl.offsetHeight : 0) * 0.65); }
    function frame() {
      raf = 0;
      cur += (tgt - cur) * (reduce ? 1 : 0.16);
      if (Math.abs(tgt - cur) < 0.003) cur = tgt;
      gx += (gxT - gx) * 0.1;
      bar.style.transform = "translate3d(0," + ((1 - cur) * 110).toFixed(2) + "%,0)";
      var w = bar.clientWidth || 360;
      glow.style.transform = "translate3d(" + Math.round(gx * w * 1.0 - w * 0.31) + "px,0,0)";
      var shown = cur > 0.01;
      bar.classList.toggle("is-shown", shown);
      var usable = cur > 0.4;
      link.tabIndex = usable ? 0 : -1;
      bar.setAttribute("aria-hidden", usable ? "false" : "true");
      if (cur !== tgt || Math.abs(gxT - gx) > 0.004) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      var dy = y - lastY;
      lastY = y;
      // never further in than the banner position allows (it stays out while the top banner is in view)
      var cap = Math.min(1, Math.max(0, y / distance()));
      if (!started) { tgt = cap; started = true; }
      // then it follows the direction of travel wherever you are: down brings it in, up takes it out again at once
      else tgt = Math.min(cap, Math.max(0, tgt + dy / 70));
      // when scrolling stops it rests fully in or fully out, never half way
      clearTimeout(settle);
      settle = setTimeout(function () { tgt = tgt >= 0.5 ? cap : 0; kick(); }, 180);
      // scrolling also moves the embers a little, so the colour is never static
      var h = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      gxT = 0.15 + 0.7 * Math.min(1, y / h);
      kick();
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // the pointer / finger steers the glow
    window.addEventListener("pointermove", function (e) {
      gxT = Math.min(1, Math.max(0, e.clientX / Math.max(1, window.innerWidth)));
      kick();
    }, { passive: true });
    onScroll();
    frame();
  })();

  // ---------- banner: the picture follows the scroll for a while (slower than the page) ----------
  (function () {
    var hero = document.querySelector(".hero");
    var img = hero && hero.querySelector(".hero__img");
    if (!img || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    hero.classList.add("hero--parallax");
    var raf = 0, MAX = 90;
    function update() {
      raf = 0;
      if (window.scrollY > hero.offsetTop + hero.offsetHeight + 200) return;
      img.style.setProperty("--py", Math.min(MAX, Math.max(0, window.scrollY) * 0.4) + "px");
    }
    window.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  })();

  function closeMenus() {
    document.querySelectorAll(".nav__item.is-open").forEach(function (li) {
      li.classList.remove("is-open");
      var b = li.querySelector(".nav__toggle"); if (b) b.setAttribute("aria-expanded", "false");
    });
    document.querySelectorAll("details.lang[open]").forEach(function (d) { d.removeAttribute("open"); });
  }
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav__item--mega") && !e.target.closest("details.lang")) closeMenus();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenus(); });

  // ---------- header shadow once scrolled ----------
  var hdr = document.querySelector("[data-header]");
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---------- video facade: iframe only after the visitor clicks ----------
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".video__play");
    if (!btn) return;
    var fig = btn.closest(".video");
    var id = fig && fig.getAttribute("data-yt");
    if (!id) return;
    var start = parseInt(fig.getAttribute("data-start") || "0", 10);
    var src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0&playsinline=1" + (start ? "&start=" + start : "");
    var f = document.createElement("iframe");
    f.src = src;
    f.title = fig.getAttribute("data-title") || "Video";
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.setAttribute("allowfullscreen", "");
    f.referrerPolicy = "strict-origin-when-cross-origin";
    fig.textContent = "";
    fig.classList.add("is-playing");
    fig.appendChild(f);
    // fallback if the embedded player cannot render in this browser: plain link to the video
    var alt = document.createElement("a");
    alt.className = "video__yt";
    alt.href = "https://www.youtube.com/watch?v=" + encodeURIComponent(id) + (start ? "&t=" + start + "s" : "");
    alt.target = "_blank";
    alt.rel = "noopener";
    alt.textContent = fig.getAttribute("data-watch") || "YouTube";
    fig.insertAdjacentElement("afterend", alt);
  });

  // ---------- site search: the index is loaded when the search is opened and ranked in the browser ----------
  // Ranking works like a small search engine: every query word is matched against the title, the breadcrumb, the headings and the body
  // (exact word, same stem, beginning of a word, end of a compound such as "betongpump", or a slip of the finger), each field counts
  // for a different share (BM25 style, rare words count more than common ones), pages that hold every word come first, and a title that
  // is the query, starts with it or contains all of its words is lifted. The last word is also treated as a beginning (search as you type).
  var searchBtn = document.querySelector("[data-search-open]");
  var dlg, input, body, clearBtn, index, avgLen, vocab, suppliers, active = -1, hitEls = [];
  var LANG = (document.documentElement.lang || "sv").slice(0, 2).toLowerCase();
  var SUFFIX_LISTS = {
    sv: "ningarna ningar ningen ning arna erna orna ande ende heter het ene ar er or en et na ad at as a e s",
    en: "ations ation ings ing ers er ies es ed ly s",
    es: "aciones acion amientos amiento mente ores or es as os a o s"
  };
  SUFFIX_LISTS.no = SUFFIX_LISTS.nb = SUFFIX_LISTS.sv;
  var SUFFIXES = (SUFFIX_LISTS[LANG] || SUFFIX_LISTS.sv).split(" ").sort(function (a, b) { return b.length - a.length; });
  var STOP_LISTS = {
    sv: "och i for av pa med en ett att som till de det den", en: "the and of for to in a an on with", es: "de la el los las y en para con un una por"
  };
  STOP_LISTS.no = STOP_LISTS.nb = "og i for av pa med en et at som til de det den";
  var STOP = {};
  (STOP_LISTS[LANG] || STOP_LISTS.sv).split(" ").forEach(function (w) { STOP[w] = 1; });
  var FIELD_W = [10, 2.2, 4, 1]; // title, breadcrumb, headings, body

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fold(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/æ/g, "ae").replace(/ø/g, "o").replace(/ß/g, "ss"); }
  function words(s) { return String(s).match(/[\p{L}\p{N}]+/gu) || []; }
  function stem(w) {
    if (w.length < 5) return w;
    for (var i = 0; i < SUFFIXES.length; i++) { var x = SUFFIXES[i]; if (w.length - x.length >= 4 && w.slice(-x.length) === x) return w.slice(0, -x.length); }
    return w;
  }
  // Damerau-Levenshtein distance (a swapped pair of letters counts once), given up as soon as it is above max
  function dist(a, b, max) {
    var la = a.length, lb = b.length, i, j;
    if (Math.abs(la - lb) > max) return max + 1;
    var p2 = null, p = [], c;
    for (j = 0; j <= lb; j++) p[j] = j;
    for (i = 1; i <= la; i++) {
      c = [i];
      var low = i;
      for (j = 1; j <= lb; j++) {
        var v = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1));
        if (p2 && i > 1 && j > 1 && a.charCodeAt(i - 1) === b.charCodeAt(j - 2) && a.charCodeAt(i - 2) === b.charCodeAt(j - 1)) v = Math.min(v, p2[j - 2] + 1);
        c[j] = v;
        if (v < low) low = v;
      }
      if (low > max) return max + 1;
      p2 = p; p = c;
    }
    return p[lb];
  }
  // how well a document word (folded, with its stem) answers a query word: 0 = not at all, 1 = the same word
  function match(t, tok, ts) {
    if (tok === t.q) return 1;
    var ql = t.q.length;
    if (t.s.length >= 4 && ts === t.s) return 0.9;
    if (tok.indexOf(t.q) === 0 && (t.last ? ql >= 2 : ql >= 3)) return t.last ? 0.85 : 0.7;
    if (t.s.length >= 4 && tok.indexOf(t.s) === 0) return 0.7;
    if (ql >= 4 && tok.indexOf(t.q) > 0) return 0.5;
    if (ql >= 5) { var m = ql >= 9 ? 2 : 1; if (dist(t.q, tok, m) <= m) return 0.45; }
    return 0;
  }
  function field(text) {
    var toks = words(text), m = Object.create(null);
    toks.forEach(function (o) {
      var f = fold(o), e = m[f];
      if (e) e.c++; else { m[f] = { c: 1, s: stem(f) }; if (!vocab[f]) vocab[f] = { w: o.toLowerCase(), df: 0 }; }
    });
    return { m: m, n: toks.length };
  }
  function prepare(data) {
    vocab = Object.create(null);
    var sum = [0, 0, 0, 0];
    data.forEach(function (d) {
      d.f = [field(d.t), field(d.c || ""), field(d.h || ""), field(d.x || "")];
      d.tf = fold(d.t); d.xf = fold(d.t + " " + (d.h || "") + " " + (d.x || ""));
      d.f.forEach(function (f, i) { sum[i] += f.n; });
      var seen = Object.create(null);
      d.f.forEach(function (f) { Object.keys(f.m).forEach(function (k) { if (!seen[k]) { seen[k] = 1; vocab[k].df++; } }); });
    });
    avgLen = sum.map(function (s) { return Math.max(1, s / Math.max(1, data.length)); });
    suppliers = data.filter(function (d) { return d.w === 1.25; }).sort(function (a, b) { return a.t.localeCompare(b.t); });
    return data;
  }
  function parse(q) {
    var terms = words(q).map(function (o) { var f = fold(o); return { q: f, s: stem(f) }; });
    if (terms.length > 1) { var kept = terms.filter(function (t) { return !STOP[t.q]; }); if (kept.length) terms = kept; }
    if (terms.length) terms[terms.length - 1].last = true;
    return terms;
  }
  function rank(terms, qf) {
    var N = index.length, rows = [], df = terms.map(function () { return 0; });
    index.forEach(function (d) {
      var tf = terms.map(function (t) {
        var sum = 0;
        for (var i = 0; i < 4; i++) {
          var fld = d.f[i], part = 0, norm = i === 3 ? 0.4 + 0.6 * (fld.n / avgLen[3]) : 1;
          for (var k in fld.m) { var e = fld.m[k], w = match(t, k, e.s); if (w) part += w * Math.min(e.c, 4); }
          sum += FIELD_W[i] * part / norm;
        }
        return sum;
      });
      var covered = 0;
      tf.forEach(function (v, i) { if (v > 0) { covered++; df[i]++; } });
      if (covered) rows.push({ d: d, tf: tf, covered: covered });
    });
    var idf = df.map(function (n) { return Math.log(1 + (N - n + 0.5) / (n + 0.5)); });
    var all = rows.filter(function (r) { return r.covered === terms.length; });
    if (all.length) rows = all; else rows = rows.filter(function (r) { return r.covered >= Math.ceil(terms.length / 2); });
    rows.forEach(function (r) {
      var s = 0;
      r.tf.forEach(function (v, i) { s += idf[i] * v / (v + 1.2); });
      s *= Math.pow(r.covered / terms.length, 2);
      var tt = r.d.tf;
      if (tt === qf) s *= 3; else if (tt.indexOf(qf) === 0) s *= 1.8;
      else if (terms.length > 1 && terms.every(function (t) { return Object.keys(r.d.f[0].m).some(function (k) { return match(t, k, r.d.f[0].m[k].s) >= 0.7; }); })) s *= 1.5;
      if (terms.length > 1 && r.d.xf.indexOf(qf) >= 0) s *= 1.25;
      r.s = s * (r.d.w || 1);
    });
    rows.sort(function (a, b) { return b.s - a.s || a.d.t.length - b.d.t.length; });
    return rows;
  }
  // one piece of text with the words that answered the query marked
  function mark(text, terms) {
    var out = "", last = 0, re = /[\p{L}\p{N}]+/gu, m;
    while ((m = re.exec(text))) {
      var f = fold(m[0]), s = stem(f), hit = false;
      for (var i = 0; i < terms.length && !hit; i++) hit = match(terms[i], f, s) >= 0.5;
      out += esc(text.slice(last, m.index)) + (hit ? "<mark>" + esc(m[0]) + "</mark>" : esc(m[0]));
      last = m.index + m[0].length;
    }
    return out + esc(text.slice(last));
  }
  // the stretch of the page text (about 24 words) that holds most of the query words
  function snippet(text, terms) {
    var re = /[\p{L}\p{N}]+/gu, m, toks = [];
    while ((m = re.exec(text))) {
      var f = fold(m[0]), s = stem(f), which = -1;
      for (var i = 0; i < terms.length; i++) if (match(terms[i], f, s) >= 0.5) { which = i; break; }
      toks.push({ a: m.index, b: m.index + m[0].length, t: which });
    }
    var W = 24, best = 0, bestScore = -1;
    for (var st = 0; st < Math.max(1, toks.length - W + 1); st++) {
      var seen = {}, n = 0, sc = 0;
      for (var j = st; j < Math.min(toks.length, st + W); j++) if (toks[j].t >= 0) { sc += 1; if (!seen[toks[j].t]) { seen[toks[j].t] = 1; n++; } }
      sc = n * 10 + sc;
      if (sc > bestScore) { bestScore = sc; best = st; }
    }
    if (!toks.length) return "";
    var from = bestScore > 0 ? Math.max(0, best - 3) : 0, to = Math.min(toks.length, from + W);
    var seg = text.slice(toks[from].a, toks[to - 1].b);
    return (from > 0 ? "… " : "") + mark(seg, terms) + (to < toks.length ? " …" : "");
  }
  function suggest(terms) {
    // closest word on the site for each query word, for "did you mean"
    var out = [], changed = false;
    terms.forEach(function (t) {
      var best = null, bd = 99, bdf = 0;
      if (t.q.length >= 4) for (var k in vocab) {
        if (Math.abs(k.length - t.q.length) > 2) continue;
        var d = dist(t.q, k, 2);
        if (d > 0 && d <= 2 && (d < bd || (d === bd && vocab[k].df > bdf))) { best = k; bd = d; bdf = vocab[k].df; }
      }
      if (best && !(vocab[t.q])) { out.push(vocab[best].w); changed = true; } else out.push(vocab[t.q] ? vocab[t.q].w : t.q);
    });
    return changed ? out.join(" ") : "";
  }

  function build() {
    dlg = document.createElement("dialog");
    dlg.className = "search";
    dlg.setAttribute("aria-label", ui.search || "Sök");
    dlg.innerHTML = '<div class="search__bar"><svg class="search__icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>' +
      '<input class="search__input" type="search" role="combobox" aria-expanded="false" aria-controls="search-list" aria-autocomplete="list" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" placeholder="' + esc(ui.searchPlaceholder || "Sök…") + '" aria-label="' + esc(ui.search || "Sök") + '">' +
      '<button class="search__clear" type="button" hidden aria-label="' + esc(ui.searchClear || "Rensa") + '"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button class="search__close" type="button"><span>' + esc(ui.searchClose || "Stäng") + '</span><kbd>Esc</kbd></button></div>' +
      '<div class="search__body" id="search-list"></div>' +
      '<div class="search__foot" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> ' + esc(ui.searchNav || "bläddra") + '</span><span><kbd>Enter</kbd> ' + esc(ui.searchOpen || "öppna") + '</span><span><kbd>Esc</kbd> ' + esc(ui.searchClose || "Stäng").toLowerCase() + '</span></div>';
    document.body.appendChild(dlg);
    input = dlg.querySelector(".search__input");
    body = dlg.querySelector(".search__body");
    clearBtn = dlg.querySelector(".search__clear");
    dlg.querySelector(".search__close").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    clearBtn.addEventListener("click", function () { input.value = ""; run(); input.focus(); });
    input.addEventListener("input", run);
    body.addEventListener("click", function (e) {
      var s = e.target.closest && e.target.closest("[data-q]");
      if (s) { input.value = s.getAttribute("data-q"); run(); input.focus(); }
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (!hitEls.length) return;
        e.preventDefault();
        setActive(active + (e.key === "ArrowDown" ? 1 : -1));
      } else if (e.key === "Enter") {
        var el = hitEls[active >= 0 ? active : 0];
        if (el) { e.preventDefault(); el.querySelector("a").click(); }
      }
    });
  }
  function setActive(i) {
    if (!hitEls.length) return;
    active = (i + hitEls.length) % hitEls.length;
    hitEls.forEach(function (el, n) { el.classList.toggle("is-active", n === active); el.setAttribute("aria-selected", n === active ? "true" : "false"); });
    input.setAttribute("aria-activedescendant", hitEls[active].id);
    hitEls[active].scrollIntoView({ block: "nearest" });
  }
  function chips(label) {
    return suppliers && suppliers.length
      ? '<div class="search__suppliers"><p class="search__label">' + esc(label) + '</p><ul class="search__chips">' + suppliers.map(function (s) { return '<li><a href="' + esc(s.u) + '">' + esc(s.t) + "</a></li>"; }).join("") + "</ul></div>"
      : "";
  }
  function run() {
    var raw = input.value.trim();
    clearBtn.hidden = !input.value;
    hitEls = []; active = -1;
    input.removeAttribute("aria-activedescendant");
    if (!index) { body.innerHTML = '<p class="search__none">' + esc(ui.loading || "…") + "</p>"; return; }
    var terms = raw.length >= 2 ? parse(raw) : [];
    if (!terms.length) { input.setAttribute("aria-expanded", "false"); body.innerHTML = chips(ui.searchSuppliers || "Leverantörer"); return; }
    var qf = terms.map(function (t) { return t.q; }).join(" ");
    var rows = rank(terms, qf);
    input.setAttribute("aria-expanded", rows.length ? "true" : "false");
    if (!rows.length) {
      var dym = suggest(terms);
      body.innerHTML = '<p class="search__none">' + esc((ui.searchNone || "Inga träffar.").replace(/\.$/, "")) + " “" + esc(raw) + "”.</p>" +
        (dym ? '<p class="search__dym">' + esc(ui.searchDym || "Menade du") + ' <button type="button" data-q="' + esc(dym) + '">' + esc(dym) + "</button>?</p>" : "") + chips(ui.searchBrowse || "Bläddra bland leverantörer");
      return;
    }
    var shown = rows.slice(0, 10);
    body.innerHTML = '<p class="search__meta" aria-live="polite">' + esc((rows.length === 1 ? ui.searchHit || "{n} träff" : ui.searchHits || "{n} träffar").replace("{n}", rows.length)) + '</p><ul class="search__results" role="listbox">' +
      shown.map(function (r, n) {
        var d = r.d, snip = snippet(d.x || "", terms);
        return '<li class="search__item" role="option" id="sr-' + n + '" aria-selected="false"><a href="' + esc(d.u) + '">' +
          '<span class="search__thumb">' + (d.i ? '<img src="' + esc(d.i) + '" alt="" width="64" height="64" loading="lazy">' : '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/></svg>') + "</span>" +
          '<span class="search__txt"><strong>' + mark(d.t, terms) + "</strong>" + (d.c ? '<span class="search__crumb">' + esc(d.c) + "</span>" : "") + (snip ? '<span class="search__snip">' + snip + "</span>" : "") + "</span></a></li>";
      }).join("") + "</ul>";
    hitEls = [].slice.call(body.querySelectorAll(".search__item"));
    hitEls.forEach(function (el, n) { el.addEventListener("mousemove", function () { if (active !== n) { active = n; hitEls.forEach(function (x, k) { x.classList.toggle("is-active", k === n); x.setAttribute("aria-selected", k === n ? "true" : "false"); }); } }); });
    setActive(0);
  }
  function openSearch() {
    if (!dlg) build();
    if (!index) {
      fetch(cfg.searchIndex || "/search-index.json").then(function (r) { return r.json(); }).then(function (j) { index = prepare(j); run(); }).catch(function () { body.innerHTML = '<p class="search__none">' + esc(ui.searchNone || "Inga träffar.") + "</p>"; });
    }
    if (!dlg.open) dlg.showModal();
    run();
    input.focus();
    input.select();
  }
  if (searchBtn) {
    searchBtn.addEventListener("click", openSearch);
    // "/" and Ctrl/Cmd+K open the search from anywhere on the page
    document.addEventListener("keydown", function (e) {
      var t = e.target, typing = t && (/^(input|textarea|select)$/i.test(t.tagName) || t.isContentEditable);
      if ((e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) || ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K"))) { e.preventDefault(); openSearch(); }
    });
  }

  // ---------- products page: machines / material filter ----------
  // Both groups are in the page for search engines and without scripts; the buttons only hide a group. One group always stays on.
  [].forEach.call(document.querySelectorAll(".pfilter"), function (bar) {
    var btns = [].slice.call(bar.querySelectorAll(".pfilter__btn")), groups = {}, on = {};
    [].forEach.call(document.querySelectorAll(".pgroup"), function (g) { groups[g.getAttribute("data-g")] = g; });
    btns.forEach(function (b) { on[b.getAttribute("data-g")] = true; });
    function paint(keepUrl) {
      btns.forEach(function (b) {
        var k = b.getAttribute("data-g");
        b.setAttribute("aria-pressed", on[k] ? "true" : "false");
        if (groups[k]) groups[k].hidden = !on[k];
      });
      var only = btns.filter(function (b) { return on[b.getAttribute("data-g")]; });
      if (!keepUrl) try { history.replaceState(null, "", only.length === 1 ? "#" + groups[only[0].getAttribute("data-g")].id : location.pathname + location.search); } catch (e) { /* ignore */ }
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-g"), live = btns.filter(function (x) { return on[x.getAttribute("data-g")]; }).length;
        if (on[k] && live === 1) return; // the last group stays on
        on[k] = !on[k];
        paint();
      });
    });
    var h = location.hash.slice(1);
    btns.forEach(function (b) { var k = b.getAttribute("data-g"); if (groups[k] && groups[k].id === h) btns.forEach(function (x) { on[x.getAttribute("data-g")] = x === b; }); });
    paint(true);
  });

  // ---------- finder: choosing a product family shows its models and brochures ----------
  [].forEach.call(document.querySelectorAll("[data-finder]"), function (box) {
    var cards = [].slice.call(box.querySelectorAll(".finder__card")), panels = [].slice.call(box.querySelectorAll(".finder__panel")), hint = box.querySelector(".finder__hint");
    if (!cards.length) return;
    function show(id, scroll) {
      var found = false;
      cards.forEach(function (c) { var on = c.getAttribute("href") === "#" + id; if (on) found = true; c.classList.toggle("is-on", on); if (on) c.setAttribute("aria-current", "true"); else c.removeAttribute("aria-current"); });
      panels.forEach(function (p) { p.classList.toggle("is-on", p.id === id); });
      if (hint) hint.hidden = found;
      if (found && scroll) { var p = document.getElementById(id); if (p && p.scrollIntoView) p.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" }); }
      if (found) { try { history.replaceState(null, "", "#" + id); } catch (e) { /* ignore */ } }
    }
    cards.forEach(function (c) { c.addEventListener("click", function (e) { e.preventDefault(); show(c.getAttribute("href").slice(1), true); }); });
    var h = (location.hash || "").slice(1);
    show(h, false);
    if (hint && !h) hint.hidden = false;
  });

  // ---------- before / after pictures: drag anywhere on the picture (mouse, finger or pen); vertical swipes still scroll the page ----------
  // A mouse or pen puts the divider where it is pressed; a finger moves it relative to where the divider was, and only once the
  // swipe is clearly sideways, so scrolling past the picture never nudges it. The hidden range input mirrors the value for the keyboard.
  [].forEach.call(document.querySelectorAll("[data-cmp]"), function (fig) {
    var stage = fig.querySelector(".cmp__stage"), input = fig.querySelector(".cmp__range"), raf = 0, stopped = false;
    if (!stage || !input) return;
    var p = 50;
    function set(v) {
      p = Math.max(0, Math.min(100, v)); stage.style.setProperty("--p", p + "%"); input.value = String(p);
      fig.classList.toggle("is-hide-l", p < 26); fig.classList.toggle("is-hide-r", p > 74); // a label gives way when the divider gets close to it
    }
    function stop() { stopped = true; cancelAnimationFrame(raf); }
    var down = null;
    stage.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      stop();
      var r = stage.getBoundingClientRect();
      down = { id: e.pointerId, x: e.clientX, y: e.clientY, p: p, w: r.width, left: r.left, touch: e.pointerType === "touch", on: false };
      if (!down.touch) { down.on = true; set(((e.clientX - r.left) / r.width) * 100); fig.classList.add("is-drag"); try { stage.setPointerCapture(e.pointerId); } catch (x) { /* older browsers */ } }
    });
    stage.addEventListener("pointermove", function (e) {
      if (!down || e.pointerId !== down.id) return;
      var dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (!down.on) {
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) return;
        down.on = true; down.x = e.clientX; fig.classList.add("is-drag"); try { stage.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
        return;
      }
      set(down.touch ? down.p + ((e.clientX - down.x) / down.w) * 100 : ((e.clientX - down.left) / down.w) * 100);
    });
    function end(e) { if (down && e.pointerId === down.id) { down = null; fig.classList.remove("is-drag"); } }
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", end);
    stage.addEventListener("lostpointercapture", end);
    input.addEventListener("input", function () { stop(); set(Number(input.value)); });
    input.addEventListener("keydown", stop, { passive: true });
    set(50);
    // a short nudge the first time the picture comes into view shows that it moves
    if ("IntersectionObserver" in window && !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
      var io = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        io.disconnect();
        var t0 = 0, DUR = 2200;
        (function frame(t) {
          if (stopped) return;
          if (!t0) t0 = t;
          var q = Math.min(1, (t - t0) / DUR);
          set(q < 1 ? 50 + 22 * Math.sin(q * 2 * Math.PI) * (1 - q * 0.4) : 50);
          if (q < 1) raf = requestAnimationFrame(frame);
        })(performance.now());
      }, { threshold: 0.7 });
      io.observe(stage);
    }
  });

  // ---------- quote band: the underline under the product name starts when the band is mostly in view ----------
  [].forEach.call(document.querySelectorAll(".cta"), function (band) {
    if (!band.querySelector(".cta__name") || !("IntersectionObserver" in window)) { band.classList.add("is-seen"); return; }
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); setTimeout(function () { band.classList.add("is-seen"); }, 350); } }, { threshold: 0.6 });
    io.observe(band);
  });

  // ---------- start page: the little arrow under the banner scrolls to the content and fades out once the page moves ----------
  (function () {
    var cue = document.querySelector(".hero__scroll"), target = document.getElementById("start");
    if (!cue) return;
    function fade() { cue.classList.toggle("is-gone", (window.pageYOffset || document.documentElement.scrollTop) > 40); }
    window.addEventListener("scroll", fade, { passive: true });
    fade();
    cue.addEventListener("click", function (e) {
      if (!target || !target.scrollIntoView || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  })();

  // ---------- range chart with a slider: marks the chosen size and lists the models that fit ----------
  [].forEach.call(document.querySelectorAll("[data-rc=selector]"), function (box) {
    var input = box.querySelector("input[type=range]"), out = box.querySelector(".rc__out"), res = box.querySelector(".rc__result"), marker = box.querySelector(".rc__marker");
    var rows = [].slice.call(box.querySelectorAll(".rc__row")), top = Number(box.getAttribute("data-top")) || 100, unit = res.getAttribute("data-unit") || "mm";
    var slider = box.querySelector(".rc__slider");
    // the data table rows and model tiles on this page that belong to the models in the chart follow the slider as well
    function keyOf(s) { return String(s || "").replace(/\s+/g, " ").trim().toUpperCase(); }
    var known = {}, echo = [];
    rows.forEach(function (r) { known[keyOf(r.querySelector(".rc__label").textContent)] = 1; });
    [].forEach.call(document.querySelectorAll("main .table-wrap tbody tr"), function (tr) { var th = tr.querySelector("th"), k = th && keyOf(th.textContent); if (k && known[k]) echo.push({ el: tr, key: k }); });
    [].forEach.call(document.querySelectorAll("main .module, main .card"), function (m) { var t = m.querySelector(".module__title, .card__title"), k = t && keyOf(t.textContent); if (k && known[k]) echo.push({ el: m, key: k }); });
    // the masts under the chart light up for the machines that cover the chosen size
    var masts = [].slice.call(box.querySelectorAll(".rc__mast")), mbox = box.querySelector("[data-masts]"), mhint = mbox && mbox.querySelector(".rc__mhint");
    function lightMasts(fits) {
      if (!mbox) return;
      var any = false;
      masts.forEach(function (m) {
        var take = (m.getAttribute("data-for") || "").split(" "), hit = fits.filter(function (f) { return take.indexOf(keyOf(f)) >= 0 || take.indexOf(f) >= 0; });
        var on = hit.length > 0; if (on) any = true;
        m.classList.toggle("is-rec", on); m.classList.toggle("is-dim", fits.length > 0 && !on);
        var line = m.querySelector(".rc__mfor"); if (line) line.textContent = on ? (mbox.getAttribute("data-for-label") || "") + " " + hit.join(", ") : "";
      });
      if (mhint) mhint.textContent = !fits.length ? mbox.getAttribute("data-hint") : any ? mbox.getAttribute("data-more") + " " + fits.join(", ") : mbox.getAttribute("data-none");
    }
    // the sentence under the slider is different for every size; the box keeps the height of the longest one
    // (measured per screen width), so nothing below it moves while the slider is dragged
    function sentenceFor(v) {
      var fits = rows.filter(function (r) { return v >= Number(r.getAttribute("data-min")) && v <= Number(r.getAttribute("data-max")); }).map(function (r) { return r.querySelector(".rc__label").textContent; });
      return fits.length ? res.getAttribute("data-fits") + ": " + fits.join(", ") : res.getAttribute("data-none");
    }
    function reserve() {
      var keep = res.textContent, seen = {}, tallest = 0, min = Number(input.min), max = Number(input.max), stp = Number(input.step) || 1;
      res.style.minHeight = "0";
      for (var v = min; v <= max; v += stp) {
        var t = sentenceFor(v);
        if (seen[t]) continue;
        seen[t] = 1; res.textContent = t;
        tallest = Math.max(tallest, Math.ceil(res.getBoundingClientRect().height));
      }
      res.textContent = keep;
      res.style.minHeight = tallest + "px";
    }
    function sync() {
      var v = Number(input.value), fits = [], fitKeys = {};
      box.style.setProperty("--pos", String(v / top));
      slider.style.setProperty("--hp", String((v - Number(input.min)) / Math.max(1, Number(input.max) - Number(input.min))));
      out.textContent = v + " " + unit;
      rows.forEach(function (r) {
        var ok = v >= Number(r.getAttribute("data-min")) && v <= Number(r.getAttribute("data-max"));
        r.classList.toggle("is-in", ok); r.classList.toggle("is-out", !ok);
        if (ok) { fits.push(r.querySelector(".rc__label").textContent); fitKeys[keyOf(r.querySelector(".rc__label").textContent)] = 1; }
      });
      echo.forEach(function (x) { var on = !!fitKeys[x.key]; x.el.classList.toggle("is-fit", fits.length > 0 && on); x.el.classList.toggle("is-dim", fits.length > 0 && !on); });
      res.textContent = fits.length ? res.getAttribute("data-fits") + ": " + fits.join(", ") : res.getAttribute("data-none");
      lightMasts(fits);
    }
    // the finger: shown once, when the chart comes into view; any touch of the slider ends it
    // shown once, then remembered in this browser for a week (only the time it was last shown, nothing about the person), so a reload
    // or another chart does not repeat it but a returning visitor gets the reminder again; a visitor who reaches for the slider first
    // never gets it. Adding ?hint=1 to the address shows it regardless (handy for checking it).
    var HINT_KEY = "bk_rc_hint", WEEK = 7 * 864e5, stopped = false, raf = 0, forced = /[?&]hint=1(&|$)/.test(location.search);
    function seen() { if (forced) return false; try { var t = Number(localStorage.getItem(HINT_KEY)); return t > 1e12 && Date.now() - t < WEEK; } catch (e) { return false; } }
    function mark() { try { localStorage.setItem(HINT_KEY, String(Date.now())); } catch (e) { /* private mode: the hint may show again, nothing breaks */ } }
    function stopHint() { mark(); if (stopped) return; stopped = true; cancelAnimationFrame(raf); slider.classList.remove("is-demo"); }
    if (seen()) stopped = true;
    // the finger really moves the dial: out to the right and back, twice, then the slider is left where it started
    function demo() {
      var min = Number(input.min), max = Number(input.max), stp = Number(input.step) || 1, start = Number(input.value), span = (max - min) * 0.3, t0 = 0, CYCLE = 2600, N = 2, LEAD = 500;
      slider.classList.add("is-demo");
      function frame(t) {
        if (stopped) return;
        if (!t0) t0 = t;
        var el = t - t0 - LEAD;
        if (el >= CYCLE * N) { input.value = start; sync(); stopped = true; slider.classList.remove("is-demo"); return; }
        var p = el < 0 ? 0 : (el % CYCLE) / CYCLE;
        var e = p < 0.12 ? 0 : (1 - Math.cos(((p - 0.12) / 0.88) * 2 * Math.PI)) / 2;
        input.value = String(Math.round((start + span * e) / stp) * stp);
        sync();
        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);
    }
    input.addEventListener("input", function () { stopHint(); sync(); if (window.bkHole) window.bkHole.set(Number(input.value)); });
    ["pointerenter", "pointerdown", "keydown", "touchstart", "focus"].forEach(function (ev) { box.querySelector(".rc__pick").addEventListener(ev, stopHint, { passive: true, capture: true }); });
    sync();
    reserve();
    var rw = 0, rt = 0;
    window.addEventListener("resize", function () { if (window.innerWidth === rw) return; rw = window.innerWidth; clearTimeout(rt); rt = setTimeout(reserve, 150); });
    rw = window.innerWidth;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(reserve);
    if (!stopped && "IntersectionObserver" in window && !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); if (!stopped) { mark(); demo(); } } }, { threshold: 0.6 });
      io.observe(slider);
    }
  });

  // ---------- performance charts: switch curves on and off, read the values at any pressure ----------
  [].forEach.call(document.querySelectorAll("[data-pc]"), function (box) {
    var node = box.querySelector(".pc__data"), svg = box.querySelector(".pc__svg"), read = box.querySelector(".pc__read");
    if (!node || !svg) return;
    var d; try { d = JSON.parse(node.textContent); } catch (e) { return; }
    var g = d.geo, plot = box.querySelector(".pc__plot"), tip = box.querySelector(".pc__tip"), sr = box.querySelector(".pc__sr"), on = d.series.map(function () { return true; }), pos = null;
    var cursor = svg.querySelector(".pc__cursor"), dots = [].slice.call(svg.querySelectorAll(".pc__dot")), lines = [].slice.call(svg.querySelectorAll(".pc__line"));
    var chips = [].slice.call(box.querySelectorAll(".pc__chip"));
    function num(v) { return (Math.round(v * 10) / 10).toString().replace(".", ","); }
    // y of the curve at pressure px: the lowest point of a steep fall, nothing beyond the end of the curve
    function at(s, px) {
      var p = s.p, best = null;
      for (var i = 1; i < p.length; i++) {
        var a = p[i - 1], b = p[i], lo = Math.min(a[0], b[0]), hi = Math.max(a[0], b[0]);
        if (px < lo - 1e-9 || px > hi + 1e-9) continue;
        var y = hi - lo < 1e-9 ? Math.min(a[1], b[1]) : a[1] + (b[1] - a[1]) * (px - a[0]) / (b[0] - a[0]);
        if (best === null || y < best) best = y;
      }
      return best;
    }
    function xOf(v) { return g.ml + (v - d.x.min) / (d.x.max - d.x.min) * g.pw; }
    function yOf(v) { return g.mt + g.ph - (v - d.y.min) / (d.y.max - d.y.min) * g.ph; }
    // The box goes where it covers no curve: beside the cursor line, on either side, at several heights inside the plot; the spot
    // with the fewest curve points under it wins (the first choice is the top, right of the cursor). Curves that end near the
    // x axis leave the upper part free, curves that start high leave the lower part free.
    function placeTip() {
      var pr = plot.getBoundingClientRect(), k = pr.width / g.W, tw = tip.offsetWidth / k, th = tip.offsetHeight / k;
      var cx = xOf(pos), x0 = g.ml + 3, x1 = g.ml + g.pw - 3, y0 = g.mt + 3, y1 = g.mt + g.ph - 3, pts = [];
      d.series.forEach(function (s, i) {
        if (!on[i]) return;
        for (var j = 1; j < s.p.length; j++) {
          var ax = xOf(s.p[j - 1][0]), ay = yOf(s.p[j - 1][1]), bx = xOf(s.p[j][0]), by = yOf(s.p[j][1]), n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 3));
          for (var q = 0; q <= n; q++) pts.push([ax + (bx - ax) * q / n, ay + (by - ay) * q / n]);
        }
      });
      var best = null, sides = [cx + 10, cx - 10 - tw];
      for (var si = 0; si < 2; si++) {
        var left = sides[si];
        if (left < x0 || left + tw > x1) continue;
        for (var r = 0; r <= 8; r++) {
          var top = y0 + (y1 - y0 - th) * r / 8, hit = 0;
          for (var p = 0; p < pts.length; p++) if (pts[p][0] > left - 4 && pts[p][0] < left + tw + 4 && pts[p][1] > top - 4 && pts[p][1] < top + th + 4) hit++;
          var score = hit * 1000 + r * 3 + si * 2;
          if (!best || score < best.score) best = { score: score, left: left, top: top };
        }
      }
      if (!best) best = { left: Math.max(x0, Math.min(x1 - tw, cx + 10)), top: y0 };
      tip.style.left = (best.left * k) + "px"; tip.style.top = (best.top * k) + "px";
    }
    function show(px) {
      pos = Math.max(d.x.min, Math.min(d.x.max, px));
      cursor.setAttribute("x1", xOf(pos)); cursor.setAttribute("x2", xOf(pos));
      var out = '<span class="pc__at">' + num(pos) + " " + d.x.unit + '</span><ul class="pc__list">', spoken = num(pos) + " " + d.x.unit;
      d.series.forEach(function (s, i) {
        var y = on[i] ? at(s, pos) : null;
        if (y === null) { dots[i].setAttribute("cx", -20); dots[i].setAttribute("cy", -20); }
        else { dots[i].setAttribute("cx", xOf(pos)); dots[i].setAttribute("cy", yOf(y)); }
        if (on[i]) spoken += ", " + (d.series.length > 1 ? s.n : d.y.name) + " " + (y === null ? "-" : num(y) + " " + d.y.unit);
        if (on[i]) out += '<li><i style="background:' + s.c + '"></i><span class="pc__n">' + (d.series.length > 1 ? s.n : d.y.name) + '</span><b class="pc__v">' + (y === null ? "-" : num(y) + " " + d.y.unit) + "</b></li>";
      });
      out += "</ul>";
      // the values float inside the chart, beside the cursor, so they stay in view however tall the chart is
      tip.innerHTML = out; tip.hidden = false;
      placeTip();
      sr.textContent = spoken;
    }
    function clear() { pos = null; cursor.setAttribute("x1", -20); cursor.setAttribute("x2", -20); dots.forEach(function (c) { c.setAttribute("cx", -20); c.setAttribute("cy", -20); }); tip.hidden = true; sr.textContent = ""; }
    function fromEvent(e) { var r = svg.getBoundingClientRect(), vx = (e.clientX - r.left) / r.width * g.W; return d.x.min + (vx - g.ml) / g.pw * (d.x.max - d.x.min); }
    svg.addEventListener("pointermove", function (e) { if (e.pointerType === "touch" && !(e.buttons & 1)) return; show(fromEvent(e)); });
    svg.addEventListener("pointerdown", function (e) { show(fromEvent(e)); });
    svg.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") clear(); });
    svg.addEventListener("keydown", function (e) {
      var step = (d.x.max - d.x.min) / 44;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); show((pos === null ? d.x.min : pos) + (e.key === "ArrowRight" ? step : -step)); }
      else if (e.key === "Home") { e.preventDefault(); show(d.x.min); }
      else if (e.key === "End") { e.preventDefault(); show(d.x.max); }
      else if (e.key === "Escape") clear();
    });
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        var i = Number(c.getAttribute("data-s")), now = on.filter(Boolean).length;
        if (on[i] && now === 1) return; // one curve always stays
        on[i] = !on[i];
        c.setAttribute("aria-pressed", on[i] ? "true" : "false");
        lines[i].classList.toggle("is-off", !on[i]);
        if (pos !== null) show(pos);
      });
      // double click / long press: only this one
      c.addEventListener("dblclick", function () {
        var i = Number(c.getAttribute("data-s"));
        on = on.map(function (_, k) { return k === i; });
        chips.forEach(function (o, k) { o.setAttribute("aria-pressed", on[k] ? "true" : "false"); lines[k].classList.toggle("is-off", !on[k]); });
        if (pos !== null) show(pos);
      });
    });
    // a plunger size chosen in the size selector shows only that curve (the others come back with "all")
    document.addEventListener("bk-size", function (e) {
      var k = e.detail.index, want = k < 0 ? "" : String(e.detail.sizes[k]), hit = 0;
      var next = d.series.map(function (s) { var m = k < 0 || new RegExp("(^|\\D)" + want + "(\\D|$)").test(s.n); if (m) hit++; return m; });
      if (!hit) next = d.series.map(function () { return true; });
      on = next;
      chips.forEach(function (c, i) { c.setAttribute("aria-pressed", on[i] ? "true" : "false"); lines[i].classList.toggle("is-off", !on[i]); });
      if (pos !== null) show(pos); else clear();
    });
    var alt = box.querySelector(".pc__alt"), tpl = box.querySelector(".pc__tpl"), shown = null;
    if (alt && tpl && tpl.content) {
      alt.addEventListener("click", function (e) {
        e.preventDefault();
        if (!shown) { shown = document.createElement("div"); shown.className = "pc__origbox"; shown.appendChild(tpl.content.cloneNode(true)); alt.parentNode.insertBefore(shown, alt.nextSibling); alt.textContent = alt.getAttribute("data-hide") || alt.textContent; alt.setAttribute("aria-expanded", "true"); return; }
        var open = !shown.hidden; shown.hidden = open;
        alt.textContent = (open ? alt.getAttribute("data-show") : alt.getAttribute("data-hide")) || alt.textContent;
        alt.setAttribute("aria-expanded", open ? "false" : "true");
      });
      alt.setAttribute("role", "button"); alt.setAttribute("aria-expanded", "false");
    }
  });

  // ---------- drawings: a 2x magnifying glass beside a small crosshair ----------
  // The crosshair marks the point under the pointer; the lens shows that point at twice the size and sits a little way off, up and to the
  // right of the crosshair (or on the other side near an edge), so it never covers it. Mouse: hover. Touch: touch and drag sideways.
  [].forEach.call(document.querySelectorAll(".modules--zoom .module__media"), function (media) {
    var img = media.querySelector("img");
    if (!img) return;
    var LENS = 150, GAP = 26, hideTimer = 0;
    var cross = document.createElement("span"); cross.className = "zoom__cross"; cross.hidden = true; cross.setAttribute("aria-hidden", "true");
    var lens = document.createElement("div"); lens.className = "zoom__lens"; lens.hidden = true; lens.setAttribute("aria-hidden", "true");
    media.appendChild(cross); document.body.appendChild(lens);
    function big() {
      var best = img.currentSrc || img.src, w = 0;
      String(img.getAttribute("srcset") || "").split(",").forEach(function (p) { var m = /(\S+)\s+(\d+)w/.exec(p.trim()); if (m && Number(m[2]) > w) { w = Number(m[2]); best = m[1]; } });
      return best;
    }
    function hide() { cross.hidden = true; lens.hidden = true; }
    function show(e) {
      clearTimeout(hideTimer);
      var r = img.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) { hide(); return; }
      var mr = media.getBoundingClientRect();
      cross.style.left = (e.clientX - mr.left) + "px"; cross.style.top = (e.clientY - mr.top) + "px"; cross.hidden = false;
      lens.style.backgroundImage = "url(" + big() + ")";
      lens.style.backgroundSize = (r.width * 2) + "px " + (r.height * 2) + "px";
      lens.style.backgroundPosition = (LENS / 2 - x * 2) + "px " + (LENS / 2 - y * 2) + "px";
      var left = e.clientX + GAP, top = e.clientY - GAP - LENS;
      if (left + LENS > window.innerWidth - 8) left = e.clientX - GAP - LENS;
      if (top < 8) top = e.clientY + GAP;
      lens.style.left = Math.max(8, left) + "px"; lens.style.top = top + "px"; lens.hidden = false;
    }
    media.addEventListener("pointermove", function (e) { if (e.pointerType === "touch" && !(e.buttons & 1)) return; show(e); });
    media.addEventListener("pointerdown", function (e) { show(e); });
    media.addEventListener("pointerup", function (e) { if (e.pointerType === "touch") hideTimer = setTimeout(hide, 1600); });
    media.addEventListener("pointerleave", function (e) { if (e.pointerType !== "touch") hide(); });
    media.addEventListener("pointercancel", hide); // a touch that turns into a scroll cancels the pointer
  });

  // ---------- tables: select rows or columns, the rest fades, and the selection is compared in place ----------
  // A table marked data-compare lets you click a heading (a small tick shows on hover, and on every heading once something is selected). The first
  // click decides what the items are (rows or columns, see axes()); the unselected ones fade. "Compare" removes the unselected rows or columns so the
  // selection sits side by side in the table itself, marks what differs and can hide what is equal. Nothing opens on top of the page.
  (function () {
    var wraps = [].slice.call(document.querySelectorAll("[data-compare]"));
    if (!wraps.length) return;
    var tables = [], bar, active = null;
    function fmt(s, o) { return String(s || "").replace(/\{(\w+)\}/g, function (m, k) { return o && o[k] != null ? o[k] : m; }); }
    function txt(el) { var c = el.cloneNode(true); [].forEach.call(c.querySelectorAll(".tc__tog"), function (x) { x.remove(); }); return c.textContent.replace(/\s+/g, " ").trim(); }
    function ensureBar() {
      if (bar) return;
      bar = document.createElement("div"); bar.className = "tc__bar"; bar.hidden = true; bar.setAttribute("role", "region");
      bar.innerHTML = '<span class="tc__count" aria-live="polite"></span><button type="button" class="btn btn--sm tc__go"></button>' +
        '<label class="tc__diff" hidden><input type="checkbox"><span></span></label><button type="button" class="tc__clear"></button>';
      document.body.appendChild(bar);
      bar.querySelector(".tc__go").addEventListener("click", function () {
        if (!active) return;
        active.only = !active.only; paint(active); refresh();
        if (active.only && active.w.scrollIntoView) { var r = active.w.getBoundingClientRect(); if (r.top < 70 || r.bottom > window.innerHeight) active.w.scrollIntoView({ behavior: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" }); }
      });
      bar.querySelector("input").addEventListener("change", function (e) { if (active) { active.diffOnly = e.target.checked; paint(active); } });
      bar.querySelector(".tc__clear").addEventListener("click", function () { if (active) { active.sel = []; active.mode = null; active.only = false; active.diffOnly = false; paint(active); refresh(); } });
    }
    function parse(w) {
      var table = w.querySelector("table"), headRow = table && table.querySelector("thead tr:last-child");
      if (!table || !headRow) return null;
      var rows = [].slice.call(table.querySelectorAll("tbody tr"));
      if (rows.length < 3) return null;
      var ui = {}; try { ui = JSON.parse(w.getAttribute("data-cmp") || "{}"); } catch (e) { /* defaults */ }
      return { w: w, table: table, headRow: headRow, rows: rows, ui: ui, mode: null, sel: [], only: false, diffOnly: false, visible: false, cols: headRow.children.length };
    }
    function names(t) {
      return {
        col: [].map.call(t.headRow.children, function (c, i) { return i ? txt(c) : ""; }),
        row: t.rows.map(function (r) { var h = r.querySelector("th"); return h ? txt(h) : ""; })
      };
    }
    // Which axis holds the items: the one whose headings look like model names (MME, ZMP 712, IC 650/710); the other holds attributes
    var CODE = /^(?:[A-ZÅÄÖ0-9][A-ZÅÄÖ0-9 \/.+\-]{1,16}|.{1,20}\d.{0,10})$/;
    function axes(t) {
      var nm = names(t), share = function (a) { var v = a.filter(Boolean); return v.length ? v.filter(function (x) { return CODE.test(x); }).length / v.length : 0; };
      var c = share(nm.col), r = share(nm.row);
      if (c >= 0.6 && c > r) return { col: true, row: false };
      if (r >= 0.6 && r > c) return { col: false, row: true };
      return { col: true, row: true };
    }
    function toggle(t, mode, i) {
      if (t.mode !== mode) { t.mode = mode; t.sel = []; t.only = false; }
      var k = t.sel.indexOf(i); if (k >= 0) t.sel.splice(k, 1); else t.sel.push(i);
      if (!t.sel.length) { t.mode = null; t.only = false; }
      if (t.sel.length < 2) t.only = false;
      active = t; paint(t); refresh();
    }
    function same(vals) { return vals.every(function (v) { return v === vals[0]; }); }
    function paint(t) {
      var on = t.sel.length > 0, cmp = t.only && t.sel.length > 1, i;
      t.w.classList.toggle("tc--on", on); t.w.classList.toggle("tc--only", cmp);
      [].forEach.call(t.table.querySelectorAll("tr, th, td"), function (c) { c.classList.remove("is-sel", "is-off", "tc-hide", "tc-same", "tc-diff"); });
      if (on) {
        if (t.mode === "row") t.rows.forEach(function (r, ri) { var s = t.sel.indexOf(ri) >= 0; [].forEach.call(r.children, function (c) { c.classList.add(s ? "is-sel" : "is-off"); }); if (cmp && !s) r.classList.add("tc-hide"); });
        else {
          [].forEach.call(t.headRow.children, function (c, ci) { if (ci) { c.classList.add(t.sel.indexOf(ci) >= 0 ? "is-sel" : "is-off"); if (cmp && t.sel.indexOf(ci) < 0) c.classList.add("tc-hide"); } });
          t.rows.forEach(function (r) { [].forEach.call(r.children, function (c, ci) { if (ci) { var s = t.sel.indexOf(ci) >= 0; c.classList.add(s ? "is-sel" : "is-off"); if (cmp && !s) c.classList.add("tc-hide"); } }); });
        }
      }
      if (cmp) {
        if (t.mode === "col") {
          t.rows.forEach(function (r) {
            var vals = t.sel.map(function (ci) { return r.children[ci] ? txt(r.children[ci]) : ""; }), eq = same(vals);
            r.classList.add(eq ? "tc-same" : "tc-diff"); if (eq && t.diffOnly) r.classList.add("tc-hide");
          });
        } else {
          for (i = 1; i < t.cols; i++) {
            var vals = t.sel.map(function (ri) { return t.rows[ri].children[i] ? txt(t.rows[ri].children[i]) : ""; }), eq = same(vals);
            (function (ci) {
              [t.headRow.children[ci]].concat(t.rows.map(function (r) { return r.children[ci]; })).forEach(function (c) { if (!c) return; c.classList.add(eq ? "tc-same" : "tc-diff"); if (eq && t.diffOnly) c.classList.add("tc-hide"); });
            })(i);
          }
        }
      }
      [].forEach.call(t.table.querySelectorAll(".tc__tog"), function (b) {
        b.setAttribute("aria-pressed", t.mode === b.getAttribute("data-m") && t.sel.indexOf(Number(b.getAttribute("data-i"))) >= 0 ? "true" : "false");
      });
    }
    function refresh() {
      ensureBar();
      var pick = (active && active.sel.length && active.visible) ? active : tables.filter(function (t) { return t.sel.length && t.visible; })[0];
      if (!pick) { bar.hidden = true; return; }
      active = pick;
      var n = pick.sel.length, ui = pick.ui, go = bar.querySelector(".tc__go"), lab = bar.querySelector(".tc__diff");
      bar.setAttribute("aria-label", ui.cmp_title || "");
      bar.querySelector(".tc__count").textContent = fmt(ui.cmp_selected, { n: n }) + (n < 2 ? " · " + (ui.cmp_pick_more || "") : "");
      go.textContent = pick.only ? (ui.cmp_all || "Show all") : (ui.cmp_compare || "Compare"); go.disabled = n < 2;
      lab.hidden = !pick.only; lab.querySelector("span").textContent = ui.cmp_only_diff || ""; lab.querySelector("input").checked = pick.diffOnly;
      bar.querySelector(".tc__clear").textContent = ui.cmp_clear || "Clear";
      bar.hidden = false;
    }
    // a plunger size picked elsewhere on the page changes the text of the cells: the comparison is worked out again
    document.addEventListener("bk-size", function () { tables.forEach(function (t) { if (t.sel.length) paint(t); }); });

    wraps.forEach(function (w) {
      var t = parse(w); if (!t) return;
      tables.push(t);
      var nm = names(t), ax = axes(t);
      function addTog(th, mode, i, name) {
        var b = document.createElement("button"); b.type = "button"; b.className = "tc__tog"; b.setAttribute("data-m", mode); b.setAttribute("data-i", i);
        b.setAttribute("aria-pressed", "false"); b.setAttribute("aria-label", fmt(t.ui.cmp_select, { name: name })); b.innerHTML = "<i></i>";
        th.insertBefore(b, th.firstChild); th.classList.add("tc__pick");
        th.addEventListener("click", function (e) { if (e.target.closest("a") || e.target.closest(".tc__tog")) return; toggle(t, mode, i); });
        b.addEventListener("click", function () { toggle(t, mode, i); });
      }
      if (ax.col) [].forEach.call(t.headRow.children, function (th, ci) { if (ci && nm.col[ci]) addTog(th, "col", ci, nm.col[ci]); });
      if (ax.row) t.rows.forEach(function (r, ri) { var th = r.querySelector("th"); if (th && nm.row[ri]) addTog(th, "row", ri, nm.row[ri]); });
      var hint = document.createElement("p"); hint.className = "tc__hint"; hint.textContent = t.ui.cmp_hint || "";
      w.parentNode.insertBefore(hint, w);
      if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { t.visible = en[0].isIntersecting; refresh(); }, { rootMargin: "0px 0px -10% 0px" }).observe(w); else t.visible = true;
    });
  })();

  // ---------- plunger size: show all sizes, or the values of one ----------
  // A pump with several plunger sizes writes its values as "85 / 105 / 120 mm". The selector shows all of them (default) or only the value of one size
  // in every table cell of the page that has that many values, and tells the performance chart to show only that curve.
  (function () {
    var boxes = [].slice.call(document.querySelectorAll("[data-sizesel]"));
    if (!boxes.length) return;
    var cells = [].slice.call(document.querySelectorAll("main .spec td, main .table-wrap td")).map(function (td) {
      var m = /^(-?\d[\d.,]*(?: \/ -?\d[\d.,]*)+)(\s*[^\d\s\/].*)?$/.exec(td.textContent.trim());
      return m ? { td: td, parts: m[1].split(" / "), unit: m[2] || "", orig: td.textContent } : null;
    }).filter(Boolean);
    function apply(sizes, k) {
      cells.forEach(function (x) { if (x.parts.length === sizes.length) { x.td.textContent = k < 0 ? x.orig : x.parts[k] + x.unit; x.td.classList.toggle("is-sized", k >= 0); } });
      boxes.forEach(function (b) { if (b.getAttribute("data-sizesel").split(",").length === sizes.length) [].forEach.call(b.querySelectorAll("[role=radio]"), function (r) { r.setAttribute("aria-checked", String(Number(r.getAttribute("data-k")) === k)); }); });
      document.dispatchEvent(new CustomEvent("bk-size", { detail: { index: k, sizes: sizes } }));
    }
    boxes.forEach(function (b) {
      var sizes = b.getAttribute("data-sizesel").split(",");
      [].forEach.call(b.querySelectorAll("[role=radio]"), function (r) { r.addEventListener("click", function () { apply(sizes, Number(r.getAttribute("data-k"))); }); });
    });
  })();

  // ---------- "Product of ...": tap to open (hover opens it in CSS) ----------
  [].forEach.call(document.querySelectorAll(".origin__btn"), function (b) {
    b.addEventListener("click", function () { var o = !b.classList.contains("is-open"); b.classList.toggle("is-open", o); b.setAttribute("aria-expanded", String(o)); });
    document.addEventListener("click", function (e) { if (!b.contains(e.target)) { b.classList.remove("is-open"); b.setAttribute("aria-expanded", "false"); } });
  });

  // ---------- pictures further down: fetched top to bottom once the page has settled ----------
  // The top of the page is what the visitor sees first, so its pictures load first (eager in the HTML); the rest stay lazy for the
  // scroll position, and in quiet time they are also fetched in page order, a few at a time, nearest to the top first.
  (function () {
    var conn = navigator.connection || {};
    if (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || "")) return;
    function go() {
      var list = [].slice.call(document.querySelectorAll("main img[loading=lazy]")).filter(function (im) { return !im.closest(".mega, .site-header, .site-footer") && !im.complete; }).slice(0, 24);
      var i = 0, active = 0;
      function next() {
        while (active < 2 && i < list.length) {
          var im = list[i++];
          active++;
          var done = function () { active--; next(); };
          im.addEventListener("load", done, { once: true });
          im.addEventListener("error", done, { once: true });
          im.loading = "eager";
        }
      }
      next();
    }
    function later() { if (document.hidden) document.addEventListener("visibilitychange", function once() { if (!document.hidden) { document.removeEventListener("visibilitychange", once); go(); } }); else go(); }
    function kick() { if (window.requestIdleCallback) window.requestIdleCallback(later, { timeout: 4000 }); else setTimeout(later, 2000); }
    if (document.readyState === "complete") onActive(kick); else window.addEventListener("load", function () { onActive(kick); }, { once: true });
  })();

  // ---------- preloading: the page you are most likely to open next is already in the cache ----------
  // Pointing at a link (or touching it) fetches that page in the background, together with its first pictures;
  // pointing at a manufacturer in the products menu also fetches that manufacturer's range pages. After the page
  // has loaded, the main menu pages and the cards that stay in view are fetched in quiet moments. Same site only,
  // nothing for visitors who asked their browser to save data, small fixed budget per page view.
  (function () {
    var conn = navigator.connection || {};
    if (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || "") || !window.fetch || !window.URL) return;
    var seen = {}, queue = [], active = 0, spent = 0, BUDGET = 34, PARALLEL = 2;
    var here = location.href.split("#")[0];

    function target(a) {
      if (!a || !a.getAttribute) return null;
      var raw = a.getAttribute("href");
      if (!raw || raw.charAt(0) === "#" || a.hasAttribute("download") || (a.target && a.target !== "_self")) return null;
      var u;
      try { u = new URL(a.href, location.href); } catch (e) { return null; }
      if (u.origin !== location.origin || !/^https?:$/.test(u.protocol)) return null;
      if (/\.[a-z0-9]{2,5}$/i.test(u.pathname) && !/\.html?$/i.test(u.pathname)) return null; // pdf, images, archives
      if (/\/(cms|admin)(\/|$)/.test(u.pathname)) return null;
      u.hash = "";
      return u.href === here ? null : u.href;
    }
    // the first pictures of the fetched page (banner first), picked with the same srcset/sizes the page itself uses
    function warmImages(html, base) {
      var doc;
      try { doc = new DOMParser().parseFromString(html, "text/html"); } catch (e) { return; }
      var list = doc.querySelectorAll(".hero img, main img"), n = 0, done = {};
      for (var i = 0; i < list.length && n < 3; i++) {
        var im = list[i], src = im.getAttribute("src");
        if (!src || /^data:/.test(src) || done[src] || im.closest(".site-header, .mega, .site-footer")) continue;
        done[src] = 1; n++;
        var p = new Image();
        p.decoding = "async";
        if (im.getAttribute("sizes")) p.sizes = im.getAttribute("sizes");
        if (im.getAttribute("srcset")) p.srcset = im.getAttribute("srcset");
        p.src = new URL(src, base).href;
      }
    }
    function pump() {
      while (active < PARALLEL && queue.length) {
        var job = queue.shift();
        active++;
        (function (j) {
          fetch(j.url, { credentials: "same-origin", priority: "low" })
            .then(function (r) { return r.ok && /text\/html/.test(r.headers.get("content-type") || "") ? r.text() : null; })
            .then(function (html) { if (html && j.img) warmImages(html, j.url); })
            .catch(function () { /* offline: nothing lost */ })
            .then(function () { active--; pump(); });
        })(job);
      }
    }
    function fetchPage(url, withImages) {
      if (!url || seen[url] || spent >= BUDGET || document.hidden) return;
      seen[url] = 1; spent++;
      queue.push({ url: url, img: withImages !== false });
      pump();
    }
    // a manufacturer in the menu: its page now, its ranges a moment later
    function menuIntent(a) {
      var id = a.getAttribute("data-panel"), panel = id && document.getElementById(id);
      if (!panel) return;
      [].slice.call(panel.querySelectorAll(".mega__cat-title")).slice(0, 4).forEach(function (c, i) {
        setTimeout(function () { fetchPage(target(c), i === 0); }, 250 + i * 150);
      });
    }
    var timer = 0, last = null;
    function intent(a, delay) {
      var url = target(a);
      if (!url) return;
      clearTimeout(timer);
      last = a;
      timer = setTimeout(function () { fetchPage(url, true); if (a.hasAttribute("data-panel")) menuIntent(a); }, delay);
    }
    function cancel(a) { if (a === last) { clearTimeout(timer); last = null; } }
    var link = function (e) { return e.target && e.target.closest ? e.target.closest("a[href]") : null; };
    document.addEventListener("pointerover", function (e) {
      if (e.pointerType === "touch") return;
      var a = link(e); if (a) intent(a, 180);
    }, { passive: true });
    document.addEventListener("pointerout", function (e) { var a = link(e); if (a) cancel(a); }, { passive: true });
    document.addEventListener("focusin", function (e) { var a = link(e); if (a) intent(a, 120); });
    // touch: the finger is already down, the page can start loading now
    document.addEventListener("touchstart", function (e) { var a = link(e); if (a) intent(a, 0); }, { passive: true });
    // opening the products list: its own page is the most likely next step after the brand pages
    document.querySelectorAll(".nav__item--mega").forEach(function (li) {
      var a = li.querySelector(":scope > a");
      ["pointerenter", "focusin"].forEach(function (ev) { li.addEventListener(ev, function () { setTimeout(function () { fetchPage(target(a), false); }, 150); }, { once: true, passive: true }); });
    });

    // quiet moment after load: the main menu pages, then cards that have been in view for a moment
    function idle(fn) { if (window.requestIdleCallback) window.requestIdleCallback(fn, { timeout: 6000 }); else setTimeout(fn, 3000); }
    // The start page is where visitors come back to (logo, "Startsida", the browser's back button after Contact or Products),
    // so it is always warmed first, with its banner; then the page one level up in the breadcrumb, then the main menu.
    function afterLoad() {
      idle(function () {
        var home = document.querySelector("a.logo"), crumbs = document.querySelectorAll(".breadcrumbs li a"), parent = crumbs.length ? crumbs[crumbs.length - 1] : null;
        fetchPage(target(home), true);
        setTimeout(function () { fetchPage(target(parent), false); }, 300);
        [].forEach.call(document.querySelectorAll(".nav__list > .nav__item > a"), function (a, i) { setTimeout(function () { fetchPage(target(a), false); }, 600 + i * 400); });
      });
      speculate();
      if (!("IntersectionObserver" in window)) return;
      var dwell = new WeakMap();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var a = en.target;
          if (en.isIntersecting) {
            dwell.set(a, setTimeout(function () { io.unobserve(a); fetchPage(target(a), false); }, 900));
          } else { clearTimeout(dwell.get(a)); }
        });
      }, { threshold: 0.6 });
      idle(function () {
        [].slice.call(document.querySelectorAll("main .card__link, main .module a[href], .subnav a[href]")).slice(0, 40).forEach(function (a) { if (target(a)) io.observe(a); });
      });
    }
    // Browsers that support it (Chrome, Edge) are also told to keep the start page ready and to prepare a page completely
    // (prerender) as soon as the pointer has rested on its link for a moment, so opening it is instant. Same site only; the
    // pdf links, downloads, other tabs and the CMS are left out.
    function speculate() {
      try {
        if (!(window.HTMLScriptElement && HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules"))) return;
        var home = document.querySelector("a.logo"), homeUrl = target(home);
        var rules = {
          prerender: [{ where: { and: [{ selector_matches: "a[href^='/']" }, { not: { selector_matches: "[download], [target=_blank], [href$='.pdf'], [href*='/cms/'], [href*='/assets/'], [href*='#']" } }] }, eagerness: "moderate" }]
        };
        if (homeUrl) rules.prefetch = [{ urls: [homeUrl], eagerness: "immediate" }];
        var s = document.createElement("script");
        s.type = "speculationrules";
        s.textContent = JSON.stringify(rules);
        document.head.appendChild(s);
      } catch (e) { /* not supported: the fetch based warming above still works */ }
    }
    if (document.readyState === "complete") onActive(afterLoad); else window.addEventListener("load", function () { onActive(afterLoad); }, { once: true });
  })();

  // ---------- consent + analytics (off unless configured; nothing stored otherwise) ----------
  var a = cfg.analytics;
  if (!a || !a.id) return;
  var KEY = "bk_consent_v1";
  function read() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, JSON.stringify({ analytics: v, ts: Date.now() })); } catch (e) { /* private mode */ } }
  function loadGA() {
    if (window.__bkGA) return;
    window.__bkGA = true;
    window["ga-disable-" + a.id] = false;
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "granted" });
    gtag("js", new Date());
    gtag("config", a.id, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(a.id);
    document.head.appendChild(s);
  }
  function revoke() {
    window["ga-disable-" + a.id] = true;
    document.cookie.split(";").forEach(function (c) {
      var n = c.split("=")[0].trim();
      if (/^_ga/.test(n) || n === "_gid") {
        document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=." + location.hostname.replace(/^www\./, "");
      }
    });
  }
  var banner;
  function hide() { if (banner) { banner.remove(); banner = null; } }
  function show() {
    if (banner) return;
    banner = document.createElement("section");
    banner.className = "consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-labelledby", "consent-title");
    banner.innerHTML = '<h2 id="consent-title">' + esc(ui.title || "Cookies") + "</h2><p>" + esc(ui.text || "") +
      (cfg.privacy ? ' <a href="' + esc(cfg.privacy) + '">' + esc(ui.policy || "") + "</a>" : "") + '</p><div class="consent__actions">' +
      '<button type="button" class="btn" data-c="reject">' + esc(ui.reject || "Avvisa") + '</button>' +
      '<button type="button" class="btn" data-c="accept">' + esc(ui.accept || "Godkänn") + "</button></div>";
    banner.addEventListener("click", function (e) {
      var c = e.target.getAttribute && e.target.getAttribute("data-c");
      if (!c) return;
      if (c === "accept") { write(true); loadGA(); } else { write(false); revoke(); }
      hide();
    });
    document.body.appendChild(banner);
  }
  var saved = read();
  if (saved && saved.analytics === true) onActive(loadGA);
  else if (!saved) show();
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-consent-open]")) show();
  });
})();
