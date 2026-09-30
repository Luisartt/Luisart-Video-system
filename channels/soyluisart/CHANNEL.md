# @soyluisart — brand guide

## ★ Graphics standard (2026-09-27) — supersedes the first-pass guide further down

**Luisart is the channel's main style and edit system (user decision, 2026-09-27).** Every new
video is planned, edited and animated as a Luisart edit unless the user asks otherwise. Terminal and
Documental stay approved as **secondary** styles: use them only when the user asks, or for a
one-off element that Luisart has no equivalent for, drawn in the Luisart palette where possible.
The user singled out the typography as the thing to keep.

- **Luisart — MAIN style and edit system** (`styles/pizarra/`, from the Santiago Castellanos
  analysis the user loves): white dotted board (`#FFFFFF`, dots `#D5D9E2` every 64 px; cream `#F3EFE4` for
  press/people), ink `#111111`, one blue accent `#2F6BFF`, red `#E5484D` only for "bad". Inter Tight
  700 headings typed 1 char/frame + Shadows Into Light Two handwritten note, Pixelify Sans pixel
  labels, Inter 700 captions (active word blue); pixel-art icons, our own AI character "Bit",
  retro-brutalist windows, waffles, steppers, text behind the head, speaker card (split layouts only). Hard
  cuts only, 100/115 % punch-ins. **Edit system, not just graphics:** A-roll only for the hook, the
  turns and the CTA, alternating key face shots (a big behind-head word, or the hook title; no
  captions) with plain face shots (no word, captions on) — see "Two kinds of face shot" below —
  the explanation on the board, a layout change on every new phrase. Default for every new video (Shorts/Reels first).
  Second batch adds marker annotations (circles, arrows, ticks, highlighter), sticky notes, peso
  counters, hand-drawn charts, a calculator breakdown, mind map, checklist, myth vs fact, timeline,
  quote card, price tags, pixel peso stacks, Bit reactions and a screenshot frame. Sample money is in
  pesos (MXN) or US$ for global prices. Text never sits on a black box/plate: plain bold text only.

**Style options for an edit (user, 2026-09-28): the editing skill asks which one first** — Luisart
full board (default), Luisart split (Nick grammar, below) or Kallaway. After that choice the edit is
fully automatic.

