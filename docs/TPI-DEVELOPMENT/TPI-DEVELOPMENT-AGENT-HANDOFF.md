# TPI Development Agent Handoff

## TPI-STUDIOFLOW-111 — RECORDING AUDIO REPAIRED / INTEGRATION REQUIRED / NOT DEPLOYED (2026-10-29)

The shared recording defect is repaired and verified in isolated source worktree
`/Users/toddknipple/Documents/StudioFlow/web-111`, branch
`codex/studioflow-111-recording-audio`, based on approved commit `6b9c3c4`.
Absent or blank `studioflow.micVolume` was converted to zero by
`Number(localStorage.getItem(...))`, muting the microphone gain before the
program recording destination. The focused repair restores fallback `1` and
does not alter the recording architecture, Voice FX placement, compositor or
Teleprompter implementation.

Fresh Firefox recordings now contain live recorder audio, non-silent decoded
48 kHz Opus at approximately 440 Hz, and playable VP8 video. Disabled,
enabled, changed and bypassed Voice FX all pass; Video Setup 091 is 9/9;
Teleprompter acceptance is 39/39; focused Teleprompter checks are 23/23; and
screen-share privacy is 9/9. The original mixed checkout and `web-109` remain
untouched and uncommitted. Do not merge automatically. The next directive must
review and integrate the isolated commit into `web-109`, then repeat combined
acceptance. Production remains unchanged and no deployment was performed.
See [Directive 111 record](100-DIRECTIVES/TPI-STUDIOFLOW-111-RECORDING-AUDIO.md).

## TPI-STUDIOFLOW-110 — TELEPROMPTER 092 ACCEPTANCE BLOCKED / NOT DEPLOYED (2026-10-29)

Continue only in `/Users/toddknipple/Documents/StudioFlow/web-109`, branch
`codex/studioflow-109-teleprompter`, based on `6b9c3c4b6b40f0496012e5d718d32d75e149dcf6`.
Directive 109 work remains uncommitted and was snapshotted as
`.directive110-evidence/directive109-source-recoverable.patch` (SHA-256
`6ae6d1a7ff879819feca8e1b4142d973ef4f6f109dd5155419a74079d8b7ec45`). Browser
acceptance 39/39, screen-share 9/9, local RTMP output canary check, Video Setup
091 9/9, Voice FX readiness, build, focused checks 23/23 and website release
safety 21/21 pass. Play/Pause/Resume/Close were confirmed during active recording
with both A/V tracks live; reopen-during-recording remains inconclusive. The saved
1080p video is playable/canary-free, but app program audio measured 0.0 RMS even
though a generated source measured ~0.087 RMS, and the saved Opus decodes as silent
with malformed packets. The program audio mix/capture path is therefore blocked.
Independent Firefox tone/mic control recording was non-silent (-23 dB). Studio
lifecycle/ownership/archive suites were not run because no isolated authenticated
Worker fixture/account is available. Do not commit until the program audio path is
verified with non-silent decodable output and isolated Worker-backed lifecycle
regressions pass. Original mixed source changes remain
preserved; website production baseline untouched; no production endpoint or
deployment used. Full evidence and exact results are in
`/Users/toddknipple/Documents/StudioFlow/web-109/.directive110-evidence/` and the
[Directive 110 record](100-DIRECTIVES/TPI-STUDIOFLOW-110-TELEPROMPTER-ACCEPTANCE.md).

## TPI-STUDIOFLOW-109 — TELEPROMPTER 092 DEVELOPMENT / ACCEPTANCE PARTIAL / NOT DEPLOYED (2026-10-28)

Feature source is isolated in `/Users/toddknipple/Documents/StudioFlow/web-109`
on branch `codex/studioflow-109-teleprompter`, based on approved Video Setup
source `6b9c3c4`. Existing Teleprompter editor/script functionality was reused;
new work adds Studio ownership/assignment, reader controls and per-Studio
selection/settings/scroll persistence, presenter overlay, host screen-share
close-before-capture guard and dedicated regression source checks (23/23).
Build and Voice FX architecture check pass. Browser loaded the local app and
verified script create/edit/save, but the preview harness stalled while entering
recording setup, so no live recording, device or livestream test is claimed.
Compositor source inspection establishes recording/RTMP video comes from the
separate canvas path and excludes presenter DOM; supported screen-share safety
is enforced by closing before host capture, but the actual captured output was
not empirically tested. The directive requires browser acceptance of the reader
and actual capture privacy; the preview stalled after entering the temporary
recording setup and no browser automation package is available in the isolated
source project. The feature is intentionally left uncommitted until those gates
can be exercised, rather than recording a false complete state. Production
unchanged; no deployment. See [Directive 109 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-109-TELEPROMPTER-092.md).

## TPI-STUDIOFLOW-108 — SOURCE-PROVENANCE WORKFLOW INTEGRATED AND PUSHED (2026-10-28)

