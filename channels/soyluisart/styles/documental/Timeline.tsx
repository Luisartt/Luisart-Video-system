import { interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { accentColor, accentField, baseSchema, clamp, DocFrame, ExitWipe, Kicker, Rise, useFormat, Variant, DSfx } from "./primitives";
import { doc } from "./theme";

// Timeline: the bone line draws segment by segment and each year lands (1.32× → 1) as the line
// reaches its tick; a Source Serif label rises next to it.
// Horizontal: a line across the lower part of the frame. Vertical: a top-to-bottom line down the
// left of the graphics zone (y 250–970), years and labels to its right.

export const timelineSchema = baseSchema.extend({
  title: z.string().describe("Kicker above the line (empty = none)"),
  points: z.array(z.object({ year: z.string(), label: z.string() })).min(2).max(6),
  highlight: z.number().int().min(-1).max(5).describe("Index of the point in the accent colour (-1 = none)"),
  accentColor: accentField,
  lineY: z.number().min(500).max(900).describe("Horizontal only: vertical position of the line (px)"),
  segmentFrames: z.number().min(4).max(30),
});
export type TimelineProps = z.infer<typeof timelineSchema>;

export const Timeline: React.FC<TimelineProps> = ({ backing, preview, safeGuide, sfx, title, points, highlight, accentColor: ac, lineY, segmentFrames }) => {
  const frame = useCurrentFrame();
  const f = useFormat();
  const V = f.isVertical;
  const { color, font, shadow } = doc;
  const n = points.length;
  const tabH = title ? 90 : 0;
  // Axis: horizontal runs x0→x1 at lineY; vertical runs a0→a1 (y) at lineX.
  const G = f.zones.graphics;
  const a0 = V ? G.y + tabH + 20 : doc.safe.x + 20;
  const a1 = V ? G.y + G.h - 10 : 1920 - doc.safe.x - 20;
  const lineX = G.x + 16;
  const slot = (a1 - a0) / n;
  const pa = (i: number) => a0 + slot * (i + 0.5);
  const start = 8;
  const stops = [a0, ...points.map((_, i) => pa(i)), a1];
  let head = a0;
  for (let s = 0; s < stops.length - 1; s++) {
    const p = interpolate(frame, [start + s * segmentFrames, start + (s + 1) * segmentFrames], [0, 1], { ...clamp, easing: doc.ease.land });
    if (p > 0) head = stops[s] + (stops[s + 1] - stops[s]) * p;
  }
  const lands = (i: number) => start + (i + 1) * segmentFrames - Math.round(segmentFrames * 0.5);
  const yearSize = V ? 56 : 60;
  const sound = (
    <>
      {title ? <DSfx kind="click" at={2} volume={0.25} on={sfx} /> : null}
      {points.map((_, i) => (
        <DSfx key={i} kind="popMinimal" at={lands(i) + 1} on={sfx} />
      ))}
    </>
  );
  const tabIn = interpolate(frame, [2, 8], [0, 1], { ...clamp, easing: doc.ease.land });
  return (
    <DocFrame backing={backing} preview={preview} safeGuide={safeGuide}>
      <ExitWipe style={{ position: "absolute", inset: 0 }}>
        {title ? (
          <div style={{ position: "absolute", left: V ? G.x : a0, top: V ? G.y + 10 : lineY - 190 }}>
            <Kicker text={title} size={26} progress={tabIn} />
          </div>
        ) : null}
        <div
          style={
            V
              ? { position: "absolute", left: lineX - 2, top: a0, width: 5, height: head - a0, background: color.bone, boxShadow: shadow.small }
              : { position: "absolute", left: a0, top: lineY - 2, width: head - a0, height: 5, background: color.bone, boxShadow: shadow.small }
          }
        />
        {points.map((pt, i) => {
          const d = lands(i);
          const on = frame > d;
          const hi = i === highlight;
          const c = hi ? accentColor(ac) : color.bone;
          const sq = hi ? 30 : 20;
          const s = String(interpolate(frame, [d, d + 4], [1.32, 1], { ...clamp, easing: doc.ease.land }));
          const cx = V ? lineX : pa(i);
          const cy = V ? pa(i) : lineY;
          const year: React.CSSProperties = {
            fontFamily: font.display,
            fontWeight: 900,
            fontSize: yearSize,
            lineHeight: 1,
            letterSpacing: "-0.01em",
            color: c,
            textShadow: shadow.text,
            opacity: on ? 1 : 0,
            scale: s,
          };
          const label = (
            <Rise delay={d + 3}>
              <div
                style={{
                  fontFamily: font.serif,
                  fontStyle: "italic",
                  fontSize: V ? 32 : 30,
                  lineHeight: 1.22,
                  textAlign: V ? "left" : "center",
                  color: color.bone,
                  textShadow: shadow.small,
                }}
              >
                {pt.label}
              </div>
            </Rise>
          );
          return (
            <div key={i}>
              <div style={{ position: "absolute", left: cx - sq / 2, top: cy + 0.5 - sq / 2, width: sq, height: sq, background: c, opacity: on ? 1 : 0, scale: s, boxShadow: shadow.small }} />
              {V ? (
                <div style={{ position: "absolute", left: lineX + 40, width: G.x + G.w - lineX - 40, top: cy - yearSize * 0.55 }}>
                  <div style={{ ...year, transformOrigin: "left center" }}>{pt.year}</div>
                  <div style={{ marginTop: 8 }}>{label}</div>
                </div>
              ) : (
                <>
                  <div style={{ ...year, position: "absolute", left: cx - slot / 2, width: slot, top: lineY - 96, textAlign: "center" }}>{pt.year}</div>
                  <div style={{ position: "absolute", left: cx - slot / 2 + 12, width: slot - 24, top: lineY + 34, display: "flex", justifyContent: "center" }}>{label}</div>
                </>
              )}
            </div>
          );
        })}
      </ExitWipe>
      {sound}
    </DocFrame>
  );
};

const base = { backing: "green", preview: "c1-datacenter", safeGuide: false, sfx: true } as const;

export const timelineVariants: Variant<TimelineProps>[] = [
  {
    id: "3-points",
    props: {
      ...base,
      seconds: 5,
      title: "CÓMO EMPEZÓ",
      points: [
        { year: "2015", label: "Nace OpenAI como laboratorio sin ánimo de lucro" },
        { year: "2019", label: "Crea su brazo con fines de lucro" },
        { year: "2022", label: "Lanza ChatGPT" },
      ],
      highlight: 2,
      accentColor: "amber",
      lineY: 800,
      segmentFrames: 12,
    },
  },
  {
    id: "5-points",
    props: {
      ...base,
      seconds: 6,
      title: "LA CARRERA",
      points: [
        { year: "2017", label: "Artículo «Attention Is All You Need»" },
        { year: "2020", label: "GPT-3" },
        { year: "2022", label: "ChatGPT" },
        { year: "2023", label: "GPT-4 y Claude" },
        { year: "2025", label: "Agentes de IA" },
      ],
      highlight: 2,
      accentColor: "amber",
      lineY: 800,
      segmentFrames: 10,
    },
  },
];