- **Kallaway — approved style option (user, 2026-09-28)** (`styles/kallaway/`, README there; spec
  `media/soyluisart/automated-research/style-refs/kallaway/ANALISIS.md` § Spec; reference edit
  `SLA-2026-09-27-per-barato-short-kallaway`): a straight 50/50 split (ChatGPT still on top with a
  slow push, the face below on a dark set; no border, no rounded face card and no head breaking out
  of a card — on a bright selfie the whole-person matte builds the dark set), face close-ups with
  ONE giant word, few purposeful graphics (counter, stacked image cards, kinetic type, typed white
  screen, a two-colour extended-caps hook headline sliding in), hard cuts only; all the colour
  comes from the B-roll; brand blue `#7FA6FF` replaces his gold. B-roll = images and illustrations
  generated with ChatGPT (Codex CLI); everything else built in Remotion. **Its exceptions to the
  rules below (this style only):**
  1. **Continuous seam captions** (~2 words, Inter 700 ≈ 46 px, no box, emphasis in Playfair Italic
     or `#7FA6FF`) just under the split line, even while an image is on top (exception to "no
     captions while a graphic is on screen": the top is B-roll, not text that repeats the speech).
     If the top half shows text that repeats the speech (a counter, kinetic words, a headline of
     the same words), no caption there, as usual. Captions never cover the face.
  2. **Face shots: ONE giant word** (≈ 165 px) per spoken word, changing with the voice, placed
     face-aware with `styles/shared/captionSpot.ts` (chest; above the head when the chest is under
     the platform UI, as on close selfies) — never on the eyes, mouth or forehead. Replaces the
     key / plain face-shot alternation (every face shot carries the giant word).
  3. **Sober motion:** only a slow push on the B-roll images. No marker arrows, no 100/115 %
     punches, no push on the face, no transitions.
  4. **Sound:** a click on the cut that opens each section plus at most one subtle sound per image
     or counter event (efectos library); nothing on plain cuts, captions or giant words; **zero
     whooshes** (the whoosh-at-start rule does not apply).
  5. Defaults kept from the spec: no face circle over B-roll; no plates, bands or pills behind
     text (outline + shadow; a darkening gradient at the bottom of an image is not allowed if it
     reads as a band — use a text shadow or dim the whole image evenly); hook headline inside
     x 120–920; MXN and "dato de ejemplo"; "Luisart" never uppercased; no music unless the user
     supplies a file.
  6. **Deliverables:** the channel default (vertical + horizontal) unless the user asks for fewer —
     the first Kallaway draft (P/U, 2026-09-28) was vertical only at his request. The horizontal
     layouts exist in the pack (`kalGeometry(false)`); no horizontal Kallaway edit is built yet.
  Recording: the look needs a near-black set and a medium shot; on a bright close selfie the pack
  builds the dark set from the whole-person matte and keeps the split figure small (see its README).

Secondary styles:

- **Terminal** (from `prototypes/b/`, approved showcase `SLA-proto-b-terminal`): black/blue.
  Schibsted Grotesk (600–800, tight tracking) for headlines, JetBrains Mono for numbers and
  labels. Near-black `#04060B`, hairlines `#1A2233`, electric blue `#2F6BFF`, ice `#BFD4FF`,
  signal orange `#FF7A1A` for small mono labels only, gain `#3DDC97`, loss `#FF5A5F`, text
  `#EDF1F7`. Hairline frames with corner ticks, `[01]`-style mono tags, decrypt/scramble text,
  animated beams between AI logos, split-flap tickers, step charts with a white head value.
  Titles and lower thirds have no panel (corner ticks + outlined type since 2026-09-27).
  Snappy, digital, frame-exact motion. Use for AI tools, automation, markets data.
- **Documental** (from `prototypes/c/`, approved showcase `SLA-proto-c-documental`): charcoal
  `#111316`, bone `#E8E2D6`, amber `#EEBB18`, red `#E0302F`. Archivo 800–900 with its real
  italic, Source Serif 4 for quotes/footnotes/role lines. Film grain, vignette, gate weave,
  "PARTE N" kicker, bold caps title words landing one by one, yellow emphasis underline stroke
  (was a bar behind the words until 2026-09-27), big numbers with a plain source-citation
  footnote, glowing logo networks. Cinematic: Ken Burns, hard cuts, one flash
  cut on a beat. Use for business stories, history of companies, big-picture finance.

Channel-wide rules (every style — for **Kallaway**, its exceptions 1–6 above override the caption,
face-shot, motion, sound/whoosh and deliverable rules below):

- **Name:** always "Luisart" (one word, only L capitalised), never uppercased — even inside
  all-caps styles.
- **No plates behind text (user, 2026-09-27):** captions and on-screen words never sit on a black
  box, chip, pill or band ("cuadritos negros feos"). Plain bold type, legible through a thin dark
  outline painted under the letters (paint-order stroke) and/or a soft shadow, key words in brand
  blue. **Text inside an illustrated object is part of the drawing, not a plate behind a caption**
  (user, 2026-09-27): a price tag, a speech bubble, a sticky note, a board card, a UI window or a
  pixel button may carry their own words. What is never allowed is a box, chip, pill or band put
  BEHIND captions or on-screen text to make them readable.
- **(g) No face picture-in-picture on full-board scenes (user, 2026-09-27):** a full-board scene
  shows only the board. Face cards and head cut-outs belong to the split layout (graphic on top,
  face card below) and to face shots, never to a full-board scene.
- **Two kinds of face shot (user, 2026-09-27, final caption decision — replaces "zero captions"):**
  1. **Key face shot** — carries a key idea: a big behind-head word (e.g. "2 AÑOS", "BARATA",
     "≠ BUENA INVERSIÓN", "GUARDA ESTO"), or on the hook a title at the top of the graphics zone that
     grabs the viewer. Key shots get NO captions. Keep them few: the hook, the thesis, the lesson's
     pivot, the CTA — about 4–5 in a 40 s Short.
  2. **Plain face shot** — every other face shot: no big word, no title, and **captions ON**.
  Alternate the two; plan which beats are key before animating (in code: `key: true` on the
  behind-head group, `groups.ts` in the reference edit).
- **No captions while ANY graphic is on screen (still holds):** animation, board, title, figure,
  arrow, icon, behind-head word or its kicker, sticker/card, CTA element. Captions only appear on
  plain face-shot stretches where the screen shows nothing but the face; a split layout always has
  a graphic on top, so split stretches never get captions. A caption never flashes in for less than
  12 frames between two graphics. (`captionRule.ts`: each edit passes the frame windows where it
  shows any graphic.)
- **Caption placement on face shots (user, 2026-09-27):** always face-aware and always inside the
  safe area (vertical x 120–920, y 250–1436; horizontal x 140–1780, y 90–970). Never over the
  forehead, the eyes or the mouth. Order of preference:
  1. **Medium shot:** between the neck and the chest, just under the chin.
  2. **Above the head** when that fits better — e.g. a close selfie whose chest is under the
     platform UI (the 2026-09-27 test: captions land at y ≈ 287, above the hair).
  3. Otherwise the spot nearest the caption zone that clears the face; if nothing fits, reframe the
     shot slightly (zoom out / shift) — never cover the face.
  Implementation: face box per frame from `core/scripts/py/face_track.py` (MTCNN, facenet-pytorch
  in `.venv`, smoothed) → `face-track.json`; protected area = box extended up 25 % (forehead) + 36 px;
  search in `styles/shared/captionSpot.ts` (`captionSpot()`), used by the edits (`captionPlace.ts`)
  and by the Luisart `captions` element. Check with `checkCaptions.ts`: 0 caption frames over a
  graphic, 0 over the face.
- **Zones (user rule 2026-09-27; reference
  `media/soyluisart/automated-research/style-refs/safe-zones/reels-zona-subtitulos-usuario.png`;
  `ZONES` in `styles/shared/formats.tsx`, also `useFormat().zones`, outlined by `SafeZoneGuide`):**
  vertical — **graphics zone x 120–920, y 250–970** for animations, board content and behind-head
  words; **caption zone x 120–900, y 1000–1300** (above the username/audio block, left of the
  like/comment/share column) for captions when no face has to be avoided — on face shots the face
  overrides it (placement rule above). Horizontal — graphics y 90–790, captions y 820–970.
  Nothing important below y 1436 or in the right-hand 160 px of the lower half. Split layout: the
  animation on top in the graphics zone, the face card lower; only chest or background may sit
  under the bottom UI. Check every draft with stills that show the `SafeZoneGuide` overlay (and
  every caption moment) before rendering.
- **Recording tip (so captions have room):** frame yourself a little wider than a selfie — eyes at
  about 40–45 % of the height, the chin no lower than ~65 % (y ≈ 1250 on 1080×1920), and ≈ 20 % of
  clear space above the head. Then the face sits between the graphics zone and the platform UI and
  the caption fits between the neck and the chest; a very close selfie (like the 2026-09-27 test,
  face filling y ≈ 700–1440) leaves room only above the head.
- **Dynamic, never static (user, 2026-09-27):** constant micro-movement — slow push-in on the
  A-roll (plus 100/115 % punch-ins on cuts), the board paper drifting slower than its content
  (parallax), results that breathe, cards/tags that float — and plenty of hand-drawn marker
  arrows that draw on as he speaks (element → next element, price → result, curved A ↔ B), each
  with a marker stroke from `efectos/marker/`. Whooshes still only at the start and on real
  transitions.
- **Deliverables: vertical + horizontal by default (user, 2026-09-27):** every video ships as a
  vertical 1080×1920 AND a horizontal 1920×1080 version from the same cut, voice, SFX and figures.
  Horizontal Luisart: board scenes full frame with the scene centred in the graphics zone
  (y 90–790, x 140–1780), no face on them (rule g); face shots show a vertical recording as a
  centred full-height panel on the dotted paper (x 656–1264, 0.5625 × the vertical frame) — key
  shots with the big word spanning the graphics zone behind the head, plain shots with face-aware
  captions (neck/chest first; with this footage that falls inside the caption zone y 820–970).
  Reference: `videos/2026-09-27-per-barato/scenes/pizarra/HorizontalShort.tsx`.
- **Split-screen layout (user, 2026-09-27; Nick Saraev grammar, `style-refs/nick/ANALISIS.md`
  §5.1/§13):** Luisart graphic in the top band, the face in a bottom card with the head breaking
  out above it (person matte), alternating on hard cuts with full board and face close-up. Kept
  alongside the full-board Luisart edit — both are approved ways to cut a Short.
- **Delivery (user, 2026-09-27):** the finished videos are the final deliverables — raw recording →
  vertical + horizontal MP4s with the sound baked in, fully automatic, in
  `out/soyluisart/videos/<video>/`. Green-screen (`#00FF00`) and white-board clips exist only for
  the reusable graphics library, which the user can key over a recording in his own editor:
  Luisart library clips in `out/soyluisart/pizarra/`, Terminal and Documental in
  `out/soyluisart/green/<style>/` and `out/soyluisart/green-vertical/<style>/`.
- **Rejected, don't reuse:** the first pass (Inter + Montserrat, white rounded cards, emoji icons,
  navy + blue radial glow — everything in the sections below and in `animations/`) and prototype
  A (engraving editorial).
