---
name: luisart-configurar-estilo
description: Define, adjust or clone an EDITING STYLE for @soyluisart videos as a single style profile (layout, captions, motion, sound, colour, pacing, deliverables, exceptions to the channel rules) that the editing skill can read and apply. Use when Luisart says "quiero crear un estilo", "configura un estilo de edición", "haz un estilo como este video", "ajusta el estilo Luisart/Kallaway/…", "guarda este estilo", "quiero que los ejemplos se vean así", or after a reference analysis when he likes a pattern and wants it turned into a style or a new element. Builds the profile and a sample; does not edit a real video (luisart-editar-short / luisart-producir-desde-guion do).
---

> **Paths.** This skill uses placeholders, defined in `brand/paths.json` (created by
> `python scripts/configurar_rutas.py`; edit that file to change them, then tell your assistant):
> `{PROJECT}` repository root · `{CHANNEL}`/`{CHANNEL_DIR}` your channel slug and folder ·
> `{VAULT}` your knowledge vault · `{CONTENT_DIR}`/`{CONTENT_INBOX}` content database and its `rawcc` inbox ·
> `{KNOWLEDGE_DIR}`/`{KNOWLEDGE_INBOX}` knowledge database and its `rawc` inbox · `{CLOUD}` cloud-storage
> folder. Resolve them before running any command (`python scripts/configurar_rutas.py --resolve <file>`
> prints this file resolved). `channels/soyluisart/` is the **reference channel shipped as an example**:
> copy from it where this skill says to; your own channel lives in `{CHANNEL_DIR}`.

# Configure an editing style

A style is one folder with one readable profile. Today's styles live in
`channels/soyluisart/styles/<style>/` (`pizarra` = Luisart, `kallaway`, `terminal`, `documental`;
Luisart split is a layout of the pizarra style). The editing skill asks Luisart which style to use,
then applies that style's profile automatically. This skill makes that profile explicit so a new
style (or a variant) can be created, tuned and moved to another computer without anyone reading code.

Luisart is not technical and writes Spanish. Ask only what cannot be decided from a reference; the
AI chooses everything else and shows a sample. Channel rules win over every style except the
exceptions he explicitly approves (`{CHANNEL_DIR}/CHANNEL.md` ★ and `luisart-reglas`; the
only approved exceptions so far are Kallaway's). Never change a channel rule or pick music on his
behalf.

## The style profile

Copy `references/style-template.md` to `channels/soyluisart/styles/<slug>/STYLE.md` and fill it.
It has fixed sections so any style can be compared with another:

1. **Identity:** name (English Title Case for the wiki, Spanish alias), one-line feel, status
   (`draft` → `sample-approved` → `approved`), date, source references.
2. **Canvas and layouts:** vertical 1080×1920 / horizontal 1920×1080; layouts used (full board,
   50/50 split, face + graphic) and their share of the time; safe zones (graphics y 250–970 on
   vertical; nothing important below y 1436 or in the right 160 px of the lower half).
3. **Background and palette:** board, colours as tokens (hex), border, shadow, corners.
4. **Type:** fonts and sizes for heading, label, hand note, captions; emphasis colours.
5. **Captions:** when they show, where (face-aware, never eyes/mouth/forehead), how many words,
   what replaces them on face shots (key-shot word / behind-head word / giant word).
6. **Graphics grammar:** element catalogue, entrance timing in frames (30 fps), what each element
   is for; side-by-side "two examples" pattern if used (see below).
7. **Motion:** constant micro-motion, arrows, punches, transitions, what is forbidden.
8. **Sound:** SFX rule per event, whoosh rule, music (only Luisart's pick), loudness −14 LUFS,
   true peak ≤ −1 dBTP.
9. **Pacing:** shot length, layout change cadence, hook in the first 3 s, CTA.
10. **Deliverables:** formats and versions (default vertical + horizontal, Codex-reviewed).
11. **Exceptions to channel rules:** a numbered list; each with the date and "user decision". Empty
    unless Luisart approved it.
12. **Sample and status:** path of the sample render and its contact sheet; decisions pending.

## Steps

1. **Start from a source.** One of: (a) a reference analysed in the vault
   `wiki/Content Creation/References/Analyzed Videos/` (read its `## Editing Analysis` and
   `## What We Can Copy`); (b) an existing style to clone or tune (read its `README.md` and
   `theme.ts`); (c) a description in words. Read `wiki/Content Creation/` only (Editing System,
   Styles, Designs) — never `wiki/Knowledge/`.
2. **Ask at most three questions**, in Spanish, only for what is ambiguous: what to call it,
   which existing style it is closest to, and the one thing he most wants kept. Everything else is
   decided and listed in the profile for him to veto.
3. **Write `STYLE.md`** (template above) and, when the style needs new code, a `theme.ts` with the
   tokens. Reuse the existing primitives (`styles/pizarra/primitives.tsx`, `styles/shared/`);
   write a new element only when nothing fits, following `luisart-animaciones-pizarra`.
4. **Check against the rules.** Run `luisart-reglas` over the profile: list every clash and, for
   each, either fix it or record it in section 11 as a proposed exception (status pending).
5. **Make a sample** (a 10–15 s vertical clip with sound, through the render lock; a still or
   two for the contact sheet). Use example data marked "dato de ejemplo · MXN". Reference:
   `channels/soyluisart/prototypes/dos-ejemplos/` for a minimal standalone entry
   (`entry.tsx` with its own `registerRoot`, so a missing media file in another video cannot break
   the bundle). Look at the frames yourself and fix before showing anything.
6. **Show it to Luisart in the chat** (the video and three or four lines of what it is). Do not
   write to the wiki or register the style yet.
7. **When he approves:** set `status: sample-approved`/`approved`; register the style in
   `{CHANNEL_DIR}/CHANNEL.md` ★ "Style options" (only with his decision) and in the editing
   skill's Step 0 list; in the vault write `wiki/Content Creation/Styles/<Style>/<Style>.md` (+
   gallery; contact sheets to `Designs/<Style>/`), update `Styles Overview.md`, add a `[content]`
   line to `wiki/Log.md`, then commit and push the vault (vault `CLAUDE.md` rules). Copy the style
   folder with the project when moving to another computer (`luisart-montar-sistema`).

## Pattern bank (from approved analyses)

- **Two examples side by side** (reel "After Effects vs Opus 5", carousel "Sonnet vs Opus", sample
  2026-09-30): identical content in two tiles; each tile has an icon, a name and a small
  sub-label ("ejemplo A · …"); the second tile sits ~40 px lower and enters ~10 frames later; one
  accent colour per example (yellow vs brand blue); both run in sync on the same scale and the
  winner is circled with a marker at the end. Code: `prototypes/dos-ejemplos/DosEjemplos.tsx`.
  Keep the two tiles inside the graphics zone (y 250–970 on vertical).

Add a new pattern here only after Luisart approves its sample.

## Report to Luisart (Spanish, plain)

The name and feel of the style in one sentence, what it changes versus the closest existing style,
the sample (video), what clashes with the channel rules and needs his decision, and what happens
next if he approves.
