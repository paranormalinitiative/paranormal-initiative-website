import { readFileSync } from "node:fs";

const bridge = readFileSync("studio/workspace-bridge.js", "utf8");
const assetBridge = readFileSync("studio/workspace-asset-state-bridge.js", "utf8");
const shell = readFileSync("studio/index.html", "utf8");
const overrides = readFileSync("studio/studioflow-012-overrides.css", "utf8");
const api = readFileSync("functions/api/[[path]].js", "utf8");
const checks = [];
const check = (name, ok) => checks.push({ name, ok });

check("the existing StudioFlow bridge remains the persistence boundary", bridge.includes("/api/studio/workspaces") && bridge.includes("CONFIG_KEYS"));
check("asset references are persisted without uploading media bytes", assetBridge.includes("blobKey") && assetBridge.includes("media bytes in IndexedDB/browser storage") && !assetBridge.includes("/api/uploads"));
check("new Studios initialize defaults instead of cloning the active Studio", assetBridge.includes("function defaults()") && assetBridge.includes('selectedBackground: "default"') && assetBridge.includes("studioScenes: [{ id: \"intro\""));
check("the API preserves independent Studio asset-reference metadata", api.includes("customBackground: normalizeAsset") && api.includes("overlayAssets: normalizeAssetList") && api.includes("videoClips: {") && api.includes("backgroundMusic,"));
check("Brand 1 is replaced at runtime by My Studios", bridge.includes('brand.textContent = "My Studios"') && bridge.includes(".brand-row"));
check("the Studio selector is compact and shows saved workspace labels", bridge.includes("tpi-studio-selector") && bridge.includes("selectedLabel(workspace)"));
check("Create New Studio uses a real dialog", bridge.includes("Create New Studio") && bridge.includes("tpi-create-studio-dialog") && bridge.includes("tpi-studio-name"));
check("creation does not overwrite existing workspaces", bridge.includes("method: \"POST\"") && bridge.includes("state.broadcast.id = id"));
check("Import Project Configuration is in the management menu", bridge.includes("Import Project Configuration") && bridge.includes("importBackupFile"));
check("the project management menu replaces the legacy action row", !bridge.includes("tpi-studio-tools") && bridge.includes("Save Project") && bridge.includes("Refresh Project Library") && !bridge.includes("Save Studio") && !bridge.includes("Refresh Studios"));
check("scene and branding configuration remains allow-listed", bridge.includes("studioScenes") && bridge.includes("selectedBackground") && bridge.includes("configurationForSave"));
check("recordings remain local", bridge.includes("Recording files remain in Browser Storage") && !bridge.includes("/api/uploads") && !bridge.includes("indexedDB.deleteDatabase"));
check("Go Live has an even border and accessible focus indicator", overrides.includes(".go-live-button") && overrides.includes("border: 1px solid") && overrides.includes(":focus-visible"));
check("the override stylesheet is loaded by the StudioFlow shell", shell.includes("studioflow-012-overrides.css"));

for (const result of checks) console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}`);
const failed = checks.filter(result => !result.ok);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-012", checks: checks.length, passed: checks.length - failed.length, failed: failed.length }));
if (failed.length) process.exit(1);
