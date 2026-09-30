import { useCurrentFrame } from "remotion";
import { z } from "zod";
import { piz } from "./theme";

// Pixel-art drawn in code from small string grids: one character = one art pixel. Rendered as SVG
// runs with shape-rendering crispEdges and an integer pixel size, so the art stays razor sharp
// (no resampling blur). Keep any transform on it to whole pixels.

const c = piz.color;
export const PALETTE: Record<string, string> = {
  K: c.ink,
  W: c.white,
  B: c.accent,
  N: c.accentDark,
  b: c.tintMid,
  l: c.tint,
  Y: c.yellow,
  y: "#FBE39A",
  o: "#C98F1E",
  G: c.grey,
  g: c.greyLight,
  D: "#8A8F99",
  d: "#5B606B",
  R: c.alert,
  r: "#F59A9D",
  V: c.green,
  v: "#A6E6B3",
  S: "#172036", // bot screen
  P: "#F2B8A0", // skin-ish for placeholders
};

export const PixelArt: React.FC<{
  rows: readonly string[];
  px: number;
  palette?: Record<string, string>;
  style?: React.CSSProperties;
}> = ({ rows, px, palette = PALETTE, style }) => {
  const size = Math.max(1, Math.round(px));
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const rects: React.ReactNode[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      const fill = palette[ch];
      if (fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={end - x} height={1} fill={fill} />);
      x = end;
    }
  });
  return (
    <svg
      width={w * size}
      height={h * size}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      style={{ display: "block", imageRendering: "pixelated", overflow: "visible", ...style }}
    >
      {rects}
    </svg>
  );
};

// Bar-chart grids built procedurally (cleaner than hand-drawing them).
const bars = (heights: number[], fill: string, shade: string, arrowUp: boolean): string[] => {
  const H = 14;
  const rows: string[] = [];
  for (let r = 0; r < H; r++) {
    let row = "";
    heights.forEach((h, i) => {
      const top = H - h;
      row += r < top ? "...." : r === top ? "KKKK" : `K${fill}${shade}K`;
      if (i < heights.length - 1) row += ".";
    });
    rows.push(row);
  }
  rows.push("K".repeat(rows[0].length));
  void arrowUp;
  return rows;
};

