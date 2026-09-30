import { AbsoluteFill } from "remotion";
import { Bit, DotBoard, ICONS, IconName, PixelButton, PixelIcon, StickFigure } from "./primitives";
import { piz } from "./theme";

// Catalog still: every pixel icon, Bit's expressions, the stick-figure poses and the pixel button.
export const IconSheet: React.FC = () => (
  <AbsoluteFill>
    <DotBoard />
    <div style={{ position: "absolute", inset: 60, display: "flex", flexDirection: "column", gap: 40 }}>
      <div style={{ font: `700 56px ${piz.font.heading}`, color: piz.color.ink }}>
        Pizarra · iconos <span style={{ color: piz.color.accent }}>pixel</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 44 }}>
        {(Object.keys(ICONS) as IconName[]).map((n) => (
          <div key={n} style={{ width: 190, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <PixelIcon name={n} px={8} shadow />
            <div style={{ font: `700 24px ${piz.font.label}`, color: piz.color.ink }}>{n}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 60, alignItems: "flex-end" }}>
        {(["happy", "neutral", "surprised", "sad"] as const).map((e) => (
          <div key={e} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Bit px={10} expression={e} bob={false} />
            <div style={{ font: `400 44px ${piz.font.hand}`, color: piz.color.handInk }}>{e}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 50, alignItems: "flex-end" }}>
        {(["stand", "wave", "question", "point"] as const).map((p) => (
          <StickFigure key={p} h={260} pose={p} />
        ))}
        <PixelButton label="+SEGUIR" />
      </div>
      {(["marcador", "pixel", "caracter"] as const).map((v) => (
        <div key={v} style={{ display: "flex", gap: 40, alignItems: "flex-end" }}>
          {(["happy", "surprised", "thinking", "angry", "wink", "sleepy"] as const).map((e) => (
            <StickFigure key={e} h={200} variant={v} expression={e} />
          ))}
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
