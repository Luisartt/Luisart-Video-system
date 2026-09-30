import { interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { baseSchema, clamp, DocFrame, ExitWipe, Footnote, formatNum, Rise, useFormat, Variant, DSfx } from "./primitives";
import { doc } from "./theme";

// Big caps number counting up, with an amber label over it, a short RGB-split kick on entry
// (opaque red/cyan copies, no blending) and the source footnote (plain serif type, no box behind it
// since 2026-09-27). Sample numbers always carry the "dato de ejemplo" source.

const numberItem = z.object({
  prefix: z.string(),
  value: z.number(),
  decimals: z.number().int().min(0).max(2),
  suffix: z.string(),
  caption: z.string().describe("Caps line under the number (versus); empty = none"),
  color: z.enum(["bone", "amber", "red"]),
});

export const bigNumberSchema = baseSchema.extend({
  label: z.string().describe("Amber caps label above"),
  numbers: z.array(numberItem).min(1).max(2),
  fontSize: z.number().min(100).max(340),
  footnote: z.string(),
  source: z.string().describe("Source name; keep 'dato de ejemplo' for sample figures"),
});
export type BigNumberProps = z.infer<typeof bigNumberSchema>;

const COUNT = [8, 26] as const;

export const BigNumber: React.FC<BigNumberProps> = ({ backing, preview, safeGuide, sfx, label, numbers, fontSize, footnote, source }) => {
  const frame = useCurrentFrame();
  const f = useFormat();
  const V = f.isVertical;
  const { color, font, shadow } = doc;
  const colours = { bone: color.bone, amber: color.amber, red: color.red };
  // Vertical: numbers stack; each is fitted to the zone width from its final (widest) text. The
  // numbers and the footnote both sit in the graphics zone (y 250–970), footnote at its foot.
  const G = f.zones.graphics;
  const FOOT = 130;
  const finalLen = Math.max(...numbers.map((n) => Array.from(`${n.prefix}${formatNum(n.value, n.decimals)}${n.suffix}`).length));
  const fs = V ? Math.min(Math.round(fontSize * 0.75), Math.floor((G.w - 30) / (finalLen * 0.64))) : fontSize;
  const numStyle: React.CSSProperties = {
    fontFamily: font.display,
    fontWeight: 900,
    fontSize: fs,
    lineHeight: 0.9,
    letterSpacing: "-0.03em",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  };
  const versus = numbers.length > 1;
  const settle = COUNT[1] + (numbers.length - 1) * 6;
  const hit = numbers.some((n) => n.value < 0 || n.color === "red") ? "braam" : numbers.some((n) => /\$/.test(n.prefix)) ? "kaching" : "boom";
  const sound = (
    <>
      <DSfx kind="ticking" at={COUNT[0]} frames={settle - COUNT[0]} on={sfx} />
      <DSfx kind={hit} at={settle} on={sfx} />
    </>
  );
  return (
    <DocFrame backing={backing} preview={preview} safeGuide={safeGuide}>
      <div
        style={{
          position: "absolute",
          left: V ? G.x : 0,
          top: V ? G.y : 0,
          width: V ? G.w : f.width,
          height: V ? G.h - FOOT : f.height,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          paddingBottom: V ? 0 : 90,
          boxSizing: "border-box",
        }}
      >
        <ExitWipe>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {label ? (
              <Rise delay={2}>
                <div
                  style={{
                    fontFamily: font.display,
                    fontWeight: 800,
                    fontSize: V ? 32 : 34,
                    letterSpacing: "0.14em",
                    lineHeight: V ? 1.3 : undefined,
                    textAlign: "center",
                    maxWidth: V ? G.w : undefined,
                    color: color.amber,
                    textShadow: shadow.small,
                  }}
                >
                  {label}
                </div>
              </Rise>
            ) : null}
            <div style={{ display: "flex", flexDirection: V ? "column" : "row", gap: versus ? (V ? 44 : 150) : 0, marginTop: 26, alignItems: V ? "center" : "flex-start" }}>
              {numbers.map((n, i) => {
                const d = i * 6;
                const v = interpolate(frame, [COUNT[0] + d, COUNT[1] + d], [0, n.value], { ...clamp, easing: doc.ease.land });
                const text = `${n.prefix}${formatNum(v, n.decimals)}${n.suffix}`;
                const s = interpolate(frame, [6 + d, 11 + d], [16, 0], clamp);
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: frame > 5 + d ? 1 : 0 }}>
                    <div style={{ position: "relative" }}>
                      {s > 0.5 ? (
                        <>
                          <div style={{ ...numStyle, color: color.red, position: "absolute", left: -s, top: 0 }}>{text}</div>
                          <div style={{ ...numStyle, color: color.cyan, position: "absolute", left: s, top: 0 }}>{text}</div>
                        </>
                      ) : null}
                      <div
                        style={{
                          ...numStyle,
                          color: colours[n.color],
                          position: "relative",
                          textShadow: shadow.title,
                          scale: String(interpolate(frame, [11, 150], [1, 1.04], clamp)),
                        }}
                      >
                        {text}
                      </div>
                    </div>
                    {n.caption ? (
                      <Rise delay={16 + d} style={{ marginTop: 22 }}>
                        <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 32, letterSpacing: "0.14em", color: color.bone, textShadow: shadow.small }}>
                          {n.caption}
                        </div>
                      </Rise>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </ExitWipe>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: V ? f.height - (G.y + G.h) : 118,
          left: V ? G.x : 0,
          right: V ? f.width - (G.x + G.w) : 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <ExitWipe>
          <Footnote
            text={footnote}
            source={source}
            progress={interpolate(frame, [24, 32], [0, 1], { ...clamp, easing: doc.ease.land })}
            style={V ? { fontSize: 28 } : { maxWidth: 1320 }}
          />
        </ExitWipe>
      </div>
      {sound}
    </DocFrame>
  );
};

const base = { backing: "green", preview: "c2-ticker", safeGuide: false, sfx: true } as const;
const sample = { footnote: "Cifra ilustrativa, no es una estadística real.", source: "dato de ejemplo" };

export const bigNumberVariants: Variant<BigNumberProps>[] = [
  {
    id: "percent",
    props: {
      ...base,
      ...sample,
      seconds: 5,
      label: "GASTO EN IA · EMPRESA TIPO · EN DOS AÑOS",
      numbers: [{ prefix: "+", value: 214, decimals: 0, suffix: " %", caption: "", color: "bone" }],
      fontSize: 300,
    },
  },
  {
    id: "money",
    props: {
      ...base,
      ...sample,
      seconds: 5,
      label: "INVERSIÓN ANUNCIADA EN CENTROS DE DATOS",
      numbers: [{ prefix: "US$", value: 500000, decimals: 0, suffix: " M", caption: "", color: "bone" }],
      fontSize: 215,
    },
  },
  {
    id: "versus",
    props: {
      ...base,
      ...sample,
      seconds: 5.5,
      label: "USUARIOS SEMANALES · MILLONES",
      numbers: [
        { prefix: "", value: 100, decimals: 0, suffix: " M", caption: "2023", color: "bone" },
        { prefix: "", value: 800, decimals: 0, suffix: " M", caption: "2025", color: "amber" },
      ],
      fontSize: 220,
    },
  },
  {
    id: "drop",
    props: {
      ...base,
      ...sample,
      seconds: 5,
      label: "CAÍDA EN BOLSA · UNA SOLA SESIÓN",
      numbers: [{ prefix: "", value: -38, decimals: 0, suffix: " %", caption: "", color: "red" }],
      fontSize: 300,
    },
  },
];
