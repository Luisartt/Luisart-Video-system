# Kallaway — split-screen B-roll style pack

**Approved as a style option (user, 2026-09-28)** next to Luisart (the default) and the Luisart split
(Nick grammar). The grammar of Kallaway's 2026 reels (analysis, measurements and pack spec:
`media/soyluisart/automated-research/style-refs/kallaway/ANALISIS.md`, "§ Spec") re-drawn in the
Luisart brand: a straight 50/50 split with a cinematic still on top and the face below, face
close-ups with ONE giant word, few purposeful graphics, hard cuts only. "Simple but very good": the
style is mostly what it leaves out. His face, phrases, set and third-party B-roll are not used; our
B-roll is ChatGPT stills (images and illustrations only) and every text, number and layout is
built here.

Vertical 1080×1920 is primary (`SLA-kal-<element>-<variant>-v`); horizontal 1920×1080
(`SLA-kal-<element>-<variant>`) for every variant. Studio folder `soyluisart/kallaway`. Renders:
`out/soyluisart/kallaway/<ID>.mp4`; mid-clip thumbnails `_index-vertical.png` /
`_index-horizontal.png`; stills `_stills/`. Overlays (captions, hook title, counter, kinetic type)
have a green `#00FF00` variant for keying; layouts and image elements render on black; the white
screen on white. Reference edit: `videos/2026-09-27-per-barato/scenes/kallaway/`
(`SLA-2026-09-27-per-barato-short-kallaway`).

## Style exceptions (user decisions 2026-09-28; CHANNEL.md ★ and skill `luisart-reglas`)

- **Continuous seam captions** on the split (~2 words, Inter 700 46 px, white + soft shadow, no box,
  just under the seam at y ≈ 1040), even with an image on top: the top is B-roll, not text that
  repeats the speech. **Dropped** while the top half shows text that repeats the speech (a counter,
  a headline made of the words being said, kinetic words). Stack, white screen and kinetic shots
  get no caption (their text is the speech). Captions never cover the face.
- **Face shots: ONE giant word** (Inter 700 ≈ 165 px) per spoken word, dry cut on the word, placed
  with `styles/shared/captionSpot.ts`: on the chest under the chin when there is room, otherwise
  ABOVE the head (the close test selfie) — never on the forehead, eyes or mouth. It shrinks in steps
  (to 80 %) if it doesn't fit. Emotion words → Playfair Display Italic; key words → light blue
  `#7FA6FF`; "bad" words → red `#E5484D` (≤ 1 emphasis every ~5 s, a list per video). This replaces
  the key/plain face-shot rule (k) in this style: every face shot carries the giant word.
- **Motion:** sober. Only a slow push on the images (scale 1.00 → 1.06 over the shot, ±12 px pan,
  alternating in/out). No marker arrows, no 100/115 % punches, no push on the face, no transitions.
  The only other movement: the hook headline sliding in, figures sliding in / counting, typing.
