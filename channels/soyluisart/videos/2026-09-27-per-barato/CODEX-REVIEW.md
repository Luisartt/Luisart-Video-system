# Codex review — @soyluisart edit pipeline vs the channel rules (2026-09-27)

Reviewer: OpenAI Codex CLI 0.157 (`codex exec -s read-only`, five separate calls, one at a time).
Every finding below was checked by Claude against the frames or the code. False positives are
listed at the end.

**Targets**
- Drafts: `out/.../SLA-2026-09-27-per-barato-short-pizarra-v3.mp4` and `...-short-split.mp4` (both
  rendered 21:04 from the v3 code). There were 120 and 124 frames, one every 0.5 s plus one 2 frames
  after each caption change. The caption changes came from the v3 caption gate. The frames went
  into 6×3 contact sheets of 1600 px each.
- Libraries: `styles/pizarra` (primary), `styles/terminal`, `styles/documental`, checked against
  the `_index` sheets.
- Rule documents: `GUIDELINES.md`, `CHANNEL.md`, the three style READMEs, `formats.tsx`,
  `GUIA-EFECTOS.md`.

**Rules used:** the user's rules (a)–(j) of 2026-09-27. In short: (a) captions only on pure
talking-head stretches. (b) Captions never over the face. (c) Captions at y 1000–1300 and x ≤ 900,
graphics at y 250–970, nothing important below y 1436. (d) No box, plate or band behind text.
(e) Whooshes only at the start and on real transitions; everything else gets a specific SFX.
(f) "Luisart". (g) No face picture-in-picture on full-board scenes. (h) No music unless the user
supplies it. (i) Constant motion and marker arrows. (j) "dato de ejemplo" on example figures,
money in MXN or US$.

**About v4:** the -v4 work (`pizarra-v4.mp4`, `split-v2.mp4`, rendered 21:29) landed during this
review. Claude spot-checked those renders. The "v4" tag on each finding means:
- **Covered:** fixed in the v4 code and renders.
- **Not covered:** still present.
- **n/a:** outside the scope of v4.

Notes on method:
- On Windows, Codex's read-only sandbox can't start processes (`CreateProcessAsUserW` returned
  access denied). The code and documents were therefore pasted into each prompt, with line
  numbers.
- `CHANNEL.md` and `pizarra/README.md` were rewritten by the other agent at 21:22. The line
  numbers for them below refer to that version.

---

## High

**H1 — Captions appear while graphics are on screen (a). Both drafts. v4: covered.**
- In pizarra-v3, every caption appears together with a graphic:
  - Behind-head words: "estudiando" / "entender esto" over 2 AÑOS (1.33–2.9 s), "no significa
    que" over BARATA (5.93–7.13 s), "Aquí te explico / por qué" over ≠ BUENA INVERSIÓN and the
    "?" cards (8.20–9.50 s), "dice nada si no" over PRECIO (13.33–14.13 s), "una empresa" over
    UTILIDADES (15.53–16.50 s), "algo solo porque / está barato" over COMPRAR (34.77–36.33 s),
    "vas a necesitar" over GUARDA ESTO, the bookmark and Bit (41.23 s to the end).
  - Boards: "Ahí entra el" (16.57 s), "su múltiplo es 2" (22.80 s), "Si otra vale 100", "y gana 2
    pesos", "su múltiplo es 50" (24.10–27.73 s), "Donde la segunda" (29.03 s), "por acción diga
    lo / contrario" (32.27–34.03 s).
- The split draft has the same problem, plus captions on top of the split graphic band (sheet
  tiles 005–010, 024–027, 042–050, 067–069).
- Cause: v3 used a caption gate that matched spoken words against the words on screen, and
  `PizShort.tsx` set `placement: on "paper"` for board scenes.
- v4 status: `captionRule.ts` now receives every graphic window (`PIZ_GRAPHICS`,
  `SPLIT_GRAPHICS`). In pizarra-v4 and split-v2 no caption appears at 1.4 s, 6.0 s, 22.9 s, 35 s
  or 41.5 s.
