# TPI Directive Index

The chronological production execution ledger for TPI-MASTER-001 is
[`docs/TPI-MASTER-DEVELOPMENT/00-MASTER-DEVELOPMENT-CONTROL/08-MASTER-DIRECTIVE-REGISTER.md`](../../TPI-MASTER-DEVELOPMENT/00-MASTER-DEVELOPMENT-CONTROL/08-MASTER-DIRECTIVE-REGISTER.md).

Statuses are evidence-based and refer to the available repository records, not to an assumption that every historical requirement is complete.

Current operational authority is
[`TPI-MASTER-AUTONOMOUS-AGENT-AUTHORITY.md`](TPI-MASTER-AUTONOMOUS-AGENT-AUTHORITY.md).
It grants standing full-lifecycle authority and defines how historical scope
limits interact with later directives.

Historical directive rows are not current deployment instructions. Use
[`../TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md`](../TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md)
and
[`../TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`](../TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md)
for current commit, push, deployment, and live-verification procedure.

## TPI-STUDIOFLOW-120 — Enhanced screen sharing and theme-aware presentation

Status: **BLOCKED / DEVELOPMENT IMPLEMENTATION STAGED / NATIVE CAPTURE PENDING**.
[Directive 120 execution record](TPI-STUDIOFLOW-120-ENHANCED-SCREEN-SHARING.md).
Source commit `a8a7d11759905ae4bf8043005e0c2259b1fd6a81` is staged on the
authoritative 8787 Worker. The original theme-aware panel, three sharing
choices, browser-owned picker handoff, preview, Add to Stage gating and
capture cleanup are implemented. Source/build/staging checks and Firefox
panel/regression checks pass, but native picker selection, actual captured
recording evidence, Chrome and Safari compatibility remain pending. Production
is unchanged and no deployment is authorized under D120.

Directive 120A reached the Chrome native capture boundary in a disposable
profile on macOS 27.0, but native picker operation was blocked by macOS
assistive-access error `-25211`. No captured source or recording was produced;
the feature remains blocked pending visible owner/manual browser verification.

## TPI-STUDIOFLOW-119 — Controlled production deployment — Teleprompter 092

Status: **COMPLETE / DEPLOYED_AND_VERIFIED / OWNER APPROVAL CONFIRMED**.
[Directive 119 execution record](TPI-STUDIOFLOW-119-CONTROLLED-PRODUCTION-DEPLOYMENT.md).
The exact approved source `244993beab7f9fbba7ee89376a3b3dea616fa62a` was
deployed through the guarded workflow from website candidate
`6d4c062ce0c3b647f39d3b5e3004531d692f62ba`. Worker
`f5af1836-8cf8-4a3c-9db7-18c53ff9ded2` is active at 100%; rollback is
`91a8460e-1db1-440c-9643-a85b6e178fba`. Live asset hashes match the approved
manifest, production smoke passed 10/10, Firefox acceptance passed 64/64, and
production data and deletion safeguards were preserved.

## TPI-STUDIOFLOW-118 — Correct Teleprompter sidebar and saved script navigation

Status: **COMPLETE / AUTHORITATIVE LOCAL DEVELOPMENT / OWNER ACCEPTANCE PENDING**.
[Directive 118 execution record](TPI-STUDIOFLOW-118-CORRECT-TELEPROMPTER-SIDEBAR.md).
The Teleprompter toolbar now opens only its right sidebar. Saved scripts use
stable creation order, selecting a script opens the existing private reader,
and `Open Teleprompter` opens the shared workstation. Source commit
`244993beab7f9fbba7ee89376a3b3dea616fa62a`; 8787 Firefox acceptance passed
36/36. Production is unchanged and no deployment occurred.

## TPI-STUDIOFLOW-117 — Private stage Teleprompter overlay and saved script selection

Status: **COMPLETE / AUTHORITATIVE LOCAL DEVELOPMENT / OWNER ACCEPTANCE PENDING**.
[Directive 117 execution record](TPI-STUDIOFLOW-117-PRIVATE-STAGE-TELEPROMPTER-OVERLAY.md).
The right-sidebar Teleprompter panel now lists scripts for the active Studio and
opens the existing private, transparent, draggable reader over the stage. The
source commit is `3530140afefee9659947626db3f23524a25c3a80`; the real 8787
Firefox acceptance run passed 24/24, including decoded non-silent audio,
playable video and frame-level presenter-canary privacy. The feature is pushed
to the development branch and ready for owner acceptance and production release
review. Production is unchanged and no deployment occurred.

## TPI-STUDIOFLOW-116 — Consolidate Teleprompter into one unified workstation

Status: **COMPLETE / AUTHORITATIVE LOCAL DEVELOPMENT / OWNER ACCEPTANCE PENDING**.
[Directive 116 execution record](TPI-STUDIOFLOW-116-TELEPROMPTER-WORKSTATION-CONSOLIDATION.md).
The verified source commit `cf4afb9362fef8e4ec2d9ef82cafb3355805c611` is
staged on the authoritative local Worker at `127.0.0.1:8787`. The Home
workstation is preserved, the redundant bottom-toolbar entry is removed, and
the right-sidebar entry opens the shared full-screen workstation. Firefox
acceptance passed 19/19, including Studio isolation, saved non-silent audio,
playable video and presenter privacy. Production is unchanged and no release
was performed.

## TPI-STUDIOFLOW-115 — Standardize authoritative local development documentation

Status: **COMPLETE / DOCUMENTATION STANDARDIZED / NOT DEPLOYED**.
[Directive 115 execution record](TPI-STUDIOFLOW-115-STANDARDIZE-AUTHORITATIVE-LOCAL-DEVELOPMENT-DOCUMENTATION.md).
The sole owner-facing StudioFlow localhost is
`http://127.0.0.1:8787/studio/`, served by the local `workerd` Worker through
`npm run dev:local` with local D1/R2 persistence under `.local-dev/state/v3`.
Port 5192 is retired historical Directive 113 infrastructure. Teleprompter 092
is engineering-verified at `05a9aa5cd7b4ccb94d11162f244d2281fcd572bb` but is
not integrated into the current 8787 Video Setup 091 frontend; owner acceptance
is pending and production release is not authorized.

## TPI-STUDIOFLOW-114 — Restore the authoritative local development environment

Status: **COMPLETE / AUTHORITATIVE LOCALHOST VERIFIED / NOT DEPLOYED**.
[Directive 114 execution record](TPI-STUDIOFLOW-114-RESTORE-AUTHORITATIVE-LOCALHOST.md).
The established owner-used local environment is the loopback Worker at
`http://127.0.0.1:8787/studio/`, backed by persistent local-only D1/R2 state.
The D113 Vite preview at `127.0.0.1:5192` was classified as temporary and
stopped after its evidence was preserved. Its clean generated staging worktree
was removed by the mandatory amendment. Owner state was not migrated, cleared,
recreated or deleted. The active 8787 asset remains the approved 091 baseline;
Teleprompter 092 is not claimed as integrated there. Production is unchanged.

## TPI-STUDIOFLOW-113 — Stage Teleprompter 092 for owner acceptance

Historical execution record only. The 5192 preview was retired by Directive
114; its URL and staging details remain preserved as historical evidence.

Status: **COMPLETE / DEVELOPMENT STAGED / OWNER ACCEPTANCE PENDING**.
[Directive 113 staging record](TPI-STUDIOFLOW-113-DEVELOPMENT-STAGING.md).
The exact feature commit `05a9aa5cd7b4ccb94d11162f244d2281fcd572bb` is served
from the clean detached staging worktree at
`/Users/toddknipple/Documents/StudioFlow/web-113-staging` through the local-only
preview `http://127.0.0.1:5192/studio/`. Reproducible asset hashes, browser
acceptance, recording/audio/video privacy, RTMP privacy, Video Setup 091,
screen-share and the isolated Worker regressions all pass. Owner approval is
pending. No Worker or production deployment occurred.

## TPI-STUDIOFLOW-112 — Integrate verified audio repair and complete Teleprompter 092 acceptance

Status: **COMPLETE / ISOLATED DEVELOPMENT ONLY / NOT DEPLOYED**.
[Directive 112 execution record](TPI-STUDIOFLOW-112-INTEGRATE-AUDIO-TELEPROMPTER-ACCEPTANCE.md).
Directive 111's verified repair is integrated and committed on the isolated
Teleprompter branch at `05a9aa5cd7b4ccb94d11162f244d2281fcd572bb`. Integrated
build, decoded non-silent audio/video, Teleprompter 39/39, focused checks 23/23,
screen-share 9/9, RTMP privacy, Video Setup 091 9/9, direct Worker 23/23,
lifecycle 29/29, ownership 40/40, recording/storage 33/33, deletion 31/31 and
deletion safety 32/32 pass. Permanent deletion remains disabled. No production
endpoint or deployment was used.

## TPI-STUDIOFLOW-111 — Diagnose and repair recording audio pipeline

Status: **COMPLETE / ISOLATED DEVELOPMENT ONLY / NOT DEPLOYED**.
[Directive 111 execution record](TPI-STUDIOFLOW-111-RECORDING-AUDIO.md).
The approved 091 baseline and Teleprompter branch both reproduced silent audio;
the root cause was an absent microphone-volume preference becoming zero before
the program audio destination. The isolated repair restores the intended unity
fallback. Firefox saved-media decoding, playable video, all required Voice FX
modes, Video Setup 091 9/9, Teleprompter acceptance 39/39, focused checks 23/23
and screen-share privacy 9/9 pass. The repair remains isolated until a separate
integration review ports it into the uncommitted Teleprompter worktree. No
production endpoint or deployment was used.

## TPI-STUDIOFLOW-110 — Teleprompter 092 browser acceptance and recording verification

Status: **BLOCKED / DEVELOPMENT ONLY / NOT DEPLOYED**.
[Directive 110 execution record](TPI-STUDIOFLOW-110-TELEPROMPTER-ACCEPTANCE.md).
Firefox acceptance 39/39, screen-sharing 9/9, local RTMP output canary absent,
Video Setup 091 9/9, Voice FX and release safety 21/21 pass. Recording video is
playable/canary-free; active-recording Play/Pause/Resume/Close work. However, the
saved Opus is silent/invalid; an independent Firefox tone was valid while the app
program recorder stream measured 0.0 RMS from a non-silent injected source. The
app audio mix/capture path remains blocked, reopen-during-recording is inconclusive,
and authenticated Worker-backed Studio lifecycle checks remain unrun. Feature is
uncommitted; no production endpoint or deployment was used.

## TPI-STUDIOFLOW-109 — Complete and integrate Teleprompter 092

Status: **DEVELOPMENT IMPLEMENTED / ACCEPTANCE PARTIAL / NOT DEPLOYED**.
[Teleprompter implementation, focused verification and remaining acceptance gaps](TPI-STUDIOFLOW-109-TELEPROMPTER-092.md).
Isolated source worktree `/Users/toddknipple/Documents/StudioFlow/web-109`, branch
`codex/studioflow-109-teleprompter`, based on `6b9c3c4`; updated by Directive
110, browser and media acceptance now mostly passed, with recorded-audio integrity
and Worker-backed Studio management still blocked. No production changes; feature
remains uncommitted.

## TPI-STUDIOFLOW-108 — Integrate authoritative source-provenance workflow

Status: **COMPLETE / TOOLING ONLY / PUSHED / NOT DEPLOYED**.
[Integration, verification and artifact-preservation evidence](TPI-STUDIOFLOW-108-INTEGRATE-SOURCE-PROVENANCE-WORKFLOW.md).
Directive 107 `3b55fe9` fast-forwarded onto `codex/tpi-development` (from
`b5cd1b7`) and pushed with live origin parity. 107 suite 20/20, 025 12/12,
055 17/17 pass. Production assets unchanged (`4eed57a4…`/`850186…`); Worker
application code untouched; preserved development intact. Nothing deployed
(Worker `91a8460e` unchanged).

## TPI-STUDIOFLOW-107 — Correct authoritative source provenance and reproducibility

Status: **COMPLETE / TOOLING ONLY / NOT DEPLOYED**.
[Workflow correction, rejection rules and regression evidence](TPI-STUDIOFLOW-107-SOURCE-PROVENANCE-AND-REPRODUCIBILITY.md).
`stage-studioflow-authoritative.mjs` now builds exactly the baseline-approved
source commit (`6b9c3c4`) recorded in `scripts/studioflow-release-baseline.json`
from an isolated clean worktree — never a working tree. Dirty, wrong-commit,
missing-commit, foreign and unauthorized sources are rejected with no bypass
flags; verify-only never writes; `--apply` stages. Known-good hashes
`4eed57a4…`/`850186…` reproduced; 107 suite 20/20; release-safety and 055 pass.
Production unchanged (Worker `91a8460e`).

## TPI-STUDIOFLOW-106 — Resolve authentication gate and complete production deployment

Status: **COMPLETE — DEPLOYED_AND_VERIFIED / OWNER ACCEPTANCE PENDING**.
[Deployment traceability, gate results and live verification](TPI-STUDIOFLOW-106-RESOLVE-AUTH-GATE-AND-PRODUCTION-DEPLOY.md).
Auth prerequisite resolved: preserved development committed to `fc6fe45`, canonical
checkout moved to clean `codex/tpi-development` @ `9b3f033` so the managed Worker
serves the candidate. Auth lifecycle PASS, preflight READY, Worker `91a8460e`
deployed at 100%, live smoke 10/10, Firefox 64/0, Video Setup 091 9/0.
Both permanent deletion modes remain disabled. Physical-device/owner acceptance pending.

## TPI-STUDIOFLOW-105 — Authorized production integration and release

Status: **INTEGRATED AND PUSHED / MANDATORY AUTH GATE FAILED / NOT DEPLOYED**.
[Release traceability, preserved development and exact gate failure](TPI-STUDIOFLOW-105-PRODUCTION-RELEASE.md).
104 evidence/release commit `20eba92`; application unchanged from `81a234a`.
Mandatory auth lifecycle exited 1: isolated release protected credential file missing.
Full preflight/deployment/live verification not run. Both deletion modes remain blocked.

## TPI-STUDIOFLOW-104 — Release acceptance and production readiness

Status: **LOCAL ACCEPTANCE PASSED / GUARDED RELEASE BLOCKED / NOT DEPLOYED**.
[Acceptance evidence, exact artifacts and remaining authorization gates](TPI-STUDIOFLOW-104-RELEASE-ACCEPTANCE.md).
Lifecycle 29/29; 035 33/33; 087 40/40; 088 31/31; 089 32/32;
authenticated 091 9/9; Worker integration 23/23. Application candidate unchanged.
Both permanent deletion modes unavailable. Authorized-branch integration/push,
clean origin parity and full guarded preflight remain pending; no merge/push/deploy.

## TPI-STUDIOFLOW-103 — Video Setup release candidate

Status: **SOURCE INTEGRATED / AUTOMATED PARTIAL / RELEASE BLOCKED / NOT DEPLOYED**.
[Candidate commits, hashes, checks and acceptance blockers](TPI-STUDIOFLOW-103-VIDEO-SETUP-RELEASE-CANDIDATE.md).
091 Firefox 9/9; both permanent deletion modes disabled; authenticated management acceptance pending.

## TPI-STUDIOFLOW-102 — Cross-tab recording deletion safety

Status: **BLOCKED / FAIL-CLOSED RETAINED / NOT DEPLOYED**.
[Real Firefox boundary evidence and remaining requirements](TPI-STUDIOFLOW-102-CROSS-TAB-RECORDING-DELETION-SAFETY.md).
Legacy tab bypass reproduced; 8/8 browser checks, 22/22 unit fixtures, TypeScript/build and 093 pass.

## TPI-STUDIOFLOW-101 — Local recording deletion safety

Status: **BLOCKED / PARTIALLY IMPLEMENTED / NOT DEPLOYED**.
[Execution evidence and coordination blocker](TPI-STUDIOFLOW-101-LOCAL-RECORDING-DELETION-SAFETY.md).
22/22 local fixtures, TypeScript/build and 093 pass; content deletion fails closed pending writer coordination.

## TPI-STUDIOFLOW-100 — Source isolation

Status: **SOURCE ISOLATED / NOT SAFETY VERIFIED / NOT DEPLOYED**.
[Owner directive and execution evidence](TPI-STUDIOFLOW-100-DELETION-ISOLATION.md).
Deletion-only source and server branches exclude 091/092; original development preserved.

## Current production reconciliation

## TPI-STUDIOFLOW-088 — 2026-10-26

Permanent Studio Deletion and Archive Management. Archive means preserve
(existing status-archived behavior: excluded from the active listing,
restorable, configuration and productions retained, available through an
Archived Studios view). Delete means remove permanently, only after a
confirmation dialog showing the exact Studio name, associated productions and
recordings counts, media impact, and a permanent-deletion warning, with the
Studio name typed to enable the action. The owner has approximately five test
Studios to remove through the finished interface; nothing is auto-deleted.
Browser-local Studios delete locally without damaging other Studios or
unrelated recovery snapshots, with tombstoning so stale snapshots cannot
recreate a deleted Studio. Testing uses disposable QA Studios only.
Archived verbatim at
[`TPI-STUDIOFLOW-088-PERMANENT-STUDIO-DELETION-AND-ARCHIVE-MANAGEMENT.md`](TPI-STUDIOFLOW-088-PERMANENT-STUDIO-DELETION-AND-ARCHIVE-MANAGEMENT.md).
Status: `REQUESTED / IMPLEMENTATION`.

## TPI-STUDIOFLOW-087 — 2026-10-25

Independent Studios, Studio Dashboards, and Production Ownership. Riverside-inspired
organization approved by the owner: every Studio is a permanent, independent
production environment with its own dashboard (Enter Studio, Livestreams,
Recordings, Webinars, Media, Studio Settings) and its own productions. Homepage
and My Studios must resolve the same authorized Studio identities; every
livestream, recording, and webinar carries a stable owning-Studio association.
No Reusable Studios, no new organizational layers, no replacement of the
working Studio identity or switching system. Phases: read-only architecture
investigation with a report before implementation, then homepage/dashboards,
production ownership for new productions, Studio management (rename, archive,
restore; permanent deletion reported separately), and regression plus live
verification. Destructive migrations, bulk historical production reassignment,
irreversible deletion, identity-system replacement, and destructive
browser-local/server reconciliation require separate owner approval. Archived
verbatim at
[`TPI-STUDIOFLOW-087-INDEPENDENT-STUDIOS-DASHBOARDS-PRODUCTION-OWNERSHIP.md`](TPI-STUDIOFLOW-087-INDEPENDENT-STUDIOS-DASHBOARDS-PRODUCTION-OWNERSHIP.md).
Status: `IMPLEMENTED / LOCAL TESTED / DEPLOYED / LIVE VERIFIED / OWNER ACCEPTANCE PENDING` — homepage Studio cards, per-Studio dashboards, Studio vs production creation with Owning Studio selection, production ownership stamping, and rename/archive/restore are live (087 suite 40/40 local and 40/40 on authenticated production). Permanent Studio deletion is deferred for owner approval; unowned historical productions remain preserved and unassigned. Source `db3aab4`; integration `37803f3` + `815fb85`; production Worker `b4605f5f-f33e-4f1d-8082-b12fc8bf5bdf`, rollback `6bbdae3d`. See `../300-COMPLETED-WORK/2026-10-26-TPI-STUDIOFLOW-087-INDEPENDENT-STUDIOS.md`.

