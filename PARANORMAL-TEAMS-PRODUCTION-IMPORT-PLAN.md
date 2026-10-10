# Paranormal Teams Production Import Plan

**Status:** Package prepared locally; remote execution not authorized or performed.

The production package is generated from the review manifest and the latest immutable source snapshot. It keeps every imported record pending, unverified, and unclaimed. It does not publish records automatically.

## Required preflight

1. Review `data/paranormal_teams_publication_review.json`.
2. Resolve or accept the 461 duplicate candidate pairs.
3. Resolve the three blocked records with missing cities.
4. Confirm that the region-qualified identity format (`source_region:external_id`) is accepted for import provenance.
5. Take a current D1 backup/export before remote execution.

## Package contents

The release builder creates:

- `release-manifest.json` — expected counts, policy, execution order, and authorization gate.
- `import/` — deterministic SQL chunks using `INSERT OR IGNORE`.
- `rollback/rollback-blockers.sql` — reports approved, claimed, edited, or reviewed rows.
- `rollback/rollback.sql` — removes only untouched pending/unclaimed imported rows from the named batch.
- `verify-after-import.sql` — confirms counts and publication state.
- `checksums.sha256` — package integrity checksums.

## Execution boundary

The package is ready for review, but no command in this repository should be treated as authorization to run against remote D1. Remote migration/import and deployment require explicit authorization immediately before execution.
