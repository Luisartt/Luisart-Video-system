# AGENTS.md — tubeai-video (@soyluisart)

> **Resumen para Luisart (español).** Este archivo es la guía para cualquier asistente de IA que
> trabaje en este proyecto (Claude, sus subagentes, Codex u otros). Explica, de principio a fin, cómo
> se convierte tu grabación en videos terminados: te pregunto solo el estilo (Luisart completa,
> Luisart dividida o Kallaway) y después todo es automático — transcribir, cortar errores, animar,
> poner efectos de sonido y subtítulos, renderizar, revisar con Codex y entregarte versión vertical y
> horizontal. También resume las reglas del canal, los estilos, los límites de tu laptop y lo que
> ningún asistente debe hacer nunca (elegir tu música, escribir "LUISART" en mayúsculas, poner
> cuadros detrás del texto, clonar tu voz sin permiso, publicar algo). Tú no tienes que leerlo ni
> tocarlo: se actualiza solo cuando nos das nuevas indicaciones.

This is the cross-agent guide for the whole project. It summarises and points; it does not replace
the sources of truth. **Precedence when documents disagree:**
`channels/soyluisart/CHANNEL.md` ★ > `.claude/skills/luisart-reglas/SKILL.md` > the other
`luisart-*` skills and style READMEs > `GUIDELINES.md` (machine and workflow) > this file.
Re-read CHANNEL.md ★ at the start of every job: other chats change it.

---

## 1. Purpose and roles

The project turns raw recordings of Luisart (channel **@soyluisart**: AI, finance and business in
Spanish, based in Mexico) into finished Shorts/Reels/TikToks and YouTube videos, built in Remotion
(`remotion@4.0.529`), fully automatically.

| Who | Role | Can write? |
|---|---|---|
| **Luisart** (the user) | Owner. Not technical, writes in Spanish. Picks the style, reviews drafts, supplies music and recordings, makes content decisions. | Only `media/*/user-provided/`, `recordings/` and, in the vault, `Creacion de Contenido/` (his drops, until moved to `_Processed/`) and `Finanzas/` are his. |
| **Main chat** (Claude) | Talks to the user, plans ideas and scripts (skill `luisart-guion`), asks the one style question, dispatches sub-agents, runs the Codex review loop, reports in Spanish. | Yes |
| **`video-researcher`** (`.claude/agents/video-researcher.md`) | Finds and captures media, data and style references into `media/<slug>/automated-research/`, with `SOURCES.md`. | Only `automated-research/` |
| **`video-editor`** (`.claude/agents/video-editor.md`) | Front half of an edit: ingest, transcript, script comparison, cuts, voice, matte, face track (editing skill steps 1–6). Flags number errors, never changes what was said. | Yes |
| **`video-animator`** (`.claude/agents/video-animator.md`) | Back half: beats, scenes, SFX, captions, compositions, locked renders, QA (steps 7–14); new library elements. | Yes |
| **Codex** (OpenAI Codex CLI 0.157, `codex exec -s read-only`) | Independent reviewer of every deliverable against the channel rules. Read-only; Claude verifies every finding. | **Never** |
| **ChatGPT via the Codex CLI** | Generates **images and illustrations only** (Kallaway B-roll). No text, numbers, logos or faces inside them; every text, icon, diagram and animation is built in Remotion. | Images into `automated-research/<v>/kallaway-gen/` |

At most two heavy agents at a time, and never two renders (or other GPU/RAM-heavy jobs) at once.
Reports to the user: Spanish, plain words, outcomes not internals; explain any unavoidable
technical word the first time. Never ask him to run a command, edit a file or read code.

---

## 2. Repository map

