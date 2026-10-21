# TPI-STUDIOFLOW-020 — Intro/Outro Playback Toggle, Recording Safety, and Opera Verification

Status: Authorized for local investigation and correction

Scope: local StudioFlow playback controls and browser compatibility only.

Requirements:

- Intro and Outro controls act as Play/Stop toggles.
- Every new activation starts at `00:00`.
- Manual stop and natural completion pause, reset, and restore the prior production scene.
- Intro/Outro playback must not stop recording or livestream state.
- Recording and livestream controls must not automatically start Intro or Outro playback.
- Intro and Outro playback must not overlap, persist stale positions, or leak across scene switches.
- Opera rendering must be compared with the Codex local browser using measurable evidence.
- No deployment, database change, commit, push, recording, livestream, or original-media modification is permitted.

The implementation uses the existing scene controls and shared production-stage path; it does not create a second playback UI or redesign StudioFlow.
