#!/usr/bin/env python3
"""
Landing-page price feed. Pulls real Jita sell prices (compressed blocks) for the most
popular minable of each type (highsec / lowsec / nullsec ore, ice, moon, gas), computes
the 90% buyback, and rewrites the scrolling ticker + the buyback board in index.html.
Pure stdlib. Run hourly by .github/workflows/prices.yml; commits index.html if it changed.
"""
import json, re, sys, time, os
import urllib.request

ESI = "https://esi.evetech.net/latest"
MARKET = "https://market.fuzzwork.co.uk/aggregates/"
JITA = 10000002
BUYBACK = 0.90
UA = "BONK-PriceIndex/1.0 (Crown & Oak Capital; salesmaxxllc@gmail.com)"
INDEX = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "index.html")

# (label, type, slug, [candidate item names; first that resolves wins]).
# Prices are for the COMPRESSED block (what members turn in), like the original board.
ITEMS = [
    ("Veldspar",      "Highsec ore", "veldspar",     ["Compressed Veldspar", "Veldspar"]),
    ("Hemorphite",    "Lowsec ore",  "hemorphite",   ["Compressed Hemorphite", "Hemorphite"]),
    ("Arkonor",       "Nullsec ore", "arkonor",      ["Compressed Arkonor", "Arkonor"]),
    ("Blue Ice",      "Ice",         "blueice",      ["Compressed Blue Ice", "Blue Ice"]),
    ("Loparite",      "Moon ore",    "loparite",     ["Compressed Loparite", "Loparite"]),
    ("Fullerite-C50", "Gas",         "fulleritec50", ["Compressed Fullerite-C50", "Fullerite-C50"]),
]


def _req(url, data=None):
    h = {"User-Agent": UA, "Accept": "application/json"}
    body = None
    if data is not None:
        body = json.dumps(data).encode(); h["Content-Type"] = "application/json"
    return urllib.request.Request(url, data=body, headers=h)


def fetch_json(url, data=None, timeout=60, retries=3):
    last = None
    for a in range(retries):
        try:
            with urllib.request.urlopen(_req(url, data), timeout=timeout) as r:
                return json.loads(r.read().decode("utf-8", "replace"))
        except Exception as e:
            last = e; time.sleep(2 * (a + 1))
    raise last


def resolve_ids(names):
    """names -> {name: typeID} via ESI /universe/ids (inventory_types)."""
    out = {}
    res = fetch_json(f"{ESI}/universe/ids/?datasource=tranquility", data=names)
    for t in (res.get("inventory_types") or []):
        out[t["name"]] = t["id"]
    return out


def jita_sell(ids):
    out = {}
    data = fetch_json(f"{MARKET}?region={JITA}&types=" + ",".join(map(str, ids)))
    if isinstance(data, dict):
        for tid, info in data.items():
            try:
                out[int(tid)] = float((info.get("sell") or {}).get("min") or 0)
            except (ValueError, TypeError):
                pass
    return out


def build_prices():
    all_names = [n for _, _, _, cands in ITEMS for n in cands]
    name_id = resolve_ids(all_names)
    rows = []
    ids = []
    for label, typ, slug, cands in ITEMS:
        name = next((c for c in cands if c in name_id), cands[0])
        tid = name_id.get(name)
        rows.append({"label": label, "type": typ, "slug": slug, "tid": tid, "name": name})
        if tid:
            ids.append(tid)
    prices = jita_sell(ids) if ids else {}
    for r in rows:
        sell = prices.get(r["tid"], 0.0) if r["tid"] else 0.0
        r["sell"] = round(sell)
        r["buy"] = round(sell * BUYBACK)
    return rows


def _n(v):
    return f"{int(v):,}" if v else "n/a"


def render(rows, html):
    # ticker group (rebuilt; both groups are identical for the seamless scroll)
    items = "".join(
        f'\n      <span class="it">{r["label"]} <span class="up">&#9650;</span> '
        f'<b data-tk="{r["slug"]}">{_n(r["sell"])}</b></span>'
        for r in rows)
    grp = ('<div class="grp">'
           '\n      <span class="it"><span class="lbl">JITA BUYBACK</span></span>'
           f'{items}'
           '\n      <span class="it"><span class="lbl">LAST HAUL</span> <b>748,000,000 ISK</b></span>'
           '\n      <span class="it">the ore must flow &nbsp;&middot;&nbsp; the goblins must eat</span>'
           '\n    </div>')
    html, n_grp = re.subn(r'<div class="grp">.*?</div>', lambda m: grp, html, flags=re.S)
    assert n_grp == 2, f"expected 2 ticker groups, replaced {n_grp}"

    # buyback board
    trs = "".join(
        f'\n          <tr><td class="ice">{r["label"]}</td><td class="ty">{r["type"]}</td>'
        f'<td class="jita" data-jita="{r["slug"]}">{_n(r["sell"])}</td>'
        f'<td class="buy" data-buy="{r["slug"]}">{_n(r["buy"])}</td></tr>'
        for r in rows)
    table = ('<table class="prices">'
             '\n        <thead><tr><th>Item</th><th>Type</th>'
             '<th style="text-align:right">Jita Sell</th>'
             '<th style="text-align:right">Our Buyback (90%)</th></tr></thead>'
             f'\n        <tbody>{trs}\n        </tbody>'
             '\n      </table>')
    html, n_t = re.subn(r'<table class="prices">.*?</table>', lambda m: table, html, flags=re.S)
    assert n_t == 1, f"expected 1 prices table, replaced {n_t}"

    # keep the client-side live updater's item map in sync with the board
    pairs = ", ".join(f'{r["slug"]}:"{r["name"]}"' for r in rows)
    html, n_ice = re.subn(r'var ICE\s*=\s*\{.*?\};',
                          lambda m: "var ICE = { " + pairs + " };", html, flags=re.S)
    assert n_ice == 1, f"expected 1 ICE map, replaced {n_ice}"

    # heading + status line
    html = html.replace("<h2>The ice board</h2>", "<h2>The buyback board</h2>")
    html, _ = re.subn(r'(<span id="price-status">).*?(</span>)',
                      lambda m: m.group(1) + "live Jita 4-4 &middot; delivery RENS &middot; 90%" + m.group(2),
                      html, flags=re.S)
    return html


def main():
    rows = build_prices()
    for r in rows:
        print(f"  {r['label']:14} ({r['type']:12}) sell={_n(r['sell']):>14}  buy={_n(r['buy']):>14}")
    with open(INDEX, encoding="utf-8") as f:
        html = f.read()
    new = render(rows, html)
    if new == html:
        print("  index.html unchanged.")
        return 0
    with open(INDEX, "w", encoding="utf-8") as f:
        f.write(new)
    print("  index.html updated.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
