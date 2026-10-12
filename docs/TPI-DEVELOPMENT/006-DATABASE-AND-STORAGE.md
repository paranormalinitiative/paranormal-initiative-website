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

## Prohibited actions in the current state

Do not run remote migrations, seed production D1, upload test files to the production bucket, or test destructive actions against production records. No such actions were performed by TPI-DEV-001.
