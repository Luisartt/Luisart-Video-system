import { useVideoConfig } from "remotion";
import { z } from "zod";
import {
  Box,
  FaceBox,
  KbImage,
  PersonLayer,
  Placement,
  Stage,
  StudioSet,
  TEST_FACE,
  ovalAround,
  TestPerson,
  Variant,
  base,
  baseSchema,
  genImage,
  placeFace,
  useFormat,
} from "./primitives";
import { kal } from "./theme";

// kal-layout — his four layouts (ANALISIS §5 / §S.4), hard cuts only, no borders, shadows or
// rounded corners except the card:
//   split  image on top (y 0–968, cover, slow push) · the recording below on the DARK SET: the
//          person cut-out (matte) on the near-black studio with a blue practical glow, framed from
//          the face box so the face is ≈ 230 px wide and its forehead clears the seam caption
//          (y ≈ 1040). Horizontal: image left (x 0–1152), recording right.
//   face   the recording full frame on the dark set at 92 % (anchored at the bottom centre, edges
//          feathered into the set), static: no punch-ins, no push (he never zooms).
//   full   an image full frame with the slow push (kinetic type, counters).
//   card   an image in a 9:16 card (x 75–1005, y 151–1766, r 32) on black — a B-roll backdrop like
//          `full`: its SUBJECT and any text stay inside x 120–920, y 250–1436.
// Why the dark set: his look depends on a near-black studio. Our test take is a close selfie on a
// bright wall, so the split's face would either cover the seam caption or the platform UI; the
// cut-out on the set keeps the face small and clear (see README "Recording").

export type LayoutKind = "split" | "face" | "full" | "card";

/** Geometry of every layout for the current canvas. */
export const kalGeometry = (vertical: boolean) => {
  if (vertical) {
    const seam = kal.layout.seam;
    return {
      splitImage: { x: 0, y: 0, w: 1080, h: seam } as Box,
      splitRec: { x: 0, y: seam, w: 1080, h: 1920 - seam } as Box,
      splitFace: { cx: 540, protTop: kal.layout.seamCaptionY + 42, faceW: kal.frame.splitFaceW },
      seamCaption: { cx: 540, cy: kal.layout.seamCaptionY, maxW: 760 },
      full: { x: 0, y: 0, w: 1080, h: 1920 } as Box,
      card: { x: kal.layout.card.x, y: kal.layout.card.y, w: kal.layout.card.w, h: kal.layout.card.h } as Box,
      cardR: kal.layout.card.r,
      faceRec: { x: 0, y: 0, w: 1080, h: 1920 } as Box,
      facePlace: (_f: FaceBox): Placement => ({ s: kal.frame.faceScale, tx: 540 * (1 - kal.frame.faceScale), ty: 1920 * (1 - kal.frame.faceScale) }),
      faceFeather: true,
    };
  }
  const iw = kal.layout.splitH.imageW;
  return {
    splitImage: { x: 0, y: 0, w: iw, h: 1080 } as Box,
    splitRec: { x: iw, y: 0, w: 1920 - iw, h: 1080 } as Box,
    splitFace: { cx: iw + (1920 - iw) / 2, protTop: 196, faceW: 300 },
    seamCaption: { cx: iw + (1920 - iw) / 2, cy: 150, maxW: 700 },
    full: { x: 0, y: 0, w: 1920, h: 1080 } as Box,
    card: { x: 690, y: 60, w: 540, h: 960 } as Box,
    cardR: 24,
    faceRec: { x: 0, y: 0, w: 1920, h: 1080 } as Box,
    // The vertical recording as a centred full-height figure (0.5625 × the sheet), on the set.
    facePlace: (_f: FaceBox): Placement => ({ s: 0.5625, tx: 656, ty: 0 }),
    faceFeather: true,
  };
};

/** Split layout: image on top / left, the person on the dark set below / right. */
export const SplitLayout: React.FC<{
  image: string;
  from: number;
  to: number;
  dir?: "in" | "out";
  pan?: number;
  position?: string;
  place: Placement;
  face: FaceBox; // the shot's face box in source px (for the oval vignette and the backlight)
  person: React.ReactNode;
  vertical: boolean;
  imageLayer?: React.ReactNode; // overlays drawn on the image (headline, counter, kinetic)
}> = ({ image, from, to, dir, pan, position, place, face, person, vertical, imageLayer }) => {
  const g = kalGeometry(vertical);
  const o = ovalAround(face);
  return (
    <>
      <StudioSet box={g.splitRec} halo={{ x: o.cx * place.s + place.tx, y: o.cy * place.s + place.ty }} />
      <PersonLayer place={place} clip={g.splitRec} oval={o}>
        {person}
      </PersonLayer>
      <KbImage src={image} box={g.splitImage} from={from} to={to} dir={dir} pan={pan} position={position} />
      {imageLayer}
    </>
  );
};

