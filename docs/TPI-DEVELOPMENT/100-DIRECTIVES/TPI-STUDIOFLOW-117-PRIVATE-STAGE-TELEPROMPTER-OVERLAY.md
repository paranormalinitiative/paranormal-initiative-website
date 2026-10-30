# TPI-STUDIOFLOW-117 — Private Stage Teleprompter Overlay and Saved Script Selection

Date: 2026-10-30
Status: **COMPLETE / LOCAL DEVELOPMENT VERIFIED / OWNER ACCEPTANCE PENDING**
Production deployment: **NOT PERFORMED**

## Objective and result

The recording Studio's Teleprompter rail now lists saved scripts belonging to
the active Studio. Selecting a script opens the existing private presenter
reader over the stage preview. The reader is transparent, bounded, draggable,
and controlled with the existing Studio-specific reader preferences. It is not
a scene element and is not drawn by the program compositor.

The existing Home workstation and the right-sidebar full workstation remain the
single shared script library/editor/workstation. No second persistence system
or duplicate script database was introduced. The removed bottom-toolbar
Teleprompter entry remains removed.

## Source, environment, and preservation

| Item | Verified value |
| --- | --- |
| Authoritative URL | `http://127.0.0.1:8787/studio/` |
| Runtime | Local loopback Cloudflare Worker (`workerd`) |
| Startup | `npm run dev:local` |
| Local persistence | `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/.local-dev/state/v3` |
| Source worktree | `/Users/toddknipple/Documents/StudioFlow/web-109` |
| Source branch | `codex/studioflow-109-teleprompter` |
| Source commit | `3530140afefee9659947626db3f23524a25c3a80` |
| Website branch | `codex/tpi-development` |
| Production | Unchanged; no deployment performed |

The original mixed StudioFlow checkout was not modified. The source worktree
was clean after the D117 commit. Existing local Studios, recordings, scripts,
preferences, browser storage, D1/R2 state, authentication, deletion safeguards,
and the production release baseline were preserved. The source repository has
no configured remote, so the source commit is recorded as local provenance;
the website integration is the pushed release artifact.

## Implementation

- Added Studio-filtered saved-script buttons to the right-sidebar Teleprompter
  panel, with selected state and an empty state.
- Selecting a saved script opens `TeleprompterReader` over `.program-stage`.
- The reader uses the existing `studioflow.teleprompterStudioState.v1` state for
  selected script, speed, text size, line height, countdown, mirror mode,
  scroll position, and the new bounded reader position.
- Play, pause, resume, reset, speed, text-size, line-height and close controls
  are available in the private reader. The reader header supports pointer drag
  positioning and saves the position for the current Studio.
- Screen-sharing remains fail-closed: the private reader closes before capture
  and cannot be reopened while host screen sharing is active.
- Recording and RTMP continue to use the existing separate program canvas and
  audio-mix paths. The reader is DOM-only and is not rendered into those paths.

## Provenance and staged assets

The existing source-provenance staging workflow was run from the clean D117
source commit. Reproducible build and generated/staged comparison passed. The
Worker watcher output was checked against the staged files.

| Asset | SHA-256 |
| --- | --- |
| `/studio/assets/index-BTdN-mf4.js` | `b7cdf1c214f3d389d1b778a5790d2a0946e965ed14d78fb5a8ad5a435cb54aa9` |
| `/studio/assets/index-28KfU4BI.css` | `48b3b88702dde14713240d89a31e3057e58a53a1bea5356c0ba569aee77dea6f` |
| Integrated `studio/index.html` entry | `31ea74933e066dc38e4d0b900b0dc7af62f828ac4c47f3f1d0755a1610d348a1` |

The previous D116 local candidate remains the reversible rollback source:
website commit `12b5ec1a74a13e82e9bb85d1e9f1e4b0b8b6bd51`, JavaScript
`index-pFJX_rHg.js` (`b12be9d93069e18c2406668a2079fe832066d618ff159f7c5981da3681c7d9d3`),
and CSS `index-D4Sdah9n.css`
(`68e6481ddef24bfe55f0c988a75d649cfc71a70971cf71c0f207ee6233d96446`). A local
rollback restores that website commit/assets, rehydrates the 8787 Worker with
`npm run dev:local`, and repeats the disposable Firefox smoke test. This is a
frontend rollback only; it does not alter local D1/R2 data.

## Verification

Source and static checks:

- `npm run check:teleprompter`: **38/38 PASS**.
- `npm run check:voice-fx`: **PASS**.
- `npm run check:recording-audio`: **4/4 PASS**.
- `npm run build`: **PASS**.
- `git diff --check`: **PASS**.
- Source-provenance build/stage/hash comparison: **PASS**.
- `npm run verify:release-safety`: **PASS** after website integration.

Authoritative Worker acceptance used Firefox Developer Edition, a disposable
profile, synthetic camera/microphone media, and the disposable local test
account. It completed **24/24 PASS** against the actual `8787` Worker:

- Home Scripts/Editor/Prompt workstation and formatting controls loaded.
- Studio A and Studio B showed only their own saved scripts.
- Script selection opened the private stage reader; the stage remained visible.
- Transparent background, bounded geometry, Play/Pause/Resume/Reset, speed,
  text-size and drag positioning were exercised.
- The existing full workstation opened from the right rail and returned to the
  same Studio session.
- Studio-specific preferences and reading position persisted.
- Recording started and stopped with the private reader visible.
- The saved WebM was `matroska,webm`, with VP8 1920x1080 video and stereo Opus
  48 kHz audio. Browser decoding passed; FFmpeg decoded the Opus stream with
  zero decode errors and exit code 0. Audio measured mean `-23.1 dB` and peak
  `-19.8 dB`.
- Five decoded frames were OCR-inspected. The unique
  `STUDIO-B-PRIVATE-CANARY` phrase was absent from all recorded frames while
  remaining visible to the presenter in the private reader.

The disposable evidence is outside the repository at:

- `/private/tmp/tpi-116-acceptance.json`
- `/private/tmp/tpi-116-recording.webm`
- `/private/tmp/tpi-117-frames/`
- `/private/tmp/tpi-117-ocr.txt`

Existing D116 RTMP privacy and screen-sharing evidence remains applicable; D117
does not alter the RTMP compositor or the host-capture privacy guard. No
destructive lifecycle test was run against owner data. Permanent Studio
deletion remains disabled.

## Release preparation

The completed local candidate is **READY FOR OWNER ACCEPTANCE AND PRODUCTION
RELEASE REVIEW**. It is not a production release. The website integration
commit and documentation commit are recorded in the final completion report and
must be reviewed with the asset hashes above. A future production deployment,
if separately approved, must use the guarded preflight/deploy/live-acceptance
runbook and retain the current production Worker rollback checkpoint. No
production asset, route, Worker, credential, D1/R2 record, or environment
variable was changed here.

Owner acceptance remains pending at the authoritative URL:
`http://127.0.0.1:8787/studio/`.
