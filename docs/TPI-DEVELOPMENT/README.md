# TPI Development Documentation

This directory is the authoritative index for The Paranormal Initiative development workflow. It documents the current verified state separately from the approved future architecture. A planned branch, Worker, database, bucket, or safeguard is not operational until its creation and runtime behavior have been verified and recorded here.

## Read first

1. [Standing autonomous agent authority](100-DIRECTIVES/TPI-MASTER-AUTONOMOUS-AGENT-AUTHORITY.md)
2. [Developer onboarding — READ BEFORE MODIFYING TPI](010-DEVELOPER-ONBOARDING.md)
3. [Mandatory local-to-production runbook](TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md)
4. [Project overview](000-PROJECT-OVERVIEW.md)
5. [Local development](003-LOCAL-DEVELOPMENT.md)
6. [Cloudflare development](004-CLOUDFLARE-DEVELOPMENT.md)
7. [Production deployment and approval](005-PRODUCTION-DEPLOYMENT.md)
8. [Security and permissions](007-SECURITY-AND-PERMISSIONS.md)
9. [Administration Center](008-ADMINISTRATION-CENTER.md)
10. [Testing and verification](009-TESTING-AND-VERIFICATION.md)
11. [Directive index](100-DIRECTIVES/DIRECTIVE-INDEX.md)

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
- Latest verified deployment: `c8432743-71c7-4b5c-8cd1-9503cb81e038`

Latest verified production release:

- Worker: `theparanormalinitiative`
- Source commit: `07ad157f68aaa9f5afdc2801d1089ab66b9cf10d`
- Worker version: `106c3d6a-5cbb-4a62-917d-644f850b4287` at 100% traffic
- Deployed: 2026-10-22 1:34:39 PM EDT (`2026-10-22T17:34:39.861Z`)
- Rollback target: `7c5ea692-e2e9-41f1-9b34-651230e03997`
- Acceptance: anonymous smoke 10/10, isolated Firefox Developer Edition 23/23,
  local authentication lifecycle 38/38, complete preflight and guarded dry-run passed
- Data protection: no D1 migration, R2 mutation, Crossroads mutation, or owner-browser
  storage access was performed

## Standing release authority

The operational workflow is local development, isolated tests, Firefox
Developer Edition acceptance, focused commit and GitHub push, guarded Wrangler
preflight, production deployment, live verification, and rollback on critical
failure. The owner has granted standing authority for this lifecycle when an
active directive calls for production completion. Historical records that say
an older execution was not authorized remain accurate for that execution but
do not impose a permanent release prohibition.
