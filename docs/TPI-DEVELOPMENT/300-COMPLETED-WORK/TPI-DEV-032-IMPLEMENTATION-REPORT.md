# TPI-DEV-032 — Implementation Report

Date: 2026-10-14
Status: `IMPLEMENTED AND DEPLOYED — AUTHENTICATED PRODUCTION ACCEPTANCE PENDING`

## Source and deployment provenance

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- Final source commit: `51236c38773f8a1745c82e481a14d657f85c1044`
- Development Worker: `theparanormalinitiative-dev`
- Final development version: `c181a58d-005d-4c57-b188-24d3467fef78`
- Production Worker: `theparanormalinitiative`
- Production version: `4f679573-fb15-4bf9-9541-2a85e70209a0`
- Production baseline before this directive: `f89c0971-b3e5-40be-9b20-abfa9a132dcd`

The final development and production release manifests use the same built
Admin Center assets:

- `admin-center-preview/index.html` SHA-256
  `4c3b07dcf92c56e13dec678d59ce929e6223cff96eadd3c6a851578d6aaa8e25`
- `admin-center-preview/assets/index-cnfVfQqp.css` SHA-256
  `1e0b711db85996fc6094f116c32b6660644734b697591db488b82576266ffb23`
- `admin-center-preview/assets/index-nW0ajMC6.js` SHA-256
  `de4120d2e5151e499b503a65b3e32592940c9a3aff501a0f687bd78bb0fb741d`

## Verification

Passed:

- TPI-DEV-032 navigation checks: 12/12.
- TPI-DEV-030 source checks: 9/9.
- TPI-DEV-031 analytics checks: 11/11.
- TPI-ADMIN-006 preview checks: 81/81.
- React/Vite build.
- Worker and API syntax checks.
- Development authenticated authorization regression: 57/57.
- Development authenticated Admin Center entry: HTTP 200.
- Development protected release manifest: HTTP 200 with final source commit and
  exact three-file package.
- Production dry-run: correct Worker, D1, R2, source commit, and sanitized
  package confirmed.
- Production anonymous Admin/API protection: HTTP 403.
- Production homepage/auth-me/public Events/Education checks: 200.
- Production and development private source/documentation paths: 404.
- Production member-only routes: 307 to the existing authentication boundary.

## Packaging correction

The first production deployment version `3af5ebed-913f-4fe4-9a14-8f8c98f71f4f`
was immediately followed by a non-destructive exposure check that found
`/lib/auth.js` and `/lib/email.js` reachable. No credentials or data were
exposed by the check. The guarded staging procedure was corrected to exclude
`lib/` and `functions/`, and the corrective deployment `4f679573-fb15-4bf9-9541-2a85e70209a0`
now returns 404 for those paths. This is the version considered released.

## Data and security boundaries

Production D1 remains `tpi_contributor_portal` and production R2 remains
`tpi-contributor-media`; no migration, import, R2 operation, or application
data write was performed. Development remains bound to its separate D1/R2
resources. Existing owner/admin authorization and member session behavior were
preserved.

## Remaining limitation

Authenticated owner/admin browser visual inspection of the production chart and
navigation surface was not performed because no production owner session was
available in this execution. Development authenticated API/HTML acceptance,
source checks, generated package hashes, and all anonymous production
protection/public-route checks passed. Production authenticated owner acceptance
remains the final human verification item.
