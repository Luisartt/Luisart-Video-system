import { interpolate } from "remotion";
import { z } from "zod";
import { term } from "./theme";
import { backingField, clamp, Exit, formatNum, Panel, safeGuideField, SampleChip, SplitFlap, Tag, TermStage, TypeLine, useLayout, useLife, usePalette, sfxField, TSfx, upperKeepName } from "./primitives";

// Split-flap ticker: symbol, price and change flip into place on departure-board tiles.
// `single` is the prototype's big one-line board; `watchlist` stacks 3–4 smaller rows.
// On green backing gains are drawn in ice with ▲ (the gain green would key out).

const row = z.object({ symbol: z.string(), price: z.number(), change: z.number().describe("Variación en %") });

export const tickerSchema = z.object({
  backing: backingField,
  safeGuide: safeGuideField,
  sfx: sfxField,
  duration: z.number().min(2).max(10).default(5),
  layout: z.enum(["single", "watchlist"]),
  side: z.enum(["left", "right"]),
  chapter: z.string(),
  tag: z.string(),
  caption: z.string().describe("Línea mono bajo el ticker (solo single)"),
  sample: z.boolean().describe('Muestra "[Dato de ejemplo]"'),
  decimals: z.number().int().min(0).max(4),
  rows: z.array(row).min(1).max(4),
});
export type TickerProps = z.infer<typeof tickerSchema>;

const base: TickerProps = {
  backing: "green",
  safeGuide: false, sfx: true,
  duration: 5,
  layout: "single",
  side: "left",
  chapter: "03",
  tag: "Mercado",
  caption: "NVDA · US$ · cierre · Nasdaq",
  sample: true,
  decimals: 2,
  rows: [{ symbol: "NVDA", price: 1284.5, change: 4.2 }],
};

export const tickerVariants: Record<string, TickerProps> = {
  gain: base,
  loss: { ...base, caption: "TSLA · US$ · cierre · Nasdaq", rows: [{ symbol: "TSLA", price: 212.35, change: -3.8 }] },
  watchlist: {
    ...base,
    layout: "watchlist",
    side: "right",
    tag: "Watchlist · US$",
    rows: [
      { symbol: "NVDA", price: 1284.5, change: 4.2 },
      { symbol: "MSFT", price: 468.1, change: 1.1 },
      { symbol: "GOOGL", price: 176.9, change: -0.6 },
      { symbol: "TSLA", price: 212.35, change: -3.8 },
    ],
  },
};

const changeText = (v: number) => `${v >= 0 ? "▲" : "▼"} ${formatNum(Math.abs(v), 1)} %`;

