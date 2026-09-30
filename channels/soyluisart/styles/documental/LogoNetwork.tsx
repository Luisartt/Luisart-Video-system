import { evolvePath } from "@remotion/paths";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { baseSchema, clamp, DocFrame, DSfx, ExitWipe, Logo, logoKeyField, Rise, upperKeepName, useFormat, Variant } from "./primitives";
import { spaced } from "../shared/sfx";
import { doc } from "./theme";

// Glowing central logo(s) with satellites joined by thin cyan lines (the prototype's network
// beat). Key-safe glow: the soft radial is replaced by stepped opaque halo rings plus a "sonar"
// ring that expands and thins out (never semi-transparent). The map backdrop is preview-only.

export const logoNetworkSchema = baseSchema.extend({
  title: z.string().describe("Source Serif italic line at the top (empty = none)"),
  centers: z.array(z.object({ logo: logoKeyField, label: z.string() })).min(1).max(2),
  satellites: z
    .array(z.object({ logo: logoKeyField, label: z.string(), to: z.number().int().min(0).max(1).describe("Index of the centre it links to") }))
    .max(6),
  vsLabel: z.string().describe("Label on the link between two centres (rivals)"),
});
export type LogoNetworkProps = z.infer<typeof logoNetworkSchema>;

const CENTER_R = 128;
const SAT_R = 82;
// Opaque stand-ins for the prototype's translucent borders (bone 55 % / cyan 67 % over charcoalRaised).
const CENTER_BORDER = "#8B8985";
const SAT_BORDER = "#4897A5";
const HALO = ["#2E2D2A", "#4A4843", "#77736A"]; // outer → inner

type Pt = { x: number; y: number };

type Box = { x: number; y: number; w: number; h: number };

const layout = (nCenters: number, sats: { to: number }[], vertical: boolean, sb: Box): { centers: Pt[]; sats: Pt[] } => {
  const cx = vertical ? sb.x + sb.w / 2 : 960;
  if (nCenters === 1) {
    const c = vertical ? { x: cx, y: sb.y + sb.h * 0.5 } : { x: 960, y: 575 };
    // Vertical: as wide as the zone allows (satellite circles stay inside x 120–920).
    const [rx, ry] = vertical ? [sb.w / 2 - 62, sb.h / 2 - 104] : [520, 255];
    const n = Math.max(sats.length, 1);
    return {
      centers: [c],
      sats: sats.map((_, i) => {
        const a = ((-90 + (360 * (i + (n % 2 === 0 ? 0.5 : 0))) / n) * Math.PI) / 180;
        return { x: c.x + Math.cos(a) * rx, y: c.y + Math.sin(a) * ry };
      }),
    };
  }
  // Two centres: side by side (horizontal) or stacked (vertical); each one's satellites fan out
  // away from the other centre.
  const centers = vertical
    ? [
        { x: cx, y: sb.y + sb.h * 0.26 },
        { x: cx, y: sb.y + sb.h * 0.73 },
      ]
    : [
        { x: 650, y: 560 },
        { x: 1270, y: 560 },
      ];
  return {
    centers,
    sats: sats.map((s) => {
      const group = sats.filter((o) => o.to === s.to);
      const k = group.indexOf(s);
      if (vertical) {
        // Left / right of its centre, pushed away from the other centre (keeps the VS gap clear).
        const side = k % 2 === 0 ? -1 : 1;
        const row = Math.floor(k / 2);
        return { x: cx + side * 290, y: centers[s.to].y + (s.to === 0 ? -1 : 1) * (40 + row * 130) };
      }
      const half = vertical ? 55 : 45;
      const spread = group.length === 1 ? [0] : group.map((_, j) => -half + (2 * half * j) / (group.length - 1));
      const base = vertical ? (s.to === 0 ? -90 : 90) : s.to === 0 ? 180 : 0;
      const a = ((base + (s.to === 0 ? -1 : 1) * spread[k]) * Math.PI) / 180;
      const [rx, ry] = vertical ? [290, 230] : [400, 300];
      return { x: centers[s.to].x + Math.cos(a) * rx, y: centers[s.to].y + Math.sin(a) * ry };
    }),
  };
};
const Node: React.FC<{ at: Pt; r: number; border: string; borderW: number; delay: number; logo: LogoNetworkProps["centers"][number]["logo"]; logoSize: number; label: string; labelSize: number; halo?: boolean; labelAbove?: boolean }> = ({
  at,
  r,
  border,
  borderW,
  delay,
  logo,
  logoSize,
  label,
  labelSize,
  halo,
  labelAbove,
}) => {
  const frame = useCurrentFrame();
  const { width: w, height: h } = useVideoConfig();
  const { color, font, shadow } = doc;
  const t = frame - delay;
  if (t < 0) return null;
  const s = interpolate(t, [0, 7], [0.86, 1], { ...clamp, easing: doc.ease.land });
  const sonar = ((t - 4) % 45 + 45) % 45;
  const sonarR = interpolate(sonar, [0, 30], [r + 6, r + 110], { ...clamp, easing: doc.ease.land });
  // Never thinner than 2.5 px (a hairline would be all keyed edge); it cuts out when it finishes.
  const sonarW = sonar <= 30 ? interpolate(sonar, [0, 30], [4, 2.5], clamp) : 0;
  return (
    <>
      {halo ? (
        <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {t >= 4 && sonarW > 0.2 ? <circle cx={at.x} cy={at.y} r={sonarR} fill="none" stroke={color.bone} strokeWidth={sonarW} /> : null}
          {HALO.map((c, i) => (
            <circle key={i} cx={at.x} cy={at.y} r={(r + 36 - i * 12) * s} fill={c} />
          ))}
        </svg>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: at.x - r,
          top: at.y - r,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          background: color.charcoalRaised,
          border: `${borderW}px solid ${border}`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: String(s),
        }}
      >
        <Logo id={logo} size={logoSize} />
      </div>
      {label ? (
        <div
          style={{
            position: "absolute",
            left: at.x - 260,
            width: 520,
            top: labelAbove ? at.y - r - (halo ? 56 : 18) - labelSize * 1.2 : at.y + r + (halo ? 56 : 18),
            textAlign: "center",
            fontFamily: font.display,
            fontWeight: 800,
            fontSize: labelSize,
            letterSpacing: "0.14em",
            color: color.bone,
            textShadow: shadow.small,
            opacity: t >= 6 ? 1 : 0,
          }}
        >
          {upperKeepName(label)}
        </div>
      ) : null}
    </>
  );
};

