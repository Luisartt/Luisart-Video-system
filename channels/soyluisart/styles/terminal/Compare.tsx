import { interpolate } from "remotion";
import { z } from "zod";
import { term } from "./theme";
import { backingField, clamp, CornerTicks, Decrypt, Exit, LOGOS, LogoNode, outlineText, Panel, safeGuideField, SampleChip, Tag, TermStage, useLayout, useLife, usePalette, type LogoKey, sfxField, TSfx } from "./primitives";

// Side-by-side comparison of two tools: logo node, name, and mono stat rows that decrypt in
// one by one; the better value in each row is marked ▲. Built from the prototype's panels,
// tags and decrypt text. The two cards ARE the graphic and stay; since 2026-09-27 (user rule,
// no chips behind text) the chapter tag and the "VS" between the cards are plain outlined text,
// the VS bracketed by hairline corner ticks with no fill.

const logoOrNone = z.enum(["none", ...(Object.keys(LOGOS) as LogoKey[])] as ["none", ...LogoKey[]]);
const side = z.object({ logo: logoOrNone, monogram: z.string(), name: z.string(), tag: z.string() });

export const compareSchema = z.object({
  backing: backingField,
  safeGuide: safeGuideField,
  sfx: sfxField,
  duration: z.number().min(3).max(10).default(6),
  chapter: z.string(),
  tag: z.string(),
  sample: z.boolean().describe('Muestra "[Dato de ejemplo]"'),
  left: side,
  right: side,
  rows: z
    .array(z.object({ label: z.string(), left: z.string(), right: z.string(), better: z.enum(["left", "right", "none"]) }))
    .min(1)
    .max(6),
});
export type CompareProps = z.infer<typeof compareSchema>;

export const compareVariants: Record<string, CompareProps> = {
  "chatgpt-vs-claude": {
    backing: "green",
    safeGuide: false, sfx: true,
    duration: 6,
    chapter: "04",
    tag: "Comparativa",
    sample: true,
    left: { logo: "chatgpt", monogram: "A", name: "ChatGPT", tag: "[A] OpenAI" },
    right: { logo: "claude", monogram: "B", name: "Claude", tag: "[B] Anthropic" },
    rows: [
      { label: "Plan básico", left: "20 US$/mes", right: "20 US$/mes", better: "none" },
      { label: "Contexto", left: "128 K", right: "200 K", better: "right" },
      { label: "Velocidad", left: "95 tok/s", right: "80 tok/s", better: "left" },
      { label: "Nota en código", left: "8.7", right: "9.1", better: "right" },
    ],
  },
  generic: {
    backing: "green",
    safeGuide: false, sfx: true,
    duration: 6,
    chapter: "04",
    tag: "Comparativa",
    sample: true,
    left: { logo: "none", monogram: "A", name: "Opción A", tag: "[A] Gratis" },
    right: { logo: "none", monogram: "B", name: "Opción B", tag: "[B] De pago" },
    rows: [
      { label: "Precio", left: "0 US$/mes", right: "12 US$/mes", better: "left" },
      { label: "Integraciones", left: "400+", right: "1,500+", better: "right" },
      { label: "Curva", left: "Baja", right: "Media", better: "left" },
    ],
  },
};

const COL = 620;
const GAP = 96;
const TOTAL = COL * 2 + GAP;

