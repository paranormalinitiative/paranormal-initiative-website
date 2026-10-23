# StudioFlow Voice FX Foundation — TPI-STUDIOFLOW-020

Date: 2026-10-22

Status: Implemented and locally validated. Not deployed.

## Scope

StudioFlow now has a browser-local Voice FX foundation for hosts and invited guests. The implementation uses the Web Audio API, `AudioWorkletNode`, `MediaStreamAudioSourceNode`, and `MediaStreamAudioDestinationNode`.

The routing is:

```text
microphone -> Voice FX AudioWorklet -> processed MediaStream track -> WebRTC and program recording
```

Each participant receives an independent processor. Host and guest settings use separate local-storage keys, and the selected broadcast/studio identifier is included in the host key.

## Implemented effects

- Natural Voice bypass
- Deep Voice configuration using low-frequency filtering and gain shaping
- Robot ring modulation
- Telephone band filtering
- Megaphone filtering and soft saturation
- Echo with adjustable delay and feedback
- Reverb with adjustable mix
- Ghost modulation plus reverb
- Noise-gate threshold control
- Output-gain control with clipping protection

Basic pitch shifting is intentionally not exposed in the active pads. A timing-safe, independent pitch algorithm was not validated, so it remains experimental rather than pretending to be production-ready.

## Integration

- Host program audio mixing uses the processed host track while an effect is active.
- Host return-audio mixes use the same processed track for guests.
- Guest outgoing audio uses the processed track when active.
- Guest track changes use `RTCRtpSender.replaceTrack()` where an existing sender is available.
- The processed track is not added alongside the raw microphone track.
- Program, backstage, and live capture paths therefore receive the same processed host signal through the existing compositor.
- Processing failures fail closed. StudioFlow does not silently substitute the raw microphone; the user receives an error and must explicitly choose Natural Voice to return to the normal microphone path.
- Preview is user initiated and routed locally through a separate monitor gain. It does not create a second outgoing track.

## Files

Maintained StudioFlow source:

- `/Users/toddknipple/Documents/StudioFlow/web/src/voiceFx.ts`
- `/Users/toddknipple/Documents/StudioFlow/web/src/VoiceFxPanel.tsx`
- `/Users/toddknipple/Documents/StudioFlow/web/public/voice-fx-worklet.js`
- `/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx`
- `/Users/toddknipple/Documents/StudioFlow/web/src/styles.css`
- `/Users/toddknipple/Documents/StudioFlow/web/scripts/check-voice-fx.mjs`
- `/Users/toddknipple/Documents/StudioFlow/web/package.json`

Local implementation commit:

`8d1cfe8` — `Implement browser Voice FX foundation`

## Validation

Passed:

- `npm run check:voice-fx`
- `node --check public/voice-fx-worklet.js`
- `npm run build` (`tsc` and Vite production build)
- Isolated local StudioFlow runtime loaded successfully.
- Voice FX rail displayed all eight real presets.
- Robot selection changed the active pad state.
- Preview control was present and generated no console warnings or errors in the isolated runtime.
- Built output included `dist/voice-fx-worklet.js` with SHA-256 `d53ebaaf826079101aa01535ec714e7de5b1a276c69dc7425aea982e1c1c6ce1`.

Not yet demonstrated by this local pass:

- Two-device audible host/guest WebRTC acceptance.
- Physical microphone switching and reconnection.
- MediaRecorder audio inspection proving processed waveforms in a saved file.
- Firefox Developer Edition acceptance with a separate OS-level disposable profile.
- Mobile performance and latency measurements.

The available isolated browser runtime was used for non-owner UI verification. No Crossroads data, production D1/R2 data, owner browser storage, or Cloudflare deployment was accessed or changed.

## Deployment

No deployment was performed. TPI-STUDIOFLOW-020 explicitly requires local validation before any production deployment and separately authorizes production deployment. The generated `/studio/` deployment output was not changed by this record.