export const LogoNetwork: React.FC<LogoNetworkProps> = ({ backing, preview, safeGuide, sfx, title, centers, satellites, vsLabel }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { color, font, shadow } = doc;
  const f = useFormat();
  const V = f.isVertical;
  // Vertical: title line at the top of the graphics zone (y 250–970), the network under it.
  const G = f.zones.graphics;
  const L = layout(centers.length, satellites, V, V ? { x: G.x, y: G.y + 90, w: G.w, h: G.h - 90 } : f.safeBox);
  const rivals = centers.length > 1;
  const cr = V ? (rivals ? 84 : 96) : rivals ? 112 : CENTER_R;
  const sr = V ? 60 : SAT_R;
  // Sub-boom on the centre's sonar ring, a soft pop per satellite (≥ 6 f apart), a pop for the VS.
  const sound = (
    <>
      <DSfx kind="subBoom" at={4} on={sfx} />
      {spaced(satellites.map((_, i) => 22 + i * 4)).map((f) => (
        <DSfx key={f} kind="pop" at={f} on={sfx} />
      ))}
      {rivals && vsLabel ? <DSfx kind="pop" at={18} on={sfx} /> : null}
    </>
  );
  const link = rivals ? `M ${L.centers[0].x} ${L.centers[0].y} L ${L.centers[1].x} ${L.centers[1].y}` : "";
  const linkP = interpolate(frame, [6, 20], [0, 1], { ...clamp, easing: doc.ease.land });
  return (
    <DocFrame backing={backing} preview={preview} safeGuide={safeGuide}>
      <ExitWipe style={{ position: "absolute", inset: 0 }}>
        <AbsoluteFill style={{ scale: String(interpolate(frame, [0, durationInFrames], [1.0, 1.04], clamp)) }}>
          <svg width={f.width} height={f.height} style={{ position: "absolute", inset: 0 }}>
            {satellites.map((s, i) => {
              const c = L.centers[Math.min(s.to, L.centers.length - 1)];
              const d = `M ${c.x} ${c.y} L ${L.sats[i].x.toFixed(1)} ${L.sats[i].y.toFixed(1)}`;
              const p = interpolate(frame, [8 + i * 4, 26 + i * 4], [0, 1], { ...clamp, easing: doc.ease.land });
              const evo = evolvePath(p, d);
              return <path key={i} d={d} stroke={color.cyan} strokeWidth={3} fill="none" strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} />;
            })}
            {rivals ? (
              <path d={link} stroke={color.red} strokeWidth={5} fill="none" strokeDasharray={evolvePath(linkP, link).strokeDasharray} strokeDashoffset={evolvePath(linkP, link).strokeDashoffset} />
            ) : null}
          </svg>
          {centers.map((c, i) => (
            <Node key={`c-${i}`} at={L.centers[i]} r={cr} border={CENTER_BORDER} borderW={2} delay={i * 4} logo={c.logo} logoSize={Math.round(cr * (rivals ? 1.04 : 1.03))} label={c.label} labelSize={V ? (rivals ? 22 : 20) : 28} halo labelAbove={V && rivals && i === 0} />
          ))}
          {satellites.map((s, i) => (
            <Node key={`s-${i}`} at={L.sats[i]} r={sr} border={SAT_BORDER} borderW={2} delay={22 + i * 4} logo={s.logo} logoSize={Math.round(sr * 0.98)} label={s.label} labelSize={V ? 21 : 24} labelAbove={L.sats[i].y < L.centers[Math.min(s.to, L.centers.length - 1)].y - 200} />
          ))}
          {rivals && vsLabel ? (
            <div
              style={{
                position: "absolute",
                left: (L.centers[0].x + L.centers[1].x) / 2 - 100,
                width: 200,
                top: (L.centers[0].y + L.centers[1].y) / 2 - (V ? 28 : 44),
                textAlign: "center",
                fontFamily: font.display,
                fontWeight: 900,
                fontStyle: "italic",
                fontSize: V ? 56 : 76,
                lineHeight: 1,
                color: color.amber,
                textShadow: shadow.text,
                opacity: frame >= 18 ? 1 : 0,
                scale: String(interpolate(frame, [18, 22], [1.32, 1], { ...clamp, easing: doc.ease.land })),
              }}
            >
              {vsLabel}
            </div>
          ) : null}
        </AbsoluteFill>
        {title ? (
          <div style={{ position: "absolute", left: V ? G.x : 0, width: V ? G.w : f.width, top: V ? G.y + 6 : 92, display: "flex", justifyContent: "center" }}>
            <Rise delay={30}>
              <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: V ? 38 : 42, lineHeight: V ? 1.25 : undefined, textAlign: "center", color: color.bone, textShadow: shadow.small }}>{title}</div>
            </Rise>
          </div>
        ) : null}
      </ExitWipe>
      {sound}
    </DocFrame>
  );
};

