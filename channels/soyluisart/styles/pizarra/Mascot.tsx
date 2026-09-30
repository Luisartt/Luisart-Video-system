import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { z } from "zod";
import { Drop, HandNote, Sfx, Stage, Variant, base, baseSchema, useFormat } from "./primitives";
import { piz } from "./theme";
import { MASCOTS, MASCOT_EXPRESSIONS } from "./mascotIndex";

// Mascot from the repertoire (wiki: Designs/Mascot Repertoire): any of the 139 pixel characters
// (Bit colour variants, finance figures, and two figures + a themed Bit per content category) with one
// of 6 faces, dropping in on the board and bobbing in two frames like Bit. Optional face change
// ("then") for a reaction, and a hand note under it. Images: media/soyluisart/brand/mascots/ (publicDir = media).

export const mascotSchema = baseSchema.extend({
  character: z.string().describe("Key from mascotIndex.ts, e.g. lupa-base, f08-toro, bit-ia-oscuro"),
  expr: z.enum(MASCOT_EXPRESSIONS),
  thenExpr: z.enum(MASCOT_EXPRESSIONS).optional().describe("Second face, shown from changeAt"),
  changeAt: z.number().min(0).describe("Seconds"),
  note: z.string(),
});
type Props = z.infer<typeof mascotSchema>;

export const mascotSrc = (character: string, expr: (typeof MASCOT_EXPRESSIONS)[number]) => {
  const m = MASCOTS[character];
  if (!m) throw new Error(`Unknown mascot "${character}". See mascotIndex.ts (e.g. lupa-base, f08-toro).`);
  return staticFile(`soyluisart/brand/mascots/${m.rutas[expr]}`);
};

export const Mascot: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical, safeBox } = useFormat();
  const size = isVertical ? 640 : 560;
  const expr = p.thenExpr && frame >= Math.round(p.changeAt * 30) ? p.thenExpr : p.expr;
  const bob = Math.floor(frame / 19) % 2 === 0 ? 0 : -Math.round(size / 40);
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <AbsoluteFill style={{ left: safeBox.x, width: safeBox.w, top: safeBox.y, height: safeBox.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
        <Drop at={2}>
          <Img src={mascotSrc(p.character, expr)} style={{ width: size, height: size, objectFit: "contain", imageRendering: "pixelated", transform: `translateY(${bob}px)` }} />
        </Drop>
        <HandNote text={p.note} at={14} fontSize={isVertical ? 76 : 72} color={piz.color.accentDark} />
      </AbsoluteFill>
      <Sfx kind="pop" at={2} on={p.sfx} volume={0.2} />
    </Stage>
  );
};

export const mascotVariants: Variant<Props>[] = [
  { id: "lupa", props: { ...base("board", 4), character: "lupa-base", expr: "pensando", thenExpr: "sorpresa", changeAt: 2, note: "veamos qué hay detrás…" }, horizontal: true },
  { id: "toro-oso", props: { ...base("board", 4), character: "f08-toro", expr: "feliz", thenExpr: "enojado", changeAt: 2, note: "el mercado cambia" }, horizontal: true },
  { id: "bit-ia", props: { ...base("board", 4), character: "bit-ia-base", expr: "guino", changeAt: 0, note: "la IA lo hace por ti" }, horizontal: true },
  // one per content category / theme (wiki: Mascot Repertoire)
  { id: "campana", props: { ...base("board", 4), character: "campana-base", expr: "feliz", thenExpr: "sorpresa", changeAt: 2, note: "abre el mercado" }, horizontal: true },
  { id: "pantalla", props: { ...base("board", 4), character: "pantalla-base", expr: "pensando", thenExpr: "feliz", changeAt: 2, note: "mira los precios de hoy" }, horizontal: true },
  { id: "medalla", props: { ...base("board", 4), character: "medalla-base", expr: "feliz", changeAt: 0, note: "la meta: el Charter" }, horizontal: true },
  { id: "calculadora", props: { ...base("board", 4), character: "calculadora-base", expr: "pensando", thenExpr: "guino", changeAt: 2, note: "haz la cuenta" }, horizontal: true },
  { id: "termometro", props: { ...base("board", 4), character: "termometro-base", expr: "sorpresa", thenExpr: "enojado", changeAt: 2, note: "la inflación sube" }, horizontal: true },
  { id: "embudo", props: { ...base("board", 4), character: "embudo-base", expr: "feliz", thenExpr: "guino", changeAt: 2, note: "de miles a clientes" }, horizontal: true },
  { id: "engrane", props: { ...base("board", 4), character: "engrane-base", expr: "pensando", thenExpr: "feliz", changeAt: 2, note: "cada empujón suma" }, horizontal: true },
  { id: "trofeo", props: { ...base("board", 4), character: "trofeo-base", expr: "feliz", changeAt: 0, note: "resultado del equipo" }, horizontal: true },
  { id: "nopal", props: { ...base("board", 4), character: "nopal-base", expr: "feliz", thenExpr: "guino", changeAt: 2, note: "finanzas a la mexicana" }, horizontal: true },
  { id: "dado", props: { ...base("board", 4), character: "dado-base", expr: "pensando", thenExpr: "sorpresa", changeAt: 2, note: "todo riesgo tiene su probabilidad" }, horizontal: true },
  { id: "foco", props: { ...base("board", 4), character: "foco-base", expr: "pensando", thenExpr: "feliz", changeAt: 2, note: "una idea de negocio" }, horizontal: true },
  { id: "pastel", props: { ...base("board", 4), character: "pastel-base", expr: "feliz", changeAt: 0, note: "¿a dónde va tu dinero?" }, horizontal: true },
  { id: "bit-ejecutivo", props: { ...base("board", 4), character: "f15-bit-traje", expr: "feliz", thenExpr: "guino", changeAt: 2, note: "hoy toca hablar de negocios" }, horizontal: true },
];
