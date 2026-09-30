"""Detect this computer and recommend the right route for every part of the system (Windows / macOS / Linux).

Usage:
  python scripts/diagnosticar.py            print the profile and the recommendations
  python scripts/diagnosticar.py --save     also write brand/system.json (machine-specific, git-ignored)
  python scripts/diagnosticar.py --json     print only the JSON

Read-only: it runs version checks and never installs or changes anything. The skill `os-fallbacks` turns this profile
into the alternative to use when a step fails.
"""
import json
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def run(cmd, timeout=20):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, encoding="utf-8", errors="replace")
        return (r.stdout or "") + (r.stderr or "")
    except Exception:  # noqa: BLE001
        return ""


def first(text):
    return text.strip().splitlines()[0].strip() if text.strip() else ""


def probe():
    # NOTE: avoid the `platform` module here: on Windows it runs a WMI query that can take minutes.
    os_name = {"win32": "windows", "darwin": "macos"}.get(sys.platform, "linux")
    if os_name == "windows":
        arch = os.environ.get("PROCESSOR_ARCHITECTURE", "").lower() or "unknown"
        v = sys.getwindowsversion()
        os_version = f"Windows {v.major}.{v.minor} build {v.build}"
    else:
        u = os.uname()
        arch, os_version = u.machine.lower(), f"{u.sysname} {u.release}"
    p = {"os": os_name, "arch": arch, "os_version": os_version}

    # chip / cpu, RAM, disk
    if os_name == "macos":
        p["chip"] = first(run(["sysctl", "-n", "machdep.cpu.brand_string"])) or arch
        p["ram_gb"] = round(int(first(run(["sysctl", "-n", "hw.memsize"])) or 0) / 1073741824)
        p["apple_silicon"] = arch in ("arm64", "aarch64")
    elif os_name == "windows":
        p["chip"] = os.environ.get("PROCESSOR_IDENTIFIER", arch)
        try:
            import ctypes

            class MS(ctypes.Structure):
                _fields_ = [("l", ctypes.c_ulong), ("m", ctypes.c_ulong), ("tp", ctypes.c_ulonglong), ("ap", ctypes.c_ulonglong),
                            ("tpf", ctypes.c_ulonglong), ("apf", ctypes.c_ulonglong), ("tv", ctypes.c_ulonglong), ("av", ctypes.c_ulonglong), ("ae", ctypes.c_ulonglong)]
            ms = MS(); ms.l = ctypes.sizeof(MS)
            ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(ms))
            p["ram_gb"] = round(ms.tp / 1073741824)
        except Exception:  # noqa: BLE001
            p["ram_gb"] = None
        p["apple_silicon"] = False
    else:
        m = re.search(r"model name\s*:\s*(.+)", open("/proc/cpuinfo").read()) if os.path.exists("/proc/cpuinfo") else None
        p["chip"] = m.group(1) if m else arch
        mem = re.search(r"MemTotal:\s*(\d+)", open("/proc/meminfo").read()) if os.path.exists("/proc/meminfo") else None
        p["ram_gb"] = round(int(mem.group(1)) / 1048576) if mem else None
        p["apple_silicon"] = False
    try:
        p["disk_free_gb"] = round(shutil.disk_usage(ROOT).free / 1073741824)
    except Exception:  # noqa: BLE001
        p["disk_free_gb"] = None

    # GPU / encoders
    smi = shutil.which("nvidia-smi")
    p["nvidia"] = first(run(["nvidia-smi", "--query-gpu=name,driver_version", "--format=csv,noheader"])) if smi else ""
    enc = run(["ffmpeg", "-hide_banner", "-encoders"]) if shutil.which("ffmpeg") else ""
    p["ffmpeg"] = first(run(["ffmpeg", "-version"])) if shutil.which("ffmpeg") else ""
    p["ffmpeg_hw_encoders"] = [e for e in ("h264_nvenc", "h264_videotoolbox", "h264_qsv", "h264_amf") if e in enc]

    # tools (probed in parallel: some CLIs are slow to start)
    from concurrent.futures import ThreadPoolExecutor
    specs = (("node", "-v"), ("npm", "-v"), ("git", "--version"), ("git-lfs", "--version"), ("yt-dlp", "--version"), ("sox", "--version"),
             ("codex", "--version"), ("claude", "--version"), ("gh", "--version"))

    def ver(spec):
        exe = shutil.which(spec[0])
        return spec[0].replace("-", "_"), (first(run([exe, spec[1]], 12)) if exe else "")
    with ThreadPoolExecutor(max_workers=9) as ex:
        tools = dict(ex.map(ver, specs))
    p["tools"] = tools
    py312 = ""
    for cmd in (["python3.12", "--version"], ["py", "-3.12", "--version"], ["python3", "--version"], ["python", "--version"]):
        if shutil.which(cmd[0]):
            out = first(run(cmd))
            if "3.12" in out:
                py312 = " ".join(cmd[:-1]) if cmd[0] != "py" else "py -3.12"
                break
    p["python312_command"] = py312
    p["package_managers"] = [m for m in ("brew", "winget", "choco", "scoop", "apt", "dnf", "uv") if shutil.which(m)]

    # project venv + torch devices
    venv_py = os.path.join(ROOT, ".venv", "Scripts", "python.exe") if os_name == "windows" else os.path.join(ROOT, ".venv", "bin", "python")
    p["venv_python"] = venv_py.replace("\\", "/")
    p["venv_exists"] = os.path.exists(venv_py)
    p["torch"] = ""
    if p["venv_exists"]:
        p["torch"] = first(run([venv_py, "-c", "import torch;print(torch.__version__,'cuda',torch.cuda.is_available(),'mps',getattr(torch.backends,'mps',None) is not None and torch.backends.mps.is_available())"], 120))

    # browsers for Remotion / Playwright fallbacks
    chrome_candidates = {
        "windows": [r"C:\Program Files\Google\Chrome\Application\chrome.exe", r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"],
        "macos": ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"],
        "linux": ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"],
    }.get(os_name, [])
    p["system_chrome"] = next((c for c in chrome_candidates if os.path.exists(c)), "")
    p["project_path_has_spaces"] = " " in ROOT
    p["paths_json"] = os.path.exists(os.path.join(ROOT, "brand", "paths.json"))
    return p


def recommend(p):
    os_name = p["os"]
    cuda = "cuda True" in p["torch"] or bool(p["nvidia"])
    mps = "mps True" in p["torch"] or (os_name == "macos" and p["apple_silicon"])
    r, warn = {}, []
    if cuda:
        r["whisper_route"], r["ai_device"] = "transformers-cuda (main); faster-whisper (fallback)", "cuda"
    elif mps:
        r["whisper_route"], r["ai_device"] = "transformers-mps (main); mlx-whisper (faster on a Mac); faster-whisper CPU (fallback)", "mps"
    else:
        r["whisper_route"], r["ai_device"] = "faster-whisper on CPU (int8): slow but works; skip matte and face tracking", "cpu"
    r["ai_local"] = cuda or mps
    r["video_hw_encoder"] = (p["ffmpeg_hw_encoders"] or ["libx264 (software)"])[0]
    r["remotion_hw"] = "if-possible (default); REMOTION_HW=disable if the encoder errors"
    r["remotion_gl"] = "angle" if os_name == "windows" else "default (try --gl=angle, then --gl=swangle, if the browser crashes)"
    r["python_command_for_venv"] = p["python312_command"] or "MISSING: install Python 3.12 (see os-fallbacks)"
    r["venv_python"] = p["venv_python"]
    r["install_scripts"] = "scripts/instalar-herramientas.ps1 + instalar-proyecto.ps1" if os_name == "windows" else "scripts/instalar-herramientas.sh + instalar-proyecto.sh"
    r["verify_script"] = ".claude/skills/luisart-montar-sistema/scripts/verificar_equipo." + ("ps1" if os_name == "windows" else "sh")
    r["keep_awake"] = {"windows": "Settings > Power: never sleep while plugged in", "macos": "caffeinate -i <command>", "linux": "systemd-inhibit <command>"}.get(os_name, "")
    r["drawtext_font"] = {"windows": "C\\:/Windows/Fonts/arial.ttf", "macos": "/System/Library/Fonts/Supplemental/Arial.ttf", "linux": "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"}.get(os_name, "")
    r["system_chrome_for_remotion"] = p["system_chrome"] or "none found (Remotion downloads Chrome for Testing itself)"

    if os_name == "macos" and not p["apple_silicon"]:
        warn.append("Intel Mac: the local AI parts (Whisper via PyTorch, matte, face tracking) are not supported; use faster-whisper on CPU or skip them. Graphics, carousels, stories, Buffer and wiki work.")
    if p["ram_gb"] and p["ram_gb"] < 15:
        warn.append(f"Only {p['ram_gb']} GB of RAM: set REMOTION_CONCURRENCY=1 or 2 and run one heavy job at a time.")
    if p["disk_free_gb"] is not None and p["disk_free_gb"] < 60:
        warn.append(f"Only {p['disk_free_gb']} GB free: need about 60 GB (models + renders).")
    if not p["ffmpeg"]:
        warn.append("FFmpeg is missing (install it: winget Gyan.FFmpeg / brew install ffmpeg).")
    if not p["python312_command"]:
        warn.append("Python 3.12 not found (the PyTorch pins need exactly 3.12).")
    if p["nvidia"] and "cuda False" in p["torch"]:
        warn.append("An NVIDIA GPU exists but PyTorch has no CUDA: reinstall the CUDA build of torch (instalar-proyecto).")
    if p["project_path_has_spaces"]:
        warn.append("The project path has spaces: quote every path in commands.")
    if os_name == "windows":
        warn.append("Windows: if Git complains about long paths run `git config --global core.longpaths true`.")
    if not p["tools"].get("codex"):
        warn.append("Codex CLI missing: independent review falls back to a checklist review by the main assistant; images go through the Higgsfield API or are skipped.")
    return r, warn


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    p = probe()
    r, warn = recommend(p)
    out = {"profile": p, "recommendations": r, "warnings": warn}
    if "--json" in sys.argv:
        print(json.dumps(out, indent=2, ensure_ascii=False))
    else:
        print(f"OS: {p['os']} ({p['arch']}) | chip: {p['chip']} | RAM: {p['ram_gb']} GB | free disk: {p['disk_free_gb']} GB")
        print(f"GPU: {p['nvidia'] or 'no NVIDIA'} | ffmpeg HW encoders: {', '.join(p['ffmpeg_hw_encoders']) or 'none'} | torch: {p['torch'] or 'venv not installed yet'}")
        print("Package managers:", ", ".join(p["package_managers"]) or "none found")
        print("\nRecommendations:")
        for k, v in r.items():
            print(f"  {k:28s} {v}")
        print("\nWarnings:" if warn else "\nNo warnings.")
        for w in warn:
            print("  -", w)
    if "--save" in sys.argv:
        os.makedirs(os.path.join(ROOT, "brand"), exist_ok=True)
        json.dump(out, open(os.path.join(ROOT, "brand", "system.json"), "w", encoding="utf-8"), indent=2, ensure_ascii=False)
        print("\nsaved brand/system.json")


if __name__ == "__main__":
    main()
