import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { baseSchema, clamp, DocFrame, Variant, DSfx } from "./primitives";
import { doc } from "./theme";

// Full-frame opaque transitions to lay over a cut in the editor.
// flash: the prototype's bone flash cut. Over green it is a hard 4-frame solid bone flash (a ramp
//        would mix with the green); with backing = transparent it keeps the prototype's ramp.
// wipe:  a solid panel with an amber leading edge crosses the frame, covers it for a beat, and
//        leaves on the other side. Put your cut on the "at" frame (the fully covered moment).

export const transitionSchema = baseSchema.extend({
  kind: z.enum(["flash", "wipe"]),
  at: z.number().int().min(8).max(200).describe("Frame of the peak / fully-covered moment (put the cut here)"),
  panel: z.enum(["charcoal", "bone", "amber", "red"]).describe("Wipe panel colour"),
  direction: z.enum(["left-to-right", "right-to-left"]),
});
export type TransitionProps = z.infer<typeof transitionSchema>;

export const Transition: React.FC<TransitionProps> = ({ backing, preview, safeGuide, sfx, kind, at, panel, direction }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const { color } = doc;
  let layer: React.ReactNode = null;
  const sound =
    kind === "flash" ? (
      <>
        <DSfx kind="whooshFlash" at={at} on={sfx} />
        <DSfx kind="cameraFlash" at={at} on={sfx} />
      </>
    ) : (
      <DSfx kind={panel === "amber" ? "swipe" : "sweep"} at={at} on={sfx} />
    );
  if (kind === "flash") {
    if (backing === "transparent" || backing === "style") {
      const o = interpolate(frame - at, [-2, -1, 0, 1, 2, 4], [0, 0.35, 0.8, 0.8, 0.4, 0], clamp);
      layer = o > 0 ? <AbsoluteFill style={{ background: color.bone, opacity: o, mixBlendMode: backing === "style" ? "screen" : undefined }} /> : null;
    } else {
      layer = frame >= at - 1 && frame <= at + 2 ? <AbsoluteFill style={{ background: color.bone }} /> : null;
    }
  } else {
    const W = width;
    const edge = 30;
    const cIn = interpolate(frame, [at - 8, at], [0, 1], { ...clamp, easing: doc.ease.land });
    const cOut = interpolate(frame, [at + 2, at + 10], [0, 1], { ...clamp, easing: doc.ease.leave });
    // Panel left edge position (for left-to-right): from -W-edge (off left) to 0, then to W+edge.
    const x = frame <= at + 2 ? interpolate(cIn, [0, 1], [-W - edge, 0]) : interpolate(cOut, [0, 1], [0, W + edge]);
    const fill = { charcoal: color.charcoal, bone: color.bone, amber: color.amber, red: color.red }[panel];
    const edgeColour = panel === "amber" ? color.charcoal : color.amber;
    const flip = direction === "right-to-left";
    const visible = frame >= at - 8 && frame <= at + 10;
    layer = visible ? (
      <AbsoluteFill style={{ scale: flip ? "-1 1" : undefined }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: x, width: W, background: fill }} />
        {/* Leading edge on the way in, trailing edge on the way out. */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: frame <= at + 2 ? x + W : x - edge, width: edge, background: edgeColour }} />
      </AbsoluteFill>
    ) : null;
  }
  return (
    <DocFrame backing={backing} preview={preview} safeGuide={safeGuide} weave={false}>
      {layer}
      {sound}
    </DocFrame>
  );
};

const base = { backing: "green", preview: "c1-datacenter", safeGuide: false, sfx: true } as const;

export const transitionVariants: Variant<TransitionProps>[] = [
  { id: "flash", props: { ...base, seconds: 1.5, kind: "flash", at: 15, panel: "charcoal", direction: "left-to-right" } },
  { id: "wipe", props: { ...base, seconds: 1.5, kind: "wipe", at: 15, panel: "charcoal", direction: "left-to-right" } },
  { id: "wipe-amber", props: { ...base, seconds: 1.5, kind: "wipe", at: 15, panel: "amber", direction: "right-to-left" } },
];
