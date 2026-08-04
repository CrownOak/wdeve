/* Shared top nav for the Wealthy Dropouts tool pages + hub.
   Injected on load; styled by common.css (.topnav) plus the style block below.
   THE TOOLBELT (2026-07-12): four pinned daily drivers stay inline; every
   destination lives in the three-line TOOLS menu, grouped. Edit once, all
   pages update. */
(function () {
  var ORIGIN = "";        // relative to the current domain (bonkeve.com); no cross-domain redirect hop
  var BASE = "/";         // the site lives at the domain root now, not under /wdeve/

  // ---- i18n loader: hand-authored pages include /i18n.js directly in <head>;
  // the cloud-generated tool pages get it here, same pattern as the walkthrough
  // loader below. The engine is inert for English (the default), so this costs
  // nothing unless the goblin picked Russian. ----
  if (!window.BONKLANG && !document.querySelector('script[src*="i18n.js"]')) {
    var i18nJs = document.createElement("script");
    i18nJs.src = ORIGIN + BASE + "i18n.js?v=6";
    (document.head || document.documentElement).appendChild(i18nJs);
  }

  // Favicon: project pages must set it explicitly (the browser's auto /favicon.ico
  // request hits the domain root, not /wdeve/). Inject once if not already present.
  if (!document.querySelector("link[rel='icon']")) {
    var fav = document.createElement("link");
    fav.rel = "icon"; fav.type = "image/png"; fav.href = ORIGIN + BASE + "favicon.png";
    (document.head || document.documentElement).appendChild(fav);
  }

  // [label, href, group, pinned] — pinned items also appear in the panel so the
  // mobile menu (which hides the inline row) always reaches all destinations.
  // ORDER IS PRIORITY, not alphabet. We are a MINING corp, so the tools that turn
  // rock into ISK sit above the ones that watch other people. Within MARKET:
  // Ore Calc first (what is this rock worth, the question every member asks
  // daily), then Survey Scan and Reprocess which answer the same question at the
  // belt, then Market/Blueprints/Arbitrage which are the industry layer, then the
  // Workbench which is where you go when you already know what you want.
  // MARKET now sits ABOVE INTEL for the same reason: intel serves the mining, not
  // the other way round.
  var ITEMS = [
    ["Home",        BASE,                     "HOME",   true ],
    ["Apply",       BASE + "apply/",          "HOME",   false],
    ["Portal",      BASE + "portal/",         "MEMBER", true ],
    ["Fleet",       BASE + "fleet/",          "MEMBER", true ],
    ["Decorations", BASE + "decorations/",    "MEMBER", false],
    ["Buyback Desk", BASE + "buyback/",       "MEMBER", false],
    ["Ore Calc",    BASE + "refine/",         "MARKET", false],
    ["Survey Scan", BASE + "survey/",         "MARKET", false],
    ["Reprocess",   BASE + "reprocess/",      "MARKET", false],
    ["Market",      BASE + "market/",         "MARKET", false],
    ["Blueprints",  BASE + "blueprints/",     "MARKET", false],
    ["Arbitrage",   BASE + "arbitrage/",      "MARKET", false],
    ["Workbench",   BASE + "tools/",          "MARKET", false],
    ["GOBSEC",      BASE + "gobsec/",         "INTEL",  false],
    ["WATCHTOWER",  BASE + "cartel/",         "INTEL",  false],
    ["PVP Briefing", BASE + "briefing/",      "INTEL",  false],
    // RECRUIT: these came out of the bar in the 12->7 cut and never came back,
    // while their MEMBER_LABELS entries stayed behind. Restored 2026-08-03 with
    // a real gate instead of a redacted label. 5th field is the gate.
    ["Recruiting",  BASE + "bonk-prospects/", "RECRUIT", false, "recruit"],
    ["The Shortlist", BASE + "gobsec/finder/",  "RECRUIT", false, "recruit"]
  ];
  var GROUPS = ["HOME", "MEMBER", "MARKET", "INTEL", "RECRUIT"];

  /* ---- GATED ITEMS ----
     A gated item renders HIDDEN and is only revealed once /api/whoami comes back
     with a role that clears it. Hidden-by-default is the only safe direction: the
     other way round flashes the recruiting tools to every visitor for the length
     of one fetch, and a screenshot of that flash is exactly what we are avoiding.

     THIS IS MENU HYGIENE, NOT SECURITY. It hides a link. The pages themselves are
     protected by their own page_lock passwords (bonk-prospects BONKDRAFT,
     gobsec/finder GOBSTALK) and the portal APIs by needRole on the server. Never
     treat a hidden nav entry as an access control.

     `recruiter` is read defensively: no such account flag exists yet, so today
     this resolves to officer and admin only. When the flag ships, this line is
     already correct and nothing here has to change. */
  function gateOk(d, gate) {
    if (!gate) return true;
    if (!d || !d.loggedIn) return false;
    if (gate === "recruit") {
      return d.role === "officer" || d.role === "admin" || d.recruiter === true;
    }
    return false;   // unknown gate = closed, never open
  }

  /* Reveal what the account clears, then hide any group left with nothing in it
     so we never print a RECRUIT header over empty space. */
  function applyGates(d) {
    var gated = bar.querySelectorAll("a[data-gate]");
    for (var n = 0; n < gated.length; n++) {
      if (gateOk(d, gated[n].getAttribute("data-gate"))) gated[n].removeAttribute("hidden");
      else gated[n].setAttribute("hidden", "");
    }
    var grps = bar.querySelectorAll(".bn-group");
    for (var q = 0; q < grps.length; q++) {
      var links = grps[q].querySelectorAll("a");
      if (!links.length) continue;                       // language block, leave it
      var shown = 0;
      for (var z = 0; z < links.length; z++) if (!links[z].hasAttribute("hidden")) shown++;
      grps[q].style.display = shown ? "" : "none";
    }
  }
  // Members see the recruiting tools by name; the public sees the redacted labels.
  // Set once whoami resolves (below); default stays CLASSIFIED/REDACTED for the world.
  var MEMBER_LABELS = { "bonk-prospects/": "Recruiting", "alliance/": "Alliance", "cartel/": "Watchtower", "gobsec/": "GOBSEC" };

  var path = location.pathname.replace(/index\.html$/, "");
  if (path.charAt(path.length - 1) !== "/") path += "/";
  function current(p) { return p === BASE ? (path === BASE) : (path.indexOf(p) === 0); }
  function linkHtml(it, cls) {
    var rel = it[1].slice(BASE.length); // e.g. "bonk-prospects/"
    var klass = (cls + (current(it[1]) ? " cur" : "")).replace(/^ /, "");
    // gated items ship hidden and are revealed by applyGates once whoami answers
    var gate = it[4] ? ' data-gate="' + it[4] + '" hidden' : "";
    return '<a' + (klass ? ' class="' + klass + '"' : "")
         + ' href="' + ORIGIN + it[1] + '" data-rel="' + rel + '"' + gate + '>' + it[0] + '</a>';
  }

  var bar = document.createElement("div");
  bar.className = "topnav";
  var html = '<a class="brand" href="' + ORIGIN + BASE + '">'
           + '<span class="tick">BONK</span><span class="brandtext">WEALTHY DROPOUTS</span></a>'
           + '<span class="navwho" id="navwho"></span><nav>';
  var i, g, curUnpinned = false;
  for (i = 0; i < ITEMS.length; i++) {
    if (ITEMS[i][3]) html += linkHtml(ITEMS[i], "");
    else if (current(ITEMS[i][1])) curUnpinned = true; // light the burger for panel-only pages
  }
  html += '</nav>'
        + '<span class="bn-eve" title="EVE time (UTC)"><span class="bn-eve-l">EVE</span>'
        + '<b data-eve-time="hm">--:--</b></span>'
        + '<span class="bn-lang" id="bnlang" data-i18n-skip role="group" aria-label="Language / Язык">'
        + '<button type="button" data-lang="en">EN</button>'
        + '<span class="bn-lang-d" aria-hidden="true">·</span>'
        + '<button type="button" data-lang="ru">RU</button></span>'
        + '<button type="button" class="bn-burger' + (curUnpinned ? " cur" : "") + '" id="bnburger"'
        + ' aria-expanded="false" aria-controls="bnpanel" aria-label="Open the tools menu">'
        + '<span class="bn-lines" aria-hidden="true"><span></span><span></span><span></span></span>'
        + '<span class="bn-blabel">Tools</span></button>'
        + '<div class="bn-panel" id="bnpanel" hidden>';
  for (g = 0; g < GROUPS.length; g++) {
    html += '<div class="bn-group"><div class="bn-glabel">' + GROUPS[g] + '</div>';
    for (i = 0; i < ITEMS.length; i++)
      if (ITEMS[i][2] === GROUPS[g]) html += linkHtml(ITEMS[i], "bn-item");
    html += '</div>';
  }
  html += '<div class="bn-group" data-i18n-skip><div class="bn-glabel">LANGUAGE · ЯЗЫК</div>'
        + '<button type="button" class="bn-item" data-lang="en">English</button>'
        + '<button type="button" class="bn-item" data-lang="ru">Русский</button></div>';
  // The desk gets a door of its own at the bottom of the panel. It is the one
  // tool every miner needs mid contract, so it glows, gently, like the rock does.
  html += '<a class="bn-deskbtn" href="' + ORIGIN + BASE + 'buyback/">THE BUYBACK DESK</a>';
  html += '</div>';
  bar.innerHTML = html;
  if (document.body) document.body.insertBefore(bar, document.body.firstChild);
  // Tidy immediately so an all-gated group never prints its header over empty
  // space in the window before whoami answers, or at all if the call fails.
  // Closed is the correct failure state, so this runs before any fetch.
  applyGates(null);

  // The toolbelt open/close: click toggles, Escape closes (focus back on the
  // burger), any click outside closes. Links are plain <a> so middle-click and
  // ctrl-click behave. Panel z-index sits below the walkthrough overlays (9998+).
  var burger = document.getElementById("bnburger"), panel = document.getElementById("bnpanel");
  function setOpen(on, refocus) {
    if (!burger || !panel) return;
    panel.hidden = !on;
    burger.setAttribute("aria-expanded", on ? "true" : "false");
    if (!on && refocus) burger.focus();
  }
  function isOpen() { return !!panel && !panel.hidden; }
  if (burger && panel) {
    burger.addEventListener("click", function () { setOpen(!isOpen()); });
    document.addEventListener("click", function (e) {
      if (isOpen() && !panel.contains(e.target) && !burger.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) setOpen(false, true);
    });
  }

  // ---- language switch wiring: EN is the default; RU is the opt-in. The
  // i18n engine (BONKLANG) swaps text live with no reload; if a click lands
  // before the engine finished loading (generator pages inject it async), we
  // persist the pick and reload once as the fallback. ----
  function curLang() {
    if (window.BONKLANG) return window.BONKLANG.lang;
    try { return localStorage.getItem("bonk.lang") || localStorage.getItem("bonk.lang.acct") || "en"; }
    catch (e) { return "en"; }
  }
  function paintLang() {
    var on = curLang(), bs = bar.querySelectorAll("[data-lang]");
    for (var k4 = 0; k4 < bs.length; k4++)
      bs[k4].classList[bs[k4].getAttribute("data-lang") === on ? "add" : "remove"]("on");
  }
  paintLang();
  bar.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("[data-lang]") : null;
    if (!b) return;
    var v = b.getAttribute("data-lang");
    if (window.BONKLANG) window.BONKLANG.set(v);
    else { try { localStorage.setItem("bonk.lang", v); } catch (e2) {} location.reload(); return; }
    paintLang();
  });
  document.addEventListener("bonk:lang", paintLang);

  // Fleet live indicator: a live op with ore actually in it (round value > 0)
  // lights a pulsing dot on the Fleet links and sets the burger lines pulsing
  // (the bar link is hidden on mobile, so the burger carries the signal there).
  // Rides /api/public-stats (60s server memo, no figures exposed); checked on
  // load, then every 2 minutes while the tab is visible.
  function setFleetHot(on) {
    var links = bar.querySelectorAll('a[data-rel="fleet/"]');
    for (var k2 = 0; k2 < links.length; k2++) {
      var dot = links[k2].querySelector(".bn-live");
      if (on && !dot) {
        dot = document.createElement("span");
        dot.className = "bn-live";
        dot.title = "A fleet op is live right now. Ore is dropping.";
        links[k2].appendChild(dot);
      } else if (!on && dot) dot.parentNode.removeChild(dot);
    }
    if (burger) {
      burger.classList[on ? "add" : "remove"]("bn-hot");
      burger.title = on ? "A fleet op is live right now. Ore is dropping." : "";
    }
  }
  function checkFleet() {
    fetch(ORIGIN + BASE + "api/public-stats")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) setFleetHot(!!d.op_hot); })
      .catch(function () {});
  }
  checkFleet();
  setInterval(function () { if (document.visibilityState === "visible") checkFleet(); }, 120000);

  // Login indicator next to the brand: ask the portal who is logged in (the
  // session is a same-origin httpOnly cookie, so /api/whoami just reads it). Show
  // "logged in as X" so a goblin knows their activity is tracked to their account,
  // or a "log in" link into the portal when not. Best effort; silent if offline.
  var st = document.createElement("style");
  st.textContent =
    ".navwho{font-family:var(--mono,ui-monospace,monospace);font-size:11px;letter-spacing:.04em;" +
    "display:inline-flex;align-items:center;gap:6px;color:var(--muted,#6f776f);cursor:pointer;" +
    "border:1px solid var(--line,rgba(150,168,158,.16));padding:5px 10px;white-space:nowrap;margin-left:2px;" +
    "clip-path:polygon(0 0,100% 0,92% 100%,0 100%);transition:border-color .15s,color .15s;}" +
    ".navwho .dotln{width:7px;height:7px;border-radius:50%;background:var(--muted,#6f776f);flex:none;}" +
    ".navwho:hover{border-color:var(--ore,#46ff5e);color:var(--ore,#46ff5e);}" +
    ".navwho.in{color:var(--ore,#46ff5e);border-color:rgba(70,255,94,.4);}" +
    ".navwho.in .dotln{background:var(--ore,#46ff5e);box-shadow:0 0 6px rgba(70,255,94,.55);}" +
    ".navwho .unrd{color:var(--ore,#46ff5e);font-weight:700;flex:none;white-space:nowrap;}" +
    "@media(max-width:620px){.navwho .lbl{display:none;}}" +
    /* logged-out visitors get one quiet door. Understated by law (Kyle 7/29):
       same chip language as the login indicator, no pulse, no color shout. */
    ".navjoin{font-family:var(--mono,ui-monospace,monospace);font-size:11px;letter-spacing:.09em;" +
    "display:inline-flex;align-items:center;color:var(--muted,#6f776f);text-decoration:none;text-transform:uppercase;" +
    "border:1px solid var(--line,rgba(150,168,158,.16));padding:5px 11px;white-space:nowrap;margin-left:6px;" +
    "clip-path:polygon(0 0,100% 0,92% 100%,0 100%);transition:border-color .15s,color .15s;}" +
    ".navjoin:hover{color:var(--ore,#46ff5e);border-color:rgba(70,255,94,.4);}" +
    /* ---- the toolbelt ---- */
    ".bn-burger{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono,ui-monospace,monospace);" +
    "font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--silver-dim,#9aa39c);" +
    "background:transparent;border:1px solid var(--line,rgba(150,168,158,.16));padding:7px 13px;cursor:pointer;" +
    "clip-path:polygon(0 0,100% 0,90% 100%,0 100%);transition:border-color .15s,color .15s;}" +
    ".bn-burger:hover,.bn-burger[aria-expanded=true]{border-color:var(--ore,#46ff5e);color:var(--ore,#46ff5e);}" +
    ".bn-burger.cur{color:var(--ore,#46ff5e);border-color:rgba(70,255,94,.4);}" +
    ".bn-lines{display:inline-flex;flex-direction:column;gap:3px;width:14px;flex:none;}" +
    ".bn-lines span{display:block;height:2px;background:currentColor;}" +
    ".bn-panel{position:absolute;top:calc(100% + 8px);right:16px;z-index:9000;" +
    "width:min(320px,calc(100vw - 24px));background:var(--steel,#14171a);" +
    "border:1px solid var(--line,rgba(150,168,158,.16));border-top:3px solid var(--ore,#46ff5e);" +
    "box-shadow:0 18px 50px rgba(0,0,0,.55);padding:14px 14px 16px;" +
    "max-height:calc(100vh - 80px);overflow:auto;animation:bnDrop .14s ease;}" +
    ".bn-panel[hidden]{display:none!important;}" +
    "@keyframes bnDrop{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:none;}}" +
    "@media(prefers-reduced-motion:reduce){.bn-panel{animation:none;}}" +
    ".bn-group{margin-top:12px;}.bn-group:first-child{margin-top:0;}" +
    ".bn-glabel{font-family:var(--mono,ui-monospace,monospace);font-size:10px;letter-spacing:.22em;" +
    "color:var(--muted,#6f776f);border-bottom:1px solid var(--line,rgba(150,168,158,.16));" +
    "padding-bottom:5px;margin-bottom:6px;}" +
    ".bn-item{display:block;font-family:var(--mono,ui-monospace,monospace);font-size:11.5px;letter-spacing:.1em;" +
    "text-transform:uppercase;color:var(--silver-dim,#9aa39c);text-decoration:none;padding:7px 9px;" +
    "transition:color .15s,background .15s;}" +
    ".bn-item:hover{color:var(--ore,#46ff5e);background:rgba(70,255,94,.06);}" +
    ".bn-item.cur{background:var(--ore,#46ff5e);color:#04140a;font-weight:700;}" +
    ".bn-live{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--ore,#46ff5e);" +
    "margin-left:7px;vertical-align:middle;box-shadow:0 0 6px rgba(70,255,94,.8);" +
    "animation:bnPulse 1.6s ease-in-out infinite;}" +
    ".cur .bn-live{background:#04140a;box-shadow:none;}" +
    ".bn-burger.bn-hot{border-color:rgba(70,255,94,.4);}" +
    ".bn-burger.bn-hot .bn-lines span{background:var(--ore,#46ff5e);box-shadow:0 0 5px rgba(70,255,94,.6);" +
    "animation:bnPulse 1.4s ease-in-out infinite;}" +
    ".bn-burger.bn-hot .bn-lines span:nth-child(2){animation-delay:.2s;}" +
    ".bn-burger.bn-hot .bn-lines span:nth-child(3){animation-delay:.4s;}" +
    "@keyframes bnPulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.45);opacity:.55;}}" +
    // the desk stands out quietly: the menu row breathes a faint green, and the
    // panel ends on a small, confident door. Understated on purpose: it should
    // catch the corner of the eye, not wave at it. The .cur state keeps the
    // standard inverted row (ink on ore) or the label vanishes into itself.
    ".bn-item[data-rel=\"buyback/\"]{color:var(--ore,#46ff5e);animation:bnDeskRow 4.6s ease-in-out infinite;}" +
    ".bn-item[data-rel=\"buyback/\"].cur{color:#04140a;animation:none;text-shadow:none;}" +
    "@keyframes bnDeskRow{0%,100%{text-shadow:0 0 0 rgba(70,255,94,0);}50%{text-shadow:0 0 8px rgba(70,255,94,.4);}}" +
    ".bn-deskbtn{display:flex;align-items:center;justify-content:center;gap:9px;margin-top:14px;" +
    "padding:10px 12px;text-decoration:none;font-family:var(--mono,ui-monospace,monospace);" +
    "font-size:10.5px;letter-spacing:.24em;color:var(--silver-dim,#9aa39c);" +
    "border:1px solid var(--line,rgba(150,168,158,.16));transition:color .3s,border-color .3s;}" +
    ".bn-deskbtn::before{content:\"\";width:6px;height:6px;border-radius:50%;flex:0 0 auto;" +
    "background:var(--ore,#46ff5e);animation:bnDeskDot 4.6s ease-in-out infinite;}" +
    "@keyframes bnDeskDot{0%,100%{opacity:.3;box-shadow:0 0 0 rgba(70,255,94,0);}" +
    "50%{opacity:1;box-shadow:0 0 7px rgba(70,255,94,.5);}}" +
    ".bn-deskbtn:hover{color:var(--ore,#46ff5e);border-color:rgba(70,255,94,.4);}" +
    "@media(prefers-reduced-motion:reduce){.bn-live,.bn-burger.bn-hot .bn-lines span,.bn-deskbtn::before,.bn-item[data-rel=\"buyback/\"]{animation:none;}}" +
    "@media(max-width:700px){.topnav nav{display:none;}.bn-burger{margin-left:auto;}" +
    ".bn-panel{position:fixed;top:54px;left:0;right:0;width:auto;border-left:0;border-right:0;" +
    "max-height:calc(100vh - 54px);}}" +
    "@media(max-width:480px){.bn-blabel{display:none;}}" +
    /* ---- EVE time (UTC): quiet instrument between the links and the toolbelt ---- */
    ".bn-eve{display:inline-flex;align-items:baseline;gap:7px;flex:none;white-space:nowrap;cursor:default;" +
    "font-family:var(--mono,ui-monospace,monospace);color:var(--muted,#6f776f);" +
    "padding-left:16px;border-left:1px solid var(--line,rgba(150,168,158,.16));}" +
    ".bn-eve .bn-eve-l{font-size:9.5px;letter-spacing:.24em;color:var(--ore,#46ff5e);font-weight:700;}" +
    ".bn-eve b{font-size:12px;font-weight:600;letter-spacing:.14em;color:var(--silver-dim,#9aa39c);" +
    "font-variant-numeric:tabular-nums;}" +
    "@media(max-width:700px){.bn-eve{margin-left:auto;border-left:0;padding-left:0;}" +
    ".topnav .bn-burger{margin-left:12px;}}" +
    "@media(max-width:390px){.bn-eve .bn-eve-l{display:none;}}" +
    /* ---- language switch (EN·RU): quiet instrument next to the EVE clock ---- */
    ".bn-lang{display:inline-flex;align-items:center;gap:4px;flex:none;white-space:nowrap;" +
    "font-family:var(--mono,ui-monospace,monospace);padding-left:12px;" +
    "border-left:1px solid var(--line,rgba(150,168,158,.16));}" +
    ".bn-lang button{background:transparent;border:0;padding:4px 3px;cursor:pointer;" +
    "font-family:inherit;font-size:10.5px;letter-spacing:.14em;color:var(--muted,#6f776f);" +
    "transition:color .15s;}" +
    ".bn-lang button:hover{color:var(--ore,#46ff5e);}" +
    ".bn-lang button.on{color:var(--ore,#46ff5e);font-weight:700;text-shadow:0 0 8px rgba(70,255,94,.35);}" +
    ".bn-lang .bn-lang-d{color:var(--muted,#6f776f);font-size:10px;}" +
    ".bn-panel button.bn-item{width:100%;text-align:left;background:transparent;border:0;cursor:pointer;}" +
    ".bn-panel button.bn-item.on{background:var(--ore,#46ff5e);color:#04140a;font-weight:700;}" +
    "@media(max-width:700px){.bn-lang{padding-left:8px;}}";
  (document.head || document.documentElement).appendChild(st);

  // ---- EVE time ticker: EVE runs on UTC, every op is called in it. Updates the
  // nav clock plus any page-provided [data-eve-time] mount (e.g. the home hero).
  // Writes only on change; tooltip carries the local-time translation.
  function evePad(n) { return (n < 10 ? "0" : "") + n; }
  function eveTick() {
    var els = document.querySelectorAll("[data-eve-time]");
    if (!els.length) return;
    var d = new Date();
    var hm = evePad(d.getUTCHours()) + ":" + evePad(d.getUTCMinutes());
    for (var k3 = 0; k3 < els.length; k3++) {
      var el = els[k3];
      var txt = el.getAttribute("data-eve-time") === "hms" ? hm + ":" + evePad(d.getUTCSeconds()) : hm;
      if (el.textContent !== txt) el.textContent = txt;
    }
    var chip = bar.querySelector(".bn-eve");
    if (chip) {
      var t = "EVE time is UTC. Your local time: " + evePad(d.getHours()) + ":" + evePad(d.getMinutes());
      if (chip.title !== t) chip.title = t;
    }
  }
  eveTick();
  setInterval(eveTick, 1000);
  document.addEventListener("visibilitychange", eveTick);

  var w = document.getElementById("navwho");
  function goPortal() { location.href = ORIGIN + BASE + "portal/"; }
  if (w) {
    w.onclick = goPortal;
    fetch(ORIGIN + BASE + "api/whoami", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        // recruiting tools appear here or not at all. Runs before anything else
        // in this handler so a later throw cannot leave a gated link revealed.
        applyGates(d);
        // account language default (set on the application, or by an explicit
        // toggle while logged in): RU members get the site in Russian by
        // default on any device; an explicit local pick always wins.
        if (d && d.loggedIn && (d.lang === "ru" || d.lang === "en")) {
          if (window.BONKLANG) window.BONKLANG.accountDefault(d.lang);
          else { try { localStorage.setItem("bonk.lang.acct", d.lang); } catch (e3) {} }
          paintLang();
        }
        if (d && d.loggedIn) {
          w.className = "navwho in";
          w.innerHTML = '<span class="dotln"></span><span class="lbl">logged in as&nbsp;</span><b class="nm"></b>';
          w.querySelector(".nm").textContent = d.ign || "goblin";
          // members get the real recruiting-tool names, in the bar AND the panel.
          // Allies (Friends of the Rock) do NOT: the recruiting tools are corp-only
          // and their unlock keys are server-refused, so the labels stay redacted.
          if (d.role !== "ally") {
            for (var rel in MEMBER_LABELS) {
              var lnks = bar.querySelectorAll('a[data-rel="' + rel + '"]');
              for (var k = 0; k < lnks.length; k++) lnks[k].textContent = MEMBER_LABELS[rel];
            }
          }
          // inbox badge: portal unread count in ore green; the whole chip already
          // opens /portal/, so the badge rides the same click.
          if (d.unread > 0) {
            var u = document.createElement("span");
            u.className = "unrd";
            u.title = "unread in your inbox";
            u.textContent = "· " + d.unread;
            w.appendChild(u);
          }
          w.title = "Logged in as " + (d.ign || "goblin") + ". Your activity is tracked to your account. Open your portal.";
        } else {
          w.className = "navwho";
          w.innerHTML = '<span class="dotln"></span><span>log in</span>';
          w.title = "Not logged in. Log in to the member portal so your career is tracked.";
          // the one quiet door for visitors: every tool page carries it, nobody shouts
          if (!document.getElementById("navjoin")) {
            var jn = document.createElement("a");
            jn.id = "navjoin";
            jn.className = "navjoin";
            jn.href = ORIGIN + BASE + "apply/";
            jn.textContent = "join BONK";
            jn.title = "Applications are open. The interview is painless. Mostly.";
            w.parentNode.insertBefore(jn, w.nextSibling);
          }
        }
      })
      .catch(function () { if (w) w.style.display = "none"; });
  }

  // ---- walkthrough loader: the cloud-generated tool pages do not include
  // /walkthrough.js themselves, so bring the coach-mark engine + styles to any
  // page that loads this nav. Runs at DOMContentLoaded so the guard can see a
  // page's own direct include (portal/fleet/market/decorations/tools) and skip.
  // Tours for tool pages come from the registry inside walkthrough.js. ----
  function loadWalkthrough() {
    if (window.BONKTour || document.querySelector('script[src*="walkthrough.js"]')) return;
    var wcss = document.createElement("style");
    wcss.textContent =
      ".wt-root{position:fixed;inset:0;z-index:9998}.wt-overlay{position:fixed;inset:0;background:transparent}" +
      ".wt-spot{position:fixed;border:2px solid var(--ore,#46ff5e);border-radius:5px;box-shadow:0 0 0 9999px rgba(7,8,9,.82),0 0 22px rgba(70,255,94,.35);pointer-events:none;transition:left .22s ease,top .22s ease,width .22s ease,height .22s ease}" +
      ".wt-card{position:fixed;z-index:10000;width:min(340px,calc(100vw - 28px));background:var(--steel,#14171a);border:1px solid var(--line,rgba(150,168,158,.16));border-left:3px solid var(--ore,#46ff5e);padding:16px 18px;box-shadow:0 18px 50px rgba(0,0,0,.5);font-family:var(--body,system-ui,sans-serif)}" +
      ".wt-title{font-family:var(--display,sans-serif);font-weight:700;text-transform:uppercase;letter-spacing:.03em;font-size:16px;color:var(--silver,#d9ddd7);margin-bottom:7px}" +
      ".wt-body{font-size:13.5px;line-height:1.6;color:var(--silver-dim,#9aa39c)}" +
      ".wt-foot{display:flex;align-items:center;justify-content:space-between;margin-top:15px;gap:10px}" +
      ".wt-count{font-family:var(--mono,monospace);font-size:11px;color:var(--muted,#6f776f);letter-spacing:.1em}" +
      ".wt-btns{display:flex;gap:7px}.wt-b{font-family:var(--mono,monospace);font-size:12px;padding:7px 12px;border:1px solid var(--line,rgba(150,168,158,.2));background:transparent;color:var(--silver-dim,#9aa39c);cursor:pointer}" +
      ".wt-b:hover{border-color:var(--ore,#46ff5e);color:var(--ore,#46ff5e)}.wt-next{background:var(--ore,#46ff5e);color:#04140a;border-color:var(--ore,#46ff5e);font-weight:700}" +
      ".wt-card.wt-sheet{left:0!important;right:0!important;bottom:0!important;top:auto!important;transform:none!important;width:100%;border-left:0;border-top:3px solid var(--ore,#46ff5e)}" +
      ".wt-help{position:fixed;right:16px;bottom:16px;z-index:9990;width:42px;height:42px;border-radius:50%;border:1px solid var(--ore,#46ff5e);background:var(--steel,#14171a);color:var(--ore,#46ff5e);font-family:var(--display,sans-serif);font-weight:700;font-size:20px;line-height:1;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.4)}" +
      ".wt-help:hover{background:var(--ore,#46ff5e);color:#04140a}@media(prefers-reduced-motion:reduce){.wt-spot{transition:none}}";
    (document.head || document.documentElement).appendChild(wcss);
    var wjs = document.createElement("script");
    wjs.src = ORIGIN + BASE + "walkthrough.js?v=3";
    (document.body || document.documentElement).appendChild(wjs);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", loadWalkthrough);
  else loadWalkthrough();
})();
