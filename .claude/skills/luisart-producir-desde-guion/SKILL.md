---
name: luisart-producir-desde-guion
description: Start a real @soyluisart video from the two things Luisart brings — the written script and the recording he made — by analysing the recording, transcribing it (Whisper), comparing it with the script, deciding the format (vertical or horizontal leads; both are delivered by default), and handing a ready brief to the editing pipeline with the chosen style. Use when Luisart says "ya tengo el guion y el video", "aquí está la grabación", "vamos a las pruebas con mi video", "edita este video con este guion", "¿vertical u horizontal?", "analiza y transcribe mi grabación". It is the front door; luisart-editar-short does the heavy editing after it.
---

> **Paths.** This skill uses placeholders, defined in `brand/paths.json` (created by
> `python scripts/configurar_rutas.py`; edit that file to change them, then tell your assistant):
> `{PROJECT}` repository root · `{CHANNEL}`/`{CHANNEL_DIR}` your channel slug and folder ·
> `{VAULT}` your knowledge vault · `{CONTENT_DIR}`/`{CONTENT_INBOX}` content database and its `rawcc` inbox ·
> `{KNOWLEDGE_DIR}`/`{KNOWLEDGE_INBOX}` knowledge database and its `rawc` inbox · `{CLOUD}` cloud-storage
> folder · `{PYTHON}` the project's Python (venv: `.venv/Scripts/python.exe` on Windows, `.venv/bin/python` on macOS/Linux). Resolve them before running any command (`python scripts/configurar_rutas.py --resolve <file>`
> prints this file resolved). `channels/soyluisart/` is the **reference channel shipped as an example**:
> copy from it where this skill says to; your own channel lives in `{CHANNEL_DIR}`.

# From script + recording to a briefed edit

Luisart is not technical and writes Spanish. He brings a **script** (text, or a `Videos/<date slug>/`
folder in the vault written with `luisart-guion`) and a **recording** (phone video, often vertical,
sometimes via WhatsApp). This skill does the analysis and decisions; he answers at most **one**
question (the style) and sees the result. Channel rules: `{CHANNEL_DIR}/CHANNEL.md` ★ and
`luisart-reglas` (load it). Never pick music, never clone his voice, never publish, never change
what he said.

## Steps

1. **Collect inputs.** Script: a file he dropped, text in the chat (save it to
   `media/{CHANNEL}/automated-research/<v>/guion.txt`), or the vault's
   `wiki/Content Creation/Videos/<YYYY-MM-DD slug>/` script. Recording: the file he names; put it
   in `recordings/{CHANNEL}/<v>-raw.<ext>` (never in `media/`, never modify it). `<v>` =
   `yyyy-mm-dd-slug`. If a piece is missing, ask for that piece only.
2. **Analyse the recording and decide the format:**
   `python .claude/skills/luisart-producir-desde-guion/scripts/analizar_grabacion.py recordings/{CHANNEL}/<v>-raw.<ext> --guion <guion> --json media/{CHANNEL}/automated-research/<v>/grabacion.json`
   It reads size, rotation, frame rate, duration and audio, and returns the **format that leads**
   and why. Rules it applies, most specific first: platform named (YouTube / long video →
   horizontal; Short / Reel / TikTok → vertical); else the orientation of the recording; else
   duration over 3 min → horizontal. **Both formats are still delivered** (channel default); the
   decision is which one is built and checked first. If the recording's orientation differs from
   the leading format, the other one comes from a face-tracked crop — an untested path: say so in
   the report and inspect the crop before delivery. If the decision is truly ambiguous (for
   example a landscape recording for a script marked Short), decide with the rules above and
   state it; do not ask.
3. **Transcribe** under the render lock, Spanish by default (`--lang english|auto` if needed):
   `npx tsx .claude/skills/luisart-editar-short/scripts/with_lock.ts -- {PYTHON} -W ignore .claude/skills/luisart-editar-short/scripts/transcribe_parts.py <audio or video> media/{CHANNEL}/automated-research/<v>/transcript-words.json --lang spanish`
   then the readable version with `whisper_to_md.py` (`**[mm:ss]**` paragraphs). Correct names and
   terms against the glossary; doubtful words stay flagged `(sic)`. Never summarise from memory:
   the transcript is the source.
4. **Compare with the script:**
   `python .claude/skills/luisart-producir-desde-guion/scripts/comparar_guion.py <guion> media/{CHANNEL}/automated-research/<v>/transcript-words.json --md media/{CHANNEL}/automated-research/<v>/guion-vs-dicho.md`
   Coverage, skipped passages, ad-libs and every changed number. Figures or facts that are wrong
   or inconsistent are **flagged, not fixed**: the screen will show the consistent version from
   `figures.ts`, and the report gives Luisart the options.
5. **Ask the one question** (skip it if the request already names the style):
   `¿En qué estilo lo edito?` with the options in `luisart-editar-short` Step 0 (Luisart completa
   — default, Luisart dividida, Kallaway, plus any style he approved through
   `luisart-configurar-estilo`). Tell him in one line the format that leads and why, and roughly
   how long the machine work takes.
6. **Write `BRIEF.md`** in `channels/soyluisart/videos/<v>/` (header: `Format: vertical + horizontal`,
   leading format and reason, style, recording and its flags, transcript path, "Script vs what
   was said" from step 4) and create or refresh the vault folder
   `wiki/Content Creation/Videos/<YYYY-MM-DD slug>/` (brief summary + `Sources Used.md`; keep
   what `luisart-guion` wrote).
7. **Hand over to `luisart-editar-short` at its Step 1 (ingest) with the style and the leading
   format**; it does cuts, voice, matte, face track, beats, board elements, sound, captions,
   renders, checks, Codex review and delivery (steps 1–16, one heavy job at a time). Do not
   repeat what it does.
8. **Report to Luisart in Spanish** (below).

## Checks before handing over

- The recording file is untouched and in `recordings/`; nothing heavy went into the vault.
- `grabacion.json`, `transcript-words.json` and `guion-vs-dicho.md` exist and were read.
- The leading format and its reason are in BRIEF.md and in the report.
- Every flag (low resolution, variable frame rate, rotation, no audio, crop path) is in BRIEF.md.

## Report to Luisart (Spanish, plain, no internals)

1. What he gave me: duration, how it was recorded, and any problem with the recording
   (a recommendation for next time if it came via WhatsApp).
2. The format that leads and why, and that both versions will be delivered.
3. Script versus what he said: how much matched, what he skipped, what he added, every number
   that changed and the options.
4. The style question (if not answered) and the time the edit will take.
