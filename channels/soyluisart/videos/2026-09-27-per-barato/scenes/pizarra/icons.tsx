import { PixelArt } from "../../../../styles/pizarra/primitives";
import { piz } from "../../../../styles/pizarra/theme";

// Two pixel-art objects this short needs that the library doesn't have yet: a price tag (with the
// price set in Inter Tight on it) and a bookmark ("Guarda esto"). Same rules as pixel.tsx: grids of
// palette letters, crisp integer pixels, 1-pixel ink outline.

/** Price tag grid: pointed left end with a punched hole, `body` columns of fill. */
const tagRows = (body: number): string[] => {
  const parts: [string, string, string][] = [
    ["......KK", "K", "KK"],
    [".....Kyy", "y", "YK"],
    ["....Kyyy", "y", "YK"],
    ["...Kyyyy", "y", "YK"],
    ["..Kyyyyy", "y", "YK"],
    [".KyyKKyy", "y", "YK"],
    ["KyyK..Ky", "y", "YK"],
    ["KyyK..Ky", "y", "YK"],
    [".KyyKKyy", "y", "YK"],
    ["..Kyyyyy", "y", "YK"],
    ["...Kyyyy", "y", "YK"],
    ["....KYYY", "Y", "oK"],
    [".....Koo", "o", "oK"],
    ["......KK", "K", "KK"],
  ];
  return parts.map(([l, f, r]) => l + f.repeat(body) + r);
};

export const PriceTag: React.FC<{ text: string; px?: number; body?: number; fontSize?: number }> = ({ text, px = 12, body = 22, fontSize = 104 }) => {
  const rows = tagRows(body);
  const w = rows[0].length * px;
  const h = rows.length * px;
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      <PixelArt rows={rows} px={px} />
      <div
        style={{
          position: "absolute",
          left: 9 * px,
          width: (body - 1) * px,
          top: 0,
          height: h - px,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          font: `800 ${fontSize}px ${piz.font.heading}`,
          letterSpacing: "-0.02em",
          color: piz.color.ink,
          lineHeight: 1,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const BOOKMARK = [
  "KKKKKKKKKKKK",
  "KlBBBBBBBBNK",
  "KlBBBBBBBBNK",
  "KlBBBBBBBBNK",
  "KlBBBBBBBBNK",
  "KlBBBBBBBBNK",
  "KlBBBBBBBBNK",
  "KlBBBBBBBBNK",
  "KlBBBBBBBBNK",
  "KlBBBBBBBBNK",
  "KlBBBBBBBBNK",
  "KlBBBBBBBBNK",
  "KlBBBBBBBBNK",
  "KlBBBKKBBBNK",
  "KlBBK..KBBNK",
  "KlBK....KBNK",
  "KlK......KNK",
  "KK........KK",
];
const EMPTY: Record<string, string> = { l: "W", B: "W", N: "g" };

/** Pixel bookmark: outline (white) until `filled`, then brand blue (hard state swap). */
export const PixelBookmark: React.FC<{ px: number; filled: boolean }> = ({ px, filled }) => (
  <PixelArt rows={filled ? BOOKMARK : BOOKMARK.map((r) => r.replace(/[lBN]/g, (c) => EMPTY[c]))} px={px} />
);
