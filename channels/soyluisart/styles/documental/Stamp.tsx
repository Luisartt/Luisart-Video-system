import { interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { baseSchema, clamp, DocFrame, ExitWipe, revealRight, Rise, useFormat, Variant, DSfx } from "./primitives";
import { doc } from "./theme";

// Date / place / chapter stamp: an amber rule draws, then widely spaced caps type in letter by
// letter behind an amber block cursor; an optional Source Serif italic line rises under it.

export const stampSchema = baseSchema.extend({
  text: z.string().describe("Caps line typed in, e.g. SAN FRANCISCO · 2015"),
  sub: z.string().describe("Serif italic line under it (empty = none)"),
  position: z.enum(["top-left", "top-right", "bottom-left", "bottom-right"]),
  fontSize: z.number().min(24).max(80),
  framesPerChar: z.number().min(0.5).max(4),
});
export type StampProps = z.infer<typeof stampSchema>;

export const Stamp: React.FC<StampProps> = ({ backing, preview, safeGuide, sfx, text, sub, position, fontSize: fontSizeH, framesPerChar }) => {
  const frame = useCurrentFrame();
  const f = useFormat();
  const V = f.isVertical;
  // Vertical: 0.85×, capped so the spaced caps (≈1 em per character with tracking) fit the safe width.
  const fontSize = V ? Math.min(Math.round(fontSizeH * 0.85), Math.floor(f.safeBox.w / Math.max(Array.from(text).length, 1))) : fontSizeH;
  const { color, font, shadow } = doc;
  const [v, h] = position.split("-") as ["top" | "bottom", "left" | "right"];
  const chars = Array.from(text);
  const start = 8;
  const typed = Math.max(0, Math.min(chars.length, Math.floor((frame - start) / framesPerChar) + 1));
  const typing = frame >= start && typed < chars.length;
  const cursorOn = frame >= 4 && (typing || Math.floor(frame / 12) % 2 === 0);
  const rule = interpolate(frame, [2, 9], [0, 1], { ...clamp, easing: doc.ease.land });
  const doneAt = start + chars.length * framesPerChar;
  const sound = (
    <>
      <DSfx kind="typewriter" at={start} frames={Math.ceil(doneAt - start)} on={sfx} />
      <DSfx kind="bell" at={Math.round(doneAt) + 1} on={sfx} />
    </>
  );
  // Vertical: top stamps start at the top of the graphics zone, bottom stamps end at its foot (y 970).
  const G = f.zones.graphics;
  const vOffset = v === "top" ? G.y + 16 : f.height - (G.y + G.h) + 16;
  return (
    <DocFrame backing={backing} preview={preview} safeGuide={safeGuide}>
      <div style={{ position: "absolute", [v]: V ? vOffset : doc.safe.y + 10, [h]: V ? (h === "left" ? G.x : f.width - (G.x + G.w)) : doc.safe.x }}>
        <ExitWipe dir={h === "left" ? "left" : "right"}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: h === "left" ? "flex-start" : "flex-end" }}>
            <div style={{ width: fontSize * 2.2, height: 6, background: color.amber, marginBottom: Math.round(fontSize * 0.45), clipPath: revealRight(rule) }} />
            <div
              style={{
                fontFamily: font.display,
                fontWeight: 800,
                fontSize,
                lineHeight: 1,
                letterSpacing: "0.32em",
                marginRight: "-0.32em",
                color: color.bone,
                textShadow: shadow.small,
                whiteSpace: "pre",
                position: "relative",
              }}
            >
              {chars.map((c, i) => (
                <span key={i} style={{ opacity: i < typed ? 1 : 0 }}>
                  {c}
                </span>
              )).flatMap((el, i) =>
                i === typed - 1 && cursorOn
                  ? [
                      el,
                      <span key="cursor" style={{ position: "relative", display: "inline-block", width: 0, height: "1em", letterSpacing: 0 }}>
                        <span style={{ position: "absolute", left: "-0.12em", top: "-0.02em", width: "0.55em", height: "1.04em", background: color.amber }} />
                      </span>,
                    ]
                  : [el],
              )}
              {cursorOn && typed === 0 ? (
                <span style={{ position: "absolute", left: 0, top: "-0.02em", width: "0.55em", height: "1.04em", background: color.amber }} />
              ) : null}
            </div>
            {sub ? (
              <Rise delay={Math.round(doneAt) + 4} style={{ marginTop: Math.round(fontSize * 0.5) }}>
                <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: V ? 34 : Math.round(fontSize * 0.85), maxWidth: V ? f.safeBox.w : undefined, color: color.boneDim, textShadow: shadow.small }}>{sub}</div>
              </Rise>
            ) : null}
          </div>
        </ExitWipe>
      </div>
      {sound}
    </DocFrame>
  );
};

const base = { backing: "green", preview: "c1-datacenter", safeGuide: false, sfx: true } as const;

export const stampVariants: Variant<StampProps>[] = [
  { id: "place-year", props: { ...base, seconds: 3.5, text: "SAN FRANCISCO · 2015", sub: "", position: "top-left", fontSize: 44, framesPerChar: 1.5 } },
  {
    id: "date",
    props: { ...base, seconds: 4, text: "30 DE NOVIEMBRE DE 2022", sub: "El día que se lanzó ChatGPT.", position: "top-left", fontSize: 40, framesPerChar: 1.2 },
  },
  { id: "chapter", props: { ...base, seconds: 3.5, text: "CAPÍTULO 3 · EL DESPEGUE", sub: "", position: "bottom-left", fontSize: 40, framesPerChar: 1.2 } },
];
