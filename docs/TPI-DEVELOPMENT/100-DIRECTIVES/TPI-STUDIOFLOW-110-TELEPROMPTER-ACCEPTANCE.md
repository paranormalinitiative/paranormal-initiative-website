# TPI-STUDIOFLOW-110 — Teleprompter 092 browser acceptance and recording verification

Date: 2026-10-29. **Result: BLOCKED / DEVELOPMENT ONLY / NOT DEPLOYED.**

## Source and preservation

The Directive 109 feature remains in isolated StudioFlow worktree
`/Users/toddknipple/Documents/StudioFlow/web-109`, branch
`codex/studioflow-109-teleprompter`, based on `6b9c3c4b6b40f0496012e5d718d32d75e149dcf6`.
The feature files remain uncommitted (`package.json`, `src/App.tsx`,
`src/styles.css`, and `scripts/check-teleprompter.mjs`). A recoverable patch of
the three tracked feature edits and a copy of the focused check are preserved in
that worktree's `.directive110-evidence/` directory; hashes are in
`directive110-results.json`. Generated captures, browser scripts and disposable
browser data also remain local in that evidence directory and are not staged in
Git. No commit, merge, push, website asset staging, or deployment occurred.

The original mixed checkout `/Users/toddknipple/Documents/StudioFlow/web` was
not edited by Directive 110. It remained on `main` with the pre-existing
modifications in `src/App.tsx` and `src/styles.css`. The website checkout stayed
on `codex/tpi-development` at `8ebc22f9b67d09aec6d49339e82c3a17cf270207`; its
existing Directive 109 documentation edits were retained and extended with this
execution record. No production endpoint was contacted. Production remains
undeployed and the Directive 106 baseline is unchanged.

## Development build and Firefox acceptance

The isolated Vite service at `http://127.0.0.1:5178/` served the actual
`web-109` source (not production assets). Firefox Developer Edition and
Geckodriver/Selenium ran with isolated headless browser profiles and synthetic
media. `npm run build` passed (TypeScript + Vite; existing large-chunk advisory),
`npm run check:teleprompter` passed 23/23, and `npm run check:voice-fx` passed.

The Firefox teleprompter acceptance passed 39/39. Two disposable Studios with
separate assigned scripts confirmed scoped lists and no cross-Studio script
exposure; speed and text size controls; play, pause, resume, reset, manual scroll;
close/reopen persistence; Studio-switch scroll stop and preference restoration;
and full-app-reload restoration. No browser application errors were recorded.

Screen-share privacy passed 9/9 against instrumented `getDisplayMedia`: the
toolbar, Present menu and Shift+S route dismissed the reader before capture was
requested; chooser cancellation left a usable state; active synthetic share
prevented reopening; stopping share restored teleprompter availability. This
covers host-initiated app flows, not OS-level external monitor capture or every
browser/vendor capture mode.

## Actual media output

**Livestream output privacy: PASS.** A local-only RTMP receiver captured the
supported output while a unique script canary was visible in the reader and
teleprompter controls were exercised. The finalized 1920×1080 H.264/AAC output
was decoded and its extracted frames inspected/OCR-checked; the unique phrase
was absent. No public stream or external platform was used. Evidence:
`livestream-canary.mkv`, `livestream-frames/`, `livestream-ocr.txt`, and
`livestream-privacy.json` in the isolated worktree evidence directory.

**Recorded video privacy: PASS. Recording/audio functionality: BLOCKED.** The
application saved a playable WebM with 1920×1080 VP8 video and an Opus track
while the reader/canary remained visible; decoded frames were OCR-checked and
contained no canary. The saved audio decodes to silence (FFmpeg mean/max −91 dB)
and reports malformed Opus packet headers, so recorded audio is not accepted.
An independent Firefox loopback control recorded its synthetic microphone and
AudioContext tone successfully: both decoded at −23 dB, and the live tone RMS
was 0.0619. In an instrumented app run, the injected synthetic input measured
about 0.087 RMS at its source, while the program recorder stream measured 0.0
RMS with live audio/video tracks. This localizes the observed failure to the app
program audio-mix/capture path in this run; its root cause is not yet repaired.
No feature code was changed to force a passing result.

## Regression results and limitations

- Video Setup 091 Firefox regression on the isolated app: **9/9 PASS**, including
  active camera and microphone tracks, responsive synthetic microphone meter,
  unchanged device selections, and Voice FX processor readiness.
- Voice FX architecture check: **PASS**.
- Website release-safety static contract: **21/21 PASS**.
- Studio lifecycle/ownership/archive management suites: **NOT RUN**. They require
  authenticated Worker API fixtures; the isolated test app is Vite-only and no
  isolated authenticated test account/fixture was available. The maintained local
  Worker at `127.0.0.1:8787` uses persistent local D1/R2 state and is not an
  authorized disposable fixture for mutating these records. No Worker-backed
  lifecycle suite was invoked and no shared Worker mutation was attempted.
- Permanent Studio deletion: **unchanged / fail-closed**; this feature change
  did not enable it.
- `git diff --check`: **PASS**. The isolated source worktree remains dirty by
  design because Directive 110's feature commit gate was not met.

Evidence details and exact commands/results are retained in
`/Users/toddknipple/Documents/StudioFlow/web-109/.directive110-evidence/`;
that evidence is local to the source worktree and not committed to the website
repository. The evidence summary is `directive110-results.json`.

## Required next step

BLOCKED until the StudioFlow program audio mix/capture path produces a saved
recording with non-silent, decodable audio from a known-good source, with the
canary absent from the actual video frames. Also rerun a corrected in-recording
reopen check: Play/Pause/Resume/Close passed while `MediaRecorder.state` was
`recording` and both captured tracks remained live; the last reopen attempt was
inconclusive because recording stopped before its assertion. Obtain an authorized
isolated Worker-backed test fixture and run the Studio lifecycle/ownership/archive
regressions. Only after all gates pass should the uncommitted feature diff be
reviewed and committed on its existing branch. Do not merge, push, stage
production assets, or deploy; production remains unchanged.

## Required status report

| Directive 110 field | Result |
| --- | --- |
| AGENTS.md and development playbook reviewed | YES |
| Directive 109 work preserved | YES; recoverable patch saved |
| Feature worktree / branch / base | `web-109` / `codex/studioflow-109-teleprompter` / `6b9c3c4` |
| Feature commit | NONE — intentionally uncommitted |
| Development build | PASS |
| Firefox browser acceptance | PASS for exercised teleprompter flows, 39/39 |
| Teleprompter controls and Studio isolation | PASS, 39/39 evidence |
| Recording during teleprompter use | BLOCKED; Play/Pause/Resume/Close worked during active recording; saved video is playable, but output audio is silent/invalid; reopen while recording not conclusively verified |
| Recorded video privacy | PASS; decoded 1080p frames contain no canary |
| Screen-sharing privacy | PASS for tested host UI capture routes, 9/9 |
| Actual livestream-output privacy | PASS; local RTMP output frames contain no canary |
| Video Setup 091 | PASS, 9/9 |
| Voice FX | PASS; architecture check and processor readiness |
| Studio management lifecycle | NOT VERIFIED; Worker-backed authenticated suites not run |
| Permanent deletion gates | PASS / unchanged fail-closed |
| Original development preserved | YES |
| Production | NOT DEPLOYED; no production endpoints contacted |
| Remaining issue | Repair/verify program audio mix so known-good source yields non-silent decodable recorded audio; rerun reopen-during-recording acceptance; complete Studio lifecycle regressions in an authorized isolated Worker-backed fixture |
