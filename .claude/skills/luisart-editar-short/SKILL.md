---
name: luisart-editar-short
description: End-to-end AUTOMATIC edit of a @soyluisart raw recording into finished videos — first ONE question (which style — Luisart full board, Luisart split or Kallaway), then fully automatic — ingest (rotation, variable frame rate), Whisper transcript, script comparison, cutting mistakes, voice master, person matte, face tracking, beat planning, Luisart board scenes or the Kallaway split with ChatGPT B-roll, full-board vertical + split-screen vertical + horizontal versions, baked sound design, face-aware captions, locked renders, QA, loudness, word check, Codex review, delivery and a Spanish report. Use it whenever the user (or the main chat) hands over a recording or video file of Luis for the channel — "edita este video", "te mandé la grabación", "hazme el short/reel/tiktok", "edítalo como el de la P/U", "nuevo video para soyluisart", a path in recordings/soyluisart/ — even if they don't say "edit", and whenever a new @soyluisart video must go from raw footage to final files. Also use it to resume or re-render an existing @soyluisart video after feedback.
---

# Edit a @soyluisart video, raw recording → final videos

The user (Luis, @soyluisart) is not technical and speaks Spanish. He wants to send a raw
recording and get finished videos back. **The FIRST step asks him ONE question — which style — and
nothing else;** after his answer there are **no checkpoints**: Claude makes every editing
decision, checks its own work (tools + a Codex review) and delivers. The only thing never done
silently is changing what he said — factual or number problems are fixed on screen from one
source of truth and reported to him.

## Step 0 — ask the style (the only question)

Before anything else, ask in Spanish, as the only question, with these three options (user,
2026-09-28; CHANNEL.md ★ "Style options"):

```
¿En qué estilo lo edito?
1. Luisart completa (la de siempre: pizarra blanca con puntos y tú en los momentos clave) — por defecto
2. Luisart en pantalla dividida (estilo Nick: la animación arriba y tú abajo)
3. Kallaway (pantalla partida: imagen de cine arriba, tú abajo, y una palabra gigante cuando sales tú)
```

If he doesn't say or says "la que quieras", use 1 (Luisart full board, the default). If the main
chat already passes the style in the request, don't ask again. Then work without asking.

**Deliverables (default for Luisart, options 1 and 2):** three MP4s in
`out/soyluisart/videos/<v>/`, 30 fps, sound baked in:
1. vertical 1080×1920 **full-board** Luisart edit (`SLA-<v>-short-pizarra`);
2. vertical 1080×1920 **split-screen** edit (Nick Saraev grammar: graphic on top, face card below
   with the head breaking out) (`SLA-<v>-short-split`);
3. horizontal 1920×1080 edit (`SLA-<v>-short-pizarra-h`).

The chosen style leads (its edit is built and checked first); the others follow unless he asked for
one video only. **Kallaway (option 3):** the vertical edit `SLA-<v>-short-kallaway` plus a
horizontal one (channel default; fewer only if he asks — the first draft was vertical only), built from `channels/soyluisart/styles/kallaway/` (README = the rules
and its exceptions: continuous seam captions, one giant word on face shots, only a slow push on
the images, section clicks, zero whooshes) with the reference edit
`videos/2026-09-27-per-barato/scenes/kallaway/` (`layout.ts`, `faces.ts`, `captions.ts`,
`kalCues.ts`, `KalShort.tsx`, `checkCaptions.ts`). Its B-roll: ChatGPT images through the Codex
CLI (`codex exec`, one call at a time, prompts and blocks in the Kallaway ANALISIS.md §S.8),
saved to `media/soyluisart/automated-research/<v>/kallaway-gen/` with a `SOURCES.md`; everything
else is built in Remotion. Steps 8–12 below then follow the Kallaway reference instead of the
Luisart boards (no board elements, no behind-head words, no marker arrows).

## Before you start

1. Load skill `luisart-reglas` (the shared checklist) and read `channels/soyluisart/CHANNEL.md`
   section ★ in full — it is the source of truth and changes often. Read `GUIDELINES.md` (machine
   limits) and `PROJECTS.md`.
2. Read the template video end to end:
   `channels/soyluisart/videos/2026-09-27-per-barato/` — `BRIEF.md` (how a brief, beat table,
   cue table and check results are written), `CODEX-REVIEW.md`, `scenes/pizarra/*`
   (`layout.ts`, `groups.ts`, `Boards.tsx`, `PizShort.tsx`, `SplitShort.tsx`,
   `HorizontalShort.tsx`, `captionRule.ts`, `captionPlace.ts`, `checkCaptions.ts`, `pizCues.ts`),
   `scenes/figures.ts`, `scenes/music.ts`, `scenes/timing.ts`, `cut/`. Copy it; don't reinvent it.
