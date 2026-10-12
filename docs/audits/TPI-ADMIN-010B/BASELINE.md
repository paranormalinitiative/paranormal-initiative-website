# TPI-ADMIN-010B — Baseline

Audit date: 2026-10-12

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `main`
- HEAD before this batch: `5c33d3bcb5fe832c94da434ba9becf1d2c364842`
- Cloudflare account: `221ea5479876fd303ddc87002b9e892d`
- Worker: `theparanormalinitiative`
- Target: protected `/admin-center-preview/` only
- Preserved production route: `/admin-panel`
- D1: `TPI_DB` → `tpi_contributor_portal` (`f36b9161-b517-4634-9857-bef4147cefe3`)
- R2: `TPI_MEDIA` → `tpi-contributor-media`

Pre-existing unrelated dirty website and 2026-10-09 audit files were preserved
and were not staged. No production records, schema, R2 objects, roles,
entitlements, authentication, public pages, or `/admin-panel` were changed.

The prior TPI-ADMIN-010 audit remains in `docs/audits/TPI-ADMIN-010/` and is
referenced rather than duplicated.
