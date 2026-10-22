import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { readStudioAssetManifest } from "./studio-asset-manifest.mjs";

const root = resolve(new URL("../..", import.meta.url).pathname);
const checks = [];

function check(name, condition, detail = "") {
  checks.push({ name, ok: Boolean(condition), detail });
}

const bridgePath = resolve(root, "studio/video-clip-management-bridge.js");
const shellPath = resolve(root, "studio/index.html");
const cssPath = resolve(root, "studio/studioflow-012-overrides.css");
const stagingPath = resolve(root, "scripts/stage-local-studio-assets.mjs");

check("Video clip management bridge exists", existsSync(bridgePath), bridgePath);
check("Studio shell loads the bridge", readFileSync(shellPath, "utf8").includes("video-clip-management-bridge.js?tpi020=clip-management-v1"));
check("Local staging includes the bridge", readFileSync(stagingPath, "utf8").includes('"video-clip-management-bridge.js"'));

const bridge = readFileSync(bridgePath, "utf8");
check("Bridge exposes the visible video labels", bridge.includes("VISIBLE_VIDEO_SLOTS = [0, 1, 4, 5, 6, 7, 8]") && ["Intro Video", "Outro Video", "Video 5", "Video 9"].every((label) => bridge.includes(label)));
check("Bridge exposes Preview, Replace, and Remove", ["Preview", "Replace", "Remove"].every((label) => bridge.includes(`makeButton("${label}"`)));
check("Bridge preserves the existing React Intro/Outro contract", bridge.includes("VIDEO_CLIPS_KEY") && bridge.includes("updateReactClip") && bridge.includes("studioflow-recordings"));
check("Bridge persists a separate nine-slot video configuration", bridge.includes('VIDEO_SLOTS_KEY = "studioflow.videoClipSlots"') && bridge.includes("SLOT_COUNT = 9"));
check("Thank You and Be Right Back are hidden from the active UI", bridge.includes('label === "thank you" || label === "be right back"') && bridge.includes("tpiLegacyVideoPlaceholder"));

const css = readFileSync(cssPath, "utf8");
check("Clip organization styles are maintained", css.includes(".tpi-video-grid") && css.includes(".tpi-video-card"));
check("Clip management layout has a narrow-width fallback", css.includes("@media (max-width: 520px)") && css.includes("grid-template-columns: 1fr"));

const manifest = readStudioAssetManifest(root + "/studio");
check("Authoritative StudioFlow JavaScript asset is present", /^\/studio\/assets\/index-[A-Za-z0-9_-]+\.js$/.test(manifest.javascript?.url || ""), manifest.javascript?.url || "missing");
check("Authoritative StudioFlow CSS asset is present", /^\/studio\/assets\/index-[A-Za-z0-9_-]+\.css$/.test(manifest.stylesheet?.url || ""), manifest.stylesheet?.url || "missing");

const failed = checks.filter((item) => !item.ok);
console.log(JSON.stringify({
  directive: "TPI-STUDIOFLOW-020",
  checks,
  passed: checks.length - failed.length,
  failed: failed.length,
}, null, 2));

if (failed.length) process.exitCode = 1;
