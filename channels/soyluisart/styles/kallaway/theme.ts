import type { CSSProperties } from "react";
import { Easing } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadVariableFont as loadArchivoVariable } from "@remotion/google-fonts/Archivo";
import { fx } from "../shared/sfx";

// "Kallaway" style pack (approved as a style option 2026-09-28). Grammar measured in
// media/soyluisart/automated-research/style-refs/kallaway/ANALISIS.md (§ Spec S.1–S.9) and re-drawn
// in the Luisart brand: a straight 50/50 split (B-roll image on top, the face below on a dark set),
// face close-ups with ONE giant word, few purposeful graphics (counter, stacked cards, kinetic type,
// typed white screen), hard cuts only, a slow push on the images and nothing else. All the colour
// comes from the B-roll; the brand blue replaces his gold.
//
// Fonts: Inter 700 (captions, giant word, card titles), Playfair Display Italic (emotion words and
// the thin serif of kinetic type), Archivo 900 at 125 % width (hook headline and big figures).

const inter = loadInter("normal", { weights: ["500", "700", "800"], subsets: ["latin", "latin-ext"] });
const playfair = loadPlayfair("italic", { weights: ["500", "600", "700"], subsets: ["latin", "latin-ext"] });
// Variable Archivo (wdth 62–125, wght 100–900): the extended caps need font-stretch 125 %.
const archivo = loadArchivoVariable("normal", { subsets: ["latin", "latin-ext"] });

