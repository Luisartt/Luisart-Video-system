import { AbsoluteFill, useCurrentFrame } from "remotion";
import { z } from "zod";
import { ARollVideo, HandNote, Sfx, Stage, TEST_AROLL, TEST_MATTE, TypeOn, Variant, base, baseSchema, useFormat } from "./primitives";
import { piz } from "./theme";

// Text behind the head (his hook / turn / CTA shot): a small handwritten kicker above, a giant
// grotesk word in blue (optionally a first line in white or ink) and an optional handwritten tail.
// Layers: A-roll → this text → person matte. With `aroll` + `matte` set it composites itself
// (A-roll optionally punched in to 115 %, hard); with them empty it renders the text alone on
// green / transparent for your editor (put the matte above it there).

const tone = z.enum(["accent", "white", "ink"]);
export const behindHeadWordSchema = baseSchema.extend({
  kicker: z.string(),
  line1: z.string().describe("Optional first line (two-tone variant); empty = none"),
  line1Tone: tone,
  main: z.string(),
  mainTone: tone,
  tail: z.string(),
  reveal: z.enum(["cut", "type"]).describe("cut = full on the first frame · type = 1 char/frame"),
  wordPunch: z.boolean().describe("Hard 2-step punch on the word: 112 % for 2 frames, then 100 %"),
  punch: z.boolean().describe("A-roll + matte at 115 % (the punch-in cut)"),
  aroll: z.string().describe("A-roll path under media/ (empty = none)"),
  matte: z.string().describe("Person matte with alpha (VP9 webm) under media/ (empty = none)"),
  centerY: z.number().min(0.15).max(0.6).describe("Main word centre as a fraction of the height"),
});
type Props = z.infer<typeof behindHeadWordSchema>;

const toneColor = (t: z.infer<typeof tone>) => (t === "accent" ? piz.color.accent : t === "white" ? piz.color.white : piz.color.ink);

export const BehindHeadWord: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { width, height, isVertical } = useFormat();
  const composite = p.aroll !== "";
  const solid = !composite;
  const maxW = width * (isVertical ? 0.84 : 0.7);
  const fit = (s: string, max: number) => Math.min(max, Math.floor(maxW / Math.max(1, Array.from(s).length * 0.64)));
  const mainSize = fit(p.main, piz.size.behindHead * (isVertical ? 1 : 1.15));
  const l1Size = p.line1 ? fit(p.line1, mainSize) : 0;
  // Horizontal: keep the stack clear of the top safe margin.
  const cy = Math.round(height * (isVertical ? p.centerY : Math.max(p.centerY, p.line1 ? 0.5 : 0.4)));
  const shadow = composite ? "0 4px 18px rgba(0,0,0,0.35)" : undefined;
  const typeAt = 2;
  const l1Len = Array.from(p.line1).length;
  const mainAt = p.reveal === "type" ? typeAt + (p.line1 ? l1Len + 2 : 0) : 0;
  const punchScale = p.wordPunch && frame >= mainAt && frame < mainAt + 2 ? 1.12 : 1;
  const Word: React.FC<{ text: string; size: number; color: string; at: number }> = ({ text, size, color, at }) =>
    p.reveal === "type" ? (
      <TypeOn text={text} at={at} color={color} fontSize={size} weight={800} solid={solid} lineHeight={0.92} letterSpacing="-0.015em" style={{ textShadow: shadow }} />
    ) : (
      <div style={{ font: `800 ${size}px ${piz.font.heading}`, color, lineHeight: 0.92, letterSpacing: "-0.015em", textShadow: shadow }}>{text}</div>
    );
  // Kicker and tail sit in FRONT of the person (never covered); the big word(s) go behind.
  const renderText = (layer: "all" | "behind" | "front") => {
    const hand = layer === "behind" ? "hidden" : "visible";
    const big = layer === "front" ? "hidden" : "visible";
    return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, width, top: cy - Math.round(mainSize * 0.47), transform: "translateY(-100%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: p.line1 ? "center" : "flex-start", width: Math.round(Array.from(p.main).length * 0.64 * mainSize) }}>
          {p.kicker ? (
            <HandNote text={p.kicker} at={0} color={piz.color.white} fontSize={piz.size.kicker} align="left" solid shadow={composite} style={{ marginBottom: p.line1 ? 22 : 4, marginLeft: 8, visibility: hand }} />
          ) : null}
          {p.line1 ? <div style={{ visibility: big }}><Word text={p.line1} size={l1Size} color={toneColor(p.line1Tone)} at={typeAt} /></div> : null}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, width, top: cy, transform: `translateY(-50%) scale(${punchScale})`, display: "flex", flexDirection: "column", alignItems: "center", visibility: big }}>
        <Word text={p.main} size={mainSize} color={toneColor(p.mainTone)} at={mainAt} />
      </div>
      {p.tail ? (
        <div style={{ position: "absolute", left: (width - maxW) / 2, top: cy + mainSize * 0.5 + 6, visibility: hand }}>
          <HandNote text={p.tail} at={mainAt + 6} color={piz.color.white} fontSize={piz.size.kicker} align="left" solid shadow={composite} />
        </div>
      ) : null}
    </AbsoluteFill>
    );
  };
  const typed = p.reveal === "type" ? Array.from(p.line1 + p.main).length + 2 : 0;
  const sounds = (
    <>
      {p.reveal === "type" ? <Sfx kind="typeShort" at={typeAt} frames={typed} on={p.sfx} /> : null}
      {p.wordPunch || p.reveal === "cut" ? <Sfx kind="key" at={mainAt} on={p.sfx} /> : null}
    </>
  );
  if (!composite) {
    return (
      <Stage backing={p.backing} safeGuide={p.safeGuide}>
        {renderText("all")}
        {sounds}
      </Stage>
    );
  }
  return (
    <Stage backing="transparent" safeGuide={p.safeGuide}>
      <AbsoluteFill style={{ background: "#000" }}>
        <ARollVideo src={p.aroll} punch={p.punch} />
      </AbsoluteFill>
      {renderText(p.matte ? "behind" : "all")}
      {p.matte ? (
        <AbsoluteFill>
          <ARollVideo src={p.matte} punch={p.punch} transparent />
        </AbsoluteFill>
      ) : null}
      {p.matte ? renderText("front") : null}
      {sounds}
    </Stage>
  );
};

const common: Props = {
  ...base("green", 3.5),
  kicker: "no significa que sea",
  line1: "",
  line1Tone: "white",
  main: "BARATA",
  mainTone: "accent",
  tail: "",
  reveal: "cut",
  wordPunch: false,
  punch: false,
  aroll: TEST_AROLL,
  matte: TEST_MATTE,
  centerY: 0.25,
};

export const behindHeadWordVariants: Variant<Props>[] = [
  { id: "composite", props: common },
  { id: "composite-punch", props: { ...common, kicker: "¿barata comparada", main: "CON QUÉ?", tail: "pregúntatelo", punch: true, wordPunch: true } },
  { id: "two-tone-typed", props: { ...common, kicker: "ojo con la", line1: "ACCIÓN", line1Tone: "white", main: "BARATA", reveal: "type", centerY: 0.32 } },
  { id: "green", props: { ...common, aroll: "", matte: "" }, horizontal: true },
  { id: "green-two-tone", props: { ...common, aroll: "", matte: "", kicker: "ojo con la", line1: "ACCIÓN", line1Tone: "ink", main: "BARATA", reveal: "type", centerY: 0.32 }, horizontal: true },
];
