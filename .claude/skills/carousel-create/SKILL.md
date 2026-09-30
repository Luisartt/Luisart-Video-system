---
name: carousel-create
description: Make Instagram carousels (1080x1350, 4:5) in the user's own brand from their design system — pick a skeleton and hook, write the slides, render them with the token-driven renderer (PNG, plus optional animated MP4 slides), check safe areas and copy rules, write the caption, and file the finished post ready for Buffer. Use when the user says "hazme un carrusel", "quiero un carrusel sobre X", "make a carousel", "convierte este guion en carrusel", or when luisart-init-skills reaches the carousel step.
---

# Create a carousel

Prerequisite: a design system (`brand/design-system/tokens.json`, steps S04–S05). Without it, stop and run
`luisart-init-skills` first. The renderer is `channels/_template/social/render_social.cjs` (Playwright; reads your
tokens, so every carousel follows your brand). Playbook to teach from: `vault-template/wiki/Content Creation/Carousels/Carousel Playbook.md`.

The user may be a beginner: explain each choice in one sentence, decide the rest yourself, show the result, iterate.

## Steps
1. **Brief (max 4 questions):** topic, goal (follow / save / comment-for-a-resource / sell), audience, and whether it
   comes from a video script (then reuse its facts). Facts come from the user's sources; if a knowledge wiki exists,
   search it **read-only** (as `luisart-guion` does). Never invent numbers: mark illustrative ones `"example": "example data"`.
2. **Pick a skeleton** and say why (see the playbook): Countdown/Top N · Myth or objection ladder · Hook/template list ·
   Concept explainer. 7–10 slides, one idea each, ≤ 40 words per slide.
3. **Hook first.** Slide 1 threatens or promises (identity threat, a price reframe, "X just killed Y"), never explains.
   Offer 3 hook options in the user's voice and let them pick.
4. **Write the deck** `out/{channel}/carousels/<slug>/deck.json` (format in the header of `render_social.cjs`; slide types:
   `hook`, `context`, `item`, `stat`, `compare`, `list`, `cta`). Use `*word*` for the accent word (one per slide at most).
   Use `compare` for any A-versus-B (the "two examples side by side" pattern). Last slide = one keyword CTA + "save".
5. **Render:** `node channels/_template/social/render_social.cjs --deck <deck.json> --out out/{channel}/carousels/<slug>`
   Add `--guides` for a preview with safe lines, `--only N` to fix one slide, and `--animate` for 5 s MP4 versions of each slide
   (everything visible from frame 0, entering in < 1 s; silent: the user chooses any music).
6. **Review with your eyes** (contact sheet with FFmpeg `tile`): text ≥ 34 px after the 84 % frame, contrast passes
   (`python scripts/design/contraste.py`), nothing outside the safe frame (130 px top/bottom, 90 px sides), counter and handle
   on every slide, no plates behind text if the channel rule says so, spelling and accents. Fix the deck, re-render that slide.
7. **Caption** (their language and tone): hook line with 👇, what it is, the numbers (marked as examples if they are), one
   keyword CTA ("Comment WORD and I'll send…") — **only promise what exists** — and "save this". **Maximum 5 hashtags**
   for Instagram (more disables scheduling in Buffer), under 2,200 characters. Save it as `caption.txt` next to the slides.
8. **File it:** a page in the vault `Finished Posts/` (format, files by full path, caption, status `ready`) — see
   `wiki-vault-setup`. Then offer `buffer-publishing-setup` to schedule it (carousel = Post, files one by one in order).
   Never schedule or publish without the user saying it is done.

## Rules
- Brand values come from tokens; never hard-code a colour in the renderer or a deck.
- Slides are 1080×1350 exactly (4:5); the design is drawn inside an 84 % frame so the platform never crops it.
- Do not use other people's images, logos or screenshots you do not have rights to; the user's own screenshots go inside a
  window/card frame.
- If the brand has a character or mascot, keep one per carousel and vary its expression; do not invent one.
- A carousel that comes from reference carousels proposes only: copy the structure, never the identity, words or images.
