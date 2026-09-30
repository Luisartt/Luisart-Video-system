import { FORMATS, ZONES, type FormatName } from "./formats";

// Where a caption line may go (user rules 2026-09-27, CHANNEL.md ★):
//  • no face on screen → the caption zone (vertical y 1000–1300, x 120–900; horizontal y 820–970);
//  • over a face shot, never on the forehead, eyes or mouth, always inside the safe area, in this
//    order: (1) between the neck and the chest, just under the chin (medium shots); (2) above the
//    head (close selfies, where the chest is under the platform UI); (3) the nearest spot to the
//    caption zone that clears the face;
//  • returns null when nothing fits (the caller then reframes the shot or drops the caption).
// Shared by the Pizarra `captions` element and the per-video edits.

export type FaceBox = { x0: number; y0: number; x1: number; y1: number };

const MARGIN = 36;
const FOREHEAD = 0.25; // detector boxes start near the brows: extend up by a quarter of the height

export const captionRect = (cy: number, text: string, size: number, fmt: FormatName = "vertical"): FaceBox => {
  const cap = ZONES[fmt].captions;
  const w = Math.min(cap.w, Math.round(Array.from(text).length * size * 0.56) + 24);
  const h = Math.round(size * 1.3);
  const cx = cap.x + cap.w / 2;
  return { x0: cx - w / 2, x1: cx + w / 2, y0: cy - h / 2, y1: cy + h / 2 };
};

/** Protected area for a detected face box: forehead + eyes + mouth, grown by a margin. */
export const protectFace = (f: FaceBox): FaceBox => ({
  x0: f.x0 - MARGIN,
  x1: f.x1 + MARGIN,
  y0: f.y0 - (f.y1 - f.y0) * FOREHEAD - MARGIN,
  y1: f.y1 + MARGIN,
});

const overlaps = (a: FaceBox, b: FaceBox) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

/** Preferred line centre inside the caption zone (lower part of the band). */
export const preferredCaptionY = (fmt: FormatName = "vertical") => {
  const cap = ZONES[fmt].captions;
  return fmt === "vertical" ? cap.y + cap.h - 50 : cap.y + cap.h / 2;
};

/** Line centre nearest the caption zone that clears `face` (null face = the preferred spot). */
export const captionSpot = (face: FaceBox | null, text: string, size: number, fmt: FormatName = "vertical"): number | null => {
  const pref = preferredCaptionY(fmt);
  if (!face) return pref;
  const f = FORMATS[fmt];
  const cap = ZONES[fmt].captions;
  const guard = protectFace(face);
  const h = Math.round(size * 1.3);
  const lo = f.safe.top + h / 2;
  const hi = f.height - f.safe.bottom - h / 2;
  const bandLo = cap.y + h / 2;
  const bandHi = cap.y + cap.h - h / 2;
  const dist = (cy: number) => (cy < bandLo ? bandLo - cy : cy > bandHi ? cy - bandHi : Math.abs(cy - pref) / 1000);
  const fits = (cy: number) => cy >= lo && cy <= hi && !overlaps(captionRect(cy, text, size, fmt), guard);
  // (1) neck / chest: just under the chin
  const neck = Math.round(guard.y1 + h / 2 + 6);
  if (fits(neck)) return neck;
  // (2) above the head: clear of the hair (≈ half a face height above the brows)
  const head = Math.round(Math.max(lo, face.y0 - (face.y1 - face.y0) * 0.5 - MARGIN - h / 2));
  if (fits(head)) return head;
  // (3) nearest to the caption zone
  const candidates: number[] = [];
  for (let cy = Math.ceil(lo); cy <= hi; cy += 4) candidates.push(cy);
  candidates.sort((a, b) => dist(a) - dist(b));
  for (const cy of candidates) if (!overlaps(captionRect(cy, text, size, fmt), guard)) return cy;
  return null;
};
