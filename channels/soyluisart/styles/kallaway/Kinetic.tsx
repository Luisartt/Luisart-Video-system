import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { kalGeometry } from "./Layout";
import { Box, KSfx, KbImage, Stage, Variant, base, baseSchema, clamp, genImage, textOnDark, useFormat } from "./primitives";
import { kal, wideType } from "./theme";

// kal-kinetic — kinetic type over an image (ANALISIS §8, keyframes 10/11: "1700 / football fields
// / long"): one word per spoken word, each appearing DRY on its word, mixing Inter 700 (sans) and a
// thin Playfair Display Italic 500 (serif, −4 %); the main figure (Archivo 900 extended) slides in
// rotated over 15 f (Easing.out(exp), 300 px). White with a soft shadow on the image — no plate, no
// darkened band (over an image the WHOLE image is dimmed evenly). Lines are centred in the graphics
// zone (vertical y 250–970); the 'dato de ejemplo' label sits right under them. Sound: ONE subtle
// sound per shot — the figure's soft swipe, or a click on the first word if there is no figure. Sound: at most one
// subtle click per main word (≥ 6 f apart) and a soft swipe for the sliding figure.

export type KineticItem = { text: string; kind: "sans" | "serif" | "figure"; at: number; tone?: "plain" | "key" | "alert" };
export type KineticLine = { items: KineticItem[] };

const SIZE = { sans: kal.size.kineticSans, serif: kal.size.kineticSerif, figure: 150 };

/** The kinetic lines in `box`; `frames[l][i]` = frame item i of line l appears (caller's clock). */
export const KineticLines: React.FC<{ lines: KineticLine[]; frames: number[][]; frame: number; box: Box; scale?: number; source?: string }> = ({ lines, frames, frame, box, scale = 1, source }) => (
  <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 * scale }}>
    {lines.map((line, l) => (
      <div key={l} style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 24 * scale, whiteSpace: "nowrap" }}>
        {line.items.map((it, i) => {
          const at = frames[l][i];
          const on = frame >= at;
          const tone = it.tone ?? "plain";
          const col = textOnDark(tone === "plain" ? "plain" : tone, it.kind === "figure");
          if (it.kind === "figure") {
            const p = interpolate(frame, [at, at + kal.timing.kineticSlideFrames], [1, 0], { ...clamp, easing: kal.ease.slide });
            return (
              <span key={i} style={{ ...wideType(SIZE.figure * scale), ...col, display: "inline-block", visibility: on ? "visible" : "hidden", transform: `translateX(${(p * kal.timing.kineticSlidePx * scale).toFixed(1)}px) rotate(-6deg)` }}>
                {it.text}
              </span>
            );
          }
          const font: React.CSSProperties =
            it.kind === "serif"
              ? { fontFamily: kal.font.serif, fontStyle: "italic", fontWeight: 500, fontSize: SIZE.serif * scale, letterSpacing: "-0.04em" }
              : { fontFamily: kal.font.sans, fontWeight: 700, fontSize: SIZE.sans * scale, letterSpacing: "-0.02em" };
          return (
            <span key={i} style={{ ...font, ...col, visibility: on ? "visible" : "hidden", lineHeight: 1.05 }}>
              {it.text}
            </span>
          );
        })}
      </div>
    ))}
    {source ? (
      <div style={{ marginTop: 26 * scale, fontFamily: kal.font.sans, fontWeight: 600, fontSize: 36 * scale, color: kal.color.muted, textShadow: kal.text.shadow, whiteSpace: "nowrap" }}>{source}</div>
    ) : null}
  </div>
);

export const kineticSchema = baseSchema.extend({
  lines: z.array(z.object({ items: z.array(z.object({ text: z.string(), kind: z.enum(["sans", "serif", "figure"]), at: z.number().min(0).describe("Seconds"), tone: z.enum(["plain", "key", "alert"]).optional() })) })).min(1).max(4),
  image: z.string().describe("Image under media/ ('' = none, e.g. green)"),
  dir: z.enum(["in", "out"]).describe("Slow push in or out on the image"),
  pan: z.number().min(-1).max(1).describe("Horizontal drift -1 … 1 (× 12 px)"),
  source: z.string().describe("Small label under the lines ('dato de ejemplo · MXN' for example figures)"),
});
type Props = z.infer<typeof kineticSchema>;

export const KalKinetic: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { isVertical, zones } = useFormat();
  const g = kalGeometry(isVertical);
  const frames = p.lines.map((l) => l.items.map((it) => Math.round(it.at * fps)));
  const box: Box = { ...zones.graphics };
  // ONE subtle sound per kinetic shot (user rule 2026-09-28): the sliding figure if there is one,
  // else a click on the first word.
  const items = p.lines.flatMap((l, li) => l.items.map((it, i) => ({ it, f: frames[li][i] })));
  const fig = items.find((x) => x.it.kind === "figure");
  const first = [...items].sort((x, y) => x.f - y.f)[0];
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      {p.image ? <KbImage src={p.image} box={g.full} from={0} to={durationInFrames} dim={0.25} dir={p.dir} pan={p.pan} /> : null}
      <KineticLines lines={p.lines} frames={frames} frame={frame} box={box} scale={isVertical ? 1 : 0.9} source={p.source} />
      {fig ? <KSfx kind="figureSlide" at={fig.f} on={p.sfx} /> : first ? <KSfx kind="kinetic" at={first.f} on={p.sfx} /> : null}
    </Stage>
  );
};

const common: Props = {
  ...base("black", 4),
  image: genImage("s06-empresa-a-modesta-rica"),
  source: "dato de ejemplo · MXN",
  dir: "in",
  pan: 0,
  lines: [
    { items: [{ text: "vale", kind: "serif", at: 0.3 }, { text: "$20", kind: "figure", at: 0.5 }] },
    { items: [{ text: "gana", kind: "serif", at: 1.3 }, { text: "$10", kind: "sans", at: 1.5 }] },
    { items: [{ text: "por acción", kind: "serif", at: 2.1 }] },
  ],
};

export const kineticVariants: Variant<Props>[] = [
  { id: "image", props: common, horizontal: true },
  { id: "green", props: { ...common, backing: "green", image: "" }, horizontal: true },
];
