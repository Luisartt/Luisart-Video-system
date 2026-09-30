---
name: luisart-revision-codex
description: Runs an independent OpenAI Codex review of a @soyluisart deliverable (a rendered short/video, a Luisart library batch, or the rule documents) against the channel rules — contact sheets every 0.5 s plus caption-change frames, code and rules pasted with line numbers, codex exec in read-only mode, then Claude verifies every finding, discards false positives, writes CODEX-REVIEW.md, fixes, re-renders and re-reviews until clean. Use it before delivering ANY @soyluisart video or animation batch (every deliverable must pass it), whenever the user asks for a "revisión", "que Codex lo revise", "segunda opinión", "revisa que cumpla las reglas", or after fixing review findings to confirm they are resolved.
---

> **Paths.** This skill uses placeholders, defined in `brand/paths.json` (created by
> `python scripts/configurar_rutas.py`; edit that file to change them, then tell your assistant):
> `{PROJECT}` repository root · `{CHANNEL}`/`{CHANNEL_DIR}` your channel slug and folder ·
> `{VAULT}` your knowledge vault · `{CONTENT_DIR}`/`{CONTENT_INBOX}` content database and its `rawcc` inbox ·
> `{KNOWLEDGE_DIR}`/`{KNOWLEDGE_INBOX}` knowledge database and its `rawc` inbox · `{CLOUD}` cloud-storage
> folder · `{PYTHON}` the project's Python (venv: `.venv/Scripts/python.exe` on Windows, `.venv/bin/python` on macOS/Linux). Resolve them before running any command (`python scripts/configurar_rutas.py --resolve <file>`
> prints this file resolved). `channels/soyluisart/` is the **reference channel shipped as an example**:
> copy from it where this skill says to; your own channel lives in `{CHANNEL_DIR}`.

# Codex review of a @soyluisart deliverable

Every deliverable is reviewed by Codex against the channel rules and fixed before Luis sees it.
Codex is a second pair of eyes, not the judge: Claude verifies every finding against the frames
and the code, keeps the real ones, discards false positives, fixes, and re-reviews until clean.
The model to copy is `channels/soyluisart/videos/2026-09-27-per-barato/CODEX-REVIEW.md`.

Rules: skill `luisart-reglas` (checklist (a)–(p)) and `{CHANNEL_DIR}/CHANNEL.md` ★ — re-read
CHANNEL.md before each review; it changes.

Vault (read-routing): for context, read ONLY
`{VAULT}\wiki\Content Creation\` —
`Editing System\`, the reviewed style's folder under `Styles\` and its `Designs\<style>\`, that
style's creators in `References\Creators\`, and `Videos\<YYYY-MM-DD slug>\` for the video.
**Never read `wiki\Knowledge\` or `{KNOWLEDGE_DIR}\`**, and never paste them into a Codex prompt.
The rules pasted into prompts come from CHANNEL.md ★ and `luisart-reglas`, not from vault copies.

## Codex on this machine

- CLI: `codex` (signed in with `codex login`).
- **Always pass `-s read-only`.** The user's `~/.codex/config.toml` defaults to
  `sandbox_mode = "danger-full-access"`; a review must never be able to write.
- On Windows the read-only sandbox **cannot start processes** (`CreateProcessAsUserW` access
  denied), so Codex cannot open files or run anything. Paste the code and rules INTO the prompt
  (with line numbers, `scripts/make_prompt.py`) and attach the frames as images (`-i`).
- Verified invocation (prompt from stdin, images last, final answer to a file):

```bash
codex exec -s read-only --skip-git-repo-check --ephemeral -C "$PWD" \
  -o <V>/review/codex-<target>-r<N>.md -i <sheet-01.png> -i <sheet-02.png> … < <V>/review/prompt-<target>.txt
```

- One call at a time (quota and RAM), timeout up to 10 min (`run_in_background` for long ones).
  Several separate calls beat one giant call: e.g. (1) full-board render, (2) split render,
  (3) horizontal render, (4) documents + libraries.
- Contact sheets 1600 px wide (6×3 tiles) read well; ≈ 7 sheets per 42 s short.

## Steps

`<V>` = `channels/soyluisart/videos/<v>`, `<O>` = `out/{CHANNEL}/videos/<v>`. Working files go in
`<V>/review/` (prompts, raw Codex answers); frames in `<O>/review/<target>/`.

1. **Caption-change frames** for each edit (the gate exported by the composition file):

```bash
npx tsx .claude/skills/luisart-revision-codex/scripts/caption_changes.ts <V>/scenes/pizarra/PizShort.tsx PIZ_CAPTION_GATE <total frames>
```

   (`SPLIT_CAPTION_GATE` in `SplitShort.tsx`. The per-barato horizontal edit keeps its gate
   private but builds it from the same `PIZ_GRAPHICS`, so `PIZ_CAPTION_GATE` gives its changes
   too; if a new horizontal edit uses different windows, export its gate.) It prints
   `{"changes":[…], "captionFrames": n}` — per-barato after the key/plain rule:
   `{"changes":[377,400,416,1021,…],"captionFrames":130}`. `captionFrames: 0` means rule (k)
   wasn't applied: that is a finding in itself.

2. **Contact sheets** — one frame every 0.5 s + 2 frames after each caption change, zone lines
   drawn in:

```bash
{PYTHON} .claude/skills/luisart-revision-codex/scripts/review_frames.py <O>/SLA-<v>-short-pizarra.mp4 <O>/review/pizarra --every 0.5 --extra <changes, comma-separated>
```

   Look at the sheets yourself first; they are also what you check findings against.

3. **Prompt.** Copy [references/prompt-head.md](references/prompt-head.md) to
   `<V>/review/head-<target>.md`, fill it in, then paste the rules and code with line numbers:

```bash
{PYTHON} .claude/skills/luisart-revision-codex/scripts/make_prompt.py <V>/review/prompt-pizarra.txt \
  --head <V>/review/head-pizarra.md --frames <O>/review/pizarra/frames.json -- \
  .claude/skills/luisart-reglas/SKILL.md {CHANNEL_DIR}/CHANNEL.md:<★ section lines> \
  <V>/scenes/pizarra/PizShort.tsx <V>/scenes/pizarra/layout.ts <V>/scenes/pizarra/groups.ts \
  <V>/scenes/pizarra/Boards.tsx <V>/scenes/pizarra/pizCues.ts <V>/scenes/pizarra/captionRule.ts \
  <V>/scenes/pizarra/captionPlace.ts <V>/scenes/figures.ts <V>/scenes/music.ts <V>/BRIEF.md
