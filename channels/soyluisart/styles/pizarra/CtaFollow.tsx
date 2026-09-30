import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Bit, Drop, HandNote, PixelButton, Sfx, Stage, Tile, TypeOn, Variant, base, baseSchema, logoField, logoSrc, useFormat } from "./primitives";
import { BaseProps } from "./primitives";
import { piz } from "./theme";

// CTA over the A-roll (his closing shot): "+SEGUIR" pixel button popping on the "sígueme" word,
// with Bit next to it and a handwritten kicker; the ranking variant adds a "TOP N" title and a
// column of numbered logo tiles filling one by one (each row: its pixel numeral, then the tile).
// Since 2026-09-27 the numeral is plain blue pixel type with an ink outline, no badge box behind it.
// Rendered on green by default (layer it over your recording); backing "aroll" previews it.

export const ctaFollowSchema = baseSchema.extend({
  mode: z.enum(["button", "ranking"]),
  label: z.string(),
  kicker: z.string(),
  popAt: z.number().min(0).describe("Seconds: the button pops on the \"sígueme\" word"),
  title: z.string(),
  accent: z.string(),
  subtitle: z.string(),
  ranking: z.array(logoField).max(6),
});
type Props = z.infer<typeof ctaFollowSchema>;

export const shadowFor = (b: BaseProps["backing"]) =>
  b === "green" ? "0 5px 0 #111111" : b === "board" || b === "cream" ? undefined : "0 3px 12px rgba(0,0,0,0.45)";

const Pop: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  // Hard two-step pop (no easing, no bounce): 118 % for 2 frames, then 100 %.
  const s = frame < at + 2 ? 1.18 : 1;
  return <div style={{ transform: `scale(${s})`, transformOrigin: "50% 50%" }}>{children}</div>;
};

export const CtaFollow: React.FC<Props> = (p) => {
  const { fps } = useVideoConfig();
  const { isVertical, safeBox } = useFormat();
  const solid = p.backing === "green" || p.backing === "transparent";
  const popAt = Math.round(p.popAt * fps);
  const shadow = shadowFor(p.backing);
  const white = p.backing === "board" || p.backing === "cream" ? piz.color.ink : piz.color.white;
  const tile = isVertical ? 104 : 96;
  const rankStart = 12;
  const button = (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 34 }}>
      <Pop at={popAt}>
        <PixelButton label={p.label} fontSize={isVertical ? 76 : 70} />
      </Pop>
      <Drop at={popAt + 6} solid={solid}>
        <Bit px={isVertical ? 8 : 7} expression="happy" shadow={false} />
      </Drop>
    </div>
  );
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      {p.mode === "ranking" ? (
        <AbsoluteFill style={{ left: safeBox.x + 10, top: safeBox.y + 20, width: safeBox.w, height: safeBox.h, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <TypeOn text={p.title} accent={p.accent} at={2} color={white} align="left" solid={solid} fontSize={isVertical ? 120 : 110} weight={800} style={{ textShadow: shadow }} />
          <div style={{ font: `800 ${isVertical ? 46 : 42}px ${piz.font.heading}`, color: white, textShadow: shadow, marginTop: 6 }}>{p.subtitle}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 50 }}>
            {p.ranking.map((k, i) => (
              <Drop key={i} at={rankStart + i * piz.timing.sibling} solid={solid}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div
                    style={{
                      width: Math.round(tile * 0.55),
                      textAlign: "right",
                      color: piz.color.accent,
                      font: `500 ${Math.round(tile * 0.78)}px ${piz.font.pixel}`,
                      lineHeight: 1,
                      // Thin stroke only: a heavier one (or an offset shadow) closes the pixel
                      // digits' openings and 2 / 3 / 5 start to read as 8.
                      WebkitTextStroke: `3px ${piz.color.ink}`,
                      paintOrder: "stroke fill",
                    }}
                  >
                    {i + 1}
                  </div>
                  <Tile size={tile} style={{ boxShadow: `6px 6px 0 ${piz.color.ink}` }}>
                    <Img src={logoSrc(k, p.backing === "green")} style={{ width: tile * 0.6, height: tile * 0.6, objectFit: "contain" }} />
                  </Tile>
                </div>
              </Drop>
            ))}
          </div>
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill
        style={{
          left: safeBox.x,
          top: safeBox.y,
          width: safeBox.w,
          height: safeBox.h - (isVertical ? 60 : 30),
          display: "flex",
          flexDirection: "column",
          alignItems: p.mode === "ranking" ? "flex-end" : "center",
          justifyContent: "flex-end",
          gap: 20,
        }}
      >
        {p.kicker ? <HandNote text={p.kicker} at={Math.max(0, popAt - 12)} color={white} shadow={p.backing === "aroll"} solid={solid} style={{ textShadow: shadow }} /> : null}
        {button}
      </AbsoluteFill>
      {p.mode === "ranking" ? <Sfx kind="type" at={2} frames={Array.from(p.title).length + 2} on={p.sfx} /> : null}
      {p.mode === "ranking" ? p.ranking.map((_, i) => <Sfx key={i} kind="pop" at={rankStart + i * piz.timing.sibling} on={p.sfx} volume={0.22} />) : null}
      <Sfx kind="bell" at={popAt} on={p.sfx} />
    </Stage>
  );
};

const common: Props = {
  ...base("green", 4),
  mode: "button",
  label: "+SEGUIR",
  kicker: "más IA y dinero cada día",
  popAt: 1.2,
  title: "TOP 5 IAs",
  accent: "IAs",
  subtitle: "PARA TU NEGOCIO",
  ranking: ["claude", "chatgpt", "gemini", "perplexity", "deepseek"],
};

export const ctaFollowVariants: Variant<Props>[] = [
  { id: "button", props: common, horizontal: true },
  { id: "button-aroll", props: { ...common, backing: "aroll" } },
  { id: "ranking", props: { ...common, mode: "ranking", popAt: 3, seconds: 5 }, horizontal: true },
];
