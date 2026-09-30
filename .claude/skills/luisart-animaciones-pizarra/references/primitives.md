# Luisart building blocks — API reference

Paths are relative to `channels/soyluisart/`. Import primitives from
`styles/pizarra/primitives.tsx` (it re-exports `pixel.tsx` and `useFormat`), the theme from
`styles/pizarra/theme.ts`.

## Contents
- Schema and stage
- Text
- Motion and state
- Pixel UI, icons and Bit
- Marker strokes
- Micro-motion (edit-level)
- Sound
- Layout helpers
- Text and number helpers
- Logos

## Schema and stage (`primitives.tsx`)

| Export | Use |
|---|---|
| `baseSchema` | zod: `backing` (`board` \| `cream` \| `green` \| `transparent` \| `aroll`), `seconds` (1–20), `sfx`, `safeGuide`. Extend it per element. |
| `base(backing, seconds)` | Default base props (`sfx: true`, `safeGuide: false`). |
| `Variant<P>` | `{ id, props, horizontal? }` — one showcase composition per entry. |
| `Stage` | `backing`, `safeGuide`, `fit?: [y0, y1]`, `aroll?`: draws the board / cream / green / test A-roll, fits the content into the graphics zone (`ZoneFit`, vertical only) and shows the `SafeZoneGuide` overlay when `safeGuide`. |
| `ZoneFit` | The fit on its own: content measured at y0–y1 on the 1080×1920 sheet is scaled (never up) and centred into y 250–970. |
| `DotBoard` | `variant?: "white" \| "cream"` — the dotted paper, dots centred with symmetric margins. |
| `ARollVideo` | `src`, `punch?` (115 %), `transparent?`, `trimBefore?` — muted `OffthreadVideo`, origin 50 % 38 %. |
| `onVideo(backing)` | True for `aroll` / `green` / `transparent`: use white text + `videoTextShadow` instead of ink. |
| `TEST_AROLL`, `TEST_MATTE` | The per-barato test footage for A-roll showcases. |

## Text

| Export | Use |
|---|---|
| `TypeOn` | `text`, `at`, `accent` (space-separated words drawn blue), `color`, `fontSize`, `fontFamily`, `weight`, `align`, `solid` (no 0.5→1 fade; for green/alpha), `caret`, `cps` (chars/frame, default 1). Lays out the full text from frame 0 so centred lines never shift. |
| `HandNote` | `text`, `at`, `color`, `fontSize`, `align`, `solid`, `shadow`: Shadows Into Light Two, 4 f fade + left→right write-on. Pad it (`padding: "0 14px"`) so swashes aren't clipped. |
| `HeadingPair` | `heading`, `note`, `at`, `accent`, sizes, `align`, `maxWidth`: note on the beat, heading typed 3 f later. |
| `PixelBubble` | `text`, `at`, `fontSize`, `maxWidth`, `tail` (`left`/`right`/`none`), `sfx`: pixel speech bubble, typed with the active word underlined (typing bed included). |
| `Caret` | Block caret (`blink?`). |

## Motion and state

| Export | Use |
|---|---|
| `Drop` | `at`, `px` (10), `frames` (4), `solid`: fade + small drop, whole pixels. Before `at` it keeps its layout space (hidden). |
| `Show` | `at`: hard appear (state swaps, pops). |
| `clamp` | Interpolate clamp options. |
| `piz.ease.out` | easeOutCubic for draw-ons and counts. |

## Pixel UI, icons and Bit (`primitives.tsx`, `pixel.tsx`)

