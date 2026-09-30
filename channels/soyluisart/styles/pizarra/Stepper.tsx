import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Drop, HandNote, PixelIcon, Sfx, Stage, TypeOn, Variant, base, baseSchema, iconField, useFormat } from "./primitives";
import { piz } from "./theme";

// Progress stepper (his "plano → albañil → …"): 3–5 tiles joined by a dashed ink line. The active
// tile gets a blue border + blue label under it, finished ones a green check badge, pending ones
// are greyed. The active step swaps on a hard frame at each `at`; under the band, the active
// step's big icon + "PASO n" heading + hand note retype on every swap.

const stepSchema = z.object({ icon: iconField, label: z.string(), note: z.string(), at: z.number().min(0).describe("Seconds when this step becomes active") });
export const stepperSchema = baseSchema.extend({
  steps: z.array(stepSchema).min(3).max(5),
  word: z.string().describe("Heading word before the number (\"PASO\")"),
});
type Props = z.infer<typeof stepperSchema>;

const CheckBadge: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, background: piz.color.green, border: `3px solid ${piz.color.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 8 8" shapeRendering="crispEdges">
      <path d="M1 4h1v1h1v1h1V5h1V4h1V3h1V2h1v1H7v1H6v1H5v1H4v1H3V6H2V5H1z" fill="#fff" />
    </svg>
  </div>
);

export const Stepper: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { isVertical, safeBox } = useFormat();
  const starts = p.steps.map((s) => Math.round(s.at * fps));
  let active = 0;
  starts.forEach((s, i) => {
    if (frame >= s) active = i;
  });
  const n = p.steps.length;
  const tile = isVertical ? (n > 4 ? 104 : 140) : n > 4 ? 120 : 150;
  const dash = isVertical ? (n > 4 ? 46 : 80) : 90;
  const iconPx = Math.floor((tile - 30) / 16);
  const cur = p.steps[active];
  const at = starts[active];
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <AbsoluteFill style={{ left: safeBox.x, top: safeBox.y + (isVertical ? 40 : 10), width: safeBox.w, height: safeBox.h, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Band */}
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          {p.steps.map((s, i) => {
            const done = i < active;
            const isActive = i === active;
            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
                {i > 0 ? (
                  <div style={{ width: dash, marginTop: tile / 2 - 3, height: 6, backgroundImage: `repeating-linear-gradient(90deg, ${piz.color.ink} 0 12px, transparent 12px 20px)` }} />
                ) : null}
                <div style={{ position: "relative", width: tile, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: tile,
                      height: tile,
                      boxSizing: "border-box",
                      border: `${isActive ? 8 : 4}px solid ${isActive ? piz.color.accent : done ? piz.color.ink : piz.color.pending}`,
                      background: piz.color.white,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ filter: !done && !isActive ? "grayscale(1) opacity(0.35)" : undefined }}>
                      <PixelIcon name={s.icon} px={iconPx} />
                    </div>
                  </div>
                  {done ? (
                    <div style={{ position: "absolute", right: -18, top: -18 }}>
                      <CheckBadge size={Math.round(tile * 0.36)} />
                    </div>
                  ) : null}
                  {isActive ? (
                    <div style={{ position: "absolute", top: tile + 14, whiteSpace: "nowrap", font: `700 ${isVertical ? 40 : 36}px ${piz.font.caption}`, color: piz.color.accent }}>
                      {s.label}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        {/* Active step detail — keyed so it retypes on every swap. */}
        <div key={active} style={{ marginTop: isVertical ? 170 : 90, display: "flex", flexDirection: isVertical ? "column" : "row", alignItems: "center", gap: isVertical ? 30 : 80 }}>
          <Drop at={at + 2}>
            <PixelIcon name={cur.icon} px={isVertical ? 20 : 16} shadow />
          </Drop>
          <div style={{ display: "flex", flexDirection: "column", alignItems: isVertical ? "center" : "flex-start", gap: 6 }}>
            <TypeOn text={`${p.word} ${active + 1}`} accent={String(active + 1)} at={at + 3} align={isVertical ? "center" : "left"} />
            <HandNote text={cur.note} at={at} align={isVertical ? "center" : "left"} />
          </div>
        </div>
      </AbsoluteFill>
      {starts.map((s, i) => (
        <Sfx key={i} kind="click" at={s} on={p.sfx} />
      ))}
    </Stage>
  );
};

export const stepperVariants: Variant<Props>[] = [
  {
    id: "3-steps",
    horizontal: true,
    props: {
      ...base("board", 6),
      word: "PASO",
      steps: [
        { icon: "bulb", label: "La idea", note: "escríbela en una frase", at: 0 },
        { icon: "robot", label: "La IA", note: "que te haga el plano", at: 2 },
        { icon: "rocket", label: "Publica", note: "y enséñala hoy", at: 4 },
      ],
    },
  },
  {
    id: "5-steps",
    horizontal: true,
    props: {
      ...base("board", 7),
      word: "PASO",
      steps: [
        { icon: "bulb", label: "Idea", note: "el plano", at: 0 },
        { icon: "robot", label: "Asistente", note: "el albañil", at: 1.4 },
        { icon: "brain", label: "Memoria", note: "que no se olvide", at: 2.8 },
        { icon: "lock", label: "Datos", note: "tus claves a salvo", at: 4.2 },
        { icon: "rocket", label: "Lanzar", note: "a la calle", at: 5.6 },
      ],
    },
  },
];
