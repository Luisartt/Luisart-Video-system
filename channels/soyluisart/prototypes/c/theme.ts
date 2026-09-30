import { Easing } from "remotion";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadSourceSerif } from "@remotion/google-fonts/SourceSerif4";

// Prototype C · "Documental": Magnates Media chapter cards and map networks + Andrei Jikh's
// yellow emphasis bars and footnote boxes, over graded B-roll with film grain.

const archivo = loadArchivo("normal", { weights: ["700", "800", "900"], subsets: ["latin", "latin-ext"] });
loadArchivo("italic", { weights: ["900"], subsets: ["latin", "latin-ext"] });
const serif = loadSourceSerif("normal", { weights: ["400", "600"], subsets: ["latin", "latin-ext"] });
loadSourceSerif("italic", { weights: ["400"], subsets: ["latin", "latin-ext"] });

export const themeC = {
  color: {
    charcoal: "#111316",
    charcoalRaised: "#1A1D22",
    bone: "#E8E2D6",
    amber: "#EEBB18",
    red: "#E0302F",
    cyan: "#5FD3E6",
    black: "#0A0A0B",
  },
  font: { display: archivo.fontFamily, serif: serif.fontFamily },
  // B-roll grade: slightly desaturated, a touch of contrast.
  grade: "saturate(0.62) contrast(1.08) brightness(0.9)",
  grain: { opacity: 0.16, frequency: 0.85 },
  weavePx: 1.5,
  ease: { land: Easing.bezier(0.16, 1, 0.3, 1), slow: Easing.bezier(0.45, 0, 0.55, 1) },
} as const;