export const ICONS = {
  bulb: [
    "......KKKK......",
    "....KKyyYYKK....",
    "...KyyYYYYYYK...",
    "..KyyYYYYYYYYK..",
    "..KyYYYYYYYYYK..",
    "..KYYYYYYYYYoK..",
    "..KYYYYYYYYYoK..",
    "..KYYYYYYYYYoK..",
    "...KYYYYYYYoK...",
    "....KYYYYYoK....",
    ".....KKKKKK.....",
    ".....KgggGK.....",
    ".....KDDDDK.....",
    ".....KgggGK.....",
    "......KDDK......",
    ".......KK.......",
  ],
  coin: [
    ".....KKKKKK.....",
    "...KKYYYYYYKK...",
    "..KYYyyyyyyYYK..",
    ".KYyyYYYYYYooYK.",
    ".KYyYYYKKYYYoYK.",
    "KYyYYYKyyKYYYoYK",
    "KYyYYYKyYKYYYoYK",
    "KYyYYYKyYKYYYoYK",
    "KYyYYYKyYKYYYoYK",
    "KYyYYYKyYKYYYoYK",
    "KYyYYYKYYKYYYoYK",
    ".KYyYYYKKYYYoYK.",
    ".KYYooYYYYYooYK.",
    "..KYYooooooYYK..",
    "...KKYYYYYYKK...",
    ".....KKKKKK.....",
  ],
  "chart-up": bars([4, 7, 10, 13], "B", "N", true),
  "chart-down": bars([13, 10, 7, 4], "R", "R", false),
  robot: [
    ".......KK.......",
    "......KBBK......",
    ".......KK.......",
    "..KKKKKKKKKKKK..",
    ".KbbbbbbbbbbbbK.",
    ".KbKKKKKKKKKKbK.",
    "KKbKWWWWWWWWKbKK",
    "KbbKWKKWWKKWKbbK",
    "KbbKWKKWWKKWKbbK",
    "KKbKWWWWWWWWKbKK",
    ".KbKWWKKKKWWKbK.",
    ".KbKKKKKKKKKKbK.",
    ".KbbbbbbbbbbbbK.",
    "..KKKKKKKKKKKK..",
    "....KbbbbbbK....",
    "....KKKKKKKK....",
  ],
  brain: [
    "....KKKK.KKKK...",
    "..KKrrrrKrrrrKK.",
    ".KrrRrrrKrrRrrrK",
    "KrrRRrrrKrrrRRrK",
    "KrRrrrRrKrRrrrrK",
    "KrrrrRRrKrRRrrrK",
    "KrRRrrrrKrrrrRrK",
    ".KrrrRrrKrrRrrK.",
    ".KrRrrRrKrRrrrK.",
    "..KrrrrrKrrrRK..",
    "...KKrrrKrrKK...",
    ".....KKrKKK.....",
    ".......KrK......",
    ".......KrK......",
    ".......KKK......",
  ],
  rocket: [
    ".......KK.......",
    "......KWWK......",
    ".....KWWWWK.....",
    ".....KWWWWK.....",
    "....KWWWWWgK....",
    "....KWWKKWgK....",
    "....KWKBBKgK....",
    "....KWKBBKgK....",
    "....KWWKKWgK....",
    "...KKWWWWWgKK...",
    "..KBKWWWWWgKBK..",
    ".KBBKWWWWWgKBBK.",
    ".KBBKKKKKKKKBBK.",
    ".KKK..KYYK..KKK.",
    "......KYoK......",
    ".......KK.......",
  ],
  calendar: [
    "..KK..KK..KK..KK..",
    "KKKKKKKKKKKKKKKKKK",
    "KBBBBBBBBBBBBBBBBK",
    "KBBBBBBBBBBBBBBBBK",
    "KKKKKKKKKKKKKKKKKK",
    "KWWWWWWWWWWWWWWWWK",
    "KWKKKWKKKWKKKWKKKK",
    "KWKWKWKWKWKWKWKWKK",
    "KWKKKWKKKWKKKWKKKK",
    "KWWWWWWWWWWWWWWWWK",
    "KWKKKWKKKWKKKWBBBK",
    "KWKWKWKWKWKWKWBBBK",
    "KWKKKWKKKWKKKWBBBK",
    "KWWWWWWWWWWWWWWWWK",
    "KggggggggggggggggK",
    "KKKKKKKKKKKKKKKKKK",
  ],
  clock: [
    ".....KKKKKK.....",
    "...KKWWWWWWKK...",
    "..KWWWWKKWWWWK..",
    ".KWWWWWKKWWWWWK.",
    ".KWWWWWKKWWWWWK.",
    "KWWWWWWKKWWWWWgK",
    "KWWWWWWKKWWWWWgK",
    "KKWWWWWKKKKKWWKK",
    "KWWWWWWWWKKKWWgK",
    "KWWWWWWWWWWWWWgK",
    ".KWWWWWWWWWWWgK.",
    ".KWWWWWWWWWWWgK.",
    "..KWWWWKKWWWgK..",
    "...KKggggggKK...",
    ".....KKKKKK.....",
  ],
  "money-bag": [
    "......KKKK......",
    ".....KoYYoK.....",
    "......KooK......",
    ".....KKKKKK.....",
    "....KYYYYYYK....",
    "...KYYYYYYYYK...",
    "..KYyYYYKYYYoK..",
    ".KYyYYYKKKYYYoK.",
    ".KYyYYKKYYYYYoK.",
    "KYyYYYYKKKYYYYoK",
    "KYyYYYYYYKKYYYoK",
    "KYYYYYYKKKYYYYoK",
    "KYYYYYYYKYYYYYoK",
    ".KYooYYYYYYYooK.",
    "..KKooooooooKK..",
    "....KKKKKKKK....",
  ],
  warning: [
    ".......KK.......",
    "......KRRK......",
    "......KRRK......",
    ".....KRRRRK.....",
    ".....KRKKRK.....",
    "....KRRKKRRK....",
    "....KRRKKRRK....",
    "...KRRRKKRRRK...",
    "...KRRRKKRRRK...",
    "..KRRRRRRRRRRK..",
    "..KRRRRKKRRRRK..",
    ".KRRRRRKKRRRRRK.",
    ".KRRRRRRRRRRRRK.",
    "KKKKKKKKKKKKKKKK",
  ],
  check: [
    "..KKKKKKKKKKKK..",
    ".KVVVVVVVVVVVVK.",
    "KVVVVVVVVVVVVVVK",
    "KVVVVVVVVVVKKVVK",
    "KVVVVVVVVVKWWKVK",
    "KVVVVVVVVKWWKVVK",
    "KVVKKVVVKWWKVVVK",
    "KVKWWKVKWWKVVVVK",
    "KVVKWWKWWKVVVVVK",
    "KVVVKWWWKVVVVVVK",
    "KVVVVKWKVVVVVVVK",
    "KVVVVVKVVVVVVVVK",
    "KVVVVVVVVVVVVVVK",
    ".KVVVVVVVVVVVVK.",
    "..KKKKKKKKKKKK..",
  ],
  cross: [
    "..KKKKKKKKKKKK..",
    ".KRRRRRRRRRRRRK.",
    "KRRRRRRRRRRRRRRK",
    "KRRKKRRRRRRKKRRK",
    "KRKWWKRRRRKWWKRK",
    "KRRKWWKRRKWWKRRK",
    "KRRRKWWKKWWKRRRK",
    "KRRRRKWWWWKRRRRK",
    "KRRRRKWWWWKRRRRK",
    "KRRRKWWKKWWKRRRK",
    "KRRKWWKRRKWWKRRK",
    "KRKWWKRRRRKWWKRK",
    "KRRKKRRRRRRKKRRK",
    ".KRRRRRRRRRRRRK.",
    "..KKKKKKKKKKKK..",
  ],
  lock: [
    ".....KKKKKK.....",
    "....KGGGGGGK....",
    "...KGKKKKKKGK...",
    "...KGK....KGK...",
    "...KGK....KGK...",
    "...KGK....KGK...",
    "..KKKKKKKKKKKK..",
    "..KYYYYYYYYYYK..",
    "..KYyYYKKYYYoK..",
    "..KYyYYKKYYYoK..",
    "..KYyYYYKYYYoK..",
    "..KYyYYYKYYYoK..",
    "..KYYYYYYYYYoK..",
    "..KooooooooooK..",
    "..KKKKKKKKKKKK..",
  ],
  mail: [
    "KKKKKKKKKKKKKKKKKK",
    "KWKWWWWWWWWWWWWKWK",
    "KWWKWWWWWWWWWWKWWK",
    "KWWWKWWWWWWWWKWWWK",
    "KWWWWKWWWWWWKWWWWK",
    "KWWWWWKKWWKKWWWWWK",
    "KWWWWWWWKKWWWWWWWK",
    "KWWWWWWWWWWWWWWWWK",
    "KWWWWWWWWWWWWWWWWK",
    "KWWWWWWWWWWWWWWWWK",
    "KggggggggggggggggK",
    "KKKKKKKKKKKKKKKKKK",
  ],
  phone: [
    "..KKKKKKKKKK..",
    ".KddddddddddK.",
    ".KdddKKKKdddK.",
    ".KdKKKKKKKKdK.",
    ".KdKllllllKdK.",
    ".KdKlBBBBlKdK.",
    ".KdKlBWWBlKdK.",
    ".KdKlBWWBlKdK.",
    ".KdKlBBBBlKdK.",
    ".KdKllllllKdK.",
    ".KdKllllllKdK.",
    ".KdKKKKKKKKdK.",
    ".KddddKKddddK.",
    ".KddddddddddK.",
    "..KKKKKKKKKK..",
  ],
  play: [
    "..KKKKKKKKKKKK..",
    ".KBBBBBBBBBBBBK.",
    "KBBBBBBBBBBBBBBK",
    "KBBBBKKBBBBBBBBK",
    "KBBBBKWKBBBBBBBK",
    "KBBBBKWWKBBBBBBK",
    "KBBBBKWWWKBBBBBK",
    "KBBBBKWWWWKBBBBK",
    "KBBBBKWWWKBBBBBK",
    "KBBBBKWWKBBBBBBK",
    "KBBBBKWKBBBBBBBK",
    "KBBBBKKBBBBBBBBK",
    "KNNNNNNNNNNNNNNK",
    ".KNNNNNNNNNNNNK.",
    "..KKKKKKKKKKKK..",
  ],
  star: [
    ".......KK.......",
    "......KYYK......",
    "......KYYK......",
    ".....KYyYYK.....",
    "KKKKKKYyYYKKKKKK",
    "KYYYYYyYYYYYYYoK",
    ".KYYYyYYYYYYYoK.",
    "..KYYYYYYYYYoK..",
    "...KYYYYYYYoK...",
    "...KYYYYYYYoK...",
    "..KYYYYKKYYYoK..",
    "..KYYYKK.KYYoK..",
    ".KYYoK....KYooK.",
    ".KoKK......KKoK.",
    ".KK..........KK.",
  ],
  question: [
    "KKKKKKKKKKKK",
    "KWWWWWWWWWWK",
    "KWWWKKKKWWWK",
    "KWWKKWWKKWWK",
    "KWWWWWWKKWWK",
    "KWWWWWKKWWWK",
    "KWWWWKKWWWWK",
    "KWWWWKKWWWWK",
    "KWWWWWWWWWWK",
    "KWWWWKKWWWWK",
    "KWWWWKKWWWWK",
    "KWWWWWWWWWWK",
    "KggggggggggK",
    "KKKKKKKKKKKK",
  ],
  arrow: [
    "..........K.....",
    "..........KK....",
    "..........KBK...",
    "..........KBBK..",
    "KKKKKKKKKKKBBBK.",
    "KBBBBBBBBBBBBBBK",
    "KBBBBBBBBBBBBBBK",
    "KNNNNNNNNNNNNNK.",
    "KKKKKKKKKKKNNK..",
    "..........KNK...",
    "..........KK....",
    "..........K.....",
  ],
  sparkle: [
    "....K....",
    "...KYK...",
    "...KYK...",
    "KKKYYYKKK",
    "KYYYWYYYK",
    "KKKYYYKKK",
    "...KYK...",
    "...KYK...",
    "....K....",
  ],
} satisfies Record<string, readonly string[]>;

