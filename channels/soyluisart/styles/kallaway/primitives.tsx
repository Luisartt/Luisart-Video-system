import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { z } from "zod";
import { CHROMA_GREEN } from "../shared/GreenScreen";
import { SafeZoneGuide, useFormat } from "../shared/formats";
import { SfxCue } from "../shared/sfx";
import { KalSfxKind, alpha, kal } from "./theme";

export { useFormat };
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ── Shared schema ──────────────────────────────────────────────────────────────────────────────
export const backingField = z
  .enum(["green", "black", "white", "transparent"])
  .describe("green = #00FF00 for chroma key (overlays) · black = layouts and image elements · white = the white screen · transparent = alpha render");
export const baseSchema = z.object({
  backing: backingField,
  seconds: z.number().min(1).max(20).describe("Clip length. Kallaway elements have no exit: they end with the cut"),
  sfx: z.boolean().describe("Bake the element's sound (theme.ts → sfx). Kallaway is almost silent: one subtle sound per event at most"),
  safeGuide: z.boolean().describe("Studio preview only: shade the areas the platform UI covers. Keep off for renders"),
});
export type BaseProps = z.infer<typeof baseSchema>;
export type Variant<P> = { id: string; props: P; horizontal?: boolean };
export const base = (backing: BaseProps["backing"], seconds: number): BaseProps => ({ backing, seconds, sfx: true, safeGuide: false });

// ── Test media for the showcases (the user's test recording + the P/U images) ──────────────────
export const TEST_MEDIA = "soyluisart/automated-research/2026-09-27-per-barato";
export const TEST_AROLL = `${TEST_MEDIA}/aroll-1080x1920.mp4`;
export const TEST_MATTE = `${TEST_MEDIA}/aroll-person-alpha-v2.webm`;
export const GEN = `${TEST_MEDIA}/kallaway-gen`;
export const genImage = (name: string) => `${GEN}/${name}.png`;
/** Face box of the test take around 0.5–3 s (face-track.json, source px): brows → chin. */
export const TEST_FACE: FaceBox = { x0: 262, y0: 718, x1: 790, y1: 1436 };

// ── Stage ─────────────────────────────────────────────────────────────────────────────────────
const BACK: Record<BaseProps["backing"], string> = { green: CHROMA_GREEN, black: kal.color.black, white: kal.color.white, transparent: "transparent" };
export const Stage: React.FC<Pick<BaseProps, "backing" | "safeGuide"> & { children: React.ReactNode }> = ({ backing, safeGuide, children }) => (
  <AbsoluteFill style={{ backgroundColor: BACK[backing] }}>
    {children}
    {safeGuide ? <SafeZoneGuide /> : null}
  </AbsoluteFill>
);

// ── Sound ─────────────────────────────────────────────────────────────────────────────────────
/** One Kallaway sound whose hit lands on frame `at` (theme.ts → sfx; `frames` = bed length). */
export const KSfx: React.FC<{ kind: KalSfxKind; at: number; frames?: number; on?: boolean; volume?: number }> = ({ kind, at, frames, on = true, volume }) => (
  <SfxCue def={kal.sfx[kind]} at={at} frames={frames} on={on} volume={volume} />
);

// ── Text ──────────────────────────────────────────────────────────────────────────────────────
export type WordTone = "plain" | "serif" | "key" | "alert";
/** White text over images / the dark set: shadow (+ halo on the giant word), never a plate. */
export const textOnDark = (tone: WordTone, big = false, outline = 0): React.CSSProperties => {
  const col = tone === "key" ? kal.color.accentBright : tone === "alert" ? kal.color.alert : kal.color.white;
  const halo = tone === "key" ? kal.text.iceHalo : big ? kal.text.halo : null;
  return {
    color: col,
    textShadow: halo ? `${kal.text.shadow}, ${halo}` : kal.text.shadow,
    ...(outline > 0 ? { WebkitTextStroke: `${outline}px ${kal.text.outline}`, paintOrder: "stroke fill" } : {}),
  };
};
/** Font for a tone: Inter 700 (sans) or Playfair Display Italic 600 (serif). */
export const toneFont = (tone: WordTone, size: number): React.CSSProperties =>
  tone === "serif"
    ? { fontFamily: kal.font.serif, fontStyle: "italic", fontWeight: 600, fontSize: size * (kal.size.faceWordSerif / kal.size.faceWord), letterSpacing: "-0.01em" }
    : { fontFamily: kal.font.sans, fontWeight: 700, fontSize: size, letterSpacing: "-0.02em" };

