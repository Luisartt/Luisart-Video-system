# Batch B notes — business / strategy / marketing / AI diagrams (2026-09-29)

Seven new Luisart elements (agent B). The main chat merges the rows below into `README.md`
(this batch did not edit README.md, index.tsx, theme.ts or primitives.tsx). All variants are
vertical (`SLA-piz-<element>-<variant>-v`, primary) and horizontal (`SLA-piz-<element>-<variant>`).

## Shared helper (new file)

`diagramKit.tsx` — used by the seven elements; reusable by any later element:
`DiagramBox` (each element lays out on its own design box per format; the box is scaled uniformly,
never up, and centred into the graphics zone: vertical x 120–920 / y 250–970, horizontal
x 140–1780 / y 90–790 — both formats, unlike `Stage fit`, which is vertical only), `BoxSvg`, `At`,
`Float` / `Breathe` / `breatheScale` (library copies of the per-barato `motion.tsx` behaviour),
`MascotImg` (mascot PNG, pixelated, stepped 1-art-pixel bob) + `faceAt` (single-frame face swaps),
`mascotKeyField` / `mascotExprField` (zod), `MarkerArrow` (shaft then head), `handCircle` (large
smooth hand-drawn circle; `roughEllipse`'s per-point jitter reads jagged at big radii),
`pixelPerson` (6×7 pixel person as SVG rects), `fitFont`, `fmtPct` (Mexican format, no trailing
zeros: 25%, 4%, 0.6%, 0.08%), `SourceLabel`.

## README catalogue rows (third table, "Diagrams batch B")

| Element | Variants | What / key props |
|---|---|---|
| `funnel` | `ventas`, `contenido` | Pixel funnel (stepped bands, ink border + hard shadow) dropping in top → bottom, each number counting up inside its band; marker arrows on the right with the conversion % computed from the data (value ÷ previous); pixel people pour into the mouth and a few drip out of the spout (constant motion); last stage circled, final hand note with `{total}` = last ÷ first; mascot reacts (`bit-vendedor-base` / `embudo-base`). `stages[{label,value}]` (3–5), `every`, `note`, `source` ("dato de ejemplo"), `mascot`, `mascotFrom`/`mascotTo` |
| `flywheel` | `bueno-a-excelente`, `negocio` | Jim Collins' flywheel: 4–5 cards on a circle, then one marker arrow per push along the circle (the last closes the loop) while the wheel in the middle turns faster with every push (speed from the push count); the `engrane-base` mascot in the hub goes asleep → thinking → happy; a blue dot keeps running round the loop; hand note (horizontal: note in the right column with an arrow to the loop). `nodes[{label,icon}]`, `every`, `note`, `mascot`, `faceStart`/`facePush`/`faceEnd` |
| `pyramid` | `capital`, `prioridades` | Stepped pixel-brick pyramid built from the base up, one brick per frame (masonry rows), each layer framed and labelled when complete; top layer blue, circled in marker, breathing; side hand notes with arrows to the top; foot note. `layers[{label}]` base first (3–5), `leftNote`, `rightNote` (ignored when a mascot is set), `footNote`, `mascot` (optional; `bit-estratega-base` on `prioridades` = Maslow), `faceStart`/`faceEnd` |
| `venn` | `dos`, `tres` | 2 or 3 hand-drawn marker circles drawn one by one with their labels in their own lobes; the common area (lens / centre of three = hedgehog concept) fills blue, the `foco-base` mascot drops in, a marker tick and a hand note with an arrow pointing into it. `circles[{label}]` (2–3), `every`, `note`, `mascot`, `faceStart`/`faceEnd` |
| `flow` | `agente-ia`, `automatizacion` | Process chain: 3–4 pixel cards (icon or mascot + label + hand note), one row on horizontal, a two-column snake on vertical, joined by marker arrows; a data packet travels along the arrows, the card it is in turns blue, in the "thinking" card the mascot goes asleep → thinking (3 dots light up) → happy; tick + hand note on the last card; the packet keeps looping silently. `nodes[{label,note,icon,mascot}]`, `thinkIndex`, `finalNote` |
| `matrix` | `riesgo-impacto`, `urgente-importante` | 2×2 matrix: marker axes with arrowheads and hand labels (y reads bottom → top), the cross drawn on, quadrant names typed, example cards drop into their quadrant and float; the winning quadrant's cards are circled in blue and its name turns blue; mascot reacts (`dado-base` / `f12-reloj-arena`). `xLabel`, `yLabel`, `quadrants` [tl, tr, bl, br], `items[{text,q}]`, `winner`, `note` |
| `scale` | `pros-contras`, `etica` | Pixel balance (post, base, beam, level plates): labelled weights drop one by one onto their side and each landing tips the beam with a spring wobble; the tilt is computed from the weights (right − left), the heavier side wins: marker tick, title turns blue, mascot reacts, note with `{winner}`; idle sway after it settles. `left`/`right` {title, tone accent\|alert\|ink}, `tokens[{side,text,weight 1–3}]`, `every`, `note`, `mascot` (`bit-estratega-base` / `brujula-base`) |

## Sound-map notes (no new `piz.sfx` keys)

Existing keys only. Per element, in order of events:

- funnel: `type` (heading bed) · `pop` 0.25 per band · `counter` bed 0.22 over all count-ups ·
  `marker` 0.3 per conversion arrow · `bleep` 0.25 when the last number settles · `marker` on the
  winner circle · `ding` with the final note + mascot swap.
- flywheel: `type` · `pop` 0.25 wheel · `click` 0.2 per card · `marker` 0.35 per push arrow ·
  `ding` when the loop closes · (horizontal) `marker` 0.25 for the note arrow, 8 f after the ding.
- pyramid: `type` · `tap` 0.2 on the first brick · `pop` 0.25 per completed layer · `marker` on
  the top circle · `marker` 0.3 per side-note arrow · `ding` with the foot note.
- venn: `type` · `marker` 0.35 per circle · `pop` 0.3 when the common area fills (mascot drops
  in on the same beat) · `marker` 0.3 on the tick (mascot face swap on the same beat) · `ding`
  with the note + arrow.
- flow: `type` · `pop` 0.25 per card · `marker` 0.3 per arrow · `tap` 0.22 when the packet leaves
  and on each arrival · `bubble` 0.35 when it reaches the thinking card · `bleep` 0.25 when the
  thinking card is done · `correct` on the last card (tick). Later packet loops are silent.
- matrix: `type` · `marker` 0.35 axes · `marker` 0.25 cross · `type` 0.2 bed for the quadrant
  names · `note` 0.35 per card landing · `marker` on the winner circle · `ding` with the note.
- scale: `type` · `pop` 0.25 structure · `typeShort` 0.22 side titles · `thud` 0.22 per weight
  landing · `marker` on the winner tick · `ding` with the note.

No whooshes. One strong accent (`ding` / `correct`) per clip, at the result.

## Clips and stills

Clips (`out/soyluisart/pizarra/`): `SLA-piz-<element>-<variant>-v.mp4` and
`SLA-piz-<element>-<variant>.mp4` for the 14 variants above (IDs in `_ids-diagramas-b.txt`,
QA in `_qa-diagramas-b.txt`). Stills (`out/soyluisart/pizarra/_stills/`): `<ID>@<frame>.png`
at the final hold (frame 179 for the 6 s clips — funnel ×2, venn-dos; 209 for the 7 s ones).
Thumbnails refreshed in `_thumbs/` and both `_index-*.png` sheets rebuilt (77 vertical /
67 horizontal clips at the time).

Checks: `npx tsc --noEmit` clean for `styles/pizarra`; stills of every composition looked at
(start / mid / end, verticals with `safeGuide`): everything inside the graphics zone in both
formats; QA 28/28 PASS (`--allow-white`); SFX-only loudness −21 to −26 LUFS, peak ≤ −7.9 dBFS
(library clips carry no voice; the −14 LUFS target applies to the finished edits).

Review: the Codex pass (skill `luisart-revision-codex`, prompt with the rules + all 8 files and
7 per-element contact sheets) could not run — Codex answered "You've hit your usage limit"
(2026-09-29, retry after 11:09). Not retried. Self-review instead: the text was checked for Mexican
Spanish (fixed «» → “ ”, "Más que invertir" → "Más para invertir", "te llega" → "te avisa"),
statements kept generic (debt is paid before equity in a liquidation; Maslow's order; Eisenhower
quadrants; avoid / transfer / reduce / accept risk responses; Collins' flywheel and hedgehog
concept). A Codex round is still owed before these clips go into a delivered video.

Limits worth knowing: `scale` takes max 3 weights per side, `matrix` max 2 cards per quadrant
(both in the schema descriptions; more would overflow); `funnel` expects decreasing values
(a rising stage would show a conversion above 100 %); `flow` with `thinkIndex` 0 starts the
first card in "thinking" (use 1–n−1).
