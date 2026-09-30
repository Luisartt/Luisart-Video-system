import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Bit, DotBoard, Drop, HandNote, PixelBubble, PixelIcon, Show, StickFigure, TypeOn } from "../../../../styles/pizarra/primitives";
import { piz } from "../../../../styles/pizarra/theme";
import { ZONES } from "../../../../styles/shared/formats";
import { A, B, EXAMPLE_LABEL, money, num, pu, type Company } from "../figures";
import { PriceTag } from "./icons";
import { HEAD_AFTER_CUT, T, W, type BoardId } from "./layout";
import { Marker, curvedArrow, doubleArrow, handEllipse, handLine } from "./Marker";
import { Breathe, Drift, Float } from "./motion";

// The white dotted board scenes (Santiago's pizarra in the Luisart brand). Every element lands on
// the word that names it; layouts change on hard cuts; nothing has an exit animation. No speaker
// picture-in-picture. v3 (user, 2026-09-27): more hand-drawn marker arrows that draw on as he
// speaks (price → result, A → B, question → cards…), and constant micro-movement: the paper
// drifts slower than the content (parallax), results breathe, cards and tags float.
// Scenes are drawn on a 1080×1920 sheet and fitted into their zone by BoardView (full board:
// graphics zone y 250–970; split: top band y 262–790). Split-only scenes: "hook", "buena", "compara".

const { color, font } = piz;
const L = 120;

/** `horizontal`: drawn as pieces of the 1920×1080 layout (H_LAYOUTS) — arrows that would cross two
 *  pieces are left out here and redrawn in frame coordinates by the layout's overlay. */
type SceneProps = { from: number; horizontal?: boolean };
const WIDTH = 800;

