// Read by both remotion.config.ts and the render script (Remotion's Node APIs don't read the config file).
// Works on Windows, macOS and Linux. The numbers in the comments were measured on the author's Windows laptop
// (i7-13620H, RTX 4050 6 GB, 15.7 GB RAM); run `npx remotion benchmark <id> --concurrencies=2,3,4 --frames=0-89`
// on YOUR machine and adjust `concurrency` (more RAM/cores -> higher).

export const publicDir = "media";

export const chromeMode = "chrome-for-testing" as const;

// OpenGL renderer: "angle" is what works best on Windows; on macOS and Linux Remotion's default is right.
export const gl = process.platform === "win32" ? ("angle" as const) : null;

// "if-possible" uses the hardware video encoder when there is one (NVENC on NVIDIA, VideoToolbox on a Mac) and falls
// back to software otherwise. Force it with REMOTION_HW=required (fail if no hardware) or REMOTION_HW=disable.
const hw = process.env.REMOTION_HW;
export const hardwareAcceleration = (hw === "required" || hw === "disable" ? hw : "if-possible") as "required" | "disable" | "if-possible";
// ProRes 4444 alpha overlays are always encoded in software.
export const alphaHardwareAcceleration = "disable" as const;

export const videoBitrate = "8M";

// Default 3 is safe for 16 GB of RAM. The browser setup timed out at higher concurrency when little RAM was free.
export const concurrency = Number(process.env.REMOTION_CONCURRENCY || 3);
export const timeoutInMilliseconds = 120000;