Directive 107's staging correction (`3b55fe9`) is now on the authorized branch:
fast-forwarded `codex/tpi-development` from `b5cd1b7` and pushed with exact origin
parity. The maintained preflight staging check now builds only the baseline-approved
source commit (`6b9c3c4` recorded in `scripts/studioflow-release-baseline.json`)
from an isolated clean worktree. Verification: 107 suite 20/20, 025 12/12,
055 17/17; production assets byte-identical (`4eed57a4…`/`850186…`); Worker and
`studio/` application code unchanged. The 107 note "not pushed" is superseded by
this integration. Preserved development intact. Nothing deployed; production
unchanged. The next source release still updates the baseline commit + hashes in
its release commit before verifying/applying.
[Directive 108 record](100-DIRECTIVES/TPI-STUDIOFLOW-108-INTEGRATE-SOURCE-PROVENANCE-WORKFLOW.md).

## TPI-STUDIOFLOW-107 — SOURCE PROVENANCE FIXED / TOOLING ONLY (2026-10-28)

The 106 known gap is closed: authoritative staging no longer compiles the mixed
development tree. `scripts/stage-studioflow-authoritative.mjs` resolves its source
identity from `scripts/studioflow-release-baseline.json` (repository + exact
approved commit + known-good asset hashes) and builds exactly that commit from an
isolated clean worktree. It rejects dirty worktrees, wrong/missing commits, foreign
worktrees, unauthorized source paths and unauthorized staging surfaces; there are
no bypass flags. Verify-only never writes; `--apply` stages and re-verifies. Future
source releases update the baseline (commit + hashes) in their release commit
before verifying/applying. Regression: `npm run verify:studioflow-107-provenance`
(20/20). Work is committed on `codex/studioflow-107-source-provenance` and not
pushed per the directive; nothing deployed; production unchanged. The mixed
checkout keeps the unfinished 091/092 work and remains development-only.
[Directive 107 record](100-DIRECTIVES/TPI-STUDIOFLOW-107-SOURCE-PROVENANCE-AND-REPRODUCIBILITY.md).

## TPI-STUDIOFLOW-106 — DEPLOYED_AND_VERIFIED (2026-10-27)

The verified Video Setup 091 candidate is live at `https://paranormalinitiative.com/studio/`
on Worker `91a8460e-1db1-440c-9643-a85b6e178fba` (100% traffic); rollback is
`17b9f9d5-717e-42a9-92d1-14b0dd717ef6`. Release commit `9b3f033` (application
byte-identical to `81a234a`; JS `4eed57a4…`, CSS `850186…`); source `6b9c3c4`.
The 105 auth blocker is resolved: development preserved to `fc6fe45` on
`codex/studioflow-105-preserved-development`, and the canonical checkout now runs
clean `codex/tpi-development`, so the managed Worker/verification serves the candidate.
Do not switch the canonical checkout away from `codex/tpi-development` without first
preserving any new work. Auth lifecycle PASS, preflight READY, live smoke 10/10,
Firefox acceptance 64/0, Video Setup 091 9/0. Both permanent deletion modes remain
unavailable; 101–102 deletion-safety work stays on its branches, undeployed.
Known gap: authoritative staging builds the mixed source tree, not the clean candidate
commit — retarget it before the next source release. Physical-device/owner acceptance
of the live interface remains pending owner action. No credentials are in this handoff.
[Directive 106 deployment record](100-DIRECTIVES/TPI-STUDIOFLOW-106-RESOLVE-AUTH-GATE-AND-PRODUCTION-DEPLOY.md).

## TPI-STUDIOFLOW-105 — RELEASE STOPPED AT MANDATORY AUTH GATE (2026-10-26)

Authorized branch is now in `.local-dev/worktrees/website-105`, with candidate and
104 acceptance commit `20eba92` pushed fast-forward and origin parity verified.
Original website dirty checkout remains at `6c48b45` on renamed branch
`codex/studioflow-105-preserved-development`; its file bytes/status are preserved.
Original StudioFlow and existing 091/source-103 worktrees untouched. No application
changes or asset rebuild: exact JS/CSS hashes and 103 application parity pass.
Mandatory auth lifecycle failed immediately because the isolated release worktree
lacks its protected credential file/local state. Per 105, stopped before deployment;
full preflight and live verification not run. No new authorization is needed merely
because older 104 records required it, but all safety gates still must pass.
Next: establish maintained isolated auth/service ownership and exact clean source
provenance without building mixed originals or bypassing release scripts. Then rerun
mandatory auth lifecycle/full preflight. Both permanent deletion modes stay unavailable.
[Directive 105 traceability and exact failure](100-DIRECTIVES/TPI-STUDIOFLOW-105-PRODUCTION-RELEASE.md).

## TPI-STUDIOFLOW-104 — LOCAL ACCEPTANCE PASSED / GUARDED RELEASE BLOCKED (2026-10-26)

