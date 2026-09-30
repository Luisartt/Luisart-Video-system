# Pipeline reference — commands and recipes

Every command runs from the project root (`C:\Users\LART\Documents\Proyectos\tubeai-video`).
`<v>` = the video folder name (`yyyy-mm-dd-slug`), `<M>` = `media/soyluisart/automated-research/<v>`,
`<V>` = `channels/soyluisart/videos/<v>`, `<O>` = `out/soyluisart/videos/<v>`.
`LOCK` = `npx tsx .claude/skills/luisart-editar-short/scripts/with_lock.ts --` (holds
`out/.render-lock`; one heavy job at a time on this machine).

## Contents
1. Ingest
2. Transcribe
3. Script comparison and cuts
4. Voice
5. Matte
6. Face track
7. Folder from the template
8. Timing, beats and layouts
9. Captions
10. Stills and zone check
11. Render and master
12. Checks (QA, loudness, words, captions)
13. Versions and feedback

---

## 1. Ingest

The raw file goes to `recordings/soyluisart/<v>-raw.<ext>` (never inside `media/`: it would be
copied on every render bundle). Never modify it.

Probe it:

```bash
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,avg_frame_rate:stream_side_data=rotation -of compact recordings/soyluisart/<v>-raw.mp4
```

- A `rotation` side-datum (WhatsApp/phone files: e.g. 1024×576 with rotation −90) means the pixels
  are stored sideways. FFmpeg applies it automatically when transcoding (autorotate is on by
  default): don't add `transpose` on top.
- `r_frame_rate` ≠ `avg_frame_rate` (e.g. 600/19 vs 113400/3781) = variable frame rate. Remotion
  and frame-exact cuts need constant 30 fps: the `fps=30` filter below fixes it.
- A WhatsApp file (576×1024, heavy compression) still works (upscaled), but tell the user in the
  report to send the original file next time.

Working copy (CFR 30, 1080×1920, 48 kHz audio kept for the voice):

```bash
LOCK ffmpeg -y -i recordings/soyluisart/<v>-raw.mp4 \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30,format=yuv420p" \
  -c:v libx264 -crf 16 -preset slow -af "aresample=async=1" -c:a aac -b:a 192k -ar 48000 <M>/aroll-1080x1920.mp4
```

- A **horizontal** recording (**untested — no horizontal recording has gone through this yet**;
  check the crop on stills before building anything on it): keep a 1920×1080 working copy too (`scale=1920:1080…`) for the
  horizontal deliverable, and build the vertical one by cropping around the face (use the face
  track of the horizontal copy to pick the crop x per shot, not a fixed centre crop).
- Check A/V sync after ingest (clap or a plosive): VFR phone files can drift; `aresample=async=1`
  handles it in practice.
- Contact sheet of the working copy for your own look (`_aroll-sheet.png`):
  `.venv/Scripts/python.exe .claude/skills/luisart-revision-codex/scripts/review_frames.py <M>/aroll-1080x1920.mp4 <M>/_aroll-sheet --every 2`.

## 2. Transcribe

whisper-large-v3-turbo through the `.venv`, split in pauses so no part crosses the 30 s chunk
boundary (the pipeline hallucinates "Gracias…" and repeated lines there):

```bash
LOCK .venv/Scripts/python.exe -W ignore .claude/skills/luisart-editar-short/scripts/transcribe_parts.py <M>/aroll-1080x1920.mp4 <M>/transcript-words.json
```

Output `{"text", "words": [{text, start, end}], "splits"}` in source seconds — the same shape the
per-barato `timing.ts` imports. (`.firecrawl/whisper_words.py` is the original one-shot version;
use it only for files well under 30 s.)

Then correct names and terms against the channel glossary (CHANNEL.md: "Luisart", "soyluisart")
and the script. Keep corrections as display fixes (`fixes()` in `scenes/Captions.tsx`), never by
editing the JSON by hand without a note.

## 3. Script comparison and cuts

