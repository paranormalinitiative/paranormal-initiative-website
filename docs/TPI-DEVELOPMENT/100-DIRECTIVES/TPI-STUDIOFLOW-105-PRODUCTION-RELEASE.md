# TPI-STUDIOFLOW-105 — Final production integration, deployment and live verification

Date: 2026-10-26. **Result: BLOCKED. Production: NOT DEPLOYED. Owner acceptance: PENDING.**

## Authorization and outcome

The owner authorized preservation, committing Directive 104 evidence, safe integration and push of the exact Directive 103 candidate, full guarded preflight, and production deployment only if all mandatory safeguards pass. The owner explicitly required stopping before deployment on a mandatory gate failure. No destructive production data operations, DNS changes, unrelated development or permanent deletion enablement were authorized.

Directive 104 acceptance evidence was reviewed and committed. The candidate and acceptance commit were fast-forward integrated into the authorized branch and pushed without force. The first mandatory authentication-lifecycle command failed before testing. The release sequence stopped; no production deployment command, production storage operation or live acceptance was run.

## Traceability

- StudioFlow source: `6b9c3c4b6b40f0496012e5d718d32d75e149dcf6`.
- Approved website application candidate: `81a234a2ce91844a1a9ad33be524282dbb7d2874`.
- Directive 104 evidence commit / website release commit: `20eba92d2dce2a1db985bc352bedbbe174139d8f`.
- Authorized release branch: `codex/tpi-development`.
- Release worktree: `.local-dev/worktrees/website-105` under the original website checkout.
- Original remote: `6c48b45f0a65b21ef468a2a58a36a478792c0089`; fetched and checked again immediately before push.
- Push: non-forced fast-forward to `20eba92d2dce2a1db985bc352bedbbe174139d8f`; local HEAD, origin tracking ref and live `ls-remote` matched afterward.
- This record is a subsequent documentation-only commit; no application code or asset replacement.

## Original development preserved

Recorded original website, original StudioFlow source, existing 091 worktree and source-103 worktree branches/HEADs/statuses and SHA-256 fingerprints of modified and untracked files before integration. Evidence is ignored at `.local-dev/directive-105/original-state.json` in the original website checkout. File hashes, HEADs and statuses were compared after integration and remained unchanged.

To free the authorized branch without altering dirty files, renamed the original website checkout's local branch from `codex/tpi-development` to `codex/studioflow-105-preserved-development`. That branch remains at `6c48b45`; its modified/untracked files were not staged, committed, reset, stashed, cleaned or overwritten. A clean worktree checked out `codex/tpi-development` and fast-forwarded to the acceptance commit. No existing source worktree was modified.

## Verification before push

- Exact application comparison against `81a234a`: PASS for `studio/`, `functions/`, `worker.js` and production `wrangler.toml`.
- Release safety contract: PASS 21/21.
- Directive 103 UI/bridge/server rejection and asset integration gates: PASS; both permanent deletion modes fail closed, foreign Origin rejected, no storage mutation invoked.
- Directive 093 underlying purge-safety regression: PASS (immutable scope, legacy scope rejection, R2 cleanup failure and retry).
- Asset hashes and entry-point references: PASS.
- No website files removed relative to origin baseline: PASS.
- Release tree before push: clean; ancestry/fast-forward and live origin state: PASS.
- Directive 104 credentials excluded from reviewed commit files; disposable state, browser profiles and recordings not committed.
- Existing 104 acceptance remains applicable to unchanged application: lifecycle 29/29, 035 33/33, 087 40/40, 088 31/31, 089 32/32, authenticated Worker 23/23 and authenticated Video Setup 9/9. These were not rerun or represented as new 105 passes.
- Teleprompter 092 remains excluded through application parity with the approved candidate.

| Artifact | SHA-256 |
| --- | --- |
| `studio/assets/index-D1h4nSZd.js` | `4eed57a4f243c9474fb73957d9e567defb2bb43ef3bcc82c1749ba02fcf92557` |
| `studio/assets/index-CcFjA_0p.css` | `8501862945034d73a08df30e81291891491536edd82f16e0074b98a933e4cf69` |
| `studio/index.html` | `08ba5857dc352c6642430a90f2cd773d69091bfd7bc76a31c8b2d5f5d5ef2a4f` |

## Mandatory gate failure — release stopped

Ran from the isolated authorized release worktree:

```sh
npm run verify:local-auth-lifecycle
```

Exit status **1**:

```text
TPI release workflow failed: protected local credential file is missing or not mode 0600
```

The new release worktree has no `.local-dev/local-auth-credentials.json` or established local authentication state. Its ignored state is independent of the existing Directive 104 acceptance worktree. The guard correctly rejected it before login, restart or source build. Log: `.local-dev/release-105/auth-lifecycle.log` inside website-105. No credentials were copied or invented, no guard changed, and no test skipped.

**Full `release:preflight`: NOT RUN after mandatory lifecycle failure. Guarded release: NOT READY.** Cloudflare deployment/rollback readiness and the guarded production dry-run are not verified by the passing static contract. `release:production` was not invoked. No Worker deployment ID or deployment timestamp exists for this directive. Live URL remains `https://paranormalinitiative.com/studio/`; no claim that it serves this candidate.

## Remaining release preparation

Before a later guarded attempt, safely establish the maintained protected local authentication environment for the isolated release checkout, without substituting a different running checkout or modifying owner credentials. Review the service ownership checks: the maintained LaunchAgent is tied to its checkout and cannot be assumed to serve the isolated candidate. Authoritative staging still points to the original mixed StudioFlow source; it must verify the exact clean source commit rather than build unfinished development. No ignored rewritten release script or direct Wrangler deployment is an acceptable bypass.

Recommended next action: repair isolated release authentication/service/source provenance preparation, then rerun the maintained authentication lifecycle and full preflight. Production remains conditional on every mandatory gate passing. Production verification must remain non-destructive; no production Studios may be created or deleted under this directive.

Status: IMPLEMENTED / SOURCE INTEGRATED / AUTOMATED TESTED locally (104); **not fully RELEASE VERIFIED, not DEPLOYED, not OWNER ACCEPTED**. Physical-device verification remains pending owner acceptance.
