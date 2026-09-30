import { useCurrentFrame } from "remotion";
import { z } from "zod";
import { Drop, HandNote, PixelArt, RetroWindow, Sfx, Stage, Variant, base, baseSchema } from "./primitives";
import { MarkerLayer, MarkerStroke, fmtMx, roughEllipse, roughLine } from "./marker";
import { Float, MarkerArrow, MascotSprite, PIXEL_DOWN, PIXEL_FLAT, PIXEL_UP, SAMPLE, ZoneHeading, mascotField, useZone } from "./financeKit";
import { piz } from "./theme";

// Stock-exchange price board: a retro window with rows of symbol · price · change (pixel up / down
// arrows, blue up, red down), landing one by one; then one price ticks (its change is recomputed from
// the previous close) and gets a marker underline + circle + an arrow from a hand note. Under it a
// ticker tape (a drawn paper strip) scrolls the same rows sideways the whole time. Symbols are
// FICTIONAL (never real companies or logos) and the figures are sample data.

const row = z.object({
  symbol: z.string().describe("Fictional symbol, e.g. PIXQ"),
  name: z.string(),
  price: z.number(),
  change: z.number().describe("Change vs the previous close, in %"),
});

export const tickerSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string(),
  windowTitle: z.string().describe("Title bar of the board; carries the sample-data label"),
  priceHeader: z.string().describe("Header of the price column (PRECIO / PUNTOS)"),
  prefix: z.string().describe("Price prefix ($ for pesos, empty for index points)"),
  rows: z.array(row).min(3).max(6),
  update: z.object({ index: z.number().min(0).max(5), price: z.number() }).describe("One row whose price ticks mid-clip"),
  mascot: mascotField.describe("Shown beside the board on horizontal only (no room on vertical)"),
  note: z.string(),
});
type Props = z.infer<typeof tickerSchema>;

