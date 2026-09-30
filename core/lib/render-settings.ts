// Read by both remotion.config.ts and the render script (Remotion's Node APIs don't read the config file).
// Values below come from the hardware check on this machine (RTX 4050 Laptop, 6 GB VRAM, driver 581.57).

export const publicDir = "media";

export const chromeMode = "chrome-for-testing" as const;
export const gl = "angle" as const;

// NVIDIA driver 581.57 >= the 551.76 NVENC needs, so hardware video encoding is required.
export const hardwareAcceleration = "required" as const;
// ProRes 4444 alpha overlays can't use NVENC; the render script forces CPU encoding for those.
export const alphaHardwareAcceleration = "disable" as const;

export const videoBitrate = "8M";

// i7-13620H (16 threads), 15.7 GB RAM but often only ~1.5 GB free: the 30 s default browser
// setup timed out at the default concurrency. Benchmark once template demos exist
// (npx remotion benchmark <id> --concurrencies=<a>,<b>,<c> --frames=0-89) and replace this.
export const concurrency = 3;
export const timeoutInMilliseconds = 120000;
