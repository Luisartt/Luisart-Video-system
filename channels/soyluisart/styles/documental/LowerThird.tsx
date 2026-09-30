import { interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { baseSchema, clamp, DocFrame, ExitWipe, Kicker, Rise, useFormat, Variant, DSfx } from "./primitives";
import { doc } from "./theme";

// Name lower third: amber bar grows, the bone name slides out from behind it, the Source Serif
// italic role rises under it. The channel name is always written "Luisart" (never uppercased).
// No band or plate behind any text (user rule 2026-09-27): the amber bar is a thin rule beside the
// name, and the optional tab ("INVITADA") is a plain kicker, not a filled bone tab.

export const lowerThirdSchema = baseSchema.extend({
  name: z.string().describe("Shown exactly as typed (Luisart, never uppercased)"),
  role: z.string(),
  tab: z.string().describe("Small kicker above the name, e.g. INVITADA (empty = none)"),
  side: z.enum(["left", "right"]),
  nameSize: z.number().min(48).max(140),
});
export type LowerThirdProps = z.infer<typeof lowerThirdSchema>;

export const LowerThird: React.FC<LowerThirdProps> = ({ backing, preview, safeGuide, sfx, name, role, tab, side, nameSize: nameSizeH }) => {
  const frame = useCurrentFrame();
  const f = useFormat();
  const V = f.isVertical;
  // Vertical: sits at the foot of the graphics zone (y 250–970, x 120–920; the captions band below
  // is for captions only), 0.8× and never wider than the zone (rough caps/lowercase width 0.58 em).
  const band = f.zones.graphics;
  const sound = <DSfx kind="click" at={10} on={sfx} />;
  const nameSize = V ? Math.min(Math.round(nameSizeH * 0.8), Math.floor((band.w - 60) / (Array.from(name).length * 0.58))) : nameSizeH;
  const { color, font, shadow } = doc;
  const right = side === "right";
  const barH = interpolate(frame, [2, 10], [0, 1], { ...clamp, easing: doc.ease.land });
  const nameIn = interpolate(frame, [6, 16], [0, 1], { ...clamp, easing: doc.ease.land });
  const tabIn = interpolate(frame, [12, 18], [0, 1], { ...clamp, easing: doc.ease.land });
  const bar = <div style={{ width: 8, background: color.amber, scale: `1 ${barH}`, transformOrigin: "bottom" }} />;
  return (
    <DocFrame backing={backing} preview={preview} safeGuide={safeGuide}>
      <div style={{ position: "absolute", bottom: V ? f.height - (band.y + band.h) : 150, ...(right ? { right: V ? f.width - (band.x + band.w) : 150 } : { left: V ? band.x + 4 : 150 }) }}>
        <ExitWipe dir={right ? "right" : "left"}>
          <div style={{ display: "flex", gap: 30, alignItems: "stretch", flexDirection: right ? "row-reverse" : "row" }}>
            {bar}
            <div style={{ display: "flex", flexDirection: "column", alignItems: right ? "flex-end" : "flex-start" }}>
              {tab ? <Kicker text={tab} size={24} progress={tabIn} style={{ marginBottom: 16, alignSelf: right ? "flex-end" : "flex-start" }} /> : null}
              <div style={{ overflow: "hidden", padding: right ? "0 0 8px 20px" : "0 20px 8px 0", marginBottom: -8 }}>
                <div
                  style={{
                    fontFamily: font.display,
                    fontWeight: 800,
                    fontSize: nameSize,
                    lineHeight: 1,
                    letterSpacing: "-0.015em",
                    color: color.bone,
                    textShadow: shadow.text,
                    whiteSpace: "nowrap",
                    translate: `${(1 - nameIn) * (right ? 105 : -105)}% 0`,
                  }}
                >
                  {name}
                </div>
              </div>
              {role ? (
                <Rise delay={14} style={{ marginTop: 12 }}>
                  <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: Math.round(nameSize * 0.36), color: color.boneDim, textShadow: shadow.small, whiteSpace: "nowrap" }}>
                    {role}
                  </div>
                </Rise>
              ) : null}
            </div>
          </div>
        </ExitWipe>
      </div>
      {sound}
    </DocFrame>
  );
};

const base = { backing: "green", preview: "c1-datacenter", safeGuide: false, sfx: true } as const;
const luisart = { name: "Luisart", role: "IA · finanzas · negocios", tab: "", nameSize: 112 };

export const lowerThirdVariants: Variant<LowerThirdProps>[] = [
  { id: "luisart-left", props: { ...base, ...luisart, seconds: 4, side: "left" } },
  { id: "luisart-right", props: { ...base, ...luisart, seconds: 4, side: "right" } },
  {
    id: "guest",
    props: { ...base, seconds: 4.5, name: "María Fernández", role: "Fundadora de Ejemplo Capital", tab: "INVITADA", side: "left", nameSize: 96 },
  },
];
