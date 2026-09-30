import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Caret, Drop, PixelArt, PixelIcon, RetroWindow, Sfx, Stage, Tile, Variant, base, baseSchema, clamp, iconField, useFormat } from "./primitives";
import { piz } from "./theme";

// Retro-brutalist app mockups: a chat window where a prompt is typed (1 char/frame, block caret,
// right-aligned grey message boxes) and attachments drop in as pixel tiles; or a settings card
// where a pixel cursor clicks a toggle on and a "✓ …" line lands.

export const retroWindowSchema = baseSchema.extend({
  kind: z.enum(["chat", "settings"]),
  title: z.string(),
  lines: z.array(z.string()).max(3).describe("chat: prompt lines typed one after another"),
  attachments: z.array(z.object({ icon: iconField, label: z.string() })).max(3),
  settingTitle: z.string(),
  settingDesc: z.string(),
  result: z.string().describe("settings: line shown after the click"),
  clickAt: z.number().min(0).describe("settings: seconds when the cursor clicks the toggle"),
});
type Props = z.infer<typeof retroWindowSchema>;

const CURSOR = [
  "K.........",
  "KK........",
  "KWK.......",
  "KWWK......",
  "KWWWK.....",
  "KWWWWK....",
  "KWWWWWK...",
  "KWWWWWWK..",
  "KWWWWKKKK.",
  "KWKWWK....",
  "KK.KWWK...",
  "K..KWWK...",
  "....KWWK..",
  "....KKK...",
];

const Chat: React.FC<Props & { w: number }> = (p) => {
  const frame = useCurrentFrame();
  const start = 6;
  const fs = p.w > 900 ? 50 : 44;
  let t = start;
  const lineStarts = p.lines.map((l) => {
    const s = t;
    t += Array.from(l).length + 8;
    return s;
  });
  const typedEnd = t - 8;
  const attachAt = typedEnd + 6;
  return (
    <RetroWindow title={p.title} width={p.w} titleSize={fs * 0.8}>
      <div style={{ padding: "30px 30px 34px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 22, minHeight: p.w * 0.72, boxSizing: "border-box" }}>
        {p.lines.map((l, i) => {
          const s = lineStarts[i];
          if (frame < s) return null;
          const chars = Array.from(l);
          const shown = Math.min(chars.length, frame - s + 1);
          const isLast = i === p.lines.length - 1;
          const typing = shown < chars.length || isLast;
          return (
            <div key={i} style={{ background: piz.color.greyLight, border: `3px solid ${piz.color.ink}`, padding: "10px 18px", font: `700 ${fs}px ${piz.font.caption}`, color: piz.color.ink, letterSpacing: "-0.01em", maxWidth: p.w - 120 }}>
              {chars.slice(0, shown).join("")}
              {typing && (shown < chars.length || i === p.lines.length - 1) ? <Caret height={fs} blink={shown >= chars.length} /> : null}
            </div>
          );
        })}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 26, alignSelf: "center", marginTop: 40 }}>
          {p.attachments.map((a, i) => (
            <Drop key={i} at={attachAt + i * piz.timing.sibling}>
              <Tile size={Math.round(fs * 4)}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <PixelIcon name={a.icon} px={Math.floor(fs / 5.5)} />
                  <div style={{ font: `700 ${Math.round(fs * 0.6)}px ${piz.font.caption}`, color: piz.color.ink }}>{a.label}</div>
                </div>
              </Tile>
            </Drop>
          ))}
        </div>
      </div>
      <Sfx kind="type" at={start} frames={typedEnd - start} on={p.sfx} />
      {p.attachments.length ? <Sfx kind="pop" at={attachAt} on={p.sfx} /> : null}
    </RetroWindow>
  );
};

const Settings: React.FC<Props & { w: number }> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const click = Math.round(p.clickAt * fps);
  const on = frame >= click;
  const fs = p.w > 900 ? 50 : 46;
  const tw = Math.round(fs * 2.9);
  const th = Math.round(fs * 1.35);
  const knob = th - 16;
  const resultAt = click + 8;
  // Cursor path: from lower-left to the toggle, arriving 4 f before the click; whole pixels.
  const cx = Math.round(interpolate(frame, [click - 22, click - 4], [-p.w * 0.35, tw * 0.55], { ...clamp, easing: piz.ease.out }));
  const cy = Math.round(interpolate(frame, [click - 22, click - 4], [th * 2.6, th * 0.5], { ...clamp, easing: piz.ease.out }));
  const press = frame >= click && frame < click + 3 ? 4 : 0;
  return (
    <RetroWindow title={p.title} width={p.w} titleSize={fs * 0.8} square>
      <div style={{ padding: "34px 36px 30px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 30 }}>
          <div>
            <div style={{ font: `700 ${fs * 1.1}px ${piz.font.caption}`, color: piz.color.ink, letterSpacing: "-0.01em" }}>{p.settingTitle}</div>
            <div style={{ font: `500 ${fs * 0.7}px ${piz.font.caption}`, color: piz.color.muted, marginTop: 8, lineHeight: 1.25 }}>{p.settingDesc}</div>
          </div>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              style={{
                width: tw,
                height: th,
                boxSizing: "border-box",
                border: `4px solid ${piz.color.ink}`,
                background: on ? piz.color.accent : piz.color.greyLight,
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", top: 4, left: on ? tw - knob - 12 : 4, width: knob, height: knob, boxSizing: "border-box", border: `4px solid ${piz.color.ink}`, background: piz.color.white }} />
            </div>
            <div style={{ position: "absolute", left: cx, top: cy + press }}>
              <PixelArt rows={CURSOR} px={Math.round(fs / 10)} />
            </div>
          </div>
        </div>
        <div style={{ height: 3, background: piz.color.greyLight, margin: "26px 0 20px" }} />
        <div style={{ font: `700 ${fs * 0.8}px ${piz.font.caption}`, color: piz.color.ink, visibility: frame >= resultAt ? "visible" : "hidden" }}>
          <span style={{ color: piz.color.green }}>✓</span> {p.result}
        </div>
      </div>
      <Sfx kind="click" at={click} on={p.sfx} />
      <Sfx kind="ding" at={resultAt} on={p.sfx} />
    </RetroWindow>
  );
};

export const RetroWindowScene: React.FC<Props> = (p) => {
  const { isVertical, safeBox } = useFormat();
  const w = isVertical ? safeBox.w - piz.ui.hardShadow : 1100;
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <AbsoluteFill style={{ left: safeBox.x, top: safeBox.y, width: safeBox.w, height: safeBox.h, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {p.kind === "chat" ? <Chat {...p} w={w} /> : <Settings {...p} w={w} />}
      </AbsoluteFill>
    </Stage>
  );
};

const common: Props = {
  ...base("board", 5),
  kind: "chat",
  title: "Nuevo chat",
  lines: ["Hazme un presupuesto mensual:", "sueldo · gastos · ahorro"],
  attachments: [
    { icon: "money-bag", label: "sueldo" },
    { icon: "calendar", label: "gastos" },
  ],
  settingTitle: "Memoria",
  settingDesc: "Recordar lo que hablamos entre conversaciones",
  result: "Se acuerda hasta de lo de ayer",
  clickAt: 1.4,
};

export const retroWindowVariants: Variant<Props>[] = [
  { id: "chat", props: { ...common, seconds: 5 }, horizontal: true },
  { id: "settings", props: { ...common, kind: "settings", title: "Ajustes · Personalización", seconds: 4 }, horizontal: true },
];
