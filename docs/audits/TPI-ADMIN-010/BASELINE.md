# TPI-ADMIN-010 — Baseline

Audit date: 2026-10-12

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `main`
- HEAD at audit start: `6ec881e34da806e1efb495a8e47f43e5040348e1`
- Authorized Cloudflare account: `221ea5479876fd303ddc87002b9e892d`
- Worker: `theparanormalinitiative`
- Preview route: `/admin-center-preview/`
- Protected legacy route preserved: `/admin-panel`
- D1 binding: `TPI_DB` → `tpi_contributor_portal` (`f36b9161-b517-4634-9857-bef4147cefe3`)
- R2 binding: `TPI_MEDIA` → `tpi-contributor-media`

The checkout contained unrelated dirty website and audit files. They were not
staged or modified by TPI-ADMIN-010. No production database, R2 object,
authentication configuration, role assignment, or public route was changed.

Previous ADMIN-009 deployment and parity evidence remain in
`docs/audits/TPI-ADMIN-009/` and are referenced rather than duplicated.
