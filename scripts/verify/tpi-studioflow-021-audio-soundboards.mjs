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
  [html, "tpi021=soundboards-v3&tpi017=smart-pads", "Shell cache tag identifies the SMART Pad soundboard bridge"],
  [stage, '"audio-soundboard-bridge.js"', "Local staging includes the soundboard bridge"],
  [bridge, "SLOT_COUNT = 9", "Nine-slot capacity is explicit"],
  [bridge, 'dataset.tpiAudioBoard = category', "Separate category boards are rendered"],
  [bridge, "firstOpen", "Upload flow uses the first available slot"],
  [bridge, 'MUSIC_KEY = "studioflow.backgroundMusicSlots"', "Music slot state has a separate persisted key"],
  [bridge, 'MUSIC_LOOP_KEY = "studioflow.backgroundMusicLoop"', "Music loop preference has a separate persisted key"],
  [bridge, "Loop music", "Background music exposes a user-controlled loop toggle"],
  [bridge, "SMART Pad", "Audio boards use the SMART Pad bridge contract"],
  [bridge, "Play live", "Sound effects expose live playback controls"],
  [bridge, "Smart Play", "Background music exposes Smart Play controls"],
  [bridge, "studioflow:audio-command", "Audio playback can use the StudioFlow program audio bridge"],
  [bridge, "studioflow.sceneMusicAssignments", "Scene music assignments are persisted"],
  [bridge, "data-tpi-scene-music-button", "Scenes expose one dedicated background-music button"],
  [bridge, "Choose a Background Music SMART Pad first.", "The scene music button requires an intentional music selection"],
  [bridge, "Background music will start after Intro.", "The scene music button preserves optional Intro handoff"],
  [bridge, "PAD_COLORS", "SMART Pads use a coordinated persisted color palette"],
  [bridge, "Rename", "SMART Pads support custom display names"],
  [bridge, "color", "SMART Pad color changes are persisted"],
  [bridge, "data-tpi-scene-id", "Scene cards expose stable IDs for music assignment"],
  [bridge, 'musicAudio.loop = musicLoopEnabled()', "Music playback honors the loop preference"],
  [bridge, 'section.dataset.tpiLegacyAudio = "true"', "Legacy audio sections are hidden before the maintained boards render"],
  [assetState, "backgroundMusicSlots", "Asset state bridge persists music slots"],
  [assetState, "backgroundMusicLoop", "Asset state bridge persists the music loop preference"],
  [workspace, "backgroundMusicSlots", "Workspace save/local snapshot includes music slots"],
  [workspace, "backgroundMusicLoop", "Workspace save/local snapshot includes the music loop preference"],
  [backup, "backgroundMusicSlots", "Portable backup collects music slots"],
  [css, ".tpi-audio-grid", "Soundboard grid styling exists"],
];
const failures = required.filter(([source, needle]) => !source.includes(needle));
if (failures.length) {
  for (const [, needle, message] of failures) console.error(`FAIL: ${message} (${needle})`);
  process.exit(1);
}
console.log(`TPI-STUDIOFLOW-021 static checks passed (${required.length} checks).`);
