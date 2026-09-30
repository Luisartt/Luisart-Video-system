import { useVideoConfig } from "remotion";
import { z } from "zod";
import { kalGeometry } from "./Layout";
import { KbImage, Stage, Variant, base, baseSchema, genImage, useFormat } from "./primitives";

// kal-image — a B-roll still (ChatGPT, ANALISIS §S.8) with the slow push, the ONLY camera move of
// the style (user decision 2026-09-28): scale 1.00 → 1.06 over the shot (+ an optional 12 px pan),
// alternating in / out between consecutive shots. Areas: the split's top half (y 0–968, cover of a
// 1:1 image), full frame (2:3 image) or the 9:16 card. `dim` darkens the WHOLE image evenly (for a
// counter or kinetic type on top) — never a gradient band at the bottom (rule d; user 2026-09-28).
// Plain image swaps are silent (as he does).

export const imageSchema = baseSchema.extend({
  image: z.string(),
  area: z.enum(["split", "full", "card"]),
  dir: z.enum(["in", "out"]),
  pan: z.number().min(-1).max(1).describe("Horizontal drift: -1 left … 1 right (× 12 px)"),
  dim: z.number().min(0).max(0.6),
  position: z.string(),
});
type Props = z.infer<typeof imageSchema>;

export const KalImage: React.FC<Props> = (p) => {
  const { durationInFrames } = useVideoConfig();
  const { isVertical } = useFormat();
  const g = kalGeometry(isVertical);
  const box = p.area === "split" ? g.splitImage : p.area === "card" ? g.card : g.full;
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <KbImage src={p.image} box={box} from={0} to={durationInFrames} dir={p.dir} pan={p.pan} dim={p.dim} position={p.position} radius={p.area === "card" ? g.cardR : 0} />
    </Stage>
  );
};

const common: Props = { ...base("black", 3), image: genImage("s02-dos-anos-estudio"), area: "split", dir: "in", pan: 0, dim: 0, position: "50% 50%" };

export const imageVariants: Variant<Props>[] = [
  { id: "split-in", props: common, horizontal: true },
  { id: "full-out-pan", props: { ...common, area: "full", image: genImage("s07-empresa-b-lujosa-vacia"), dir: "out", pan: -1 }, horizontal: true },
  { id: "card-dim", props: { ...common, area: "card", image: genImage("s09-mas-cara-balanza"), dim: 0.35 }, horizontal: true },
];
