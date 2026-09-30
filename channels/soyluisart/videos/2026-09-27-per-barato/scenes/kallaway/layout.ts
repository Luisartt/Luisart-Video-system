import { genImage } from "../../../../styles/kallaway/primitives";
import { TOTAL_FRAMES, at } from "../timing";

// Kallaway edit of the same cut (ANALISIS § Spec; user decisions 2026-09-28). Every boundary is a
// transcript word (source seconds → cut frame through timing.ts); nothing is hard-coded.
// Layouts (hard cuts only, no transitions, no punch-ins):
//   split  ChatGPT image on top (slow push), the face below on the dark set, seam captions
//   face   close-up on the dark set, ONE giant word per spoken word
//   stack  two image cards, one per word · white  the typed P/U formula
//   full   an image full frame with kinetic type
// The counters sit in the split's top half. Target mix (spec): split 45–55 %, face 25–30 %, rest
// 20–25 %; a new image every ~1.5–2 s inside the split.

export const IMG = {
  llave: genImage("s01-hook-llave-etiqueta"),
  estudio: genImage("s02-dos-anos-estudio"),
  oferta: genImage("s03-barata-oferta"),
  caja: genImage("s04-precio-vs-utilidades"),
  maquina: genImage("s05-maquina-de-utilidades"),
  empresaA: genImage("s06-empresa-a-modesta-rica"),
  empresaB: genImage("s07-empresa-b-lujosa-vacia"),
  frascos: genImage("s08-frascos"),
  balanza: genImage("s09-mas-cara-balanza"),
  pedestales: genImage("s10-comparado-con-que"),
  lupa: genImage("s11-neon-lupa"),
} as const;

// Cut points (frames).
export const T = {
  estudiando: at("estudiando"), // 1.34  image 2 of the hook
  y: at("y", 2.9), // 2.92  "y es que una acción…" → first face (section click)
  barata: at("barata"), // 5.30
  buena: at("buena"), // 7.44
  aqui: at("aquí"), // 8.20  "Aquí te explico por qué"
  todo: at("todo"), // 9.56  "Todo el mundo ve el precio…"
  ah: at("ah"), // 10.94 "ah, está regalada"
  pero: at("pero"), // 12.56 turn (section click)
  si: at("si", 13.8), // 13.88 "si no lo comparas con las utilidades…"
  ahi: at("ahí"), // 16.58 "Ahí entra el múltiplo…"
  porEjemplo: at("por", 19), // 19.06
  aPrice: at("20", 19), // 20.14 "vale 20 pesos"
  aSu: at("su", 24), // 22.80 "su múltiplo es 2"
  siOtra: at("si", 25.3), // 24.10 "Si otra vale…"
  bPrice: at("10", 25.5), // 24.74 (said "10"; the screen shows figures.ts)
  bSu: at("su", 27.5), // 26.64 "su múltiplo es 50"
  donde: at("donde"), // 29.02 (section click)
  mas: at("más", 32), // 31.16 "más cara"
  aunque: at("aunque"), // 31.82
  antes: at("antes"), // 34.02 (section click)
  porque: at("porque"), // 35.30
  preguntate: at("pregúntate"), // 36.34
  barato: at("barato", 38), // 37.08 "¿barato comparado con qué?"
  guarda: at("guarda"), // 39.92 (section click)
  end: TOTAL_FRAMES,
};

// Word frames things land on.
export const W = {
  utilidades: at("utilidades"), // 14.88 stack card 2
  multiplo: at("múltiplo", 17), // 17.20 "P/U" typed
  precioF: at("precio", 17.5), // 17.74 "precio ÷ utilidad" typed
  aGana: at("gana", 21.5), // 20.70 (the join)
  aEps: at("10", 22), // 21.06
  aPor: at("por", 23), // 22.06
  aPU: at("2", 25), // 23.76
  bGana: at("gana", 26.5), // 25.60
  bEps: at("2", 27), // 25.86
  bPU: at("50", 28), // 27.74
};

