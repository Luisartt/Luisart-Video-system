# ¿Barata = buena inversión? (múltiplo precio-utilidad)

Format: vertical (1080×1920, 30 fps) + horizontal (1920×1080) · Style: **Pizarra** (the channel standard): full board vertical (`SLA-2026-09-27-per-barato-short-pizarra`, draft v7), split screen vertical (`SLA-2026-09-27-per-barato-short-split`, draft v5) and horizontal (`SLA-2026-09-27-per-barato-short-pizarra-h` → `...-pizarra-v7-horizontal.mp4`); **Kallaway** draft, vertical only (`SLA-2026-09-27-per-barato-short-kallaway`, 2026-09-28, see "Kallaway draft" at the end); Terminal v1–v3 kept for comparison · Status: v7 set rendered 2026-09-28 after the v6 Codex review (horizontal boards re-laid out larger, labels larger, extra SFX; review clean) — next: user review; user music (optional); company B price (10 vs 100)
Recording: recordings/soyluisart/2026-09-27-per-barato-raw.mp4 (WhatsApp, 576×1024 VFR, 44.1 s) → working copy media/.../2026-09-27-per-barato/aroll-1080x1920.mp4 (CFR 30, upscaled) · person matte aroll-person-alpha.webm (Robust Video Matting, local GPU)
**2026-09-28: at the user's request the raw recording and every working copy made from it (16 kHz wav, aroll, mattes, voice-cut wavs, face track, aroll/matte check sheets) were moved to the Windows Recycle Bin.** The rendered videos and library clips stay; nothing that uses the A-roll can be re-rendered unless he provides the recording again.
Transcript: media/.../2026-09-27-per-barato/transcript-words.json (whisper-large-v3-turbo, word timestamps, source time)

## Script (user's) vs what was said
- Hook: script mentions "Bloomberg Terminal"; the recording doesn't say it ("Me llevo más de dos años estudiando entender esto").
- Flub cut: "vale 20 pesos y gana 10%, gana 10 pesos por acción" → removed "y gana 10%," (see cut/cuts.json).
- **Figure issue (user's call):** recording says "Si otra vale **10** y gana 2 pesos, su múltiplo es 50" — 10 ÷ 2 = 5. The script says 100 (100 ÷ 2 = 50). Test edit shows the script's correct numbers on screen (100 → 50) and flags it; options: re-record that sentence, or patch "cien" with a clone of the user's own voice (Qwen3-TTS Base, needs the user's OK).

## Cut
Keep [0.00–20.70] + [22.00–43.50] (source s). Cut time = source for t < 20.70; source − 1.30 for t ≥ 22.00. Length ≈ 42.2 s.

## Inserts (source-time word cues)
1. Hook — behind-head keyword "2 AÑOS" on "dos años" (0.80); then "BARATA" (5.30) and "≠ BUENA INVERSIÓN" (7.44) behind head.
2. "Aquí te explico por qué" (8.20) — small decrypt tag [01] LA TRAMPA.
3. "ve el precio" (10.32) — split-flap price chip "ACCIÓN · $20.00"; "regalada" (11.46) — stamp "¿REGALADA?".
4. "el precio no dice nada… utilidades" (12.56–16.22) — PRECIO vs UTILIDADES two-chip compare, "utilidades" lands on 14.88.
5. "Ahí entra el múltiplo precio y utilidad" (16.58–18.70) — board scene opens; formula card "P/U = Precio ÷ Utilidad por acción", lands on "múltiplo" 17.20.
6. Example A (19.06–25.40): Precio $20 on "20" (20.14) · UPA $10 on "10" (22.36) · P/U = 2 on "2" (25.06).
7. Example B (25.40–30.32): Precio $100 on "vale" (25.82) · UPA $2 on "2" (27.16) · P/U = 50 on "50" (29.04).
8. "la segunda es más cara" (32.00) — B flagged MÁS CARA (32.64); "aunque el precio por acción diga lo contrario" — $20 < $100 but 2 < 50 line.
9. CTA (35.32–40.56) — behind-head "¿BARATO" on 38.38, "COMPARADO CON QUÉ?" on 40.14.
10. "Guarda esto" (41.22) — save/bookmark chip + end.
Captions word-by-word throughout, lower-middle (face sits in the upper half), never inside the bottom 484 px.

