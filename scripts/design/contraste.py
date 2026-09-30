"""Check that the colours of a design system are readable on video (WCAG contrast ratios).

Usage:  python scripts/design/contraste.py brand/design-system/tokens.json

Pairs checked (text on its background). Body text and captions need >= 4.5; big text (titles,
numbers) and graphic lines need >= 3. Exit code 1 if a required pair fails.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tokens_schema import contrast, load  # noqa: E402

PAIRS = [
    ("ink", "background", 4.5, "main text on the background"),
    ("ink", "surface", 4.5, "text inside cards"),
    ("muted", "background", 3.0, "secondary notes (large/handwritten)"),
    ("accent", "background", 3.0, "accent words, bars and lines on the background"),
    ("accent2", "background", 3.0, "second accent on the background"),
    ("negative", "background", 3.0, "'bad' colour on the background"),
    ("positive", "background", 3.0, "'good' colour on the background"),
    ("line", "background", 3.0, "borders"),
]


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    t = load(sys.argv[1])
    c = t["color"]
    bad = 0
    for fg, bg, need, what in PAIRS:
        r = contrast(c[fg], c[bg])
        ok = r >= need
        bad += (not ok) and need >= 4.5
        print(f"{'OK   ' if ok else 'FALLA'} {fg:9s} on {bg:10s} {r:5.2f}  (needs {need})  {what}")
    print()
    print("Tip: if something fails, darken the foreground (or lighten the background) until it passes; "
          "keep the hue so the brand still feels the same.")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
