import { interpolate } from "remotion";
import { z } from "zod";
import { term } from "./theme";
import { backingField, clamp, Exit, Panel, safeGuideField, Tag, TermStage, useLayout, useLife, usePalette, sfxField, TSfx } from "./primitives";

// Agent task card: a header with a blinking status dot, steps that tick one by one (spinner on
// the current one, ✓ when done) and a segmented progress bar. From the prototype's agent card.

export const checklistSchema = z.object({
  backing: backingField,
  safeGuide: safeGuideField,
  sfx: sfxField,
  duration: z.number().min(2).max(10).default(5),
  side: z.enum(["left", "right"]),
  bottom: z.number().min(60).max(1400).describe("En vertical nunca por debajo de la zona de gráficos (y 970 → 950)"),
  title: z.string(),
  doneLabel: z.string(),
  steps: z.array(z.string()).min(1).max(7),
});
export type ChecklistProps = z.infer<typeof checklistSchema>;

const base: ChecklistProps = {
  backing: "green",
  safeGuide: false, sfx: true,
  duration: 5,
  side: "right",
  bottom: 140,
  title: "Agente · en marcha",
  doneLabel: "Completado",
  steps: ["Leer el mercado", "Evaluar el riesgo", "Mover tu dinero"],
};

export const checklistVariants: Record<string, ChecklistProps> = {
  "3-steps": base,
  "5-steps": {
    ...base,
    duration: 6,
    title: "Agente · automatización",
    steps: ["Leer los correos nuevos", "Clasificar por prioridad", "Redactar las respuestas", "Actualizar el CRM", "Enviar el resumen diario"],
  },
};

const SPIN = ["|", "/", "-", "\\"];
const SEGMENTS = 24;

export const Checklist: React.FC<ChecklistProps> = (p) => {
  const { frame, exitStart } = useLife();
  const pal = usePalette();
  const c = term.color;
  const f = term.font;
  const tick = interpolate(frame, [0, 8], [0, 1], { ...clamp, easing: term.ease.snap });
  const n = p.steps.length;
  const firstDone = 22;
  const per = Math.max(6, Math.min(18, (exitStart - 30 - firstDone) / n));
  const doneAt = (i: number) => firstDone + i * per;
  const doneCount = p.steps.filter((_, i) => frame >= doneAt(i)).length;
  const allDone = doneCount === n;
  const filled = Math.round(interpolate(frame, [firstDone - per, doneAt(n - 1)], [0, SEGMENTS], clamp));
  const right = p.side === "right";
  const L = useLayout();
  // Vertical: the card sits at the foot of the graphics zone (y 250–970).
  const G = L.zones.graphics;
  const bottom = L.v ? Math.max(p.bottom, L.height - (G.y + G.h)) : p.bottom;
  const fs = L.v ? 32 : 26;
  const tagFs = 18;
  const sound = (
    <>
      <TSfx kind="clickTone" at={2} on={p.sfx} />
      {p.steps.slice(0, -1).map((_, i) => (
        <TSfx key={i} kind="checkbox" at={Math.round(doneAt(i))} on={p.sfx} />
      ))}
      <TSfx kind="chime" at={Math.round(doneAt(n - 1))} on={p.sfx} />
    </>
  );
  return (
    <TermStage backing={p.backing} safeGuide={p.safeGuide}>
      <Exit dir={right ? "rtl" : "ltr"} style={L.v ? { left: G.x, bottom } : { [right ? "right" : "left"]: term.margin, bottom }}>
        <Panel tick={tick} border={c.hairline} style={{ width: L.v ? G.w : 620, visibility: frame >= 2 ? "visible" : "hidden" }}>
          <div style={{ padding: "20px 28px", borderBottom: `1px solid ${c.hairline}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Tag size={tagFs} c={c.text}>
              {p.title}
            </Tag>
            {allDone ? (
              <Tag size={tagFs} c={c.ice}>
                [OK] {p.doneLabel}
              </Tag>
            ) : (
              <Tag size={tagFs} c={Math.floor(frame / 10) % 2 ? c.orange : `${c.orange}66`}>
                ●
              </Tag>
            )}
          </div>
          <div style={{ padding: "22px 28px 8px", display: "flex", flexDirection: "column", gap: 16 }}>
            {p.steps.map((s, i) => {
              const done = frame >= doneAt(i);
              const current = !done && frame >= (i === 0 ? 6 : doneAt(i - 1));
              const mark = done ? "✓" : current ? SPIN[Math.floor(frame / 3) % 4] : "·";
              return (
                <div key={i} style={{ display: "flex", gap: 18, alignItems: "center", fontFamily: f.mono, fontSize: fs, whiteSpace: "nowrap", color: done ? c.text : current ? c.ice : c.muted }}>
                  <span style={{ color: done ? pal.gain : current ? c.blue : c.muted, width: 24, textAlign: "center" }}>{mark}</span>
                  {s}
                </div>
              );
            })}
          </div>
          <div style={{ padding: "16px 28px 24px", display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: SEGMENTS }, (_, k) => (
                <div key={k} style={{ width: 13, height: 12, background: k < filled ? c.blue : c.hairline }} />
              ))}
            </div>
            <Tag size={16} c={c.muted}>
              <span style={{ color: c.ice }}>{doneCount}</span>/{n}
            </Tag>
          </div>
        </Panel>
      </Exit>
      {sound}
    </TermStage>
  );
};
