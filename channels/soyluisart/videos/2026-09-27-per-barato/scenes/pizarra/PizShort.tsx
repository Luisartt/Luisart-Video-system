import { AbsoluteFill, Audio, useCurrentFrame } from "remotion";
import { piz } from "../../../../styles/pizarra/theme";
import { SafeZoneGuide } from "../../../../styles/shared/formats";
import { musicBedProps } from "../music";
import { AROLL, MATTE, VOICE } from "../parts";
import { MusicBed, SfxTrack } from "../Sound";
import { TOTAL_FRAMES } from "../timing";
import { BehindLayer } from "./Behind";
import { BoardView } from "./Boards";
import { faceAwareCaption } from "./captionPlace";
import { makeCaptionGate, type Window } from "./captionRule";
import { FACE_ORIGIN, FaceClip, QuestionCards, SaveCta, faceShotScale } from "./extras";
import { KEY_GROUPS as GROUPS } from "./groups";
import { AROLL_WINDOWS, SEGS, T, segAt } from "./layout";
import { PIZ_CUES } from "./pizCues";
import { PizCaptions, type CaptionPlacement } from "./PizCaptions";

// SLA-2026-09-27-per-barato-short-pizarra — the same cut, voice and beats as the Terminal short,
// re-edited in the Pizarra style (Santiago Castellanos' whiteboard grammar, Luisart brand: white
// dotted board, ink + one electric blue, handwritten notes, pixel icons and Bit). Layers, bottom
// to top: A-roll (punch 100/115 % on the cuts + slow push-in) → big words → person matte →
// kickers and pixel icons → board scenes (hard cuts, drifting paper, marker arrows) → captions
// (only on pure talking-head stretches, never over the face). No plates behind text, no music.

const MUSIC = musicBedProps();

// Person matte only while a word sits behind the head (saves decoding the alpha video elsewhere).
const MATTE_WINDOWS = GROUPS.map((g) => [g.from, g.to] as const); // exactly on the cut

const faceSeg = (frame: number) => {
  const s = segAt(frame);
  return s.kind === "aroll" ? { from: s.from, to: s.to, punch: s.punch } : null;
};

// Every frame window with ANY graphic on screen (boards, behind-head words + kickers, "?" cards,
// CTA arrow/bookmark/Bit). Captions only show outside them (captionRule.ts): on the non-key face
// shots (PRECIO, COMPRAR, PREGÚNTATE beats — no big word), placed face-aware (captionPlace.ts).
export const PIZ_GRAPHICS: Window[] = [
  ...SEGS.filter((s) => s.kind === "board").map((s) => [s.from, s.to] as const),
  ...GROUPS.map((g) => [g.from, g.to] as const),
  [T.aqui, T.todo], // "?" cards
  [T.guarda, T.end], // CTA extras
];
export const PIZ_CAPTION_GATE = makeCaptionGate(PIZ_GRAPHICS, TOTAL_FRAMES);
const TEST_GATE = makeCaptionGate([], TOTAL_FRAMES); // check stills only (captionTest prop)

/** Caption position (face-aware on face shots) + the reframe it may need. */
const captionLayout = (frame: number, test: boolean): (CaptionPlacement & { zoom: number }) | null => {
  const g = (test ? TEST_GATE : PIZ_CAPTION_GATE)(frame);
  if (!g.page || !g.show) return null;
  const seg = segAt(frame);
  if (seg.kind === "board") return { on: "paper", cy: 1250, zoom: 1 };
  const text = g.page.tokens.map((t) => t.text).join(" ");
  const r = faceAwareCaption(frame, text, { s: faceShotScale(frame, faceSeg(frame)), origin: FACE_ORIGIN });
  return { on: "video", cy: r.cy, zoom: r.zoom };
};

const Boards: React.FC = () => {
  const frame = useCurrentFrame();
  const seg = segAt(frame);
  if (seg.kind !== "board") return null;
  return <BoardView id={seg.board} from={seg.from} to={seg.to} />;
};

export const PER_PIZ_FRAMES = TOTAL_FRAMES;

export const PerBaratoPizarra: React.FC<{ safeGuide?: boolean; captionTest?: boolean }> = ({ safeGuide = false, captionTest = false }) => {
  if (captionTest && !safeGuide) {
    // Forced captions are for placement check stills only, never a deliverable (Codex L5).
    throw new Error("captionTest renders are check stills only: pass safeGuide: true as well");
  }
  const zoomAt = (f: number) => captionLayout(f, captionTest)?.zoom ?? 1;
  return (
  <AbsoluteFill style={{ background: piz.color.paper }}>
    <Audio src={VOICE} name="voice (cut, 15 ms fades at the join, mastered)" />

    <FaceClip name="A-roll" src={AROLL} windows={AROLL_WINDOWS} segAt={faceSeg} zoomAt={zoomAt} />
    <BehindLayer groups={GROUPS} layer="behind" />
    <FaceClip name="Cutout" src={MATTE} transparent windows={MATTE_WINDOWS} segAt={faceSeg} zoomAt={zoomAt} />
    <BehindLayer groups={GROUPS} layer="front" />
    <QuestionCards />
    <SaveCta />

    <Boards />
    <PizCaptions gate={captionTest ? TEST_GATE : PIZ_CAPTION_GATE} placement={(f) => captionLayout(f, captionTest)} />

    {safeGuide ? <SafeZoneGuide /> : null}

    <SfxTrack cues={PIZ_CUES} />
    {MUSIC ? <MusicBed {...MUSIC} /> : null}
  </AbsoluteFill>
  );
};

// Exposed for the BRIEF / checks.
export const PIZ_LAYOUT = SEGS;
