/* BONK i18n runtime — spec Downloads/BONK-I18N-RU-SPEC.md.
   English is the DOM's canonical text and the fallback by construction: this
   engine only ever swaps a text node or attribute when the active dictionary
   has an exact entry for it, so a missing key means English stays, never a
   blank, never a raw key. The default (en) path is inert: no fetch, no
   observer, no style injection, nothing.
   Language precedence: explicit choice (bonk.lang) > account default cached
   from whoami (bonk.lang.acct) > en. The ?lang=ru|en query param acts as an
   explicit choice (handy for testing and shareable RU links). */
(function () {
  "use strict";
  if (window.BONKLANG) return; // one engine per page (direct include + nav loader)

  var LS_EXPLICIT = "bonk.lang", LS_ACCT = "bonk.lang.acct";
  var RU_SRC = "/i18n/ru.js?v=6";
  var RU_FONTS = "https://fonts.googleapis.com/css2?family=Russo+One&family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;700&display=swap";
  var ATTRS = ["placeholder", "title", "aria-label", "data-tip", "alt", "value"];

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function valid(v) { return v === "ru" || v === "en" ? v : null; }

  // ?lang= param counts as an explicit pick and persists
  var qp = null;
  try { qp = valid(new URLSearchParams(location.search).get("lang")); } catch (e) {}
  if (qp) lsSet(LS_EXPLICIT, qp);

  var lang = valid(lsGet(LS_EXPLICIT)) || valid(lsGet(LS_ACCT)) || "en";
  var dict = null, scoped = null, observer = null;
  var missSet = {};
  var queue = [], rafPending = false;
  var plural = null;

  /* ---------------- dictionary ---------------- */
  function dictReady() {
    var raw = window.BONK_RU || null;
    if (!raw) return false;
    if (!dict) {
      dict = {}; scoped = raw["@scoped"] || null;
      for (var k in raw) if (k.charAt(0) !== "@") dict[k] = raw[k];
    }
    return true;
  }
  function norm(s) { return s.replace(/\s+/g, " ").trim(); }
  function lookup(key, el) {
    if (!dict) return null;
    if (scoped && el && el.closest) {
      for (var sel in scoped) {
        try { if (el.closest(sel) && scoped[sel][key] !== undefined) return scoped[sel][key]; } catch (e) {}
      }
    }
    var v = dict[key];
    return v === undefined ? null : v;
  }
  function pick(v, n) {
    if (typeof v === "string") return v;
    if (!v) return null;
    try {
      plural = plural || new Intl.PluralRules("ru");
      var c = plural.select(Math.abs(Number(n) || 0));
      if (v[c]) return v[c];
    } catch (e) {}
    return v.many || v.few || v.one || null;
  }
  function t(key, params) {
    var v = (lang === "ru" && dictReady()) ? lookup(key, null) : null;
    v = pick(v, params && params.n);
    if (v == null) v = key;
    return String(v).replace(/\{(\w+)\}/g, function (m, p) {
      return params && params[p] !== undefined ? String(params[p]) : m;
    });
  }

  /* ---------------- DOM translation ---------------- */
  function skipEl(el) {
    if (!el || el.nodeType !== 1) return true;
    var tag = el.nodeName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "TEXTAREA") return true;
    if (el.closest) { try { if (el.closest("[data-i18n-skip]")) return true; } catch (e) {} }
    return false;
  }
  function xNode(n) { // translate one text node (exact-match, whitespace preserved)
    var raw = n.nodeValue;
    if (!raw || !/\S/.test(raw)) return;
    if (n.__bonkSrc === raw) return;            // our own write, still current
    if (skipEl(n.parentNode)) return;
    var key = norm(raw);
    var ru = pick(lookup(key, n.parentNode), null);
    if (typeof ru === "string") {
      if (n.__bonkEn === undefined || n.__bonkSrc !== raw) n.__bonkEn = raw;
      var out = raw.match(/^\s*/)[0] + ru + raw.match(/\s*$/)[0];
      n.__bonkSrc = out;
      n.nodeValue = out;
    } else if (/[A-Za-z]{2}/.test(key)) missSet[key] = 1;
  }
  function xAttrs(el) {
    if (skipEl(el)) return;
    var store = el.__bonkA;
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i];
      if (a === "value" && !(el.nodeName === "INPUT" && (el.type === "button" || el.type === "submit"))) continue;
      if (a === "alt" && el.nodeName !== "IMG") continue;
      var raw = el.getAttribute && el.getAttribute(a);
      if (!raw || !/\S/.test(raw)) continue;
      if (store && store["cur_" + a] === raw) continue;  // our write
      var ru = pick(lookup(norm(raw), el), null);
      if (typeof ru === "string") {
        store = store || (el.__bonkA = {});
        if (store["en_" + a] === undefined || store["cur_" + a] !== raw) store["en_" + a] = raw;
        store["cur_" + a] = ru;
        el.setAttribute(a, ru);
      }
    }
  }
  var ATTR_SEL = "[placeholder],[title],[aria-label],[data-tip],input[type=button],input[type=submit],img[alt]";
  function xTree(root) {
    if (!root) return;
    if (root.nodeType === 3) { xNode(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) {
      if (skipEl(root)) return;
      xAttrs(root);
    }
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n; while ((n = w.nextNode())) xNode(n);
    if (root.querySelectorAll) {
      var els = root.querySelectorAll(ATTR_SEL);
      for (var i = 0; i < els.length; i++) xAttrs(els[i]);
    }
  }
  function xTitle() {
    var cur = document.title;
    if (!cur) return;
    if (xTitle.__cur === cur) return;
    var ru = pick(lookup(norm(cur), null), null);
    if (typeof ru === "string") {
      if (xTitle.__en === undefined) xTitle.__en = cur;
      xTitle.__cur = ru;
      document.title = ru;
    }
  }
  function applyAll() {
    if (lang !== "ru" || !dictReady()) return;
    xTree(document.body || document.documentElement);
    xTitle();
  }

  /* ---------------- restore (live toggle back to EN) ---------------- */
  function restoreAll() {
    var w = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = w.nextNode())) {
      if (n.__bonkEn !== undefined && n.nodeValue === n.__bonkSrc) n.nodeValue = n.__bonkEn;
      n.__bonkEn = undefined; n.__bonkSrc = undefined;
    }
    var els = document.querySelectorAll(ATTR_SEL);
    for (var i = 0; i < els.length; i++) {
      var st = els[i].__bonkA;
      if (!st) continue;
      for (var j = 0; j < ATTRS.length; j++) {
        var a = ATTRS[j];
        if (st["en_" + a] !== undefined && els[i].getAttribute(a) === st["cur_" + a])
          els[i].setAttribute(a, st["en_" + a]);
      }
      els[i].__bonkA = undefined;
    }
    if (xTitle.__en !== undefined && document.title === xTitle.__cur) document.title = xTitle.__en;
    xTitle.__en = undefined; xTitle.__cur = undefined;
  }

  /* ---------------- observer (dynamic renders, decrypt injections) ---------------- */
  function flushQueue() {
    rafPending = false;
    if (lang !== "ru" || !dictReady()) { queue.length = 0; return; }
    var batch = queue.splice(0, queue.length);
    for (var i = 0; i < batch.length; i++) xTree(batch[i]);
    xTitle();
  }
  function ensureObserver() {
    if (observer || !document.body) return;
    observer = new MutationObserver(function (muts) {
      if (lang !== "ru") return;
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === "childList") {
          for (var j = 0; j < m.addedNodes.length; j++) queue.push(m.addedNodes[j]);
        } else if (m.type === "attributes") queue.push(m.target);
      }
      if (queue.length && !rafPending) {
        rafPending = true;
        (window.requestAnimationFrame || setTimeout)(flushQueue, 16);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ATTRS });
  }

  /* ---------------- RU boot: fonts, guard, dictionary ---------------- */
  var booted = false;
  function injectRuAssets() {
    var de = document.documentElement;
    de.lang = "ru"; de.classList.add("lang-ru");
    if (!document.getElementById("bonk-ru-css")) {
      var st = document.createElement("style");
      st.id = "bonk-ru-css";
      st.textContent =
        /* Cyrillic-capable stand-ins for the three Latin-only brand fonts; the
           var() seam means every page + component inherits in one stroke. */
        'html[lang="ru"]{--display:"Russo One","Chakra Petch",system-ui,sans-serif;' +
        '--mono:"JetBrains Mono","Share Tech Mono",ui-monospace,monospace;' +
        '--body:"Inter","Barlow",system-ui,sans-serif;}' +
        /* first-paint guard: only while booting INTO ru, failsafed below */
        "html.lang-ru.bonk-i18n-boot body{visibility:hidden}";
      (document.head || de).appendChild(st);
    }
    if (!document.getElementById("bonk-ru-fonts")) {
      var lk = document.createElement("link");
      lk.id = "bonk-ru-fonts"; lk.rel = "stylesheet"; lk.href = RU_FONTS;
      (document.head || de).appendChild(lk);
    }
  }
  function unguard() { document.documentElement.classList.remove("bonk-i18n-boot"); }
  function loadDict(onload) {
    if (dictReady()) { onload(); return; }
    if (loadDict.__busy) return;
    loadDict.__busy = true;
    var s = document.createElement("script");
    s.src = RU_SRC; s.async = true;
    s.onload = function () { loadDict.__busy = false; dictReady(); onload(); };
    s.onerror = function () { loadDict.__busy = false; unguard(); try { console.warn("[i18n] ru dictionary failed to load; staying in English"); } catch (e) {} };
    (document.head || document.documentElement).appendChild(s);
  }
  function activateRu(initial) {
    injectRuAssets();
    if (initial && document.readyState === "loading") {
      document.documentElement.classList.add("bonk-i18n-boot");
      setTimeout(unguard, 1200); // never a permanently blank page
    }
    loadDict(function () {
      var go = function () { applyAll(); unguard(); ensureObserver(); };
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
      else go();
    });
  }

  /* ---------------- public API ---------------- */
  function setLang(next, implicit) {
    next = valid(next); if (!next || next === lang) return;
    lang = next;
    if (!implicit) {
      lsSet(LS_EXPLICIT, next);
      // logged-in goblins: the explicit pick becomes the account default too
      try {
        fetch("/api/lang", { method: "POST", credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang: next }) }).catch(function () {});
      } catch (e) {}
    }
    var de = document.documentElement;
    if (next === "ru") { activateRu(false); }
    else { de.lang = "en"; de.classList.remove("lang-ru"); restoreAll(); }
    try { document.dispatchEvent(new CustomEvent("bonk:lang", { detail: { lang: lang } })); } catch (e) {}
  }
  // nav.js calls this once whoami answers: server-side member default (Kyle:
  // picked RU on the application -> the portal speaks RU to them by default).
  // An explicit local pick always wins over the account default.
  function accountDefault(v) {
    v = valid(v); if (!v) return;
    lsSet(LS_ACCT, v);
    if (!valid(lsGet(LS_EXPLICIT)) && v !== lang) setLang(v, true);
  }

  window.BONKLANG = {
    get lang() { return lang; },
    t: t,
    set: setLang,
    accountDefault: accountDefault,
    apply: function (root) { if (lang === "ru" && dictReady()) { xTree(root || document.body); xTitle(); } },
    misses: function () { return Object.keys(missSet); }
  };

  if (lang === "ru") { booted = true; activateRu(true); }
})();
