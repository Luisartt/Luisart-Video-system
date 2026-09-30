"""Shared defaults and helpers for design tokens (brand/design-system/tokens.json)."""
import copy
import json
import re

DEFAULTS = {
    "name": "My Brand",
    "version": 1,
    "color": {
        "background": "#FFFFFF",
        "surface": "#F4F4F6",
        "ink": "#111111",
        "muted": "#6B7280",
        "accent": "#2F6BFF",
        "accent2": "#B07800",
        "positive": "#1E8A53",
        "negative": "#E5484D",
        "line": "#111111",
    },
    "font": {
        "heading": {"family": "Inter Tight", "weight": 700},
        "body": {"family": "Inter", "weight": 500},
        "accent": {"family": "Shadows Into Light Two", "weight": 400},
        "mono": {"family": "Space Mono", "weight": 700},
    },
    "type": {"title": 96, "label": 48, "caption": 54, "number": 160},
    "radius": {"card": 0, "pill": 999},
    "border": 4,
    "shadow": {"x": 9, "y": 9, "color": "#D6D6D6"},
    "motion": {"enterFrames": 8, "stagger": 10, "overshoot": False},
    "safe": {"vertical": {"top": 250, "bottom": 970}, "horizontal": {"top": 120, "bottom": 960}},
    "sound": {"loudnessLUFS": -14, "truePeakDb": -1},
    "logo": None,
}

HEX = re.compile(r"^#([0-9a-fA-F]{6})$")


def merge(base, over):
    out = copy.deepcopy(base)
    for k, v in (over or {}).items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = merge(out[k], v)
        else:
            out[k] = v
    return out


def load(path):
    with open(path, encoding="utf-8") as f:
        return merge(DEFAULTS, json.load(f))


def norm_hex(c):
    """'#abc' / 'rgb(1,2,3)' / '#AABBCC' -> '#AABBCC' or None."""
    c = c.strip()
    m = re.match(r"^#([0-9a-fA-F]{3})$", c)
    if m:
        return "#" + "".join(ch * 2 for ch in m.group(1)).upper()
    if HEX.match(c):
        return c.upper()
    m = re.match(r"^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})", c)
    if m:
        r, g, b = (min(255, int(x)) for x in m.groups())
        return "#%02X%02X%02X" % (r, g, b)
    m = re.match(r"^hsla?\(\s*([\d.]+)(?:deg)?\s*[, ]\s*([\d.]+)%\s*[, ]\s*([\d.]+)%", c)
    if m:
        import colorsys
        h, s_, l_ = float(m.group(1)) / 360, float(m.group(2)) / 100, float(m.group(3)) / 100
        r, g, b = colorsys.hls_to_rgb(h % 1, l_, s_)
        return "#%02X%02X%02X" % (round(r * 255), round(g * 255), round(b * 255))
    return None


def luminance(h):
    h = h.lstrip("#")
    rgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def contrast(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)
