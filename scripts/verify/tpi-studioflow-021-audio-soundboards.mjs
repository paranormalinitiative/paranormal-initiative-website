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
const api = readFileSync(join(root, "functions/api/[[path]].js"), "utf8");

const required = [
  [html, "audio-soundboard-bridge.js", "Studio shell includes the soundboard bridge"],
  [html, "tpi021=soundboards-v8&tpi017=smart-pads&tpi-volume=v1&tpi-scene-music=v4", "Shell cache tag identifies the reorderable Addendum-A-preserving SMART Pad soundboard bridge"],
  [html, "tpi022=video-organization-v12", "Shell cache tag identifies the reorder-aware audio stylesheet"],
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
  [bridge, 'previous === "intro" ? sceneMusicFor(AFTER_INTRO_SCENE_ID) : null', "Sol's approved post-Intro handoff plays the assigned After Intro track when production leaves the Intro scene"],
  [bridge, 'active === "intro" && previous !== "intro" && sceneMusicFor(AFTER_INTRO_SCENE_ID)', "Entering the Intro scene clears scene music for the video moment"],
  [bridge, 'if (active === sceneId && !isAfterIntroScene(sceneId)) playMusic(slot);', "Assigning music to the active scene starts it while the After Intro handoff remains assignment-only"],
  [bridge, "isAfterIntroScene", "After Intro remains a distinct scene-music handoff target"],
  [browser, "scene music picker opens outside panel overflow", "Browser regression covers scene music assignment"],
  [bridge, "PAD_COLORS", "SMART Pads use a coordinated persisted color palette"],
  [bridge, "Rename", "SMART Pads support custom display names"],
  [bridge, "color", "SMART Pad color changes are persisted"],
  [bridge, "data-tpi-audio-menu-action", "Audio management actions use the compact menu contract"],
  [bridge, "contextmenu", "Audio cards expose the requested right-click menu"],
  [bridge, "longPressTimer", "Touch long-press opens the pad options menu on both boards"],
  [bridge, "moveSlot(category, from, to, restoreFocus)", "Pad reordering persists through the existing workspace state on both boards"],
  [bridge, "slots[activeIndex].blobKey : null", "Reordering remaps the active playback indicator instead of stopping playback"],
  [bridge, 'write(isSound ? SOUND_KEY : MUSIC_KEY, slots.filter(Boolean))', "Reordering writes only its own category's persisted slot key"],
  [bridge, 'next[key] = { blobKey: asset.blobKey, assetId: asset.id', "Scene music assignments reference stable asset identifiers, not pad positions"],
  [bridge, "tpi-audio-drop-placeholder", "Drag reordering shows an explicit drop location"],
  [bridge, 'dataset.tpiAudioDraggable = "true"', "Both boards expose a drag affordance without a permanent menu button"],
  [bridge, "Alt+ArrowLeft", "Both boards support accessible keyboard reordering"],
  [bridge, "ContextMenu", "Pads open their options menu from the keyboard on both boards"],
  [bridge, 'controls.append(volumeControl("Sound effects volume", SOUND_VOLUME_KEY, "sound")); soundSection.appendChild(controls);', "Sound controls keep the volume slider without a Stop sound button"],
  [css, "tpi-audio-dragging", "Dragged sound pads render lifted above the grid"],
  [css, ".tpi-audio-drop-placeholder", "Drop placeholder styling exists"],
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
  [bridge, 'node.style.setProperty("display", "none", "important")', "Non-media tabs force the injected audio boards out of the rendered layout"],
  [css, "[data-tpi-audio-soundboards][hidden]", "Hidden audio boards cannot be redisplayed by their grid styling"],
  [assetState, "backgroundMusicSlots", "Asset state bridge persists music slots"],
  [assetState, "backgroundMusicLoop", "Asset state bridge persists the music loop preference"],
  [api, "const backgroundMusicSlots = normalizeAssetList(source.backgroundMusicSlots, 50);", "API workspace saves persist the Background Music pad slots and their order"],
  [api, "sceneMusicAssignments", "API workspace saves persist scene music assignments including the After Intro handoff"],
  [api, "backgroundMusicLoop: source.backgroundMusicLoop !== false", "API workspace saves persist the Background Music loop preference"],
  [api, "titleCustomized: value.titleCustomized === true", "API asset normalization preserves pad title customizations"],
  [api, "/^#[0-9a-f]{6}$/i.test(clean(value.color))", "API asset normalization preserves pad colors"],
  [assetState, "byKey[asset.blobKey] = asset", "Uploaded media replacements are matched to their own assets by blobKey, never by visit position"],
  [assetState, "captureKeyGuard", "Workspace response echoes snapshot stored keys before applying saved configuration"],
  [assetState, "keyGuard[name] !== localStorage.getItem(KEYS[name])", "A workspace response echo never overwrites a key changed locally while the request was in flight"],
  [workspace, "backgroundMusicSlots", "Workspace save/local snapshot includes music slots"],
  [workspace, "backgroundMusicLoop", "Workspace save/local snapshot includes the music loop preference"],
  [backup, "backgroundMusicSlots", "Portable backup collects music slots"],
  [css, ".tpi-audio-grid", "Soundboard grid styling exists"],
  [bridge, '"/studio/Microphone.png"', "Sound Effects pads render the approved Microphone artwork"],
  [bridge, '"/studio/Waveform.png"', "Background Music pads render the approved Waveform artwork"],
  [bridge, "iconImage.draggable = false", "Pad artwork never starts a native image drag"],
  [css, ".tpi-audio-slot-icon-image", "Pad artwork sizing exists inside the circular container"],
  [css, "object-fit: contain", "Pad artwork keeps its proportions without stretching or cropping"],
  [css, "pointer-events: none", "Pad artwork never captures pad clicks, drags, or right-clicks"],
  [stage, '"Waveform.png"', "Local staging ships the Background Music pad artwork"],
  [stage, '"Microphone.png"', "Local staging ships the Sound Effects pad artwork"],
];
const failures = required.filter(([source, needle]) => !source.includes(needle));
if (failures.length) {
  for (const [, needle, message] of failures) console.error(`FAIL: ${message} (${needle})`);
  process.exit(1);
}
console.log(`TPI-STUDIOFLOW-021 static checks passed (${required.length} checks).`);
