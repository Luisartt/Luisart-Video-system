import { Easing } from "remotion";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SchibstedGrotesk";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { fx } from "../shared/sfx";

// Terminal style tokens, taken unchanged from the approved prototype (prototypes/b/theme.ts,
// showcase SLA-proto-b-terminal). Only additions: canvas, safe margins and exit timing.

const grotesk = loadGrotesk("normal", { weights: ["600", "700", "800"], subsets: ["latin", "latin-ext"] });
const mono = loadMono("normal", { weights: ["400", "500", "700"], subsets: ["latin", "latin-ext"] });

export const term = {
  canvas: { width: 1920, height: 1080, fps: 30 },
  color: {
    bg: "#04060B",
    panel: "#070B14",
    tile: "#0A0F1C",
    tileLow: "#0C1222",
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
  // Content edge used by the prototype (inside the 5 % action-safe margin).
  margin: 128,
  // Frames of the scan-wipe exit at the end of every element.
  exitFrames: 10,
  // Sound map (media/soyluisart/audio/GUIA-EFECTOS.md → Terminal rows). fx(file, volume, pre):
  // `pre` = the file's peak frame, so the hit lands on the visual event. Whooshes: never (the scan
  // transition uses the tech slide, its own transition sound).
  sfx: {
    typeRun: fx("typing/typing-mechanical-run-01.wav", 0.25, 0), // bed under decrypted / typed headlines
    typeShort: fx("typing/typing-mechanical-short-01.wav", 0.25, 5), // bed under a short typed line
    keys: fx("typing/typing-key-presses-short-02.wav", 0.3, 0), // bed under a short decrypted word
    keyHard: fx("typing/typing-key-hard-single-03.wav", 0.35, 0), // last character lands
    clickTone: fx("ui/ui-click-tone-01.wav", 0.35, 1), // panel / lower third / card lands
    clickDigital: fx("ui/ui-click-digital-01.wav", 0.3, 1), // callout frame closes
    clickSelect: fx("ui/ui-click-select-01.wav", 0.3, 0), // compare row appears
    techSelect: fx("ui/ui-tech-select-01.wav", 0.3, 1), // keyword / logo lands
    optionSelect: fx("ui/ui-option-select-01.wav", 0.3, 1), // beams hub lights up
    checkbox: fx("ui/ui-checkbox-tick-01.wav", 0.45, 1), // checklist step ticked
    chime: fx("reaction/reaction-success-chime-01.wav", 0.3, 10), // checklist complete
    ding: fx("notification/notification-ding-keyword-01.wav", 0.3, 1), // compare: winner marked
    bleep: fx("data/data-bleep-01.wav", 0.3, 1), // number / price settles, chart value lands
    pop: fx("pop/pop-minimal-01.wav", 0.2, 1), // chart buy / sell marker
    flap: fx("ticker/ticker-split-flap-01.wav", 0.3, 0), // bed while split-flap tiles turn
    ticking: fx("tension/tension-ticking-counter-01.wav", 0.2, 0), // bed while a number counts
    progress: fx("data/data-ui-progress-01.wav", 0.2, 0), // bed while the chart draws
    loading: fx("data/data-loading-system-01.wav", 0.2, 0), // bed while the beams panel boots
    slide: fx("transition/transition-tech-slide-01.wav", 0.35, 2), // scan transition sweeps
  },
} as const;

export type TermColor = { [K in keyof typeof term.color]: string };
