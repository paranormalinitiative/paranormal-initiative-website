# StudioFlow Scene Background Music Repair

Date: 2026-10-22

## Problem

The existing audio board could play a selected Background Music pad, but the
Scenes panel did not provide a reliable way to choose an uploaded track for a
scene. The legacy bridge exposed one global Intro handoff and depended on a
track already being the currently playing pad. That left uploaded music
available in the library but not consistently assignable to the stage scene.

## Repair

- Scene music assignments remain in the existing
  `studioflow.sceneMusicAssignments` workspace configuration key.
- Intro and each regular scene now receive a compact `Add background music`
  control when music slots exist.
- The control opens a floating track picker, so the user can choose any
  uploaded Background Music track without first playing it.
- The Intro control assigns a track for automatic playback after Intro ends.
- Regular scene controls assign a track to that scene; entering the scene
  starts its assigned track while an unassigned scene leaves manually started
  music alone.
- A `No background music` action removes only the scene assignment and does
  not delete the uploaded track or its IndexedDB media bytes.
- The previous global assignment is migrated to the Intro handoff without
  changing its track reference.
- Direct Background Music pad playback remains available and continues to use
  the maintained React audio path, loop preference, volume controls, and
  program-audio routing.

## Files changed

- `studio/audio-soundboard-bridge.js`
- `studio/studioflow-012-overrides.css`
- `studio/index.html`
- `scripts/stage-studioflow-authoritative.mjs`
- `scripts/verify/tpi-release-safety.mjs`
- `scripts/verify/tpi-studioflow-021-audio-soundboards.mjs`

The existing workspace and backup bridges already include
`sceneMusicAssignments` and Background Music slot metadata, so no new storage
or database path was introduced.

## Protection boundary

Testing must use disposable studios and synthetic audio. Crossroads of the
Unknown, owner browser storage, production D1 records, and production R2
objects are not touched by this repair.
