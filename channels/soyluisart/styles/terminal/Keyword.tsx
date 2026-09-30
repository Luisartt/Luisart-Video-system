import { interpolate } from "remotion";
import { z } from "zod";
import { term } from "./theme";
import { backingField, clamp, CornerTicks, Decrypt, decryptEnd, Exit, fitDisplay, formatNum, outlineText, safeGuideField, SampleChip, Tag, TermStage, useLayout, useLife, sfxField, TSfx } from "./primitives";
import { spaced } from "../shared/sfx";

// Emphasis: one big word or phrase (or 2–3 stacked lines, alternating white / ice) that decrypts
// inside corner ticks, with a mono tag. `stat` swaps the words for a big mono number that counts
// up, with a label and the sample-data line.
// 2026-09-27 (user feedback): NO panel/plate behind the text any more. Legibility comes from a thin
// opaque outline painted under the letters (paint-order stroke) — key-safe on green, unlike a soft
// shadow.

export const keywordSchema = z.object({
  backing: backingField,
  safeGuide: safeGuideField,
  sfx: sfxField,
  duration: z.number().min(2).max(10).default(3.5),
  layout: z.enum(["words", "stat"]),
  position: z.enum(["center", "left", "right"]),
  tag: z.string(),
  lines: z.array(z.string()).min(1).max(3).describe("words: 1–3 líneas"),
  size: z.number().min(60).max(260),
  value: z.number().describe("stat: número final"),
  decimals: z.number().int().min(0).max(3),
  prefix: z.string(),
  suffix: z.string(),
  label: z.string().describe("stat: texto bajo el número"),
  sample: z.boolean().describe('stat: muestra "[Dato de ejemplo]"'),
});
export type KeywordProps = z.infer<typeof keywordSchema>;

const base: KeywordProps = {
  backing: "green",
  safeGuide: false, sfx: true,
  duration: 3.5,
  layout: "words",
  position: "center",
  tag: "[!] Clave",
  lines: ["Automatiza."],
  size: 200,
  value: 0,
  decimals: 0,
  prefix: "",
  suffix: "",
  label: "",
  sample: false,
};

export const keywordVariants: Record<string, KeywordProps> = {
  single: base,
  stacked: { ...base, duration: 4, tag: "[!] La fórmula", lines: ["Prompt.", "Contexto.", "Resultado."], size: 140 },
  stat: {
    ...base,
    duration: 4,
    layout: "stat",
    tag: "[#] La cifra",
    size: 190,
    value: 73,
    suffix: " %",
    label: "de las empresas ya usa IA",
    sample: true,
  },
};

