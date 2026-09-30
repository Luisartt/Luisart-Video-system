import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Sfx, Stage, Variant, base, baseSchema, clamp, useFormat } from "./primitives";
import { piz } from "./theme";

// Marker underline sweeping under text: a paragraph in bold ink (plain text, no box) where each
// highlight phrase gets a solid marker underline drawn left→right UNDER it, word by word, on its
// beat — never a band behind the letters (user rule d, Codex M5).

export const highlighterSchema = baseSchema.extend({
  text: z.string(),
  highlights: z.array(z.object({ phrase: z.string(), at: z.number().min(0).describe("Seconds") })).max(4),
  color: z.enum(["blue", "yellow"]),
  sweepFrames: z.number().min(4).max(30),
  fontSize: z.number().min(30).max(110),
});
type Props = z.infer<typeof highlighterSchema>;

const COLORS = { blue: piz.color.accent, yellow: "#E8B21E" };

export const Highlighter: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { isVertical, safeBox } = useFormat();
  const words = p.text.split(/\s+/);
  const lower = words.map((w) => w.toLowerCase());
  // Map each word to (highlight index, position in phrase, phrase length).
  const marks = new Map<number, { h: number; k: number; n: number }>();
  p.highlights.forEach((h, hi) => {
    const ph = h.phrase.toLowerCase().split(/\s+/);
    for (let i = 0; i + ph.length <= lower.length; i++) {
      if (ph.every((w, j) => lower[i + j] === w)) {
        ph.forEach((_, j) => marks.set(i + j, { h: hi, k: j, n: ph.length }));
        break;
      }
    }
  });
  const col = COLORS[p.color];
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <AbsoluteFill style={{ left: safeBox.x + (isVertical ? 10 : 160), width: safeBox.w - (isVertical ? 20 : 320), top: safeBox.y, height: safeBox.h, display: "flex", alignItems: "center" }}>
        <div style={{ font: `700 ${p.fontSize}px ${piz.font.caption}`, color: piz.color.ink, lineHeight: 1.32, letterSpacing: "-0.01em" }}>
          {words.map((w, i) => {
            const m = marks.get(i);
            let prog = 0;
            if (m) {
              const at = Math.round(p.highlights[m.h].at * fps);
              const per = p.sweepFrames / m.n;
              prog = interpolate(frame, [at + m.k * per, at + (m.k + 1) * per], [0, 100], clamp);
            }
            const next = marks.get(i + 1);
            const joinNext = m && next && next.h === m.h;
            return (
              <span key={i}>
                <span
                  style={{
                    // underline stroke under the baseline (descender zone), not behind the glyphs
                    backgroundImage: `linear-gradient(${col}, ${col})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: `${prog}% 0.1em`,
                    backgroundPosition: "0 96%",
                    paddingBottom: "0.08em",
                  }}
                >
                  {w}
                  {joinNext ? " " : ""}
                </span>
                {!joinNext && i < words.length - 1 ? " " : ""}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
      {p.highlights.map((h, i) => (
        <Sfx key={i} kind="highlight" at={Math.round(h.at * fps)} frames={p.sweepFrames + 4} on={p.sfx} />
      ))}
    </Stage>
  );
};

export const highlighterVariants: Variant<Props>[] = [
  {
    id: "blue",
    horizontal: true,
    props: {
      ...base("board", 5),
      text: "Una acción barata no significa que sea una buena inversión. Lo que importa es cuánto pagas por cada peso que gana la empresa.",
      highlights: [
        { phrase: "no significa", at: 0.6 },
        { phrase: "cuánto pagas por cada peso", at: 2 },
      ],
      color: "blue",
      sweepFrames: 12,
      fontSize: 64,
    },
  },
  {
    id: "yellow",
    horizontal: true,
    props: {
      ...base("board", 5),
      text: "La IA no te va a reemplazar. Te va a reemplazar alguien que sepa usar la IA mejor que tú.",
      highlights: [
        { phrase: "alguien que sepa usar la IA", at: 1.2 },
      ],
      color: "yellow",
      sweepFrames: 14,
      fontSize: 70,
    },
  },
];
