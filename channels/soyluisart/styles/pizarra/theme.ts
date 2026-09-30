import { Easing } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadInterTight } from "@remotion/google-fonts/InterTight";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadSpaceMono } from "@remotion/google-fonts/SpaceMono";
import { loadFont as loadHand } from "@remotion/google-fonts/ShadowsIntoLightTwo";
import { loadFont as loadPixelify } from "@remotion/google-fonts/PixelifySans";
import { loadFont as loadSourceSerif } from "@remotion/google-fonts/SourceSerif4";

// "Pizarra" graphics standard (2026-09-27): white dotted board, grotesk heading + thin handwritten
// note, pixel-art icons, retro-brutalist UI, one blue accent. Grammar copied from the Santiago
// Castellanos analysis (media/soyluisart/automated-research/style-refs/santiago/ANALISIS.md §10–12),
// re-coloured to the Luisart brand. Fonts locked after the A/B still out/soyluisart/pizarra/_font-ab.png:
// Inter Tight 700 headings (800 read heavier than his Helvetica-Bold look), Shadows Into Light Two
// handwriting (tall, thin monoline like his marker; Nanum Pen's accents looked off), Pixelify Sans 700
// pixel labels (Silkscreen is too wide), Space Grotesk 700 technical labels, Inter 700 captions.

