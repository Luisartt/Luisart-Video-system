// Caption + framing checks for the Kallaway edit (run: npx tsx <this file>). Per frame, with the
// REAL gates of KalShort: seam captions and giant words shown, any caption on a stack / white /
// kinetic shot (must be 0), any seam caption while the top shows text repeating the speech (must be
// 0), any caption touching the protected face — detector box + 25 % up for the forehead + 36 px —
// (must be 0), and where the split framing puts the mouth and chin (platform UI starts at y 1436).
import { captionRect, protectFace } from "../../../../styles/shared/captionSpot";
import { kal } from "../../../../styles/kallaway/theme";
import { TOTAL_FRAMES } from "../timing";
import { SEAM_POS, SPEECH_TEXT_WINDOWS, faceWordAt, seamAt } from "./captions";
import { faceOnScreen, faceSrc, mouthSrc, placementOf } from "./faces";
import { KAL_CUES, KAL_WHOOSHES } from "./kalCues";
import { SEGS, layoutShare, segAt } from "./layout";

type B = { x0: number; y0: number; x1: number; y1: number };
const hit = (a: B, b: B) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const seamRect = (text: string): B => {
  const size = kal.size.seam;
  const w = Array.from(text).length * size * 0.56 + 24;
  const h = size * 1.3;
  return { x0: SEAM_POS.cx - w / 2, x1: SEAM_POS.cx + w / 2, y0: SEAM_POS.cy - h / 2, y1: SEAM_POS.cy + h / 2 };
};

let seam = 0;
let words = 0;
let onGraphic = 0;
let onSpeechText = 0;
let touch = 0;
const wordYs: number[] = [];
const touches: string[] = [];
for (let f = 0; f < TOTAL_FRAMES; f++) {
  const s = segAt(f);
  const guard = protectFace(faceOnScreen(f, s));
  const u = seamAt(f);
  const w = faceWordAt(f);
  if ((u || w) && s.kind !== "split" && s.kind !== "face") onGraphic++;
  if (u) {
    seam++;
    if (SPEECH_TEXT_WINDOWS.some(([a, b]) => f >= a && f < b)) onSpeechText++;
    if (hit(seamRect(u.text), guard)) {
      touch++;
      touches.push(`f${f} seam "${u.text}"`);
    }
  }
  if (w) {
    words++;
    wordYs.push(w.cy);
    if (hit(captionRect(w.cy, w.unit.text, w.unit.tone === "serif" ? w.size * 1.06 : w.size, "vertical"), guard)) {
      touch++;
      touches.push(`f${f} word "${w.unit.text}"`);
    }
  }
}
wordYs.sort((a, b) => a - b);
console.log(`seam caption frames ${seam} · giant-word frames ${words} · on stack/white/kinetic ${onGraphic} · seam while the top repeats the speech ${onSpeechText} · touching the face ${touch}`);
if (touches.length) console.log("  touches:", touches.slice(0, 20).join(", "));
console.log(`giant word line centre y ${wordYs[0] ?? "-"}–${wordYs[wordYs.length - 1] ?? "-"}`);

// Split framing: face width, protected top, mouth and chin per split shot.
for (const s of SEGS) {
  if (s.kind !== "split") continue;
  const p = placementOf(s);
  let top = Infinity;
  let mouth = -Infinity;
  let chin = -Infinity;
  for (let f = s.from; f < s.to; f++) {
    const fb = faceOnScreen(f, s);
    top = Math.min(top, protectFace(fb).y0);
    mouth = Math.max(mouth, mouthSrc(f) * p.s + p.ty);
    chin = Math.max(chin, fb.y1);
  }
  const fw = (faceSrc(s.from).x1 - faceSrc(s.from).x0) * p.s;
  console.log(
    `split ${(s.from / 30).toFixed(2)}–${(s.to / 30).toFixed(2)} s: scale ${p.s.toFixed(3)} · face ≈ ${Math.round(fw)} px wide · protected top ≥ ${Math.round(top)} · mouth ≤ ${Math.round(mouth)} · chin ≤ ${Math.round(chin)}`,
  );
}
console.log("layout share %:", JSON.stringify(layoutShare()), `· shots ${SEGS.length} (${((SEGS.length - 1) / (TOTAL_FRAMES / 30 / 60)).toFixed(0)} layout/image changes per min)`);
console.log(`cues ${KAL_CUES.length} · whooshes ${KAL_WHOOSHES}`);
for (const c of KAL_CUES) console.log(`  ${(c.at / 30).toFixed(2)} s (f${c.at}) ${c.file.replace("soyluisart/audio/efectos/", "")} · ${c.name} · ${c.vol}`);
