# StudioFlow Voice FX Live Monitoring and Fine-Tuning

Date: 2026-10-22  
Directive: TPI-STUDIOFLOW-022  
Scope: local development and validation only

## Implementation

StudioFlow now uses one active Voice FX controller for the host across setup,
the active studio, and Settings → Voice FX. The guest path continues to use an
independent controller. Both paths share the same processing configuration for
outgoing audio, WebRTC, recording, and local monitoring.

The Voice FX panel now provides:

- Persistent Voice FX enable/disable.
- Live mode and effect selection.
- Live pitch, resonance, clarity, gain, noise-gate, echo, and reverb controls.
- An independent `Monitor my voice` control.
- Microphone, Voice FX, and monitoring status indicators.
- A headphone/feedback warning.
- Processing and monitoring error messages.

## Monitoring routing

The processing graph continues to produce the `MediaStreamAudioDestinationNode`
used by StudioFlow's outgoing audio path. Monitoring reads that same processed
destination stream through a dedicated, browser-owned audio element. It is not
connected to the recording mix and does not create a second outgoing track.

Monitoring is session-local and starts only after the participant explicitly
enables it. When available, the selected speaker device is applied through
`HTMLAudioElement.setSinkId()`. Turning monitoring off pauses only the local
monitoring element; it does not disable Voice FX, replace the microphone track,
or interrupt a recording/session.

If the browser rejects playback or the selected output is unavailable, the UI
reports an understandable monitoring error. Processing failure behavior remains
fail-closed through the existing Voice FX output readiness and privacy gates.

## Removed workflow

The Voice FX-specific private test recording workflow was removed from
`VoiceFxPanel.tsx`. The panel no longer exposes Record Test, Stop Test Recording,
Play Test Recording, or Record Again, and it no longer owns a `MediaRecorder`.

StudioFlow's unrelated program, streaming, and backstage recording paths were
not removed or changed by this directive.

## Files changed in the StudioFlow source

- `src/voiceFx.ts` — session-local monitoring graph, output-device routing,
  monitoring state, and error handling.
- `src/VoiceFxPanel.tsx` — live monitoring UI, fine-tuning controls, status, and
  removal of the private test-recording UI.
- `src/App.tsx` — shared host controller wiring and guest panel cleanup.
- `src/styles.css` — monitoring/status presentation.
- `scripts/check-voice-fx.mjs` — architecture checks for monitoring and removal
  of the Voice FX test-recording workflow.

## Verification

Passed locally in `/Users/toddknipple/Documents/StudioFlow/web`:

- `npm run check:voice-fx`
- `node --check public/voice-fx-worklet.js`
- `npx tsc --noEmit`
- `npm run build`
- Firefox Developer Edition UI smoke: the isolated local StudioFlow tab shows
  the Voice FX panel, live fine-tuning controls, `Monitor my voice`, headphone
  guidance, and active/off status indicators; the private test-recording
  controls are absent.

Not claimed as completed by automated verification:

- Audible microphone monitoring with headphones.
- Two-device host/guest voice verification.
- Program recording inspection of processed audio.
- Mobile-browser audio-output behavior.
- Firefox `setSinkId()` behavior on a specific hardware output.

Those require a real microphone/session and should be performed with disposable
data and headphones before any production authorization. Production was not
deployed, and no production D1, R2, Crossroads, or owner browser data was
modified.