const inter = loadInter("normal", { weights: ["500", "700", "800"], subsets: ["latin", "latin-ext"] });
const interTight = loadInterTight("normal", { weights: ["700", "800"], subsets: ["latin", "latin-ext"] });
const spaceGrotesk = loadSpaceGrotesk("normal", { weights: ["700"], subsets: ["latin", "latin-ext"] });
const spaceMono = loadSpaceMono("normal", { weights: ["700"], subsets: ["latin", "latin-ext"] });
const hand = loadHand("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });
const pixel = loadPixelify("normal", { weights: ["500", "700"], subsets: ["latin", "latin-ext"] });
const serif = loadSourceSerif("normal", { weights: ["700"], subsets: ["latin", "latin-ext"] });

export const piz = {
  color: {
    paper: "#FFFFFF",
    dot: "#D5D9E2",
    cream: "#F3EFE4",
    creamDot: "#D8D1BF",
    ink: "#111111",
    handInk: "#3A3A3A",
    accent: "#2F6BFF",
    accentDark: "#1F4FD1",
    tint: "#DCE6FF",
    tintMid: "#A9C4FF",
    alert: "#E5484D",
    yellow: "#F3C440",
    green: "#3DBE5A",
    grey: "#D6D6D6",
    greyLight: "#EEEEEE",
    bar: "#F4F4F4",
    muted: "#777777",
    // Pending steps / disabled tiles: flattened (opaque) instead of 40 % opacity.
    pending: "#B9BCC4",
    white: "#FFFFFF",
  },
  font: {
    caption: inter.fontFamily,
    heading: interTight.fontFamily,
    label: spaceGrotesk.fontFamily,
    mono: spaceMono.fontFamily,
    hand: hand.fontFamily,
    pixel: pixel.fontFamily,
    serif: serif.fontFamily,
  },
  // Sizes for the vertical 1080×1920 canvas (Santiago @720 × 1.5). Horizontal uses the same pixel
  // sizes (both canvases are 1080 on the short side).
  weight: { heading: 700 },
  size: {
    heading: 110,
    label: 64,
    hand: 70,
    caption: 54,
    captionSplit: 63,
    behindHead: 170,
    kicker: 72,
    number: 170,
  },
  board: { dotRadius: 2.5, spacing: 64 },
  ui: { border: 4, hardShadow: 9, shadowColor: "#D6D6D6" },
  // Frame timings at 30 fps (ANALISIS.md §6.5 / §11).
  timing: {
    charsPerFrame: 1, // TypeOn heading: 1 character per frame
    blockFade: 5, // heading block opacity 0.5 → 1
    noteFade: 4, // hand note fade
    headingAfterNote: 3, // heading starts 3 f after the note
    iconDrop: 4, // icon fade + 10 px drop
    iconDropPx: 10,
    sibling: 10, // sibling icons every 8–12 f
    secondary: 12, // rays / check +12 f after the icon
    cellsPerFrame: 1, // waffle / stepper fill
    caretBlink: 15,
    punch: 1.15, // A-roll punch-in on emphasis cuts (hard, never animated)
  },
  ease: {
    out: Easing.bezier(0.33, 1, 0.68, 1), // easeOutCubic
  },
  // Sound map — from media/soyluisart/audio/GUIA-EFECTOS.md (default map per element type).
  // `pre` = the file's measured hit frame: the file starts `pre` frames before the visual event so
  // its hit lands on it ("golpe inmediato" files = 1 f). Typing beds start on the first character
  // (pre 0) and are cut on the last one. No whooshes on elements (only video start / transitions).
  sfx: {
    type: { file: "soyluisart/audio/efectos/typing/typing-mechanical-run-01.wav", volume: 0.25, pre: 0 }, // TypeOn, prompts, bubbles
    typeShort: { file: "soyluisart/audio/efectos/typing/typing-key-presses-short-02.wav", volume: 0.3, pre: 0 }, // short typed word
    key: { file: "soyluisart/audio/efectos/typing/typing-mechanical-key-single-01.wav", volume: 0.3, pre: 1 }, // behind-head word on the cut
    click: { file: "soyluisart/audio/efectos/ui/ui-click-mouse-01.wav", volume: 0.3, pre: 1 }, // chips, step change, toggle, waffle start
    tap: { file: "soyluisart/audio/efectos/ui/ui-click-mouse-02.wav", volume: 0.25, pre: 1 }, // soft selector hops
    pop: { file: "soyluisart/audio/efectos/pop/pop-soft-01.wav", volume: 0.3, pre: 1 }, // pixel icons, tiles, tags
    ding: { file: "soyluisart/audio/efectos/notification/notification-ding-keyword-01.wav", volume: 0.3, pre: 1 }, // results
    bell: { file: "soyluisart/audio/efectos/notification/notification-bell-ding-01.wav", volume: 0.3, pre: 0 }, // CTA appears
    stamp: { file: "soyluisart/audio/efectos/misc/misc-stamp-01.wav", volume: 0.35, pre: 1 }, // stamps
    coin: { file: "soyluisart/audio/efectos/money/money-coins-clink-01.wav", volume: 0.3, pre: 2 },
    error: { file: "soyluisart/audio/efectos/reaction/reaction-error-buzzer-01.wav", volume: 0.25, pre: 1 },
    bleep: { file: "soyluisart/audio/efectos/data/data-bleep-01.wav", volume: 0.3, pre: 1 }, // number settles
    kaching: { file: "soyluisart/audio/efectos/money/money-cash-register-kaching-01.wav", volume: 0.3, pre: 5 }, // winning price / money result
    bagDrop: { file: "soyluisart/audio/efectos/money/money-bag-drop-01.wav", volume: 0.3, pre: 1 }, // money stack lands
    chime: { file: "soyluisart/audio/efectos/reaction/reaction-success-chime-01.wav", volume: 0.3, pre: 10 }, // checklist complete
    thud: { file: "soyluisart/audio/efectos/impact/impact-thud-01.wav", volume: 0.3, pre: 1 }, // FALSO stamp / heavy land
    minimal: { file: "soyluisart/audio/efectos/pop/pop-minimal-01.wav", volume: 0.3, pre: 1 }, // timeline point, chart marker
    // New library categories (marker, paper, counter, correct-wrong, clock, camera, bubble). These
    // files peak ~3 dB lower than the older ones; volumes follow sfx-index.json (already ≈ +3 dB).
    marker: { file: "soyluisart/audio/efectos/marker/marker-pen-line-01.wav", volume: 0.4, pre: 1 }, // marker stroke starts (circle, arrow, underline, tick, rule)
    strike: { file: "soyluisart/audio/efectos/marker/marker-chalk-line-01.wav", volume: 0.35, pre: 1 }, // strike-through / cross-out
    markerWrite: { file: "soyluisart/audio/efectos/marker/marker-whiteboard-write-02.wav", volume: 0.3, pre: 0 }, // bed under a long line being drawn (timeline)
    highlight: { file: "soyluisart/audio/efectos/marker/marker-highlighter-01.wav", volume: 0.35, pre: 0 }, // bed under a highlighter sweep
    note: { file: "soyluisart/audio/efectos/paper/paper-slap-drop-01.wav", volume: 0.4, pre: 4 }, // sticky note / price tag lands
    paper: { file: "soyluisart/audio/efectos/paper/paper-quick-move-01.wav", volume: 0.35, pre: 5 }, // press clipping slides in
    counter: { file: "soyluisart/audio/efectos/counter/counter-score-casino-01.wav", volume: 0.3, pre: 0 }, // count-up bed
    countMoney: { file: "soyluisart/audio/efectos/counter/counter-banknote-02.wav", volume: 0.3, pre: 0 }, // money stack counting bed
    wrong: { file: "soyluisart/audio/efectos/correct-wrong/wrong-buzz-02.wav", volume: 0.3, pre: 1 }, // FALSO / myth
    correct: { file: "soyluisart/audio/efectos/correct-wrong/correct-notification-01.wav", volume: 0.35, pre: 1 }, // REALIDAD / true fact
    tick: { file: "soyluisart/audio/efectos/clock/clock-tick-single-01.wav", volume: 0.4, pre: 2 }, // timeline point (a step in time)
    shutter: { file: "soyluisart/audio/efectos/camera/camera-shutter-vintage-02.wav", volume: 0.4, pre: 3 }, // polaroids
    snap: { file: "soyluisart/audio/efectos/camera/camera-shutter-hard-01.wav", volume: 0.4, pre: 1 }, // screenshot lands
    bubble: { file: "soyluisart/audio/efectos/bubble/bubble-pop-03.wav", volume: 0.4, pre: 1 }, // thought / chat bubble
    whoosh: { file: "soyluisart/audio/efectos/whoosh/whoosh-air-fast-04.wav", volume: 0.35, pre: 12 }, // transitions only
  },
} as const;

export type SfxKind = keyof typeof piz.sfx;
