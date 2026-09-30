import { Img, staticFile } from "remotion";
import { z } from "zod";
import { theme } from "../theme";
import { CardMotion, LAND_FRAME, LightSweep, Sfx, Stage } from "./kit";

// White rounded "Lección N" card (InvernovAH): icon, big title, subtitle. Pops in from small
// with overshoot, drifts, a light sweep crosses it once after landing, then pushes out.

export const lessonCardSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  icon: z.string().describe("Emoji, or an image path inside media/ (e.g. soyluisart/user-provided/icon.png)"),
  background: z.boolean(),
  sfx: z.boolean(),
  exit: z.enum(["push", "none"]),
});

export type LessonCardProps = z.infer<typeof lessonCardSchema>;

export const lessonCardDefaults: LessonCardProps = {
  title: "Lección 1",
  subtitle: "Un buen tema es el que le importa a tu audiencia",
  icon: "❤️",
  background: true,
  sfx: true,
  exit: "push",
};

const { color, font, glow, radius, type } = theme;

const isImage = (s: string) => /\.(png|jpe?g|webp|svg|gif)$/i.test(s);

export const LessonCard: React.FC<Partial<LessonCardProps>> = (props) => {
  const { title, subtitle, icon, background, sfx, exit } = { ...lessonCardDefaults, ...props };
  return (
    <Stage background={background}>
      {sfx ? <Sfx kind="click" at={LAND_FRAME - 1} /> : null}
      <CardMotion exit={exit} from={0.2}>
        <div
          style={{
            position: "relative",
            width: 680,
            height: 800,
            borderRadius: radius.card,
            background: color.card,
            boxShadow: glow.card,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 64px",
            boxSizing: "border-box",
            textAlign: "center",
          }}
        >
          <div style={{ height: 190, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isImage(icon) ? (
              <Img src={staticFile(icon)} style={{ height: 170, width: 170, objectFit: "contain" }} />
            ) : (
              <div style={{ fontSize: 150, lineHeight: 1 }}>{icon}</div>
            )}
          </div>
          <div
            style={{
              marginTop: 40,
              fontFamily: font.ui,
              fontWeight: 800,
              fontSize: 104,
              lineHeight: 1,
              color: color.cardText,
              letterSpacing: type.uiTracking,
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 32,
              fontFamily: font.ui,
              fontWeight: 600,
              fontSize: 46,
              lineHeight: 1.25,
              color: color.cardTextMuted,
              letterSpacing: type.uiTracking,
            }}
          >
            {subtitle}
          </div>
          <LightSweep start={LAND_FRAME + 8} strength={0.7} />
        </div>
      </CardMotion>
    </Stage>
  );
};
