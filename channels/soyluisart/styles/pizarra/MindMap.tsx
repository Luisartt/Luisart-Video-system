import { useCurrentFrame } from "remotion";
import { z } from "zod";
import { Drop, PixelIcon, Sfx, Stage, Tile, TypeOn, Variant, base, baseSchema, iconField, useFormat } from "./primitives";
import { MarkerLayer, MarkerStroke, roughLine } from "./marker";
import { piz } from "./theme";

// Mind map: a central idea (blue-bordered box, typed) with 3–6 branches drawn in marker to pixel
// tiles with a label, one branch every `every` frames (the tile drops as its branch finishes).

export const mindMapSchema = baseSchema.extend({
  center: z.string(),
  nodes: z.array(z.object({ label: z.string(), icon: iconField })).min(3).max(6),
  every: z.number().min(4).max(30),
});
type Props = z.infer<typeof mindMapSchema>;

export const MindMap: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical, safeBox, width, height } = useFormat();
  const cx = safeBox.x + safeBox.w / 2;
  const cy = safeBox.y + safeBox.h / 2 - (isVertical ? 20 : 10);
  const rx = isVertical ? safeBox.w / 2 - 90 : 560;
  const ry = isVertical ? safeBox.h / 2 - 150 : 300;
  const n = p.nodes.length;
  const tile = isVertical ? 150 : 130;
  const start = 4 + Array.from(p.center).length + 6;
  const pos = (i: number) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2 + (n === 4 ? Math.PI / 4 : 0);
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as const;
  };
  const centerW = isVertical ? 380 : 520;
  const centerH = 150;
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <MarkerLayer width={width} height={height}>
        {p.nodes.map((_, i) => {
          const [x, y] = pos(i);
          const at = start + i * p.every;
          // Stop the branch at the edge of the centre box / tile.
          const fx = cx + (x - cx) * 0.3;
          const fy = cy + (y - cy) * 0.36;
          const tx = x - (x - cx) * (tile * 0.75) / Math.hypot(x - cx, y - cy);
          const ty = y - (y - cy) * (tile * 0.75) / Math.hypot(x - cx, y - cy);
          return <MarkerStroke key={i} d={roughLine(fx, fy, tx, ty, `mm${i}`, 0.08)} at={at} frames={8} color={piz.color.ink} width={7} />;
        })}
      </MarkerLayer>
      <div
        style={{
          position: "absolute",
          left: cx - centerW / 2,
          top: cy - centerH / 2,
          width: centerW,
          height: centerH,
          boxSizing: "border-box",
          border: `8px solid ${piz.color.accent}`,
          background: piz.color.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TypeOn text={p.center} at={4} fontSize={isVertical ? 54 : 62} />
      </div>
      {p.nodes.map((nd, i) => {
        const [x, y] = pos(i);
        const at = start + i * p.every + 6;
        return (
          <div key={i} style={{ position: "absolute", left: x - tile / 2, top: y - tile / 2, width: tile, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Drop at={at}>
              <Tile size={tile}>
                <PixelIcon name={nd.icon} px={Math.floor((tile - 40) / 16)} />
              </Tile>
            </Drop>
            <div style={{ marginTop: 16, whiteSpace: "nowrap", font: `700 ${isVertical ? 38 : 36}px ${piz.font.caption}`, color: piz.color.ink, visibility: frame >= at ? "visible" : "hidden" }}>{nd.label}</div>
          </div>
        );
      })}
      <Sfx kind="type" at={4} frames={Array.from(p.center).length + 2} on={p.sfx} />
      {p.nodes.map((_, i) => (
        <Sfx key={i} kind="pop" at={start + i * p.every + 6} on={p.sfx} volume={0.22} />
      ))}
    </Stage>
  );
};

export const mindMapVariants: Variant<Props>[] = [
  {
    id: "4-nodes",
    horizontal: true,
    props: {
      ...base("board", 5),
      center: "TU DINERO",
      nodes: [
        { label: "Gastos", icon: "calendar" },
        { label: "Ahorro", icon: "money-bag" },
        { label: "Inversión", icon: "chart-up" },
        { label: "Deudas", icon: "warning" },
      ],
      every: 9,
    },
  },
  {
    id: "6-nodes",
    horizontal: true,
    props: {
      ...base("board", 6),
      center: "IA EN TU NEGOCIO",
      nodes: [
        { label: "Correos", icon: "mail" },
        { label: "Agenda", icon: "calendar" },
        { label: "Ventas", icon: "chart-up" },
        { label: "Cobros", icon: "coin" },
        { label: "Soporte", icon: "robot" },
        { label: "Ideas", icon: "bulb" },
      ],
      every: 8,
    },
  },
];
