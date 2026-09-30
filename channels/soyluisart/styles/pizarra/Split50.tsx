import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { ARollVideo, Drop, PixelIcon, Sfx, Stage, TEST_AROLL, TypeOn, Variant, base, baseSchema, iconField, useFormat } from "./primitives";
import { piz } from "./theme";

// Split layout: pizarra graphic in the top half, the A-roll full-bleed in the bottom half,
// separated by a thin ink line (his "LOS QUE DESTACAN" frame). The graphic is a technical label
// heading (Space Grotesk, one word blue) + a row of pixel icons with a highlighted middle one, kept
// inside the graphics zone (y 250–970). No captions: a graphic is always on screen (rule a).
// The old "aroll-top" order is retired — its graphic would sit in the caption band (rule c).

export const split50Schema = baseSchema.extend({
  order: z.enum(["graphic-top"]).describe("Graphic on top (aroll-top retired: graphics must stay in y 250–970)"),
  ratio: z.number().min(0.35).max(0.65).describe("Graphic share of the height"),
  heading: z.string(),
  accent: z.string(),
  icons: z.array(iconField).min(1).max(4),
  highlight: z.number().min(-1).max(3).describe("Icon index drawn larger (-1 = none)"),
  aroll: z.string(),
  focusY: z.number().min(0).max(100).describe("A-roll crop: vertical focus in %"),
});
type Props = z.infer<typeof split50Schema>;

export const Split50: React.FC<Props> = (p) => {
  const { width, height, safeBox, zones } = useFormat();
  const gTop = p.order === "graphic-top";
  const gH = Math.round(height * p.ratio);
  const aTop = gTop ? gH : 0;
  const aH = height - gH;
  const gY = gTop ? 0 : aH;
  const line = piz.ui.border;
  // Graphic content kept inside the graphics zone (y 250–970).
  const cTop = Math.max(gY, zones.graphics.y) + 20;
  const cBottom = Math.min(gY + gH, zones.graphics.y + zones.graphics.h) - 20;
  const headAt = 4;
  const iconsAt = headAt + Array.from(p.heading).length + 3;
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <div style={{ position: "absolute", left: 0, top: aTop, width, height: aH, overflow: "hidden" }}>
        <ARollVideo src={p.aroll} style={{ objectPosition: `50% ${p.focusY}%` }} />
      </div>
      <div style={{ position: "absolute", left: 0, width, top: (gTop ? gH : aH) - line / 2, height: line, background: piz.color.ink }} />
      <AbsoluteFill style={{ left: safeBox.x, width: safeBox.w, top: cTop, height: cBottom - cTop, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 50 }}>
        <TypeOn text={p.heading} accent={p.accent} at={headAt} fontFamily={piz.font.label} weight={700} fontSize={piz.size.label * 1.3} letterSpacing="0.02em" lineHeight={1.02} />
        <div style={{ display: "flex", gap: 40, alignItems: "flex-end" }}>
          {p.icons.map((ic, i) => (
            <Drop key={i} at={iconsAt + i * piz.timing.sibling}>
              <PixelIcon name={ic} px={i === p.highlight ? 13 : 10} />
            </Drop>
          ))}
        </div>
      </AbsoluteFill>
      <Sfx kind="type" at={headAt} frames={Array.from(p.heading).length + 2} on={p.sfx} />
      <Sfx kind="pop" at={iconsAt} on={p.sfx} />
    </Stage>
  );
};


const common: Props = {
  ...base("board", 4),
  order: "graphic-top",
  ratio: 0.53,
  heading: "PRECIO\nNO ES VALOR",
  accent: "VALOR",
  icons: ["coin", "chart-up", "money-bag"],
  highlight: 1,
  aroll: TEST_AROLL,
  focusY: 30,
};

export const split50Variants: Variant<Props>[] = [
  { id: "graphic-top", props: common },
];
