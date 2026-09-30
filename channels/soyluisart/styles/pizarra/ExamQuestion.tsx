import { interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { Drop, HandNote, PixelArt, RetroWindow, Sfx, Stage, TypeOn, Variant, base, baseSchema, clamp } from "./primitives";
import { MarkerLayer, MarkerStroke, roughLine, tickPath } from "./marker";
import { Float, MarkerArrow, MascotSprite, PIXEL_CURSOR, ZoneHeading, mascotField, useZone } from "./financeKit";
import { piz } from "./theme";

// CFA-style multiple-choice card: the stem types in a retro window, the options A/B/C land, a pixel
// cursor first clicks the tempting wrong option (red border + red marker cross, buzz, the mascot is
// surprised), then the right one (blue border + blue tick, correct chime, the mascot is happy), and
// an arrow brings in the hand note with the reason. Questions use only well-known textbook facts.

export const examQuestionSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string(),
  windowTitle: z.string().describe("Title bar; carries the 'pregunta de ejemplo' label"),
  stem: z.string(),
  options: z.array(z.string()).min(2).max(4),
  answer: z.number().min(0).max(3),
  trap: z.number().min(-1).max(3).describe("Wrong option the cursor clicks first (-1 = none)"),
  reason: z.string().describe("Hand note with the reason"),
  mascot: mascotField,
});
type Props = z.infer<typeof examQuestionSchema>;

const LETTERS = ["A", "B", "C", "D"];
const BAR_H = 75; // RetroWindow top border + title bar at titleSize 32

/** Largest font size (≤ max) whose wrapped text fits `lines` × width. */
const fitBlock = (text: string, width: number, height: number, max: number, min: number, ratio = 0.54, lh = 1.22) => {
  for (let s = max; s > min; s--) {
    const perLine = Math.floor(width / (s * ratio));
    const lines = Math.ceil(Array.from(text).length / Math.max(1, perLine));
    if (lines * s * lh <= height) return s;
  }
  return min;
};

