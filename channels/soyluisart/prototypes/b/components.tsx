import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, random, useCurrentFrame } from "remotion";
import { clamp, falProto } from "../shared";
import { themeB as t } from "./theme";

const { color, font } = t;

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/";

/** L-shaped corner ticks around a box. `p` 0..1 draws them outwards from each corner. */
export const CornerTicks: React.FC<{ size?: number; p?: number; c?: string; weight?: number; inset?: number }> = ({
  size = 18,
  p = 1,
  c = color.ice,
  weight = 2,
  inset = -1,
}) => {
  const len = size * p;
  const corners: React.CSSProperties[] = [
    { left: inset, top: inset },
    { right: inset, top: inset },
    { left: inset, bottom: inset },
    { right: inset, bottom: inset },
  ];
  return (
    <>
      {corners.map((pos, i) => {
        const right = "right" in pos;
        const bottom = "bottom" in pos;
        return (
          <div key={i} style={{ position: "absolute", width: size, height: size, ...pos }}>
            <div style={{ position: "absolute", [bottom ? "bottom" : "top"]: 0, [right ? "right" : "left"]: 0, width: len, height: weight, background: c }} />
            <div style={{ position: "absolute", [bottom ? "bottom" : "top"]: 0, [right ? "right" : "left"]: 0, width: weight, height: len, background: c }} />
          </div>
        );
      })}
    </>
  );
};

/** Small orange bracketed mono label: "[01] CAPÍTULO". */
export const Tag: React.FC<{ children: React.ReactNode; c?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  c = color.orange,
  size = 18,
  style,
}) => (
  <div
    style={{
      fontFamily: font.mono,
      fontSize: size,
      fontWeight: 500,
      letterSpacing: t.tracking.mono,
      textTransform: "uppercase",
      color: c,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

/**
 * Scramble/decrypt reveal: each character appears as random glyphs, then locks into place from
 * left to right. The real character is laid out invisibly underneath, so nothing reflows.
 */
export const Decrypt: React.FC<{
  text: string;
  start: number;
  perChar?: number;
  scramble?: number;
  scrambleColor?: string;
  style?: React.CSSProperties;
}> = ({ text, start, perChar = 0.9, scramble = 7, scrambleColor = color.blue, style }) => {
  const frame = useCurrentFrame();
  return (
    <span style={style}>
      {Array.from(text).map((ch, i) => {
        if (ch === " ") return <span key={i}> </span>;
        const appear = start + i * perChar * 0.5;
        const lock = start + i * perChar + scramble;
        if (frame < appear) return <span key={i} style={{ visibility: "hidden" }}>{ch}</span>;
        if (frame >= lock) return <span key={i}>{ch}</span>;
        const g = GLYPHS[Math.floor(random(`dc-${text}-${i}-${Math.floor(frame / 2)}`) * GLYPHS.length)];
        return (
          <span key={i} style={{ position: "relative", display: "inline-block" }}>
            <span style={{ visibility: "hidden" }}>{ch}</span>
            <span style={{ position: "absolute", left: 0, top: 0, color: scrambleColor }}>{g}</span>
          </span>
        );
      })}
    </span>
  );
};

/** Typed terminal line with a block cursor. */
export const TypeLine: React.FC<{ text: string; start: number; cps?: number; style?: React.CSSProperties; cursorUntil?: number }> = ({
  text,
  start,
  cps = 1.4,
  style,
  cursorUntil = Infinity,
}) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor((frame - start) * cps)));
  const blinkOn = Math.floor(frame / 8) % 2 === 0 || (n > 0 && n < text.length);
  return (
    <div style={{ fontFamily: font.mono, whiteSpace: "pre", ...style }}>
      {text.slice(0, n)}
      {frame >= start && frame < cursorUntil ? (
        <span style={{ display: "inline-block", width: "0.6em", height: "1.05em", verticalAlign: "-0.15em", background: color.blue, opacity: blinkOn ? 1 : 0 }} />
      ) : null}
    </div>
  );
};