- **Sound:** a click on the cut that opens each section ("Y es que…", "Pero…", "Donde…", "Antes
  de…", "Guarda…"; two click files alternating; ≤ 1 every 5 s, 3–5 per short) plus at most ONE
  subtle sound per image or counter event (each element bakes at most one). Nothing on plain cuts,
  image swaps, captions or giant words. **Zero whooshes** — the whoosh-at-start rule does not apply.
- **Colour:** brand blue replaces his gold (`accentBright #7FA6FF`, halo `ice #BFD4FF`). All other
  colour comes from the B-roll. **No face circle (PiP) over B-roll** (rule g).
- **No plates** (rule d): no box, pill, band, red headline plate or yellow highlighter band; a
  soft shadow (+ a thin outline only over light images). A darkening gradient at the bottom of an
  image is NOT allowed if it reads as a band; an image may be dimmed EVENLY (`dim`) under a counter
  or kinetic type.
- Headline and graphics inside x 120–920 / y 250–970; currency MXN with "dato de ejemplo" on
  example figures; "Luisart" never uppercased (`upperKeepName`). No music unless the user supplies
  a file (rule h).
- **Deliverables:** the channel default (vertical + horizontal) unless the user asks for fewer (the
  first draft, P/U 2026-09-28, was vertical only at his request). Horizontal geometry is ready in
  `kalGeometry(false)`; no horizontal edit has been built yet.

## Recording (what makes the look work)

His look depends on a **near-black set** (coloured practical lights, black clothes) and a **medium
shot** (face ≈ 45 % of the width, chest and hands visible, recorded wide enough to crop the bottom
half). The 2026-09-27 test take is a close selfie on a bright wall, so the pack builds a **dark set**:
the person cut-out (Robust Video Matting, `aroll-person-alpha-v2.webm`) on `StudioSet` (studio
`#0E0C0F` + a soft blue practical glow, a faint warm one and a blue backlight behind the head). On
the split the figure is small (face ≈ 185–225 px wide: its forehead must clear the seam caption and
its mouth stay above the platform UI at y 1436) and dissolves into the set through an oval
vignette. With a real dark set and a medium shot the recording can fill the bottom half as he does.

## Colours and fonts (`theme.ts → kal`)

| Token | Hex | Use |
|---|---|---|
| `black` | `#000000` | Card / stack background |
| `studio` | `#0E0C0F` | The dark set behind the person |
| `white` | `#FFFFFF` | Captions, giant word, white screen |
| `ink` | `#0B0D12` | Text on the white screen, outlines |
| `accent` | `#2F6BFF` | Caret, blue words on white, set glow |
| `accentBright` | `#7FA6FF` | His gold → key words, headline line 2, counter figures |
| `ice` | `#BFD4FF` | Halo of key words and the counter |
| `alert` | `#E5484D` | Only "bad" ("más cara") |

Fonts: **Inter 700** (captions, giant word, card titles, typed text), **Playfair Display Italic
500/600** (emotion words, thin serif of kinetic type), **Archivo 900 at 125 % width** (variable
font, `wideType()`: hook headline, big figures). Sizes (vertical): seam 46, giant word 165 (serif
175), headline ≤ 84 (auto-fit), card word 96–112, kinetic 120 / 100 / figure 150, counter ≤ 230,
white screen 190.

## Layout geometry (vertical; horizontal in `kalGeometry(false)`)

- **split**: image y 0–968 (cover, slow push); recording y 968–1920 on the set; seam caption centre
  (540, 1040); face framed per shot from `face-track.json` (static inside a shot, like his).
  Horizontal: image x 0–1152, recording x 1152–1920, seam caption above the head (1536, 150).
- **face**: the recording at 92 % anchored at the bottom centre (edges feathered into the set),
  static. Horizontal: the vertical recording as a centred figure (0.5625, x 656–1264).
- **full**: image full frame. **card**: 9:16 card x 75–1005, y 151–1766, radius 32, on black.
  Both are B-roll backdrops: the image's subject and any text stay inside x 120–920, y 250–1436.
- Target mix in a 40–45 s short: split 45–55 %, face 25–30 %, full / card / stack / white 20–25 %;
  a new image every ~1.5–2 s inside the split; a layout change every ~2 s. Hard cuts only.

## Timing (30 fps)

Headline slides in from +420 px over 45 f (`Easing.out(exp)`, half the way in ≈ 6 f), then drifts
0.3 px/f left until the cut. Counter: 26 f ease-out, final figure fixed 4 f before the word that
names it, halo breathing ±3 %. Kinetic words appear dry on their word; the main figure slides in
rotated −6° over 15 f (300 px). Stack cards appear dry on their word. Typing 1 char/frame, caret
blinks every 15 f while idle. Captions and giant words: dry cuts, no karaoke. No exits.

## Sound map (`theme.ts → sfx`; every element has `sfx`, default on)

Rule (user, 2026-09-28): a click on the cut that opens each section (placed by the edit) + at most
ONE subtle sound per image or counter event. Each element bakes at most one sound.

| Event | File (`media/soyluisart/audio/efectos/…`) | pre | Vol |
|---|---|---|---|
| Cut that opens a section (edit only; 3–5 per short, ≥ 5 s apart) | `ui/ui-click-tone-01.wav` ⇄ `ui/ui-click-mouse-close-06.wav` | 1 | 0.35 / 0.4 |
| Hook headline slides in over the first image | `ui/ui-swipe-right-01.wav` | 1 | 0.28–0.3 |
| Stack card appears (one per card) | `pop/pop-dry-03.wav` | 1 | 0.26–0.28 |
| Kinetic shot: its figure slides in rotated (or, with no figure, its first word) | `ui/ui-swipe-soft-01.wav` (or `ui/ui-click-plastic-bubble-01.wav`) | 1 | 0.28–0.3 |
| White screen: ONE typing bed on its longest line | `typing/typing-key-presses-short-02.wav` | 0 | 0.22–0.25 |
| Counter: settles (default) OR the count bed — never both | `data/data-bleep-confirm-03.wav` · `counter/counter-number-shuffle-01.wav` | 2 · 0 | 0.3 · 0.2 |
| Plain cut, image swap inside the split, caption, giant word | — | — | — |
| Whoosh | never | | |

Only if the user asks (not used by default): logo / name on white `ui/ui-tech-select-01.wav`,
emphasis word `pop/pop-sharp-01.wav`, "bad" figure `impact/impact-bass-hit-short-01.wav` (max once),
CTA word `notification/notification-bell-ding-01.wav`.

## Elements and variants (first batch)

| Element | Variants | What / key props |
|---|---|---|
| `layout` (`Layout.tsx`) | split, face, full, card | His four layouts on the dark set. `kalGeometry()`, `SplitLayout`, `FaceLayout`, `FullLayout`, `CardLayout` for edits. Props: `layout`, `image`, `trimFrom`, `set` (dark / footage), `dir`, `position` |
| `captions` (`Captions.tsx`) | seam, face-word (green) | `seamUnits()` (~2 words, short function words move to the next block), `faceWordUnits()` (one word per spoken word, < 4 f words skipped), `faceWordSpot()` (face-aware, shrinks to 80 %). Props: `words`, `serif` / `key` / `alert` lists, `face`, `hide` |
| `hook-title` (`HookTitle.tsx`) | green, split | Two-line extended caps, line 2 light blue, sliding in. `HookTitleBlock` for edits. Props: `lines`, `startAt`, `cy`, `overImage` |
| `image` (`Image.tsx`) | split-in, full-out-pan, card-dim | A still with the slow push (`KbImage`). Props: `image`, `area`, `dir`, `pan`, `dim`, `position` |
| `counter` (`Counter.tsx`) | image, green | Figure counting up (formatMx), label, source line. `CounterBlock` + `counterTiming()` for edits. Props: `label`, `value`, `from`, `decimals`, `prefix`, `suffix`, `landAt`, `source`, `image`, `area`, `sound` |
| `stack` (`Stack.tsx`) | two, three | 2–3 image cards, one word each (sans / serif / key), on the dark set (`StudioSet`, never pure black: dark cards on #000 read as a dead frame). `StackCards` for edits; per-card `dim`. Pick images bright enough to read as cards |
| `white-type` (`WhiteType.tsx`) | formula, name | Typed lines on white with a blue caret; `accent` words in blue. `TypedLines` for edits |
| `kinetic` (`Kinetic.tsx`) | image, green | Kinetic words over an image: sans / thin serif / sliding figure. `KineticLines` for edits (with the "dato de ejemplo" line under it) |

Next batch (spec §S.7, on demand): `headline` (press headline with a blue underline sweep),
`no-list` ("NO …" panels in red), `neon-card`, `blueprint`, `logo-white`, `cta` (comment KEYWORD).
`kal-pip` stays out (rule g). A long-form slide set (`kal-slide`) only if a long video is planned.

## Images (ChatGPT via the Codex CLI)

Prompts, style blocks (CINE / PLANO / NEON / METÁFORA) and sizes: ANALISIS.md §S.8. One
`codex exec` call at a time (~1–2 min each); save to
`media/soyluisart/automated-research/<video>/kallaway-gen/` and log the exact prompt in its
`SOURCES.md` (example: the P/U set and its `gen.sh`). Only images and illustrations: no text,
numbers, logos or faces inside them. Split tops are 1:1 (the subject slightly low: the platform UI
covers the top 250 px), full / card images 2:3, stack cards 3:2 or dark 1:1.
