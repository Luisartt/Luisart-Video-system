import { useCurrentFrame } from "remotion";
import { z } from "zod";
import { accentColor, accentField, baseSchema, DocFrame, ExitWipe, isAccent, LandingWord, useFormat, Variant, words, DSfx } from "./primitives";
import { doc } from "./theme";

// Magnates-style keyword captions: bold caps words land one by one in short pages (hard cut
// between pages); the keyword is painted in the accent colour. 2026-09-27 (user feedback): no
// block/box behind any word — the former "box" highlight is gone; "underline" adds a hard accent
// rule under the keyword instead (a line, not a plate). Legibility = the hard key-safe shadow.

export const captionsSchema = baseSchema.extend({
  text: z.string().describe("Caption text (write it in caps)"),
  highlight: z.string().describe("Word(s) to highlight"),
  highlightStyle: z.enum(["text", "underline"]).describe("text = keyword in the accent colour · underline = accent colour + a hard accent rule under it"),
  accentColor: accentField,
  wordsPerPage: z.number().int().min(1).max(6),
  framesPerWord: z.number().min(2).max(20),
  fontSize: z.number().min(48).max(160),
  bottom: z.number().min(80).max(600).describe("Horizontal only: distance from the bottom edge (px). Vertical sits in the captions band (y 1000–1300, x 120–900)"),
});
export type CaptionsProps = z.infer<typeof captionsSchema>;

export const Captions: React.FC<CaptionsProps> = ({ backing, preview, safeGuide, sfx, text, highlight, highlightStyle, accentColor: ac, wordsPerPage, framesPerWord, fontSize: fontSizeH, bottom }) => {
  const frame = useCurrentFrame();
  const f = useFormat();
  const V = f.isVertical;
  const fontSize = V ? Math.round(fontSizeH * 0.9) : fontSizeH;
  const { color, font, shadow } = doc;
  const ws = words(text);
  const start = 4;
  const at = (i: number) => start + Math.round(i * framesPerWord);
  const pages = Math.ceil(ws.length / wordsPerPage);
  let page = 0;
  for (let p = 0; p < pages; p++) if (frame > at(p * wordsPerPage)) page = p;
  const from = page * wordsPerPage;
  const shown = ws.slice(from, from + wordsPerPage);
  const c = accentColor(ac);
  const hiIndex = ws.findIndex((w) => isAccent(w, highlight));
  const sound = hiIndex >= 0 ? <DSfx kind="popSharp" at={at(hiIndex) + 1} on={sfx} /> : null;
  return (
    <DocFrame backing={backing} preview={preview} safeGuide={safeGuide}>
      <div
        style={
          V
            ? { position: "absolute", left: f.zones.captions.x, width: f.zones.captions.w, top: f.zones.captions.y, height: f.zones.captions.h, display: "flex", justifyContent: "center", alignItems: "center" }
            : { position: "absolute", left: doc.safe.x, right: doc.safe.x, bottom, display: "flex", justifyContent: "center" }
        }
      >
        <ExitWipe>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.08em 0.24em",
              fontFamily: font.display,
              fontWeight: 900,
              fontSize,
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              color: color.bone,
              textShadow: shadow.title,
            }}
          >
            {shown.map((w, i) => {
              const hi = isAccent(w, highlight);
              const style: React.CSSProperties | undefined = !hi
                ? undefined
                : highlightStyle === "underline"
                  ? { color: c, textDecoration: "underline", textDecorationColor: c, textDecorationThickness: "0.09em", textUnderlineOffset: "0.1em", textDecorationSkipInk: "none" }
                  : { color: c };
              return (
                <LandingWord key={`${from}-${i}`} delay={at(from + i)} style={style}>
                  {w}
                </LandingWord>
              );
            })}
          </div>
        </ExitWipe>
      </div>
      {sound}
    </DocFrame>
  );
};

const base = { backing: "green", preview: "c2-ticker", safeGuide: false, sfx: true } as const;

export const captionsVariants: Variant<CaptionsProps>[] = [
  {
    id: "highlight-amber",
    props: {
      ...base,
      seconds: 4,
      text: "NADIE ESTABA MIRANDO CUANDO EL DINERO EMPEZÓ A MOVERSE",
      highlight: "DINERO",
      highlightStyle: "text",
      accentColor: "amber",
      wordsPerPage: 3,
      framesPerWord: 9,
      fontSize: 104,
      bottom: 150,
    },
  },
  {
    id: "highlight-red",
    props: {
      ...base,
      seconds: 4,
      text: "Y EN UNA SEMANA PERDIÓ LA MITAD DE SU VALOR",
      highlight: "MITAD",
      highlightStyle: "underline",
      accentColor: "red",
      wordsPerPage: 3,
      framesPerWord: 9,
      fontSize: 104,
      bottom: 150,
    },
  },
];
