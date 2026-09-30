# Codex review — Kallaway draft + Kallaway style pack (2026-09-28)

Reviewer: OpenAI Codex CLI 0.157 (`codex exec -s read-only --skip-git-repo-check --ephemeral`), 2
calls, one at a time (one review pass, as asked):
1. **Video:** `SLA-2026-09-27-per-barato-short-kallaway` (first render, 1266 frames) — 8 contact
   sheets `out/soyluisart/videos/2026-09-27-per-barato/review/kallaway/sheet-01…08.png` (one frame
   every 0.5 s + 2 frames after each of the 53 caption changes, zone lines drawn), code and rules
   pasted with line numbers (`review/prompt-kallaway.txt`, head `review/head-kallaway.md`, facts
   `review/kallaway-facts.txt`: transcript, checkCaptions, QA, loudness, Whisper). Answer:
   `review/codex-kallaway-r1.md`.
2. **Library + docs:** `styles/kallaway/` (8 elements, 38 clips), `_index-vertical.png` /
   `_index-horizontal.png`, README, CHANNEL.md ★, `luisart-reglas`, `luisart-editar-short`
   (`review/prompt-kallaway-library.txt`, head `review/head-kallaway-library.md`). Answer:
   `review/codex-kallaway-library-r1.md`.

Rules: checklist (a)–(p) in `luisart-reglas` + CHANNEL.md ★, **with the Kallaway exceptions**
(user, 2026-09-28): continuous seam captions on the split except while the top repeats the speech;
ONE giant word per spoken word on face shots (face-aware, above the head on this selfie); only a slow
push on images (no arrows, punches, transitions); a click on section cuts + at most one subtle sound
per image/counter event; zero whooshes; no PiP; no plates or bottom-darkening bands.

Method: Codex's read-only sandbox can't start processes on Windows, so code and rules were pasted
into the prompts. **Every finding was checked by Claude** against the frames (full-resolution
frames and stills) and the current code.

## Video (call 1)

**H1 — The stack shot (13.9–16.6 s) reads as an all-black screen (c). Confirmed (also found by QA
before the review). Fixed.**
- Where: frames 416–496; `KalShort.tsx` (stack on `#000`), `Stack.tsx`.
- Cause: two dark cards (the closed black box s04, the neon magnifier s11) on pure black: average
  luma 3–9 (QA "all-black"), cards barely separated from the background.
- Fix: the stack sits on the dark set (`StudioSet`, like the split) instead of `#000`; brighter,
  on-topic images — "el precio" = the key with the price tag (s01), "las utilidades" = the vault full
  of gold (s06) — with a per-card even dim for the white word. Average luma now 31–35; same change in
  the library `stack` element and README ("never pure black").

**H2 — Counter-settle sounds land 4 frames before the spoken number (e). Discarded (false
positive).** The Kallaway spec fixes the final figure 4 f before the word that names it, and the
sound rule is that the hit lands on the frame the VISUAL lands; the cue frame is derived from the
word (`counterTiming(W.aPU)`), not hard-coded. Comment added in `kalCues.ts`.

**M1 — Kallaway deliverables contradictory across the documents (m). Confirmed. Fixed.** CHANNEL.md
★ Kallaway point 6: the channel default (vertical + horizontal) unless the user asks for fewer (this
first draft: vertical only at his request); `luisart-reglas`, `luisart-editar-short` and the README
now say the same.

**M2 — "no head cut-out" vs "person cut-out" in CHANNEL.md (g). Confirmed (wording). Fixed:** "no
border, no rounded face card and no head breaking out of a card — on a bright selfie the
whole-person matte builds the dark set".

**M3 — Baseline Pizarra caption / motion / sound rules not scoped (a, e, i, k). Confirmed (clarity).
Fixed:** CHANNEL.md "Channel-wide rules" now says the Kallaway exceptions 1–6 override them for that
style; `luisart-reglas` → "Layout and captions", "Motion" and "Sound" carry a one-line scope note.

**L1 — "dato de ejemplo · MXN" too small on a phone (j). Confirmed. Fixed:** 30 px 500 → 36 px 600,
white at 86 % (counter and kinetic), placed right under the kinetic lines instead of the bottom of
the zone (it sat over the bright vault).

