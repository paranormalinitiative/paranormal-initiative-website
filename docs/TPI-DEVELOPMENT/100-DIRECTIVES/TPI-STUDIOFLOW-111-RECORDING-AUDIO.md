# TPI-STUDIOFLOW-111 — Recording Audio Pipeline Repair Execution Record

Date: 2026-10-29
Result: **COMPLETE / ISOLATED DEVELOPMENT ONLY / NOT DEPLOYED**

## Scope and preservation

Directive 111 was executed against the approved Video Setup 091 source commit
`6b9c3c4b6b40f0496012e5d718d32d75e149dcf6` and the preserved Teleprompter
worktree. The repair was isolated in:

```text
/Users/toddknipple/Documents/StudioFlow/web-111
branch: codex/studioflow-111-recording-audio
base: 6b9c3c4b6b40f0496012e5d718d32d75e149dcf6
```

The original mixed checkout remained untouched at
`/Users/toddknipple/Documents/StudioFlow/web` (`main` @ `9f85f9d`). The
Teleprompter worktree remained untouched at
`/Users/toddknipple/Documents/StudioFlow/web-109` on
`codex/studioflow-109-teleprompter`, with its uncommitted implementation and
Directive 110 evidence preserved. The existing recovery patch remains present
with SHA-256
`6ae6d1a7ff879819feca8e1b4142d973ef4f6f109dd5155419a74079d8b7ec45`.

No production endpoint, Worker, production data, or permanent Studio deletion
behavior was changed.

## Authority and historical review

Reviewed before source modification:

- `AGENTS.md`
- `TPI-MASTER-AUTONOMOUS-AGENT-AUTHORITY.md`
- `TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md`
- `TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`
- `009-TESTING-AND-VERIFICATION.md`
- `TPI-CURRENT-DEVELOPMENT-STATUS.md`
- `TPI-DEVELOPMENT-AGENT-HANDOFF.md`
- `DIRECTIVE-INDEX.md`
- Directive records for 091, 092/109, 103, 106, 109 and 110

The directive-specific no-deployment instruction controlled this execution.

## Baseline comparison

Both builds used Firefox Developer Edition, Selenium/geckodriver, the same
synthetic camera and deterministic 440 Hz audio source, the same recording
duration, browser-native `decodeAudioData` inspection, and the same isolated
local serving approach.

| Build | Source | Fresh persisted mic volume | Source RMS | Program/recorder RMS | Decoded saved RMS | Result |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Approved 091 baseline | `/private/tmp/tpi111-091` @ `6b9c3c4` | absent | 0.0246631 | 0 | 0 | silent audio |
| Teleprompter 092 feature before repair | `/Users/toddknipple/Documents/StudioFlow/web-109` | absent | 0.0246 in prior D110 run | 0 in prior D110 run | silent/invalid in prior D110 recording | silent audio |
| Repaired isolated branch | `/Users/toddknipple/Documents/StudioFlow/web-111` | absent, fallback applied | 0.0247233 | 0.0246884 | 0.0246917 | valid audio |

The approved baseline and the feature path therefore both reproduced the
failure. This was a shared pre-existing 091 recording defect, not a
Teleprompter regression.

## Root cause

The first loss occurs at the host microphone gain in the program audio mix.
`useMediaDevices.ts` initialized the microphone volume with:

```ts
Number(window.localStorage.getItem("studioflow.micVolume"))
```

When the preference was absent or blank, JavaScript converted it to `0`.
`App.tsx` then applied that value to the host microphone `GainNode` before
connecting it to the shared `MediaStreamAudioDestinationNode`. The source
track was live and measurable, but the program destination and the exact
MediaStream passed to `MediaRecorder` carried zero signal.

The minimum repair makes the persisted-number reader return its supplied
fallback for null, blank, invalid, or non-finite values. The existing fallback
is `1`, preserving the intended default microphone gain. No recording graph,
Voice FX placement, compositor, Teleprompter, or deletion behavior was
redesigned.

## Implemented change

Changed only the isolated audio repair branch:

- `src/useMediaDevices.ts`: distinguish absent/blank storage from numeric zero
  and use the fallback value.
- `scripts/check-recording-audio.mjs`: four focused source regression checks.
- `package.json`: expose `npm run check:recording-audio`.

The saved evidence and probe scripts are under
`/Users/toddknipple/Documents/StudioFlow/web-111/.directive111-evidence/`.

## Recording evidence