const pct = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${fmtMx(Math.abs(v), 2)}%`;
const arrowOf = (v: number) => (v > 0 ? PIXEL_UP : v < 0 ? PIXEL_DOWN : PIXEL_FLAT);
const toneOf = (v: number) => (v > 0 ? piz.color.accent : v < 0 ? piz.color.alert : piz.color.muted);

export const Ticker: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical, width, height, z: zone } = useZone();
  if (p.update.index >= p.rows.length) throw new Error("Ticker: update.index out of range");
  const n = p.rows.length;

  // ── Layout ──
  const L = isVertical
    ? { headTop: 256, headMax: 72, win: { x: 128, y: 338, w: 780 }, rowH: 72, headerH: 38, sym: 36, name: 20, price: 38, chg: 32, arrowPx: 4, note: { x: 136, y: 838, w: 560, size: 46 }, tape: { y: 906, h: 58, sym: 30, txt: 28 }, mascot: null as null | { x: number; y: number; size: number } }
    : { headTop: 96, headMax: 80, win: { x: 150, y: 186, w: 1010 }, rowH: 78, headerH: 44, sym: 42, name: 22, price: 42, chg: 34, arrowPx: 4, note: { x: 1230, y: 486, w: 540, size: 52 }, tape: { y: 718, h: 64, sym: 32, txt: 30 }, mascot: { x: 1374, y: 196, size: 256 } };
  const BAR_H = 75; // RetroWindow top border + title bar at titleSize 32 (checked on the stills)
  const rowsTop = L.win.y + BAR_H + L.headerH;
  const rowY = (i: number) => rowsTop + i * L.rowH;
  const colPrice = L.win.w * 0.62; // right edge of the price column (inside the window)
  const colChg = L.win.w - 34; // right edge of the change column

  // ── Timing ──
  const headAt = 2;
  const boardAt = 4 + Math.min(Array.from(p.heading).length, 18);
  const rowAt = (i: number) => boardAt + 10 + i * 7;
  const tapeAt = rowAt(n - 1) + 8;
  const updAt = tapeAt + 16;
  const circleAt = updAt + 10;
  const arrowAt = circleAt + 12;
  const noteAt = arrowAt + 6;
  const mascotAt = boardAt + 4;

  // ── Data: the updated row's change is recomputed from its previous close ──
  const u = p.update.index;
  const rowsNow = p.rows.map((r, i) => {
    if (i !== u || frame < updAt) return r;
    const prevClose = r.price / (1 + r.change / 100);
    return { ...r, price: p.update.price, change: (p.update.price / prevClose - 1) * 100 };
  });
  const uRising = p.update.price >= p.rows[u].price;

  // Underline under the new price, circle around its change cell.
  const cy = rowY(u) + L.rowH / 2;
  const cxL = L.win.x + L.win.w * 0.66;
  const cxR = L.win.x + L.win.w - 16;
  const circle = { cx: (cxL + cxR) / 2, cy, rx: (cxR - cxL) / 2 + 14, ry: L.rowH / 2 + 8 };
  const underline = roughLine(L.win.x + colPrice - 190, cy + L.price * 0.5 + 4, L.win.x + colPrice, cy + L.price * 0.5 + 2, "tku", 0.02);
  const arrow = isVertical
    ? { x1: L.note.x + 440, y1: L.note.y + 22, x2: circle.cx - circle.rx * 0.55, y2: circle.cy + circle.ry - 2, bend: 0.25 }
    : { x1: L.note.x - 6, y1: L.note.y + 34, x2: circle.cx + circle.rx + 8, y2: circle.cy, bend: 0.2 };

  // Tape: the rows repeated (long enough for the whole clip; no wrap needed).
  const tapeItems = Array.from({ length: 4 }).flatMap(() => rowsNow);
  const tapeX = Math.round(-Math.max(0, frame - tapeAt) * 3);

  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <ZoneHeading text={p.heading} accent={p.accent} at={headAt} left={zone.x} top={L.headTop} width={zone.w} max={L.headMax} sfx={p.sfx} />
      <div style={{ position: "absolute", left: L.win.x, top: L.win.y }}>
        <Drop at={boardAt}>
          <RetroWindow title={p.windowTitle} width={L.win.w} titleSize={32}>
            <div style={{ height: L.headerH, display: "flex", alignItems: "center", padding: "0 30px", font: `700 24px ${piz.font.label}`, color: piz.color.muted, letterSpacing: "0.04em", position: "relative" }}>
              <div style={{ position: "absolute", left: 30 }}>SÍMBOLO</div>
              <div style={{ position: "absolute", right: L.win.w - colPrice }}>{p.priceHeader}</div>
              <div style={{ position: "absolute", right: L.win.w - colChg - 4 }}>CAMBIO</div>
            </div>
            {rowsNow.map((r, i) => (
              <div key={i} style={{ height: L.rowH, position: "relative", borderTop: `3px solid ${piz.color.greyLight}` }}>
                <Drop at={rowAt(i)} style={{ position: "absolute", inset: 0 }}>
                  <div style={{ position: "absolute", left: 30, top: 9, font: `700 ${L.sym}px ${piz.font.label}`, color: piz.color.ink, lineHeight: 1, letterSpacing: "0.02em" }}>{r.symbol}</div>
                  <div style={{ position: "absolute", left: 32, top: 12 + L.sym, font: `500 ${L.name}px ${piz.font.caption}`, color: piz.color.muted, lineHeight: 1, whiteSpace: "nowrap" }}>{r.name}</div>
                  <div style={{ position: "absolute", right: L.win.w - colPrice, top: (L.rowH - L.price) / 2 - 4, font: `700 ${L.price}px ${piz.font.mono}`, color: piz.color.ink, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
                    {p.prefix}
                    {fmtMx(r.price, 2)}
                  </div>
                  <div style={{ position: "absolute", right: L.win.w - colChg, top: 0, height: L.rowH - 3, display: "flex", alignItems: "center", gap: 12 }}>
                    <PixelArt rows={arrowOf(r.change)} px={L.arrowPx} />
                    <div style={{ font: `700 ${L.chg}px ${piz.font.mono}`, color: toneOf(r.change), fontVariantNumeric: "tabular-nums" }}>{pct(r.change)}</div>
                  </div>
                </Drop>
              </div>
            ))}
            <div style={{ height: 8 }} />
          </RetroWindow>
        </Drop>
      </div>
      {/* ticker tape: a paper strip with ink edges (a drawn object), scrolling left */}
      <div style={{ position: "absolute", left: zone.x, top: L.tape.y, width: zone.w, height: L.tape.h, visibility: frame >= tapeAt ? "visible" : "hidden" }}>
        <Drop at={tapeAt} style={{ width: "100%", height: "100%" }}>
          <div style={{ width: "100%", height: "100%", boxSizing: "border-box", background: piz.color.white, borderTop: `4px solid ${piz.color.ink}`, borderBottom: `4px solid ${piz.color.ink}`, overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", display: "flex", alignItems: "center", gap: 46, transform: `translateX(${tapeX}px)`, whiteSpace: "nowrap", paddingLeft: 24 }}>
              {tapeItems.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ font: `700 ${L.tape.sym}px ${piz.font.label}`, color: piz.color.ink }}>{r.symbol}</span>
                  <span style={{ font: `700 ${L.tape.txt}px ${piz.font.mono}`, color: piz.color.ink }}>
                    {p.prefix}
                    {fmtMx(r.price, 2)}
                  </span>
                  <PixelArt rows={arrowOf(r.change)} px={3} />
                  <span style={{ font: `700 ${L.tape.txt}px ${piz.font.mono}`, color: toneOf(r.change) }}>{pct(r.change)}</span>
                </div>
              ))}
            </div>
          </div>
        </Drop>
      </div>
      <MarkerLayer width={width} height={height}>
        <MarkerStroke d={underline} at={updAt} frames={6} color={uRising ? piz.color.accent : piz.color.alert} width={7} />
        <MarkerStroke d={roughEllipse(circle.cx, circle.cy, circle.rx, circle.ry, "tkc")} at={circleAt} frames={12} color={piz.color.accentDark} width={8} />
        <MarkerArrow {...arrow} at={arrowAt} seed="tka" color={piz.color.ink} width={7} />
      </MarkerLayer>
      <div style={{ position: "absolute", left: L.note.x, top: L.note.y, width: L.note.w }}>
        <Float px={4} phase={5}>
          <HandNote text={p.note} at={noteAt} fontSize={L.note.size} align="left" color={piz.color.accentDark} style={{ padding: "0 14px", whiteSpace: isVertical ? "nowrap" : "pre-wrap" }} />
        </Float>
      </div>
      {L.mascot ? (
        <div style={{ position: "absolute", left: L.mascot.x, top: L.mascot.y }}>
          <MascotSprite character={p.mascot} size={L.mascot.size} at={mascotAt} faces={[{ expr: "pensando", at: 0 }, { expr: uRising ? "feliz" : "sorpresa", at: updAt }]} />
        </div>
      ) : null}
      <Sfx kind="click" at={boardAt} on={p.sfx} />
      {p.rows.map((_, i) => (
        <Sfx key={i} kind="tap" at={rowAt(i)} on={p.sfx} volume={0.22} />
      ))}
      <Sfx kind="pop" at={tapeAt} on={p.sfx} volume={0.24} />
      <Sfx kind="bleep" at={updAt} on={p.sfx} />
      <Sfx kind="marker" at={circleAt} on={p.sfx} />
      <Sfx kind="marker" at={arrowAt} on={p.sfx} volume={0.32} />
    </Stage>
  );
};

export const tickerVariants: Variant<Props>[] = [
  {
    id: "indices",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "ASÍ SE LEE LA BOLSA",
      accent: "BOLSA",
      windowTitle: `Índices ficticios · ${SAMPLE}`,
      priceHeader: "PUNTOS",
      prefix: "",
      rows: [
        { symbol: "MXI35", name: "índice México 35", price: 54210.35, change: 0.84 },
        { symbol: "GLB500", name: "índice global 500", price: 5318.2, change: -0.42 },
        { symbol: "TEC100", name: "índice tecnología", price: 18640.75, change: 1.35 },
        { symbol: "EMR50", name: "mercados emergentes", price: 1086.4, change: -1.12 },
        { symbol: "PEQ200", name: "empresas pequeñas", price: 2145.9, change: 0 },
      ],
      update: { index: 4, price: 2154.5 },
      mascot: "11-trader",
      note: "azul sube · rojo baja",
    },
  },
  {
    id: "acciones",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "PRECIOS DE ACCIONES",
      accent: "ACCIONES",
      windowTitle: `Ficticias · ${SAMPLE} · MXN`,
      priceHeader: "PRECIO",
      prefix: "$",
      rows: [
        { symbol: "PIXQ", name: "Pixel Corp", price: 245.8, change: 1.2 },
        { symbol: "NOPZ", name: "Nopal Foods", price: 58.35, change: -2.1 },
        { symbol: "BTXR", name: "Bit Robotics", price: 412, change: 3.05 },
        { symbol: "SOLQ", name: "Sol Energía", price: 96.4, change: -0.35 },
        { symbol: "MZNR", name: "Maíz Norte", price: 33.1, change: 0.6 },
      ],
      update: { index: 3, price: 94.1 },
      mascot: "11-trader",
      note: "cambia a cada segundo",
    },
  },
];
