---
name: os-fallbacks
description: When any install, command, tool or render fails or is missing on the user's computer, detect the operating system (Windows, macOS with Apple Silicon or Intel, Linux) and pick the right alternative from a decision table — installers, Python/torch, Whisper, matte and face tracking, Remotion/ffmpeg hardware encoding, browser automation, downloads, permissions, paths and sleep — instead of improvising. Use whenever a step errors ("falló", "no se encuentra", "command not found", "DLL not found", "not implemented for MPS", out of memory, timeouts), when the verifier reports missing items, or when the user asks "¿y si no funciona en mi Mac/Windows?".
---

# OS fallbacks: when something fails, use the alternative for this system

The user may be non-technical: **you** diagnose and apply the alternative; they only sign in or type a password when it is
unavoidable. Never tell them to "figure it out". Never use `sudo` for npm/pip. Never change security settings or install
from untrusted sources to get around an error.

## Protocol
1. **Detect:** `python scripts/diagnosticar.py --save` (python3 on a Mac if needed). It writes `brand/system.json` with the OS,
   chip, RAM, GPU, hardware encoders, torch device and **recommendations** (Whisper route, encoder, `gl`, fonts, keep-awake).
2. **Name the failing component** from the error text and find its row below. Use the column for this OS.
3. **Try alternatives in order**, least invasive first; retry the original step once after each. Do not stack changes.
4. **If nothing works, degrade gracefully:** skip the dependent feature, say in one line what it costs ("no face tracking: captions
   go at chest height"), and continue with the next independent step.
5. **Record it:** append a line to `brand/system.json → notes` (what failed, what worked) so the next session and the next
   computer start from there. Tell the user the outcome in their language, without internals.

## Decision tables (W = Windows, M = macOS, L = Linux; "AS" = Apple Silicon)

### 1. Installing tools
| Failure | W | M | L |
|---|---|---|---|
| Package manager missing | no `winget`: use direct installers (nodejs.org, python.org, gyan.dev FFmpeg), `choco` or `scoop` if present | no Homebrew: official one-line installer from brew.sh (user types their password); or direct installers: nodejs.org `.pkg`, python.org `.pkg`, a static FFmpeg build | `apt`/`dnf`; or `uv` for Python |
| Python 3.12 missing (the torch pins need exactly 3.12) | `winget install Python.Python.3.12`, or `uv python install 3.12` then `uv venv --python 3.12 .venv` | `brew install python@3.12`, or `uv` as on Windows | `apt install python3.12 python3.12-venv`, or `uv` |
| Wrong Node version | `winget install Schniz.fnm` then `fnm install 24` | `brew install fnm` (or `nvm`) then `fnm install 24` | `fnm`/`nvm` |
| `npm -g` permission error (EACCES) | run in a normal (not admin) terminal; or use `npx <package>` without installing globally | `npm config set prefix ~/.npm-global` and add `~/.npm-global/bin` to PATH; or `npx <package>` (never `sudo`) | same as macOS |
| `yt-dlp` missing or outdated | `winget upgrade yt-dlp` / `pip install -U yt-dlp` in the venv | `brew upgrade yt-dlp` / `pip install -U yt-dlp` | `pip install -U yt-dlp` |
| Git LFS missing | `winget install Git.GitLFS` then `git lfs install` | `brew install git-lfs && git lfs install` | `apt install git-lfs` |

### 2. Python AI stack (Whisper, matte, face tracking)
| Failure | W | M | L |
|---|---|---|---|
| No wheel for `torch==2.5.1` / pins fail | match the CUDA build to the driver (`cu121`; if it fails try the newest `cu12x` index) or use the CPU wheel | **Intel Mac: no wheel exists** → skip the local AI parts (see fallbacks below); AS: the default PyPI wheel already has Metal | CUDA index if `nvidia-smi` works, else CPU wheel |
| Whisper via transformers fails, is out of memory or too slow | `python .claude/skills/luisart-editar-short/scripts/transcribe_fallback.py <audio> <out.json> --lang spanish` (faster-whisper; uses CUDA and **falls back to CPU by itself** if a CUDA library such as cuBLAS is missing — seen in testing); smaller model: `--model medium` | AS: `--backend mlx` (`pip install mlx-whisper`, fastest on a Mac; the default model repo is `mlx-community/whisper-large-v3-turbo`, check the name if it fails); otherwise faster-whisper on CPU (int8). Intel: faster-whisper CPU | same as Windows |
| `not implemented for MPS` or NaNs | — | `PYTORCH_ENABLE_MPS_FALLBACK=1` (already set by the scripts); still failing: force the CPU by editing the `dev =` line of the script to `"cpu"` (float32) | — |
| Person matte (RVM) out of memory or failing | lower the third argument of `matte.py` (downsample, e.g. `0.25`), cut the clip shorter, or use CPU; **or skip the matte**: use layouts without a behind-head word (plain face shots with captions) and say so | same; on MPS failures use CPU | same as Windows |
| Face tracking fails | `--scale 0.3`; CPU | MTCNN does not run on Metal: it already uses the CPU; `--scale 0.3` | same as Windows |
| No face track at all | degrade: put captions at chest height, never on the face region by default, and flag it in the report; OpenCV's built-in face detector is a rough substitute | same | same |

### 3. Video and Remotion
| Failure | W | M | L |
|---|---|---|---|
| Hardware encoder error | `REMOTION_HW=disable` (software x264). ffmpeg encoders: `h264_nvenc` (NVIDIA), `h264_qsv` (Intel), `h264_amf` (AMD); universal: `libx264` | `REMOTION_HW=disable`; ffmpeg: `h264_videotoolbox`; universal: `libx264` | `REMOTION_HW=disable`; `h264_nvenc`/`h264_vaapi`; `libx264` |
| Out of memory / "timed out opening the browser" | `REMOTION_CONCURRENCY=2` then `1` (set with `set` in cmd, `$env:` in PowerShell); close apps; draft renders with `--scale=0.5`; always through the `*-locked` scripts | `REMOTION_CONCURRENCY=2` then `1` (`export`); close apps; `--scale=0.5` for drafts | same as macOS |
| Chrome for Testing will not download or the browser crashes | `--browser-executable "C:\Program Files\Google\Chrome\Application\chrome.exe"`; `--gl=angle` (default here), else `--gl=swangle` | `--browser-executable "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`; try `--gl=angle`, then `--gl=swangle` | `--browser-executable /usr/bin/google-chrome` (or chromium); `--gl=swangle` |
| `ffmpeg drawtext` font error | `fontfile='C\:/Windows/Fonts/arial.ttf'` | `fontfile='/System/Library/Fonts/Supplemental/Arial.ttf'` | `fontfile='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'` |
| `sox` missing or failing | not essential: `ffmpeg -af loudnorm` / `ebur128` measure and normalise loudness | same | same |

### 4. Browser automation (carousels, stories, Buffer)
| Failure | W | M | L |
|---|---|---|---|
| Playwright Chromium missing or will not start | `npx playwright install chromium`; else use the system Chrome (`executablePath` / `channel: "chrome"`); antivirus blocking: ask the user to allow it | `npx playwright install chromium`; Gatekeeper blocks it: `xattr -dr com.apple.quarantine <browser folder>`; else system Chrome | `npx playwright install --with-deps chromium`; else system Chrome |
| Port 9333 busy (Buffer window) | change the port in `tools/buffer/abrir.cjs` **and** `pw.cjs` (same number) | same | same |
| Google Fonts unreachable (offline renders) | install the brand fonts on the system (double-click the `.ttf`) and keep the same family names | install with Font Book | `~/.fonts` + `fc-cache -f` |

### 5. Getting reference videos
| Failure | Any OS |
|---|---|
| `yt-dlp` hangs or fails on a platform (Instagram often does) | update yt-dlp; retry once; for **public** posts try the platform's public embed page to find the media URL; otherwise ask the user to send the file or a screen recording. **Never** import cookies, log in for the user, or solve CAPTCHAs. |
| A site blocks AI agents (`scripts/design/revisar_robots.py`) | give the user the link and let them look or paste what they liked |

### 6. Operating-system behaviour
| Issue | W | M | L |
|---|---|---|---|
| Computer sleeps during a render | Settings → Power: never sleep on power; or `powercfg /change standby-timeout-ac 0` | `caffeinate -i <command>`; keep the charger connected | `systemd-inhibit <command>` |
| Permission / policy errors | PowerShell: `-ExecutionPolicy Bypass -File …`; do not change system security settings | System Settings → Privacy & Security → Files and Folders (Terminal → Documents): ask the user to allow it; never `sudo` for npm/pip | check folder ownership; never `sudo` for npm/pip |
| Paths | quote paths; long paths: `git config --global core.longpaths true` (the user enables LongPathsEnabled if asked) | quote paths with spaces | case-sensitive: match the exact case |
| `.sh` scripts fail with `\r` / "bad interpreter" (CRLF) | — | `git config core.autocrlf false`, re-checkout, or strip with `sed -i '' 's/\r$//' file` (BSD sed needs `''`) | `sed -i 's/\r$//' file` |
| `python` not found or the wrong one | `py -3.12`; or `{PYTHON}` | `python3.12`; or `{PYTHON}` (`.venv/bin/python`) | `python3.12`; or `{PYTHON}` |
| Cloud-storage folder path | `G:\My Drive\…` | `~/Library/CloudStorage/GoogleDrive-<account>/My Drive/…` | depends on the client |

### 7. Services and CLIs
| Failure | Alternative |
|---|---|
| Codex CLI missing or `npm -g` blocked | `npx @openai/codex …`; or no Codex: the main assistant does the independent review with the checklist in `luisart-revision-codex` and says so; images via the Higgsfield API or skip generated imagery |
| Claude Code missing | official installer from claude.com/claude-code; this repo works through it |
| Obsidian cannot be installed | any Markdown editor (VS Code) works: the vault is plain Markdown; Web Clipper needs Obsidian, otherwise drop links in `links.txt` inside the inbox |
| Buffer connector not available | use `tools/buffer` only to upload and schedule, and verify in Buffer's own page; or hand the files and caption to the user |
| `gh auth` / GitHub sign-in problems | the user signs in (`gh auth login`); never ask for a token in the chat |

## Rules
- Always prefer the **smallest change** that unblocks the step, and state what you changed.
- If an alternative lowers quality or speed, tell the user once in plain words (for example "Whisper on CPU takes ~5× longer").
- Never hide a failure: if a feature is skipped, it appears in the final report.
- When you find a new failure/alternative that is not in these tables, apply it, record it in `brand/system.json → notes`, and
  propose adding it here (the user decides what enters the repository).
