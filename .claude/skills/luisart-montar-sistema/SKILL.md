---
name: luisart-montar-sistema
description: Set up (or move) the whole @soyluisart video-editing system on a computer — the vault, the tubeai-video project (Remotion, FFmpeg, yt-dlp, Whisper, matte, face track, Codex CLI, GPU), the Google Drive media, the render settings for that machine — and verify it works with a real test render. Use when Luisart says "monta el sistema en la otra computadora", "configura esta compu para editar", "pasa el proyecto a otra máquina", "instala todo", "verifica que el equipo sirva para editar", or when a tool of the pipeline is missing or broken on a new machine. Not for editing a video (that is luisart-editar-short).
---

# Mount the editing system on a computer

Luisart is not technical and writes Spanish. The AI does every step, asks him only to sign in
where a login is unavoidable (GitHub, Google Drive, OpenAI/Codex), and reports outcomes in
Spanish without internals. Never ask him to run a command or edit a file.

The system has three layers. Each one travels differently:

| Layer | What | How it gets to the new computer |
|---|---|---|
| Knowledge and rules | the vault `C:\Users\LART\Documents\Lartyk\` (wiki, `CLAUDE.md`, styles pages) | private GitHub repo `Luisartt/lartyk` (vault `CLAUDE.md` → "Set up a new computer") |
| Code and skills | the project `tubeai-video` (`channels/`, `core/`, `.claude/skills/`, `.claude/agents/`, `AGENTS.md`, `package.json`, `media/` brand and SFX). **It is not a git repo.** | `scripts/exportar_proyecto.ps1` copies it to Google Drive `My Drive/lartyk/proyecto-tubeai-video/` (no heavy folders); `robocopy`/copy on the new machine |
| Heavy or rebuildable | `node_modules`, `.venv`, Whisper and other model weights, `out/`, `archive/`, `recordings/` | rebuilt on the new machine (below); never copied |

Precedence of rules stays: `channels/soyluisart/CHANNEL.md` ★ > `luisart-reglas` > other skills >
`GUIDELINES.md` > `AGENTS.md`.

## Steps

Run them in order; after each, check it (table at the end). One heavy job at a time.

1. **Check the machine first** with `scripts/verificar_equipo.ps1` (read-only). It lists what is
   present, what is missing, the GPU, free RAM and disk. Tell Luisart the result in plain words.
   Requirements: Windows 10/11, ≥ 16 GB RAM, ≥ 60 GB free disk, NVIDIA GPU with driver ≥ 551.76 for
   hardware video encoding (without a GPU everything still works but renders and Whisper are much
   slower; say so and set `hardwareAcceleration` accordingly, step 7).
2. **Tools** (winget, one at a time): `Git.Git`, `Git.GitLFS`, `GitHub.cli`, `OpenJS.NodeJS`
   (24.x), `Gyan.FFmpeg`, `yt-dlp.yt-dlp`, `Python.Python.3.12` (3.12 exactly: the torch build
   below has no wheels for newer), `ChrisBagwell.SoX`, `DenoLand.Deno`. Then the AI CLIs: Claude
   Code, and Codex CLI (`npm i -g @openai/codex`), which Luisart signs in to once.
   Reopen the terminal so PATH refreshes.
3. **Vault:** follow the vault `CLAUDE.md` → "Set up a new computer" (clone to
   `C:\Users\<user>\Documents\Lartyk`, `git lfs pull`, git config). If the Windows user name is not
   `LART`, tell Luisart and replace the paths in the `luisart-*` skills before processing anything.
4. **Project:** copy `My Drive/lartyk/proyecto-tubeai-video/` (made on the main computer with
   `scripts/exportar_proyecto.ps1`) to `C:\Users\<user>\Documents\Proyectos\tubeai-video\`.
   Keep that path: the skills and the vault point to it. Then `npm ci` inside it.
5. **Python environment:** `py -3.12 -m venv .venv`, then torch with CUDA first
   (`.venv\Scripts\python.exe -m pip install torch==2.5.1 torchaudio==2.5.1 torchvision==0.20.1
   --index-url https://download.pytorch.org/whl/cu121`), then
   `pip install -r .claude/skills/luisart-montar-sistema/references/requirements-venv.txt
   --extra-index-url https://download.pytorch.org/whl/cu121`. `facenet-pytorch` must be installed
   `--no-deps` (it would otherwise replace torch). Check: `.venv\Scripts\python.exe -c "import torch;print(torch.cuda.is_available())"` → `True`.
6. **Model weights** download on first use into `%USERPROFILE%\.cache\huggingface` (Whisper
   large-v3-turbo ≈ 1.6 GB, Qwen3-TTS). Warm the Whisper one with a 5-second test clip through
   `transcribe_parts.py` so the first real job does not stall. Chrome for Testing downloads on the
   first `npm run gpu`.
7. **Render settings for THIS machine:** `core/lib/render-settings.ts` holds concurrency,
   timeout and hardware flags measured on the laptop (i7-13620H, RTX 4050 6 GB, 15.7 GB RAM:
   concurrency 3, timeout 120 s, NVENC required). Run `npm run gpu`; if the new machine differs,
   run `npx remotion benchmark` on one short composition and update that file (more RAM → higher
   concurrency; no NVENC → `hardwareAcceleration = "if-possible"`). Write the new numbers in
   `GUIDELINES.md` → "This machine" as a second entry with the date; do not overwrite the laptop's.
8. **Media:** brand, mascots and sound effects are inside `media/` (copied in step 4). Videos
   and audio of the vault come from Google Drive with `python _scripts\backup\restaurar_media.py`
   then `--copiar` (vault `CLAUDE.md` → "Bringing videos and audio to a computer"). Music is
   Luisart's choice: never copy or pick any on his behalf.
9. **Prove it works (mandatory):** (a) `npm run gpu` all "Hardware accelerated"; (b) `npx tsc
   --noEmit`; (c) a 3-second still and a 3-second render of the reference edit
   `videos/2026-09-27-per-barato/` (if its media is missing, use the smallest pizarra element:
   `npx remotion render core/index.ts <id> out/_setup-test.mp4 --frames=0-89` through
   `core/scripts/render-locked.ts`); (d) `transcribe_parts.py` on a 5 s clip; (e) `codex --version`
   and `yt-dlp --version`; (f) `scripts/verificar_equipo.ps1` again → every line OK. Delete the
   test outputs afterwards.
10. **Record it:** add the machine to `PROJECTS.md` (name, date, what was verified) and one
    `[content]` line to the vault `wiki/Log.md`. Commit and push the vault (never the project's
    heavy folders).

## What not to do

- Never put `.venv`, `node_modules`, renders or model weights in git or in the vault.
- Never make the vault repo public or add a second remote; never commit keys, tokens or logins.
- Never enter passwords for Luisart: he signs in to GitHub, Drive and Codex himself.
- Never pick his music, never clone his voice, never publish anything.
- Do not edit the laptop's measured numbers; add the new machine beside them.

## Report to Luisart (Spanish, plain)

What machine it is, what was installed, what passed the test render (length and time it took),
what still needs him (a login), and the one thing he should know (for example "esta compu no tiene
tarjeta de video: los renders tardarán unas 5 veces más").