export const kal = {
  color: {
    black: "#000000", // card / stack background (his measured black)
    studio: "#0E0C0F", // the dark set behind the recording (his studio)
    white: "#FFFFFF",
    ink: "#0B0D12", // text on white (typed names), brand black
    accent: "#2F6BFF", // brand blue: text on light backgrounds, cursor, underline, set glow
    accentBright: "#7FA6FF", // replaces his gold: key words on the face, 2nd headline line, counter figures
    ice: "#BFD4FF", // halo of key words and the counter
    accentDeep: "#1F4FD1",
    tint: "#DCE6FF",
    alert: "#E5484D", // only "bad": "más cara", "NO …"
    warm: "#FFA85C", // the faint warm practical light far in the set
    muted: "rgba(255,255,255,0.86)", // small labels over images ("dato de ejemplo", 36 px 600)
    mutedInk: "#6B7080",
  },
  font: {
    sans: inter.fontFamily, // Inter
    serif: playfair.fontFamily, // Playfair Display (italic loaded)
    wide: archivo.fontFamily, // Archivo variable — use with `wideType()`
  },
  // Vertical 1080×1920 sizes (horizontal uses the same pixels; both canvases are 1080 on the short side).
  size: {
    seam: 46, // small caption under the split seam
    faceWord: 165, // giant word on the chest / above the head
    faceWordSerif: 175,
    headline: 84, // hook headline (auto-fits x 120–920)
    cardTitle: 96,
    kineticSans: 120,
    kineticSerif: 100,
    counter: 230,
    white: 190, // typed text on white
  },
  // Layout geometry (vertical, ANALISIS §5 / §S.4).
  layout: {
    seam: 968, // split: image y 0–968, recording 968–1920
    seamCaptionY: 1040, // centre of the seam caption
    card: { x: 75, y: 151, w: 930, h: 1615, r: 32 },
    splitH: { imageW: 1152 }, // horizontal split: image x 0–1152, recording x 1152–1920
  },
  // Face framing on the dark set (share of the canvas width the detected face box spans).
  frame: {
    splitFaceW: 230, // his split: face ≈ 220 px wide, below the seam caption
    // Face close-up: the recording at 92 %, anchored at the bottom centre (static: no punch-ins, no
    // push). On the close test selfie this drops the forehead enough for the giant word to fit
    // above the head on every face shot, and brings the face to ≈ 48 % of the width (his ≈ 45 %).
    faceScale: 0.92,
  },
  timing: {
    titleSlideFrom: 420, // px to the right
    titleSlideFrames: 45, // Easing.out(exp): half the way in ≈ 6 f
    titleDrift: 0.3, // px/f to the left after landing
    kenBurns: 0.06, // image scale 1.00 → 1.06 over the shot
    kenBurnsDrift: 12, // px
    counterFrames: 26,
    counterLead: 4, // final figure fixed 4 f before the word that names it
    kineticSlideFrames: 15,
    kineticSlidePx: 300,
    typeCharsPerFrame: 1,
    caretBlink: 15,
    underlineFrames: 18,
  },
  ease: {
    slide: Easing.out(Easing.exp),
    count: Easing.out(Easing.cubic),
  },
  text: {
    // Legibility without plates (rule d): soft black shadow on every white text, a faint white halo
    // on the giant word, a thin ink outline (paint-order stroke) only where the image is light.
    shadow: "0 3px 14px rgba(0,0,0,0.55)",
    halo: "0 0 18px rgba(255,255,255,0.28)",
    iceHalo: "0 0 22px rgba(191,212,255,0.55)",
    outline: "#0B0D12",
  },
  // Sound map (ANALISIS §S.6 + user decision 2026-09-28): Kallaway is almost silent. The only sounds
  // are a click on the cut that opens a section (his signature; placed by the edit) and at most ONE
  // subtle sound per image or counter event (an image card appearing, the hook headline over the
  // first image, the typed white screen, a kinetic shot's figure, a counter). Nothing on plain cuts,
  // B-roll swaps, captions or the giant word. Zero whooshes (not even at the start). Elements bake
  // at most one sound each; `emphasis`, `bad`, `logo` and `cta` exist only for when the user asks.
  // `pre` = preRollFrames30 from sfx-index.json.
  sfx: {
    section: fx("ui/ui-click-tone-01.wav", 0.35, 1), // cut that opens a section (alternate with sectionAlt)
    sectionAlt: fx("ui/ui-click-mouse-close-06.wav", 0.4, 1),
    titleSlide: fx("ui/ui-swipe-right-01.wav", 0.3, 1), // hook headline slides in (an element, not a transition)
    count: fx("counter/counter-number-shuffle-01.wav", 0.2, 0), // bed while a figure counts (use EITHER this or `settle`)
    settle: fx("data/data-bleep-confirm-03.wav", 0.3, 2), // counter figure settles
    card: fx("pop/pop-dry-03.wav", 0.28, 1), // stacked card appears
    kinetic: fx("ui/ui-click-plastic-bubble-01.wav", 0.3, 1), // main kinetic word appears
    figureSlide: fx("ui/ui-swipe-soft-01.wav", 0.3, 1), // big figure slides in rotated
    type: fx("typing/typing-key-presses-short-02.wav", 0.25, 0), // typed text on white (bed, first → last char)
    logo: fx("ui/ui-tech-select-01.wav", 0.28, 1), // logo / name lands on white
    emphasis: fx("pop/pop-sharp-01.wav", 0.2, 1), // emphasis word (off in the P/U draft: user decision)
    bad: fx("impact/impact-bass-hit-short-01.wav", 0.25, 1), // "bad" figure, max once per video
    cta: fx("notification/notification-bell-ding-01.wav", 0.25, 1),
  },
} as const;

export type KalSfxKind = keyof typeof kal.sfx;

/** A theme colour (#RRGGBB) with alpha, for glows and even dims (no brand values outside theme.ts). */
export const alpha = (hex: string, a: number) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Number(a.toFixed(3))})`;
};

/** Archivo at 125 % width, 900 (the hook headline / big figures look). */
export const wideType = (px: number, weight = 900): CSSProperties => ({
  fontFamily: kal.font.wide,
  fontWeight: weight,
  fontSize: px,
  fontStretch: "125%",
  fontVariationSettings: `"wdth" 125, "wght" ${weight}`,
  letterSpacing: "-0.01em",
  lineHeight: 0.92,
});
