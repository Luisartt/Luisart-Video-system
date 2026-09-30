import { Composition, Folder } from "remotion";
import { z } from "zod";
import { FORMATS, FormatName } from "../shared/formats";
import { BaseProps, Variant } from "./primitives";
import { KalLayout, layoutSchema, layoutVariants } from "./Layout";
import { KalCaptions, captionsSchema, captionsVariants, captionsVariantsH } from "./Captions";
import { HookTitle, hookTitleSchema, hookTitleVariants } from "./HookTitle";
import { KalImage, imageSchema, imageVariants } from "./Image";
import { KalCounter, counterSchema, counterVariants } from "./Counter";
import { KalStack, stackSchema, stackVariants } from "./Stack";
import { KalWhiteType, whiteTypeSchema, whiteTypeVariants } from "./WhiteType";
import { KalKinetic, kineticSchema, kineticVariants } from "./Kinetic";

// Kallaway style library (2026-09-28): every element × variant, vertical 1080×1920
// (SLA-kal-<element>-<variant>-v) and horizontal 1920×1080 (SLA-kal-<element>-<variant>). Studio
// folder soyluisart/kallaway. Overlays render on green (#00FF00); layouts and image elements on
// black; the white screen on white. See README.md in this folder.

function variantsOf<S extends z.ZodType<BaseProps>>(
  format: FormatName,
  element: string,
  component: React.FC<z.infer<S>>,
  schema: S,
  variants: Variant<z.infer<S>>[],
  horizontalVariants?: Variant<z.infer<S>>[],
) {
  const { width, height, fps } = FORMATS[format];
  const suffix = format === "vertical" ? "-v" : "";
  const list = format === "vertical" ? variants : (horizontalVariants ?? variants).filter((v) => v.horizontal);
  if (list.length === 0) return null;
  return (
    <Folder name={`${element}${suffix}`}>
      {list.map((v) => (
        <Composition
          key={v.id}
          id={`SLA-kal-${element}-${v.id}${suffix}`}
          component={component as React.FC<Record<string, unknown>>}
          schema={schema as never}
          defaultProps={v.props as never}
          width={width}
          height={height}
          fps={fps}
          durationInFrames={Math.round(v.props.seconds * fps)}
          calculateMetadata={({ props }) => ({ durationInFrames: Math.round((props as BaseProps).seconds * fps) })}
        />
      ))}
    </Folder>
  );
}

const all = (format: FormatName) => (
  <>
    {variantsOf(format, "layout", KalLayout, layoutSchema, layoutVariants)}
    {variantsOf(format, "captions", KalCaptions, captionsSchema, captionsVariants, captionsVariantsH)}
    {variantsOf(format, "hook-title", HookTitle, hookTitleSchema, hookTitleVariants)}
    {variantsOf(format, "image", KalImage, imageSchema, imageVariants)}
    {variantsOf(format, "counter", KalCounter, counterSchema, counterVariants)}
    {variantsOf(format, "stack", KalStack, stackSchema, stackVariants)}
    {variantsOf(format, "white-type", KalWhiteType, whiteTypeSchema, whiteTypeVariants)}
    {variantsOf(format, "kinetic", KalKinetic, kineticSchema, kineticVariants)}
  </>
);

export const KallawayLibrary: React.FC = () => (
  <Folder name="kallaway">
    {all("vertical")}
    <Folder name="horizontal">{all("horizontal")}</Folder>
  </Folder>
);