## TPI-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001 — 2026-10-25

Emergency live production repair: remediates the owner's "Testing 123"
workspace (`a75afc38-c7a6-452d-9460-5d746712d411`) from its historically
inherited eight-item configuration to the clean four-item default (exact
operation requires owner approval; full state exported first), establishes the
"Browser Only Crossroads" browser-local switching recovery path with an
owner-executable diagnostic, and re-verifies Studio creation and switching on
authenticated production. Archived verbatim at
[`TPI-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001.md`](TPI-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001.md).
Crossroads of the Unknown and all other owner Studios are protected. Testing
123 was reset to the clean four-item default under explicit owner approval
(backed up first) and verified in the database and live interface; Studio
switching, creation and browser-local recovery were repaired and re-verified
on authenticated production (lifecycle suite 29/29, Worker `6bbdae3d`, source
`af7fbc0`). Status: `DEPLOYED AND AGENT-VERIFIED — OWNER ACCEPTANCE PENDING`.
Completion record:
[`../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001.md`](../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001.md).

## TPI-STUDIOFLOW-OWNER-VERIFICATION-001 — 2026-10-25

Post-Deployment Studio Management Verification & Owner Workflow Recovery.
Archived verbatim at
[`TPI-STUDIOFLOW-OWNER-VERIFICATION-001-POST-DEPLOYMENT-STUDIO-MANAGEMENT.md`](TPI-STUDIOFLOW-OWNER-VERIFICATION-001-POST-DEPLOYMENT-STUDIO-MANAGEMENT.md).
Requires authenticated production verification of the Studio lifecycle
recovery (creation, switching, isolation, persistence) with the isolated QA
account, read-only investigation of the owner Studios "Testing 123" and
"Browser Only Crossroads", and a completion report. Owner data is protected;
no destructive remediation without separate owner authorization. Status:
`AGENT VERIFIED — OWNER ACCEPTANCE PENDING`. Verified 2026-10-25: lifecycle
suite 25/25 on authenticated production and 25/25 locally; active Worker
`9d3aa40c-9a44-4bf9-bcf1-8efcbf837683` (rollback
`7bddac9c-bda3-41c1-95d2-13aacc09cb28`); live assets byte-identical to the
website integration. Read-only D1 inspection showed "Testing 123"
(`a75afc38-c7a6-452d-9460-5d746712d411`) retains historically inherited
Crossroads-like configuration saved by the pre-repair build (remediation
proposed, awaiting owner authorization); "Browser Only Crossroads" is
browser-local with no server record. `release:preflight` now runs the
lifecycle suite (release-safety contract check added); five pre-existing
static-contract failures and the flaky 030 rapid-upload step remain open and
documented. See
[`../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-OWNER-VERIFICATION-001.md`](../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-OWNER-VERIFICATION-001.md).

## Integrated Studio Management & Scene System Recovery — 2026-10-25

The integrated recovery is `DEPLOYED AND VISUALLY VERIFIED — OWNER
ACCEPTANCE PENDING`. It repaired independent Studio creation, active-Studio
switching, workspace isolation, viewport-safe Scenes menus, removal of legacy
Move Up/Move Down commands, meaningful autosave signals, and the denied
production-lock state that could poison later Studio switching. Source
`657f80e`, website application/verification `e83b732`, documentation
checkpoint `bae6ce0`; Worker
`7bddac9c-bda3-41c1-95d2-13aacc09cb28`; rollback
`871c0ae7-33c5-46ae-b635-19ec3100c989`. Guarded release safety passed 17/17,
anonymous production smoke passed 10/10, and live isolated Firefox acceptance
passed 64/64. See
[`../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-INTEGRATED-RECOVERY.md`](../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-INTEGRATED-RECOVERY.md).

## Studio Creation, Switching & Workspace Isolation Recovery — 2026-10-25

Status: `IMPLEMENTED / DEPLOYED / LIVE VERIFIED / OWNER ACCEPTANCE PENDING`.
The owner-rejected Studio Management recovery was re-investigated at runtime
and repaired at root cause: home-screen creation now starts every new Studio
from the clean four-item default configuration (no inherited Crossroads-style
scenes or media), Studio switching loads the selected Studio's own
configuration into every per-Studio slice, browser-local Studios without a
saved snapshot open with the default configuration and a visible notice
instead of silently reverting, failed pre-switch saves keep a local recovery
copy and explain themselves instead of vanishing into autosave noise, and
Home/Library entry preserves the outgoing Studio before activating the next
one. The maintained `verify:studioflow-studio-lifecycle` suite (Directive
Tests 1–10 plus owner-flow checks) passes locally and against production with
the isolated QA account. Source `44f9478` (StudioFlow canonical repository,
local-only); application `161d03d` (website integration, pushed); Worker
`9d3aa40c-9a44-4bf9-bcf1-8efcbf837683`; rollback checkpoint
`7bddac9c-bda3-41c1-95d2-13aacc09cb28`. Crossroads of the Unknown was not
modified. See
[`../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-STUDIO-LIFECYCLE-RECOVERY.md`](../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-STUDIO-LIFECYCLE-RECOVERY.md).

## Integrated Studio Management & Scene System Recovery — 2026-10-25

The recovery repair is committed locally but not released. Source `657f80e`
and website application `a952796` contain the verified lifecycle, clean
creation, Studio isolation, viewport-safe Scenes menus, and autosave changes.
The dedicated integrated Firefox suite passes 21/21. The complete regression
battery remains release-blocked by the maintained TPI-035 recording/storage
fixture's final cross-Studio preference switch (30 functional assertions pass;
the final switch assertion does not). Production Worker and data remain
unchanged. See
[`../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-INTEGRATED-RECOVERY.md`](../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-INTEGRATED-RECOVERY.md).

The latest StudioFlow release was deployed and verified from
`codex/tpi-development` commit `877efb3`
(TPI-STUDIOFLOW-037 production recovery; source commit `eff6b69`). Worker
`theparanormalinitiative` is running version
`871c0ae7-33c5-46ae-b635-19ec3100c989` at 100% traffic. The
guarded live isolated Firefox Developer Edition acceptance passed 64/64;
the focused suites passed 31/31 (021 browser interactions, twice), 33/33
(028 browser, twice), 25/25 (030 sound effects browser, twice), 34/34
(031 music pad browser interactions, twice), 86/86 (021 static
contracts), 14/14 (020 playback), 13/13 (020 video clips), 12/12 (027),
12/12 (031 video overlays), and 17/17 (release safety), and both pad
artwork files were verified serving byte-identical on production. The
documented rollback target is
`d58d7e1e-5f86-4c87-93b3-110999d200a9` (the prior TPI-STUDIOFLOW-037 Addendum E release).
The current approved StudioFlow playback contract and verified regression
history are recorded in
[`../TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`](../TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md).

This release record supersedes stale “not deployed” or “acceptance pending”
language in older directive rows only for the behavior covered by the verified
consolidated release. Those rows remain unchanged as historical evidence of
their original execution and limitations.