export const ExamQuestion: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical, width, height, z: zone } = useZone();
  const n = p.options.length;
  if (p.answer >= n || p.trap >= n || p.trap === p.answer) throw new Error("ExamQuestion: answer / trap out of range");
  const V = isVertical;

  // ── Layout ──
  const card = V ? { x: 128, y: 342, w: 776 } : { x: 150, y: 186, w: 1090 };
  const pad = 30;
  const stemTop = card.y + BAR_H + 18;
  const stemH = V ? 128 : 150;
  const stemSize = fitBlock(p.stem, card.w - pad * 2, stemH, V ? 38 : 42, 26);
  const optH = V ? 64 : 78;
  const optGap = V ? 9 : 14;
  const optTop = (i: number) => stemTop + stemH + 16 + i * (optH + optGap);
  const bodyH = optTop(n) - card.y - BAR_H - optGap + 18;
  const optX = card.x + pad;
  const optW = card.w - pad * 2;
  const maxOpt = Math.max(...p.options.map((o) => Array.from(o).length));
  const optSize = Math.min(V ? 34 : 38, Math.floor((optW - 120) / (maxOpt * 0.53)));
  const mascot = V ? { x: 756, y: 806, size: 160 } : { x: 1344, y: 190, size: 320 };
  const note = V ? { x: 128, y: optTop(n) + 44, w: 620, size: 44 } : { x: 1290, y: 560, w: 490, size: 52 };

  // ── Timing ──
  const headAt = 2;
  const cardAt = 6;
  const mascotAt = 10;
  const stemAt = headAt + Array.from(p.heading).length + 3;
  const cps = 3;
  const stemFrames = Math.ceil(Array.from(p.stem).length / cps);
  const optAt = (i: number) => stemAt + stemFrames + 6 + i * 8;
  const cursorIn = optAt(n - 1) + 8;
  const trapClick = p.trap >= 0 ? cursorIn + 16 : -1;
  const ansClick = (p.trap >= 0 ? trapClick + 22 : cursorIn + 16);
  const arrowAt = ansClick + 14;
  const noteAt = arrowAt + 6;

  // Cursor path (whole pixels): enters from below-right, stops on the trap, then on the answer.
  const target = (i: number) => ({ x: optX + optW - 150, y: optTop(i) + optH / 2 });
  const start = { x: card.x + card.w + 40, y: optTop(n - 1) + optH + 60 };
  const stops = [start, ...(p.trap >= 0 ? [target(p.trap)] : []), target(p.answer)];
  const clicks = [...(p.trap >= 0 ? [trapClick] : []), ansClick];
  let cur = stops[0];
  for (let k = 0; k < clicks.length; k++) {
    const t0 = clicks[k] - 16;
    const t = interpolate(frame, [t0, clicks[k] - 3], [0, 1], { ...clamp, easing: piz.ease.out });
    if (frame >= t0) cur = { x: stops[k].x + (stops[k + 1].x - stops[k].x) * t, y: stops[k].y + (stops[k + 1].y - stops[k].y) * t };
  }
  const press = clicks.some((c) => frame >= c && frame < c + 3) ? 4 : 0;
  const cursorPx = V ? 5 : 6;

  const stateOf = (i: number) => (i === p.answer && frame >= ansClick ? "right" : i === p.trap && frame >= trapClick ? "wrong" : "idle");
  const tickBox = (i: number) => ({ x: optX + optW - 70, y: optTop(i) + optH / 2 - 26, s: 52 });
  const ansMid = { x: optX + optW, y: optTop(p.answer) + optH / 2 };
  const arrow = V
    ? { x1: note.x + 470, y1: note.y - 2, x2: ansMid.x - 200, y2: ansMid.y + optH / 2 + 10, bend: -0.3 }
    : { x1: note.x - 8, y1: note.y + 34, x2: ansMid.x + 26, y2: ansMid.y, bend: -0.25 };
  const faces = [{ expr: "pensando" as const, at: 0 }, ...(p.trap >= 0 ? [{ expr: "sorpresa" as const, at: trapClick }] : []), { expr: "feliz" as const, at: ansClick }];

  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <ZoneHeading text={p.heading} accent={p.accent} at={headAt} left={zone.x} top={V ? 256 : 96} width={zone.w} max={V ? 66 : 80} sfx={p.sfx} />
      <div style={{ position: "absolute", left: card.x, top: card.y }}>
        <Drop at={cardAt}>
          <RetroWindow title={p.windowTitle} width={card.w} titleSize={32}>
            <div style={{ height: bodyH }} />
          </RetroWindow>
        </Drop>
      </div>
      {/* stem */}
      <div style={{ position: "absolute", left: card.x + pad, top: stemTop, width: card.w - pad * 2, height: stemH }}>
        <TypeOn text={p.stem} at={stemAt} cps={cps} fontSize={stemSize} fontFamily={piz.font.caption} weight={700} align="left" lineHeight={1.22} />
      </div>
      {/* options: drawn answer buttons (text inside the drawn object) */}
      {p.options.map((o, i) => {
        const st = stateOf(i);
        const border = st === "right" ? piz.color.accent : st === "wrong" ? piz.color.alert : piz.color.ink;
        return (
          <div key={i} style={{ position: "absolute", left: optX, top: optTop(i), width: optW, height: optH }}>
            <Drop at={optAt(i)} style={{ width: "100%", height: "100%" }}>
              <div style={{ width: "100%", height: "100%", boxSizing: "border-box", border: `${st === "idle" ? 4 : 6}px solid ${border}`, background: piz.color.white, display: "flex", alignItems: "center", gap: 18, padding: "0 16px" }}>
                <div style={{ width: optH - 22, height: optH - 22, flexShrink: 0, boxSizing: "border-box", border: `4px solid ${border}`, background: st === "right" ? piz.color.accent : st === "wrong" ? piz.color.alert : piz.color.white, color: st === "idle" ? piz.color.ink : piz.color.white, display: "flex", alignItems: "center", justifyContent: "center", font: `700 ${Math.round(optH * 0.5)}px ${piz.font.label}` }}>
                  {LETTERS[i]}
                </div>
                <div style={{ font: `700 ${optSize}px ${piz.font.caption}`, color: st === "wrong" ? piz.color.alert : piz.color.ink, whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>{o}</div>
              </div>
            </Drop>
          </div>
        );
      })}
      <MarkerLayer width={width} height={height}>
        {p.trap >= 0
          ? (() => {
              const b = tickBox(p.trap);
              return (
                <>
                  <MarkerStroke d={roughLine(b.x, b.y, b.x + b.s, b.y + b.s, "x1", 0.03)} at={trapClick} frames={5} color={piz.color.alert} width={9} />
                  <MarkerStroke d={roughLine(b.x + b.s, b.y, b.x, b.y + b.s, "x2", 0.03)} at={trapClick + 4} frames={5} color={piz.color.alert} width={9} />
                </>
              );
            })()
          : null}
        {(() => {
          const b = tickBox(p.answer);
          return <MarkerStroke d={tickPath(b.x, b.y, b.s)} at={ansClick} frames={8} color={piz.color.accent} width={10} />;
        })()}
        <MarkerArrow {...arrow} at={arrowAt} seed="qa" color={piz.color.ink} width={7} />
      </MarkerLayer>
      {/* pixel cursor */}
      {frame >= cursorIn && frame < ansClick + 12 ? (
        <div style={{ position: "absolute", left: Math.round(cur.x), top: Math.round(cur.y) + press }}>
          <PixelArt rows={PIXEL_CURSOR} px={cursorPx} />
        </div>
      ) : null}
      <div style={{ position: "absolute", left: mascot.x, top: mascot.y }}>
        <MascotSprite character={p.mascot} size={mascot.size} at={mascotAt} faces={faces} />
      </div>
      <div style={{ position: "absolute", left: note.x, top: note.y, width: note.w }}>
        <Float px={4} phase={11}>
          <HandNote text={p.reason} at={noteAt} fontSize={note.size} align="left" color={piz.color.accentDark} style={{ padding: "0 14px 0 4px" }} />
        </Float>
      </div>
      <Sfx kind="click" at={cardAt} on={p.sfx} volume={0.26} />
      <Sfx kind="pop" at={mascotAt} on={p.sfx} volume={0.2} />
      <Sfx kind="type" at={stemAt} frames={stemFrames} on={p.sfx} volume={0.2} />
      {p.options.map((_, i) => (
        <Sfx key={i} kind="tap" at={optAt(i)} on={p.sfx} volume={0.22} />
      ))}
      {p.trap >= 0 ? <Sfx kind="wrong" at={trapClick} on={p.sfx} /> : null}
      <Sfx kind="correct" at={ansClick} on={p.sfx} />
      <Sfx kind="marker" at={arrowAt} on={p.sfx} volume={0.32} />
    </Stage>
  );
};

export const examQuestionVariants: Variant<Props>[] = [
  {
    id: "cfa-etica",
    horizontal: true,
    props: {
      ...base("board", 7),
      heading: "PREGUNTA TIPO CFA",
      accent: "CFA",
      windowTitle: "Ética · pregunta de ejemplo",
      stem: "Un analista se entera de información importante sobre una empresa que aún no es pública. ¿Qué debe hacer?",
      options: ["Comprar acciones antes de que se sepa", "Contársela solo a sus mejores clientes", "No usarla ni compartirla"],
      answer: 2,
      trap: 1,
      reason: "usar información privilegiada está prohibido",
      mascot: "birrete-base",
    },
  },
  {
    id: "cfa-bonos",
    horizontal: true,
    props: {
      ...base("board", 7),
      heading: "PREGUNTA TIPO CFA",
      accent: "CFA",
      windowTitle: "Renta fija · pregunta de ejemplo",
      stem: "Si las tasas de interés del mercado suben, ¿qué le pasa al precio de un bono de tasa fija que ya tienes?",
      options: ["Sube", "No cambia", "Baja"],
      answer: 2,
      trap: 0,
      reason: "precio del bono y tasa se mueven al revés",
      mascot: "bit-cfa-base",
    },
  },
];
