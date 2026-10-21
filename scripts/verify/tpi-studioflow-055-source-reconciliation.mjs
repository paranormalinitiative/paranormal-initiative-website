import { existsSync, readFileSync } from "node:fs";

const indexPath = "studio/index.html";
const index = readFileSync(indexPath, "utf8");
const moduleMatch = index.match(/<script type="module" crossorigin src="([^"]+\.js)"><\/script>/);
const cssMatch = index.match(/<link rel="stylesheet" crossorigin href="([^"]+\.css)">/);
const moduleReference = moduleMatch?.[1] ?? "";
const cssReference = cssMatch?.[1] ?? "";
const modulePath = moduleReference.replace(/^\/+/, "");
const cssPath = cssReference.replace(/^\/+/, "");
const bridge = readFileSync("studio/workspace-bridge.js", "utf8");
const backupBridge = readFileSync("studio/backup-bridge.js", "utf8");
const staging = readFileSync("scripts/stage-local-studio-assets.mjs", "utf8");
const authoritativeStaging = readFileSync("scripts/stage-studioflow-authoritative.mjs", "utf8");

const checks = [];
const check = (name, passed) => checks.push({ name, passed: Boolean(passed) });

check("the integrated entry point references a current JavaScript asset", Boolean(moduleReference) && existsSync(modulePath));
check("the integrated entry point references a current CSS asset", Boolean(cssReference) && existsSync(cssPath));
check("the integrated entry point does not reference historical bundle names", !index.includes("index-j2x9m9vI.js") && !index.includes("index-DXjilBOR.css"));
check("the workspace bridge remains integrated", /workspace-bridge\.js(?:\?[^\"]+)?/.test(index) && bridge.includes("/api/studio/workspaces"));
check("the workspace asset bridge remains integrated", /workspace-asset-state-bridge\.js(?:\?[^\"]+)?/.test(index));
check("the production lock bridge remains integrated", index.includes("/studio/production-lock-bridge.js") && existsSync("studio/production-lock-bridge.js"));
check("the video playback and overlay bridge remains integrated", index.includes("video-playback-reset-bridge.js?tpi031=video-overlay-v1") && existsSync("studio/video-playback-reset-bridge.js"));
check("the backup bridge remains integrated", /backup-bridge\.js(?:\?[^\"]+)?/.test(index) && existsSync("studio/backup-bridge.js") && existsSync("studio/backup-core.mjs"));
check("the navigation bridge remains integrated", index.includes("/studio/navigation-bridge.js") && existsSync("studio/navigation-bridge.js"));
check("the local asset staging script discovers assets from the entry point", staging.includes("studioAssetUrls(html)") && staging.includes("versionStudioAssetReferences"));
check("the authoritative staging verifier preserves the TPI bridge layer", authoritativeStaging.includes("maintainedBridgeFiles") && authoritativeStaging.includes("bridgeTags"));
check("the project persistence bridge remains available", bridge.includes("Save Project") && bridge.includes("configurationForSave") && bridge.includes("Refresh Project Library"));
check("My Studios exposes an explicit dropdown selector", bridge.includes('aria-haspopup=\\\"menu\\\"') && bridge.includes('aria-controls=\\\"tpi-studio-menu\\\"') && bridge.includes("My Studios: "));
check("the My Studios dropdown includes the management menu", bridge.includes('button("Studio Menu", "menu"') && bridge.includes('manageMenu.appendChild(manageHeading)'));
check("the asset-panel lifecycle watcher is bounded", bridge.includes("assetPanelTimer") && !bridge.includes("observe(document.documentElement"));
check("the selector reconciliation uses its rendered label", bridge.includes("selectorButtonText(selectedWorkspace)") && !bridge.includes('selector.textContent !== activeLabel'));
check("the picker has a visible fallback before hydration", bridge.includes("My Studios ▾</button>") && bridge.includes("aria-label=\\\"My Studios — select studio\\\""));

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}`);
const failed = checks.filter((result) => !result.passed);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-055", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, externalRequests: 0 }));
if (failed.length) process.exit(1);
