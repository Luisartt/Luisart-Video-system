---
name: luisart-animaciones-pizarra
description: How to create, extend and deliver Luisart animations for @soyluisart — the white dotted board style (Santiago Castellanos grammar in the Luisart brand). Covers theme tokens, primitives (TypeOn, HandNote, HeadingPair, Drop, Show, Stage, ZoneFit, PixelBubble, RetroWindow, Tile, StickFigure), marker strokes, pixel icons and the robot Bit, safe zones, no plates behind text, sample-data labels and MXN, SFX through theme.sfx, vertical + horizontal showcase compositions, green-screen / white-board delivery, batch renders under the lock, QA, index sheets, and updating the README and CHANNEL.md. Use it whenever a @soyluisart video needs a board scene or graphic, whenever the user asks for a new animation, element, variant, icon, "una animación de…", "algo como la pizarra de Santiago", a green-screen version ("en verde para mi editor"), or when choosing which Luisart element fits a beat.
---

> **Paths.** This skill uses placeholders, defined in `brand/paths.json` (created by
> `python scripts/configurar_rutas.py`; edit that file to change them, then tell your assistant):
> `{PROJECT}` repository root · `{CHANNEL}`/`{CHANNEL_DIR}` your channel slug and folder ·
> `{VAULT}` your knowledge vault · `{CONTENT_DIR}`/`{CONTENT_INBOX}` content database and its `rawcc` inbox ·
> `{KNOWLEDGE_DIR}`/`{KNOWLEDGE_INBOX}` knowledge database and its `rawc` inbox · `{CLOUD}` cloud-storage
> folder. Resolve them before running any command (`python scripts/configurar_rutas.py --resolve <file>`
> prints this file resolved). `channels/soyluisart/` is the **reference channel shipped as an example**:
> copy from it where this skill says to; your own channel lives in `{CHANNEL_DIR}`.

# Luisart animations for @soyluisart

Luisart is THE channel style and edit system. Rules: skill `luisart-reglas` and
`{CHANNEL_DIR}/CHANNEL.md` ★. The library is `channels/soyluisart/styles/pizarra/`; its
`README.md` is the catalogue (every element, variant and key prop) and the timing and sound
reference — read it before building anything. Element API details:
[references/primitives.md](references/primitives.md).

Vault (read-routing): in `{VAULT}\wiki\Content Creation\`
read ONLY `Editing System\`, the style's folder under `Styles\` (`Luisart`, `Luisart Split`…), its
`Designs\<style>\` gallery images, that style's creators in `References\Creators\` (Santiago
Castellanos; Nick Saraev for the split) and `Videos\<YYYY-MM-DD slug>\` when building for a video.
**Never read `wiki\Knowledge\` or `{KNOWLEDGE_DIR}\`.** The library README and CHANNEL.md ★ win
over any vault page. After new library renders or a new style, copy the new index sheets / stills
(PNG only, never videos; originals stay in `out/{CHANNEL}/`) into `Designs\<style>\` and refresh
that style's gallery `Styles\<style>\<style> Gallery.md` (embeds with full vault paths
`![[wiki/Content Creation/Designs/<style>/file.png]]`; element, purpose, when to use it, SFX, clip
path in `{PROJECT}/out/`), then add one `[content]` entry to `wiki\Log.md` (format in the vault
manual `CLAUDE.md`).

## Reuse first

1. **Reuse** a library element as-is (props) — 30 elements: board-title, board-compare, waffle,
   stepper, retro-window, logo-row, clippings, polaroids, stick-dialogue, cta-follow,
   behind-head-word, captions, speaker-card, split-50, punch-in, annotate, sticky-notes, counter,
   hand-chart, calculator, mind-map, checklist, myth-fact, timeline, quote-card, price-tag,
   money-stack, bit-react, screenshot, highlighter.
2. **Derive**: a new variant (a new entry in the element's `…Variants` array) or a wrapper.
3. **Create** a new element only when nothing fits. Something built inside one video and reused a
   second time moves into the library.

In a per-video edit, board scenes are usually composed directly from the primitives (see
`videos/2026-09-27-per-barato/scenes/pizarra/Boards.tsx`), drawn on the 1080×1920 sheet and fitted
into the graphics zone by `BoardView`. Library elements are for reuse and for green-screen
delivery.

## The look (tokens in `theme.ts → piz`; never hard-code a colour or font elsewhere)

- Paper `color.paper #FFFFFF`, dots `color.dot #D5D9E2` r 2.5 every 64 px (`DotBoard`); cream
  variant `cream`/`creamDot` for press and people. Ink `ink #111111`, handwriting `handInk
  #3A3A3A`, ONE accent `accent #2F6BFF` (`accentDark`, `tint`, `tintMid`), red `alert #E5484D`
  only for "bad". UI: 4 px ink borders, hard 9 px `#D6D6D6` shadow.
