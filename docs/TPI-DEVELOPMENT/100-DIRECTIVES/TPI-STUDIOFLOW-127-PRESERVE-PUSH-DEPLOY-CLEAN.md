# TPI-STUDIOFLOW-127 — Preserve, Push, Deploy, and Clean Worktrees

Date: 2026-10-31  
Status: **COMPLETE — PRESERVED, PUSHED, DEPLOYED, AND CLEAN**

## Result

The verified StudioFlow candidate was preserved, staged from the approved
source worktree, pushed through the canonical website branch, deployed with the
guarded production workflow, and accepted in isolated Firefox. The canonical
release worktrees are clean. Unrelated historical and mixed-checkout worktrees
were not reset, cleaned, deleted, or overwritten; they remain preserved and are
listed below as intentional exceptions.

## Preservation inventory

### Canonical release locations

| Location | Branch | Original/final HEAD | State |
| --- | --- | --- | --- |
| `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website` | `codex/tpi-development` | `a648f0b6a2744af489e0a9357952ac6dd9de6de5` | Clean; exact `origin/codex/tpi-development` parity before documentation commit |
| `/Users/toddknipple/Documents/StudioFlow/web-122` | `codex/studioflow-122-notes` | `ded5a3d73c5838d56f3c5e1cb0a32534acdab44f` | Clean; no configured remote |

The website release branch contained the completed 122H export/local-folder
candidate and the 122H.2 partial-verification record. The StudioFlow source
worktree was clean and was rebuilt by the provenance-checked staging workflow.
The source repository has no configured Git remote, so the source branch could
not be pushed independently without inventing an unauthorized remote. Its exact
commit is preserved locally and its generated candidate is integrated in the
pushed website release branch.

### Preserved mixed and historical worktrees

The original mixed source checkout remains untouched at
`/Users/toddknipple/Documents/StudioFlow/web` (branch `main`, HEAD
`9f85f9d324e79373d7548b401658ec1be1d89c3c`) with its pre-existing changes in
`src/App.tsx` and `src/styles.css`. Historical worktrees were inspected and
left intact, including `web-111` recording evidence changes,
`tpi-studioflow-production-release` with an existing unmerged API conflict,
`tpi-studioflow-production-release-v2`, and
`tpi-studioflow-release-candidate`. No dirty worktree was reset, force-pushed,
pruned, or deleted. Existing prunable `/private/tmp` worktree registrations
were also not pruned.

No new recovery branch was necessary: the unrelated WIP remains in its original
Git worktree/branch, while the completed release is committed and pushed on the
canonical website branch. No stashes were deleted; the inspected canonical
repositories had no stashes.

## Release provenance

- StudioFlow source commit: `ded5a3d73c5838d56f3c5e1cb0a32534acdab44f`
- StudioFlow source branch: `codex/studioflow-122-notes` (local; no remote configured)
- Website integration branch: `codex/tpi-development`
- Website integration commit before this record: `a648f0b6a2744af489e0a9357952ac6dd9de6de5`
- Website remote: `git@github.com:paranormalinitiative/paranormal-initiative-website.git`
- Generated JavaScript: `index-CZ1q5Q9d.js`
- JavaScript SHA-256: `89f744d4ca0a889001acb94f2afd6826609a8c64cee02ad23508f0f4da8a14b3`
- Generated CSS: `index-DtHLNYVn.css`
- CSS SHA-256: `720b9f58e86b2006281120234b4cb9a4bf7e2f2b7388b04badd4e2d3808eb668`
- Reproducible staging: PASS; generated and staged asset comparisons matched
- Website branch parity: PASS before this documentation commit; this record is
  pushed as the follow-up documentation commit

## Verification gates

| Gate | Result |
| --- | --- |
| Local administrator lifecycle before/after Worker restart and rebuild | PASS, 38/38 each run |
| Release safety contract | PASS, 21/21 |
| Isolated Firefox local acceptance | PASS, 64/64 |
| Studio lifecycle regression | PASS, 29/29 |
| Studio ownership/dashboard regression | PASS, 40/40 |
| Permanent deletion regression | PASS, 31/31; destructive deletion remains disabled |
| Deletion safety/data integrity regression | PASS, 32/32 |
| Complete isolated QA/API E2E | PASS, including multi-user API, production build, request budget, syntax, and read-only smoke checks |
| Guarded Wrangler dry-run | READY; exact Worker/bindings and asset package verified |

The 122H.2 native File System Access verification remains **PARTIAL**. Firefox
uses the ZIP fallback, and no native Chrome/macOS folder synchronization was
claimed as passed. The implementation and its verification record were
preserved; this release does not represent native local-folder acceptance as
complete.

## Production deployment

- Production Worker: `theparanormalinitiative`
- Previous/rollback Worker version: `a8709be8-6cec-4e99-a904-0f0e8877f00f`
- New Worker version: `4108a0d7-5833-435f-8a0b-f6be8c1c8b27`
- Traffic allocation: deployed Worker active on the production route
- Deployment command: `TPI_PRODUCTION_DEPLOY=approved npm run release:production`
- Anonymous production smoke: PASS, 10/10
- Isolated Firefox production acceptance: PASS, 64/64
- Production authentication: PASS for synthetic `production_qa`; anonymous
  Studio remains protected
- Production data migration: none
- Production D1/R2 reset or destructive operation: none
- Rollback: available through the documented previous Worker/version target

The production package retained the existing authentication boundary, Notes,
Teleprompter, Recording, Media Assets, and deletion safeguards. The deployed
package excludes Markdown documentation from the Worker asset package.

## Final development baseline

- Local Worker: operational at `http://127.0.0.1:8787/studio/`
- Local Worker runtime: loopback Cloudflare Worker with `.local-dev/state/v3`
- Firefox development browser: preserved; no owner profile storage was cleared
- Canonical website worktree after the release documentation commit: expected
  clean and pushed to `origin/codex/tpi-development`
- Original mixed StudioFlow checkout: preserved, including pre-existing dirty
  changes
- Production: changed only through the guarded deployment above

## Remaining limitations

1. Native local-folder synchronization under 122H.1/122H.2 remains partial and
   requires a supported Chromium/macOS filesystem test with independent Finder
   inspection.
2. Historical unrelated WIP worktrees remain dirty by design. They were not
   bundled into this release and must not be reset or force-cleaned.
3. The StudioFlow source repository has no configured remote, so independent
   source-branch GitHub parity cannot be asserted. The exact source commit and
   the integrated website release are preserved; adding a remote requires an
   explicit repository decision.

## Owner handoff

The live release is ready for owner review at:

`https://paranormalinitiative.com/studio/`

The next directive should begin from website commit `a648f0b6a2744af489e0a9357952ac6dd9de6de5` plus this documentation commit, and source commit `ded5a3d73c5838d56f3c5e1cb0a32534acdab44f` in the preserved `web-122` worktree.
