import { Easing } from "remotion";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SchibstedGrotesk";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

// Prototype B · "Terminal": the user's blue-and-black, rebuilt as a technical blueprint
// (Framer Lumora frames + React Bits text effects + Nate Herk's product-UI charts).

const grotesk = loadGrotesk("normal", { weights: ["600", "700", "800"], subsets: ["latin", "latin-ext"] });
const mono = loadMono("normal", { weights: ["400", "500", "700"], subsets: ["latin", "latin-ext"] });

export const themeB = {
  color: {
    bg: "#04060B",
    panel: "#070B14",
    tile: "#0A0F1C",
    hairline: "#1A2233",
    hairlineBright: "#2A3650",
    blue: "#2F6BFF",
    ice: "#BFD4FF",
    orange: "#FF7A1A",
    gain: "#3DDC97",
    loss: "#FF5A5F",
    text: "#EDF1F7",
    muted: "#7C8799",
  },
  font: { display: grotesk.fontFamily, mono: mono.fontFamily },
  tracking: { display: "-0.04em", mono: "0.08em" },
  // Snappy and digital: fast ease-outs, step timing, no overshoot.
  ease: { snap: Easing.bezier(0.2, 0.9, 0.1, 1), inOut: Easing.bezier(0.7, 0, 0.3, 1) },
  circuitOpacity: 0.35,
  grid: 96,
  frameInset: 48,
} as const;
