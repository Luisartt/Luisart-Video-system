import { AbsoluteFill, random, useVideoConfig } from "remotion";
import { z } from "zod";
import { Drop, HandNote, Sfx, Stage, Variant, base, baseSchema, useFormat } from "./primitives";
import { piz } from "./theme";

// Sticky notes on the board: square paper notes (yellow / blue / pink / green) with a strip of
// tape, handwritten text, slight rotation, landing one after another (drop 14 px + paper sound).
// "stack" overlaps them down the frame, "grid" lays them out 2×2 (4 across on horizontal).

const NOTE_COLORS = { yellow: "#FCE68A", blue: piz.color.tint, pink: "#FAD4D6", green: "#D5F2DC" } as const;
export const stickyNotesSchema = baseSchema.extend({
  title: z.string().describe("Handwritten line above the notes"),
  notes: z.array(z.object({ text: z.string(), color: z.enum(["yellow", "blue", "pink", "green"]) })).min(1).max(4),
  layout: z.enum(["stack", "grid"]),
  every: z.number().min(4).max(40).describe("Frames between notes"),
});
type Props = z.infer<typeof stickyNotesSchema>;

export const StickyNotes: React.FC<Props> = (p) => {
  const { isVertical, safeBox } = useFormat();
  useVideoConfig();
  const n = p.notes.length;
  const grid = p.layout === "grid";
  const cols = grid ? (isVertical ? 2 : Math.min(4, n)) : 1;
  const size = grid ? (isVertical ? 360 : 330) : isVertical ? 380 : 400;
  const start = 8;
  const note = (i: number) => {
    const nt = p.notes[i];
    const rot = (random(`sn${i}`) - 0.5) * 8;
    return (
      <div style={{ width: size, height: size, background: NOTE_COLORS[nt.color], transform: `rotate(${rot.toFixed(2)}deg)`, boxShadow: "0 10px 18px rgba(40,40,40,0.18)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: 34, boxSizing: "border-box" }}>
        <div style={{ position: "absolute", top: -18, left: "50%", width: size * 0.36, height: 40, marginLeft: -size * 0.18, background: "rgba(214,214,214,0.8)", transform: `rotate(${(-rot * 0.6).toFixed(1)}deg)` }} />
        <div style={{ font: `400 ${Math.round(size / 6.2)}px ${piz.font.hand}`, color: piz.color.ink, textAlign: "center", lineHeight: 1.08 }}>{nt.text}</div>
      </div>
    );
  };
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <AbsoluteFill style={{ left: safeBox.x, top: safeBox.y, width: safeBox.w, height: safeBox.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: grid ? 40 : 10 }}>
        {p.title ? <HandNote text={p.title} at={2} fontSize={isVertical ? 80 : 74} /> : null}
        {grid ? (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap: isVertical ? 40 : 50 }}>
            {p.notes.map((_, i) => (
              <Drop key={i} at={start + i * p.every} px={14}>
                {note(i)}
              </Drop>
            ))}
          </div>
        ) : (
          <div style={{ position: "relative", width: isVertical ? safeBox.w : safeBox.w, height: isVertical ? safeBox.h - 160 : safeBox.h - 140 }}>
            {p.notes.map((_, i) => {
              const x = isVertical ? (i % 2 === 0 ? 20 : safeBox.w - size - 20) : 80 + i * ((safeBox.w - size - 160) / Math.max(1, n - 1));
              const y = isVertical ? i * ((safeBox.h - 160 - size) / Math.max(1, n - 1)) : (i % 2) * 90 + 40;
              return (
                <Drop key={i} at={start + i * p.every} px={14} style={{ position: "absolute", left: x, top: y, zIndex: i }}>
                  {note(i)}
                </Drop>
              );
            })}
          </div>
        )}
      </AbsoluteFill>
      {p.notes.map((_, i) => (
        <Sfx key={i} kind="note" at={start + i * p.every} on={p.sfx} />
      ))}
    </Stage>
  );
};

const notes: Props["notes"] = [
  { text: "ahorra primero, gasta después", color: "yellow" },
  { text: "fondo de emergencia: 3 meses", color: "blue" },
  { text: "no inviertas lo que no entiendes", color: "pink" },
  { text: "automatiza tu ahorro", color: "green" },
];

export const stickyNotesVariants: Variant<Props>[] = [
  { id: "stack", props: { ...base("board", 5), title: "mis 4 reglas", notes, layout: "stack", every: 12 }, horizontal: true },
  { id: "grid", props: { ...base("board", 5), title: "apúntalo", notes, layout: "grid", every: 10 }, horizontal: true },
];