/** Horizontally centred block in the safe width. */
const Row: React.FC<{ top: number; children: React.ReactNode; left?: number; width?: number; align?: "center" | "left" | "right" }> = ({
  top,
  children,
  left = L,
  width = WIDTH,
  align = "center",
}) => (
  <div style={{ position: "absolute", left, width, top, display: "flex", justifyContent: align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end" }}>
    {children}
  </div>
);

const Heading: React.FC<{ text: string; at: number; top: number; size?: number; accent?: string; tone?: string }> = ({ text, at, top, size = 120, accent = "", tone = color.ink }) => (
  <Row top={top}>
    <TypeOn text={text} at={at} accent={accent} color={tone} fontSize={size} weight={800} letterSpacing="-0.015em" lineHeight={0.95} style={{ whiteSpace: "nowrap" }} />
  </Row>
);

/** Handwriting overhangs its box a little (swashes, "¡"): pad so the write-on clip never cuts it. */
const NOTE_PAD: React.CSSProperties = { padding: "0 14px" };

/** The "dato de ejemplo · MXN" label: one line, never wraps. */
const LABEL_STYLE: React.CSSProperties = { ...NOTE_PAD, whiteSpace: "nowrap" };

/** Label sizes on the sheet, chosen so the label reads ≥ 42 px after the full-board fit (Codex v6
 *  split M1: at 46 px it came out ≈ 32–35 px, too small on a phone). */
const LABEL_PRECIO = 56; // × 0.75 fit
const LABEL_COMPARE = 62; // × 0.68 fit

/** Fit a big figure into `w` px (Inter Tight 800 digits ≈ 0.62 em). */
const fitNum = (text: string, w: number, max: number) => Math.min(max, Math.floor(w / (Array.from(text).length * 0.62)));


// ── 1 · "Todo el mundo ve el precio y dice: ah, está regalada" ────────────────────────────────
const PrecioBoard: React.FC<SceneProps> = ({ from, horizontal = false }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Heading text="EL PRECIO" accent="PRECIO" at={from + 3} top={292} />
      <Row top={428}>
        <HandNote text="lo que todo el mundo ve" at={from} fontSize={66} style={NOTE_PAD} />
      </Row>
      {/* "ve" → an arrow draws from the note to where the tag drops on "precio" */}
      {horizontal ? null : <Marker d={curvedArrow(760, 520, 790, 880, "ve", -0.35)} at={W.ve} frames={8} color={color.accent} width={8} />}
      <Marker d={handLine(140, 1214, 940, 1214, "ground")} at={from} frames={6} width={6} />
      <div style={{ position: "absolute", left: 150, top: 1212 - 400 }}>
        <StickFigure h={400} pose={frame >= W.precio1 ? "point" : "stand"} />
      </div>
      <div style={{ position: "absolute", left: 512, top: 900 }}>
        <Drop at={W.precio1}>
          <Float px={6} period={40}>
            <PriceTag text={money(A.price)} />
          </Float>
        </Drop>
      </div>
      <div style={{ position: "absolute", left: 196, top: 612 }}>
        <PixelBubble text="¡Ah, está regalada!" at={W.ah} fontSize={48} tail="left" sfx={false} />
      </div>
      <Row left={500} width={420} top={1086}>
        <HandNote text={EXAMPLE_LABEL} at={W.precio1} fontSize={LABEL_PRECIO} color={color.muted} style={LABEL_STYLE} />
      </Row>
    </>
  );
};

/** "P/U" of the formula board types once the heading is done (and not before "múltiplo"). */
const formulaPuAt = (from: number) => Math.max(from + HEAD_AFTER_CUT + Array.from("MÚLTIPLO P/U").length + 2, W.multiplo + 4);

// ── 2 · "Ahí entra el múltiplo de precio y utilidad" ──────────────────────────────────────────
const FormulaBoard: React.FC<SceneProps> = ({ from, horizontal = false }) => {
  const puAt = formulaPuAt(from);
  return (
    <>
      <Heading text="MÚLTIPLO P/U" accent="P/U" at={from + HEAD_AFTER_CUT} top={292} size={108} />
      <div style={{ position: "absolute", left: 120, width: 262, top: 596, display: "flex", justifyContent: "center" }}>
        <Breathe at={puAt} amp={0.04}>
          <TypeOn text="P/U" at={puAt} color={color.accent} fontSize={140} weight={800} letterSpacing="-0.02em" />
        </Breathe>
      </div>
      <Show at={puAt + 3} style={{ position: "absolute", left: 382, width: 70, top: 604, textAlign: "center", font: `800 120px ${font.heading}`, color: color.ink, lineHeight: 1 }}>
        =
      </Show>
      <Row left={456} width={464} top={540}>
        <TypeOn text="PRECIO" at={W.precioF} fontSize={90} weight={800} letterSpacing="-0.015em" />
      </Row>
      <Marker d={handLine(470, 668, 906, 668, "fbar")} at={W.yF} frames={6} width={9} />
      <Row left={456} width={464} top={690}>
        <TypeOn text="UTILIDAD" at={W.utilidadF} fontSize={90} weight={800} letterSpacing="-0.015em" />
      </Row>
      <Row left={456} width={464} top={792}>
        <HandNote text="por acción" at={W.utilidadF + 8} fontSize={62} style={NOTE_PAD} />
      </Row>
      {/* Bit drops in on "entra" and an arrow from Bit points at the multiple */}
      <Row top={960}>
        <Drop at={W.entra}>
          <Bit px={11} expression="happy" />
        </Drop>
      </Row>
      {horizontal ? null : <Marker d={curvedArrow(420, 1010, 250, 770, "bitpu", 0.35)} at={puAt - 2} frames={8} color={color.accent} width={8} />}
    </>
  );
};

// ── 3/4 · "Por ejemplo, si una empresa vale 20…" / "Si otra vale 100…" ──────────────────────────
type EmpresaTimes = { head: number; price: number; bar: number; eps: number; mult: number; pu: number };
const D = 56; // the fraction block sits a little lower than the heading pair
const EmpresaBoard: React.FC<{ from: number; letter: "A" | "B"; c: Company; t: EmpresaTimes; reminder?: string }> = ({ from, letter, c, t, reminder }) => {
  const price = money(c.price);
  const eps = money(c.eps);
  const result = num(pu(c));
  const rSize = fitNum(result, 206, 280);
  const rHalf = (Array.from(result).length * 0.62 * rSize) / 2;
  return (
    <>
      <Heading text={`EMPRESA ${letter}`} accent={letter} at={t.head} top={292} />
      <Row top={424}>
        <HandNote text={EXAMPLE_LABEL} at={from} fontSize={52} color={color.muted} style={LABEL_STYLE} />
      </Row>
      {/* fraction: precio / utilidad por acción */}
      <Row left={130} width={440} top={512 + D}>
        <HandNote text="precio" at={t.price} fontSize={58} style={NOTE_PAD} />
      </Row>
      <Row left={130} width={440} top={576 + D}>
        <TypeOn text={price} at={t.price} fontSize={fitNum(price, 400, 150)} weight={800} letterSpacing="-0.02em" />
      </Row>
      <Marker d={handLine(150, 756 + D, 552, 756 + D, `bar-${letter}`)} at={t.bar} frames={6} width={9} />
      <Row left={130} width={440} top={782 + D}>
        <TypeOn text={eps} at={t.eps} fontSize={fitNum(eps, 400, 150)} weight={800} letterSpacing="-0.02em" />
      </Row>
      <Row left={130} width={440} top={940 + D}>
        <HandNote text="utilidad por acción" at={t.eps + 4} fontSize={56} style={NOTE_PAD} />
      </Row>
      {/* "su múltiplo…": an arrow arcs from the price over the "=" to the result */}
      <Marker d={curvedArrow(520, 640, 700, 640, `pu-${letter}`, -0.55, 28)} at={t.mult} frames={8} color={color.accent} width={8} />
      <Show at={t.mult} style={{ position: "absolute", left: 572, width: 72, top: 690 + D, textAlign: "center", font: `800 120px ${font.heading}`, color: color.ink, lineHeight: 1 }}>
        =
      </Show>
      <Row left={660} width={260} top={500 + D + 40}>
        <HandNote text="P/U" at={t.mult} fontSize={70} color={color.accentDark} style={NOTE_PAD} />
      </Row>
      <div style={{ position: "absolute", left: 660, width: 260, top: 756 + D + 20 - rSize * 0.5, display: "flex", justifyContent: "center" }}>
        <Breathe at={t.pu}>
          <TypeOn text={result} at={t.pu} color={color.accent} fontSize={rSize} weight={800} letterSpacing="-0.03em" lineHeight={1} />
        </Breathe>
      </div>
      <Marker d={handEllipse(792, 772 + D, Math.max(104, rHalf + 22), 124, `ring-${letter}`)} at={t.pu + 3} frames={9} color={color.accent} width={8} />
      {reminder ? (
        <Row top={1150}>
          <HandNote text={reminder} at={from + 8} fontSize={58} color={color.handInk} style={NOTE_PAD} />
        </Row>
      ) : null}
    </>
  );
};

// ── 5 · "Donde la segunda es más cara, aunque el precio por acción diga lo contrario" ────────────
const CompareBoard: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const col = (x: number, letter: string, c: Company, i: number, puTone: string, breatheAt: number) => {
    const p = money(c.price);
    const r = num(pu(c));
    return (
      <>
        <Row left={x} width={400} top={276}>
          <HandNote text="empresa" at={from + i * 4} fontSize={54} style={NOTE_PAD} />
        </Row>
        <Row left={x} width={400} top={338}>
          <TypeOn text={letter} at={from + 2 + i * 4} fontSize={150} weight={800} />
        </Row>
        <Row left={x} width={400} top={508}>
          <HandNote text="precio" at={from + 8 + i * 4} fontSize={54} style={NOTE_PAD} />
        </Row>
        <Row left={x} width={400} top={566}>
          <TypeOn text={p} at={from + 8 + i * 4} fontSize={fitNum(p, 340, 120)} weight={800} letterSpacing="-0.02em" />
        </Row>
        <Row left={x} width={400} top={716}>
          <HandNote text="P/U" at={from + 14 + i * 4} fontSize={60} color={color.accentDark} style={NOTE_PAD} />
        </Row>
        <Row left={x} width={400} top={802}>
          <Breathe at={breatheAt}>
            <TypeOn text={r} at={from + 14 + i * 4} color={puTone} fontSize={fitNum(r, 300, 170)} weight={800} letterSpacing="-0.03em" />
          </Breathe>
        </Row>
      </>
    );
  };
  const bR = num(pu(B));
  const bHalf = (Array.from(bR).length * 0.62 * fitNum(bR, 300, 170)) / 2;
  return (
    <>
      <Marker d={handLine(540, 286, 540, 1060, "divider")} at={from} frames={8} width={6} />
      {col(120, "A", A, 0, color.accent, 1e6)}
      {col(540, "B", B, 1, frame >= W.cara ? color.alert : color.accent, W.cara)}
      {/* "la segunda": a curved arrow from A's multiple over to B's · "más cara": red ring + note */}
      <Marker d={curvedArrow(380, 812, 640, 812, "ab", -0.6, 30)} at={W.segunda} frames={9} color={color.accent} width={8} />
      <Marker d={handEllipse(740, 888, Math.max(110, bHalf + 30), 88, "cara")} at={W.mas} frames={9} color={color.alert} width={8} />
      <Row left={540} width={400} top={1000}>
        <HandNote text="más cara" at={W.cara} fontSize={80} color={color.alert} style={NOTE_PAD} />
      </Row>
      {/* "el precio por acción": both prices underlined, then a two-way arrow between them */}
      <Marker d={[handLine(236, 700, 404, 700, "pa"), handLine(630, 700, 850, 700, "pb")]} at={W.precioC} frames={10} color={color.accent} width={8} />
      <Marker d={doubleArrow(444, 600, 588, 600, "pp", -0.45, 24)} at={W.precioC + 10} frames={9} color={color.accent} width={7} />
      <Row top={1150}>
        <HandNote text="el precio solo no dice nada" at={W.contrario} fontSize={62} color={color.accentDark} style={NOTE_PAD} />
      </Row>
      <Row top={1232}>
        <HandNote text={EXAMPLE_LABEL} at={from} fontSize={LABEL_COMPARE} color={color.muted} style={LABEL_STYLE} />
      </Row>
    </>
  );
};