export type IconName = keyof typeof ICONS;
export const iconNames = Object.keys(ICONS) as [IconName, ...IconName[]];
export const iconField = z.enum(iconNames);

// Soft floor shadow (opaque, flattened) under pixel objects and characters.
export const FloorShadow: React.FC<{ width: number; color?: string }> = ({ width, color = "#E9EAEE" }) => (
  <div style={{ width, height: Math.round(width * 0.14), borderRadius: "50%", background: color, margin: "0 auto" }} />
);

export const PixelIcon: React.FC<{ name: IconName; px: number; shadow?: boolean; style?: React.CSSProperties }> = ({
  name,
  px,
  shadow = false,
  style,
}) => {
  const rows = ICONS[name];
  const w = Math.max(...rows.map((r) => r.length)) * Math.round(px);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: Math.round(px * 1.2), ...style }}>
      <PixelArt rows={rows} px={px} />
      {shadow ? <FloorShadow width={Math.round(w * 0.8)} /> : null}
    </div>
  );
};

// ── "Bit": Luisart's own AI character ─────────────────────────────────────────────────────────
// A small boxy terminal robot in electric blue with a dark screen face, an antenna and two feet —
// deliberately unlike Santiago's light-blue blob. Expressions swap in one frame; it blinks and bobs.
const BIT_BODY = [
  ".........KK.........",
  "........KbbK........",
  ".........KK.........",
  ".........KK.........",
  "..KKKKKKKKKKKKKKKK..",
  ".KbBBBBBBBBBBBBBBNK.",
  ".KbBKKKKKKKKKKKKBNK.",
  ".KbBKSSSSSSSSSSKBNK.",
  ".KbBKSSSSSSSSSSKBNK.",
  ".KbBKSSSSSSSSSSKBNK.",
  ".KbBKSSSSSSSSSSKBNK.",
  ".KbBKSSSSSSSSSSKBNK.",
  ".KbBKSSSSSSSSSSKBNK.",
  ".KbBKSSSSSSSSSSKBNK.",
  ".KbBKKKKKKKKKKKKBNK.",
  ".KbBBBBBBBBBBBVBYNK.",
  ".KNNNNNNNNNNNNNNNNK.",
  "..KKKKKKKKKKKKKKKK..",
  "....KNNK....KNNK....",
  "....KKKK....KKKK....",
];
const FACES = {
  happy: ["..........", "..b....b..", ".b.b..b.b.", "..........", "..b....b..", "...bbbb...", ".........."],
  neutral: ["..........", "..bb..bb..", "..bb..bb..", "..........", "..........", "...bbbb...", ".........."],
  surprised: ["..........", "..bb..bb..", "..bb..bb..", "..........", "....bb....", "....bb....", ".........."],
  sad: ["..........", "..........", ".bb....bb.", "..........", "...bbbb...", "..b....b..", ".........."],
} as const;
const BLINK = ["..........", "..........", "..bb..bb..", "..........", "..........", "...bbbb...", ".........."];
export type BitExpression = keyof typeof FACES;
export const bitExpressionField = z.enum(Object.keys(FACES) as [BitExpression, ...BitExpression[]]);