export type KalSeg = { from: number; to: number } & (
  | { kind: "split"; image: string; title?: boolean; counter?: "A" | "B"; position?: string }
  | { kind: "face" }
  | { kind: "stack" }
  | { kind: "white" }
  | { kind: "full"; image: string; kinetic: "A" | "B"; position?: string }
);

export const SEGS: KalSeg[] = [
  { kind: "split", image: IMG.llave, title: true, from: 0, to: T.estudiando },
  { kind: "split", image: IMG.estudio, title: true, from: T.estudiando, to: T.y },
  { kind: "face", from: T.y, to: T.barata },
  { kind: "split", image: IMG.pedestales, from: T.barata, to: T.buena },
  { kind: "face", from: T.buena, to: T.aqui },
  { kind: "split", image: IMG.lupa, from: T.aqui, to: T.todo },
  { kind: "split", image: IMG.llave, from: T.todo, to: T.ah, position: "30% 60%" },
  { kind: "split", image: IMG.oferta, from: T.ah, to: T.pero },
  { kind: "face", from: T.pero, to: T.si },
  { kind: "stack", from: T.si, to: T.ahi },
  { kind: "white", from: T.ahi, to: T.porEjemplo },
  { kind: "split", image: IMG.empresaA, from: T.porEjemplo, to: T.aPrice, position: "50% 55%" },
  { kind: "full", image: IMG.empresaA, kinetic: "A", from: T.aPrice, to: T.aSu, position: "50% 50%" },
  { kind: "split", image: IMG.empresaA, counter: "A", from: T.aSu, to: T.siOtra, position: "50% 62%" },
  { kind: "split", image: IMG.empresaB, from: T.siOtra, to: T.bPrice, position: "50% 60%" },
  { kind: "full", image: IMG.empresaB, kinetic: "B", from: T.bPrice, to: T.bSu, position: "50% 50%" },
  { kind: "split", image: IMG.empresaB, counter: "B", from: T.bSu, to: T.donde, position: "50% 68%" },
  { kind: "split", image: IMG.frascos, from: T.donde, to: T.mas, position: "50% 60%" },
  { kind: "face", from: T.mas, to: T.aunque },
  { kind: "split", image: IMG.balanza, from: T.aunque, to: T.antes },
  { kind: "face", from: T.antes, to: T.porque },
  { kind: "split", image: IMG.oferta, from: T.porque, to: T.preguntate },
  { kind: "face", from: T.preguntate, to: T.barato },
  { kind: "split", image: IMG.pedestales, from: T.barato, to: T.guarda },
  { kind: "face", from: T.guarda, to: T.end },
];

export const segAt = (frame: number): KalSeg => SEGS.find((s) => frame >= s.from && frame < s.to) ?? SEGS[SEGS.length - 1];
export const segIndex = (s: KalSeg) => SEGS.indexOf(s);

/** Cuts that open a section: Kallaway's only recurring sound (a click, max ~1 per 5 s). */
export const SECTION_CUTS = [T.y, T.pero, T.donde, T.antes, T.guarda];

/** Emphasis words of the face shots (≤ 1 every ~5 s): Playfair Italic / light blue / red. */
export const EMPHASIS = {
  serif: ["inversión", "nada", "pregúntate"],
  key: ["acción", "necesitar"],
  alert: ["cara"],
};

/** Layout share of the runtime (for the BRIEF). */
export const layoutShare = () => {
  const acc: Record<string, number> = {};
  for (const s of SEGS) {
    const k = s.kind === "split" || s.kind === "face" ? s.kind : "full/stack/white";
    acc[k] = (acc[k] ?? 0) + (s.to - s.from);
  }
  return Object.fromEntries(Object.entries(acc).map(([k, v]) => [k, Math.round((1000 * v) / TOTAL_FRAMES) / 10]));
};
