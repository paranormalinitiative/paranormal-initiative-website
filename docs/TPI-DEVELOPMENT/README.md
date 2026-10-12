# TPI Development Documentation

This directory is the authoritative index for The Paranormal Initiative development workflow. It documents the current verified state separately from the approved future architecture. A planned branch, Worker, database, bucket, or safeguard is not operational until its creation and runtime behavior have been verified and recorded here.

## Read first

1. [Developer onboarding — READ BEFORE MODIFYING TPI](010-DEVELOPER-ONBOARDING.md)
2. [Project overview](000-PROJECT-OVERVIEW.md)
3. [Local development](003-LOCAL-DEVELOPMENT.md)
4. [Cloudflare development](004-CLOUDFLARE-DEVELOPMENT.md)
5. [Production deployment and approval](005-PRODUCTION-DEPLOYMENT.md)
6. [Security and permissions](007-SECURITY-AND-PERMISSIONS.md)
7. [Administration Center](008-ADMINISTRATION-CENTER.md)
8. [Testing and verification](009-TESTING-AND-VERIFICATION.md)
9. [Directive index](100-DIRECTIVES/DIRECTIVE-INDEX.md)

## Official locations

- Canonical application source: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Desktop archive/research workspace: `/Users/toddknipple/Desktop/paranormal-initiative-website`
- Official GitHub remote: `git@github.com:paranormalinitiative/paranormal-initiative-website.git`

The canonical checkout is the only approved application-development source. The Desktop workspace is preserved archive/research material and must not be synchronized, overwritten, or used for Cloudflare deployment without a separate audit.

## Environment status

| Environment | Current status |
| --- | --- |
| Local development | Available in the canonical checkout; use documented commands and isolated fixtures |
| `theparanormalinitiative.paranormalsomerset.workers.dev` | Verified production Worker endpoint, not development-isolated |
| `theparanormalinitiative-dev` | Implemented isolated development Worker; authenticated acceptance is available |
| `paranormalinitiative.com` | Verified production environment; protected |

The current root `wrangler.toml` remains production-bound and must not be used for development. Development uses `wrangler.dev.toml` plus `scripts/deploy-development.mjs`, which stages a sanitized asset set and runs a target preflight.

Verified development resources:

- Worker: `theparanormalinitiative-dev`
- URL: [development website](https://theparanormalinitiative-dev.paranormalsomerset.workers.dev)
- D1: `tpi_contributor_portal_dev` / `4948ecc5-35de-4782-8f6b-b07fa1782b66`
- R2: `tpi-contributor-media-dev`
- Branch: `codex/tpi-development`
- Latest verified deployment: `05a2256e-2f4c-4b02-acb8-7f951ff3995d`

## Approval gate

The operational workflow is local development, local tests, isolated development deployment, Todd review, explicit approval, merge to `main`, and separately authorized production deployment. TPI-DEV-005 created only development resources and did not merge to `main` or deploy production.
