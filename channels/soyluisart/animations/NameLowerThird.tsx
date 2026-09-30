import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../theme";
import { NavyBackground } from "./NavyBackground";

// Outlined-box uppercase name over footage (InvernovAH "JIMMY DONALDSON"): the box around the
// first word draws in, the name reveals left to right, holds, then wipes out. Transparent
// background by default so it sits over a recording.

export const nameLowerThirdSchema = z.object({
  name: z.string(),
  role: z.string().describe("Optional line under the name; empty = none"),
  position: z.enum(["bottom-left", "bottom-right", "top-left"]),
  background: z.boolean().describe("Navy background behind (for previews); off over footage"),
});

export type NameLowerThirdProps = z.infer<typeof nameLowerThirdSchema>;

export const nameLowerThirdDefaults: NameLowerThirdProps = {
  name: "Luisart",
  role: "Creador de contenido",
  position: "bottom-left",
  background: false,
};

const { color, font, type, motion } = theme;
const SAFE_X = 140;
const SAFE_Y = 130;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const NameLowerThird: React.FC<Partial<NameLowerThirdProps>> = (props) => {
  const { name, role, position, background } = { ...nameLowerThirdDefaults, ...props };
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const exitLen = Math.round(motion.exitFrames * 1.5);
  const exitStart = durationInFrames - exitLen;

  const draw = interpolate(frame, [0, 12], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const reveal = interpolate(frame, [5, 21], [100, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const roleReveal = interpolate(frame, [12, 26], [100, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const out = interpolate(frame, [exitStart, durationInFrames - 1], [0, 100], { ...clamp, easing: Easing.in(Easing.cubic) });
  const drift = interpolate(frame, [0, durationInFrames], [0, 10]);

  const pos: React.CSSProperties =
    position === "bottom-right"
      ? { right: SAFE_X, bottom: SAFE_Y, alignItems: "flex-end" }
      : position === "top-left"
        ? { left: SAFE_X, top: SAFE_Y }
        : { left: SAFE_X, bottom: SAFE_Y };

  const shadow = "0 2px 14px rgba(0,0,0,0.55)";

  return (
    <AbsoluteFill>
      {background ? <NavyBackground glowX={70} /> : null}
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          gap: 22,
          translate: `${drift}px 0px`,
          clipPath: `inset(-40px -40px -40px ${out}%)`,
          ...pos,
        }}
      >
        <div
          style={{
            position: "relative",
            alignSelf: position === "bottom-right" ? "flex-end" : "flex-start",
            padding: "18px 34px 22px",
            fontFamily: font.display,
            fontWeight: 800,
            fontSize: 72,
            lineHeight: 1,
            letterSpacing: "0.02em",
            color: color.text,
            textShadow: shadow,
            whiteSpace: "pre",
          }}
        >
          <svg style={{ position: "absolute", inset: 0, overflow: "visible" }} width="100%" height="100%">
            <rect
              x="2"
              y="2"
              width="calc(100% - 4px)"
              height="calc(100% - 4px)"
              fill="none"
              stroke={color.text}
              strokeWidth={4}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={draw}
            />
          </svg>
          <span style={{ clipPath: `inset(0 ${reveal}% 0 0)`, display: "inline-block" }}>{name}</span>
        </div>
        {role ? (
          <div
            style={{
              clipPath: `inset(0 ${roleReveal}% 0 0)`,
              fontFamily: font.ui,
              fontWeight: 600,
              fontSize: 38,
              color: color.text,
              opacity: 0.9,
              letterSpacing: type.uiTracking,
              textShadow: shadow,
              paddingLeft: 4,
            }}
          >
            {role}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