// ── 6 · "¿barato comparado con qué?" — arrows fan out from ¿BARATO to three "?" cards in the pause
const QuestionBoard: React.FC<{ from: number }> = ({ from }) => {
  const cardX = [270, 540, 810];
  return (
    <>
      <Heading text="¿BARATO" at={from + 2} top={300} size={170} />
      {cardX.map((cx, i) => (
        <Marker key={i} d={curvedArrow(540 + (cx - 540) * 0.25, 478, cx, 560, `q${i}`, i === 1 ? 0.001 : (i === 0 ? 0.25 : -0.25), 24)} at={W.baratoEnd + i * 6} frames={6} color={color.ink} width={7} />
      ))}
      {cardX.map((cx, i) => (
        <div key={i} style={{ position: "absolute", left: cx - 66, top: 578 }}>
          <Drop at={W.baratoEnd + 4 + i * 6}>
            <Float px={5} period={32} phase={i * 11}>
              <PixelIcon name="question" px={11} />
            </Float>
          </Drop>
        </div>
      ))}
      <Heading text="COMPARADO" at={W.comparado} top={784} size={128} />
      <Heading text="CON QUÉ?" at={W.con} top={924} size={150} tone={color.accent} />
    </>
  );
};

// ── Split-only top-band scenes (y 262–830) ────────────────────────────────────────────────────
/** Hook: "Me llevo más de dos años estudiando entender esto". */
const HookBand: React.FC<{ from: number }> = ({ from }) => (
  <>
    <Row top={282}>
      <HandNote text="llevo más de" at={from} fontSize={72} style={NOTE_PAD} />
    </Row>
    <Row top={372}>
      <Breathe at={W.dos + 6} amp={0.03}>
        <TypeOn text="2 AÑOS" at={W.dos} color={color.accent} fontSize={200} weight={800} letterSpacing="-0.02em" lineHeight={0.95} />
      </Breathe>
    </Row>
    <Marker d={handLine(250, 590, 830, 590, "anos")} at={W.estudiando} frames={8} color={color.ink} width={9} />
    <Row top={626}>
      <Drop at={W.entender}>
        <Float px={4} period={36}>
          <PixelIcon name="calendar" px={9} />
        </Float>
      </Drop>
    </Row>
  </>
);