- Consequence for the user: every face shot carries a behind-head word, so **both v4 edits have
  no captions at all**. The user has to decide whether some face shots lose their word so that
  captions can appear. This is already noted in BRIEF.md.

**H2 — Captions cover the face (b). Both drafts. v4: covered, but moot (no captions).**
- Pizarra-v3: the caption line is fixed at y 1250, which falls on the mouth or chin in this close
  selfie. Seen at 1.4 s (tile 005), 3.5 s (011), 6.0–7.0 s (017–019, nose and mouth), 8.27 s
  (023), 13.4–14.0 s (038–040), 15.6–16.0 s (045–046), 34.8–36.0 s (101–105) and 41.3–42.0 s
  (118–120).
- Split: the line is fixed at y 1036 "over the head", which falls on the hair and forehead. Seen
  at 1.4–3.0 s, 8.27–9.0 s, 13.9–15.6 s and 22.87–23.5 s.
- Cause: `CAPTION_CY` and `CAPTION_CY_SPLIT` in v3 `PizCaptions.tsx`.
- v4 status: `captionPlace.ts` now places captions around the face using face tracking. See H4
  for the conflict this creates with rule (c).

**H3 — Company B's price differs between the voice and the screen (j, and screen/voice match).
Both drafts. v4: not covered.**
- He says "si otra vale **10** y gana 2 pesos… su múltiplo es 50". The board types $10 and then
  $100 (tiles 071–072). The caption shows "Si otra vale **100**" (24.10 s) while the audio says
  "10".
- The voice contradicts itself (10 ÷ 2 = 5, not 50).
- Location: `scenes/figures.ts:12` (`B.price = 100`). The caption override is `fixes()` in
  `scenes/Captions.tsx`.
- Fix: this is a user decision already open in PROJECTS.md. One option is to re-record "vale
  cien". The other is to keep 10 and show P/U = 5 with his line re-cut.

**H4 — The rule documents turn the caption band into a preference (b vs c). Documents and v4 code.
v4: introduced by v4.**
- The documents say captions may go anywhere in x 120–920 and y 250–1436, "usually above the
  head", because "zones are the preference; the face overrides them". See `CHANNEL.md:59-74`,
  `pizarra/README.md:67-77` and `captionPlace.ts:10-13, 58-69`.
- The user's rule (c) says captions go in y 1000–1300 and x ≤ 900. Above the head is the graphics
  zone.
- The documents list only the eyes and mouth. Rule (b) also names the forehead.
- Fix (user decision): either keep the band mandatory and drop or reframe the caption when the face
  fills the band, or state explicitly that the face overrides the band. Add "forehead" to the
  wording either way.

**H5 — Split: the face cutout flashes over the full "EL PRECIO" board for 2 frames (g).
Split and split-v2. v4: not covered.**
- Frames 374–375 (12.47–12.53 s) show the person matte on top of the full board, just before the
  cut to the face at 12.57 s. This was confirmed on both split renders.
- Cause: `SplitShort.tsx:108`. `MATTE_WINDOWS` starts every behind-head group at `g.from - 2`. In
  this edit `<MatteLayer>` (line 140) sits above `<Graphics>` (line 137), so the cutout is drawn
  over the board. In PizShort the board layer is on top, which hides the same pre-roll.
- Fix: clip the matte windows to face or split segments (`Math.max(seg.from, g.from - 2)`), or
  skip the pre-roll when the previous segment is a board.
- Codex missed this. Claude found it.

