# TPI-STUDIOFLOW-113 — Teleprompter development staging and owner acceptance

Date: 2026-10-29
Result: **COMPLETE / DEVELOPMENT STAGED / OWNER ACCEPTANCE PENDING**
Production deployment: **NOT AUTHORIZED / NOT PERFORMED**

## Staging identity and environment

| Field | Result |
| --- | --- |
| Approved source commit | `05a9aa5cd7b4ccb94d11162f244d2281fcd572bb` |
| Source worktree | `/Users/toddknipple/Documents/StudioFlow/web-109` |
| Source branch | `codex/studioflow-109-teleprompter` |
| Staging worktree | `/Users/toddknipple/Documents/StudioFlow/web-113-staging` |
| Staging revision | Detached `05a9aa5cd7b4ccb94d11162f244d2281fcd572bb` |
| Development environment | Local Vite production preview serving generated `dist/` |
| Verified development URL | `http://127.0.0.1:5192/studio/` |
| Infrastructure | Local-only; no Worker, Cloudflare route, D1/R2 remote binding or public preview |
| Authentication | None for the standalone local preview; automated tests used disposable Firefox profiles and synthetic media |
| Owner access | YES — loopback URL returned HTTP 200 on the shared development machine |
| Owner approval | PENDING — no personal owner acceptance was represented as complete |

The documented public development Worker hostname was checked and did not
resolve. Directive 113 prohibits deploying a Worker, so no remote staging
deployment was invented or performed. The supplied URL is intentionally
loopback-only; it is not the production StudioFlow URL and is not externally
reachable.

## Source provenance and generated assets

The feature source worktree was verified clean at the exact approved commit.
A separate detached staging worktree was created from that commit. The source
was built twice with the same local dependency tree; the complete generated
asset trees were byte-identical. The dependency symlink used for the build was
removed afterward, leaving the staging worktree clean.

The generated application assets served by the preview are:

| Asset | SHA-256 |
| --- | --- |
| `dist/assets/index-Ce54wjuX.js` | `4440217bc7fb07807bf0e47630906c9b59c0050e8d6c8a97bbe29ecc9bc96fa6` |
| `dist/assets/index-D7-9JtPq.css` | `be00c2115d1f8014a015d7c07a527684b1c4b328b401177475fe52dd27441fed` |

The preview served those exact filenames and hashes at `/studio/assets/`, and
the served JavaScript contained the Teleprompter state and presenter-only
markers. The production release manifest remains unchanged and continues to
identify the approved 091 baseline `6b9c3c4b6b40f0496012e5d718d32d75e149dcf6`
and its production asset hashes. No production asset was replaced.

## Staged browser and media acceptance

Firefox Developer Edition with Geckodriver and disposable profiles exercised
the actual generated preview, not source-only assertions:

| Acceptance | Result |
| --- | --- |
| Teleprompter browser controls and two-Studio isolation | PASS 39/39 |
| Focused Teleprompter source checks | PASS 23/23 |
| Recording-audio source checks | PASS 4/4 |
| Voice FX architecture checks | PASS |
| Screen-sharing privacy | PASS 9/9 |
| Video Setup 091 | PASS 9/9 |
| Recording smoke | PASS |

The recording smoke used a unique Teleprompter phrase. The actual saved WebM
contained VP8 video at `1920x1080` and Opus audio at `48000 Hz`, stereo.
Firefox-native decoding reported duration `5.6335 s`, RMS `0.0247295100`,
peak `0.0357147865`, approximately `439.96 Hz`, successful playback, and
video ready state `4`. The private phrase was absent from decoded recording
frames. A second privacy recording decoded successfully with RMS `0.0247664`
and approximately `440.06 Hz`; its unique canary was also absent from OCR.

The isolated local RTMP smoke test passed 4/4 through the loopback bridge and
receiver only. The captured output was H.264 video plus 48 kHz stereo AAC,
approximately `6.975 s`; mean audio level was `-23.1 dB`, and OCR found no
Teleprompter canary in decoded frames. No external livestream credentials or
public endpoint was used.

## Maintained backend regressions

The Directive 112 disposable Worker fixture was reused at
`http://127.0.0.1:5194` with outbound services disabled, synthetic accounts,
and isolated local D1/R2 state. No persistent 8787 Worker or production data
was used.

| Suite | Result |
| --- | --- |
| Direct Worker contract | PASS 23/23 |
| Studio lifecycle | PASS 29/29 |
| Studio ownership | PASS 40/40 |
| Recording/storage | PASS 33/33 |
| Deletion/archive safeguards | PASS 31/31 |
| Deletion safety/data preservation | PASS 32/32 |

Permanent Studio deletion remains disabled. Both purge modes were rejected at
the UI, bridge and server layers, with workspace ownership, metadata, media
and recording blobs preserved.

## Preservation and production protection

The original mixed StudioFlow checkout remains untouched at
`/Users/toddknipple/Documents/StudioFlow/web`; its pre-existing `src/App.tsx`
and `src/styles.css` modifications remain present. The completed feature
worktree remains clean at the approved commit. The website development branch
and current production asset baseline were not altered by staging. No Worker
deployment, route change, production authentication change, environment
variable change, D1/R2 production operation or production endpoint was used.

Owner approval is intentionally still pending. The owner should open the
loopback URL on the shared development machine and personally test the
Teleprompter, recording and privacy behavior before any future release
decision. This directive does not authorize promotion, push, deployment or
production release.
