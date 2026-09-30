import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { ARollVideo, Stage, TEST_AROLL, Variant, base, baseSchema } from "./primitives";
import { piz } from "./theme";

// Punch-in helper: the A-roll jumps between 100 % and ~115 % ON A CUT — never an animated zoom.
// Wrap any A-roll segment in <PunchIn on> for the tighter framing (use it on turns, questions and
// numbers, alternating every 1–2 A-roll segments). `punchAt(t, cuts)` tells whether time t falls in
// a punched segment for a list of cut times (segments alternate 100 → 115 → 100 …).

export const PunchIn: React.FC<{ on: boolean; originY?: number; children: React.ReactNode }> = ({ on, originY = 38, children }) => (
  <AbsoluteFill style={{ transform: on ? `scale(${piz.timing.punch})` : undefined, transformOrigin: `50% ${originY}%` }}>{children}</AbsoluteFill>
);

export const punchAt = (t: number, cuts: number[]) => cuts.filter((c) => t >= c).length % 2 === 1;

export const punchInSchema = baseSchema.extend({
  aroll: z.string(),
  cuts: z.array(z.number()).describe("Seconds of each cut; segments alternate 100 % / 115 %"),
});
type Props = z.infer<typeof punchInSchema>;

export const PunchInDemo: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage backing="transparent" safeGuide={p.safeGuide}>
      <PunchIn on={punchAt(frame / fps, p.cuts)}>
        <ARollVideo src={p.aroll} />
      </PunchIn>
    </Stage>
  );
};

export const punchInVariants: Variant<Props>[] = [{ id: "demo", props: { ...base("aroll", 4), sfx: false, aroll: TEST_AROLL, cuts: [1, 2, 3] } }];
