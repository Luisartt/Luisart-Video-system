# Notes A — finance / stock-exchange / CFA elements (2026-09-29)

Eight new Luisart elements (agent A). All variants are vertical + horizontal, laid out straight
inside the graphics zone (vertical x 120–920 / y 250–970, horizontal x 140–1780 / y 90–790) — no
`ZoneFit` scaling, so pixel art and mascots stay on whole pixels (mascot sizes are multiples of 32).
Shared helpers live in the new file `financeKit.tsx` (Breathe / Float — same maths as the per-barato
`motion.tsx` —, `MascotSprite` (mascot with a single-frame face swap on a beat and a two-frame bob),
`MarkerArrow` (shaft + head drawn on), `ZoneHeading`, `SourceLabel`, pixel cursor / up / down / flat
arrows, `niceStep`). `index.tsx`, `theme.ts`, `primitives.tsx` and `README.md` were not touched; no
new SFX kinds.

## README catalogue rows (third batch — finance, stock exchange, CFA)

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

## Sound map notes (only existing `piz.sfx` kinds)

| Event | Kind |
|---|---|
| Candles drawn one by one / curve or frontier drawn on / inverted curve drawn on | `markerWrite` bed (first → last candle / length of the stroke) |
| Change figure lands (candles), highlight slice pops (donut), best point pops (curve) | `ding`; `thud` when the reveal is "bad" (down move, red slice, inverted curve) |
| Price-board rows / donut slices / gauge zones land | `tap` (donut alternates `click` / `tap`) |
| Board or card lands | `click`; ticker tape appears `pop` |
| Price ticks (ticker) · donut total settles · gauge figure settles | `bleep` |
| Gauge needle swinging | `counter` bed (swing → settle); verdict word `stamp` (`thud` for a red zone) |
| Formula term + underline | `marker` (one per term); result `ding` (`kaching` for money) |
| Exam trap clicked / answer clicked | `wrong` / `correct` (the red cross and blue tick are the same beat) |
| Snowball coin lands · bars growing · final total | `coin` · `countMoney` bed · `kaching` |
| Mascot drops in | `pop` (≈ 0.2); face swaps ride the beat's own sound |
| Every circle / arrow / axis | `marker` |

No whooshes. One strong accent per clip (the exam has the wrong buzz and the correct chime ~0.7 s
apart by design).

## Checks done (2026-09-29)

- `npx tsc --noEmit -p .`: clean for all these files (the only errors are the two old
  `face-track.json` imports of the per-barato video).
- Stills with `safeGuide` for every variant, vertical and horizontal, at start / mid / end: all
  content inside the graphics zone, no overlaps left, no plates, "dato de ejemplo" on every figure,
  US$ / MXN labelled, red only for bad (down days, crash, debts, high inflation, wrong answer,
  inverted curve).
- Maths recomputed independently: +28 % / −35 % (candles); +0.40 % and −2.73 % after the tick
  (ticker); 35/25/30/10 % and 30/20/10/15/15/10 % (donut); P/U 10, $500,000, VF $16,105.10
  (formula); $25,937 = $10,000 + $15,937 and $173,839 = $120,000 + $53,839 (snowball); best ratio
  at 8 % return / 9.5 % risk with every asset inside the frontier and below that ratio (curve).
- `npm run qa -- … --allow-white`: 34/34 PASS (`out/soyluisart/pizarra/_qa-finance.txt`). SFX-only
  mix ≈ −21 to −26 LUFS, peaks ≤ −6 dBFS (sits under a voice in an edit).
- Codex review: not done — `codex exec` answered "You've hit your usage limit … try again at
  11:09 AM" (one attempt, no retry). The prompt and 9 contact sheets are ready to re-run
  (agent A scratchpad `codex/prompt.txt`, `codex/sheets/`).
- Not done on purpose (shared files, the other agent works in parallel): README rows, the
  `_index-vertical.png` / `_index-horizontal.png` refresh
  (`index_sheet.py out/soyluisart/pizarra --refresh <ids from _ids-finance.txt>`) and the vault gallery.

## Files

- Elements: `Candles.tsx`, `Ticker.tsx`, `Donut.tsx`, `Gauge.tsx`, `Formula.tsx`, `ExamQuestion.tsx`,
  `CurveChart.tsx`, `Snowball.tsx`; helpers `financeKit.tsx` (all in this folder).
- Stills (end state, no guide): `out/soyluisart/pizarra/_stills/SLA-piz-<element>-<variant>[-v]@<last frame>.png`
  (@179 for 6 s clips, @209 for 7 s: formula-valor-tiempo, exam-question-*, curve-rendimientos).
- Clips: `out/soyluisart/pizarra/SLA-piz-<element>-<variant>[-v].mp4` (34 files, list in
  `out/soyluisart/pizarra/_ids-finance.txt`, QA in `_qa-finance.txt`).
