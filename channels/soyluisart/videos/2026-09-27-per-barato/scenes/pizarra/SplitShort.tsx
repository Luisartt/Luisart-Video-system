import { AbsoluteFill, Audio, useCurrentFrame } from "remotion";
import { DotBoard } from "../../../../styles/pizarra/primitives";
import { piz } from "../../../../styles/pizarra/theme";
import { SafeZoneGuide } from "../../../../styles/shared/formats";
import { musicBedProps } from "../music";
import { AROLL, CutClip, MATTE, VOICE } from "../parts";
import { MusicBed, SfxTrack } from "../Sound";
import { TOTAL_FRAMES } from "../timing";
import { BehindLayer } from "./Behind";
import { BoardView } from "./Boards";
import { faceAwareCaption } from "./captionPlace";
import { makeCaptionGate, type Window } from "./captionRule";
import { FACE_ORIGIN, SaveCta, faceShotScale } from "./extras";
import { KEY_GROUPS as GROUPS } from "./groups";
import { SPLIT_SEGS, T, splitSegAt, type SplitSeg } from "./layout";
import { progress } from "./motion";
import { SPLIT_CUES } from "./pizCues";
import { PizCaptions, type CaptionPlacement } from "./PizCaptions";

// SLA-2026-09-27-per-barato-short-split — the same cut, voice, figures and SFX rules as the
// Pizarra edit, laid out in Nick Saraev's split-screen grammar (style-refs/nick/ANALISIS.md §5.1,
// §13.4): three layouts alternating on hard cuts —
//   SPLIT: Pizarra graphic in the top band (graphics zone, y 262–790); the face in a card below
//          (x 162–918, top 1060, top corners r 120, bleeding off the bottom) with the HEAD
//          BREAKING OUT above the card (person matte aroll-person-alpha-v2). No captions: a
//          graphic is always on top (caption rule).
//   BOARD: full dotted board (content in the graphics zone y 250–970). No captions.
//   FACE:  close-up (punch 100/115 %). KEY face shots carry the big word behind the head (no
//          captions); PLAIN face shots have no word and get face-aware captions (groups.ts `key`,
//          captionPlace.ts).
// Zones (user rule 2026-09-27, styles/shared/formats.tsx → ZONES): the face (eyes→chin) must stay
// above the platform UI (y ≤ 1436) and right of nothing in the 160 px icon column. Our recording is
// a close selfie, so in the card it plays at 70 % (card 756 px wide instead of Nick's 97 %):
// eyebrows ≈ y 1100, chin ≈ y 1422, hair top ≈ y 820 (≈ 240 px out of the card). No music.

const MUSIC = musicBedProps();

const CARD = { left: 162, right: 918, top: 1060, radius: 120 };
const CARD_SCALE = (CARD.right - CARD.left) / 1080; // 0.700 — the video exactly fills the card
const FACE_SRC = { x: 600, y: 1100 }; // nose in the 1080×1920 A-roll (anchor of the push-in)
const FACE_DST = { x: CARD.left + FACE_SRC.x * CARD_SCALE, y: 1261 };

type Mode = SplitSeg["kind"];
const faceGroups = GROUPS.filter((g) => SPLIT_SEGS.some((s) => s.kind === "face" && g.from < s.to && g.to > s.from));
const windowsOf = (kinds: Mode[]) => SPLIT_SEGS.filter((s) => kinds.includes(s.kind)).map((s) => [s.from, s.to] as const);

// Every frame window with ANY graphic on screen: split (graphic always on top) and board segments,
// behind-head words on the KEY face close-ups, CTA extras. Captions only outside them: the non-key
// face close-ups (PRECIO, COMPRAR, PREGÚNTATE beats), placed face-aware.
export const SPLIT_GRAPHICS: Window[] = [
  ...SPLIT_SEGS.filter((s) => s.kind !== "face").map((s) => [s.from, s.to] as const),
  ...faceGroups.map((g) => [g.from, g.to] as const),
  [T.guarda, T.end],
];
export const SPLIT_CAPTION_GATE = makeCaptionGate(SPLIT_GRAPHICS, TOTAL_FRAMES);
const TEST_GATE = makeCaptionGate([], TOTAL_FRAMES); // check stills only (captionTest prop)

const faceSegOf = (frame: number) => {
  const s = splitSegAt(frame);
  return s.kind === "face" ? { from: s.from, to: s.to, punch: s.punch } : null;
};

/** Caption position (face-aware on face close-ups) + the reframe it may need. */
const captionLayout = (frame: number, test: boolean): (CaptionPlacement & { zoom: number }) | null => {
  const g = (test ? TEST_GATE : SPLIT_CAPTION_GATE)(frame);
  if (!g.page || !g.show) return null;
  const seg = splitSegAt(frame);
  const text = g.page.tokens.map((t) => t.text).join(" ");
  if (seg.kind === "board") return { on: "paper", cy: 1250, zoom: 1 };
  if (seg.kind === "split") {
    const s = CARD_SCALE * (1 + 0.03 * progress(frame, seg.from, seg.to));
    const r = faceAwareCaption(frame, text, { s, origin: [0, 0], shift: [FACE_DST.x - FACE_SRC.x * s, FACE_DST.y - FACE_SRC.y * s] }, 58);
    return { on: "video", cy: r.cy, zoom: 1, size: 58 };
  }
  const r = faceAwareCaption(frame, text, { s: faceShotScale(frame, faceSegOf(frame)), origin: FACE_ORIGIN });
  return { on: "video", cy: r.cy, zoom: r.zoom };
};