const normWord = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}%$]/gu, "");
/** Tone of a spoken word from the video's emphasis lists (serif / key / alert), else plain. */
export const toneOf = (word: string, lists: { serif?: string[]; key?: string[]; alert?: string[] }): WordTone => {
  const w = normWord(word);
  if (lists.alert?.some((x) => normWord(x) === w)) return "alert";
  if (lists.key?.some((x) => normWord(x) === w)) return "key";
  if (lists.serif?.some((x) => normWord(x) === w)) return "serif";
  return "plain";
};
/** Largest size ≤ `max` at which `text` fits `width` (Inter 700 ≈ 0.56 em per char, Playfair ≈ 0.5). */
export const fitSize = (text: string, width: number, max: number, tone: WordTone = "plain") => {
  const em = tone === "serif" ? 0.5 : 0.56;
  return Math.min(max, Math.floor(width / Math.max(1, Array.from(text).length * em)));
};

/** Blinking block caret (accent), 15-frame blink. */
export const Caret: React.FC<{ height: number; color?: string; blink?: boolean }> = ({ height, color = kal.color.accent, blink = true }) => {
  const frame = useCurrentFrame();
  const on = !blink || Math.floor(frame / kal.timing.caretBlink) % 2 === 0;
  return <span style={{ display: "inline-block", width: Math.max(6, Math.round(height * 0.07)), height, background: color, marginLeft: height * 0.04, verticalAlign: "-0.12em", opacity: on ? 1 : 0 }} />;
};

// ── Images: B-roll stills with a slow push (the only camera move of the style) ──────────────────
export type Box = { x: number; y: number; w: number; h: number };
export const kenBurns = (frame: number, from: number, to: number, dir: "in" | "out" = "in", pan = 0) => {
  const p = interpolate(frame, [from, Math.max(from + 1, to)], [0, 1], clamp);
  const s = dir === "in" ? 1 + kal.timing.kenBurns * p : 1 + kal.timing.kenBurns * (1 - p);
  return { s, x: pan * kal.timing.kenBurnsDrift * p };
};

/** A still (ChatGPT image under media/) filling `box` (object-fit cover) with a slow push. */
export const KbImage: React.FC<{
  src: string;
  box: Box;
  from: number;
  to: number;
  dir?: "in" | "out";
  pan?: number;
  dim?: number; // 0–0.6: uniform darkening of the whole image (for a counter on top); never a band
  position?: string; // object-position, e.g. "50% 60%"
  radius?: number;
}> = ({ src, box, from, to, dir = "in", pan = 0, dim = 0, position = "50% 50%", radius = 0 }) => {
  const frame = useCurrentFrame();
  const k = kenBurns(frame, from, to, dir, pan);
  return (
    <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, overflow: "hidden", borderRadius: radius, backgroundColor: kal.color.black }}>
      <Img
        src={staticFile(src)}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: position, transform: `translateX(${k.x.toFixed(2)}px) scale(${k.s.toFixed(4)})`, transformOrigin: "50% 50%" }}
      />
      {dim > 0 ? <div style={{ position: "absolute", inset: 0, backgroundColor: alpha(kal.color.black, dim) }} /> : null}
    </div>
  );
};

// ── The dark set (his near-black studio with a coloured practical light) ─────────────────────────
/** Near-black studio behind the person cut-out: a soft brand-blue practical glow on one side and a
 *  faint warm one far on the other (CSS gradients, no blur). Static, like his bottom half. `halo`
 *  (canvas px) adds a soft blue backlight behind the head, so a small figure separates from the set. */
export const StudioSet: React.FC<{ box: Box; glowSide?: "right" | "left"; halo?: { x: number; y: number } }> = ({ box, glowSide = "right", halo }) => {
  const bx = glowSide === "right" ? 84 : 16;
  const wx = glowSide === "right" ? 12 : 88;
  return (
    <div
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        backgroundColor: kal.color.studio,
        backgroundImage: [
          ...(halo ? [`radial-gradient(ellipse 330px 300px at ${halo.x - box.x}px ${halo.y - box.y}px, ${alpha(kal.color.accent, 0.26)}, ${alpha(kal.color.accent, 0.07)} 60%, transparent 100%)`] : []),
          `radial-gradient(ellipse 34% 46% at ${bx}% 34%, ${alpha(kal.color.accent, 0.3)}, ${alpha(kal.color.accent, 0.08)} 55%, transparent 75%)`,
          `radial-gradient(ellipse 22% 18% at ${wx}% 20%, ${alpha(kal.color.warm, 0.12)}, transparent 70%)`,
          `radial-gradient(ellipse 80% 60% at 50% 100%, ${alpha(kal.color.black, 0.55)}, transparent 70%)`,
        ].join(", "),
      }}
    />
  );
};