Continue from `.local-dev/worktrees/website-104`, branch
`codex/studioflow-104-release-acceptance`; application remains website `81a234a2`
and source `6b9c3c4b`. Acceptance harness/documentation changes are uncommitted.
Disposable credentials/state are ignored within that worktree; never print or commit them.
Lifecycle 29/29, 035 33/33, 087 40/40, 088 31/31, 089 32/32,
authenticated 091 9/9, Worker integration 23/23 PASS. Asset hashes unchanged.
Both permanent deletion modes remain unavailable; 088/089 successful-deletion
scenarios are explicitly excluded/replaced by rejection and preservation checks.
Release safety contract 21/21 and local-config dry-run PASS, but guarded preflight
stops at `release branch must be codex/tpi-development`; not READY.
Do not merge/push/deploy without explicit authorization. Preserve dirty originals;
reconcile authoritative clean source and release branch, establish origin parity,
then run maintained auth lifecycle/full preflight. No source/asset repair needed.
Physical-device and production/owner acceptance remain unverified.
[Directive 104 detailed handoff and evidence](100-DIRECTIVES/TPI-STUDIOFLOW-104-RELEASE-ACCEPTANCE.md).

## TPI-STUDIOFLOW-103 — SOURCE INTEGRATED / RELEASE BLOCKED (2026-10-26)

New isolated source branch `codex/studioflow-103-video-setup-release`, commit
`6b9c3c4b6b40f0496012e5d718d32d75e149dcf6`; website branch
`codex/studioflow-103-website-release`. 091 integrated; both permanent deletion
modes intentionally disabled in UI/handler/bridge and authenticated server purge route.
Worklet BASE_URL compatibility fixed after exact staged Firefox failure; rerun 9/9 PASS.
Reproducible staged builds, Voice FX architecture, 101 22/22, 102 8/8, 093 and
website static guards PASS. Lifecycle/035/087/088/089 acceptance BLOCKED by missing
isolated QA credentials. Preflight rejects non-release branch; origin parity and
full Worker acceptance pending. Originals hash-verified unchanged; 092 excluded.
No push, merge, deployment or owner acceptance. See
[Directive 103 candidate evidence](100-DIRECTIVES/TPI-STUDIOFLOW-103-VIDEO-SETUP-RELEASE-CANDIDATE.md).

## TPI-STUDIOFLOW-102 — BLOCKED (2026-10-26)

Real disposable Firefox tests reproduce a legacy tab writing ownership metadata while
another tab holds an exclusive Web Lock. Current-writer locks cannot exclude older tabs;
localStorage ownership and IndexedDB cleanup have no shared transaction. Explicit stop
condition reached; content deletion remains blocked. Source stays clean at `0a104519`.
Browser boundary/storage/helper-recovery checks 8/8, existing local fixtures 22/22,
TypeScript, production build and unchanged 093 regression pass. Full application
concurrent completion/switching and interrupted cleanup acceptance remain unverified.
No source/server repair, 091/092 import, original-tree edit, push, merge or deployment.
[Directive 102 evidence and writer inventory](100-DIRECTIVES/TPI-STUDIOFLOW-102-CROSS-TAB-RECORDING-DELETION-SAFETY.md).

## TPI-STUDIOFLOW-101 — BLOCKED (2026-10-26)

Partial local deletion repairs committed in isolated source `0a10451997e19a09ef2aae94bb9b25395603bfac`.
Local injected fixture tests 22/22, TypeScript, production build and unchanged 093 VM regression pass.
Existing ownership writers and older tabs do not coordinate with deletion locks; a last-moment
localStorage read is not atomic with IndexedDB deletion. **Content deletion now fails closed
before any mutation**; Studio-only retains blobs. This is an intentional blocked-development
behavior change, not safety completion or release readiness. Actual browser/IndexedDB and
cross-tab acceptance remain unverified. No 091/092 code, original-tree edits, push, merge or deployment.
Resolve all-writer coordination and old-tab handling before enabling cleanup. See
[Directive 101 evidence](100-DIRECTIVES/TPI-STUDIOFLOW-101-LOCAL-RECORDING-DELETION-SAFETY.md).

## TPI-STUDIOFLOW-100 — SOURCE ISOLATED (2026-10-26)

Deletion source is isolated on `codex/studioflow-100-deletion-isolation`, source commit
`8b72de811cf1623ac7d6caa5642a43e418d69924`. Paired website server branch:
`codex/studioflow-100-deletion-server`. The website commit is the commit introducing
[the Directive 100 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-100-DELETION-ISOLATION.md).
Both worktrees are under the original website checkout's ignored `.local-dev/worktrees/`.
Original development file bytes and statuses were fingerprinted and verified unchanged.
TypeScript/build/isolation checks and 093 VM purge regression passed. 088 and 089 were
attempted but blocked before browser launch by missing isolated `test_admin` credentials.
No generated website assets, push, merge, deployment, or production mutation occurred.
No 091 or 092 code is included. This is not implementation-complete, safety-verified,
deployed, or owner-accepted. Preserve browser-local recordings; no new ownership DB.
The existing browser bridge already constructs local/shared blob lists; earlier claims
that the server must return them omitted that layer. Local error swallowing, reference
ambiguity, cross-tab races and dialog overflow remain for subsequent implementation.
See the execution record for exact files, build hashes, evidence and next actions.