**H6 — The Pizarra library's vertical layouts put graphics below y 970 (c). Library only; the
per-barato edit scales each scene into the zone. v4: n/a.**
- Seen in `out/soyluisart/pizarra/_index-vertical.png`, with positions confirmed in the code:
  - `BoardCompare.tsx:64-72`: the "after" half starts at y 893 and reaches about y 1150.
  - `MythFact.tsx:84-86`: REALIDAD and its checks reach about y 1230.
  - `Timeline.tsx:27-31`: the last point is at about y 1240–1376.
  - `HandChart.tsx:27-29, 79-89`: labels at y 1134, note at about y 1200.
  - `MoneyStack.tsx:48-54, 80-87`: baseline at y 1106, note at y 1276.
  - `PriceTag.tsx:31-36`: second tag and note at about y 1175–1250.
  - `ScreenshotFrame.tsx:51-64`: the phone runs from y 290 to y 1290, its note at about y 1330–1400.
  - `StickDialogue.tsx:32-43`: ground at y 1346.
  - `Waffle.tsx:50-54`: the two-row layout splits at y 843.
  - `Calculator.tsx:30-38`: rows past y 1200.
  - `Split50.tsx` `aroll-top`: board at y 1000–1396.
- These elements centre themselves on the whole safe box (y 250–1436) instead of
  `ZONES.vertical.graphics`: BoardTitle, BitReact, Counter, Checklist, LogoRow, QuoteCard,
  Highlighter, Clippings, Polaroids, StickyNotes, RetroWindowScene, Stepper and CtaFollow.
- Fix: lay out every `-v` variant inside the graphics zone (y 250–970). Sequence or shrink
  whatever doesn't fit.

**H7 — The Pizarra `captions` element breaks (a), (b) and (c). Library. v4: n/a.**
- `Captions.tsx:14-18, 58, 64-67, 126`:
  - The default `y: 0.71` puts the line at y 1363, outside the band.
  - The width is the safe box (x 120–920), not x ≤ 900.
  - It has a `board` mode.
  - It has no graphics gate and no face awareness.
- `Split50.tsx:39` puts the caption at y ≈ 810 over the face in `aroll-top`, and puts captions over
  a graphic in `graphic-top`.
- `SpeakerCard` renders captions under a board.
- Fix: remove board mode, limit captions to the band, and require a pure talking-head segment and
  a face box. Alternatively, mark the element as "edit use only through makeCaptionGate +
  captionPlace".

**H8 — "Cards that ARE the graphic" exception versus rule (d). Documents. v4: not covered.**
- `CHANNEL.md:50`, `pizarra/README.md:128-131` and `terminal/README.md:17-19` still allow text
  inside board cards, UI windows, speech bubbles, price tags, sticky notes, tiles and Terminal
  panels.
- The user's latest rule (d) says "no boxes… behind **any** text".
- Examples in the drafts: the yellow $20 price tag (10.3–12.5 s, and in split 13.9–16.5 s), and the
  "¡Ah, está regalada!" bubble (10.9–12.5 s).
- Examples in the libraries:
  - Pizarra: Calculator and Annotate windows, the MindMap centre box, sticky notes, retro windows,
    "+SEGUIR".
  - Terminal: `Panel` in Beams, Chart, Checklist and Compare.
- Fix (user decision): confirm the exception or drop it. If it goes, the price tag and bubble need
  unboxed redesigns.

## Medium

**M1 — Example figures without "dato de ejemplo" (j). Both drafts. v4: not covered.**
- The $20 price tag on the "EL PRECIO" board (10.3–12.5 s; `Boards.tsx:49-75`).
- The split "compara" band with $20 → utilidades (13.9–16.5 s; `Boards.tsx:287-312`).
- The A-vs-B recap with $20 / $100 / P/U 2 / P/U 50 (29.0–34.0 s; `Boards.tsx:165-216`). It
  repeats the figures without the label.
- The Empresa A and B boards do have the label, and v4 frame 686 still shows it.

**M2 — Currency is not explicit (j). Drafts and libraries. v4: not covered.**
- Drafts: a bare "$" everywhere (`figures.ts:20-21`, `money()`). Only the voice ("2 pesos") marks
  pesos. Suggested format: `$20 MXN` or `MX$20`.
