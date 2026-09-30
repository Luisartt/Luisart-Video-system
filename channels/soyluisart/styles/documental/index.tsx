import { Composition, Folder } from "remotion";
import { z } from "zod";
import { FORMATS, FormatName } from "../shared/formats";
import { baseSchema, Variant } from "./primitives";
import { PartTitle, partTitleSchema, partTitleVariants } from "./PartTitle";
import { Emphasis, emphasisSchema, emphasisVariants } from "./Emphasis";
import { BigNumber, bigNumberSchema, bigNumberVariants } from "./BigNumber";
import { LogoNetwork, logoNetworkSchema, logoNetworkVariants } from "./LogoNetwork";
import { LowerThird, lowerThirdSchema, lowerThirdVariants } from "./LowerThird";
import { Quote, quoteSchema, quoteVariants } from "./Quote";
import { Stamp, stampSchema, stampVariants } from "./Stamp";
import { Timeline, timelineSchema, timelineVariants } from "./Timeline";
import { Captions, captionsSchema, captionsVariants } from "./Captions";
import { Transition, transitionSchema, transitionVariants } from "./Transition";

// Documental style library: every element × variant, registered as green-screen compositions
// with IDs SLA-doc-<element>-<variant> (1920×1080) and SLA-doc-<element>-<variant>-v (1080×1920,
// Shorts / Reels / TikTok). The same component lays itself out for each canvas (useFormat()).
// See README.md in this folder.

type Base = z.infer<typeof baseSchema>;

function variantsOf<S extends z.ZodType<Base>>(
  format: FormatName,
  element: string,
  component: React.FC<z.infer<S>>,
  schema: S,
  variants: Variant<z.infer<S>>[],
) {
  const { width, height, fps } = FORMATS[format];
  const suffix = format === "vertical" ? "-v" : "";
  return (
    <Folder name={`${element}${suffix}`}>
      {variants.map((v) => (
        <Composition
          key={v.id}
          id={`SLA-doc-${element}-${v.id}${suffix}`}
          component={component as React.FC<Record<string, unknown>>}
          schema={schema as never}
          defaultProps={v.props as never}
          width={width}
          height={height}
          fps={fps}
          durationInFrames={Math.round(v.props.seconds * fps)}
          calculateMetadata={({ props }) => ({ durationInFrames: Math.round((props as Base).seconds * fps) })}
        />
      ))}
    </Folder>
  );
}

const all = (format: FormatName) => (
  <>
    {variantsOf(format, "part-title", PartTitle, partTitleSchema, partTitleVariants)}
    {variantsOf(format, "emphasis", Emphasis, emphasisSchema, emphasisVariants)}
    {variantsOf(format, "big-number", BigNumber, bigNumberSchema, bigNumberVariants)}
    {variantsOf(format, "logo-network", LogoNetwork, logoNetworkSchema, logoNetworkVariants)}
    {variantsOf(format, "lower-third", LowerThird, lowerThirdSchema, lowerThirdVariants)}
    {variantsOf(format, "quote", Quote, quoteSchema, quoteVariants)}
    {variantsOf(format, "stamp", Stamp, stampSchema, stampVariants)}
    {variantsOf(format, "timeline", Timeline, timelineSchema, timelineVariants)}
    {variantsOf(format, "captions", Captions, captionsSchema, captionsVariants)}
    {variantsOf(format, "transition", Transition, transitionSchema, transitionVariants)}
  </>
);

export const DocumentalLibrary: React.FC = () => (
  <Folder name="documental">
    {all("horizontal")}
    <Folder name="vertical">{all("vertical")}</Folder>
  </Folder>
);
