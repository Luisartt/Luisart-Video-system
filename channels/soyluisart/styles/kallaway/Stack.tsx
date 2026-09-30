import { useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Box, KSfx, KbImage, Stage, StudioSet, Variant, WordTone, base, baseSchema, fitSize, genImage, textOnDark, toneFont, useFormat } from "./primitives";
import { kal } from "./theme";

// kal-stack — 2–3 stacked image cards, one per spoken word (ANALISIS §8, keyframes 14 and 18): each
// card appears DRY on its word (no animation) and the earlier ones stay; each carries one word in
// Inter 700 (a title) or Playfair Display Italic (emotion), white with a soft shadow on the image —
// the word is part of the card, no plate behind it. Cards: rounded 28 px, cover image with a slow
// push (each card image evenly dimmed a little, `dim`), on the dark set (StudioSet, not pure black:
// dark cards on #000 read as a dead frame — QA and Codex, 2026-09-28). Vertical: stacked inside the graphics zone (x 120–920, y 250–970); horizontal:
// side by side. Pick dark images: a white word on a light image does not read.
// Sound: ONE dry pop per card.

export type StackCard = { image: string; word: string; tone: "plain" | "serif" | "key"; at: number; position?: string; dim?: number };

/** Card boxes for n cards (vertical: stacked in y 250–970; horizontal: side by side in y 90–790). */
export const stackBoxes = (n: number, vertical: boolean): Box[] => {
  const gap = 24;
  if (vertical) {
    const h = Math.floor((720 - gap * (n - 1)) / n);
    const top = 250 + (720 - (h * n + gap * (n - 1))) / 2;
    return Array.from({ length: n }, (_, i) => ({ x: 120, y: top + i * (h + gap), w: 800, h }));
  }
  const w = Math.floor((1640 - gap * (n - 1)) / n);
  return Array.from({ length: n }, (_, i) => ({ x: 140 + i * (w + gap), y: 140, w, h: 600 }));
};

/** The stack; `frames[i]` = the frame card i appears on, in the caller's clock (`frame`). */
export const StackCards: React.FC<{ cards: StackCard[]; frames: number[]; frame: number; end: number; vertical: boolean }> = ({ cards, frames, frame, end, vertical }) => {
  const boxes = stackBoxes(cards.length, vertical);
  return (
    <>
      {cards.map((c, i) => {
        if (frame < frames[i]) return null;
        const b = boxes[i];
        const tone: WordTone = c.tone;
        const size = fitSize(c.word, b.w - 80, c.tone === "serif" ? 112 : kal.size.cardTitle, tone);
        return (
          <div key={i}>
            <KbImage src={c.image} box={b} from={frames[i]} to={end} dir={i % 2 ? "out" : "in"} position={c.position ?? "50% 50%"} radius={28} dim={c.dim ?? 0.18} />
            <div
              style={{
                position: "absolute",
                left: b.x,
                top: b.y,
                width: b.w,
                height: b.h,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                whiteSpace: "nowrap",
                ...toneFont(tone, size),
                ...textOnDark(tone, true),
              }}
            >
              {c.word}
            </div>
          </div>
        );
      })}
    </>
  );
};

export const stackSchema = baseSchema.extend({
  cards: z
    .array(z.object({ image: z.string(), word: z.string(), tone: z.enum(["plain", "serif", "key"]), at: z.number().min(0).describe("Seconds"), position: z.string().optional(), dim: z.number().min(0).max(0.6).optional() }))
    .min(2)
    .max(3),
});
type Props = z.infer<typeof stackSchema>;

export const KalStack: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { isVertical } = useFormat();
  const frames = p.cards.map((c) => Math.round(c.at * fps));
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      {p.backing === "black" ? <StudioSet box={{ x: 0, y: 0, w: isVertical ? 1080 : 1920, h: isVertical ? 1920 : 1080 }} glowSide="left" /> : null}
      <StackCards cards={p.cards} frames={frames} frame={frame} end={durationInFrames} vertical={isVertical} />
      {frames.map((f, i) => (
        <KSfx key={i} kind="card" at={f} on={p.sfx} />
      ))}
    </Stage>
  );
};

const common: Props = {
  ...base("black", 4),
  cards: [
    { image: genImage("s01-hook-llave-etiqueta"), word: "el precio", tone: "plain", at: 0.2, position: "50% 62%" },
    { image: genImage("s06-empresa-a-modesta-rica"), word: "las utilidades", tone: "serif", at: 1.2, position: "50% 64%", dim: 0.3 },
  ],
};

export const stackVariants: Variant<Props>[] = [
  { id: "two", props: common, horizontal: true },
  {
    id: "three",
    props: {
      ...common,
      cards: [
        { image: genImage("s06-empresa-a-modesta-rica"), word: "Empresa A", tone: "plain", at: 0.2, position: "50% 55%" },
        { image: genImage("s07-empresa-b-lujosa-vacia"), word: "Empresa B", tone: "plain", at: 0.9, position: "50% 60%" },
        { image: genImage("s08-frascos"), word: "¿cuál es más cara?", tone: "serif", at: 1.6 },
      ],
    },
    horizontal: true,
  },
];
