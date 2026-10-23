#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const root = process.cwd();
const app = read(process.env.STUDIOFLOW_SOURCE || "/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx");
const api = read(`${root}/functions/api/[[path]].js`);
const assetBridge = read(`${root}/studio/workspace-asset-state-bridge.js`);
const audioBridge = read(`${root}/studio/audio-soundboard-bridge.js`);
const workspaceBridge = read(`${root}/studio/workspace-bridge.js`);
const checks = [];

function check(name, fn) {
  try {
    fn();
    checks.push({ name, passed: true });
  } catch (error) {
    checks.push({ name, passed: false, detail: error instanceof Error ? error.message : String(error) });
  }
}

check("Intro and Outro resolve through the active scene kind", () => {
  assert.match(app, /videoClips\[activeScene\.kind\]/);
  assert.match(app, /const activeVideoClipUrl = mediaAssetUrl\(activeVideoClip\)/);
  assert.match(app, /src=\{activeVideoClipUrl\}/);
});

check("Intro and Outro remain independent assignments", () => {
  assert.match(app, /readStoredValue\(storageKeys\.videoClips, \{ intro: null, outro: null \}\)/);
  assert.match(app, /saveVideoClip\(kind: "intro" \| "outro"/);
  assert.match(api, /intro: normalizeAsset\(videoClips\.intro\)/);
  assert.match(api, /outro: normalizeAsset\(videoClips\.outro\)/);
});

check("Missing Intro or Outro media stays in the existing empty state", () => {
  assert.match(app, /if \(!mediaAssetUrl\(clip\)\)/);
  assert.match(app, /Add a video clip from Media assets to play it here\./);
});

check("Background Music resolves through the existing audio element", () => {
  assert.match(app, /const backgroundMusicUrl = mediaAssetUrl\(backgroundMusic\)/);
  assert.match(app, /src=\{backgroundMusicUrl\}/);
  assert.match(app, /const hasBackgroundMusic = Boolean\(backgroundMusicUrl/);
});

check("Background Music preserves monitor and program routing", () => {
  assert.match(app, /backgroundMusicMonitorGainRef\.current\.gain\.value = backgroundMusicVolume/);
  assert.match(app, /programMusicGainRef\.current\.gain\.value = backgroundMusicVolume/);
  assert.match(app, /backgroundMusicUrl && backgroundMusicSourceRef\.current/);
});

check("Remote music commands use the existing authenticated media URL", () => {
  assert.match(app, /const remoteUrl = command\.serverUrl/);
  assert.match(app, /const blob = remoteUrl \? null : await loadRecordingBlob\(command\.blobKey\)/);
  assert.match(app, /serverUrl: command\.serverUrl/);
  assert.match(audioBridge, /audioCommand\("music", "play", Object\.assign\(\{\}, asset/);
});

check("Server media references survive workspace normalization", () => {
  assert.match(api, /serverAssetId: clean\(value\.serverAssetId\)/);
  assert.match(api, /function studioWorkspaceStateWithMediaUrls/);
  assert.match(api, /configuration\.videoClips = configuration\.videoClips/);
  assert.match(api, /configuration\.backgroundMusicSlots = Array\.isArray/);
});

check("Media URLs remain scoped to the selected Studio", () => {
  assert.match(api, /studioWorkspaceStateWithMediaUrls\(safeJsonParse\(row\.state_json\) \|\| \{\}, row\.id\)/);
  assert.match(api, /\/api\/studio\/workspaces\/\$\{encodeURIComponent\(workspaceId\)\}\/media\/\$\{encodeURIComponent\(clean\(asset\.serverAssetId\)\)\}/);
});

check("Existing workspace and asset bridges remain the persistence path", () => {
  assert.match(workspaceBridge, /function applyState\(saved\)/);
  assert.match(workspaceBridge, /configurationForSave\(\)/);
  assert.match(assetBridge, /function syncMedia\(workspaceId, configuration\)/);
  assert.match(assetBridge, /serverAssetId: uploaded\.serverAssetId/);
});

check("No replacement media store or duplicate-upload path was added", () => {
  assert.doesNotMatch(app, /indexedDB\.deleteDatabase/);
  assert.doesNotMatch(app, /backgroundMusicSlots/);
  assert.equal((app.match(/studioflow\.backgroundMusic/g) || []).length > 0, true);
  assert.match(assetBridge, /if \(text\(asset\.serverAssetId\) && text\(asset\.serverUrl\)\)/);
});

const failed = checks.filter((item) => !item.passed);
for (const result of checks) {
  console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
}
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-027", checks: checks.length, passed: checks.length - failed.length, failed: failed.length }));
if (failed.length) process.exit(1);
