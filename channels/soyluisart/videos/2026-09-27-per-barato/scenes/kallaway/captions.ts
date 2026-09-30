import { faceWordSpot, faceWordUnits, seamUnits, type Unit, type Word } from "../../../../styles/kallaway/Captions";
import { kalGeometry } from "../../../../styles/kallaway/Layout";
import { B, num, pu } from "../figures";
import { FPS, TOTAL_FRAMES, WORDS, findWord, isKept, srcToCut } from "../timing";
import { faceUnion } from "./faces";
import { EMPHASIS, SEGS, segAt, type KalSeg } from "./layout";

// Captions of the Kallaway edit (user decision 2026-09-28, a style-specific exception to rule a):
//  • split shots: continuous seam captions (~2 words, 46 px) just under the seam, even with the
//    image on top — EXCEPT while the top half shows text that repeats the speech (the P/U counters);
//  • face shots: ONE giant word per spoken word, face-aware (above the head on this close selfie);
//  • stack / white screen / kinetic type: no caption (their text IS the speech).
// Never over the face (checked per frame by checkCaptions.ts). No sound on captions.

/** Display fixes: Whisper wrote ".50."; company B's price shows the figure in figures.ts. The
 *  trailing punctuation is kept (the caption blocks break on it; the display strips it). */
const FIX = new Map<number, string>([
  [findWord("50", { after: 28 }).i, `${num(pu(B))}.`],
  [findWord("10", { after: 25.5 }).i, String(B.price)],
]);

/** Kept words in CUT seconds, with the display fixes. */
export const CUT_WORDS: Word[] = WORDS.filter((w) => isKept((w.start + w.end) / 2)).map((w) => ({
  text: FIX.get(w.i) ?? w.text.replace(/^\.+/, ""),
  start: srcToCut(w.start),
  end: srcToCut(w.end),
}));

/** Windows where the top half shows text that repeats the speech: no seam caption there. */
export const SPEECH_TEXT_WINDOWS = SEGS.filter((s) => s.kind === "split" && s.counter).map((s) => [s.from, s.to] as const);

const MIN_SHOW = 8; // frames: a seam caption never flashes shorter than this at a cut

const SEAM = seamUnits(CUT_WORDS, FPS);
const FACE = faceWordUnits(CUT_WORDS, FPS, EMPHASIS);

const allowedSeam = (f: number) => segAt(f).kind === "split" && !SPEECH_TEXT_WINDOWS.some(([a, b]) => f >= a && f < b);

/** Per frame: which seam unit shows (runs < MIN_SHOW frames are dropped). */
const SEAM_AT: (Unit | null)[] = (() => {
  const out: (Unit | null)[] = new Array(TOTAL_FRAMES + 1).fill(null);
  for (const u of SEAM) {
    let f = u.from;
    while (f < u.to) {
      if (!allowedSeam(f)) {
        f++;
        continue;
      }
      let e = f;
      while (e < u.to && allowedSeam(e) && segAt(e) === segAt(f)) e++;
      if (e - f >= MIN_SHOW) for (let k = f; k < e && k <= TOTAL_FRAMES; k++) out[k] = u;
      f = e;
    }
  }
  return out;
})();

export type FaceWordShow = { unit: Unit; cy: number; size: number; seg: KalSeg };

/** Per frame: which giant word shows on a face shot, and where (fixed for the whole word). */
const FACE_AT: (FaceWordShow | null)[] = (() => {
  const out: (FaceWordShow | null)[] = new Array(TOTAL_FRAMES + 1).fill(null);
  for (const s of SEGS) {
    if (s.kind !== "face") continue;
    for (const u of FACE) {
      const a = Math.max(u.from, s.from);
      const b = Math.min(u.to, s.to);
      if (b <= a) continue;
      const spot = faceWordSpot(faceUnion(a, b, s), u.text, u.tone, "vertical");
      if (spot.cy === null) throw new Error(`no room for the giant word "${u.text}" at frame ${a}`);
      for (let k = a; k < b; k++) out[k] = { unit: u, cy: spot.cy, size: spot.size, seg: s };
    }
  }
  return out;
})();

export const seamAt = (f: number) => SEAM_AT[f] ?? null;
export const faceWordAt = (f: number) => FACE_AT[f] ?? null;
export const SEAM_POS = kalGeometry(true).seamCaption;
