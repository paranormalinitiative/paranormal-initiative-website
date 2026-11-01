# TPI-STUDIOFLOW-126E — Deletion Safety Release Blocker

Date: 2026-11-01
Environment: Authoritative local Worker, `http://127.0.0.1:8787/studio/`
Production deployment: **NOT PERFORMED**

## Final result

**COMPLETE — DEVELOPMENT VERIFIED; PRODUCTION UNCHANGED.**

The deletion-safety blocker was reproduced, its cause was isolated to the
verification harness, and the harness was corrected without changing the
StudioFlow deletion implementation or the verified 126C card-border/cache
release candidate.

## Root cause

The failing `TPI-104: with-contents leaves workspace unchanged` assertion
compared the disposable target workspace before and after a rejected purge
request while that same workspace was still the active browser workspace. The
existing `workspace-bridge.js` autosave loop can legitimately persist the
active workspace during the browser/bridge/server checks. That save updates
only workspace metadata (`version` and `updatedAt`) while leaving the workspace
state and contents intact. The byte-for-byte assertion therefore attributed a
legitimate autosave race to the rejected purge.

The purge path itself is fail-closed. The Worker route returns
`503 studio_permanent_deletion_unavailable`, and the browser bridge rejects the
operation before mutation. Existing worker-level and handler-level safety
checks also showed no purge mutation. This was a test-isolation defect, not an
application deletion-safety defect.

## Minimum correction

Only the verification harness was changed:

- `scripts/verify/tpi-studioflow-089-deletion-safety.mjs` now selects the
  disposable keep Studio before taking the rejection comparison snapshot.
- The harness waits for the switch/save to settle, so the target is no longer
  the active autosave context.
- Each rejection comparison records explicit mutation evidence for workspace
  identity, metadata, and full state.

No StudioFlow application source, API route, database schema, storage binding,
card-border implementation, cache-control correction, or production data was
changed.

## Before/after evidence

Corrected run ID: `mvxbv74w`.

Both rejected modes (`studio-only` and `with-contents`) recorded identical
before/after evidence:

| Field | Before and after |
| --- | --- |
| Workspace ID | `73f0b880-aeb4-454e-972e-7b49b08a6e2b` |
| Local broadcast ID | `studio-bef696d5-3411-4e5e-bf32-924d70b28054` |
| Title | `TPI-089 Cancel mvxbv74w` |
| Version | `4` |
| Updated at | `2026-11-01T04:26:26.833Z` |
| Full workspace state | Identical |
| Related media/library/recording data | Unchanged |

The corrected test therefore proves that the rejected deletion leaves
workspace contents and metadata unchanged.

## Verification results

| Verification | Result |
| --- | --- |
| `TPI-STUDIOFLOW-089-DELETION-SAFETY` | **PASS — 32/32** |
| Firefox 126A card-border acceptance | **PASS — 8/8** |
| Release safety | **PASS — 21/21** |
| Local auth lifecycle | **PASS — 38/38** before restart, after restart, and after rebuild |
| Isolated Firefox local-admin acceptance | **PASS — 64/64** |
| Recording/storage regression | **PASS — 33/33** |
| TPI-125 Firefox integration | **PASS — 21/21** |
| Screen-sharing regression | **PASS — 13/13**; native picker not automated |
| Production deployment | **NOT PERFORMED** |

The Firefox run used Firefox Developer Edition and the authoritative local
Worker. Evidence is preserved under:

`/tmp/tpi-126e-firefox-evidence`

The native operating-system screen picker remains outside the maintained
automation boundary and is reported as not automated, not as a failure.

## Release-candidate integrity

The approved StudioFlow source remains:

`a6784cfe490f57d413dce99135f148936f854c9f`

The verified website implementation reference remains:

`c6b6d8e6fc0e572be9a5cb4541fa8f7a26a7b48e`

Authoritative staging rebuilt the approved source twice from a clean detached
worktree and produced identical output:

- JavaScript: `studio/assets/index-CSTJXjG2.js`
  - SHA-256: `94d5ba564a6e358ac013f94dcc30bf78e49e1acd93db4e3a46e32dbab06505bc`
- CSS: `studio/assets/index-CphVaGhF.css`
  - SHA-256: `328a8c77587c1976c7a8e1ee3dd72c7e0e4a979216975b1be4e53f23997f3385`
- Integrated entrypoint SHA-256:
  `c893fb35444f2fb1c17cb891d2987fddd8672c1657502e7f3423b73227c208ab`
- Reproducible builds: **PASS**
- Generated assets matched the integrated candidate: **PASS**
- Obsolete bundle references: **none**

## Files modified

- `scripts/verify/tpi-studioflow-089-deletion-safety.mjs`
- This execution record.
- `docs/TPI-DEVELOPMENT/TPI-CURRENT-DEVELOPMENT-STATUS.md`
- `docs/TPI-DEVELOPMENT/100-DIRECTIVES/DIRECTIVE-INDEX.md`

The application source and release assets were not modified. The unrelated
untracked `flame.html` remains preserved and unstaged.

## Repository and production status

- Source baseline: `a6784cfe490f57d413dce99135f148936f854c9f`.
- Website branch: `codex/tpi-development`.
- Production Worker confirmed: `584f29db-1568-4ff4-a99e-b32b3b63a23e`, 100% traffic.
- Production data, databases, storage, credentials, and traffic were not
  changed.
- GitHub parity will be recorded after the documentation/harness commit is
  pushed; no force-push or destructive cleanup is authorized.

## Final classification

**TPI-STUDIOFLOW-126E — COMPLETE: DELETION SAFETY VERIFIED IN DEVELOPMENT;
PRODUCTION UNCHANGED.**

The 126C release candidate remains ready for a separate production deployment
authorization. This directive stops after verification and does not deploy.
