import { TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { LessonCard, lessonCardDefaults } from "./LessonCard";
import { StatCallout, statCalloutDefaults } from "./StatCallout";
import { EndDip, WhiteFlash, whiteFlashOverlayOffset, whiteFlashTiming } from "./Transitions";

// Showcase of the transition kit: navy scene with a LessonCard → white flash → navy scene with
// a StatCallout → end dip to black.

export const transitionsShowcaseSchema = z.object({
  sceneFrames: z.number().int().min(30),
  sfx: z.boolean(),
});

export const transitionsShowcaseDefaults = { sceneFrames: 75, sfx: true };

export const transitionsShowcaseDuration = (sceneFrames: number) => sceneFrames * 2;

export const TransitionsShowcase: React.FC<z.infer<typeof transitionsShowcaseSchema>> = ({ sceneFrames, sfx }) => (
  <AbsoluteFill>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={sceneFrames}>
        <LessonCard {...lessonCardDefaults} exit="none" sfx={sfx} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Overlay durationInFrames={whiteFlashTiming.total} offset={whiteFlashOverlayOffset}>
        <WhiteFlash sfx={sfx} />
      </TransitionSeries.Overlay>
      <TransitionSeries.Sequence durationInFrames={sceneFrames}>
        <StatCallout {...statCalloutDefaults} exit="none" sfx={sfx} />
        <EndDip />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);
