# TPI-PROJECT-001 — Cloudflare isolation

Verified TPI deployment configuration:

| Resource | Verified value |
| --- | --- |
| Account | `Paranormalsomerset@gmail.com's Account` |
| Account ID | `221ea5479876fd303ddc87002b9e892d` |
| Worker | `theparanormalinitiative` |
| Domain | `paranormalinitiative.com` |
| D1 binding | `TPI_DB` → `tpi_contributor_portal` → `f36b9161-b517-4634-9857-bef4147cefe3` |
| R2 binding | `TPI_MEDIA` → `tpi-contributor-media` |

Only the TPI Worker configuration was inspected. No other Cloudflare account,
Worker, Pages project, route, database, bucket, or account-wide setting was
modified. This directive requires no D1 migration and no R2 operation.
