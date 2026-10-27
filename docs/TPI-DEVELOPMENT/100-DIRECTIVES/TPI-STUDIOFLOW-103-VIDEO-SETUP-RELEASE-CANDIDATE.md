# TPI-STUDIOFLOW-103 — Video Setup 091 production release candidate

Date: 2026-10-26. Result: **BLOCKED — SOURCE INTEGRATED / PARTIALLY AUTOMATED TESTED; NOT RELEASE VERIFIED / NOT DEPLOYED / NOT OWNER ACCEPTED**.

## Scope and provenance

Owner authorized a new isolated source and website candidate integrating Video Setup 091, preserving Studio management, excluding unfinished 092, and keeping unsafe permanent deletion unavailable. Owner expressly permits disabling Studio-only permanent deletion if not verified safe. No push, merge or deployment authorized.

- Source release branch: `codex/studioflow-103-video-setup-release`.
- Source commit: `6b9c3c4b6b40f0496012e5d718d32d75e149dcf6`.
- Source baseline: `0a10451997e19a09ef2aae94bb9b25395603bfac`, including isolated 100/101 client; applied exact App/CSS delta from `649dd2695376ee60102a9cf3df64dd404cc52bdb`.
- Website release branch: `codex/studioflow-103-website-release`.
- Website baseline: `06e007809f7052d31b98e35e65047601cf2f8288`, retaining `5180872` server safeguards and `6c48b45` website functionality.
- Website candidate commit: the commit introducing this record (`git log -1 --format=%H -- docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-STUDIOFLOW-103-VIDEO-SETUP-RELEASE-CANDIDATE.md`).
- New isolated worktrees: `.local-dev/worktrees/source-103` and `.local-dev/worktrees/website-103` under the original website checkout.

Original mixed source, website, 091 worktree, and existing source-100/website-100 branches were not modified. Starting HEAD/branch/status and SHA-256 hashes of modified/untracked regular files captured in ignored `.local-dev/directive-103/original-state.json`; final comparison passed for all five trees. Source and existing isolated branches were not merged or pushed.

## Included and intentional behavior changes

091 preserves device selectors, preview, mic monitor/level, display name/headline and Studio entry; removes duplicate setup Voice FX and initializes host FX in Studio. Setup Back stops capture. Exact 091 CSS included.

**Both permanent deletion modes intentionally unavailable** pending safety acceptance. React confirmation disabled and handler rejects, workspace bridge rejects before browser/server mutation, and authenticated `/purge` routing returns 503 `studio_permanent_deletion_unavailable` (foreign-origin 403). This includes Studio-only: not relabeled or silently treated as archive. UI explicitly discloses temporary unavailability. Rename/archive/restore/create/switch code unchanged. Existing server purge safeguards retained but purge handler no longer routed. Ordinary soft-delete/archive/restore endpoints unchanged. Old browser code may still contain unrelated local behavior; server gate blocks its purge requests, not arbitrary browser storage access.

Source Voice FX worklet URLs now use Vite `BASE_URL`. Exact staged Firefox initially passed 8/9 but failed initialization because source requested root worklets, whereas website stores them under `/studio/`. This focused compatibility repair made the rerun pass 9/9. No worklet DSP changes.

No 092 integration: TeleprompterView and StudioTeleprompterModal function blocks equal isolated baseline, CSS equals 091 commit. Other source modules untouched except worklet URL correction. No recording storage redesign, local cleanup enablement, owner-data test, unrelated website removal or production mutation.

## Reproducible staging

Used an ignored execution copy of maintained `stage-studioflow-authoritative.mjs`, changing only its hard-coded sourceRoot and repoRoot to new isolated worktrees. Tracked release/staging scripts and checks were not altered. Its request-budget check, two independent builds, full output digest comparison, bridge preservation and generated/candidate parity checks passed. All 11 maintained integration files preserved; only reviewed workspace bridge deletion gate differs. Existing old bundles retained; transient intermediate 103 bundle removed. No newer original development assets overwritten.

