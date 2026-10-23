#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const html = readFileSync(join(root, "studio/index.html"), "utf8");
const bridge = readFileSync(join(root, "studio/audio-soundboard-bridge.js"), "utf8");
const app = readFileSync(process.env.STUDIOFLOW_SOURCE ?? "/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx", "utf8");
const assetState = readFileSync(join(root, "studio/workspace-asset-state-bridge.js"), "utf8");
const workspace = readFileSync(join(root, "studio/workspace-bridge.js"), "utf8");
const backup = readFileSync(join(root, "studio/backup-bridge.js"), "utf8");
const browser = readFileSync(join(root, "scripts/verify/tpi-studioflow-021-browser.mjs"), "utf8");
const stage = readFileSync(join(root, "scripts/stage-local-studio-assets.mjs"), "utf8");
const css = readFileSync(join(root, "studio/studioflow-012-overrides.css"), "utf8");

const required = [
  [html, "audio-soundboard-bridge.js", "Studio shell includes the soundboard bridge"],
  [html, "tpi021=soundboards-v4&tpi017=smart-pads&tpi-volume=v1&tpi-scene-music=v2", "Shell cache tag identifies the scene-aware volume-aware SMART Pad soundboard bridge"],
  [stage, '"audio-soundboard-bridge.js"', "Local staging includes the soundboard bridge"],
  [bridge, "SLOT_COUNT = 9", "Nine-slot capacity is explicit"],
  [bridge, 'dataset.tpiAudioBoard = category', "Separate category boards are rendered"],
  [bridge, "firstOpen", "Upload flow uses the first available slot"],
  [bridge, 'MUSIC_KEY = "studioflow.backgroundMusicSlots"', "Music slot state has a separate persisted key"],
  [bridge, 'MUSIC_LOOP_KEY = "studioflow.backgroundMusicLoop"', "Music loop preference has a separate persisted key"],
  [bridge, "AUDIO_ACCEPT", "Audio upload input accepts common browser audio formats"],
  [bridge, "MUSIC_MAX_BYTES = 512 * 1024 * 1024", "Background music supports long-form local tracks up to the documented browser-safe limit"],
  [bridge, ".m4a,.wav,.wave,.ogg,.oga,.aac,.flac,.aif,.aiff,.webm,.opus,.amr", "Audio upload input includes M4A, WAV, FLAC, AIFF, and other common formats"],
  [bridge, 'flac: "audio/flac"', "Extension fallback recognizes FLAC files when the browser omits MIME metadata"],
  [bridge, 'category === "sound" ? decode(file) : Promise.resolve(true)', "Background music is not blocked by strict Web Audio pre-decoding"],
  [bridge, "Loop music", "Background music exposes a user-controlled loop toggle"],
  [bridge, "SMART Pad", "Audio boards use the SMART Pad bridge contract"],
  [bridge, "Play live", "Sound effects expose live playback controls"],
  [bridge, "Smart Play", "Background music exposes Smart Play controls"],
  [bridge, "studioflow:audio-command", "Audio playback can use the StudioFlow program audio bridge"],
  [bridge, "studioflow.sceneMusicAssignments", "Scene music assignments are persisted"],
  [bridge, "tpiSceneMusicButton", "Scenes expose scene-specific background-music controls"],
  [bridge, "sceneMusicFor", "Scene music assignments are resolved per scene with legacy migration"],
  [bridge, "tpi-scene-music-menu", "Scene music uses a floating track-selection menu"],
  [bridge, "No background music", "Scene music can be removed without deleting the uploaded track"],
  [bridge, "Background music will start after Intro.", "The scene music button preserves Intro handoff"],
  [bridge, "playAssignedSceneMusic", "Assigned scene music starts when its scene becomes active"],
  [browser, "scene music picker opens outside panel overflow", "Browser regression covers scene music assignment"],
  [bridge, "PAD_COLORS", "SMART Pads use a coordinated persisted color palette"],
  [bridge, "Rename", "SMART Pads support custom display names"],
  [bridge, "color", "SMART Pad color changes are persisted"],
  [bridge, "data-tpi-audio-menu-action", "Audio management actions use the compact menu contract"],
  [bridge, "contextmenu", "Audio cards expose the requested right-click menu"],
  [bridge, "Audio options", "Audio cards expose an accessible menu trigger"],
  [bridge, "document.body.appendChild(menu)", "Audio management menus escape panel overflow in a floating document layer"],
  [bridge, "getBoundingClientRect", "Floating audio menus position themselves against the visible trigger"],
  [css, ".tpi-audio-slot-menu", "Audio management menu styling exists"],
  [css, "position: fixed", "Audio management menus are not constrained by the card or panel overflow"],
  [bridge, "data-tpi-scene-id", "Scene cards expose stable IDs for music assignment"],
  [bridge, 'musicAudio.loop = musicLoopEnabled()', "Music playback honors the loop preference"],
  [bridge, 'audioCommand(kind, "settings", { volume: volume })', "Volume changes are sent to the active playback engine"],
  [app, 'command.category === "sound" && command.action === "settings"', "React handles live soundboard volume changes"],
  [app, 'command.category === "music" && command.action === "settings"', "React handles live background-music volume changes"],
  [app, "ensureSoundPlaybackMasterGain", "Active sound playback uses a shared adjustable output gain"],
  [app, "soundPlaybackMasterGainRef.current.gain.value = soundVolume", "Sound volume changes update active playback"],
  [app, "backgroundMusicMonitorGainRef.current.gain.value = backgroundMusicVolume", "Music monitor volume changes update active playback"],
  [app, "programMusicGainRef.current.gain.value = backgroundMusicVolume", "Program music volume changes update the recording mix"],
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
