import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { Sfx, usePushOut } from "./kit";

export { usePushOut };

// The channel's transition kit (CHANNEL.md → Transitions). Section changes use the white flash
// (Mirko style, chosen by the user): the frame goes to light grey, then white, then the white
// fades away to reveal the next shot.

const { color, transition } = theme;

/** Frames of the white flash: rise through grey to white, hold, then fade out. */
export const whiteFlashTiming = (() => {
  const rise = Math.ceil(transition.whiteFlashFrames / 2); // grey → white
  const hold = 3;
  const fall = transition.whiteFlashFrames; // white → next shot
  return { rise, hold, fall, total: rise + hold + fall };
})();

/** White level (0..1) and tint over the flash, frame f in [0, total). */
const flashAt = (f: number) => {
  const { rise, hold, total } = whiteFlashTiming;
  const opacity = interpolate(f, [0, 1, rise, rise + hold, total], [0.9, 0.96, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const tint = f < rise ? interpolate(f, [0, rise], [0, 1]) : 1; // 0 = grey, 1 = white
  return { opacity, tint };
};

const FlashLayer: React.FC<{ f: number }> = ({ f }) => {
  const { opacity, tint } = flashAt(f);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      <AbsoluteFill style={{ background: color.flashGrey }} />
      <AbsoluteFill style={{ background: color.flashWhite, opacity: tint }} />
    </AbsoluteFill>
  );
};

/**
 * White flash as an overlay. Place it over a cut (e.g. `<TransitionSeries.Overlay
 * durationInFrames={whiteFlashTiming.total}>`): the cut lands while the frame is fully white.
 */
export const WhiteFlash: React.FC<{ sfx?: boolean }> = ({ sfx = true }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {sfx ? <Sfx kind="whoosh" at={0} /> : null}
      <FlashLayer f={frame} />
    </AbsoluteFill>
  );
};

/** Offset for `<TransitionSeries.Overlay offset>` so the cut falls in the middle of the white hold. */
// TransitionSeries centres an overlay on the cut (it starts at cut - total/2 + offset).
export const whiteFlashOverlayOffset = (() => {
  const { rise, total } = whiteFlashTiming;
  const cutLocal = rise + 1; // second frame of the white hold
  return Math.round(total / 2 - cutLocal);
})();

// --- @remotion/transitions presentation --------------------------------------------------
// For a <TransitionSeries.Transition>: both scenes overlap for whiteFlashTiming.total frames.
// (No sound here; add <Sfx kind="whoosh"/> in the scene if needed.)

type WhiteFlashProps = Record<string, never>;

const WhiteFlashPresentation: React.FC<TransitionPresentationComponentProps<WhiteFlashProps>> = ({
  children,
  presentationDirection,
  presentationProgress,
  presentationDurationInFrames,
}) => {
  const f = presentationProgress * (presentationDurationInFrames - 1);
  const { rise, hold } = whiteFlashTiming;
  const cut = rise + Math.floor(hold / 2);
  const entering = presentationDirection === "entering";
  const visible = entering ? f >= cut : f < cut;
  return (
    <AbsoluteFill style={{ opacity: visible ? 1 : 0 }}>
      {children}
      {visible ? <FlashLayer f={f} /> : null}
    </AbsoluteFill>
  );
};

export const whiteFlash = (): TransitionPresentation<WhiteFlashProps> => ({
  component: WhiteFlashPresentation,
  props: {},
});

// --- Push-out ----------------------------------------------------------------------------

/** Quick push-out exit for any content: it pushes toward the camera and fades. */
export const PushOut: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const out = usePushOut();
  return <AbsoluteFill style={{ scale: String(1 + out * 0.35), opacity: 1 - out }}>{children}</AbsoluteFill>;
};

// --- End dip ------------------------------------------------------------------------------

/** Fade to black over the last `frames` of the enclosing Sequence. */
export const EndDip: React.FC<{ frames?: number }> = ({ frames = transition.endDipFrames }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: color.black,
        opacity: interpolate(frame, [durationInFrames - frames, durationInFrames - 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.quad),
        }),
      }}
    />
  );
};
