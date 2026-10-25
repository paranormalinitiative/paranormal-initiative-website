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

Latest verified production release (TPI-STUDIOFLOW-036 cinematic video timers):

- Application commit: `7bd8c4606660c959c6b3409b4a46a319fc11ec8a`
- StudioFlow source commit: `37c6598`
- Worker version: `076c9614-9251-4efd-b047-0e7033f4ad9c` at 100% traffic
- Rollback: `aa9bff15-6252-4ae5-9422-17d63b99ab5a` (TPI-035)
- Acceptance: TPI-036 timer regression 28/28; local and live Firefox
  acceptance 64/64; production smoke 10/10; release safety 17/17; local
  auth lifecycle PASS; complete isolated API/QA gate PASS; reproducible
  StudioFlow staging PASS
- Record: `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-036-CINEMATIC-VIDEO-TIMERS.md`

Prior verified production release (TPI-STUDIOFLOW-035 right navigation
cleanup and Recording & Storage consolidation):

- Application commit: `d0b1f70da86e6c5490bb89a644f07c5f50a53a1e`
- StudioFlow source commit: `60af530db1d53536975ac910b9501526c54c7600`
- Worker version: `aa9bff15-6252-4ae5-9422-17d63b99ab5a` at 100% traffic
- Rollback: `5c8e78b5-f920-4335-940f-a5e4d6df0e49` (TPI-033)
- Acceptance: TPI-035 suite 33/33; 033 round-trip 26/26; 034 mutation
  regression twice; 021 browser 31/31; 028 browser 33/33; 030 browser
  25/25; 031 music pads 34/34; 021 static 86/86; 020 playback 14/14; 020
  clips 13/13; 027 contracts 12/12; 031 overlays 12/12; release safety
  17/17; local auth lifecycle PASS; local Firefox acceptance 63/63;
  production smoke PASS; guarded live Firefox acceptance 63/63; live
  artifact verification (shell, bundle, CSS all 200 with the new panels)
- Record: `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-035-RECORDING-STORAGE-CONSOLIDATION.md`

Prior verified production release (TPI-STUDIOFLOW-034 DOM mutation repair):

- Application commit: `8d7185b`
- StudioFlow source commit: `ce7c389` (website bridge-only release)
- Worker version: `0c0a8660-21cf-47e1-ac66-98c91b26972c`
- Rollback: `7029c6c5-3994-42a1-9570-d6119a5792f3`
- Acceptance: mutation regression twice; production smoke 10/10; isolated
  Firefox production acceptance 64/64; no owner profile or production data
  mutation
- Record: `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-034-DOM-MUTATION-REPAIR.md`

Prior verified production release (TPI-STUDIOFLOW-033 configuration persistence):

- `videoClipSlots`, validated slot positions, and scalar `programOrientation`
  are repaired in the API normalizer and StudioFlow workspace bridges.
- The real API/Firefox round-trip regression passes 26/26 locally.
- Worker `5c8e78b5-f920-4335-940f-a5e4d6df0e49` is deployed and live-verified;
  rollback is `0c0a8660-21cf-47e1-ac66-98c91b26972c`.
- Live release acceptance passed 64/64 and anonymous smoke passed 10/10.
- [Configuration contract and inventory](TPI-STUDIOFLOW-WORKSPACE-CONFIGURATION.md)
- [TPI-STUDIOFLOW-033 completion record](300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-033-WORKSPACE-CONFIGURATION-PERSISTENCE.md)

Latest verified production release (TPI-STUDIOFLOW-032 Background Music
and Sound Effects icon replacement):

- Worker: `theparanormalinitiative`
- Source commit: `6a1f8ad77649f1ef175a5191396d55a45141764c`
  (feature commit `02056c1`)
- StudioFlow source commit: `ce7c389d23db65bd5ebb92597695d9854d21c7ab`
  (website-only release; source unchanged)
- Worker version: `7029c6c5-3994-42a1-9570-d6119a5792f3` at 100% traffic
- Deployed: 2026-10-24
- Rollback target: `48cdb81d-efcc-4f03-8717-eaa5a51e45d5`
- Acceptance: 021 browser interactions 31/31 (two consecutive runs), 028
  browser 33/33 (two consecutive runs), 030 sound effects browser 25/25
  (two consecutive runs), 031 music pad browser interactions 34/34 (two
  consecutive runs), 021 static contracts 86/86, 020 playback 14/14, 020
  video clips 13/13, 027 contracts 12/12, 031 overlays 12/12, release
  safety 17/17, local auth lifecycle (isolated Firefox Developer Edition
  64/64), guarded live acceptance against production 64/64, live asset
  verification (pad artwork byte-identical), complete preflight, and
  guarded dry-run passed
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
