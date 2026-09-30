import { AbsoluteFill, Audio, interpolate, useCurrentFrame } from "remotion";
import { Decrypt } from "../../../prototypes/b/components";
import { BOARD_LAYOUT, Board, type BoardTimes } from "./Board";
import { BehindWords, fitCaps, type BehindGroup } from "./BehindWords";
import { Captions, plainText, type CaptionBox } from "./Captions";
import { AROLL, C, CutClip, F, Life, MATTE, Mono, Stamp, VOICE, ramp } from "./parts";
import { CUES } from "./cues";
import { A, money } from "./figures";
import { musicBedProps } from "./music";
import { MusicBed, SfxTrack } from "./Sound";
import { TOTAL_FRAMES, at } from "./timing";

// Music: only a track the user supplies (media/soyluisart/user-provided/musica/, set in music.ts);
// none set = no music.
const MUSIC = musicBedProps();

// SLA-2026-09-27-per-barato-short — "¿Barata = buena inversión?" (P/E multiple), 1080×1920.
// Claudia-style kinetic edit in the Terminal style (v3: no plates/boxes behind any text — plain
// bold type with a thin dark outline; no music bed yet). Layers, bottom to top:
// A-roll → behind-head words → person cutout → floating panels → board scene → captions.
// Every time below comes from a transcript word through the cut map (timing.ts).

const WIPE = 8;

// ── Beats ────────────────────────────────────────────────────────────────────────────────
const LEAD = 60;
const hook: BehindGroup[] = [
  {
    lines: [
      { text: "Llevo más de", at: at("más"), top: 288, size: LEAD, lead: true },
      { text: "2 AÑOS", accent: "2", at: at("dos"), top: 356, size: fitCaps("2 AÑOS", 230) },
    ],
    out: at("una"),
  },
  {
    lines: [
      { text: "Una acción", at: at("acción"), top: 262, size: LEAD, lead: true },
      { text: "BARATA", at: at("barata"), top: 330, size: fitCaps("BARATA", 230) },
    ],
    out: at("buena"),
  },
  {
    lines: [
      { text: "≠ BUENA", accent: "≠", at: at("buena"), top: 256, size: fitCaps("≠ BUENA", 180) },
      { text: "INVERSIÓN", at: at("inversión"), top: 405, size: fitCaps("INVERSIÓN", 160) },
    ],
    out: at("todo"),
  },
];
const cta: BehindGroup[] = [
  {
    lines: [{ text: "¿BARATO", accent: "¿", at: at("barato", 38), top: 320, size: fitCaps("¿BARATO", 220) }],
    out: at("comparado"),
  },
  {
    lines: [
      { text: "¿Barato comparado", at: at("comparado"), top: 262, size: LEAD, lead: true },
      { text: "CON QUÉ?", accent: "?", at: at("con", 40), top: 330, size: fitCaps("CON QUÉ?", 220) },
    ],
    out: at("guarda"),
  },
];
const behind = [...hook, ...cta];

const trampa = { in: at("aquí"), out: at("pero") };
const price = { in: at("precio"), stamp: at("regalada"), out: at("pero") };
const compare = { precio: at("precio", 12.5), util: at("utilidades"), out: at("ahí") + WIPE };
const tm: BoardTimes = {
  inF: at("ahí"),
  outF: at("antes"),
  formula: at("múltiplo"),
  precioHi: at("precio", 17.5),
  utilHi: at("utilidad"),
  aHead: at("empresa", 19),
  aPrice: at("20", 19),
  aEps: at("10", 22),
  aPU: at("2", 25),
  bHead: at("otra"),
  bPrice: at("vale", 25.5),
  bEps: at("2", 27),
  bPU: at("50", 28),
  segunda: at("segunda"),
  cara: at("cara"),
  aunque: at("aunque"),
};
const save = { in: at("guarda"), fill: at("esto", 41.5) };

// Cutout only where a word sits behind the head (saves decoding the alpha video elsewhere).
const matteWindows = behind.map((g) => [g.lines[0].at - 2, g.out] as const);

const captionBox = (frame: number): CaptionBox | null => {
  const onBoard = frame >= tm.inF + WIPE / 2 && frame < tm.outF - WIPE / 2;
  if (onBoard) return { ...BOARD_LAYOUT.caption, size: 48, align: "center" };
  return { left: 120, width: 800, bottom: 520, size: 58, align: "center" };
};

