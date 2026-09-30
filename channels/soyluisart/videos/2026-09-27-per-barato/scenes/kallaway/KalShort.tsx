import { AbsoluteFill, Audio, useCurrentFrame } from "remotion";
import { FaceWord, SeamCaption } from "../../../../styles/kallaway/Captions";
import { CounterBlock } from "../../../../styles/kallaway/Counter";
import { HookTitleBlock, type TitleLine } from "../../../../styles/kallaway/HookTitle";
import { KineticLines, type KineticLine } from "../../../../styles/kallaway/Kinetic";
import { FullLayout, kalGeometry } from "../../../../styles/kallaway/Layout";
import { KbImage, PersonLayer, StudioSet, ovalAround } from "../../../../styles/kallaway/primitives";
import { StackCards, type StackCard } from "../../../../styles/kallaway/Stack";
import { kal } from "../../../../styles/kallaway/theme";
import { TypedLines, type TypedLine } from "../../../../styles/kallaway/WhiteType";
import { SafeZoneGuide } from "../../../../styles/shared/formats";
import { A, B, EXAMPLE_LABEL, money, pu } from "../figures";
import { musicBedProps } from "../music";
import { CutClip, MATTE, VOICE } from "../parts";
import { MusicBed, SfxTrack } from "../Sound";
import { TOTAL_FRAMES } from "../timing";
import { SEAM_POS, faceWordAt, seamAt } from "./captions";
import { placementOf, shotFaceOf } from "./faces";
import { KAL_CUES } from "./kalCues";
import { IMG, SEGS, T, W, segAt, segIndex, type KalSeg } from "./layout";

// SLA-2026-09-27-per-barato-short-kallaway — the same cut, voice and figures as the Pizarra edits,
// re-edited in the Kallaway style (styles/kallaway/, ANALISIS § Spec, user decisions 2026-09-28).
// Layers, bottom to top: the dark set → the person cut-out (matte, one static placement per shot) →
// the shot's visual (image with a slow push + headline / counter; kinetic type; stacked cards; the
// white typed screen) → captions (seam captions on the split, one giant word on face shots) → SFX.
// Hard cuts only; no transitions, punch-ins, marker arrows or whooshes; no music (no user file).

const G = kalGeometry(true);
const MUSIC = musicBedProps();

const TITLE: TitleLine[] = [
  { text: "¿Barata =", tone: "white" },
  { text: "buena inversión?", tone: "key" },
];
const TITLE_CY = 340; // over the dark top of both hook images, inside the graphics zone

const STACK: StackCard[] = [
  { image: IMG.llave, word: "el precio", tone: "plain", at: 0, position: "50% 62%" },
  { image: IMG.empresaA, word: "las utilidades", tone: "serif", at: 0, position: "50% 64%", dim: 0.3 },
];
const FORMULA: TypedLine[] = [
  { text: "P/U", at: 0, size: kal.size.white },
  { text: "precio ÷ utilidad", at: 0, size: 84, accent: "utilidad" },
];
const kineticA: KineticLine[] = [
  { items: [{ text: "vale", kind: "serif", at: 0 }, { text: money(A.price), kind: "figure", at: 0 }] },
  { items: [{ text: "gana", kind: "serif", at: 0 }, { text: money(A.eps), kind: "sans", at: 0 }] },
  { items: [{ text: "por acción", kind: "serif", at: 0 }] },
];
const kineticAFrames = [[T.aPrice, T.aPrice], [W.aGana, W.aEps], [W.aPor]];
const kineticB: KineticLine[] = [
  { items: [{ text: "vale", kind: "serif", at: 0 }, { text: money(B.price), kind: "figure", at: 0 }] },
  { items: [{ text: "gana", kind: "serif", at: 0 }, { text: money(B.eps), kind: "sans", at: 0 }] },
];
const kineticBFrames = [[T.bPrice, T.bPrice], [W.bGana, W.bEps]];

/** Alternate the push direction and a small pan between consecutive shots. */
const motionOf = (s: KalSeg) => {
  const i = segIndex(s);
  return { dir: (i % 2 === 0 ? "in" : "out") as "in" | "out", pan: [0, 1, -1][i % 3] };
};

