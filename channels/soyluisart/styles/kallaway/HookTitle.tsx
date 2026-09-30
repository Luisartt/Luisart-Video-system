import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { upperKeepName } from "../shared/text";
import { kalGeometry, SplitLayout } from "./Layout";
import { KSfx, Stage, TEST_FACE, TestPerson, Variant, base, baseSchema, clamp, genImage, placeFace, useFormat } from "./primitives";
import { kal, wideType } from "./theme";

// kal-hook-title — the formula opening of every reel (ANALISIS §7.3 / §8): a two-line news
// headline in extended caps (Archivo 900 at 125 % width), the second line in light blue (his
// yellow/orange → our #7FA6FF), sliding in from the right with a long brake (half the way in ≈ 6 f,
// still settling at 45 f) and then drifting 0.3 px/f to the left until the cut. No plate and no
// darkened band behind it (rule d): a soft shadow only. At rest it sits inside x 120–920 (vertical)
// and inside the graphics zone; it stays on for the whole first split stretch and ends with the cut.
// "Luisart" is never uppercased (upperKeepName). Sound: one UI swipe as it enters (not a whoosh).

export type TitleLine = { text: string; tone: "white" | "key" };

/** Font size at which the longest line fits `width` (Archivo 900 wdth 125 caps ≈ 0.80 em/char). */
export const titleSize = (lines: TitleLine[], width: number, max = kal.size.headline) =>
  Math.min(max, Math.floor(width / (Math.max(...lines.map((l) => Array.from(l.text).length)) * 0.8)));

/** The headline block, right edge at `right`, vertical centre `cy`; `local` = frames since it started. */
export const HookTitleBlock: React.FC<{ lines: TitleLine[]; local: number; right: number; cy: number; width: number; align?: "right" | "center" }> = ({
  lines,
  local,
  right,
  cy,
  width,
  align = "right",
}) => {
  if (local < 0) return null;
  const t = kal.timing;
  const slide = interpolate(local, [0, t.titleSlideFrames], [t.titleSlideFrom, 0], { ...clamp, easing: kal.ease.slide });
  const drift = -t.titleDrift * Math.max(0, local - t.titleSlideFrames);
  const size = titleSize(lines, width);
  return (
    <div
      style={{
        position: "absolute",
        left: right - width,
        width,
        top: cy,
        transform: `translate(${(slide + drift).toFixed(2)}px, -50%)`,
        textAlign: align,
        whiteSpace: "nowrap",
      }}
    >
      {lines.map((l, i) => (
        <div key={i} style={{ ...wideType(size), color: l.tone === "key" ? kal.color.accentBright : kal.color.white, textShadow: kal.text.shadow }}>
          {upperKeepName(l.text)}
        </div>
      ))}
    </div>
  );
};

export const hookTitleSchema = baseSchema.extend({
  lines: z.array(z.object({ text: z.string(), tone: z.enum(["white", "key"]) })).min(1).max(2),
  startAt: z.number().min(0).describe("Seconds when it starts sliding in"),
  cy: z.number().describe("Vertical centre of the block (vertical canvas px; horizontal scales it)"),
  overImage: z.boolean().describe("Show it over the split layout with a test image (else on the backing alone)"),
});
type Props = z.infer<typeof hookTitleSchema>;

export const HookTitle: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { isVertical } = useFormat();
  const g = kalGeometry(isVertical);
  const start = Math.round(p.startAt * fps);
  // Vertical: rest inside x 120–920. Horizontal: inside the image half, right edge 60 px in.
  const right = isVertical ? 920 : g.splitImage.w - 70;
  const width = isVertical ? 780 : g.splitImage.w - 70 - 140;
  const cy = isVertical ? p.cy : Math.round((p.cy / 968) * 1080);
  const block = <HookTitleBlock lines={p.lines} local={frame - start} right={right} cy={cy} width={width} />;
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      {p.overImage ? (
        <SplitLayout
          image={genImage("s01-hook-llave-etiqueta")}
          from={0}
          to={durationInFrames}
          place={placeFace(TEST_FACE, g.splitFace)}
          face={TEST_FACE}
          person={<TestPerson set="dark" trimBefore={15} />}
          vertical={isVertical}
          imageLayer={block}
        />
      ) : (
        block
      )}
      <KSfx kind="titleSlide" at={start} on={p.sfx} />
    </Stage>
  );
};

const common: Props = {
  ...base("green", 4),
  lines: [
    { text: "¿Barata =", tone: "white" },
    { text: "buena inversión?", tone: "key" },
  ],
  startAt: 0,
  cy: 330,
  overImage: false,
};

export const hookTitleVariants: Variant<Props>[] = [
  { id: "green", props: common, horizontal: true },
  { id: "split", props: { ...common, backing: "black", overImage: true }, horizontal: true },
];
