/* BONK walkthrough engine — one shared file for every page. A page opts in by
   declaring, before this script:
     window.BONK_TOUR = {
       id: "portal",                 // localStorage namespace
       accountKey: null,             // portal sets this to the main IGN later (read lazily)
       readyWhen: "#panelIdentity",  // wait for this to be VISIBLE, then first-run auto-starts
       label: "the full loop",       // optional: humanizes the counter ("step 2 of 10 · the full loop")
       steps: [{ sel, title, body, place,
                 img: "/fleet/tut/hold.png",      // optional illustration inside the card (v5)
                 kbd: [["Ctrl","A"],["Ctrl","C"]],// optional key chips under the body (v5)
                 fallbackCenter: true,            // hidden target renders centered instead of skipping (v5)
                 skipTo: 5 }]                     // optional quiet "skip ahead" link to step index (v5)
     };                                            // sel:null => centered; missing/hidden sel => auto-skip
   First-run spotlight coach-mark tour. Page-only, no deps, no worker/DB. */
(function () {
  "use strict";
  // Central tool-tour registry, keyed by the first path segment. Pages that do
  // not define window.BONK_TOUR (the read-only tools) get their tour from here
  // automatically, so a tool page only needs to load this script. Portal + fleet
  // define their own richer config inline and are not in here. Mostly centered
  // explainer cards (no selector) so they are robust across generated pages.
  var TOURS = {
    refine: { steps: [
      { title: "The Ore Calculator", body: "Paste any ore or ice from your cargo and this shows what it is worth refined, at live prices. It is the exact basis the corp buyback uses." },
      { title: "Ore Prices mode", body: "The same paste also prices your load RAW at all five trade hubs, tells you which hub actually buys it, and the Rock Index board lists every ore in the game." },
      { title: "Use it", body: "Copy the ore in the EVE client, paste it in the box, read the ISK. No login, prices refresh hourly." } ] },
    reprocess: { steps: [
      { title: "Reprocess reference", body: "Same idea as the Ore Calculator, laid out as a table: what each ore and ice reprocesses into and what it is worth. BUYBACK is 90% of the Jita refined value." },
      { title: "Read it", body: "Scan for what pays. The compressed toggle flips between raw and compressed values." } ] },
    market: { steps: [
      { title: "Market Finder", body: "Paste one item or a whole multibuy and see what it costs at every trade hub, cheapest highlighted. Or flip it to sell mode and see what the load fetches." },
      { title: "Use it", body: "Copy a list in the EVE client, paste it here, read the totals per hub. Copy it back as a multibuy for the winning hub and go shopping." } ] },
    arbitrage: { steps: [
      { title: "Arbitrage", body: "A buy-here, sell-there profit finder. It scans the hubs for things you can move for a margin." },
      { title: "Read it", body: "Sort by margin, but check the daily volume, it caps how much you can actually flip. The DANGER column names the route that gets you ganked. Updates hourly." } ] },
    blueprints: { steps: [
      { title: "Blueprints", body: "What is worth building right now: the material cost versus the sell price, from live data. Materials and product both priced at Jita, minus a 5 percent job fee." },
      { title: "Push it to the corp", body: "The + track button sends any build into the corp Project Tracker, which sizes the whole queue and tells the fleet what ore to mine for it. Table to mining op in one click." },
      { title: "Read it", body: "Green margin means profit after materials. Start with what you already have the skills and minerals for." } ] },
    lowsec: { steps: [
      { title: "Radar", body: "Three instruments on one page: System Search, the Belt Radar, and the Lowsec Scout. Each section unfolds when you click its bar." },
      { title: "System Search", body: "Type any system in the game and get its belts, true sec, moons, stations, and the last hour of live activity. Scout a destination before you undock." },
      { title: "Belt Radar", body: "Pick a region, get every system's belt count, true sec, moons and stations. Belts never move, so this map never lies." },
      { title: "Read the scout", body: "Check the traffic and recent-loss signals. Quiet is good. Busy and bloody, pick another belt." } ] },
    kills: { steps: [
      { title: "Corp Killboard", body: "Our combat record, mirrored live: every kill and loss the corp has been on." },
      { title: "Use it", body: "Click any row to open the full report on zKillboard. Learn what killed us, then do not do that." } ] },
    "bonk-prospects": { readyWhen: "table", steps: [
      { title: "Recruiting list", body: "Corp-less pilots who recently lost a mining ship, worth a friendly recruiting mail. Recruiters only." },
      { title: "Send one", body: "MAIL and MSG copy a personalized message ready to paste in game. The X marks a pilot done for every recruiter, so nobody double-sends." } ] },
    alliance: { steps: [
      { title: "Alliance Builder", body: "Recruiting targets at the corp level: independent mining corps worth pitching to fly under BONK. Recruiters only." },
      { title: "Work the list", body: "Same drill as the pilot list: the X marks a corp done for every recruiter, so nobody double-contacts. Fresh targets refill daily." } ] },
    decorations: { steps: [
      { title: "The Wall of Goblins", body: "Every medal the corp gives out, and exactly how each one is earned." },
      { title: "Earn one", body: "Most are automatic, the ledger and the kill log watch for them. Pick one and aim at it." } ] },
    tools: { steps: [
      { title: "The Goblin Toolkit", body: "Every tool the corp built, in one place: refining, market, industry, mining ops, intel." },
      { title: "Use it", body: "Public tools need no login. The goblin tools open on their own when you are logged into the portal; the corp word is the backup key. Tap any card." } ] }
  };

  var T = window.BONK_TOUR;
  if (!T) {
    var seg = location.pathname.replace(/^\/+|\/+$/g, "").split("/")[0].toLowerCase();
    var reg = TOURS[seg];
    if (reg) { T = { id: seg, accountKey: null, readyWhen: reg.readyWhen || null, steps: reg.steps }; window.BONK_TOUR = T; }
  }
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
    // v5 additions style themselves so common.css never needs a version sweep
    var st5 = document.createElement("style");
    st5.textContent =
      ".wt-card.wt-wide{max-width:420px;}" +
      ".wt-img{display:block;max-width:100%;border:1px solid rgba(150,168,158,.25);margin:10px 0 2px;}" +
      ".wt-kbdrow{margin:9px 0 0;font-family:var(--mono,monospace);font-size:11px;color:var(--silver-dim,#9aa39c);}" +
      ".wt-kbdrow kbd{font-family:var(--mono,monospace);font-size:11px;background:var(--black,#070809);" +
        "border:1px solid rgba(150,168,158,.3);border-bottom-width:2px;padding:2px 7px;border-radius:3px;}" +
      ".wt-jump{display:inline-block;margin-top:8px;font-family:var(--mono,monospace);font-size:10.5px;" +
        "letter-spacing:.04em;color:var(--muted,#6f776f);background:none;border:none;cursor:pointer;" +
        "text-decoration:underline;padding:0;}" +
      ".wt-jump:hover{color:var(--ore,#46ff5e);}";
    document.head.appendChild(st5);
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
  function showable(st) { return !st.sel || st.fallbackCenter || isVisible(q(st.sel)); }
  function resolveIndex(from, dir) {
    var i = from;
    while (i >= 0 && i < T.steps.length) {
      if (showable(T.steps[i])) return i;
      i += dir;
    }
    return -1;
  }
  // counter over RENDERABLE steps only, so auto-skipped cards never leave holes
  // in the numbering ("step 3 of 8" stays truthful for members and FCs alike)
  function counted(upto) {
    var pos = 0, total = 0;
    for (var i = 0; i < T.steps.length; i++) {
      if (!showable(T.steps[i])) continue;
      total++;
      if (i <= upto) pos++;
    }
    return { pos: pos, total: total };
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
    if (st.sel && !isVisible(el)) el = null;   // fallbackCenter steps render centered
    cardTitle.textContent = st.title || "";
    var bodyHtml = esc(st.body || "").replace(/\n/g, "<br>");
    if (st.img) bodyHtml += '<img class="wt-img" src="' + esc(st.img) + '" alt="" loading="eager" onerror="this.remove()">';
    if (st.kbd && st.kbd.length) {
      bodyHtml += '<div class="wt-kbdrow">' + st.kbd.map(function (combo) {
        return combo.map(function (k) { return "<kbd>" + esc(k) + "</kbd>"; }).join(" + ");
      }).join(" &nbsp;&middot;&nbsp; ") + "</div>";
    }
    if (typeof st.skipTo === "number") {
      bodyHtml += '<button class="wt-jump" type="button">skip to the page tour</button>';
    }
    cardBody.innerHTML = bodyHtml;
    var jump = cardBody.querySelector(".wt-jump");
    if (jump) jump.onclick = function () {
      var to = resolveIndex(st.skipTo, 1);
      if (to >= 0) { idx = to; render(); } else finish(true);
    };
    card.classList.toggle("wt-wide", !!st.img);
    var c = counted(idx);
    cardCount.textContent = "step " + c.pos + " of " + c.total + (T.label ? " · " + T.label : "");
    btnBack.style.visibility = resolveIndex(idx - 1, -1) >= 0 && idx > resolveIndex(0, 1) ? "" : "hidden";
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
