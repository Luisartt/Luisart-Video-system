import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { formatMx } from "../shared/text";
import { kalGeometry } from "./Layout";
import { Box, KSfx, KbImage, Stage, Variant, base, baseSchema, clamp, genImage, useFormat } from "./primitives";
import { alpha, kal, wideType } from "./theme";

// kal-counter — a figure that counts up (ANALISIS §8, keyframe 13: "13M" over a darkened B-roll):
// 26 frames with an ease-out, whole numbers in Mexican format (formatMx), the final figure fixed
// `counterLead` (4) frames before the word that names it. Figure in Archivo 900 extended, light blue
// with an ice halo that breathes ±3 %; a small Inter label above; "dato de ejemplo · MXN" under it
// (rule j). Over an image the WHOLE image is dimmed evenly (a grade, never a band behind the text).
// Sound: ONE subtle sound per counter event — the settle bleep (default) or the count bed.

export const counterSchema = baseSchema.extend({
  label: z.string().describe("Small label above the figure, e.g. 'P/U' or 'Empresa A · P/U'"),
  value: z.number(),
  from: z.number(),
  decimals: z.number().min(0).max(2),
  prefix: z.string(),
  suffix: z.string(),
  landAt: z.number().min(1).describe("Seconds of the word that names the figure (it settles 4 f before; ≥ 1 s so the 26 f count fits)"),
  source: z.string().describe("'dato de ejemplo · MXN' for example figures (rule j), or the real source"),
  image: z.string().describe("Image under media/ behind the counter ('' = none, e.g. green)"),
  area: z.enum(["full", "split"]).describe("full frame, or the top half of the split"),
  dir: z.enum(["in", "out"]).describe("Slow push in or out on the image"),
  pan: z.number().min(-1).max(1).describe("Horizontal drift -1 … 1 (× 12 px)"),
  sound: z.enum(["settle", "count"]),
});
type Props = z.infer<typeof counterSchema>;

export const counterTiming = (landFrame: number) => {
  const end = landFrame - kal.timing.counterLead;
  return { start: end - kal.timing.counterFrames, end };
};

/** The counter block centred in `box` (figure + label + source). `frame` in the same clock as landFrame. */
export const CounterBlock: React.FC<{
  frame: number;
  landFrame: number;
  box: Box;
  label: string;
  value: number;
  from: number;
  decimals: number;
  prefix: string;
  suffix: string;
  source: string;
  maxSize?: number;
}> = ({ frame, landFrame, box, label, value, from, decimals, prefix, suffix, source, maxSize = kal.size.counter }) => {
  const { start, end } = counterTiming(landFrame);
  const t = interpolate(frame, [start, end], [0, 1], { ...clamp, easing: kal.ease.count });
  const v = frame >= end ? value : from + (value - from) * t;
  const shown = decimals === 0 ? Math.round(v) : v;
  const finalText = `${prefix}${formatMx(value, decimals)}${suffix}`;
  const size = Math.min(maxSize, Math.floor((box.w - 40) / (Array.from(finalText).length * 0.8)));
  const breathe = 1 + 0.03 * Math.sin((2 * Math.PI * Math.max(0, frame - end)) / 45);
  if (frame < start) return null;
  return (
    <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: kal.font.sans, fontWeight: 700, fontSize: 64, color: kal.color.white, textShadow: kal.text.shadow, letterSpacing: "-0.01em" }}>{label}</div>
      <div
        style={{
          ...wideType(size),
          color: kal.color.accentBright,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
          marginTop: 10,
          textShadow: `${kal.text.shadow}, 0 0 ${Math.round(26 * breathe)}px ${alpha(kal.color.ice, 0.5 * breathe)}`,
          whiteSpace: "nowrap",
        }}
      >
        {prefix}
        {formatMx(shown, decimals)}
        {suffix}
      </div>
      {source ? <div style={{ fontFamily: kal.font.sans, fontWeight: 600, fontSize: 36, color: kal.color.muted, textShadow: kal.text.shadow, marginTop: 22 }}>{source}</div> : null}
    </div>
  );
};

export const KalCounter: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { isVertical, zones } = useFormat();
  const g = kalGeometry(isVertical);
  const land = Math.round(p.landAt * fps);
  const imgBox = p.area === "split" ? g.splitImage : g.full;
  // Text box: the graphics zone (vertical y 250–970; in the split, the image half above the seam).
  const box: Box = isVertical ? { x: zones.graphics.x, y: 250, w: zones.graphics.w, h: 700 } : p.area === "split" ? { x: 140, y: 90, w: g.splitImage.w - 280, h: 700 } : { ...zones.graphics };
  const { start, end } = counterTiming(land);
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      {p.image ? <KbImage src={p.image} box={imgBox} from={0} to={durationInFrames} dim={0.45} dir={p.dir} pan={p.pan} /> : null}
      <CounterBlock frame={frame} landFrame={land} box={box} label={p.label} value={p.value} from={p.from} decimals={p.decimals} prefix={p.prefix} suffix={p.suffix} source={p.source} />
      {p.sound === "count" ? <KSfx kind="count" at={start} frames={end - start} on={p.sfx} /> : <KSfx kind="settle" at={end} on={p.sfx} />}
    </Stage>
  );
};

const common: Props = {
  ...base("black", 4),
  label: "Empresa B · P/U",
  value: 50,
  from: 0,
  decimals: 0,
  prefix: "",
  suffix: "",
  landAt: 1.6,
  source: "dato de ejemplo · MXN",
  image: genImage("s07-empresa-b-lujosa-vacia"),
  area: "full",
  dir: "in",
  pan: 0,
  sound: "settle",
};

export const counterVariants: Variant<Props>[] = [
  { id: "image", props: common, horizontal: true },
  { id: "green", props: { ...common, backing: "green", image: "", label: "En 10 años tendrías", value: 36000, prefix: "$", suffix: " MXN", landAt: 1.8, source: "dato de ejemplo" }, horizontal: true },
];
