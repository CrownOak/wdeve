/* Shared top nav for the Wealthy Dropouts tool pages + hub.
   Injected on load; styled by common.css (.topnav). Edit once, all pages update. */
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
  var ITEMS = [
    ["Home", BASE],
    ["Apply", BASE + "apply/"],
    ["Portal", BASE + "portal/"],
    ["Lowsec", BASE + "lowsec/"],
    ["Kills", BASE + "kills/"],
    ["Blueprints", BASE + "blueprints/"],
    ["Refine", BASE + "refine/"],
    ["Fleet", BASE + "fleet/"],
    ["Reprocess", BASE + "reprocess/"],
    ["Arbitrage", BASE + "arbitrage/"],
    ["Decorations", BASE + "decorations/"],
    ["CLASSIFIED", BASE + "bonk-prospects/"],
    ["REDACTED", BASE + "alliance/"]
  ];
  // Members see the recruiting tools by name; the public sees the redacted labels.
  // Set once whoami resolves (below); default stays CLASSIFIED/REDACTED for the world.
  var MEMBER_LABELS = { "bonk-prospects/": "Recruiting", "alliance/": "Alliance" };
  var path = location.pathname.replace(/index\.html$/, "");
  if (path.charAt(path.length - 1) !== "/") path += "/";
  function current(p) { return p === BASE ? (path === BASE) : (path.indexOf(p) === 0); }

  var bar = document.createElement("div");
  bar.className = "topnav";
  var html = '<a class="brand" href="' + ORIGIN + BASE + '">'
           + '<span class="tick">BONK</span><span class="brandtext">WEALTHY DROPOUTS</span></a>'
           + '<span class="navwho" id="navwho"></span><nav>';
  for (var i = 0; i < ITEMS.length; i++) {
    var hrefRel = ITEMS[i][1].slice(BASE.length); // e.g. "bonk-prospects/"
    html += '<a href="' + ORIGIN + ITEMS[i][1] + '" data-rel="' + hrefRel + '"'
          + (current(ITEMS[i][1]) ? ' class="cur"' : '') + '>' + ITEMS[i][0] + '</a>';
  }
  html += '</nav>';
  bar.innerHTML = html;
  if (document.body) document.body.insertBefore(bar, document.body.firstChild);

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
    "@media(max-width:620px){.navwho .lbl{display:none;}}";
  (document.head || document.documentElement).appendChild(st);

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
          // members get the real recruiting-tool names in the nav
          for (var rel in MEMBER_LABELS) {
            var lnk = bar.querySelector('nav a[data-rel="' + rel + '"]');
            if (lnk) lnk.textContent = MEMBER_LABELS[rel];
          }
          // inbox badge: portal unread count in ore green; the whole chip already
          // opens /portal/, so the badge rides the same click.
          if (d.unread > 0) {
            var u = document.createElement("span");
            u.className = "unrd";
            u.title = "unread in your inbox";
            u.textContent = "\u00B7 " + d.unread;
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
    wjs.src = ORIGIN + BASE + "walkthrough.js?v=2";
    (document.body || document.documentElement).appendChild(wjs);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", loadWalkthrough);
  else loadWalkthrough();
})();