- Libraries:
  - `terminal/Compare.tsx:58` shows **"0 €/mes / 12 €/mes"**, which is euros and breaks (j).
  - `documental/BigNumber.tsx:176`: `$500.000 M`.
  - `pizarra/Calculator.tsx` and `ScreenshotFrame.tsx` (`$12,430.00`): bare "$".
  - Terminal `Chart` and `Ticker` show stock prices with no currency (they should use US$).

**M3 — Terminal and Documental have no sound at all (e). Libraries. v4: n/a.**
- Neither library has any `sfx` or `<Audio>`. The renders are video-only; for example,
  `SLA-term-title-center-v.mp4` and `SLA-doc-stamp-date-v.mp4` have no audio stream.
- The Pizarra renders do carry audio.
- `GUIA-EFECTOS.md` maps sounds to these elements, so today the sound has to be added by hand in
  every edit, transitions included.
- Fix: add `sfx` props that follow the GUIA map.

**M4 — Secondary libraries: vertical elements outside their zone (c). Libraries. v4: n/a.**
- The READMEs admit it:
  - `terminal/README.md:60-63`: beams and checklist still use the whole safe area. The fan and
    versus nodes land at about y 1133–1313, and the checklist card at about y 1017–1412.
  - `documental/README.md:17-19`: logo network (satellites at about y 1197–1260), quote, and stamp
    (`bottom: 500`, about y 1420).
- Terminal and Documental lower thirds and the Documental "lower" part title sit in the caption
  band (y 1000–1300) by design. See `terminal/LowerThird.tsx:48-59`,
  `documental/LowerThird.tsx:24-36` and `PartTitle.tsx:67-85`.
- Rule (c) reserves that band for captions and puts animations at y 250–970. Needs a decision: move
  them, or document lower thirds as an exception. They can't coexist with captions under (a)
  anyway.

