# TPI-STUDIOFLOW-100 — Deletion Source Isolation

Status: **SOURCE ISOLATED**. Implementation completion, safety verification, deployment, and owner acceptance are **not** asserted.

## Execution record

- Source baseline: `9f85f9d324e79373d7548b401658ec1be1d89c3c`.
- Website baseline: `6c48b45f0a65b21ef468a2a58a36a478792c0089`.
- Source branch: `codex/studioflow-100-deletion-isolation`.
- Source commit: `8b72de811cf1623ac7d6caa5642a43e418d69924`.
- Website branch: `codex/studioflow-100-deletion-server`. Its commit is the commit containing this record; resolve with `git log -1 --format=%H -- docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-STUDIOFLOW-100-DELETION-ISOLATION.md`.
- Worktrees: `.local-dev/worktrees/source-100` and `.local-dev/worktrees/website-100` inside the original website checkout.
- Original source and website trees preserved: initial status and SHA-256 fingerprints of every modified/untracked file were recorded under the original website's ignored `.local-dev/directive-100/original-state.json` and compared after extraction.

### Extraction

Eight reviewed `src/App.tsx` hunks restore the bridge typing, two-mode handler, local cleanup, callback, inventory/types, typed confirmation and bounded digest-guarded retries. No CSS changes were deletion-specific. SetupView, TeleprompterView, StudioTeleprompterModal, TeleprompterScript and CSS were checked for exact equality with source baseline. Host Voice FX retains its baseline setup-or-Studio initialization. No 091 or 092 code was extracted.

Website extraction contains only the reviewed purge-handler/cleanup diff in `functions/api/[[path]].js`, existing 088/089 test-harness updates, and the existing 093 VM regression. Existing ownership guards remain in the baseline. Server changes pin scope, reject legacy unscoped retries, propagate cleanup failures, verify R2 removal before deleting metadata, and paginate/verify snapshot cleanup. No generated website assets were changed or staged; these are paired source/server development branches, not an integrated release package.

### Verification

- Fresh source `npm ci`: passed; lockfile unchanged.
- TypeScript `tsc --noEmit`: passed.
- Production `npm run build`: passed; existing bundle-size warning only.
- Source isolation assertions: passed (091/092 functions, types, CSS unchanged; both deletion modes and inventory present).
- 093 purge-safety VM regression: passed (immutable scope, legacy rejection, failed R2 cleanup and retry). This mocks storage and authorization helpers, not a complete Worker integration test.
- API and 088/089 test script syntax checks: passed.
- 088 browser suite: attempted, BLOCKED before launch: `QA account test_admin is unavailable` in isolated website worktree.
- 089 browser suite: attempted, same BLOCKED result. Neither suite was redirected to owner data or production.
- Diff whitespace checks: passed.

Build artifacts (not committed):

| Asset | SHA-256 |
| --- | --- |
| `index-DyFsZeOP.js` | `157d2f711105a5bb8ee1285497d1df25d4915986025a2643fa93d498e1e2be56` |
| `index-Bs-R9tef.css` | `94679ff576c2e34b1bb666a99bd83dd86f08bea6c1d05ddb8fb1e9a1d9876338` |

### Corrections to earlier diagnoses and remaining defects

The browser bridge already constructs `localBlobKeys` and `sharedBlobKeys` in `studioDeletionInventory`, then merges server inventory. They are not supposed to originate in the server API. Previous 096–099 reports attributing an empty-list contract to missing server fields overlooked this layer. Blob lists are passed to the React handler; only mode and expectedVersion are passed to `deleteStudioByKey`. This isolation preserves the existing contract, without asserting full safety.

Remaining work includes awaited local cleanup and truthful failure reporting (existing client deletes are fire-and-forget with swallowed errors), malformed/ambiguous/shared-reference coverage, fresh reference checks and multi-tab coordination, dialog overflow/accessibility, active-production and partial-failure reconciliation acceptance. Timestamp-derived recording IDs do not prove uniqueness or exclusive ownership; previous claims of guaranteed one-to-one ownership were not sufficient. No change to browser-local recording architecture is needed or requested here.

Next: seed disposable D1/R2 and synthetic QA credentials in the isolated website worktree, stage the exact isolated source using the maintained bridge-preserving process, and run 088/089. Complete browser-local cleanup safety under a subsequent directive. Do not push, merge, deploy, or label this production-safe.

## Owner directive — verbatim

