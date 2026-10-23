# StudioFlow audio latency, clicking, and Ghost repair

Date: 2026-10-22  
Status: Local implementation and synthetic bridge validation complete; human microphone acceptance pending; production not authorized

Source implementation commit: `0eb009d`  
OpenVoiceChanger upstream inspected: `8e6a00c628eafc0fd1d68c6bc13f2c17b8a46ea1`

## Root causes

The browser bridge used 4,096-sample frames at 48 kHz. Each frame therefore
represented 85.333 ms of audio. The playback worklet stored up to twelve frames
in a sample ring, allowing approximately 1.024 seconds of queued audio. It had
no startup jitter buffer, no sequence validation, and immediately emitted hard
zero-fill when the ring ran empty. Those choices could produce both an
uncomfortable monitoring delay and discontinuities heard as clicking or
crackling.

The browser also discarded the response sequence number before handing samples
to the playback worklet, so the worklet could not detect stale or missing
frames.

Ghost was not an invented StudioFlow effect. The inspected upstream preset at
`backend/services/preset_store.py` defines Ghost as pitch `-2`, whisper mix
`0.6`, reverb size `0.85` / mix `0.5`, and echo time `0.42` / feedback `0.45` /
mix `0.3`. The upstream `WhisperEffect` deliberately replaces excitation with
envelope-shaped noise. A 0.6 noise mix is valid for a whisper preset but is too
dominant for intelligible spoken podcast audio, which explains the static-like
result.

## Repairs

- Reduced the bridge frame size to 1,024 samples: 21.333 ms at 48 kHz.
- Preserved the bridge sequence number end-to-end and added stale-frame and
  sequence-gap handling.
- Replaced the 12-frame sample ring with a bounded eight-frame queue.
- Added a two-frame startup prebuffer, approximately 42.667 ms, to avoid
  starting playback before the first response frames arrive.
- Added a short 64-sample gain ramp at startup and after an underrun to avoid
  hard discontinuities. The queue remains bounded so it cannot silently grow
  to a one-second monitoring backlog.
- Kept the original OpenVoiceChanger DSP components for Ghost, but changed the
  StudioFlow Ghost mapping to whisper mix `0.12`, reverb size `0.75` / mix capped
  at `0.42`, and echo feedback capped at `0.34` / mix `0.2`. This is a parameter
  correction, not a replacement engine.
- Preserved Directive 024 input gain, output gain, monitor gain, noise gate,
  Auto Level, meters, limiters, independent participant graphs, and fail-closed
  processing behavior.

## Measurements

The local bridge was measured at 48 kHz using synthetic 145 Hz speech-like
input and six sequential frames per case:

| Case | Frame | Round-trip mean | DSP mean | Sequence result |
| --- | ---: | ---: | ---: | --- |
| Natural | 21.333 ms | 0.621 ms | 0.018 ms | 0, 1, 2, 3, 4, 5 |
| Repaired Ghost | 21.333 ms | 0.990 ms | 0.431 ms | 0, 1, 2, 3, 4, 5 |

The previous frame duration was 85.333 ms, before accounting for browser
capture, queueing, bridge scheduling, and audio output. The new measurements are
bridge timing, not a claim of complete microphone-to-headphone latency. Actual
end-to-end latency and human listening remain pending because isolated Firefox
microphone startup was not available in this run.

The upstream Ghost parameters and the repaired parameters both produced finite,
non-clipping synthetic output. RMS changed from `0.031543` to `0.032117` in a
12-frame comparison; peak changed from `0.126952` to `0.079547`. This is a
signal-integrity comparison, not a substitute for listening acceptance.

All mapped presets also completed a synthetic one-frame integrity pass with
finite output: Natural, Deep, Feminine, Robot, Telephone, Megaphone, Ghost,
Echo, and Reverb. That pass does not establish that every preset sounds good to
a human listener.

## Verification

Passed:

- `npx tsc --noEmit`
- `node --check public/openvoicechanger-bridge-worklet.js`
- `npm run check:voice-fx`
- `npm run build`
- Focused upstream tests:
  `tests/test_audio_protocol.py`, `tests/test_preset_settings.py`,
  `tests/test_offline_conversion.py`, and `tests/test_websocket_bypass.py`
- Synthetic bridge timing, sequence continuity, Ghost integrity, and all
  mapped-preset finite-output checks
- Prototype worklet syntax check and `git diff --check`

Not claimed as passed:

- Actual audible Natural clicking test through Firefox Developer Edition.
- Actual end-to-end microphone-to-headphone latency measurement.
- Human listening acceptance for Ghost intelligibility.
- Two-participant WebRTC audible test.
- Recording waveform acceptance.
- Firefox microphone permission/startup acceptance.

No production Worker, production D1/R2, Crossroads data, owner browser storage,
or production recording was modified. No push or deployment was performed.
