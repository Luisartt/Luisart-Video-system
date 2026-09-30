import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";
import { NavyBackground } from "./NavyBackground";

// Shared motion for the channel's cards: pop-in with overshoot, slow drift, push-out exit,
// light sweep and the landing click. Timings come from theme.motion; the exit starts
// theme.motion.exitFrames before the end of the enclosing Sequence (or composition).

const { motion } = theme;

/** Frame (local) at which a popped-in element visually lands (spring peak). */
export const LAND_FRAME = 5;

export type ExitKind = "push" | "none";

/** Pop-in progress with overshoot: 0 → ~1.08 → 1. */
export const usePop = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: motion.popIn });
};

/**
 * Wraps content in the channel's standard motion: pop in from small, drift slowly, push out.
 * `from`: scale at frame 0. `driftX`: px per second of sideways camera drift.
 */
export const CardMotion: React.FC<{
  children: React.ReactNode;
  delay?: number;
  exit?: ExitKind;
  from?: number;
  driftX?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, exit = "push", from = 0.25, driftX = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = usePop(delay);
  const t = Math.max(0, frame - delay) / fps;
  const drift = 1 + motion.driftScalePerSecond * t;
  const out = usePushOut(exit === "push");
  return (
    <div
      style={{
        scale: String((from + (1 - from) * pop) * drift * (1 + out * 0.35)),
        translate: `${driftX * t}px 0px`,
        opacity: interpolate(frame - delay, [0, 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (1 - out),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Push-out progress 0 → 1 over the last theme.motion.exitFrames of the enclosing Sequence. */
export const usePushOut = (enabled = true) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  if (!enabled) return 0;
  return interpolate(frame, [durationInFrames - motion.exitFrames, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
};

/** A soft white shine that crosses its (overflow: hidden) parent once, starting at `start`. */
export const LightSweep: React.FC<{ start: number; frames?: number; strength?: number }> = ({
  start,
  frames = motion.lightSweepFrames,
  strength = 0.55,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + frames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  if (p <= 0 || p >= 1) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden", borderRadius: "inherit" }}>
      <div
        style={{
          position: "absolute",
          top: "-50%",
          bottom: "-50%",
          width: "45%",
          left: `${interpolate(p, [0, 1], [-60, 120])}%`,
          rotate: "18deg",
          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,${strength * 0.5}) 40%, rgba(255,255,255,${strength}) 50%, rgba(255,255,255,${strength * 0.5}) 60%, transparent 100%)`,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};

/** One-shot sound effect from theme.sfx at local frame `at`. */
export const Sfx: React.FC<{ kind: "click" | "whoosh"; at?: number }> = ({ kind, at = 0 }) => (
  <Sequence from={at} layout="none" name={`sfx-${kind}`}>
    <Audio
      src={staticFile(kind === "click" ? theme.sfx.click : theme.sfx.whoosh)}
      volume={kind === "click" ? theme.sfx.clickVolume : theme.sfx.whooshVolume}
    />
  </Sequence>
);

/** Full-frame stage: optional navy background, content centred. */
export const Stage: React.FC<{ background: boolean; children: React.ReactNode; glowX?: number }> = ({
  background,
  children,
  glowX,
}) => (
  <AbsoluteFill>
    {background ? <NavyBackground glowX={glowX} /> : null}
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);
