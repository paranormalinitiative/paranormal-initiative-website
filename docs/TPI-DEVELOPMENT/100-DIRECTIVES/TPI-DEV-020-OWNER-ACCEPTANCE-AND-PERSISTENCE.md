# TPI-DEV-020 — Owner Acceptance and Development Persistence

## Scope

TPI-DEV-020 continues TPI-DEV-019 by validating authenticated Administration Center API workflows against the development Worker and development D1. It is development-only. Production, research imports, Tavily, external scrapers, production accounts, and Founding 50 activation remain outside scope.

## Acceptance method

The secure authenticated API harness was used because it exercises the same protected Worker contracts without repeating the previously blocked Chrome/local-runner troubleshooting. Credentials are read from the existing mode-0600 local credential store and are never printed.

The additive fixture namespace is `tpi-dev020-*`. Prior TPI-DEV-014 fixtures and prior Founding 50 fixtures are retained unchanged. Fixture details are recorded in `docs/TPI-DEVELOPMENT/200-AUDITS/TPI-DEV-020-SYNTHETIC-FIXTURE-MANIFEST.json`.

## Required safety boundaries

- Development Worker only: `theparanormalinitiative-dev`.
- Development D1 only: `tpi_contributor_portal_dev`.
- Founding 50 development activation remains disabled and must return HTTP 423.
- No membership, entitlement, publication, production, import, commit, or push is authorized by this directive.
- Fixture cleanup is not automatic; removal requires a later owner-reviewed action limited to the documented namespace.

## Verification outputs

- `TPI-DEV-020-AUTHENTICATED-ACCEPTANCE-EVIDENCE.md`
- `TPI-DEV-020-DEVELOPMENT-D1-PERSISTENCE-RESULTS.md`
- `TPI-DEV-020-IMPLEMENTATION-REPORT.md`
- `TPI-DEV-020-OWNER-TESTING-GUIDE.md`

