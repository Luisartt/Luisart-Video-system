"""Face box per frame for a talking-head video, for face-aware caption placement.

Usage (from the project root, holding the render lock — it uses the GPU):
  python core/scripts/py/face_track.py <video> <out.json> [--scale 0.5]

Detector: MTCNN from facenet-pytorch (weights ship inside the package, no download), on the GPU
when available. The largest face per frame is kept; boxes are then filled across missed frames
and smoothed over time (centred median of 7 frames, then a light moving average) so captions
don't jump. Output coordinates are in the video's own pixels:
  {"width", "height", "fps", "frames": [[x0, y0, x1, y1, eyeY, mouthY, score] | null, ...]}
where the box is the detector's face box (≈ forehead → chin) and eyeY / mouthY come from the
landmarks.
"""
import json
import subprocess
import sys

import numpy as np
import torch
from facenet_pytorch import MTCNN


def probe(path):
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
        "stream=width,height,r_frame_rate", "-of", "json", path,
    ])
    s = json.loads(out)["streams"][0]
    num, den = s["r_frame_rate"].split("/")
    return int(s["width"]), int(s["height"]), float(num) / float(den)


def main():
    video, out_path = sys.argv[1], sys.argv[2]
    scale = float(sys.argv[sys.argv.index("--scale") + 1]) if "--scale" in sys.argv else 0.5
    w, h, fps = probe(video)
    sw, sh = int(round(w * scale / 2) * 2), int(round(h * scale / 2) * 2)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    mtcnn = MTCNN(keep_all=True, device=device, min_face_size=60)
    proc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", video, "-vf", f"scale={sw}:{sh}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        stdout=subprocess.PIPE,
    )
    raw = []
    batch, size = [], sw * sh * 3

    def flush():
        if not batch:
            return
        boxes, probs, points = mtcnn.detect(np.stack(batch), landmarks=True)
        for b, p, lm in zip(boxes, probs, points):
            if b is None or len(b) == 0:
                raw.append(None)
                continue
            areas = (b[:, 2] - b[:, 0]) * (b[:, 3] - b[:, 1])
            i = int(np.argmax(areas))
            x0, y0, x1, y1 = (b[i] / scale).tolist()
            eye_y = float(lm[i][0:2, 1].mean() / scale)
            mouth_y = float(lm[i][3:5, 1].mean() / scale)
            raw.append([x0, y0, x1, y1, eye_y, mouth_y, float(p[i])])
        batch.clear()

    while True:
        buf = proc.stdout.read(size)
        if len(buf) < size:
            break
        batch.append(np.frombuffer(buf, dtype=np.uint8).reshape(sh, sw, 3))
        if len(batch) == 16:
            flush()
    flush()
    proc.wait()

    # Fill gaps (nearest detected frame), then smooth each coordinate.
    n = len(raw)
    found = [i for i, r in enumerate(raw) if r is not None]
    if not found:
        raise SystemExit("no face found")
    arr = np.zeros((n, 7))
    for i in range(n):
        j = min(found, key=lambda k: abs(k - i))
        arr[i] = raw[j]
    sm = arr.copy()
    for i in range(n):
        a, b = max(0, i - 3), min(n, i + 4)
        sm[i, :6] = np.median(arr[a:b, :6], axis=0)
    kernel = np.ones(5) / 5
    for c in range(6):
        padded = np.pad(sm[:, c], 2, mode="edge")
        sm[:, c] = np.convolve(padded, kernel, mode="valid")
    frames = [[round(float(v), 1) for v in row[:6]] + [round(float(row[6]), 3)] if raw[i] is not None or True else None for i, row in enumerate(sm)]
    missed = sum(1 for r in raw if r is None)
    json.dump({"width": w, "height": h, "fps": fps, "detected": n - missed, "frames": frames}, open(out_path, "w"))
    print(f"{n} frames, face found in {n - missed}, wrote {out_path}")


if __name__ == "__main__":
    main()
