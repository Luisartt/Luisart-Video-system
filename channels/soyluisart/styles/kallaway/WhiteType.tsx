import { useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Caret, KSfx, Stage, Variant, base, baseSchema, useFormat } from "./primitives";
import { kal } from "./theme";

// kal-white-type — the white screen with typed text (ANALISIS §8, keyframe 20 "Gro|"): pure white,
// Inter 700 in brand black typed 1 character per frame with a blue block caret that blinks every
// 15 f while idle; words listed in `accent` are typed in brand blue. A small plain label may sit
// under it (no pill: rule d). Centred in the graphics zone. Used for names and formulas
// ("P/U = precio ÷ utilidad"). Sound: ONE typing bed per white screen (its longest line).

export type TypedLine = { text: string; at: number; size: number; accent?: string };

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}/]/gu, "");

/** Typed lines + caret; `frames[i]` = start frame of line i in the caller's clock. */
export const TypedLines: React.FC<{ lines: TypedLine[]; frames: number[]; frame: number; label?: string; labelAt?: number; cy: number; x: number; w: number }> = ({
  lines,
  frames,
  frame,
  label,
  labelAt = 0,
  cy,
  x,
  w,
}) => {
  // The caret sits on the line being typed (or the last one started); before any line, on line 0.
  let active = 0;
  frames.forEach((f, i) => {
    if (frame >= f) active = i;
  });
  const typing = frame >= frames[active] && frame < frames[active] + Array.from(lines[active].text).length;
  return (
    <div style={{ position: "absolute", left: x, width: w, top: cy, transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      {lines.map((l, i) => {
        const n = Math.max(0, Math.min(Array.from(l.text).length, frame - frames[i] + 1));
        const shown = Array.from(l.text).slice(0, n).join("");
        const acc = (l.accent ?? "").split(/\s+/).filter(Boolean).map(norm);
        const tokens = shown.split(/(\s+)/);
        const visible = n > 0 || i === active;
        return (
          <div
            key={i}
            style={{
              fontFamily: kal.font.sans,
              fontWeight: 700,
              fontSize: l.size,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: kal.color.ink,
              whiteSpace: "nowrap",
              minHeight: l.size * 1.05,
              visibility: visible ? "visible" : "hidden",
            }}
          >
            {tokens.map((t, k) => (
              <span key={k} style={{ color: acc.includes(norm(t)) && norm(t) !== "" ? kal.color.accent : undefined }}>
                {t}
              </span>
            ))}
            {i === active ? <Caret height={Math.round(l.size * 0.9)} blink={!typing} /> : null}
          </div>
        );
      })}
      {label && frame >= labelAt ? <div style={{ fontFamily: kal.font.sans, fontWeight: 500, fontSize: 34, color: kal.color.mutedInk, marginTop: 14 }}>{label}</div> : null}
    </div>
  );
};

export const whiteTypeSchema = baseSchema.extend({
  lines: z.array(z.object({ text: z.string(), at: z.number().min(0).describe("Seconds"), size: z.number(), accent: z.string().optional() })).min(1).max(3),
  label: z.string(),
  labelAt: z.number(),
});
type Props = z.infer<typeof whiteTypeSchema>;

export const KalWhiteType: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { zones, isVertical } = useFormat();
  const frames = p.lines.map((l) => Math.round(l.at * fps));
  const longest = p.lines.reduce((best, l, i) => (Array.from(l.text).length > Array.from(p.lines[best].text).length ? i : best), 0);
  const g = zones.graphics;
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <TypedLines lines={p.lines} frames={frames} frame={frame} label={p.label} labelAt={Math.round(p.labelAt * fps)} cy={isVertical ? 600 : g.y + g.h / 2} x={g.x} w={g.w} />
      {/* ONE typing bed per white screen (user rule 2026-09-28): on its longest line. */}
      <KSfx kind="type" at={frames[longest]} frames={Array.from(p.lines[longest].text).length} on={p.sfx} />
    </Stage>
  );
};

const common: Props = {
  ...base("white", 4),
  lines: [
    { text: "P/U", at: 0.6, size: kal.size.white },
    { text: "precio ÷ utilidad", at: 1.3, size: 84, accent: "utilidad" },
  ],
  label: "múltiplo precio-utilidad",
  labelAt: 2.2,
};

export const whiteTypeVariants: Variant<Props>[] = [
  { id: "formula", props: common, horizontal: true },
  { id: "name", props: { ...common, lines: [{ text: "Luisart", at: 0.5, size: 200 }], label: "@soyluisart", labelAt: 1.1 }, horizontal: true },
];
