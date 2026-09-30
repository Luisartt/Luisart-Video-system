import { interpolate } from "remotion";
import { z } from "zod";
import { term } from "./theme";
import { backingField, clamp, CornerTicks, Decrypt, decryptEnd, Exit, fitDisplay, outlineText, safeGuideField, Tag, TermStage, TypeLine, useLayout, useLife, sfxField, TSfx } from "./primitives";

// Chapter title: "[NN] CAPÍTULO" tag, decrypt headline (second line in ice with a blinking
// block cursor) and an optional typed "$ command" line. From the prototype's ChapterBeat.
// 2026-09-27 (user rule, no boxes behind text): the opaque panel is gone. Blue corner ticks
// bracket the block (hairlines, no fill) and every line is plain type with the thin opaque
// outline painted under the letters (outlineText), key-safe on green.

export const titleSchema = z.object({
  backing: backingField,
  safeGuide: safeGuideField,
  sfx: sfxField,
  duration: z.number().min(2).max(10).default(4.5),
  layout: z.enum(["left", "center", "subtitle"]),
  chapter: z.string().describe("Número del capítulo, p. ej. 01"),
  tag: z.string(),
  line1: z.string(),
  line2: z.string().describe("Segunda línea en hielo (vacía = sin segunda línea)"),
  subtitle: z.string().describe("Solo en layout subtitle"),
  command: z.string().describe("Línea $ tecleada (vacía = sin línea)"),
  size: z.number().min(48).max(180),
});
export type TitleProps = z.infer<typeof titleSchema>;

const base: TitleProps = {
  backing: "green",
  safeGuide: false, sfx: true,
  duration: 4.5,
  layout: "left",
  chapter: "01",
  tag: "Capítulo",
  line1: "La IA ya está moviendo",
  line2: "tu dinero.",
  subtitle: "",
  command: '$ soyluisart run capitulo --id 01 --tema "IA y dinero"',
  size: 120,
};

export const titleVariants: Record<string, TitleProps> = {
  left: base,
  center: {
    ...base,
    layout: "center",
    chapter: "02",
    line1: "Cinco modelos.",
    line2: "Un solo destino.",
    command: "",
    size: 128,
  },
  subtitle: {
    ...base,
    layout: "subtitle",
    chapter: "03",
    line1: "Agentes de IA",
    line2: "",
    subtitle: "Qué son, cuánto cuestan y cuándo merecen la pena",
    command: "$ soyluisart run capitulo --id 03",
    size: 112,
  },
};

