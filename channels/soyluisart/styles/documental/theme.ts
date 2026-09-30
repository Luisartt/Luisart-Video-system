import { Easing } from "remotion";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadSourceSerif } from "@remotion/google-fonts/SourceSerif4";
import { fx } from "../shared/sfx";

// "Documental" graphics standard (approved 2026-09-27, from prototypes/c/): Magnates-style chapter
// cards and logo networks + Andrei Jikh-style yellow emphasis and source footnotes.
// Values copied from prototypes/c/theme.ts; the key-safe additions are marked.
// Since 2026-09-27 (user rule) no text sits on a bar, tab, box or band: the emphasis bar became an
// accent underline stroke, the bone tab a plain kicker, the footnote box plain serif type.

const archivo = loadArchivo("normal", { weights: ["700", "800", "900"], subsets: ["latin", "latin-ext"] });
loadArchivo("italic", { weights: ["900"], subsets: ["latin", "latin-ext"] });
const serif = loadSourceSerif("normal", { weights: ["400", "600"], subsets: ["latin", "latin-ext"] });
loadSourceSerif("italic", { weights: ["400"], subsets: ["latin", "latin-ext"] });

export const doc = {
  canvas: { width: 1920, height: 1080, fps: 30 },
  color: {
    charcoal: "#111316",
    charcoalRaised: "#1A1D22",
    bone: "#E8E2D6",
    // Bone at 85 % over charcoal, flattened to an opaque colour (key-safe role lines).
    boneDim: "#CDC8BD",
    // Bone at 60 % over charcoal, flattened (footnote "Fuente:" label).
    boneMuted: "#96928A",
    amber: "#EEBB18",
    red: "#E0302F",
    cyan: "#5FD3E6",
    black: "#0A0A0B",
  },
  font: { display: archivo.fontFamily, serif: serif.fontFamily },
  grade: "saturate(0.62) contrast(1.08) brightness(0.9)",
  grain: { opacity: 0.16, frequency: 0.85 },
  weavePx: 1.5,
  ease: {
    land: Easing.bezier(0.16, 1, 0.3, 1),
    slow: Easing.bezier(0.45, 0, 0.55, 1),
    // Exits accelerate out (mirror of "land").
    leave: Easing.bezier(0.7, 0, 0.84, 0),
  },
  // Key-safe: a tight, hard, fully opaque shadow replaces the prototype's soft glows over green.
  shadow: {
    title: "0 5px 0 #0A0A0B",
    text: "0 3px 0 #0A0A0B",
    small: "0 2px 0 #0A0A0B",
  },
  safe: { x: 140, y: 110 },
  exitFrames: 8,
  // Sound map (media/soyluisart/audio/GUIA-EFECTOS.md → Documental rows). fx(file, volume, pre):
  // `pre` = the file's peak frame, so the hit lands on the visual event. Whooshes only in the
  // transition element.
  sfx: {
    click: fx("ui/ui-click-classic-02.wav", 0.35, 1), // lower third / quote / kicker lands
    boom: fx("impact/impact-cinematic-boom-01.wav", 0.3, 3), // chapter title, big number settles
    bassHit: fx("impact/impact-bass-hit-short-01.wav", 0.3, 0), // emphasis line lands
    braam: fx("impact/impact-braam-01.wav", 0.3, 14), // red emphasis / falling number
    kaching: fx("money/money-cash-register-kaching-01.wav", 0.3, 5), // money figure settles
    ticking: fx("tension/tension-ticking-counter-01.wav", 0.2, 0), // bed while a number counts
    highlighter: fx("marker/marker-highlighter-01.wav", 0.35, 0), // underline stroke sweeping in
    pop: fx("pop/pop-soft-01.wav", 0.3, 1), // logo in a network, VS label
    popMinimal: fx("pop/pop-minimal-01.wav", 0.3, 1), // timeline point
    popSharp: fx("pop/pop-sharp-01.wav", 0.25, 1), // highlighted caption word
    subBoom: fx("impact/impact-sub-boom-01.wav", 0.2, 4), // network centre "sonar"
    typewriter: fx("typing/typing-typewriter-01.wav", 0.25, 0), // bed under a typed stamp
    bell: fx("typing/typing-typewriter-bell-01.wav", 0.3, 1), // stamp finished
    whooshFlash: fx("whoosh/whoosh-fast-01.wav", 0.4, 21), // flash transition (peak on the flash)
    cameraFlash: fx("film/film-camera-flash-01.wav", 0.25, 2), // flash transition texture
    sweep: fx("transition/transition-air-sweep-04.wav", 0.3, 7), // charcoal / bone / red wipe
    swipe: fx("transition/transition-swipe-fast-01.wav", 0.3, 6), // amber wipe
  },
} as const;