| Directive | Title / feature | Status | Evidence or dependency |
| --- | --- | --- | --- |
| TPI-MASTER-AUTONOMOUS | Standing autonomous agent authority | ACTIVE / CONTROLLING | Agents may investigate, repair, test, commit, push, perform guarded production deployment, verify live in Firefox Developer Edition, and roll back without obtaining a new directive for each ordinary lifecycle step. Irreversible owner-data operations and security bypasses remain separately controlled. |
| TPI-DEV-001 | Development environment standardization | BLOCKED / NON-PRODUCTION | Separate development Worker/D1/R2/auth resources are not present; production was not changed. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-MASTER-001A-PROGRESS-2026-10-20.md`. |
| TPI-MASTER-001 | Chronological production implementation register | BLOCKED — AUTHENTICATED PRODUCTION ACCEPTANCE REQUIRED | The selector repair and TPI-DEV-010 login repair are deployed; live Chrome renders Acceptance Test B and the editor controls, but production save/switch/refresh/media/guest acceptance cannot be claimed while reliable authenticated selector control is unavailable. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-MASTER-001C-RESULT.md`. |
| TPI-DEV-002 | Cloudflare development/production separation audit and migration plan | SUPERSEDED / BLOCKED FOR EXECUTION | Read-only topology audit and plan remain preserved; the current mission targets the existing production Worker and does not authorize a development infrastructure migration. |
| TPI-DEV-003 | Development workflow verification and setup | SUPERSEDED / NON-PRODUCTION | Historical canonical-source/workflow verification remains preserved; no production implementation was required. |
| TPI-DEV-004 | Official development workflow and documentation | COMPLETE / DOCUMENTATION ONLY | Official workflow README and onboarding updates in `docs/TPI-DEVELOPMENT/`; no branches, application code, Cloudflare resources, deployments, or production changes performed |
| TPI-DEV-005 | Build and deploy isolated development website | COMPLETE WITH OWNER ACCEPTANCE PENDING | Development branch, Worker, D1, R2, sanitized deployment preflight, dev accounts, and runtime verification recorded in `docs/TPI-DEVELOPMENT/200-AUDITS/TPI-DEV-005-IMPLEMENTATION.md`; production promotion remains prohibited |
| TPI-DEV-007 | Production/development content parity audit and repair | PARTIAL / OWNER ACCEPTANCE PENDING | Development-only synthetic content repair and runtime evidence in `docs/TPI-DEVELOPMENT/200-AUDITS/TPI-DEV-007-CONTENT-PARITY.md`; broader parity remains limited by missing sanitized fixtures and the local Wrangler `spawn EBADF` E2E runner issue |
| TPI-DEV-008 | Development deployment integrity and source reconciliation | COMPLETE WITH LIMITATIONS | Fail-closed preflight and recovery controls remain in place; source reconciliation and the development-only deployment are recorded in `docs/TPI-DEVELOPMENT/200-AUDITS/TPI-DEV-009-PRODUCTION-BASELINE-MIGRATION.md` |
| TPI-DEV-009 | Production baseline migration and development parity | COMPLETE WITH LIMITATIONS / OWNER ACCEPTANCE PENDING | Production baseline files were reconciled, the missing development StudioFlow relay schema was applied only to development, and development deployment `a6dded19-2f63-4a98-88c4-30ed3d02ca1b` passed smoke and protection checks; authenticated owner acceptance remains pending in `docs/TPI-DEVELOPMENT/200-AUDITS/TPI-DEV-009-PRODUCTION-BASELINE-MIGRATION.md` |
| TPI-DEV-010 | Member Login visual repair and authentication navigation audit | IMPLEMENTED — VERIFICATION PENDING / PRODUCTION DEPLOYED | The reviewed four-file repair is live in Worker `dd147e9d-1e6b-4e04-ad96-6df59cf70180`; authenticated browser state shows `Already Signed In`, dashboard/account-switch controls, protected member navigation, and Studio link. Signed-out submission, recovery branches, and full local multi-user E2E remain pending. |
| TPI-DEV-011 | Administration Center functional completion and website integration | SUPERSEDED / IMPLEMENTED THROUGH LATER PRODUCTION RELEASES | Later Administration completion and canonical production route releases supersede the development-only DEV-011 package; anonymous live protection passes, authenticated dashboard acceptance remains pending. |
| TPI-DEV-012 | Role permissions and creator access | IMPLEMENTED — VERIFICATION PENDING | Live anonymous admin/StudioFlow denial remains enforced; focused historical authorization checks pass 16/16, but production authenticated role acceptance is not claimed. |
| TPI-DEV-013 | Creator partnership and Administration Center integration | PARTIALLY COMPLETE / PRODUCTION LEDGER RECONCILIATION BLOCKED | Physical creator application columns/tables are present, but current production `d1_migrations` reports only `0001`/`0002`; no migration was replayed. |
| TPI-DEV-014 | Authenticated role and Creator Partnership lifecycle verification | COMPLETE WITH LIMITATIONS / DEVELOPMENT VERIFIED | Synthetic role matrix, application review, owner-gated activation, entitlement revocation/reactivation, 50-slot capacity, concurrency, audit, and fail-closed gate checks are recorded in `docs/TPI-DEVELOPMENT/200-AUDITS/TPI-DEV-014-AUTHENTICATED-VERIFICATION.md`; synthetic manifest and cleanup procedure are in `TPI-DEV-014-SYNTHETIC-TEST-MANIFEST.json` |
| TPI-DEV-015 | Development checkpoint and readiness | PARTIAL COMPLETION / DEVELOPMENT DEPLOYED / OWNER ACCEPTANCE PENDING | Committed source checkpoint, guarded development deployment provenance, fail-closed Founding 50 gate, synthetic authenticated regressions, and browser limitations are recorded in the TPI-DEV-015 checkpoint, audit, and implementation-report documents |
| TPI-DEV-016 | Authenticated browser acceptance and Creator Partnership interface completion | PARTIAL COMPLETION / OWNER ACCEPTANCE BLOCKED | Member desktop/mobile and anonymous protection were browser-verified; privileged admin/creator visual acceptance remains blocked by the unavailable secure synthetic-password browser bridge. See the TPI-DEV-016 audit and implementation report. |
| TPI-DEV-017 | Secure authenticated browser access and Administration Center functional completion | PARTIAL COMPLETION / TARGETED INTEGRATION ADDED | Added a local-only authenticated browser runner and protected Paranormal Teams claim-review surface; Playwright/DNS block live authenticated acceptance in this environment. See the TPI-DEV-017 authenticated-browser audit, functional-status audit, and implementation report. |
| TPI-DEV-018 | Administration Center functional completion — members, creator partnership, content, moderation, notifications, settings | DEPLOYED / AUTHENTICATED OWNER ACCEPTANCE PENDING | Current protected Admin implementation is active; focused source checks pass 11/11. |
| TPI-DEV-019 | Administration Center final workflows — Education, notifications, Paranormal Teams history, Creator Studio administration | DEPLOYED / AUTHENTICATED OWNER ACCEPTANCE PENDING | Article, notification, team-history, creator-detail, and navigation workflows are active; focused source checks pass 23/23. |
| TPI-DEV-020 | Administration Center owner acceptance and development persistence verification | CONDITIONALLY COMPLETE / API AND D1 VERIFIED / VISUAL ACCEPTANCE PENDING | Existing protected workflows passed 41/41 authenticated API checks and independent development D1 persistence checks. Additive fixtures are documented in `TPI-DEV-020-SYNTHETIC-FIXTURE-MANIFEST.json`; browser-visible owner smoke testing remains pending. |
| TPI-DEV-021 | Complete website functional audit, integration testing, and production readiness | AUDIT COMPLETE WITH LIMITATIONS / PRODUCTION NOT READY | Final development integration harness passed 116/116; D1 orphan-reference checks returned zero; browser visual acceptance and several media/interactive paths remain untested. See the TPI-DEV-021 functional matrix, security/data-integrity audit, production-readiness assessment, implementation report, and owner visual checklist. |
| TPI-DEV-022 | Media, Search, StudioFlow & Events functional completion and integration verification | HISTORICAL / SUPERSEDED BY TPI-DEV-023 THROUGH TPI-DEV-026 | Media/privacy, search, and event contracts were focused-tested during DEV-022. Its StudioFlow persistence limitation was later addressed by DEV-024 and DEV-025; retain the original audit as a historical record. |
| TPI-DEV-023 | Development checkpoint reconciliation, Events deployment verification, and StudioFlow completion assessment | HISTORICAL / SUPERSEDED BY TPI-DEV-024 THROUGH TPI-DEV-026 | DEV-023 correctly recorded the then-current persistence gap and verified Events. Workspace persistence was implemented by DEV-024; creator entitlement and local backup/import were verified by DEV-025; current limitations are reconciled by DEV-026. |
| TPI-DEV-024 | StudioFlow functional completion and creator workspace persistence | COMPLETE WITH LIMITATIONS / DEVELOPMENT DEPLOYED / PRODUCTION NOT TOUCHED | Checkpoint `53e8826`, development version `493f4531-808b-47f8-a50a-16b6d14f9aba`, live workspace QA 23/23, offline checks 13/13. Saved workspace metadata, versioned update, restore-read, archive, owner isolation, and revoked denial are verified; browser visual acceptance and positive ordinary-entitled-creator testing remain owner acceptance items. |
| TPI-DEV-025 | Creator entitlement, StudioFlow end-to-end acceptance, and local backup/restore | COMPLETE WITH LIMITATIONS / DEVELOPMENT DEPLOYED / PRODUCTION NOT TOUCHED | Checkpoint `a8ef0df`, development version `a51e3478-b620-4b6b-811c-a777af9b4a95`, positive creator acceptance 39/39, DEV-014 57/57, DEV-020 39/39, DEV-021 116/116. Local JSON configuration backup/import is implemented; browser file-picker, visual, recording-recovery, and live RealtimeKit acceptance remain owner/ provider-gated. |
| TPI-DEV-026 | Final development acceptance, documentation reconciliation, StudioFlow browser/recovery verification, and production-readiness preparation | COMPLETE WITH LIMITATIONS / DOCUMENTATION COMMITTED / PRODUCTION NOT TOUCHED | Current-state documentation, historical supersession notes, browser-limited acceptance, recording recovery assessment, RealtimeKit acceptance plan, release checklist, and production gap analysis are recorded in the TPI-DEV-026 reports. A stale navigation assertion was repaired and passes; no application deployment was required. |
| TPI-DEV-027 | Controlled production synchronization, live acceptance, migration reconciliation, and data preservation | RELEASE PREPARATION BLOCKED / NO PRODUCTION CHANGE | Production D1 schema and R2 configuration were inspected read-only. Production has no `studio_workspaces`, only ledger entries 0001/0002, and no verified external backup/restore artifact exists. The release candidate is documented, but the final approval gate was not reached and no production migration or deployment occurred. |
| TPI-DEV-028 | Live Administration Center implementation and focused production release | DEPLOYED WITH LIMITATIONS / LIVE PROTECTION VERIFIED | Focused Administration Center release deployed as final Worker version `830aa684-d14e-4d39-b103-7fb7538fef84`; anonymous admin access remains blocked, public routes remain reachable, D1/R2 were not modified, and creator-application detail/create remains deferred because production lacks the additive 0050 columns. |
| TPI-DEV-030 | Fix development-to-production deployment and unify Administration Center | DEPLOYED / AUTHENTICATED OWNER ACCEPTANCE PENDING | Canonical `/admin-panel` is served by the protected React package in the active Worker; focused route checks pass 9/9. |
| TPI-DEV-031 | Administration Center interactive visual analytics | DEPLOYED / AUTHENTICATED OWNER ACCEPTANCE PENDING | Protected analytics with explicit unavailable states are active; focused analytics checks pass 11/11. |
| TPI-DEV-032 | Administration Center navigation implementation correction | IMPLEMENTED / DEVELOPMENT AND PRODUCTION DEPLOYED / AUTHENTICATED PRODUCTION ACCEPTANCE PENDING | Existing member-shell navigation patterns now govern the protected Admin Center: fixed independently scrolling rail, responsive mobile drawer/bottom navigation, active indicators, saved theme/typography, main-site return control, and preserved DEV-031 analytics. Development `c181a58d-005d-4c57-b188-24d3467fef78`; production `4f679573-fb15-4bf9-9541-2a85e70209a0`; see the DEV-032 implementation report. |
| TPI-DEV-034 | Unified ParaNews and ParaTube layout and navigation | IMPLEMENTATION COMPLETE / ADDENDUM DEPLOYED / AUTHENTICATED PRODUCTION ACCEPTANCE PENDING | Canonical `/news` and `/paratube` use the existing TPI member shell; the addendum adds server-authoritative authenticated `/` routing and early non-white theme bootstrap. Development `264e5ea5-b165-4b6e-adc0-1bc41f7bebcc`; production `80cc9aa2-c2a2-4fc8-99c7-989e523e4654`; source `41de90a`; see the TPI-DEV-034 implementation report. |
| TPI-DEV-035 | Public landing page modernization, authenticated home routing, and public navigation restoration | IMPLEMENTED AND DEPLOYED WITH LIMITATIONS / AUTHENTICATED ACCEPTANCE PENDING | Shared member-shell navigation now serves public guest routes, hosted auth ignores stale local preview state, root responses are cache-safe, and the landing page exposes the established public destinations. Development 20031a3d-1c35-4621-a1b4-b74842256a95; production adc6e8d7-1950-49a7-8127-54f0a2acd634; source d127bd3; see the TPI-DEV-035 implementation report. |
| TPI-DEV-036 | StudioFlow saved-workspace production schema repair and persistence verification | IMPLEMENTED WITH LIMITATIONS / PRODUCTION SCHEMA REPAIRED | Production D1 received only the exact `studio_workspaces` table and two required indexes after a verified private backup; the existing Worker was not redeployed. Development QA passed 23/23 and non-authenticated production checks passed. Authenticated production workspace mutation remains not tested because no authorized production test account was available; see the TPI-DEV-036 implementation report. |
| TPI-DEV-037 | My Studios numbered Studio management, autosaving, branding, and production protection | IMPLEMENTED AND DEPLOYED / DEVELOPMENT FINAL ACCEPTANCE PASSED / AUTHENTICATED PRODUCTION MUTATIONS NOT TESTED | Correction `7385f0c`; development `cf58029d-62be-409f-98ff-58591b020641`, production `05c5d075-8d28-4f72-a4c8-a8edba01bb10`; final isolated acceptance 37/37, focused regressions, production read-only protection/preservation, fresh private backup, migration 0052, and provenance passed. Authenticated production Studio mutations remain not tested because no dedicated production test identity was authorized. |
| TPI-STUDIOFLOW-013 | Local production lock and concurrent session validation | PARTIALLY COMPLETE / LOCAL VALIDATION PASSED WITH MESSENGER ROUTE LIMITATION | Local-only migration 0053, isolated D1 backup, one authorized Worker restart, two-Studio schedule checks, creator lock conflict/release/concurrency checks 15/15, browser StudioFlow checks, and regressions are recorded in `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-013-VALIDATION-RESULT.md`; direct `/messenger` navigation was blocked by the in-app browser and remains unverified. |
| TPI-STUDIOFLOW-014 | Podcast production readiness | PARTIALLY COMPLETE / LOCAL INSPECTION PASSED / RUNTIME CORRECTION VALIDATION BLOCKED BY NO-RESTART GATE | Existing synthetic Studios, asset/reference boundaries, browser and folder recording paths, recovery model, scheduling, and production-lock integration were inspected. A focused SPA bridge reattachment correction is staged and passes 10/10 offline checks; live verification requires a separately authorized Worker restart. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-014-READINESS-RESULT.md`. |
| TPI-STUDIOFLOW-017 | Seamless Studio switching and automatic restoration | LIVE VERIFIED / CONDITIONALLY ACCEPTED | Owner-authorized local browser verification passed direct Studio opening, save-before-switch, synthetic Studio setting persistence, scene isolation, and last-active-Studio restoration. Focused offline checks pass 14/14; live recording/livestream and injected save-failure tests were intentionally not performed. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-017-RESULT.md`. |
| TPI-STUDIOFLOW-017 SMART Pads addendum | Sound-effect and background-music SMART Pads, live program playback, scene music handoff, titles, colors, and loop persistence | DEPLOYED / LIVE UI VERIFIED / OWNER-MEDIA PLAYBACK NOT EXERCISED | Existing media libraries remain authoritative. Focused build, isolated E2E, production smoke, live shell, and Firefox scene-control checks passed. Disposable authenticated audio playback remains a separate acceptance item because Crossroads owner media was not modified. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/2026-10-22-STUDIOFLOW-SMART-PADS-RESULT.md`. |
| TPI-STUDIOFLOW-019 | Intro and outro video full-stage display correction | CONDITIONALLY COMPLETE / INTRO LIVE VERIFIED / OUTRO AND PRODUCTION OUTPUT PENDING | Shared direct stage-video rendering now explicitly fills the 16:9 stage with proportional `contain` behavior. The owner’s Crossroads intro was measured live in a temporary browser-local synthetic test and then removed; focused checks pass 7/7 and prior StudioFlow regressions remain green. No separate Outro fixture was available, and recording/livestream output was not activated. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-019-RESULT.md`. |
| TPI-STUDIOFLOW-020 | Intro/outro Play/Stop toggles, fresh-start safety, and Opera compatibility | CONDITIONALLY COMPLETE / LOCAL TOGGLE VERIFIED / RECORDING-LIVESTREAM ACCEPTANCE PENDING | Added the reset/toggle bridge, one-shot compositor playback, recording/livestream preview safety, and universal stage sizing. Codex live toggle checks passed; Opera was directly inspected and the stretched-stage cause was corrected locally. Full natural completion and recording/livestream startup remain pending because those actions were not activated. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-020-RESULT.md`. |
| TPI-STUDIOFLOW-021 | Unified Opera development browser workflow | PASSED WITH LIMITATION / OPERA PRIMARY / LOCAL ONLY | Opera is established as the authoritative live StudioFlow browser at `http://127.0.0.1:8787/studio/`. Source inspection documents server-shared workspace configuration versus browser-specific localStorage, IndexedDB, cookies, and ephemeral channels. No browser data was modified; Codex remains an isolated synthetic test surface. Opera's network/storage inspectors were not exposed by the available automation surface. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-021-RESULT.md`. |
| TPI-STUDIOFLOW-022 | Development Studio backup and recovery investigation | INVESTIGATION COMPLETE / BACKUP IMPLEMENTATION DEFERRED | Read-only storage architecture, D1/browser/media boundaries, risk assessment, backup-format comparison, non-destructive recovery design, and security requirements are documented in `docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-STUDIOFLOW-022-BACKUP-RECOVERY-INVESTIGATION.md`; no backup, export, restore, or data change was performed. |
| TPI-STUDIOFLOW-023 | Active Studio name in navigation | COMPLETE / OPERA VERIFIED / LOCAL ONLY | Development-only cache-busted bridge loading, JSON active-broadcast parsing, post-hydration reconciliation, and local-only broadcast safety are implemented. Opera visibly shows `Crossroads of the Unknown ▾`; focused checks pass 14/14 and TPI-017 remains 14/14. No browser storage was cleared, no deployment or restart occurred for the final correction, and earlier authorized refresh autosave activity is documented. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-023-RESULT.md`. |
| TPI-STUDIOFLOW-024 | Automatic local backup system — Phase 2 implementation | CONDITIONALLY COMPLETE / SYNTHETIC VALIDATION PASSED / OWNER ACTIVATION DEFERRED | Implemented a versioned manifest, allow-listed media collector, staged verified writer, change detection, guarded desktop destination adapter, Backup & Recovery status UI, and synthetic failure/integrity tests. Automatic backups remain off; no owner folder was selected, no owner media was read/exported, no restore or runtime reload occurred. See `docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-STUDIOFLOW-024-LOCAL-BACKUP-ARCHITECTURE.md` and `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-024-PHASE-2-RESULT.md`. |
| TPI-STUDIOFLOW-025 | Active workspace reconciliation and safe test-Studio cleanup | COMPLETE / LOCAL OPERA VERIFIED / PRODUCTION NOT TOUCHED | Crossroads resolved to workspace `43b20614-69da-4d82-af9d-063cace4b6cc`; only authorized Studios 8 and 9 were archived through the supported UI, Opera now shows Crossroads as active, and focused checks pass. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-025-RESULT.md`. |
| TPI-STUDIOFLOW-025 Diagnostic | Opera browser settings, cache, and Studio persistence investigation | CONDITIONALLY COMPLETE / READ-ONLY / IMPLEMENTATION DEFERRED | Opera settings do not explain the error; the remaining evidence points to an application reconciliation/state-integrity defect, with browser-private storage and response headers not directly exposed by the available automation. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-025-DIAGNOSTIC-RESULT.md`. |
| TPI-STUDIOFLOW-026 | Crossroads configuration integrity and save verification | CONDITIONALLY COMPLETE / READ-ONLY / CORRECTION DEFERRED | Crossroads remains active at version 152 with matching workspace and broadcast IDs, but nested `state_json.broadcast.title` is empty because the current save shape preserves identity without backfilling the workspace title. Scenes and media references were assessed read-only; no owner data was modified. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-026-RESULT.md`. |
| TPI-STUDIOFLOW-027 | Studio title persistence correction and configuration protection | CONDITIONALLY COMPLETE / CODE CORRECTED / OWNER REPAIR DEFERRED | Added verified title normalization, conflict rejection, explicit-rename synchronization, and 21/21 synthetic checks. Crossroads remains untouched; its existing empty nested title awaits separate repair authorization. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-027-RESULT.md`. |
| TPI-STUDIOFLOW-028 | Crossroads workspace repair and persistence verification | CONDITIONALLY COMPLETE / OWNER TITLE REPAIRED / SNAPSHOT TIMING LIMITATION | The corrected Worker was staged and restarted locally; Opera's supported restore/autosave path wrote the authorized nested title, and D1 now reports version 154 with preserved configuration. A verified post-repair recovery snapshot exists; a pre-write snapshot was not possible because the authorized refresh triggered the supported save immediately. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-028-RESULT.md`. |
| TPI-STUDIOFLOW-029 | Trusted development agent authorization and TPI-028 completion | CONDITIONALLY COMPLETE / LOCAL ONLY | Local Worker recovery, corrected bundle verification, Crossroads title persistence, Opera verification, archived-Studio checks, and focused regressions passed. The owner-data repair occurred through the supported restore/autosave path; the pre-write snapshot timing limitation remains documented. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-029-RESULT.md`. |
| TPI-STUDIOFLOW-030 | Automatic backup integration, Opera verification, and recovery readiness | CONDITIONALLY COMPLETE / SYNTHETIC FILESYSTEM VERIFIED / OWNER ACTIVATION DEFERRED | The backup core now performs read-back verification, the browser bridge resolves IndexedDB media bytes and supports guarded manual/automatic workflows, and isolated real-filesystem checks pass 13/13. Automatic backups remain off for Crossroads; owner folder permission, owner backup activation, mobile fallback, and restore remain deferred. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-030-RESULT.md`. |
| TPI-STUDIOFLOW-031 | Remove unwanted video overlay controls | CONDITIONALLY COMPLETE / SOURCE FIX VERIFIED / OPERA VERIFICATION BLOCKED | Opera Video Popout/Video Skip overlays are avoided with a stage-only canvas mirror plus native media hints; focused checks pass 12/12 and the combined regression set passes 103/103. The existing Opera tab remains loading with the pre-change render, so live loop verification is not credited. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-031-RESULT.md`. |
| TPI-STUDIOFLOW-032 | Backup & Recovery completion, Opera integration, automatic backups, and full Studio restoration | CONDITIONALLY COMPLETE / SYNTHETIC RESTORE VERIFIED / OWNER ACTIVATION DEFERRED | Added verified media-inclusive restore-as-new, per-Studio backup settings, custom-background coverage, identity remapping, and restore failure cleanup. The combined focused set passes 119/119. Opera remains Crossroads-active, but no owner folder permission, owner backup activation, or browser-driven restore was performed. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-032-RESULT.md`. |
| TPI-STUDIOFLOW-033 | Real Opera backup and restore verification | CONDITIONALLY COMPLETE / REAL SYNTHETIC OPERA WORKFLOW VERIFIED | Opera selected the dedicated synthetic folder, granted edit permission, wrote and read back a six-media verified package, completed a debounced automatic backup, and restored as a new synthetic workspace. Crossroads remained untouched; shared-D1 disaster recovery, physical cross-device recovery, and recording-byte backup remain pending. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-033-RESULT.md`. |
| TPI-STUDIOFLOW-034 | Automatic server startup and local runtime reliability | CONDITIONALLY COMPLETE / STARTUP AND RECOVERY VERIFIED | The existing LaunchAgent now uses a stable Node path, waits for clean unload/reload, and recovers when the 8787 Worker loses readiness. The local access gate remains intact; Opera's authenticated owner UI remains unverified because the automation retained a browser error page. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-034-RESULT.md`. |
| TPI-STUDIOFLOW-037 | Safari white-screen investigation and repair | COMPLETE / SAFARI VERIFIED / LOCAL ONLY | Fixed clean-URL static asset fallback in the local Worker. Safari now renders the clean homepage, Member Home, and StudioFlow routes; focused checks pass 7/7 and protected Crossroads data was read-only preserved. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-037-RESULT.md`. |
| TPI-STUDIOFLOW-047 | Development recovery, final StudioFlow integration, and production release readiness | PARTIAL / LOCAL INTEGRATION COMPLETE / PRODUCTION NOT READY | Crossroads was inspected read-only after Opera cleanup; asset staging was rebuilt; the main Room Bridge status card was removed; guest waiting-room regressions passed; production deployment remains separately blocked pending authenticated HTTPS/WebRTC and owner media-recovery acceptance. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-047-RESULT.md`. |
| TPI-STUDIOFLOW-048 | Persistent project saving, backups, and recovery | CONDITIONALLY COMPLETE / LOCAL IMPLEMENTATION AND SYNTHETIC VERIFICATION | Existing D1 workspace persistence remains authoritative; Save Project, project metadata export/import, version-safe autosave, owner-scoped R2 recovery snapshots, and explicit restore-as-new UI are implemented. Focused checks pass 20/20; live authenticated snapshot round-trip remains follow-up acceptance. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-048-RESULT.md`. |
| TPI-STUDIOFLOW-049 | Portable project backups and save status system | CONDITIONALLY COMPLETE / LOCAL IMPLEMENTATION AND SYNTHETIC VERIFICATION | Added explicit server-confirmed save states, portable configuration export status, verified complete-backup integration, version-aware current/outdated tracking, and separate R2 recovery-snapshot terminology. Browser download completion remains user-confirmed and live authenticated UI acceptance remains follow-up work. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-049-RESULT.md`. |
| TPI-STUDIOFLOW-050 | Critical Studio interface flickering / reload loop repair | PARTIAL / SOURCE REPAIR COMPLETE / AUTHENTICATED BROWSER VERIFICATION PENDING | Removed the confirmed workspace-reconciliation document reload paths; focused stability checks pass 10/10 and the broader StudioFlow set passes 170/170. The visible Opera page was stable during observation, while an authenticated Studio session was not available for the required continuous runtime check. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-050-RESULT.md`. |
| TPI-STUDIOFLOW-052 | Fresh-browser session and Home page flickering | BLOCKED / DATA-INTEGRITY INCIDENT REQUIRES OWNER REVIEW | Confirmed stale local bridge delivery and a fresh-session autosave initialization loop; repaired staging, watcher coverage, and state hydration. Guarded browser verification passed, but an initial unguarded diagnostic unexpectedly wrote to Crossroads, so no completion claim or rollback was made. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-052-RESULT.md`. |
| TPI-STUDIOFLOW-051 | StudioFlow production migration and controlled live deployment | BLOCKED / NO DEPLOYMENT | Authoritative source build passes, but production asset reconciliation is incomplete, the guarded deploy requires a clean reviewed application checkpoint, and read-only Cloudflare D1 verification failed with OAuth error 10000. Local regressions pass; production authentication, D1/R2, HTTPS/WebRTC signaling, and rollback gates remain unverified. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-051-RESULT.md`. |
| TPI-STUDIOFLOW-053 | Crossroads data integrity and release recovery investigation | COMPLETE / READ-ONLY / RECOVERY NOT PERFORMED | Read-only inspection recorded version 240, preserved workspace and broadcast identities, and zero persisted scenes. No restore, overwrite, browser-storage change, or database mutation was performed. The later owner decision to rebuild Crossroads supersedes recovery action; see `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-053-RESULT.md`. |
| TPI-STUDIOFLOW-054 | Production release preparation and live migration | BLOCKED / NOT DEPLOYED | Production migration was not executed. Existing production resources remain protected; source/build review, schema, authenticated acceptance, media persistence, guest signaling, and rollback gates remain release prerequisites. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-054-RESULT.md`. |
| TPI-STUDIOFLOW-055 | Source and website integration reconciliation | PARTIAL / LOCAL RECONCILIATION VERIFIED / RELEASE CHECKPOINT PENDING | The authoritative source builds reproducibly twice and the integrated candidate preserves the TPI bridge layer. The source worktree remains dirty and mixed website/backend changes require review before staging. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-055-RESULT.md`. |
| TPI-STUDIOFLOW-056 | Release checkpoint preparation and documentation synchronization | COMPLETE / AUDIT COMPLETE / NO CHECKPOINT CREATED | The website worktree contains 33 modified tracked files and 259 untracked paths. A proposed manifest separates source, generated assets, integration, tests, documentation, local-only files, and owner-review items; no files were staged or committed. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-056-RESULT.md`. |
| TPI-STUDIOFLOW-057 | Verification test reconciliation | COMPLETE / 107 OF 107 CHECKS PASS | Updated intentional TPI-012 project-menu expectations and current-asset discovery in TPI-020, TPI-031, and TPI-045; repaired the confirmed compositor clip-loop regression; added TPI-055 integration checks. No deployment, commit, push, or owner-data access occurred. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-057-RESULT.md`. |
| TPI-STUDIOFLOW-058 | Authoritative source repository checkpoint preparation | COMPLETE / PREPARED / OWNER AUTHORIZATION REQUIRED | Reviewed the separate StudioFlow source repository at `main`/`8437b071`; only `src/App.tsx` and `src/styles.css` are modified, the authoritative build passes, the current website assets match source output byte-for-byte, and no commit or push was created. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-058-RESULT.md`. |
| TPI-STUDIOFLOW-059 | Source checkpoint staging and final review | COMPLETE / STAGED / AWAITING OWNER COMMIT AUTHORIZATION | Exactly `src/App.tsx` and `src/styles.css` are staged in the authoritative source repository. Cached diff checks pass; no other files are staged and no commit or push occurred. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-059-RESULT.md`. |
| TPI-STUDIOFLOW-060 | Authorized source checkpoint commit | COMPLETE / LOCAL COMMIT CREATED / NOT PUSHED | Created exactly one local commit `a919a881705c4f21dc184a6f2af8a5096d68e5f4` containing only `src/App.tsx` and `src/styles.css`. The authoritative build and website integration compatibility checks pass; no push or deployment occurred. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-060-RESULT.md`. |
| TPI-STUDIOFLOW-061 | Website integration checkpoint audit | COMPLETE / AUDIT COMPLETE / NO CHECKPOINT CREATED | Audited 37 modified tracked files and 269 pre-audit untracked paths; verified approved source commit `a919a881705c4f21dc184a6f2af8a5096d68e5f4`, matching JS/CSS hashes, bridge preservation, and 115/115 local checks. Mixed backend hunks and migration 0053 remain owner-review items; nothing was staged, committed, pushed, or deployed. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-061-RESULT.md`. |
| TPI-STUDIOFLOW-062 | Website repository change inventory and change-control audit | COMPLETE / INVESTIGATION COMPLETE / NO CODE OR GIT CHANGES | Inventoried 37 modified tracked paths and 270 untracked paths, attributed Administration, StudioFlow, shared backend, operations, research, and unknown material, and documented hunk-level backend risks and release-control recommendations. No application or Git state was changed. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-062-RESULT.md` and `docs/TPI-DEVELOPMENT/TPI-WEBSITE-REPOSITORY-CHANGE-INVENTORY.md`. |
| TPI-063 | Master development system foundation, platform audit, and modular registry | COMPLETE / DOCUMENTATION FOUNDATION CREATED / NO CODE OR GIT CHANGES | Audited the website architecture and created `docs/TPI-MASTER-DEVELOPMENT/` with eight division masters, confirmed module records, shared dependency mapping, uncommitted-work mapping, mission control, release register, and Rabbit Hole backlog. StudioFlow remains the primary mission; no application or Git state was changed. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-063-RESULT.md`. |
| TPI-064 | StudioFlow backend separation and release manifest | COMPLETE / READ-ONLY AUDIT / CHECKPOINT NOT STAGED | Classified every changed hunk in `functions/api/[[path]].js`, `worker.js`, and `lib/auth.js`; identified StudioFlow requirements, shared dependencies, local-only guards, migration 0053 dependencies, and an exact required/deferred/excluded manifest. No files were staged, committed, deployed, or migrated. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-064-RESULT.md`. |
| TPI-065 | StudioFlow production-safe backend extraction | PARTIAL / CONTROLLED LOCAL EXTRACTION / NO STAGE OR COMMIT | Moved the API runtime import to a shared outbound-fetch module while preserving the local guard as a compatibility wrapper. Shared backend StudioFlow hunks and migration 0053 remain deferred pending owner review; local source checks pass, but the local Worker HTTP probe remains unavailable. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-065-RESULT.md`. |
| TPI-066 | StudioFlow isolated release candidate | PARTIAL / CANDIDATE PREPARED / NOT COMMITTED OR DEPLOYED | Created `/Users/toddknipple/Documents/GitHub/tpi-studioflow-release-candidate` from the verified website HEAD, applied only the explicit StudioFlow manifest, verified reproducible source staging, passed 285/285 focused checks, and validated local unauthenticated routing on an isolated port. Authenticated acceptance, migration approval, and production release remain pending. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-066-RESULT.md`. |
| TPI-067 | StudioFlow release candidate acceptance | PARTIAL / AUTHENTICATED STUDIOFLOW VERIFIED WITH RELEASE BLOCKERS / NOT COMMITTED OR DEPLOYED | The isolated candidate passed 285/285 focused checks, synthetic authenticated StudioFlow browser loading, workspace save, R2 recovery snapshot round-trip, production-session lifecycle, asset protection, and authorization checks. Room creation is blocked by intentionally absent RealtimeKit credentials; the installed local workerd requires a temporary 2026-07-15 override for the repository's 2026-07-18 compatibility date; the login redirect to `/member-home` returned 404 in the isolated candidate. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-067-RESULT.md`. |
| TPI-STUDIOFLOW-068 | StudioFlow release blocker resolution | PARTIAL / ROUTE AND LOCAL RUNTIME REPAIRED / NOT DEPLOYED | The candidate now resolves the existing clean `/member-home` login destination through the existing `member-home.html` asset and has a candidate-scoped `wrangler.local.toml` using the installed workerd ceiling of 2026-07-15; production `wrangler.toml` remains unchanged. Synthetic browser acceptance passed login, member-home refresh, StudioFlow access, logout, and unauthorized StudioFlow blocking. StudioFlow media remains browser-local and disposable RealtimeKit credentials remain required for room acceptance. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-068-RESULT.md`. |
| TPI-STUDIOFLOW-069 | StudioFlow media persistence and guest readiness | PARTIAL / DISPOSABLE MEDIA PATH VERIFIED / NOT DEPLOYED | Added candidate-only authenticated workspace media upload, listing, and retrieval through R2 with D1 metadata, ownership checks, type/size validation, stable references, and bridge synchronization. Disposable API and browser checks passed; second browser-profile and live RealtimeKit guest acceptance remain unverified. Migration 0054 is unapplied and production approval is outstanding. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-069-RESULT.md`. |
| TPI-STUDIOFLOW-070 | Final StudioFlow release readiness and acceptance gate | PARTIAL / RELEASE BLOCKED / NOT DEPLOYED | Candidate state and manifest were re-audited; 22 focused suites pass (290/290 including TPI-069), syntax and diff checks pass, and migration order/security controls are documented. Required two-profile media portability and live RealtimeKit acceptance could not be executed because the browser surface exposes no separate disposable profiles and no disposable RealtimeKit variables are configured. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-070-RESULT.md`. |
| TPI-STUDIOFLOW-071 | Existing live guest integration verification | PARTIAL / EXISTING GUEST PATH CONFIRMED / PRODUCTION ACCEPTANCE BLOCKED | Confirmed the existing WebRTC guest UI, local room gateway, Worker room-relay routes, RealtimeKit room controls, invitation, admission, removal, and closure paths. Local room-gateway contracts and focused guest/authentication suites pass. The candidate has no disposable RealtimeKit configuration, omits the standalone local gateway by design, and its production relay wrappers require owner/admin authentication while guest links are documented as account-free; this boundary requires explicit release review. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-071-RESULT.md`. |
| TPI-STUDIOFLOW-072 | Production update preparation and release manifest | PARTIAL / RELEASE UPDATE PREPARED FOR OWNER REVIEW / NOT DEPLOYED | Authoritative/candidate JS and CSS hashes match, the required StudioFlow bridge layer is preserved, and targeted candidate checks pass 71/71. The documented production baseline is historical and not revalidated; shared backend/authentication hunks, guest relay authorization, migrations 0053/0054, disposable RealtimeKit acceptance, and two-profile media portability remain release blockers. No staging, commit, push, migration, or deployment occurred. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-072-RESULT.md`. |
| TPI-STUDIOFLOW-073 | Final StudioFlow release candidate isolation | COMPLETE / RELEASE DIFF ISOLATED / UNSTAGED / NOT DEPLOYED | Removed local auth changes, scoped development cache handling to StudioFlow, verified that existing guest-code relay route handlers are unchanged from baseline, and prepared an exact selective release manifest. The approved source build reproduces twice; 23/23 StudioFlow suites, 21 new API/Worker checks, and 13/13 website navigation checks pass. Migrations 0053/0054 pass disposable SQLite preservation checks and remain unapplied to production. No staging, commit, push, or deployment occurred. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-073-RESULT.md`. |
| TPI-STUDIOFLOW-074 | Create controlled StudioFlow Git checkpoint | COMPLETE / LOCAL COMMIT CREATED / NOT PUSHED OR DEPLOYED | Committed exactly the approved 37-path TPI-073 manifest on `codex/studioflow-release-candidate` as `ebcd0122e8099418fa99ed07c32d0f9d8c1d31a0`; parent is the verified baseline `7385f0cf24155f121bdc967a0985553daa8a05df`. The staged manifest, security exclusions, 23/23 StudioFlow suites, reproducible source build, and 13/13 website navigation checks passed. Excluded local-development files remain unstaged and untouched. Production migration/deployment remain unauthorized. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-074-RESULT.md`. |
| TPI-STUDIOFLOW-075 | Production release readiness | PARTIAL / NO-GO / NOT DEPLOYED | Verified candidate commit `ebcd0122e8099418fa99ed07c32d0f9d8c1d31a0` (37 approved paths), reproducible source assets, 21/21 maintained verification scripts, and 13/13 navigation checks. Production branch is documented as `main`; Wrangler is the repository deployment mechanism, but dashboard Git integration and the currently deployed Worker revision remain unconfirmed. Historical production D1 migration-ledger/schema discrepancy and stale local `origin/main` ancestry require reconciliation. No production access, migration, push, or deployment occurred. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-075-RESULT.md`. |
| TPI-STUDIOFLOW-076 | Final StudioFlow production release execution | BLOCKED / NO INTEGRATED COMMIT / NOT PUSHED OR DEPLOYED | Refreshed GitHub refs and performed authorized read-only production inspection. Worker version `05c5d075-8d28-4f72-a4c8-a8edba01bb10` is current in deployment metadata, but its source SHA is unknown. Production D1 ledger has only 0001/0002 while physical schema is ahead; 0053 columns/session table and 0054 media table are absent. Applying the approved 37-path commit to current documented promotion branch `main` conflicts in the shared API, Worker and Studio entry point, and requires missing workspace bridge/API dependencies. The isolated integration branch is clean; no commit was created. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-076-RESULT.md`. |
| TPI-STUDIOFLOW-078 | StudioFlow production recovery and environment reconciliation | PARTIAL / DEPLOYED WITH PROTECTED DATA PRESERVED | Recovered the completed StudioFlow release, verified existing production bindings and protected D1 backup, and documented Brand/My Studios/live-bridge boundaries. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-079-RESULT.md`. |
| TPI-STUDIOFLOW-079 | Complete StudioFlow live-site repair | PARTIAL / DEPLOYED / LIVE UI ACCEPTED / SERVER-BACKED ACCEPTANCE PENDING | Worker `93e5acef-6dc2-4d2d-aeed-edb72dda1c3c` deployed the DOM insertion repair and cache-busted `single-dropdown-v5` bridge. Fresh authenticated live-editor verification confirmed the selector, nested Studio Menu, production controls, and 60-second stability. Protected Crossroads was not mutated; disposable server-backed save/media/guest acceptance remains pending. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-079-RESULT.md`. |
| TPI-STUDIOFLOW-081 | Controlled production acceptance | PARTIAL / FIXTURES PROVISIONED / LIVE PERSISTENCE ACCEPTANCE PENDING | Owner-authorized fixtures A and B are present and returned by the authenticated workspace API; A was UI-created and B used a controlled additive D1 fallback. Crossroads remains unchanged. Full editor save/switch/refresh isolation, synthetic media, guest acceptance, and independent browser-download confirmation remain pending. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-081-RESULT.md`. |
| TPI-STUDIOFLOW-082 | Production acceptance and browser test recovery | PARTIAL / AUTOMATION BLOCKER / NO CODE CHANGE | Fresh live Home is stable, but editor DOM/AX and screenshot capture become unavailable after editor entry; the same automation path does not activate ordinary local editor controls. The My Studios handler is present in the authoritative bridge, so no speculative production patch was deployed. A reliable manual or alternate-browser click is required before classifying the dropdown as an application defect. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-082-RESULT.md`. |
| TPI-STUDIOFLOW-083 | StudioFlow scene-list production repair | COMPLETE / TARGETED UI REPAIR VERIFIED | Workspace hydration was writing an incomplete `studioScenes` list after initialization. The asset-state and workspace bridges now normalize the hydrated list, and the cache-busted production package was deployed as Worker `bcf91bac-c524-4f3e-aea1-a1e561f02413`. Opera live verification showed Intro, Default Scene, Demo scene 1, Demo scene 2, and Outro. No D1/R2 writes or owner-data changes occurred. Broader authenticated persistence/media/guest gates remain separate. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-083-RESULT.md`. |
| TPI-STUDIOFLOW-084 | Firefox login layout repair | COMPLETE / LIVE VISUAL VERIFICATION | Added explicit submit-button spacing to `style.css` and cache-busted `member-login.html` to `style.css?v=91`. Deployed only `/member-login.html` and `/style.css` as Worker `8d240a53-7dc3-464d-8a86-e0ddcff191bd`. Firefox Developer Edition live verification shows the Sign In button separated from the password field and fully usable. Authentication logic and production data were unchanged. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-084-RESULT.md`. |
| TPI-STUDIOFLOW-084-MEDIA | Production media verification and Crossroads asset protection | PARTIAL / AUDIO AND VIDEO VERIFIED / IMAGE AND BACKUP GATES OPEN | Firefox Developer Edition verified authenticated production audio download and video playback from Acceptance Test A, plus empty media isolation for Acceptance Test B. A valid overlay image remained UI-visible but did not appear in A's server media metadata after save/re-upload. No verified media-inclusive Crossroads backup artifact was found. No application code, production data, or deployment was changed. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-084-MEDIA-RESULT.md`. |
| TPI-MASTER-001E | Finish uncompleted StudioFlow production acceptance | BLOCKED — OWNER ACTION REQUIRED / CORE A-B PERSISTENCE VERIFIED | Firefox live verification passed the selector, direct A/B switching, save-before-switch, server-backed isolation, and refresh restoration. Worker `b8d85644-afd2-487e-b46b-2e698fa12deb` is deployed. Synthetic R2 media acceptance, independent Crossroads backup verification, and disposable Live Bridge acceptance remain unverified or externally blocked. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-MASTER-001E-RESULT.md`. |
| StudioFlow master handoff | ACTIVE HANDOFF / PARTIAL DEPLOYMENT | The consolidated source, directive, PDF, test, deployment, protection, and next-step record is `docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-MASTER-HANDOFF.md`. |
| TPI-OPS-002 | Cloudflare development traffic forensics and request protection | DEPLOYED WITH LIMITATIONS / LIVE ANONYMOUS SMOKE PASSED / AUTHENTICATED OWNER ACCEPTANCE PENDING | Guest/hidden-tab/in-flight polling guards and fail-closed QA request budgets pass 11/11 focused checks. The production-relevant runtime guards are deployed in Worker `f0477367-ea62-4e30-a7b7-22558b18a99b`; local-only configuration remains excluded. See the request-forensics audit and completion report. |
| TPI-OPS-005 | Controlled development deployment, traffic stabilization, and verification | PARTIALLY COMPLETED / DEVELOPMENT DEPLOYED / LIMITED BASELINE | OPS-002 runtime protections were deployed once to development as `802425a6-e7d0-4ff4-917f-12fff09d147f`; bounded verification used 13/30 requests, production remained unchanged, and full authenticated multi-hour traffic attribution remains unverified. See the OPS-005 baseline and deployment verification records. |
| TPI-OPS-006 | Local development environment replication assessment | ASSESSMENT COMPLETE / IMPLEMENTATION NOT AUTHORIZED IN THIS DIRECTIVE | Read-only Worker, Wrangler, D1/R2, authentication, StudioFlow, outbound-isolation, and agent-access assessment in `200-AUDITS/TPI-OPS-006-LOCAL-ENVIRONMENT-ARCHITECTURE.md`; implementation remains future work in `400-FUTURE-DEVELOPMENT/TPI-LOCAL-DEVELOPMENT-IMPLEMENTATION-PLAN.md`. No local server, deployment, data mutation, or application change was performed. |
| TPI-OPS-007 | Local development server foundation and isolated runtime | HISTORICAL / COMPLETED BY TPI-OPS-008 | Added the initial local Wrangler config/launcher, isolated D1/R2 foundation, request guards, local banner, and offline regressions. The startup blocker was repaired by OPS-008. |
| TPI-OPS-008 | Local Wrangler runtime startup repair and operational verification | COMPLETE / LOCAL HTTP VERIFIED | Sanitized local asset staging, runtime-supported local compatibility date, explicit secret-free env selection, actual TPI Worker HTTP verification, clean shutdown, and safety regressions are recorded in `200-AUDITS/TPI-OPS-008-WRANGLER-STARTUP-DIAGNOSTICS.md` and the completion report. |
| TPI-OPS-009 | Local authentication, synthetic test accounts, and session isolation | PARTIALLY COMPLETED / LOCAL AUTH VERIFIED WITH BOUNDARIES | Local-only loopback cookie compatibility, repeatable synthetic accounts, session expiration/logout invalidation, role enforcement, and authenticated member-home routing passed 27 bounded checks. Later capability-specific admin routes and browser visual acceptance remain outside the minimal local schema/test boundary; see the OPS-009 verification and result records. |
| TPI-OPS-010 | Local Community Feed, Messenger, Notifications, and member data services | PARTIALLY COMPLETED / LOCAL APIs VERIFIED WITH BOUNDARIES | Narrow isolated local D1 schema, repeatable fictional fixtures, 38 service checks, and the OPS-009 27-check authentication regression passed. Browser authenticated visual acceptance and ancillary homepage data parity remain limited; see the OPS-010 audit and result records. |
| TPI-OPS-011 | Local website completion, member dashboard dependencies, and authenticated browser acceptance | PARTIALLY COMPLETED / LOCAL APIs VERIFIED / BROWSER AUTH ACCEPTANCE BLOCKED | Additive local member-home schema and fictional dashboard fixtures are present; focused suite 37/37, OPS-009 27/27, OPS-010 41/41. Anonymous browser reachability passed; secure authenticated browser credential entry remains blocked. See the OPS-011 audit and result records. |
| TPI-OPS-012 | Local StudioFlow and ParaTube integration | PARTIALLY COMPLETED / LOCAL API-D1-R2 VERIFIED / BROWSER-WEBSOCKET-PLAYBACK LIMITATIONS | Existing StudioFlow/ParaTube routes, local schema, synthetic R2 thumbnail, room relay, workspace authorization, and preserved 8788 HTTP connectivity passed focused checks 26/26. Authenticated browser interaction, WebSocket, and real playback remain unverified. See the OPS-012 audit and result records. |
| TPI-OPS-013 | Shared local development environment, lifecycle control, and browser/agent access | PARTIALLY COMPLETED / LOCAL LIFECYCLE AND AUTHENTICATED BROWSER VERIFIED / AGENT REACHABILITY LIMITED | Added launcher-owned start/status/stop controls, duplicate prevention, loopback browser isolation, and local synthetic-credential browser acceptance. OPS-013 control checks passed 16/16; authenticated browser checks passed 12/12; OPS-002/007/009/010/011/012 regressions passed. FreeBuff/OpenCode reachability remains not verified. See the OPS-013 audit and completion record. |
| TPI-OPS-014 | Automatic local server startup, LaunchAgent service, and shared development access | IMPLEMENTATION COMPLETE WITH LIMITATIONS / LOCAL SERVICE VERIFIED / ALTERNATE AGENTS NOT VERIFIED | Installed and verified owner-controlled `com.tpi.local-development`; Worker readiness, intentional stop, restart, crash recovery, bounded logging, 8788 preservation, OPS-014 QA 20/20, existing regressions, and browser harness 12/12 passed. Full reboot startup plus FreeBuff/OpenCode access remain not verified. See the OPS-014 audit and completion record. |
| TPI-OPS-015 | Complete local website access, administrator capabilities, and full page verification | PARTIALLY COMPLETED / LOCAL WEBSITE AND ADMIN SURFACE VERIFIED / EXTERNAL PARITY LIMITED | Inventory covers 287 HTML documents, 284 page routes, and 90 API literals with zero unexpected 5xx/request failures. Admin API/role QA passed 62/62; role-based browser QA passed 51/51; local admin schema dependencies were applied from authoritative migrations. External integrations, all-page interaction, four non-served source/review artifacts, and alternate-agent access remain limited. See the OPS-015 inventory and completion record. |
| TPI-OPS-016 | Complete local browser verification and interactive acceptance | COMPLETED WITH LIMITATIONS / SCRIPTED MATRIX EXECUTED | OPS-017 enabled the existing Playwright harness from local cache artifacts and completed all 284 routes with 54/54 focused checks. The matrix reports 277 PASS, 6 PASS WITH LIMITATIONS, and one pre-existing `/published-article/` fragment failure; see the OPS-016 matrix, OPS-016 completion record, and OPS-017 result. |
| TPI-OPS-017 | Local browser testing enablement and server ownership verification | COMPLETED WITH LIMITATIONS / LOCAL ONLY | Repository-scoped Playwright tooling was enabled without registry access or browser download; owner-controlled LaunchAgent ownership was verified read-only; 284/284 routes and focused local regressions were run with zero external requests. One pre-existing published-article fragment defect remains. See `docs/TPI-DEVELOPMENT/200-AUDITS/TPI-OPS-017-BROWSER-TOOLING-AND-OWNERSHIP.md` and `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-OPS-017-BROWSER-TESTING-RESULT.md`. |
| TPI-OPS-018 | Published article route repair and browser limitation review | DEPLOYED / ANONYMOUS LIVE SMOKE PASSED | Root-relative shared-fragment URLs repair nested routes, including `/published-article/`; focused article verification and the existing 284-route harness passed with 278 PASS, 6 expected limitations, 0 FAIL, and 54/54 focused checks. The shared `includes.js` correction is deployed in Worker `f0477367-ea62-4e30-a7b7-22558b18a99b`. |
| TPI-OPS-019 | Multi-browser development workflow | COMPLETE WITH LIMITATIONS / CODEX ACTIVE | Codex local browser workflow verified; FreeBuff remains standby/not verified; Opera is reserved for owner review. See `docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-OPS-019-MULTI-BROWSER-WORKFLOW.md`, the completion result, and the agent handoff. |
| TPI-OPS-019 Addendum A | Master development administrator account | PASSED / LOCAL ONLY | Existing `local_admin` fixture verified active/admin through OPS-009 and OPS-015; owner-only terminal retrieval helper added without password reset or HTTP exposure. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-OPS-019-ADDENDUM-A-LOCAL-ADMIN-RESULT.md`. |
| TPI-OPS-021 | Remove local development banner | COMPLETE / LOCAL ONLY | Central local HTML injection removed from `worker.js`; Codex verified the requested routes and StudioFlow controls after the authorized Worker restart. Local security and isolation remain intact. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-OPS-021-BANNER-REMOVAL-RESULT.md`. |
| TPI-ADMIN-010 | Administration Center functional completion | COMPLETE WITH LIMITATIONS | docs/audits/TPI-ADMIN-010/ and protected preview deployment record |
| TPI-ADMIN-010B | Administration Center follow-up integration | COMPLETE WITH LIMITATIONS | docs/audits/TPI-ADMIN-010B/ and protected preview deployment record |
| TPI-ADMIN-009 | Isolated preview and functional integration | HISTORICAL / SEE AUDIT | docs/audits/TPI-ADMIN-009/ |
| TPI-ADMIN-008A | Production admin deployment request | HISTORICAL / PRESERVED | docs/audits/TPI-ADMIN-008A/ where present; production protection remains controlling |
| TPI-ADMIN-007A | Administrative panel isolation | HISTORICAL / SEE AUDIT | docs/audits/TPI-ADMIN-007A/ where present |
| TPI-STUDIOFLOW-* | Creator Studio directives | HISTORICAL / SEE AUDIT | StudioFlow documents and audits under repository docs and root Markdown |
| TPI-VIDEOS-* | Video and navigation directives | HISTORICAL / SEE AUDIT | Existing directive and audit records |
| TPI-STUDIOFLOW-084A | Image persistence repair and media acceptance completion | PARTIAL / PRODUCTION REPAIR DEPLOYED / BACKUP AND SCENE-ASSIGNMENT GATES OPEN | Worker `100ff967-a7f8-4b83-9aa9-1aeb3b3212fd`; live synthetic PNG metadata/retrieval and A/B isolation pass; Crossroads backup artifact and server-backed scene assignment remain unverified. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-084A-RESULT.md`. |
| TPI-STUDIOFLOW-084B | Scene persistence repair and Crossroads backup verification | PARTIAL / PRODUCTION REPAIR VERIFIED / CROSSROADS BACKUP BLOCKED | Repaired the existing asset-state bridge and deployed Worker `17f9a096-0eb6-4c75-a889-71fb9a9d418d`. Live A readback now contains the persisted PNG media reference and scene hydration remains intact; B remains isolated. The designated Firefox profile exposes no Crossroads workspace or protected ID, and no genuine Crossroads backup artifact is available for validation. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-084B-RESULT.md`. |
| TPI-STUDIOFLOW-085 | Production editor performance and freeze repair | VERIFIED COMPLETE / PRODUCTION VERIFIED | Firefox Profiler identified the persistent root-subtree `MutationObserver` as the freeze cause: 5,459 samples / 99% before repair. Worker `f3422853-8a81-4aa1-8412-27a14af234bd` is deployed. In Firefox Developer Edition, valid synthetic `tpi085-valid-background.mp4` rendered in Acceptance Test A, survived reload/reopen, and remained listed after its scene assignment was removed. The live delete confirmation was verified and canceled; Crossroads and owner data were untouched. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-085-RESULT.md`. |