| Path | What lives there |
|---|---|
| `AGENTS.md` | This guide. |
| `CLAUDE.md` | Imports `GUIDELINES.md` and `PROJECTS.md` for Claude sessions. |
| `GUIDELINES.md` | Workflow rules, machine specs, installed tools, troubleshooting. Points to the `tubeai-video` plugin skill for the generic workflow. |
| `PROJECTS.md` | Status of every channel and video (update on every status change). |
| `README.md` | Manual commands for doing things by hand. |
| `package.json`, `remotion.config.ts`, `core/lib/render-settings.ts` | npm scripts; render settings (publicDir `media`, NVENC required, concurrency 3, 120 s timeout). |
| `core/` | `index.ts` / `Root.tsx` (Remotion entry), `scripts/` (locked render helpers, QA, fal), `scripts/py/` (`face_track.py`, `matte.py`, `index_sheet.py`), `templates/` and `components/` (empty: core templates not built yet). |
| `channels/soyluisart/` | `CHANNEL.md` (brand guide, ★ = rules), `theme.ts`, `index.tsx` (registers every library and video), `styles/` (pizarra, kallaway, terminal, documental, `shared/`), `videos/<yyyy-mm-dd-slug>/`, plus the rejected first pass (`animations/`, `prototypes/`, `BrandBoard.tsx`: don't reuse). |
| `channels/soyluisart/styles/shared/` | `formats.tsx` (`FORMATS`, `ZONES`, `useFormat()`, `SafeZoneGuide`), `captionSpot.ts` (face-aware placement), `text.ts` (`upperKeepName`, `formatMx`), `sfx.tsx`, `GreenScreen.tsx`. |
| `channels/soyluisart/videos/2026-09-27-per-barato/` | **The reference edit to copy**: `BRIEF.md`, `CODEX-REVIEW.md`, `CODEX-REVIEW-kallaway.md`, `cut/` (`cuts.json`, `build-voice.ts`, `versions/`), `scenes/` (`timing.ts`, `figures.ts`, `music.ts`, `cues.ts`, `Sound.tsx`, `Captions.tsx`, `parts.tsx`, `pizarra/*`, `kallaway/*`), `review/` (Codex prompts and answers). |
| `media/soyluisart/user-provided/` | **The user's files (e.g. `musica/`). Never write, move or delete here.** |
| `media/soyluisart/automated-research/` | Everything agents find or generate: `<v>/` (working copy, transcript, voice, matte, face track, `kallaway-gen/`), `style-refs/` (analyses: `santiago/`, `nick/`, `kallaway/ANALISIS.md`, `safe-zones/`), `sfx/`, `fal/`, `codex/`, `logos/`. Log sources in `SOURCES.md`. |
| `media/soyluisart/audio/` | SFX library `efectos/` (207 files, `efectos/sfx-index.json`), `GUIA-EFECTOS.md`, `GUIA-MUSICA.md`, `LICENCIAS.md`, `fondos*/` (not used for his videos). |
| `recordings/soyluisart/` | Raw recordings (`<v>-raw.<ext>`). Never modified; kept out of `media/` so render bundles stay small. |
| `out/soyluisart/videos/<v>/` | **Final deliverables** (vertical + horizontal MP4s, earlier drafts kept as `-vN`), `review/` contact sheets, `_words-*.json` checks. |
| `out/soyluisart/pizarra/` | Luisart library clips (`SLA-piz-*`), `_index-vertical.png` / `_index-horizontal.png`, `_stills/`, `_retired/`. |
| `out/soyluisart/kallaway/` | Kallaway library clips (`SLA-kal-*`), index sheets. |
| `out/soyluisart/green/<style>/`, `out/soyluisart/green-vertical/<style>/` | Terminal and Documental green-screen (`#00FF00`) library clips, horizontal / vertical (`-v`). |
| `out/soyluisart/animations/`, `brand/`, `prototypes/` | First pass and prototypes (rejected, kept for reference). |
| `out/.render-lock` | The exclusive lock file held by every heavy job. Must be absent when nothing runs. |
| `archive/soyluisart/` | Originals kept out of `media/`: `audio-originales/`, `style-refs/` (reference videos per creator), `conocimiento-migrado-2026-09-28/` (the old in-repo vault, history only). |
| `.claude/agents/`, `.claude/skills/` | Sub-agent definitions; skills `luisart-reglas`, `luisart-editar-short`, `luisart-diseno-sonoro`, `luisart-animaciones-pizarra`, `luisart-revision-codex`, `luisart-procesar-material`, `luisart-procesar-referencias`, `luisart-guion`, `luisart-montar-sistema` (set up or move the system to another computer), `luisart-configurar-estilo` (define or tune an editing style profile), `luisart-producir-desde-guion` (script + recording → analysis, transcript, vertical/horizontal decision, brief; then `luisart-editar-short`), `remotion-best-practices`. |
| `.venv/` | Python 3.12 + PyTorch CUDA (Whisper, MTCNN, Robust Video Matting, OpenTimelineIO). Call `.venv/Scripts/python.exe` directly. |
| `.firecrawl/` | Scraped pages and the original one-shot `whisper_words.py` (only for files well under 30 s). |
| `.env` | API keys (`FAL_KEY`, `FIRECRAWL_API_KEY`). Never print, echo, log or paste the values. |
| `fal-spend.csv` | Log of past fal.ai spend. |

**The knowledge vault** (moved out of the repo on 2026-09-28) is the Obsidian vault
`C:\Users\LART\Documents\Lartyk\` (its own manual: `CLAUDE.md` /
`AGENTS.md` at the vault root; read it before writing there). The wiki is in **English** (old
Spanish titles are aliases); chat with Luisart and his videos stay in Spanish. Skills always use
absolute vault paths. Layout:
- `Creacion de Contenido/` — the **content-creation database** (folder names are his own; keep
  them exactly): `rawcc/` is the **inbox** (Web Clipper notes with either template or the plain
  default, one folder per reference with videos / `links.txt` / notes, loose files, + template
  JSON), `Project Snapshots/` (frozen copies of repo docs), and category folders where processed
  references are filed (`Creators/<creator>/`, `Editing Styles/`, `Scripts and Diction/`,
  `Sound and Music/`, `Animation and Motion/`, `Other/`; `_Processed/` only as fallback). Agents
  read; the only change is filing a processed item, never deleting.
- `Finanzas/` — the **knowledge database**: his course / book / class sources, plus `rawc/`,
  the **inbox** for blogs, papers, books, podcasts, lectures, videos and audio. Read-only, never
  read by the editing skills; processed clips are filed by subject inside it (or
  `Finanzas/Clips/<category>/`).
- `wiki/Home.md`, `wiki/Log.md` (entries prefixed `[content]` or `[knowledge]`).
- `wiki/Content Creation/` — everything needed to edit a video: `soyluisart Channel Home.md`,
  `Editing System/{Rules, Sound, Process and Tools}/`, `Styles/{Luisart, Luisart Split, Kallaway,
  Terminal and Documentary}/` (+ `Styles Overview.md`; each style's article and gallery),
  `Designs/{Luisart, Luisart Split, Kallaway, Terminal, Documentary}/*.png`,
  `References/Creators/`, `References/Analyzed Videos/`, `Scripts/` (script and diction playbook,
  templates, finished scripts), `Instagram/`, `Videos/<YYYY-MM-DD slug>/` (brief summary,
  versions, pending decisions, `Sources Used.md`).
- `wiki/Knowledge/` — the finance / business / personal-development knowledge base
  (`Concepts/<15 categories>/`, `Summaries/…`, `Entities/`, `Maps/`, `Diagrams/`).

**Read-routing (the point of the split):**

| Task | Read | Never read / write |
|---|---|---|
| **Edit a video** (`luisart-editar-short`, `luisart-animaciones-pizarra`, `luisart-diseno-sonoro`, `luisart-reglas`, `luisart-revision-codex`) | `wiki/Content Creation/`: Editing System, the chosen style's folder under Styles, its Designs, that style's creators, `Videos/<that video>/`. After delivery, update `Videos/<YYYY-MM-DD slug>/` (English). | `wiki/Knowledge/` and `Finanzas/` |
| **Write or review a script on topic X** (`luisart-guion`) | `wiki/Content Creation/Scripts/` + the diction analyses in References; then search `wiki/Knowledge/` (Home → Maps → Concepts/Summaries, titles and aliases incl. Spanish) for X; cite the pages used in `Videos/<video>/Sources Used.md`. Script in Spanish; "dato de ejemplo · MXN" unless sourced. | Knowledge is read-only from content tasks; `Finanzas/` |
| **Process references** (`luisart-procesar-referencias`, only when he asks: "procesa rawcc", "procesa rawc y rawcc", "procesa las referencias") | `Creacion de Contenido/` → English note in `References/Analyzed Videos/`, creator articles in `References/Creators/`, script/diction findings in `Scripts/`; move the processed folder to `_Processed/<slug>/`. Analysis frames stay in the repo (`media/soyluisart/automated-research/style-refs/`, `archive/`); sample renders in `out/soyluisart/referencias/<slug>/`. | `wiki/Knowledge/`, `Finanzas/` |
| **Process knowledge clips** (`luisart-procesar-material`, only when he asks: "procesa rawc", "procesa rawc y rawcc", "procesa el material") | `Finanzas/rawc/` (blogs, papers, books, podcasts, videos, audio; audio and video always via Whisper → `_Transcripts/`) → summary + concept pages in `wiki/Knowledge/`; clip moves to `_Processed/`. Notes written with the AI CLI available (Claude Code, else Codex or Gemini CLI). | Processing without his request; summarising audio/video without a transcript. |

Intake rule (vault `CLAUDE.md` → "Intake rule: the two inboxes, `rawc` and `rawcc`"): one request
("procesa rawc y rawcc") analyses both inboxes, writes the notes in the wiki category that fits
best, then files each source in its database by category. Audio and video are always transcribed
with Whisper first. One heavy GPU job at a time.
| **Knowledge ingest / query / lint** (vault manual, not a repo skill) | `Finanzas/` → `wiki/Knowledge/` | `wiki/Content Creation/` (except linking a concept used by a script) |

The vault summarises; in this repo, CHANNEL.md ★ and the skills stay the source of truth (if a
vault page disagrees, they win and the page gets fixed). **Design zone:** after new library renders
or a new style, copy the new index sheets / stills (PNG, never videos) into
`wiki/Content Creation/Designs/<style>/` and refresh that style's gallery page under
`Styles/<style>/` (skill `luisart-animaciones-pizarra`). Never copy videos into the vault — link
them by path. Never process references on your own initiative.

---

## 3. The full pipeline (raw recording → delivered videos)

Owner skill: **`luisart-editar-short`** (`.claude/skills/luisart-editar-short/SKILL.md`); every
command in detail: `.claude/skills/luisart-editar-short/references/pipeline.md`. All commands run
from the project root. Shorthands:
`<v>` = `yyyy-mm-dd-slug` · `<M>` = `media/soyluisart/automated-research/<v>` ·
`<V>` = `channels/soyluisart/videos/<v>` · `<O>` = `out/soyluisart/videos/<v>` ·
`LOCK` = `npx tsx .claude/skills/luisart-editar-short/scripts/with_lock.ts --`

| # | Step | Command / file | Owner skill · agent |
|---|---|---|---|
| 0 | **Style question — the ONLY question.** "¿En qué estilo lo edito? 1. Luisart completa (default) · 2. Luisart en pantalla dividida · 3. Kallaway". No answer → 1. Skip if the main chat already passed the style. | — | `luisart-editar-short` step 0 · main chat |
| 1 | **Ingest**: raw to `recordings/soyluisart/<v>-raw.<ext>`; probe; working copy with rotation applied, constant 30 fps, 48 kHz. | `ffprobe … stream_side_data=rotation …` then `LOCK ffmpeg -y -i recordings/soyluisart/<v>-raw.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30,format=yuv420p" -c:v libx264 -crf 16 -preset slow -af "aresample=async=1" -c:a aac -b:a 192k -ar 48000 <M>/aroll-1080x1920.mp4` | pipeline.md §1 · `video-editor` |
| 2 | **Transcribe** (whisper-large-v3-turbo, split in pauses ≤ 28 s), then fix names against the glossary as display fixes (`fixes()` in `scenes/Captions.tsx`). | `LOCK .venv/Scripts/python.exe -W ignore .claude/skills/luisart-editar-short/scripts/transcribe_parts.py <M>/aroll-1080x1920.mp4 <M>/transcript-words.json` | §2 · `video-editor` |
| 3 | **Script comparison**: diff against his script word by word; differences go to BRIEF.md → "Script vs what was said". | manual diff | §3 · `video-editor` |
| 3b | **Flag number/fact errors — never change what he said.** Consistent figures live in ONE `<V>/scenes/figures.ts` (results computed); the screen shows the consistent version; the report gives options (re-record the sentence, or patch a word with a clone of his voice **only with his explicit OK**). Example: company B — he said "vale 10 y gana 2, múltiplo 50" (10 ÷ 2 = 5); the screen shows the script's $100 / $2 / 50; still his decision. | `<V>/scenes/figures.ts`, BRIEF.md, report | §3 · `video-editor` |
| 4 | **Cut** clear mistakes only (false starts, flubs, retakes) in real silences ≥ 0.2 s; verify every join by re-transcribing ≈ 2 s around it. | `<V>/cut/cuts.json` (+ `cut/versions/vN-cuts.json` per delivered version) | §3 · `video-editor` |
| 5 | **Voice**: keep segments sample-exact, 15 ms fades, master to −15 LUFS / −1.5 dBTP. | copy `channels/soyluisart/videos/2026-09-27-per-barato/cut/build-voice.ts` to `<V>/cut/`, then `LOCK npx tsx <V>/cut/build-voice.ts` → `<M>/voice-cut-master.wav` | §4 · `video-editor` |
| 6a | **Matte** (Robust Video Matting) → VP9-alpha WebM; check `alpha_mode=1`; delete the `.mov`. | `LOCK .venv/Scripts/python.exe core/scripts/py/matte.py <M>/aroll-1080x1920.mp4 <M>/aroll-person-alpha.mov` then `LOCK ffmpeg -y -i <M>/aroll-person-alpha.mov -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 24 -row-mt 1 -auto-alt-ref 0 -an <M>/aroll-person-alpha.webm` | §5 · `video-editor` |
| 6b | **Face track** (MTCNN) → per-frame face box for caption placement. | `LOCK .venv/Scripts/python.exe -W ignore core/scripts/py/face_track.py <M>/aroll-1080x1920.mp4 <M>/face-track.json` | §6 · `video-editor` |
| 7 | **Folder from the template**: copy the per-barato pipeline, register the video in `channels/soyluisart/index.tsx`, write `BRIEF.md` (header `Format: vertical + horizontal`, style, recording, transcript). | table in pipeline.md §7; `npx tsc --noEmit` clean | §7 · `video-animator` |
| 8 | **Beat plan**: every cut and landing from a transcript word (`at("word", after)` in `timing.ts`), never a typed time. Full board: face for hook/turns/CTA, board ≈ 50–55 %; split: split/board/face ≈ 43/31/25 %; key vs plain face shots (`key: true` in `groups.ts`). Kallaway: `scenes/kallaway/layout.ts`. | `<V>/scenes/pizarra/layout.ts`, `groups.ts`, BRIEF.md beat table | §8 · `video-animator` |
| 9 | **Scenes**: Luisart boards from library elements and primitives (`Boards.tsx`), marker arrows, constant micro-motion, figures from `figures.ts` with "dato de ejemplo · MXN". Kallaway: ChatGPT images via `codex exec` (one call at a time; prompts in `media/soyluisart/automated-research/style-refs/kallaway/ANALISIS.md` §S.8; example script `media/soyluisart/automated-research/2026-09-27-per-barato/kallaway-gen/gen.sh`) + the `styles/kallaway/` elements. | `Boards.tsx`, `extras.tsx` / `KalShort.tsx` | `luisart-animaciones-pizarra` · `video-animator` |
| 10 | **SFX cues**: one cue per graphic event, hit on the landing frame (`cue()` reads `preRollFrames30` from `sfx-index.json`), whoosh only at frame 0 and real transitions (Kallaway: zero), music only if `USER_MUSIC` is set. Cue table + licences into BRIEF.md. | `<V>/scenes/pizarra/pizCues.ts` / `scenes/kallaway/kalCues.ts`, `scenes/music.ts` | `luisart-diseno-sonoro` · `video-animator` |
| 11 | **Captions**: gate with every graphic window (`makeCaptionGate`, `captionRule.ts`), place face-aware (`captionPlace.ts` → `styles/shared/captionSpot.ts`). | `npx tsx <V>/scenes/pizarra/checkCaptions.ts` (Kallaway: `scenes/kallaway/checkCaptions.ts`) → 0 over graphics, 0 on the face, caption frames > 0 | §9 · `video-animator` |
| 12 | **Compositions + stills**: `PizShort.tsx`, `SplitShort.tsx`, `HorizontalShort.tsx` (or `KalShort.tsx`); zone stills before any full render. | `npx tsx core/scripts/frames-locked.ts <O>/stills/zones SLA-<v>-short-pizarra 0 120 300 '--props={"safeGuide":true}'` (add `"captionTest":true` for placement stills only) | §10 · `video-animator` |
| 13 | **Locked renders**, one at a time: video (AAC) + a separate WAV render; measure; master to −14 LUFS / ≤ −1 dBTP; mux with `-c:v copy`. Timeout → retry once with `--concurrency=2`. | `npm run render:locked -- render SLA-<v>-short-pizarra <O>/_premaster-pizarra.mp4 --audio-codec=aac --audio-bitrate=320k` · `npm run render:locked -- render SLA-<v>-short-pizarra <O>/_mix-pizarra.wav --codec=wav` · `ffmpeg … -af ebur128=peak=true …` · mux with `volume=<−14 − measured>dB,alimiter=limit=0.80:attack=3:release=60:level=false` | §11 · `video-animator` |
| 14 | **Checks** on every final file: flash QA, loudness, Whisper word check against the cut, caption checks. Any failure → fix in code → re-render that file. | `npm run qa -- <O>/SLA-<v>-short-*.mp4 --allow-white` · `ffmpeg -hide_banner -nostats -i <file> -af ebur128=peak=true -f null - 2>&1 \| tail -12` · `LOCK .venv/Scripts/python.exe -W ignore .claude/skills/luisart-editar-short/scripts/transcribe_parts.py <O>/<file>.mp4 <O>/_words-<x>.json --expect <M>/transcript-words.json --cuts <V>/cut/cuts.json` · `checkCaptions.ts` | §12 · `video-animator` |
| 15 | **Codex review loop** on every deliverable (section 7 below). | `luisart-revision-codex` | main chat |
| 16 | **Deliver**: finals in `<O>/` (never overwrite: next round `…-v2.mp4`); delete `_premaster-*`, `_mix-*`, matte `.mov`; update `BRIEF.md` (renders, cue table, checks, open questions) and `PROJECTS.md` (row, channel line, counts, date); update the vault's `wiki/Content Creation/Videos/<YYYY-MM-DD slug>/` (English: summary, versions, pending decisions, `Sources Used.md` created or extended) and the style's Designs/gallery; Spanish report (template in the skill: files, length, cuts, "Necesito que decidas", "Escucha estos momentos", recording tips); then carry the new decisions into the vault (section 9). | — | `luisart-editar-short` step 16 · main chat |

**Deliverables.** Luisart (options 1 and 2): `SLA-<v>-short-pizarra` (vertical full board),
`SLA-<v>-short-split` (vertical split), `SLA-<v>-short-pizarra-h` (horizontal 1920×1080); the
chosen one is built first. Kallaway (option 3): `SLA-<v>-short-kallaway` + a horizontal edit
(fewer only if he asks; the first draft was vertical only). All 30 fps, sound baked in.

**Done means:** QA PASS, −14 ± 0.5 LUFS, true peak ≤ −1 dBTP, every kept word heard in order,
0 captions over graphics or the face, Codex review clean (or leftovers listed as his decisions),
figures consistent with `figures.ts`, BRIEF.md and PROJECTS.md updated, no `out/.render-lock`
left. Never claim a check you didn't run.

---

## 4. Channel rules — compact checklist

**Sources of truth:** `channels/soyluisart/CHANNEL.md` section "★ Graphics standard" and skill
`luisart-reglas` (letters (a)–(p), which Codex reviews cite). New rules go into CHANNEL.md ★ first.

| Rule | In short |
|---|---|
| (a) | Captions only on plain talking-head stretches: none while any board, title, figure, arrow, icon, behind-head word/kicker or CTA is on screen; never in a split; never a run under 12 frames. |
| (b)/(l) | Captions never on forehead, eyes or mouth. Medium shot: neck/chest; close selfie: above the head; else nearest clear spot, or reframe. Inside the safe area. |
| (c) | Vertical zones: graphics x 120–920, y 250–970; captions x 120–900, y 1000–1300; nothing important below y 1436 or in the right 160 px of the lower half. Horizontal: graphics y 90–790, captions y 820–970, margins 140/90/110. |
| (d) | **No plates**: no box, chip, pill, band or highlighter band behind text. Outline / soft shadow only. Text inside a drawn object (price tag, bubble, sticky note, window, pixel button) is fine. |
| (e) | SFX on every graphic event; **whooshes only at the start (peak on frame 0) and on real transitions**. |
| (f) | "Luisart": one word, only the L capitalised, never uppercased (`upperKeepName()`). |
| (g) | No face picture-in-picture on full-board scenes. |
| (h) | **No music** unless he drops a file in `media/soyluisart/user-provided/musica/` and names it (`USER_MUSIC`). |
| (i) | Constant motion (push-in, parallax, breathing, floating) and plenty of marker arrows. |
| (j) | Example figures labelled "dato de ejemplo"; money in MXN or US$ for global prices; Mexican number format; never euros; real figures checked against a primary source. |
| (k) | Alternate face shots: ≈ 4–5 key shots (big behind-head word or hook title, no captions); every other face shot plain with captions. 0 caption frames = rule not applied. |
| (m) | Deliverables: vertical + horizontal (Luisart: full board + split + horizontal). |
| (n) | Fully automatic after the style question, but never silently change what he said. |
| (o) | Every deliverable passes the Codex review. |
| (p) | One heavy job at a time, through the lock. |
| Sound | Voice ≈ −15/−16 LUFS, SFX −12 to −18 dB under it, final ≈ −14 LUFS / ≤ −1 dBTP. One accent per beat. |

**Per-style exceptions (Luisart vs Kallaway)** — from CHANNEL.md ★ "Kallaway", points 1–6:

| Topic | Luisart (full board and split) | Kallaway |
|---|---|---|
| Captions (a) | Only on plain face shots; none in splits or over graphics | Continuous seam captions (~2 words, Inter 700 ≈ 46 px) under the split line even over B-roll; none when the top repeats the speech (counter, kinetic words, headline) |
| Face shots (k) | Key (behind-head word / hook title, no captions) alternating with plain (captions) | Every face shot: ONE giant word (≈ 165 px) per spoken word, face-aware via `captionSpot()` |
| Motion (i) | Push-in, 100/115 % punches, parallax, marker arrows | Only a slow push on B-roll images; no arrows, punches, face push or transitions |
| Sound (e) | Specific SFX per event; whoosh at start + real transitions | Click on each section-opening cut + ≤ 1 subtle sound per image/counter event; **zero whooshes** |
| Colour | Blue `#2F6BFF`, red `#E5484D` only for "bad" | Colour from the B-roll; key words `#7FA6FF` (replaces his gold) |
| Graphics | Board elements, Bit, pixel icons | Counter, stacked image cards, kinetic type, typed white screen, hook headline |
| B-roll | None (board is built in Remotion) | ChatGPT stills via Codex CLI (no text/faces/logos in them) |
| Shared, unchanged | No plates (d; also no darkening band on images), "Luisart" (f), no PiP (g), no music (h), MXN + "dato de ejemplo" (j), zones | same |

---

## 5. Style catalogue

| Style | Status | Library | Elements | Use it when |
|---|---|---|---|---|
| **Luisart** full board | **Main style and edit system** (2026-09-27) | `channels/soyluisart/styles/pizarra/` (`README.md` = catalogue); clips `out/soyluisart/pizarra/`; IDs `SLA-piz-<element>-<variant>[-v]` | 30: board-title, board-compare, waffle, stepper, retro-window, logo-row, clippings, polaroids, stick-dialogue, cta-follow, behind-head-word, captions, speaker-card, split-50, punch-in, annotate, sticky-notes, counter, hand-chart, calculator, mind-map, checklist, myth-fact, timeline, quote-card, price-tag, money-stack, bit-react, screenshot, highlighter (+ primitives, pixel icons, the robot Bit) | Default for every new video. |
| **Luisart split** | Approved layout of Luisart (Nick Saraev grammar) | same library; reference `videos/2026-09-27-per-barato/scenes/pizarra/SplitShort.tsx` | Graphic in the top band, face card below with the head breaking out (matte), alternating with full board and face close-up | Style option 2; also always delivered next to the full board. |
| **Kallaway** | Approved style option (2026-09-28) | `channels/soyluisart/styles/kallaway/` (`README.md`); clips `out/soyluisart/kallaway/`; IDs `SLA-kal-*` | 8: layout (split/face/full/card), captions (seam, face-word), hook-title, image, counter, stack, white-type, kinetic | Style option 3. Best with a near-black set and a medium shot; on a bright selfie the pack builds a dark set from the matte. |
| **Terminal** | Secondary (only on request) | `channels/soyluisart/styles/terminal/`; `out/soyluisart/green[-vertical]/terminal/`; `SLA-term-*` | Beams, Callout, Chart, Checklist, Compare, Keyword, LowerThird, Ticker, Title, Transition | AI tools, automation, market data — when he asks. |
| **Documental** | Secondary (only on request) | `channels/soyluisart/styles/documental/`; `out/soyluisart/green[-vertical]/documental/`; `SLA-doc-*` | BigNumber, Captions, Emphasis, LogoNetwork, LowerThird, PartTitle, Quote, Stamp, Timeline, Transition | Company stories, history, big-picture finance — when he asks. |
| First pass (`animations/`, `prototypes/a`) | **Rejected** | — | — | Never reuse. |

Library workflow (new element, variants, green-screen, batch render, index sheets):
skill `luisart-animaciones-pizarra`. Reuse first, then derive (variant/wrapper), then create;
anything reused a second time moves into the library with its README row.

---

## 6. Machine constraints (Windows 11 laptop)

| Constraint | What to do |
|---|---|
| **Low RAM** (15.7 GB, often ~1.5 GB free) | One heavy job at a time: render, still batch, Whisper, matte, face track, big FFmpeg encode. Never two renders at once; at most two heavy agents. |
| **Render lock** `out/.render-lock` | Renders only via `npm run render:locked`, `core/scripts/frames-locked.ts`, `stills-locked.ts`, `render-batch-locked.ts`; every other heavy job via `LOCK` (`with_lock.ts`). Stale after 30 min. Never plain `npm run render` from an agent. |
| **GPU**: RTX 4050 6 GB, NVENC | `hardwareAcceleration: "required"` (h264_nvenc). ProRes 4444 alpha (`npm run render:alpha`) encodes on the CPU. `h264-mkv` + PCM fails → separate `--codec=wav` render + FFmpeg mux. Voice model only Qwen3-TTS 0.6B. |
| Render timeout | Concurrency 3, 120 s; if it still times out, retry once with `--concurrency=2`. |
| **FFmpeg `drawtext`** | Crashes without fontconfig: always pass `fontfile='C\:/Windows/Fonts/arial.ttf'`. |
| **npm / npx on Windows** | They are `.cmd` shims: from Node, spawn `npx.cmd` / `npm.cmd` with `shell: true` (as `render-locked.ts` and `with_lock.ts` do). |
| **Git Bash** | PATH includes `…/WinGet/Links` (ffmpeg), the WinGet SoX folder and `…/Programs/OpenAI/Codex/bin` (codex); if a tool isn't found, call it by that path. Call Python as `.venv/Scripts/python.exe` (no activate). Quote JSON props in single quotes: `'--props={"safeGuide":true}'`. Agent shells reset the working directory: use project-root-relative commands from the root or absolute paths. |
| **Whisper** | Hallucinates at its 30 s chunk boundary → `transcribe_parts.py` (splits in pauses, sets `HF_HUB_OFFLINE=1`; `--lang spanish\|english\|auto`; `whisper_to_md.py` makes a readable `[mm:ss]` transcript). Audio/video from clips ALWAYS goes through it (skill `luisart-procesar-material` §2). |
| **`.env`** | Holds `FAL_KEY` and `FIRECRAWL_API_KEY`. Never print, cat, echo, log or paste their values, and never put them in prompts, URLs or commits. |
| **fal.ai** | Out of credit (exhausted). Don't call `npm run fal`; images come from ChatGPT via the Codex CLI. |
| **Laptop** | Ask Luisart to keep it plugged in for renders and voiceovers. |

---

## 7. Review protocol for agents

Owner skill: **`luisart-revision-codex`**. Model reports:
`channels/soyluisart/videos/2026-09-27-per-barato/CODEX-REVIEW.md` and `CODEX-REVIEW-kallaway.md`.

1. **Caption-change frames:** `npx tsx .claude/skills/luisart-revision-codex/scripts/caption_changes.ts <V>/scenes/pizarra/PizShort.tsx PIZ_CAPTION_GATE <total frames>` (`SPLIT_CAPTION_GATE` in `SplitShort.tsx`; Kallaway: `scenes/kallaway/captionChanges.ts`).
2. **Contact sheets** every 0.5 s + 2 frames after each caption change, zone lines drawn: `.venv/Scripts/python.exe .claude/skills/luisart-revision-codex/scripts/review_frames.py <O>/<file>.mp4 <O>/review/<target> --every 0.5 --extra <changes>`. Look at them yourself first.
3. **Prompt:** fill `.claude/skills/luisart-revision-codex/references/prompt-head.md` into `<V>/review/head-<target>.md`, then paste rules and code with line numbers: `.venv/Scripts/python.exe .claude/skills/luisart-revision-codex/scripts/make_prompt.py <V>/review/prompt-<target>.txt --head <V>/review/head-<target>.md --frames <O>/review/<target>/frames.json -- <files…>` (the Windows read-only sandbox cannot open files or run processes). Keep each prompt under ~150k characters.
4. **Run Codex**, one target per call, one call at a time: `codex exec -s read-only --skip-git-repo-check --ephemeral -C "$PWD" -o <V>/review/codex-<target>-r<N>.md -i <sheet…> < <V>/review/prompt-<target>.txt`. **Always `-s read-only`** (his config defaults to full access).
5. **Verify every finding** before acting: visual → open the cited tile, then the full-resolution frame (`ffmpeg -ss <s> -i <file> -frames:v 1 check.png` or `frames-locked.ts` with `safeGuide`); code → read the cited lines in the *current* file (line numbers go stale). Classify each as **confirmed**, **false positive** (one line why), **already covered**, or **user decision**. Add what Codex missed.
6. **Write `<V>/CODEX-REVIEW.md`**: reviewer and calls, targets, rules, method notes, `## High / Medium / Low` (`**H1 — title (rule).**` Where / Cause / Fix / Status), `## Checked and compliant`, `## Discarded (false positives)`, later `## Round N`.
7. **Fix in code** (never hand-edit renders), re-run `npx tsc --noEmit`, `checkCaptions.ts`, stills, re-render through the lock, QA + loudness + word check.
8. **Re-review** ("Round N: verify fixes, look for regressions"); stop after 3 rounds and report what remains.
9. Tell Luisart the outcome in Spanish ("corregí N cosas…; quedan para ti: …"); never paste Codex's English.

**What every reviewer checks** (frames and code): the rules table in section 4 (with the style's
exceptions), plus: voice = screen (figures and words), nothing cropped, text readable on a phone,
single-frame glitches, captions under 12 frames, whoosh count = 1 + real transitions (Kallaway: 0),
every graphic event has a cue within 0–2 frames, music only via `USER_MUSIC`, no hard-coded times,
all deliverable compositions registered, stale or contradictory statements in the docs.

---

## 8. Hard don'ts

- **Never choose music.** No bed unless he names a file in `media/soyluisart/user-provided/musica/`; never `audio/fondos*/`, never trending songs baked in.
- **Never uppercase "Luisart"** (no "LUISART", no "Luis Art"; no CSS `text-transform` on names).
- **No plates** (box, chip, pill, band, highlighter band, darkening band) behind any text.
- **No whooshes** except at the video start and on real transitions (Kallaway: none at all).
- **Never two renders (or two heavy jobs) at once**; never bypass the lock.
- **Never write in `media/*/user-provided/`, the vault's `Finanzas/` or his files in `Creacion de Contenido/`** (the only allowed change there is filing a processed item from `rawc/` or `rawcc/` into its category folder, per the vault's intake rule, never deleting). Never modify `recordings/`.
- **Editing never reads `wiki/Knowledge/` or `Finanzas/`**; only `luisart-guion` searches `wiki/Knowledge/`, read-only.
- **Never clone his voice** (Qwen3-TTS Base or any other) without his explicit permission for that specific use.
- **Never publish or post anything** (YouTube, TikTok, Instagram, social, email) and never share an artifact publicly on his behalf.
- Never silently change what he said; never invent figures, quotes or sources.
- Never print `.env` values; never use fal.ai (no credit).
- Never overwrite a delivered file; never let Codex write (`-s read-only`).
- Never reuse the rejected first pass (`animations/`, prototype A).

---

## 9. Updating this file and the rules after new feedback

When Luisart gives new feedback or a decision, update in this order, in the same turn:

1. **`channels/soyluisart/CHANNEL.md` ★** — write the rule with its date and "(user, yyyy-mm-dd)"; style-specific details also in the style README (`styles/<style>/README.md`).
2. **`.claude/skills/luisart-reglas/SKILL.md`** — mirror it in the checklist (new letter if it's a new rule); then the owning skill if a procedure changes (`luisart-editar-short`, `luisart-diseno-sonoro`, `luisart-animaciones-pizarra`, `luisart-revision-codex`, and the review table there).
3. **`AGENTS.md`** (this file) — the rules table, exceptions table, catalogue, pipeline or don'ts that changed. Keep it a summary; don't copy details that live in the skills.
4. **The vault** — the decision must reach `wiki/Content Creation/` in `C:\Users\LART\Documents\Lartyk\` through its own process (the vault's `CLAUDE.md`): update the matching page (`Editing System/…`, `Styles/<style>/…`), mark replaced statements with a `> [!warning] Superseded` callout instead of deleting them, and append a `[content]` entry to `wiki/Log.md`. Never touch `Finanzas/` or `wiki/Knowledge/` for a channel decision.

Also, when a video's status changes: `PROJECTS.md` (row, channel line, counts, date) and the
video's `BRIEF.md`. When machine facts change (a new tool, a new quirk): `GUIDELINES.md`, then
section 6 here. If this file ever disagrees with CHANNEL.md or `luisart-reglas`, they win: fix
this file.