export const Title: React.FC<TitleProps> = (p) => {
  const { frame } = useLife();
  const c = term.color;
  const f = term.font;
  const tick = interpolate(frame, [0, 8], [0, 1], { ...clamp, easing: term.ease.snap });
  const centered = p.layout === "center";
  const L = useLayout();
  // Vertical: the bracketed block spans the safe-box width, lines wrap; size ≈ 0.8× but capped so
  // the longest word fits.
  const PAD_X = 88;
  const blockW = L.safeBox.w - 24;
  const innerW = blockW - PAD_X;
  const longest = [p.line1, p.line2].join(" ").split(/\s+/).reduce((a, b) => (b.length > a.length ? b : a), "");
  const size = L.v ? fitDisplay(longest, innerW, Math.round(p.size * 0.8), 0.56) : p.size;
  const h1: React.CSSProperties = {
    ...outlineText(size),
    fontFamily: f.display,
    fontWeight: 800,
    fontSize: size,
    lineHeight: 0.98,
    letterSpacing: term.tracking.display,
    color: c.text,
    whiteSpace: L.v ? "normal" : "nowrap",
  };
  const lineStyle: React.CSSProperties = L.v ? { display: "block" } : { display: "flex", alignItems: "center" };
  const l1Start = 4;
  const l2Start = Math.max(14, Math.round(decryptEnd(p.line1, l1Start, 0.8) - 16));
  const lastEnd = p.line2 ? decryptEnd(p.line2, l2Start, 1) : decryptEnd(p.line1, l1Start, 0.8);
  const cursorOn = frame >= (p.line2 ? l2Start : l1Start + 6) && Math.floor(frame / 8) % 2 === 0;
  const cursor = (
    <span
      style={{
        display: "inline-block",
        width: Math.round(size * 0.16),
        height: Math.round(size * 0.82),
        marginLeft: Math.round(size * 0.13),
        background: c.blue,
        opacity: cursorOn ? 1 : 0,
      }}
    />
  );
  const cmdStart = Math.round(lastEnd + 6);
  const subStart = Math.round(decryptEnd(p.line1, l1Start, 0.8) - 4);

  const subEnd = p.layout === "subtitle" && p.subtitle ? decryptEnd(p.subtitle, subStart, 0.35, 5) : 0;
  const textEnd = Math.round(Math.max(lastEnd, subEnd));
  const sound = (
    <>
      <TSfx kind="typeRun" at={l1Start} frames={textEnd - l1Start} on={p.sfx} />
      <TSfx kind="keyHard" at={textEnd} on={p.sfx} />
      {p.command ? <TSfx kind="typeShort" at={cmdStart} frames={Math.ceil(p.command.length / 1.6)} volume={0.2} on={p.sfx} /> : null}
    </>
  );

  const pos: React.CSSProperties = L.v
    ? centered
      ? { left: L.left + 12, width: blockW, top: L.zones.graphics.y + L.zones.graphics.h / 2, transform: "translateY(-50%)" }
      : { left: L.left + 12, width: blockW, top: L.top + 30 }
    : centered
      ? { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }
      : { left: term.margin, top: term.margin };

  return (
    <TermStage backing={p.backing} safeGuide={p.safeGuide}>
      <Exit style={pos}>
        <div
          style={{
            position: "relative",
            padding: "40px 48px 44px 40px",
            boxSizing: "border-box",
            width: L.v ? blockW : undefined,
            display: "flex",
            flexDirection: "column",
            alignItems: centered ? "center" : "flex-start",
            textAlign: centered ? "center" : "left",
          }}
        >
          {/* Hairline brackets around the block; nothing is filled behind the text. */}
          <CornerTicks size={28} p={tick} c={c.blue} weight={3} inset={-1} />
          <Tag style={{ ...outlineText(22), opacity: frame >= 3 ? 1 : 0 }}>
            [{p.chapter}] {p.tag}
          </Tag>
          <div style={{ ...h1, marginTop: 26, ...lineStyle }}>
            <Decrypt text={p.line1} start={l1Start} perChar={0.8} />
            {p.line2 ? null : cursor}
          </div>
          {p.line2 ? (
            <div style={{ ...h1, color: c.ice, ...lineStyle }}>
              <Decrypt text={p.line2} start={l2Start} perChar={1} />
              {cursor}
            </div>
          ) : null}
          {p.layout === "subtitle" && p.subtitle ? (
            <div
              style={{
                ...outlineText(L.v ? 44 : Math.round(p.size * 0.4)),
                marginTop: 22,
                fontFamily: f.display,
                fontWeight: 600,
                fontSize: L.v ? 44 : Math.round(p.size * 0.4),
                lineHeight: L.v ? 1.15 : undefined,
                letterSpacing: "-0.02em",
                color: c.ice,
                whiteSpace: L.v ? "normal" : "nowrap",
              }}
            >
              <Decrypt text={p.subtitle} start={subStart} perChar={0.35} scramble={5} />
            </div>
          ) : null}
          {p.command ? (
            <TypeLine
              text={p.command}
              start={cmdStart}
              cps={1.6}
              cursorUntil={0}
              style={{ ...outlineText(30), marginTop: 40, fontSize: L.v ? 22 : 24, color: c.ice, letterSpacing: "0.02em", whiteSpace: L.v ? "pre-wrap" : "pre" }}
            />
          ) : null}
        </div>
      </Exit>
      {sound}
    </TermStage>
  );
};
