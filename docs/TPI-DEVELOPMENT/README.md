# TPI Development Documentation

This directory is the authoritative index for The Paranormal Initiative development workflow. It documents the current verified state separately from the approved future architecture. A planned branch, Worker, database, bucket, or safeguard is not operational until its creation and runtime behavior have been verified and recorded here.

## Read first

1. [Standing autonomous agent authority](100-DIRECTIVES/TPI-MASTER-AUTONOMOUS-AGENT-AUTHORITY.md)
2. [Developer onboarding — READ BEFORE MODIFYING TPI](010-DEVELOPER-ONBOARDING.md)
3. [Mandatory local-to-production runbook](TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md)
4. [StudioFlow source-to-live workflow](TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md)
5. [Project overview](000-PROJECT-OVERVIEW.md)
6. [Local development](003-LOCAL-DEVELOPMENT.md)
7. [Cloudflare development](004-CLOUDFLARE-DEVELOPMENT.md)
8. [Production deployment and approval](005-PRODUCTION-DEPLOYMENT.md)
9. [Security and permissions](007-SECURITY-AND-PERMISSIONS.md)
10. [Administration Center](008-ADMINISTRATION-CENTER.md)
11. [Testing and verification](009-TESTING-AND-VERIFICATION.md)
12. [Directive index](100-DIRECTIVES/DIRECTIVE-INDEX.md)

## Official locations

- Canonical application source: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Authoritative StudioFlow source: `/Users/toddknipple/Documents/StudioFlow/web`
- Desktop archive/research workspace: `/Users/toddknipple/Desktop/paranormal-initiative-website`
- Official GitHub remote: `git@github.com:paranormalinitiative/paranormal-initiative-website.git`

The canonical checkout is the only approved website and Cloudflare deployment
source. StudioFlow application code is authored in the separate StudioFlow
source above and integrated into the website repository with the maintained
staging script. The Desktop workspace is preserved archive/research material
and must not be synchronized, overwritten, or used for Cloudflare deployment.

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

Latest verified production release (TPI-STUDIOFLOW-028 Addendum A):

- Worker: `theparanormalinitiative`
- Source commit: `cb9746411398df16282c305101cb0b41425bcd39`
- StudioFlow source commit: `ce7c389d23db65bd5ebb92597695d9854d21c7ab`
  (bridge-only release; source unchanged)
- Worker version: `21ea05f7-588d-4b5a-b039-c6063f7fd248` at 100% traffic
- Deployed: 2026-10-23
- Rollback target: `210f4610-ff8a-4192-a944-4668892dd669`
- Acceptance: anonymous smoke 10/10, isolated Firefox Developer Edition 60/60,
  028 browser interactions 33/33 (including the Addendum-A After Intro music
  preservation checks), 021 static contracts 58/58, 021 browser 29/29, 020
  contracts 14/14, release safety 17/17, complete preflight, and guarded
  dry-run passed
- Approved behavior: `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`
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
