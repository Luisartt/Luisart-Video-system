import track from "../../../../../../media/soyluisart/automated-research/2026-09-27-per-barato/face-track.json";
import { protectFace, type FaceBox } from "../../../../styles/shared/captionSpot";
import { kalGeometry } from "../../../../styles/kallaway/Layout";
import { type Placement } from "../../../../styles/kallaway/primitives";
import { srcFrameOf } from "../pizarra/captionPlace";
import { SEGS, type KalSeg } from "./layout";

// Face framing for the Kallaway edit, from the per-frame face track (core/scripts/py/face_track.py →
// face-track.json: [x0, y0, x1, y1, eyeY, mouthY, score] in the A-roll's pixels, source frames).
//  • split: the bottom half is STATIC per shot (he never moves it). One placement per split segment
//    (shotPlacement): the face ≈ 230 px wide, its highest forehead just under the seam caption
//    (y ≈ 1082) so the caption never touches it, and its lowest mouth above the platform UI.
//  • face: the recording at 92 %, anchored at the bottom centre (static: no punch-in, no push).

const FRAMES = (track as { frames: number[][] }).frames;
const G = kalGeometry(true);

/** Face box (brows → chin) in source px at a cut frame. */
export const faceSrc = (cutFrame: number): FaceBox => {
  const [x0, y0, x1, y1] = FRAMES[srcFrameOf(cutFrame)];
  return { x0, y0, x1, y1 };
};
/** Mouth y in source px at a cut frame. */
export const mouthSrc = (cutFrame: number) => FRAMES[srcFrameOf(cutFrame)][5];

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

/** Lowest the mouth may go on a split shot (the platform UI starts at y 1436). */
export const MOUTH_MAX = 1430;

/**
 * Static placement of one split shot: the face ≈ 230 px wide (median width), centred on x 540, the
 * HIGHEST protected top of the shot (forehead + 36 px) at y 1082 — just under the seam caption — and
 * scaled down a little more when needed so the LOWEST mouth of the shot stays above y 1430.
 */
const shotPlacement = (a: number, b: number): Placement => {
  const frames = Array.from({ length: Math.max(1, b - a) }, (_, i) => a + i);
  const boxes = frames.map(faceSrc);
  const w = median(boxes.map((f) => f.x1 - f.x0));
  const cx = median(boxes.map((f) => (f.x0 + f.x1) / 2));
  const ptop = Math.min(...boxes.map((f) => f.y0 - 0.25 * (f.y1 - f.y0))); // highest forehead (source px)
  const mouth = Math.max(...frames.map(mouthSrc)); // lowest mouth (source px)
  const t = G.splitFace;
  const top = t.protTop + 36; // screen y of the protected top before the 36 px margin
  const s = Math.min(t.faceW / w, (MOUTH_MAX - top) / (mouth - ptop));
  return { s, tx: t.cx - cx * s, ty: top - ptop * s };
};

/** Median face box of a shot (source px): centre of the oval vignette and of the backlight. */
const shotFace = (a: number, b: number): FaceBox => {
  const boxes = Array.from({ length: Math.max(1, b - a) }, (_, i) => faceSrc(a + i));
  const m = (k: keyof FaceBox) => median(boxes.map((f) => f[k]));
  return { x0: m("x0"), y0: m("y0"), x1: m("x1"), y1: m("y1") };
};

const PLACE = new Map<KalSeg, Placement>();
const SHOT_FACE = new Map<KalSeg, FaceBox>();
for (const s of SEGS)
  if (s.kind === "split") {
    PLACE.set(s, shotPlacement(s.from, s.to));
    SHOT_FACE.set(s, shotFace(s.from, s.to));
  }

/** The split shot's median face box (source px). */
export const shotFaceOf = (s: KalSeg): FaceBox => SHOT_FACE.get(s) ?? shotFace(s.from, s.to);

const FACE_PLACE = G.facePlace({ x0: 0, y0: 0, x1: 1, y1: 1 });

/** Placement of the recording for a segment (split: per shot; face: 92 % from the bottom centre). */
export const placementOf = (s: KalSeg): Placement => PLACE.get(s) ?? FACE_PLACE;

/** The face box on screen at a frame of segment `s`. */
export const faceOnScreen = (frame: number, s: KalSeg): FaceBox => {
  const p = placementOf(s);
  const f = faceSrc(frame);
  return { x0: f.x0 * p.s + p.tx, y0: f.y0 * p.s + p.ty, x1: f.x1 * p.s + p.tx, y1: f.y1 * p.s + p.ty };
};

/** A face box whose protected area (styles/shared/captionSpot.ts → protectFace: +25 % up, +36 px)
 *  is the union of the per-frame protected areas over [a, b) of segment `s` — for a word shown that
 *  long (a union of raw boxes would over-grow the forehead when the head moves up and down). */
export const faceUnion = (a: number, b: number, s: KalSeg): FaceBox => {
  let u: FaceBox | null = null;
  for (let f = a; f < Math.max(a + 1, b); f++) {
    const x = protectFace(faceOnScreen(f, s));
    u = u ? { x0: Math.min(u.x0, x.x0), y0: Math.min(u.y0, x.y0), x1: Math.max(u.x1, x.x1), y1: Math.max(u.y1, x.y1) } : x;
  }
  const y1 = u!.y1 - 36;
  return { x0: u!.x0 + 36, x1: u!.x1 - 36, y1, y0: (u!.y0 + 36 + 0.25 * y1) / 1.25 };
};
