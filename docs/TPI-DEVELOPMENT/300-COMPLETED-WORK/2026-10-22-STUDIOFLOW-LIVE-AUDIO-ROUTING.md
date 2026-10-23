# StudioFlow live podcast audio routing

Date: 2026-10-22
Status: Local routing repair complete; two-participant audible acceptance pending; production not authorized

Source implementation commit: `5619e1b9052731dab126b5aefdf7137ad8018d0e`
Previous Voice FX repair: `0eb009d798143f51b3cd66218fa00dac30a2bf50`

## Routing verified in source

Host microphone:

```text
Microphone -> Voice FX input gain -> OpenVoiceChanger -> output gain/limiter
           -> processed MediaStream track
           -> WebRTC sender
           -> program audio mix and recording
           -> independent direct Web Audio monitor gain
```

The local monitor uses a dedicated `monitorGain` branch from the processed
analyser to `AudioContext.destination`. Changing Monitor Volume therefore does
not change the WebRTC track or program recording. Turning monitoring off ramps
only that gain to zero; it does not disable Voice FX or replace the outgoing
track. The hidden HTML audio element is retained only for output-device
bookkeeping and is not the authoritative playback path.

## Repair made

Remote participant audio was previously coupled to the visible guest video
element. A camera-off guest could therefore be inaudible, and any camera-on
remote stream rendered in more than one visible card could create duplicate
local playback.

The host now creates exactly one dedicated hidden audio element per remote guest
stream. It follows the selected speaker output when `setSinkId` is available.
All host-side visual guest video elements are muted. This makes remote audio
independent of camera state and prevents visual tiles from becoming additional
audio sources.

Program recording remains separate from local monitoring:

- Staged guest audio enters the program audio destination once through
  `createProgramAudioMix`.
- Host processed audio enters that destination once through
  `voiceFx.processedTrack`.
- Remote monitoring audio elements connect only to the local output device.
- Voice FX monitor audio is not connected to the program destination.
- Guest return audio is built separately for each guest and excludes that guest
  from its own return mix.

Music, sound effects, and stage media continue to use the existing program and
monitor buses. No new server-side audio transport was introduced.

## Validation

Passed:

- TypeScript check.
- Voice FX and routing architecture checks.
- Bridge worklet syntax check.
- `git diff --check`.
- StudioFlow production build.

The source now contains explicit assertions for the dedicated `StreamAudio`
path, one-per-remote-stream rendering, and the absence of unmuted visual guest
video elements.

Not claimed as passed:

- Actual Host A / Co-host B audible test in Firefox Developer Edition.
- Measured microphone-to-headphone monitoring latency in a real browser.
- Two-device WebRTC listening and recording waveform inspection.
- Audible music and sound-effect acceptance during a live two-participant show.

Those require an isolated browser session with microphone permissions and two
participants. No production Worker, D1/R2, Crossroads data, owner browser
storage, or production recording was modified. No push or deployment was
performed.
