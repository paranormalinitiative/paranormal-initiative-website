import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { readStudioAssetManifest } from "./studio-asset-manifest.mjs";

const root = resolve(new URL("../..", import.meta.url).pathname);
const bridgePath = resolve(root, "studio/video-clip-management-bridge.js");
const bridge = readFileSync(bridgePath, "utf8");
const html = readFileSync(resolve(root, "studio/index.html"), "utf8");
const assetState = readFileSync(resolve(root, "studio/workspace-asset-state-bridge.js"), "utf8");
const workspace = readFileSync(resolve(root, "studio/workspace-bridge.js"), "utf8");
const backup = readFileSync(resolve(root, "studio/backup-bridge.js"), "utf8");
const css = readFileSync(resolve(root, "studio/studioflow-012-overrides.css"), "utf8");
const checks = [];
function check(name, condition, detail = "") { checks.push({ name, ok: Boolean(condition), detail }); }

check("Video organization bridge exists", existsSync(bridgePath), bridgePath);
check("Shell cache tag identifies TPI-022", html.includes("tpi022=video-organization-v4"));
check("Visible video slots omit legacy placeholders", bridge.includes("VISIBLE_VIDEO_SLOTS = [0, 1, 4, 5, 6, 7, 8]") && bridge.includes("Intro Video") && bridge.includes("Video 9"));
check("Video cards use a 3x3-capable grid", bridge.includes("tpi-video-grid") && css.includes(".tpi-video-grid") && css.includes("repeat(3"));
check("Video uploads persist in the existing IndexedDB store", bridge.includes('VIDEO_SLOTS_KEY = "studioflow.videoClipSlots"') && bridge.includes("studioflow-recordings") && bridge.includes("recordingBlobs"));
check("Representative thumbnail generation avoids black opening frames", bridge.includes("thumbnailDataUrl") && bridge.includes("samples = [0.25, 0.5, 0.75, 0.05]") && bridge.includes("average >= 12"));
check("Assigned-video fallback remains readable", bridge.includes("Video assigned · preview unavailable") && bridge.includes("fileName"));
check("One native video timer has its own section with duration presets", bridge.includes("nativeTimerSection") && bridge.includes("data-tpi-video-timer-section") && bridge.includes("data-tpi-native-video-timer") && bridge.includes("TIMER_PRESETS = [10, 20, 30, 60]") && !bridge.includes("root.appendChild(makeTimerSection())"));
check("Legacy Thank You and Be Right Back placeholders are hidden", bridge.includes('label === "thank you" || label === "be right back"') && bridge.includes("tpiLegacyVideoPlaceholder"));
check("Timer state prevents duplicate timers", /function startTimer\(slot, seconds\)[\s\S]*?clearInterval\(timerHandle\)[\s\S]*?setTimerState\(slot, seconds, seconds \* 1000\)/.test(bridge));
check("Video slot configuration is saved with workspaces", assetState.includes("videoClipSlots") && workspace.includes("videoClipSlots"));
check("Portable backup collects video slots without duplicate media paths", backup.includes("videoClipSlots") && backup.includes("var result = [], seen = {}") && backup.includes('add("video-clip"'));
check("My Studios portal is positioned below the status block", workspace.includes("panelRect.bottom + 6") && workspace.includes("PROJECT SAVED"));
check("Authoritative generated asset manifest is complete", (() => {
  const manifest = readStudioAssetManifest(resolve(root, "studio"));
  return /^\/studio\/assets\/index-[A-Za-z0-9_-]+\.js$/.test(manifest.javascript?.url || "") && /^\/studio\/assets\/index-[A-Za-z0-9_-]+\.css$/.test(manifest.stylesheet?.url || "");
})());

const failed = checks.filter((item) => !item.ok);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-022", checks, passed: checks.length - failed.length, failed: failed.length }, null, 2));
if (failed.length) process.exitCode = 1;
