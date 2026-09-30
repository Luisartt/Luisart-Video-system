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
**Detect the operating system first** (`uname -s`, or `$env:OS` on Windows) and use the matching column. The exact
commands for both are in `docs/INSTALACION.md` (show it to the user if they ask).

1. **Check the machine** (read-only). Windows: `powershell -File .claude\skills\luisart-montar-sistema\scriptserificar_equipo.ps1`.
   macOS/Linux: `bash .claude/skills/luisart-montar-sistema/scripts/verificar_equipo.sh`.
   Requirements: Windows 10/11 or macOS 13+, ≥ 16 GB RAM, ≥ 60 GB free disk. **GPU for the local AI parts (Whisper, person matte,
   face tracking): NVIDIA with driver ≥ 551.76 on Windows; Apple Silicon (M1+) on a Mac.** Without them the graphics, carousels,
   stories, Buffer and wiki still work; renders and Whisper are slower. An **Intel Mac** cannot run the local AI parts: say so.
2. **Tools.** Windows: `powershell -ExecutionPolicy Bypass -File scripts\instalar-herramientas.ps1` (winget). macOS:
   `bash scripts/instalar-herramientas.sh` (Homebrew; if Homebrew is missing the script says how, and the user types their Mac
   password when the official installer asks). Installs Git, Git LFS, GitHub CLI, Node 24, FFmpeg, yt-dlp, Python 3.12, SoX, Deno.
   Reopen the terminal so PATH refreshes. The AI CLIs (Claude Code, Codex) are covered in `docs/MODELOS-Y-CLIS.md`.
3. **Project dependencies.** Windows: `scripts\instalar-proyecto.ps1`. macOS: `bash scripts/instalar-proyecto.sh`. Both run `npm ci`
   (Remotion and all `@remotion/*` at 4.0.529), install Playwright's Chromium, create the Python 3.12 venv, install PyTorch
   (CUDA build on Windows/NVIDIA, Metal-capable build on Apple Silicon) and `requirements-venv.txt`, and `facenet-pytorch` with
   `--no-deps` so it does not replace torch. Check: Windows `CUDA True`, Mac `MPS True` (the verifier prints it).
4. **Paths:** `python scripts/configurar_rutas.py --create --channel <slug> [--vault <folder>] [--cloud <folder>]` (`python3` on a Mac
   if `python` is missing) writes `brand/paths.json`, creates `channels/<slug>/` (from `channels/_template`),
   `out|media|archive|recordings/<slug>/` and the vault from `vault-template/`. The skills use placeholders (`{PROJECT}`, `{VAULT}`,
   `{PYTHON}` …) that come from that file; the user can edit it any time and run `--check`.
5. **Model weights** download on first use into the Hugging Face cache (Whisper large-v3-turbo ≈ 1.6 GB). Warm it with a 5-second
   clip through `transcribe_parts.py`. The device is chosen automatically: CUDA, then Apple Metal, then CPU.
6. **Render settings:** `core/lib/render-settings.ts` is platform-aware (hardware encoder when available: NVENC or VideoToolbox;
   `gl` = `angle` on Windows only). Defaults are safe for 16 GB. Override with `REMOTION_HW=required|disable` and
   `REMOTION_CONCURRENCY=<n>`; benchmark with `npx remotion benchmark` and adjust if the machine is stronger or weaker.
7. **Media:** audio is not in the repo (licences). The user brings their own music/SFX or downloads licence-clean ones;
   `media/soyluisart/audio/LICENCIAS.md` shows how the example library was sourced. The AI never picks the user's music.
8. **Prove it works (mandatory):** (a) the verifier shows no missing items; (b) `npx tsc --noEmit`; (c)
   `npx remotion still core/index.ts TPL-title-card out/_setup-test.png --frame=60`; (d) `transcribe_parts.py` on a 5 s clip;
   (e) `codex --version`, `claude --version`, `yt-dlp --version`. Delete the test outputs afterwards.
9. **Record it:** note the machine (name, OS, date, what passed) in `brand/PROGRESS.md`.

**Mac tips:** long renders with `caffeinate -i <command>`; if `node`/`python3.12` are "not found" after installing, open a new
Terminal or run `eval "$(/opt/homebrew/bin/brew shellenv)"`; macOS may ask to let Terminal access Documents: allow.

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
