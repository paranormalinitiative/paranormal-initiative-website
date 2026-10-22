#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const html = readFileSync(join(root, "studio/index.html"), "utf8");
const bridge = readFileSync(join(root, "studio/audio-soundboard-bridge.js"), "utf8");
const assetState = readFileSync(join(root, "studio/workspace-asset-state-bridge.js"), "utf8");
const workspace = readFileSync(join(root, "studio/workspace-bridge.js"), "utf8");
const backup = readFileSync(join(root, "studio/backup-bridge.js"), "utf8");
const stage = readFileSync(join(root, "scripts/stage-local-studio-assets.mjs"), "utf8");
const css = readFileSync(join(root, "studio/studioflow-012-overrides.css"), "utf8");

const required = [
  [html, "audio-soundboard-bridge.js", "Studio shell includes the soundboard bridge"],
  [stage, '"audio-soundboard-bridge.js"', "Local staging includes the soundboard bridge"],
  [bridge, "SLOT_COUNT = 9", "Nine-slot capacity is explicit"],
  [bridge, 'dataset.tpiAudioBoard = category', "Separate category boards are rendered"],
  [bridge, "firstOpen", "Upload flow uses the first available slot"],
  [bridge, 'MUSIC_KEY = "studioflow.backgroundMusicSlots"', "Music slot state has a separate persisted key"],
  [assetState, "backgroundMusicSlots", "Asset state bridge persists music slots"],
  [workspace, "backgroundMusicSlots", "Workspace save/local snapshot includes music slots"],
  [backup, "backgroundMusicSlots", "Portable backup collects music slots"],
  [css, ".tpi-audio-grid", "Soundboard grid styling exists"],
];
const failures = required.filter(([source, needle]) => !source.includes(needle));
if (failures.length) {
  for (const [, needle, message] of failures) console.error(`FAIL: ${message} (${needle})`);
  process.exit(1);
}
console.log(`TPI-STUDIOFLOW-021 static checks passed (${required.length} checks).`);