/** "…no significa que sea una buena inversión. Aquí te explico por qué." */
const BuenaBand: React.FC<{ from: number }> = ({ from }) => (
  <>
    <Row top={288}>
      <TypeOn text="≠ BUENA" at={from} accent="≠" color={color.ink} fontSize={150} weight={800} letterSpacing="-0.015em" lineHeight={0.95} />
    </Row>
    <Row top={440}>
      <TypeOn text="INVERSIÓN" at={W.inversion} color={color.accent} fontSize={132} weight={800} letterSpacing="-0.015em" lineHeight={0.95} />
    </Row>
    {[330, 540, 750].map((cx, i) => (
      <div key={i} style={{ position: "absolute", left: cx - 48, top: 640 }}>
        <Drop at={T.aqui + i * 8}>
          <Float px={5} period={30} phase={i * 9}>
            <PixelIcon name="question" px={8} />
          </Float>
        </Drop>
      </div>
    ))}
  </>
);

/** "…si no lo comparas con las utilidades de una empresa." price tag → arrow → money bag. */
const ComparaBand: React.FC<{ from: number }> = ({ from }) => (
  <>
    <Row left={120} width={400} top={300}>
      <HandNote text="precio" at={from} fontSize={62} style={NOTE_PAD} />
    </Row>
    <div style={{ position: "absolute", left: 170, top: 400 }}>
      <Drop at={from}>
        <Float px={5} period={38}>
          <PriceTag text={money(A.price)} px={9} body={18} fontSize={84} />
        </Float>
      </Drop>
    </div>
    <Marker d={curvedArrow(430, 420, 690, 420, "compara", -0.45, 30)} at={W.comparas} frames={9} color={color.accent} width={9} />
    <div style={{ position: "absolute", left: 700, top: 360 }}>
      <Drop at={W.utilidades}>
        <Float px={5} period={34} phase={10}>
          <PixelIcon name="money-bag" px={11} />
        </Float>
      </Drop>
    </div>
    <Row left={560} width={400} top={560}>
      <HandNote text="utilidades" at={W.utilidades} fontSize={66} color={color.accentDark} style={NOTE_PAD} />
    </Row>
    <Row left={100} width={440} top={560}>
      <HandNote text={EXAMPLE_LABEL} at={from} fontSize={44} color={color.muted} style={LABEL_STYLE} />
    </Row>
  </>
);

