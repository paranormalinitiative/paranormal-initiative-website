# TPI-STUDIOFLOW-116 — Teleprompter Workstation Consolidation

Date: 2026-10-30
Status: **COMPLETE / AUTHORITATIVE LOCAL DEVELOPMENT / OWNER ACCEPTANCE PENDING**
Production deployment: **NOT AUTHORIZED / NOT PERFORMED**

## Objective and result

The existing StudioFlow Teleprompter was consolidated into one shared
workstation component. The Home entry point remains the complete workstation.
The recording Studio's redundant bottom-toolbar entry was removed. The right
sidebar entry now opens that same workstation in a private full-screen overlay
with a `Back to Studio` control.

The private presenter reader remains separate from the workstation and keeps
using the existing Studio-scoped script and reader-state storage. No second
script library or persistence namespace was introduced.

## Source and staging

| Item | Verified value |
| --- | --- |
| Authoritative URL | `http://127.0.0.1:8787/studio/` |
| Runtime | Local loopback Cloudflare Worker (`workerd`) |
| Startup | `npm run dev:local` |
| Source worktree | `/Users/toddknipple/Documents/StudioFlow/web-109` |
| Source branch | `codex/studioflow-109-teleprompter` |
| Teleprompter 092 parent | `05a9aa5cd7b4ccb94d11162f244d2281fcd572bb` |
| Consolidation source commit | `cf4afb9362fef8e4ec2d9ef82cafb3355805c611` |
| Website branch | `codex/tpi-development` |
| Production | Unchanged; no deployment performed |

The isolated source worktree was clean before and after the source commit.
The original mixed StudioFlow checkout and the audio-repair worktree were not
modified. The approved Teleprompter 092 implementation and Directive 109–115
records remain preserved.

The existing source-provenance staging workflow was used with a development
candidate manifest. It built the exact clean source revision twice and found
identical output. The staged files were then verified against the generated
files and the Worker watcher restaged the same candidate into the authoritative
local Worker assets.

## Asset evidence and rollback

Candidate assets served by the Worker:

| Asset | SHA-256 |
| --- | --- |
| `/studio/assets/index-pFJX_rHg.js` | `b12be9d93069e18c2406668a2079fe832066d618ff159f7c5981da3681c7d9d3` |
| `/studio/assets/index-D4Sdah9n.css` | `68e6481ddef24bfe55f0c988a75d649cfc71a70971cf71c0f207ee6233d96446` |
| `studio/index.html` candidate entry | `9f1e1d6a72f51e1a0d2905058f3683d9c5b70deddec7a55155a727d8de2b25aa` |

The pre-integration 091 website assets were preserved as the rollback
checkpoint: JavaScript `index-D1h4nSZd.js` (`4eed57a4f243c9474fb73957d9e567defb2bb43ef3bcc82c1749ba02cf92557`),
CSS `index-CcFjA_0p.css`
(`8501862945034d73a08df30e81291891491536edd82f16e0074b98a933e4cf69`),
and the previous entry hash
`08ba5857dc352c6642430a90f2cd773d69091bfd7bc76a31c8b2d5f5d5ef2a4f`.
Rollback is a website-branch revert to the integration commit, followed by
`npm run dev:local` asset rehydration and the same local Firefox smoke test;
production remains unaffected.

## Interface changes

- Preserved the Home Teleprompter's Scripts, Editor and Prompt workstation,
  including formatting, import/export, reader controls and settings.
- Removed only the redundant Teleprompter button from the recording
  production bar.
- Kept the right-rail Teleprompter tab and changed it to open the shared
  workstation.
- Added a full-screen private workspace overlay and `Back to Studio` return.
- Blocked opening the private workspace while screen sharing is active,
  preserving the existing presenter-privacy guard.
- Persisted manual reader scroll position through the existing
  `studioflow.teleprompterStudioState.v1` Studio-scoped state.
- Preserved the existing private presenter reader, recording compositor and
  livestream composition boundaries.

## Verification

Source checks:

- `npm run check:teleprompter`: **27/27 PASS**.
- `npm run check:voice-fx`: **PASS**.
- `npm run check:recording-audio`: **4/4 PASS**.
- `npm run build`: **PASS**.
- `git diff --check`: **PASS**.
- Source-provenance staging: reproducible build, generated/staged comparison
  and asset hashes: **PASS**.

Authoritative Worker acceptance used Firefox Developer Edition, a disposable
profile, synthetic camera/microphone media, and the authenticated local test
account. The owner browser origin and persistent owner data were not used.
The acceptance harness completed **19/19 PASS**:

- Home workstation opened with Scripts, Editor, Prompt, formatting controls
  and reader controls.
- Studio A and Studio B displayed only their own scripts.
- Studio-specific selected script, speed and scroll position persisted.
- The bottom-toolbar Teleprompter entry was absent.
- The right-sidebar entry opened the complete shared workstation; the old
  limited reader modal was absent.
- The active production bar remained mounted behind the overlay, and Back to
  Studio returned to the same session.
- Recording started and stopped while the private workstation was open.
- The saved browser recording decoded successfully. `ffprobe` found VP8 video
  at 1920x1080 and stereo Opus audio at 48 kHz. `ffmpeg` decoded the file with
  exit code 0; decoded audio contained 556,176 samples, mean volume about
  `-23.1 dB`, and peak about `-19.8 dB`.
- Five decoded video frames were inspected with local OCR. The unique
  `STUDIO-B-PRIVATE-CANARY` phrase was absent from all frames while remaining
  visible in the private workstation.

The browser evidence was produced at:

- `/private/tmp/tpi-116-acceptance.json`
- `/private/tmp/tpi-116-recording.webm`
- `/private/tmp/tpi-116-frames/`

These disposable artifacts are excluded from the repository.

## Data and production safety

The authoritative Worker remained the existing `8787` process with local
D1/R2 state under `.local-dev/state/v3`. No Studios, recordings, scripts,
preferences, browser storage, D1, R2, authentication, routes, production
assets or production configuration were deleted, migrated or reset. Permanent
Studio deletion remains disabled. Port 5192 was not restarted.

Owner acceptance is still pending. The owner should personally test the
corrected workstation at `http://127.0.0.1:8787/studio/` using the existing
authorized development environment.
