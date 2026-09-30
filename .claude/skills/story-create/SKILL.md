---
name: story-create
description: Make Instagram stories (1080x1920, 9:16) in the user's own brand from their design system — a single story or a 3–7 frame sequence (hook, value, interaction, call to action) — rendering images (or short MP4s) inside the platform safe zones and telling the user which native stickers to add in the app. Use when the user says "hazme una historia", "quiero historias para promocionar esto", "make stories", "una secuencia de historias", or when luisart-init-skills reaches the story step.
---

# Create stories

Prerequisite: a design system (`brand/design-system/tokens.json`). Renderer: `channels/_template/social/render_social.cjs`
with `"kind": "story"` in the deck. Playbook: `vault-template/wiki/Content Creation/Stories/Story Playbook.md`.

## What a story is (teach in two sentences)
A vertical 9:16 screen that disappears in 24 hours and is watched in seconds, so it carries **one idea, very few words**,
and often one **interaction** (poll, quiz, question box, link, countdown). Instagram covers the top and bottom of the screen
with its own interface, so the text lives in the middle zone.

## Steps
1. **Brief (max 3 questions):** what is the story for (promote a post or video, teach a tip, ask the audience, sell), how
   many frames (1 or a 3–7 sequence), and the one action you want (reply, vote, tap a link, open the post).
2. **Pick the shape:**
   - *Single:* cover/quote/stat + clear action.
   - *Sequence of 3–7:* **hook** (curiosity or threat) → **value** (one fact, stat or step per frame) → **interaction**
     (poll or question) → **CTA** (link sticker or "watch the post"). One idea per frame, ≤ 15 words each.
3. **Write the deck** `out/{channel}/stories/<slug>/deck.json` with `"kind": "story"` and slide types `cover`, `stat`,
   `quote`, `poll`, `cta` (format in the header of `render_social.cjs`; `*word*` = accent). Mark illustrative numbers
   `"example": "example data"`.
4. **Render:** `node channels/_template/social/render_social.cjs --deck <deck.json> --out out/{channel}/stories/<slug>`
   (`--guides` previews the safe zones and sticker areas; `--animate --seconds 6` writes short MP4s, silent). Safe zone:
   tokens `safe.story` (default top 250 px, bottom 1600 px of 1920); keep text and buttons inside it.
5. **Stickers (added in the Instagram app or Buffer's Story composer, not in the image):** poll, quiz, question box,
   countdown, link. The renderer leaves a clear area (`poll` shows the two options; `cta` shows a dashed sticker box).
   Tell the user exactly which sticker goes where and what to write in it.
6. **Review:** text ≥ 48 px, contrast passes, nothing in the top 250 px or bottom 320 px, consistent look across the
   frames, spelling. Fix and re-render the frame.
7. **File and schedule:** page in the vault `Finished Posts/` (format `story`, files, action); offer `buffer-publishing-setup`
   (Story type: one file at a time, no caption). Stories do not carry a caption or hashtags. Suggest saving a
   good sequence to a Highlight. Never schedule without the user saying it is done.

## Rules
- Brand values from tokens; no other people's images, logos or music; music is the user's choice in the app.
- Do not promise in a story anything the user cannot deliver (links, freebies).
- Keep it short: one screen, one idea, one action.
