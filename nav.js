/* Shared top nav for the Wealthy Dropouts tool pages + hub.
   Injected on load; styled by common.css (.topnav). Edit once, all pages update. */
(function () {
  var ORIGIN = "https://crownoak.github.io";
  var BASE = "/wdeve/";

  // Favicon: project pages must set it explicitly (the browser's auto /favicon.ico
  // request hits the domain root, not /wdeve/). Inject once if not already present.
  if (!document.querySelector("link[rel='icon']")) {
    var fav = document.createElement("link");
    fav.rel = "icon"; fav.type = "image/png"; fav.href = ORIGIN + BASE + "favicon.png";
    (document.head || document.documentElement).appendChild(fav);
  }
  var ITEMS = [
    ["Home", BASE],
    ["Lowsec", BASE + "lowsec/"],
    ["Kills", BASE + "kills/"],
    ["Blueprints", BASE + "blueprints/"],
    ["Refine", BASE + "refine/"],
    ["Reprocess", BASE + "reprocess/"],
    ["Decorations", BASE + "decorations/"],
    ["CLASSIFIED", BASE + "bonk-prospects/"],
    ["REDACTED", BASE + "alliance/"]
  ];
  var path = location.pathname.replace(/index\.html$/, "");
  if (path.charAt(path.length - 1) !== "/") path += "/";
  function current(p) { return p === BASE ? (path === BASE) : (path.indexOf(p) === 0); }

  var bar = document.createElement("div");
  bar.className = "topnav";
  var html = '<a class="brand" href="' + ORIGIN + BASE + '">'
           + '<span class="tick">BONK</span><span class="brandtext">WEALTHY DROPOUTS</span></a><nav>';
  for (var i = 0; i < ITEMS.length; i++) {
    html += '<a href="' + ORIGIN + ITEMS[i][1] + '"'
          + (current(ITEMS[i][1]) ? ' class="cur"' : '') + '>' + ITEMS[i][0] + '</a>';
  }
  html += '</nav>';
  bar.innerHTML = html;
  if (document.body) document.body.insertBefore(bar, document.body.firstChild);
})();
