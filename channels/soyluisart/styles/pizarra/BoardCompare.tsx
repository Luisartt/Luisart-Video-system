import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Drop, HandNote, PixelIcon, Sfx, Stage, TypeOn, Variant, base, baseSchema, iconField, useFormat } from "./primitives";
import { piz } from "./theme";

// Vertical content extent on the sheet (measured on the renders) → fitted into the graphics zone
// y 250–970 by <Stage fit> (user rule 2026-09-27, Codex H6).
const ZONE_FIT = [300, 1286] as const;

// ANTES / HOY: two halves split by a thin full-bleed ink divider. Top (left on horizontal) is the
// "before" in ink, left-aligned; bottom (right) is the "after" in blue, right-aligned, entering on
// its own beat. Each half = heading + hand note + a row of pixel icons (siblings every 10 f).

const halfSchema = z.object({
  heading: z.string(),
  note: z.string(),
  icons: z.array(iconField).max(4),
});
export const boardCompareSchema = baseSchema.extend({
  before: halfSchema,
  after: halfSchema,
  afterAt: z.number().min(0).describe("Seconds when the second half appears (its beat word)"),
  afterTone: z.enum(["accent", "alert"]).describe("accent = blue (better) · alert = red (worse)"),
});
type Props = z.infer<typeof boardCompareSchema>;
type Half = z.infer<typeof halfSchema>;

const HalfView: React.FC<{ half: Half; at: number; align: "left" | "right"; color: string; noteColor: string; iconPx: number; sfx: boolean }> = ({
  half,
  at,
  align,
  color,
  noteColor,
  iconPx,
  sfx,
}) => {
  const frame = useCurrentFrame();
  const headAt = at + piz.timing.headingAfterNote;
  const iconsAt = headAt + Array.from(half.heading).length + 3;
  if (frame < at) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: align === "left" ? "flex-start" : "flex-end", gap: 6 }}>
      <TypeOn text={half.heading} at={headAt} color={color} align={align} />
      <HandNote text={half.note} at={at} align={align} color={noteColor} />
      <div style={{ display: "flex", gap: iconPx * 5, alignItems: "flex-end", marginTop: 50 }}>
        {half.icons.map((ic, i) => (
          <Drop key={i} at={iconsAt + i * piz.timing.sibling}>
            <PixelIcon name={ic} px={iconPx} />
          </Drop>
        ))}
      </div>
      <Sfx kind="type" at={headAt} frames={Array.from(half.heading).length + 2} on={sfx} />
      {half.icons.length ? <Sfx kind="pop" at={iconsAt} on={sfx} /> : null}
    </div>
  );
};

export const BoardCompare: React.FC<Props> = (p) => {
  const { isVertical, safeBox, width, height } = useFormat();
  const { fps } = useVideoConfig();
  const afterAt = Math.round(p.afterAt * fps);
  const afterColor = p.afterTone === "alert" ? piz.color.alert : piz.color.accent;
  const afterNote = p.afterTone === "alert" ? piz.color.alert : piz.color.accentDark;
  const iconPx = isVertical ? 9 : 8;
  const pad = 40;
  const line = piz.ui.border;
  if (isVertical) {
    const mid = Math.round(safeBox.y + safeBox.h * 0.5);
    return (
      <Stage backing={p.backing} safeGuide={p.safeGuide} fit={ZONE_FIT}>
        <AbsoluteFill style={{ left: safeBox.x + pad, width: safeBox.w - pad * 2, top: safeBox.y + 40, height: mid - safeBox.y - 60 }}>
          <HalfView half={p.before} at={4} align="left" color={piz.color.ink} noteColor={piz.color.handInk} iconPx={iconPx} sfx={p.sfx} />
        </AbsoluteFill>
        <div style={{ position: "absolute", left: 0, top: mid - line / 2, width, height: line, background: piz.color.ink }} />
        <AbsoluteFill style={{ left: safeBox.x + pad, width: safeBox.w - pad * 2, top: mid + 50, height: safeBox.y + safeBox.h - mid - 50 }}>
          <HalfView half={p.after} at={afterAt} align="right" color={afterColor} noteColor={afterNote} iconPx={iconPx} sfx={p.sfx} />
        </AbsoluteFill>
      </Stage>
    );
  }
  const mid = Math.round(width / 2);
  const colW = mid - safeBox.x - 80;
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide} fit={ZONE_FIT}>
      <AbsoluteFill style={{ left: safeBox.x, width: colW, top: safeBox.y, height: safeBox.h, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <HalfView half={p.before} at={4} align="left" color={piz.color.ink} noteColor={piz.color.handInk} iconPx={iconPx} sfx={p.sfx} />
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 0, left: mid - line / 2, width: line, height, background: piz.color.ink }} />
      <AbsoluteFill style={{ left: mid + 80, width: colW, top: safeBox.y, height: safeBox.h, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <HalfView half={p.after} at={afterAt} align="right" color={afterColor} noteColor={afterNote} iconPx={iconPx} sfx={p.sfx} />
      </AbsoluteFill>
    </Stage>
  );
};

export const boardCompareVariants: Variant<Props>[] = [
  {
    id: "antes-hoy",
    horizontal: true,
    props: {
      ...base("board", 5),
      before: { heading: "ANTES", note: "meses y mucho dinero", icons: ["calendar", "money-bag"] },
      after: { heading: "HOY", note: "una tarde, casi gratis", icons: ["bulb", "coin"] },
      afterAt: 1.6,
      afterTone: "accent",
    },
  },
  {
    id: "bien-mal",
    horizontal: true,
    props: {
      ...base("board", 5),
      before: { heading: "CON IA", note: "trabaja por ti", icons: ["robot", "check"] },
      after: { heading: "POR MODA", note: "pagas y no la usas", icons: ["money-bag", "cross"] },
      afterAt: 1.6,
      afterTone: "alert",
    },
  },
];
