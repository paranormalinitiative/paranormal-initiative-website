# Database and Storage

## Current production bindings

The inspected root Wrangler configuration binds:

| Binding | Resource | Identifier | Audit status |
| --- | --- | --- | --- |
| TPI_DB | tpi_contributor_portal | f36b9161-b517-4634-9857-bef4147cefe3 | Verified as configured resource; production state must be protected |
| TPI_MEDIA | tpi-contributor-media | bucket name | Verified as configured resource; production objects must be protected |

The D1 info check reported 62 tables and approximately 13.4 MB. These values are observational and not a license to mutate the database.

## Development requirement

Development must use separate writable D1 and R2 resources. Do not copy passwords, sessions, private messages, or other sensitive production records. Use synthetic or sanitized fixtures.

The development Worker uses an explicitly named development D1 database and R2 bucket. No production resource may be reused as a development write target.

## Verified development resources

TPI-DEV-005 created and tested:

| Binding | Resource | Identifier | Result |
| --- | --- | --- | --- |
| TPI_DB | tpi_contributor_portal_dev | 4948ecc5-35de-4782-8f6b-b07fa1782b66 | 50 schema migrations applied; disposable write/read/delete passed |
| TPI_MEDIA | tpi-contributor-media-dev | bucket name | Remote disposable upload/download/delete passed |

No production D1 or R2 resource was used by those tests.

## StudioFlow persistence boundary

StudioFlow configuration and project metadata use the server-backed
`studio_workspaces` persistence path. Workspace versioning and conflict checks
protect saves, while recovery snapshots are separate configuration copies in
the existing R2 binding. Portable configuration exports are user-initiated
files; complete project backups can include supported media bytes when the
browser-local media store is available and readable.

Browser-local media and recording bytes are not implied by a D1 workspace row
or a configuration JSON export. Missing required media must prevent a backup
from being reported as complete. Existing Crossroads recovery snapshots and
local backup artifacts must be preserved, but no automatic restore is allowed
without an owner-directed recovery decision. The owner has decided to rebuild
Crossroads; that decision does not authorize deleting or overwriting its prior
records or snapshots.

Production release requires separate verification of the production D1 schema,
R2 media persistence, authenticated workspace operations, and guest signaling.
Local build or synthetic backup tests do not establish production readiness.

## Prohibited actions in the current state

Do not run remote migrations, seed production D1, upload test files to the production bucket, or test destructive actions against production records. No such actions were performed by TPI-DEV-001.