- Fonts (`font.*`): `heading` Inter Tight 700 (800 for big words/numbers), `hand` Shadows Into
  Light Two, `pixel` Pixelify Sans, `label` Space Grotesk, `caption` Inter 700, `serif` Source
  Serif 4 (clippings), `mono` Space Mono. Sizes (`size.*`, vertical): heading 110, hand 70,
  behind-head 170 (auto-fit 84 % width), kicker 72, number 170, caption 54–56.
- Timing (`timing.*`, 30 fps): headings typed **1 char/frame** (block 0.5→1 over 5 f), hand note
  fades 4 f and the heading starts 3 f after it; icons drop 10 px in 4 f, siblings every 10 f,
  secondary animation +12 f; state swaps single-frame; fills 1 cell per frame. **No exit
  animations** — elements end with the cut. Hard cuts only; A-roll punch 100/115 % on cuts.
- Motion (rule i): nothing static — drift/parallax on the paper, breathing results, floating tags
  (`Drift`, `Breathe`, `Float` in the per-barato `scenes/pizarra/motion.tsx`), and **plenty of
  marker arrows** drawing on with the words.

## Hard rules for every element

- **Zones (vertical):** content inside the graphics zone **x 120–920, y 250–970**. Elements laid
  out on the whole sheet pass their measured content extent to `<Stage fit={[y0, y1]}>` (the
  `ZoneFit` wrapper scales and centres it into the zone). Nothing important below y 1436 or in the
  right 160 px of the lower half. Horizontal: graphics y 90–790, margins 140 px.
- **No plates (rule d):** no box, pill or band behind text. Text is ink on paper, or white with a
  thin outline / soft shadow over video (`videoTextShadow`, `onVideo(backing)`). Text inside a drawn
  object (price tag, bubble, sticky note, window, pixel button, tile) is fine. Highlighter =
  underline.
- **"Luisart"** never uppercased: all-caps text goes through `upperKeepName()`
  (`styles/shared/text.ts`), never CSS `text-transform`.
- **Sample data** labelled "dato de ejemplo" (a `source` prop, muted small text). Money: pesos /
  MXN, or US$ for global prices; format with `fmtMx()` (`marker.tsx`) or `formatMx()`
  (`shared/text.ts`). Never euros. Charts compute heights and totals from the data.
- **Sound:** every visual event calls `<Sfx kind="…" at={frame} on={p.sfx} />` with a kind from
  `piz.sfx` (beds with `frames`). No whooshes on elements. Map and rules: skill
  `luisart-diseno-sonoro`. A new kind of event → add a key to `piz.sfx` (file, volume, `pre` =
  `preRollFrames30` from `sfx-index.json`) and a row in the README sound map.
- **Pixel art** stays crisp: integer `px`, whole-pixel transforms, never smooth-scaled on a hold.
- **No face** on a full-board scene (rule g); face cards only in split layouts.

## Building a new element