**M5 — The Pizarra Highlighter is a band behind text (d). Library. v4: n/a.**
- `Highlighter.tsx:55-63` and README line 176 ("translucent marker sweeping behind key
  phrases"). The blue and yellow bands behind words are visible in the index sheet.
- Fix: use a marker underline or circle instead.

**M6 — Stale or wrong statements in the Pizarra README. Document.**
- `pizarra/README.md:43` says "captions 54 (63 in splits)". The code uses 56 and 58, and splits now
  get no captions.
- `:55-56` says "centre at 71 % height", which is y 1363.
- `:75` says this is superseded "below", but the old rule is above.
- `:154-155` still lists `speaker-card` with `captions` and `split-50` "captions in the A-roll
  band". Both contradict (a).
- Fix: delete the 71 % rule and the split size, and mark those caption props as not for edits.

**M7 — "Luis Art" in CHANNEL.md (f). Document.** `CHANNEL.md:214` (Glossary: "soyluisart / Luis
Art"). Fix: "soyluisart / Luisart".

**M8 — Rule (g) is not written anywhere. Documents.**
- No document says "no face picture-in-picture on full-board scenes".
- `CHANNEL.md:16` still lists "speaker card (optional)" and `pizarra/README.md:154` describes it as
  "board on top, A-roll in a rounded card".
- Fix: add rule (g) to the ★ rules, and state that face cards and cutouts belong only to the split
  layout, never to full-board scenes.

**M9 — GUIA-EFECTOS.md contradicts (h) and (e). Document.**
- On music (h): `:41-43` gives a default music-mix recipe, and `:82` says "subir la música" on the
  outro. `:151-168` (hook recipe 4) assumes a music bed ("se corta la música").
- On whooshes and swooshes (e):
  - `:190` allows a whoosh on a "punch-in digital hacia un dato", which is not a transition.
  - `:212-217` allows swooshes for "cambio de tarjeta/página/gráfico en la pizarra" and between
    "dos gráficos de la misma sección". These are element changes, not real transitions.
  - `:71` describes the board entry as a "wipe", but Pizarra cuts hard.
- On stale descriptions (d): `:68` still describes the Documental "Barra de énfasis", which is now
  an underline.
- Related tension with (e): `:37` "si dos gráficos aterrizan a menos de 6 f, suena solo el más
  importante". Keep it only for events designed as one beat.
- Fix: add "default no music; only a user-supplied file", keep whooshes only on the video start
  and real section changes, and update the emphasis row.

**M10 — PROJECTS.md is stale. Document.**
- The channel line still says "graphics standard approved (Terminal + Documental …)", but Pizarra
  is now the main style.
- The video row says "v2 rendered … full sound design + music" and "board without PiP". The
  current drafts are v4 and split-v2, and they have no music.

## Low

**L1 — Opening whoosh (e). Both drafts. v4: not covered.**
- `pizCues.ts:88`: the "start" whoosh lands at 0.80 s on "2 AÑOS", not on frame 0.
- It is also the only sound for that behind-head word. The frame-0 kicker "llevo más de" has none.
- Fix: whoosh at frame 0, and give "2 AÑOS" a typing key.

**L2 — Graphic events with no specific SFX (e). Drafts and library. v4: not covered.**
- In the edit:
  - Middle "?" card at `T.aqui + 8` (`extras.tsx:25` vs `pizCues.ts:23-24`).
  - Middle "?" card on the final board (`Boards.tsx:228-235` vs `pizCues.ts:76-78`).
  - Bit drops at `W.vas + 4` (`extras.tsx:52`).
  - "EL PRECIO" heading typed (`Boards.tsx:54`, only the whoosh).
  - "UTILIDAD" and "por acción" on the formula board (`Boards.tsx:96-101`).
- In the library: BoardCompare, LogoRow and RetroWindowScene staggered drops (only the first one
  pops), MindMap branches (no marker sound), StickDialogue character entrances.

**L3 — Uppercasing could break "Luisart" (f). Library.** `documental/Quote.tsx:87` and
`LogoNetwork.tsx:140` apply `toUpperCase()` to author and label text. Passing "Luisart" would
render "LUISART". Fix: exempt the name.

**L4 — Example labels in the library (j).**
- `pizarra/BoardTitle.tsx:107` says "precio global de ejemplo, al mes" instead of "dato de
  ejemplo".
- `ScreenshotFrame.tsx` mock bank screen has no label.

**L5 — The v4 caption test path bypasses the gate (a). v4 code.** `SplitShort.tsx:55, 131` and
PizShort's `captionTest` prop render captions with no graphics gate. This is fine for placement
stills. Make sure no deliverable is rendered with `captionTest: true`.

---

## Checked and compliant
- **Music:** no music in either draft (`music.ts` `USER_MUSIC = null`).
- **Placement:**
  - Graphics and behind-head words in the drafts stay inside y 250–970. This was checked on the
    tiles: kickers at about y 292–312, and the lowest board content at about y 930.
  - Nothing important sits below y 1436 or in the right-hand column.
  - The split face card spans x 162–918, with the chin at about y 1420.
- **Motion and arrows (i):** marker arrows are on every explanation board, with push-ins and
  floats.
- **Empresa boards:** Empresa A and B carry "dato de ejemplo".

## Discarded (false positives)
- **Caption gate type mismatch.** Codex said `PizShort.tsx` passed `ScreenSpan[]` to a gate that
  expects `(windows, total)`. This was an artifact: the snapshot was taken while the v4 agent was
  editing those files at 21:16–21:17.
- **"ESTO typed without an SFX".** The marker cue lands 2 frames later on the same beat, which
  follows "one sound per beat".
- **"?" cards as boxes behind text.** They are pixel icons, not text on a plate.
- **Speaker card as a face picture-in-picture (Codex: high).** It is a split layout (board on top,
  face card below), not a full-board scene. It was downgraded to the documentation gap in M8.
- **Codex's GUIDELINES.md "authority" findings.** GUIDELINES already defers channel rules to the
  skill and CHANNEL.md. No real conflict.

---

# v6 review (2026-09-28): pizarra-v6, split-v4, pizarra-v6-horizontal

Reviewer: OpenAI Codex CLI 0.157 (`codex exec -s read-only`, three separate calls, one per
deliverable, run one at a time). Every finding was checked by Claude against the full-resolution
frames and the current code.

**Targets**
- `out/.../SLA-2026-09-27-per-barato-short-pizarra-v6.mp4`, `...-split-v4.mp4` and
  `...-pizarra-v6-horizontal.mp4` (1266 frames each, 30 fps).
- 93 frames per render: one every 0.5 s, plus a frame 2 frames after each caption change
  (`caption_changes.ts` → `[377, 400, 416, 1021, 1043, 1069, 1090, 1112]`, 130 caption frames in
  every edit). Vertical: 6×3 sheets with the zone lines. Horizontal: 4×4 sheets, so the tiles are
  big enough to read. Sheets are in `out/.../review/<target>/`.
- Pasted with line numbers: `luisart-reglas`, CHANNEL.md ★ (lines 1–175), the cut transcript,
  `groups.ts`, `layout.ts`, `captionRule.ts`, `captionPlace.ts`, `captionSpot.ts`, `pizCues.ts`,
  `Boards.tsx`, `extras.tsx`, `Behind.tsx`, `PizCaptions.tsx`, `figures.ts`, `music.ts`, plus each
  edit's composition file. Prompts and raw answers are in `review/` (`prompt-*.txt`,
  `codex-*-r1.md`). A copy of the reviewed code is in `out/.../review/code-snapshot-v6/`.
- Told as known, not findings: company B shown as $100 / $2 / 50 while he says "vale 10" (the
  user's decision), and captions above the head on this close selfie (CHANNEL.md allows it).

**Method notes:** as before, the read-only sandbox can't start processes on Windows, so the code
was pasted into the prompt. The horizontal re-layout (V6-H1) was built while the calls ran; the
line numbers below refer to the v6 snapshot.

## High

**V6-H1 — Horizontal: the board scenes are small, with wide empty margins (m, and the user's own
note). Horizontal only. Confirmed. Fixed in v7.**
- Where: every full-board scene in `pizarra-v6-horizontal` (10.0–12.5 s, 17.0–34.0 s,
  37.1–40.0 s).
- Cause: `Boards.tsx:368-399` (`BoardView`, `H_BOX`). The tall 1080×1920 scene sheet was only
  scaled to fit the 700 px-high graphics zone, at 0.67–0.89 ×, and centred. The content used about
  600 of the 1640 px available.
- A uniform scale-up is impossible because the scenes are limited by height. The fix is a
  re-layout, `H_LAYOUTS` in `Boards.tsx`. Each scene is cut into pieces of the sheet, and the
  pieces are placed side by side inside x 160–1760, y 100–780:
  - **El precio:** the drawing on the left and EL PRECIO + note on the right (0.73 → 0.93 ×). The
    note → tag arrow is redrawn in frame coordinates.
  - **Múltiplo P/U:** heading on top, Bit to the left of the formula (0.75 → 1.3 ×). The Bit →
    P/U arrow is redrawn.
  - **Empresa A / B:** title, label and B's reminder on the left, the fraction on the right
    (0.89 / 0.74 → 1.2 ×).
  - **A vs B:** the table on the left, the conclusion + label on the right (0.67 → 0.82 ×).
  - **¿Barato…?:** unchanged at 0.88 ×. It already fills the zone's height, and splitting it would
    gain less than 6 %.
- Every arrow keeps its word, frames and marker sound. Checked with SafeZoneGuide stills in
  `out/.../stills/h7/`: all content is inside the horizontal graphics zone, and the Ú accent
  clears y 90.

## Medium

**V6-M1 — The three question-board arrows have one marker sound between them (e/i). All three
edits. Confirmed. Fixed.**
- Found by Codex in the pizarra and horizontal calls.
- Cause: `QuestionBoard` (`Boards.tsx:233-245`) draws three arrows at `W.baratoEnd` +0, +6 and
  +12, but `pizCues.ts:75` has one `pen()` cue. That cue lasts about 9 frames, so the third arrow
  was silent.
- Fix: one pen stroke per arrow, at +0, +6 and +12. The later two are at 0.22 so they sit under
  the card pops.

**V6-M2 — "dato de ejemplo · MXN" is too small on the full boards (j, readability). Vertical and
split. Confirmed. Fixed.**
- Found by Codex in the split call.
- On the El precio and A vs B boards, the 46 px label ends up about 35 px and 31 px after the
  full-board fit (× 0.75 and × 0.68). In muted handwriting that is hard to read on a phone.
- The Empresa boards (52 px × 0.92 ≈ 48 px) were fine.
- Fix: `LABEL_PRECIO = 56` and `LABEL_COMPARE = 62` on the sheet, so both come out at about 42 px.
  The compare `BBOX` was extended to y 1305, and the horizontal pieces were widened to fit.

## Low

**V6-L1 — Stale comments (k). Confirmed. Fixed.**
- `layout.ts:3-7` said the A-roll is "always with text behind the head", and `layout.ts:62`
  described the old word-matching caption rule.
- `SplitShort.tsx:20-29` described FACE as "the word behind the head".
- `PizCaptions.tsx:11` gave only the vertical caption extent.
- All four now describe key shots vs plain shots and the per-format caption zone.

## Checked and compliant (v6)
- **(a):** 130 caption frames per edit, all on the plain face shots: PRECIO at 12.57–13.87 s, and
  COMPRAR / PREGÚNTATE at 34.03–37.07 s. None appear during a board, word, card or CTA, and no run
  is shorter than 12 frames. `checkCaptions.ts` reports 0 during a graphic.
- **(b)/(l):**
  - Vertical and split: the line sits at y 287, above the hair, and never touches the forehead,
    eyes or mouth.
  - Horizontal: the line sits at y 844–913 on the chest, inside the caption zone.
  - Nothing was reframed.
- **(c):**
  - Vertical: all board content is in y 250–970.
  - Split: the band graphics are in y 262–790, and only the face card goes below 1436.
  - Horizontal: y 90–790.
- **(d):** no plates. The price tag and bubble are drawn objects.
- **(e):** whooshes only on frame 0 and on the board in / out transitions.
- **(f):** "Luisart" is spelled correctly everywhere it appears.
- **(g):** no face on any full-board scene. The H5 matte fix still holds.
- **(h):** no music (`USER_MUSIC = null`).
- **(i):** there is motion throughout and there are arrows on every explanation board.
- **(j):** every example figure is labelled, and P/U is computed in `figures.ts`.
- **(k):** 5 key shots (2 AÑOS, BARATA, ≠ BUENA INVERSIÓN, UTILIDADES, GUARDA ESTO) and 3 plain
  shots.

## Discarded (v6)
- **"Empresa A's fraction bar is anchored to a word that was cut" (Codex pizarra M2).**
  - `W.aGana = at("gana", 21.5)` resolves to frame 621, the 20.70 s join.
  - The kept audio starts in the middle of the second "gana", so "…y gana 10 pesos" is heard
    right at the join. That is also what the Whisper word check hears, as the known "y" at the
    join.
  - The bar therefore lands on the audible "gana", 11 frames before "10". The `[cut:gana]` marks
    in the pasted transcript come from our own simplified cut mapping (word start < 22.0 s), not
    from the audio.
- **"The question board is small in horizontal" (part of Codex horizontal H1).** At 0.88 × it fills
  the zone's full height, and the empty sides come from its stacked design. It was left unchanged
  (see V6-H1).

## v7 renders (2026-09-28)
- `SLA-2026-09-27-per-barato-short-pizarra-v7.mp4`, `...-split-v5.mp4` and
  `...-pizarra-v7-horizontal.mp4` were rendered through the lock. The session was interrupted
  mid-render once. The orphaned `out/.render-lock` had no process behind it, so it was removed,
  and split-v5 was rendered again from scratch.

## Round 2 (2026-09-28): v7 / split-v5 / v7-horizontal
Three Codex calls, one per render, checked against the new sheets in
`out/.../review/{pizarra-v7,split-v5,horizontal-v7}/`. The prompt listed the round-1 fixes to
verify and the discarded `aGana` item.
- **Verified fixed:**
  - V6-H1: the horizontal boards now fill the zone, with nothing clipped and the redrawn arrows
    landing correctly.
  - V6-M1: one pen stroke per question arrow.
  - V6-M2: the labels are about 42 px.
  - V6-L1: the comments are updated.
- **R2-1: typed or dropped elements without their own sound (e). Found in the pizarra and
  horizontal calls. Confirmed as Low. Fixed.**
  - "P/U" on the formula (`puAt`) sat inside the Bit → P/U pen stroke.
  - UTILIDAD (`W.utilidadF`) sat 4 frames after the fraction-bar pen.
  - The CTA bookmark drop (`W.esto + 6`) sat inside the ESTO → bookmark pen.
  - Each of these was audible under a neighbouring sound but had no sound of its own. Added in
    `pizCues.ts`: "P/U typed" (key presses, 0.18), "UTILIDAD lands" (`ui-click-mouse-02`, 0.2)
    and "bookmark drops" (`pop-soft-01`, 0.18).
  - Only the audio changed. The WAV was rendered again through the lock, mastered and muxed onto
    the same v7 video stream (`-c:v copy`), so the file names are unchanged.
- **Discarded: "the horizontal question board is not re-laid out" (split and horizontal
  calls, again).**
  - At 0.88 × it already fills the zone's full height, from ¿BARATO at y 100 to CON QUÉ? at
    y 770.
  - The only side-by-side split (¿BARATO + cards | COMPARADO CON QUÉ?) is limited by width, to
    about 0.93 ×. That is under a 6 % gain, and it would break the top-to-bottom question → cards
    → answer reading.
  - Kept as designed.

## Round 3 (2026-09-28): pizarra-v7 after the re-mix
One call on the full-board edit. Its sound cues are shared with the split and horizontal edits
(`BOARDS` in `pizCues.ts`).
- **Result:** no High and no Medium findings.
- **R3-L1:** the timing comments in `layout.ts` gave source seconds without saying so. A note was
  added (cut = source − 1.30 s after the flub). It is a comment only, so nothing was re-rendered.
- **Review clean.** Still the user's decision: company B's price ("vale 10" said vs $100 shown).

## Checks on the final v7 set
- `npx tsc --noEmit`: clean.
- `checkCaptions.ts`: 130 caption frames in each edit, 0 during a graphic, 0 touching the face,
  0 reframes.
- QA `--allow-white`: PASS on all three (1266 frames each).
- Loudness:
  - pizarra-v7: −14.2 LUFS, true peak −1.6 dBTP, LRA 3.5.
  - split-v5: −14.3 LUFS, −1.7 dBTP, LRA 3.5.
  - v7-horizontal: −14.2 LUFS, −1.6 dBTP, LRA 3.5.
- Whisper word check (`transcribe_parts.py`, split at 18.9 s):
  - All 127 kept words are heard, in order, in all three files.
  - Every file has the known extra "y" at the 20.7 s join.
  - pizarra-v7 and the horizontal file also show a "0" heard just before "50" at 27.8 s. The v6
    file transcribes the same way, so it is a Whisper artifact of the voice, not a regression.
