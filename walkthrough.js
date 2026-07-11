/* BONK walkthrough engine — one shared file for every page. A page opts in by
   declaring, before this script:
     window.BONK_TOUR = {
       id: "portal",                 // localStorage namespace
       accountKey: null,             // portal sets this to the main IGN later (read lazily)
       readyWhen: "#panelIdentity",  // wait for this to be VISIBLE, then first-run auto-starts
       steps: [{ sel, title, body, place }]   // sel:null => centered card; missing/hidden sel => step auto-skips
     };
   First-run spotlight coach-mark tour. Page-only, no deps, no worker/DB. */
(function () {
  "use strict";
  var T = window.BONK_TOUR;
  if (!T || !T.steps || !T.steps.length) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  function mobile() { return window.innerWidth < 560; }
  // account is known only after the portal renders, so read the key lazily
  function seenKey() { return "bonk_tour_seen_" + T.id + (T.accountKey ? ":" + T.accountKey : ""); }
  function seen() { try { return localStorage.getItem(seenKey()) === "1"; } catch (e) { return false; } }
  function markSeen() { try { localStorage.setItem(seenKey(), "1"); } catch (e) {} }
  function q(sel) { try { return sel ? document.querySelector(sel) : null; } catch (e) { return null; } }
  function isVisible(el) {
    if (!el) return false;
    var vis = getComputedStyle(el).visibility !== "hidden";
    return vis && (el.offsetParent !== null || getComputedStyle(el).position === "fixed") && el.getClientRects().length > 0;
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  var root, overlay, spot, card, cardTitle, cardBody, cardCount, btnBack, btnSkip, btnNext, helpBtn;
  var idx = -1, active = false, lastFocus = null;

  function build() {
    root = document.createElement("div");
    root.className = "wt-root"; root.style.display = "none";
    root.innerHTML =
      '<div class="wt-overlay"></div><div class="wt-spot"></div>' +
      '<div class="wt-card" role="dialog" aria-modal="true" aria-label="Walkthrough">' +
        '<div class="wt-title"></div><div class="wt-body"></div>' +
        '<div class="wt-foot"><span class="wt-count"></span><span class="wt-btns">' +
          '<button class="wt-b wt-back" type="button">Back</button>' +
          '<button class="wt-b wt-skip" type="button">Skip</button>' +
          '<button class="wt-b wt-next" type="button">Next</button>' +
        '</span></div></div>';
    document.body.appendChild(root);
    overlay = root.querySelector(".wt-overlay"); spot = root.querySelector(".wt-spot"); card = root.querySelector(".wt-card");
    cardTitle = root.querySelector(".wt-title"); cardBody = root.querySelector(".wt-body"); cardCount = root.querySelector(".wt-count");
    btnBack = root.querySelector(".wt-back"); btnSkip = root.querySelector(".wt-skip"); btnNext = root.querySelector(".wt-next");
    btnBack.onclick = function () { go(-1); };
    btnNext.onclick = function () { go(1); };
    btnSkip.onclick = function () { finish(true); };
    helpBtn = document.createElement("button");
    helpBtn.className = "wt-help"; helpBtn.type = "button";
    helpBtn.setAttribute("aria-label", "Replay the walkthrough"); helpBtn.textContent = "?";
    helpBtn.onclick = function () { start(true); };
    document.body.appendChild(helpBtn);
    window.addEventListener("resize", function () { if (active) render(); });
  }

  // first showable step from `from` moving `dir` (skip null-target? no; skip only missing/hidden targets)
  function resolveIndex(from, dir) {
    var i = from;
    while (i >= 0 && i < T.steps.length) {
      var st = T.steps[i];
      if (!st.sel || isVisible(q(st.sel))) return i;
      i += dir;
    }
    return -1;
  }

  function start(replay) {
    if (active) return;
    if (!replay && seen()) return;
    var first = resolveIndex(0, 1);
    if (first < 0) return;
    active = true; lastFocus = document.activeElement;
    root.style.display = "";
    document.addEventListener("keydown", onKey, true);
    idx = first; render();
  }

  function go(dir) {
    var next = resolveIndex(idx + dir, dir);
    if (next < 0) { if (dir > 0) finish(true); return; }
    idx = next; render();
  }

  function finish(save) {
    active = false; root.style.display = "none";
    document.removeEventListener("keydown", onKey, true);
    if (save) markSeen();
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }

  function onKey(e) {
    if (!active) return;
    if (e.key === "Escape") { e.preventDefault(); finish(true); }
    else if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    else if (e.key === "Tab") {
      var f = [btnBack, btnSkip, btnNext].filter(function (b) { return b.offsetParent !== null && b.style.visibility !== "hidden"; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  function render() {
    var st = T.steps[idx];
    var el = st.sel ? q(st.sel) : null;
    cardTitle.textContent = st.title || "";
    cardBody.innerHTML = esc(st.body || "").replace(/\n/g, "<br>");
    cardCount.textContent = (idx + 1) + " / " + T.steps.length;
    btnBack.style.visibility = resolveIndex(idx - 1, -1) >= 0 ? "" : "hidden";
    btnNext.textContent = resolveIndex(idx + 1, 1) < 0 ? "Done" : "Next";
    if (el) {
      try { el.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" }); } catch (e) { try { el.scrollIntoView(); } catch (e2) {} }
      overlay.style.background = "transparent";
      requestAnimationFrame(function () {
        var r = el.getBoundingClientRect(), pad = 6;
        spot.style.display = "";
        spot.style.left = (r.left - pad) + "px"; spot.style.top = (r.top - pad) + "px";
        spot.style.width = (r.width + pad * 2) + "px"; spot.style.height = (r.height + pad * 2) + "px";
        placeCard(r, st.place); focusCard();
      });
    } else {
      overlay.style.background = "rgba(7,8,9,.82)";
      spot.style.display = "none";
      placeCard(null, "center"); focusCard();
    }
  }

  function focusCard() { try { btnNext.focus({ preventScroll: true }); } catch (e) {} }

  function placeCard(rect, place) {
    card.style.left = card.style.top = card.style.right = card.style.bottom = ""; card.style.transform = "";
    if (mobile()) { card.classList.add("wt-sheet"); return; }
    card.classList.remove("wt-sheet");
    var cw = card.offsetWidth, ch = card.offsetHeight, gap = 14, vh = window.innerHeight, vw = window.innerWidth;
    function center() { card.style.left = "50%"; card.style.top = "50%"; card.style.transform = "translate(-50%,-50%)"; }
    if (!rect || place === "center") { center(); return; }
    var below = rect.bottom + gap, above = rect.top - gap - ch, top;
    if (place === "top" && above >= 8) top = above;
    else if (place === "bottom" && below + ch <= vh - 8) top = below;
    else if (below + ch <= vh - 8) top = below;
    else if (above >= 8) top = above;
    else { center(); return; }
    var left = Math.max(10, Math.min(rect.left + rect.width / 2 - cw / 2, vw - cw - 10));
    card.style.top = Math.max(10, Math.min(top, vh - ch - 10)) + "px";
    card.style.left = left + "px";
  }

  function boot() {
    build();
    var readySel = T.readyWhen || (T.steps[0] && T.steps[0].sel);
    if (!readySel) { if (!seen()) start(false); return; }
    var tries = 0, timer = null, obs = null;
    function done() { if (timer) clearInterval(timer); if (obs) obs.disconnect(); }
    function check() { if (isVisible(q(readySel))) { done(); if (!seen()) start(false); return true; } return false; }
    if (check()) return;
    if (window.MutationObserver) { obs = new MutationObserver(function () { check(); }); obs.observe(document.body, { childList: true, subtree: true }); }
    timer = setInterval(function () { tries++; if (check() || tries > 200) done(); }, 300); // ~60s backstop
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.BONKTour = {
    start: function () { start(true); },
    reset: function () { try { localStorage.removeItem(seenKey()); } catch (e) {} },
  };
})();