```

   Add the transcript text (so Codex can compare voice and screen) and, for a library review,
   the element files + `styles/pizarra/README.md` + the `_index-*.png` sheets as images.

4. **Run Codex** (command above), one target at a time.

5. **Verify every finding yourself** — this is the important part:
   - Visual finding → open the cited tile, then the full-resolution frame
     (`ffmpeg -ss <s> -i <file> -frames:v 1 check.png`, or `frames-locked.ts` with
     `'--props={"safeGuide":true}'` for the zone overlay) and look.
   - Code finding → read the cited lines in the CURRENT file (line numbers can be stale if
     another agent edited it meanwhile — the per-barato "type mismatch" false positive).
   - Decide: **confirmed** (keep, with your own evidence), **false positive** (discard, one line
     why), **already covered** (fixed in a newer draft), or **user decision** (a rule conflict or
     a content choice only Luis can make).
   - Add what Codex missed (per-barato H5, the cut-out flashing over a board, was found by Claude).

6. **Write `<V>/CODEX-REVIEW.md`** in the per-barato format:
   - Header: reviewer (`OpenAI Codex CLI <version>`, `codex exec -s read-only`, number of calls),
     targets (files, frames, sheets), rule documents, and "Every finding was checked by Claude".
   - Rules used (one-line summary of (a)–(p)).
   - Method notes (sandbox can't run processes → code pasted; anything that changed mid-review).
   - `## High`, `## Medium`, `## Low`: `**H1 — title (rule). Scope. Status.**` then Where / Cause
     (file:line) / Fix, and the status after fixing.
   - `## Checked and compliant`, `## Discarded (false positives)` with the reason for each.
   - Later rounds: `## Round N (date)` with what was fixed, re-checked and still open.

7. **Fix** every confirmed High and Medium (and cheap Lows) in the code, not by hand-editing
   renders. Re-run the checks that apply (`checkCaptions.ts`, `npx tsc --noEmit`, stills),
   re-render through the lock, QA + loudness + Whisper word check again.

8. **Re-review** the new renders (steps 1–4, head says "Round N: verify H1–H3 fixed, look for
   regressions"). Repeat until Codex's confirmed findings are only Lows you chose to keep or
   user decisions. Stop after 3 rounds and report what is left rather than looping.

9. **Report** the outcome inside the delivery report, in Spanish, as outcomes: "Pasé una revisión
   independiente contra las reglas del canal; corregí N cosas (p. ej. un subtítulo que tapaba la
   boca). Quedan para ti: …". Never paste Codex's English text to Luis.

## Review checklist (what each rule means in frames and code)

| Rule | Frames: fails when… | Code: check… |
|---|---|---|
| (a) captions only on talking-head | a caption with any board, word, icon, arrow, figure, kicker; any caption in a split; a caption < 12 f | the gate gets every graphic window (boards, groups incl. kickers, extras, CTA) |
| (b)/(l) not on the face | caption touches forehead, eyes or mouth; on a medium shot it isn't neck/chest; on a close-up it isn't above the head | `captionSpot` order; face track path; the shot transform matches the render (punch, push-in, card, horizontal panel) |
| (c) zones | graphics outside y 250–970 (vertical); caption outside the band without a face reason; anything important below y 1436 or in the right 160 px of the lower half | `ZoneFit` / `BoardView` boxes, kicker tops ≥ 250 |
| (d) no plates | any box, chip, pill, band or highlighter band behind text | `background` behind text elements |
| (e) SFX | (listen) whoosh not on frame 0; whoosh on an element | cue list: whoosh count = 1 + real transitions; every graphic event has a cue within 0–2 f |
| (f) Luisart | "LUISART", "Luis Art" | `toUpperCase` / `text-transform` on names |
| (g) no face PiP on full board | face, card or cut-out visible on a full-board frame (also 1–2 f flashes at cuts) | layer order: full board above face layers; matte windows start on their cut |
| (h) music | any music bed without `USER_MUSIC` | `music.ts`, no `fondos*/` paths |
| (i) motion | a static stretch > ~1 s; an explanation board without marker arrows | Drift/Breathe/Float use; marker strokes with SFX |
| (j) labels, currency | example figure without "dato de ejemplo"; bare "$" without MXN context; euros | `figures.ts`, `EXAMPLE_LABEL` |
| (k) alternate face shots | every face shot has a big word (→ 0 captions) or none do | `key` flags in `groups.ts`; caption frame count > 0 |
| (m) deliverables | a format missing | compositions registered for all three |
| voice = screen | the screen shows a different figure/word than he says | `figures.ts`, caption `fixes()`; flagged in BRIEF/report |
