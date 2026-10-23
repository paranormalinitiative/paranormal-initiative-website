# StudioFlow microphone gain and voice calibration

Date: 2026-10-22  
Status: Local implementation complete; audible acceptance pending; production not authorized

Related implementation commit: `836ff01f125a0a9d8ccb1cac6b9ad94dc7badb2b`  
OpenVoiceChanger integration: [original-source integration record](./2026-10-22-STUDIOFLOW-OPENVOICECHANGER-INTEGRATION.md)

## Root cause identified

The low processed voice level was a signal-management problem rather than a
single missing volume setting:

1. The OpenVoiceChanger browser path passed the raw browser microphone directly
   to the capture worklet. There was no adjustable input gain stage.
2. The processed return stream had no independent browser-side output gain;
   the existing `outputGain` setting was mixed into effect configuration rather
   than clearly separated from local monitoring.
3. Monitor playback was fixed at HTML audio volume `1`, with no participant
   monitor-volume control.
4. Auto Level was not enabled. The original engine's compressor existed but
   was not being requested by StudioFlow.
5. The default OpenVoiceChanger gate mapped `0.012` to approximately `-38 dB`.
   That can attenuate quieter conversational speech even when the microphone
   is working. The default was lowered to `0.006` (approximately `-44 dB`) and
   remains adjustable.
6. The original telephone effect can substantially reduce level; synthetic
   0.12-amplitude input measured approximately `0.005` RMS after that effect,
   compared with approximately `0.085` RMS for the unprocessed signal. The
   new post-engine output stage and limiter address level recovery without
   changing the original DSP implementation.

## Implemented signal path

```text
Microphone
  -> adjustable Microphone Gain
  -> input analyser / meter
  -> input limiter
  -> original OpenVoiceChanger DSP bridge
  -> adjustable Voice Output Volume
  -> output limiter / processed analyser
  -> MediaStreamAudioDestinationNode
  -> WebRTC and recording

Processed destination
  -> independent HTML monitor volume
  -> selected headphones/output device only
```

Monitor Volume never changes the processed destination stream. Voice Output
Volume does not change local monitor volume. Gain changes use smoothed Web
Audio automation, so they do not restart the microphone, WebSocket, WebRTC,
or recording paths.

Auto Level is exposed only for the opt-in OpenVoiceChanger engine and maps to
the original compressor with a conservative `-24 dB` threshold and `3:1`
ratio. It is not presented as an implemented feature on the fallback
processor.

## UI and meters

The live Voice FX panel now provides:

- Microphone Gain with neutral `1.00x` / `0 dB` reference.
- Voice Output Volume for WebRTC and recording.
- Monitor Volume for headphones only.
- Adjustable Noise Gate with a dB display and an off position.
- OpenVoiceChanger Auto Level toggle.
- Input Level and Processed Level meters based on real `AnalyserNode`
  time-domain RMS and peak data.
- Explicit clipping indications.

Both host and guest controllers use independent settings storage and graph
instances. The fail-closed behavior remains unchanged: a bridge failure does
not silently substitute the natural microphone.

## Files changed

Maintained StudioFlow source:

- `src/voiceFx.ts`
- `src/VoiceFxPanel.tsx`
- `src/styles.css`
- `scripts/check-voice-fx.mjs`

## Verification

Passed:

- TypeScript check.
- Voice FX architecture checks.
- Bridge worklet syntax check.
- StudioFlow production build.
- Existing focused OpenVoiceChanger protocol/preset/offline/WebSocket tests.

Pending and not claimed as passed:

- Actual normal-distance microphone acceptance.
- Human listening comparison of masculine/feminine/telephone output.
- Two-participant host/guest audible level test.
- Recording waveform and clipping acceptance.
- Firefox Developer Edition microphone permission and headphone test.

The in-app browser displayed the local prototype but did not complete
microphone startup. No owner browser storage, Crossroads data, production
Worker, production D1/R2, or production recording was modified. No push or
deployment was performed.