- Sample data in graphics is always labelled "dato de ejemplo"; real figures must be checked
  against a primary source (see GUIDELINES).
- **Sound design is mandatory and baked into every edit** (the user stresses it): an SFX on
  essentially every graphic event, placed on the frame the visual lands. Library:
  `media/soyluisart/audio/` (`efectos/`, `GUIA-EFECTOS.md` with the default sound map per element,
  `LICENCIAS.md` — only audio cleared for monetised YouTube/Shorts/TikTok). Voice stays king: SFX
  −12 to −18 dB under it; final mix ≈ −14 LUFS integrated, true peak ≤ −1 dBTP.
  **Whooshes only at the start of a video and on real transitions** — never on every element.
  Elements appearing get smaller specific sounds: click/UI tap for text and chips, mechanical
  keyboard typing for typed/decrypted text, split-flap clatter for tickers, pop for small tags,
  stamp/thud for stamps, ding for results. One sound per beat, never over the voice's words.
- **Music: the user chooses it — never pick a music bed for them (user decision, 2026-09-27).**
  They rejected "Stylz" and every library/trending option (incl. the 5 trending previews). They drop
  their own files into `media/soyluisart/user-provided/musica/` and say which one to use; until then
  every render goes out with NO music (voice + SFX). Each video keeps the choice in ONE constant
  (`videos/<video>/scenes/music.ts` → `USER_MUSIC`, a file name in that folder, null = no music).
  When set: ≈ −20 to −24 LUFS under the voice (≈ −16), ducked from the word timings. Trending
  commercial songs are added by the user inside the platform app, never baked in.