## Library + docs (call 2)

**H1 — The `card` layout extends outside the zones (c). Discarded (with a doc note).** The card is a
B-roll backdrop exactly like the full-frame image and the split's top half (which also run under the
platform UI); the zone rule applies to its subject and any text. README and `Layout.tsx` now say
so: the card's subject and text stay inside x 120–920, y 250–1436.

**H2 — Elements bake more than one sound per event (e). Confirmed. Fixed.** User rule: at most ONE
subtle sound per image or counter event. `WhiteType` now bakes one typing bed (its longest line),
`Kinetic` one sound per shot (the sliding figure, else the first word); the hook title (one swipe)
and counter (settle OR count) already complied. The edit's cue list dropped the "P/U" typing bed and
the two "$10 / $2 lands" clicks (16 → 13 cues). README sound map rewritten: allowed events vs
"only if the user asks" (logo, emphasis, bad figure, CTA).

**M1 — Any backing allowed on any element (m). Discarded:** by design, as in the Pizarra library
("any element can get a green variant"); defaults follow the pack contract.

**M2 — Vertical face-word showcase used the raw face box, not the 92 % face layout (b/l).
Confirmed. Fixed:** `faceV = mapBox(TEST_FACE, facePlace)`; stale "100 %" comment in `Layout.tsx`
corrected. `SLA-kal-captions-face-word-v` re-rendered.

**M3 — Counter `landAt` could be 0 (negative clocks) (e). Confirmed. Fixed:** `landAt ≥ 1 s`; card,
typed-line and kinetic `at` ≥ 0.

**M4 — Brand colours duplicated as rgba outside `theme.ts`. Confirmed. Fixed:** `alpha(token, a)`
in `theme.ts` (+ `warm` token); set glows, dims, oval mask and the counter halo use the tokens.

**M5 — Image-motion props not exposed in the schemas (i). Confirmed (partly). Fixed:** `pan` on
`layout`; `dir` + `pan` on `counter` and `kinetic`.

**M6 — Deliverable policy contradictory (m).** Same as video M1 — fixed.

## Found by Claude (not by Codex)

- **Matte artifact (Low, kept):** on some face shots (e.g. 12.6–13.9 s "dice", "nada") a small dark
  wedge sticks out of the top of the hair: the dark picture frame behind his head was taken as part of
  the person by the matte (Robust Video Matting on the bright test wall). On the dark set it reads as
  a dark tuft. A mask can't separate it (it's only ~0.1 face-heights above the hair and the hair
  line moves); it disappears with a recording on a plain / dark background. Reported to the user.
- **Split figure is small (by construction, kept):** the face is 184–224 px wide on the split
  (his ≈ 220) but the close selfie gives no shoulders, so it reads as a portrait in an oval on the
  dark set. Forehead clear of the seam caption and mouth above y 1436 on every split frame
  (`checkCaptions.ts`). A medium shot on a dark set would fill the half like his.

## Checked and compliant (both calls + Claude)

- (a*) seam captions only on split shots, absent on both counter shots and on stack / white /
  kinetic shots; no seam caption shorter than 8 f (518 seam-caption frames).
- (b)/(l) 0 caption or giant-word frames touch the protected face (forehead + eyes + mouth) —
  `checkCaptions.ts`, per frame; giant words above the head (line centre y 346–399).
- (c) headline, counters, kinetic type and giant words inside x 120–920 / y 250–970; mouth ≤ y 1430 on
  every split shot. (d) no plates, pills or bands; only even dims. (f) no "Luisart" misspelling.
  (g) no PiP. (h) no music (`USER_MUSIC = null`). (i*) only the slow push on images; face static.
  (j) figures from `figures.ts`, P/U computed, "dato de ejemplo · MXN" on every example figure.
- (e*) 5 section clicks (≥ 5 s apart) + one subtle sound per image/counter event, 0 whooshes, every
  cue frame from a transcript word.
- The editing skill asks the style as its first and only question.

## After the fixes

One re-render (as asked) of the video and of the 17 affected library clips; checks re-run (see
BRIEF.md "Kallaway draft").
