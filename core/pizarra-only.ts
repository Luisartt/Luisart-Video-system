// Light entry point with only the Pizarra library (no per-video scenes), for testing and rendering library
// elements while a video's scenes need files that are gone. Use: ENTRY=core/pizarra-only.ts npx tsx core/scripts/frames-locked.ts ...
import { registerRoot } from "remotion";
import React from "react";
import { PizarraLibrary } from "../channels/soyluisart/styles/pizarra";

registerRoot(() => React.createElement(PizarraLibrary));
