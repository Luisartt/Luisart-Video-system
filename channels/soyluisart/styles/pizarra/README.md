> **Style name:** this style is called **Luisart** since 2026-09-29 (it was Pizarra). Technical names keep the old word: folder `styles/pizarra/`, ids `SLA-piz-*`, `PizarraLibrary`. Mascots (Bit + the repertoire) are part of the style.

# Luisart — white dotted board style pack

**The channel's MAIN style and edit system (user decision, 2026-09-27)** — every new video is
edited as a Luisart edit unless the user asks otherwise; Terminal and Documental are secondary.
Reference edits: `videos/2026-09-27-per-barato/scenes/pizarra/` — full board
(`SLA-2026-09-27-per-barato-short-pizarra`) and the split-screen layout in Nick Saraev's grammar
(`SLA-2026-09-27-per-barato-short-split`: graphic in the top band, face card at the bottom with the
head breaking out, alternating with full board and face close-up).

Originally the third style for @soyluisart (2026-09-27). The editing grammar of Santiago Castellanos (analysis:
`media/soyluisart/automated-research/style-refs/santiago/ANALISIS.md` §10–12) re-drawn in the
Luisart brand: white dotted pizarra, grotesk heading + thin handwritten note, pixel-art icons,
retro-brutalist UI, one electric-blue accent. His face, name, logo, blue mascot and catchphrases
are not used. Our AI character is **Bit** (a blue boxy terminal robot with a screen face, drawn in
code, `pixel.tsx`).

Vertical 1080×1920 is primary (`SLA-piz-<element>-<variant>-v`); horizontal 1920×1080
(`SLA-piz-<element>-<variant>`) where it makes sense. Studio folder `soyluisart/pizarra`.
Renders: `out/soyluisart/pizarra/<ID>.mp4`; mid-hold thumbnails `_index-vertical.png` /
`_index-horizontal.png`; stills `_stills/`; font test `_font-ab.png`; icon catalogue
`SLA-piz-icon-sheet` (`_stills/SLA-piz-icon-sheet.png`).

## Board and colours (`theme.ts`)

Paper `#FFFFFF`, dots `#D5D9E2`, radius 2.5 px, every 64 px, centred (first dot (28, 32) on
vertical, (32, 28) on horizontal), no texture. Static in the library clips; in an edit it drifts slowly
behind the content (parallax, user 2026-09-27 — see "Dynamic, never static"). Cream variant `#F3EFE4` / `#D8D1BF`
(`backing: "cream"`) for press and people. Ink `#111111`, handwriting `#3A3A3A`, accent `#2F6BFF`
(`#1F4FD1` for thin strokes / blue handwriting, tints `#DCE6FF` / `#A9C4FF`), red `#E5484D` only
for warnings / "bad". UI: 4 px ink borders, hard 9 px `#D6D6D6` shadow, bar `#F4F4F4`.

## Fonts (A/B still: `out/soyluisart/pizarra/_font-ab.png`)

| Role | Chosen | Why |
|---|---|---|
| Headings, big words | **Inter Tight 700** (800 for the behind-head word / big numbers) | Closest to his Helvetica-Bold look; 800 and Archivo read too heavy/wide |
| Handwriting | **Shadows Into Light Two** | Tall, thin monoline marker like his; Nanum Pen's accents looked wrong, Gaegu too round |
| Pixel labels (+SEGUIR, rank numerals) | **Pixelify Sans 700** | Silkscreen is much wider than his button lettering |
| Technical labels | **Space Grotesk 700** | Matches "LOS QUE DESTACAN" |
| Captions / UI text | **Inter 700** | Same as his captions |
| Clippings headlines | Source Serif 4 700 | Newspaper serif |

Sizes (vertical): headings 110, handwriting 70, captions 54–56 (face shots only; none in splits), behind-head word 170
(auto-fit to 84 % width), kicker 72.

## Timing rules (30 fps)

- **Hard cuts only, no transitions.** Elements have no exit animation: they end with the cut.
  Whooshes only at a video's start and on real transitions.
