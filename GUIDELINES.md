# Guidelines

Workflow rules for this project. Source of truth for every chat and agent.

Cross-agent guide to the whole process (Codex, sub-agents, any AI agent): [`AGENTS.md`](AGENTS.md).

The full reference these rules come from is the `tubeai-video` skill:
`C:\Users\LART\.claude\plugins\cache\tubeai-skills\tubeai\1.4.0\skills\tubeai-video\SKILL.md`.
Its sections **Workflow**, **Layout**, **Channels**, **Style references**, **Media**, **Voice and
transcripts**, **Editing a recording**, **Inserts**, **Core templates**, **Rendering**,
**Troubleshooting** and **Timeline recipe** apply here as written. Read the sections your task
touches before starting. Where this file differs (machine-specific values below), this file wins.

## The user isn't technical

Claude does all technical work: installs, commands, scripts, config, renders, conversions and
fixes. Never ask the user to run a command, edit a file or read code. Explain the first use of
an unavoidable technical word in a few words. Report outcomes, not internals. The user writes in
Spanish: reply in Spanish.

## This machine

Checked 2026-09-27.

- **CPU:** Intel Core i7-13620H, 10 cores / 16 threads.
- **RAM:** 15.7 GB total, often only ~1.5 GB free (other apps running). Under 16 GB: run one
  heavy job at a time (a render, a voiceover, a transcription).
