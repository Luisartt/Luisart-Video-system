import { AbsoluteFill, useCurrentFrame } from "remotion";
import { z } from "zod";
import { Bit, Drop, HandNote, PixelIcon, Sfx, Stage, TypeOn, Variant, base, baseSchema, bitExpressionField, iconField, useFormat } from "./primitives";
import { piz } from "./theme";

// Full-frame pizarra title: TypeOn heading (ink, one word in blue) + handwritten note under it +
// optional pixel icon (with secondary rays) or Bit, or a giant blue number (his "EXCUSA 1 /
// no sé por dónde empezar", "1,7 $").

export const boardTitleSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string().describe("Word(s) of the heading drawn in blue"),
  note: z.string().describe("Handwritten line under the heading"),
  mode: z.enum(["icon", "bit", "number", "plain"]),
  icon: iconField,
  rays: z.boolean().describe("Secondary animation: light rays around the icon +12 f"),
  expression: bitExpressionField,
  number: z.string().describe("mode = number: the big figure"),
  source: z.string().describe("mode = number: small source line (\"dato de ejemplo\" for samples)"),
});
type Props = z.infer<typeof boardTitleSchema>;

const Rays: React.FC<{ at: number; size: number }> = ({ at, size }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const px = Math.round(size / 26);
  const len = px * 5;
  const r = size * 0.66;
  const col = "#F7D774";
  return (
    <>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const a = (deg * Math.PI) / 180;
        const x = Math.round(size / 2 + Math.cos(a) * r - len / 2);
        const y = Math.round(size / 2 - Math.sin(a) * r * 0.9 - px / 2);
        return <div key={deg} style={{ position: "absolute", left: x, top: y, width: len, height: px, background: col, transform: `rotate(${-deg}deg)` }} />;
      })}
    </>
  );
};

export const BoardTitle: React.FC<Props> = (p) => {
  const { isVertical, safeBox } = useFormat();
  const t0 = 4;
  const headAt = t0 + piz.timing.headingAfterNote;
  const iconAt = headAt + Array.from(p.heading).length + 4;
  const iconPx = isVertical ? 18 : 16;
  const iconSize = 16 * iconPx;
  const solid = p.backing === "green" || p.backing === "transparent";
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <AbsoluteFill
        style={{
          left: safeBox.x,
          top: safeBox.y,
          width: safeBox.w,
          height: safeBox.h,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: isVertical ? 120 : 0,
          gap: 8,
        }}
      >
        <TypeOn text={p.heading} at={headAt} accent={p.accent} solid={solid} />
        {p.note ? <HandNote text={p.note} at={t0} solid={solid} /> : null}
        {p.mode === "icon" ? (
          <Drop at={iconAt} style={{ marginTop: isVertical ? 70 : 40, position: "relative" }} solid={solid}>
            {p.rays ? (
              <div style={{ position: "absolute", left: 0, top: 0, width: iconSize, height: iconSize }}>
                <Rays at={iconAt + piz.timing.secondary} size={iconSize} />
              </div>
            ) : null}
            <PixelIcon name={p.icon} px={iconPx} />
          </Drop>
        ) : null}
        {p.mode === "bit" ? (
          <Drop at={iconAt} style={{ marginTop: isVertical ? 80 : 40 }} solid={solid}>
            <Bit px={isVertical ? 14 : 12} expression={p.expression} />
          </Drop>
        ) : null}
        {p.mode === "number" ? (
          <div style={{ marginTop: isVertical ? 40 : 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <TypeOn text={p.number} at={iconAt} fontSize={isVertical ? 230 : 200} color={piz.color.accent} weight={800} solid={solid} />
            <div style={{ font: `500 30px ${piz.font.caption}`, color: piz.color.muted, marginTop: 20, opacity: 1 }}>{p.source}</div>
          </div>
        ) : null}
      </AbsoluteFill>
      <Sfx kind="type" at={headAt} frames={Array.from(p.heading).length + 2} on={p.sfx} />
      {p.mode === "icon" || p.mode === "bit" ? <Sfx kind="pop" at={iconAt} on={p.sfx} /> : null}
      {p.mode === "number" ? <Sfx kind="coin" at={iconAt + Array.from(p.number).length} on={p.sfx} /> : null}
    </Stage>
  );
};

const common = {
  ...base("board", 4),
  heading: "EXCUSA 1",
  accent: "1",
  note: "no sé por dónde empezar",
  mode: "icon" as const,
  icon: "bulb" as const,
  rays: true,
  expression: "happy" as const,
  number: "US$20",
  source: "dato de ejemplo · precio global, al mes",
};

export const boardTitleVariants: Variant<Props>[] = [
  { id: "icon", props: common, horizontal: true },
  { id: "bit", props: { ...common, heading: "TU ASISTENTE IA", accent: "IA", note: "trabaja mientras duermes", mode: "bit" }, horizontal: true },
  { id: "number", props: { ...common, heading: "TODO ESTO", accent: "ESTO", note: "por menos de un café al día", mode: "number" }, horizontal: true },
  { id: "plain", props: { ...common, heading: "PASO 2", accent: "2", note: "dale contexto a la IA", mode: "plain", seconds: 3 }, horizontal: true },
];
