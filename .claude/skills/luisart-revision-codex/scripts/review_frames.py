"""Contact sheets of a rendered edit for a Codex review (and for our own checks).

Usage (from the project root):
  .venv/Scripts/python.exe .claude/skills/luisart-revision-codex/scripts/review_frames.py \
      <video.mp4> <outDir> [--every 0.5] [--extra 12,48,301] [--extra-after 2] \
      [--cols 6] [--rows 3] [--width 1600] [--no-zones]

- Takes one frame every `--every` seconds, plus `--extra` frames (e.g. the caption-change frames
  from caption_changes.ts), each shifted by `--extra-after` frames (default 2, so the new caption
  is fully on screen). Duplicates are dropped; frames are sorted.
- Writes <outDir>/sheet-NN.png (cols x rows tiles, `--width` px wide; 1600 px is what Codex reads
  well) and <outDir>/frames.json (tile number -> frame, seconds, sheet).
- Each tile is labelled "NNN  f<frame>  <s>s". On vertical 1080x1920 renders the channel's zone
  lines are drawn over the tile (unless --no-zones): graphics zone y 250-970 (blue), caption band
  y 1000-1300 (yellow), platform UI below y 1436 and the right 160 px (red). Horizontal: graphics
  y 90-790, captions y 820-970.
"""
import json
import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont


def arg(name, default=None):
    if name in sys.argv:
        return sys.argv[sys.argv.index(name) + 1]
    return default


def probe(path):
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets", "-show_entries",
        "stream=width,height,r_frame_rate,nb_read_packets", "-of", "json", path,
    ])
    s = json.loads(out)["streams"][0]
    num, den = s["r_frame_rate"].split("/")
    return int(s["width"]), int(s["height"]), float(num) / float(den), int(s["nb_read_packets"])


def main():
    video, out_dir = sys.argv[1], sys.argv[2]
    every = float(arg("--every", "0.5"))
    extra_after = int(arg("--extra-after", "2"))
    extra = [int(x) for x in arg("--extra", "").split(",") if x.strip()]
    cols, rows = int(arg("--cols", "6")), int(arg("--rows", "3"))
    sheet_w = int(arg("--width", "1600"))
    zones = "--no-zones" not in sys.argv
    os.makedirs(out_dir, exist_ok=True)

    w, h, fps, n = probe(video)
    frames = {int(round(i * every * fps)) for i in range(int(n / (every * fps)) + 1)}
    frames |= {min(n - 1, f + extra_after) for f in extra}
    frames = sorted(f for f in frames if 0 <= f < n)

    tile_w = sheet_w // cols
    tile_h = int(round(tile_w * h / w))
    label_h = 24
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 15)
    except OSError:
        font = ImageFont.load_default()

    k = tile_w / w
    vertical = h > w
    if vertical:
        lines = [("h", 250, (0, 120, 255)), ("h", 970, (0, 120, 255)), ("h", 1000, (230, 180, 0)),
                 ("h", 1300, (230, 180, 0)), ("h", 1436, (255, 0, 80)), ("v", w - 160, (255, 0, 80))]
    else:
        lines = [("h", 90, (0, 120, 255)), ("h", 790, (0, 120, 255)), ("h", 820, (230, 180, 0)),
                 ("h", 970, (230, 180, 0))]

    index = []
    per_sheet = cols * rows
    tmp = os.path.join(out_dir, "_tile.png")
    for s in range(0, len(frames), per_sheet):
        chunk = frames[s:s + per_sheet]
        sheet = Image.new("RGB", (cols * tile_w, ((len(chunk) + cols - 1) // cols) * (tile_h + label_h)), "white")
        draw = ImageDraw.Draw(sheet)
        for i, f in enumerate(chunk):
            t = f / fps
            subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.4f}", "-i", video, "-frames:v", "1",
                                   "-vf", f"scale={tile_w}:{tile_h}", tmp])
            tile = Image.open(tmp).convert("RGB")
            x, y = (i % cols) * tile_w, (i // cols) * (tile_h + label_h)
            sheet.paste(tile, (x, y))
            if zones:
                for kind, v, col in lines:
                    if kind == "h":
                        draw.line([(x, y + v * k), (x + tile_w, y + v * k)], fill=col, width=1)
                    else:
                        yy = y + (h / 2) * k
                        draw.line([(x + v * k, yy), (x + v * k, y + tile_h)], fill=col, width=1)
            num = s + i + 1
            draw.text((x + 4, y + tile_h + 4), f"{num:03d}  f{f}  {t:.2f}s", fill=(0, 0, 0), font=font)
            index.append({"tile": num, "frame": f, "seconds": round(t, 3), "sheet": s // per_sheet + 1})
        name = os.path.join(out_dir, f"sheet-{s // per_sheet + 1:02d}.png")
        sheet.save(name)
        print("wrote", name)
    if os.path.exists(tmp):
        os.remove(tmp)
    json.dump({"video": video, "fps": fps, "frames": index}, open(os.path.join(out_dir, "frames.json"), "w"), indent=1)
    print(f"{len(frames)} frames on {(len(frames) + per_sheet - 1) // per_sheet} sheets")


if __name__ == "__main__":
    main()
