# TPI-DEV-027 — D1 Migration Reconciliation

## Development D1

Read-only inspection of `tpi_contributor_portal_dev` found:

- `studio_workspaces` exists.
- Both indexes from `migrations/0051_studioflow_workspaces.sql` exist.
- The stored table definition matches the migration's columns, constraints,
  defaults, and owner-scoped unique key.
- There are five existing workspace metadata rows.
- The migration ledger records through `0050_creator_application_details.sql`
  but has no row for `0051_studioflow_workspaces.sql`.
- Wrangler reports 0051 as pending.

## Production D1

Read-only inspection of `tpi_contributor_portal` found:

- `studio_workspaces` does not exist.
- The prerequisite `contributors`, `tpi_video_channels`, and `studio_rooms`
  tables do exist.
- The schema contains many later application tables, including community,
  messaging, events, media, creator, and StudioFlow room tables.
- The migration ledger records only `0001_contributor_portal.sql` and
  `0002_contributor_profiles.sql`.

## Reconciliation classification

The development result is consistent with either:

- **A. Applied but not recorded:** the exact 0051 schema exists, but the ledger
  row was not written; or
- **B. Independently created:** the schema was created by a direct D1 execution
  or another process.

Available evidence does not distinguish A from B. The production result also
shows that its migration ledger cannot be treated as a complete historical
record of the current schema. It is not safe to infer that every pending file
should be applied to production.

## Required correction

Do not reapply 0051, fabricate a ledger row, drop the table, or reset either D1.
Before any release migration:

1. Preserve the exact read-only schema evidence and workspace row count.
2. Identify the operation that created the development table from deployment,
   Cloudflare audit, and repository history where available.
3. Obtain an owner-approved migration-ledger reconciliation procedure.
4. Verify the procedure against a disposable copy or local schema.
5. Recheck production schema and data compatibility before adding the table.

Until that process is completed, migration reconciliation is `BLOCKED` and
production deployment is prohibited.