Last verified: 2026-10-26
Current controlling directive: TPI MASTER — Standing Autonomous Agent Authority

## Mandatory authority update

Read `100-DIRECTIVES/TPI-MASTER-AUTONOMOUS-AGENT-AUTHORITY.md`. Agents now have
standing authority to investigate, repair, test, commit, push, perform guarded
production deployment, verify live, and roll back. Do not stop for a routine
repairable blocker or require a fresh owner directive for each lifecycle step.
Historical restrictions below describe prior executions and do not override
the controlling directive.

## TPI-STUDIOFLOW-088 Deletion & Archive — Production Verification — 2026-10-26

`LIVE VERIFIED — OWNER ACCEPTANCE PENDING`. Production verification of the
deletion suite reproduced two production-only defects, both repaired and
re-verified live: background Studio activations (boot replay, identity
convergence) no longer navigate the owner out of the view they chose —
activations carry a `background` flag and the first pointer/keyboard/click
input arms the guard — and Studio archive/restore now retry once with the
fresh version from a `workspace_conflict` (409) response and report failures
in the panel status instead of swallowing them. `deleteStudio` compares every
Studio identity before selecting the safe Home destination. Regression: 088
suite 39/39 including the new Test 11 view-guard checks, on authenticated
production with disposable QA Studios and locally; 087 40/40, lifecycle
29/29, auth lifecycle 64/64. Source `9f85f9d` (StudioFlow repo, local-only);
website commits `5e206a7`, `6d9facb`, `7da1fb5` (pushed); live Worker
`fb9ffdb9-137f-4e9e-b5a3-6c5c5fe1e91b`, rollback `5ee8b6d2` (earlier
checkpoints `25f3d4ea`, `d0dc37a5` preserved). See
`300-COMPLETED-WORK/2026-10-26-TPI-STUDIOFLOW-088-DELETION-PRODUCTION-VERIFICATION.md`.

## TPI-STUDIOFLOW-087 Independent Studios & Dashboards — 2026-10-26

`LIVE VERIFIED — OWNER ACCEPTANCE PENDING`. The homepage/My Studios identity
mismatch (Broadcast records vs Studio identities) is repaired: the Home page
now renders My Studios cards from the same authorized Studio collection as
the My Studios selector, each Studio has its own dashboard with its own
productions and recordings, Studio vs production creation are separate with
an Owning Studio selector, and productions are stamped with their Studio's
stable host key at creation. Rename/Archive/Restore round trip (the missing
server restore route was added). Permanent deletion is deferred for owner
approval; unowned historical productions stay preserved and unassigned.
087 suite 40/40 local and 40/40 on authenticated production (isolated QA
account). Source `db3aab4`; integration `37803f3` + `815fb85` (pushed);
production Worker `b4605f5f-f33e-4f1d-8082-b12fc8bf5bdf`, rollback
`6bbdae3d`. `release:preflight` now runs the 087 suite too, enforced by the
release-safety contract. See
`300-COMPLETED-WORK/2026-10-26-TPI-STUDIOFLOW-087-INDEPENDENT-STUDIOS.md`.

## Emergency Live Production Repair 001 — 2026-10-25/26

`DEPLOYED AND AGENT-VERIFIED — OWNER ACCEPTANCE PENDING`. Studio switching
and browser-local recovery were repaired in `studio/workspace-bridge.js`:
malformed/corrupt snapshot records are preserved under
`studioflow.tpiLocalStudioSnapshots.recovery.v1` before replacement, the
My Studios menu refreshes on open, stale selections explain themselves, and a
title conflict no longer disarms the save integrity gate (a blocked switch
stays put and explains the failure). Testing 123
(`a75afc38-c7a6-452d-9460-5d746712d411`) was reset to the clean four-item
default under explicit owner approval and verified in the database and live
interface. Lifecycle suite 29/29 local and 29/29 production; deployed Worker
`6bbdae3d-f424-4373-87ff-84030df50a49`, rollback `9d3aa40c`, source `af7fbc0`.
"Browser Only Crossroads" is browser-local-only; a read-only owner diagnostic
is in the completion record (section J):
`300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001.md`.

## Owner Verification 001 — 2026-10-25

`AGENT VERIFIED — OWNER ACCEPTANCE PENDING`. The Studio lifecycle recovery was
re-verified on authenticated production with the isolated QA account (lifecycle
suite 25/25 production, 25/25 local; active Worker `9d3aa40c`, rollback
`7bddac9c`; live assets byte-identical to the website integration). Read-only
D1 inspection: the owner's "Testing 123" (`a75afc38-c7a6-452d-9460-5d746712d411`)
saved state retains the historically inherited eight-item Crossroads-like
configuration from the pre-repair build (created 16:37Z, repair deployed
22:16Z); remediation is proposed in the completion record and awaits explicit
owner authorization — nothing was modified. "Browser Only Crossroads" has no
server record (browser-local only) and cannot be inspected server-side.
`release:preflight` now runs `verify:studioflow-studio-lifecycle` (enforced by
a release-safety contract check). The five static-contract suite failures
(048/049/dev-024/dev-037/022) and the flaky 030 rapid-upload step remain open
and documented. See
`300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-OWNER-VERIFICATION-001.md`.