| Final asset | SHA-256 |
| --- | --- |
| studio/assets/index-D1h4nSZd.js | 4eed57a4f243c9474fb73957d9e567defb2bb43ef3bcc82c1749ba02fcf92557 |
| studio/assets/index-CcFjA_0p.css | 8501862945034d73a08df30e81291891491536edd82f16e0074b98a933e4cf69 |
| studio/index.html | 08ba5857dc352c6642430a90f2cd773d69091bfd7bc76a31c8b2d5f5d5ef2a4f |

## Verification

- Fresh lockfile-preserving source/website npm ci: PASS; no dependency changes.
- TypeScript: PASS on final source.
- Production build: PASS twice via final reproducible staging (existing >500 kB warning).
- Voice FX architecture: PASS after final URL repair.
- 091 Firefox exact staged assets: **9/9 PASS**, synthetic camera/mic, selectors present, live meter, level control, profile persistence, selected devices maintained, FX panel and ready processor inside Studio. First headed Firefox launch exited before testing; headless Firefox rerun used same assertions. Test copied from existing original harness into candidate with only `-headless` added.
- 101 local safety fixtures: **22/22 PASS**, final source.
- 102 real Firefox browser storage/boundary suite: **8/8 PASS**, pointed at source-103. Does not enable blocked application cleanup.
- 093 VM purge-safety: PASS, preserved underlying handler; not a routed-purge success test.
- New 103 candidate gate/asset checks: PASS; verifies routed rejection, bridge rejection for both scopes, foreign-origin rejection and referenced static files. Actual gate/bridge functions executed in VM; authenticated Worker integration not established.
- Website traffic guard 11/11 and local foundation 10/10: PASS; API/bridge syntax PASS.
- Isolation assertions/original-tree hash checks: PASS.
- **Lifecycle, 035, 087, 088, 089 attempted, BLOCKED before acceptance:** isolated `.local-dev/local-auth-credentials.json` / `test_admin` unavailable. 035 exits ENOENT; others report missing inputs/account. No owner or production credentials substituted. No acceptance test assertions weakened for intentionally disabled permanent deletion. Future destructive expectations in 088/089 need explicit approved release-gate coverage, not a claim they passed unchanged.

A dedicated loopback static server serves only isolated `studio/` assets at `http://127.0.0.1:5193/studio/`; registered in Preview. API paths deliberately unavailable. This verifies exact browser assets and synthetic setup, **not Worker/D1/R2/auth integration**. No account fixture created and no physical camera/microphone/audible-output acceptance performed. Setup cleanup is source-reviewed, not separately browser-tested by maintained 091 harness. Device alternative switching and speaker sink behavior on physical hardware remain manual.

## Guarded preflight and blockers

`npm run release:preflight` attempted: exit 1, **release branch must be codex/tpi-development**. Gate runs before authentication, origin queries or Cloudflare work; safeguards unchanged. Not READY. Clean final candidate does not establish authorized branch or origin parity.

Mandatory release blockers:

1. Provision disposable local QA credentials/data and run exact candidate under local Worker with isolated bindings; complete lifecycle, 035, 087, management-focused 088/089 and auth acceptance.
2. Confirm routed client/server compatibility under Worker (VM gate tests alone insufficient). Both permanent modes remain disabled until explicitly verified and reauthorized.
3. After owner authorizes integration/push, safely move verified candidate to authorized release branch with clean tree and exact origin parity, then run full maintained auth lifecycle and preflight. Current staging tool has hard-coded original source path: release administration must reconcile the authoritative clean source with the verified source commit so preflight cannot build dirty originals. Do not use ignored execution copy as a production bypass.

Recommended next action: isolated authenticated Worker acceptance of this exact candidate with permanent deletion still disabled. Candidate is traceable and reproducible but **not fully release verified**. Nothing deployed or owner accepted.
