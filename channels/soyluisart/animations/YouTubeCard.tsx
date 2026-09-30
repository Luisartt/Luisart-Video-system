import { Img, staticFile } from "remotion";
import { z } from "zod";
import { theme } from "../theme";
import { CardMotion, LAND_FRAME, LightSweep, Sfx, Stage } from "./kit";

// Rebuilt YouTube video card in dark mode (Mirko 1:02): 16:9 thumbnail on the left, title,
// channel with avatar and verified check, views · age, optional chip. Pops in with overshoot,
// drifts, a light sweep crosses the thumbnail once, then pushes out.

export const youTubeCardSchema = z.object({
  thumbnail: z.string().describe("Image path inside media/; empty = blue gradient placeholder"),
  title: z.string(),
  channel: z.string(),
  avatar: z.string().describe("Image path inside media/; empty = initial on an accent circle"),
  verified: z.boolean(),
  views: z.string(),
  age: z.string(),
  duration: z.string().describe("Time badge on the thumbnail; empty = none"),
  chip: z.string().describe("Small chip under the meta line (a date, '4K', 'Nuevo'); empty = none"),
  background: z.boolean(),
  sfx: z.boolean(),
  exit: z.enum(["push", "none"]),
});

export type YouTubeCardProps = z.infer<typeof youTubeCardSchema>;

export const youTubeCardDefaults: YouTubeCardProps = {
  thumbnail: "",
  title: "Cómo crecer en YouTube desde 0 (guía completa)",
  channel: "soyluisart",
  avatar: "",
  verified: true,
  views: "12 K visualizaciones",
  age: "hace 3 días",
  duration: "12:36",
  chip: "3 de marzo",
  background: true,
  sfx: true,
  exit: "push",
};

const { color, font, glow, radius, type } = theme;

const Verified: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill={color.textMuted} />
    <path d="M7.5 12.3l3 3 6-6.4" stroke={color.bgDeep} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const YouTubeCard: React.FC<Partial<YouTubeCardProps>> = (props) => {
  const p = { ...youTubeCardDefaults, ...props };
  const thumbW = 880;
  const thumbH = (thumbW * 9) / 16;
  return (
    <Stage background={p.background} glowX={40}>
      {p.sfx ? <Sfx kind="click" at={LAND_FRAME - 1} /> : null}
      <CardMotion exit={p.exit} from={0.15} driftX={-10}>
        <div style={{ display: "flex", gap: 44, alignItems: "flex-start", width: 1640 }}>
          <div
            style={{
              position: "relative",
              flex: `0 0 ${thumbW}px`,
              height: thumbH,
              borderRadius: radius.thumb,
              overflow: "hidden",
              boxShadow: `0 0 0 2px rgba(255,255,255,0.14), ${glow.card}`,
              background: `linear-gradient(135deg, ${color.glowSoft} 0%, ${color.glow} 45%, ${color.bgNavyLight} 100%)`,
            }}
          >
            {p.thumbnail ? (
              <Img src={staticFile(p.thumbnail)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(50% 60% at 70% 30%, ${color.accentCyan}66 0%, transparent 70%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width={120} height={120} viewBox="0 0 24 24" style={{ opacity: 0.85 }}>
                  <path d="M8 5.5v13l10.5-6.5z" fill={color.text} />
                </svg>
              </div>
            )}
            {p.duration ? (
              <div
                style={{
                  position: "absolute",
                  right: 16,
                  bottom: 16,
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: color.ytBadge,
                  fontFamily: font.ui,
                  fontWeight: 600,
                  fontSize: 26,
                  color: color.text,
                }}
              >
                {p.duration}
              </div>
            ) : null}
            <LightSweep start={LAND_FRAME + 10} strength={0.6} />
          </div>

          <div style={{ flex: 1, paddingTop: 6, position: "relative" }}>
            <div
              style={{
                fontFamily: font.ui,
                fontWeight: 600,
                fontSize: 52,
                lineHeight: 1.22,
                color: color.text,
                letterSpacing: type.uiTracking,
                paddingRight: 60,
              }}
            >
              {p.title}
            </div>
            <div style={{ position: "absolute", top: 4, right: 0, fontSize: 40, color: color.text, lineHeight: 1, letterSpacing: "0.05em" }}>⋮</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 30 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: `linear-gradient(135deg, ${color.accentCyan}, ${color.glow})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: font.display,
                  fontWeight: 900,
                  fontSize: 28,
                  color: color.text,
                }}
              >
                {p.avatar ? (
                  <Img src={staticFile(p.avatar)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  p.channel.replace(/^@/, "").charAt(0).toUpperCase()
                )}
              </div>
              <div style={{ fontFamily: font.ui, fontWeight: 500, fontSize: 34, color: color.textMuted, letterSpacing: type.uiTracking }}>
                {p.channel}
              </div>
              {p.verified ? <Verified size={30} /> : null}
            </div>
            <div style={{ marginTop: 18, fontFamily: font.ui, fontWeight: 500, fontSize: 32, color: color.textMuted, letterSpacing: type.uiTracking }}>
              {[p.views, p.age].filter(Boolean).join(" · ")}
            </div>
            {p.chip ? (
              <div
                style={{
                  display: "inline-block",
                  marginTop: 22,
                  padding: "8px 18px",
                  borderRadius: 10,
                  background: color.ytChip,
                  fontFamily: font.ui,
                  fontWeight: 600,
                  fontSize: 26,
                  color: color.text,
                }}
              >
                {p.chip}
              </div>
            ) : null}
          </div>
        </div>
      </CardMotion>
    </Stage>
  );
};
