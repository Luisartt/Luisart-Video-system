import { Img, staticFile, useVideoConfig } from "remotion";
import { z } from "zod";
import { Drop, HandNote, Sfx, Stage, Variant, base, baseSchema, useFormat } from "./primitives";
import { MarkerLayer, MarkerStroke, roughArrow, roughEllipse } from "./marker";
import { piz } from "./theme";

// Vertical content extent on the sheet (measured on the renders) → fitted into the graphics zone
// y 250–970 by <Stage fit> (user rule 2026-09-27, Codex H6).
const ZONE_FIT = [248, 1430] as const; // incl. the sample label above the frame

// Screenshot on the board: an app/website capture framed as a retro browser window (with a URL
// bar) or a phone, dropped onto the pizarra; a blue marker circles a region of it (fractions of the
// image) and an arrow runs to a handwritten note. `image` empty = a neutral drawn mock app.

export const screenshotFrameSchema = baseSchema.extend({
  device: z.enum(["browser", "phone"]),
  image: z.string().describe("Capture path under media/ (empty = drawn placeholder)"),
  url: z.string(),
  region: z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() }).describe("Circled area, fractions of the image"),
  note: z.string(),
  circleAt: z.number().min(0),
});
type Props = z.infer<typeof screenshotFrameSchema>;

/** Neutral banking-app mock (grey blocks + one balance) so showcases never show a real product. */
const MockApp: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const blk = (x: number, y: number, bw: number, bh: number, c: string = piz.color.greyLight) => (
    <div style={{ position: "absolute", left: x * w, top: y * h, width: bw * w, height: bh * h, background: c }} />
  );
  return (
    <div style={{ position: "relative", width: w, height: h, background: piz.color.white, overflow: "hidden" }}>
      {blk(0, 0, 1, 0.1, piz.color.tint)}
      {blk(0.05, 0.14, 0.4, 0.035, piz.color.grey)}
      <div style={{ position: "absolute", left: 0.05 * w, top: 0.2 * h, font: `800 ${Math.round(w * 0.085)}px ${piz.font.heading}`, color: piz.color.ink }}>$12,430.00</div>
      <div style={{ position: "absolute", left: 0.05 * w, top: 0.33 * h, font: `700 ${Math.round(w * 0.032)}px ${piz.font.caption}`, color: piz.color.alert }}>Comisión por manejo de cuenta −$150.00</div>
      {[0.44, 0.56, 0.68, 0.8].map((y, i) => (
        <div key={i}>
          {blk(0.05, y, 0.1, 0.07, piz.color.tint)}
          {blk(0.2, y + 0.01, 0.45, 0.022)}
          {blk(0.2, y + 0.045, 0.3, 0.018)}
          {blk(0.75, y + 0.015, 0.2, 0.03, piz.color.grey)}
        </div>
      ))}
    </div>
  );
};