## Current Studio lifecycle recovery release

The Studio Creation, Switching & Workspace Isolation Recovery is deployed and
live-verified; owner acceptance remains pending. Source commit `44f9478`
(StudioFlow canonical repository, local-only), website application commit
`161d03d` (pushed to `codex/tpi-development`). Production Worker
`9d3aa40c-9a44-4bf9-bcf1-8efcbf837683` is active with rollback checkpoint
`7bddac9c-bda3-41c1-95d2-13aacc09cb28`; the live application serves
`/studio/assets/index-Drm85nEM.js` and `/studio/assets/index-8wAEEeJ8.css`.
Guarded release preflight passed and `DEPLOYED_AND_VERIFIED` ran 64/64 live
acceptance checks. The maintained `npm run verify:studioflow-studio-lifecycle`
suite (Directive Tests 1–10 plus owner-flow checks) passes locally and
against production with the isolated QA account. See
`300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-STUDIO-LIFECYCLE-RECOVERY.md`.

## Previous integrated recovery release

The integrated StudioFlow management and Scenes recovery is deployed and
visually verified in production; owner acceptance remains pending. Source
commit `657f80e`, website application/verification commit `e83b732`, and
documentation checkpoint `bae6ce0` are recorded in the completion record.
Production Worker `7bddac9c-bda3-41c1-95d2-13aacc09cb28` is active at 100%
traffic with rollback `871c0ae7-33c5-46ae-b635-19ec3100c989`. Guarded release
preflight passed, anonymous production smoke passed 10/10, and isolated live
Firefox Developer Edition acceptance passed 64/64 with a disposable synthetic
production QA account. The live application loaded the verified bundles
`/studio/assets/index-BZ_tF0DV.js` and `/studio/assets/index-8wAEEeJ8.css`.

## Workspace

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- Last fully verified workflow baseline: `b1c21a085be679eb156c1c83277119c861068921` (application) / `8fdabf4` (source)
- Active production Worker version: `d58d7e1e-5f86-4c87-93b3-110999d200a9`
- Recorded rollback target: `4b44e41d-7fb1-43a8-b9d9-510a90672cb0`
- Local website: `http://127.0.0.1:8787/`
- StudioFlow room server: `http://127.0.0.1:8788/`
- Worker ownership: launchd-owned by `com.tpi.local-development`

## Integrated recovery checkpoint — 2026-10-25

The current repair is committed as source `657f80e` and website application
`e83b732`. It corrects the Studio lifecycle and Scenes integration
as one path: new Studios use a clean independent configuration, creation
activates the returned workspace, Studio switching is generation-guarded,
scene menus are fixed-position viewport-safe overlays, legacy Move Up/Move Down
commands are removed, and scene/panel changes emit one meaningful autosave
signal only when their serialized value changes.

The maintained integrated Firefox suite passes 21/21. TPI-027, 028, 030, 031,
033, 034, 035 (33/33), 036, 037, Addendum D, and Addendum E pass locally. The
035 run exposed and verified the fix for a denied production reservation that
left the browser lock marked active and blocked later Studio switching.
The guarded release and live acceptance are complete; the release status is
`DEPLOYED AND VISUALLY VERIFIED — OWNER ACCEPTANCE PENDING`.

## TPI-STUDIOFLOW-037 production recovery — current handoff

The live Addendum E acceptance failure was traced to menu visibility, not stale
source: `.scene-item-context-menu` was positioned at `right: -204px` and was
clipped by the Studio grid's `overflow: hidden`. The source repair is
`eff6b69`; the website application/test commit is `877efb3`; the active
production Worker is `871c0ae7-33c5-46ae-b635-19ec3100c989`; rollback is
`d58d7e1e-5f86-4c87-93b3-110999d200a9`.

The maintained Addendum E test now uses a real Firefox element click and fails
unless the menu has a non-zero, in-viewport bounding rectangle. Local and live
focused runs passed 20/20, including context-menu visibility, right-click,
rename persistence, non-destructive removal, and Intro preview stop isolation.
Live resources loaded `/studio/assets/index-BfmRc0ua.js` and
`/studio/assets/index-DB0QL1ns.css`. Owner acceptance remains pending.

## TPI-STUDIOFLOW-037 Addendum E current handoff

Addendum E is repaired, deployed, and live-verified. The
confirmed defects were durable shortcut recreation after removal, missing
shared context-menu coverage for Background Music, and preview lifecycle
state being mistaken for a production scene transition. New Studios now use
Intro Video → Scene 1 → Scene 2 → Outro Video; `Remove from Scenes` removes
only the panel shortcut; new scenes use the next available sequential name;
and deleting a saved scene layout remains confirmation-backed. Individual
Intro preview stop does not start After Intro music, while natural completion
and sequence rehearsal preserve the production handoff.