export const Compare: React.FC<CompareProps> = (p) => {
  const { frame } = useLife();
  const pal = usePalette();
  const c = term.color;
  const f = term.font;
  const tick = interpolate(frame, [0, 8], [0, 1], { ...clamp, easing: term.ease.snap });
  const rowStart = (i: number) => 16 + i * 7;
  const L = useLayout();
  // Vertical: the two cards sit side by side inside the graphics zone (y 250–970, 800 wide),
  // compact: smaller logo and name, each row's label above its value, "VS" in the gap.
  const V_GAP = 56;
  const colW = L.v ? (L.zones.graphics.w - V_GAP) / 2 : COL;
  const labelFs = L.v ? 14 : 17;
  const valueFs = 30;
  const vs = (box: number, fs: number, style: React.CSSProperties) => (
    <div
      style={{
        position: "relative",
        width: box,
        height: box,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...outlineText(fs + 8),
        fontFamily: f.mono,
        fontWeight: 700,
        fontSize: fs,
        letterSpacing: "0.04em",
        color: c.ice,
        visibility: frame >= 8 ? "visible" : "hidden",
        ...style,
      }}
    >
      <CornerTicks size={Math.round(box / 4)} c={c.blue} weight={3} inset={0} />
      VS
    </div>
  );

  const column = (s: CompareProps["left"], which: "left" | "right", delay: number) => (
    <Panel tick={tick} style={{ width: colW, visibility: frame >= delay ? "visible" : "hidden" }}>
      <div style={{ padding: L.v ? "20px 22px 18px" : "28px 32px 24px", display: "flex", alignItems: "center", gap: L.v ? 16 : 26, borderBottom: `1px solid ${c.hairline}` }}>
        <LogoNode logo={s.logo === "none" ? null : s.logo} monogram={s.monogram} size={L.v ? 64 : 96} style={{ position: "relative", flexShrink: 0 }} />
        <div>
          <Tag size={L.v ? 13 : 15}>{s.tag}</Tag>
          <div style={{ marginTop: 6, fontFamily: f.display, fontWeight: 800, fontSize: L.v ? 44 : 60, lineHeight: 1, letterSpacing: "-0.035em", color: c.text, whiteSpace: "nowrap" }}>
            <Decrypt text={s.name} start={delay + 4} perChar={1} scramble={6} />
          </div>
        </div>
      </div>
      <div style={{ padding: L.v ? "4px 22px 12px" : "8px 32px 18px" }}>
        {p.rows.map((r, i) => {
          const v = which === "left" ? r.left : r.right;
          const best = r.better === which;
          const on = frame >= rowStart(i);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: L.v ? "column" : "row",
                justifyContent: "space-between",
                alignItems: L.v ? "flex-start" : "center",
                gap: L.v ? 6 : 0,
                padding: L.v ? "12px 0" : "16px 0",
                borderBottom: i < p.rows.length - 1 ? `1px solid ${c.hairline}` : undefined,
                visibility: on ? "visible" : "hidden",
              }}
            >
              <Tag size={labelFs} c={c.muted}>
                {r.label}
              </Tag>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: f.mono, fontWeight: 700, fontSize: valueFs, color: best ? c.ice : c.text, whiteSpace: "nowrap" }}>
                <Decrypt text={v} start={rowStart(i) + 1} perChar={0.6} scramble={5} />
                <span style={{ fontSize: 20, color: pal.gain, width: 20, visibility: best && frame >= rowStart(i) + 8 ? "visible" : "hidden" }}>▲</span>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );

  const rowClicks = p.rows.map((_, i) => rowStart(i));
  const winners = p.rows.map((r, i) => (r.better === "none" ? -1 : rowStart(i) + 8)).filter((f) => f >= 0);
  const dingAt = winners.length ? Math.max(Math.max(...winners), rowClicks[rowClicks.length - 1] + 6) : -1;
  const sound = (
    <>
      <TSfx kind="clickTone" at={1} on={p.sfx} />
      {rowClicks.map((f) => (
        <TSfx key={f} kind="clickSelect" at={f} on={p.sfx} />
      ))}
      {dingAt >= 0 ? <TSfx kind="ding" at={dingAt} on={p.sfx} /> : null}
    </>
  );

  return (
    <TermStage backing={p.backing} safeGuide={p.safeGuide}>
      <Exit style={L.v ? { left: L.zones.graphics.x, top: L.zones.graphics.y + 20, width: L.zones.graphics.w } : { left: (1920 - TOTAL) / 2, top: 150, width: TOTAL }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, visibility: frame >= 2 ? "visible" : "hidden" }}>
          <Tag style={outlineText(24)}>
            [{p.chapter}] {p.tag}
          </Tag>
          {p.sample ? <SampleChip /> : null}
        </div>
        {L.v ? (
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            {column(p.left, "left", 1)}
            {vs(48, 20, { position: "absolute", left: L.zones.graphics.w / 2 - 24, top: 32 })}
            {column(p.right, "right", 4)}
          </div>
        ) : (
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          {column(p.left, "left", 1)}
          {vs(68, 26, { position: "absolute", left: TOTAL / 2 - 34, top: 58 })}
          {column(p.right, "right", 4)}
        </div>
        )}
      </Exit>
      {sound}
    </TermStage>
  );
};
