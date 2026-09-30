"""Import an existing design system / brand into tokens.json (best-effort, then a human reviews it).

Usage:
  python scripts/design/importar_tokens.py --url https://example.com  [--out brand/design-system/tokens.json]
  python scripts/design/importar_tokens.py --css path/to/styles.css
  python scripts/design/importar_tokens.py --json path/to/tokens.json     (W3C / Style Dictionary / flat)
  python scripts/design/importar_tokens.py --designmd path/to/DESIGN.md   (awesome-design-md style)

What it does
  - URL: downloads the page and its linked stylesheets (public pages only, no login), reads CSS
    variables (--primary, --background ...), counts colours and font families.
  - Maps them to the token roles (background, surface, ink, accent ...) with simple rules.
  - Writes every guess with a confidence note in "_import" so you can review it with the user.
It never copies images, logos or fonts: it only reads colour values and font NAMES.
"""
import argparse
import collections
import json
import os
import re
import sys
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, "scripts", "design"))
from tokens_schema import DEFAULTS, contrast, luminance, merge, norm_hex  # noqa: E402

UA = {"User-Agent": "Mozilla/5.0 (design-import; public pages only)"}
GENERIC = {"serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "inherit", "initial",
           "ui-sans-serif", "ui-serif", "ui-monospace", "-apple-system", "blinkmacsystemfont", "segoe ui",
           "arial", "helvetica", "helvetica neue", "times new roman", "georgia", "roboto", "emoji"}
NAME_MAP = [  # css variable name fragment -> token role (first match wins)
    (r"(^|-)(background|bg|canvas|page)(-|$)", "background"),
    (r"(surface|card|panel|muted-bg|secondary-bg)", "surface"),
    (r"(foreground|text|ink|body)(-|$)", "ink"),
    (r"(muted|subtle|secondary-text|caption)", "muted"),
    (r"(primary|brand|accent|main)(-|$)", "accent"),
    (r"(secondary|highlight|warning)(-|$)", "accent2"),
    (r"(success|positive|green)", "positive"),
    (r"(danger|error|destructive|negative|red)", "negative"),
    (r"(border|line|divider|outline)", "line"),
]


def get(url):
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")


def css_from_url(url):
    html = get(url)
    css = "\n".join(re.findall(r"<style[^>]*>(.*?)</style>", html, re.S))
    for tag in re.findall(r"<link[^>]*>", html):
        rel = re.search(r"rel=[\"']?([\w\s-]+)", tag)
        href = re.search(r"href=[\"']?([^\s\"'>]+)", tag)
        if not href or not ((rel and "stylesheet" in rel.group(1)) or ".css" in href.group(1)):
            continue
        try:
            css += "\n" + get(urllib.parse.urljoin(url, href.group(1)))
        except Exception as e:  # noqa: BLE001
            print("  (skipped stylesheet:", href.group(1)[:70], e.__class__.__name__, ")")
    return css, html


def parse_css(css):
    variables = {}
    for name, val in re.findall(r"(--[\w-]+)\s*:\s*([^;}{]+)", css):
        h = norm_hex(val.strip())
        if h:
            variables[name.lstrip("-")] = h
    counts = collections.Counter()
    for h in re.findall(r"#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b", css):
        n = norm_hex(h)
        if n:
            counts[n] += 1
    for m in re.findall(r"(?:rgba?|hsla?)\([^)]+\)", css):
        n = norm_hex(m)
        if n:
            counts[n] += 1
    fonts = collections.Counter()
    for decl in re.findall(r"font-family\s*:\s*([^;}{]+)", css):
        for f in decl.split(","):
            f = f.strip().strip("'\"")
            if f and f.lower() not in GENERIC and not f.startswith("var(") and len(f) < 40:
                fonts[f] += 1
    return variables, counts, fonts


def is_grey(h):
    r, g, b = (int(h[i:i + 2], 16) for i in (1, 3, 5))
    return max(r, g, b) - min(r, g, b) < 18


