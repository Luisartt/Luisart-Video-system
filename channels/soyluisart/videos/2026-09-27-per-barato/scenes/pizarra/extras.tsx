import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Bit, Drop, PixelIcon } from "../../../../styles/pizarra/primitives";
import { piz } from "../../../../styles/pizarra/theme";
import { CutClip } from "../parts";
import { PixelBookmark } from "./icons";
import { T, W } from "./layout";
import { Marker, curvedArrow } from "./Marker";
import { Float, progress } from "./motion";

// Pieces shared by the full-board and the split-screen Pizarra edits.

/** "Aquí te explico por qué": three "?" cards around the head, every 8 frames, then floating. */
export const QuestionCards: React.FC<{ horizontal?: boolean }> = ({ horizontal = false }) => {
  const frame = useCurrentFrame();
  if (frame < T.aqui || frame >= T.todo) return null;
  const spots = horizontal
    ? [
        { x: 470, y: 330 },
        { x: 1350, y: 300 },
        { x: 500, y: 560 },
      ]
    : [
        { x: 136, y: 640 },
        { x: 812, y: 600 },
        { x: 150, y: 840 }, // stays inside the graphics zone (≤ y 970)
      ];
  return (
    <AbsoluteFill>
      {spots.map((s, i) => (
        <div key={i} style={{ position: "absolute", left: s.x, top: s.y }}>
          <Drop at={T.aqui + i * 8}>
            <Float px={5} period={30} phase={i * 10}>
              <PixelIcon name="question" px={8} />
            </Float>
          </Drop>
        </div>
      ))}
    </AbsoluteFill>
  );
};

/** CTA: an arrow draws from ESTO to a pixel bookmark that drops on "esto" and fills blue on
 *  "vas"; Bit pops up under it. */
export const SaveCta: React.FC<{ horizontal?: boolean }> = ({ horizontal = false }) => {
  const frame = useCurrentFrame();
  if (frame < T.guarda) return null;
  // Horizontal: the sheet is 1080×1920 for the marker; positions are mapped onto the 1920×1080 frame.
  const H = horizontal;
  const book = H ? { x: 470, y: 420 } : { x: 150, y: 646 };
  const bit = H ? { x: 450, y: 600 } : { x: 128, y: 818 };
  return (
    <AbsoluteFill>
      {H ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: "scale(0.5625)", transformOrigin: "0 0" }}>
          <Marker d={curvedArrow(1340, 700, 1050, 764, "cta-h", 0.3, 40)} at={W.esto + 2} frames={8} color={piz.color.accent} width={14} />
        </div>
      ) : (
        <Marker d={curvedArrow(350, 520, 236, 632, "cta", 0.3, 26)} at={W.esto + 2} frames={8} color={piz.color.accent} width={9} />
      )}
      <div style={{ position: "absolute", left: book.x, top: book.y }}>
        <Drop at={W.esto + 6}>
          <Float px={4} period={32}>
            <PixelBookmark px={9} filled={frame >= W.vas} />
          </Float>
        </Drop>
      </div>
      <div style={{ position: "absolute", left: bit.x, top: bit.y }}>
        <Drop at={W.vas + 10}>
          <Bit px={7} expression="happy" shadow={false} />
        </Drop>
      </div>
    </AbsoluteFill>
  );
};

/** Scale of a face shot at a frame: 115 % punch on punched shots × slow push-in (+3.5 %). */
export const faceShotScale = (frame: number, seg: { from: number; to: number; punch: boolean } | null) =>
  seg ? (seg.punch ? piz.timing.punch : 1) * (1 + 0.035 * progress(frame, seg.from, seg.to)) : 1;
/** Origin of that scale (the A-roll's head area). */
export const FACE_ORIGIN: [number, number] = [540, 1920 * 0.38];

/**
 * A-roll or matte (the cut applied through CutClip) under one transform: 115 % punch-in on a
 * punched segment (hard, on the cut) × a slow push-in over the segment (+3.5 %), so the face shot
 * is never static. `windows` = cut-frame ranges where the clip is decoded.
 */
export const FaceClip: React.FC<{
  src: string;
  transparent?: boolean;
  windows: readonly (readonly [number, number])[];
  segAt: (frame: number) => { from: number; to: number; punch: boolean } | null;
  name: string;
  zoomAt?: (frame: number) => number; // < 1 = reframe so a caption clears the face
}> = ({ src, transparent, windows, segAt, name, zoomAt }) => {
  const frame = useCurrentFrame();
  const seg = segAt(frame);
  const s = faceShotScale(frame, seg) * (zoomAt ? zoomAt(frame) : 1);
  return (
    <AbsoluteFill style={{ transform: `scale(${s.toFixed(4)})`, transformOrigin: `${FACE_ORIGIN[0]}px ${FACE_ORIGIN[1]}px` }}>
      {windows.map(([a, b], i) => (
        <CutClip key={i} name={`${name} ${i + 1}`} src={src} transparent={transparent} from={a} to={b} />
      ))}
    </AbsoluteFill>
  );
};
