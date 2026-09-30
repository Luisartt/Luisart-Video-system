Homepage logos for the Obsidian vault (Inicio screen), made 2026-09-28.
Source: Codex CLI (ChatGPT login) image generation, prompts based on the Luisart brand kit
(`channels/soyluisart/styles/pizarra/README.md`, reference sheet `out/soyluisart/pizarra/_stills/SLA-piz-icon-sheet.png`
attached to each call): pixel art, 1 px ink outlines, electric blue #2F6BFF, mascot Bit.
- `raw/logo-lockup.png` — Bit + "@soyluisart" wordmark + handwritten tagline.
- `raw/icons-sheet-v2.png` — 8 block icons (notas, reloj, calendario, contenido, conocimiento, bandejas, ultimas, ajustes).
  (`raw/icons-sheet.png` was a first try with a dark glow background; not used.)
- `png/` — transparent cut-outs (256 and 96 px + `logo-lockup.png` + `bit-*.png`), made by slicing the sheet and flood-filling the white
  outside background. A copy lives in the vault at `Lartyk/.inicio/logos/`.
- `png/logo-lockup-oscuro.png` — the lockup for dark backgrounds (text recoloured light, letter counters transparent), made from `logo-lockup.png` with a script (no new Codex call). Also copied to the vault's `.inicio/logos/`.
- `png/bit-marca.png`, `png/bit-marca-parpadeo.png` (eyes closed to a line), `png/logo-texto.png`, `png/logo-texto-oscuro.png` — the lockup split into mascot and wordmark (same height) for the home-screen animation; made by script from the Codex lockup. Copies live in the vault's `.inicio/logos/`.