- Heading: typewriter **1 char/frame**, block opacity 0.5 → 1 over 5 f; the hand note fades in 4 f
  with a subtle left→right write-on, and the heading starts 3 f after it.
- Icons: fade + 10 px drop in 4 f (ease-out, whole pixels), siblings every **10 f**, secondary
  animation (rays, checks) +12 f. State swaps (toggle, active step, expression) are single-frame.
- Waffle / stepper fills: 1 cell per frame. Bubbles and chat prompts type at 1 char/frame.
- Captions: 2–4 words per chunk (ends on punctuation or a >0.35 s pause), hard swap, active word
  blue from its own start; placed by the rules below (caption zone, never over the face).
- **Two kinds of face shot (user, 2026-09-27, final):** KEY face shots (the hook, the thesis, the
  pivot, the CTA — about 4–5 per 40 s) carry a big behind-head word or a hook title at the top of
  the graphics zone and NO captions; every other face shot has no big word and HAS captions. In an
  edit, mark the behind-head groups `key: true` and show only those (reference `groups.ts`).
- **No captions while any graphic is on screen** (animation, board, title, figure, arrow, icon,
  behind-head word/kicker, CTA element); never in a split layout; never a run under 12 frames.
  Gate the caption layer with `makeCaptionGate(windows, total)` (reference `captionRule.ts`).
- **Caption placement on face shots:** face-aware, inside the safe area, never over the forehead,
  eyes or mouth: (1) between the neck and the chest on a medium shot; (2) above the head when that
  fits better (close selfie with the chest under the platform UI); (3) the nearest clear spot to the
  caption zone; else reframe slightly. Shared logic: `styles/shared/captionSpot.ts`; face boxes from
  `core/scripts/py/face_track.py`; check with the reference edit's `checkCaptions.ts`.
- **Deliverables: vertical + horizontal** (user, 2026-09-27): the horizontal 1920×1080 edit keeps
  the board full frame (scene centred in y 90–790) and shows face shots as a centred vertical panel
  (reference `HorizontalShort.tsx`).
- **Zones (user rule 2026-09-27, `ZONES` in `styles/shared/formats.tsx`; the face overrides the
  caption zone):** captions with no face to avoid in x 120–900, y 1000–1300; board content, behind-head words and
  icons in the graphics zone x 120–920, y 250–970 (the reference edit fits each full scene into
  it); nothing important below y 1436 or in the right 160 px of the lower half. Check stills with
  `SafeZoneGuide` before rendering (the reference compositions take `safeGuide: true` and
  `captionTest: true`; `core/scripts/frames-locked.ts … --props={"safeGuide":true}`).
  Every vertical element keeps its content in the graphics zone: elements laid out on the whole
  sheet pass their measured content extent to `<Stage fit={[y0, y1]}>` (`ZoneFit` in
  `primitives.tsx`), which scales/centres it into y 250–970 (BoardCompare, MythFact, Timeline,
  HandChart, MoneyStack, PriceTag, ScreenshotFrame, StickDialogue, Waffle, Calculator; Split50 lays
  out inside the zone directly).
