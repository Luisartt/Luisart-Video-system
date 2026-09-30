---
name: luisart-diseno-sonoro
description: Sound design for @soyluisart videos and Luisart animations — which SFX goes on which graphic event, how many frames before the visual each file must start (hit offsets from sfx-index.json / GUIA-EFECTOS.md), the whoosh rule, wiring cues in Remotion (Sfx / SfxCue / cue() + SfxTrack), music (only the user's own file), ducking, loudness targets and the master chain. Use it whenever you add, change, check or talk about sounds, SFX, efectos de sonido, whooshes, música de fondo, volumen, loudness/LUFS or the mix of any @soyluisart edit or library element — including "los efectos suenan tarde", "súbele a la voz", "ponle música", "¿por qué no hay música?".
---

# Sound design for @soyluisart

Sound design is **mandatory and baked into every render** — Luis stresses it. Every graphic event
gets its own specific sound on the frame the visual lands; the voice stays king.

Sources of truth (read before choosing sounds):
- `channels/soyluisart/CHANNEL.md` ★ (rules: sound design, whooshes, music) — skill `luisart-reglas`.
- `media/soyluisart/audio/GUIA-EFECTOS.md` (Spanish; general rules, default map per element type,
  whoosh pre-rolls, hook recipes, full catalogue by category, 207 files).
- `media/soyluisart/audio/efectos/sfx-index.json` (machine-readable: `file`, `peakFrame30`,
  `preRollFrames30`, `volume`, `durationSec`, `when`, `license`…).
- `media/soyluisart/audio/LICENCIAS.md` — only audio cleared for monetised YouTube/Shorts/TikTok.
- The Luisart element map: `channels/soyluisart/styles/pizarra/theme.ts → piz.sfx`.

Vault (read-routing, background only — the files above win): in
`C:\Users\LART\Documents\Lartyk\wiki\Content Creation\` read ONLY
`Editing System\Sound\` (and the rest of `Editing System\`), the chosen style's folder under
`Styles\`, that style's creators in `References\Creators\` and `Videos\<YYYY-MM-DD slug>\`.
**Never read `wiki\Knowledge\` or `Finanzas\`.**

## The rules

1. **Whooshes ONLY at the video start and on real scene transitions.** Start = the whoosh's peak
   on **frame 0** (its pre-roll is trimmed off the file head). Real transitions = the hard cut into
   the board explanation, back out to the face, a chapter change. Never on an element, a card or
   page change inside a scene, a punch-in or a board-to-board hard cut (those are dry, or get a
   small specific sound).
2. **Every graphic event gets a specific small sound** (map below): click, mechanical typing,
   pop, ding, marker, paper, counter, correct/wrong, camera, clock, coins, bubble… Same sound for
   the same kind of element throughout a video; alternate 2–3 files of a family on repeats.
3. **Hit on the frame.** `audio start = event frame − preRollFrames30`. If that is before frame
   0, start at 0 and trim the file head (`trimBefore`). Beds (typing runs, counters, a line being
   drawn) run from the first to the last frame of the action and are cut with a 3–4 frame fade.
4. **One accent per beat.** Two events designed as ONE beat within 6 frames → only the more
   important sounds. Distinct events each keep their sound. At most ~1 strong accent (impact,
   ka-ching, keyword ding) every 5–8 s.
5. **The voice rules.** Nothing strong on top of a spoken keyword: put it in the gap or drop it to
   ≤ 0.2. SFX sit −12 to −18 dB under the voice. Captions carry no sound.
6. **Music: never choose it.** Only a file Luis puts in `media/soyluisart/user-provided/musica/`
   and names. Otherwise no music bed at all (he rejected "Stylz" and every library / trending
   option). Trending songs are added by him inside the platform app, never baked in. Don't use
   `media/soyluisart/audio/fondos*/` for his videos.

## Event → sound (Luisart defaults)

`pre` = frames the file starts before the visual event (= its measured hit frame). `vol` =
Remotion `volume` against a ≈ −15/−16 LUFS voice. Paths under `media/soyluisart/audio/efectos/`.
Key in `piz.sfx` shown in brackets.

| Event | File | pre | vol |
|---|---|---|---|
| Video start (peak on frame 0) / real transition into the board | `whoosh/whoosh-air-fast-04.wav` [whoosh] | 12 | 0.3–0.35 |
| Quick transition (short) / back out to the face | `whoosh/whoosh-air-quick-03.wav` / `whoosh/whoosh-wind-short-06.wav` | 5 / 5 | 0.28 |
| Typed heading, prompt, bubble text (bed, first→last char) | `typing/typing-mechanical-run-01.wav` [type] | 0 | 0.16–0.25 |
| Behind-head word typed / on the cut | `typing/typing-key-presses-short-02.wav` [typeShort] / `typing/typing-mechanical-key-single-01.wav` [key] | 0 / 1 | 0.24–0.3 |
| Chip, card lands, step change, toggle, waffle start | `ui/ui-click-mouse-01.wav` [click] (alt `ui-click-mouse-02` [tap]) | 1 | 0.25–0.3 |
| Pixel icon, tile, small tag appears | `pop/pop-soft-01.wav` [pop] (alt `pop/pop-minimal-01`, `bubble/bubble-pop-soft-04`) | 1 | 0.2–0.3 |
| Result lands (P/U, waffle full, selector lands) | `notification/notification-ding-keyword-01.wav` [ding] | 1 | 0.24–0.3 |
| Number settles | `data/data-bleep-01.wav` [bleep] | 1 | 0.24–0.3 |
| Count-up (bed) | `counter/counter-score-casino-01.wav` [counter] | 0 | 0.3 |
| Money figure appears / money stack lands | `money/money-coins-clink-01.wav` [coin] / `money/money-bag-drop-01.wav` [bagDrop] | 2 / 1 | 0.22–0.3 |
| Winning price, good total | `money/money-cash-register-kaching-01.wav` [kaching] | 5 | 0.3 |
| Marker arrow / circle / underline / tick starts | `marker/marker-pen-line-01.wav` [marker] | 1 (0 with a 9–12 f cut) | 0.24–0.4 |
| Strike-through, red cross, underlining figures | `marker/marker-chalk-line-01.wav` [strike] | 1 | 0.24–0.35 |
| Handwritten note | `marker/marker-pencil-letters-01.wav` | 0 | 0.22–0.35 |
| Long line being drawn / highlighter (beds) | `marker/marker-whiteboard-write-02.wav` [markerWrite] / `marker/marker-highlighter-01.wav` [highlight] | 0 | 0.22–0.35 |
| Sticky note / price tag lands | `paper/paper-slap-drop-01.wav` [note] | 4 | 0.4 |
| Press clipping slides in | `paper/paper-quick-move-01.wav` [paper] | 5 | 0.35 |
| Myth "FALSO" / fact "REALIDAD" | `correct-wrong/wrong-buzz-02.wav` [wrong] / `correct-wrong/correct-notification-01.wav` [correct] | 1 | 0.3–0.35 |
| Checklist tick / checklist complete | `ui/ui-checkbox-tick-01.wav` / `reaction/reaction-success-chime-01.wav` [chime] | 1 / 10 | 0.45 / 0.3 |
| Timeline point / time jump | `clock/clock-tick-single-01.wav` [tick] | 2 | 0.35–0.4 |
| Screenshot lands / polaroids | `camera/camera-shutter-hard-01.wav` [snap] / `camera/camera-shutter-vintage-02.wav` [shutter] | 1 / 3 | 0.4 |
| Thought / chat bubble | `bubble/bubble-pop-03.wav` [bubble] | 1 | 0.4 |
| CTA "+SEGUIR" / outro sting | `notification/notification-bell-ding-01.wav` [bell] | 0 | 0.2–0.3 |
| "Bad" reveal (más cara, loss) | `tension/tension-heartbeat-impact-01.wav` or `impact/impact-thud-01.wav` [thud] | see index | 0.28 |

For anything not in the table, search `sfx-index.json` by `category` / `when` and take its
`preRollFrames30` and `volume`. Batch-2 files (field `added`) peak at −3 dBFS, so their volumes
are ≈ 3 dB higher. Before choosing a file, confirm it exists in the index (`cue()` throws if not).

## Wiring cues in Remotion

**Inside a library element** (`styles/pizarra/*`): `<Sfx kind="pop" at={frame} on={p.sfx} />`
from `primitives.tsx` (reads `piz.sfx`, applies `pre` and the head trim). Beds:
`<Sfx kind="type" at={start} frames={chars} />` (4-frame fade-out). Every element exposes the
`sfx` prop (default on). Non-Luisart libraries: `SfxCue` + `fx()` in `styles/shared/sfx.tsx`
(`spaced()` keeps cues ≥ 6 f apart).

**In an edit** (per-video): one cue list in `scenes/pizarra/pizCues.ts`, built with `cue()` from
`scenes/cues.ts`:

```ts
cue(name, atFrame, "category/file.wav", vol, { max?, trim?, lead? })
```

`cue()` looks the file up in `sfx-index.json` and sets `lead = preRollFrames30` automatically;
`max` cuts it (frames, 4-frame fade), `trim` skips the file head (a later stretch of a long
file), `lead: 0` for beds that start on the action. `at` always comes from the word timings
(`T.*`, `W.*` in `layout.ts`), never a typed number. The composition plays it with
`<SfxTrack cues={PIZ_CUES} />` (`scenes/Sound.tsx`). Keep separate lists when layouts differ
(`PIZ_CUES`, `SPLIT_CUES`); the horizontal edit shares the full-board events. `licensesOf(cues)`
lists the licences for BRIEF.md.

Checklist for a cue list:
- Opening whoosh `cue("start · whoosh (frame 0)", 0, "whoosh/whoosh-air-fast-04.wav", 0.3, { max: 18 })`.
- Count the whooshes: start + one per real transition, nothing else.
- Walk every graphic in the edit (behind-head words and kickers, every board element, every
  marker stroke, icons, CTA extras) and confirm it has its own cue within 0–2 frames of landing,
  or is part of a single designed beat.
- Record the cue table in BRIEF.md: "Lands at (cut) | Sound | Reason | Level", plus
  "count N, whooshes M" and the licences.

## Music (only when Luis supplied it)

One constant per video: `scenes/music.ts → USER_MUSIC = { file: "<name in user-provided/musica>" }`
(null = no music). `musicBedProps()` feeds `<MusicBed>` (`scenes/Sound.tsx`): looped to the edit,
0.5 s fade in, 1 s fade out, ≈ −24 LUFS under the voice (volume 0.25 − 2 dB), lifted +3 dB in the
gaps between phrases (ducked from the word timings, 6-frame attack / release). Target: music
−20 to −24 LUFS under a −16 voice. SFX are added on top, not ducked. Note the track and its source
in BRIEF.md; rights for his own file are his call.

## Levels and master

- Voice: `voice-cut-master.wav` (two-pass loudnorm −15 LUFS / −1.5 dBTP, built by `cut/build-voice.ts`).
- Final mix: **≈ −14 LUFS integrated, true peak ≤ −1 dBTP** (LRA ≈ 3–4 is normal here).
- Master chain (the NVENC render can't carry PCM): render the video (AAC) and a separate
  `--codec=wav` render of the same composition, measure the WAV
  (`ffmpeg -i mix.wav -af ebur128=peak=true -f null -`), apply `volume=<−14 − measured>dB` +
  `alimiter=limit=0.80:attack=3:release=60:level=false`, encode AAC 256k / 48 kHz once and mux it
  onto the untouched video (`-c:v copy`). Commands: `luisart-editar-short/references/pipeline.md` §11.
- Verify on the final MP4 with ebur128 and write "−14.2 LUFS / TP −1.7 dBTP / LRA 3.6" into BRIEF.md.

## Report wording (Spanish, for Luis)

"Todo lleva efectos de sonido (un sonido distinto para cada cosa que aparece; el whoosh solo al
inicio y en los cambios de escena). Música: ninguna, porque no me pasaste una — si quieres, pon el
archivo en la carpeta `media/soyluisart/user-provided/musica/` y dime cuál."
