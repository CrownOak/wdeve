/* THE SUGGESTION BOX. Small block, portal rail.

   Genuinely anonymous: the suggestions table has NO author column. Not hidden,
   not admin-only, absent. Nobody can look up who wrote one because the database
   was never told. The copy below says that because it is true, and it would be
   worth nothing if it were not.

   Anonymous is the default. Signing is the opt in. */
(function () {
  var HOST = "suggestBox";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function ago(iso) {
    var s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (!isFinite(s) || s < 0) s = 0;
    if (s < 3600) return Math.max(1, Math.round(s / 60)) + "m";
    if (s < 172800) return Math.round(s / 3600) + "h";
    return Math.round(s / 86400) + "d";
  }

  function shell(inner) {
    var el = document.getElementById(HOST);
    if (el) el.innerHTML = '<div class="sugg">' +
      '<div class="sgk">SUGGESTION BOX</div>' + inner + '</div>';
  }

  function form(note) {
    return '<textarea id="sgText" rows="2" maxlength="1200" placeholder="What should we do differently?"></textarea>' +
      '<label class="sgsign"><input type="checkbox" id="sgSign"> put my name on it</label>' +
      '<button class="sgbtn" id="sgGo">Send</button>' +
      '<div class="sgnote">' + (note || 'Genuinely anonymous. We do not store who sent it, so say the real thing.') + '</div>' +
      '<div id="sgList"></div>';
  }

  function paintList(rows) {
    var el = document.getElementById("sgList");
    if (!el) return;
    if (!rows || !rows.length) { el.innerHTML = '<div class="sgempty">Nothing yet. Be first.</div>'; return; }
    el.innerHTML = rows.slice(0, 5).map(function (r) {
      return '<div class="sgi">' +
        '<div class="sgb">' + esc(r.body) + '</div>' +
        '<div class="sgm">' + (r.who ? esc(r.who) : 'anonymous') + ' &middot; ' + ago(r.at) +
        (r.status && r.status !== "open" ? ' &middot; <b>' + esc(r.status) + '</b>' : '') + '</div>' +
        (r.reply ? '<div class="sgr">' + esc(r.reply) + '</div>' : '') +
        '</div>';
    }).join("");
  }

  function load() {
    fetch("/api/suggestions", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d && d.ok) paintList(d.suggestions); })
      .catch(function () { });
  }

  function wire() {
    var go = document.getElementById("sgGo");
    if (!go) return;
    go.addEventListener("click", function () {
      var t = document.getElementById("sgText"), sign = document.getElementById("sgSign");
      var v = (t.value || "").trim();
      if (v.length < 4) { t.focus(); return; }
      go.disabled = true; go.textContent = "sending";
      fetch("/api/suggest", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: v, signed: sign && sign.checked ? 1 : 0 })
      }).then(function (r) { return r.json().catch(function () { return null; }); })
        .then(function (d) {
          go.disabled = false; go.textContent = "Send";
          if (d && d.ok) { t.value = ""; if (sign) sign.checked = false; load(); }
          else {
            var n = document.querySelector("#" + HOST + " .sgnote");
            if (n) n.textContent = (d && d.error) ? d.error : "did not send, try again";
          }
        }).catch(function () { go.disabled = false; go.textContent = "Send"; });
    });
  }

  function run() {
    if (!document.getElementById(HOST)) return;
    fetch("/api/whoami", { credentials: "same-origin", cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.loggedIn) return;      /* logged out members never see the box */
        shell(form());
        wire();
        load();
      }).catch(function () { });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