3. **Vault (read-routing):** in `C:\Users\LART\Documents\Lartyk\wiki\Content Creation\`
   read ONLY `Editing System\`, the chosen style's folder under `Styles\`, its `Designs\<style>\`,
   the creators behind that style (`References\Creators\`) and `Videos\<YYYY-MM-DD slug>\` if it
   exists (the script skill may have left `Sources Used.md` and the script there). Style → folder
   map: skill `luisart-reglas` → "Where to read". **Never read `wiki\Knowledge\` or
   `Finanzas\`.** The repo files above stay the source of truth when they disagree.
4. Pick the folder name `<v>` = `yyyy-mm-dd-slug` (date of today, short Spanish slug).
5. After his style answer (step 0), tell him once, in Spanish, that you're on it and roughly how
   long it takes (a 45 s short: about an hour of machine time, most of it renders; Kallaway adds
   ~2 min per ChatGPT image). Then work without asking.

**Machine limits (never break these):** one heavy job at a time. Renders and stills only through
`core/scripts/render-locked.ts` (`npm run render:locked`), `frames-locked.ts`, `stills-locked.ts`
or `render-batch-locked.ts`; every other heavy job (Whisper, matte, face track, big FFmpeg
encodes) through `npx tsx .claude/skills/luisart-editar-short/scripts/with_lock.ts -- <command>`.
Never start two of them in parallel, and never run two heavy sub-agents at once. Ask Luis to keep
the laptop plugged in.

When this runs from the main chat, the build phases can go to the project agents
(`video-editor` for steps 1–6, `video-animator` for steps 7–14; both load the luisart-* skills).
Run them one at a time.

## Steps

Exact commands, file formats and flags: [references/pipeline.md](references/pipeline.md).

1. **Ingest.** Put the raw file in `recordings/soyluisart/<v>-raw.<ext>` (never in `media/`).
   Probe it; make the working copy `media/soyluisart/automated-research/<v>/aroll-1080x1920.mp4`:
   rotation applied, constant 30 fps (phones and WhatsApp record variable frame rate), 48 kHz audio.
   If it came through WhatsApp (576×1024, heavy compression), continue, and add the recording tip
   to the report. A horizontal recording: the vertical versions use a face-tracked crop
   (**untested** — see pipeline.md §1).
2. **Transcribe** with whisper-large-v3-turbo, split in pauses
   (`scripts/transcribe_parts.py` → `transcript-words.json`). Correct names against the glossary.
3. **Compare with the script** if Luis gave one: note every difference in BRIEF.md.
4. **Cut clear mistakes only** (false starts, flubs, retakes, take-backs) in real silences; keep
   pauses, ad-libs and content. Verify each join. Write `cut/cuts.json`.
   **Flag, don't fix, what he said:** wrong or inconsistent figures/facts go to `figures.ts` (the
   screen shows the consistent version, results computed) and to the report with options.
5. **Voice:** copy and run `cut/build-voice.ts` → `voice-cut-master.wav` (−15 LUFS, 15 ms fades
   at the joins).
6. **Matte** (`core/scripts/py/matte.py`, Robust Video Matting) → VP9-alpha WebM
   `aroll-person-alpha.webm`; **face track** (`core/scripts/py/face_track.py`) → `face-track.json`.
7. **Folder:** copy the Luisart pipeline of the template into `channels/soyluisart/videos/<v>/`
   (table in pipeline.md §7), register it in `channels/soyluisart/index.tsx`, write `BRIEF.md`
   (header: `Format: vertical + horizontal`, style, recording, transcript, then "Script vs what
   was said", "Cut", the beat table).
8. **Plan the beats** in `scenes/pizarra/layout.ts` + BRIEF.md: every cut point and landing frame
   from a transcript word (`at("word", after)`), never a hard-coded time. Full board: face shots
   for hook / turns / CTA, the explanation on the board (≈ 50–55 %), a layout change on every new
   phrase, hard cuts, punch 100/115 % alternating. Split: split / board / face ≈ 43/31/25 %.
   **Alternate the face shots (rule k):** only the key-idea shots (hook, thesis, pivot, CTA —
   ≈ 4–5 in a 40 s Short) get a behind-head word or, on the hook, a title at the top of the
   graphics zone (`key: true` in `groups.ts`); every other face shot stays plain and gets captions.
9. **Board elements:** choose them per beat with skill `luisart-animaciones-pizarra` (reuse the
   library elements and primitives; new element only when nothing fits). Every element lands on
   the word that names it; plenty of marker arrows; constant micro-motion; every example figure
   from `figures.ts` with "dato de ejemplo · MXN" (or US$ for global prices).
10. **Sound design** with skill `luisart-diseno-sonoro`: a cue for every graphic event in
    `pizCues.ts` (full / split, and the horizontal edit reuses the full list), whoosh only on
    frame 0 and real transitions, music only if Luis named a file (`music.ts → USER_MUSIC`).
11. **Captions:** gate them with every graphic window (`makeCaptionGate`), place them face-aware
    (`captionPlace.ts` → shared `captionSpot.ts`: neck/chest on a medium shot, above the head on a
    close-up, never on forehead/eyes/mouth). Run `checkCaptions.ts`: 0 overlaps with graphics,
    0 face touches, and a sensible number of caption frames (0 = rule k was not applied).
12. **Build the three compositions** (`PizShort.tsx`, `SplitShort.tsx`, `HorizontalShort.tsx`),
    `npx tsc --noEmit` clean, then zone stills with `safeGuide` (and `captionTest`) via
    `frames-locked.ts`; look at them and fix before any full render.
13. **Render** each deliverable through the lock (video + a separate WAV render), master the audio
    to −14 LUFS integrated / ≤ −1 dBTP, mux (pipeline.md §11).
14. **Check** every file: `npm run qa -- <files> --allow-white`, loudness (ebur128), the Whisper
    word check against the cut transcript (`transcribe_parts.py --expect … --cuts …`), the caption
    checks. Any failure → fix → re-render that file.
15. **Codex review** with skill `luisart-revision-codex` on every deliverable: contact sheets,
    rule checklist, verify each finding, write `CODEX-REVIEW.md`, fix, re-render, re-review
    until clean.
16. **Deliver:** final files in `out/soyluisart/videos/<v>/` (older drafts stay, never
    overwritten: next round is `…-v2.mp4`); clean up `_premaster-*`, `_mix-*` and the matte
    `.mov`. Update `BRIEF.md` (renders, cue table, check results, open questions) and
    `PROJECTS.md` (the video row: status, next step, date; the channel line and counts). Then
    update the vault's video folder
    `C:\Users\LART\Documents\Lartyk\wiki\Content Creation\Videos\<YYYY-MM-DD slug>\`
    (English; e.g. `2026-09-27 PE Ratio Short`; create it on the first delivery; conventions in
    the vault manual `CLAUDE.md`): brief summary, version history (full paths into
    `tubeai-video/out/`, never copy videos), pending decisions, and `Sources Used.md` — create or
    update it every time with this edit's sources (the script, primary sources of real figures in
    `figures.ts`, `automated-research/<v>/SOURCES.md`), keeping every entry `luisart-guion` wrote
    (its Knowledge links are kept as-is, not opened). Copy the new contact sheets (PNG) into `Designs\<style>\` and refresh that
    style's gallery; one `[content]` entry in `wiki\Log.md`. Then report to Luis in Spanish
    (template below).

## What "done" means

- The chosen deliverables (three MP4s for Luisart; Kallaway vertical + horizontal unless he asked for fewer), each: QA PASS, −14 ± 0.5 LUFS and true peak ≤ −1 dBTP, every kept word heard in
  order, 0 captions over graphics or the face, Codex review clean (or remaining points listed as
  his decisions).
- Every rule in `luisart-reglas` holds; every figure consistent with `figures.ts`.
- BRIEF.md, PROJECTS.md and the vault's `Videos\<YYYY-MM-DD slug>\` updated; nothing left in
  `out/.render-lock`.

## Report to Luis (Spanish, plain words, no internals)

Keep it short. Use this shape:

```
¡Listo! Tu video "<título>" ya está editado. Te dejo 3 versiones en
out/soyluisart/videos/<v>/:
- Vertical con pizarra completa: SLA-<v>-short-pizarra.mp4
- Vertical con pantalla dividida (animación arriba, tú abajo): SLA-<v>-short-split.mp4
- Horizontal para YouTube: SLA-<v>-short-pizarra-h.mp4
Duran <n> s. Quité <n> errores (<qué: un tropiezo en "…">). Todo lleva efectos de sonido;
música: <ninguna, porque no me pasaste una | la que elegiste: …>.

Necesito que decidas: <cada dato o frase inconsistente, con opciones; o "nada">.
Escucha estos momentos: <uniones dudosas con su segundo; o nada>.
Para la próxima grabación: <solo los consejos que apliquen>.
```

Recording tips (only the ones that apply this time), in Spanish:
- "Mándame el archivo original directo (por cable, Drive o AirDrop), no por WhatsApp: WhatsApp lo
  comprime y baja la calidad."
- "Grábate un poco más lejos, con espacio libre arriba de la cabeza (más o menos una quinta parte
  de la pantalla) y la barbilla a unos dos tercios de la altura: así los subtítulos caben sin
  taparte la cara."

If something could not be finished (a render kept failing, Codex unreachable), deliver what
passed, say plainly what is missing and what you will do next — never claim a check you didn't run.
