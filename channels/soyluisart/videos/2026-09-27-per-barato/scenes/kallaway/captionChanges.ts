// Frames where the Kallaway edit's caption changes (seam caption or giant word), for the Codex review
// contact sheets (luisart-revision-codex → review_frames.py --extra). Run: npx tsx <this file>
import { TOTAL_FRAMES } from "../timing";
import { faceWordAt, seamAt } from "./captions";

const label = (f: number) => {
  const s = seamAt(f);
  if (s) return `seam:${s.text}`;
  const w = faceWordAt(f);
  return w ? `word:${w.unit.text}` : "";
};
const changes: number[] = [];
let prev = "";
let frames = 0;
for (let f = 0; f < TOTAL_FRAMES; f++) {
  const l = label(f);
  if (l) frames++;
  if (l && l !== prev) changes.push(f);
  prev = l;
}
console.log(JSON.stringify({ changes, captionFrames: frames }));
