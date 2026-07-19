#!/usr/bin/env node
/* BONK i18n string extractor (spec: Downloads/BONK-I18N-RU-SPEC.md §13).
   Harvests user-facing English strings from the hand-authored wdeve pages +
   shared chrome, emits i18n/manifest.en.json and a coverage diff vs i18n/ru.js.
   Public-served path on purpose; contains no secrets by design.
   Run from the wdeve root:  node i18n/extract.mjs            */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const FILES = [
  "index.html", "tools/index.html", "market/index.html", "decorations/index.html",
  "apply/index.html", "portal/index.html", "portal/claim/index.html",
  "portal/roster/index.html", "portal/leaderboard/index.html",
  // portal/admin/ is CUT from v1 (officer-only surface, spec §4) — excluded so
  // coverage numbers stay honest about the member-facing goal.
  "fleet/index.html", "nav.js", "walkthrough.js",
  // generator-page shells: harvested for gate/chrome strings only (build artifacts,
  // never edited here — the dictionary covers them at runtime via the overlay).
  "refine/index.html", "reprocess/index.html", "arbitrage/index.html",
  "lowsec/index.html", "blueprints/index.html", "kills/index.html", "cartel/index.html",
];

// ---- helpers ---------------------------------------------------------------
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  middot: "·", bull: "•", rarr: "→", larr: "←", times: "×",
  hellip: "…", mdash: "—", ndash: "–", deg: "°", sup3: "³" };
function decode(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&([a-z0-9]+);/gi, (m, n) => ENT[n.toLowerCase()] ?? m);
}
const norm = (s) => s.replace(/\s+/g, " ").trim();

function looksLikeUi(s) {
  if (!/[A-Za-z]{2}/.test(s)) return false;          // needs real words
  if (s.length < 2 || s.length > 2000) return false;
  if (/^https?:\/\//.test(s) || s.startsWith("//")) return false;
  if (/^[\w./#?&=:%+,-]+$/.test(s) && !/\s/.test(s) && /[./#_]/.test(s)) return false; // path/id-ish
  if (/[{;]\s*[\w-]+\s*:/.test(s) && /;/.test(s)) return false;   // css-ish
  if (/^[.#\[][\w.\-\[\]="']+$/.test(s)) return false;            // selector-ish
  if (/^data:/.test(s) || /^[A-Za-z0-9+/=]{60,}$/.test(s)) return false; // data uri / b64
  return true;
}

// text segments from an HTML fragment (tags stripped); flags ${...} interpolation
function htmlText(fragment) {
  const out = [];
  const noComments = fragment.replace(/<!--[\s\S]*?-->/g, " ");
  for (const seg of noComments.split(/<[^>]*>/)) {
    const t = norm(decode(seg));
    if (!t || !looksLikeUi(t)) continue;
    out.push({ s: t, interp: seg.includes("${") });
  }
  return out;
}

const ATTR_RE = /(?:placeholder|title|aria-label|data-tip|alt|value)\s*=\s*"([^"]{2,400})"/g;
function attrText(html) {
  const out = [];
  for (const m of html.matchAll(ATTR_RE)) {
    const t = norm(decode(m[1]));
    if (looksLikeUi(t)) out.push({ s: t, interp: m[1].includes("${") });
  }
  return out;
}

const LIT_RE = /(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
function jsText(js) {
  const out = [];
  for (const m of js.matchAll(LIT_RE)) {
    let lit = m[2];
    if (m[1] !== "`") lit = lit.replace(/\\(["'])/g, "$1");
    if (!/[A-Za-z]{2}/.test(lit)) continue;
    if (/<[a-z!/]/i.test(lit)) { out.push(...htmlText(lit), ...attrText(lit)); continue; }
    const t = norm(decode(lit));
    if (!looksLikeUi(t)) continue;
    // drop obvious code strings the fragment heuristics missed
    if (/^[a-z][a-zA-Z0-9]*$/.test(t) && t.length < 12) continue;         // bare identifier
    if (/^[a-z-]+$/.test(t) && !t.includes(" ") && t.length < 18) continue; // kebab token
    out.push({ s: t, interp: lit.includes("${") });
  }
  return out;
}

// ---- walk ------------------------------------------------------------------
const seen = new Map(); // s -> {kind, files:Set, interp}
function add(file, kind, items) {
  for (const it of items) {
    const cur = seen.get(it.s) || { kind, files: new Set(), interp: false };
    cur.files.add(file);
    cur.interp = cur.interp || it.interp;
    seen.set(it.s, cur);
  }
}

for (const rel of FILES) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) { console.error("skip (missing): " + rel); continue; }
  let src = readFileSync(p, "utf8");
  if (rel.endsWith(".js")) { add(rel, "js", jsText(src)); continue; }
  // pull scripts out, keep styles out
  const scripts = [];
  src = src.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (_, body) => { scripts.push(body); return " "; });
  src = src.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ");
  add(rel, "html", htmlText(src));
  add(rel, "attr", attrText(src));
  for (const s of scripts) add(rel, "js", jsText(s));
}

// ---- coverage vs ru.js -----------------------------------------------------
let ru = {};
const ruPath = join(ROOT, "i18n", "ru.js");
if (existsSync(ruPath)) {
  const g = { window: {} };
  new Function("window", readFileSync(ruPath, "utf8"))(g.window);
  ru = g.window.BONK_RU || {};
}
const ruKeys = new Set(Object.keys(ru).filter((k) => !k.startsWith("@")));
for (const sub of Object.values(ru["@scoped"] || {})) for (const k of Object.keys(sub)) ruKeys.add(k);

const all = [...seen.entries()].map(([s, v]) => ({
  s, kind: v.kind, interp: v.interp || undefined, files: [...v.files],
  ru: ruKeys.has(s) || undefined,
}));
const missing = all.filter((e) => !e.ru && !e.interp);
const interp = all.filter((e) => e.interp);
const orphans = [...ruKeys].filter((k) => !seen.has(k));

writeFileSync(join(ROOT, "i18n", "manifest.en.json"),
  JSON.stringify({ generated: "run of i18n/extract.mjs", total: all.length,
    translated: all.length - missing.length - interp.length,
    missing: missing.length, interpolated: interp.length, orphans: orphans.length,
    strings: all }, null, 1));

console.log(`strings: ${all.length}  translated: ${all.length - missing.length - interp.length}` +
  `  missing: ${missing.length}  interp(needs t() or stays EN): ${interp.length}  orphan ru keys: ${orphans.length}`);
for (const e of missing.slice(0, 40)) console.log("  MISS  " + e.s.slice(0, 100));
