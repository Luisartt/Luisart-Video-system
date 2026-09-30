import type { PizGroup } from "./Behind";
import { T, W } from "./layout";

// Text behind the head — shared by the full-board, split and horizontal edits. User rule
// (2026-09-27, final): only KEY face shots carry a big behind-head word (`key: true`): the hook
// "2 AÑOS", "BARATA" / "≠ BUENA INVERSIÓN", "UTILIDADES" (the lesson's pivot) and "GUARDA ESTO".
// The other face shots (PRECIO, COMPRAR, PREGÚNTATE) show no big word and get captions instead;
// their groups stay here (key: false) so they can be switched back on.
export const GROUPS: PizGroup[] = [
  { name: "2 años", key: true, hTop: 170, from: 0, to: T.una, top: 360, kicker: { text: "llevo más de", at: 0 }, lines: [{ text: "2 AÑOS", at: W.dos, tone: "accent" }] },
  {
    name: "barata",
    key: true,
    hTop: 170,
    from: T.una,
    to: T.buena,
    top: 342, // kicker stays inside the graphics zone (≥ y 250)
    kicker: { text: "una acción, cuando está", at: T.una },
    lines: [{ text: "BARATA", at: W.barata, tone: "accent" }],
  },
  {
    name: "≠ buena inversión",
    key: true,
    hTop: 96,
    from: T.buena,
    to: T.todo,
    top: 250,
    lines: [
      { text: "≠ BUENA", at: T.buena, tone: "ink", max: 140 },
      { text: "INVERSIÓN", at: W.inversion, tone: "accent", max: 140 },
    ],
  },
  // He sits up on "Pero…": the word goes higher (smaller kicker keeps it inside the safe top).
  { name: "precio", key: false, from: T.pero, to: T.si, top: 324, kicker: { text: "pero el", at: T.pero, size: 58 }, lines: [{ text: "PRECIO", at: W.precioT, tone: "accent" }] },
  {
    name: "utilidades",
    key: true,
    hTop: 170,
    from: T.si,
    to: T.ahi,
    top: 342,
    kicker: { text: "si no lo comparas con las", at: T.si },
    lines: [{ text: "UTILIDADES", at: W.utilidades, tone: "accent" }],
  },
  { name: "comprar", key: false, from: T.antes, to: T.preguntate, top: 360, kicker: { text: "antes de", at: T.antes }, lines: [{ text: "COMPRAR", at: W.comprar, tone: "accent" }] },
  { name: "pregúntate", key: false, from: T.preguntate, to: T.barato, top: 330, lines: [{ text: "PREGÚNTATE", at: T.preguntate, tone: "accent" }] },
  {
    name: "guarda esto",
    key: true,
    hTop: 96,
    from: T.guarda,
    to: T.end,
    top: 272,
    lines: [
      { text: "GUARDA", at: T.guarda, tone: "ink", max: 140 },
      { text: "ESTO", at: W.esto, tone: "accent", max: 140 },
    ],
  },
];


/** The groups an edit shows: key face shots only. */
export const KEY_GROUPS = GROUPS.filter((g) => g.key);
