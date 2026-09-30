import { AbsoluteFill, Audio, useCurrentFrame } from "remotion";
import { DotBoard } from "../../../../styles/pizarra/primitives";
import { piz } from "../../../../styles/pizarra/theme";
import { SafeZoneGuide } from "../../../../styles/shared/formats";
import { musicBedProps } from "../music";
import { AROLL, MATTE, VOICE } from "../parts";
import { MusicBed, SfxTrack } from "../Sound";
import { TOTAL_FRAMES } from "../timing";
import { BehindLayer } from "./Behind";
import { BoardView } from "./Boards";
import { faceAwareCaptionH } from "./captionPlace";
import { makeCaptionGate } from "./captionRule";
import { FaceClip, QuestionCards, SaveCta, faceShotScale } from "./extras";
import { KEY_GROUPS } from "./groups";
import { AROLL_WINDOWS, SEGS, segAt } from "./layout";
import { Drift } from "./motion";
import { PIZ_CUES } from "./pizCues";
import { PIZ_GRAPHICS } from "./PizShort";
import { PizCaptions, type CaptionPlacement } from "./PizCaptions";

// SLA-2026-09-27-per-barato-short-pizarra-h — the horizontal 1920×1080 deliverable of the Pizarra
// short (user rule 2026-09-27: vertical + horizontal by default). Same cut, voice, SFX, figures
// and caption rules as the vertical full-board edit.
//  • Board scenes: the dotted board full frame, the scene centred in the graphics zone
//    (y 90–790, ZONES.horizontal) — no face on a full-board scene (rule g).
//  • Face shots: the vertical recording as a centred full-height panel (x 656–1264, 0.5625 × the
//    1080×1920 sheet) on the dotted paper; key shots carry the big word behind the head, spanning
//    the graphics zone; the other face shots get captions, face-aware (neck/chest first — here the
//    chest band falls inside the caption zone y 820–970 — else above the head).

const MUSIC = musicBedProps();
export const H_PANEL = { left: 656, width: 608, scale: 0.5625 };

const MATTE_WINDOWS = KEY_GROUPS.map((g) => [g.from, g.to] as const);
const faceSeg = (frame: number) => {
  const s = segAt(frame);
  return s.kind === "aroll" ? { from: s.from, to: s.to, punch: s.punch } : null;
};

const GATE = makeCaptionGate(PIZ_GRAPHICS, TOTAL_FRAMES);
const TEST_GATE = makeCaptionGate([], TOTAL_FRAMES);
const captionLayout = (frame: number, test: boolean): (CaptionPlacement & { zoom: number }) | null => {
  const g = (test ? TEST_GATE : GATE)(frame);
  if (!g.page || !g.show) return null;
  if (segAt(frame).kind === "board") return { on: "paper", cy: 895, zoom: 1, size: 52 };
  const text = g.page.tokens.map((t) => t.text).join(" ");
  const r = faceAwareCaptionH(frame, text, faceShotScale(frame, faceSeg(frame)), H_PANEL, 52);
  return { on: "video", cy: r.cy, zoom: r.zoom, size: 52 };
};

/** The vertical recording (or its matte) in the centred panel, with the shot's punch / push-in. */
const Panel: React.FC<{ src: string; transparent?: boolean; windows: readonly (readonly [number, number])[]; name: string; zoomAt: (f: number) => number }> = ({
  src,
  transparent,
  windows,
  name,
  zoomAt,
}) => (
  <div style={{ position: "absolute", left: H_PANEL.left, top: 0, width: H_PANEL.width, height: 1080, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${H_PANEL.scale})`, transformOrigin: "0 0" }}>
      <FaceClip name={name} src={src} transparent={transparent} windows={windows} segAt={faceSeg} zoomAt={zoomAt} />
    </div>
  </div>
);

const Boards: React.FC = () => {
  const frame = useCurrentFrame();
  const seg = segAt(frame);
  if (seg.kind !== "board") return null;
  return <BoardView id={seg.board} from={seg.from} to={seg.to} horizontal />;
};

/** Paper behind the face panel, drifting slowly (the face shots are never static). */
const FacePaper: React.FC = () => {
  const frame = useCurrentFrame();
  const seg = segAt(frame);
  return (
    <Drift from={seg.from} to={seg.to} depth={0.4}>
      <DotBoard />
    </Drift>
  );
};

export const PER_PIZ_H_FRAMES = TOTAL_FRAMES;

export const PerBaratoPizarraH: React.FC<{ safeGuide?: boolean; captionTest?: boolean }> = ({ safeGuide = false, captionTest = false }) => {
  if (captionTest && !safeGuide) throw new Error("captionTest renders are check stills only: pass safeGuide: true as well");
  const zoomAt = (f: number) => captionLayout(f, captionTest)?.zoom ?? 1;
  return (
    <AbsoluteFill style={{ background: piz.color.paper }}>
      <Audio src={VOICE} name="voice (cut, 15 ms fades at the join, mastered)" />
      <FacePaper />
      <Panel name="A-roll" src={AROLL} windows={AROLL_WINDOWS} zoomAt={zoomAt} />
      <BehindLayer groups={KEY_GROUPS} layer="behind" frame="horizontal" />
      <Panel name="Cutout" src={MATTE} transparent windows={MATTE_WINDOWS} zoomAt={zoomAt} />
      <BehindLayer groups={KEY_GROUPS} layer="front" frame="horizontal" />
      <QuestionCards horizontal />
      <SaveCta horizontal />
      <Boards />
      <PizCaptions gate={captionTest ? TEST_GATE : GATE} placement={(f) => captionLayout(f, captionTest)} zone="horizontal" />
      {safeGuide ? <SafeZoneGuide /> : null}
      <SfxTrack cues={PIZ_CUES} />
      {MUSIC ? <MusicBed {...MUSIC} /> : null}
    </AbsoluteFill>
  );
};

export const PIZ_H_LAYOUT = SEGS;
