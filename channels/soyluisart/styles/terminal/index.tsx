import { Composition, Folder } from "remotion";
import { FORMATS } from "../shared/formats";
import { term } from "./theme";
import { durationFromProps } from "./primitives";
import { Title, titleSchema, titleVariants } from "./Title";
import { LowerThird, lowerThirdSchema, lowerThirdVariants } from "./LowerThird";
import { Beams, beamsSchema, beamsVariants } from "./Beams";
import { Ticker, tickerSchema, tickerVariants } from "./Ticker";
import { Chart, chartSchema, chartVariants } from "./Chart";
import { Checklist, checklistSchema, checklistVariants } from "./Checklist";
import { Callout, calloutSchema, calloutVariants, calloutVerticalRegions } from "./Callout";
import { Compare, compareSchema, compareVariants } from "./Compare";
import { Keyword, keywordSchema, keywordVariants } from "./Keyword";
import { Transition, transitionSchema, transitionVariants } from "./Transition";

// Terminal style library: every element × variant, registered as green-screen compositions
// SLA-term-<element>-<variant>. Each has zod props (editable in Studio) incl. `backing`
// (green / style / transparent) and `duration` in seconds.

const { width, height, fps } = term.canvas;
const size = { width, height, fps };
// Vertical (Shorts / Reels / TikTok): same components and props, laid out for 1080×1920.
const vsize = { width: FORMATS.vertical.width, height: FORMATS.vertical.height, fps: FORMATS.vertical.fps };
const id = (el: string, v: string) => `SLA-term-${el}-${v}`;
const frames = (s: number) => Math.round(s * fps);
const vid = (el: string, v: string) => `SLA-term-${el}-${v}-v`;

export const TerminalLibrary: React.FC = () => (
  <Folder name="terminal">
    <Folder name="title">
      {Object.entries(titleVariants).map(([v, props]) => (
        <Composition key={v} id={id("title", v)} component={Title} schema={titleSchema} defaultProps={props} {...size} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
      ))}
    </Folder>
    <Folder name="lower-third">
      {Object.entries(lowerThirdVariants).map(([v, props]) => (
        <Composition key={v} id={id("lower-third", v)} component={LowerThird} schema={lowerThirdSchema} defaultProps={props} {...size} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
      ))}
    </Folder>
    <Folder name="beams">
      {Object.entries(beamsVariants).map(([v, props]) => (
        <Composition key={v} id={id("beams", v)} component={Beams} schema={beamsSchema} defaultProps={props} {...size} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
      ))}
    </Folder>
    <Folder name="ticker">
      {Object.entries(tickerVariants).map(([v, props]) => (
        <Composition key={v} id={id("ticker", v)} component={Ticker} schema={tickerSchema} defaultProps={props} {...size} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
      ))}
    </Folder>
    <Folder name="chart">
      {Object.entries(chartVariants).map(([v, props]) => (
        <Composition key={v} id={id("chart", v)} component={Chart} schema={chartSchema} defaultProps={props} {...size} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
      ))}
    </Folder>
    <Folder name="checklist">
      {Object.entries(checklistVariants).map(([v, props]) => (
        <Composition key={v} id={id("checklist", v)} component={Checklist} schema={checklistSchema} defaultProps={props} {...size} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
      ))}
    </Folder>
    <Folder name="callout">
      {Object.entries(calloutVariants).map(([v, props]) => (
        <Composition key={v} id={id("callout", v)} component={Callout} schema={calloutSchema} defaultProps={props} {...size} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
      ))}
    </Folder>
    <Folder name="compare">
      {Object.entries(compareVariants).map(([v, props]) => (
        <Composition key={v} id={id("compare", v)} component={Compare} schema={compareSchema} defaultProps={props} {...size} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
      ))}
    </Folder>
    <Folder name="keyword">
      {Object.entries(keywordVariants).map(([v, props]) => (
        <Composition key={v} id={id("keyword", v)} component={Keyword} schema={keywordSchema} defaultProps={props} {...size} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
      ))}
    </Folder>
    <Folder name="transition">
      {Object.entries(transitionVariants).map(([v, props]) => (
        <Composition key={v} id={id("transition", v)} component={Transition} schema={transitionSchema} defaultProps={props} {...size} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
      ))}
    </Folder>
    <Folder name="vertical">
      <Folder name="title">
        {Object.entries(titleVariants).map(([v, props]) => (
          <Composition key={v} id={vid("title", v)} component={Title} schema={titleSchema} defaultProps={props} {...vsize} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
        ))}
      </Folder>
      <Folder name="lower-third">
        {Object.entries(lowerThirdVariants).map(([v, props]) => (
          <Composition key={v} id={vid("lower-third", v)} component={LowerThird} schema={lowerThirdSchema} defaultProps={props} {...vsize} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
        ))}
      </Folder>
      <Folder name="beams">
        {Object.entries(beamsVariants).map(([v, props]) => (
          <Composition key={v} id={vid("beams", v)} component={Beams} schema={beamsSchema} defaultProps={props} {...vsize} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
        ))}
      </Folder>
      <Folder name="ticker">
        {Object.entries(tickerVariants).map(([v, props]) => (
          <Composition key={v} id={vid("ticker", v)} component={Ticker} schema={tickerSchema} defaultProps={props} {...vsize} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
        ))}
      </Folder>
      <Folder name="chart">
        {Object.entries(chartVariants).map(([v, props]) => (
          <Composition key={v} id={vid("chart", v)} component={Chart} schema={chartSchema} defaultProps={props} {...vsize} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
        ))}
      </Folder>
      <Folder name="checklist">
        {Object.entries(checklistVariants).map(([v, props]) => (
          <Composition key={v} id={vid("checklist", v)} component={Checklist} schema={checklistSchema} defaultProps={props} {...vsize} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
        ))}
      </Folder>
      <Folder name="callout">
        {Object.entries(calloutVariants).map(([v, hprops]) => ({ v, props: { ...hprops, ...calloutVerticalRegions[v] } })).map(({ v, props }) => (
          <Composition key={v} id={vid("callout", v)} component={Callout} schema={calloutSchema} defaultProps={props} {...vsize} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
        ))}
      </Folder>
      <Folder name="compare">
        {Object.entries(compareVariants).map(([v, props]) => (
          <Composition key={v} id={vid("compare", v)} component={Compare} schema={compareSchema} defaultProps={props} {...vsize} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
        ))}
      </Folder>
      <Folder name="keyword">
        {Object.entries(keywordVariants).map(([v, props]) => (
          <Composition key={v} id={vid("keyword", v)} component={Keyword} schema={keywordSchema} defaultProps={props} {...vsize} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
        ))}
      </Folder>
      <Folder name="transition">
        {Object.entries(transitionVariants).map(([v, props]) => (
          <Composition key={v} id={vid("transition", v)} component={Transition} schema={transitionSchema} defaultProps={props} {...vsize} durationInFrames={frames(props.duration)} calculateMetadata={durationFromProps} />
        ))}
      </Folder>
    </Folder>
  </Folder>
);
