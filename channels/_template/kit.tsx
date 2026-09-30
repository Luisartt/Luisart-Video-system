import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "./theme.generated";

// Small token-driven kit shared by every template element. Nothing here hard-codes a brand:
// colours, fonts, border, shadow and motion all come from brand/design-system/tokens.json.

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const T = theme;

export const Board: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      backgroundColor: T.color.background,
      backgroundImage: `radial-gradient(circle, ${T.color.line}22 2.5px, transparent 3px)`,
      backgroundSize: "64px 64px",
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Enter animation: fade + rise, driven by motion.enterFrames (and overshoot if the brand wants it). */
export const useEnter = (at: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (T.motion.overshoot) {
    const p = spring({ frame: frame - at, fps, config: { damping: 13, stiffness: 170, mass: 0.7 } });
    return { p, style: { opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 40}px)` } };
  }
  const p = interpolate(frame, [at, at + T.motion.enterFrames], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return { p, style: { opacity: p, transform: `translateY(${(1 - p) * 30}px)` } };
};

export const hardShadow = `${T.shadow.x}px ${T.shadow.y}px 0 ${T.shadow.color}`;

export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; tint?: string }> = ({ children, style, tint }) => (
  <div
    style={{
      background: tint ?? T.color.surface,
      border: `${T.border}px solid ${T.color.line}`,
      borderRadius: T.radius.card,
      boxShadow: hardShadow,
      ...style,
    }}
  >
    {children}
  </div>
);

export const H: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  size = T.type.title,
  color = T.color.ink,
  style,
}) => (
  <div style={{ fontFamily: T.font.heading, fontWeight: T.weight.heading, fontSize: size, color, lineHeight: 1.05, letterSpacing: "-0.01em", ...style }}>
    {children}
  </div>
);

export const Note: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  size = 40,
  color = T.color.muted,
  style,
}) => <div style={{ fontFamily: T.font.accent, fontWeight: T.weight.accent, fontSize: size, color, ...style }}>{children}</div>;

/** Vertical safe zone (graphics must stay between top and bottom). */
export const SAFE = T.safe.vertical;