The repaired fresh-default recording used `video/webm;codecs=vp8,opus`, saved
184,347 bytes, decoded in Firefox at 48 kHz stereo for 5.6935 seconds, and
measured RMS `0.0246917`, peak `0.0357468`, and approximately 442 Hz. Muted
browser playback reached ready state 4 and succeeded. The VP8 video stream is
1920x1080 and decoded successfully with an independent FFmpeg frame check.

The exact recorder stream contained live enabled video and audio tracks, and
the recorder-side audio analyser measured RMS `0.0246884` before stop.

An FFmpeg Opus-header warning also appears for an independent Firefox control
recording, while Firefox `decodeAudioData` and playback succeed. It is recorded
as a cross-decoder warning, not as a failure of the saved-media acceptance.

## Voice FX regression

All required modes passed with the repaired branch and the same synthetic
input:

| Mode | Recorder RMS | Decoded RMS | Frequency | Playback |
| --- | ---: | ---: | ---: | --- |
| Disabled | 0.0246884 | 0.0246917 | 441.995 Hz | PASS |
| Enabled | 0.0246884 | 0.0247000 | 440.347 Hz | PASS |
| Changed during recording | 0.0248174 | 0.0247310 | 442.228 Hz | PASS |
| Bypassed during recording | 0.0258765 | 0.0249146 | 441.889 Hz | PASS |

The Voice FX architecture check also passed.

## Required regression results

- Video Setup 091 browser suite: **9/9 PASS**.
- Focused Teleprompter source checks: **23/23 PASS**.
- Directive 110 Teleprompter acceptance: **39/39 PASS**.
- Screen-sharing privacy checks: **9/9 PASS**.
- Existing local RTMP privacy evidence: **PASS**; the private canary was
  absent from the decoded output.
- Recording with the Teleprompter open: **PASS**. The overlay remained visible,
  its canary remained in the presenter-only DOM, the recorder kept live video
  and audio tracks, recorder RMS was `0.0246448`, and saved Firefox-decoded
  audio RMS was `0.0247231` with successful playback.
- Teleprompter text remains outside the canvas compositor used for recording and
  streaming; the preserved Directive 110 capture evidence confirms privacy.

## Verification commands

```text
npm run build
npm run check:recording-audio
npm run check:voice-fx
npm run check:room
npm run check:rtmp
npm run check:destinations
TPI_091_BASE_URL=http://127.0.0.1:5182 node scripts/verify/tpi-studioflow-091-video-setup.mjs
node scripts/check-teleprompter.mjs
```

The maintained 091 suite, focused Teleprompter suite, browser recording probes,
saved-media decodes, and `git diff --check` all passed in the isolated
development environment.

## Commit and integration boundary

The verified repair is committed only on
`codex/studioflow-111-recording-audio` at commit `4b44d36`.
It is not merged into the uncommitted
Teleprompter branch automatically. The next integration directive must
cherry-pick or port this focused commit into `web-109`, re-run the combined
Teleprompter and audio acceptance, and review the resulting diff before any
release workflow.

Production deployment: **NOT DEPLOYED**.

## Final report

```text
Directive: TPI-STUDIOFLOW-111
Result: COMPLETE
AGENTS.md Reviewed: YES
Development Playbook Reviewed: YES
Approved 091 Baseline Audio: FAIL (reproduced pre-existing silence)
Teleprompter Feature Audio Before Repair: FAIL (reproduced)
Failure Reproduced: YES
Root Cause Identified: YES
Root Cause: absent/blank micVolume became 0 through Number(null/blank), muting the program microphone GainNode before MediaRecorder
Audio Repair Implemented: YES
Microphone Source Signal: PASS
Program Audio Mix: PASS after repair
MediaRecorder Audio Input: PASS
Saved Audio Decoding: PASS
Saved Audio Signal: PASS
Saved Video Playback: PASS
Voice FX Regression: PASS
Video Setup 091 Regression: PASS
Teleprompter 092 Regression: PASS
Recorded Teleprompter Privacy: PASS
Original Development Preserved: YES
Teleprompter Work Preserved: YES
Feature Branch: codex/studioflow-111-recording-audio
Commit SHA: 4b44d36
Production Deployment: NOT DEPLOYED
Remaining Issues: isolated audio repair must be explicitly integrated into web-109; FFmpeg warning is a cross-decoder compatibility note while Firefox decode/playback pass
Recommended Next Action: review and integrate the isolated audio commit into the Teleprompter branch in a separate directive, then repeat guarded release acceptance
```