The maintained Firefox Addendum E suite passed 20/20. The source commit is
`8fdabf4` in `/Users/toddknipple/Documents/StudioFlow/web`; the website
application commit is `b1c21a085be679eb156c1c83277119c861068921`. Production
Worker `d58d7e1e-5f86-4c87-93b3-110999d200a9` is live with rollback
`4b44e41d-7fb1-43a8-b9d9-510a90672cb0`. Guarded live smoke passed 10/10 and
isolated Firefox acceptance passed 64/64. The focused Addendum E suite passed
20/20 against production with the disposable synthetic production QA account;
its workspace was archived after verification. Owner acceptance remains
pending until the owner confirms the corrected interface.

## TPI-STUDIOFLOW-037 current handoff

Addendum D is deployed and live-verified. Playable production shortcuts use
independent first-click play/second-click stop behavior through the existing
timer, Video Clips, and Background Music engines. Play Sequence is now a
visible Play Sequence/Stop Sequence rehearsal toggle with cancellation tokens
and timeout cleanup. The context menu's `Remove from Scenes` action removes a
panel shortcut without deleting its underlying asset. The focused Addendum D
regression passed 10/10. Source commit is `5186e28`, website application/test
commit is `8d46a45`, production Worker is
`3a9b090f-78b5-43d6-bb11-17a1ba54d41b`, and rollback is
`5536bcc5-8c50-4851-b6e4-4a660eb1b0fb`. Local/live isolated Firefox
acceptance passed 64/64 and production smoke passed 10/10. Owner acceptance
remains pending. See
`300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md`.

The Scenes panel redesign, Addenda A/B uniformity corrections, the reactive
drag-and-drop repair, and the Addendum C visual-consistency and drag
interaction corrections are deployed and live-verified. Source commit is
`d6b8f03`; website application commit is `8a954ad` (test commit `dd22fc5`).
The maintained Firefox suites `npm run verify:studioflow-037-scenes-panel`
(20/20) and the Addendum C acceptance suite (26/26) pass. The panel uses
uniform stable shortcut items for Intro Video, Countdown Timer, Production
Scene, Video Clip, and Outro Video with single-line labels and full-name
tooltips, per-Studio ordering, skip flags, context actions, rehearsal-only
Play Sequence, the same drag handle on every movable item, a live `Move here`
gap with surrounding rows visibly repositioning as the pointer moves, Escape
cancellation, edge auto-scroll, Background Music SmartPad color indicators,
and existing workspace autosave. Dragging does not preview media. Existing
timer, Video Clips, and Background Music engines (including After Intro
Background Music and Background Music Stop) remain authoritative; TPI-031
remains passing.

The active production Worker is `5536bcc5-8c50-4851-b6e4-4a660eb1b0fb`; the
rollback reference is `1c752f3f-8af3-461f-8082-3dd8a447fd3d`. Production smoke
passed 10/10, isolated Firefox live acceptance passed 64/64, and the Addendum
C suite passed 26/26 against the deployed interface with the synthetic
production QA account. Owner acceptance of the corrected interface is
pending.

The authoritative StudioFlow source is the separate repository:
`/Users/toddknipple/Documents/StudioFlow/web`. The website `studio/` directory
is an integrated generated copy plus maintained TPI bridge files. Use
`node scripts/stage-studioflow-authoritative.mjs` in verification-only mode to
build twice and compare the candidate before any reviewed `--apply` operation.
The complete commit/push/deploy distinction is documented in
`TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`; use it instead of inferring current
procedure from historical directive or completion records.

Preserve unrelated tracked and untracked changes. Focused commits and pushes to
`codex/tpi-development` are authorized after the applicable checks pass. Do not
reset, clean, stash, force-push, or rewrite history as a routine shortcut.

## TPI-STUDIOFLOW-036 current handoff

TPI-STUDIOFLOW-036 is deployed and live-verified. The nine approved silent
timer themes are available in the existing Video Timers section: Classic
Countdown, Stargate Portal, Alien Transmission, Haunted Clock, Spirit
Manifestation, EVP Signal, ITC Communication, Paranormal Energy Vortex, and
Ghostly Countdown. They share one countdown engine and program-output path;
the four existing durations remain 10, 20, 30, and 60 seconds.

The source revision is `37c6598` in
`/Users/toddknipple/Documents/StudioFlow/web`. The deployable website
checkpoint is `7bd8c4606660c959c6b3409b4a46a319fc11ec8a`, and production Worker
`076c9614-9251-4efd-b047-0e7033f4ad9c` is active at 100% traffic. Immediate
rollback is `aa9bff15-6252-4ae5-9422-17d63b99ab5a`.

The maintained `npm run verify:studioflow-036-video-timers` test passed 28/28.
Local and live isolated Firefox acceptance passed 64/64, production smoke
passed 10/10, and the complete guarded preflight passed. One initial disposable
API gate attempt hit a transient isolated migration startup failure; the
isolated migration was verified independently and the clean retry passed.

