import { Config } from "@remotion/cli/config";
import {
  publicDir,
  chromeMode,
  gl,
  hardwareAcceleration,
  videoBitrate,
  concurrency,
  timeoutInMilliseconds,
} from "./core/lib/render-settings";

Config.setPublicDir(publicDir);
Config.setChromeMode(chromeMode);
if (gl) Config.setChromiumOpenGlRenderer(gl);
Config.setHardwareAcceleration(hardwareAcceleration);
Config.setVideoImageFormat("jpeg");
Config.setVideoBitrate(videoBitrate);
Config.setConcurrency(concurrency);
Config.setDelayRenderTimeoutInMilliseconds(timeoutInMilliseconds);
