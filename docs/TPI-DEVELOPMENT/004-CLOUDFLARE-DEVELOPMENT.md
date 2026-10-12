# Cloudflare Development

## Current audit result

Development deployment is BLOCKED. The only inspected Wrangler configuration points to Worker theparanormalinitiative and production resources:

- Account: 221ea5479876fd303ddc87002b9e892d
- D1: tpi_contributor_portal, f36b9161-b517-4634-9857-bef4147cefe3
- R2: tpi-contributor-media
- Scheduled trigger: every six hours

The workers.dev response and production response were byte-identical during the audit. A dry-run deployment also reported the production D1 and R2 bindings. No development deployment was performed.

## Required safe correction

Before any dev deployment, the owner must approve or identify:

1. A distinct development Worker and deployment configuration.
2. A separate development D1 database with sanitized or synthetic data.
3. A separate development R2 bucket.
4. Separate development authentication/session and cookie boundaries.
5. A reviewed development secret and environment-variable set.
6. A rollback procedure that cannot affect production.

Resource creation and migration are intentionally not performed by TPI-DEV-001.

## Verification commands

Read-only identity and binding checks used in this audit:

    npx wrangler whoami
    npx wrangler d1 info tpi_contributor_portal
    npx wrangler deployments list
    npx wrangler deploy --dry-run

Do not run npx wrangler deploy against the root configuration as a development command.
