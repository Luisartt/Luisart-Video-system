# Codex prompt head (template)

Copy this into `<V>/review/head-<target>.md`, fill the `<…>` parts, and paste the rules section
from skill `luisart-reglas` (its SKILL.md body) plus CHANNEL.md ★ as files in the prompt (they go
after this head via `make_prompt.py`). Keep the wording: it tells Codex it cannot run commands
and fixes the answer format we parse.

---

You are reviewing a finished video edit for the YouTube/Shorts channel @soyluisart against the
channel's written rules. You are in a READ-ONLY sandbox that cannot run commands or open files:
everything you need is in this prompt (source files pasted with line numbers) and in the attached
contact-sheet images. Do not try to run anything. Answer in English.

**Target:** `<composition ID>` rendered to `<out path>` (<N> frames, 30 fps, <W×H>). The attached
images are contact sheets of that render: one frame every 0.5 s plus a frame 2 frames after every
caption change, <cols>×<rows> tiles per sheet, each tile labelled "NNN fFRAME SECONDSs". The
legend below maps tiles to frames. On vertical renders coloured lines mark the zones: blue =
graphics zone y 250–970, yellow = caption band y 1000–1300, red = platform UI (below y 1436 and
the right 160 px of the lower half).

**Rules:** the checklist (a)–(p) in `luisart-reglas` and the ★ section of `CHANNEL.md`, both
pasted below. Where they differ, CHANNEL.md wins.

**What to do:**
1. Go through every tile and check the visual rules: (a) captions only when nothing but the face
   is on screen; (b)/(l) captions never on forehead, eyes or mouth — neck/chest on a medium shot,
   above the head on a close-up; (c) zones; (d) no box/plate/pill/band behind any caption or
   on-screen text (text inside a drawn object — price tag, bubble, sticky note, window, button —
   is allowed); (f) "Luisart" spelling; (g) no face or face card on a full-board scene;
   (i) motion and marker arrows; (j) "dato de ejemplo" on every example figure, money in MXN or
   US$; (k) only key-idea face shots carry a big behind-head word, the others get captions.
2. Go through the code and check what frames can't show: (a) the caption gate receives EVERY
   graphic window; (e) the cue list — whoosh only on frame 0 and real transitions, every graphic
   event has its own specific SFX near its landing frame; (h) music only from
   `media/soyluisart/user-provided/musica/` via `USER_MUSIC`; figures come from one `figures.ts`
   and results are computed; nothing hard-codes a time instead of a transcript word.
3. Also flag: anything cropped or cut off, text too small to read on a phone, single-frame
   glitches, a caption that flashes for less than 12 frames, voice/screen mismatches (the screen
   shows a different number or word than what is said), and stale or contradictory statements
   in the pasted documents.
<Extra focus for this round, e.g. "Round 2: verify the fixes for H1–H3 and look for regressions".>

**Answer format** (markdown, nothing else):

```
## High
**H1 — <one-line title> (<rule letter>).**
- Where: tiles NNN–NNN (s–s) and/or file:line.
- What: <evidence you see>.
- Fix: <concrete change>.
## Medium
**M1 — …**
## Low
**L1 — …**
## Checked and compliant
- <rule>: <what you checked and found fine>.
```

Severity: High = breaks a rule on screen or in the sound of the deliverable; Medium = breaks a
rule in a less visible way, or a document/code problem that will cause a rule break; Low =
polish or risk. Cite tiles and line numbers; never guess a line number. If you are unsure,
say so in the finding instead of inventing evidence. Don't report the same issue twice.