export const ScreenshotFrame: React.FC<Props> = (p) => {
  const { fps } = useVideoConfig();
  const { isVertical, safeBox, width, height } = useFormat();
  const circleAt = Math.round(p.circleAt * fps);
  const phone = p.device === "phone";
  const b = piz.ui.border;
  // Image box size.
  const imgW = phone ? (isVertical ? 520 : 400) : isVertical ? safeBox.w - 40 : 1040;
  const imgH = phone ? Math.round(imgW * 1.9) > (isVertical ? 900 : 760) ? (isVertical ? 900 : 760) : Math.round(imgW * 1.9) : Math.round(imgW * 0.62);
  const barH = phone ? 40 : 70;
  const frameW = imgW + (phone ? 40 : 2 * b);
  const frameH = imgH + barH + (phone ? 60 : 2 * b);
  const fx = isVertical ? (width - frameW) / 2 : phone ? safeBox.x + 380 : safeBox.x + 40;
  const fy = isVertical ? safeBox.y + 40 : (height - frameH) / 2;
  const ix = fx + (phone ? 20 : b);
  const iy = fy + barH + (phone ? 20 : b);
  const r = p.region;
  const cx = ix + (r.x + r.w / 2) * imgW;
  const cy = iy + (r.y + r.h / 2) * imgH;
  const noteX = isVertical ? safeBox.x + 20 : fx + frameW + 100;
  const noteY = isVertical ? fy + frameH + 110 : cy + 140;
  const [shaft, head] = isVertical
    ? roughArrow(noteX + 200, noteY - 30, cx - r.w * imgW * 0.2, cy + (r.h * imgH) / 2 + 30, "shot", -0.3)
    : roughArrow(noteX + 30, noteY - 40, cx + (r.w * imgW) / 2 + 40, cy + 20, "shot", 0.3);
  const content = p.image ? <Img src={staticFile(p.image)} style={{ width: imgW, height: imgH, objectFit: "cover", display: "block" }} /> : <MockApp w={imgW} h={imgH} />;
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide} fit={ZONE_FIT}>
      <Drop at={2} px={14} style={{ position: "absolute", left: fx, top: fy }}>
        {phone ? (
          <div style={{ width: frameW, height: frameH, boxSizing: "border-box", background: piz.color.ink, borderRadius: 48, padding: 20, paddingTop: barH + 20, position: "relative", boxShadow: `${piz.ui.hardShadow}px ${piz.ui.hardShadow}px 0 ${piz.ui.shadowColor}` }}>
            <div style={{ position: "absolute", top: 24, left: "50%", width: 110, height: 22, marginLeft: -55, borderRadius: 11, background: "#333" }} />
            <div style={{ borderRadius: 18, overflow: "hidden" }}>{content}</div>
          </div>
        ) : (
          <div style={{ width: frameW, boxSizing: "border-box", border: `${b}px solid ${piz.color.ink}`, background: piz.color.white, boxShadow: `${piz.ui.hardShadow}px ${piz.ui.hardShadow}px 0 ${piz.ui.shadowColor}` }}>
            <div style={{ height: barH - b, borderBottom: `${b}px solid ${piz.color.ink}`, background: piz.color.bar, display: "flex", alignItems: "center", gap: 16, padding: "0 18px" }}>
              <div style={{ display: "flex", gap: 8 }}>
                {[piz.color.accent, piz.color.grey, piz.color.grey].map((c, i) => (
                  <div key={i} style={{ width: 18, height: 18, background: c, border: `3px solid ${piz.color.ink}` }} />
                ))}
              </div>
              <div style={{ flex: 1, height: 38, border: `3px solid ${piz.color.ink}`, background: piz.color.white, display: "flex", alignItems: "center", padding: "0 14px", font: `500 24px ${piz.font.mono}`, color: "#555" }}>{p.url}</div>
            </div>
            {content}
          </div>
        )}
      </Drop>
      <MarkerLayer width={width} height={height}>
        <MarkerStroke d={roughEllipse(cx, cy, (r.w * imgW) / 2 + 30, (r.h * imgH) / 2 + 26, "shotc")} at={circleAt} frames={12} width={9} />
        <MarkerStroke d={shaft} at={circleAt + 12} frames={8} width={8} />
        <MarkerStroke d={head} at={circleAt + 19} frames={4} width={8} />
      </MarkerLayer>
      <div style={{ position: "absolute", left: noteX, top: noteY - 40, width: isVertical ? safeBox.w - 40 : width - noteX - safeBox.x }}>
        <HandNote text={p.note} at={circleAt + 20} fontSize={isVertical ? 72 : 66} color={piz.color.accentDark} align="left" />
      </div>
      {/* Mock screens carry sample figures: label them (rule j). Hidden when a real image is used. */}
      {!p.image ? (
        <div style={{ position: "absolute", left: fx, width: frameW, top: fy - 34, textAlign: "center", font: `500 26px ${piz.font.caption}`, color: piz.color.muted }}>
          dato de ejemplo · MXN
        </div>
      ) : null}
      <Sfx kind="snap" at={2} on={p.sfx} volume={0.3} />
      <Sfx kind="marker" at={circleAt} on={p.sfx} />
      <Sfx kind="marker" at={circleAt + 12} on={p.sfx} volume={0.28} />
      <Sfx kind="click" at={circleAt + 20} on={p.sfx} volume={0.2} />
    </Stage>
  );
};

export const screenshotFrameVariants: Variant<Props>[] = [
  { id: "browser", horizontal: true, props: { ...base("board", 5), device: "browser", image: "", url: "tubanco.ejemplo.mx/cuenta", region: { x: 0.03, y: 0.31, w: 0.62, h: 0.08 }, note: "¿$150 al mes por nada?", circleAt: 1.2 } },
  { id: "phone", horizontal: true, props: { ...base("board", 5), device: "phone", image: "", url: "", region: { x: 0.03, y: 0.31, w: 0.9, h: 0.07 }, note: "revisa esta línea", circleAt: 1.2 } },
];