### Formats

- **Horizontal (YouTube long-form):** 1920×1080, 30 fps. Safe margins 140 px sides, 90 top,
  110 bottom. Green-screen library graphics (Terminal, Documental) in `out/soyluisart/green/<style>/`.
- **Vertical (Shorts / Reels / TikTok):** 1080×1920, 30 fps. Safe area = the union of the three
  platforms' UI (checked 2026-09-27): **top 250, bottom 484, left 120, right 160** — text,
  faces, logos and captions stay inside that 800×1186 box — and inside it, captions in the caption
  zone and graphics in the graphics zone (see "Zones" above). The bottom 484 px hold the platform
  caption and buttons; the right 160 px hold the like/share rail. Green-screen library graphics (Terminal, Documental) in
  `out/soyluisart/green-vertical/<style>/`, composition IDs end in `-v`.
- Layout comes from `styles/shared/formats.tsx` (`FORMATS`, `useFormat()`): every element lays
  itself out for the canvas it's in (stacked on vertical, not a shrunken horizontal layout).
  `SafeZoneGuide` / the `safeGuide` prop shows the covered areas in Studio previews only.
- A short is a video like any other: `channels/soyluisart/videos/<yyyy-mm-dd-slug>/` with
  `Format: vertical + horizontal` at the top of its BRIEF.md (the default deliverable). The
  standard is a constant 30 fps, vertical 1080×1920 and horizontal 1920×1080: the recording is
  converted to that working copy at ingest (rotation applied, variable frame rate made constant)
  and every cut, timing and render uses it; images and illustrations for B-roll are
  generated with ChatGPT through the Codex CLI (fal.ai/Seedance ran out of credit, 2026-09-27; its
  older vertical backdrops remain in `media/soyluisart/automated-research/fal/vertical/`).
