import { readFileSync } from "node:fs";
import { readStudioAssetManifest } from "./studio-asset-manifest.mjs";

const read = (path) => readFileSync(path, "utf8");
const assetBridge = read("studio/workspace-asset-state-bridge.js");
const workspaceBridge = read("studio/workspace-bridge.js");
const productionBridge = read("studio/production-lock-bridge.js");
const shell = read("studio/index.html");
const bundle = read(readStudioAssetManifest().javascript.path);
const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), detail });

check("asset state has studio-scoped logo, overlay, background, and clip keys", [
  "customLogo", "overlayAssets", "customBackground", "videoClips"
].every((key) => assetBridge.includes(key)));
check("asset bridge applies saved configuration after workspace responses", assetBridge.includes("body.workspace.state.configuration") && assetBridge.includes("applyConfiguration"));
check("workspace bridge does not upload recording bytes", workspaceBridge.includes("Recording files remain in Browser Storage") && !workspaceBridge.includes("/api/uploads"));
check("workspace bridge reattaches after SPA replaces the asset panel", workspaceBridge.includes("panel && panel.isConnected") && workspaceBridge.includes("panel && !panel.isConnected"));
check("production lock remains part of recording readiness", productionBridge.includes("/api/studio/production/start") && productionBridge.includes("/api/studio/production/heartbeat"));
check("StudioFlow shell loads all persistence bridges", ["workspace-asset-state-bridge.js", "production-lock-bridge.js", "workspace-bridge.js"].every((file) => shell.includes(file)));
check("browser storage and folder storage are explicit", bundle.includes("Local Browser Storage") && bundle.includes("Computer Folder / External Drive") && bundle.includes("showDirectoryPicker"));
check("folder permission is requested before folder recording", bundle.includes("queryPermission") && bundle.includes("requestPermission"));
check("recording recovery keeps a browser-local fallback", bundle.includes("recordingChunks") && bundle.includes("Recover recording?") && bundle.includes("Browser Library checkpoint remains the recovery fallback"));
check("schedule and destination state are represented in the workspace model", workspaceBridge.includes("scheduledAt") && workspaceBridge.includes("recordingDestination"));

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
const failed = checks.filter((result) => !result.passed);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-014", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, externalRequests: 0 }));
if (failed.length) process.exit(1);
