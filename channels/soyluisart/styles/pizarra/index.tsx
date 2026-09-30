import { Composition, Folder } from "remotion";
import { z } from "zod";
import { FORMATS, FormatName } from "../shared/formats";
import { FontAB } from "./FontAB";
import { IconSheet } from "./IconSheet";
import { BaseProps, Variant } from "./primitives";
import { BoardTitle, boardTitleSchema, boardTitleVariants } from "./BoardTitle";
import { BoardCompare, boardCompareSchema, boardCompareVariants } from "./BoardCompare";
import { Waffle, waffleSchema, waffleVariants } from "./Waffle";
import { Stepper, stepperSchema, stepperVariants } from "./Stepper";
import { RetroWindowScene, retroWindowSchema, retroWindowVariants } from "./RetroWindowScene";
import { LogoRow, logoRowSchema, logoRowVariants } from "./LogoRow";
import { Clippings, clippingsSchema, clippingsVariants } from "./Clippings";
import { Polaroids, polaroidsSchema, polaroidsVariants } from "./Polaroids";
import { StickDialogue, stickDialogueSchema, stickDialogueVariants } from "./StickDialogue";
import { CtaFollow, ctaFollowSchema, ctaFollowVariants } from "./CtaFollow";
import { BehindHeadWord, behindHeadWordSchema, behindHeadWordVariants } from "./BehindHeadWord";
import { Captions, captionsSchema, captionsVariants } from "./Captions";
import { SpeakerCard, speakerCardSchema, speakerCardVariants } from "./SpeakerCard";
import { Split50, split50Schema, split50Variants } from "./Split50";
import { PunchInDemo, punchInSchema, punchInVariants } from "./PunchIn";
// Second batch (2026-09-27): marker annotations, notes, counters, charts, money.
import { Annotate, annotateSchema, annotateVariants } from "./Annotate";
import { StickyNotes, stickyNotesSchema, stickyNotesVariants } from "./StickyNotes";
import { Counter, counterSchema, counterVariants } from "./Counter";
import { HandChart, handChartSchema, handChartVariants } from "./HandChart";
import { Calculator, calculatorSchema, calculatorVariants } from "./Calculator";
import { MindMap, mindMapSchema, mindMapVariants } from "./MindMap";
import { Checklist, checklistSchema, checklistVariants } from "./Checklist";
import { MythFact, mythFactSchema, mythFactVariants } from "./MythFact";
import { Timeline, timelineSchema, timelineVariants } from "./Timeline";
import { QuoteCard, quoteCardSchema, quoteCardVariants } from "./QuoteCard";
import { PriceTag, priceTagSchema, priceTagVariants } from "./PriceTag";
import { MoneyStack, moneyStackSchema, moneyStackVariants } from "./MoneyStack";
import { BitReact, bitReactSchema, bitReactVariants } from "./BitReact";
import { Mascot, mascotSchema, mascotVariants } from "./Mascot";
import { Candles, candlesSchema, candlesVariants } from "./Candles";
import { Ticker, tickerSchema, tickerVariants } from "./Ticker";
import { Donut, donutSchema, donutVariants } from "./Donut";
import { Gauge, gaugeSchema, gaugeVariants } from "./Gauge";
import { Formula, formulaSchema, formulaVariants } from "./Formula";
import { ExamQuestion, examQuestionSchema, examQuestionVariants } from "./ExamQuestion";
import { CurveChart, curveChartSchema, curveChartVariants } from "./CurveChart";
import { Snowball, snowballSchema, snowballVariants } from "./Snowball";
import { Funnel, funnelSchema, funnelVariants } from "./Funnel";
import { Flywheel, flywheelSchema, flywheelVariants } from "./Flywheel";
import { Pyramid, pyramidSchema, pyramidVariants } from "./Pyramid";
import { Venn, vennSchema, vennVariants } from "./Venn";
import { FlowChain, flowChainSchema, flowChainVariants } from "./FlowChain";
import { Matrix2x2, matrix2x2Schema, matrix2x2Variants } from "./Matrix2x2";
import { Scale, scaleSchema, scaleVariants } from "./Scale";
import { ScreenshotFrame, screenshotFrameSchema, screenshotFrameVariants } from "./ScreenshotFrame";
import { Highlighter, highlighterSchema, highlighterVariants } from "./Highlighter";

// Pizarra style library (2026-09-27): every element × variant. Vertical 1080×1920 is primary
// (SLA-piz-<element>-<variant>-v); horizontal 1920×1080 (SLA-piz-<element>-<variant>) where the
// variant is marked `horizontal`. See README.md in this folder.

