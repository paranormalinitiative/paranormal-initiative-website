# StudioFlow Voice FX alignment with the working OpenVoiceChanger prototype

Date: 2026-10-22  
Status: Local repair verified; production deployment not authorized

## Why this change was made

The standalone prototype at `http://127.0.0.1:8892/` produced usable processed
audio, while the StudioFlow Voice FX panel could show an empty processed meter
and did not follow the prototype's audio contract. The goal of this repair was
to make the local StudioFlow test path use the same upstream bridge contract,
not to replace the OpenVoiceChanger DSP or add automatic amplification.

The reference implementation is the [OpenVoiceChanger repository](https://github.com/sioaeko/OpenVoiceChanger).

## Repair details

- Local acceptance mode now selects the original bridge automatically only
  when `studioflow_voicefx_test=1` is present on `127.0.0.1` or `localhost`.
- `studioflow_voicefx_engine=studioflow` still explicitly selects the browser
  fallback. Production URLs without the local test flag remain on the fallback
  processor.
- The original-engine `AudioContext` now requests 48 kHz, matching the working
  prototype and the bridge's 1,024-sample frame contract.
- The context resumes before worklet and graph startup, matching the prototype's
  user-initiated microphone flow.
- The capture graph now sends the post-input-gain signal directly to the bridge
  worklet while the analyser observes the same signal. An extra browser-side
  limiter is not inserted into the original-engine capture path.
- Returned WebSocket frames accept both `ArrayBuffer` and `Blob` payloads. Blob
  frames are converted with `arrayBuffer()` before the 8-byte sequence header
  and float32 payload are passed to the playback worklet.
- Mode presets match the working prototype's local EQ curves and pitch values:
  deep/masculine uses -6 semitones with low/high EQ shaping, feminine uses +5
  semitones with the corresponding EQ shaping, and Ghost uses the prototype's
  verified whisper/reverb/echo settings.
- Voice Output Volume remains the processed outgoing level. Monitor Volume
  remains a separate local headphone level; no automatic gain increase was
  added.

## Verification evidence

In the disposable local StudioFlow tab using:

```text
http://127.0.0.1:5173/?studioflow_voicefx_test=1&studioflow_voicefx_engine=openvoicechanger
```

the Voice FX panel reported:

- `Ready in this browser`
- Input level approximately `-51 dBFS`
- Processed level approximately `-50 dBFS` rather than `-∞`
- `Monitor my voice` switched to `Active`

This establishes that the browser graph received non-empty processed frames
from the local bridge and that the monitoring branch can be enabled. It does
not establish subjective sound quality; a person must still listen through
headphones in a disposable Firefox Developer Edition session before any
production decision.

Automated checks completed:

- `git diff --check` — passed
- `npx tsc --noEmit` — passed
- `npm run check:voice-fx` — passed
- Worklet JavaScript syntax checks — passed
- `npm run build` — passed

The build emitted only the existing large-chunk warning. The first sandboxed
build attempt was blocked from writing Vite's temporary config artifact; the
same build succeeded with the approved local development permission.

## Scope and safety

This is a local development repair. No production Worker, Cloudflare setting,
D1 database, R2 object, owner browser storage, Crossroads data, or production
recording was modified. No deployment was performed. Human audible acceptance
and any future production release remain separate gates.
