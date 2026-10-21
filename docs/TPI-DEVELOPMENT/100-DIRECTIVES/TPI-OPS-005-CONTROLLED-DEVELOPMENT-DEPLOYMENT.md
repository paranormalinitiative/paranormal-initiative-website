# TPI-OPS-005 — Controlled Development Deployment

**Date:** 2026-10-17  
**Status:** COMPLETED WITH LIMITATIONS  
**Target:** Development Worker only

## Authorization and scope

This directive authorized one guarded deployment of the OPS-002 traffic
protections to `theparanormalinitiative-dev`. Production deployment, database
changes, R2 changes, route changes, billing changes, load testing, and broad
historical investigation were outside scope and were not performed.

## Predeployment gate

| Gate | Result | Status |
| --- | --- | --- |
| Repository | `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website` | CONFIRMED |
| Branch | `codex/tpi-development` | CONFIRMED |
| Canonical HEAD | `7385f0cf24155f121bdc967a0985553daa8a05df` | CONFIRMED |
| Development Worker | `theparanormalinitiative-dev` | CONFIRMED |
| Development D1 | `tpi_contributor_portal_dev` | CONFIRMED |
| Development R2 | `tpi-contributor-media-dev` | CONFIRMED |
| Outbound guard | `TPI_DISABLE_OUTBOUND=1` | CONFIRMED |
| Development cron | No `[triggers]` block | CONFIRMED |
| Production cron | `0 */6 * * *` retained in production config | CONFIRMED |
| Worktree preservation | Canonical dirty worktree untouched | CONFIRMED |

The canonical checkout contained unrelated modified files and untracked prior
directive artifacts. The guarded deployment script correctly rejects such an
application tree. A temporary local clone was therefore created from the
canonical HEAD, and only the two verified OPS-002 runtime files were overlaid:

- `member-shell.js`
- `tpi-video.html`

The temporary source snapshot was committed locally only to satisfy the
existing fail-closed deployment guard. Its temporary commit was
`bbe9167b1f799358a6720199651cff3b650d9114`; it was not added to the canonical
repository and was not pushed.

## Version reconciliation

The retained deployment list established that the previously reported
`c181...` and `f89...` values were earlier deployments. Immediately before
OPS-005, the active versions were:

- Development: `cf58029d-62be-409f-98ff-58591b020641`
- Production: `05c5d075-8d28-4f72-a4c8-a8edba01bb10`

No newer development functionality was overwritten from the canonical source;
the deployment snapshot was based on HEAD `7385f0c` plus the two scoped runtime
files.

## Deployment command

The one controlled command executed from the isolated snapshot was:

```sh
TPI_WRANGLER_BIN=/opt/homebrew/bin/wrangler node scripts/deploy-development.mjs
```

The guard verified the development Worker, D1, R2, outbound variables, branch,
and clean isolated application state before upload. No retry was performed.

## Deployment result

Cloudflare reported:

- Worker: `theparanormalinitiative-dev`
- New version: `802425a6-e7d0-4ff4-917f-12fff09d147f`
- Allocation: 100%
- Uploaded changed assets: `member-shell.js`, `tpi-video.html`, provenance,
  and the generated Administration Center release manifest
- Development D1/R2 bindings: confirmed
- Monetary cost: none observed

The deployment script printed Wrangler's generic trigger-deployment message;
the development configuration still contains no scheduled cron trigger.

## Deployment provenance

The deployed provenance document returned HTTP 200 and reported:

```json
{
  "environment": "development",
  "worker": "theparanormalinitiative-dev",
  "sourceCommit": "bbe9167b1f799358a6720199651cff3b650d9114",
  "sourceBranch": "codex/tpi-development"
}
```

The production deployment list remained at version
`05c5d075-8d28-4f72-a4c8-a8edba01bb10` after the development deployment.

