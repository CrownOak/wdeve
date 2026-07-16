/* Shared top nav for the Wealthy Dropouts tool pages + hub.
   Injected on load; styled by common.css (.topnav) plus the style block below.
   THE TOOLBELT (2026-07-12): four pinned daily drivers stay inline; every
   destination lives in the three-line TOOLS menu, grouped. Edit once, all
   pages update. */
(function () {
  var ORIGIN = "";        // relative to the current domain (bonkeve.com); no cross-domain redirect hop
  var BASE = "/";         // the site lives at the domain root now, not under /wdeve/

  // Favicon: project pages must set it explicitly (the browser's auto /favicon.ico
  // request hits the domain root, not /wdeve/). Inject once if not already present.
  if (!document.querySelector("link[rel='icon']")) {
    var fav = document.createElement("link");
    fav.rel = "icon"; fav.type = "image/png"; fav.href = ORIGIN + BASE + "favicon.png";
    (document.head || document.documentElement).appendChild(fav);
  }

  // [label, href, group, pinned] — pinned items also appear in the panel so the
  // mobile menu (which hides the inline row) always reaches all destinations.
  var ITEMS = [
    ["Home",        BASE,                     "HOME",   true ],
    ["Apply",       BASE + "apply/",          "HOME",   false],
    ["Portal",      BASE + "portal/",         "MEMBER", true ],
    ["Fleet",       BASE + "fleet/",          "MEMBER", true ],
    ["Decorations", BASE + "decorations/",    "MEMBER", false],
    ["Radar",       BASE + "lowsec/",         "INTEL",  false],
    ["Kills",       BASE + "kills/",          "INTEL",  false],
    ["CLASSIFIED",  BASE + "bonk-prospects/", "INTEL",  false],
    ["REDACTED",    BASE + "alliance/",       "INTEL",  false],
    ["Arbitrage",   BASE + "arbitrage/",      "MARKET", false],
    ["Market",      BASE + "market/",         "MARKET", false],
    ["Blueprints",  BASE + "blueprints/",     "MARKET", false],
    ["Ore Calc",    BASE + "refine/",         "MARKET", false],
    ["Reprocess",   BASE + "reprocess/",      "MARKET", false],
    ["Workbench",   BASE + "tools/",          "MARKET", false]
  ];
  var GROUPS = ["HOME", "MEMBER", "INTEL", "MARKET"];
  // Members see the recruiting tools by name; the public sees the redacted labels.
  // Set once whoami resolves (below); default stays CLASSIFIED/REDACTED for the world.
  var MEMBER_LABELS = { "bonk-prospects/": "Recruiting", "alliance/": "Alliance" };

  var path = location.pathname.replace(/index\.html$/, "");
  if (path.charAt(path.length - 1) !== "/") path += "/";
  function current(p) { return p === BASE ? (path === BASE) : (path.indexOf(p) === 0); }
  function linkHtml(it, cls) {
    var rel = it[1].slice(BASE.length); // e.g. "bonk-prospects/"
    var klass = (cls + (current(it[1]) ? " cur" : "")).replace(/^ /, "");
    return '<a' + (klass ? ' class="' + klass + '"' : "")
         + ' href="' + ORIGIN + it[1] + '" data-rel="' + rel + '">' + it[0] + '</a>';
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
  html += '</div>';
  bar.innerHTML = html;
  if (document.body) document.body.insertBefore(bar, document.body.firstChild);

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
    "@media(prefers-reduced-motion:reduce){.bn-live,.bn-burger.bn-hot .bn-lines span{animation:none;}}" +
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
    "@media(max-width:390px){.bn-eve .bn-eve-l{display:none;}}";
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
