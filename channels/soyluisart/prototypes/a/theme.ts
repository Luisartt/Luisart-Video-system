import { Easing } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

// Prototype A · "Grabado editorial": Jack Roberts' engraving chapter cards + Refero's Slash
// (midnight vault, copper as the only accent, didone-style serif against a quiet sans).

const serif = loadSerif("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });
loadSerif("italic", { weights: ["400"], subsets: ["latin", "latin-ext"] });
const sans = loadGeist("normal", { weights: ["400", "500"], subsets: ["latin", "latin-ext"] });
const mono = loadMono("normal", { weights: ["400", "500"], subsets: ["latin", "latin-ext"] });

export const themeA = {
  color: {
    ink: "#08080A",
    inkRaised: "#121317",
    hairline: "#26272D",
    hairlineStrong: "#3A3B42",
    parchment: "#F2E9DA",
    sepia: "#6B5A45",
    copper: "#CC9166",
    text: "#E2E3E9",
    muted: "#8A8F9C",
  },
  font: { serif: serif.fontFamily, sans: sans.fontFamily, mono: mono.fontFamily },
  tracking: { mono: "0.24em", serif: "-0.015em" },
  // Calm and precise: long ease-outs, no overshoot.
  ease: {
    out: Easing.bezier(0.22, 1, 0.36, 1),
    inOut: Easing.bezier(0.65, 0, 0.35, 1),
  },
  margin: 96,
} as const;