/** The dark set behind the person: bottom half on split shots, full frame on face shots. */
const SetLayer: React.FC = () => {
  const s = segAt(useCurrentFrame());
  if (s.kind === "split") {
    const o = ovalAround(shotFaceOf(s));
    const p = placementOf(s);
    return <StudioSet box={G.splitRec} halo={{ x: o.cx * p.s + p.tx, y: o.cy * p.s + p.ty }} />;
  }
  if (s.kind === "face") return <StudioSet box={G.faceRec} glowSide="left" />;
  return null;
};

/** The person cut-out, one static placement per shot (root timeline: frame-locked to the voice). */
const PERSON_SEGS = SEGS.filter((s) => s.kind === "split" || s.kind === "face");
const PersonLayers: React.FC = () => (
  <>
    {PERSON_SEGS.map((s, i) => (
      <PersonLayer key={i} place={placementOf(s)} clip={s.kind === "split" ? G.splitRec : G.faceRec} feather oval={s.kind === "split" ? ovalAround(shotFaceOf(s)) : undefined}>
        <CutClip name={`person ${i + 1} (${s.kind})`} src={MATTE} transparent from={s.from} to={s.to} />
      </PersonLayer>
    ))}
  </>
);

/** The visual of the current shot. */
const Visual: React.FC = () => {
  const frame = useCurrentFrame();
  const s = segAt(frame);
  const m = motionOf(s);
  if (s.kind === "split") {
    return (
      <>
        <KbImage src={s.image} box={G.splitImage} from={s.from} to={s.to} dir={m.dir} pan={m.pan} dim={s.counter ? 0.45 : 0} position={s.position} />
        {s.title ? <HookTitleBlock lines={TITLE} local={frame} right={920} cy={TITLE_CY} width={780} /> : null}
        {s.counter ? (
          <CounterBlock
            frame={frame}
            landFrame={s.counter === "A" ? W.aPU : W.bPU}
            box={{ x: 120, y: 250, w: 800, h: 700 }}
            label={`Empresa ${s.counter} · P/U`}
            value={pu(s.counter === "A" ? A : B)}
            from={0}
            decimals={0}
            prefix=""
            suffix=""
            source={EXAMPLE_LABEL}
          />
        ) : null}
      </>
    );
  }
  if (s.kind === "full") {
    return (
      <>
        <FullLayout image={s.image} from={s.from} to={s.to} dir={m.dir} pan={m.pan} dim={0.2} position={s.position} vertical />
        <KineticLines
          lines={s.kinetic === "A" ? kineticA : kineticB}
          frames={s.kinetic === "A" ? kineticAFrames : kineticBFrames}
          frame={frame}
          box={{ x: 120, y: 250, w: 800, h: 700 }}
          source={`Empresa ${s.kinetic} · ${EXAMPLE_LABEL}`}
        />
      </>
    );
  }
  if (s.kind === "stack") {
    return (
      <>
        <StudioSet box={G.full} glowSide="left" />
        <StackCards cards={STACK} frames={[T.si, W.utilidades]} frame={frame} end={T.ahi} vertical />
      </>
    );
  }
  if (s.kind === "white") {
    return (
      <AbsoluteFill style={{ backgroundColor: kal.color.white }}>
        <TypedLines lines={FORMULA} frames={[W.multiplo, W.precioF]} frame={frame} cy={600} x={120} w={800} />
      </AbsoluteFill>
    );
  }
  return null;
};

const CaptionLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const seam = seamAt(frame);
  if (seam) return <SeamCaption text={seam.text} cx={SEAM_POS.cx} cy={SEAM_POS.cy} maxW={SEAM_POS.maxW} />;
  const w = faceWordAt(frame);
  if (w) return <FaceWord text={w.unit.text} tone={w.unit.tone} cy={w.cy} size={w.size} />;
  return null;
};

export const PER_KAL_FRAMES = TOTAL_FRAMES;

export const PerBaratoKallaway: React.FC<{ safeGuide?: boolean }> = ({ safeGuide = false }) => (
  <AbsoluteFill style={{ backgroundColor: kal.color.black }}>
    <Audio src={VOICE} name="voice (cut, 15 ms fades at the join, mastered)" />
    <SetLayer />
    <PersonLayers />
    <Visual />
    <CaptionLayer />
    {safeGuide ? <SafeZoneGuide /> : null}
    <SfxTrack cues={KAL_CUES} />
    {MUSIC ? <MusicBed {...MUSIC} /> : null}
  </AbsoluteFill>
);
