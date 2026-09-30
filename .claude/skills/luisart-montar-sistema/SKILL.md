---
name: luisart-montar-sistema
description: Set up (or move) the whole video-editing system on a computer — tools, Remotion, the Python environment with Whisper, paths, optional vault and cloud folder — and verify it with a real test render. Use when the user says "monta el sistema en esta computadora", "configura esta compu para editar", "instala todo", "set up the video system on my other computer", "verifica que el equipo sirva para editar", or when a tool of the pipeline is missing or broken. Not for editing a video (that is luisart-editar-short).
---

# Set up the editing system on a computer

The user may not be technical. **You do every step**; they only sign in where a login is unavoidable
(GitHub, cloud storage, Codex, Claude). Report outcomes in their language, without internals.

The repository itself is the project: **a new computer needs `git clone` + this skill**, nothing else to
copy. Heavy or rebuildable things (`node_modules`, `.venv`, model weights, `out/`, `archive/`,
`recordings/`) are never in git; they are rebuilt locally. The user's brand (`brand/`) and their
channel folder live in their own fork; their vault lives in its own private repository.

## Steps (in order; check each; one heavy job at a time)

1. **Check the machine** (read-only): `powershell -File .claude\skills\luisart-montar-sistema\scripts\verificar_equipo.ps1`.
   Requirements: Windows 10/11 (macOS/Linux: translate the tools to brew/apt and say so), ≥ 16 GB RAM,
   ≥ 60 GB free disk, NVIDIA GPU with driver ≥ 551.76 for hardware video encoding (without a GPU everything
   works but renders and Whisper are much slower; set `hardwareAcceleration` in `core/lib/render-settings.ts`).
2. **Tools:** `powershell -ExecutionPolicy Bypass -File scripts\instalar-herramientas.ps1` (Git, Git LFS,
   GitHub CLI, Node 24, FFmpeg, yt-dlp, Python 3.12, SoX, Deno). Reopen the terminal so PATH refreshes. The AI
   CLIs (Claude Code, Codex) are covered in `docs/MODELOS-Y-CLIS.md`.
3. **Project dependencies:** `powershell -ExecutionPolicy Bypass -File scripts\instalar-proyecto.ps1`
   (`npm ci` → Remotion and all `@remotion/*` at 4.0.529; Python 3.12 venv; CUDA torch first, then
   `requirements-venv.txt`; `facenet-pytorch` with `--no-deps` so it does not replace torch). Check
   `.venv\Scripts\python.exe -c "import torch;print(torch.cuda.is_available())"` → `True`.
4. **Paths:** `python scripts/configurar_rutas.py --create --channel <slug> [--vault <folder>] [--cloud <folder>]`
   writes `brand/paths.json`, creates `channels/<slug>/` (from `channels/_template`), `out|media|archive|recordings/<slug>/`
   and the vault from `vault-template/`. The skills use placeholders (`{PROJECT}`, `{VAULT}`, …) that come from
   that file; the user can edit it any time and run `python scripts/configurar_rutas.py --check`.
5. **Model weights** download on first use into `%USERPROFILE%\.cache\huggingface` (Whisper large-v3-turbo
   ≈ 1.6 GB). Warm it with a 5-second clip through `transcribe_parts.py` so the first real job does not stall.
   Chrome for Testing downloads on the first `npm run gpu`.
6. **Render settings for this machine:** `core/lib/render-settings.ts` holds concurrency, timeout and hardware
   flags measured on the author's laptop (i7-13620H, RTX 4050 6 GB, 15.7 GB RAM: concurrency 3, timeout
   120 s, NVENC required). Run `npm run gpu`; if this machine differs, run `npx remotion benchmark` on one short
   composition and update that file (more RAM → higher concurrency; no NVENC → `hardwareAcceleration = "if-possible"`).
7. **Media:** audio is not in the repo (licences). The user brings their own music/SFX or downloads
   licence-clean ones; `media/soyluisart/audio/LICENCIAS.md` shows how the example library was sourced. The AI never
   picks the user's music.
8. **Prove it works (mandatory):** (a) `npm run gpu` all "Hardware accelerated"; (b) `npx tsc --noEmit`;
   (c) `npx remotion still core/index.ts TPL-title-card out/_setup-test.png --frame=60`; (d) `transcribe_parts.py`
   on a 5 s clip; (e) `codex --version`, `claude --version`, `yt-dlp --version`; (f) `verificar_equipo.ps1` again →
   every line OK. Delete the test outputs afterwards.
9. **Record it:** note the machine (name, date, what passed) in `brand/PROGRESS.md`.

## Moving to another computer
`git clone` your fork → steps 1–9 again (steps 2–3 are the same, step 4 uses that machine's folders) → bring
the vault with `git clone <your private vault repo> <vault folder>` (+ `git lfs pull`) and update `brand/paths.json`;
heavy media comes from wherever you keep it (cloud folder, same relative path).

## What not to do
- Never put `.venv`, `node_modules`, renders, model weights, keys or logins in git; never make the vault repo public.
- Never enter passwords for the user; they sign in themselves.
- Never pick their music, clone their voice, or publish anything.
- Do not overwrite measured render numbers of another machine; add the new one beside them.

## Report (in the user's language, plain)
What machine it is, what was installed, what passed the test render, what still needs them (a login), and the one
thing they should know (for example "this computer has no video card: renders will be about 5× slower").
