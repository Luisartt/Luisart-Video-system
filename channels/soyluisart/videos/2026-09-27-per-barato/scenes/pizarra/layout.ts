import { TOTAL_FRAMES, at, endOf } from "../timing";

// Pizarra edit of the same cut: which layout is on screen when. Every boundary is a transcript
// word (source seconds → cut frame through timing.ts), so the edit follows the voice exactly like
// the Terminal version. Santiago's grammar: A-roll only for the hook, the turns and the CTA; the
// face shots alternate between KEY shots (big word behind the head, no captions) and PLAIN shots
// (no word, face-aware captions) — see groups.ts `key`; the explanation lives on the white dotted
// board; every layout change is a hard cut; the A-roll alternates 100 % / 115 % on those cuts.

export type BoardId =
  | "precio"
  | "formula"
  | "empresaA"
  | "empresaB"
  | "compare"
  | "question"
  // split-screen version only (top-band scenes)
  | "hook"
  | "buena"
  | "compara";
export type Seg = { from: number; to: number } & ({ kind: "aroll"; punch: boolean } | { kind: "board"; board: BoardId });

/** Santiago's rule: a board heading types from 3 frames after the cut (never opens empty). */
export const HEAD_AFTER_CUT = 3;

// Cut points (frames). The seconds in the comments here and in W are SOURCE (recording) times;
// after the removed 20.70–22.00 s flub, cut time = source − 1.30 s (timing.ts does the mapping).
export const T = {
  una: at("una"), // 3.36  "y es que una acción…"
  buena: at("buena"), // 7.44  "…buena inversión"
  aqui: at("aquí"), // 8.20  "Aquí te explico por qué"
  todo: at("todo"), // 9.56  board: "Todo el mundo ve el precio…"
  pero: at("pero"), // 12.56 turn: "Pero el precio no dice nada…"
  si: at("si", 13.8), // 13.88 "…si no lo comparas con las utilidades…"
  ahi: at("ahí"), // 16.58 board: "Ahí entra el múltiplo…"
  porEjemplo: at("por", 19), // 19.06 "Por ejemplo, si una empresa…"
  siOtra: at("si", 25.3), // 25.40 "Si otra vale…"
  donde: at("donde"), // 30.32 "Donde la segunda es más cara…"
  antes: at("antes"), // 35.32 back to the face: "Antes de comprar…"
  preguntate: at("pregúntate"), // 37.64
  barato: at("barato", 38), // 38.38 board: "¿barato comparado con qué?"
  guarda: at("guarda"), // 41.22 CTA: "Guarda esto y lo vas a necesitar."
  end: TOTAL_FRAMES,
};

export const SEGS: Seg[] = [
  { kind: "aroll", punch: false, from: 0, to: T.una },
  { kind: "aroll", punch: true, from: T.una, to: T.buena },
  { kind: "aroll", punch: false, from: T.buena, to: T.todo },
  { kind: "board", board: "precio", from: T.todo, to: T.pero },
  { kind: "aroll", punch: false, from: T.pero, to: T.si },
  { kind: "aroll", punch: true, from: T.si, to: T.ahi },
  { kind: "board", board: "formula", from: T.ahi, to: T.porEjemplo },
  { kind: "board", board: "empresaA", from: T.porEjemplo, to: T.siOtra },
  { kind: "board", board: "empresaB", from: T.siOtra, to: T.donde },
  { kind: "board", board: "compare", from: T.donde, to: T.antes },
  { kind: "aroll", punch: false, from: T.antes, to: T.preguntate },
  { kind: "aroll", punch: true, from: T.preguntate, to: T.barato },
  { kind: "board", board: "question", from: T.barato, to: T.guarda },
  { kind: "aroll", punch: false, from: T.guarda, to: T.end },
];

// Caption rule: see captionRule.ts (captions only while no graphic is on screen).
export const segAt = (frame: number): Seg => SEGS.find((s) => frame >= s.from && frame < s.to) ?? SEGS[SEGS.length - 1];

/** Windows (frames) where the A-roll is on screen (the board hides it: nothing decoded there). */
export const AROLL_WINDOWS = SEGS.filter((s) => s.kind === "aroll").map((s) => [s.from, s.to] as const);

