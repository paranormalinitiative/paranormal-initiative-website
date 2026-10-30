# TPI-STUDIOFLOW-118 — Correct Teleprompter Sidebar and Saved Script Navigation

Date: 2026-10-30
Status: **COMPLETE / LOCAL DEVELOPMENT VERIFIED / OWNER ACCEPTANCE PENDING**
Production deployment: **NOT AUTHORIZED / NOT PERFORMED**

## Objective and root cause

The recording Studio right-rail handler activated the Teleprompter tab and then
called `openTeleprompterWorkstation()`. As a result, the Teleprompter toolbar
icon opened the full workstation instead of behaving like Notes and the other
right-toolbar panels.

The smallest correction was to make every right-toolbar button, including
Teleprompter, call only `setRightTab(tab.label)`. The existing sidebar panel,
private reader, full workstation button, and Back to Studio flow were retained.

## Source and environment

| Item | Verified value |
| --- | --- |
| Authoritative URL | `http://127.0.0.1:8787/studio/` |
| Runtime | Local Cloudflare Worker (`workerd`) |
| Startup | `npm run dev:local` |
| Persistence | `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/.local-dev/state/v3` |
| Source worktree | `/Users/toddknipple/Documents/StudioFlow/web-109` |
| Source branch | `codex/studioflow-109-teleprompter` |
| D117 source baseline | `3530140afefee9659947626db3f23524a25c3a80` |
| D118 source commit | `244993beab7f9fbba7ee89376a3b3dea616fa62a` |
| Website branch | `codex/tpi-development` |
| Website integration commit | `79a82b9` (pushed; final parity check pending) |
| Production | Unchanged; no deployment performed |

The original mixed StudioFlow checkout remains untouched. No D1/R2 data,
owner Studios, recordings, scripts, preferences, browser storage,
authentication, or deletion safeguards were changed.

## Saved-script creation order

`TeleprompterScript` now has optional `createdAt` metadata. New, duplicated and
imported scripts receive a monotonic creation timestamp without changing their
existing `updatedAt` behavior. The shared `sortTeleprompterScripts` helper sorts
timestamped scripts oldest first, uses stable index order for equal timestamps,
and preserves the existing stored sequence for legacy scripts without
timestamps. Editing or renaming a script does not change `createdAt`.

The Home workstation and the Studio sidebar use the same helper and the same
existing `studioflow.teleprompterScripts` storage. No second storage namespace
or script database was introduced.

## User-facing behavior

- Teleprompter toolbar click opens only the Teleprompter right sidebar.
- The sidebar lists only scripts belonging to the active Studio in creation
  order and marks the selected script.
- Selecting a script opens the existing transparent, draggable private reader
  over the stage.
- The sidebar button is labeled `Open Teleprompter` and opens the complete
  shared workstation.
- `Back to Studio` returns to the same recording Studio session.
- Notes and all other right-sidebar panels retain their existing behavior.
- The existing Play, Pause, Resume, Reset, speed, text-size, line-height,
  positioning and Studio-specific preference behavior remains intact.

## Provenance and staged assets

The established source-provenance workflow built the clean D118 source twice,
verified reproducibility, and staged the generated files into the existing
8787 Worker asset path. Production baseline files and bridges were preserved.

| Asset | SHA-256 |
| --- | --- |
| `/studio/assets/index-DG-_pPI_.js` | `66f9407e808f74c803491917efcb412566301f4feca6df20978cd64dc48d7560` |
| `/studio/assets/index-28KfU4BI.css` | `48b3b88702dde14713240d89a31e3057e58a53a1bea5356c0ba569aee77dea6f` |
| Integrated `studio/index.html` entry | `a0e16af821f20ef944a3591682d15a7c4947a61aa6d76287ab495fbb42857267` |

The D117 candidate website commit `6e4c957` remains the rollback source for
the prior local candidate. The rollback restores that commit and its recorded
assets, rehydrates the local Worker, and repeats Firefox acceptance. It does
not modify local D1/R2 data.

## Verification

Source checks:

- `npm run check:teleprompter`: **46/46 PASS**.
- `npm run check:voice-fx`: **PASS**.
- `npm run check:recording-audio`: **4/4 PASS**.
- `npm run build`: **PASS**.
- `git diff --check`: **PASS**.
- Source-provenance reproducible build and staged asset comparison: **PASS**.

The actual authoritative 8787 Worker was tested with Firefox Developer Edition
and a disposable authenticated profile. The final owner-workflow harness passed
**36/36** checks, including:

- Notes and all other right-sidebar panels opened their corresponding panels.
- Teleprompter opened only its sidebar; the full workstation did not open from
  the toolbar icon.
- Three disposable scripts were created through the workstation UI and appeared
  oldest-first in the sidebar.
- Renaming the first script did not move it.
- Reloading preserved order and Studio-specific state.
- Studio B showed only its own script.
- Selecting a script opened the private bounded reader over the stage.
- Reader controls, speed, text size and drag positioning worked.
- `Open Teleprompter` opened the full workstation and Back to Studio preserved
  the active session.
- Recording with the private reader visible produced stored media.

The final saved WebM contained VP8 1920x1080 video and stereo Opus 48 kHz
audio. Firefox decoding and FFmpeg decoding returned success; FFmpeg reported
zero decoder errors in its diagnostic path. Audio measured mean `-23.1 dB` and
peak `-19.9 dB`. Five decoded frames were OCR-inspected and contained no
`STUDIO-A-PRIVATE-CANARY` or `STUDIO-B-PRIVATE-CANARY` text.

The disposable evidence is outside the repository:

- `/private/tmp/tpi-118-acceptance.json`
- `/private/tmp/tpi-118-recording.webm`
- `/private/tmp/tpi-118-frames/`
- `/private/tmp/tpi-118-ocr.txt`

Existing D117 RTMP and screen-sharing evidence remains applicable because this
correction does not alter the compositor or screen-sharing privacy boundary.
Permanent Studio deletion remains disabled.

## Release preparation

### Candidate manifest

The D118 application candidate is website commit `79a82b9`. The exact
application files are:

- `studio/index.html`
- `studio/assets/index-DG-_pPI_.js`
- `studio/assets/index-28KfU4BI.css`

The current production Worker baseline is
`91a8460e-1db1-440c-9643-a85b6e178fba`; the recorded rollback Worker is
`17b9f9d5-717e-42a9-92d1-14b0dd717ef6`. The production asset rollback remains
the approved Video Setup 091 JavaScript/CSS pair documented in the D116/D117
records. A future release must run the canonical auth lifecycle, release
preflight, guarded deployment, live smoke and Firefox acceptance. This
directive does not authorize those commands.

The corrected candidate is **READY FOR OWNER ACCEPTANCE AND PRODUCTION RELEASE
REVIEW**. It is not deployed. The final website integration commit and
documentation completion commit are recorded in the final report; the
integration commit is `79a82b9`. A future production release must use the canonical
auth-lifecycle, preflight, guarded deployment and live Firefox acceptance
runbook. Production Worker, routes, credentials, assets, D1/R2 and environment
variables remain unchanged.
