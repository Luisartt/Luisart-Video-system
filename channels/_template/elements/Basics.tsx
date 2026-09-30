import { interpolate, useCurrentFrame, Easing } from "remotion";
import { Board, Card, H, Note, T, SAFE, clamp, useEnter } from "../kit";

// Four small elements: TitleCard, StatCallout, BarChart, LowerThird. All token-driven.

export const TitleCard: React.FC<{ kicker: string; title: string }> = ({ kicker, title }) => {
  const k = useEnter(2);
  const t = useEnter(2 + T.motion.stagger);
  return (
    <Board>
      <div style={{ position: "absolute", left: 70, right: 70, top: SAFE.top + 120 }}>
        <Note size={48} style={{ ...k.style, marginBottom: 18 }}>{kicker}</Note>
        <H size={T.type.title + 20} style={t.style}>{title}</H>
        <div style={{ marginTop: 28, height: T.border * 2, width: 220 * t.p, background: T.color.accent }} />
      </div>
    </Board>
  );
};

export const StatCallout: React.FC<{ value: number; prefix?: string; suffix?: string; label: string; note?: string }> = ({ value, prefix = "", suffix = "", label, note }) => {
  const frame = useCurrentFrame();
  const e = useEnter(4);
  const n = Math.round(interpolate(frame, [6, 50], [0, value], { ...clamp, easing: Easing.out(Easing.cubic) }));
  return (
    <Board>
      <div style={{ position: "absolute", left: 70, right: 70, top: SAFE.top + 140, ...e.style }}>
        <Card style={{ padding: "48px 40px" }}>
          <H size={T.type.number}>{`${prefix}${n.toLocaleString("en-US")}${suffix}`}</H>
          <H size={T.type.label} color={T.color.muted} style={{ marginTop: 10 }}>{label}</H>
        </Card>
        {note ? <Note style={{ marginTop: 22 }}>{note}</Note> : null}
      </div>
    </Board>
  );
};

export const BarChart: React.FC<{ title: string; items: { label: string; value: number }[] }> = ({ title, items }) => {
  const frame = useCurrentFrame();
  const max = Math.max(...items.map((i) => i.value));
  const hd = useEnter(2);
  return (
    <Board>
      <div style={{ position: "absolute", left: 70, right: 70, top: SAFE.top + 40, ...hd.style }}>
        <H size={76}>{title}</H>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: SAFE.top + 260, height: 520, display: "flex", alignItems: "flex-end", gap: 24 }}>
        {items.map((it, i) => {
          const s = 12 + i * T.motion.stagger;
          const h = interpolate(frame, [s, s + 18], [0, (it.value / max) * 440], { ...clamp, easing: Easing.out(Easing.cubic) });
          return (
            <div key={it.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
              <H size={44} style={{ marginBottom: 8, opacity: h > 4 ? 1 : 0 }}>{it.value.toLocaleString("en-US")}</H>
              <div style={{ width: "100%", height: h, background: i === items.length - 1 ? T.color.accent : T.color.surface, border: `${T.border}px solid ${T.color.line}`, boxShadow: `${T.shadow.x}px ${T.shadow.y}px 0 ${T.shadow.color}` }} />
              <Note size={34} style={{ marginTop: 14 }}>{it.label}</Note>
            </div>
          );
        })}
      </div>
    </Board>
  );
};

export const LowerThird: React.FC<{ name: string; role: string }> = ({ name, role }) => {
  const e = useEnter(4);
  return (
    <Board>
      <div style={{ position: "absolute", left: 70, top: SAFE.bottom - 260, ...e.style }}>
        <H size={84}>{name}</H>
        <Note size={48} style={{ marginTop: 8 }}>{role}</Note>
        <div style={{ marginTop: 14, height: T.border * 2, width: 180 * e.p, background: T.color.accent }} />
      </div>
    </Board>
  );
};
