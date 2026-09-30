import { Composition, Folder } from "remotion";
import { theme } from "./theme";
import { BrandBoard } from "./BrandBoard";
import { SearchPill, searchPillDefaults, searchPillSchema } from "./animations/SearchPill";
import { LessonCard, lessonCardDefaults, lessonCardSchema } from "./animations/LessonCard";
import { YouTubeCard, youTubeCardDefaults, youTubeCardSchema } from "./animations/YouTubeCard";
import { NameLowerThird, nameLowerThirdDefaults, nameLowerThirdSchema } from "./animations/NameLowerThird";
import { StatCallout, statCalloutDefaults, statCalloutSchema } from "./animations/StatCallout";
import { GridIntro, gridIntroDefaults, gridIntroSchema } from "./animations/GridIntro";
import {
  TransitionsShowcase,
  transitionsShowcaseDefaults,
  transitionsShowcaseDuration,
  transitionsShowcaseSchema,
} from "./animations/TransitionsShowcase";
import { ProtoAGrabado, protoADuration } from "./prototypes/a/Showcase";
import { ProtoBTerminal, protoBDuration } from "./prototypes/b/Showcase";
import { ProtoCDocumental, protoCDuration } from "./prototypes/c/Showcase";
import { TerminalLibrary } from "./styles/terminal";
import { DocumentalLibrary } from "./styles/documental";
import { PizarraLibrary } from "./styles/pizarra";
import { KallawayLibrary } from "./styles/kallaway";
// The reference edit needs the raw recording and its media (face-track.json, matte, voice), which are
// not in this repository. Re-enable it when you have that media: import { PerBaratoVideo } from "./videos/2026-09-27-per-barato";

const { width, height, fps } = theme.canvas;
const size = { width, height, fps };
const id = (name: string) => `${theme.code}-anim-${name}`;

export const SoyLuisArtChannel: React.FC = () => (
  <Folder name="soyluisart">
    <Composition id={`${theme.code}-brand-board`} component={BrandBoard} {...size} durationInFrames={fps * 3} />
    <Folder name="animations">
      <Composition id={id("search-pill")} component={SearchPill} schema={searchPillSchema} defaultProps={searchPillDefaults} {...size} durationInFrames={Math.round(fps * 3.5)} />
      <Composition id={id("lesson-card")} component={LessonCard} schema={lessonCardSchema} defaultProps={lessonCardDefaults} {...size} durationInFrames={Math.round(fps * 3.5)} />
      <Composition id={id("youtube-card")} component={YouTubeCard} schema={youTubeCardSchema} defaultProps={youTubeCardDefaults} {...size} durationInFrames={fps * 4} />
      <Composition
        id={id("name-lower-third")}
        component={NameLowerThird}
        schema={nameLowerThirdSchema}
        defaultProps={{ ...nameLowerThirdDefaults, background: true }}
        {...size}
        durationInFrames={fps * 4}
      />
      <Composition id={id("stat-callout")} component={StatCallout} schema={statCalloutSchema} defaultProps={statCalloutDefaults} {...size} durationInFrames={Math.round(fps * 3.5)} />
      <Composition id={id("grid-intro")} component={GridIntro} schema={gridIntroSchema} defaultProps={gridIntroDefaults} {...size} durationInFrames={fps * 5} />
      <Composition
        id={id("transitions")}
        component={TransitionsShowcase}
        schema={transitionsShowcaseSchema}
        defaultProps={transitionsShowcaseDefaults}
        {...size}
        durationInFrames={transitionsShowcaseDuration(transitionsShowcaseDefaults.sceneFrames)}
        calculateMetadata={({ props }) => ({ durationInFrames: transitionsShowcaseDuration(props.sceneFrames) })}
      />
    </Folder>
    {/* Style prototypes (2026-09-27): three directions for the user to choose from. */}
    <Folder name="prototypes">
      <Composition id="SLA-proto-a-grabado" component={ProtoAGrabado} {...size} durationInFrames={protoADuration} />
      <Composition id="SLA-proto-b-terminal" component={ProtoBTerminal} {...size} durationInFrames={protoBDuration} />
      <Composition id="SLA-proto-c-documental" component={ProtoCDocumental} {...size} durationInFrames={protoCDuration} />
    </Folder>
    {/* Approved graphics standard (2026-09-27): green-screen libraries. */}
    <TerminalLibrary />
    <DocumentalLibrary />
    <PizarraLibrary />
    <KallawayLibrary />
    {/* <PerBaratoVideo /> (needs the recording media; see README) */}
  </Folder>
);