THE PARANORMAL INITIATIVE

STUDIOFLOW DEVELOPMENT DIRECTIVE 100

ISOLATE STUDIO DELETION DEVELOPMENT FROM TELEPROMPTER 092

Assigned Agent: Sol
Date: October 26, 2026
Directive: TPI-STUDIOFLOW-100
Type: Source Isolation and Implementation
Priority: HIGH
Production Deployment: NOT AUTHORIZED

⸻

1. OBJECTIVE

Extract the existing Studio deletion implementation from the mixed, uncommitted StudioFlow development source and establish a clean, independently buildable deletion development branch.

The resulting branch must contain the relevant 088/089/093 deletion work without incorporating unfinished Teleprompter 092 or Video Setup 091 changes.

ONE DIRECTIVE. ONE OBJECTIVE. ONE MEASURABLE RESULT.

Required Result

A clean, isolated Studio deletion source branch that can be developed and tested independently.

This directive does not require completing the deletion architecture or authorizing its production release.

⸻

2. AUTHORITATIVE LOCATIONS

StudioFlow source:

/Users/toddknipple/Documents/StudioFlow/web

Website repository:

/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

Existing Video Setup 091 candidate:

/Users/toddknipple/Documents/StudioFlow/web-091

Known StudioFlow committed baseline:

9f85f9d

Existing 091 commit:

649dd26

Known website baseline:

6c48b45

Follow:

docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md

Consult the authoritative directive register and Directives 088–099.

Do not assume the historical commit identifiers still represent the current HEAD without checking.

⸻

3. ESTABLISHED FINDINGS

Previous directives established:

1. The existing Studio deletion implementation is mixed into uncommitted src/App.tsx changes.
2. The same file contains unfinished Teleprompter 092 development.
3. Some changes also overlap with Video Setup 091.
4. The website’s committed bundle contains two-mode deletion functionality that cannot be reproduced directly from the committed StudioFlow source.
5. The existing uncommitted server changes contain important deletion safety repairs.
6. Browser-local recordings use library metadata containing studioId and recordingBlobKey.
7. Browser-local recording metadata is persisted in localStorage, while recording blobs are stored in IndexedDB.
8. Server-managed uploaded media uses Cloudflare R2 and server-side ownership records.

Approved Architectural Decision

Recordings will remain browser-local.

The owner has already approved this direction.

Do not request another decision about moving recordings to server storage.

Do not introduce a new recording ownership database or redesign the recording system.

⸻

4. REQUIRED WORK

A. Preserve Existing Development

Before making changes:

* Record the current Git branch and HEAD of both repositories.
* Record all modified and untracked files.
* Identify the existing deletion, Teleprompter, and Video Setup changes.
* Preserve the original working trees exactly as found.

Do not use destructive Git operations against the original working trees.

Specifically, do not run destructive resets, cleans, or checkout operations that discard uncommitted work.

Do not overwrite existing development files.

B. Create an Isolated Deletion Worktree

Create a dedicated StudioFlow Git worktree and branch.

Suggested branch:

codex/studioflow-100-deletion-isolation

Base it on the appropriate verified committed StudioFlow baseline.

The new worktree must be independent of the original development checkout.

Do not modify the existing 091 worktree.

C. Extract Existing Deletion Changes

Review the original uncommitted source.

Extract only changes required for the existing Studio deletion implementation, including applicable:

* Studio deletion dialog.
* Two-mode deletion selection.
* Typed-name confirmation.
* Deletion inventory integration.
* Studio deletion handlers.
* Studio management integration.
* Browser-local recording cleanup.
* Relevant deletion state and imports.
* Necessary deletion-related styling.
* Existing deletion safety guards.

You are explicitly authorized to separate mixed React hunks manually.

Do not treat overlapping hunks as an automatic blocker.

Where deletion and Teleprompter code share a hunk, reconstruct the deletion-only change in the isolated worktree.

Use the original source as a reference without modifying it.

Preserve existing behavior wherever possible.

Do not introduce speculative functionality.

D. Exclude Unrelated Development

The isolated deletion branch must not include:

* Teleprompter overlay functionality.
* Teleprompter script presentation changes.
* Video Setup 091 improvements.
* Unrelated Studio UI redesigns.
* Unrelated application refactoring.

If a shared utility is required by deletion functionality, extract only the minimum necessary dependency.

Document any unavoidable shared dependency.

E. Include Existing Server-Side Safety Repairs

