import { useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Bit, Drop, PixelBubble, Stage, StickFigure, Variant, base, baseSchema, bitExpressionField, poseField, stickExpressionField, stickVariantField, useFormat } from "./primitives";
import { piz } from "./theme";

// Vertical content extent on the sheet (measured on the renders) → fitted into the graphics zone
// y 250–970 by <Stage fit> (user rule 2026-09-27, Codex H6).
const ZONE_FIT = [806, 1354] as const;

// Human ↔ AI sketch: a line stick figure and Bit (our pixel AI) on a ground line; each line of the
// dialogue pops a pixel speech bubble over its speaker with the text typed at 1 char/frame
// (the word being typed underlined). Poses/expressions swap on a hard frame with each line.

const lineSchema = z.object({
  who: z.enum(["human", "bot"]),
  text: z.string(),
  at: z.number().min(0).describe("Seconds"),
  pose: poseField,
  expression: bitExpressionField,
  humanExpression: stickExpressionField.optional().describe("Stick figure face on this line (default: happy). Bot lines use `expression` (Bit)"),
});
export const stickDialogueSchema = baseSchema.extend({ stickVariant: stickVariantField.optional().describe("marcador | pixel | caracter (default caracter)"), lines: z.array(lineSchema).min(1).max(6) });
type Props = z.infer<typeof stickDialogueSchema>;

export const StickDialogue: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { isVertical, safeBox, width } = useFormat();
  const starts = p.lines.map((l) => Math.round(l.at * fps));
  let idx = -1;
  starts.forEach((s, i) => {
    if (frame >= s) idx = i;
  });
  const cur = idx >= 0 ? p.lines[idx] : null;
  const lastHuman = [...p.lines.slice(0, idx + 1)].reverse().find((l) => l.who === "human");
  const lastBot = [...p.lines.slice(0, idx + 1)].reverse().find((l) => l.who === "bot");
  const groundY = safeBox.y + safeBox.h - (isVertical ? 90 : 60);
  const figH = isVertical ? 420 : 400;
  const bitPx = isVertical ? 13 : 12;
  const bitW = 20 * bitPx;
  const humanX = isVertical ? safeBox.x : safeBox.x + 260;
  const bitX = isVertical ? safeBox.x + safeBox.w - bitW - 10 : safeBox.x + safeBox.w - bitW - 260;
  const bubbleW = isVertical ? 600 : 760;
  const botBubbleW = isVertical ? 520 : 760;
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide} fit={ZONE_FIT}>
      <div style={{ position: "absolute", left: 0, width, top: groundY, height: 5, background: piz.color.ink }} />
      <div style={{ position: "absolute", left: humanX, top: groundY - figH }}>
        <Drop at={2}>
          <StickFigure h={figH} pose={lastHuman?.pose ?? "stand"} variant={p.stickVariant} expression={lastHuman?.humanExpression ?? "happy"} />
        </Drop>
      </div>
      <div style={{ position: "absolute", left: bitX, top: groundY - 20 * bitPx - Math.round(bitPx * 3.8) }}>
        <Drop at={6}>
          <Bit px={bitPx} expression={lastBot?.expression ?? "neutral"} />
        </Drop>
      </div>
      {cur ? (
        <div
          key={idx}
          style={{
            position: "absolute",
            left: cur.who === "human" ? safeBox.x + (isVertical ? 0 : 160) : undefined,
            right: cur.who === "bot" ? width - (safeBox.x + safeBox.w) + (isVertical ? 0 : 160) : undefined,
            width: cur.who === "human" ? bubbleW : botBubbleW,
            // Bubble bottom sits above the speaker's head.
            top: cur.who === "human" ? groundY - figH - 70 : groundY - 20 * bitPx - 110,
            transform: "translateY(-100%)",
            display: "flex",
            justifyContent: cur.who === "human" ? "flex-start" : "flex-end",
          }}
        >
          <PixelBubble text={cur.text} at={starts[idx]} tail={cur.who === "human" ? "left" : "right"} maxWidth={cur.who === "human" ? bubbleW : botBubbleW} fontSize={isVertical ? 50 : 46} sfx={p.sfx} />
        </div>
      ) : null}
    </Stage>
  );
};

export const stickDialogueVariants: Variant<Props>[] = [
  {
    id: "human-ai",
    horizontal: true,
    props: {
      ...base("board", 7),
      lines: [
        { who: "human", text: "¿Me haces el presupuesto del mes?", at: 0.3, pose: "wave", expression: "neutral", humanExpression: "happy" },
        { who: "bot", text: "Claro. ¿Cuánto ganas y cuánto gastas?", at: 2.1, pose: "wave", expression: "happy" },
        { who: "human", text: "Eh… no tengo ni idea.", at: 4.2, pose: "question", expression: "surprised", humanExpression: "thinking" },
        { who: "bot", text: "Pues empecemos por ahí.", at: 5.5, pose: "question", expression: "happy" },
      ],
    },
  },
];
