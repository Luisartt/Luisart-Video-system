import { AbsoluteFill } from "remotion";
import { theme } from "./theme";
import { NavyBackground } from "./animations/NavyBackground";

const { color, font, radius, glow, type } = theme;

const Swatch: React.FC<{ hex: string; name: string }> = ({ hex, name }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 110 }}>
    <div style={{ height: 84, borderRadius: 18, background: hex, border: "1px solid rgba(255,255,255,0.18)" }} />
    <div style={{ fontFamily: font.ui, fontSize: 18, color: color.text, fontWeight: 600, letterSpacing: type.uiTracking }}>{name}</div>
    <div style={{ fontFamily: font.ui, fontSize: 16, color: color.textMuted }}>{hex}</div>
  </div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: font.ui, fontSize: 18, color: color.textMuted, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600, marginBottom: 18 }}>
    {children}
  </div>
);

// Proposal board: palette, type and sample elements, before any animation is built.
export const BrandBoard: React.FC = () => {
  return (
    <AbsoluteFill>
      <NavyBackground glowX={62} glowY={110} />
      <AbsoluteFill style={{ padding: "80px 96px", display: "flex", flexDirection: "row", gap: 80 }}>
        <div style={{ flex: "0 0 760px", display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: font.hand, fontSize: 44, color: color.accentCyan, marginBottom: -6 }}>propuesta de marca</div>
          <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 104, color: color.text, letterSpacing: "0.01em", lineHeight: 1 }}>
            @soyluisart
          </div>
          <div style={{ fontFamily: font.ui, fontSize: 26, color: color.textMuted, marginTop: 18, letterSpacing: type.uiTracking, lineHeight: 1.4 }}>
            Fondo navy casi negro con luz azul, tarjetas blancas limpias y animaciones que entran rápido con rebote.
          </div>

          <div style={{ marginTop: 56 }}>
            <Label>Paleta</Label>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Swatch hex={color.bgDeep} name="Fondo" />
              <Swatch hex={color.bgNavy} name="Navy" />
              <Swatch hex={color.glow} name="Brillo" />
              <Swatch hex={color.accent} name="Acento" />
              <Swatch hex={color.accentCyan} name="Cian" />
              <Swatch hex={color.card} name="Tarjeta" />
            </div>
          </div>

          <div style={{ marginTop: 52 }}>
            <Label>Tipografía</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 40, color: color.text, letterSpacing: type.displayTracking, textTransform: "uppercase" }}>
                Montserrat · títulos
              </div>
              <div style={{ fontFamily: font.ui, fontWeight: 600, fontSize: 34, color: color.text, letterSpacing: type.uiTracking }}>
                Inter · texto, tarjetas e interfaz
              </div>
              <div style={{ fontFamily: font.hand, fontWeight: 700, fontSize: 42, color: color.accentCyan }}>Caveat · notas a mano</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, position: "relative" }}>
          <Label>Elementos</Label>

          <div
            style={{
              marginTop: 10,
              height: 76,
              borderRadius: radius.pill,
              background: color.card,
              boxShadow: glow.pill,
              display: "flex",
              alignItems: "center",
              padding: "0 34px",
              fontFamily: font.ui,
              fontWeight: 600,
              fontSize: 32,
              color: color.cardText,
              letterSpacing: type.uiTracking,
            }}
          >
            Cómo crecer en YouTube desde 0<span style={{ width: 3, height: 36, background: color.accent, marginLeft: 6 }} />
          </div>

          <div style={{ display: "flex", gap: 40, marginTop: 64, alignItems: "flex-start" }}>
            <div
              style={{
                width: 330,
                height: 380,
                borderRadius: radius.card,
                background: color.card,
                boxShadow: glow.card,
                padding: 34,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 18, background: color.accent }} />
              <div>
                <div style={{ fontFamily: font.ui, fontWeight: 800, fontSize: 46, color: color.cardText, letterSpacing: type.uiTracking }}>Lección 1</div>
                <div style={{ fontFamily: font.ui, fontWeight: 500, fontSize: 24, color: color.cardTextMuted, marginTop: 8, lineHeight: 1.3 }}>
                  Un buen tema es el que le importa a tu audiencia
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 40, flex: 1 }}>
              <div
                style={{
                  borderRadius: radius.card - 12,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: 22,
                  display: "flex",
                  gap: 20,
                  alignItems: "center",
                }}
              >
                <div style={{ width: 176, height: 99, borderRadius: radius.thumb, background: `linear-gradient(135deg, ${color.glowSoft}, ${color.bgNavyLight})` }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: font.ui, fontWeight: 600, fontSize: 24, color: color.text, letterSpacing: type.uiTracking, lineHeight: 1.25 }}>
                    Título del video en tarjeta estilo YouTube
                  </div>
                  <div style={{ fontFamily: font.ui, fontSize: 18, color: color.textMuted, marginTop: 8 }}>soyluisart · 12 K vistas</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div
                  style={{
                    alignSelf: "flex-start",
                    border: `3px solid ${color.text}`,
                    padding: "12px 26px",
                    fontFamily: font.display,
                    fontWeight: 800,
                    fontSize: 40,
                    letterSpacing: "0.1em",
                    color: color.text,
                    textTransform: "uppercase",
                  }}
                >
                  Luis Art
                </div>
                <div style={{ fontFamily: font.ui, fontSize: 20, color: color.textMuted }}>Rótulo de nombre (lower third)</div>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 96, color: color.accent, lineHeight: 1 }}>+365</div>
                <div style={{ fontFamily: font.ui, fontWeight: 600, fontSize: 28, color: color.text }}>días subiendo videos</div>
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
