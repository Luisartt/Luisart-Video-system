import { AbsoluteFill, useVideoConfig } from "remotion";

// Horizontal (YouTube) and vertical (Shorts / Reels / TikTok) canvases with their safe areas.
// Vertical safe area is the union of TikTok (top 130, bottom 484, right 140), Reels
// (top 220, bottom 430, sides 130) and Shorts (top 110, bottom 420, sides 140) guidance
// gathered 2026-09-27, rounded up: keep text, faces and logos inside it.
export type FormatName = "horizontal" | "vertical";

export type Safe = { top: number; right: number; bottom: number; left: number };

export const FORMATS: Record<FormatName, { width: number; height: number; fps: number; safe: Safe }> = {
  horizontal: { width: 1920, height: 1080, fps: 30, safe: { top: 90, right: 140, bottom: 110, left: 140 } },
  vertical: { width: 1080, height: 1920, fps: 30, safe: { top: 250, right: 160, bottom: 484, left: 120 } },
};

// Where things go inside the safe area (user rule, 2026-09-27; reference image in
// media/soyluisart/automated-research/style-refs/safe-zones/). Captions sit in a band just
// below the middle of the frame, above the Reels/TikTok caption + username block and left of
// the like/comment/share column. Animations and board content live above that band, so the
// two never overlap and neither lands under the platform UI.
export type Box = { x: number; y: number; w: number; h: number };
export const ZONES: Record<FormatName, { graphics: Box; captions: Box }> = {
  vertical: {
    graphics: { x: 120, y: 250, w: 800, h: 720 }, // y 250–970
    captions: { x: 120, y: 1000, w: 780, h: 300 }, // y 1000–1300, clear of the right icon column
  },
  horizontal: {
    graphics: { x: 140, y: 90, w: 1640, h: 700 }, // y 90–790
    captions: { x: 240, y: 820, w: 1440, h: 150 }, // y 820–970
  },
};

// Layout info for the current composition: which format it is, its safe box, and a scale factor
// relative to the horizontal design (vertical is 1080 wide, so type designed at 1920 wide × 0.75
// usually reads right on a phone).
export const useFormat = () => {
  const { width, height } = useVideoConfig();
  const name: FormatName = height > width ? "vertical" : "horizontal";
  const f = FORMATS[name];
  const safe = f.safe;
  return {
    name,
    isVertical: name === "vertical",
    width,
    height,
    safe,
    safeBox: { x: safe.left, y: safe.top, w: width - safe.left - safe.right, h: height - safe.top - safe.bottom },
    scale: name === "vertical" ? 0.75 : 1,
    zones: ZONES[name],
  };
};

// Preview-only overlay (never render it into deliverables): shades the areas the platform UI covers.
export const SafeZoneGuide: React.FC = () => {
  const { width, height, safe, zones } = useFormat();
  const shade = "rgba(255,0,80,0.28)";
  const outline = (b: Box, color: string) => (
    <div style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h, border: `4px dashed ${color}` }} />
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {outline(zones.graphics, "rgba(0,120,255,0.8)")}
      {outline(zones.captions, "rgba(255,200,0,0.9)")}
      <div style={{ position: "absolute", left: 0, top: 0, width, height: safe.top, background: shade }} />
      <div style={{ position: "absolute", left: 0, bottom: 0, width, height: safe.bottom, background: shade }} />
      <div style={{ position: "absolute", left: 0, top: safe.top, width: safe.left, height: height - safe.top - safe.bottom, background: shade }} />
      <div style={{ position: "absolute", right: 0, top: safe.top, width: safe.right, height: height - safe.top - safe.bottom, background: shade }} />
    </AbsoluteFill>
  );
};