// ── Floating panels over the recording ───────────────────────────────────────────────────
const PricePanel: React.FC = () => (
  <>
    <Life inF={price.in} outF={price.out} style={{ left: 250, top: 268, width: 540, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <Mono size={26} c={C.orange} style={plainText(26)}>
        [Acción] · precio
      </Mono>
      <div style={{ ...plainText(96), fontFamily: F.mono, fontWeight: 700, fontSize: 96, letterSpacing: "-0.02em", color: C.text, lineHeight: 1 }}>
        <Decrypt text={`${money(A.price)}.00`} start={price.in - 3} perChar={1} scramble={4} scrambleColor={C.ice} />
      </div>
    </Life>
    {useCurrentFrame() < price.out ? <Stamp text="¿REGALADA?" at={price.stamp} size={62} style={{ left: 450, top: 404 }} /> : null}
  </>
);

const CompareChips: React.FC = () => {
  const frame = useCurrentFrame();
  const chip = (tag: string, word: string) => (
    <div style={{ width: 330 }}>
      <Mono size={24} c={C.orange} style={{ ...plainText(24), marginBottom: 6 }}>
        {tag}
      </Mono>
      <div style={{ ...plainText(56), fontFamily: F.display, fontWeight: 800, fontSize: 56, letterSpacing: "-0.03em", color: C.text, lineHeight: 1 }}>{word}</div>
    </div>
  );
  return (
    <>
      <Life inF={compare.precio} outF={compare.out} style={{ left: 120, top: 272 }}>
        {chip("[01] lo que ves", "PRECIO")}
      </Life>
      <Life inF={compare.util} outF={compare.out} style={{ left: 590, top: 272 }}>
        {chip("[02] lo que gana", "UTILIDADES")}
      </Life>
      {frame >= compare.util && frame < compare.out ? (
        <div style={{ position: "absolute", left: 450, width: 140, top: 318, textAlign: "center", opacity: ramp(frame, compare.util + 2, 5) }}>
          <Mono size={40} c={C.ice} style={plainText(40)}>
            vs
          </Mono>
        </div>
      ) : null}
    </>
  );
};

const TrampaTag: React.FC = () => (
  <Life inF={trampa.in} outF={trampa.out} style={{ left: 120, top: 1226 }}>
    <Mono size={32} c={C.orange} style={plainText(32)}>
      [01] La trampa
    </Mono>
  </Life>
);

const Bookmark: React.FC = () => {
  const frame = useCurrentFrame();
  const fill = ramp(frame, save.fill, 5);
  return (
    <Life inF={save.in} outF={TOTAL_FRAMES + 20} style={{ left: 160, top: 276, width: 720, display: "flex", alignItems: "center", gap: 26 }}>
      <svg width={64} height={84} viewBox="0 0 64 84" style={{ flexShrink: 0, overflow: "visible", scale: `${interpolate(fill, [0, 0.5, 1], [1, 1.18, 1])}` }}>
        <path d="M6 4 H58 V78 L32 58 L6 78 Z" fill={fill > 0 ? C.blue : "none"} fillOpacity={fill} stroke="#04060B" strokeWidth={11} strokeLinejoin="miter" />
        <path d="M6 4 H58 V78 L32 58 L6 78 Z" fill="none" stroke={C.ice} strokeWidth={5} strokeLinejoin="miter" />
      </svg>
      <div>
        <div style={{ ...plainText(72), fontFamily: F.display, fontWeight: 800, fontSize: 72, letterSpacing: "-0.04em", color: C.text, lineHeight: 1 }}>Guarda esto</div>
        <Mono size={24} c={fill > 0.5 ? C.ice : C.text} style={{ ...plainText(24), marginTop: 10 }}>
          {fill > 0.5 ? "[✓] Guardado · P/U = precio ÷ utilidad" : "[ ] P/U = precio ÷ utilidad"}
        </Mono>
      </div>
    </Life>
  );
};

// ── Composition ──────────────────────────────────────────────────────────────────────────
export const PER_SHORT_FRAMES = TOTAL_FRAMES;

export const PerBaratoShort: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Audio src={VOICE} name="voice (cut, 15 ms fades at the join, mastered)" />

    <CutClip name="A-roll" src={AROLL} />
    <BehindWords groups={behind} />
    {matteWindows.map(([a, b], i) => (
      <CutClip key={i} name={`Cutout ${i + 1}`} src={MATTE} transparent from={a} to={b} />
    ))}

    <TrampaTag />
    <PricePanel />
    <CompareChips />
    <Bookmark />

    <Board tm={tm} />
    <Captions box={captionBox} />

    {/* Sound design: cue list in cues.ts (library SFX); music bed only when music.ts has a track. */}
    <SfxTrack cues={CUES} />
    {MUSIC ? <MusicBed {...MUSIC} /> : null}
  </AbsoluteFill>
);
