import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Drop, PixelIcon, Sfx, Stage, TypeOn, Variant, base, baseSchema, useFormat } from "./primitives";
import { piz } from "./theme";

// Vertical content extent on the sheet (measured on the renders) → fitted into the graphics zone
// y 250–970 by <Stage fit> (user rule 2026-09-27, Codex H6).
const ZONE_FIT = [416, 1362] as const;

// Myth vs fact: MITO half (red heading, the claim, a red "FALSO" rubber stamp thumping onto it)
// and REALIDAD half (blue heading, the fact, a pixel check) split by an ink divider — stacked on
// vertical, side by side on horizontal.

export const mythFactSchema = baseSchema.extend({
  mythLabel: z.string(),
  myth: z.string(),
  stamp: z.string(),
  factLabel: z.string(),
  fact: z.string(),
  stampAt: z.number().min(0),
  factAt: z.number().min(0),
});
type Props = z.infer<typeof mythFactSchema>;

const Stamp: React.FC<{ text: string; at: number; size: number }> = ({ text, at, size }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  // Hard 2-step slam (no easing): 130 % for 2 frames, then 100 %.
  const s = frame < at + 2 ? 1.3 : 1;
  return (
    <div
      style={{
        transform: `rotate(-9deg) scale(${s})`,
        border: `${Math.round(size / 9)}px solid ${piz.color.alert}`,
        color: piz.color.alert,
        font: `700 ${size}px ${piz.font.pixel}`,
        padding: `${Math.round(size * 0.08)}px ${Math.round(size * 0.3)}px`,
        letterSpacing: "0.06em",
        lineHeight: 1,
        background: "transparent",
      }}
    >
      {text}
    </div>
  );
};

export const MythFact: React.FC<Props> = (p) => {
  const { fps } = useVideoConfig();
  const { isVertical, safeBox, width, height } = useFormat();
  const stampAt = Math.round(p.stampAt * fps);
  const factAt = Math.round(p.factAt * fps);
  const fs = isVertical ? 56 : 52;
  const line = piz.ui.border;
  const half = (label: string, text: string, color: string, at: number, extra: React.ReactNode, align: "left" | "right") => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: align === "left" ? "flex-start" : "flex-end", gap: 20, position: "relative" }}>
      <TypeOn text={label} at={at} color={color} align={align} fontSize={isVertical ? 104 : 96} />
      <Drop at={at + Array.from(label).length + 2}>
        <div style={{ font: `700 ${fs}px ${piz.font.caption}`, color: piz.color.ink, lineHeight: 1.2, textAlign: align, maxWidth: isVertical ? safeBox.w - 40 : 700 }}>{text}</div>
      </Drop>
      {extra}
    </div>
  );
  const mythH = half(
    p.mythLabel,
    p.myth,
    piz.color.alert,
    4,
    <div style={{ position: "absolute", right: isVertical ? 10 : -40, bottom: isVertical ? -110 : -140 }}>
      <Stamp text={p.stamp} at={stampAt} size={isVertical ? 92 : 88} />
    </div>,
    "left",
  );
  const factH = half(
    p.factLabel,
    p.fact,
    piz.color.accent,
    factAt,
    <Drop at={factAt + Array.from(p.factLabel).length + 10}>
      <PixelIcon name="check" px={isVertical ? 8 : 7} />
    </Drop>,
    "right",
  );
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide} fit={ZONE_FIT}>
      {isVertical ? (
        <>
          <AbsoluteFill style={{ left: safeBox.x + 20, width: safeBox.w - 40, top: safeBox.y + 20, height: safeBox.h / 2 - 60, display: "flex", flexDirection: "column", justifyContent: "center" }}>{mythH}</AbsoluteFill>
          <div style={{ position: "absolute", left: 0, width, top: safeBox.y + safeBox.h / 2 - line / 2, height: line, background: piz.color.ink }} />
          <AbsoluteFill style={{ left: safeBox.x + 20, width: safeBox.w - 40, top: safeBox.y + safeBox.h / 2 + 50, height: safeBox.h / 2 - 60, display: "flex", flexDirection: "column", justifyContent: "center" }}>{factH}</AbsoluteFill>
        </>
      ) : (
        <>
          <AbsoluteFill style={{ left: safeBox.x, width: width / 2 - safeBox.x - 80, top: safeBox.y, height: safeBox.h, display: "flex", flexDirection: "column", justifyContent: "center" }}>{mythH}</AbsoluteFill>
          <div style={{ position: "absolute", top: 0, height, left: width / 2 - line / 2, width: line, background: piz.color.ink }} />
          <AbsoluteFill style={{ left: width / 2 + 80, width: width / 2 - safeBox.x - 80, top: safeBox.y, height: safeBox.h, display: "flex", flexDirection: "column", justifyContent: "center" }}>{factH}</AbsoluteFill>
        </>
      )}
      <Sfx kind="type" at={4} frames={Array.from(p.mythLabel).length + 2} on={p.sfx} />
      <Sfx kind="wrong" at={stampAt} on={p.sfx} />
      <Sfx kind="type" at={factAt} frames={Array.from(p.factLabel).length + 2} on={p.sfx} />
      <Sfx kind="correct" at={factAt + Array.from(p.factLabel).length + 10} on={p.sfx} />
    </Stage>
  );
};

export const mythFactVariants: Variant<Props>[] = [
  {
    id: "barata",
    horizontal: true,
    props: {
      ...base("board", 6),
      mythLabel: "MITO",
      myth: "Si la acción está barata, es buena inversión.",
      stamp: "FALSO",
      factLabel: "REALIDAD",
      fact: "Barata o cara depende de cuánto gana la empresa.",
      stampAt: 1.6,
      factAt: 2.6,
    },
  },
  {
    id: "ia-trabajo",
    horizontal: true,
    props: {
      ...base("board", 6),
      mythLabel: "MITO",
      myth: "La IA te va a quitar el trabajo.",
      stamp: "FALSO",
      factLabel: "REALIDAD",
      fact: "Te lo quita quien sepa usar la IA mejor que tú.",
      stampAt: 1.4,
      factAt: 2.4,
    },
  },
];
