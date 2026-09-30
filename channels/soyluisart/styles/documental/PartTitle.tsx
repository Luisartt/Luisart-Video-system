import { interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { accentColor, accentField, baseSchema, clamp, DocFrame, ExitWipe, isAccent, Kicker, LandingWord, useFormat, Variant, words, wrapWords, DSfx } from "./primitives";
import { doc } from "./theme";

// "PARTE N" kicker wipes in, then bold caps title words land one by one; one accent word in
// amber. From the prototype's chapter beat (138 px Archivo 900, kicker 34 px Archivo 800).
// Since 2026-09-27 (user rule, no plates behind text) the kicker is plain bone caps between short
// amber rules instead of a filled bone tab.
// Vertical: the same words re-flow into more, shorter lines; the centre card sits in the graphics
// zone (y 250–970); the lower layout sits at the foot of that zone (never in the captions band).

export const partTitleSchema = baseSchema.extend({
  part: z.string().describe("Kicker above the title, e.g. PARTE 1 (empty = none)"),
  lines: z.array(z.string()).min(1).max(3).describe("Title lines (write them in caps); vertical re-flows them"),
  accent: z.string().describe("Word(s) painted in the accent colour"),
  accentColor: accentField,
  layout: z.enum(["center", "lower"]).describe("center = full chapter card · lower = smaller, lower-third position"),
  fontSize: z.number().min(40).max(200).describe("Horizontal size; vertical uses 0.8× (center) / 0.95× (lower)"),
});
export type PartTitleProps = z.infer<typeof partTitleSchema>;

export const PartTitle: React.FC<PartTitleProps> = ({ backing, preview, safeGuide, sfx, part, lines, accent, accentColor: ac, layout, fontSize }) => {
  const frame = useCurrentFrame();
  const f = useFormat();
  const { color, font, shadow } = doc;
  const lower = layout === "lower";
  const fs = f.isVertical ? Math.round(fontSize * (lower ? 0.95 : 0.8)) : fontSize;
  const rows: string[][] = f.isVertical ? wrapWords(lines.flatMap(words), fs, f.zones.graphics.w - 10, 0.72) : lines.map(words);
  const tab = interpolate(frame, [6, 12], [0, 1], { ...clamp, easing: doc.ease.land });
  const title: React.CSSProperties = {
    fontFamily: font.display,
    fontWeight: 900,
    fontSize: fs,
    lineHeight: 1.0,
    letterSpacing: "-0.01em",
    color: color.bone,
    textShadow: lower ? shadow.text : shadow.title,
    display: "flex",
    gap: "0.24em",
    justifyContent: lower ? "flex-start" : "center",
    whiteSpace: "nowrap",
  };
  let k = 0;
  const tabSize = lower ? 26 : f.isVertical ? 30 : 34;
  const block = (
    <ExitWipe>
      <div style={{ display: "flex", flexDirection: "column", alignItems: lower ? "flex-start" : "center" }}>
        {part ? <Kicker text={part} size={tabSize} progress={tab} rules={lower ? "left" : "both"} style={{ marginBottom: lower ? 22 : 34 }} /> : null}
        {rows.map((row, li) => (
          <div key={li} style={{ ...title, marginTop: li === 0 ? 0 : Math.round(fs * 0.06) }}>
            {row.map((w, wi) => {
              const delay = (part ? 14 : 6) + k * 5 + li * 2;
              k++;
              return (
                <LandingWord key={`${w}-${wi}`} delay={delay} style={isAccent(w, accent) ? { color: accentColor(ac) } : undefined}>
                  {w}
                </LandingWord>
              );
            })}
          </div>
        ))}
      </div>
    </ExitWipe>
  );
  const { graphics } = f.zones;
  const firstWord = (part ? 14 : 6) + 1;
  const sound = (
    <>
      {part ? <DSfx kind="click" at={6} volume={0.25} on={sfx} /> : null}
      <DSfx kind="boom" at={firstWord} on={sfx} />
    </>
  );
  return (
    <DocFrame backing={backing} preview={preview} safeGuide={safeGuide}>
      {lower ? (
        <div style={{ position: "absolute", left: f.isVertical ? graphics.x + 10 : doc.safe.x + 10, bottom: f.isVertical ? f.height - (graphics.y + graphics.h) : 150 }}>{block}</div>
      ) : (
        <div
          style={{
            position: "absolute",
            left: f.isVertical ? graphics.x : 0,
            top: f.isVertical ? graphics.y : 0,
            width: f.isVertical ? graphics.w : f.width,
            height: f.isVertical ? graphics.h : f.height,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {block}
        </div>
      )}
      {sound}
    </DocFrame>
  );
};

const base = { backing: "green", preview: "c1-datacenter", safeGuide: false, sfx: true } as const;

export const partTitleVariants: Variant<PartTitleProps>[] = [
  {
    id: "one-line",
    props: { ...base, seconds: 4, part: "PARTE 2", lines: ["EL GRAN DESPEGUE"], accent: "DESPEGUE", accentColor: "amber", layout: "center", fontSize: 138 },
  },
  {
    id: "two-line",
    props: {
      ...base,
      seconds: 4.5,
      part: "PARTE 1",
      lines: ["LA IA YA ESTÁ", "MOVIENDO TU DINERO"],
      accent: "DINERO",
      accentColor: "amber",
      layout: "center",
      fontSize: 138,
    },
  },
  {
    id: "lower",
    props: { ...base, seconds: 4, part: "PARTE 3", lines: ["QUIÉN GANA LA CARRERA"], accent: "CARRERA", accentColor: "amber", layout: "lower", fontSize: 76 },
  },
];