- Shorts captions: word-by-word with the style's caption element (Luisart: 2–4 words, active word
  blue), only on plain face shots (no graphic on screen), placed face-aware (neck/chest first, else
  above the head), never over the face (rules above).

---

Status (first pass, superseded): approved 2026-09-27, white flash chosen for section changes. Board:
`out/soyluisart/brand/SLA-brand-board.png`.

## Audience and tone

Spanish-language YouTube channel. Tone to confirm with the user; the style references are
YouTube-growth / creator-education channels (Mirko Vigna, InvernovAH), so the default is
friendly, direct and modern, with clean "tech UI" graphics.

## Canvas

1920×1080 at 30 fps by default. A cut recording keeps its own frame rate and resolution.

## Palette (`theme.ts` → `color`)

| Token | Hex | Use |
|---|---|---|
| bgDeep | `#02030D` | Base background, near-black navy |
| bgNavy | `#050A2E` | Background gradient bottom |
| bgNavyLight | `#0B1650` | Soft corner glows |
| glow | `#1A2BFF` | Blue light pooling at the bottom of the frame |
| glowSoft | `#2F6BFF` | Gradients, thumbnail placeholders |
| accent | `#3D8BFF` | Highlights, numbers, cursor, markers |
| accentCyan | `#4FC3FF` | Handwritten notes, secondary accent |
| card | `#F4F3F8` | Cards, search pill |
| cardText / cardTextMuted | `#0B0D1A` / `#5B6078` | Text on cards |
| text / textMuted | `#FFFFFF` / `#A9B0C8` | Text on the dark background |

Background values were sampled from the reference frames (`#02010B`, `#01020F`, `#03042D`,
`#050E42`, `#020B3D`, glow `#020184`) and lifted slightly toward a cleaner royal blue.

## Fonts (Google Fonts, loaded in `theme.ts`)

- **Inter** (400–800, tracking −0.02em): UI, cards, body text. Closest free match to the
  SF-Pro-style grotesk both references use.
- **Montserrat** (800–900, uppercase, tracking 0.06–0.1em): titles, name lower thirds, big
  numbers.
- **Caveat** (500–700): handwritten notes and labels ("Mentalidad" style in InvernovAH).

## Logo