| Export | Use |
|---|---|
| `PixelIcon` | `name`, `px` (integer), `shadow`: icons `bulb coin robot brain rocket calendar clock warning check cross lock mail phone play star question arrow sparkle` (catalogue still: composition `SLA-piz-icon-sheet`). New icon = a string grid in `ICONS` using `PALETTE` letters (`K` ink, `W` white, `B` accent, `N` accent dark, `b`/`l` tints, `Y`/`y`/`o` yellow, `G`/`g`/`D`/`d` greys, `R`/`r` red, `V`/`v` green). |
| `PixelArt` | Any string grid → crisp SVG runs. |
| `Bit` | `px`, `expression` (`happy`, `neutral`, `surprised`, `sad`), `bob`, `shadow`, `seed`: the channel's own AI character (blue boxy terminal robot). Never Santiago's mascot. |
| `PixelButton` | `label` ("+SEGUIR"), `fontSize`, `fill`, `textColor`. |
| `RetroWindow` | `title`, `width`, `titleSize`, `square`: 4 px ink border, hard grey shadow, title bar with three square buttons. |
| `Tile` | `size`, `border`: ink-framed tile with hard shadow (logos, attachments). |
| `StickFigure` | `h`, `pose` (`stand`/`wave`/`question`/`point`), `flip`, `variant` (`marcador` marker line · `pixel` · `caracter` solid head, eyes without pupils, default), `expression` (`happy`/`surprised`/`thinking`/`angry`/`wink`/`sleepy`). Approved by Luisart 2026-09-30; file `StickFigure.tsx`. |
| `FloorShadow`, `TAIL_DOWN` | Helpers. |

## Marker strokes

Library (`styles/pizarra/marker.tsx`): `roughEllipse`, `roughLine`, `roughArrow` (returns
[shaft, head]), `tickPath` → path strings; `MarkerStroke` (`d`, `at`, `frames` = 10, `color` =
accent, `width` = 9) draws one path on; `MarkerLayer` = full-canvas SVG for them; `fmtMx()`.

Per-barato edit (`videos/2026-09-27-per-barato/scenes/pizarra/Marker.tsx`, canvas 1080×1920):
`handLine`, `handEllipse`, `handArrow`, `curvedArrow(x1,y1,x2,y2,seed,bend,head)` (bend sign =
side), `doubleArrow`, and `Marker` (`d: string | string[]`, draws the paths one after another
over `frames`). Use these for arrows in an edit: element → next element, price → result, curved
A ↔ B, note → object. Every stroke gets a marker SFX on its first frame.
**Reuse note:** the second video that needs them should move `Marker.tsx` (and `motion.tsx`)
into `styles/pizarra/` and import them from there (reuse rule).

## Micro-motion (edit-level, `videos/2026-09-27-per-barato/scenes/pizarra/motion.tsx`)

`progress(frame, from, to)`; `Drift` (`from`, `to`, `depth`: slow push-in + drift of a layer —
paper at `depth 0.4` under content at 1 = parallax); `Breathe` (`at`, `amp` 0.035, `period` 45:
results); `Float` (`px` 5, `period` 34, `phase`: tags and cards).

## Sound

`Sfx` (`kind` = a key of `piz.sfx`, `at`, `frames?` for beds, `on`, `volume?`). Keys: type,
typeShort, key, click, tap, pop, ding, bell, stamp, coin, error, bleep, kaching, bagDrop, chime,
thud, minimal, marker, strike, markerWrite, highlight, note, paper, counter, countMoney, wrong,
correct, tick, shutter, snap, bubble, whoosh (transitions only). See skill `luisart-diseno-sonoro`.

## Layout helpers (`styles/shared/formats.tsx`)

`FORMATS` (sizes, fps, safe margins), `ZONES` (`graphics`, `captions` boxes per format),
`useFormat()` → `{ name, isVertical, width, height, safe, safeBox, scale, zones }`,
`SafeZoneGuide` (preview overlay; never in deliverables).

## Text and number helpers (`styles/shared/text.ts`)

`upperKeepName(s)` — all caps except "Luisart" and @handles. `formatMx(value, decimals)` —
1,284.50 with a real minus sign.

## Logos (`primitives.tsx`)

`LOGOS` (chatgpt, claude, gemini, perplexity, deepseek, grok, copilot, cursor, mistral,
midjourney, n8n, zapier — original files in
`media/{CHANNEL}/automated-research/logos/`), `logoSrc(key, keySafe)` (mono marks over green),
`logoField`. Logos are shown unmodified.