- **Dynamic, never static (user, 2026-09-27):** slow push-in on the A-roll (+3.5 % per shot on
  top of the 100/115 % punch), board paper drifting at 40 % of the content's drift (parallax,
  +2.8 % over a scene), results breathing (±3.5 %), icons/tags floating (±5 px), and hand-drawn
  marker arrows drawing on with the words (`curvedArrow`/`doubleArrow` in the reference edit's
  `Marker.tsx`; the library's `marker.tsx` has the same idea), each with `efectos/marker/`
  (`marker-pen-line-01` for arrows/underlines, `marker-chalk-line-01` for underlining figures,
  `marker-pencil-letters-01` for a handwritten note).
- **Punch-in** (`PunchIn.tsx`): the A-roll jumps 100 % ↔ 115 % **on a cut**, never animated.
  Use it on turns, questions and numbers, alternating every 1–2 A-roll segments
  (`punchAt(t, cuts)`; demo `SLA-piz-punch-in-demo-v`). `behind-head-word` has `punch`.
- Pixel art is drawn as SVG runs with `crispEdges` at integer pixel sizes: never scale it
  smoothly on a hold.

## Sound map (`theme.ts → sfx`; every element has `sfx`, default on)

From `media/soyluisart/audio/GUIA-EFECTOS.md`. Each file starts `pre` frames before its visual
event (its measured hit frame), so the hit lands on the frame the element appears; if that falls
before frame 0 the file's head is trimmed. Typing beds run from the first to the last character
(4-frame fade-out). No whooshes on elements.

| Event | File (`efectos/…`) | pre | vol |
|---|---|---|---|
| Typed heading / prompt / bubble text | `typing/typing-mechanical-run-01.wav` | 0 | 0.25 |
| Behind-head word typed / on the cut | `typing/typing-key-presses-short-02.wav` / `typing/typing-mechanical-key-single-01.wav` | 0 / 1 | 0.3 |
| Chip, step change, toggle click, waffle start | `ui/ui-click-mouse-01.wav` | 1 | 0.3 |
| Logo selector hops | `ui/ui-click-mouse-02.wav` | 1 | 0.25 |
| Pixel icon / tile / tag appears | `pop/pop-soft-01.wav` | 1 | 0.3 |
| Result lands (waffle full, check line, selector lands) | `notification/notification-ding-keyword-01.wav` | 1 | 0.3 |
| CTA "+SEGUIR" pops | `notification/notification-bell-ding-01.wav` | 0 | 0.3 |
| Money figure (board-title number) | `money/money-coins-clink-01.wav` | 2 | 0.3 |
| Press clipping slides in | `paper/paper-quick-move-01.wav` | 5 | 0.35 |
| Polaroid pair | `camera/camera-shutter-vintage-02.wav` | 3 | 0.4 |
| Screenshot lands | `camera/camera-shutter-hard-01.wav` | 1 | 0.4 |
| Marker stroke starts (circle, arrow, underline, tick, rule, winner circle) | `marker/marker-pen-line-01.wav` | 1 | 0.4 |
| Strike-through / red cross | `marker/marker-chalk-line-01.wav` | 1 | 0.35 |
| Timeline line being drawn / highlighter sweep (beds, cut to the stroke) | `marker/marker-whiteboard-write-02.wav` / `marker/marker-highlighter-01.wav` | 0 | 0.22 / 0.35 |
| Timeline point | `clock/clock-tick-single-01.wav` | 2 | 0.35 |
| Sticky note / price tag lands | `paper/paper-slap-drop-01.wav` | 4 | 0.4 |
| Number counting up / settles | `counter/counter-score-casino-01.wav` bed / `data/data-bleep-01.wav` | 0 / 1 | 0.3 |
| Money stack counting / settles | `counter/counter-banknote-02.wav` bed / `money/money-bag-drop-01.wav` | 0 / 1 | 0.3 / 0.25 |
| "FALSO" (myth) / "REALIDAD" (fact) | `correct-wrong/wrong-buzz-02.wav` / `correct-wrong/correct-notification-01.wav` | 1 / 1 | 0.3 / 0.35 |
| Winning price, good total | `money/money-cash-register-kaching-01.wav` | 5 | 0.3 |
| Checklist complete | `reaction/reaction-success-chime-01.wav` | 10 | 0.3 |
| Chart point | `pop/pop-minimal-01.wav` | 1 | 0.18 |
| Bit thought bubble | `bubble/bubble-pop-03.wav` | 1 | 0.4 |
| Spare: stamp / error / coin | `misc/misc-stamp-01.wav` / `reaction/reaction-error-buzzer-01.wav` / `money/money-coins-clink-01.wav` | 1 / 1 / 2 | |
| Transitions / video start only | `whoosh/whoosh-air-fast-04.wav` | 12 | 0.35 |

The marker / paper / counter / correct-wrong / clock / camera / bubble files peak ~3 dB lower than
the older ones; their volumes follow `sfx-index.json` (already ≈ +3 dB).

Captions carry no sound (guide: none per chunk).

**Text rule:** captions and on-screen text never sit on a black box, plate, pill or band — plain
bold text, made readable by colour (ink on the board) or a stroke / soft shadow over video. UI objects
that ARE the graphic keep their fill: the "+SEGUIR" button, retro windows and their input fields,
speech bubbles, tiles, sticky notes, price tags, paper clippings.

## Elements and variants

Common props: `backing` (`board` | `cream` | `green` | `transparent` | `aroll` preview), `seconds`,
`sfx`, `safeGuide` (Studio only). Board elements default to their own board; overlays default to
green (render with `--pixel-format=yuv444p --image-format=png`).

| Element | Variants | What / key props |
|---|---|---|
| `board-title` | `icon`, `bit`, `number`, `plain` (v + h) | "EXCUSA 1 / no sé por dónde empezar" (sample prices in US$ for global products, pesos/MXN for local ones): `heading`, `accent` (blue words), `note`, `mode`, `icon`, `rays`, `expression`, `number`, `source` |
| `board-compare` | `antes-hoy`, `bien-mal` (v + h) | Halves split by an ink divider (stacked / side by side): `before`, `after` {heading, note, icons}, `afterAt`, `afterTone` accent\|alert |
| `waffle` | `single` (10×10), `compare` (20×5 ×2) (v + h) | Cells fill 1/frame: `rows[{label, heading, value, at, tone}]`, `total`, `cols`, `source` |
| `stepper` | `3-steps`, `5-steps` (v + h) | Tiles + dashed line, active blue, done green check; big icon + "PASO n" + note retype on each swap: `steps[{icon,label,note,at}]`, `word` |
| `retro-window` | `chat`, `settings` (v + h) | Prompt typed with block caret + attachment tiles; settings card where a pixel cursor clicks a toggle and "✓ …" lands |
| `logo-row` | `4-logos`, `6-logos` (v + h) | Original logo files in ink-framed tiles; blue selector hops (`hopFrames`) and lands on `select` with its name |
| `clippings` | `press` (v + h, cream) | Torn-edge paper cut-outs (serif headlines), stacked every `stagger` f; sample text is fictional and labelled |
| `polaroids` | `six` (v + h, cream) | ±3° polaroids dropping in pairs, hand caption; `images` (empty = illustrated placeholder, never real people), `captions`, `note` |
| `stick-dialogue` | `human-ai` (v + h) | Stick figure + Bit, pixel bubbles typed with the active word underlined: `lines[{who,text,at,pose,expression,humanExpression?}]`, `stickVariant?` (`marcador`/`pixel`/`caracter`, default `caracter`) |
| `cta-follow` | `button`, `button-aroll` (preview), `ranking` (v; button/ranking also h) | "+SEGUIR" pixel button hard-pops on `popAt` with Bit + kicker; ranking = "TOP N" + logo tiles, each with a plain blue pixel numeral (ink outline, no badge box since 2026-09-27) on its corner. Green: Gemini/Copilot switch to their one-colour marks |
| `behind-head-word` | `composite`, `composite-punch`, `two-tone-typed` (v, over the test A-roll + matte), `green`, `green-two-tone` (v + h) | Kicker (in front of the person) + giant blue word (behind the head) + optional `line1`/`tail`; `reveal` cut\|type, `wordPunch`, `punch`, `aroll`, `matte`, `centerY` |
| `captions` | `aroll` (green, v + h), `aroll-preview`, `aroll-hide` (v) | Talking-head captions only: white + thin ink outline, no plate, in the caption zone; `hide[{start,end}]` = seconds with a graphic on screen (no captions there), `face{x0,y0,x1,y1}` = the take's face box (never covered; line moves to the nearest clear spot, `shared/captionSpot.ts`). `words`, `maxWords`, `highlight`, `fontSize`, `offset`. Board mode removed (old `board*` renders moved to `out/soyluisart/pizarra/_retired/`) |
| `speaker-card` | `card`, `off` (v) | Allowed only on A-roll stretches, i.e. the split layout while he is on camera — never on a full-board scene (rule g: a full board shows no face, card or cut-out): board on top, A-roll in a rounded card (87 % wide, r 20) with the head breaking out above it via the matte; `enabled` false = no card (board centred). No captions (a graphic is always on screen). `cardTop`, `videoScale`, `videoTop`, `trimSeconds` |
| `split-50` | `graphic-top` (v) | Graphic half (content in the graphics zone) + A-roll half, thin ink line. No captions (a graphic is always on screen). `aroll-top` retired (its graphic sat in the caption band; old render in `_retired/`) |
| `punch-in` | `demo` (v) | Hard 100/115 % alternation on cuts |

**Second batch** (all v + h; marker strokes in `marker.tsx`: wobbly circles, arrows, lines, ticks drawn on):

| Element | Variants | What / key props |
|---|---|---|
| `annotate` | `circle-strike`, `circle` | Statement card; blue marker circles a value, arrow to a hand note, optional red strike: `rows`, `target`, `strike`, `note`, `circleAt` |
| `sticky-notes` | `stack`, `grid` | Coloured notes with tape, hand text, landing in turn: `notes[{text,color}]`, `layout`, `every` |
| `counter` | `pesos`, `percent` | Count-up in Mexican format + marker underline + note: `value`, `from`, `decimals`, `prefix`, `suffix`, `countSeconds`, `startAt` |
| `hand-chart` | `bars`, `line` | Marker axes, hand bars or line, hand value labels; heights computed from `data` |
| `calculator` | `budget`, `card-debt` | Lines land with clicks, marker rule, total computed from the lines: `items[{label,amount}]`, `totalTone` |
| `mind-map` | `4-nodes`, `6-nodes` | Centre idea + marker branches to pixel tiles |
| `checklist` | `3-items`, `5-items` | Hand-drawn boxes, blue ticks drawn in on each beat, chime at the end |
| `myth-fact` | `barata`, `ia-trabajo` | MITO (red + "FALSO" stamp) / REALIDAD (blue + check) split |
| `timeline` | `4-points`, `5-points` | Marker line drawn on, points pop with year + hand label |
| `quote-card` | `buffett`, `cream` | Big blue quote mark, words appear one by one, key words underlined, author in hand |
| `price-tag` | `pu`, `plans` | Hanging paper tags; winner circled (ka-ching), losers crossed |
| `money-stack` | `grow`, `compare` | Pixel peso-bill stacks growing bill by bill with the amount counting; heights from amounts |
| `bit-react` | `thinking`, `idea`, `warning` | Bit with a thought cloud / bulb + rays / warning sign |
| `screenshot` | `browser`, `phone` | App/web capture in a retro browser or phone frame, marker circle on `region` + arrow + note (`image` empty = neutral mock) |
| `highlighter` | `blue`, `yellow` | Solid marker UNDERLINE drawn left→right under key phrases of a paragraph (never a band behind the text) |

Test footage for the A-roll showcases: `media/soyluisart/automated-research/2026-09-27-per-barato/`
(`aroll-1080x1920.mp4` + `aroll-person-alpha-v2.webm`, VP9 alpha). With a real video, pass the
video's own A-roll/matte paths and time every `at` from its words.

## Mascot element (2026-09-29)

`mascot` (`Mascot.tsx`): any character of the mascot repertoire (139 pixel characters: Bit colour variants, finance figures, and figures + a themed Bit per content category, including Stock exchange and CFA; wiki page *Mascot Repertoire*) with one of 6 faces (`feliz sorpresa pensando enojado guino sueno`), optional second face at `changeAt` for a reaction, a hand note under it. IDs `SLA-piz-mascot-<variant>[-v]`, 16 variants defined in code (lupa, toro-oso, bit-ia + 13 by theme: campana, pantalla, medalla, calculadora, termometro, embudo, engrane, trofeo, nopal, dado, foco, pastel, bit-ejecutivo). Only stills of `lupa`, `toro-oso`, `campana`, `dado`, `nopal` and `bit-ejecutivo` were checked; **no clips are rendered for the 13 thematic variants yet** (render on request). Keys and paths: `mascotIndex.ts` (generated by `media/soyluisart/brand/mascots/catalogo.py`); PNGs in `media/soyluisart/brand/mascots/` (publicDir is `media`). Bit remains the channel mascot; these are extras for variety. Checked with stills of `SLA-piz-mascot-lupa-v`; not yet used in a finished video.

## Thematic graphics (2026-09-29)

Finance, stock-exchange, CFA, business, strategy and AI diagrams, built to cover the channel's themes (vertical `-v` + horizontal; shared helpers `financeKit.tsx`, `diagramKit.tsx`; mascots from the repertoire react on a beat). Sample data is labelled "dato de ejemplo". Not yet reviewed by an external reviewer (Codex was out of quota and the user cancelled the external review); checked by the builders with stills and QA only. Details, sound notes and clip paths: `_notes-A.md`, `_notes-B.md`.

| Element | Variants | What / key props |
|---|---|---|
| `candles` | `alcista`, `crash` | Hand-drawn candlestick chart drawn candle by candle from `data` (open/high/low/close; up blue, down red), marker axes, price ticks computed from the data; the change first open → last close is computed and lands big (+ding / thud) while the mascot (`f08-toro` / `f09-oso`) swaps face; marker circle on `target` (`last` / `maxDrop` / `maxRise`) + arrow from the hand note. `prefix`, `period`, `source` |
| `ticker` | `indices`, `acciones` | Retro-window price board: rows of fictional `symbol` · `name` · price · change with pixel up/down/flat arrows, landing in turn; `update` ticks one price (its change is recomputed from the previous close) with an underline, circle and arrow from the note; a paper ticker tape scrolls the same rows the whole time. `windowTitle` carries "dato de ejemplo"; `mascot` only on horizontal |
| `donut` | `portafolio`, `presupuesto` | Donut slices grow one after another from 12 o'clock with legend rows (hand labels + % by largest remainder, always 100 %); the centre total adds each slice as it grows; the `highlight` slice pops out (+ding, or thud when its tone is `alert`), its row is circled, arrow from the note; optional `mascot` (`canasta-base`, `pastel-base`) reacts. Tones: accent / dark / mid / tint / ink / grey / alert (red = bad only) |
| `gauge` | `inflacion`, `riesgo` | Half-ring dial of coloured `zones` (labels written along the ring), marker ticks with numbers; the needle springs to `value` (overshoots, settles) while the big figure counts up (Mexican format, `suffix`), then the zone it landed in is typed as the verdict word (stamp, or thud for a red zone), the mascot (`termometro-base`, `dado-base`) reacts and an arrow brings the note to that zone |
| `formula` | `pu`, `balance`, `valor-tiempo` | Big typeset formula whose terms appear one by one, each with a blue marker underline and its legend row (symbol · hand note · example value); arrow to the worked `result` (computed in the variant from the example numbers: P/U = 200 ÷ 20 = 10 veces; $300,000 + $200,000 = $500,000; VF = 10,000 × 1.1⁵ = $16,105.10) that lands with a ding / ka-ching and a double underline while the CFA mascot (`libro-base`, `calculadora-base`) reacts. `formula[{t, op, sup, br}]` (`br` = new line on vertical), `legend[{term, symbol, note, value}]` |
| `exam-question` | `cfa-etica`, `cfa-bonos` | CFA-style multiple-choice card: stem typed (3 chars/frame) in a retro window titled "… · pregunta de ejemplo", options A/B/C land, a pixel cursor clicks the `trap` (red border + red marker cross, buzz, mascot surprised) then the `answer` (blue border + blue tick, correct chime, mascot happy), arrow + hand note with the `reason`. Textbook facts only (material non-public information must not be used; bond prices move opposite to rates). Mascots `birrete-base`, `bit-cfa-base` |
| `curve` | `frontera`, `rendimientos` | Marker line charts scaled from the data. `frontera`: assets pop as dots with hand labels (`pos`), the efficient frontier ("bullet") is drawn on, the capital line from the risk-free point, and the frontier point with the best (return − rf) / risk — computed — pops, is circled and labelled "mejor relación". `rendimientos`: the normal yield curve draws on in blue, then turns into a dashed ghost as the inverted curve draws on in red (thud); its short end keeps pulsing. Arrow from the note; `mascot` only on horizontal |
| `snowball` | `interes-compuesto`, `ahorro` | Compound-interest bars per year, capital (light blue) under interest (blue), all computed from `principal`, `contribution` (end of each year), `rate`, `years` (exported `snowballSeries()`); the MXN figure counts the balance bar by bar and lands with a ka-ching, the legend shows the computed totals, a curved marker arrow runs from the first bar to the last, the coin mascot (`f03-moneda`) rolls in (two turns, upright at rest) |
| `funnel` | `ventas`, `contenido` | Pixel funnel (stepped bands, ink border + hard shadow) dropping in top → bottom, each number counting up inside its band; marker arrows on the right with the conversion % computed from the data (value ÷ previous); pixel people pour into the mouth and a few drip out of the spout (constant motion); last stage circled, final hand note with `{total}` = last ÷ first; mascot reacts (`bit-vendedor-base` / `embudo-base`). `stages[{label,value}]` (3–5), `every`, `note`, `source` ("dato de ejemplo"), `mascot`, `mascotFrom`/`mascotTo` |
| `flywheel` | `bueno-a-excelente`, `negocio` | Jim Collins' flywheel: 4–5 cards on a circle, then one marker arrow per push along the circle (the last closes the loop) while the wheel in the middle turns faster with every push (speed from the push count); the `engrane-base` mascot in the hub goes asleep → thinking → happy; a blue dot keeps running round the loop; hand note (horizontal: note in the right column with an arrow to the loop). `nodes[{label,icon}]`, `every`, `note`, `mascot`, `faceStart`/`facePush`/`faceEnd` |
| `pyramid` | `capital`, `prioridades` | Stepped pixel-brick pyramid built from the base up, one brick per frame (masonry rows), each layer framed and labelled when complete; top layer blue, circled in marker, breathing; side hand notes with arrows to the top; foot note. `layers[{label}]` base first (3–5), `leftNote`, `rightNote` (ignored when a mascot is set), `footNote`, `mascot` (optional; `bit-estratega-base` on `prioridades` = Maslow), `faceStart`/`faceEnd` |
| `venn` | `dos`, `tres` | 2 or 3 hand-drawn marker circles drawn one by one with their labels in their own lobes; the common area (lens / centre of three = hedgehog concept) fills blue, the `foco-base` mascot drops in, a marker tick and a hand note with an arrow pointing into it. `circles[{label}]` (2–3), `every`, `note`, `mascot`, `faceStart`/`faceEnd` |
| `flow` | `agente-ia`, `automatizacion` | Process chain: 3–4 pixel cards (icon or mascot + label + hand note), one row on horizontal, a two-column snake on vertical, joined by marker arrows; a data packet travels along the arrows, the card it is in turns blue, in the "thinking" card the mascot goes asleep → thinking (3 dots light up) → happy; tick + hand note on the last card; the packet keeps looping silently. `nodes[{label,note,icon,mascot}]`, `thinkIndex`, `finalNote` |
| `matrix` | `riesgo-impacto`, `urgente-importante` | 2×2 matrix: marker axes with arrowheads and hand labels (y reads bottom → top), the cross drawn on, quadrant names typed, example cards drop into their quadrant and float; the winning quadrant's cards are circled in blue and its name turns blue; mascot reacts (`dado-base` / `f12-reloj-arena`). `xLabel`, `yLabel`, `quadrants` [tl, tr, bl, br], `items[{text,q}]`, `winner`, `note` |
| `scale` | `pros-contras`, `etica` | Pixel balance (post, base, beam, level plates): labelled weights drop one by one onto their side and each landing tips the beam with a spring wobble; the tilt is computed from the weights (right − left), the heavier side wins: marker tick, title turns blue, mascot reacts, note with `{winner}`; idle sway after it settles. `left`/`right` {title, tone accent\|alert\|ink}, `tokens[{side,text,weight 1–3}]`, `every`, `note`, `mascot` (`bit-estratega-base` / `brujula-base`) |
