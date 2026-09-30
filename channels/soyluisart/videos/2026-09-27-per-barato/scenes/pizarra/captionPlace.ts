import track from "../../../../../../media/soyluisart/automated-research/2026-09-27-per-barato/face-track.json";
import { captionRect, captionSpot, preferredCaptionY, protectFace, type FaceBox } from "../../../../styles/shared/captionSpot";
import { SEGMENTS } from "../timing";

// Face-aware caption placement for this edit (user rule, 2026-09-27): a caption never covers the
// face (forehead, eyes, mouth). The face box of every A-roll frame comes from
// core/scripts/py/face_track.py (MTCNN, smoothed) → face-track.json, in the A-roll's own pixels
// and source frames. For a caption we map the box through the cut and the shot's transform
// (punch / push-in / card) and ask the shared `captionSpot()` (styles/shared/captionSpot.ts) for
// the line nearest the caption zone that clears it — the zone is a preference, the face overrides
// it (usually: above the head). If nothing fits, the shot is reframed (zoomed out a little).

type Box = FaceBox;
const FRAMES = (track as { frames: number[][] }).frames;
export const CAPTION_PREF_CY = preferredCaptionY("vertical"); // 1250

/** Cut frame → A-roll source frame (through the keep list). */
export const srcFrameOf = (cutFrame: number) => {
  const s = SEGMENTS.find((x) => cutFrame >= x.cutFrom && cutFrame < x.cutFrom + x.frames) ?? SEGMENTS[SEGMENTS.length - 1];
  return Math.min(FRAMES.length - 1, s.srcIn + (cutFrame - s.cutFrom));
};

/** Face box (brows → chin, from the detector) in the A-roll's own pixels at a cut frame. */
export const faceBoxSrc = (cutFrame: number): Box => {
  const [x0, y0, x1, y1] = FRAMES[srcFrameOf(cutFrame)];
  return { x0, y0, x1, y1 };
};

/** Screen transform of the A-roll: uniform scale `s` about `origin`, then a shift. */
export type ShotTransform = { s: number; origin: [number, number]; shift?: [number, number] };
const mapBox = (b: Box, t: ShotTransform): Box => {
  const [ox, oy] = t.origin;
  const [dx, dy] = t.shift ?? [0, 0];
  const f = (x: number, y: number) => [ox + (x - ox) * t.s + dx, oy + (y - oy) * t.s + dy];
  const [x0, y0] = f(b.x0, b.y0);
  const [x1, y1] = f(b.x1, b.y1);
  return { x0, y0, x1, y1 };
};

/** Nearest line centre to the caption zone that doesn't touch the face (forehead included), or null. */
export const placeCaption = (face: Box, text: string, size = 56): number | null => captionSpot(face, text, size, "vertical");

/**
 * Caption position + reframe for a face shot: tries the shot as framed, then zooms out in 4 %
 * steps (down to 80 %) around the same origin until a caption position clears the face.
 */
export const faceAwareCaption = (cutFrame: number, text: string, shot: ShotTransform, size = 56): { cy: number; zoom: number } => {
  const src = faceBoxSrc(cutFrame);
  for (let zoom = 1; zoom >= 0.8; zoom -= 0.04) {
    const cy = placeCaption(mapBox(src, { ...shot, s: shot.s * zoom }), text, size);
    if (cy !== null) return { cy, zoom };
  }
  return { cy: 250 + size, zoom: 0.8 };
};

/**
 * Horizontal edit: the vertical recording sits in a centred panel (sheet scaled by `panel.scale`,
 * shifted to `panel.left`). Same search, with the horizontal zones and safe area.
 */
export const faceBoxH = (cutFrame: number, S: number, panel: { left: number; scale: number }): Box => {
  const k = panel.scale * S;
  return mapBox(faceBoxSrc(cutFrame), { s: k, origin: [0, 0], shift: [panel.left + panel.scale * 540 * (1 - S), panel.scale * 1920 * 0.38 * (1 - S)] });
};
export const faceAwareCaptionH = (cutFrame: number, text: string, S: number, panel: { left: number; scale: number }, size = 52): { cy: number; zoom: number } => {
  for (let zoom = 1; zoom >= 0.8; zoom -= 0.04) {
    const cy = captionSpot(faceBoxH(cutFrame, S * zoom, panel), text, size, "horizontal");
    if (cy !== null) return { cy, zoom };
  }
  return { cy: 90 + size, zoom: 0.8 };
};
export const captionBoxH = (cy: number, text: string, size: number) => captionRect(cy, text, size, "horizontal");

/** For checks: the face box on screen for a shot, and the protected area / caption rectangle. */
export const faceBoxOnScreen = (cutFrame: number, shot: ShotTransform) => mapBox(faceBoxSrc(cutFrame), shot);
export const protectedBox = protectFace;
export const captionBox = (cy: number, text: string, size: number) => captionRect(cy, text, size, "vertical");