Pending — the user is designing one. Until then, use the handle `@soyluisart` in Montserrat 900.
A homepage logo set (Bit + `@soyluisart` lockup and 8 pixel icons) was generated with the Codex CLI from the Luisart kit on 2026-09-28 for the Obsidian home screen: `media/soyluisart/brand/homepage-logos/` (not the official channel logo).

## Motion style (`theme.ts` → `motion`)

Measured frame by frame in the references:

- **Entrances:** hard cut to the navy background, then the element pops in from small with a
  spring overshoot (≈5 frames at 30 fps), settling in ≈8 more (Mirko, card at 1:02).
- **Never dead still:** after settling, a slow camera drift / push-in keeps moving (≈1.2 % scale
  per second).
- **Typewriter:** search-pill text types at ≈28 characters per second (InvernovAH, 0:19).
- **Light sweep:** a soft white shine passes over thumbnails and cards once they land.
- **Glow, not blur:** white elements carry a soft white-blue outer glow on the dark background.

## Transitions

- In: hard cut to the navy background + pop-in.
- Out: quick push-out (8 frames).
- Section change: **white flash (Mirko style) — chosen by the user (2026-09-27).** Cut to light
  grey, white in 3 frames, 3-frame white hold with the cut inside it, then the white fades off the
  next shot over 6 frames (`WhiteFlash` in `animations/Transitions.tsx`). The InvernovAH orange
  light leak is not used.
- End dip: to black over 15 frames (`EndDip`).
- Sounds: 35 ms UI click on each card landing, 360 ms soft whoosh with the white flash —
  synthesised with FFmpeg (`media/soyluisart/automated-research/sfx/`, logged in its
  `SOURCES.md`; paths in `theme.sfx`). Every card has an `sfx` prop (default on).

## Voice

Not chosen yet. Hardware check: Qwen3-TTS **0.6B** (RTX 4050, 6 GB VRAM), so no tone
instructions or voice design; tone comes from the speaker, punctuation and line breaks. Or the
creator's own voice.

## Glossary

- soyluisart / Luisart

## Pacing

Keep natural pauses unless the user asks for tighter cuts.

## Do's and don'ts

- Do: dark navy backgrounds with blue glow, clean white cards, rebuilt YouTube UI (video cards,
  channel pages, search bar), big bold numbers in the accent blue.
- Don't: live CSS blur on large photos (pre-blur instead), hard-coded colors outside
  `theme.ts`, flat pure-black backgrounds with no glow.

## Composition-ID code

`SLA`

## Style reference