| TPI-MASTER-002 | Historical directive archive integration and My Studios recovery | PARTIAL / OWNER-DATA IDENTITY BLOCKER | The unified archive is copied, hashed, integrity-checked, extracted, and indexed under `docs/TPI-MASTER-DEVELOPMENT/HISTORICAL-SOURCES/`. The My Studios historical specification and compliance matrix are in `docs/TPI-MASTER-DEVELOPMENT/FEATURE-HISTORY/MY-STUDIOS-HISTORICAL-SPECIFICATION.md`. Read-only Firefox evidence shows Crossroads in the editor title but only Acceptance A/B in the server-backed selector; no owner data was changed. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-MASTER-002-RESULT.md`. |
| TPI-STUDIOFLOW-027 (2026-10-23 media series) | My Scenes media connection repair (authenticated media resolution) | COMPLETE / DEPLOYED AND LIVE-VERIFIED | Preserved `serverAssetId` during API normalization, reconstructed Studio-scoped authenticated media URLs on workspace read, and resolved local or server-backed media for Intro Video, Outro Video, and Background Music. Application commit `eee0cff`; Worker `d6ee132b-59f6-4694-a64b-09d6de37d3e5`. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-027-SCENE-MEDIA-CONNECTION-REPAIR.md`. |
| TPI-STUDIOFLOW-028 (2026-10-23 media series) | My Scenes independent media shortcut and playback repair | COMPLETE / DEPLOYED AND LIVE-VERIFIED | Restored click-to-play Intro/Outro playback at 00:00, Play/Stop toggles with previous-scene restoration, stable `data-tpi-scene-id` scene identity, music-shortcut exclusion from scene handling, and independent After Intro shortcut identity. Application commit `592028a`; Worker `210f4610-ff8a-4192-a944-4668892dd669`. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md`. |
| TPI-STUDIOFLOW-028 Addendum A (2026-10-23 media series) | Preserve Sol's After Intro Background Music functionality | COMPLETE / DEPLOYED AND LIVE-VERIFIED | Verified Sol's approved automatic post-Intro music transition (commit `d262867`) and restored it verbatim by removing the `0241dc7` program-state gate from the music path, keeping all independence fixes. Application commit `cb97464`; Worker `21ea05f7-588d-4b5a-b039-c6063f7fd248`. See the Addendum A section of `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md`. |
| TPI-STUDIOFLOW-029 (2026-10-23 media series) | Documentation synchronization for 027, 028, and Addendum A | COMPLETE / DOCUMENTATION ONLY / NOT DEPLOYED | Recorded the approved playback contract and verified regression history in `docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`, updated the current production baseline in this index and `TPI-CURRENT-DEVELOPMENT-STATUS.md`, and added regression-prevention requirements to `AGENTS.md`. No application source or production change. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-029-DOCUMENTATION-SYNCHRONIZATION.md`. |
| TPI-STUDIOFLOW-030 (2026-10-23 sound-effects series) | Sound Effects interface cleanup and drag-and-drop pad reordering | COMPLETE / DEPLOYED AND LIVE-VERIFIED | Removed the Stop Sound button and the permanent per-pad three-dot menu triggers while preserving the volume slider, playback, routing, and the existing options menu (right-click and Shift+F10/ContextMenu key). Added pointer drag-and-drop and Alt+Arrow keyboard pad reordering with automatic per-studio order persistence through the existing workspace configuration, and repaired the in-flight save-echo race in the asset-state bridge that could clobber pad order. Application commit `8f6035a` (+ `e18d327`); Worker `9e7cf4ba-1262-4c8d-9b3a-249670eb6a78`. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-030-SOUND-EFFECTS-PAD-REORDERING.md`. |
| TPI-STUDIOFLOW-031 (2026-10-24 background-music series) | Background Music interface cleanup and drag-and-drop pad reordering | COMPLETE / DEPLOYED AND LIVE-VERIFIED | Removed the permanent three-dot menu triggers from Background Music pads (menu preserved on right-click, Shift+F10/ContextMenu, touch long-press) and added pointer drag-and-drop and Alt+Arrow keyboard reordering with automatic per-studio persistence. Sol's After Intro assignment is blobKey-based and verified unchanged across reorders (the directive's mandatory §6 test). Two pre-existing persistence defects were repaired: the API workspace normalizer dropped `backgroundMusicSlots`, `backgroundMusicLoop`, and `sceneMusicAssignments`, and the asset-state bridge wired uploaded media replacements by visit position instead of by blobKey. Application commit `4cacb3a`; Worker `48cdb81d-efcc-4f03-8717-eaa5a51e45d5`. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-031-BACKGROUND-MUSIC-PAD-REORDERING.md`. |
| TPI-STUDIOFLOW-032 (2026-10-24 pad-artwork series) | Background Music and Sound Effects icon replacement | COMPLETE / DEPLOYED AND LIVE-VERIFIED | Replaced the music-note glyphs inside the unchanged circular pad icon containers with the owner-approved artwork: Waveform on Background Music pads and Microphone on Sound Effects pads (`studio/Waveform.png`, `studio/Microphone.png`, SHA-256-identical to the owner's Desktop originals, which were left untouched). Artwork is proportion-preserving and pointer-transparent; layout, playback, drag-and-drop, context menus, and persistence are unchanged. Also repaired the 021 browser suite's obsolete home-screen entry (each run now seeds a fresh browser-local recording broadcast; assertions unchanged). Application commit `6a1f8ad` (feature `02056c1`); Worker `7029c6c5-3994-42a1-9570-d6119a5792f3`. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-032-PAD-ARTWORK-REPLACEMENT.md`. |
| TPI-STUDIOFLOW-034 (2026-10-24 performance series) | StudioFlow DOM mutation storm root-cause repair | COMPLETE / DEPLOYED AND LIVE-VERIFIED | Reproduced the idle observer cycle, repaired redundant scene/panel/timer DOM writes and unchanged My Studios menu renders, added the maintained Firefox mutation regression, and verified the guarded production release. Post-repair settled windows show zero child-list churn, zero redundant writes, and 5/35 expected checkbox updates over 5/30 seconds. Application commit `8d7185b`; Worker `0c0a8660-21cf-47e1-ac66-98c91b26972c`; rollback `7029c6c5-3994-42a1-9570-d6119a5792f3`. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-034-DOM-MUTATION-REPAIR.md`. |
| TPI-STUDIOFLOW-033 (2026-10-24 configuration series) | Video Clips, program orientation, and workspace configuration persistence | COMPLETE / DEPLOYED AND LIVE-VERIFIED | Confirmed the API normalizer gaps, preserved `videoClipSlots` and validated `slot` positions, normalized scalar `programOrientation` through both workspace bridges, rehydrated React output state on Studio activation, and added the maintained 26/26 server/browser round-trip regression. Application commit `cb38061`; source commit `53bf8dc`; Worker `5c8e78b5-f920-4335-940f-a5e4d6df0e49`; rollback `0c0a8660-21cf-47e1-ac66-98c91b26972c`. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-033-WORKSPACE-CONFIGURATION-PERSISTENCE.md`. |
| TPI-STUDIOFLOW-035 (2026-10-24 workspace consolidation series) | Right navigation cleanup, Teleprompter placement, and Recording & Storage consolidation | COMPLETE / DEPLOYED AND LIVE-VERIFIED | Removed Live interaction, Comments, and Widgets from the far-right rail (presentation code removed; underlying state and program services preserved), placed Teleprompter directly beneath Notes reusing the existing studio teleprompter reader, and added the authoritative Recording & Storage rail section (Recording Configuration, Save Destination, Local & External Storage, Cloud Storage, Save Status, Recording Information, Errors & Recovery). Settings > Recording and Settings > Recording & Storage now redirect to that section with preserved saved values. Recordings report confirmed save outcomes with the destination actually used; an unavailable folder destination requires explicit fallback confirmation (declining records the awaiting-action state); cloud providers appear only as Not connected pending verified OAuth integration. Repaired four partially connected workspace recording-settings defects (wrong save fields, wrong hydration keys, stale React state on Studio activation). Application commit `d0b1f70`; source commit `60af530`; Worker `aa9bff15-6252-4ae5-9422-17d63b99ab5a`; rollback `5c8e78b5-f920-4335-940f-a5e4d6df0e49`. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-035-RECORDING-STORAGE-CONSOLIDATION.md`. |
| TPI-STUDIOFLOW-036 (2026-10-24 timer series) | Nine cinematic Video Timers integration | COMPLETE / DEPLOYED AND LIVE-VERIFIED | Integrated the owner-approved Spectacular Cinematic Edition into the existing Video Timers engine: nine silent selectable designs in a three-column grid, four preserved durations, shared countdown/program-output behavior, per-Studio persistence, and cleanup without duplicate loops or audio. Repaired the activation hydration race and stale duplicate React-owned timer grid found during browser validation. Maintained timer regression passed 28/28; local and live Firefox acceptance passed 64/64; production smoke passed 10/10. Application commit `7bd8c46`; source commit `37c6598`; Worker `076c9614-9251-4efd-b047-0e7033f4ad9c`; rollback `aa9bff15-6252-4ae5-9422-17d63b99ab5a`. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-036-CINEMATIC-VIDEO-TIMERS.md`. |
| TPI-STUDIOFLOW-037 (2026-10-24 Scenes panel series) | Scenes Panel redesign, Addenda A-E uniformity, reactive drag-and-drop, independent playback, scene management, context menus, and rehearsal controls | PRODUCTION RECOVERY DEPLOYED / LIVE-VISUALLY-VERIFIED / OWNER ACCEPTANCE PENDING | Prior automated menu checks were false-positive because they did not verify visibility; the recovery moved the React menu inside the clipped rail and added visible-menu assertions. Addendum E 20/20 locally and live; TPI-037 20/20; Addendum C 26/26; Addendum D 10/10; TPI-028 33/33; TPI-030 25/25; TPI-031 34/34; TPI-033 26/26; TPI-034 mutation PASS; TPI-035 33/33; TPI-036 28/28; production smoke 10/10; live Firefox 64/64. Source `eff6b69`; application/test `877efb3`; Worker `871c0ae7-33c5-46ae-b635-19ec3100c989`; rollback `d58d7e1e-5f86-4c87-93b3-110999d200a9`. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-E.md`. |
| (unnumbered) Studio Creation, Switching & Workspace Isolation Recovery (2026-10-25 recovery series) | Root-cause repair of Studio creation inheritance, silent Studio switching failures, missing browser-local snapshot recovery, and partial workspace hydration | IMPLEMENTED / DEPLOYED / LIVE VERIFIED / OWNER ACCEPTANCE PENDING | Maintained `verify:studioflow-studio-lifecycle` suite (Directive Tests 1–10 + owner-flow checks) passes locally and on production with the isolated QA account; integrated recovery 21/21; TPI-027 12/12; TPI-028 33/33; TPI-030 25/25 (one flaky timing failure in four runs of the rapid upload step); TPI-031 34/34; TPI-033 26/26; TPI-034 mutation PASS; TPI-036 28/28; TPI-037 20/20; release safety PASSED; local auth lifecycle PASS; live release acceptance 64/64. Source `44f9478`; application `161d03d`; Worker `9d3aa40c-9a44-4bf9-bcf1-8efcbf837683`; rollback `7bddac9c-bda3-41c1-95d2-13aacc09cb28`. See `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-STUDIO-LIFECYCLE-RECOVERY.md`. |

When a directive has no matching local file, retain this index entry and document the missing source rather than fabricating a completion status.

## Documentation synchronization policy

Every completed TPI directive must synchronize its affected Markdown records before
it is marked complete. The synchronization must record the source files changed,
verification evidence, known limitations, current development status, and the
directive-index entry. Documentation must distinguish COMPLETE, PARTIAL, BLOCKED,
NOT VERIFIED, and NOT DEPLOYED, and must not call a feature production-ready based
only on local tests.

## Directive archive — owner directive conversation (2026-10-17 → 2026-10-25)

The following directives were issued in the owner's TPI directive conversation
([shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
Their complete original texts are archived verbatim in this directory under the
[TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
Identifier numbers were reused across development eras; the issue date and full
title disambiguate them. Rows marked "variant of" reference an earlier archived
document covering the same directive in edited form; the verbatim original is
kept in both places so no issued text is lost.

| Identifier | Title | Issued | Archive location / status |
| --- | --- | --- | --- |
| TPI-STUDIOFLOW-071 | EXISTING LIVE GUEST INTEGRATION VERIFICATION | undated | [TPI-STUDIOFLOW-071-EXISTING-LIVE-GUEST-INTEGRATION-VERIFICATION.md](TPI-STUDIOFLOW-071-EXISTING-LIVE-GUEST-INTEGRATION-VERIFICATION.md) |
| TPI-STUDIOFLOW-017A | Live Browser Acceptance | 2026-10-17 | [TPI-STUDIOFLOW-017A-LIVE-BROWSER-ACCEPTANCE.md](TPI-STUDIOFLOW-017A-LIVE-BROWSER-ACCEPTANCE.md) |
| TPI-STUDIOFLOW-018 | Secure Development Guest Invitation and iPhone Testing | 2026-10-17 | [TPI-STUDIOFLOW-018-SECURE-DEVELOPMENT-GUEST-INVITATION-AND-IPHONE.md](TPI-STUDIOFLOW-018-SECURE-DEVELOPMENT-GUEST-INVITATION-AND-IPHONE.md) |
| TPI-STUDIOFLOW-018 | iPhone and iPad Testing Requirements | 2026-10-17 | [TPI-STUDIOFLOW-018-IPHONE-AND-IPAD-TESTING-REQUIREMENTS.md](TPI-STUDIOFLOW-018-IPHONE-AND-IPAD-TESTING-REQUIREMENTS.md) |
| TPI-STUDIOFLOW-018B | Development Mobile Testing Authorization | 2026-10-17 | [TPI-STUDIOFLOW-018B-DEVELOPMENT-MOBILE-TESTING-AUTHORIZATION.md](TPI-STUDIOFLOW-018B-DEVELOPMENT-MOBILE-TESTING-AUTHORIZATION.md) |
| TPI-STUDIOFLOW-018C | Temporary Cloudflare Tunnel Authorization | 2026-10-17 | [TPI-STUDIOFLOW-018C-TEMPORARY-CLOUDFLARE-TUNNEL-AUTHORIZATION.md](TPI-STUDIOFLOW-018C-TEMPORARY-CLOUDFLARE-TUNNEL-AUTHORIZATION.md) |
| (unnumbered) | INTRO AND OUTRO — START/STOP TOGGLE CONTROLS | 2026-10-18 | [INTRO-AND-OUTRO-START-STOP-TOGGLE-CONTROLS.md](INTRO-AND-OUTRO-START-STOP-TOGGLE-CONTROLS.md) |
| (unnumbered) | INTRO/OUTRO PLAYBACK TOGGLE, RECORDING SAFETY, | 2026-10-18 | [INTRO-OUTRO-PLAYBACK-TOGGLE-RECORDING-SAFETY.md](INTRO-OUTRO-PLAYBACK-TOGGLE-RECORDING-SAFETY.md) (variant of [TPI-STUDIOFLOW-020-INTRO-OUTRO-PLAYBACK.md](TPI-STUDIOFLOW-020-INTRO-OUTRO-PLAYBACK.md)) |
| (unnumbered) | UNIFIED OPERA DEVELOPMENT BROWSER WORKFLOW | 2026-10-18 | [UNIFIED-OPERA-DEVELOPMENT-BROWSER-WORKFLOW.md](UNIFIED-OPERA-DEVELOPMENT-BROWSER-WORKFLOW.md) (variant of [TPI-STUDIOFLOW-021-UNIFIED-OPERA-BROWSER-WORKFLOW.md](TPI-STUDIOFLOW-021-UNIFIED-OPERA-BROWSER-WORKFLOW.md)) |
| (unnumbered) | DEVELOPMENT STUDIO BACKUP AND RECOVERY INVESTIGATION | 2026-10-18 | [DEVELOPMENT-STUDIO-BACKUP-AND-RECOVERY.md](DEVELOPMENT-STUDIO-BACKUP-AND-RECOVERY.md) |
| (unnumbered) | CROSSROADS STUDIO RECOVERY & BROWSER DATA INVESTIGATION | 2026-10-18 | [CROSSROADS-STUDIO-RECOVERY-BROWSER-DATA.md](CROSSROADS-STUDIO-RECOVERY-BROWSER-DATA.md) |
| (unnumbered) | LOCAL ADMINISTRATOR PASSWORD RESET | 2026-10-18 | [LOCAL-ADMINISTRATOR-PASSWORD-RESET.md](LOCAL-ADMINISTRATOR-PASSWORD-RESET.md) |
| (unnumbered) | EXISTING LOCAL ADMINISTRATOR PASSWORD RECOVERY | 2026-10-18 | [EXISTING-LOCAL-ADMINISTRATOR-PASSWORD-RECOVERY.md](EXISTING-LOCAL-ADMINISTRATOR-PASSWORD-RECOVERY.md) |
| (unnumbered) | MEDIA ASSETS — STATIC & MOTION BACKGROUND CATEGORIES | 2026-10-18 | [MEDIA-ASSETS-STATIC-MOTION-BACKGROUND.md](MEDIA-ASSETS-STATIC-MOTION-BACKGROUND.md) |
| (unnumbered) | SAFARI WHITE SCREEN INVESTIGATION & REPAIR | 2026-10-18 | [SAFARI-WHITE-SCREEN-INVESTIGATION-REPAIR.md](SAFARI-WHITE-SCREEN-INVESTIGATION-REPAIR.md) |
| TPI-STUDIOFLOW-019 | INTRO AND OUTRO VIDEO — FULL-STAGE DISPLAY CORRECTION | 2026-10-18 | [TPI-STUDIOFLOW-019-INTRO-AND-OUTRO-VIDEO-FULL-STAGE-DISPLAY.md](TPI-STUDIOFLOW-019-INTRO-AND-OUTRO-VIDEO-FULL-STAGE-DISPLAY.md) (variant of [TPI-STUDIOFLOW-019-INTRO-OUTRO-STAGE.md](TPI-STUDIOFLOW-019-INTRO-OUTRO-STAGE.md)) |
| (unnumbered) | ROOM BRIDGE STATUS BADGE REPOSITIONING | 2026-10-18 | [ROOM-BRIDGE-STATUS-BADGE-REPOSITIONING.md](ROOM-BRIDGE-STATUS-BADGE-REPOSITIONING.md) |
| (unnumbered) | OPERA STALE ASSET INVESTIGATION & REPAIR | 2026-10-18 | [OPERA-STALE-ASSET-INVESTIGATION-REPAIR.md](OPERA-STALE-ASSET-INVESTIGATION-REPAIR.md) |
| (unnumbered) | TABLET BACKSTAGE CONNECTION READINESS INVESTIGATION | 2026-10-18 | [TABLET-BACKSTAGE-CONNECTION-READINESS.md](TABLET-BACKSTAGE-CONNECTION-READINESS.md) |
| (unnumbered) | ROOM BRIDGE STATUS POSITION CORRECTION | 2026-10-18 | [ROOM-BRIDGE-STATUS-POSITION-CORRECTION.md](ROOM-BRIDGE-STATUS-POSITION-CORRECTION.md) |
| (unnumbered) | ROOM BRIDGE DIAGNOSTICS — SETTINGS RELOCATION | 2026-10-18 | [ROOM-BRIDGE-DIAGNOSTICS-SETTINGS-RELOCATION.md](ROOM-BRIDGE-DIAGNOSTICS-SETTINGS-RELOCATION.md) |
| (unnumbered) | BACKSTAGE CLEANUP — REMOVE ROOM BRIDGE STATUS DISPLAY | 2026-10-18 | [BACKSTAGE-CLEANUP-REMOVE-ROOM-BRIDGE-STATUS.md](BACKSTAGE-CLEANUP-REMOVE-ROOM-BRIDGE-STATUS.md) |
| (unnumbered) | ROOM BRIDGE OVERLAP — RENDERING INVESTIGATION & REPAIR | 2026-10-18 | [ROOM-BRIDGE-OVERLAP-RENDERING-INVESTIGATION.md](ROOM-BRIDGE-OVERLAP-RENDERING-INVESTIGATION.md) |
| (unnumbered) | GUEST WAITING ROOM & STAGE AUDIO SYSTEM | 2026-10-18 | [GUEST-WAITING-ROOM-STAGE-AUDIO-SYSTEM.md](GUEST-WAITING-ROOM-STAGE-AUDIO-SYSTEM.md) |
| (unnumbered) | LOCAL ASSET DELIVERY — ROOT CAUSE INVESTIGATION & REPAIR | 2026-10-18 | [LOCAL-ASSET-DELIVERY-ROOT-CAUSE-INVESTIGATION.md](LOCAL-ASSET-DELIVERY-ROOT-CAUSE-INVESTIGATION.md) |
| (unnumbered) | DEVELOPMENT RECOVERY, FINAL INTEGRATION | 2026-10-18 | [DEVELOPMENT-RECOVERY-FINAL-INTEGRATION.md](DEVELOPMENT-RECOVERY-FINAL-INTEGRATION.md) (variant of [TPI-STUDIOFLOW-047-DEVELOPMENT-RECOVERY.md](TPI-STUDIOFLOW-047-DEVELOPMENT-RECOVERY.md)) |
| (unnumbered) | PERSISTENT PROJECT SAVING, BACKUPS & RECOVERY | 2026-10-18 | [PERSISTENT-PROJECT-SAVING-BACKUPS-RECOVERY.md](PERSISTENT-PROJECT-SAVING-BACKUPS-RECOVERY.md) |
| (unnumbered) | CRITICAL STUDIO INTERFACE FLICKERING / RELOAD LOOP | 2026-10-18 | [CRITICAL-STUDIO-INTERFACE-FLICKERING-RELOAD.md](CRITICAL-STUDIO-INTERFACE-FLICKERING-RELOAD.md) |
| (unnumbered) | CROSSROADS DATA INTEGRITY & RELEASE RECOVERY | 2026-10-18 | [CROSSROADS-DATA-INTEGRITY-RELEASE-RECOVERY.md](CROSSROADS-DATA-INTEGRITY-RELEASE-RECOVERY.md) |
| (unnumbered) | RELEASE CHECKPOINT PREPARATION | 2026-10-18 | [RELEASE-CHECKPOINT-PREPARATION.md](RELEASE-CHECKPOINT-PREPARATION.md) |
| (unnumbered) | VERIFICATION TEST RECONCILIATION | 2026-10-18 | [VERIFICATION-TEST-RECONCILIATION.md](VERIFICATION-TEST-RECONCILIATION.md) |
| TPI-STUDIOFLOW-058 | AUTHORITATIVE SOURCE REPOSITORY CHECKPOINT PREPARATION | 2026-10-18 | [TPI-STUDIOFLOW-058-AUTHORITATIVE-SOURCE-REPOSITORY-CHECKPOINT.md](TPI-STUDIOFLOW-058-AUTHORITATIVE-SOURCE-REPOSITORY-CHECKPOINT.md) |
| TPI-STUDIOFLOW-059 | SOURCE CHECKPOINT STAGING AND FINAL REVIEW | 2026-10-18 | [TPI-STUDIOFLOW-059-SOURCE-CHECKPOINT-STAGING-AND-FINAL-REVIEW.md](TPI-STUDIOFLOW-059-SOURCE-CHECKPOINT-STAGING-AND-FINAL-REVIEW.md) |
| TPI-STUDIOFLOW-060 | AUTHORIZED SOURCE CHECKPOINT COMMIT | 2026-10-18 | [TPI-STUDIOFLOW-060-AUTHORIZED-SOURCE-CHECKPOINT-COMMIT.md](TPI-STUDIOFLOW-060-AUTHORIZED-SOURCE-CHECKPOINT-COMMIT.md) |
| TPI-STUDIOFLOW-061 | WEBSITE INTEGRATION CHECKPOINT AUDIT | 2026-10-18 | [TPI-STUDIOFLOW-061-WEBSITE-INTEGRATION-CHECKPOINT-AUDIT.md](TPI-STUDIOFLOW-061-WEBSITE-INTEGRATION-CHECKPOINT-AUDIT.md) |
| TPI-064 | STUDIOFLOW BACKEND SEPARATION & RELEASE MANIFEST | 2026-10-18 | [TPI-064-STUDIOFLOW-BACKEND-SEPARATION-RELEASE-MANIFEST.md](TPI-064-STUDIOFLOW-BACKEND-SEPARATION-RELEASE-MANIFEST.md) |
| TPI-065 | STUDIOFLOW PRODUCTION-SAFE BACKEND EXTRACTION | 2026-10-18 | [TPI-065-STUDIOFLOW-PRODUCTION-SAFE-BACKEND-EXTRACTION.md](TPI-065-STUDIOFLOW-PRODUCTION-SAFE-BACKEND-EXTRACTION.md) |
| TPI-066 | STUDIOFLOW ISOLATED RELEASE CANDIDATE | 2026-10-18 | [TPI-066-STUDIOFLOW-ISOLATED-RELEASE-CANDIDATE.md](TPI-066-STUDIOFLOW-ISOLATED-RELEASE-CANDIDATE.md) |
| TPI-067 | STUDIOFLOW RELEASE CANDIDATE ACCEPTANCE | 2026-10-18 | [TPI-067-STUDIOFLOW-RELEASE-CANDIDATE-ACCEPTANCE.md](TPI-067-STUDIOFLOW-RELEASE-CANDIDATE-ACCEPTANCE.md) |
| TPI-068 | STUDIOFLOW RELEASE BLOCKER RESOLUTION | 2026-10-18 | [TPI-068-STUDIOFLOW-RELEASE-BLOCKER-RESOLUTION.md](TPI-068-STUDIOFLOW-RELEASE-BLOCKER-RESOLUTION.md) |
| TPI-069 | STUDIOFLOW MEDIA PERSISTENCE & GUEST READINESS | 2026-10-18 | [TPI-069-STUDIOFLOW-MEDIA-PERSISTENCE-GUEST-READINESS.md](TPI-069-STUDIOFLOW-MEDIA-PERSISTENCE-GUEST-READINESS.md) |
| TPI-STUDIOFLOW-072 | LIVE BRIDGE PRODUCTION AUTHENTICATION REPAIR | 2026-10-18 | [TPI-STUDIOFLOW-072-LIVE-BRIDGE-PRODUCTION-AUTHENTICATION-REPAIR.md](TPI-STUDIOFLOW-072-LIVE-BRIDGE-PRODUCTION-AUTHENTICATION-REPAIR.md) |
| TPI-STUDIOFLOW-070 | FINAL RELEASE READINESS & ACCEPTANCE GATE | 2026-10-18 | [TPI-STUDIOFLOW-070-FINAL-RELEASE-READINESS-ACCEPTANCE-GATE.md](TPI-STUDIOFLOW-070-FINAL-RELEASE-READINESS-ACCEPTANCE-GATE.md) |
| TPI-STUDIOFLOW-072 | DIRECTIVE: TPI-STUDIOFLOW-072 | 2026-10-18 | [TPI-STUDIOFLOW-072-DIRECTIVE.md](TPI-STUDIOFLOW-072-DIRECTIVE.md) |
| TPI-STUDIOFLOW-073 | FINAL RELEASE CANDIDATE ISOLATION | 2026-10-18 | [TPI-STUDIOFLOW-073-FINAL-RELEASE-CANDIDATE-ISOLATION.md](TPI-STUDIOFLOW-073-FINAL-RELEASE-CANDIDATE-ISOLATION.md) |
| TPI-STUDIOFLOW-074 | CREATE CONTROLLED STUDIOFLOW GIT CHECKPOINT | 2026-10-18 | [TPI-STUDIOFLOW-074-CREATE-CONTROLLED-STUDIOFLOW-GIT-CHECKPOINT.md](TPI-STUDIOFLOW-074-CREATE-CONTROLLED-STUDIOFLOW-GIT-CHECKPOINT.md) |
| TPI-STUDIOFLOW-075 | DIRECTIVE: TPI-STUDIOFLOW-075 | 2026-10-18 | [TPI-STUDIOFLOW-075-DIRECTIVE.md](TPI-STUDIOFLOW-075-DIRECTIVE.md) |
| TPI-STUDIOFLOW-076 | FINAL STUDIOFLOW PRODUCTION RELEASE EXECUTION | 2026-10-18 | [TPI-STUDIOFLOW-076-FINAL-STUDIOFLOW-PRODUCTION-RELEASE-EXECUTION.md](TPI-STUDIOFLOW-076-FINAL-STUDIOFLOW-PRODUCTION-RELEASE-EXECUTION.md) |
| TPI-STUDIOFLOW-077 | COMPLETE STUDIOFLOW DEVELOPMENT DIRECTIVE RECOVERY | 2026-10-19 | [TPI-STUDIOFLOW-077-COMPLETE-STUDIOFLOW-DEVELOPMENT-DIRECTIVE.md](TPI-STUDIOFLOW-077-COMPLETE-STUDIOFLOW-DEVELOPMENT-DIRECTIVE.md) |
| TPI-STUDIOFLOW-079 | COMPLETE STUDIOFLOW LIVE SITE REPAIR | 2026-10-19 | [TPI-STUDIOFLOW-079-COMPLETE-STUDIOFLOW-LIVE-SITE-REPAIR.md](TPI-STUDIOFLOW-079-COMPLETE-STUDIOFLOW-LIVE-SITE-REPAIR.md) |
| TPI-STUDIOFLOW-078 | STUDIOFLOW PRODUCTION RECOVERY | 2026-10-19 | [TPI-STUDIOFLOW-078-STUDIOFLOW-PRODUCTION-RECOVERY.md](TPI-STUDIOFLOW-078-STUDIOFLOW-PRODUCTION-RECOVERY.md) |
| TPI-MASTER-001A | CHRONOLOGICAL DIRECTIVE EXECUTION — PRODUCTION WEBSITE | 2026-10-20 | [TPI-MASTER-001A-CHRONOLOGICAL-DIRECTIVE-EXECUTION-PRODUCTION.md](TPI-MASTER-001A-CHRONOLOGICAL-DIRECTIVE-EXECUTION-PRODUCTION.md) |
| TPI-MASTER-001C | MANDATORY CONTINUATION — FINISH UNCOMPLETED WORK | 2026-10-20 | [TPI-MASTER-001C-MANDATORY-CONTINUATION-FINISH-UNCOMPLETED-WORK.md](TPI-MASTER-001C-MANDATORY-CONTINUATION-FINISH-UNCOMPLETED-WORK.md) |
| TPI-MASTER-001D | OPERA BROWSER STANDARDIZATION AND STUDIOFLOW COMPLETION | 2026-10-20 | [TPI-MASTER-001D-OPERA-BROWSER-STANDARDIZATION-AND-STUDIOFLOW.md](TPI-MASTER-001D-OPERA-BROWSER-STANDARDIZATION-AND-STUDIOFLOW.md) |
| TPI-MASTER-001E | FINISH UNCOMPLETED STUDIOFLOW PRODUCTION ACCEPTANCE | 2026-10-20 | [TPI-MASTER-001E-FINISH-UNCOMPLETED-STUDIOFLOW-PRODUCTION.md](TPI-MASTER-001E-FINISH-UNCOMPLETED-STUDIOFLOW-PRODUCTION.md) |
| TPI-STUDIOFLOW-084 | PRODUCTION MEDIA VERIFICATION AND CROSSROADS ASSET PROTECTION | 2026-10-20 | [TPI-STUDIOFLOW-084-PRODUCTION-MEDIA-VERIFICATION-AND-CROSSROADS.md](TPI-STUDIOFLOW-084-PRODUCTION-MEDIA-VERIFICATION-AND-CROSSROADS.md) |
| TPI-STUDIOFLOW-086 | STUDIO IDENTITY, WORKSPACE ISOLATION, AND DIRECTIVE RECONCILIATION | 2026-10-20 | [TPI-STUDIOFLOW-086-STUDIO-IDENTITY-WORKSPACE-ISOLATION-AND.md](TPI-STUDIOFLOW-086-STUDIO-IDENTITY-WORKSPACE-ISOLATION-AND.md) |
| TPI-STUDIOFLOW-085 | PRODUCTION EDITOR PERFORMANCE AND FREEZE REPAIR | 2026-10-20 | [TPI-STUDIOFLOW-085-PRODUCTION-EDITOR-PERFORMANCE-AND-FREEZE.md](TPI-STUDIOFLOW-085-PRODUCTION-EDITOR-PERFORMANCE-AND-FREEZE.md) |
| (unnumbered) | MASTER HISTORICAL REFERENCE SETUP | 2026-10-20 | [MASTER-HISTORICAL-REFERENCE-SETUP.md](MASTER-HISTORICAL-REFERENCE-SETUP.md) |
| (unnumbered) | STUDIOFLOW HISTORICAL RECOVERY AND PRODUCTION COMPLETION | 2026-10-20 | [STUDIOFLOW-HISTORICAL-RECOVERY-AND-PRODUCTION.md](STUDIOFLOW-HISTORICAL-RECOVERY-AND-PRODUCTION.md) |
| (unnumbered) | STUDIOFLOW — MY SCENES RESEARCH AND FUNCTIONAL AUDIT | 2026-10-20 | [STUDIOFLOW-MY-SCENES-RESEARCH-AND-FUNCTIONAL.md](STUDIOFLOW-MY-SCENES-RESEARCH-AND-FUNCTIONAL.md) |
| (unnumbered) | STUDIOFLOW — MY STUDIOS HISTORICAL DIRECTIVE RECOVERY | 2026-10-20 | [STUDIOFLOW-MY-STUDIOS-HISTORICAL-DIRECTIVE.md](STUDIOFLOW-MY-STUDIOS-HISTORICAL-DIRECTIVE.md) |
| (unnumbered) | STUDIOFLOW — RESTORE REACT STUDIO SWITCHING | 2026-10-20 | [STUDIOFLOW-RESTORE-REACT-STUDIO-SWITCHING.md](STUDIOFLOW-RESTORE-REACT-STUDIO-SWITCHING.md) |
| (unnumbered) | STUDIOFLOW — CROSSROADS LIVE STUDIO INVESTIGATION | 2026-10-20 | [STUDIOFLOW-CROSSROADS-LIVE-STUDIO.md](STUDIOFLOW-CROSSROADS-LIVE-STUDIO.md) |
| (unnumbered) | TPI STUDIOFLOW — CROSSROADS SAVE FAILURE | 2026-10-20 | [TPI-STUDIOFLOW-CROSSROADS-SAVE-FAILURE.md](TPI-STUDIOFLOW-CROSSROADS-SAVE-FAILURE.md) |
| TPI-MASTER-002 | HISTORICAL DIRECTIVE INTEGRATION AND MY STUDIOS RECOVERY | 2026-10-21 | [TPI-MASTER-002-HISTORICAL-DIRECTIVE-INTEGRATION-AND-MY.md](TPI-MASTER-002-HISTORICAL-DIRECTIVE-INTEGRATION-AND-MY.md) |
| TPI-STUDIOFLOW-084B | SCENE PERSISTENCE REPAIR AND CROSSROADS BACKUP VERIFICATION | 2026-10-21 | [TPI-STUDIOFLOW-084B-SCENE-PERSISTENCE-REPAIR-AND-CROSSROADS-BACKUP.md](TPI-STUDIOFLOW-084B-SCENE-PERSISTENCE-REPAIR-AND-CROSSROADS-BACKUP.md) |
| TPI-STUDIOFLOW-084 | FINISH TPI-STUDIOFLOW-084. | 2026-10-21 | [TPI-STUDIOFLOW-084-FINISH-TPI-STUDIOFLOW-084.md](TPI-STUDIOFLOW-084-FINISH-TPI-STUDIOFLOW-084.md) |
| TPI-STUDIOFLOW-084A | IMAGE PERSISTENCE REPAIR AND MEDIA ACCEPTANCE COMPLETION | 2026-10-21 | [TPI-STUDIOFLOW-084A-IMAGE-PERSISTENCE-REPAIR-AND-MEDIA-ACCEPTANCE.md](TPI-STUDIOFLOW-084A-IMAGE-PERSISTENCE-REPAIR-AND-MEDIA-ACCEPTANCE.md) |
| TPI-MASTER-001B | MANDATORY COMPLETION AND NO-PARTIAL-DELIVERY POLICY | 2026-10-21 | [TPI-MASTER-001B-MANDATORY-COMPLETION-AND-NO-PARTIAL-DELIVERY.md](TPI-MASTER-001B-MANDATORY-COMPLETION-AND-NO-PARTIAL-DELIVERY.md) |
| TPI-063 | MASTER DEVELOPMENT SYSTEM FOUNDATION | 2026-10-21 | [TPI-063-MASTER-DEVELOPMENT-SYSTEM-FOUNDATION.md](TPI-063-MASTER-DEVELOPMENT-SYSTEM-FOUNDATION.md) |
| TPI-STUDIOFLOW-062 | WEBSITE REPOSITORY INVESTIGATION & CHANGE-CONTROL AUDIT | 2026-10-21 | [TPI-STUDIOFLOW-062-WEBSITE-REPOSITORY-INVESTIGATION-CHANGE.md](TPI-STUDIOFLOW-062-WEBSITE-REPOSITORY-INVESTIGATION-CHANGE.md) |
| (unnumbered) | SOURCE & WEBSITE INTEGRATION RECONCILIATION | 2026-10-21 | [SOURCE-WEBSITE-INTEGRATION-RECONCILIATION.md](SOURCE-WEBSITE-INTEGRATION-RECONCILIATION.md) |
| (unnumbered) | PRODUCTION RELEASE PREPARATION & LIVE MIGRATION | 2026-10-21 | [PRODUCTION-RELEASE-PREPARATION-LIVE-MIGRATION.md](PRODUCTION-RELEASE-PREPARATION-LIVE-MIGRATION.md) |
| (unnumbered) | FRESH-BROWSER SESSION & HOME PAGE FLICKERING | 2026-10-21 | [FRESH-BROWSER-SESSION-HOME-PAGE-FLICKERING.md](FRESH-BROWSER-SESSION-HOME-PAGE-FLICKERING.md) |
| (unnumbered) | STUDIOFLOW PRODUCTION MIGRATION | 2026-10-21 | [STUDIOFLOW-PRODUCTION-MIGRATION.md](STUDIOFLOW-PRODUCTION-MIGRATION.md) |
| (unnumbered) | PORTABLE PROJECT BACKUPS & SAVE STATUS SYSTEM | 2026-10-21 | [PORTABLE-PROJECT-BACKUPS-SAVE-STATUS-SYSTEM.md](PORTABLE-PROJECT-BACKUPS-SAVE-STATUS-SYSTEM.md) |
| (unnumbered) | GUEST WAITING ROOM — AUDIO BEHAVIOR INVESTIGATION | 2026-10-21 | [GUEST-WAITING-ROOM-AUDIO-BEHAVIOR.md](GUEST-WAITING-ROOM-AUDIO-BEHAVIOR.md) |
| (unnumbered) | AUTOMATIC LOCAL DEVELOPMENT ASSET CACHE-BUSTING | 2026-10-21 | [AUTOMATIC-LOCAL-DEVELOPMENT-ASSET-CACHE.md](AUTOMATIC-LOCAL-DEVELOPMENT-ASSET-CACHE.md) |
| (unnumbered) | BACKGROUND & MOTION BACKGROUND UI ORGANIZATION | 2026-10-21 | [BACKGROUND-MOTION-BACKGROUND-UI-ORGANIZATION.md](BACKGROUND-MOTION-BACKGROUND-UI-ORGANIZATION.md) |
| TPI-STUDIOFLOW-026 | FREEBUFF DEVELOPMENT HANDOVER — STUDIOFLOW MEDIA INTERFACE RECONSTRUCTION | 2026-10-21 | [TPI-STUDIOFLOW-026-FREEBUFF-DEVELOPMENT-HANDOVER-STUDIOFLOW-MEDIA.md](TPI-STUDIOFLOW-026-FREEBUFF-DEVELOPMENT-HANDOVER-STUDIOFLOW-MEDIA.md) (variant of [TPI-STUDIOFLOW-026-ADDENDUM-A-LOCAL-ADMIN.md](TPI-STUDIOFLOW-026-ADDENDUM-A-LOCAL-ADMIN.md)) |
| TPI-STUDIOFLOW-027 | Full Development and Deployment Authority | 2026-10-22 | [TPI-STUDIOFLOW-027-FULL-DEVELOPMENT-AND-DEPLOYMENT-AUTHORITY.md](TPI-STUDIOFLOW-027-FULL-DEVELOPMENT-AND-DEPLOYMENT-AUTHORITY.md) |
| TPI-STUDIOFLOW-026 | Addendum A: Development Administrator Authentication | 2026-10-22 | [TPI-STUDIOFLOW-026-ADDENDUM-A-DEVELOPMENT-ADMINISTRATOR.md](TPI-STUDIOFLOW-026-ADDENDUM-A-DEVELOPMENT-ADMINISTRATOR.md) (variant of [TPI-STUDIOFLOW-026-ADDENDUM-A-LOCAL-ADMIN.md](TPI-STUDIOFLOW-026-ADDENDUM-A-LOCAL-ADMIN.md)) |
| TPI-STUDIOFLOW-028 | Comprehensive Autonomous Testing and Release Completion | 2026-10-22 | [TPI-STUDIOFLOW-028-COMPREHENSIVE-AUTONOMOUS-TESTING-AND-RELEASE.md](TPI-STUDIOFLOW-028-COMPREHENSIVE-AUTONOMOUS-TESTING-AND-RELEASE.md) |
| TPI-STUDIOFLOW-028 | Release Completion Instruction | 2026-10-22 | [TPI-STUDIOFLOW-028-RELEASE-COMPLETION-INSTRUCTION.md](TPI-STUDIOFLOW-028-RELEASE-COMPLETION-INSTRUCTION.md) |
| TPI-OPS-029 | Permanent E2E Infrastructure Repair and Release Unblocking | 2026-10-22 | [TPI-OPS-029-PERMANENT-E2E-INFRASTRUCTURE-REPAIR-AND.md](TPI-OPS-029-PERMANENT-E2E-INFRASTRUCTURE-REPAIR-AND.md) |
| TPI-OPS-030 | Clean Working Tree and Continuous Deployment Policy | 2026-10-22 | [TPI-OPS-030-CLEAN-WORKING-TREE-AND-CONTINUOUS-DEPLOYMENT.md](TPI-OPS-030-CLEAN-WORKING-TREE-AND-CONTINUOUS-DEPLOYMENT.md) |
| TPI-OPS-031 | Authenticated Production Acceptance | 2026-10-22 | [TPI-OPS-031-AUTHENTICATED-PRODUCTION-ACCEPTANCE.md](TPI-OPS-031-AUTHENTICATED-PRODUCTION-ACCEPTANCE.md) |
| (unnumbered) | Provision a new, dedicated synthetic production acceptance account. | 2026-10-22 | [PROVISION-A-NEW-DEDICATED-SYNTHETIC-PRODUCTION.md](PROVISION-A-NEW-DEDICATED-SYNTHETIC-PRODUCTION.md) |
| TPI-OPS-032 | Production Test Account Recovery and StudioFlow Entitlement | 2026-10-22 | [TPI-OPS-032-PRODUCTION-TEST-ACCOUNT-RECOVERY-AND.md](TPI-OPS-032-PRODUCTION-TEST-ACCOUNT-RECOVERY-AND.md) |
| TPI-OPS-033 | Independent StudioFlow QA Account Provisioning | 2026-10-22 | [TPI-OPS-033-INDEPENDENT-STUDIOFLOW-QA-ACCOUNT-PROVISIONING.md](TPI-OPS-033-INDEPENDENT-STUDIOFLOW-QA-ACCOUNT-PROVISIONING.md) |
| TPI-STUDIOFLOW-034 | Placard and Video Clip Correction | 2026-10-22 | [TPI-STUDIOFLOW-034-PLACARD-AND-VIDEO-CLIP-CORRECTION.md](TPI-STUDIOFLOW-034-PLACARD-AND-VIDEO-CLIP-CORRECTION.md) |
| TPI-STUDIOFLOW-034 | Emergency Audio Restoration | 2026-10-22 | [TPI-STUDIOFLOW-034-EMERGENCY-AUDIO-RESTORATION.md](TPI-STUDIOFLOW-034-EMERGENCY-AUDIO-RESTORATION.md) |
| TPI-STUDIOFLOW-035 | Emergency Restoration and Controlled Reconstruction | 2026-10-22 | [TPI-STUDIOFLOW-035-EMERGENCY-RESTORATION-AND-CONTROLLED.md](TPI-STUDIOFLOW-035-EMERGENCY-RESTORATION-AND-CONTROLLED.md) |
| TPI-STUDIOFLOW-035 | Corrected Scope: Media Assets Only | 2026-10-22 | [TPI-STUDIOFLOW-035-CORRECTED-SCOPE-MEDIA-ASSETS-ONLY.md](TPI-STUDIOFLOW-035-CORRECTED-SCOPE-MEDIA-ASSETS-ONLY.md) |
| TPI-STUDIOFLOW-034 | Emergency StudioFlow Interface Recovery | 2026-10-22 | [TPI-STUDIOFLOW-034-EMERGENCY-STUDIOFLOW-INTERFACE-RECOVERY.md](TPI-STUDIOFLOW-034-EMERGENCY-STUDIOFLOW-INTERFACE-RECOVERY.md) |
| TPI-STUDIOFLOW-035 | Restore Original Media Assets Navigation ONLY | 2026-10-22 | [TPI-STUDIOFLOW-035-RESTORE-ORIGINAL-MEDIA-ASSETS-NAVIGATION-ONLY.md](TPI-STUDIOFLOW-035-RESTORE-ORIGINAL-MEDIA-ASSETS-NAVIGATION-ONLY.md) |
| (unnumbered) | Use commit `7b3f488` as the last known working reference. | 2026-10-22 | [USE-COMMIT-7B3F488-AS-THE-LAST-KNOWN-WORKING.md](USE-COMMIT-7B3F488-AS-THE-LAST-KNOWN-WORKING.md) |
| TPI-OPS-036 | Git Branch and Worktree Investigation | 2026-10-22 | [TPI-OPS-036-GIT-BRANCH-AND-WORKTREE-INVESTIGATION.md](TPI-OPS-036-GIT-BRANCH-AND-WORKTREE-INVESTIGATION.md) |
| TPI-STUDIOFLOW-035 | Recovery Instructions for FreeBuff | 2026-10-22 | [TPI-STUDIOFLOW-035-RECOVERY-INSTRUCTIONS-FOR-FREEBUFF.md](TPI-STUDIOFLOW-035-RECOVERY-INSTRUCTIONS-FOR-FREEBUFF.md) |
| TPI-STUDIOFLOW-035 | Full Autonomous Execution Authority | 2026-10-22 | [TPI-STUDIOFLOW-035-FULL-AUTONOMOUS-EXECUTION-AUTHORITY.md](TPI-STUDIOFLOW-035-FULL-AUTONOMOUS-EXECUTION-AUTHORITY.md) |
| TPI-OPS-037 | Permanent Autonomous Development Authority | 2026-10-22 | [TPI-OPS-037-PERMANENT-AUTONOMOUS-DEVELOPMENT-AUTHORITY.md](TPI-OPS-037-PERMANENT-AUTONOMOUS-DEVELOPMENT-AUTHORITY.md) |
| (unnumbered) | FreeBuff, continue TPI-STUDIOFLOW-035 under the permanent autonomous authority established by TPI-OPS-037. | 2026-10-22 | [FREEBUFF-CONTINUE-TPI-STUDIOFLOW-035-UNDER-THE-2026-10-22.md](FREEBUFF-CONTINUE-TPI-STUDIOFLOW-035-UNDER-THE-2026-10-22.md) |
| (unnumbered) | FreeBuff, continue TPI-STUDIOFLOW-035 under the permanent authority granted by TPI-OPS-037. | 2026-10-22 | [FREEBUFF-CONTINUE-TPI-STUDIOFLOW-035-UNDER-THE.md](FREEBUFF-CONTINUE-TPI-STUDIOFLOW-035-UNDER-THE.md) |
| (unnumbered) | FreeBuff, proceed with the release under TPI-OPS-037. | 2026-10-22 | [FREEBUFF-PROCEED-WITH-THE-RELEASE-UNDER-TPI.md](FREEBUFF-PROCEED-WITH-THE-RELEASE-UNDER-TPI.md) |
| TPI-OPS-038 | Full Agent Autonomy and Execution Authority | 2026-10-22 | [TPI-OPS-038-FULL-AGENT-AUTONOMY-AND-EXECUTION-AUTHORITY.md](TPI-OPS-038-FULL-AGENT-AUTONOMY-AND-EXECUTION-AUTHORITY.md) |
| FREEBUFF DIRECTIVE | FREEBUFF DIRECTIVE — Myinstants MP3 Bulk Download | 2026-10-22 | [FREEBUFF-DIRECTIVE-MYINSTANTS-MP3-BULK-DOWNLOAD.md](FREEBUFF-DIRECTIVE-MYINSTANTS-MP3-BULK-DOWNLOAD.md) |
| TPI-STUDIOFLOW-017 | StudioFlow SMART Pads — Sound Effects & Background Music | 2026-10-22 | [TPI-STUDIOFLOW-017-STUDIOFLOW-SMART-PADS-SOUND-EFFECTS-BACKGROUND.md](TPI-STUDIOFLOW-017-STUDIOFLOW-SMART-PADS-SOUND-EFFECTS-BACKGROUND.md) (variant of [TPI-STUDIOFLOW-017-SMART-PADS.md](TPI-STUDIOFLOW-017-SMART-PADS.md)) |
| TPI-STUDIOFLOW-018 | Live Voice FX for Hosts and Guests | 2026-10-22 | [TPI-STUDIOFLOW-018-LIVE-VOICE-FX-FOR-HOSTS-AND-GUESTS.md](TPI-STUDIOFLOW-018-LIVE-VOICE-FX-FOR-HOSTS-AND-GUESTS.md) |
| TPI-STUDIOFLOW-019 | OpenVoiceChanger Investigation and Integration | 2026-10-22 | [TPI-STUDIOFLOW-019-OPENVOICECHANGER-INVESTIGATION-AND-INTEGRATION.md](TPI-STUDIOFLOW-019-OPENVOICECHANGER-INVESTIGATION-AND-INTEGRATION.md) |
| TPI-STUDIOFLOW-019 | Additional Investigation Instructions | 2026-10-22 | [TPI-STUDIOFLOW-019-ADDITIONAL-INVESTIGATION-INSTRUCTIONS.md](TPI-STUDIOFLOW-019-ADDITIONAL-INVESTIGATION-INSTRUCTIONS.md) |
| TPI-STUDIOFLOW-020 | Browser Voice FX Foundation and Integration | 2026-10-22 | [TPI-STUDIOFLOW-020-BROWSER-VOICE-FX-FOUNDATION-AND-INTEGRATION.md](TPI-STUDIOFLOW-020-BROWSER-VOICE-FX-FOUNDATION-AND-INTEGRATION.md) (variant of [TPI-STUDIOFLOW-020-INTRO-OUTRO-PLAYBACK.md](TPI-STUDIOFLOW-020-INTRO-OUTRO-PLAYBACK.md)) |
| TPI-STUDIOFLOW-021 | Live Voice Disguise & Fine-Tuning | 2026-10-22 | [TPI-STUDIOFLOW-021-LIVE-VOICE-DISGUISE-FINE-TUNING.md](TPI-STUDIOFLOW-021-LIVE-VOICE-DISGUISE-FINE-TUNING.md) (variant of [TPI-STUDIOFLOW-021-UNIFIED-OPERA-BROWSER-WORKFLOW.md](TPI-STUDIOFLOW-021-UNIFIED-OPERA-BROWSER-WORKFLOW.md)) |
| TPI-STUDIOFLOW-021 | Live Voice Disguise, Fine-Tuning & Settings Integration | 2026-10-22 | [TPI-STUDIOFLOW-021-LIVE-VOICE-DISGUISE-FINE-TUNING-SETTINGS.md](TPI-STUDIOFLOW-021-LIVE-VOICE-DISGUISE-FINE-TUNING-SETTINGS.md) (variant of [TPI-STUDIOFLOW-021-UNIFIED-OPERA-BROWSER-WORKFLOW.md](TPI-STUDIOFLOW-021-UNIFIED-OPERA-BROWSER-WORKFLOW.md)) |
| TPI-STUDIOFLOW-022 | Live Voice Monitoring & Fine-Tuning Integration | 2026-10-22 | [TPI-STUDIOFLOW-022-LIVE-VOICE-MONITORING-FINE-TUNING-INTEGRATION.md](TPI-STUDIOFLOW-022-LIVE-VOICE-MONITORING-FINE-TUNING-INTEGRATION.md) |
| TPI-STUDIOFLOW-023 | OpenVoiceChanger Source Integration | 2026-10-22 | [TPI-STUDIOFLOW-023-OPENVOICECHANGER-SOURCE-INTEGRATION.md](TPI-STUDIOFLOW-023-OPENVOICECHANGER-SOURCE-INTEGRATION.md) |
| TPI-STUDIOFLOW-024 | Microphone Gain, Voice Volume & Audio Calibration | 2026-10-22 | [TPI-STUDIOFLOW-024-MICROPHONE-GAIN-VOICE-VOLUME-AUDIO-CALIBRATION.md](TPI-STUDIOFLOW-024-MICROPHONE-GAIN-VOICE-VOLUME-AUDIO-CALIBRATION.md) |
| TPI-STUDIOFLOW-025 | Audio Latency, Clicking & Ghost Voice Repair | 2026-10-22 | [TPI-STUDIOFLOW-025-AUDIO-LATENCY-CLICKING-GHOST-VOICE-REPAIR.md](TPI-STUDIOFLOW-025-AUDIO-LATENCY-CLICKING-GHOST-VOICE-REPAIR.md) |
| TPI-STUDIOFLOW-025 | Addendum A: Live Podcast Audio Routing | 2026-10-22 | [TPI-STUDIOFLOW-025-ADDENDUM-A-LIVE-PODCAST-AUDIO-ROUTING.md](TPI-STUDIOFLOW-025-ADDENDUM-A-LIVE-PODCAST-AUDIO-ROUTING.md) |
| TPI-STUDIOFLOW-027 | MY SCENES — INTRO, OUTRO & BACKGROUND MUSIC CONNECTION REPAIR | 2026-10-23 | [TPI-STUDIOFLOW-027-MY-SCENES-INTRO-OUTRO-BACKGROUND-MUSIC.md](TPI-STUDIOFLOW-027-MY-SCENES-INTRO-OUTRO-BACKGROUND-MUSIC.md) |
| TPI-STUDIOFLOW-028 | My Scenes Independent Media Shortcut Repair | 2026-10-23 | [TPI-STUDIOFLOW-028-MY-SCENES-INDEPENDENT-MEDIA-SHORTCUT-REPAIR.md](TPI-STUDIOFLOW-028-MY-SCENES-INDEPENDENT-MEDIA-SHORTCUT-REPAIR.md) |
| TPI-STUDIOFLOW-028 | Restore Original Intro/Outro Production Workflow | 2026-10-23 | [TPI-STUDIOFLOW-028-RESTORE-ORIGINAL-INTRO-OUTRO-PRODUCTION.md](TPI-STUDIOFLOW-028-RESTORE-ORIGINAL-INTRO-OUTRO-PRODUCTION.md) |
| TPI-STUDIOFLOW-026 | Voice FX Audio Stabilization & Interface Simplification | 2026-10-23 | [TPI-STUDIOFLOW-026-VOICE-FX-AUDIO-STABILIZATION-INTERFACE.md](TPI-STUDIOFLOW-026-VOICE-FX-AUDIO-STABILIZATION-INTERFACE.md) |
| TPI-STUDIOFLOW-028 | Addendum A: Preserve After Intro Background Music | 2026-10-23 | [TPI-STUDIOFLOW-028-ADDENDUM-A-PRESERVE-AFTER-INTRO-BACKGROUND.md](TPI-STUDIOFLOW-028-ADDENDUM-A-PRESERVE-AFTER-INTRO-BACKGROUND.md) |
| TPI-STUDIOFLOW-029 | Documentation Synchronization and Historical Preservation | 2026-10-23 | [TPI-STUDIOFLOW-029-DOCUMENTATION-SYNCHRONIZATION-AND-HISTORICAL.md](TPI-STUDIOFLOW-029-DOCUMENTATION-SYNCHRONIZATION-AND-HISTORICAL.md) |
| (unnumbered) | Mandatory Authority — All StudioFlow Directives | 2026-10-23 | [MANDATORY-AUTHORITY-ALL-STUDIOFLOW-DIRECTIVES.md](MANDATORY-AUTHORITY-ALL-STUDIOFLOW-DIRECTIVES.md) |
| TPI-STUDIOFLOW-030 | Sound Effects Interface Cleanup and Drag-and-Drop Pad Reordering | 2026-10-23 | [TPI-STUDIOFLOW-030-SOUND-EFFECTS-INTERFACE-CLEANUP-AND-DRAG-AND.md](TPI-STUDIOFLOW-030-SOUND-EFFECTS-INTERFACE-CLEANUP-AND-DRAG-AND.md) |
| TPI-STUDIOFLOW-031 | Background Music Interface Cleanup and Drag-and-Drop Reordering | 2026-10-24 | [TPI-STUDIOFLOW-031-BACKGROUND-MUSIC-INTERFACE-CLEANUP-AND-DRAG.md](TPI-STUDIOFLOW-031-BACKGROUND-MUSIC-INTERFACE-CLEANUP-AND-DRAG.md) |
| TPI-STUDIOFLOW-032 | Background Music and Sound Effects Icon Replacement | 2026-10-24 | [TPI-STUDIOFLOW-032-BACKGROUND-MUSIC-AND-SOUND-EFFECTS-ICON.md](TPI-STUDIOFLOW-032-BACKGROUND-MUSIC-AND-SOUND-EFFECTS-ICON.md) |
| TPI-STUDIOFLOW-034 | STUDIOFLOW DOM MUTATION STORM — ROOT CAUSE INVESTIGATION AND REPAIR | 2026-10-24 | [TPI-STUDIOFLOW-034-STUDIOFLOW-DOM-MUTATION-STORM-ROOT-CAUSE.md](TPI-STUDIOFLOW-034-STUDIOFLOW-DOM-MUTATION-STORM-ROOT-CAUSE.md) |
| TPI-STUDIOFLOW-033 | VIDEO CLIPS, PROGRAM ORIENTATION, AND WORKSPACE CONFIGURATION PERSISTENCE REPAIR | 2026-10-24 | [TPI-STUDIOFLOW-033-VIDEO-CLIPS-PROGRAM-ORIENTATION-AND-WORKSPACE.md](TPI-STUDIOFLOW-033-VIDEO-CLIPS-PROGRAM-ORIENTATION-AND-WORKSPACE.md) |
| TPI-STUDIOFLOW-035 | RIGHT NAVIGATION CLEANUP, TELEPROMPTER PLACEMENT, AND RECORDING & STORAGE CONSOLIDATION | 2026-10-24 | [TPI-STUDIOFLOW-035-RIGHT-NAVIGATION-CLEANUP-TELEPROMPTER.md](TPI-STUDIOFLOW-035-RIGHT-NAVIGATION-CLEANUP-TELEPROMPTER.md) |
| TPI-STUDIOFLOW-036 | Integrate Nine Cinematic Video Timers | 2026-10-24 | [TPI-STUDIOFLOW-036-INTEGRATE-NINE-CINEMATIC-VIDEO-TIMERS.md](TPI-STUDIOFLOW-036-INTEGRATE-NINE-CINEMATIC-VIDEO-TIMERS.md) |
| TPI-STUDIOFLOW-037 | Scenes Redesign, Production Sequencing & Automated Broadcast Control | 2026-10-24 | [TPI-STUDIOFLOW-037-SCENES-REDESIGN-PRODUCTION-SEQUENCING.md](TPI-STUDIOFLOW-037-SCENES-REDESIGN-PRODUCTION-SEQUENCING.md) |
| TPI-STUDIOFLOW-037 | Scenes Panel Redesign & Production Workflow Refinement | 2026-10-24 | [TPI-STUDIOFLOW-037-SCENES-PANEL-REDESIGN-PRODUCTION-WORKFLOW.md](TPI-STUDIOFLOW-037-SCENES-PANEL-REDESIGN-PRODUCTION-WORKFLOW.md) |
| TPI-STUDIOFLOW-037 | Scenes Button Consistency Correction | 2026-10-24 | [TPI-STUDIOFLOW-037-SCENES-BUTTON-CONSISTENCY-CORRECTION.md](TPI-STUDIOFLOW-037-SCENES-BUTTON-CONSISTENCY-CORRECTION.md) |
| TPI-STUDIOFLOW-037 | Addendum B: Final Scenes Panel Uniformity | 2026-10-24 | [TPI-STUDIOFLOW-037-ADDENDUM-B-FINAL-SCENES-PANEL-UNIFORMITY.md](TPI-STUDIOFLOW-037-ADDENDUM-B-FINAL-SCENES-PANEL-UNIFORMITY.md) |
| TPI-STUDIOFLOW-037 | Addendum B: Reactive Drag-and-Drop Enhancement | 2026-10-24 | [TPI-STUDIOFLOW-037-ADDENDUM-B-REACTIVE-DRAG-AND-DROP-ENHANCEMENT.md](TPI-STUDIOFLOW-037-ADDENDUM-B-REACTIVE-DRAG-AND-DROP-ENHANCEMENT.md) |
| TPI-STUDIOFLOW-037 | Addendum D: Toggle Playback, Rehearsal Stop & Scene Item Removal | 2026-10-25 | [TPI-STUDIOFLOW-037-ADDENDUM-D-TOGGLE-PLAYBACK-REHEARSAL-STOP.md](TPI-STUDIOFLOW-037-ADDENDUM-D-TOGGLE-PLAYBACK-REHEARSAL-STOP.md) |
| TPI-STUDIOFLOW-037 | Addendum E: Scene Management and Playback Corrections | 2026-10-25 | [TPI-STUDIOFLOW-037-ADDENDUM-E-SCENE-MANAGEMENT-AND-PLAYBACK.md](TPI-STUDIOFLOW-037-ADDENDUM-E-SCENE-MANAGEMENT-AND-PLAYBACK.md) |
| TPI-STUDIOFLOW-037 | ADDENDUM C — SCENES PANEL VISUAL CONSISTENCY & DRAG INTERACTION REPAIR | 2026-10-25 | [TPI-STUDIOFLOW-037-ADDENDUM-C-SCENES-PANEL-VISUAL-CONSISTENCY.md](TPI-STUDIOFLOW-037-ADDENDUM-C-SCENES-PANEL-VISUAL-CONSISTENCY.md) |
| TPI-STUDIOFLOW-037 | Addendum E: Final Scene Management, Removal, Naming & Live Verification | 2026-10-25 | [TPI-STUDIOFLOW-037-ADDENDUM-E-FINAL-SCENE-MANAGEMENT-REMOVAL.md](TPI-STUDIOFLOW-037-ADDENDUM-E-FINAL-SCENE-MANAGEMENT-REMOVAL.md) |
| (unnumbered) | TPI Development Standard — Agent Independence and Documentation Continuity | 2026-10-25 | [TPI-DEVELOPMENT-STANDARD-AGENT-INDEPENDENCE.md](TPI-DEVELOPMENT-STANDARD-AGENT-INDEPENDENCE.md) |
| (unnumbered) | TPI Mandatory Markdown Synchronization Standard | 2026-10-25 | [TPI-MANDATORY-MARKDOWN-SYNCHRONIZATION.md](TPI-MANDATORY-MARKDOWN-SYNCHRONIZATION.md) |
| TPI-STUDIOFLOW-037 | Production Recovery and Documentation Reconciliation | 2026-10-25 | [TPI-STUDIOFLOW-037-PRODUCTION-RECOVERY-AND-DOCUMENTATION.md](TPI-STUDIOFLOW-037-PRODUCTION-RECOVERY-AND-DOCUMENTATION.md) |
| (unnumbered) | TPI-STUDIOFLOW — Five-Directive Recovery and Verification Order | 2026-10-25 | [TPI-STUDIOFLOW-FIVE-DIRECTIVE-RECOVERY-AND.md](TPI-STUDIOFLOW-FIVE-DIRECTIVE-RECOVERY-AND.md) |
| TPI-STUDIOFLOW-037 | Final Scene Menu and Drag-and-Drop Correction | 2026-10-25 | [TPI-STUDIOFLOW-037-FINAL-SCENE-MENU-AND-DRAG-AND-DROP-CORRECTION.md](TPI-STUDIOFLOW-037-FINAL-SCENE-MENU-AND-DRAG-AND-DROP-CORRECTION.md) |
| (unnumbered) | STUDIOFLOW — INTEGRATED STUDIO MANAGEMENT & SCENE SYSTEM RECOVERY | 2026-10-25 | [STUDIOFLOW-INTEGRATED-STUDIO-MANAGEMENT-SCENE.md](STUDIOFLOW-INTEGRATED-STUDIO-MANAGEMENT-SCENE.md) |
| (unnumbered) | TPI Permanent Directive Archiving Standard | 2026-10-25 | [TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md) |
| (unnumbered) | STUDIOFLOW EMERGENCY DEVELOPMENT / PRODUCTION PARITY INVESTIGATION AND REPAIR — with Mandatory Addition (issued directly to the development agent, not via the directive conversation) | 2026-10-25 | [STUDIOFLOW-EMERGENCY-DEVELOPMENT-PRODUCTION-PARITY.md](STUDIOFLOW-EMERGENCY-DEVELOPMENT-PRODUCTION-PARITY.md) |
| (unnumbered) | STUDIOFLOW PRODUCTION PARITY INVESTIGATION — AUTHORIZATION (authenticated parity investigation, Testing 123 persistence inquiry, documentation reconciliation, and archive Git-exclusion resolution) | 2026-10-25 | [STUDIOFLOW-PRODUCTION-PARITY-INVESTIGATION-AUTHORIZATION.md](STUDIOFLOW-PRODUCTION-PARITY-INVESTIGATION-AUTHORIZATION.md) |
| (unnumbered) | TPI-STUDIOFLOW — CRITICAL STUDIO CREATION, SWITCHING & WORKSPACE ISOLATION RECOVERY (owner rejection of the Integrated Recovery; runtime Studio switching/creation repair required) | 2026-10-25 | [STUDIOFLOW-CRITICAL-STUDIO-CREATION-SWITCHING-WORKSPACE-ISOLATION-RECOVERY.md](STUDIOFLOW-CRITICAL-STUDIO-CREATION-SWITCHING-WORKSPACE-ISOLATION-RECOVERY.md) |
| TPI-STUDIOFLOW-088 | PERMANENT STUDIO DELETION AND ARCHIVE MANAGEMENT | 2026-10-26 | [TPI-STUDIOFLOW-088-PERMANENT-STUDIO-DELETION-AND-ARCHIVE-MANAGEMENT.md](TPI-STUDIOFLOW-088-PERMANENT-STUDIO-DELETION-AND-ARCHIVE-MANAGEMENT.md) |
| TPI-STUDIOFLOW-087 | INDEPENDENT STUDIOS, STUDIO DASHBOARDS, AND PRODUCTION OWNERSHIP | 2026-10-25 | [TPI-STUDIOFLOW-087-INDEPENDENT-STUDIOS-DASHBOARDS-PRODUCTION-OWNERSHIP.md](TPI-STUDIOFLOW-087-INDEPENDENT-STUDIOS-DASHBOARDS-PRODUCTION-OWNERSHIP.md) |
