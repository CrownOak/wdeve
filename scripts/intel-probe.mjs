/* Run the shipped intel.js under a minimal DOM stub and surface the real exception
   with a line number. Guessing at a blank page twice is enough. */
import fs from 'fs';
import vm from 'vm';

const src = fs.readFileSync('C:/Users/sales/wdeve/intel.js', 'utf8');

function el(id) {
  const e = {
    id, innerHTML: '', textContent: '', value: '', style: {}, hidden: false,
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {}, removeEventListener() {}, appendChild() {}, focus() {}, select() {},
    setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
    querySelectorAll() { return []; }, querySelector() { return null; },
    closest() { return null; }, contains() { return false; },
    get childNodes() { return []; },
  };
  return e;
}

const doc = {
  getElementById: (id) => el(id),
  querySelector: () => el('q'),
  querySelectorAll: () => [],
  createElement: () => el('new'),
  addEventListener() {},
  body: el('body'), head: el('head'),
  visibilityState: 'visible',
};

const store = {};
const ctx = {
  window: {
    addEventListener() {}, location: { search: '?t=char&id=1237160250', pathname: '/briefing/' },
    matchMedia: () => ({ matches: false }),
  },
  document: doc,
  console,
  setTimeout, clearTimeout, setInterval: () => 0, clearInterval: () => 0,
  fetch: () => new Promise(() => {}),           // never resolves: we only want the sync body
  localStorage: {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
  },
  URLSearchParams,
  Promise, Date, Math, JSON, Object, Array, String, Number, isFinite, parseInt, parseFloat,
  encodeURIComponent, decodeURIComponent, RegExp, Set, Error, TypeError,
  history: { pushState() {}, replaceState() {} },
  location: { search: '?t=char&id=1237160250', pathname: '/briefing/', href: 'https://bonkeve.com/briefing/' },
  navigator: { clipboard: null },
};
ctx.window.document = doc;
ctx.globalThis = ctx;
vm.createContext(ctx);

try {
  new vm.Script(src, { filename: 'intel.js' }).runInContext(ctx);
  console.log('module evaluated ok; BONKINTEL =', typeof ctx.window.BONKINTEL);
} catch (e) {
  console.log('EVAL FAILED:', e.stack.split('\n').slice(0, 4).join('\n'));
  process.exit(1);
}

try {
  ctx.window.BONKINTEL.mount(el('intelroot'));
  console.log('MOUNT COMPLETED WITHOUT THROWING');
} catch (e) {
  console.log('\n*** MOUNT THREW ***');
  console.log(e.stack.split('\n').slice(0, 6).join('\n'));
}