Sources (copies in `archive/soyluisart/style-refs/`, contact sheets in
`media/soyluisart/automated-research/style-refs/sheets/`, logged in that folder's `SOURCES.md`):

1. Mirko Vigna — "Cómo Crecer en Youtube Desde 0 en 2026" — https://www.youtube.com/watch?v=a1HhE91vFoM
2. InvernovAH — "40 Lecciones que Aprendí tras +365 Días Subiendo Vídeos a YouTube" — https://www.youtube.com/watch?v=stUiviCM1bw

Findings:

- **Shared base:** near-black navy backgrounds with deep royal-blue light pooling at the bottom
  and corners; white UI elements with rounded corners and a soft glow; SF-Pro-like grotesk
  with tight tracking.
- **Mirko:** retro perspective grid floor (blue lines) with a motion-blurred carousel of
  thumbnails for the intro; YouTube video cards rebuilt in dark mode (thumbnail + title +
  channel) popping in with overshoot and drifting; blurred screen recordings framed on the navy
  background with a facecam inset; white-background thumbnail showcases; white flash
  transitions through grey; glossy 3D-ish icons (light bulb) on black.
- **InvernovAH:** white search pill with glowing edge and typewriter text; 3D objects (cardboard
  boxes, folders, paper cards with emoji icons, "Lección N" white cards with a YouTube logo);
  outlined-box uppercase name lower third ("JIMMY DONALDSON") over B-roll; vignetted,
  slightly darkened archive clips; warm orange light-leak transitions; handwritten labels.

### Nick Saraev (2026-09-27, the user loves his style)

Sources: 12 Instagram reels (@nick_saraev, 10 from Sept 2026 + 2 pinned from 2025), 1 YouTube
Short and 3 long YouTube videos (@nicksaraev), copies in `archive/soyluisart/style-refs/nick/`.
Full analysis (Spanish), measurements, sheets and proposed pack spec:
`media/soyluisart/automated-research/style-refs/nick/ANALISIS.md` (`_index.png`,
`_index-largo.png`, `sheets/`, `SOURCES.md`). Not yet approved as a pack; open questions in §13.

- **Reels layout:** three layouts, hard cuts every ~2.4 s (23 cuts/min): full graphic 43 %,
  split 32 %, tight face close-up 25 %. Split = plain panel on top + facecam card at the bottom
  (97 % wide, top edge at 63 % of the height, top corner radius ≈180 px @1080, bleeds off the
  bottom, no border or shadow) with the **head breaking out above the card**. All 10 reels from
  2026 open on the split at frame 0.
- **Look:** Apple-keynote clean. Plain `#FFFFFF` (also `#F7F5F3`, kraft `#E0D6C7`, near-black
  `#121212`, grey radial vignette); real full-colour logos without frames; thin 2 px chips
  (radius ≈9), dark mono pills; dashed S-curve "cable" connectors (3 px, dot at the origin,
  marching dashes) built one node per spoken word. Long form: Excalidraw (live or an
  Excalidraw-style deck, pastel Excalidraw palette) + vertical webcam flush right, no music.
- **Type:** Inter 700 −4 % captions (1–3 words, no box, no karaoke; y 47 % in the split, 70 % on
  full graphics, 73 % on the face); **Instrument Serif Italic caps with a same-colour stroke** for
  emphasis; Inter 700 +24 % labels; JetBrains Mono pills; pixel labels. CTA = "comment
  KEYWORD" on the face with a glowing gradient keyword.
- **Motion:** pop-in scale 0.78→1 in 5 f (≈2 % overshoot, settled by f8); hero "slam" 4×→1× in
  12 f; cables 4–6 f; decode 14 f; slot counter 12/21 f; no camera moves; 0–2 warm light-leak
  transitions (≈16 f) per reel.
- **Sound:** voice −14 LUFS, LRA 1.3–3.1 (very compressed); music bed ≈21 dB under the voice
  (≈ −35 LUFS), the same unidentified track reused across 5 reels; sparse short swishes/ticks
  (37 % of cuts, the CTA keyword, the counter landing), none on captions.

### Kallaway (2026-09-28, the user loves his "simple but very good" style) — approved as a style option (★ above)

Sources: 13 recent Instagram reels (@kallaway, Aug–Sep 2026, 61–121 s) + 1 pinned 2024 reel, and 2
long YouTube videos (@kallawaymarketing), copies in `archive/soyluisart/style-refs/kallaway/`. Full
analysis (Spanish), measurements, sheets, pack spec ("§ Spec": tokens, captions, layouts, motion,
SFX map, element list, ChatGPT image prompts, rule conflicts) and 3 test images:
`media/soyluisart/automated-research/style-refs/kallaway/ANALISIS.md` (`_index.png`,
`_index-largo.png`, `sheets/`, `gen/`, `SOURCES.md`). **Approved as a style option on 2026-09-28**
with the user's answers to its §S.10 (seam captions yes, one giant word on face shots, no punch,
blue instead of gold, no circle PiP, no music unless he supplies one); the pack is
`styles/kallaway/` and its exceptions are listed in ★. Still open: a dark set for recording.

