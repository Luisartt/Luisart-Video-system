import { interpolate } from "remotion";
import { z } from "zod";
import { term } from "./theme";
import { backingField, clamp, CornerTicks, Decrypt, Exit, outlineText, safeGuideField, Tag, TermStage, TypeLine, useLayout, useLife, sfxField, TSfx } from "./primitives";

// Bracket-frame lower third: corner ticks draw in, the blue edge bar snaps on, the name decrypts
// and the handle line types. From the prototype's NameBeat.
// 2026-09-27 (user rule, no boxes or bands behind text): the opaque box is gone. Only hairline
// corner ticks and the thin blue edge bar remain (no fill); name, tag and line are plain type with
// the thin opaque outline painted under the letters (outlineText), key-safe on green.

export const lowerThirdSchema = z.object({
  backing: backingField,
  safeGuide: safeGuideField,
  sfx: sfxField,
  duration: z.number().min(2).max(10).default(5),
  side: z.enum(["left", "right"]),
  tag: z.string(),
  name: z.string().describe('El canal se escribe siempre "Luisart"'),
  line: z.string().describe("Handle o cargo, tecleado debajo del nombre"),
  bottom: z.number().min(60).max(1200).describe("Distancia al borde inferior; en vertical nunca por debajo de la zona de gráficos (y 970 → 950)"),
});
export type LowerThirdProps = z.infer<typeof lowerThirdSchema>;

const luisart: LowerThirdProps = {
  backing: "green",
  safeGuide: false, sfx: true,
  duration: 5,
  side: "left",
  tag: "[ID] Presentador",
  name: "Luisart",
  line: "@soyluisart · IA · finanzas · negocios",
  bottom: 150,
};

export const lowerThirdVariants: Record<string, LowerThirdProps> = {
  "luisart-left": luisart,
  "luisart-right": { ...luisart, side: "right" },
  guest: { ...luisart, tag: "[ID] Invitado", name: "Nombre Apellido", line: "Cargo · Empresa" },
};

export const LowerThird: React.FC<LowerThirdProps> = (p) => {
  const { frame, dur } = useLife();
  const c = term.color;
  const tick = interpolate(frame, [0, 6], [0, 1], { ...clamp, easing: term.ease.snap });
  const edge = frame >= 5;
  const right = p.side === "right";
  const L = useLayout();
  // Vertical: sits at the foot of the graphics zone (zones.graphics, y 250–970, x 120–920); the
  // captions band below it (y 1000–1300) is reserved for captions.
  const band = L.zones.graphics;
  const bottom = L.v ? Math.max(p.bottom, L.height - (band.y + band.h)) : p.bottom;
  const sideInset = L.v ? (right ? L.width - (band.x + band.w) : band.x) : right ? L.right : L.left;
  const nameSize = L.v ? 84 : 92;
  const lineSize = L.v ? 24 : 24;
  const typeStart = 16;
  const typeEnd = typeStart + p.line.length / 2.4;
  const sound = (
    <>
      <TSfx kind="clickTone" at={5} on={p.sfx} />
      <TSfx kind="typeShort" at={typeStart} frames={Math.ceil(typeEnd - typeStart)} on={p.sfx} />
    </>
  );
  return (
    <TermStage backing={p.backing} safeGuide={p.safeGuide}>
      <Exit dir={right ? "rtl" : "ltr"} style={{ [right ? "right" : "left"]: sideInset, bottom }}>
        <div
          style={{
            position: "relative",
            padding: right ? "26px 40px 30px 44px" : "26px 44px 30px 40px",
            textAlign: right ? "right" : "left",
            display: "flex",
            flexDirection: "column",
            alignItems: right ? "flex-end" : "flex-start",
          }}
        >
          <CornerTicks size={20} p={tick} c={c.ice} />
          <div style={{ position: "absolute", [right ? "right" : "left"]: -1, top: 24, bottom: 24, width: 4, background: c.blue, opacity: edge ? 1 : 0 }} />
          <Tag size={15} style={{ ...outlineText(20), opacity: frame >= 6 ? 1 : 0 }}>
            {p.tag}
          </Tag>
          <div
            style={{
              ...outlineText(nameSize),
              marginTop: 6,
              fontFamily: term.font.display,
              fontWeight: 800,
              fontSize: nameSize,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              color: c.text,
              whiteSpace: "nowrap",
            }}
          >
            <Decrypt text={p.name} start={6} perChar={1.2} scramble={6} />
          </div>
          <TypeLine
            text={p.line}
            start={typeStart}
            cps={2.4}
            cursorUntil={Math.min(dur, Math.round(typeEnd + 30))}
            style={{ ...outlineText(30), marginTop: 10, fontSize: lineSize, color: c.ice, letterSpacing: "0.02em" }}
          />
        </div>
      </Exit>
      {sound}
    </TermStage>
  );
};