- Diff the transcript against the user's script, if given, word by word (normalise case, accents,
  punctuation, "dos" ↔ "2"). Write the differences into BRIEF.md → "Script vs what was said".
- **Cut only clear mistakes:** false starts, flubbed words, retakes (keep the last complete take),
  outtakes the speaker takes back. Keep natural pauses, ad-libs and anything with content. Cut in
  real silence at a phrase boundary (find it in the word gaps; ≥ 0.2 s silence), never leave a
  repeated word across a join.
- **Facts and numbers:** if what he said is wrong or contradicts itself (per-barato: "vale 10 y
  gana 2 → múltiplo 50", where 10 ÷ 2 = 5), do NOT change or cut his words to fix it. Put the
  figures in `scenes/figures.ts` (one place, results computed), show the consistent version on
  screen, and list the issue with options in the report (re-record the sentence; or patch one
  word with a clone of his own voice — Qwen3-TTS Base, only with his OK).
- Write `<V>/cut/cuts.json`:

```json
{
  "source": "<M>/aroll-1080x1920.mp4",
  "matte": "<M>/aroll-person-alpha.webm",
  "rawRecording": "recordings/soyluisart/<v>-raw.mp4",
  "fps": 30,
  "keep": [{ "in": 0.0, "out": 20.7 }, { "in": 22.0, "out": 43.5 }],
  "removed": [{ "in": 20.7, "out": 22.0, "text": "y gana 10%,", "reason": "flub: …" }]
}
```

- Verify every join: re-transcribe ≈ 2 s either side of it (cut the voice with FFmpeg, run
  `transcribe_parts.py` on the snippet) and listen for repeated or partial words. Move a rough
  join to the previous/next sentence break.
- Keep each delivered version's cuts in `<V>/cut/versions/vN-cuts.json` (feedback timecodes map
  through the version the user watched).

## 4. Voice

Copy `channels/soyluisart/videos/2026-09-27-per-barato/cut/build-voice.ts` to `<V>/cut/` (no
path edits needed: it reads `cuts.json` next to it) and run:

```bash
LOCK npx tsx <V>/cut/build-voice.ts
```

It writes `<M>/voice-cut.wav` (keep segments concatenated sample-exact, 15 ms fades at each join)
and `<M>/voice-cut-master.wav` (high-pass 70 Hz, light 2.5:1 compression, two-pass loudnorm to
−15 LUFS / −1.5 dBTP). The edit plays `voice-cut-master.wav`; the video clips are muted.

## 5. Matte (person cut-out for words behind the head and the split card)

