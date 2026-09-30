---
name: graphics-from-design-system
description: Generate video graphics (title, big number, chart, lower third, two-examples-side-by-side, captions, plus new elements) in the user's own brand from brand/design-system/tokens.json using the token-driven Remotion starter kit, render stills and short clips, and iterate with the user. Use when a design system was created or imported and the user says "hazme los gráficos", "muéstrame cómo se ve mi marca", "make the graphics", "render my brand", or when video-system-start reaches the graphics stage.
---

# Graphics from the design system

The starter kit lives in `channels/_template/` (`kit.tsx`, `elements/`, `index.tsx`). Every element
reads the generated theme (`theme.generated.ts`), so changing a token and regenerating changes
every graphic. Nothing in the kit hard-codes a brand.

## Steps

1. **Theme.** `python scripts/design/generar_theme.py brand/design-system/tokens.json channels/_template/theme.generated.ts`
   (for the user's own channel, first copy the kit: `channels/_template` → `channels/<slug>`, register
   it in `core/Root.tsx` next to `TemplateChannel`, and generate into `channels/<slug>/theme.generated.ts`).
2. **Type-check:** `npx tsc --noEmit`.
3. **Render stills of the five starter elements** into `out/<slug>/samples/` and show them:
   ```
   npx remotion still core/index.ts TPL-title-card     out/<slug>/samples/title.png   --frame=60
   npx remotion still core/index.ts TPL-stat-callout   out/<slug>/samples/stat.png    --frame=80
   npx remotion still core/index.ts TPL-bar-chart      out/<slug>/samples/chart.png   --frame=100
   npx remotion still core/index.ts TPL-lower-third    out/<slug>/samples/lower.png   --frame=60
   npx remotion still core/index.ts TPL-compare-two    out/<slug>/samples/compare.png --frame=320
   ```
   Make a contact sheet (FFmpeg `hstack`/`tile`) and show it in the chat. Ask what feels off in
   plain words ("too heavy", "too cold", "not me") and translate each answer into a token change
   (border, shadow, radius, accent, font, motion speed). One change, regenerate, re-render.
4. **Edit the data, not the code:** each composition takes props (`defaultProps` in
   `channels/_template/index.tsx`): change the texts/figures to the user's topic so they see their
   own content. Example figures must be labelled as examples ("example data").
5. **Short clip:** render the two-examples piece as video to judge the motion:
   `npx remotion render core/index.ts TPL-compare-two out/<slug>/samples/compare.mp4`
   (hardware-heavy work runs one job at a time; see `GUIDELINES.md`).
6. **New elements:** when the user needs something the kit does not have (timeline, checklist,
   quote, map…), write `elements/<Name>.tsx` using only `kit.tsx` (Board, Card, H, Note, useEnter,
   tokens), register it in `index.tsx`, render it, show it. Keep each element small and
   reusable; prefer props over copies.
7. **Checks before calling it done:** contrast passes (`scripts/design/contraste.py`); nothing
   important outside the safe zone (`T.safe.vertical`); text at least 40 px; motion matches the
   tokens; every figure marked as example unless it is real and sourced.
8. Record what exists in `brand/design-system/DESIGN.md` → Components, update
   `brand/PROGRESS.md`, and continue with the style and channel rules (`video-system-start`
   Stage 6).

## The "two examples side by side" pattern (`TPL-compare-two`)
Identical content in two tiles, each with a name and a sub-label, the second tile lower and later
(10 frames), one accent per example, both animating in sync on one scale, the winner circled at the
end. Use it whenever the video compares A and B (two products, two habits, before/after).

## Rules
- Brand values come from tokens; if you catch yourself typing a hex colour in a component, move it
  to `tokens.json`.
- Generated files (`theme.generated.ts`) are never edited by hand.
- Do not add third-party logos or images to the repo; ask the user for their own assets and keep
  any asset they provide in their fork under `media/<slug>/brand/`.