- **Layouts:** a straight 50/50 split (seam at y 968, no border, card or head cut-out; B-roll on
  top, him below) 55 % of the time; face close-up 25 % (face ≈ 45 % of the width, centre y ≈ 710);
  full-frame B-roll with his face in a Ø 366 px circle top-left 14 %; B-roll alone or in a 9:16
  rounded card on black 6 %. Hard cuts only; 22 layout changes/min, 42 cuts/min counting the
  top-panel B-roll (one image per noun, ~1.4 s each). Every reel opens on the split with a
  two-colour extended-caps headline sliding in from the right over the B-roll.
- **Type:** Inter 700 only, two sizes: ~46 px white captions of ~2 words just under the seam, and
  ONE giant word (~165 px) per spoken word on the chest in face shots (never over the face); no
  boxes, no karaoke; emotion words switch to Playfair Display Italic, key words to gold `#E1C676`.
  Hook headline ≈ Archivo 900 at 125 % width.
- **Graphics:** few and purposeful: count-up numbers, 2–3 stacked image cards (one per word),
  word-by-word kinetic type over the B-roll, press headlines, typed names on white. No
  punch-ins, no zooms, no transitions, almost no arrows.
- **Sound:** voice −14.8 LUFS, very compressed; a soft electronic music bed always present,
  ≈ 10 dB under the voice (≈ −24 LUFS), no ducking, the same track reused across reels; no
  whooshes; only a short click/pop on the cut that opens a section ("But…", "Here's…").
- **Needs a dark set:** near-black studio with coloured practical lights and black clothes; the
  B-roll carries all the colour. The 2026-09-27 test recording (bright wall, close selfie) does not
  fit the look.

## Animation catalog

All in `channels/soyluisart/animations/`, props-driven with a zod schema (editable in Studio).
Showcases live in Studio under soyluisart → animations (`SLA-anim-*`). Cards pop in
(`theme.motion.popIn`), drift, and push out in the last 8 frames of their Sequence unless
`exit="none"`; set `background` off to lay them over footage.

- **NavyBackground** (`NavyBackground.tsx`) — the animated navy + blue glow backdrop behind every graphic. Props: `glowX`, `glowY`.
- **kit** (`kit.tsx`) — shared motion: `CardMotion` (pop-in, drift, push-out), `LightSweep`, `Sfx` (click/whoosh), `Stage`, `usePop`, `usePushOut`. Use for any new card so motion stays consistent.
- **SearchPill** (`SearchPill.tsx`) — white glowing pill typing a question or video title (hooks, "lo que busca la gente"). Props: `text`, `background`, `sfx`, `exit`.
- **LessonCard** (`LessonCard.tsx`) — white "Lección N" card for numbered points and key takeaways. Props: `title`, `subtitle`, `icon` (emoji or media path), `background`, `sfx`, `exit`.
- **YouTubeCard** (`YouTubeCard.tsx`) — rebuilt dark-mode YouTube video card when a video is mentioned. Props: `thumbnail`, `title`, `channel`, `avatar`, `verified`, `views`, `age`, `duration`, `chip`, `background`, `sfx`, `exit`.
- **NameLowerThird** (`NameLowerThird.tsx`) — outlined-box uppercase name over footage when a person first appears. Props: `name`, `role`, `position`, `background` (off by default).
- **StatCallout** (`StatCallout.tsx`) — big counting accent number with a label for any figure. Props: `value`, `decimals`, `prefix`, `suffix`, `label`, `countSeconds`, `background`, `sfx`, `exit`.
- **GridIntro** (`GridIntro.tsx`) — video intro: blue perspective grid, racing thumbnail carousel, handle pop. Props: `thumbnails`, `title`, `titleAt`, `sfx`, `exit`.
- **Transitions** (`Transitions.tsx`) — `WhiteFlash` (overlay at a cut; use `whiteFlashTiming.total` and `whiteFlashOverlayOffset` in a `TransitionSeries.Overlay`), `whiteFlash()` (@remotion/transitions presentation), `PushOut` (wrapper), `EndDip` (fade to black at the end of its Sequence). Showcase: `TransitionsShowcase.tsx`.
