import { counterTiming } from "../../../../styles/kallaway/Counter";
import { cue, licensesOf } from "../cues";
import { A, B, money, num, pu } from "../figures";
import type { Cue } from "../Sound";
import { SECTION_CUTS, T, W } from "./layout";

// Kallaway sound design (ANALISIS §S.6, user decision 2026-09-28): he is almost silent, so the
// edit is too. Only (1) a click on the cut that opens each section — his signature — alternating
// two click files, and (2) at most ONE subtle sound per image or counter event (the headline over
// the first image, each stacked card, the typed white screen, each kinetic shot's sliding figure,
// each counter settling). Nothing on plain
// cuts, image swaps inside the split, captions or the giant words. ZERO whooshes (the channel's
// whoosh-at-start rule does not apply to this style). No music (no file from the user).

const len = (s: string) => Array.from(s).length;

const SECTION: Cue[] = SECTION_CUTS.map((f, i) =>
  i % 2 === 0 ? cue(`section cut · click ${i + 1}`, f, "ui/ui-click-tone-01.wav", 0.35, { max: 8 }) : cue(`section cut · click ${i + 1}`, f, "ui/ui-click-mouse-close-06.wav", 0.4, { max: 8 }),
);

// The counter figure settles 4 f before the word that names it (Kallaway spec); its sound lands on
// that visual settle, not on the word (sound rule: the hit lands on the frame the visual lands).
const settle = (name: string, land: number) => cue(name, counterTiming(land).end, "data/data-bleep-confirm-03.wav", 0.3, { max: 16 });

export const KAL_CUES: Cue[] = [
  // Hook headline slides in on frame 0 (an element sliding, not a transition: no whoosh)
  cue("hook headline slides in", 0, "ui/ui-swipe-right-01.wav", 0.28, { max: 18 }),
  ...SECTION,
  // Stack: one dry pop per card
  cue("card · el precio", T.si, "pop/pop-dry-03.wav", 0.28, { max: 9 }),
  cue("card · las utilidades", W.utilidades, "pop/pop-dry-03.wav", 0.26, { max: 9 }),
  // White screen: ONE typing bed (the formula line, its longest)
  cue("typed · precio ÷ utilidad", W.precioF, "typing/typing-key-presses-short-02.wav", 0.22, { lead: 0, trim: 12, max: len("precio ÷ utilidad") + 2 }),
  // Empresa A: ONE sound for the kinetic shot (the price figure slides in), one for the counter
  cue(`A · ${money(A.price)} slides in`, T.aPrice, "ui/ui-swipe-soft-01.wav", 0.28, { max: 16 }),
  settle(`A · P/U = ${num(pu(A))} settles`, W.aPU),
  // Empresa B
  cue(`B · ${money(B.price)} slides in`, T.bPrice, "ui/ui-swipe-soft-01.wav", 0.28, { max: 16 }),
  settle(`B · P/U = ${num(pu(B))} settles`, W.bPU),
];

export const KAL_CUE_LICENSES = licensesOf(KAL_CUES);
export const KAL_WHOOSHES = KAL_CUES.filter((c) => c.file.includes("/whoosh/")).length;
