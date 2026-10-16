/* Progressive enhancement. No frameworks, no third-party requests
   until the visitor asks for them (video click) or consents (analytics). */
(function () {
  "use strict";
  var cfg = {};
  try { cfg = JSON.parse(document.getElementById("bk-config").textContent) || {}; } catch (e) { /* defaults */ }
  var ui = cfg.ui || {};

  // ---------- quote request form ----------
  // Nothing leaves the page until the visitor presses send. Without an endpoint the visitor's own mail program is used.
  Array.prototype.forEach.call(document.querySelectorAll("[data-quote]"), function (box) {
    var form = box.querySelector("form");
    var status = box.querySelector(".qf__status");
    if (!form) return;
    // arrived from a product page: ?produkt=<name> pre-fills the message
    try {
      var m = /[?&]produkt=([^&#]*)/.exec(window.location.search);
      var ta = form.querySelector("textarea");
      if (m && ta && !ta.value) ta.value = box.getAttribute("data-about") + " " + decodeURIComponent(m[1].replace(/\+/g, " ")).slice(0, 120) + "\n\n";
    } catch (e) { /* ignore malformed encoding */ }
    function say(msg, bad) { status.textContent = msg; status.className = "qf__status" + (bad ? " is-bad" : " is-ok"); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = new FormData(form);
      if (data.get("website")) { say(box.getAttribute("data-ok")); form.reset(); return; } // honeypot: pretend success
      var endpoint = box.getAttribute("data-endpoint");
      var btn = form.querySelector("button[type=submit]");
      if (endpoint) {
        btn.disabled = true; say(box.getAttribute("data-sending"));
        var key = box.getAttribute("data-key");
        var opts = { method: "POST", body: data, headers: { Accept: "application/json" } };
        if (key) {
          // Supabase REST: JSON row into the quote_requests table; the public key may only insert (row-level security)
          var row = { message: String(data.get("message") || ""), consent: true, lang: document.documentElement.lang || "", page: location.pathname };
          ["name", "company", "email", "phone"].forEach(function (k) { row[k] = String(data.get(k) || ""); });
          opts = { method: "POST", body: JSON.stringify(row),
            headers: { "Content-Type": "application/json", apikey: key, Authorization: "Bearer " + key, Prefer: "return=minimal" } };
        }
        fetch(endpoint, opts)
          .then(function (r) { if (!r.ok) throw new Error(String(r.status)); say(box.getAttribute("data-ok")); form.reset(); })
          .catch(function () { say(box.getAttribute("data-err"), true); })
          .then(function () { btn.disabled = false; });
        return;
      }
      var to = box.getAttribute("data-mailto");
      var body = ["name", "company", "email", "phone"].map(function (k) { return data.get(k) ? k + ": " + data.get(k) : ""; })
        .filter(Boolean).join("\n") + "\n\n" + data.get("message");
      say(box.getAttribute("data-mail"));
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(box.getAttribute("data-subject")) + "&body=" + encodeURIComponent(body);
    });
  });

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
    if (!lowData && !small.matches) {
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

  // ---------- site search (static index, loaded on demand) ----------
  var searchBtn = document.querySelector("[data-search-open]");
  var dlg, input, list, index;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function build() {
    dlg = document.createElement("dialog");
    dlg.className = "search";
    dlg.setAttribute("aria-label", ui.search || "Sök");
    dlg.innerHTML = '<div class="search__bar"><input class="search__input" type="search" autocomplete="off" placeholder="' + esc(ui.searchPlaceholder || "Sök…") +
      '" aria-label="' + esc(ui.search || "Sök") + '"><button class="search__close" type="button">' + esc(ui.searchClose || "Stäng") + '</button></div><ul class="search__results"></ul>';
    document.body.appendChild(dlg);
    input = dlg.querySelector(".search__input");
    list = dlg.querySelector(".search__results");
    dlg.querySelector(".search__close").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    input.addEventListener("input", run);
  }
  function run() {
    var q = norm(input.value.trim());
    if (!index || q.length < 2) { list.innerHTML = ""; return; }
    var terms = q.split(/\s+/);
    var hits = [];
    index.forEach(function (it) {
      var title = norm(it.t), body = norm(it.x);
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        var inT = title.indexOf(terms[i]) >= 0, inB = body.indexOf(terms[i]) >= 0;
        if (!inT && !inB) return;
        score += (inT ? 5 : 0) + (inB ? 1 : 0);
      }
      hits.push({ it: it, s: score });
    });
    hits.sort(function (a, b) { return b.s - a.s; });
    list.innerHTML = hits.length
      ? hits.slice(0, 12).map(function (h) { return '<li><a href="' + esc(h.it.u) + '"><strong>' + esc(h.it.t) + "</strong><span>" + esc(h.it.x.slice(0, 110)) + "…</span></a></li>"; }).join("")
      : '<li class="search__empty">' + esc(ui.searchNone || "Inga träffar.") + "</li>";
  }
  if (searchBtn) {
    searchBtn.addEventListener("click", function () {
      if (!dlg) build();
      if (!index) fetch(cfg.searchIndex || "/search-index.json").then(function (r) { return r.json(); }).then(function (j) { index = j; run(); }).catch(function () { /* offline */ });
      dlg.showModal();
      input.focus();
    });
  }

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
    if (document.readyState === "complete") kick(); else window.addEventListener("load", kick, { once: true });
  })();

  // ---------- preloading: the page you are most likely to open next is already in the cache ----------
  // Pointing at a link (or touching it) fetches that page in the background, together with its first pictures;
  // pointing at a manufacturer in the products menu also fetches that manufacturer's range pages. After the page
  // has loaded, the main menu pages and the cards that stay in view are fetched in quiet moments. Same site only,
  // nothing for visitors who asked their browser to save data, small fixed budget per page view.
  (function () {
    var conn = navigator.connection || {};
    if (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || "") || !window.fetch || !window.URL) return;
    var seen = {}, queue = [], active = 0, spent = 0, BUDGET = 28, PARALLEL = 2;
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
    function afterLoad() {
      idle(function () {
        [].forEach.call(document.querySelectorAll(".nav__list > .nav__item > a"), function (a, i) { setTimeout(function () { fetchPage(target(a), false); }, i * 400); });
      });
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
    if (document.readyState === "complete") afterLoad(); else window.addEventListener("load", afterLoad, { once: true });
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
  if (saved && saved.analytics === true) loadGA();
  else if (!saved) show();
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-consent-open]")) show();
  });
})();
