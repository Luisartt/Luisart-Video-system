import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../theme";
import { CardMotion, LAND_FRAME, Sfx, Stage } from "./kit";

// Big accent-blue number (Montserrat 900) that counts up with ease-out, with a label in Inter.
// Pops in, counts over ~0.8 s, drifts, pushes out. Tabular figures so digits don't jitter.

export const statCalloutSchema = z.object({
  value: z.number(),
  decimals: z.number().int().min(0).max(3),
  prefix: z.string(),
  suffix: z.string(),
  label: z.string(),
  countSeconds: z.number().min(0),
  background: z.boolean(),
  sfx: z.boolean(),
  exit: z.enum(["push", "none"]),
});

export type StatCalloutProps = z.infer<typeof statCalloutSchema>;

export const statCalloutDefaults: StatCalloutProps = {
  value: 365,
  decimals: 0,
  prefix: "+",
  suffix: "",
  label: "días subiendo videos",
  countSeconds: 0.8,
  background: true,
  sfx: true,
  exit: "push",
};

const { color, font, type } = theme;

export const StatCallout: React.FC<Partial<StatCalloutProps>> = (props) => {
  const p = { ...statCalloutDefaults, ...props };
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = interpolate(frame, [LAND_FRAME - 2, LAND_FRAME - 2 + p.countSeconds * fps], [0, p.value], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const text = n.toLocaleString("es-ES", {
    minimumFractionDigits: p.decimals,
    maximumFractionDigits: p.decimals,
    useGrouping: Math.abs(p.value) >= 10000 ? true : false,
  });
  // Reserve the final width so the layout doesn't grow while counting.
  const finalText = p.value.toLocaleString("es-ES", {
    minimumFractionDigits: p.decimals,
    maximumFractionDigits: p.decimals,
    useGrouping: Math.abs(p.value) >= 10000 ? true : false,
  });

  return (
    <Stage background={p.background}>
      {p.sfx ? <Sfx kind="click" at={LAND_FRAME - 1} /> : null}
      <CardMotion exit={p.exit} from={0.3}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              fontFamily: font.display,
              fontWeight: 900,
              fontSize: 300,
              lineHeight: 1,
              color: color.accent,
              fontVariantNumeric: "tabular-nums",
              textShadow: `0 0 60px ${color.glow}aa, 0 0 140px ${color.glow}66`,
              display: "flex",
              alignItems: "baseline",
            }}
          >
            <span>{p.prefix}</span>
            <span style={{ display: "inline-block", minWidth: `${finalText.length * 0.68}em`, textAlign: "left" }}>{text}</span>
            <span>{p.suffix}</span>
          </div>
          <div
            style={{
              marginTop: 20,
              fontFamily: font.ui,
              fontWeight: 600,
              fontSize: 64,
              color: color.text,
              letterSpacing: type.uiTracking,
            }}
          >
            {p.label}
          </div>
        </div>
      </CardMotion>
    </Stage>
  );
};
