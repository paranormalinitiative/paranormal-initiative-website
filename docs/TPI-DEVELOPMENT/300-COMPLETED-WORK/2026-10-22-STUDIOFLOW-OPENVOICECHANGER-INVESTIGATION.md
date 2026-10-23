# StudioFlow OpenVoiceChanger voice-FX investigation

Date: 2026-10-22
Status: Investigation complete; no production audio-routing changes
Upstream examined: [sioaeko/OpenVoiceChanger](https://github.com/sioaeko/OpenVoiceChanger)
Upstream commit examined: `8e6a00c628eafc0fd1d68c6bc13f2c17b8a46ea1`

## Executive result

OpenVoiceChanger is a useful reference for StudioFlow, but it is not a
browser-only voice-FX implementation. Its browser AudioWorklet captures and
plays audio while a Python FastAPI service performs the model-free DSP and
optional ONNX/RVC inference over a binary WebSocket. The model-free DSP is
technically separable from the server, but the upstream code does not already
provide a drop-in browser implementation.

StudioFlow can support independent host and guest effects without a new media
provider if processing is performed in each participant's browser. The safe
integration seam is a processed `MediaStreamAudioDestinationNode` track:

```text
microphone -> AudioWorklet DSP -> processed MediaStreamTrack
           -> guest RTCPeerConnection and/or StudioFlow program audio mix
           -> host return audio and MediaRecorder
```

The raw microphone track must not be added to the guest peer connection or the
program recorder when Voice FX is active. This investigation did not change
that routing.

## Upstream findings

The upstream README describes binary WebSocket streaming and an AudioWorklet,
model-free DSP, a 12-effect server-side rack, and 16 built-in presets
([README.md lines 29-45](https://github.com/sioaeko/OpenVoiceChanger/blob/main/README.md#L29-L45)).
The protocol sends PCM frames to `/ws/audio` and receives processed frames
back; settings such as pitch, formant, and effects are JSON updates
([README.md lines 272-296](https://github.com/sioaeko/OpenVoiceChanger/blob/main/README.md#L272-L296)).

The actual implementation confirms:

- `backend/services/dsp_effects.py:1-9` is a stateful NumPy/SciPy streaming
  engine; each connection owns its own delay lines, filters, LFOs, and phases.
- `backend/services/dsp_effects.py:85-193` contains the model-free pitch
  shifter and STFT/cepstral formant shifter.
- `backend/services/dsp_effects.py:196-520` contains the effect processors.
- `backend/services/dsp_effects.py:529-618` composes the gate, pitch, formant,
  and ordered post-effect chain.
- `backend/routers/websocket.py:62-175` accepts the browser WebSocket and
  configures one per-connection stream.
- `backend/routers/websocket.py:320-445` processes incoming frames and sends
  processed PCM frames back to the browser.
- `frontend/public/audioWorklet.js` contains capture and playback buffering;
  it does not contain the upstream DSP chain.
- `frontend/src/hooks/useAudioPipeline.js:240-340` sends captured worklet
  chunks to the WebSocket and records the returned processed PCM.

### Verified 12 DSP effects

1. Noise gate
2. Robot ring modulation
3. Whisper/noise excitation
4. Telephone band-pass and saturation
5. Distortion
6. Bitcrush
7. Chorus
8. Echo
9. Reverb
10. Tone EQ
11. Compressor
12. Output gain

### Verified 16 built-in presets

Clean, Chipmunk, Helium, Deep Voice, Monster, Robot, Alien, Whisper, Ghost,
Telephone, Megaphone, Radio DJ, Cave, Stadium, Underwater, and Arcade.

These are ordinary preset combinations of pitch, formant, and effect-rack
settings. “Voice disguise” is a product goal rather than a cryptographic
anonymity guarantee.

## Browser-only versus server-dependent capability

| Capability | Browser-only feasibility | Upstream status |
| --- | --- | --- |
| Mic capture, monitoring, gain, mute | Yes | Browser capture and Web Audio are used |
| Gate, robot, telephone, distortion, bitcrush | Yes | Suitable for AudioWorklet adaptation |
| Echo, reverb, chorus, EQ, compression | Yes | Suitable for AudioWorklet adaptation; state must remain per participant |
| Lightweight pitch shift | Possible | Upstream uses a Python NumPy delay-line implementation |
| High-quality pitch + formant preservation | Requires dedicated DSP/WASM work | Upstream uses Python SciPy/STFT processing |
| RVC/ONNX voice conversion | Not realistically browser-only for this integration | Requires Python/runtime/model assets in upstream |
| Multi-participant isolation | Yes | One processor and state object per participant |
| WebRTC processed-track transmission | Yes | Requires StudioFlow track substitution |
| Recording processed output | Yes | Requires recorder/compositor to consume processed tracks |
| Guest pre-join preview | Yes | Requires a guest-side processor before `addTrack` |

## StudioFlow integration evidence

The maintained StudioFlow source currently captures the microphone in
`src/useMediaDevices.ts:207-307`, exposes it as `media.userStream`, and uses
that stream for the existing device meter and room flow.

The host program audio graph is in `src/App.tsx:6157-6272` and
`src/App.tsx:6417-6445`. It currently mixes the raw `media.userStream` audio
track, screen audio, staged guest audio, background music, sound effects, and
clip audio into a `MediaStreamAudioDestinationNode`.

The program recorder/compositor consumes the mixed destination stream in
`src/App.tsx:8010-8100`. This is the correct place to preserve processed host
audio in recordings, provided the input list is changed to use the processed
track rather than the raw microphone track.

The guest currently adds the raw microphone track directly to its peer
connection in `src/App.tsx:10842-10865`. This is the critical future
integration point: when effects are active, the guest must add only the
AudioWorklet destination track. The original microphone track must not be
added in parallel.

The host's return-audio mix is built in `src/App.tsx:6340-6407`; it already
creates a per-guest destination track and sends program audio back. That path
can carry processed host audio and stage audio after the input selection is
made explicit.

## Isolated prototype

An isolated browser prototype was created outside the application source at:

`/private/tmp/tpi-openvoicechanger-research/browser-prototype/`

It contains `index.html`, `dsp-worklet.js`, and `README.md`. It supports a
synthetic test tone and microphone input, browser AudioWorklet processing,
robot modulation, echo, reverb, gate, gain, a lightweight pitch-shift
prototype, and a processed `MediaStreamAudioDestinationNode`.

Static validation passed (`node --check dsp-worklet.js`). The prototype was
not connected to StudioFlow and was not deployed. It demonstrates the
architecture and stream handoff, not production-quality formant-preserving
voice disguise.

## Tests and provenance

- OpenVoiceChanger Python suite: **288 passed** after running with temporary
  loopback-port permission.
- OpenVoiceChanger frontend suite: **183 passed across 26 files**.
- OpenVoiceChanger frontend lint: **passed**.
- OpenVoiceChanger frontend build: **passed**.
- No StudioFlow source, bridge, Worker, D1, R2, room data, owner browser
  storage, or Crossroads data was modified.

## Licensing

The upstream repository is MIT licensed, copyright Sioaeko 2024. Any copied
substantial source must retain the MIT copyright and permission notice from
`LICENSE`. The upstream dependency list has independent licenses and includes
FastAPI/Uvicorn, NumPy/SciPy, ONNX Runtime, PyTorch, fairseq, librosa,
pyworld, and related runtime packages. Those dependencies must be reviewed
individually before reuse; the upstream MIT license does not relicense them.

No OpenVoiceChanger source was copied into StudioFlow during this investigation.

## Recommended implementation phases

1. **Browser DSP foundation:** add a maintained StudioFlow AudioWorklet module
   with explicit per-participant state, bypass, reset, CPU/latency telemetry,
   and a processed destination stream. Start with gate, robot, telephone,
   echo, reverb, gain, and compressor.
2. **Host routing:** select the processed host track in the program audio mix,
   recording, live output, and guest return mix. Preserve a fail-closed state
   if processing cannot start; never silently fall back to sending raw audio
   while the UI says the effect is active.
3. **Guest routing:** run the same processor in the invitation page before
   `RTCPeerConnection.addTrack`. Test pre-join preview, activation, disable,
   device changes, reconnect, and one independent processor per guest.
4. **Pitch/formant quality:** implement and measure a real browser-capable
   pitch/formant algorithm, likely in optimized AudioWorklet/WASM code. The
   prototype's lightweight pitch path is not sufficient for anonymous voice
   disguise.
5. **Recording/privacy acceptance:** verify that processed audio, not raw
   audio, reaches WebRTC and all recording paths; document that voice disguise
   is not guaranteed anonymity; add explicit consent for any raw-audio capture.
6. **SMART Pad UI:** only after routing is proven, add the host/guest Voice FX
   panel using StudioFlow's existing pad language, with active state, reset,
   preview, controls, and per-participant persistence.

## Decision

Proceeding directly by copying OpenVoiceChanger's Python server into
StudioFlow would violate the browser-first preference and add a new runtime
service. The recommended path is an independent browser AudioWorklet DSP
implementation informed by the upstream algorithms, followed by explicit
processed-track integration in host and guest routing. This directive's
investigation and prototype are complete; no production Voice FX feature is
claimed or deployed.
