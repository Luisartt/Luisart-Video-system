import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadInterTight } from "@remotion/google-fonts/InterTight";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadNanumPen } from "@remotion/google-fonts/NanumPenScript";
import { loadFont as loadGaegu } from "@remotion/google-fonts/Gaegu";
import { loadFont as loadShadows } from "@remotion/google-fonts/ShadowsIntoLight";
import { loadFont as loadShadowsTwo } from "@remotion/google-fonts/ShadowsIntoLightTwo";
import { loadFont as loadSilkscreen } from "@remotion/google-fonts/Silkscreen";
import { loadFont as loadPixelify } from "@remotion/google-fonts/PixelifySans";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadSpaceMono } from "@remotion/google-fonts/SpaceMono";
import { loadFont as loadInstrument } from "@remotion/google-fonts/InstrumentSans";

// Font A/B still: Santiago's crops (left) next to the Google candidates for each role, so the
// Pizarra fonts can be locked by eye. Rendered once to out/soyluisart/pizarra/_font-ab.png.

const f = {
  inter: loadInter("normal", { weights: ["700"], subsets: ["latin", "latin-ext"] }).fontFamily,
  interTight: loadInterTight("normal", { weights: ["800"], subsets: ["latin", "latin-ext"] }).fontFamily,
  archivo: loadArchivo("normal", { weights: ["800"], subsets: ["latin", "latin-ext"] }).fontFamily,
  nanum: loadNanumPen("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
  gaegu: loadGaegu("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
  shadows: loadShadows("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily,
  shadowsTwo: loadShadowsTwo("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily,
  silk: loadSilkscreen("normal", { weights: ["700"], subsets: ["latin", "latin-ext"] }).fontFamily,
  pixelify: loadPixelify("normal", { weights: ["700"], subsets: ["latin", "latin-ext"] }).fontFamily,
  spaceGrotesk: loadSpaceGrotesk("normal", { weights: ["700"], subsets: ["latin", "latin-ext"] }).fontFamily,
  spaceMono: loadSpaceMono("normal", { weights: ["700"], subsets: ["latin", "latin-ext"] }).fontFamily,
  instrument: loadInstrument("normal", { weights: ["700"], subsets: ["latin", "latin-ext"] }).fontFamily,
};

const RED = "#DC0A0A";
const crop = (file: string) => staticFile(`soyluisart/automated-research/style-refs/santiago/crops/${file}`);

const Row: React.FC<{ title: string; refImg: string; refH: number; children: React.ReactNode }> = ({ title, refImg, refH, children }) => (
  <div style={{ display: "flex", gap: 40, alignItems: "flex-start", borderTop: "3px solid #111", padding: "28px 0" }}>
    <div style={{ width: 620, flexShrink: 0 }}>
      <div style={{ font: `700 26px ${f.inter}`, marginBottom: 10 }}>{title} — referencia</div>
      <Img src={refImg} style={{ width: 620, height: refH, objectFit: "contain", objectPosition: "left top", background: "#fafafa" }} />
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{children}</div>
  </div>
);

const Cand: React.FC<{ name: string; children: React.ReactNode }> = ({ name, children }) => (
  <div>
    <div style={{ font: `700 22px ${f.inter}`, color: "#2F6BFF" }}>{name}</div>
    {children}
  </div>
);

export const FontAB: React.FC = () => (
  <AbsoluteFill style={{ background: "#FFFFFF", padding: 50, color: "#111" }}>
    <div style={{ font: `800 44px ${f.interTight}`, marginBottom: 20 }}>Pizarra — A/B de fuentes</div>
    <Row title="Cabecera" refImg={crop("excusa_title.png")} refH={160}>
      <Cand name="Inter Tight 800">
        <div style={{ font: `800 110px ${f.interTight}`, color: RED, lineHeight: 1 }}>EXCUSA 1</div>
      </Cand>
      <Cand name="Archivo 800">
        <div style={{ font: `800 110px ${f.archivo}`, color: RED, lineHeight: 1 }}>EXCUSA 1</div>
      </Cand>
    </Row>
    <Row title="Manuscrito" refImg={crop("excusa_title.png")} refH={160}>
      <Cand name="Nanum Pen Script">
        <div style={{ font: `400 76px ${f.nanum}`, color: "#3E3E3E", lineHeight: 1 }}>no sé por dónde empezar</div>
      </Cand>
      <Cand name="Gaegu 400">
        <div style={{ font: `400 64px ${f.gaegu}`, color: "#3E3E3E", lineHeight: 1 }}>no sé por dónde empezar</div>
      </Cand>
      <Cand name="Shadows Into Light">
        <div style={{ font: `400 60px ${f.shadows}`, color: "#3E3E3E", lineHeight: 1.1 }}>no sé por dónde empezar</div>
      </Cand>
      <Cand name="Shadows Into Light Two">
        <div style={{ font: `400 60px ${f.shadowsTwo}`, color: "#3E3E3E", lineHeight: 1.1 }}>no sé por dónde empezar</div>
      </Cand>
    </Row>
    <Row title="Etiqueta pixel" refImg={crop("seguir.png")} refH={200}>
      {[
        ["Silkscreen 700", f.silk],
        ["Pixelify Sans 700", f.pixelify],
      ].map(([n, fam]) => (
        <Cand key={n} name={n}>
          <div style={{ display: "inline-block", background: RED, color: "#fff", font: `700 64px ${fam}`, padding: "6px 22px", border: "4px solid #111", boxShadow: "8px 8px 0 #111" }}>
            +SEGUIR
          </div>
        </Cand>
      ))}
    </Row>
    <Row title="Cabecera técnica" refImg={crop("losque.png")} refH={200}>
      <Cand name="Space Grotesk 700">
        <div style={{ font: `700 80px ${f.spaceGrotesk}`, color: RED, lineHeight: 1 }}>LOS QUE DESTACAN</div>
      </Cand>
      <Cand name="Space Mono 700">
        <div style={{ font: `700 72px ${f.spaceMono}`, color: RED, lineHeight: 1 }}>LOS QUE DESTACAN</div>
      </Cand>
    </Row>
    <Row title="Subtítulo" refImg={crop("caption.png")} refH={140}>
      <Cand name="Inter 700">
        <div style={{ font: `700 58px ${f.inter}`, lineHeight: 1 }}>
          ideas tan <span style={{ color: RED }}>rápido</span> y
        </div>
      </Cand>
      <Cand name="Instrument Sans 700">
        <div style={{ font: `700 58px ${f.instrument}`, lineHeight: 1 }}>
          ideas tan <span style={{ color: RED }}>rápido</span> y
        </div>
      </Cand>
    </Row>
  </AbsoluteFill>
);
