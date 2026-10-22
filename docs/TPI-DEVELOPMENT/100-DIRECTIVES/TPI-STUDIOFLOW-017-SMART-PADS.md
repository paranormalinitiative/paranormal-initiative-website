# TPI-STUDIOFLOW-017 — SMART Pads for Sound Effects and Background Music

Status: implementation in progress; production deployment follows the guarded release workflow.

This is an implementation addendum to the existing TPI-STUDIOFLOW-017 Studio
switching directive. It does not replace the save-before-switch, studio
identity, or owner-data protections already recorded for that directive.

## Authorized behavior

- Render reusable, colored SMART Pads from the existing nine-slot Sound Effects
  and Background Music libraries.
- Show a white waveform icon for sound effects and a white music-note icon for
  background music.
- Use the existing IndexedDB media bytes and localStorage workspace metadata;
  do not duplicate or rewrite uploaded audio files.
- Use the existing React audio buses. Sound-effect pads use the program sound
  bus so a click is audible in the live stage/program path. Music pads use the
  existing background-music source and its program mix.
- Allow playback, stop, replace, remove, rename, and per-pad color changes.
- Prefer an embedded MP3 title, then the original filename without its
  extension. A user-renamed title has priority and survives replacement.
- Persist pad titles, colors, audio slots, and the loop setting with the
  current studio.
- Allow a scene to select a music pad and opt into “Start after Intro.” Manual
  “Smart Play” remains available for music that should start on demand.
- Keep sound effects and background music on separate playback channels.
- Preserve existing studio switching, portable-backup, restore-as-new, and
  Crossroads owner-data protections.

## Scope exclusions

This addendum does not introduce countdown timers, new cloud providers,
new media storage, destructive migrations, or changes to unrelated website
features. Existing media records remain authoritative.

## Verification requirements

Use disposable studios and synthetic audio. Verify pad rendering, title/color
persistence, sound-effect program playback, music Smart Play, loop behavior,
scene assignment and Intro handoff, studio switching, refresh persistence,
backup/restore coverage, and responsive presentation before deployment.