const base = { backing: "green", preview: "map", safeGuide: false, sfx: true } as const;

export const logoNetworkVariants: Variant<LogoNetworkProps>[] = [
  {
    id: "openai-center",
    props: {
      ...base,
      seconds: 5,
      title: "Cinco empresas. Una misma carrera.",
      centers: [{ logo: "openai", label: "OpenAI · ChatGPT" }],
      satellites: [
        { logo: "claude", label: "Claude", to: 0 },
        { logo: "gemini", label: "Gemini", to: 0 },
        { logo: "perplexity", label: "Perplexity", to: 0 },
        { logo: "deepseek", label: "DeepSeek", to: 0 },
      ],
      vsLabel: "",
    },
  },
  {
    id: "5-logos",
    props: {
      ...base,
      seconds: 5.5,
      title: "Todos quieren el mismo trono.",
      centers: [{ logo: "openai", label: "OpenAI · ChatGPT" }],
      satellites: [
        { logo: "claude", label: "Claude", to: 0 },
        { logo: "gemini", label: "Gemini", to: 0 },
        { logo: "mistral", label: "Mistral", to: 0 },
        { logo: "deepseek", label: "DeepSeek", to: 0 },
        { logo: "meta", label: "Meta", to: 0 },
      ],
      vsLabel: "",
    },
  },
  {
    id: "rivals",
    props: {
      ...base,
      seconds: 5,
      title: "Dos laboratorios. Dos filosofías.",
      centers: [
        { logo: "openai", label: "OpenAI" },
        { logo: "claude", label: "Anthropic" },
      ],
      satellites: [
        { logo: "xai", label: "xAI", to: 0 },
        { logo: "gemini", label: "Gemini", to: 0 },
        { logo: "mistral", label: "Mistral", to: 1 },
        { logo: "deepseek", label: "DeepSeek", to: 1 },
      ],
      vsLabel: "VS",
    },
  },
];
