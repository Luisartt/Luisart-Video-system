"""Rebuilds the overview sheets of a style library's renders.

Usage (from the project root):
  python core/scripts/py/index_sheet.py <renderDir> [--refresh <id> ...]

- Thumbnails live in <renderDir>/_thumbs/<id>.png: the frame at 80 % of the clip (content fully
  built) with a white strip carrying the ID. --refresh re-extracts the listed IDs; missing thumbs are
  always extracted. Clips moved to <renderDir>/_retired/ are left out.
- Writes <renderDir>/_index-vertical.png (IDs ending in -v, 9 per row, 360×674 tiles) and
  <renderDir>/_index-horizontal.png (the rest, 6 per row, 640×394 tiles). Order: the _ids*.txt lists
  first (in their order), then any other clip alphabetically.
"""
import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

FONT_CANDIDATES = [  # first one that exists: Windows, macOS, Linux
    "C:/Windows/Fonts/arial.ttf", "/System/Library/Fonts/Supplemental/Arial.ttf", "/Library/Fonts/Arial.ttf",
    "/System/Library/Fonts/Helvetica.ttc", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]


def load_font(size):
    for p in FONT_CANDIDATES:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                pass
    return ImageFont.load_default()


def duration(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path])
    return float(out.decode().strip())


def thumb(render_dir, cid, font):
    mp4 = os.path.join(render_dir, cid + ".mp4")
    vertical = cid.endswith("-v")
    w, h = (360, 640) if vertical else (640, 360)
    tmp = os.path.join(render_dir, "_thumbs", cid + "._frame.png")
    t = duration(mp4) * 0.8
    subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", mp4, "-frames:v", "1", "-vf", f"scale={w}:{h}", tmp])
    img = Image.new("RGB", (w, h + 34), "white")
    img.paste(Image.open(tmp).convert("RGB"), (0, 0))
    ImageDraw.Draw(img).text((6, h + 8), cid, fill=(0, 0, 0), font=font)
    img.save(os.path.join(render_dir, "_thumbs", cid + ".png"))
    os.remove(tmp)


def main():
    render_dir = sys.argv[1]
    refresh = set(sys.argv[sys.argv.index("--refresh") + 1:]) if "--refresh" in sys.argv else set()
    os.makedirs(os.path.join(render_dir, "_thumbs"), exist_ok=True)
    font = load_font(15)
    clips = sorted(f[:-4] for f in os.listdir(render_dir) if f.endswith(".mp4"))
    order = []
    for f in sorted(os.listdir(render_dir)):
        if f.startswith("_ids") and f.endswith(".txt"):
            for line in open(os.path.join(render_dir, f), encoding="utf-8"):
                cid = line.strip()
                if cid and cid in clips and cid not in order:
                    order.append(cid)
    order += [c for c in clips if c not in order]
    for cid in order:
        if cid in refresh or not os.path.exists(os.path.join(render_dir, "_thumbs", cid + ".png")):
            thumb(render_dir, cid, font)
    for name, ids, cols, (tw, th) in (
        ("_index-vertical.png", [c for c in order if c.endswith("-v")], 9, (360, 674)),
        ("_index-horizontal.png", [c for c in order if not c.endswith("-v")], 6, (640, 394)),
    ):
        if not ids:
            continue
        rows = (len(ids) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * tw, rows * th), "white")
        for i, cid in enumerate(ids):
            t = Image.open(os.path.join(render_dir, "_thumbs", cid + ".png")).convert("RGB").resize((tw, th))
            sheet.paste(t, ((i % cols) * tw, (i // cols) * th))
        sheet.save(os.path.join(render_dir, name))
        print(f"{name}: {len(ids)} clips, {rows} rows")


if __name__ == "__main__":
    main()
