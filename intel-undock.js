/* BEFORE YOU UNDOCK — the intel console's one useful line, brought to where miners
   actually are.

   The people most likely to die are haulers and barge pilots, and they do not open a
   PvP console. They open the portal. So this is deliberately NOT the intel engine:
   no jump graph, no killboard, no spine. Two small calls, one sentence, and it says
   nothing at all when it has nothing to say.

   Mounts into #undockLine if that element exists. Fails silent by design: a rail
   block that errors is worse than a rail block that is absent. */
(function () {
  var ESI = "https://esi.evetech.net/latest";
  /* the corridor and both homes, the only systems where "ours" means anything */
  var OURS = {
    30000031: "Mohas", 30000035: "Nimambal", 30000114: "Ubtes", 30000117: "Khabi",
    30000943: "7Q-8Z2", 30000944: "SUR-F7", 30000945: "OK-6XN", 30000948: "U3K-4A",
    30002510: "Rens"
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function paint(html) {
    var el = document.getElementById("undockLine");
    if (el) el.innerHTML = html;
  }

  function run() {
    var el = document.getElementById("undockLine");
    if (!el) return;
    Promise.all([
      fetch("/api/esi/me/where", { credentials: "same-origin", cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch(ESI + "/universe/system_kills/?datasource=tranquility")
        .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    ]).then(function (res) {
      var me = res[0], kills = res[1];
      if (!kills) return;                    /* no feed, no claim. Say nothing. */
      var by = {};
      kills.forEach(function (k) { by[k.system_id] = (k.ship_kills || 0) + (k.pod_kills || 0); });

      /* what is happening on our own road, named not counted */
      var hot = [];
      for (var id in OURS) if (by[id]) hot.push({ n: OURS[id], k: by[id] });
      hot.sort(function (a, b) { return b.k - a.k; });

      /* where the member actually is, if they attached ESI and are somewhere */
      var here = null;
      if (me && me.ok && me.attached && me.chars && me.chars.length) {
        var c = me.chars.filter(function (x) { return x.system_id; })[0];
        if (c) here = { n: c.system_name, id: c.system_id, ship: c.ship_name, k: by[c.system_id] || 0 };
      }

      var tone = "calm", line;
      if (here && here.k > 0) {
        tone = "hot";
        line = "You are in <b>" + esc(here.n) + "</b> and <b>" + here.k + "</b> ship"
          + (here.k === 1 ? "" : "s") + " died here this hour."
          + (here.ship ? " You are in a " + esc(here.ship) + "." : "");
      } else if (hot.length) {
        tone = "warm";
        line = "<b>" + esc(hot[0].n) + "</b> is warm, " + hot[0].k + " dead this hour. "
          + (here ? "You are in " + esc(here.n) + ", which is quiet." : "The rest of the road is quiet.");
      } else if (here) {
        line = "You are in <b>" + esc(here.n) + "</b>. Nothing dying there, nothing dying on the road.";
      } else {
        line = "Nothing dying on our road right now.";
      }

      paint(
        '<div class="undock ' + tone + '">' +
        '<span class="uk">BEFORE YOU UNDOCK</span>' +
        '<div class="uv">' + line + '</div>' +
        '<div class="us">live kills this hour &middot; ' +
        '<a href="/gobsec/desk/?m=road">read the road</a>' +
        (here ? ' &middot; <a href="/briefing/?t=sys&id=' + here.id + '">this system</a>' : '') +
        '</div></div>'
      );
    }).catch(function () { /* a rail block that errors is worse than one that is absent */ });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
  setInterval(function () { if (document.visibilityState === "visible") run(); }, 300000);
})();