/** Departure-board tiles (React Bits Split Flap rebuilt on frames). */
export type FlapSegment = { text: string; c?: string };
export const SplitFlap: React.FC<{
  segments: FlapSegment[];
  start: number;
  stagger?: number;
  flips?: number;
  flipFrames?: number;
  tileW?: number;
  tileH?: number;
  fontSize?: number;
}> = ({ segments, start, stagger = 1.5, flips = 6, flipFrames = 2, tileW = 64, tileH = 98, fontSize = 68 }) => {
  const frame = useCurrentFrame();
  const chars = segments.flatMap((s) => Array.from(s.text).map((ch) => ({ ch, c: s.c ?? color.text })));
  let tileIndex = 0;
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {chars.map(({ ch, c }, i) => {
        if (ch === " ") return <div key={i} style={{ width: 22 }} />;
        const k = tileIndex++;
        const s0 = start + k * stagger;
        const settle = s0 + flips * flipFrames;
        const visible = frame >= s0;
        const step = Math.floor((frame - s0) / flipFrames);
        const sub = (frame - s0) % flipFrames;
        const glyph = !visible ? "" : frame >= settle ? ch : GLYPHS[Math.floor(random(`sf-${k}-${step}`) * GLYPHS.length)];
        const flipping = visible && frame < settle;
        const half: React.CSSProperties = {
          position: "absolute",
          left: 0,
          width: tileW,
          height: tileH / 2,
          overflow: "hidden",
          background: color.tile,
        };
        const glyphStyle: React.CSSProperties = {
          position: "absolute",
          left: 0,
          width: tileW,
          height: tileH,
          lineHeight: `${tileH}px`,
          textAlign: "center",
          fontFamily: font.mono,
          fontWeight: 700,
          fontSize,
          color: flipping ? color.ice : c,
        };
        return (
          <div
            key={i}
            style={{
              position: "relative",
              width: tileW,
              height: tileH,
              border: `1px solid ${color.hairlineBright}`,
              opacity: visible ? 1 : 0.25,
              boxSizing: "content-box",
            }}
          >
            <div style={{ ...half, top: 0, scale: flipping && sub === 0 ? "1 0.35" : "1 1", transformOrigin: "bottom" }}>
              <div style={{ ...glyphStyle, top: 0 }}>{glyph}</div>
            </div>
            <div style={{ ...half, top: tileH / 2, background: "#0C1222" }}>
              <div style={{ ...glyphStyle, top: -tileH / 2 }}>{glyph}</div>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: tileH / 2 - 1, height: 2, background: color.bg }} />
          </div>
        );
      })}
    </div>
  );
};

const Circuit: React.FC<{ opacity: number }> = ({ opacity }) => (
  <OffthreadVideo
    src={falProto("b1-circuit-pulses.mp4")}
    muted
    style={{ width: "100%", height: "100%", objectFit: "cover", opacity }}
  />
);

/**
 * Backdrop: circuit B-roll dimmed under a hairline grid, framed with corner ticks.
 * The 6 s clip is extended by crossfading a second copy in before the first one ends.
 */
export const Backdrop: React.FC<{ videoFrames: number; brightness?: (frame: number) => number }> = ({ videoFrames, brightness }) => {
  const frame = useCurrentFrame();
  const o = brightness ? brightness(frame) : t.circuitOpacity;
  const overlap = 30;
  const g = t.grid;
  const inset = t.frameInset;
  return (
    <AbsoluteFill style={{ background: color.bg }}>
      <Sequence durationInFrames={videoFrames}>
        <Circuit opacity={o} />
      </Sequence>
      <Sequence from={videoFrames - overlap} durationInFrames={videoFrames}>
        <AbsoluteFill style={{ opacity: interpolate(frame - (videoFrames - overlap), [0, overlap], [0, 1], clamp) }}>
          <Circuit opacity={o} />
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 70% at 50% 50%, ${color.bg}00 0%, ${color.bg}CC 100%)` }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="b-grid" width={g} height={g} patternUnits="userSpaceOnUse" x={0} y={12}>
            <path d={`M ${g} 0 L 0 0 0 ${g}`} fill="none" stroke={color.hairline} strokeWidth={1} />
          </pattern>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#b-grid)" opacity={0.75} />
      </svg>
      <div style={{ position: "absolute", left: inset, top: inset, right: inset, bottom: inset, border: `1px solid ${color.hairline}` }}>
        <CornerTicks size={26} />
      </div>
    </AbsoluteFill>
  );
};

/** HUD labels: title, timecode, section counter. */
export const Hud: React.FC<{ beatStarts: number[]; fps: number }> = ({ beatStarts, fps }) => {
  const frame = useCurrentFrame();
  const current = beatStarts.reduce((acc, s, i) => (frame >= s ? i : acc), 0);
  const tc = [Math.floor(frame / fps / 3600), Math.floor(frame / fps / 60) % 60, Math.floor(frame / fps) % 60, frame % fps]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
  const y = t.frameInset + 18;
  const x = t.frameInset + 28;
  return (
    <AbsoluteFill>
      <Tag size={15} style={{ position: "absolute", left: x, top: y }}>
        [SLA] Prototipo B // Terminal
      </Tag>
      <Tag size={15} c={color.ice} style={{ position: "absolute", right: x, top: y }}>
        TC {tc}
      </Tag>
      <Tag size={15} c={color.muted} style={{ position: "absolute", left: x, bottom: y, textTransform: "none" }}>
        @soyluisart
      </Tag>
      <Tag size={15} c={color.muted} style={{ position: "absolute", right: x, bottom: y }}>
        <span style={{ color: color.ice }}>[{String(current + 1).padStart(2, "0")}</span>/{String(beatStarts.length).padStart(2, "0")}]
      </Tag>
    </AbsoluteFill>
  );
};

/** 5-frame scan cut laid over a hard cut: a blue scanline sweeps and the grid flickers. */
export const ScanCut: React.FC = () => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, 5], [-80, 1160], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: y - 90,
          height: 90,
          background: `linear-gradient(180deg, ${color.blue}00 0%, ${color.blue}40 100%)`,
        }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: y, height: 2, background: color.ice }} />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: random(`sc-x-${i}-${frame}`) * 1400,
            top: random(`sc-y-${i}-${frame}`) * 1040,
            width: 200 + random(`sc-w-${i}-${frame}`) * 400,
            height: 3,
            background: color.blue,
            opacity: 0.7,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
