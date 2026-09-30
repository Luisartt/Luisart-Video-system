---
name: design-system-import
description: Import an existing design system or brand into this repository's token format (brand/design-system/tokens.json) from a website URL, a CSS file, a design-tokens JSON, a DESIGN.md, a brand-guide PDF or images, or a Figma file, review every value with the user, and make it video-ready (contrast, phone-size type, safe zones). Use when the user picked "import a design system" in video-system-start, or says "importa mi design system", "usa la marca de mi sitio", "I already have brand colors and fonts", "copy the look of this website".
---

# Import a design system

Goal: turn what the user already has into `brand/design-system/tokens.json` (same schema as the
created ones, see `scripts/design/tokens_schema.py`), then fill the gaps that video needs and web
design does not (phone type sizes, motion, sound, safe zones).

Ask first: **"Where does your design system live?"** and pick the route:

| They have | Route |
|---|---|
| A website (theirs, or one whose look they want) | **URL** |
| A CSS / Tailwind / theme file | **CSS** |
| Design tokens (W3C, Style Dictionary, Figma Tokens Studio export) | **JSON** |
| A `DESIGN.md` (see `awesome-design-md`) | **DESIGN.md** |
| A brand-guide PDF or images of the brand | **Visual** |
| A Figma file | **Figma** |

## Routes

**URL** — only public pages, no login:
`python scripts/design/importar_tokens.py --url https://their-site.com --name "Brand"`.
It reads CSS variables, counts colours and font families and maps them to roles. If it finds little
(pages that build their styles in JavaScript), open the page in the built-in browser and read the
computed styles of the body, a heading, a button and a link with the javascript tool (colour,
background-color, font-family, font-size, border-radius, box-shadow), then write the values in
yourself. Screenshots are for your eyes; do not commit them.

**CSS / JSON / DESIGN.md** — same script with `--css file`, `--json file` or `--designmd file`.

**Visual (PDF / images)** — read the brand guide pages or look at the images and transcribe the
hex colours and font names they state; if colours are only shown as swatches, sample them
(Python + Pillow on the image) and show the user the extracted palette to confirm. Fonts: name them;
find the nearest Google Font if the brand font is licensed.

**Figma** — if a Figma connector is available use it to read styles/variables; otherwise ask the user
to export the tokens (Tokens Studio or the Variables export) and use the JSON route. Do not ask them
for their Figma password or token in the chat.

## After importing (always)

1. **Review with the user**, role by role, in plain words ("background, the colour behind
   everything: this cream — right?"). The script's `_import.notes` tells you which guesses are weak.
   Remove the `_import` block when everything is confirmed.
2. **Fonts:** each family must exist in `@remotion/google-fonts`; `generar_theme.py` warns and falls
   back to Inter. If the brand font is proprietary, choose the closest free alternative together
   and record the original in `DESIGN.md` under "Brand font (licensed)".
3. **Video adaptation** (what websites do not define): set `type` sizes for a phone
   (title 90–120, caption 50–60, label 40–50, number 150+), `motion` (enter frames, stagger,
   overshoot), `safe` zones, `sound` (−14 LUFS, true peak ≤ −1 dBTP). Explain each in a sentence.
4. **Contrast:** `python scripts/design/contraste.py brand/design-system/tokens.json`; fix failures
   keeping the hue, and tell the user why (a web brand colour can fail on video).
5. **Generate and see it:** `python scripts/design/generar_theme.py brand/design-system/tokens.json channels/<slug>/theme.generated.ts`,
   then continue with `graphics-from-design-system`.
6. Write `brand/design-system/DESIGN.md` (template in `design-system-create`), noting the source and
   date of the import.

## Rules
- Import values and names only: colours, font names, sizes. Never copy logos, illustrations, images,
  fonts files or copy text from a site into the repository.
- If the source is someone else's brand (a site the user admires), it is **inspiration**: change at
  least the accent and the type pairing and say so; do not reproduce a third party's identity.
- Public pages only; respect robots/ToS; never log in, never use saved sessions.