/** Transform of the A-roll / matte for the current layout (face: punch + push-in; split: card). */
const useClipTransform = (test: boolean): { style: React.CSSProperties; mode: Mode } => {
  const frame = useCurrentFrame();
  const seg = splitSegAt(frame);
  const p = progress(frame, seg.from, seg.to);
  if (seg.kind === "split") {
    const s = CARD_SCALE * (1 + 0.03 * p); // slow push-in around the face centre
    const tx = FACE_DST.x - FACE_SRC.x * s;
    const ty = FACE_DST.y - FACE_SRC.y * s;
    return { mode: "split", style: { transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s.toFixed(4)})`, transformOrigin: "0 0" } };
  }
  const zoom = seg.kind === "face" ? (captionLayout(frame, test)?.zoom ?? 1) : 1;
  const s = faceShotScale(frame, faceSegOf(frame)) * zoom;
  return { mode: seg.kind, style: { transform: `scale(${s.toFixed(4)})`, transformOrigin: `${FACE_ORIGIN[0]}px ${FACE_ORIGIN[1]}px` } };
};

const ARollLayer: React.FC<{ test: boolean }> = ({ test }) => {
  const { style, mode } = useClipTransform(test);
  const clip = mode === "split" ? `inset(${CARD.top}px ${1080 - CARD.right}px 0px ${CARD.left}px round ${CARD.radius}px ${CARD.radius}px 0px 0px)` : undefined;
  return (
    <AbsoluteFill style={{ clipPath: clip }}>
      <AbsoluteFill style={style}>
        {windowsOf(["split", "face"]).map(([a, b], i) => (
          <CutClip key={i} name={`A-roll ${i + 1}`} src={AROLL} from={a} to={b} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// H5 fix: the cutout starts exactly on its segment's cut (no pre-roll over the previous board).
const MATTE_WINDOWS = [...windowsOf(["split"]), ...windowsOf(["face"])];
const MatteLayer: React.FC<{ test: boolean }> = ({ test }) => {
  const { style } = useClipTransform(test);
  return (
    <AbsoluteFill style={style}>
      {MATTE_WINDOWS.map(([a, b], i) => (
        <CutClip key={i} name={`Cutout ${i + 1}`} src={MATTE} transparent from={a} to={b} />
      ))}
    </AbsoluteFill>
  );
};

/** Board graphics: full board, or the top band of a split (paper behind the whole frame). */
/** Split band: Pizarra graphic in the top band, BELOW the face card and the breaking-out head. */
const BandGraphics: React.FC = () => {
  const frame = useCurrentFrame();
  const seg = splitSegAt(frame);
  if (seg.kind !== "split") return null;
  const anchor = seg.board === "compare" ? T.donde : seg.from;
  return <BoardView id={seg.board} from={seg.from} to={seg.to} anchor={anchor} band />;
};

/** Full board: drawn ABOVE the face layers, so nothing of the face ever shows on a board scene. */
const FullBoard: React.FC = () => {
  const frame = useCurrentFrame();
  const seg = splitSegAt(frame);
  if (seg.kind !== "board") return null;
  return <BoardView id={seg.board} from={seg.from} to={seg.to} />;
};

export const PER_SPLIT_FRAMES = TOTAL_FRAMES;

export const PerBaratoSplit: React.FC<{ safeGuide?: boolean; captionTest?: boolean }> = ({ safeGuide = false, captionTest = false }) => {
  if (captionTest && !safeGuide) {
    // Forced captions are for placement check stills only, never a deliverable (Codex L5).
    throw new Error("captionTest renders are check stills only: pass safeGuide: true as well");
  }
  return (
  <AbsoluteFill style={{ background: piz.color.paper }}>
    <Audio src={VOICE} name="voice (cut, 15 ms fades at the join, mastered)" />
    <DotBoard />

    {/* Face close-ups: A-roll → words behind the head → matte → kickers / CTA extras */}
    <BandGraphics />
    <ARollLayer test={captionTest} />
    <BehindLayer groups={faceGroups} layer="behind" />
    <MatteLayer test={captionTest} />
    <BehindLayer groups={faceGroups} layer="front" />
    <SaveCta />
    <FullBoard />

    <PizCaptions gate={captionTest ? TEST_GATE : SPLIT_CAPTION_GATE} placement={(f) => captionLayout(f, captionTest)} />

    {safeGuide ? <SafeZoneGuide /> : null}

    <SfxTrack cues={SPLIT_CUES} />
    {MUSIC ? <MusicBed {...MUSIC} /> : null}
  </AbsoluteFill>
  );
};
