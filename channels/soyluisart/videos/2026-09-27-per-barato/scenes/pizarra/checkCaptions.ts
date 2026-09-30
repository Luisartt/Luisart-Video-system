// Caption checks for the Pizarra edits (run: npx tsx <this file>). For the vertical full-board,
// split and horizontal edits, with the REAL caption gate: caption frames in total, caption frames
// while any graphic is on screen (must be 0), caption frames touching the face — forehead to chin,
// the detector box extended up by 25 % — (must be 0), reframes, and where the lines land.
import { TOTAL_FRAMES } from "../timing";
import { captionBox, captionBoxH, faceAwareCaption, faceAwareCaptionH, faceBoxH, faceBoxOnScreen } from "./captionPlace";
import { makeCaptionGate, type Window } from "./captionRule";
import { KEY_GROUPS } from "./groups";
import { SEGS, SPLIT_SEGS, T } from "./layout";

const PUNCH = 1.15;
const ORIGIN: [number, number] = [540, 1920 * 0.38];
const PANEL = { left: 656, scale: 0.5625 };
const inAny = (f: number, ws: Window[]) => ws.some(([a, b]) => f >= a && f < b);
const hit = (a: { x0: number; y0: number; x1: number; y1: number }, b: typeof a) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const forehead = (b: { x0: number; y0: number; x1: number; y1: number }) => ({ ...b, y0: b.y0 - (b.y1 - b.y0) * 0.25 });

const fullGraphics: Window[] = [
  ...SEGS.filter((s) => s.kind === "board").map((s) => [s.from, s.to] as const),
  ...KEY_GROUPS.map((g) => [g.from, g.to] as const),
  [T.aqui, T.todo],
  [T.guarda, T.end],
];
const faceGroupsSplit = KEY_GROUPS.filter((g) => SPLIT_SEGS.some((s) => s.kind === "face" && g.from < s.to && g.to > s.from));
const splitGraphics: Window[] = [
  ...SPLIT_SEGS.filter((s) => s.kind !== "face").map((s) => [s.from, s.to] as const),
  ...faceGroupsSplit.map((g) => [g.from, g.to] as const),
  [T.guarda, T.end],
];
const fullFace = SEGS.filter((s) => s.kind === "aroll").map((s) => ({ from: s.from, to: s.to, punch: s.kind === "aroll" && s.punch }));
const splitFace = SPLIT_SEGS.filter((s) => s.kind === "face").map((s) => ({ from: s.from, to: s.to, punch: s.kind === "face" && s.punch }));

const run = (name: string, graphics: Window[], faces: typeof fullFace, horizontal: boolean) => {
  const gate = makeCaptionGate(graphics, TOTAL_FRAMES);
  let shown = 0;
  let clash = 0;
  let touch = 0;
  let reframed = 0;
  const cys: number[] = [];
  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const g = gate(f);
    if (!g.show || !g.page) continue;
    shown++;
    if (inAny(f, graphics)) clash++;
    const seg = faces.find((s) => f >= s.from && f < s.to);
    if (!seg) continue; // (captions can only show on face shots here)
    const text = g.page.tokens.map((t) => t.text).join(" ");
    const S = (seg.punch ? PUNCH : 1) * (1 + 0.035 * ((f - seg.from) / Math.max(1, seg.to - seg.from)));
    if (horizontal) {
      const r = faceAwareCaptionH(f, text, S, PANEL, 52);
      if (hit(captionBoxH(r.cy, text, 52), forehead(faceBoxH(f, S * r.zoom, PANEL)))) touch++;
      if (r.zoom < 1) reframed++;
      cys.push(r.cy);
    } else {
      const shot = { s: S, origin: ORIGIN };
      const r = faceAwareCaption(f, text, shot);
      if (hit(captionBox(r.cy, text, 56), forehead(faceBoxOnScreen(f, { ...shot, s: S * r.zoom })))) touch++;
      if (r.zoom < 1) reframed++;
      cys.push(r.cy);
    }
  }
  cys.sort((a, b) => a - b);
  console.log(
    `${name}: caption frames ${shown} · during a graphic ${clash} · touching the face ${touch} · reframed ${reframed} · line centre y ${cys[0] ?? "-"}–${cys[cys.length - 1] ?? "-"}`,
  );
};

run("vertical full board", fullGraphics, fullFace, false);
run("split", splitGraphics, splitFace, false);
run("horizontal", fullGraphics, fullFace, true);