In a separate isolated website worktree, extract the existing deletion-related server repairs associated with 088/089/093.

Include applicable:

* Deletion-scope pinning.
* Unsafe retry rejection.
* Accurate cleanup failure propagation.
* R2 cleanup verification.
* Paginated snapshot cleanup.
* Existing Studio ownership safeguards.

Do not copy the entire dirty server file without reviewing unrelated changes.

Do not alter unrelated website endpoints.

Do not deploy.

F. Verify Source Isolation

Run:

* TypeScript validation.
* StudioFlow production build.
* Existing applicable deletion tests.
* Directive 093 purge-safety regression.

Verify that the isolated source:

1. Builds successfully.
2. Contains the existing deletion interface.
3. Preserves the two deletion modes.
4. Excludes Teleprompter 092.
5. Excludes Video Setup 091.
6. Contains the intended server safety repairs.
7. Does not require uncommitted files from the original working trees.

This directive verifies source isolation, not complete deletion safety.

Any remaining deletion contract or browser-local cleanup defects must be documented for subsequent implementation.

Do not declare deletion production-safe merely because the build passes.

⸻

5. COMMIT THE ISOLATED WORK

Once the source isolation is verified:

Create a commit on the isolated StudioFlow branch.

Create a corresponding commit on the isolated website branch containing the server-side deletion changes.

These commits must contain only the intended isolated changes.

Record:

* Branch names.
* Commit hashes.
* Files changed.
* Build results.
* Test results.
* Known remaining deletion defects.

Do not commit the original development working trees.

Do not push or merge.

⸻

6. STOP CONDITIONS

Stop only when a genuine technical or safety blocker prevents safe isolation.

Examples:

* Required source is missing.
* An essential dependency cannot be reconstructed reliably.
* Isolation would require modifying or destroying original development.
* A required change cannot be distinguished from unrelated functionality after focused examination.

Mixed hunks alone are not a stop condition.

The previously approved browser-local recording architecture is not a stop condition.

The existence of unfinished deletion behavior is not a stop condition for source isolation.

If the isolated code builds but deletion safety remains incomplete, record those defects and complete the isolation assignment.

Do not represent the isolated branch as production-ready.

⸻

7. COMPLETION CRITERIA

Directive 100 is COMPLETE when:

1. A clean StudioFlow deletion branch exists.
2. A corresponding isolated website server branch exists.
3. Existing deletion code has been extracted.
4. Teleprompter 092 changes are excluded.
5. Video Setup 091 changes are excluded.
6. TypeScript validation passes.
7. The StudioFlow production build passes.
8. Applicable isolation and safety regression tests have been run and their results recorded.
9. Isolated source commits exist.
10. Original development trees remain preserved.
11. No production deployment has occurred.

A failing deletion behavior test does not automatically invalidate successful source isolation, provided the failure is documented and the isolated implementation remains independently buildable.

⸻

8. DOCUMENTATION

Record Directive 100 in the authoritative directive register.

Update:

* Directive index.
* Current development status.
* Agent handoff documentation.

Do not create duplicate master records.

Clearly distinguish:

SOURCE ISOLATED

IMPLEMENTATION COMPLETE

SAFETY VERIFIED

DEPLOYED

OWNER ACCEPTED

For this directive, the expected result is SOURCE ISOLATED.

⸻

9. FINAL REPORT

Provide:

Directive: TPI-STUDIOFLOW-100
Result: COMPLETE / BLOCKED
StudioFlow Branch:
StudioFlow Commit:
Website Branch:
Website Commit:
Files Extracted:
TypeScript: PASS / FAIL
Production Build: PASS / FAIL
093 Safety Regression: PASS / FAIL
Other Tests:
Teleprompter 092 Excluded: YES / NO
Video Setup 091 Excluded: YES / NO
Original Development Preserved: YES / NO
Known Deletion Defects:
Production Deployment: NOT DEPLOYED
Recommended Next Action:

⸻

FINAL INSTRUCTION

This assignment is about separating existing development work, not redesigning StudioFlow.

The owner has already approved retaining browser-local recordings.

You are authorized to manually reconstruct deletion-only changes from mixed source hunks in isolated worktrees.

Do not repeatedly stop because deletion and Teleprompter changes share a file.

Preserve the original development work.

Produce clean, independently buildable deletion branches.

DO NOT DEPLOY.

ONE DIRECTIVE. ONE OBJECTIVE. ONE MEASURABLE RESULT.