export const SCENES: Record<BoardId, React.FC<SceneProps>> = {
  precio: PrecioBoard,
  formula: FormulaBoard,
  empresaA: ({ from }) => (
    <EmpresaBoard from={from} letter="A" c={A} t={{ head: from + HEAD_AFTER_CUT, price: W.aPrice, bar: W.aGana, eps: W.aEps, mult: W.aMultiplo, pu: W.aPU }} />
  ),
  empresaB: ({ from }) => (
    <EmpresaBoard
      from={from}
      letter="B"
      c={B}
      t={{ head: from + HEAD_AFTER_CUT, price: W.bPrice, bar: W.bGana, eps: W.bEps, mult: W.bMultiplo, pu: W.bPU }}
      reminder={`(la empresa A: P/U = ${num(pu(A))})`}
    />
  ),
  compare: CompareBoard,
  question: QuestionBoard,
  hook: HookBand,
  buena: BuenaBand,
  compara: ComparaBand,
};

/** Content bounding box (y) of every scene, used to fit it into its zone (never scaled up). */
const BBOX: Record<BoardId, [number, number]> = {
  precio: [292, 1218], // label under the tag at y 1086–1140
  formula: [292, 1200],
  empresaA: [292, 1052],
  empresaB: [292, 1210],
  compare: [276, 1305], // label at 62 px ends ≈ y 1300
  question: [300, 1070],
  hook: [282, 786],
  buena: [288, 756],
  compara: [300, 636],
};

/**
 * Zones (user rule 2026-09-27, `ZONES` in styles/shared/formats.tsx): board content lives in the
 * GRAPHICS zone (y 250–970), captions in the band below it (y 1000–1300). Full board: the scene is
 * fitted into the graphics zone; split layout: into the top band above the head (y 262–790).
 */
export const FULL_BOX = { top: ZONES.vertical.graphics.y + 16, bottom: ZONES.vertical.graphics.y + ZONES.vertical.graphics.h - 8 };
export const BAND = { top: 262, bottom: 790 };
/** Horizontal 1920×1080: the 1080-wide sheet is centred (x 420–1500) and fitted into y 100–780. */
export const H_BOX = { top: ZONES.horizontal.graphics.y + 10, bottom: ZONES.horizontal.graphics.y + ZONES.horizontal.graphics.h - 10, left: 420 };

// ── Horizontal 1920×1080 layouts ──────────────────────────────────────────────────────────────
// The scenes are designed tall (1080×1920 sheet). Fitted whole into the horizontal graphics zone
// (y 90–790) they came out at 0.67–0.89 × with wide empty margins. Here each scene is cut into
// pieces (rectangles of the sheet) laid out side by side / in rows inside x 160–1760, y 100–780, so
// the same drawing reads 1.2–1.7 × larger. Arrows that would cross two pieces are redrawn in frame
// coordinates by the overlay (same word, same frames, same marker sound in PIZ_CUES).
type Piece = { src: [number, number, number, number]; at: [number, number]; s: number };
type HLayout = { pieces: Piece[]; overlay?: React.FC<{ from: number }> };
const HV = "0 0 1920 1080";

