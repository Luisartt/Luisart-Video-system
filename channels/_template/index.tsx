import { Composition, Folder } from "remotion";
import { CompareTwo } from "./elements/CompareTwo";
import { BarChart, LowerThird, StatCallout, TitleCard } from "./elements/Basics";

// Token-driven starter kit. Copy this folder to channels/<your-slug>/ for your own channel, then
// regenerate its theme:  python scripts/design/generar_theme.py brand/design-system/tokens.json channels/<your-slug>/theme.generated.ts
const size = { width: 1080, height: 1920, fps: 30 } as const;

export const TemplateChannel: React.FC = () => (
  <Folder name="template">
    <Composition id="TPL-title-card" component={TitleCard} {...size} durationInFrames={90} defaultProps={{ kicker: "your kicker", title: "A title in your brand" }} />
    <Composition id="TPL-stat-callout" component={StatCallout} {...size} durationInFrames={120} defaultProps={{ value: 2500, prefix: "$", suffix: "", label: "example figure", note: "example data" }} />
    <Composition id="TPL-bar-chart" component={BarChart} {...size} durationInFrames={150} defaultProps={{ title: "Growth by year", items: [{ label: "2022", value: 120 }, { label: "2023", value: 260 }, { label: "2024", value: 410 }, { label: "2025", value: 690 }] }} />
    <Composition id="TPL-lower-third" component={LowerThird} {...size} durationInFrames={90} defaultProps={{ name: "Your Name", role: "what you do" }} />
    <Composition
      id="TPL-compare-two"
      component={CompareTwo}
      {...size}
      durationInFrames={360}
      defaultProps={{
        title: "Same money, two decisions",
        a: { name: "Option A", sub: "example A", value: 100, unit: "" },
        b: { name: "Option B", sub: "example B", value: 700, unit: "" },
        footnote: "Only where you put it changed.",
      }}
    />
  </Folder>
);
