# TPI-DEV-027 — Controlled Production Release

Date: 2026-10-14

Status: `RELEASE PREPARATION BLOCKED`

## Candidate

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Development branch: `codex/tpi-development`
- Release candidate commit: `71047c1`
- Production Worker: `theparanormalinitiative`
- Production D1: `tpi_contributor_portal`
- Production R2: `tpi-contributor-media`

## Safety result

Read-only production and development inspection was completed. The release was
not approved for execution because:

1. Production D1 has only two recorded migration rows while its schema already
   contains many later application tables.
2. Production has no `studio_workspaces` table.
3. Development has `studio_workspaces` and five workspace rows, but migration
   0051 is absent from the development migration ledger.
4. No complete, verified backup and restore artifact exists outside Cloudflare.
5. Production migration compatibility and rollback safety are not established.

Per the directive, this is a stop condition. No production migration, deployment,
secret change, data export, or live authenticated acceptance was performed.

See the [release candidate report](../300-COMPLETED-WORK/TPI-DEV-027-RELEASE-CANDIDATE-REPORT.md)
for the final approval gate contents.
