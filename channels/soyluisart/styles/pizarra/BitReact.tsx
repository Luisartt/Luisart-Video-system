import { AbsoluteFill, useCurrentFrame } from "remotion";
import { z } from "zod";
import { Bit, Drop, HandNote, PixelArt, PixelIcon, Sfx, Stage, Variant, base, baseSchema, useFormat } from "./primitives";
import { piz } from "./theme";

// Bit reacting: our pixel AI on the board with a reaction above its antenna —
// thinking: a pixel thought cloud whose three dots light up in turn; idea: a light bulb pops with
// rays (+ding); warning: a warning sign pops and Bit turns sad (+buzz). Hand note under it.

export const bitReactSchema = baseSchema.extend({
  reaction: z.enum(["thinking", "idea", "warning"]),
  note: z.string(),
  reactAt: z.number().min(0).describe("Seconds"),
});
type Props = z.infer<typeof bitReactSchema>;

const CLOUD = [
  "....KKKKKKKKKKKK....",
  "..KKWWWWWWWWWWWWKK..",
  ".KWWWWWWWWWWWWWWWWK.",
  "KWWWWWWWWWWWWWWWWWWK",
  "KWWWWWWWWWWWWWWWWWWK",
  "KWWWWWWWWWWWWWWWWWWK",
  ".KWWWWWWWWWWWWWWWWK.",
  "..KKWWWWWWWWWWWWKK..",
  "....KKKKKKKKKKKK....",
];

const Rays: React.FC<{ size: number; at: number }> = ({ size, at }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const len = Math.round(size * 0.2);
  const t = Math.round(size / 26);
  return (
    <>
      {[0, 40, 90, 140, 180].map((deg) => {
        const a = (deg * Math.PI) / 180;
        const r = size * 0.72;
        return <div key={deg} style={{ position: "absolute", left: Math.round(size / 2 + Math.cos(a) * r - len / 2), top: Math.round(size / 2 - Math.sin(a) * r - t / 2), width: len, height: t, background: "#F7D774", transform: `rotate(${-deg}deg)` }} />;
      })}
    </>
  );
};

export const BitReact: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical, safeBox } = useFormat();
  const react = Math.round(p.reactAt * 30);
  const bitPx = isVertical ? 16 : 14;
  const iconPx = isVertical ? 11 : 10;
  const expr = frame < react ? "neutral" : p.reaction === "idea" ? "happy" : p.reaction === "warning" ? "sad" : "neutral";
  const dot = (k: number) => {
    const lit = frame >= react && Math.floor((frame - react) / 8) % 4 > k;
    return <div key={k} style={{ width: iconPx * 2, height: iconPx * 2, background: lit ? piz.color.accent : piz.color.pending }} />;
  };
  const above =
    p.reaction === "thinking" ? (
      <div style={{ position: "relative" }}>
        <PixelArt rows={CLOUD} px={iconPx} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: iconPx * 2 }}>{[0, 1, 2].map(dot)}</div>
        <div style={{ position: "absolute", left: iconPx * 4, top: iconPx * 10, width: iconPx * 2, height: iconPx * 2, background: piz.color.white, border: `${Math.round(iconPx / 2)}px solid ${piz.color.ink}` }} />
      </div>
    ) : (
      <div style={{ position: "relative", width: 16 * iconPx, height: 16 * iconPx }}>
        {p.reaction === "idea" ? <Rays size={16 * iconPx} at={react + 12} /> : null}
        <PixelIcon name={p.reaction === "idea" ? "bulb" : "warning"} px={iconPx} />
      </div>
    );
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <AbsoluteFill style={{ left: safeBox.x, width: safeBox.w, top: safeBox.y, height: safeBox.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
        <div style={{ height: 16 * iconPx + 20, display: "flex", alignItems: "flex-end" }}>
          <Drop at={react}>{above}</Drop>
        </div>
        <Drop at={2}>
          <Bit px={bitPx} expression={expr} />
        </Drop>
        <div style={{ marginTop: 20 }}>
          <HandNote text={p.note} at={react + 10} fontSize={isVertical ? 76 : 72} color={p.reaction === "warning" ? piz.color.alert : piz.color.accentDark} />
        </div>
      </AbsoluteFill>
      <Sfx kind="pop" at={2} on={p.sfx} volume={0.2} />
      {p.reaction === "thinking" ? <Sfx kind="bubble" at={react} on={p.sfx} /> : null}
      {p.reaction === "idea" ? <Sfx kind="ding" at={react} on={p.sfx} /> : null}
      {p.reaction === "warning" ? <Sfx kind="error" at={react} on={p.sfx} volume={0.15} /> : null}
    </Stage>
  );
};

export const bitReactVariants: Variant<Props>[] = [
  { id: "thinking", props: { ...base("board", 4), reaction: "thinking", note: "déjame pensarlo…", reactAt: 0.5 }, horizontal: true },
  { id: "idea", props: { ...base("board", 4), reaction: "idea", note: "¡ya sé cómo ahorrarte horas!", reactAt: 0.6 }, horizontal: true },
  { id: "warning", props: { ...base("board", 4), reaction: "warning", note: "ojo: eso te cobra comisión", reactAt: 0.6 }, horizontal: true },
];
