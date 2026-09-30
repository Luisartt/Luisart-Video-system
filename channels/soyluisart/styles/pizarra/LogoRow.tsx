import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Drop, HandNote, LOGOS, Sfx, Stage, Tile, TypeOn, Variant, base, baseSchema, logoField, logoSrc, useFormat } from "./primitives";
import { piz } from "./theme";

// AI tool logos (original files, unmodified) in pixel-framed tiles; a blue selector frame hops
// tile to tile (hard, every `hopFrames`) and stops on `select`, whose name appears under it.

export const logoRowSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string(),
  note: z.string(),
  logos: z.array(logoField).min(2).max(6),
  select: z.number().min(0).max(5).describe("Index of the logo the selector lands on"),
  hopFrames: z.number().min(3).max(20),
  selectAt: z.number().min(0).describe("Seconds when the selector starts hopping"),
});
type Props = z.infer<typeof logoRowSchema>;

export const LogoRow: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { isVertical, safeBox } = useFormat();
  const n = p.logos.length;
  const cols = isVertical ? (n <= 4 ? Math.min(n, 2) : 3) : n;
  const gap = isVertical ? 60 : 56;
  const tile = Math.min(isVertical ? 250 : 220, Math.floor((safeBox.w - 80 - gap * (cols - 1)) / cols));
  const tilesAt = 4 + Array.from(p.heading).length + 6;
  const hopStart = Math.round(p.selectAt * fps);
  const target = Math.min(p.select, n - 1);
  const hops = Math.max(0, Math.floor((frame - hopStart) / p.hopFrames));
  const sel = frame < hopStart ? -1 : Math.min(target, hops);
  const landed = frame >= hopStart + target * p.hopFrames;
  const b = 10;
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <AbsoluteFill style={{ left: safeBox.x, top: safeBox.y, width: safeBox.w, height: safeBox.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: isVertical ? 90 : 60 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <TypeOn text={p.heading} accent={p.accent} at={7} />
          <HandNote text={p.note} at={4} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${tile}px)`, columnGap: gap, rowGap: gap + 50 }}>
          {p.logos.map((k, i) => (
            <div key={i} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Drop at={tilesAt + i * 6}>
                <Tile size={tile}>
                  <Img src={logoSrc(k)} style={{ width: tile * 0.52, height: tile * 0.52, objectFit: "contain" }} />
                </Tile>
              </Drop>
              {sel === i ? (
                <>
                  <div style={{ position: "absolute", left: -b * 2, top: -b * 2, width: tile + b * 4, height: tile + b * 4, boxSizing: "border-box", border: `${b}px solid ${piz.color.accent}` }} />
                  {landed ? (
                    <div style={{ position: "absolute", top: tile + 34, whiteSpace: "nowrap", font: `700 ${isVertical ? 46 : 40}px ${piz.font.label}`, color: piz.color.accent, letterSpacing: "0.02em" }}>
                      {LOGOS[k].name.toUpperCase()}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <Sfx kind="type" at={7} frames={Array.from(p.heading).length + 2} on={p.sfx} />
      <Sfx kind="pop" at={tilesAt} on={p.sfx} />
      {Array.from({ length: target + 1 }, (_, i) => (
        <Sfx key={i} kind="tap" at={hopStart + i * p.hopFrames} on={p.sfx} />
      ))}
      <Sfx kind="ding" at={hopStart + target * p.hopFrames + 2} on={p.sfx} />
    </Stage>
  );
};

export const logoRowVariants: Variant<Props>[] = [
  {
    id: "4-logos",
    horizontal: true,
    props: { ...base("board", 5), heading: "¿CUÁL USO?", accent: "USO?", note: "depende de la tarea", logos: ["chatgpt", "claude", "gemini", "perplexity"], select: 1, hopFrames: 8, selectAt: 1.6 },
  },
  {
    id: "6-logos",
    horizontal: true,
    props: { ...base("board", 5), heading: "TOP 6 IAs", accent: "IAs", note: "para tu negocio", logos: ["chatgpt", "claude", "gemini", "perplexity", "deepseek", "grok"], select: 4, hopFrames: 6, selectAt: 1.8 },
  },
];
