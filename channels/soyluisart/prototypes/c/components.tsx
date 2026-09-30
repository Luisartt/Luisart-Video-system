import { noise2D } from "@remotion/noise";
import { AbsoluteFill, OffthreadVideo, interpolate, random, useCurrentFrame } from "remotion";
import { clamp, falProto } from "../shared";
import { themeC as t } from "./theme";

const { color } = t;

/** Full-bleed graded B-roll with a slow Ken Burns push. */
export const Broll: React.FC<{
  file: string;
  trimBefore?: number;
  duration: number;
  from?: number;
  to?: number;
  dim?: number;
  origin?: string;
}> = ({ file, trimBefore = 0, duration, from = 1.06, to = 1.14, dim = 1, origin = "50% 50%" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: color.black }}>
      <OffthreadVideo
        src={falProto(file)}
        muted
        trimBefore={trimBefore}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: `${t.grade} brightness(${dim})`,
          scale: String(interpolate(frame, [0, duration], [from, to], { ...clamp, easing: t.ease.slow })),
          transformOrigin: origin,
        }}
      />
    </AbsoluteFill>
  );
};

/** Animated film grain: SVG fractal noise re-seeded every frame (no CSS blur). */
export const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = t.grain.opacity }) => {
  const frame = useCurrentFrame();
  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 960 540"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity, pointerEvents: "none" }}
    >
      <filter id="c-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency={t.grain.frequency} numOctaves={2} seed={frame % 997} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope={1.6} intercept={-0.3} />
          <feFuncG type="linear" slope={1.6} intercept={-0.3} />
          <feFuncB type="linear" slope={1.6} intercept={-0.3} />
        </feComponentTransfer>
      </filter>
      <rect width={960} height={540} filter="url(#c-grain)" />
    </svg>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(ellipse 72% 68% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 85%, rgba(0,0,0,0.8) 100%)",
    }}
  />
);

/** Gate weave: the whole picture drifts ±1–2 px, like film running through a projector gate. */
export const GateWeave: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const x = noise2D("weave-x", frame * 0.35, 0) * t.weavePx;
  const y = noise2D("weave-y", 0, frame * 0.35) * t.weavePx;
  return <AbsoluteFill style={{ translate: `${x.toFixed(2)}px ${y.toFixed(2)}px`, scale: "1.004" }}>{children}</AbsoluteFill>;
};

/** Slow-drifting dust specks (Magnates chapter card). */
export const Dust: React.FC<{ count?: number }> = ({ count = 36 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const x0 = random(`dx-${i}`) * 1920;
        const y0 = random(`dy-${i}`) * 1080;
        const s = 2 + random(`ds-${i}`) * 4;
        const speed = 0.2 + random(`dv-${i}`) * 0.6;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x0 + noise2D(`dn-${i}`, frame * 0.01, 0) * 30,
              top: ((y0 - frame * speed) % 1080 + 1080) % 1080,
              width: s,
              height: s,
              borderRadius: s,
              background: color.bone,
              opacity: 0.18 + random(`do-${i}`) * 0.4,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** A word that lands hard: from large and transparent to set in ~4 frames. */
export const LandingWord: React.FC<{ delay: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay, children, style }) => {
  const frame = useCurrentFrame();
  return (
    <span
      style={{
        display: "inline-block",
        opacity: interpolate(frame, [delay, delay + 2], [0, 1], clamp),
        scale: String(interpolate(frame, [delay, delay + 4], [1.32, 1], { ...clamp, easing: t.ease.land })),
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/** Quick bone flash with an RGB split, held for 2 frames so it isn't a single-frame spike. */
export const FlashCut: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - at, [-2, -1, 0, 1, 2, 4], [0, 0.35, 0.8, 0.8, 0.4, 0], clamp);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: color.bone, opacity: o, mixBlendMode: "screen", pointerEvents: "none" }} />;
};
