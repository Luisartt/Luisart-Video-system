import { cue, licensesOf } from "../cues";
import { A, B, money, num, pu } from "../figures";
import type { Cue } from "../Sound";
import { TOTAL_FRAMES } from "../timing";
import { T, W } from "./layout";

// Pizarra sound design. One sound per beat, each landing (its measured peak, sfx-index.json) on the
// frame its visual lands. Pizarra grammar (styles/pizarra/README.md → sound map): typed words get
// keyboard sounds, pixel icons pop, money figures clink, results ding, and (v3) every marker
// arrow / underline that draws on gets a marker stroke from efectos/marker/. The only whooshes
// are the video start and the real transitions into / out of the board explanation.

const len = (s: string) => Array.from(s).length;
const puAtFormula = Math.max(T.ahi + 3 + len("MÚLTIPLO P/U") + 2, W.multiplo + 4);

/** Marker stroke (9-frame pen line) for an arrow / underline starting to draw on `at`. */
const pen = (name: string, at: number, vol = 0.3) => cue(name, at, "marker/marker-pen-line-01.wav", vol, { lead: 0, max: 12 });

const HOOK_FULL: Cue[] = [
  cue("kicker on the cut · key", T.una, "typing/typing-mechanical-key-single-01.wav", 0.24, { max: 12 }),
  cue("BARATA typed", W.barata, "typing/typing-key-presses-short-02.wav", 0.3, { max: 9 }),
  cue("≠ BUENA INVERSIÓN typed", T.buena, "typing/typing-key-presses-short-02.wav", 0.26, { max: 19 }),
  cue("? cards pop", T.aqui, "pop/pop-soft-01.wav", 0.3),
  cue("? card 3 pop", T.aqui + 16, "pop/pop-bubble-01.wav", 0.2, { max: 12 }),
];

// (The PRECIO face shot has no big word any more — captions instead — so no sound there.)
const TURN_FULL: Cue[] = [
  cue("kicker on the cut · key", T.si, "typing/typing-mechanical-key-single-01.wav", 0.22, { max: 12 }),
  cue("UTILIDADES typed", W.utilidades, "typing/typing-mechanical-short-01.wav", 0.26, { max: 14 }),
];

// Board sounds shared by both edits.
const BOARDS: Cue[] = [
  // Board 1: el precio
  cue("board in · whoosh", T.todo, "whoosh/whoosh-air-quick-03.wav", 0.28, { max: 26 }),
  cue("EL PRECIO typed", T.todo + 3, "typing/typing-mechanical-run-01.wav", 0.16, { max: 11, trim: 120 }),
  pen("arrow note → tag", W.ve),
  cue(`${money(A.price)} tag · coins`, W.precio1, "money/money-coins-clink-01.wav", 0.26, { max: 24 }),
  cue("bubble typed · ¡está regalada!", W.ah, "typing/typing-mechanical-run-01.wav", 0.2, { max: len("¡Ah, está regalada!") + 2 }),
  // Board 2: the explanation (transition in)
  cue("board in · whoosh", T.ahi, "whoosh/whoosh-air-fast-04.wav", 0.3, { max: 30 }),
  cue("board in · sub", T.ahi, "impact/impact-sub-boom-01.wav", 0.16, { max: 40 }),
  cue("MÚLTIPLO P/U typed", T.ahi + 3, "typing/typing-mechanical-run-01.wav", 0.2, { max: len("MÚLTIPLO P/U") + 2 }),
  cue("Bit drops in", W.entra, "pop/pop-bubble-01.wav", 0.24, { max: 14 }),
  pen("arrow Bit → P/U", puAtFormula - 2, 0.26),
  cue("P/U typed", puAtFormula, "typing/typing-key-presses-short-02.wav", 0.18, { max: 5 }), // own sound (Codex v7 round 2)
  cue("PRECIO lands", W.precioF, "ui/ui-click-mouse-01.wav", 0.24),
  pen("fraction bar", W.yF, 0.26),
  cue("UTILIDAD lands", W.utilidadF, "ui/ui-click-mouse-02.wav", 0.2), // own sound (Codex v7 round 2)
  // Empresa A
  cue("EMPRESA A typed", T.porEjemplo + 3, "typing/typing-mechanical-run-01.wav", 0.2, { max: len("EMPRESA A") + 2, trim: 20 }),
  cue(`A · ${money(A.price)} coins`, W.aPrice, "money/money-coins-clink-01.wav", 0.26, { max: 24 }),
  pen("A · fraction bar", W.aGana, 0.26),
  cue(`A · ${money(A.eps)} bag`, W.aEps, "money/money-bag-drop-01.wav", 0.22, { max: 24 }),
  pen("A · arrow price → result", W.aMultiplo),
  cue(`A · P/U = ${num(pu(A))} ding`, W.aPU, "notification/notification-ding-keyword-01.wav", 0.24, { max: 34 }),
  // Empresa B
  cue("EMPRESA B typed", T.siOtra + 3, "typing/typing-mechanical-run-01.wav", 0.2, { max: len("EMPRESA B") + 2, trim: 40 }),
  cue(`B · ${money(B.price)} coins`, W.bPrice, "money/money-coins-clink-01.wav", 0.26, { max: 24 }),
  pen("B · fraction bar", W.bGana, 0.24),
  cue(`B · ${money(B.eps)} bag`, W.bEps, "money/money-bag-drop-01.wav", 0.22, { max: 24 }),
  pen("B · arrow price → result", W.bMultiplo),
  cue(`B · P/U = ${num(pu(B))} bleep`, W.bPU, "data/data-bleep-01.wav", 0.24, { max: 18 }),
  // A vs B
  cue("A vs B recap", T.donde, "ui/ui-click-classic-02.wav", 0.2),
  pen("la segunda · arrow A → B", W.segunda),
  cue("más cara · low hit", W.cara, "tension/tension-heartbeat-impact-01.wav", 0.28, { max: 40 }),
  cue("prices underlined", W.precioC, "marker/marker-chalk-line-01.wav", 0.24, { lead: 0, max: 10 }),
  pen("two-way arrow between prices", W.precioC + 10, 0.24),
  cue("note · el precio solo no dice nada", W.contrario, "marker/marker-pencil-letters-01.wav", 0.22, { lead: 0, max: 10 }),
  // Back to the face (transition out) + CTA words
  cue("board out · whoosh", T.antes, "whoosh/whoosh-wind-short-06.wav", 0.28, { max: 30 }),
  // (COMPRAR / PREGÚNTATE face shots: no big word, captions instead — no sound.)
  // Board 3: ¿barato comparado con qué? (hard cut, no whoosh) — arrows fan out to "?" cards
  cue("¿BARATO typed", T.barato + 2, "typing/typing-mechanical-run-01.wav", 0.22, { max: len("¿BARATO") + 2, trim: 60 }),
  // Three arrows fan out, 6 f apart (Boards.tsx QuestionBoard): one pen stroke each (Codex v6 M1).
  pen("arrow → ? card 1", W.baratoEnd),
  pen("arrow → ? card 2", W.baratoEnd + 6, 0.22),
  pen("arrow → ? card 3", W.baratoEnd + 12, 0.22),
  cue("? cards pop", W.baratoEnd + 4, "pop/pop-soft-01.wav", 0.24),
  cue("? card 2 pop", W.baratoEnd + 10, "bubble/bubble-pop-soft-04.wav", 0.2, { max: 8 }),
  cue("? card 3 pop", W.baratoEnd + 16, "pop/pop-bubble-01.wav", 0.18, { max: 12 }),
  cue("COMPARADO CON QUÉ? typed", W.comparado, "typing/typing-mechanical-run-01.wav", 0.2, { max: W.con - W.comparado + len("CON QUÉ?") + 2, trim: 90 }),
  cue("CON QUÉ? lands", W.que, "impact/impact-cinematic-boom-01.wav", 0.14, { max: 30 }),
  // CTA
  cue("GUARDA typed", T.guarda, "typing/typing-key-presses-short-02.wav", 0.26, { max: 9 }),
  pen("arrow ESTO → bookmark", W.esto + 2),
  cue("bookmark drops", W.esto + 6, "pop/pop-soft-01.wav", 0.18, { max: 10 }), // own sound (Codex v7 round 2)
  cue("bookmark fills", W.vas, "ui/ui-click-mouse-01.wav", 0.28),
  cue("Bit pops up (CTA)", W.vas + 10, "pop/pop-minimal-01.wav", 0.24, { max: 12 }),
  cue("outro sting", Math.min(W.necesitarEnd - 4, TOTAL_FRAMES - 10), "notification/notification-bell-ding-01.wav", 0.2, { max: 20 }),
];