export const Bit: React.FC<{ px: number; expression?: BitExpression; bob?: boolean; shadow?: boolean; seed?: number }> = ({
  px,
  expression = "happy",
  bob = true,
  shadow = true,
  seed = 0,
}) => {
  const frame = useCurrentFrame();
  const size = Math.round(px);
  // Idle bob: ±1 art pixel, 30-frame period, stepped (never a fractional offset).
  const bobY = bob ? (Math.floor((frame + seed) / 15) % 2 === 0 ? 0 : -size) : 0;
  // Blink every ~120 frames for 3 frames (not on surprised).
  const blinking = expression !== "surprised" && (frame + seed * 7) % 120 >= 117;
  const face = blinking && expression !== "sad" ? BLINK : FACES[expression];
  const w = 20 * size;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: size }}>
      <div style={{ position: "relative", width: w, height: 20 * size, transform: `translateY(${bobY}px)` }}>
        <PixelArt rows={BIT_BODY} px={size} />
        <div style={{ position: "absolute", left: 5 * size, top: 7 * size }}>
          <PixelArt rows={face} px={size} />
        </div>
      </div>
      {shadow ? <FloorShadow width={Math.round(w * 0.75)} /> : null}
    </div>
  );
};

// Stepped (pixel) speech-bubble tail pointing down.
export const TAIL_DOWN = ["KWWWWK", "KWWWK.", "KWWK..", "KWK...", "KK....", "K....."];
