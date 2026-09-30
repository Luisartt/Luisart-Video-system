import { interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { baseSchema, clamp, DocFrame, ExitWipe, Rise, useFormat, Variant, words, DSfx, upperKeepName } from "./primitives";
import { doc } from "./theme";

// Quote: big amber quote mark lands, the Source Serif 4 italic quote appears word by word in bone
// (reading pace), then the caps attribution and serif role rise in.

export const quoteSchema = baseSchema.extend({
  quote: z.string(),
  author: z.string().describe("Shown in caps"),
  role: z.string().describe("Serif italic line after the author (empty = none)"),
  side: z.enum(["left", "right", "center"]),
  fontSize: z.number().min(36).max(96),
  maxWidth: z.number().min(600).max(1640),
  framesPerWord: z.number().min(1).max(8),
});
export type QuoteProps = z.infer<typeof quoteSchema>;

export const Quote: React.FC<QuoteProps> = ({ backing, preview, safeGuide, sfx, quote, author, role, side, fontSize: fontSizeH, maxWidth: maxWidthH, framesPerWord }) => {
  const frame = useCurrentFrame();
  const f = useFormat();
  const V = f.isVertical;
  const fontSize = V ? Math.round(fontSizeH * 0.85) : fontSizeH;
  const maxWidth = V ? Math.min(maxWidthH, f.zones.graphics.w) : maxWidthH;
  const { color, font, shadow } = doc;
  const ws = words(quote);
  const start = 8;
  const done = start + ws.length * framesPerWord;
  const align = side === "center" ? "center" : side === "right" ? "flex-end" : "flex-start";
  const G = f.zones.graphics;
  const sound = <DSfx kind="click" at={start + 1} on={sfx} />;
  return (
    <DocFrame backing={backing} preview={preview} safeGuide={safeGuide}>
      <div
        style={{
          position: "absolute",
          top: V ? G.y : 0,
          bottom: V ? f.height - (G.y + G.h) : 0,
          left: V ? G.x : doc.safe.x,
          right: V ? f.width - (G.x + G.w) : doc.safe.x,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: align,
        }}
      >
        <ExitWipe>
          <div style={{ maxWidth, display: "flex", flexDirection: "column", alignItems: align, textAlign: side === "center" ? "center" : side }}>
            <div
              style={{
                fontFamily: font.display,
                fontWeight: 900,
                fontStyle: "italic",
                fontSize: fontSize * 3.4,
                lineHeight: 0.62,
                height: fontSize * 1.5,
                color: color.amber,
                textShadow: shadow.text,
                opacity: frame > 1 ? 1 : 0,
                scale: String(interpolate(frame, [1, 6], [1.32, 1], { ...clamp, easing: doc.ease.land })),
                transformOrigin: "left top",
              }}
            >
              “
            </div>
            <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize, lineHeight: 1.28, color: color.bone, textShadow: shadow.small }}>
              {ws.map((w, i) => {
                const d = start + i * framesPerWord;
                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      marginRight: "0.26em",
                      opacity: frame > d ? 1 : 0,
                      translate: `0 ${interpolate(frame, [d, d + 5], [14, 0], { ...clamp, easing: doc.ease.land }).toFixed(2)}px`,
                    }}
                  >
                    {w}
                  </span>
                );
              })}
            </div>
            <Rise delay={done + 4} style={{ marginTop: 34 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: V ? "8px 18px" : 18, flexWrap: "wrap", justifyContent: align }}>
                <div style={{ width: 44, height: 5, background: color.amber, alignSelf: "center" }} />
                <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: V ? 28 : 30, letterSpacing: "0.14em", color: color.bone, textShadow: shadow.small }}>
                  {upperKeepName(author)}
                </div>
                {role ? <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 30, color: color.boneDim, textShadow: shadow.small }}>{role}</div> : null}
              </div>
            </Rise>
          </div>
        </ExitWipe>
      </div>
      {sound}
    </DocFrame>
  );
};

const base = { backing: "green", preview: "c1-datacenter", safeGuide: false, sfx: true } as const;

export const quoteVariants: Variant<QuoteProps>[] = [
  {
    id: "short",
    props: {
      ...base,
      seconds: 4.5,
      quote: "El dinero nunca duerme. Ahora tampoco piensa solo.",
      author: "Nombre del autor",
      role: "cargo · cita de ejemplo",
      side: "left",
      fontSize: 72,
      maxWidth: 1100,
      framesPerWord: 3,
    },
  },
  {
    id: "long",
    props: {
      ...base,
      seconds: 6,
      quote:
        "No vamos a notar el cambio el día que llegue. Lo notaremos años después, cuando miremos atrás y entendamos que todo empezó con una herramienta que parecía un juguete.",
      author: "Nombre del autor",
      role: "cargo · cita de ejemplo",
      side: "left",
      fontSize: 54,
      maxWidth: 1240,
      framesPerWord: 2,
    },
  },
];
