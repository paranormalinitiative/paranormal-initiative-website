# TPI-DEV-027 — Backup and Rollback Readiness

## Status

`BLOCKED — BACKUP AND RESTORE NOT VERIFIED`

No production private data was exported during TPI-DEV-027. The available
read-only inspection is not a backup.

## Required external backup procedure

Backups must be stored on approved local storage, a personal cloud-drive folder,
or external/removable storage. Cloudflare D1 and R2 are not backup destinations.

Before release authorization, an owner-approved operator must:

1. Export the production D1 database and schema to a protected local staging
   directory outside Git.
2. Record export metadata, SHA-256 checksums, permissions, and retention date.
3. Inventory production R2 objects without printing private contents.
4. Copy required R2 objects to approved external storage using a verified,
   resumable process that preserves object keys and metadata.
5. Check that the database export and R2 inventory are complete and readable.
6. Restore the D1 export into a disposable non-production database and validate
   schema, counts, representative relationships, and application reads.
7. Restore a representative R2 sample into disposable storage and validate object
   keys, metadata, and application retrieval.
8. Record the backup location category and restore test results without placing
   private member data or credentials in Git or reports.

The procedure was prepared but not executed because separate explicit production
private-data export authorization and a verified external destination were not
provided in this directive.

## Rollback plan

- Previous observed production Worker version: `7e357215-2579-4c60-b27e-dd572a5656fe`.
- Previous exact production source revision: unavailable from deployment metadata;
  the deployment list reports source as unknown.
- Worker rollback alone does not roll back D1 schema changes.
- Any migration sequence must be forward-compatible with the prior Worker until
  post-release verification completes.
- R2 object deletion or replacement is not an acceptable rollback action.
- Authentication/session behavior must be checked after a Worker rollback.

Rollback is not ready until the exact release source, configuration snapshot,
production schema evidence, external backup, and migration compatibility plan are
available and restore-tested.
