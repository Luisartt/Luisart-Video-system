import { Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CornerTicks } from "../../../prototypes/b/components";
import { themeB as t } from "../../../prototypes/b/theme";
import { theme } from "../../../theme";
import { SEGMENTS, TOTAL_FRAMES } from "./timing";

export const C = t.color;
export const F = t.font;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const MEDIA = "soyluisart/automated-research/2026-09-27-per-barato";
export const AROLL = staticFile(`${MEDIA}/aroll-1080x1920.mp4`);
export const MATTE = staticFile(`${MEDIA}/aroll-person-alpha-v2.webm`);
export const VOICE = staticFile(`${MEDIA}/voice-cut-master.wav`);

/** 0→1 over `dur` frames from `start`, snappy ease-out. */
export const ramp = (frame: number, start: number, dur = 6) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: t.ease.snap });

/**
 * The cut applied to a clip: one <Sequence> per keep segment (optionally limited to a window of
 * cut frames), each <OffthreadVideo> trimmed to its source frame. Must sit at the composition
 * root timeline so the A-roll, the matte and the PiP stay frame-locked.
 */
export const CutClip: React.FC<{
  src: string;
  transparent?: boolean;
  from?: number;
  to?: number;
  style?: React.CSSProperties;
  name: string;
}> = ({ src, transparent, from = 0, to = TOTAL_FRAMES, style, name }) => (
  <>
    {SEGMENTS.map((s, i) => {
      const a = Math.max(from, s.cutFrom);
      const b = Math.min(to, s.cutFrom + s.frames);
      if (b <= a) return null;
      return (
        <Sequence key={i} name={`${name} · segment ${i + 1}`} from={a} durationInFrames={b - a} premountFor={15}>
          <OffthreadVideo
            src={src}
            muted
            transparent={transparent}
            trimBefore={s.srcIn + (a - s.cutFrom)}
            style={{ width: "100%", height: "100%", objectFit: "cover", ...style }}
          />
        </Sequence>
      );
    })}
  </>
);

/** Scan-wipe exit (Terminal house transition): an ice line crosses and erases the block. */
export const scanClip = (p: number, dir: "ltr" | "ttb" = "ltr"): React.CSSProperties => {
  if (p <= 0) return {};
  const x = interpolate(p, [0, 1], [-2, 102]);
  return dir === "ltr"
    ? { clipPath: `polygon(${x}% -400px, calc(100% + 400px) -400px, calc(100% + 400px) calc(100% + 400px), ${x}% calc(100% + 400px))` }
    : { clipPath: `polygon(-400px ${x}%, calc(100% + 400px) ${x}%, calc(100% + 400px) calc(100% + 400px), -400px calc(100% + 400px))` };
};

/** Positioned block that enters on `inF` (rise + fade) and scans out ending at `outF`. */
export const Life: React.FC<{
  inF: number;
  outF: number;
  style: React.CSSProperties;
  rise?: number;
  exitFrames?: number;
  children: React.ReactNode;
}> = ({ inF, outF, style, rise = 24, exitFrames = 7, children }) => {
  const frame = useCurrentFrame();
  if (frame < inF - 1 || frame >= outF) return null;
  const e = ramp(frame, inF, 6);
  const x = interpolate(frame, [outF - exitFrames, outF], [0, 1], { ...clamp, easing: t.ease.inOut });
  return (
    <div style={{ position: "absolute", ...style, opacity: e, translate: `0px ${(1 - e) * rise}px`, ...scanClip(x) }}>
      {children}
      {x > 0 && x < 1 ? (
        <div style={{ position: "absolute", left: `${x * 100}%`, top: -10, bottom: -10, width: 2, background: C.ice }} />
      ) : null}
    </div>
  );
};

/** Opaque near-black Terminal panel: hairline border, corner ticks. */
export const Panel: React.FC<{ style?: React.CSSProperties; tick?: string; border?: string; children?: React.ReactNode }> = ({
  style,
  tick = C.ice,
  border = C.hairlineBright,
  children,
}) => (
  <div style={{ position: "relative", background: C.panel, border: `1px solid ${border}`, boxSizing: "border-box", ...style }}>
    <CornerTicks size={16} c={tick} />
    {children}
  </div>
);

/** Mono label, uppercase unless told otherwise. */
export const Mono: React.FC<{ children: React.ReactNode; c?: string; size?: number; style?: React.CSSProperties; upper?: boolean }> = ({
  children,
  c = C.orange,
  size = 24,
  style,
  upper = true,
}) => (
  <div
    style={{
      fontFamily: F.mono,
      fontSize: size,
      fontWeight: 500,
      letterSpacing: t.tracking.mono,
      textTransform: upper ? "uppercase" : "none",
      color: c,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Stamp slam: heavy rotated word that scales down onto the frame. v3: no box — no fill and no
 *  frame behind the word (user feedback), just the coloured word with a thin dark outline. */
export const Stamp: React.FC<{ text: string; at: number; c?: string; size?: number; rotate?: number; style?: React.CSSProperties }> = ({
  text,
  at,
  c = C.loss,
  size = 64,
  rotate = -7,
  style,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = ramp(frame, at, 5);
  return (
    <div
      style={{
        position: "absolute",
        ...style,
        rotate: `${rotate}deg`,
        scale: interpolate(p, [0, 1], [1.5, 1]),
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        WebkitTextStroke: `${Math.max(4, Math.round(size * 0.13))}px #04060B`,
        paintOrder: "stroke fill",
        textShadow: "0 3px 14px rgba(0,0,0,0.45)",
        fontFamily: F.display,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: "-0.02em",
        lineHeight: 1,
        color: c,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

/** Low UI click on each card landing (voice stays on top). */
export const Click: React.FC<{ at: number; volume?: number }> = ({ at, volume = 0.3 }) => (
  <Sequence from={at} durationInFrames={10} name="sfx click" layout="none">
    <Audio src={staticFile(theme.sfx.click)} volume={theme.sfx.clickVolume * volume} />
  </Sequence>
);

export const Whoosh: React.FC<{ at: number; volume?: number }> = ({ at, volume = 0.3 }) => (
  <Sequence from={at} durationInFrames={15} name="sfx whoosh" layout="none">
    <Audio src={staticFile(theme.sfx.whoosh)} volume={theme.sfx.whooshVolume * volume} />
  </Sequence>
);