The implementation uses `src/videoTimerThemes.ts`, the existing React timer
engine in `src/App.tsx`, the existing workspace configuration bridge, and the
API normalizer. A startup hydration race and a stale duplicate React-owned
timer grid were corrected during validation. No separate timer player,
browser-only persistence system, audio path, or owner-data mutation was added.

- `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-036-CINEMATIC-VIDEO-TIMERS.md`
- `TPI-STUDIOFLOW-WORKSPACE-CONFIGURATION.md`
- `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`

## TPI-STUDIOFLOW-035 current handoff

The right-navigation cleanup, Teleprompter placement, and Recording & Storage
consolidation are deployed and live-verified. The maintained regression
`npm run verify:studioflow-035-recording-storage` passed 33/33 against the
local Worker in disposable Firefox with fake media devices
(`media.navigator.streams.fake`, `media.navigator.audio.fake`,
`media.navigator.permission.disabled`). It covers the three rail removals,
Teleprompter beneath Notes reusing the existing reader, the seven
consolidated sections, both Settings redirects, connected/persisted
recording settings, the confirmed save lifecycle with the actual destination
reported, destination-fallback decline (awaiting-action) and approval, and
per-studio preference isolation across real Studio switching.

Authoritative StudioFlow source commit: `60af530db1d53536975ac910b9501526c54c7600`.
The workspace bridge recording-settings save/hydrate mapping was repaired in
`studio/workspace-bridge.js` and the activation re-read in `src/App.tsx` —
see the completion record for the four documented defects and the settings
inventory.

- `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-035-RECORDING-STORAGE-CONSOLIDATION.md`
- `TPI-STUDIOFLOW-WORKSPACE-CONFIGURATION.md`

Production Worker `aa9bff15-6252-4ae5-9422-17d63b99ab5a` is active at 100%
traffic; the immediate rollback is `5c8e78b5-f920-4335-940f-a5e4d6df0e49`.
Guarded live Firefox acceptance passed 63/63 and anonymous smoke passed; the
standalone acceptance runner refuses production targets outside the guarded
release. Cloud storage destinations remain unimplemented and are presented
only as "Not connected"; implementing one requires owner direction and
registered OAuth credentials.

## Prior handoff — TPI-STUDIOFLOW-033

The configuration persistence repair is deployed and live-verified. The focused regression
`npm run verify:studioflow-033-roundtrip` passed 26/26 against the local Worker
with disposable Firefox Studios. It covers `videoClipSlots`, validated slot
positions, scalar `programOrientation`, existing Background Music fields,
stale-save rejection, Studio A/B switching, isolation, and refresh restoration.

Authoritative StudioFlow source commit: `53bf8dc` in
`/Users/toddknipple/Documents/StudioFlow/web`. The completion record and field
inventory are:

- `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-033-WORKSPACE-CONFIGURATION-PERSISTENCE.md`
- `TPI-STUDIOFLOW-WORKSPACE-CONFIGURATION.md`

Production Worker `5c8e78b5-f920-4335-940f-a5e4d6df0e49` is active at 100%
traffic. The immediate rollback is `0c0a8660-21cf-47e1-ac66-98c91b26972c`.
The live non-destructive release acceptance passed 64/64 and anonymous smoke
passed 10/10. The new 033 disposable server round-trip remains local evidence;
live acceptance did not mutate production Studio configuration.

## Latest verified production release

The latest release is TPI-STUDIOFLOW-035: application commit `d0b1f70`, source
commit `60af530`, Worker `aa9bff15-6252-4ae5-9422-17d63b99ab5a`, rollback
`5c8e78b5-f920-4335-940f-a5e4d6df0e49`. It is `DEPLOYED / LIVE VERIFIED`.
The 035 suite passed 33/33; guarded live smoke and Firefox acceptance passed
and the deployed bundle serves the new Recording & Storage and Teleprompter
panels. Full evidence is in the TPI-035 completion record.

Prior release TPI-STUDIOFLOW-033: application commit `cb38061`, Worker
`5c8e78b5-f920-4335-940f-a5e4d6df0e49`, rollback
`0c0a8660-21cf-47e1-ac66-98c91b26972c`. It is `DEPLOYED / LIVE VERIFIED`.
The configuration normalizer and hydration repair passed the focused 26/26
local round-trip; guarded live smoke and Firefox acceptance passed 10/10 and
64/64. The prior TPI-034 mutation repair remains in the deployed baseline.
Full evidence is in the TPI-033 completion record.

