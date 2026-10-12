# Cloudflare Development

## Current state versus approved future architecture

The current Cloudflare configuration is production-bound. The existing workers.dev address is not an independent development environment and must not receive development deployments.

The development target is now implemented as:

- Worker: `theparanormalinitiative-dev` (VERIFIED)
- URL: `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev` (VERIFIED)
- D1: `tpi_contributor_portal_dev`, `4948ecc5-35de-4782-8f6b-b07fa1782b66` (VERIFIED)
- R2: `tpi-contributor-media-dev` (VERIFIED)
- Authentication: separate D1 session store, host-scoped cookies, and development-only accounts (VERIFIED)

The development deployment uses `wrangler.dev.toml` and `scripts/deploy-development.mjs`. The script rejects production Worker names, production D1/R2 identifiers, the production hostname, and non-development branches. It stages assets without `.dev.vars`, `.env*`, Git metadata, documentation, migrations, backups, data, scripts, or source-only Admin Center files.

## Current audit result

The root production configuration remains protected. The isolated development configuration is now verified:

- Account: 221ea5479876fd303ddc87002b9e892d
- D1: tpi_contributor_portal_dev, 4948ecc5-35de-4782-8f6b-b07fa1782b66
- R2: tpi-contributor-media-dev
- Scheduled trigger: none
- Outbound email: disabled by `TPI_DISABLE_OUTBOUND=1` and absence of development Resend secrets

The historical workers.dev response and production response were byte-identical before separation. The current development response includes the development-only banner and separate runtime bindings. Production was not redeployed.

## Required safe correction

Before any dev deployment, the owner must approve or identify:

1. A distinct development Worker and deployment configuration.
2. A separate development D1 database with sanitized or synthetic data.
3. A separate development R2 bucket.
4. Separate development authentication/session and cookie boundaries.
5. A reviewed development secret and environment-variable set.
6. A rollback procedure that cannot affect production.

The future deployment configuration must make the target environment explicit. A current-folder assumption, the root `wrangler.toml`, or the existing workers.dev hostname is not an acceptable development safeguard.

The development resources and migrations were created under TPI-DEV-005 only. Production resource creation and migration remain prohibited.

## Verified deployment

- Latest deployment version: `c8432743-71c7-4b5c-8cd1-9503cb81e038`
- Development route: `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/`
- Admin preview: `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/admin-center-preview/`
- Cron: absent from development configuration
- Production latest observed version remained `7e357215-2579-4c60-b27e-dd572a5656fe`

## Verification commands

Read-only identity and binding checks used in this audit:

    npx wrangler whoami
    npx wrangler d1 info tpi_contributor_portal
    npx wrangler deployments list
    npx wrangler deploy --dry-run

Do not run npx wrangler deploy against the root configuration as a development command.