## Version 2 (2026-09-27, after the user's review of v1)
- Board scenes: speaker picture-in-picture card removed; formula card and Empresa A/B cards enlarged and spread over the safe area (formula 314–538, cards 562–1142, takeaway strip 1190–1323, captions centred above 1416).
- Cutout: `aroll-person-alpha-v2.webm` (decontaminated edges, more hair detail).
- Behind-head words: dark band removed; words are dark ink `#0A0F1E` (Schibsted Grotesk 800) with electric-blue accents ("2", "≠", "¿", "?") and only a faint light halo. Checked over the picture frame / dark object behind the head: "¿BARATO" nudged up 30 px, "INVERSIÓN" 15 px.
- "¿Barato comparado / CON QUÉ?" moved up (lead 262, big line 330) so the hair no longer hides the Q's tail.
- Company B stays at $100 / $2 / 50 (10-vs-100 still the user's call).
- Voice: mastered copy `voice-cut-master.wav` (light compression + two-pass loudnorm −15 LUFS / −1.5 dBTP), built by `cut/build-voice.ts`.
- Render: out/soyluisart/videos/2026-09-27-per-barato/SLA-2026-09-27-per-barato-short-v2.mp4 (v1 kept).

## Sound design v2
Cue list in `scenes/cues.ts` (placed from the word timings; each sample's measured peak from `media/soyluisart/audio/efectos/sfx-index.json` lands on its visual's frame). Whooshes only on the opening hook and the two board transitions; every other beat gets one smaller sound. Levels are Remotion `volume` against the mastered voice (~−15 LUFS).

| Lands at (cut) | Sound | Reason | Level |
|---|---|---|---|
| 0.00 s (f0) | `glitch/glitch-break-01.wav` | hook · glitch stab | 0.22 (-13.2 dB) |
| 0.80 s (f24) | `whoosh/whoosh-epic-07.wav` | hook · whoosh → 2 AÑOS | 0.26 (-11.7 dB) |
| 3.53 s (f106) | `typing/typing-key-presses-short-02.wav` | decrypt · Una acción | 0.16 (-15.9 dB) |
| 5.30 s (f159) | `impact/impact-bass-hit-short-01.wav` | BARATA lands | 0.24 (-12.4 dB) |
| 7.43 s (f223) | `glitch/glitch-quick-01.wav` | ≠ BUENA INVERSIÓN | 0.16 (-15.9 dB) |
| 8.20 s (f246) | `pop/pop-soft-01.wav` | [01] La trampa tag | 0.24 (-12.4 dB) |
| 10.23 s (f307) | `ticker/ticker-split-flap-01.wav` (from 50 s, 12 f) | $20.00 split-flap | 0.24 (-12.4 dB) |
| 11.47 s (f344) | `misc/misc-stamp-01.wav` | ¿REGALADA? stamp | 0.32 (-9.9 dB) |
| 12.87 s (f386) | `ui/ui-click-tone-01.wav` | PRECIO chip | 0.28 (-11.1 dB) |
| 14.87 s (f446) | `ui/ui-click-mouse-02.wav` | UTILIDADES chip | 0.28 (-11.1 dB) |
| 16.57 s (f497) | `whoosh/whoosh-air-quick-03.wav` | board in · whoosh | 0.28 (-11.1 dB) |
| 16.57 s (f497) | `impact/impact-sub-boom-01.wav` | board in · sub | 0.18 (-14.9 dB) |
| 17.20 s (f516) | `typing/typing-key-presses-short-02.wav` | P/U formula types | 0.18 (-14.9 dB) |
| 19.67 s (f590) | `ui/ui-click-select-01.wav` | Empresa A card | 0.24 (-12.4 dB) |
| 20.00 s (f600) | `ticker/ticker-split-flap-01.wav` (from 10 s, 8 f) | A · $20 flap | 0.24 (-12.4 dB) |
| 20.93 s (f628) | `ticker/ticker-split-flap-01.wav` (from 20 s, 8 f) | A · $10 flap | 0.24 (-12.4 dB) |
| 23.77 s (f713) | `notification/notification-ding-keyword-01.wav` | A · P/U = 2 ding | 0.22 (-13.2 dB) |
| 24.40 s (f732) | `ticker/ticker-split-flap-01.wav` (from 30 s, 10 f) | B · $100 flap | 0.24 (-12.4 dB) |
| 25.73 s (f772) | `ticker/ticker-split-flap-01.wav` (from 40 s, 8 f) | B · $2 flap | 0.24 (-12.4 dB) |
| 27.73 s (f832) | `data/data-bleep-01.wav` | B · P/U = 50 bleep | 0.24 (-12.4 dB) |
| 31.33 s (f940) | `tension/tension-heartbeat-impact-01.wav` | 50 MÁS CARA · low hit | 0.3 (-10.5 dB) |
| 31.83 s (f955) | `ui/ui-click-classic-02.wav` | takeaway strip | 0.18 (-14.9 dB) |
| 34.03 s (f1021) | `whoosh/whoosh-wind-short-06.wav` | board out · whoosh | 0.28 (-11.1 dB) |
| 37.07 s (f1112) | `notification/notification-pop-hard-01.wav` | ¿BARATO lands | 0.24 (-12.4 dB) |
| 38.83 s (f1165) | `typing/typing-key-presses-short-02.wav` | decrypt · ¿Barato comparado | 0.14 (-17.1 dB) |
| 39.13 s (f1174) | `impact/impact-cinematic-boom-01.wav` | CON QUÉ? lands | 0.16 (-15.9 dB) |
| 39.93 s (f1198) | `ui/ui-tech-select-01.wav` | Guarda esto chip | 0.28 (-11.1 dB) |
| 40.60 s (f1218) | `ui/ui-click-mouse-01.wav` | bookmark fills | 0.28 (-11.1 dB) |
| 41.80 s (f1254) | `notification/notification-bell-ding-01.wav` | outro sting | 0.2 (-14.0 dB) |

SFX licences:
- glitch/glitch-break-01.wav — Mixkit, Mixkit Sound Effects Free License
- whoosh/whoosh-epic-07.wav — Pixabay, Pixabay Content License
- typing/typing-key-presses-short-02.wav — Mixkit, Mixkit Sound Effects Free License
- impact/impact-bass-hit-short-01.wav — Mixkit, Mixkit Sound Effects Free License
- glitch/glitch-quick-01.wav — Mixkit, Mixkit Sound Effects Free License
- pop/pop-soft-01.wav — Pixabay, Pixabay Content License
- ticker/ticker-split-flap-01.wav — Pixabay, Pixabay Content License
- misc/misc-stamp-01.wav — Pixabay, Pixabay Content License
- ui/ui-click-tone-01.wav — Mixkit, Mixkit Sound Effects Free License
- ui/ui-click-mouse-02.wav — Pixabay, Pixabay Content License
- whoosh/whoosh-air-quick-03.wav — Mixkit, Mixkit Sound Effects Free License
- impact/impact-sub-boom-01.wav — Pixabay, Pixabay Content License
- ui/ui-click-select-01.wav — Mixkit, Mixkit Sound Effects Free License
- notification/notification-ding-keyword-01.wav — Pixabay, Pixabay Content License
- data/data-bleep-01.wav — Mixkit, Mixkit Sound Effects Free License
- tension/tension-heartbeat-impact-01.wav — Mixkit, Mixkit Sound Effects Free License
- ui/ui-click-classic-02.wav — Mixkit, Mixkit Sound Effects Free License
- whoosh/whoosh-wind-short-06.wav — Mixkit, Mixkit Sound Effects Free License
- notification/notification-pop-hard-01.wav — Mixkit, Mixkit Sound Effects Free License
- impact/impact-cinematic-boom-01.wav — Pixabay, Pixabay Content License
- ui/ui-tech-select-01.wav — Mixkit, Mixkit Sound Effects Free License
- ui/ui-click-mouse-01.wav — Pixabay, Pixabay Content License
- notification/notification-bell-ding-01.wav — Mixkit, Mixkit Sound Effects Free License
- Music: `fondos/finanzas-negocios/finanzas-stylz.wav` — Stylz (Ahjay Stelino), Mixkit Stock Music Free License (https://mixkit.co/free-stock-music/electronic/). Volume 0.2 (≈ −24 LUFS) under the voice, +3 dB in gaps (ducked from the word timings), 0.5 s fade in, 1 s fade out.

Mix/master: voice `voice-cut-master.wav` (−15 LUFS); final pass +1.3 dB + limiter (−2.2 dBFS ceiling), AAC 256k. Measured on the v2 render: **−14.1 LUFS integrated, true peak −2.1 dBTP**. Whole-render Whisper transcript matches v1 word for word (only "llevo" heard as "llevó" under the opening stab); join still reads "…vale 20 pesos / gana 10 pesos por acción".
- Board background got a faint navy centre glow (#0E1A33 → #04060B) so sparse board frames don't read as all-black (QA flagged them once the PiP was gone).
- Master step (after `render:locked`, rendered to `_v2-premaster.mp4`): `ffmpeg -i _v2-premaster.mp4 -c:v copy -af "volume=1.3dB,alimiter=limit=0.78:attack=3:release=60:level=false,aresample=48000" -c:a aac -b:a 256k SLA-2026-09-27-per-barato-short-v2.mp4`.


## Feedback on v2 (2026-09-27) → v3 + Pizarra
1. **Captions / on-screen text:** the user hates the black boxes behind the captions ("cuadritos
   negros feos"). Every plate, chip, pill and band behind text is gone in both versions: plain bold
   type with a thin dark outline painted under the letters (paint-order stroke) + a soft shadow,
   active/key words in brand blue. Rule added to CHANNEL.md (★ standard).
2. **Music:** "Stylz" rejected. Both versions render with NO music bed for now (voice + SFX).
   The bed is ONE swappable constant: `scenes/music.ts` → `MUSIC_TRACK` (null today; set `file`
   to the chosen track under `media/soyluisart/audio/fondos-tendencia/` and re-render — levels,
   ducking and fades are already wired through `Sound.tsx → MusicBed`).
3. **SFX:** kept (user liked most). Whooshes only at the start and on real board transitions.
4. **Figures in one place:** `scenes/figures.ts` (`A = {price 20, eps 10}`, `B = {price 100, eps 2}`;
   P/U is computed). Board cards, takeaway rows, cue names and the caption that shows B's price all
   read from it. Note for the pending decision: with **$100** the line "aunque el precio por acción
   diga lo contrario" does not hold ($100 > $20 also says B is dearer); with the recorded **$10**
   it holds, but then P/U = 10 ÷ 2 = **5**, not the "50" that was said.

## Version 3 — Terminal (2026-09-27)
Out: `out/soyluisart/videos/2026-09-27-per-barato/SLA-2026-09-27-per-barato-short-v3.mp4` (v1, v2 kept) · sheet `sheet-v3.png`.
- Captions (`Captions.tsx`): no chip; outline + shadow (`plainText()`), same word timing/pages.
- Over the A-roll: "[01] La trampa", "[Acción] · precio $20.00", PRECIO vs UTILIDADES, "vs",
  "Guarda esto" + bookmark are plain outlined text (no panels). The split-flap tiles (little dark
  boxes) became plain mono digits that scramble and lock (same ticker sound).
- `Stamp` (¿REGALADA?, MÁS CARA): no box or frame, red outlined word with the same slam.
- Board: "[Dato de ejemplo]" and the takeaway strip are plain text; the formula card and the two
  Empresa cards stay (they are the diagram, not plates behind captions).
- Sound: v2 cue list unchanged (`cues.ts`), no music.

## Pizarra version (2026-09-27)
Composition `SLA-2026-09-27-per-barato-short-pizarra` (code `scenes/pizarra/`: `PizShort.tsx`,
`layout.ts`, `Boards.tsx`, `Behind.tsx`, `PizCaptions.tsx`, `Marker.tsx`, `icons.tsx`, `pizCues.ts`).
Same cut, voice (`voice-cut-master.wav`), words and beats as the Terminal short; Santiago
Castellanos' whiteboard grammar from `styles/pizarra/` in the Luisart brand (white dotted board,
ink + electric blue, red only for "más cara", Inter Tight typed 1 char/frame, Shadows Into Light
Two handwriting, pixel icons, Bit). Hard cuts only; A-roll punch 100/115 % on the cuts; no face
picture-in-picture on the board; nothing has an exit animation. Board ≈ 55 % of the runtime.
Out: `out/soyluisart/videos/2026-09-27-per-barato/SLA-2026-09-27-per-barato-short-pizarra.mp4` · sheet `sheet-pizarra.png`.

| Cut time | Layout | What lands (on its word) |
|---|---|---|
| 0.00–3.37 | A-roll 100 % | kicker "llevo más de" (frame 0) + **2 AÑOS** blue, typed on "dos", behind the head |
| 3.37–7.43 | A-roll 115 % | "una acción, cuando está" + **BARATA** on "barata" |
| 7.43–9.57 | A-roll 100 % | **≠ BUENA** (ink) / **INVERSIÓN** (blue); three pixel "?" cards around the head on "Aquí te explico" |
| 9.57–12.57 | Board | EL PRECIO / "lo que todo el mundo ve"; stick figure points at a pixel price tag $20 on "precio"; bubble "¡Ah, está regalada!" typed on "ah" |
| 12.57–13.87 | A-roll 100 % | "pero el" + **PRECIO** |
| 13.87–16.57 | A-roll 115 % | "si no lo comparas con las" + **UTILIDADES** |
| 16.57–19.07 | Board | MÚLTIPLO P/U; P/U = PRECIO ⁄ UTILIDAD "por acción" (each on its word, marker bar drawn on "y"); Bit drops in on "entra" |
| 19.07–24.10 | Board | EMPRESA A / "dato de ejemplo": $20 ⁄ $10 = **2** (blue marker ring) |
| 24.10–29.03 | Board | EMPRESA B: $100 ⁄ $2 = **50** (ring) + "(la empresa A: P/U = 2)" |
| 29.03–34.03 | Board | A \| B recap (precio, P/U); B underlined on "segunda"; 50 turns red + red ring on "más", "más cara" on "cara"; prices underlined on "precio"; "el precio solo no dice nada" on "contrario" |
| 34.03–36.33 | A-roll 100 % | "antes de" + **COMPRAR** |
| 36.33–37.07 | A-roll 115 % | **PREGÚNTATE** |
| 37.07–39.93 | Board | **¿BARATO** / COMPARADO / **CON QUÉ?** (blue), three "?" cards in the pause |
| 39.93–42.20 | A-roll 100 % | **GUARDA** / **ESTO**; pixel bookmark drops on "esto", fills blue on "vas"; Bit |

Captions: same pages as the Terminal cut, whole chunk hard-swaps, active word blue, centred at
71 % height; ink on the board, white with a thin ink outline + soft shadow on the A-roll; no plate.

### Sound design (Pizarra)
| Lands at (cut) | Sound | Reason | Level |
|---|---|---|---|
| 0.80 s (f24) | `whoosh/whoosh-air-fast-04.wav` | start · whoosh → 2 AÑOS | 0.3 (-10.5 dB) |
| 3.37 s (f101) | `typing/typing-mechanical-key-single-01.wav` | kicker on the cut · key | 0.24 (-12.4 dB) |
| 5.30 s (f159) | `typing/typing-key-presses-short-02.wav` | BARATA typed | 0.3 (-10.5 dB) |
| 7.43 s (f223) | `typing/typing-key-presses-short-02.wav` | ≠ BUENA INVERSIÓN typed | 0.26 (-11.7 dB) |
| 8.20 s (f246) | `pop/pop-soft-01.wav` | ? cards pop | 0.3 (-10.5 dB) |
| 8.73 s (f262) | `pop/pop-bubble-01.wav` | ? card 3 pop | 0.2 (-14.0 dB) |
| 9.57 s (f287) | `whoosh/whoosh-air-quick-03.wav` | board in · whoosh | 0.28 (-11.1 dB) |
| 10.33 s (f310) | `money/money-coins-clink-01.wav` | $20 tag · coins | 0.26 (-11.7 dB) |
| 10.93 s (f328) | `typing/typing-mechanical-run-01.wav` | bubble typed · ¡está regalada! | 0.2 (-14.0 dB) |
| 12.57 s (f377) | `typing/typing-mechanical-key-single-01.wav` | kicker on the cut · key | 0.22 (-13.2 dB) |
| 12.87 s (f386) | `typing/typing-key-presses-short-02.wav` (from 0.2 s, 9 f) | PRECIO typed | 0.28 (-11.1 dB) |
| 13.87 s (f416) | `typing/typing-mechanical-key-single-01.wav` | kicker on the cut · key | 0.22 (-13.2 dB) |
| 14.87 s (f446) | `typing/typing-mechanical-short-01.wav` | UTILIDADES typed | 0.26 (-11.7 dB) |
| 16.57 s (f497) | `whoosh/whoosh-air-fast-04.wav` | board in · whoosh | 0.3 (-10.5 dB) |
| 16.57 s (f497) | `impact/impact-sub-boom-01.wav` | board in · sub | 0.16 (-15.9 dB) |
| 16.67 s (f500) | `typing/typing-mechanical-run-01.wav` | MÚLTIPLO P/U typed | 0.2 (-14.0 dB) |
| 16.83 s (f505) | `pop/pop-bubble-01.wav` | Bit drops in | 0.24 (-12.4 dB) |
| 17.73 s (f532) | `ui/ui-click-mouse-01.wav` | PRECIO lands | 0.26 (-11.7 dB) |
| 18.13 s (f544) | `ui/ui-click-mouse-02.wav` | UTILIDAD lands | 0.24 (-12.4 dB) |
| 19.17 s (f575) | `typing/typing-mechanical-run-01.wav` (from 0.67 s, 11 f) | EMPRESA A typed | 0.2 (-14.0 dB) |
| 20.13 s (f604) | `money/money-coins-clink-01.wav` | A · $20 coins | 0.26 (-11.7 dB) |
| 21.07 s (f632) | `money/money-bag-drop-01.wav` | A · $10 bag | 0.22 (-13.2 dB) |
| 23.77 s (f713) | `notification/notification-ding-keyword-01.wav` | A · P/U = 2 ding | 0.24 (-12.4 dB) |
| 24.20 s (f726) | `typing/typing-mechanical-run-01.wav` (from 1.33 s, 11 f) | EMPRESA B typed | 0.2 (-14.0 dB) |
| 24.73 s (f742) | `money/money-coins-clink-01.wav` | B · $100 coins | 0.26 (-11.7 dB) |
| 25.87 s (f776) | `money/money-bag-drop-01.wav` | B · $2 bag | 0.22 (-13.2 dB) |
| 27.73 s (f832) | `data/data-bleep-01.wav` | B · P/U = 50 bleep | 0.24 (-12.4 dB) |
| 29.03 s (f871) | `ui/ui-click-classic-02.wav` | A vs B recap | 0.2 (-14.0 dB) |
| 30.70 s (f921) | `ui/ui-click-mouse-02.wav` | la segunda · underline tap | 0.2 (-14.0 dB) |
| 31.33 s (f940) | `tension/tension-heartbeat-impact-01.wav` | ¡más cara! · low hit | 0.28 (-11.1 dB) |
| 32.13 s (f964) | `ui/ui-click-tone-01.wav` | prices underlined | 0.2 (-14.0 dB) |
| 34.03 s (f1021) | `whoosh/whoosh-wind-short-06.wav` | board out · whoosh | 0.28 (-11.1 dB) |
| 34.47 s (f1034) | `typing/typing-key-presses-short-02.wav` (from 0.2 s, 10 f) | COMPRAR typed | 0.26 (-11.7 dB) |
| 36.33 s (f1090) | `typing/typing-mechanical-short-01.wav` | PREGÚNTATE typed | 0.26 (-11.7 dB) |
| 37.13 s (f1114) | `typing/typing-mechanical-run-01.wav` (from 2 s, 9 f) | ¿BARATO typed | 0.22 (-13.2 dB) |
| 38.07 s (f1142) | `pop/pop-soft-01.wav` | ? cards pop | 0.28 (-11.1 dB) |
| 38.73 s (f1162) | `pop/pop-bubble-01.wav` | ? card 3 pop | 0.2 (-14.0 dB) |
| 38.83 s (f1165) | `typing/typing-mechanical-run-01.wav` (from 3 s, 19 f) | COMPARADO CON QUÉ? typed | 0.2 (-14.0 dB) |
| 39.27 s (f1178) | `impact/impact-cinematic-boom-01.wav` | CON QUÉ? lands | 0.14 (-17.1 dB) |
| 39.93 s (f1198) | `typing/typing-key-presses-short-02.wav` | GUARDA typed | 0.26 (-11.7 dB) |
| 40.60 s (f1218) | `typing/typing-key-presses-short-02.wav` (from 0.43 s, 6 f) | ESTO typed | 0.24 (-12.4 dB) |
| 41.23 s (f1237) | `ui/ui-click-mouse-01.wav` | bookmark fills | 0.28 (-11.1 dB) |
| 41.80 s (f1254) | `notification/notification-bell-ding-01.wav` | outro sting | 0.2 (-14.0 dB) |

SFX licences:
- whoosh/whoosh-air-fast-04.wav — Mixkit, Mixkit Sound Effects Free License
- typing/typing-mechanical-key-single-01.wav — Pixabay, Pixabay Content License
- typing/typing-key-presses-short-02.wav — Mixkit, Mixkit Sound Effects Free License
- pop/pop-soft-01.wav — Pixabay, Pixabay Content License
- pop/pop-bubble-01.wav — Pixabay, Pixabay Content License
- whoosh/whoosh-air-quick-03.wav — Mixkit, Mixkit Sound Effects Free License
- money/money-coins-clink-01.wav — Mixkit, Mixkit Sound Effects Free License
- typing/typing-mechanical-run-01.wav — Pixabay, Pixabay Content License
- typing/typing-mechanical-short-01.wav — Pixabay, Pixabay Content License
- impact/impact-sub-boom-01.wav — Pixabay, Pixabay Content License
- ui/ui-click-mouse-01.wav — Pixabay, Pixabay Content License
- ui/ui-click-mouse-02.wav — Pixabay, Pixabay Content License
- money/money-bag-drop-01.wav — Mixkit, Mixkit Sound Effects Free License
- notification/notification-ding-keyword-01.wav — Pixabay, Pixabay Content License
- data/data-bleep-01.wav — Mixkit, Mixkit Sound Effects Free License
- ui/ui-click-classic-02.wav — Mixkit, Mixkit Sound Effects Free License
- tension/tension-heartbeat-impact-01.wav — Mixkit, Mixkit Sound Effects Free License
- ui/ui-click-tone-01.wav — Mixkit, Mixkit Sound Effects Free License
- whoosh/whoosh-wind-short-06.wav — Mixkit, Mixkit Sound Effects Free License
- impact/impact-cinematic-boom-01.wav — Pixabay, Pixabay Content License
- notification/notification-bell-ding-01.wav — Mixkit, Mixkit Sound Effects Free License

count 43, whooshes 4
- No music bed (see `scenes/music.ts`). Whooshes: start, board in ×2, board out (the internal
  board-to-board cuts and the "¿barato…?" board are dry hard cuts).
- No marker/pen category exists in `efectos/` yet (checked `sfx-index.json`, 111 files, same 16
  categories), so marker strokes are silent or share their beat's click.

## Renders, QA and checks (2026-09-27)
- Render: `npm run render:locked` (video, AAC 320k) + a lossless `--codec=wav` render of the same
  composition; master = the wav +1.0 dB → `alimiter` (0.80 ceiling) → AAC 256k/48 kHz muxed onto
  the untouched video. (`h264-mkv` + PCM can't use NVENC on Windows, hence the separate wav.)
- Loudness (ebur128): **v3 −14.2 LUFS integrated, true peak −1.8 dBTP, LRA 3.8** · **Pizarra
  −14.2 LUFS, true peak −1.8 dBTP, LRA 3.9** (voice + SFX only).
- QA: v3 `npm run qa` **PASS** (1266 frames). Pizarra: plain QA only flags the white board frames
  as "all-white"; no single-frame flash or drop anywhere → `--allow-white` **PASS**.
- Words: both finals transcribed with `.firecrawl/whisper_words.py` (.venv, large-v3-turbo). On
  the whole file the pipeline's 30 s chunking hallucinated at the boundary ("Gracias…" + a
  repeated stretch), so each final was also transcribed in two halves split in the "Donde" pause
  (29.5 s): all 127 kept words present in order in both versions; the only difference is a "y"
  heard at the existing 20.7 s join ("vale 20 pesos y gana 10 pesos") — same voice file as v2.
- Style components changed for "no plates" (not re-rendered): `styles/terminal/Keyword.tsx`
  (panel removed + outline), `styles/terminal/primitives.tsx` (`SampleChip` plain + new
  `outlineText()`; also affects Ticker/Chart/Compare sample lines), `styles/documental/Captions.tsx`
  ("box" highlight → "underline"). Pizarra `Captions`/`BehindHeadWord` already had no plate.

## Pizarra draft v2 (2026-09-27, user decisions)
- Pizarra is now the channel's main style + edit system (CHANNEL.md ★, Pizarra README).
- **Captions hidden over explanatory board text:** `layout.ts → BOARD_HAS_TEXT` (all six board
  scenes carry text) + `captionsAllowed()` gates `PizCaptions`. Captions now show only on the
  A-roll / face shots (0–9.6 s, 12.6–16.6 s, 34.0–37.1 s, 39.9–42.2 s).
- **Music:** the user picks it themselves. `scenes/music.ts → USER_MUSIC` = a file name inside
  `media/soyluisart/user-provided/musica/` (empty folder today → null → no music). Never pick one.
- Company B unchanged ($100 / $2 → 50, `figures.ts`). Sound cues unchanged.
- Out: `out/soyluisart/videos/2026-09-27-per-barato/SLA-2026-09-27-per-barato-short-pizarra-v2.mp4`
  (v1 kept) · sheet `sheet-pizarra-v2.png` · 42.2 s, 1266 frames · QA `--allow-white` PASS ·
  −14.2 LUFS integrated, true peak −1.8 dBTP, LRA 3.9 (voice + SFX, same master chain as v1).

## Pizarra draft v3 + split-screen version (2026-09-27, user clarifications)
- **Dynamic caption rule** (supersedes v2's "no captions on text boards"): per phrase and per frame,
  a caption is dropped while the screen already says the words (behind-head word, heading, figure,
  note, bubble) and shown when nothing on screen says it — A-roll and board alike.
  `captionRule.ts` (matching, sticky per page, never < 12 frames) + `screenText.ts` (registry of
  every visible text and its frames). Result: captions on ≈ 40 % of the runtime (506/1266 frames
  full board, 525 split), e.g. "estudiando", "entender esto", "Aquí te explico por qué", "Ahí
  entra el", "su múltiplo es…" until the figure lands, "Donde la segunda", "vas a necesitar".
- **Arrows** (marker, drawn on with the words, each with a marker stroke from `efectos/marker/`):
  note → price tag on "ve"; Bit → P/U; price → result on "su múltiplo" (A and B); curved A → B on
  "la segunda"; two-way arrow between the prices on "el precio por acción"; ¿BARATO → three "?"
  cards in the pause; ESTO → bookmark. Fraction bars and underlines also get marker strokes.
- **Micro-movement:** A-roll slow push-in +3.5 % per shot on top of the 100/115 % punch; board
  paper drifts at 40 % of the content (parallax, +2.8 % over a scene); results breathe; "?" cards,
  price tags, bookmark and calendar float. Whooshes unchanged (start, board in ×2, board out).
- **Split-screen edit** (`scenes/pizarra/SplitShort.tsx`, Nick Saraev grammar §5.1/§13.4): top band
  (y 262–830) = Pizarra graphic; bottom card x 70–1010, top 1240, top corners r 150, bleeding off
  the bottom, video at 87 % (face centre y ≈ 1380), head breaking out above the card via
  `aroll-person-alpha-v2.webm`; split captions just above the head (y 880, ink). Layouts on hard
  cuts: split 43 % (hook "2 AÑOS", "≠ BUENA INVERSIÓN", precio → utilidades, Empresa A,
  compare recap from "aunque", ¿barato…?), full board 31 % (el precio, fórmula, Empresa B, A vs B),
  face close-up 25 % (BARATA, PRECIO, COMPRAR, PREGÚNTATE, GUARDA ESTO). Split-only band scenes:
  `hook`, `buena`, `compara` in `Boards.tsx`; full scenes are fitted into the band.
- Out: `SLA-2026-09-27-per-barato-short-pizarra-v3.mp4` (sheet `sheet-pizarra-v3.png`) and
  `SLA-2026-09-27-per-barato-short-split.mp4` (sheet `sheet-split.png`); earlier drafts kept.
  Both 42.2 s / 1266 frames, no music, B figures unchanged.
- Checks: QA `--allow-white` PASS on both (the first split render had one black frame at 1078 —
  a one-off browser glitch; re-rendered, clean). Loudness: v3 −14.2 LUFS / TP −1.7 dBTP / LRA 3.6;
  split −14.3 LUFS / TP −1.7 dBTP / LRA 3.7. Whisper (halves): all 127 words in order in both;
  only the known extra "y" at the 20.7 s join.
- Cues: 52 (full) / 55 (split), 16 marker strokes, 4 whooshes each (`pizCues.ts`: `PIZ_CUES`,
  `SPLIT_CUES`).

### Zone rule applied (2026-09-27, before the final renders of v3 + split)
- `ZONES` (styles/shared/formats.tsx): captions inside x 120–900, y 1000–1300; graphics inside
  y 250–970. Full board: every scene is fitted into the graphics zone (`Boards.tsx → BBOX`,
  `FULL_BOX`; scale 0.75–0.93), captions at y 1250 on every layout (`PizCaptions.tsx`).
  Behind-head kickers nudged to stay ≥ y 250 (BARATA/UTILIDADES groups top 342, PRECIO 324);
  third "?" card y 840; CTA Bit y 818.
- Split: card narrowed to x 162–918 (video at 70 %), top 1060, r 120: eyebrows ≈ y 1100, chin ≈
  1422 (face above the platform UI; only chest/blanket under it), hair top ≈ 820 breaking out
  into the lower graphics zone; animation band y 262–790; split captions at y 1036 over the head.
- Checked with `SafeZoneGuide` stills (`stills/zones/*-props.png`, compositions take
  `safeGuide: true`; `frames-locked.ts … --props={"safeGuide":true}`) before rendering.
- Final renders (replacing the earlier v3/split files): QA `--allow-white` PASS both; v3 −14.2
  LUFS / TP −1.7 dBTP / LRA 3.6; split −14.3 LUFS / TP −1.7 / LRA 3.7; Whisper halves: 127/127
  words in order (only the known extra "y" at the 20.7 s join).

## Drafts pizarra-v4 + split-v2 (2026-09-27) — captions rule, final
User loved the animations and SFX: unchanged. Two caption fixes:
1. **Captions only on pure talking-head.** While any animation, board, title, figure, arrow, icon
   or behind-head word (incl. its kicker) is on screen there are no captions; split stretches never
   get them. `captionRule.ts` (replaces the word-matching rule; `screenText.ts` removed) takes each
   edit's graphic windows (`PIZ_GRAPHICS` in `PizShort.tsx`, `SPLIT_GRAPHICS` in `SplitShort.tsx`).
   **Consequence for this edit: 0 caption frames in both drafts** — every face shot carries a
   behind-head word from its first frame (kicker at the cut), so there is no pure talking-head
   stretch. If captions are wanted, some behind-head words must go or end early (user's call; the
   animations were left exactly as approved).
2. **Captions never cover the face.** `core/scripts/py/face_track.py` (MTCNN, facenet-pytorch in
   `.venv`, weights bundled, GPU, smoothed 7-frame median + 5-frame mean) →
   `media/.../2026-09-27-per-barato/face-track.json` (face found in 1323/1323 frames; box ≈
   x 250–800, y 700–1440 at 100 % — a very close selfie). `captionPlace.ts` maps the box through the
   cut and the shot transform (punch / push-in / card), grows it by 36 px and picks the line nearest
   the caption zone inside the safe area that clears it; if none fits it zooms the shot out in 4 %
   steps. `checkCaptions.ts` (npx tsx): both drafts 0 caption frames, 0 overlapping a graphic; with
   captions forced on every face frame (full 562 frames, split 320): **0 touch the face, 0 reframes**,
   line centre y 507–767 (above the head — the only room this framing leaves). Check stills with the
   safe-zone overlay and forced captions: `stills/v4/*-props.png` (compositions take
   `captionTest: true` for this; never used in renders).
- Out: `SLA-2026-09-27-per-barato-short-pizarra-v4.mp4` (sheet `sheet-pizarra-v4.png`) and
  `SLA-2026-09-27-per-barato-short-split-v2.mp4` (sheet `sheet-split-v2.png`); earlier drafts kept.
  QA `--allow-white` PASS both; pizarra-v4 −14.2 LUFS / TP −1.7 dBTP / LRA 3.6; split-v2 −14.3 LUFS /
  TP −1.7 dBTP / LRA 3.7; Whisper (halves) 127/127 words in order (only the known extra "y" at the
  20.7 s join).

## Drafts pizarra-v5 + split-v3 (2026-09-27) — fixes from CODEX-REVIEW.md
Animations and SFX unchanged except as listed.
- **H5:** split cutout no longer flashes over the full "EL PRECIO" board (12.47–12.53 s): the matte
  windows start exactly on their segment's cut, and full-board scenes are drawn ABOVE the face
  layers (`SplitShort.tsx`: `BandGraphics` under the card, `FullBoard` over it). Checked frames
  370–378 of split-v3.
- **Example labels (j):** "dato de ejemplo · MXN" (`figures.ts → EXAMPLE_LABEL`, small muted hand
  note, one line) on the $20 price-tag board, the split "compara" band, the A-vs-B recap and the
  Empresa A/B boards. "$" kept; the label says they are pesos.
- **SFX:** opening whoosh now peaks on frame 0 (pre-roll trimmed) and "2 AÑOS" gets its own key
  typing; new specific sounds for the middle "?" card (A-roll + question board + split band:
  `bubble/bubble-pop-soft-04`), the "EL PRECIO" heading (typing run) and Bit in the CTA
  (`pop/pop-minimal-01`, Bit now drops 10 f after the bookmark fills so it is its own beat).
- **Captions:** still 0 frames (rule a, user's decision pending). The never-cover list now includes
  the forehead (protected box = detector box + 25 % upward + 36 px); forced-caption test: 0 face
  touches in 562 (full) / 320 (split) face frames, 0 reframes, lines at y 303–563.
  Placement logic moved to the shared `styles/shared/captionSpot.ts` (also used by the library
  `captions` element). `captionTest` now throws unless `safeGuide` is also on (L5), so it can never
  produce a deliverable.
- Kept as written: H4 (the face overrides the caption band; a caption may go above the head) and H8
  (text inside illustrated objects — price tag, speech bubble — is part of the drawing; CHANNEL.md).
- Out: `SLA-2026-09-27-per-barato-short-pizarra-v5.mp4` (sheet `sheet-pizarra-v5.png`),
  `SLA-2026-09-27-per-barato-short-split-v3.mp4` (sheet `sheet-split-v3.png`). QA `--allow-white`
  PASS both; pizarra-v5 −14.2 LUFS / TP −1.7 dBTP / LRA 3.7; split-v3 −14.3 LUFS / TP −1.6 dBTP /
  LRA 3.7. Whisper (halves): 127/127 words in order in both (only the known extra "y" at the join).

## Drafts pizarra-v6 + split-v4 + pizarra-v6-horizontal (2026-09-27) — final caption decision
- **Two kinds of face shot:** key face shots keep their big behind-head word (`groups.ts`, `key: true`):
  "2 AÑOS" (hook), "BARATA", "≠ BUENA INVERSIÓN", "UTILIDADES" (the lesson's pivot, the one extra
  allowed) and "GUARDA ESTO". The PRECIO (12.57–13.87 s), COMPRAR (34.03–36.33 s) and PREGÚNTATE
  (36.33–37.07 s) face shots lost their big word and got captions; their SFX (key + typing) went
  with them. Same in split (its face close-ups) and horizontal.
- **Captions:** never while any graphic is on screen; face-aware placement (`styles/shared/captionSpot.ts`):
  neck/chest first, else above the head, else nearest clear spot, never over forehead/eyes/mouth,
  always in the safe area. `checkCaptions.ts`: vertical 130 caption frames, split 130, horizontal 130
  — **0 during a graphic, 0 touching the face, 0 reframes**. Vertical/split: this close selfie leaves
  no room under the chin, so the lines sit above the head (y ≈ 287); horizontal: chest band,
  y 844–913 (inside the caption zone 820–970). Checked with SafeZoneGuide stills (`stills/v6/`).
- **Horizontal 1920×1080** (`HorizontalShort.tsx`): board scenes full frame, the scene centred in
  the graphics zone (y 100–780), no face (rule g); face shots = the vertical recording as a centred
  full-height panel (x 656–1264) on the drifting dotted paper; key words span the graphics zone
  behind the head (tops 96–170, kickers from y ≈ 100); "?" cards and the CTA bookmark/Bit sit beside
  the panel. Same cut, voice, SFX (`PIZ_CUES`) and figures ($100 / $2 / 50).
- Out: `SLA-2026-09-27-per-barato-short-pizarra-v6.mp4` (sheet `sheet-pizarra-v6.png`),
  `SLA-2026-09-27-per-barato-short-split-v4.mp4` (sheet `sheet-split-v4.png`),
  `SLA-2026-09-27-per-barato-short-pizarra-v6-horizontal.mp4` (sheet `sheet-pizarra-v6-horizontal.png`).
  QA `--allow-white` PASS on all three (the first pizarra-v6 render had one black frame at 457, a
  one-off decode glitch — re-rendered, clean). Loudness: pizarra-v6 −14.2 LUFS / TP −1.6 dBTP;
  split-v4 −14.3 / −1.7; horizontal −14.2 / −1.6 (LRA 3.7 each). Whisper (halves): 127/127 words in
  order in all three (only the known extra "y" at the 20.7 s join).
- Library: `captions-aroll-preview-v` and `captions-aroll-hide-v` re-rendered with the new placement
  order (QA PASS, index sheet refreshed).

## Drafts pizarra-v7 + split-v5 + pizarra-v7-horizontal (2026-09-28): fixes from the v6 Codex review
The full review is in CODEX-REVIEW.md, section "v6 review", rounds 2–3.
- **Horizontal boards are bigger.** `H_LAYOUTS` in `Boards.tsx` cuts each tall scene into pieces
  and lays them side by side inside the horizontal graphics zone:
  - El precio: 0.73 → 0.93 ×.
  - Múltiplo: 0.75 → 1.3 ×.
  - Empresa A/B: 0.89 / 0.74 → 1.2 ×.
  - A vs B: 0.67 → 0.82 ×.
  - ¿Barato…?: unchanged at 0.88 ×, since it already fills the zone's height.
  - The two arrows that would cross pieces (note → tag, Bit → P/U) are redrawn in frame
    coordinates (`Marker` now takes a `viewBox`).
- **"dato de ejemplo · MXN" is larger** on the El precio (56 px) and A vs B (62 px) boards, so it
  comes out at about 42 px after the fit.
- **Sound:** one pen stroke for each of the three "?" arrows. New sounds for "P/U" typed on the
  formula, UTILIDAD landing and the CTA bookmark drop.
- **Comments** updated to describe key vs plain face shots.
- **Output:** `SLA-2026-09-27-per-barato-short-pizarra-v7.mp4`, `...-split-v5.mp4` and
  `...-pizarra-v7-horizontal.mp4`. Contact sheets are in `out/.../review/`.
- **Checks:**
  - QA `--allow-white`: PASS on all three.
  - Loudness: −14.2 / −14.3 / −14.2 LUFS, true peak −1.6 / −1.7 / −1.6 dBTP.
  - Whisper: 127/127 words in order. The only extras are the known "y" at the join and, in two
    files, a Whisper "0" before "50" (the v6 file transcribes the same way).
  - Captions: 130 frames per edit, 0 during graphics, 0 on the face.
- **Still open:** company B's price (10 vs 100) and optional user music.


## Kallaway draft (2026-09-28) — new style option, vertical only
Style: **Kallaway** (approved 2026-09-28 as a style option; pack `styles/kallaway/`, rules and
exceptions in CHANNEL.md ★ and its README). Composition `SLA-2026-09-27-per-barato-short-kallaway`
(code `scenes/kallaway/`: `layout.ts`, `faces.ts`, `captions.ts`, `kalCues.ts`, `KalShort.tsx`,
`checkCaptions.ts`, `captionChanges.ts`). Same cut, voice (`voice-cut-master.wav`), transcript,
matte (`aroll-person-alpha-v2.webm`), face track and figures ($100 / $2 / 50, pending) as the
Pizarra edits. **Vertical only** (the user asked for one video). No music (no user file).
Out: `out/soyluisart/videos/2026-09-27-per-barato/SLA-2026-09-27-per-barato-short-kallaway.mp4`
(42.2 s, 1266 frames) · contact sheet `sheet-kallaway.png` · side-by-side with his frames
`out/soyluisart/kallaway/_compare-kallaway-vs-ours.png`.

- **B-roll:** 11 ChatGPT images (Codex CLI, `codex exec`, one at a time; 8 new + 3 test images
  reused as ANALISIS §S.8 says) in `media/.../2026-09-27-per-barato/kallaway-gen/` (`SOURCES.md` with
  the exact prompts, `gen.sh`). Used in the draft: s01, s02, s03, s06, s07, s08, s09, s10, s11; s04
  (black box) and s05 (blueprint) ended up unused after the review (too dark / too light for a card).
- **Dark set:** the test take is a close selfie on a bright wall, so the person cut-out (matte) sits on
  a near-black studio with a blue practical glow. Split: one static placement per shot from the face
  track — face 184–224 px wide (his ≈ 220), forehead clear of the seam caption (protected top ≥ y 1082),
  mouth ≤ y 1430 — inside an oval vignette. Face shots: the recording at 92 % from the bottom centre,
  static (no punch, no push).
- **Captions (style exception):** continuous seam captions on the split (~2 words, 46 px, y 1040),
  dropped on the two counter shots (the top repeats "su múltiplo es 2 / 50") and absent on stack /
  white / kinetic shots; ONE giant word per spoken word on face shots, above the head (the chest is
  under the UI on this selfie), emphasis: "inversión", "nada", "pregúntate" in Playfair Italic,
  "acción", "necesitar" light blue, "cara" red. `checkCaptions.ts`: 518 seam-caption frames + 281
  giant-word frames, **0 on stack/white/kinetic, 0 while the top repeats the speech, 0 touching the
  face**; giant words at y 346–399.
- **Layout mix:** split 54.7 % · face 22.2 % · stack/white/full 23.1 % (spec: 45–55 / 25–30 / 20–25);
  25 shots, a layout or image change every ~1.8 s (34 per minute).

| Cut time | Layout | What | Words |
|---|---|---|---|
| 0.00–1.33 | split | s01 key + price tag · hook headline "¿BARATA = / BUENA INVERSIÓN?" slides in | Me llevo más de dos años |
| 1.33–2.93 | split | s02 late-night desk (headline stays) | estudiando entender esto, |
| 2.93–5.30 | face | giant words ("acción" blue) | y es que una acción, cuando está |
| 5.30–7.43 | split | s10 pedestals (nugget vs hollow sphere) | barata, no significa que sea una |
| 7.43–8.20 | face | "buena", "inversión" (serif) | buena inversión. |
| 8.20–9.57 | split | s11 neon magnifier | Aquí te explico por qué. |
| 9.57–10.93 | split | s01 key + price tag | Todo el mundo ve el precio y dice, |
| 10.93–12.57 | split | s03 gold bar with a clearance sticker | ah, está regalada. |
| 12.57–13.87 | face | giant words ("nada" serif) | Pero el precio no dice nada |
| 13.87–16.57 | stack | "el precio" (s01) on the cut · "las utilidades" (s06) on "utilidades" | si no lo comparas con las utilidades de una empresa. |
| 16.57–19.07 | white | "P/U" typed on "múltiplo", "precio ÷ utilidad" on "precio" | Ahí entra el múltiplo de precio y utilidad. |
| 19.07–20.13 | split | s06 modest building, vault of gold | Por ejemplo, si una empresa vale |
| 20.13–22.80 | full | s06 + kinetic "vale $20" / "gana $10" / "por acción" · "Empresa A · dato de ejemplo · MXN" | 20 pesos gana 10 pesos por acción, |
| 22.80–24.10 | split | s06 dimmed + counter "Empresa A · P/U" 0 → 2 (settles 4 f before "2") | su múltiplo es 2. |
| 24.10–24.73 | split | s07 blue skyscraper, empty vault | Si otra vale |
| 24.73–26.63 | full | s07 + kinetic "vale $100" / "gana $2" (screen $100: figures.ts; he says 10) | 10 y gana 2 pesos, |
| 26.63–29.03 | split | s07 dimmed + counter "Empresa B · P/U" 0 → 50 | su múltiplo es 50. |
| 29.03–31.17 | split | s08 jars (full vs almost empty) | Donde la segunda es |
| 31.17–31.83 | face | "más", "cara" (red) | más cara, |
| 31.83–34.03 | split | s09 balance scale | aunque el precio por acción diga lo contrario. |
| 34.03–35.30 | face | giant words | Antes de comprar algo solo |
| 35.30–36.33 | split | s03 gold bar | porque está barato, |
| 36.33–37.07 | face | "pregúntate" (serif) | pregúntate, |
| 37.07–39.93 | split | s10 pedestals | ¿barato comparado con qué? |
| 39.93–42.20 | face | giant words ("necesitar" blue) | Guarda esto y lo vas a necesitar. |

### Sound design (Kallaway)
A click on the cuts that open a section + at most one subtle sound per image or counter event;
nothing on plain cuts, image swaps, captions or giant words. **count 13, whooshes 0.**

| Lands at (cut) | Sound | Reason | Level |
|---|---|---|---|
| 0.00 s (f0) | `ui/ui-swipe-right-01.wav` | hook headline slides in | 0.28 |
| 2.93 s (f88) | `ui/ui-click-tone-01.wav` | section cut "Y es que…" | 0.35 |
| 12.57 s (f377) | `ui/ui-click-mouse-close-06.wav` | section cut "Pero…" | 0.4 |
| 13.87 s (f416) | `pop/pop-dry-03.wav` | card "el precio" | 0.28 |
| 14.87 s (f446) | `pop/pop-dry-03.wav` | card "las utilidades" | 0.26 |
| 17.73 s (f532) | `typing/typing-key-presses-short-02.wav` | white screen typed (one bed, formula line) | 0.22 |
| 20.13 s (f604) | `ui/ui-swipe-soft-01.wav` | A · $20 slides in (kinetic shot) | 0.28 |
| 23.63 s (f709) | `data/data-bleep-confirm-03.wav` | A · P/U = 2 settles | 0.3 |
| 24.73 s (f742) | `ui/ui-swipe-soft-01.wav` | B · $100 slides in (kinetic shot) | 0.28 |
| 27.60 s (f828) | `data/data-bleep-confirm-03.wav` | B · P/U = 50 settles | 0.3 |
| 29.03 s (f871) | `ui/ui-click-tone-01.wav` | section cut "Donde…" | 0.35 |
| 34.03 s (f1021) | `ui/ui-click-mouse-close-06.wav` | section cut "Antes de…" | 0.4 |
| 39.93 s (f1198) | `ui/ui-click-tone-01.wav` | section cut "Guarda…" | 0.35 |

SFX licences: `ui/ui-swipe-right-01.wav`, `ui/ui-swipe-soft-01.wav` — Pixabay Content License;
`ui/ui-click-tone-01.wav`, `ui/ui-click-mouse-close-06.wav`, `pop/pop-dry-03.wav`,
`typing/typing-key-presses-short-02.wav`, `data/data-bleep-confirm-03.wav` — Mixkit Sound Effects
Free License.

### Checks (final render, after the Codex fixes)
- Render: `npm run render:locked` (video) + a `--codec=wav` render; master +0.9 dB + `alimiter`
  (0.80), AAC 256k/48 kHz muxed onto the untouched video.
- **QA `--allow-white` PASS** (1266 frames; plain QA only flags the white typed screen, by design).
  The first render failed QA on the stack shot (dark cards on pure black) — fixed (see
  `CODEX-REVIEW-kallaway.md`).
- **Loudness: −14.2 LUFS integrated, true peak −1.9 dBTP, LRA 3.7.**
- **Whisper (`transcribe_parts.py`, split at 18.9 s): 127/127 words in order**; only the known extra
  "y" at the 20.7 s join.
- Captions: see above (0 on the face, 0 over speech text, 0 on stack/white/kinetic).
- Codex review (one pass, 2 calls: video + library/docs): `CODEX-REVIEW-kallaway.md` — fixed: dark
  stack (H), one sound per event (H), small "dato de ejemplo" (L), doc wording (deliverables, matte,
  scope), schema/token polish; discarded: counter-settle timing (by design), card zone (backdrop),
  per-element backing (by design).
- Library: 38 clips `out/soyluisart/kallaway/` (17 re-rendered after the review), QA 38/38 PASS,
  `_index-vertical.png` / `_index-horizontal.png`.

### Open / for the user
- Company B price (10 said vs $100 shown) — as in the Pizarra edits.
- The look needs a dark set + medium shot: on this bright close selfie the split figure is small (an
  oval portrait) and the matte shows a small dark wedge above the hair on some face shots (the
  picture frame behind him).
- Music: none (Kallaway always has a soft bed; only if the user supplies a file).
