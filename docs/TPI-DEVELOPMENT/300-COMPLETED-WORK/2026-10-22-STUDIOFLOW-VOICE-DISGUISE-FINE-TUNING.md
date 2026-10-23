# StudioFlow Voice Disguise, Fine-Tuning, and Settings Integration

Date: 2026-10-22
Status: Implemented locally; production deployment not authorized
Scope: TPI-STUDIOFLOW-021 / Project Deep Throat

## Implementation

The browser Voice FX foundation was extended without introducing a second live microphone graph.

- `Settings → Voice FX` is now the primary host configuration and testing surface.
- The setup screen and live studio Voice FX rail share the App-level host controller.
- Guests retain an independent controller and receive the same mode, fine-tuning, preview, and private test-recording controls in the guest interface.
- Voice disguise has persistent ON/OFF state with settings retained while bypassed.
- Modes are `Masculine`, `Feminine`, and `Custom`.
- Masculine starts from Deep Voice at a downward pitch; Feminine uses the timing-safe browser pitch path with an upward default; Custom preserves the participant's selected settings.
- Pitch, resonance, clarity, output gain, noise gate, echo, and reverb controls are exposed only where the processor implements them.
- Preview is participant initiated and routed locally through the processed graph.
- The short test recording uses the processed `MediaStream` and `MediaRecorder`, creates an in-memory object URL, and is never uploaded, persisted, or added to the program recording.
- Privacy-sensitive effects continue to fail closed when the processor reports an error; the natural microphone is not silently substituted.

## Audio processing

`public/voice-fx-worklet.js` now includes a browser-side granular pitch stage, resonance spectral-color control, and clarity shaping before the existing effect processors. The pitch stage is intended to preserve output timing rather than changing playback speed. Independent formant shifting is not claimed; resonance is a supported spectral-color adjustment, not a formant-preserving voice-conversion system.

Existing WebRTC and recording integration remains based on the processed track and `RTCRtpSender.replaceTrack()` behavior from the Voice FX foundation. No Cloudflare Worker, D1, R2 object, owner browser storage, or Crossroads data was changed.

## Files changed in the maintained StudioFlow source

- `/Users/toddknipple/Documents/StudioFlow/web/src/voiceFx.ts`
- `/Users/toddknipple/Documents/StudioFlow/web/src/VoiceFxPanel.tsx`
- `/Users/toddknipple/Documents/StudioFlow/web/public/voice-fx-worklet.js`
- `/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx`
- `/Users/toddknipple/Documents/StudioFlow/web/src/styles.css`
- `/Users/toddknipple/Documents/StudioFlow/web/scripts/check-voice-fx.mjs`

## Verification

Automated checks completed:

- `npm run check:voice-fx` — passed.
- `node --check public/voice-fx-worklet.js` — passed.
- `npx tsc --noEmit` — passed.
- `npm run build` — passed; Vite emitted a new JS/CSS bundle and the Voice FX worklet.
- Disposable in-app browser smoke — passed: live Voice FX rail loaded, mode buttons appeared, Masculine selected Deep Voice with `-4.0 st`, Settings → Voice FX opened, fine-tune controls appeared, and a local test recording produced a playable in-memory audio control.

Pending manual acceptance:

- Audible Masculine/Feminine/Custom quality and intelligibility.
- Two-device host/guest WebRTC listening test.
- Program recording waveform/audio inspection proving processed audio in a real session.
- AudioWorklet failure simulation with an actual microphone.
- Firefox Developer Edition and mobile-device performance testing.

These items are not claimed as passed based solely on compilation or UI smoke testing.

## Deployment

No production deployment was performed. The generated `dist/` output remains local build output and was not copied into the canonical TPI deployment tree.