Robust Video Matting on the GPU, then VP9-with-alpha WebM (what Remotion's `OffthreadVideo
transparent` plays; ProRes is too heavy to bundle):

```bash
LOCK .venv/Scripts/python.exe core/scripts/py/matte.py <M>/aroll-1080x1920.mp4 <M>/aroll-person-alpha.mov
LOCK ffmpeg -y -i <M>/aroll-person-alpha.mov -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 24 -row-mt 1 -auto-alt-ref 0 -an <M>/aroll-person-alpha.webm
```

- `matte.py` uses the model's decontaminated foreground at the edges (no wall halo in the hair);
  optional 3rd argument = downsample ratio (default 0.4; try 0.5–0.6 for close-ups with fine hair).
- Check it: `ffprobe` must show `alpha_mode=1`; look at a few frames composited over the dotted
  board (hair, fingers, the moment he moves fast). Delete the `.mov` afterwards (large).

## 6. Face track

```bash
LOCK .venv/Scripts/python.exe -W ignore core/scripts/py/face_track.py <M>/aroll-1080x1920.mp4 <M>/face-track.json
```

MTCNN (facenet-pytorch, weights bundled), smoothed. Frames = `[x0, y0, x1, y1, eyeY, mouthY,
score]` in the working copy's pixels and source frames. It prints how many frames had a face:
if far fewer than all, look at why (hand over the face, turned away) before trusting captions.

## 7. Folder from the template

Copy the proven per-barato Luisart pipeline, not the Terminal leftovers:

| Copy from `2026-09-27-per-barato/` | Change |
|---|---|
| `index.tsx` | Folder name, composition IDs `SLA-<v>-short-pizarra`, `SLA-<v>-short-split`, `SLA-<v>-short-pizarra-h` (1920×1080), durations; drop the Terminal composition |
| `cut/build-voice.ts`, `cut/cuts.json` | cuts.json is new (step 3) |
| `scenes/timing.ts` | import paths of `cuts.json` and `transcript-words.json` |
| `scenes/parts.tsx` | `MEDIA` path; keep `CutClip` (and the helpers the Luisart files import) |
| `scenes/figures.ts`, `scenes/music.ts` | figures of THIS video; `USER_MUSIC` stays `null` unless the user named a file |
| `scenes/Sound.tsx`, `scenes/cues.ts` | keep `SfxTrack`, `MusicBed`, `cue()`, `licensesOf()`; delete the old Terminal `CUES` list |
| `scenes/Captions.tsx` | keep `buildPages()`; rewrite `fixes()` for this transcript |
| `scenes/pizarra/*` | everything is rewritten for the new beats: `layout.ts` (cut points `T`, word frames `W`, `SEGS`, `SPLIT_SEGS`), `groups.ts` (behind-head words, `key`), `Boards.tsx` (the board scenes), `extras.tsx`, `pizCues.ts`, `captionPlace.ts` (face-track import path) |

Register the video in `channels/soyluisart/index.tsx` (import its `…Video` folder component next to
`PerBaratoVideo`). Run `npx tsc --noEmit` until clean.

## 8. Timing, beats and layouts

- Nothing is hard-coded: every cut point and landing frame is `at("word", afterSeconds)` /
  `endOf(...)` from `timing.ts` (source seconds → cut frame through `cuts.json`); a typo throws.
- Plan the beats in BRIEF.md first: one table row per layout segment (cut time, layout, what lands
  on which word) — the per-barato BRIEF "Luisart version" table is the model.
- Full-board edit (`SEGS`): face shots (`kind: "aroll"`, alternate `punch`) for the hook, turns
  and CTA; board scenes for the explanation, ≈ 50–55 % of the runtime; a layout change on every
  new phrase.
- Split edit (`SPLIT_SEGS`): three layouts alternating on hard cuts, ≈ 43 % split / 31 % board /
  25 % face, a change every ~2.4 s. Split = graphic in the top band (y 262–790), face card below
  (x 162–918, top 1060, top radius 120, bleeding off the bottom), head breaking out via the matte;
  full-board scenes are drawn ABOVE the face layers (so the cut-out never flashes over a board).
- Horizontal edit: board scenes full frame in the graphics zone (y 90–790); face shots = the
  vertical recording as a centred full-height panel on the dotted paper, key words behind the head
  across the graphics zone; captions in y 820–970 or face-aware.
- Behind-head groups (`groups.ts`): only KEY face shots get `key: true` (rule k). Kickers stay
  ≥ y 250; big words auto-fit to 84 % width.
- Boards: pick elements with skill `luisart-animaciones-pizarra` (catalogue in
  `styles/pizarra/README.md`), fitted into the graphics zone (`BoardView` + `FULL_BOX`/`BAND`/`H_BOX`).
  Every example figure reads from `figures.ts` and carries `EXAMPLE_LABEL`.

## 9. Captions

- Graphic windows: every board / split segment, every behind-head group, every extra (icons,
  CTA) → `PIZ_GRAPHICS` / `SPLIT_GRAPHICS` → `makeCaptionGate(windows, TOTAL_FRAMES)`.
- Placement: `faceAwareCaption()` (vertical) / `faceAwareCaptionH()` (horizontal) in
  `captionPlace.ts`, which call the shared `captionSpot()`.
- `captionTest: true` (with `safeGuide: true`, it throws otherwise) forces captions on every face
  frame for placement stills — never for a deliverable.
- Run the edit's check: `npx tsx <V>/scenes/pizarra/checkCaptions.ts` → must print 0 caption
  frames overlapping a graphic and 0 touching the face. Adapt its `edits` object to the new
  layouts (and add the horizontal edit if the template has it).

## 10. Stills and zone check (before any full render)

```bash
npx tsx core/scripts/frames-locked.ts <O>/stills/zones SLA-<v>-short-pizarra 0 120 300 '--props={"safeGuide":true}'
npx tsx core/scripts/frames-locked.ts <O>/stills/zones SLA-<v>-short-pizarra 150 420 '--props={"safeGuide":true,"captionTest":true}'
```

(Git Bash quoting: the single quotes keep the JSON's double quotes. List real frame numbers.)
Pick frames: every layout segment's first + last frame and every element landing. Look at them:
zones, nothing cropped, no text on a plate, no face under a caption, "Luisart", labels.

## 11. Render and master

For each deliverable composition (one at a time — the scripts wait for the lock):

```bash
npm run render:locked -- render SLA-<v>-short-pizarra <O>/_premaster-pizarra.mp4 --audio-codec=aac --audio-bitrate=320k
npm run render:locked -- render SLA-<v>-short-pizarra <O>/_mix-pizarra.wav --codec=wav
```

(`h264-mkv` + PCM fails with NVENC required on Windows, hence the separate WAV render.) Measure
the WAV, then master it to −14 LUFS / ≤ −1 dBTP and mux it onto the untouched video:

```bash
ffmpeg -hide_banner -nostats -i <O>/_mix-pizarra.wav -af ebur128=peak=true -f null - 2>&1 | tail -12
ffmpeg -y -i <O>/_premaster-pizarra.mp4 -i <O>/_mix-pizarra.wav -map 0:v -map 1:a -c:v copy \
  -af "volume=<+X>dB,alimiter=limit=0.80:attack=3:release=60:level=false,aresample=48000" \
  -c:a aac -b:a 256k <O>/SLA-<v>-short-pizarra.mp4
```

`<+X>` = −14 − measured integrated LUFS (per-barato: +1.0 dB). Re-measure the final file (step 12)
and adjust once if it's off by more than 0.5 LU. Delete `_premaster-*` / `_mix-*` after delivery.
If a render times out, retry once with `--concurrency=2`.

## 12. Checks

```bash
npm run qa -- <O>/SLA-<v>-short-pizarra.mp4 <O>/SLA-<v>-short-split.mp4 <O>/SLA-<v>-short-pizarra-h.mp4 --allow-white
ffmpeg -hide_banner -nostats -i <O>/SLA-<v>-short-pizarra.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12
LOCK .venv/Scripts/python.exe -W ignore .claude/skills/luisart-editar-short/scripts/transcribe_parts.py <O>/SLA-<v>-short-pizarra.mp4 <O>/_words-pizarra.json --expect <M>/transcript-words.json --cuts <V>/cut/cuts.json
npx tsx <V>/scenes/pizarra/checkCaptions.ts
```

- QA: `--allow-white` because the white board frames read as "all-white"; any single-frame flash
  or black frame is a real bug (a one-off browser glitch → re-render that file once).
- Loudness: integrated ≈ −14 LUFS (±0.5), true peak ≤ −1.0 dBTP.
- Words: every kept word present, in order. Differences at a join ("y" heard at the per-barato
  20.7 s join) go in the report's "listen to these" list; a missing phrase is a bug.
- Contact sheets + Codex review: skill `luisart-revision-codex`.

## 13. Versions and feedback

Never overwrite a delivered file: the next round renders `…-v2.mp4`, `…-v3.mp4` next to it and
BRIEF.md gets a new "## Draft vN (date) — what changed" section. Feedback timecodes refer to the
version the user watched; map them through that version's `cut/versions/` file.
