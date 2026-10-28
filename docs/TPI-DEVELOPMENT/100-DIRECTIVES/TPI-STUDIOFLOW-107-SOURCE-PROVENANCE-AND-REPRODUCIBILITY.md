# TPI-STUDIOFLOW-107 — Correct Authoritative Source Provenance and Release Reproducibility

Directive: TPI-STUDIOFLOW-107
Type: Development Infrastructure and Release Safety
Priority: HIGH
Production Deployment: NOT AUTHORIZED — nothing was deployed
Result: **COMPLETE**

## Objective

Correct the StudioFlow source-to-production workflow so every release build and
verification check uses the exact authorized StudioFlow source commit instead of
the original mixed development checkout identified as a gap in Directive 106.

## Authoritative baseline (unchanged)

- Live production: `https://paranormalinitiative.com/studio/` on Worker
  `91a8460e-1db1-440c-9643-a85b6e178fba`
- Website application release commit `9b3f033`; approved source commit
  `6b9c3c4b6b40f0496012e5d718d32d75e149dcf6`
- Known-good assets: `index-D1h4nSZd.js` SHA-256 `4eed57a4…`,
  `index-CcFjA_0p.css` SHA-256 `850186…`

The deployed application, `studio/` asset bytes, and the recorded Directive 106
deployment baseline were not modified. The mixed development checkout
`/Users/toddknipple/Documents/StudioFlow/web` (unfinished Video Setup 091,
Teleprompter 092 and deletion work) was not reset, cleaned or switched.

## Established defect

`scripts/stage-studioflow-authoritative.mjs` compiled the hardcoded development
folder `/Users/toddknipple/Documents/StudioFlow/web` working tree, which contains
uncommitted development. The deployed release was instead built from the
isolated verified commit `6b9c3c4`, so the maintained workflow could silently
build or validate against the wrong source.

## Implementation

1. **Recorded source identity.** `scripts/studioflow-release-baseline.json`
   records the approved source repository, the exact approved source commit, and
   the known-good production asset hashes. Updating that file through the
   release procedure is the auditable authorization step for a future source
   release.
2. **Explicit, validated identity.** The staging workflow accepts explicit
   `--source-repo`, `--source-commit` and `--source-worktree` statements and
   cross-checks each against the recorded baseline. It builds exactly the
   approved commit.
3. **Builds never read a working tree.** Build inputs are the tracked files of
   the approved commit, taken from a disposable detached git worktree created at
   that commit, or from a provided worktree proven clean and pinned at that
   commit. The developer's checkout is never modified.
4. **Rejections before any build.** Unauthorized source paths, non-git or
   marker-less source trees, missing commits, unexpected commits, foreign
   worktrees, worktrees not at the approved commit, dirty worktrees, and
   unauthorized baseline/staging surfaces are all rejected with explicit errors.
   There are no bypass flags; unknown arguments are refused.
5. **Reproducible builds.** The approved source is built twice in clean
   conditions and both artifact trees must be byte-identical.
6. **Known-good comparison.** The generated JavaScript and CSS names and
   SHA-256 hashes are compared against the recorded Directive 106 baseline; any
   difference is reported exactly and never repaired by editing application code.
7. **Verify-only safety.** The default `--verify-only` mode rebuilds the
   approved source and compares it against the staged website assets
   (`studio/`), the maintained bridge layer and the merged entry point, and
   never writes. `--apply` remains the single explicit staging request and
   re-verifies the staged result afterwards.
8. **Preserved guards.** Maintained bridge tags, the theme bridge, the
   `check-request-budget.mjs` gate, the obsolete-bundle checks and all existing
   release-script contracts are preserved. `scripts/tpi-release.mjs` preflight
   invokes the workflow with no arguments, which is now verify-only against the
   recorded baseline.

## Verification

- Real run against the approved baseline: `VERIFIED`, disposable clean worktree
  at `6b9c3c4`, dependencies installed with `npm ci` from the commit's own
  lockfile, two builds identical, output matches the known-good hashes
  (`4eed57a4…` / `850186…`), staged `studio/` matches the approved build output
  byte-for-byte (29 files, 0 mismatches), nothing written.
- Both dependency paths reproduce the known-good hashes: a hermetic `npm ci`
  from the approved lockfile and the existing `source-103` worktree dependency
  tree. The stale `dist/` in `source-103` (`index-DWZsfaec.js`) is a transient
  intermediate build and is not used by any workflow.
- `npm run verify:studioflow-107-provenance`: **20/20 PASS** (Directive 107's
  twelve required cases with disposable fixtures and the real baseline):
  approved clean commit PASS; dirty worktree REJECT; incorrect commit REJECT;
  missing commit REJECT; unauthorized source path REJECT; mixed development
  tree REJECT (both as a worktree and as a requested build source); verify-only
  leaves staged assets unchanged (fixture and real `studio/`); apply requires
  the approved identity; two clean builds identical; known-good assets
  reproduced; tampered staged assets detected and recovery after restore;
  existing release guards intact.
- Existing guards re-run and passing: `verify:release-safety` (21 checks) and
  `scripts/verify/tpi-studioflow-055-source-reconciliation.mjs`.
- The exact preflight call site (`node scripts/stage-studioflow-authoritative.mjs`)
  succeeds as verify-only.

## Status

- IMPLEMENTED: source-provenance workflow corrected.
- AUTOMATED TESTED: 20/20 focused regression; existing release guards pass.
- RELEASE VERIFIED: not applicable — tooling-only change, no release.
- DEPLOYED: **no**. Nothing was deployed; no production bytes changed.
- OWNER ACCEPTED: pending.

## Remaining items

- The next source release must record its new approved commit and asset hashes
  in `scripts/studioflow-release-baseline.json` as part of its release commit.
- Physical-device and owner acceptance of the live Video Setup 091 interface
  remain pending (unchanged from Directive 106).
