import { AbsoluteFill, useCurrentFrame } from "remotion";
import { z } from "zod";
import { HandNote, Sfx, Stage, Variant, base, baseSchema, isIn, useFormat } from "./primitives";
import { piz } from "./theme";

// Quote card: giant handwritten blue quotation mark, the quote in bold grotesk appearing word by
// word (key words in blue with a marker underline), then the author in handwriting. No card or
// plate behind the text — it sits straight on the board.

export const quoteCardSchema = baseSchema.extend({
  quote: z.string(),
  accent: z.string().describe("Words drawn in blue and underlined"),
  author: z.string(),
  context: z.string().describe("Small line under the author (source / \"verificar fuente\")"),
  framesPerWord: z.number().min(1).max(10),
});
type Props = z.infer<typeof quoteCardSchema>;

export const QuoteCard: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical, safeBox } = useFormat();
  const words = p.quote.split(/\s+/);
  const start = 8;
  const end = start + words.length * p.framesPerWord;
  const fs = isVertical ? 76 : 74;
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <AbsoluteFill style={{ left: safeBox.x + (isVertical ? 10 : 160), width: safeBox.w - (isVertical ? 20 : 320), top: safeBox.y, height: safeBox.h, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ font: `800 ${isVertical ? 300 : 260}px ${piz.font.heading}`, color: piz.color.accent, lineHeight: 0.8, height: isVertical ? 150 : 120, visibility: frame >= 2 ? "visible" : "hidden" }}>“</div>
        <div style={{ font: `700 ${fs}px ${piz.font.heading}`, color: piz.color.ink, lineHeight: 1.16, letterSpacing: "-0.015em" }}>
          {words.map((w, i) => {
            const vis = frame >= start + i * p.framesPerWord;
            const acc = isIn(w, p.accent);
            return (
              <span
                key={i}
                style={{
                  color: vis ? (acc ? piz.color.accent : piz.color.ink) : "transparent",
                  textDecoration: acc && frame >= end + 4 ? "underline" : undefined,
                  textDecorationColor: piz.color.accent,
                  textDecorationThickness: 8,
                  textUnderlineOffset: 12,
                }}
              >
                {w}
                {i < words.length - 1 ? " " : ""}
              </span>
            );
          })}
        </div>
        <div style={{ marginTop: 44 }}>
          <HandNote text={`— ${p.author}`} at={end + 8} fontSize={isVertical ? 72 : 66} align="left" />
          <div style={{ font: `500 28px ${piz.font.caption}`, color: piz.color.muted, marginTop: 8, visibility: frame >= end + 8 ? "visible" : "hidden" }}>{p.context}</div>
        </div>
      </AbsoluteFill>
      <Sfx kind="type" at={start} frames={words.length * p.framesPerWord} on={p.sfx} volume={0.18} />
      <Sfx kind="marker" at={end + 4} on={p.sfx} />
    </Stage>
  );
};

export const quoteCardVariants: Variant<Props>[] = [
  {
    id: "buffett",
    horizontal: true,
    props: {
      ...base("board", 6),
      quote: "El precio es lo que pagas. El valor es lo que obtienes.",
      accent: "precio valor",
      author: "Warren Buffett",
      context: "carta a accionistas de Berkshire Hathaway, 2008 (traducción)",
      framesPerWord: 4,
    },
  },
  {
    id: "cream",
    horizontal: true,
    props: {
      ...base("cream", 6),
      quote: "No ahorres lo que te queda después de gastar; gasta lo que te queda después de ahorrar.",
      accent: "ahorrar.",
      author: "frase popular",
      context: "atribuida a Warren Buffett sin fuente verificada",
      framesPerWord: 3,
    },
  },
];