export const Keyword: React.FC<KeywordProps> = (p) => {
  const { frame } = useLife();
  const c = term.color;
  const f = term.font;
  const tick = interpolate(frame, [0, 8], [0, 1], { ...clamp, easing: term.ease.snap });
  const L = useLayout();
  const PAD = L.v ? 44 : 56;
  const panelW = L.safeBox.w - 24; // ticks sit 12 px outside the panel
  const innerW = panelW - PAD * 2;
  // Vertical: the panel spans the safe box and the longest line sets the size (never above 0.9×).
  const longest = p.lines.reduce((a, b) => (b.length > a.length ? b : a), "");
  const size = L.v ? (p.layout === "words" ? fitDisplay(longest, innerW, Math.round(p.size * 0.9), 0.55) : Math.round(p.size * 0.95)) : p.size;
  const align = p.position === "center" ? "center" : p.position === "left" ? "flex-start" : "flex-end";
  const pos: React.CSSProperties = L.v
    ? { left: L.left + 12, width: panelW, top: L.zones.graphics.y + L.zones.graphics.h / 2, transform: "translateY(-50%)" }
    : p.position === "center"
      ? { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }
      : { [p.position]: term.margin, top: "50%", transform: "translateY(-50%)" };

  const lineStarts: number[] = [];
  let body: React.ReactNode;
  if (p.layout === "words") {
    let start = 4;
    body = p.lines.map((line, i) => {
      const s = start;
      lineStarts.push(s);
      start = Math.round(decryptEnd(line, s, 0.8) - 6);
      return (
        <div
          key={i}
          style={{
            ...outlineText(size),
            fontFamily: f.display,
            fontWeight: 800,
            fontSize: size,
            lineHeight: 0.98,
            letterSpacing: term.tracking.display,
            color: i % 2 === 0 ? c.text : c.ice,
            whiteSpace: L.v ? "normal" : "nowrap",
          }}
        >
          <Decrypt text={line} start={s} perChar={0.8} />
        </div>
      );
    });
  } else {
    const v = interpolate(frame, [6, 34], [0, p.value], { ...clamp, easing: term.ease.snap });
    // Prefix/suffix (units) are set smaller than the digits, as in a terminal readout.
    const num = (x: number) => (
      <>
        {p.prefix ? <span style={{ fontSize: "0.55em", marginRight: "0.12em" }}>{p.prefix}</span> : null}
        <span style={{ color: c.ice }}>{formatNum(x, p.decimals)}</span>
        {p.suffix ? <span style={{ fontSize: "0.55em", marginLeft: "0.12em" }}>{p.suffix.trim()}</span> : null}
      </>
    );
    body = (
      <>
        <div style={{ ...outlineText(size), position: "relative", fontFamily: f.mono, fontWeight: 700, fontSize: size, lineHeight: 1, letterSpacing: "-0.03em", color: c.text, whiteSpace: "pre" }}>
          {/* Final value laid out invisibly so the box never resizes while counting. */}
          <span style={{ visibility: "hidden" }}>{num(p.value)}</span>
          <span style={{ position: "absolute", right: 0, top: 0, visibility: frame >= 6 ? "visible" : "hidden" }}>{num(v)}</span>
        </div>
        {p.label ? (
          <div style={{ ...outlineText(L.v ? 56 : Math.round(p.size * 0.24)), marginTop: 14, fontFamily: f.display, fontWeight: 700, fontSize: L.v ? 56 : Math.round(p.size * 0.24), lineHeight: L.v ? 1.1 : undefined, letterSpacing: "-0.02em", color: c.text, whiteSpace: L.v ? "normal" : "nowrap" }}>
            <Decrypt text={p.label} start={16} perChar={0.4} scramble={5} />
          </div>
        ) : null}
        {p.sample ? <SampleChip style={{ marginTop: 22, visibility: frame >= 24 ? "visible" : "hidden" }} /> : null}
      </>
    );
  }

  const sound =
    p.layout === "words" ? (
      <>
        {spaced(lineStarts).map((f) => (
          <TSfx key={f} kind="techSelect" at={f} on={p.sfx} />
        ))}
      </>
    ) : (
      <>
        <TSfx kind="ticking" at={6} frames={28} on={p.sfx} />
        <TSfx kind="bleep" at={34} on={p.sfx} />
      </>
    );

  return (
    <TermStage backing={p.backing} safeGuide={p.safeGuide}>
      <Exit style={pos}>
        <div
          style={{
            position: "relative",
            padding: L.v ? "38px 44px 46px" : "38px 56px 46px",
            boxSizing: "border-box",
            width: L.v ? panelW : undefined,
            display: "flex",
            flexDirection: "column",
            alignItems: L.v ? "center" : align,
            textAlign: L.v || p.position === "center" ? "center" : p.position === "right" ? "right" : "left",
          }}
        >
          <CornerTicks size={30} p={tick} c={c.ice} weight={3} inset={-1} />
          <Tag size={18} style={{ ...outlineText(22), marginBottom: 18, visibility: frame >= 3 ? "visible" : "hidden" }}>{p.tag}</Tag>
          {body}
        </div>
      </Exit>
      {sound}
    </TermStage>
  );
};