export const Ticker: React.FC<TickerProps> = (p) => {
  const { frame } = useLife();
  const pal = usePalette();
  const c = term.color;
  const tick = interpolate(frame, [0, 8], [0, 1], { ...clamp, easing: term.ease.snap });
  const right = p.side === "right";
  const L = useLayout();
  // Vertical: full safe-box width, near the top of the safe area.
  const pos: React.CSSProperties = L.v
    ? { left: L.left, top: L.top + 30, width: L.safeBox.w }
    : { [right ? "right" : "left"]: term.margin, top: term.margin };
  const panelW: React.CSSProperties = L.v ? { width: L.safeBox.w } : {};

  // Last tile settles at start + (tiles − 1) × stagger + flips × flipFrames (SplitFlap timing).
  const settle = (start: number, text: string, stagger: number, flips: number) => start + (Array.from(text).filter((ch) => ch !== " ").length - 1) * stagger + flips * 2;
  const r0 = p.rows[0];
  const lastSettle = Math.round(
    p.layout === "single"
      ? L.v
        ? Math.max(settle(4, r0.symbol, 1.5, 6), settle(8, formatNum(r0.price, p.decimals), 1.5, 6), settle(16, changeText(r0.change), 1.5, 6))
        : settle(4, `${r0.symbol}${formatNum(r0.price, p.decimals)}${changeText(r0.change)}`, 1.5, 6)
      : Math.max(...p.rows.map((r, i) => settle(4 + i * 5 + 8, changeText(r.change), 1, 5))),
  );
  const sound = (
    <>
      <TSfx kind="flap" at={4} frames={lastSettle - 4} on={p.sfx} />
      <TSfx kind="bleep" at={lastSettle} on={p.sfx} />
    </>
  );

  const header = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 40, opacity: frame >= 2 ? 1 : 0 }}>
      <Tag>
        [{p.chapter}] {p.tag}
      </Tag>
      {p.sample ? <SampleChip /> : null}
    </div>
  );

  if (p.layout === "single") {
    const r = p.rows[0];
    return (
      <TermStage backing={p.backing} safeGuide={p.safeGuide}>
        <Exit dir={right ? "rtl" : "ltr"} style={pos}>
          <Panel tick={tick} style={{ padding: "28px 36px 30px 36px", ...panelW }}>
            {header}
            {L.v ? (
              <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 14 }}>
                <SplitFlap start={4} tileW={72} tileH={108} fontSize={76} segments={[{ text: r.symbol, c: c.ice }]} />
                <SplitFlap start={8} tileW={72} tileH={108} fontSize={76} segments={[{ text: formatNum(r.price, p.decimals), c: c.text }]} />
                <SplitFlap start={16} tileW={72} tileH={108} fontSize={76} segments={[{ text: changeText(r.change), c: r.change >= 0 ? pal.gain : pal.loss }]} />
              </div>
            ) : (
            <div style={{ marginTop: 24 }}>
              <SplitFlap
                start={4}
                segments={[
                  { text: r.symbol, c: c.ice },
                  { text: " " },
                  { text: formatNum(r.price, p.decimals), c: c.text },
                  { text: " " },
                  { text: changeText(r.change), c: r.change >= 0 ? pal.gain : pal.loss },
                ]}
              />
            </div>
            )}
            {p.caption ? (
              <TypeLine text={upperKeepName(p.caption)} start={30} cps={2} cursorUntil={0} style={{ marginTop: 22, fontSize: L.v ? 24 : 20, color: c.muted, letterSpacing: "0.06em" }} />
            ) : null}
          </Panel>
        </Exit>
        {sound}
    </TermStage>
    );
  }

  // Watchlist: fixed-width columns so rows line up.
  const tile = L.v ? { tileW: 32, tileH: 52, fontSize: 36, gap: 3, flips: 5, stagger: 1 } : { tileW: 36, tileH: 56, fontSize: 38, gap: 4, flips: 5, stagger: 1 };
  const colW = (chars: number) => chars * (tile.tileW + 2 + tile.gap);
  const symChars = Math.max(...p.rows.map((r) => r.symbol.length));
  const priceChars = Math.max(...p.rows.map((r) => formatNum(r.price, p.decimals).length));
  return (
    <TermStage backing={p.backing} safeGuide={p.safeGuide}>
      <Exit dir={right ? "rtl" : "ltr"} style={pos}>
        <Panel tick={tick} style={{ padding: L.v ? "28px 24px 30px 24px" : "28px 32px 30px 32px", ...panelW }}>
          {header}
          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: L.v ? 16 : 12 }}>
            {p.rows.map((r, i) => {
              const s = 4 + i * 5;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: L.v ? 14 : 26 }}>
                  <div style={{ width: colW(symChars) }}>
                    <SplitFlap {...tile} start={s} segments={[{ text: r.symbol, c: c.ice }]} />
                  </div>
                  <div style={{ width: colW(priceChars), display: "flex", justifyContent: "flex-end" }}>
                    <SplitFlap {...tile} start={s + 3} segments={[{ text: formatNum(r.price, p.decimals), c: c.text }]} />
                  </div>
                  <SplitFlap {...tile} start={s + 8} segments={[{ text: changeText(r.change), c: r.change >= 0 ? pal.gain : pal.loss }]} />
                </div>
              );
            })}
          </div>
        </Panel>
      </Exit>
      {sound}
    </TermStage>
  );
};