function variantsOf<S extends z.ZodType<BaseProps>>(
  format: FormatName,
  element: string,
  component: React.FC<z.infer<S>>,
  schema: S,
  variants: Variant<z.infer<S>>[],
) {
  const { width, height, fps } = FORMATS[format];
  const suffix = format === "vertical" ? "-v" : "";
  const list = format === "vertical" ? variants : variants.filter((v) => v.horizontal);
  if (list.length === 0) return null;
  return (
    <Folder name={`${element}${suffix}`}>
      {list.map((v) => (
        <Composition
          key={v.id}
          id={`SLA-piz-${element}-${v.id}${suffix}`}
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
    {variantsOf(format, "board-title", BoardTitle, boardTitleSchema, boardTitleVariants)}
    {variantsOf(format, "board-compare", BoardCompare, boardCompareSchema, boardCompareVariants)}
    {variantsOf(format, "waffle", Waffle, waffleSchema, waffleVariants)}
    {variantsOf(format, "stepper", Stepper, stepperSchema, stepperVariants)}
    {variantsOf(format, "retro-window", RetroWindowScene, retroWindowSchema, retroWindowVariants)}
    {variantsOf(format, "logo-row", LogoRow, logoRowSchema, logoRowVariants)}
    {variantsOf(format, "clippings", Clippings, clippingsSchema, clippingsVariants)}
    {variantsOf(format, "polaroids", Polaroids, polaroidsSchema, polaroidsVariants)}
    {variantsOf(format, "stick-dialogue", StickDialogue, stickDialogueSchema, stickDialogueVariants)}
    {variantsOf(format, "cta-follow", CtaFollow, ctaFollowSchema, ctaFollowVariants)}
    {variantsOf(format, "behind-head-word", BehindHeadWord, behindHeadWordSchema, behindHeadWordVariants)}
    {variantsOf(format, "captions", Captions, captionsSchema, captionsVariants)}
    {variantsOf(format, "speaker-card", SpeakerCard, speakerCardSchema, speakerCardVariants)}
    {variantsOf(format, "split-50", Split50, split50Schema, split50Variants)}
    {variantsOf(format, "punch-in", PunchInDemo, punchInSchema, punchInVariants)}
    {variantsOf(format, "annotate", Annotate, annotateSchema, annotateVariants)}
    {variantsOf(format, "sticky-notes", StickyNotes, stickyNotesSchema, stickyNotesVariants)}
    {variantsOf(format, "counter", Counter, counterSchema, counterVariants)}
    {variantsOf(format, "hand-chart", HandChart, handChartSchema, handChartVariants)}
    {variantsOf(format, "calculator", Calculator, calculatorSchema, calculatorVariants)}
    {variantsOf(format, "mind-map", MindMap, mindMapSchema, mindMapVariants)}
    {variantsOf(format, "checklist", Checklist, checklistSchema, checklistVariants)}
    {variantsOf(format, "myth-fact", MythFact, mythFactSchema, mythFactVariants)}
    {variantsOf(format, "timeline", Timeline, timelineSchema, timelineVariants)}
    {variantsOf(format, "quote-card", QuoteCard, quoteCardSchema, quoteCardVariants)}
    {variantsOf(format, "price-tag", PriceTag, priceTagSchema, priceTagVariants)}
    {variantsOf(format, "money-stack", MoneyStack, moneyStackSchema, moneyStackVariants)}
    {variantsOf(format, "bit-react", BitReact, bitReactSchema, bitReactVariants)}
    {variantsOf(format, "mascot", Mascot, mascotSchema, mascotVariants)}
    {variantsOf(format, "candles", Candles, candlesSchema, candlesVariants)}
    {variantsOf(format, "ticker", Ticker, tickerSchema, tickerVariants)}
    {variantsOf(format, "donut", Donut, donutSchema, donutVariants)}
    {variantsOf(format, "gauge", Gauge, gaugeSchema, gaugeVariants)}
    {variantsOf(format, "formula", Formula, formulaSchema, formulaVariants)}
    {variantsOf(format, "exam-question", ExamQuestion, examQuestionSchema, examQuestionVariants)}
    {variantsOf(format, "curve", CurveChart, curveChartSchema, curveChartVariants)}
    {variantsOf(format, "snowball", Snowball, snowballSchema, snowballVariants)}
    {variantsOf(format, "funnel", Funnel, funnelSchema, funnelVariants)}
    {variantsOf(format, "flywheel", Flywheel, flywheelSchema, flywheelVariants)}
    {variantsOf(format, "pyramid", Pyramid, pyramidSchema, pyramidVariants)}
    {variantsOf(format, "venn", Venn, vennSchema, vennVariants)}
    {variantsOf(format, "flow", FlowChain, flowChainSchema, flowChainVariants)}
    {variantsOf(format, "matrix", Matrix2x2, matrix2x2Schema, matrix2x2Variants)}
    {variantsOf(format, "scale", Scale, scaleSchema, scaleVariants)}
    {variantsOf(format, "screenshot", ScreenshotFrame, screenshotFrameSchema, screenshotFrameVariants)}
    {variantsOf(format, "highlighter", Highlighter, highlighterSchema, highlighterVariants)}
  </>
);

export const PizarraLibrary: React.FC = () => (
  <Folder name="luisart">
    {all("vertical")}
    <Folder name="horizontal">{all("horizontal")}</Folder>
    <Folder name="reference">
      <Composition id="SLA-piz-font-ab" component={FontAB} width={1500} height={2100} fps={30} durationInFrames={1} />
      <Composition id="SLA-piz-icon-sheet" component={IconSheet} width={1920} height={2300} fps={30} durationInFrames={1} />
    </Folder>
  </Folder>
);
