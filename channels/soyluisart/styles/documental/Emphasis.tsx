import { interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { accentField, baseSchema, clamp, DocFrame, ExitWipe, outline, Rise, textWidth, useFormat, Variant, words, wrapWords, DSfx } from "./primitives";
import { doc } from "./theme";

// Emphasis ("SIN FRENOS"): black italic caps in the accent colour settle from 1.12× while a thick
// accent marker stroke wipes in left→right under them; a Source Serif line rises below.
// 2026-09-27 (user rule, no boxes/bands behind text): the former solid amber/red bar is now this
// underline stroke (skewed to follow the italic); the words sit on the recording as plain type,
// legible through a thin opaque outline + the hard key-safe shadow.
// Vertical: a line that doesn't fit the zone width wraps into two lines (and shrinks if needed);
// everything sits in the graphics zone (y 250–970).

export const emphasisSchema = baseSchema.extend({
  bars: z
    .array(z.object({ text: z.string(), color: accentField }))
    .min(1)
    .max(3)
    .describe("One underlined line per entry (caps); color = text + underline colour"),
  subline: z.string().describe("Source Serif line under the words (empty = none)"),
  fontSize: z.number().min(60).max(220).describe("Horizontal size; vertical starts at 0.75× and fits the safe width"),
  position: z.enum(["center", "upper", "lower"]),
});
export type EmphasisProps = z.infer<typeof emphasisSchema>;

const EM = 0.7; // Archivo 900 italic caps, average advance per character

export const Emphasis: React.FC<EmphasisProps> = ({ backing, preview, safeGuide, sfx, bars, subline, fontSize, position }) => {
  const frame = useCurrentFrame();
  const f = useFormat();
  const { color, font, shadow } = doc;
  // Room for the italic overhang, the outline and the skewed stroke ends.
  const padX = (fs: number) => Math.round(fs * 0.3);
  // Vertical: split lines into sub-lines that fit, then shrink the size until the widest fits.
  let fs = f.isVertical ? Math.round(fontSize * 0.75) : fontSize;
  let rows = bars.map((b) => ({ text: b.text, color: b.color }));
  if (f.isVertical) {
    const maxW = f.zones.graphics.w;
    rows = bars.flatMap((b) => wrapWords(words(b.text), fs, maxW - padX(fs), EM).map((ws) => ({ text: ws.join(" "), color: b.color })));
    const widest = Math.max(...rows.map((r) => textWidth(r.text, fs, EM) + padX(fs)));
    if (widest > maxW) fs = Math.floor(fs * (maxW / widest));
  }
  const n = rows.length;
  const lastBar = 4 + (n - 1) * 8;
  // One strong accent per element: the hit lands when the last line's stroke reaches full width.
  const sound = (
    <>
      {rows.map((_, i) => (
        <DSfx key={i} kind="highlighter" at={4 + i * 8} frames={6} on={sfx} />
      ))}
      <DSfx kind={rows[n - 1].color === "red" ? "braam" : "bassHit"} at={lastBar + 5} on={sfx} />
    </>
  );
  const justify = position === "center" ? "center" : position === "upper" ? "flex-start" : "flex-end";
  const stagger = f.isVertical ? 36 : 90;
  const box = f.isVertical
    ? { left: f.zones.graphics.x, top: f.zones.graphics.y, width: f.zones.graphics.w, height: f.zones.graphics.h, padding: 20 }
    : { left: 0, top: 0, width: f.width, height: f.height, padding: `${doc.safe.y + 40}px ${doc.safe.x}px` };
  return (
    <DocFrame backing={backing} preview={preview} safeGuide={safeGuide}>
      <div style={{ position: "absolute", ...box, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: justify, alignItems: "center" }}>
        <ExitWipe>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {rows.map((b, i) => {
              const d = 4 + i * 8;
              const p = interpolate(frame, [d, d + 5], [0, 1], { ...clamp, easing: doc.ease.land });
              const shift = n > 1 ? (i - (n - 1) / 2) * stagger : 0;
              const c = b.color === "red" ? color.red : color.amber;
              return (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    fontSize: fs,
                    padding: `0 ${Math.round(fs * 0.12)}px ${Math.round(fs * 0.1)}px ${Math.round(fs * 0.06)}px`,
                    // Same left→right wipe the bar had, now revealing the words and their stroke.
                    clipPath: p >= 1 ? undefined : `inset(-30% ${((1 - p) * 100).toFixed(2)}% -30% -10%)`,
                    visibility: p > 0 ? "visible" : "hidden",
                    translate: `${shift}px 0`,
                    marginTop: i === 0 ? 0 : Math.round(fs * 0.1),
                  }}
                >
                  {/* Marker stroke under the words (drawn first, so the letters sit on top of it). */}
                  <div
                    style={{
                      position: "absolute",
                      left: "0.02em",
                      right: "0.04em",
                      top: "0.93em",
                      height: "0.1em",
                      background: c,
                      transform: "skewX(-14deg)",
                      boxShadow: shadow.text,
                    }}
                  />
                  <div
                    style={{
                      ...outline(fs),
                      position: "relative",
                      fontFamily: font.display,
                      fontWeight: 900,
                      fontStyle: "italic",
                      lineHeight: 1.05,
                      letterSpacing: "-0.01em",
                      whiteSpace: "nowrap",
                      color: c,
                      textShadow: shadow.title,
                      scale: String(interpolate(frame, [d + 2, d + 6], [1.12, 1], { ...clamp, easing: doc.ease.land })),
                    }}
                  >
                    {b.text}
                  </div>
                </div>
              );
            })}
            {subline ? (
              <Rise delay={lastBar + 8} style={{ marginTop: f.isVertical ? 28 : 34 }}>
                <div
                  style={{
                    ...outline(40),
                    fontFamily: font.serif,
                    fontSize: f.isVertical ? 38 : 40,
                    lineHeight: f.isVertical ? 1.25 : undefined,
                    color: color.bone,
                    textShadow: shadow.small,
                    whiteSpace: f.isVertical ? "normal" : "nowrap",
                    maxWidth: f.isVertical ? f.zones.graphics.w - 40 : undefined,
                    textAlign: "center",
                  }}
                >
                  {subline}
                </div>
              </Rise>
            ) : null}
          </div>
        </ExitWipe>
      </div>
      {sound}
    </DocFrame>
  );
};

const base = { backing: "green", preview: "c2-ticker", safeGuide: false, sfx: true } as const;

export const emphasisVariants: Variant<EmphasisProps>[] = [
  {
    id: "yellow",
    props: { ...base, seconds: 3.5, bars: [{ text: "SIN FRENOS", color: "amber" }], subline: "Los algoritmos ya operan sin pedir permiso.", fontSize: 176, position: "center" },
  },
  {
    id: "red",
    props: { ...base, seconds: 3.5, bars: [{ text: "ALERTA ROJA", color: "red" }], subline: "Y casi nadie lo está mirando.", fontSize: 176, position: "center" },
  },
  {
    id: "stacked",
    props: {
      ...base,
      seconds: 4,
      bars: [
        { text: "NADIE", color: "amber" },
        { text: "LO VIO VENIR", color: "red" },
      ],
      subline: "Ni los bancos, ni los gobiernos.",
      fontSize: 150,
      position: "center",
    },
  },
];