// Word frames the board scenes land on.
export const W = {
  // board "precio"
  ve: at("ve"), // 10.08
  precio1: at("precio", 10), // 10.32 "ve el precio"
  dice: at("dice"), // 10.62
  ah: at("ah"), // 10.94
  regalada: at("regalada"), // 11.46
  // board "formula"
  entra: at("entra"), // 16.82
  multiplo: at("múltiplo", 17), // 17.20
  precioF: at("precio", 17.5), // 17.74
  yF: at("y", 17.9), // 17.98
  utilidadF: at("utilidad"), // 18.12
  // board "empresaA"
  empresa: at("empresa", 19), // 19.68
  aPrice: at("20", 19), // 20.14
  aGana: at("gana", 21.5), // 21.68 → the join (cut at 20.70)
  aEps: at("10", 22), // 22.36
  aPor: at("por", 23), // 23.36 "por acción"
  aMultiplo: at("múltiplo", 24), // 24.52
  aPU: at("2", 25), // 25.06
  // board "empresaB"
  otra: at("otra"), // 25.68
  bPrice: at("10", 25.5), // 26.04 (said "10"; screen shows figures.ts)
  bGana: at("gana", 26.5), // 26.90
  bEps: at("2", 27), // 27.16
  bMultiplo: at("múltiplo", 28), // 28.44
  bPU: at("50", 28), // 29.04
  // board "compare"
  segunda: at("segunda"), // 32.00
  mas: at("más", 32), // 32.46
  cara: at("cara"), // 32.64
  aunque: at("aunque"), // 33.12
  precioC: at("precio", 33), // 33.42
  contrario: at("contrario"), // 34.26
  // A-roll CTA + board "question"
  comprar: at("comprar"), // 35.76
  baratoEnd: endOf("barato", 38), // 39.36 (pause until "comparado")
  comparado: at("comparado"), // 40.14
  con: at("con", 40), // 40.42
  que: at("qué", 40), // 40.56
  esto: at("esto", 41.5), // 41.90
  vas: at("vas"), // 42.54
  necesitarEnd: endOf("necesitar"),
  // hook
  mas0: at("más"), // 0.50
  dos: at("dos"), // 0.80
  accion: at("acción"), // 3.52
  barata: at("barata"), // 5.30
  inversion: at("inversión"), // 7.64
  precioT: at("precio", 12.7), // 12.88
  comparas: at("comparas"), // 14.24
  estudiando: at("estudiando"), // 1.34
  entender: at("entender"), // 1.96
  utilidades: at("utilidades"), // 14.88
};

// ── Split-screen version (Nick Saraev's grammar, ANALISIS §5/§13): three layouts alternating on
// hard cuts — SPLIT (Pizarra graphic in the top band, face card at the bottom with the head
// breaking out), full BOARD, FACE close-up (text behind the head). ≈ 43 % split / 31 % board /
// 25 % face; a layout change every ~2.4 s on average.
export type SplitSeg = { from: number; to: number } & (
  | { kind: "split"; board: BoardId; band?: boolean }
  | { kind: "board"; board: BoardId }
  | { kind: "face"; punch: boolean }
);
export const SPLIT_SEGS: SplitSeg[] = [
  { kind: "split", board: "hook", from: 0, to: T.una },
  { kind: "face", punch: true, from: T.una, to: T.buena },
  { kind: "split", board: "buena", from: T.buena, to: T.todo },
  { kind: "board", board: "precio", from: T.todo, to: T.pero },
  { kind: "face", punch: false, from: T.pero, to: T.si },
  { kind: "split", board: "compara", from: T.si, to: T.ahi },
  { kind: "board", board: "formula", from: T.ahi, to: T.porEjemplo },
  { kind: "split", board: "empresaA", band: true, from: T.porEjemplo, to: T.siOtra },
  { kind: "board", board: "empresaB", from: T.siOtra, to: T.donde },
  { kind: "board", board: "compare", from: T.donde, to: at("aunque") },
  { kind: "split", board: "compare", band: true, from: at("aunque"), to: T.antes },
  { kind: "face", punch: false, from: T.antes, to: T.preguntate },
  { kind: "face", punch: true, from: T.preguntate, to: T.barato },
  { kind: "split", board: "question", band: true, from: T.barato, to: T.guarda },
  { kind: "face", punch: false, from: T.guarda, to: T.end },
];
export const splitSegAt = (frame: number): SplitSeg => SPLIT_SEGS.find((s) => frame >= s.from && frame < s.to) ?? SPLIT_SEGS[SPLIT_SEGS.length - 1];
