import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";

const inter = loadInter("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin", "latin-ext"] });
const montserrat = loadMontserrat("normal", { weights: ["700", "800", "900"], subsets: ["latin", "latin-ext"] });
const caveat = loadCaveat("normal", { weights: ["500", "700"], subsets: ["latin", "latin-ext"] });

export const theme = {
  code: "SLA",
  canvas: { width: 1920, height: 1080, fps: 30 },

  // Sampled from the two style references (Mirko Vigna, InvernovAH): near-black navy with a deep
  // royal-blue glow pooling at the bottom and edges; clean off-white cards on top.
  color: {
    bgDeep: "#02030D",
    bgNavy: "#050A2E",
    bgNavyLight: "#0B1650",
    glow: "#1A2BFF",
    glowSoft: "#2F6BFF",
    accent: "#3D8BFF",
    accentCyan: "#4FC3FF",
    card: "#F4F3F8",
    cardText: "#0B0D1A",
    cardTextMuted: "#5B6078",
    text: "#FFFFFF",
    textMuted: "#A9B0C8",
    highlight: "#3D8BFF",
    // Flash and dip colours (white flash goes through light grey first, Mirko 0:40).
    flashGrey: "#B9BAC2",
    flashWhite: "#FFFFFF",
    black: "#000000",
    // Dark-mode YouTube UI (rebuilt video cards).
    ytBadge: "rgba(0,0,0,0.78)",
    ytChip: "rgba(255,255,255,0.12)",
  },

  font: {
    ui: inter.fontFamily,
    display: montserrat.fontFamily,
    hand: caveat.fontFamily,
  },

  type: {
    uiTracking: "-0.02em",
    displayTracking: "0.06em",
  },

  radius: { card: 36, pill: 999, thumb: 18 },

  glow: {
    card: "0 0 60px rgba(61,139,255,0.35), 0 30px 80px rgba(0,0,0,0.55)",
    pill: "0 0 24px rgba(255,255,255,0.55), 0 0 60px rgba(120,150,255,0.45)",
  },

  // Measured frame-by-frame in the references: elements pop in fast with overshoot (~5 frames at
  // 30 fps), settle within ~8 more, then keep a slow camera drift so nothing sits dead still.
  motion: {
    popIn: { damping: 12, stiffness: 180, mass: 0.6 },
    settle: { damping: 20, stiffness: 120, mass: 1 },
    driftScalePerSecond: 0.012,
    typeCharsPerSecond: 28,
    exitFrames: 8,
    lightSweepFrames: 18,
  },

  transition: {
    in: "cut to the navy background, element pops in with overshoot",
    out: "quick push-out (8 frames) or white flash through light grey (Mirko style)",
    whiteFlashFrames: 6,
    endDipFrames: 15,
  },

  // Synthesised with FFmpeg (see media/soyluisart/automated-research/sfx/SOURCES.md).
  sfx: {
    click: "soyluisart/automated-research/sfx/sla-ui-click.wav",
    whoosh: "soyluisart/automated-research/sfx/sla-whoosh.wav",
    clickVolume: 0.6,
    whooshVolume: 0.7,
  },
} as const;

export type Theme = typeof theme;