def map_tokens(variables, counts, fonts):
    color, notes = {}, {}
    for var, hexv in variables.items():
        for pat, role in NAME_MAP:
            if role not in color and re.search(pat, var):
                color[role] = hexv
                notes[role] = f"css variable --{var} (high)"
                break
    ranked = [c for c, _ in counts.most_common(40)]
    if "background" not in color:
        light = [c for c in ranked if luminance(c) > 0.85]
        dark = [c for c in ranked if luminance(c) < 0.05]
        pick = (light or dark or ["#FFFFFF"])[0]
        color["background"] = pick
        notes["background"] = "most used near-white/near-black colour (medium)"
    bg = color["background"]
    if "ink" not in color:
        cand = [c for c in ranked if contrast(c, bg) >= 7]
        color["ink"] = cand[0] if cand else ("#111111" if luminance(bg) > 0.5 else "#F5F5F5")
        notes["ink"] = "most used colour with contrast >= 7 against the background (medium)"
    if "accent" not in color:
        cand = [c for c in ranked if not is_grey(c) and contrast(c, bg) >= 3]
        if cand:
            color["accent"] = cand[0]
            notes["accent"] = "most used saturated colour (medium)"
    if "accent2" not in color:
        cand = [c for c in ranked if not is_grey(c) and c != color.get("accent") and contrast(c, bg) >= 2]
        if cand:
            color["accent2"] = cand[0]
            notes["accent2"] = "second most used saturated colour (low)"
    top_fonts = [f for f, _ in fonts.most_common(3)]
    font = {}
    if top_fonts:
        font["heading"] = {"family": top_fonts[0], "weight": 700}
        font["body"] = {"family": top_fonts[1] if len(top_fonts) > 1 else top_fonts[0], "weight": 500}
        notes["font"] = f"most used non-generic families: {top_fonts} (medium). Check each is on Google Fonts."
    return color, font, notes


def from_json(path):
    data = json.load(open(path, encoding="utf-8"))
    flat = {}

    def walk(node, trail):
        if isinstance(node, dict):
            val = node.get("$value", node.get("value"))
            if isinstance(val, str):
                flat["-".join(trail)] = val
            else:
                for k, v in node.items():
                    walk(v, trail + [k])
        elif isinstance(node, str):
            flat["-".join(trail)] = node
    walk(data, [])
    variables = {k: norm_hex(v) for k, v in flat.items() if norm_hex(v)}
    fonts = collections.Counter({v: 1 for k, v in flat.items() if "font" in k.lower() and "famil" in k.lower()})
    return variables, collections.Counter(variables.values()), fonts


def from_designmd(path):
    text = open(path, encoding="utf-8").read()
    variables = {}
    for line in text.splitlines():
        h = re.findall(r"#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b", line)
        if h:
            label = re.sub(r"[^a-z]+", "-", re.sub(r"`|\*|#[0-9a-fA-F]{3,6}.*", "", line.lower())).strip("-")
            if label:
                variables.setdefault(label, norm_hex(h[0]))
    counts = collections.Counter(norm_hex(h) for h in re.findall(r"#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b", text))
    fonts = collections.Counter()
    for m in re.findall(r"(?:font|typeface|type)[^\n]*?[:\-]\s*[\"`*]*([A-Z][A-Za-z ]{2,28})", text):
        if m.strip().lower() not in GENERIC:
            fonts[m.strip()] += 1
    return variables, counts, fonts


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("--url")
    ap.add_argument("--css")
    ap.add_argument("--json")
    ap.add_argument("--designmd")
    ap.add_argument("--name")
    ap.add_argument("--out", default=os.path.join(ROOT, "brand", "design-system", "tokens.json"))
    a = ap.parse_args()
    source = a.url or a.css or a.json or a.designmd
    if not source:
        sys.exit(__doc__)
    if a.url:
        css, _ = css_from_url(a.url)
        v, c, f = parse_css(css)
    elif a.css:
        v, c, f = parse_css(open(a.css, encoding="utf-8").read())
    elif a.json:
        v, c, f = from_json(a.json)
    else:
        v, c, f = from_designmd(a.designmd)
    color, font, notes = map_tokens(v, c, f)
    tokens = merge(DEFAULTS, {"name": a.name or "Imported brand", "color": color, "font": font})
    tokens["_import"] = {"source": source, "notes": notes, "review": "Confirm every value with the user."}
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    json.dump(tokens, open(a.out, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"Found {len(v)} colour variables, {len(c)} distinct colours, {len(f)} font families.")
    for k, val in color.items():
        print(f"  {k:10s} {val}   <- {notes.get(k, 'default')}")
    for k, val in font.items():
        print(f"  font {k:8s} {val['family']}")
    print("wrote", a.out)


if __name__ == "__main__":
    main()
