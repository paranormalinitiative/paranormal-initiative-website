# StudioFlow processed voice monitoring repair

Date: 2026-10-22
Status: Local repair complete; production not authorized

Source implementation commit: `5619e1b9052731dab126b5aefdf7137ad8018d0e`
Previous routing repair: `2c6d2320e2b618e9e659e493e42786f91de545e5`

## User-visible failure

The Voice FX panel could show an active microphone and an enabled monitor while
the processed level remained `−∞`, leaving no audible self-monitoring signal.

## Root cause

Two independent problems were present:

1. The fallback AudioWorklet applied a hard per-sample gate. Its previous
   thresholds (`0.006` and, in existing stored sessions, `0.012`) were above
   the disposable browser microphone's normal conversational samples. The gate
   therefore reduced the processed stream to silence and could also create
   clicks at the threshold boundary.
2. Local monitoring depended on a hidden HTML audio element playing a
   `MediaStream` destination. In some browser contexts that element could
   report playback without producing an audible monitor signal.

## Repair

- Replaced the fallback worklet's hard gate with a smoothed gate envelope.
- Natural/bypassed audio no longer passes through the enabled gate logic.
- Lowered the default gate threshold to `0.001` (`-60 dB`) for ordinary
  conversational input.
- Migrated existing stored defaults `0.006` and `0.012` to `0.001` so prior
  sessions do not remain silent.
- Added a dedicated `monitorGain` Web Audio branch from the processed analyser
  to `AudioContext.destination` in both the fallback and OpenVoiceChanger graph.
- Monitoring now resumes the AudioContext and ramps the direct monitor gain;
  it no longer relies on hidden-element `.play()` for the authoritative output.
- Monitor Volume remains local-only. The processed `MediaStreamAudioDestinationNode`
  still feeds WebRTC and recording separately.
- Added static regression checks for the smoothed gate and direct monitor branch.

## Verification

Automated checks passed:

- TypeScript check.
- `npm run check:voice-fx`.
- `node --check public/voice-fx-worklet.js`.
- `git diff --check`.
- StudioFlow production build (`vite build`).

Disposable local browser verification passed at
`http://127.0.0.1:5173/?studioflow_voicefx_test=1`:

- Voice FX reached `Ready in this browser`.
- The stored `-38 dB` gate migrated to `-60 dB`.
- Processed level changed from `−∞` to approximately `-50` to `-53 dBFS`
  while microphone input was present.
- `Monitor my voice` became enabled and the panel reported `Monitoring: Active`.
- The tab remained isolated; no Firefox Developer Edition owner tabs,
  Crossroads data, production Worker, D1/R2, or production recordings were
  modified.

The agent cannot independently confirm what the user's headphones physically
delivered. The repaired tab is left available for the user to speak normally
with headphones and confirm audible self-monitoring.

## Files changed

StudioFlow source:

- `public/voice-fx-worklet.js`
- `src/voiceFx.ts`
- `scripts/check-voice-fx.mjs`

Documentation:

- This record.

No push or deployment was performed.
