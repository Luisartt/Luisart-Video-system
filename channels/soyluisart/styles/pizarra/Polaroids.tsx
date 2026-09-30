import { AbsoluteFill, Img, random, staticFile } from "remotion";
import { z } from "zod";
import { Drop, HandNote, Sfx, Stage, Variant, base, baseSchema, useFormat } from "./primitives";
import { piz } from "./theme";

// Scattered polaroids on the cream board (his "ni ellos la tuvieron"): white frames with a thick
// bottom lip, soft shadow, ±3° rotation, dropping in pairs every 10 f, hand-note caption above.
// Images come from props (paths under media/); empty = a neutral illustrated placeholder (never a
// real person).

export const polaroidsSchema = baseSchema.extend({
  images: z.array(z.string().describe("Path under media/ or empty for a placeholder")).min(2).max(6),
  captions: z.array(z.string()).describe("Optional hand label under each photo"),
  note: z.string(),
  pairEvery: z.number().min(4).max(30),
});
type Props = z.infer<typeof polaroidsSchema>;

const SCENES = [
  { sky: piz.color.tint, sun: piz.color.yellow, hill1: piz.color.tintMid, hill2: piz.color.accent },
  { sky: "#FFF1D6", sun: "#F29E4C", hill1: "#F3C440", hill2: "#C98F1E" },
  { sky: "#E4F5E8", sun: piz.color.yellow, hill1: "#A6E6B3", hill2: piz.color.green },
  { sky: "#EFE7FF", sun: "#F59A9D", hill1: "#C9B8F5", hill2: "#7B61D9" },
  { sky: "#E8EEF6", sun: piz.color.white, hill1: "#B9C6D8", hill2: "#5B6B85" },
  { sky: piz.color.tint, sun: "#F29E4C", hill1: piz.color.tintMid, hill2: piz.color.accentDark },
];

const Placeholder: React.FC<{ i: number; w: number; h: number }> = ({ i, w, h }) => {
  const s = SCENES[i % SCENES.length];
  return (
    <svg width={w} height={h} viewBox="0 0 100 100" preserveAspectRatio="none" style={{ display: "block" }}>
      <rect width="100" height="100" fill={s.sky} />
      <circle cx={30 + (i % 3) * 20} cy="32" r="12" fill={s.sun} />
      <path d="M0 70 Q25 50 50 66 T100 60 V100 H0Z" fill={s.hill1} />
      <path d="M0 84 Q30 68 60 82 T100 78 V100 H0Z" fill={s.hill2} />
    </svg>
  );
};

export const Polaroids: React.FC<Props> = (p) => {
  const { isVertical, safeBox } = useFormat();
  const n = p.images.length;
  const cols = isVertical ? 2 : Math.min(n, 3);
  const rows = Math.ceil(n / cols);
  const noteH = 110;
  const cellW = (safeBox.w - (isVertical ? 60 : 200)) / cols;
  const cellH = (safeBox.h - noteH - 40) / rows;
  const photoW = Math.floor(Math.min(cellW * 0.78, (cellH - 60) / 1.18));
  const photoH = Math.round(photoW * 0.95);
  const pad = Math.round(photoW * 0.06);
  const start = 8;
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <AbsoluteFill style={{ left: safeBox.x, top: safeBox.y, width: safeBox.w, height: safeBox.h, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ height: noteH, display: "flex", alignItems: "center" }}>
          <HandNote text={p.note} at={2} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${Math.floor(cellW)}px)`, gridAutoRows: Math.floor(cellH), marginTop: 10 }}>
          {p.images.map((src, i) => {
            const rot = (random(`pr${i}`) - 0.5) * 6;
            const dx = Math.round((random(`px${i}`) - 0.5) * cellW * 0.12);
            const dy = Math.round((random(`py${i}`) - 0.5) * 30);
            const at = start + Math.floor(i / 2) * p.pairEvery;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Drop at={at} px={14}>
                  <div
                    style={{
                      transform: `translate(${dx}px, ${dy}px) rotate(${rot.toFixed(2)}deg)`,
                      background: piz.color.white,
                      padding: `${pad}px ${pad}px ${Math.round(pad * 3.2)}px`,
                      boxShadow: "0 8px 18px rgba(60,50,30,0.22)",
                      position: "relative",
                    }}
                  >
                    {src ? (
                      <Img src={staticFile(src)} style={{ width: photoW, height: photoH, objectFit: "cover", display: "block" }} />
                    ) : (
                      <Placeholder i={i} w={photoW} h={photoH} />
                    )}
                    {p.captions[i] ? (
                      <div style={{ position: "absolute", left: 0, right: 0, bottom: pad * 0.4, textAlign: "center", font: `400 ${Math.round(pad * 2.3)}px ${piz.font.hand}`, color: piz.color.handInk }}>
                        {p.captions[i]}
                      </div>
                    ) : null}
                  </div>
                </Drop>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {Array.from({ length: Math.ceil(n / 2) }, (_, k) => (
        <Sfx key={k} kind="shutter" at={start + k * p.pairEvery} on={p.sfx} />
      ))}
    </Stage>
  );
};

export const polaroidsVariants: Variant<Props>[] = [
  {
    id: "six",
    horizontal: true,
    props: { ...base("cream", 5), images: ["", "", "", "", "", ""], captions: ["2019", "2020", "2021", "2022", "2023", "hoy"], note: "empezaron desde cero", pairEvery: 10 },
  },
];
