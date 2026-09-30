import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../shared";
import { themeA as t } from "./theme";

const { color, font } = t;

/** Text revealed by a line mask: the line slides up from behind a hard edge. */
export const LineReveal: React.FC<{
  delay: number;
  duration?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay, duration = 20, children, style }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.14em", marginBottom: "-0.14em", ...style }}>
      <div
        style={{
          translate: `0 ${interpolate(frame, [delay, delay + duration], [112, 0], { ...clamp, easing: t.ease.out })}%`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Uppercase monospace label with wide tracking ("01 / CAPÍTULO"). */
export const MonoLabel: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  size = 18,
  color: c = color.copper,
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

/** A hairline that draws from its origin. */
export const Hairline: React.FC<{
  delay: number;
  duration?: number;
  vertical?: boolean;
  length: number | string;
  color?: string;
  origin?: "start" | "end";
  style?: React.CSSProperties;
}> = ({ delay, duration = 18, vertical, length, color: c = color.hairline, origin = "start", style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + duration], [0, 1], { ...clamp, easing: t.ease.inOut });
  return (
    <div
      style={{
        position: "absolute",
        background: c,
        width: vertical ? 1 : length,
        height: vertical ? length : 1,
        scale: vertical ? `1 ${p}` : `${p} 1`,
        transformOrigin: origin === "start" ? "left top" : "right bottom",
        ...style,
      }}
    />
  );
};

/** "+" crosshair mark centred on (x, y). */
export const Crosshair: React.FC<{ x: number; y: number; opacity: number; size?: number }> = ({ x, y, opacity, size = 18 }) => (
  <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, opacity }}>
    <div style={{ position: "absolute", left: size / 2 - 0.5, top: 0, width: 1, height: size, background: color.copper }} />
    <div style={{ position: "absolute", top: size / 2 - 0.5, left: 0, height: 1, width: size, background: color.copper }} />
  </div>
);

/**
 * Engraving plate: thin copper frame → parchment mat → the plate itself, like a bound
 * encyclopedia illustration on a black page. Revealed top-down by a wipe.
 */
export const Plate: React.FC<{
  width: number;
  height: number;
  reveal: number;
  children: React.ReactNode;
  caption?: string;
  figure?: string;
}> = ({ width, height, reveal, children, caption, figure }) => (
  <div style={{ width: width + 52 }}>
    <div
      style={{
        border: `1px solid ${color.copper}66`,
        padding: 9,
        clipPath: `inset(0 0 ${(1 - reveal) * 100}% 0)`,
      }}
    >
      <div style={{ background: color.parchment, padding: 16 }}>
        <div style={{ width, height, overflow: "hidden", position: "relative", outline: `1px solid ${color.sepia}55` }}>
          {children}
        </div>
      </div>
    </div>
    {caption ? (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 18,
          opacity: interpolate(reveal, [0.7, 1], [0, 1], clamp),
        }}
      >
        <MonoLabel size={15} color={color.muted}>
          {caption}
        </MonoLabel>
        {figure ? (
          <MonoLabel size={15} color={color.copper}>
            {figure}
          </MonoLabel>
        ) : null}
      </div>
    ) : null}
  </div>
);

/** Page chrome: hairline rails, folio labels and the chapter indicator. */
export const PageChrome: React.FC<{ beatStarts: number[] }> = ({ beatStarts }) => {
  const frame = useCurrentFrame();
  const m = t.margin;
  const current = beatStarts.reduce((acc, s, i) => (frame >= s ? i : acc), 0);
  const fadeIn = interpolate(frame, [0, 14], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: fadeIn, pointerEvents: "none" }}>
      <Hairline delay={0} duration={24} length={1920 - 2 * m} style={{ left: m, top: 84 }} />
      <Hairline delay={4} duration={24} length={1920 - 2 * m} origin="end" style={{ left: m, top: 1080 - 84 }} />
      <MonoLabel size={15} color={color.muted} style={{ position: "absolute", left: m, top: 50, textTransform: "none", letterSpacing: "0.12em" }}>
        @soyluisart
      </MonoLabel>
      <MonoLabel size={15} color={color.muted} style={{ position: "absolute", left: 0, right: 0, top: 50, textAlign: "center" }}>
        La IA y tu dinero
      </MonoLabel>
      <MonoLabel size={15} color={color.muted} style={{ position: "absolute", right: m, top: 50 }}>
        Prototipo A · Grabado
      </MonoLabel>
      <div style={{ position: "absolute", right: m, top: 1080 - 66, display: "flex", gap: 26 }}>
        {beatStarts.map((_, i) => (
          <MonoLabel key={i} size={15} color={i === current ? color.copper : color.hairlineStrong}>
            {String(i + 1).padStart(2, "0")}
          </MonoLabel>
        ))}
      </div>
      <MonoLabel size={15} color={color.muted} style={{ position: "absolute", left: m, top: 1080 - 66 }}>
        Cuaderno Nº 01
      </MonoLabel>
    </AbsoluteFill>
  );
};