// ── The person (recording) framed by the face box ────────────────────────────────────────────────
export type FaceBox = { x0: number; y0: number; x1: number; y1: number };
export type Placement = { s: number; tx: number; ty: number };
const FOREHEAD = 0.25; // same protected area as styles/shared/captionSpot.ts
const MARGIN = 36;

/** Scale + shift that puts the face (source px) `faceW` wide, centred on `cx`, with its protected
 *  top (forehead + margin) at `protTop` on screen. */
export const placeFace = (face: FaceBox, t: { cx: number; protTop: number; faceW: number }): Placement => {
  const s = t.faceW / (face.x1 - face.x0);
  const ptop = face.y0 - (face.y1 - face.y0) * FOREHEAD;
  return { s, tx: t.cx - ((face.x0 + face.x1) / 2) * s, ty: t.protTop + MARGIN - ptop * s };
};
export const mapBox = (b: FaceBox, p: Placement): FaceBox => ({ x0: b.x0 * p.s + p.tx, y0: b.y0 * p.s + p.ty, x1: b.x1 * p.s + p.tx, y1: b.y1 * p.s + p.ty });
export const IDENTITY: Placement = { s: 1, tx: 0, ty: 0 };

/** Oval vignette in SOURCE px: the figure dissolves into the set around (cx, cy). */
export type Oval = { cx: number; cy: number; rx: number; ry: number };
const EDGES = "linear-gradient(to right, transparent 0px, #000 90px, #000 990px, transparent 1080px), linear-gradient(to top, transparent 0px, #000 220px, #000 1920px)";

/**
 * The recording (a 1080×1920 source) under a placement, clipped to `clip`. `feather` fades the
 * source frame's side and bottom edges into the set (when it is smaller than the clip); `oval`
 * also dissolves everything outside an ellipse around the face — for the small split figure, so
 * the close selfie reads as a portrait on the dark set instead of a cut-out rectangle.
 * `children` = the video element(s), laid out to fill 1080×1920.
 */
export const PersonLayer: React.FC<{ place: Placement; clip: Box; feather?: boolean; oval?: Oval; children: React.ReactNode }> = ({ place, clip, feather = false, oval, children }) => {
  const layers = [
    ...(oval ? [`radial-gradient(ellipse ${oval.rx}px ${oval.ry}px at ${oval.cx}px ${oval.cy}px, #000 0%, #000 55%, ${alpha(kal.color.black, 0.6)} 76%, transparent 100%)`] : []),
    ...(feather || oval ? [EDGES] : []),
  ].join(", ");
  const fade = layers
    ? { WebkitMaskImage: layers, WebkitMaskComposite: "source-in", maskImage: layers, maskComposite: "intersect" }
    : {};
  return (
    <div style={{ position: "absolute", left: clip.x, top: clip.y, width: clip.w, height: clip.h, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: -clip.x,
          top: -clip.y,
          width: 1080,
          height: 1920,
          transform: `translate(${place.tx.toFixed(2)}px, ${place.ty.toFixed(2)}px) scale(${place.s.toFixed(4)})`,
          transformOrigin: "0 0",
          ...fade,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Oval around a face box (source px) for the split figure: face + hair + shoulders, then darkness. */
export const ovalAround = (f: FaceBox): Oval => {
  const w = f.x1 - f.x0;
  const h = f.y1 - f.y0;
  return { cx: (f.x0 + f.x1) / 2, cy: f.y0 + h * 0.5, rx: w * 1.2, ry: h * 1.2 };
};

/** The test recording for showcases: the person cut-out on the dark set (or the raw footage). */
export const TestPerson: React.FC<{ set: "dark" | "footage"; trimBefore: number }> = ({ set, trimBefore }) => (
  <OffthreadVideo
    src={staticFile(set === "dark" ? TEST_MATTE : TEST_AROLL)}
    muted
    transparent={set === "dark"}
    trimBefore={trimBefore > 0 ? trimBefore : undefined}
    style={{ width: 1080, height: 1920 }}
  />
);