export const H_LAYOUTS: Partial<Record<BoardId, HLayout>> = {
  // Drawing (figure, bubble, tag) on the left, EL PRECIO + note on the right; the note's arrow
  // curves back to the tag.
  precio: {
    pieces: [
      { src: [120, 525, 990, 1228], at: [168, 113], s: 0.93 },
      { src: [110, 280, 930, 520], at: [989, 300], s: 0.93 },
    ],
    overlay: () => <Marker d={curvedArrow(1072, 496, 896, 522, "ve-h", 0.35)} at={W.ve} frames={8} color={color.accent} width={8} viewBox={HV} />,
  },
  // Heading on top; Bit on the left of the formula, its arrow up to P/U.
  formula: {
    pieces: [
      { src: [110, 262, 930, 410], at: [427, 104], s: 1.3 },
      { src: [410, 945, 630, 1205], at: [264, 440], s: 1.3 },
      { src: [115, 530, 935, 870], at: [590, 323], s: 1.3 },
    ],
    overlay: ({ from }) => <Marker d={curvedArrow(470, 478, 608, 450, "bitpu-h", -0.35)} at={formulaPuAt(from) - 2} frames={8} color={color.accent} width={9} viewBox={HV} />,
  },
  // Title + "dato de ejemplo" (and B's reminder) on the left, the fraction big on the right.
  empresaA: {
    pieces: [
      { src: [110, 285, 930, 485], at: [160, 350], s: 0.7 },
      { src: [115, 555, 945, 1070], at: [764, 131], s: 1.2 },
    ],
  },
  empresaB: {
    pieces: [
      { src: [110, 285, 930, 485], at: [160, 290], s: 0.7 },
      { src: [110, 1140, 930, 1225], at: [160, 470], s: 0.7 },
      { src: [115, 555, 945, 1070], at: [764, 131], s: 1.2 },
    ],
  },
  // The A | B table on the left, the conclusion + label on the right.
  compare: {
    pieces: [
      { src: [110, 265, 960, 1090], at: [207, 100], s: 0.824 },
      { src: [110, 1140, 950, 1310], at: [957, 372], s: 0.9 },
    ],
  },
};

/** Horizontal: the scene drawn as its H_LAYOUTS pieces (each a clipped window onto the sheet). */
const HPieces: React.FC<{ id: BoardId; from: number; layout: HLayout }> = ({ id, from, layout }) => {
  const Scene = SCENES[id];
  const Overlay = layout.overlay;
  return (
    <>
      {layout.pieces.map((p, i) => {
        const [x0, y0, x1, y1] = p.src;
        return (
          <div key={i} style={{ position: "absolute", left: p.at[0], top: p.at[1], width: (x1 - x0) * p.s, height: (y1 - y0) * p.s, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${p.s}) translate(${-x0}px, ${-y0}px)`, transformOrigin: "0 0" }}>
              <Scene from={from} horizontal />
            </div>
          </div>
        );
      })}
      {Overlay ? <Overlay from={from} /> : null}
    </>
  );
};

/**
 * One board scene on the dotted paper, fitted into its zone (`band` = split top band). The paper
 * drifts at 40 % of the content's speed (parallax) so the board is never static.
 * `anchor` = the frame the scene's element times refer to (its first segment's start).
 */
export const BoardView: React.FC<{ id: BoardId; from: number; to: number; anchor?: number; band?: boolean; paper?: boolean; horizontal?: boolean }> = ({
  id,
  from,
  to,
  anchor,
  band = false,
  paper = true,
  horizontal = false,
}) => {
  const Scene = SCENES[id];
  const [y0, y1] = BBOX[id];
  const box = horizontal ? H_BOX : band ? BAND : FULL_BOX;
  const k = Math.min(1, (box.bottom - box.top) / (y1 - y0));
  const dy = horizontal ? box.top + (box.bottom - box.top - (y1 - y0) * k) / 2 - y0 : box.top - y0;
  // The scene is always drawn on a 1080×1920 sheet (its marker SVGs use that viewBox).
  const placed: React.CSSProperties = {
    position: "absolute",
    left: horizontal ? H_BOX.left : 0,
    top: 0,
    width: 1080,
    height: 1920,
    transform: `translateY(${dy.toFixed(1)}px) scale(${k.toFixed(4)})`,
    transformOrigin: `540px ${y0}px`,
  };
  return (
    <AbsoluteFill>
      {paper ? (
        <Drift from={from} to={to} depth={0.4}>
          <DotBoard />
        </Drift>
      ) : null}
      <Drift from={from} to={to} originY={band ? "25%" : "32%"}>
        {horizontal && H_LAYOUTS[id] ? (
          <HPieces id={id} from={anchor ?? from} layout={H_LAYOUTS[id]!} />
        ) : (
          <div style={placed}>
            <Scene from={anchor ?? from} />
          </div>
        )}
      </Drift>
    </AbsoluteFill>
  );
};