1. File `styles/pizarra/<Name>.tsx`, modelled on a close sibling (`Counter.tsx` is a compact
   example). Export `<name>Schema = baseSchema.extend({...})` (zod, every prop described), the
   component, and `<name>Variants: Variant<Props>[]` with sample props from
   `base("board" | "cream" | "green", seconds)`. Mark variants that also make sense at 16:9 with
   `horizontal: true`; lay out with `useFormat()` (`isVertical`, `safeBox`, `zones`) — stacked on
   vertical, side by side on horizontal, never a shrunken copy.
2. Wrap everything in `<Stage backing={p.backing} safeGuide={p.safeGuide} fit={…}>`; use the
   primitives (`TypeOn`, `HandNote`, `HeadingPair`, `Drop`, `Show`, `PixelIcon`, `Bit`,
   `MarkerStroke`, …) instead of new ad-hoc motion.
3. Register it in `styles/pizarra/index.tsx`: import it and add
   `{variantsOf(format, "<element-id>", Name, nameSchema, nameVariants)}` inside `all()`. IDs
   become `SLA-piz-<element>-<variant>-v` (vertical, primary) and `SLA-piz-<element>-<variant>`
   (horizontal, only variants with `horizontal: true`), in Studio under `soyluisart/pizarra`.
4. `npx tsc --noEmit` clean.
5. Stills first (one bundle, under the lock):
   `npx tsx core/scripts/stills-locked.ts out/{CHANNEL}/pizarra/_stills SLA-piz-<element>-<variant>-v@mid …`
   and a zone check with the overlay:
   `npx tsx core/scripts/frames-locked.ts out/{CHANNEL}/pizarra/_stills SLA-piz-<element>-<variant>-v <frame> '--props={"safeGuide":true}'`.
   Look: zones, cropping, empty space, text size, no plates, labels, "Luisart".

## Deliver: render, QA, index sheets

Library clips are reusable graphics, not video deliverables (the finished videos come from
`luisart-editar-short`). Luisart library clips live in `out/{CHANNEL}/pizarra/`.


- **White board** (`backing: "board"`/`"cream"`): the showcase itself, and what edits use.
- **Green screen** (`backing: "green"`, `#00FF00`) for Luis to key over his recording in his
  editor: overlay elements (behind-head word, captions, CTA) default to green; any element can get
  a `green` variant. Logos with green in them switch to mono marks automatically (`logoSrc(k, true)`).
  `render-batch-locked.ts` renders green clips as PNG frames + yuv444p (clean key edges).
- **Alpha** (`backing: "transparent"`) only on request: `npm run render:alpha` (ProRes 4444,
  CPU encode — say so; files are large).

```bash
npx tsx core/scripts/render-batch-locked.ts out/{CHANNEL}/pizarra SLA-piz-<element>-<variant>-v SLA-piz-<element>-<variant> …
npm run qa -- out/{CHANNEL}/pizarra/SLA-piz-<element>-<variant>-v.mp4 … --allow-white
.venv/Scripts/python.exe core/scripts/py/index_sheet.py out/{CHANNEL}/pizarra --refresh SLA-piz-<element>-<variant>-v …
```

- One batch = one bundle, all IDs rendered in sequence under the render lock. Never start
  another render meanwhile.
- `--allow-white` because white-board frames read as "all-white"; any single-frame flash or
  black frame is a bug.
- List the new IDs in a new `out/{CHANNEL}/pizarra/_ids-<batch>.txt` (sets the order in the
  sheets) and keep the QA output in `_qa-<batch>.txt`, like the earlier batches.
- The sheets `_index-vertical.png` / `_index-horizontal.png` are what Luis browses: open them and
  check the new thumbnails. Retired clips go to `out/{CHANNEL}/pizarra/_retired/`.

## Keep the docs current (same turn)

- `styles/pizarra/README.md`: a row in the elements table (element, variants, what / key props),
  new sound-map rows, any new timing or layout rule.
- `{CHANNEL_DIR}/CHANNEL.md` ★: only when a RULE changes (and then update skill
  `luisart-reglas` to match). New elements don't need a CHANNEL.md line.
- Report to Luis in Spanish: what the new animation does, where the file is, the index sheet.
