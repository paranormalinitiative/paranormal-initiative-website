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
check("Shell cache tag identifies TPI-022", html.includes("tpi022=video-organization-v13&tpi-panels=exclusive-v3"));
check("Assigned videos can hydrate a preview from IndexedDB", bridge.includes("function preloadPreview") && bridge.includes("function getVideoBlob") && bridge.includes("preloadPreview(card, asset, slot)"));
check("Intro and Outro preview loading supports the canonical React media keys", bridge.includes('"media-video-intro"') && bridge.includes('"media-video-outro"') && bridge.includes("getVideoBlob(asset, slot)"));
check("Existing assigned videos generate a visible preview when thumbnail metadata is absent", bridge.includes("tpiGeneratedPreview") && bridge.includes("thumbnail(media)") && bridge.includes("fallback.remove()"));
check("Preview hydration accepts cross-realm IndexedDB Blob values", bridge.includes('typeof blob.arrayBuffer === "function"') && bridge.includes('typeof blob.size === "number"'));
check("Visible video slots include six general clip cards", bridge.includes("VISIBLE_VIDEO_SLOTS = [0, 1, 4, 5, 6, 7, 8, 9]") && bridge.includes("Intro Video") && bridge.includes("Video 10"));
check("Intro and Outro have a separate section from general clips", bridge.includes("INTRO & OUTRO") && bridge.includes("INTRO_OUTRO_SLOTS = [0, 1]") && bridge.includes("VIDEO_ONLY_SLOTS = [4, 5, 6, 7, 8, 9]"));
check("General clips can play through the stage bridge", bridge.includes("function playAssetOnStage") && bridge.includes("tpi-video-clip-stage-video"));
check("Intro and Outro use an even two-column row", css.includes('.tpi-video-subsection[data-tpi-video-subsection="intro-&-outro"] .tpi-video-grid') && css.includes('grid-template-columns: repeat(2, minmax(0, 1fr));'));
check("Video cards use a 3x3-capable grid", bridge.includes("tpi-video-grid") && css.includes(".tpi-video-grid") && css.includes("repeat(3"));
check("Video uploads persist in the existing IndexedDB store", bridge.includes('VIDEO_SLOTS_KEY = "studioflow.videoClipSlots"') && bridge.includes("studioflow-recordings") && bridge.includes("recordingBlobs"));
check("Representative thumbnail generation avoids black opening frames", bridge.includes("thumbnailDataUrl") && bridge.includes("samples = [0.25, 0.5, 0.75, 0.05]") && bridge.includes("average >= 12"));
check("Assigned-video fallback remains readable", bridge.includes("Video assigned · preview unavailable") && bridge.includes("fileName"));
check("Intro and Outro cards are display-only", bridge.includes("video.controls = slot >= 4") && bridge.includes("video.disablePictureInPicture = true") && bridge.includes("if (asset && slot >= 4) playAssetOnStage(asset); else if (!asset) chooseFile(slot);"));
check("Intro and Outro action menus omit card preview", bridge.includes('if (slot >= 4) actionMenu.append(makeButton("Play in stage", "stage-play", false), makeButton("Preview", "preview", false));'));
check("Intro and Outro cards show a visible loaded preview", bridge.includes("tpi-video-card-preview-label") && bridge.includes("data-tpi-preview-label") && bridge.includes('previewLabel.textContent = asset.thumbnailDataUrl ? "Preview" : "Loading preview…"'));
check("Assigned video cards are not styled as selected", css.includes(".tpi-video-card.assigned {\n  border-color: var(--line"));
check("One native video timer has its own section with duration presets", bridge.includes("nativeTimerSection") && bridge.includes("data-tpi-video-timer-section") && bridge.includes("data-tpi-native-video-timer") && bridge.includes("TIMER_PRESETS = [10, 20, 30, 60]") && !bridge.includes("root.appendChild(makeTimerSection())"));
check("Native timer rerenders remove stale duration rows", bridge.includes('timerControls.querySelectorAll(".countdown-duration-row")') && bridge.includes("if (row !== nativeTimers) row.remove()"));
check("Legacy Thank You and Be Right Back placeholders are hidden", bridge.includes('label === "thank you" || label === "be right back"') && bridge.includes("tpiLegacyVideoPlaceholder"));
check("Non-media tabs force injected video controls out of the rendered layout", bridge.includes('node.style.setProperty("display", "none", "important")') && css.includes("[data-tpi-video-organization][hidden]") && css.includes("[data-tpi-video-timer-section][hidden]"));
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
