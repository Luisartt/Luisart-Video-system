import { Composition, Folder } from "remotion";
import { FORMATS } from "../../styles/shared/formats";
import { PER_SHORT_FRAMES, PerBaratoShort } from "./scenes/Short";
import { PER_PIZ_FRAMES, PerBaratoPizarra } from "./scenes/pizarra/PizShort";
import { PER_SPLIT_FRAMES, PerBaratoSplit } from "./scenes/pizarra/SplitShort";
import { PER_PIZ_H_FRAMES, PerBaratoPizarraH } from "./scenes/pizarra/HorizontalShort";
import { PER_KAL_FRAMES, PerBaratoKallaway } from "./scenes/kallaway/KalShort";

const v = FORMATS.vertical;

export const PerBaratoVideo: React.FC = () => (
  <Folder name="2026-09-27-per-barato">
    {/* Terminal style (v1–v3) */}
    <Composition
      id="SLA-2026-09-27-per-barato-short"
      component={PerBaratoShort}
      width={v.width}
      height={v.height}
      fps={v.fps}
      durationInFrames={PER_SHORT_FRAMES}
    />
    {/* Pizarra style (white dotted board), same cut and beats */}
    <Composition
      id="SLA-2026-09-27-per-barato-short-pizarra"
      component={PerBaratoPizarra}
      width={v.width}
      height={v.height}
      fps={v.fps}
      durationInFrames={PER_PIZ_FRAMES}
      defaultProps={{ safeGuide: false }}
    />
    {/* Pizarra, horizontal 1920×1080 deliverable (vertical + horizontal by default) */}
    <Composition
      id="SLA-2026-09-27-per-barato-short-pizarra-h"
      component={PerBaratoPizarraH}
      width={1920}
      height={1080}
      fps={v.fps}
      durationInFrames={PER_PIZ_H_FRAMES}
      defaultProps={{ safeGuide: false }}
    />
    {/* Pizarra graphics in Nick Saraev's split-screen layout (face card at the bottom) */}
    <Composition
      id="SLA-2026-09-27-per-barato-short-split"
      component={PerBaratoSplit}
      width={v.width}
      height={v.height}
      fps={v.fps}
      durationInFrames={PER_SPLIT_FRAMES}
      defaultProps={{ safeGuide: false }}
    />
    {/* Kallaway style (2026-09-28): 50/50 split with ChatGPT images on top, face shots with one giant word */}
    <Composition
      id="SLA-2026-09-27-per-barato-short-kallaway"
      component={PerBaratoKallaway}
      width={v.width}
      height={v.height}
      fps={v.fps}
      durationInFrames={PER_KAL_FRAMES}
      defaultProps={{ safeGuide: false }}
    />
  </Folder>
);