// Video start: the whoosh's peak lands on frame 0 (its pre-roll is trimmed), then "2 AÑOS" types.
const START = [
  cue("start · whoosh (frame 0)", 0, "whoosh/whoosh-air-fast-04.wav", 0.3, { max: 18 }),
  cue("2 AÑOS typed", W.dos, "typing/typing-key-presses-short-02.wav", 0.28, { max: 9 }),
];
const midCard = (name: string, at: number) => cue(name, at, "bubble/bubble-pop-soft-04.wav", 0.22, { max: 8 });

/** Full-board Pizarra edit. */
export const PIZ_CUES: Cue[] = [...START, ...HOOK_FULL, midCard("? card 2 pop", T.aqui + 8), ...TURN_FULL, ...BOARDS];

/** Split-screen edit: same boards; the hook, "≠ buena inversión" and "compara" live in the top band. */
export const SPLIT_CUES: Cue[] = [
  ...START,
  midCard("? card 2 pop", T.aqui + 8),
  pen("underline 2 AÑOS", W.estudiando),
  cue("calendar pops", W.entender, "pop/pop-soft-01.wav", 0.26),
  cue("face cut · key", T.una, "typing/typing-mechanical-key-single-01.wav", 0.24, { max: 12 }),
  cue("BARATA typed", W.barata, "typing/typing-key-presses-short-02.wav", 0.3, { max: 9 }),
  cue("≠ BUENA INVERSIÓN typed", T.buena, "typing/typing-key-presses-short-02.wav", 0.26, { max: 19 }),
  cue("? cards pop", T.aqui, "pop/pop-soft-01.wav", 0.3),
  cue("? card 3 pop", T.aqui + 16, "pop/pop-bubble-01.wav", 0.2, { max: 12 }),
  cue("tag drops (split)", T.si, "pop/pop-soft-01.wav", 0.26),
  pen("arrow precio → utilidades", W.comparas),
  cue("money bag lands", W.utilidades, "money/money-bag-drop-01.wav", 0.24, { max: 24 }),
  ...BOARDS,
];

export const PIZ_CUE_LICENSES = licensesOf(PIZ_CUES);
export const SPLIT_CUE_LICENSES = licensesOf(SPLIT_CUES);