- **GPU:** NVIDIA GeForce RTX 4050 Laptop GPU, 6 GB VRAM, driver 581.57 (NVENC needs 551.76+).
- **Video encoding:** NVENC, confirmed in a verbose render log (`Encoder: h264_nvenc, hardware
  accelerated: true`). `npm run gpu` reports Compositing, Rasterization, WebGL, Video
  Decode/Encode all "Hardware accelerated" (Chrome for Testing + ANGLE). ProRes 4444 alpha
  overlays encode on the CPU (NVENC can't do ProRes).
- **Render concurrency and timeout:** at the default settings the browser timed out after 30 s
  while opening its tabs (low free RAM). `core/lib/render-settings.ts` sets concurrency 3 and a
  120 s timeout. If a render still times out, retry once with `--concurrency=2`. Benchmark and
  update once more template demos exist.
- **Voice model:** Qwen3-TTS 0.6B on the GPU in bf16 (6 GB VRAM is under the 8 GB the 1.7B
  models need): no tone instructions or voice design.
- **Transcription model:** whisper-large-v3-turbo (Hugging Face `transformers`, fp16 on the GPU) in
  the `.venv`, run through `.claude/skills/luisart-editar-short/scripts/transcribe_parts.py` (`--lang spanish|english|auto`, Spanish by default; `whisper_to_md.py` in the same folder makes a readable `[mm:ss]` Markdown transcript), which
  splits the audio in pauses into parts ≤ 28 s (the pipeline hallucinates at its 30 s chunk
  boundary) and can check a render's words against the cut (`--expect … --cuts …`). Run it under
  the render lock (`scripts/with_lock.ts` in the same skill). CrisperWhisper is installed but not
  used.
- **Laptop:** ask the user to keep it plugged in for renders and voiceovers.
- **Disk:** ~715 GB free on C:.

## Installed and verified (2026-09-27)

- Node.js 24, FFmpeg, yt-dlp, Deno, Python 3.12, SoX (winget).
- Remotion 4.0.529 and every `@remotion/*` extra on the same version, `zod@4.5.4`.
- TypeScript 5, tsx, Playwright + Chromium, `@mozilla/readability`, React/Node types.
- Skills: `remotion-best-practices` in `.claude/skills/`; `tubeai:tubeai-mcp` from the plugin.
  @soyluisart workflow skills (2026-09-27, `.claude/skills/`): `luisart-reglas` (one-page rule
  checklist, points to CHANNEL.md ★), `luisart-editar-short` (raw recording → final vertical,
  split and horizontal videos, fully automatic), `luisart-diseno-sonoro` (SFX, whooshes, music,
  loudness), `luisart-animaciones-pizarra` (new Luisart elements and deliveries),
  `luisart-revision-codex` (Codex review loop before every delivery), `luisart-procesar-material` (the `Finanzas/rawc/` inbox — blogs, papers, books, podcasts, videos; audio and video always through Whisper; notes into `wiki/Knowledge/`, source filed by subject in `Finanzas/`), `luisart-procesar-referencias`
  (the `Creacion de Contenido/rawcc/` inbox — one folder per reference or Web Clipper
  notes — download,
  transcribe, analyse edit + script/diction, sample renders — only when the user asks; notes go to
  `wiki/Content Creation/References/Analyzed Videos/`, sources filed by category in
  `Creacion de Contenido/`; "procesa rawc y rawcc" runs both inboxes), `luisart-guion` (write or review a video script in
  Spanish, complemented with the finance knowledge base), `luisart-montar-sistema` (set up / move the system to another computer, 2026-09-30), `luisart-configurar-estilo` (style profiles) and `luisart-producir-desde-guion` (script + recording → analysis, transcript, format decision, brief).
- **Knowledge vault** (2026-09-28): the Obsidian vault
  `C:\Users\LART\Documents\Lartyk\` (English wiki, manual `CLAUDE.md`
  there; layout and read-routing table in [`AGENTS.md`](AGENTS.md) section 2). Two raw folders,
  named by the user: `Creacion de Contenido/` (channel references) and `Finanzas/`
  (course and book sources). Editing skills read only `wiki/Content Creation/` and never
  `wiki/Knowledge/` or `Finanzas/`; only `luisart-guion` searches `wiki/Knowledge/`
  (read-only). History only: the old `conocimiento/` vault is archived at
  `archive/soyluisart/conocimiento-migrado-2026-09-28/`; the old root `RAW/` inbox is replaced by
  `Creacion de Contenido/`.
  The vault is the private GitHub repo `Luisartt/lartyk` (pull at the start of a vault task, commit and push at the end; video and audio live in Google Drive `My Drive/lartyk/videos/`; details in the vault's `CLAUDE.md` → "Sync between devices").
- Python `.venv` (3.12): PyTorch 2.5.1+cu121 (CUDA works on the RTX 4050), `qwen-tts`,
  `crisperwhisper[transformers]`, `opentimelineio` + FCP7 and FCPX adapters; `facenet-pytorch`
  (installed `--no-deps` to keep torch 2.5.1; MTCNN weights ship in the package) for
  `core/scripts/py/face_track.py` (face box per frame → face-aware captions), `opencv-python-headless`
  and `mediapipe` (mediapipe 1.x has no bundled face model; not used).
- **Design tools** (2026-09-29): skills `taste-skill`, `redesign-skill`, `brutalist-skill`, `brandkit`, `output-skill`, `impeccable` (no hooks), `playwright-cli` (also installed globally) and `img2threejs` in `.claude/skills/`; the rule for using them at design time is the vault page `wiki/Content Creation/Designs/Design Rules and Tools.md` (brand and `luisart-reglas` win over these tools); full clones in `tools/design-repos/`, reference `DESIGN.md` files in the vault `Creacion de Contenido/Design Tools/`.
- npm scripts: `studio`, `render`, `render:alpha`, `still`, `gpu`, `qa`
  (`npm run qa -- <file> [--allow-white]`; `--allow-white` for clips with a deliberate white
  flash).

## Not yet done

- Scripts still to write when first needed: `capture`, `clip`, `voice`, `cut`, `assemble`,
  `timeline` (see the skill's Setup step 8). Transcription has no npm script: use
  `transcribe_parts.py` (above). The render script is plain
  `remotion render` with settings from `remotion.config.ts`.
- Core templates (`XPostCard`, `RedditPostCard`, `ArticleHighlight`, `DocumentCard`,
  `Montage`, `CTA`) still to build.
- Voice and transcription model weights download on first use.
- TubeAI connector not confirmed connected.

## Workflow: main chat plans, sub-agents build

The main chat discusses ideas and drafts scripts with the user (skill `luisart-guion`). Research, editing and
animation happen in sub-agents (`video-researcher`, `video-animator`, `video-editor`, in
`.claude/agents/`). At most two heavy agents at a time; on this machine, never two renders at
once.

## Troubleshooting (this machine)

- **FFmpeg `drawtext` crashes** ("Fontconfig error: Cannot load default config file", then a
  segmentation fault): the winget FFmpeg build has no fontconfig setup. Pass the font
  explicitly and it works (verified for the style-ref sheets):
  `drawtext=fontfile='C\:/Windows/Fonts/arial.ttf':text='%{pts\:hms}':...`.
- **Lossless audio for a master:** `--codec=h264-mkv` with `--audio-codec=pcm-16` fails here
  ("does not support hardware acceleration on win32" with NVENC required). Render the video as
  usual (mp4) and the audio as a second locked render with `--codec=wav`, then master the wav and
  mux it onto the video with FFmpeg (`-c:v copy`) — one AAC encode only.
- **Checking frames without rendering the whole video:** `npx tsx core/scripts/frames-locked.ts
  <outDir> <compositionId> <frame> [<frame>…]` renders several stills with one bundle under the
  render lock (`<id>@<frame>.png`).
- **Whisper word check on a >30 s render:** the `.firecrawl/whisper_words.py` pipeline can
  hallucinate at its 30 s chunk boundary ("Gracias…", repeated lines). Split the audio in a pause
  and transcribe the halves; set `HF_HUB_OFFLINE=1` so it doesn't stall on Hugging Face requests.
  `transcribe_parts.py` (luisart-editar-short skill) does both automatically.
- **Face box per frame (captions never over the face):** `.venv/Scripts/python.exe -W ignore
  core/scripts/py/face_track.py <aroll.mp4> <face-track.json>` — GPU, hold the render lock while it
  runs (~1 min for 44 s of 1080×1920). OpenCV 5's pip wheel no longer ships Haar cascades.
- **Re-rendering many library clips:** `npx tsx core/scripts/render-batch-locked.ts <outDir> <id…>`
  bundles once and renders every ID under the render lock (green-screen clips as PNG + yuv444p).
  Then `npm run qa -- <files> --allow-white` and rebuild the overview sheets with
  `.venv/Scripts/python.exe core/scripts/py/index_sheet.py <renderDir> --refresh <id…>`.
