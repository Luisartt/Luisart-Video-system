---
name: luisart-reglas
description: One-page checklist of the @soyluisart channel rules (Luisart style, the Kallaway style's exceptions, captions, safe zones, no plates behind text, "Luisart" spelling, sample-data labels, MXN/US$, sound design, whooshes, music, loudness, deliverables). Load it before planning, building, reviewing or delivering ANY @soyluisart video, short, reel, TikTok, Luisart animation or sound design, and whenever the user asks what the channel rules are, whether something is allowed ("¿puedo poner subtítulos aquí?", "¿se permite un recuadro?", "¿qué música?"), or when two rules seem to conflict. The other luisart-* skills all share this checklist.
---

> **Paths.** This skill uses placeholders, defined in `brand/paths.json` (created by
> `python scripts/configurar_rutas.py`; edit that file to change them, then tell your assistant):
> `{PROJECT}` repository root · `{CHANNEL}`/`{CHANNEL_DIR}` your channel slug and folder ·
> `{VAULT}` your knowledge vault · `{CONTENT_DIR}`/`{CONTENT_INBOX}` content database and its `rawcc` inbox ·
> `{KNOWLEDGE_DIR}`/`{KNOWLEDGE_INBOX}` knowledge database and its `rawc` inbox · `{CLOUD}` cloud-storage
> folder. Resolve them before running any command (`python scripts/configurar_rutas.py --resolve <file>`
> prints this file resolved). `channels/soyluisart/` is the **reference channel shipped as an example**:
> copy from it where this skill says to; your own channel lives in `{CHANNEL_DIR}`.

# @soyluisart rules — shared checklist

**The rules live in exactly one place:** `{CHANNEL_DIR}/CHANNEL.md`, section
"★ Graphics standard" (and, for style specifics, `channels/soyluisart/styles/pizarra/README.md` and
`channels/soyluisart/styles/kallaway/README.md`).
This page is a compact checklist that points there. If this page and CHANNEL.md ever disagree,
CHANNEL.md wins — re-read it at the start of every job (another chat may have changed it) and fix
this page if it drifted. Never add a new rule here only: write it in CHANNEL.md ★ first.

The letters (a)–(j) are the user's rules of 2026-09-27 as used in
`channels/soyluisart/videos/2026-09-27-per-barato/CODEX-REVIEW.md`; (k)–(p) were added later.
Codex reviews cite them by letter.

## Style and brand

- **Luisart is THE style and edit system** (white dotted board `#FFFFFF`, dots `#D5D9E2` every
  64 px, ink `#111111`, one blue accent `#2F6BFF`, red `#E5484D` only for "bad"). Brand colours:
  blue and black. Terminal and Documental are secondary, only on request.
- **Style options for an edit** (user, 2026-09-28): Luisart full board (default), Luisart split
  (Nick grammar) or **Kallaway** (`styles/kallaway/`). The editing skill asks which one first; the
  rest is automatic. The letters below apply to every style except where "Per-style exceptions"
  (next section) says otherwise.
- Edit grammar: A-roll only for the hook, the turns and the CTA; the explanation on the board; a
  layout change on every new phrase; **hard cuts only**; A-roll punch 100 % ↔ 115 % on cuts
  (never animated); headings typed 1 char/frame; elements have no exit animation.
- **(f) "Luisart"** — one word, only the L capitalised, never uppercased, even inside all-caps
  text (`upperKeepName()` in `styles/shared/text.ts`).
- **(j) Example figures** carry "dato de ejemplo" (per video: one `EXAMPLE_LABEL` constant, e.g.
  "dato de ejemplo · MXN"). Money in **pesos (MXN)**, or **US$** for global prices; Mexican number
  format (`formatMx` / `fmtMx`: 20,000.50). Never euros. Real figures are checked against a
  primary source.

## Per-style exceptions — Kallaway (user, 2026-09-28; CHANNEL.md ★ "Kallaway")

- **(a) → continuous seam captions** on the split (~2 words, Inter 700 ≈ 46 px, no box, just under
  the seam at y ≈ 1040), even with an image on top — EXCEPT while the top half shows text that
  repeats the speech (counter, kinetic words, a headline of the same words): no caption there.
  Stack, white-screen and kinetic shots get none. Never over the face (b/l still apply).
- **(k) → every face shot carries ONE giant word** (≈ 165 px) per spoken word, face-aware with
  `captionSpot()` (chest, else above the head), never on forehead/eyes/mouth; emotion words in
  Playfair Italic, key words `#7FA6FF`, "bad" red. No key/plain alternation, no behind-head words.
- **(i) → sober motion:** only a slow push on the B-roll images. No marker arrows, no 100/115 %
  punches, no push on the face, no transitions.
- **Sound / (e) → a click on the cut that opens each section + at most one subtle sound per image
  or counter event; nothing on plain cuts, captions or giant words; ZERO whooshes** (no whoosh at
  the start either).
- **(g)** holds: no face circle over B-roll. **(d)** holds: no plates/bands/pills; a darkening
  gradient at the bottom of an image is not allowed if it reads as a band (use a text shadow, or dim
  the whole image evenly). Brand blue `#7FA6FF` replaces his gold. Hook headline inside x 120–920.
- **(m) for this style:** the channel default (vertical + horizontal) unless the user asks for fewer
  (CHANNEL.md ★ Kallaway, point 6; the first Kallaway draft was vertical only at his request).

## Layout and captions

(Luisart and Luisart split; for Kallaway, (a) and (k) are replaced by the exceptions above.)

- **(c) Zones** (`ZONES` in `styles/shared/formats.tsx`). Vertical 1080×1920: animations, board
  content and behind-head words in **x 120–920, y 250–970**; captions preferably in
  **x 120–900, y 1000–1300**; nothing important below **y 1436** or in the **right 160 px of the
  lower half**. Horizontal 1920×1080: graphics y 90–790, captions y 820–970, margins 140/90/110.
  The face overrides the caption band (see l).
- **(a) Captions only on plain talking-head.** No caption while ANY animation, board, title,
  figure, arrow, icon, behind-head word (with its kicker), sticker/card or CTA element is on
  screen. Split layouts never get captions (a graphic is always on top). A caption never flashes
  for < 12 frames between two graphics. Implementation: `makeCaptionGate(graphicWindows, total)`
  in the edit's `captionRule.ts`.
- **(k) Two kinds of face shot — alternate them.** *Key* face shots carry a key idea: a big
  behind-head word, or on the hook a title at the top of the graphics zone; they get NO captions.
  Keep them few — hook, thesis, the lesson's pivot, CTA (≈ 4–5 in a 40 s Short). Every other face
  shot is *plain*: no big word, no title, **captions on**. Decide which beats are key before
  animating (`key: true/false` on each group in the per-barato `groups.ts`). An edit with zero
  captions means rule (k) wasn't applied.
- **(b)+(l) Captions never cover the face** — not the forehead, eyes or mouth — and stay inside
  the safe area (vertical x 120–920, y 250–1436; horizontal x 140–1780, y 90–970). Face tracked per
  frame (`core/scripts/py/face_track.py` → `face-track.json`; protected box = detector box + 25 %
  up for the forehead + 36 px). Placement order (`captionSpot()` in
  `styles/shared/captionSpot.ts`): (1) **medium shot: between the neck and the chest**, just under
  the chin; (2) **above the head** when that fits better (a close selfie whose chest is under the
  platform UI); (3) the nearest clear spot to the caption band. If nothing fits, reframe the shot
  slightly (zoom out / shift) rather than cover the face.
- Captions: Inter 700, 2–4 words per chunk, active word blue, white with a thin ink outline over
  video (ink on paper), no sound per chunk.
- **(d) No plates.** No box, chip, pill, band or lower-third bar BEHIND captions or on-screen text
  ("cuadritos negros feos"). Legibility comes from colour, a thin outline (paint-order stroke) or a
  soft shadow. **Allowed:** text that is part of a drawn object — price tag, speech bubble, sticky
  note, board card, retro window, pixel button. Highlighter = underline, never a band.
- **(g) No face picture-in-picture on full-board scenes.** Face cards and head cut-outs belong only
  to the split layout and to face shots.

## Motion

(Luisart; Kallaway: only the slow push on images — see the exceptions above.)

- **(i) Constant motion:** slow push-in on the A-roll (+3.5 % per shot on top of the punch), board
  paper drifting at 40 % of its content (parallax), results breathing (±3.5 %), tags/cards floating
  (±5 px). **Plenty of hand-drawn marker arrows** that draw on with the words (element → next,
  price → result, curved A ↔ B), each with a marker SFX.

## Sound

(Luisart; Kallaway: section clicks + ≤ 1 subtle sound per image/counter event, zero whooshes.)

- **Sound design is mandatory and baked into every render.** Every graphic event gets its own
  specific SFX landing on the frame the visual lands (click, mechanical typing, pop, ding, marker,
  paper, counter, correct/wrong, camera, clock, coins…). One sound per beat; the voice stays king.
- **(e) Whooshes ONLY at the video start (peak on frame 0) and on real scene transitions** (into or
  out of the board explanation, a chapter change). Never on an element, card change, punch-in or
  board-to-board hard cut.
- **(h) Music: never chosen by Claude.** Only a file the user drops in
  `media/{CHANNEL}/user-provided/musica/` and names; otherwise NO music bed.
- **Loudness:** ≈ −14 LUFS integrated, true peak ≤ −1 dBTP (voice ≈ −15/−16, SFX −12 to −18 dB
  under it, user music −20 to −24 LUFS ducked).
- Details: skill `luisart-diseno-sonoro`.

## Deliverables and process

- **(m) Default deliverables:** vertical 1080×1920 full-board Luisart + vertical split-screen
  (Nick Saraev grammar: graphic on top, face card below with the head breaking out) + horizontal
  1920×1080, all from the same cut, voice, SFX and figures, 30 fps. Horizontal Luisart: board
  scenes full frame in the graphics zone (y 90–790), no face on them; face shots = the vertical
  recording as a centred full-height panel (x 656–1264) on the dotted paper (reference
  `HorizontalShort.tsx`).
- **(n) Fully automatic:** raw recording → final videos with no checkpoints, BUT never silently
  change what the user said: factual or number inconsistencies are flagged in the report (the edit
  shows the correct figure from one `figures.ts` and says so).
- **(o) Every deliverable passes a Codex review** against this checklist and is fixed before
  delivery (skill `luisart-revision-codex`).
- **(p) Machine limits:** one heavy job at a time (render, transcription, matte, face track) —
  renders through `core/scripts/*-locked.ts`, other heavy jobs through the lock wrapper in
  `luisart-editar-short/scripts/with_lock.ts`.

## Where to read (vault routing, 2026-09-28)

The Obsidian vault `{VAULT}\` (English wiki,
manual `CLAUDE.md` at its root) holds a compiled copy of these rules and the channel history. It
summarises; CHANNEL.md ★ and this checklist stay the source of truth (if a vault page disagrees,
they win: flag the drift).

- **Editing work** (every `luisart-*` editing skill: this one, `luisart-editar-short`,
  `luisart-animaciones-pizarra`, `luisart-diseno-sonoro`, `luisart-revision-codex`) reads ONLY
  `wiki\Content Creation\` in that vault: `Editing System\` (Rules, Sound, Process and Tools), the
  chosen style under `Styles\` (+ `Styles Overview.md`), its `Designs\<style>\` images, the
  creators behind that style in `References\Creators\`, and `Videos\<YYYY-MM-DD slug>\` for the
  video. Style → folders: Luisart full board → `Styles\Luisart`, `Designs\Luisart`, Santiago
  Castellanos · Luisart split → `Styles\Luisart Split` (+ `Styles\Luisart`), `Designs\Luisart
  Split`, Nick Saraev · Kallaway → `Styles\Kallaway`, `Designs\Kallaway`, Kallaway · Terminal /
  Documental → `Styles\Terminal and Documentary`, `Designs\Terminal`, `Designs\Documentary`.
- **Editing never reads `wiki\Knowledge\` or `{KNOWLEDGE_DIR}\`** — editing processes must not
  mix with the knowledge base.
- Writing or reviewing a script is the one content task that searches `wiki\Knowledge\` (read-only),
  through skill `luisart-guion`. Processing references: skill `luisart-procesar-referencias`
  (inbox `{CONTENT_DIR}\`).

## Talking to the user

Reports and questions go in Spanish, plain words, outcomes not internals. Recording tips to repeat
when useful: send files directly (not through WhatsApp: it recompresses to 576×1024 with a variable
frame rate); frame a little wider than a selfie, with ≈ 20 % clear space above the head, eyes at
40–45 % of the height and the chin no lower than ≈ 65 %.
