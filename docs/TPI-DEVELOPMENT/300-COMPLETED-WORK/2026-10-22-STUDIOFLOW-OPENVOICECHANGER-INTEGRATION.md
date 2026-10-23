# StudioFlow OpenVoiceChanger original-source integration

Date: 2026-10-22  
Status: Local prototype implemented; production deployment not authorized

Upstream: [sioaeko/OpenVoiceChanger](https://github.com/sioaeko/OpenVoiceChanger)  
Upstream commit: `8e6a00c628eafc0fd1d68c6bc13f2c17b8a46ea1`  
Upstream version: `2.1.0`

## Result

An isolated localhost bridge now runs the original OpenVoiceChanger
model-free `EffectsChain` and can be selected from the maintained StudioFlow
source with the explicit query parameter:

```text
?studioflow_voicefx_engine=openvoicechanger
```

The normal StudioFlow processor remains the default. The opt-in path is not a
production deployment architecture: it requires a locally running Python
bridge on `127.0.0.1:8891`, and it fails closed if that bridge is unavailable
or disconnects. No external audio service is used.

## Original implementation verified

The isolated upstream checkout is `/private/tmp/tpi-openvoicechanger-research`
at commit `8e6a00c628eafc0fd1d68c6bc13f2c17b8a46ea1`.

The integration imports, rather than rewrites, the upstream implementation:

- `backend/services/dsp_effects.py` — stateful dual-tap pitch shifting,
  streaming STFT/cepstral-envelope formant shifting, and the model-free effect
  chain.
- `backend/services/audio_processor.py` — the upstream 8-byte framed float32
  PCM protocol helpers.
- The model-free chain includes gate, pitch, formant, robot, whisper,
  telephone, distortion, bitcrush, chorus, echo, reverb, EQ, compressor, and
  gain processing.

The upstream repository is MIT licensed, Copyright (c) 2024 Sioaeko. The
isolated prototype retains the complete notice in
`/private/tmp/tpi-openvoicechanger-integration-20261022/NOTICE-OpenVoiceChanger.txt`.
Upstream Python dependencies remain outside StudioFlow and require their own
license review before any server or bundled runtime could be released.

## Local architecture

```text
StudioFlow microphone
  -> browser AudioWorklet capture
  -> localhost WebSocket bridge
  -> original OpenVoiceChanger EffectsChain
  -> browser AudioWorklet playback
  -> MediaStreamAudioDestinationNode
  -> existing StudioFlow WebRTC / recording seam
```

The bridge is at:

`/private/tmp/tpi-openvoicechanger-integration-20261022/bridge.py`

The isolated browser page is at:

`/private/tmp/tpi-openvoicechanger-integration-20261022/index.html`

StudioFlow's bridge framing worklet is:

`/Users/toddknipple/Documents/StudioFlow/web/public/openvoicechanger-bridge-worklet.js`

StudioFlow's opt-in adapter and settings mapping are in:

`/Users/toddknipple/Documents/StudioFlow/web/src/voiceFx.ts`

The adapter maps the existing StudioFlow controls to the upstream protocol:
pitch semitones, resonance/formant shift, clarity/EQ, output gain, gate,
robot, telephone, megaphone, ghost, echo, and reverb. Existing host/guest
processed-track routing remains the integration seam; raw audio is not added
as a second track by this adapter. The first settings message negotiates the
browser AudioContext sample rate and the 4,096-sample frame size with the
bridge so pitch and formant processing use the actual browser rate.

## Verification completed

- Upstream focused protocol, preset, offline, and WebSocket bypass tests:
  passed.
- Synthetic OpenVoiceChanger rendering produced WAV outputs for natural,
  masculine/deep, feminine, and robot settings. This used generated tones,
  not owner or production audio.
- Synthetic live bridge test: three framed PCM chunks returned with matching
  lengths; measured DSP times were 2.054 ms, 1.127 ms, and 1.238 ms for
  4,096-sample frames at 48 kHz (85.333 ms of audio per frame).
- StudioFlow TypeScript check: passed.
- StudioFlow Voice FX architecture checks: passed, including both bridge
  worklet registrations and the opt-in engine path.
- Bridge worklet JavaScript syntax check: passed.
- StudioFlow production build: passed.

These are source, synthetic, and protocol checks. They do not establish
acceptable perceived voice quality.

## Pending acceptance

Actual microphone capture, headphone monitoring, and human listening tests in
Firefox Developer Edition remain pending. The browser session was not reused
because it contained the owner's existing tabs and browser storage. No claim
is made that masculine, feminine, formant, or custom transformations are
audibly acceptable until a disposable Firefox profile is used for that test.

The bridge also remains a development prototype. Releasing it would require a
maintained service/runtime decision, authentication and lifecycle handling,
per-participant isolation, latency monitoring, reconnect behavior, deployment
packaging, and independent dependency-license review.

## Safety boundary

No production Worker, Cloudflare setting, D1 database, R2 object, owner
browser storage, Crossroads data, or production recording was modified. No
production deployment was performed. The current StudioFlow processor remains
the default until real microphone and listening acceptance demonstrates a
measurable improvement.
