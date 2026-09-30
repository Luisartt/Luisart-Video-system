# Person alpha matte for a video with Robust Video Matting (local GPU: NVIDIA CUDA, Apple Metal or CPU).
# Usage: python matte.py <in.mp4> <out_alpha.mov>  -> ProRes 4444 with the person over transparency.
import os, sys, subprocess, numpy as np
os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")  # macOS: use the CPU for ops Metal lacks
import torch
inp, out = sys.argv[1], sys.argv[2]
DOWNSAMPLE = float(sys.argv[3]) if len(sys.argv) > 3 else 0.4
dev = "cuda" if torch.cuda.is_available() else ("mps" if getattr(torch.backends, "mps", None) and torch.backends.mps.is_available() else "cpu")
DT = torch.float16 if dev == "cuda" else torch.float32  # half precision only on NVIDIA
model = torch.hub.load("PeterL1n/RobustVideoMatting", "resnet50", trust_repo=True).to(dev).eval().to(DT)
probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate", "-of", "csv=p=0", inp], capture_output=True, text=True).stdout.strip().split(",")
w, h, fps = int(probe[0]), int(probe[1]), probe[2]
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", inp, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{w}x{h}", "-r", fps, "-i", "-",
                        "-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", out], stdin=subprocess.PIPE)
rec = [None] * 4
n = 0
with torch.no_grad():
    while True:
        buf = dec.stdout.read(w * h * 3)
        if len(buf) < w * h * 3:
            break
        rgb = torch.from_numpy(np.frombuffer(buf, np.uint8).reshape(h, w, 3).copy()).to(dev).permute(2, 0, 1)[None].to(DT) / 255
        fgr, pha, *rec = model(rgb, *rec, downsample_ratio=DOWNSAMPLE)
        # Edges: use the model's decontaminated foreground so the wall colour doesn't halo around hair.
        pha = pha.clamp(0, 1)
        col = torch.where(pha > 0.98, rgb, fgr)
        rgba = torch.cat([col, pha], 1)[0].permute(1, 2, 0).clamp(0, 1).mul(255).byte().cpu().numpy()
        enc.stdin.write(rgba.tobytes())
        n += 1
        if n % 150 == 0:
            print(n, "frames", flush=True)
enc.stdin.close(); enc.wait(); dec.wait()
print("done", n, "frames ->", out)
