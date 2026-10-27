# TPI-STUDIOFLOW-104 — Complete release acceptance and production readiness

Date: 2026-10-26. Result: **BLOCKED — acceptance passed; guarded release preparation incomplete**.
Production deployment: **NOT DEPLOYED**. No push or merge. Owner acceptance: **NOT RECORDED**.

## Scope and candidate

Verify the exact Directive 103 Video Setup candidate with disposable authentication, complete authenticated lifecycle/035/087/088/089 acceptance, verify local Worker integration and artifact integrity, and stop at unauthorized release-administration gates. Both permanent deletion modes must remain unavailable at UI, React, bridge and authenticated purge route. Preserve original development; exclude unfinished 092. This record does not authorize production deployment.

- StudioFlow branch: `codex/studioflow-103-video-setup-release`.
- StudioFlow source: `6b9c3c4b6b40f0496012e5d718d32d75e149dcf6` (unchanged).
- Website application candidate: `81a234a2ce91844a1a9ad33be524282dbb7d2874` (unchanged).
- Acceptance worktree: `.local-dev/worktrees/website-104` under the original website checkout.
- Acceptance branch: `codex/studioflow-104-release-acceptance`.
- Acceptance test/documentation changes are uncommitted; no new application candidate or asset substitution.
- Status: IMPLEMENTED / SOURCE INTEGRATED / AUTOMATED TESTED locally; **not fully RELEASE VERIFIED**, DEPLOYED or OWNER ACCEPTED.

## Disposable authentication and isolation

Used maintained `scripts/local-auth-fixtures.mjs --local-only`, local schema tooling and isolated worktree-local D1/R2 state. The synthetic `test_admin` and `local_admin` accounts were generated locally; these are not owner or production accounts. Credentials remain ignored in `.local-dev/local-auth-credentials.json`, never included in evidence. No authentication or authorization bypass was introduced.

Local Worker: `http://127.0.0.1:5194`, local-only config, outbound disabled, dummy local database ID, disposable local bucket. No production deletion endpoint was contacted. Browser suites used isolated headless Firefox Developer Edition profiles with synthetic capture devices. Disposable fixtures remain in the ignored local state; successful purge was deliberately not used to clean them up.

## Acceptance results

| Suite | Result |
| --- | --- |
| Studio lifecycle | PASS 29/29 |
| Directive 035 | PASS 33/33 |
| Directive 087 | PASS 40/40 |
| Directive 088 release behavior | PASS 31/31 |
| Directive 089 release behavior | PASS 32/32 |
| Authenticated Video Setup 091 | PASS 9/9 |
| Direct authenticated Worker integration | PASS 23/23 |
| Release safety static contract | PASS 21/21 |
| Wrangler local-config Worker dry-run | PASS; not the guarded production dry-run |
| Full maintained release preflight | BLOCKED, exit 1: `release branch must be codex/tpi-development` |

[Persisted acceptance checks and hashes](../300-COMPLETED-WORK/evidence/2026-10-26-studioflow-104-local-acceptance.json).
Raw local logs: `.local-dev/acceptance/` in the acceptance worktree. Logs are not production evidence.

Lifecycle/087 exercise creation, persistence, direct Studio switching, isolation, rename/archive/restore and existing-data preservation. 035 verifies recording/storage behavior. 089 preserves local metadata, IndexedDB recording blobs and uploaded media across rejected deletion attempts and refresh. Direct Worker checks verify signed-out 401, incorrect-password rejection, two-account ownership boundaries, foreign-Origin 403, logout, both old-client purge requests rejected with 503, unchanged workspace records, exact served assets and worklets under `/studio/`.

### Intentional deletion-test exclusions

The application already disables both permanent deletion modes under Directive 103. 088 successful-deletion scenarios 3–8 and 089 successful-deletion/scope-convergence/destructive-failure scenarios 2–8/11 do not describe this release. They were replaced with explicit UI, bridge, server and data-preservation rejection assertions; they are **not reported as successful destructive-deletion tests**. Underlying 093 regression remains the separate Directive 103 evidence; no server code changed here.

Test harness changes: headless Firefox for the existing suites; authenticated loopback path in 091; disabled-mode 088/089 expectations; `process.exitCode` in 088/089 so browser cleanup runs. A new local-only Worker acceptance script records direct integration checks. Upload fixtures correctly expect HTTP 201; preservation comparisons use the list endpoint because fetching an individual workspace updates `lastOpenedAt`. No product changes were needed. Initial harness failures were corrected and affected suites rerun successfully. Original development checkouts and existing 091/deletion/source-103 worktrees were not edited for this acceptance work.

## Exact artifact integrity

| Artifact | SHA-256 |
| --- | --- |
| `studio/assets/index-D1h4nSZd.js` | `4eed57a4f243c9474fb73957d9e567defb2bb43ef3bcc82c1749ba02fcf92557` |
| `studio/assets/index-CcFjA_0p.css` | `8501862945034d73a08df30e81291891491536edd82f16e0074b98a933e4cf69` |
| `studio/index.html` | `08ba5857dc352c6642430a90f2cd773d69091bfd7bc76a31c8b2d5f5d5ef2a4f` |

Tracked application files match Directive 103. Served JS/CSS hashes and MIME types match. Served HTML equals that entry point after the maintained staging cache-version queries and the exact local request-guard/theme wrappers; it is not falsely claimed byte-identical to tracked HTML. No new Teleprompter 092 or unrelated website changes entered the application. The source build, reproducibility, Voice FX architecture, 101 (22/22), 102 (8/8) and 093 results from Directive 103 remain applicable to unchanged code and were not rerun unnecessarily.

## Authorized branch preparation and remaining gates

Observed local `codex/tpi-development` and origin tracking reference both at `6c48b45f0a65b21ef468a2a58a36a478792c0089`; candidate is a descendant. This establishes a possible fast-forward, not a completed integration or candidate/origin parity. The original release checkout is dirty with other development; none was discarded, staged or committed here.

`npm run release:preflight` stops at the branch check. The 21/21 static release contract and local Wrangler dry-run do **not** replace the guarded workflow. Mandatory auth lifecycle, complete isolated QA/API E2E, authorized-branch acceptance, authoritative staging, Cloudflare account/rollback checks and guarded production dry-run have not passed for this release through that workflow.

Required next authorization/administration:

1. Review and explicitly authorize release-branch integration and push. Reconcile original dirty website development without discarding owner work; review/commit only intended acceptance changes.
2. Reconcile the authoritative StudioFlow source with the exact clean source candidate before the maintained staging/auth lifecycle. The maintained staging script points at the original source checkout; do not rebuild mixed development or substitute an ignored execution copy as a release bypass.
3. Establish clean `codex/tpi-development` at the reviewed candidate and exact origin parity, then run `npm run verify:local-auth-lifecycle` and `npm run release:preflight` without weakening any guard.
4. Only after READY, request explicit production deployment authorization. This directive does not authorize deployment.

Manual limitations: synthetic devices do not verify physical camera alternatives, hardware microphone level support, speaker sink selection or audible output. No live production/owner acceptance occurred. Both permanent deletion modes remain unavailable; Studio-only is not silently relabeled as Archive. Older clients cannot bypass the server purge gate, but arbitrary storage actions in already-loaded legacy client code are not controlled by that server gate.

Recommended next action: authorize safe release-branch reconciliation/integration and push only, then complete the maintained preflight before considering deployment authorization.
