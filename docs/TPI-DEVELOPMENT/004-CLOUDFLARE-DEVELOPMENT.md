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

TPI-DEV-008 added a source-integrity gate. The preflight records the current
HEAD and working-tree state and refuses deployment when application files are
uncommitted or when undocumented ignored files could affect the package.
Documentation-only changes may remain dirty. Use `node
scripts/verify-development-config.mjs --report-only` for inventory; ordinary
deployment invocation must remain fail-closed.

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

## Historical deployment record

- The TPI-DEV-009 deployment version was `a6dded19-2f63-4a98-88c4-30ed3d02ca1b`.

## Current verified deployment

- Worker: `theparanormalinitiative-dev`
- Current deployed application source: `a8ef0df`
- Current development version: `a51e3478-b620-4b6b-811c-a777af9b4a95`
- Development route: `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/`
- Admin preview: `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/admin-center-preview/`
- Cron: absent from development configuration
- Production remains outside the scope of this development record and was not
  contacted or modified by TPI-DEV-026.

The deployed provenance endpoint was read successfully during TPI-DEV-026 and
reported the expected development Worker, branch, and source commit. The remote
development D1 contains the `studio_workspaces` table. Wrangler's read-only
migration listing still reports `0051_studioflow_workspaces.sql` as pending,
despite the schema being present; this requires an explicit migration-ledger
reconciliation before any future migration work. DEV-026 did not apply or alter
the migration.

TPI-DEV-008 source-integrity results and the unresolved working-tree overlay
are preserved historically in [the deployment integrity audit](200-AUDITS/TPI-DEV-008-DEPLOYMENT-INTEGRITY.md). The TPI-DEV-009 reconciliation and current deployment evidence are in [the production baseline migration audit](200-AUDITS/TPI-DEV-009-PRODUCTION-BASELINE-MIGRATION.md).

## Verification commands

Read-only identity and binding checks used in this audit:

    npx wrangler whoami
    npx wrangler d1 info tpi_contributor_portal
    npx wrangler deployments list
    npx wrangler deploy --dry-run

Do not run npx wrangler deploy against the root configuration as a development command.

## Development content parity

The development D1 is intentionally not a copy of production. TPI-DEV-007 records the first focused content repair: synthetic Community Feed records and clearly labeled public open-media sample links were seeded into development only.

Use the guarded, idempotent seed operation from the canonical checkout:

    node scripts/dev/seed-development-content.mjs

The script refuses production configuration values and the wrong branch. Its `--cleanup` mode removes only its fixed development seed IDs. Do not use production Wrangler configuration for content seeding, and do not copy private production records or R2 media into development.

See [TPI-DEV-007 content parity audit](200-AUDITS/TPI-DEV-007-CONTENT-PARITY.md) for current counts, root cause, runtime verification, and remaining parity limitations.
