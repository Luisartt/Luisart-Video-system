---
name: design-system-create
description: Build a design system for a video brand from scratch by interviewing the user and teaching each decision as it is made — personality, colour, type, shapes, motion, sound, layout and safe zones — and produce brand/design-system/tokens.json, DESIGN.md and a Remotion theme that passes a contrast check. Use when the user picked "create a design system" in video-system-start, or says "crea mi design system", "quiero definir mi marca visual", "help me design my brand", "what colors/fonts should I use".
---

# Create a design system (teach while you build)

A **design system** is the small set of decisions that make everything you publish look like it
came from the same person: colours, fonts, shapes, motion, sound and layout rules. Write them once
as **tokens** (named values), and every graphic reads them. That is why it is worth doing first.

The user may be a beginner. For every decision: (1) say in one or two sentences what it is and why
it matters, (2) offer 2–3 concrete options with a one-line taste description, (3) recommend one,
(4) show it when you can (a swatch or a rendered still), (5) save it. One decision per message.

Read `brand/brand.json` (topic, audience, admired brands) and `brand/references/REFERENCES.md` if
it exists; both steer the options. Output files:

```
brand/design-system/DESIGN.md      the rules in words (for humans and AIs)
brand/design-system/tokens.json    the values (schema: scripts/design/tokens_schema.py, example: tokens.example.json)
channels/<slug>/theme.generated.ts generated, never edited by hand
```

## The interview (in this order)

1. **Personality.** Pick three words from a list (serious, playful, premium, friendly, technical,
   rebellious, warm, minimal, bold, educational…). Teach: a brand has a voice before it has a
   colour. Write them at the top of `DESIGN.md`.
2. **Background and "paper".** Light, dark or textured (dotted board, grid, grain, gradient).
   Teach: on phones, most people watch in bright places, high contrast wins; dark backgrounds feel
   premium but make colour accents glow.
3. **Colour.** Start from one **accent** colour (the user's taste or a colour of the topic:
   finance → blues and greens, kids → warm brights). Then:
   - `background`, `surface` (cards), `ink` (text), `muted` (small notes),
   - `accent` (the one colour people remember), `accent2` (a partner for comparisons),
   - `positive` and `negative` (good/bad), `line` (borders).
   Teach the **60–30–10 rule** (60 % background, 30 % surface/ink, 10 % accent) and that an accent
   used everywhere stops being an accent. Show each choice on the real background.
4. **Type.** At most two families plus an optional handwritten or mono accent.
   Use Google Fonts (they work in Remotion out of the box). Teach: one font for headlines (strong),
   one for reading; test them in the user's language (accents, ñ, ¿). Sizes for a 1080×1920 phone
   screen: titles 90–120 px, captions 50–60, labels 40–50, big numbers 150+; anything under 40 px is
   unreadable on a phone.
5. **Shape language.** Sharp corners vs rounded, thick outlines vs none, flat vs hard shadow vs soft
   shadow. Teach: shapes carry personality as much as colour (rounded = friendly, sharp + outline =
   editorial/brutalist, soft shadow = product/premium).
6. **Motion.** How fast things enter (6–10 frames at 30 fps feels snappy; 15+ calm), whether they
   overshoot (playful) or settle (serious), stagger between siblings (8–12 frames). Teach: constant
   gentle motion keeps short videos alive; too much reads as noise.
7. **Sound.** Loudness target −14 LUFS and true peak ≤ −1 dBTP (the standard for social video), a
   rule for whooshes (only on real transitions) and for music (the creator chooses; never silent
   licensing assumptions).
8. **Layout and safe zones.** Platforms cover parts of a vertical video with their own interface.
   Default: keep graphics between y 250 and 970 on 1080×1920 and nothing important in the bottom
   ~25 % or the far right of the lower half. Ask which platforms matter and keep the strictest.
9. **Logo and mascot (optional).** Where a logo may appear; never on top of faces; a mascot only
   if the brand really has one. Never generate or use someone else's logo.
10. **Components.** Confirm the starter set: title, big number, bar chart, lower third,
    two-examples-side-by-side, captions. Ask what else the videos need (timeline, checklist,
    quote card…), note it in `DESIGN.md`; new elements are built later with
    `graphics-from-design-system`.

## Then

1. Write `tokens.json` (start from `tokens.example.json`; keep every key).
2. Check readability: `python scripts/design/contraste.py brand/design-system/tokens.json`. Fix any
   failing pair by darkening/lightening while keeping the hue; explain contrast in one sentence
   ("if the words are hard to read in sunlight, the video loses viewers").
3. Generate the theme: `python scripts/design/generar_theme.py brand/design-system/tokens.json channels/<slug>/theme.generated.ts`
   (for the starter kit: `channels/_template/theme.generated.ts`).
4. Write `DESIGN.md` (template below), in plain language with the reasons.
5. Hand over to `graphics-from-design-system` to see it rendered; come back and tweak tokens as
   many times as the user wants (one change, regenerate, re-render).

## DESIGN.md template
```markdown
# <Brand> — design system
**Feel:** three words · **For:** audience · **Platforms:** …
## Colour  (table: token, hex, use, contrast vs background)
## Type    (families, weights, sizes)
## Shapes  (corners, border, shadow)
## Motion  (enter frames, stagger, overshoot yes/no)
## Sound   (LUFS, peak, whoosh rule, music owner)
## Layout  (canvas, safe zones)
## Components (what exists, what is planned)
## Never   (list of things this brand never does)
## Key Takeaways (3–5 bullets)
```

## Rules
- The user's taste beats rules of thumb; say when you break one and why.
- Never copy another brand's identity: borrow principles (contrast, rhythm, density), not logos,
  exact palettes plus typography combinations, or mascots.
- Save after every decision so a closed session loses nothing.
