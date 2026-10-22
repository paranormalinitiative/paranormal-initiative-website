# StudioFlow Background Music Format Repair

Date: 2026-10-22

Directive: TPI-STUDIOFLOW-017 SMART Pads

## Reported issue

Background Music would not accept some valid audio files, including formats
that should be usable in the Firefox Developer Edition production workflow.

## Repair

- Preserved the existing Background Music SMART Pad, IndexedDB, scene-music,
  looping, and playback architecture.
- Expanded the file input and extension fallback to cover MP3, M4A, WAV/WAVE,
  OGG/OGA, AAC, FLAC, AIFF/AIF, WebM, Opus, and AMR audio files.
- Kept the existing size limit and fail-with-status behavior.
- Kept strict Web Audio decoding for Sound Effects, which use the Web Audio
  playback path.
- Removed the unnecessary Web Audio pre-decoding gate from Background Music.
  Music is saved through the existing browser Audio playback path so valid
  M4A/AAC files are not rejected before persistence.
- Added a category marker to dynamically created audio inputs for reliable
  browser verification.

## Data protection

No owner studio, Crossroads of the Unknown data, D1 record, R2 object, or
existing browser media was modified. Verification uses disposable media.

## Verification plan

- Static audio-board checks include the accepted format list and music-specific
  non-decoding upload path.
- Firefox acceptance continues to use disposable audio and verifies upload,
  playback, persistence, backup, restore-as-new, and studio isolation.