/** Face close-up: the recording on the dark set, at 92 % from the bottom centre (vertical) or as a
 *  centred figure (horizontal), static. */
export const FaceLayout: React.FC<{ place: Placement; person: React.ReactNode; vertical: boolean }> = ({ place, person, vertical }) => {
  const g = kalGeometry(vertical);
  return (
    <>
      <StudioSet box={g.faceRec} glowSide="left" />
      <PersonLayer place={place} clip={g.faceRec} feather={g.faceFeather}>
        {person}
      </PersonLayer>
    </>
  );
};

export const FullLayout: React.FC<{ image: string; from: number; to: number; dir?: "in" | "out"; pan?: number; dim?: number; position?: string; vertical: boolean }> = ({
  image,
  from,
  to,
  dir,
  pan,
  dim,
  position,
  vertical,
}) => <KbImage src={image} box={kalGeometry(vertical).full} from={from} to={to} dir={dir} pan={pan} dim={dim} position={position} />;

export const CardLayout: React.FC<{ image: string; from: number; to: number; dir?: "in" | "out"; position?: string; vertical: boolean }> = ({ image, from, to, dir, position, vertical }) => {
  const g = kalGeometry(vertical);
  return <KbImage src={image} box={g.card} from={from} to={to} dir={dir} position={position} radius={g.cardR} />;
};

// ── Showcase element ───────────────────────────────────────────────────────────────────────────
export const layoutSchema = baseSchema.extend({
  layout: z.enum(["split", "face", "full", "card"]),
  image: z.string().describe("Image under media/ (ChatGPT still)"),
  trimFrom: z.number().min(0).describe("Seconds into the test recording"),
  set: z.enum(["dark", "footage"]).describe("dark = person cut-out on the studio set (default) · footage = the raw recording"),
  dir: z.enum(["in", "out"]),
  pan: z.number().min(-1).max(1).describe("Horizontal drift of the image -1 … 1 (× 12 px)"),
  position: z.string().describe("object-position of the image"),
});
type Props = z.infer<typeof layoutSchema>;

export const KalLayout: React.FC<Props> = (p) => {
  const { durationInFrames, fps } = useVideoConfig();
  const { isVertical } = useFormat();
  const g = kalGeometry(isVertical);
  const person = <TestPerson set={p.set} trimBefore={Math.round(p.trimFrom * fps)} />;
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      {p.layout === "split" ? (
        <SplitLayout image={p.image} from={0} to={durationInFrames} dir={p.dir} pan={p.pan} position={p.position} place={placeFace(TEST_FACE, g.splitFace)} face={TEST_FACE} person={person} vertical={isVertical} />
      ) : null}
      {p.layout === "face" ? <FaceLayout place={g.facePlace(TEST_FACE)} person={person} vertical={isVertical} /> : null}
      {p.layout === "full" ? <FullLayout image={p.image} from={0} to={durationInFrames} dir={p.dir} pan={p.pan} position={p.position} vertical={isVertical} /> : null}
      {p.layout === "card" ? <CardLayout image={p.image} from={0} to={durationInFrames} dir={p.dir} position={p.position} vertical={isVertical} /> : null}
    </Stage>
  );
};

const common: Props = { ...base("black", 4), layout: "split", image: genImage("s01-hook-llave-etiqueta"), trimFrom: 0.5, set: "dark", dir: "in", pan: 0, position: "50% 50%" };

export const layoutVariants: Variant<Props>[] = [
  { id: "split", props: common, horizontal: true },
  { id: "face", props: { ...common, layout: "face", trimFrom: 12 }, horizontal: true },
  { id: "full", props: { ...common, layout: "full", image: genImage("s06-empresa-a-modesta-rica") }, horizontal: true },
  { id: "card", props: { ...common, layout: "card", image: genImage("s08-frascos") }, horizontal: true },
];