Deployment commit `6a1f8ad77649f1ef175a5191396d55a45141764c`
(TPI-STUDIOFLOW-032 — Background Music and Sound Effects icon replacement;
feature commit `02056c1`) was deployed to Worker `theparanormalinitiative`
as version `7029c6c5-3994-42a1-9570-d6119a5792f3` at 100% traffic on
2026-10-24. The release passed the 021 browser suite 31/31 (two
consecutive runs), 028 browser 33/33 (twice), the 030 sound-effects suite
25/25 (twice), the 031 music-pad suite 34/34 (twice), 021 static
contracts 86/86, 020 playback 14/14, 020 video clips 13/13, 027 contracts
12/12, 031 overlays 12/12, release safety 17/17, the complete local auth
lifecycle (isolated Firefox 64/64), complete preflight, the guarded
Wrangler dry-run, and the guarded live acceptance against production
64/64 (`DEPLOYED_AND_VERIFIED`). Both pad artwork files were verified
serving byte-identical on production. Crossroads, D1, R2, and owner
browser storage were not modified. The current approved StudioFlow playback
contract and regression history are in `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`.

## Latest StudioFlow repair

The deployed change is documented in
`300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-035-RECORDING-STORAGE-CONSOLIDATION.md`.
The API now preserves Video Clips assignments, validated slot positions, and
scalar program orientation through server round-trips and Studio activation.
The focused disposable API/Firefox regression passed 26/26. The prior
TPI-032 pad-artwork behavior remains in the deployed baseline.
The audio pads now show the owner-approved per-category artwork inside the
unchanged circular icon container — Waveform on Background Music pads,
Microphone on Sound Effects pads (`studio/Waveform.png` and
`studio/Microphone.png`, byte-identical to the owner's Desktop originals,
which were left untouched). The artwork is proportion-preserving and
pointer-transparent; pad layout, playback, drag-and-drop, context menus,
and the TPI-030/031 interfaces are unchanged. The 021 browser suite's
obsolete home-screen entry was repaired (each run seeds a fresh
browser-local recording broadcast — the same empty-state studio the home
"Record without going live" flow creates — with all assertions unchanged),
which also ends the disposable test-account studio pollution recorded as
TPI-030 finding 3. The TPI-033 normalizer gaps are resolved, and the TPI-034
bridge mutation storm repair remains in the deployed baseline. The 028 scene playback
workflow
(`300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md`,
including its Addendum A section), the TPI-030 Sound Effects work
(`300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-030-SOUND-EFFECTS-PAD-REORDERING.md`),
and the TPI-031 Background Music work
(`300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-031-BACKGROUND-MUSIC-PAD-REORDERING.md`)
remain untouched in the deployed baseline.
Use the disposable Firefox acceptance profile for future checks; do not use
the owner profile for destructive testing.

The automated production acceptance gate must use the disposable Firefox
window titled `TPI ISOLATED LIVE ACCEPTANCE — SIGN IN HERE`. After that gate
passes, StudioFlow's final user-facing acceptance target is the authenticated
live production page. When the owner has authorized live verification, the
existing production tab may be used non-destructively to confirm the exact
visible behavior; do not alter stored studios, media, recordings, or settings.

## Current browser workflow

- Firefox Developer Edition is the default browser for local and production
  TPI acceptance.
- StudioFlow completion is judged against the live production site. Local
  checks remain safety gates but are not substitutes for live acceptance.
- Automated acceptance uses isolated disposable profiles and never closes or
  repurposes the owner's existing local or production tabs.
- Chromium is used only for an explicit compatibility requirement.

The latest retained browser evidence is 278 PASS, 6 expected limitations, 0
FAIL across 284 routes, with 54/54 focused checks passing and zero external
requests. Synthetic local roles are `local_admin`, `local_member`, and
`local_contributor`; credentials must never be printed or copied into reports.

## Recent verified changes

- OPS-018 changed shared fragment URLs in `includes.js` to root-relative paths
  and restaged local assets; the Worker was not restarted.
- The existing browser harness is `scripts/e2e/tpi-ops-016-browser.mjs`.
- Repository-scoped Playwright tooling uses the locally available package and
  installed Chrome without a browser download.
- OPS-019 policy and result records document Codex/FreeBuff/Opera boundaries.

## Last successful checks

- OPS-002 traffic protection: 11/11
- OPS-007 local foundation: 10/10
- OPS-009 authentication: 27/27
- OPS-011 member home: 37/37
- OPS-012 StudioFlow/ParaTube: 26/26
- OPS-014 local service: 20/20
- OPS-015 admin/API QA: 62/62
- `node --check includes.js`: passed
- `node --check scripts/e2e/tpi-ops-016-browser.mjs`: passed
- `git diff --check`: passed

## Safe continuation

Open the affected route in an isolated Firefox Developer Edition profile,
inspect console and local request activity, and run the smallest applicable
test followed by the required regressions. Agents may control the maintained
LaunchAgent services, commit, push, and deploy through `scripts/tpi-release.mjs`
when required. Do not interrupt unrelated services, expose credentials, or use
owner Studios for destructive testing.

No credentials, tokens, private payloads, or secrets are included in this
handoff.

## Documentation synchronization

Every completed TPI directive must update the affected Markdown records before
its status is marked complete. Record changed source files, executed evidence,
known limitations, development status, and the directive-index entry. Do not
describe a feature as production-ready from local tests alone.
