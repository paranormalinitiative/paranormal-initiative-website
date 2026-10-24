# TPI StudioFlow Master Handoff

> **Current authority:**
> `100-DIRECTIVES/TPI-MASTER-AUTONOMOUS-AGENT-AUTHORITY.md` supersedes any
> interpretation of historical task limits as permanent restrictions. Agents
> may complete current StudioFlow directives through repair, testing, commit,
> push, guarded deployment, Firefox Developer Edition live verification, and
> rollback. Historical status and evidence below remain preserved.
>
> **Current release procedure:**
> `TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md` and
> `TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md` control current source staging, commit,
> push, deployment, and Firefox verification. Older revisions and status rows
> below are historical unless the current-status record confirms them.

## Purpose

This document is the current operational handoff for reconciling the
authoritative StudioFlow development implementation with the live Paranormal
Initiative website.

It records:

- What was requested across the StudioFlow directives.
- Which repositories, generated assets, backend files, migrations, scripts,
  documents, and PDFs are being compared.
- What has been implemented locally.
- What has been deployed.
- What has actually been verified.
- What remains unverified or incomplete.
- What must happen next.
- Which data and production boundaries must remain protected.

This is an engineering handoff, not a claim that every historical StudioFlow
directive is production-complete. A feature is marked `DEPLOYED` only when the
relevant files reached the live Worker. It is marked `VERIFIED` only when the
behavior was observed or tested. A local test or a historical report is not
treated as proof of current live behavior.

Last updated: 2026-10-23

> Superseded baseline note (2026-10-23, TPI-STUDIOFLOW-029): after this
> handoff was written, TPI-STUDIOFLOW-027 (authenticated media resolution),
> TPI-STUDIOFLOW-028 (independent scene playback and restoration), and
> TPI-STUDIOFLOW-028 Addendum A (preservation of Sol's After Intro Background
> Music) were deployed and live-verified. The current production baseline is
> Worker `21ea05f7-588d-4b5a-b039-c6063f7fd248` from commit `cb97464`; the
> current approved playback contract is `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`
> and the maintained baseline is `TPI-CURRENT-DEVELOPMENT-STATUS.md`. The
> table below is preserved as the state of this handoff's own work.

## Current executive status

| Area | Current status |
| --- | --- |
| Authoritative StudioFlow source | `/Users/toddknipple/Documents/StudioFlow/web`, branch `main`, current inspected HEAD `17bbd4a9d0a604b731d68fae915ceffacdc14025` |
| Website repository | `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`, branch `codex/tpi-development`; deployed application commit `f1603710545447b072fbe6160acc3bccbcf456e4`; later documentation commit `fdbf1aa02a18a403f9bf427924a42e5d2acb3dfe` |
| Source-to-live procedure | `TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`; source save, local test, Git push, development deploy, and production deploy are distinct events |
| Live Worker | `theparanormalinitiative` |
| Latest deployment in this work | Worker version `0862ff17-3003-4e27-8ab3-dc7218dbbff3`; rollback `a4e1f565-21fb-449d-878a-388beabac36c` |
| Latest live asset change | Exclusive right-rail panel display repair in the maintained StudioFlow bridges and override stylesheet |
| Latest bridge cache-buster | `exclusive-v3` |
| Production D1 | Existing `tpi_contributor_portal`; no migration or production D1 write in the latest repair |
| Production R2 | Existing `tpi-contributor-media`; no R2 write in the latest repair |
| Protected Crossroads workspace | Preserved; no intentional owner-workspace mutation |
| Local focused StudioFlow contracts | Passing; see the test matrix below |
| Live StudioFlow home | Authenticated shell loaded and displayed Crossroads |
| Live right-rail acceptance | PASS: isolated Firefox 59/59 and authenticated owner Firefox verification for all 11 tabs |
| Overall release state | Latest panel repair `DEPLOYED / LIVE VERIFIED`; broader historical server-backed mutation limitations remain documented separately |

## Source-of-truth hierarchy

When evidence conflicts, use this order:

1. Current source and current generated build output.
2. Current local runtime behavior using disposable data.
3. Current live HTTP/browser behavior.
4. Current test output and hashes.
5. Current Markdown result records.
6. Historical directives and PDFs.

Historical directives define intended requirements. They do not prove that a
feature is still present, correctly staged, correctly bound, or live.

## Repositories and environments

### Authoritative StudioFlow source

Path:

`/Users/toddknipple/Documents/StudioFlow/web`

Current inspected state:

- Branch: `main`
- HEAD: `2e877a7d213d7f6d19335a7ce41dbacd898ceb4d`
- Main application source: `src/App.tsx`
- Main application styling: `src/styles.css`
- Entry point: `src/main.tsx`
- Build configuration: `vite.config.ts`
- TypeScript configuration: `tsconfig.json`, `tsconfig.node.json`
- Package manifests: `package.json`, `package-lock.json`

The authoritative source is not the same thing as the website's generated
`studio/` directory. The website directory contains the staged/deployed copy
used by the Cloudflare Worker.

### Website repository

Path:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`

Current inspected state:

- Branch: `codex/tpi-development`
- HEAD: `7385f0cf24155f121bdc967a0985553daa8a05df`
- Working tree: heavily modified and containing untracked development,
  documentation, local-runtime, test, migration, and generated files.
- Existing changes are user development work and must not be broadly staged,
  reset, cleaned, or overwritten.

### Isolated release candidate

Historical isolated candidate:

`/Users/toddknipple/Documents/GitHub/tpi-studioflow-release-candidate`

Historical branch:

`codex/studioflow-release-candidate`

The candidate and its checkpoint history are historical release-preparation
artifacts. The latest repair deployed in this handoff was prepared from the
existing production package rather than recreating the full candidate.

### Local development runtime

Known local locations and controls:

- Local Worker: `http://127.0.0.1:8787`
- Local Wrangler configuration: `wrangler.local.toml`
- Local D1 name: `tpi-local-foundation`
- Local R2 name: `tpi-local-media`
- Local state directory: `.local-dev/state`
- Local synthetic authentication fixture: `scripts/local-auth-fixtures.mjs`
- Local development guard: `TPI_ENV=local`, `TPI_LOCAL_ONLY=1`
- Outbound network protection: `TPI_DISABLE_OUTBOUND=1`

Port 8787 is an existing long-running local process and was not treated as a
verified process owned by this handoff. An isolated loopback Wrangler process
was used where possible and was shut down after testing.

### Live deployment package

The local production package used for the latest bounded deployment was:

`/private/tmp/tpi-sidebar-live-package-20261019`

Its deployment manifest targets:

- Worker: `theparanormalinitiative`
- Compatibility date: `2026-07-18`
- D1 binding: `tpi_contributor_portal`
- R2 binding: `tpi-contributor-media`
- Static asset directory: package root

`wrangler.local.toml`, `.dev.vars`, local databases, browser profiles, local
fixtures, and owner data are not part of the production package.

## Evidence files reviewed

### Supplied PDFs

The following PDFs were supplied as historical project evidence and were
cross-checked against the current repository where possible:

1. `/Users/toddknipple/Desktop/Postiz installation guide.pdf`
   - Historical Postiz/local-service and wider TPI development discussion.
   - Contains operational, Cloudflare, local-development, and documentation
     material in addition to the Postiz installation discussion.
   - It is not a source of live production state.

2. `/Users/toddknipple/Desktop/StudioFlow Implementation Review.pdf`
   - Large historical StudioFlow implementation-review transcript.
   - Covers direct Studio switching, save-before-switch behavior, workspace
     persistence, Brand 1/My Studios, media, recording, backup/recovery,
     guest/live bridge, and release-readiness concerns.
   - It reaches later production-recovery discussions and explicitly warns
     that historical reports are not substitutes for current live acceptance.

3. `/Users/toddknipple/Desktop/TPI Cloudflare Investigation.pdf`
   - Historical Cloudflare traffic, local-vs-production, Worker, D1, R2,
     development protection, and StudioFlow production-investigation material.
   - It includes the Crossroads operating plan and My Studios expectations.

PDF handling rule: the PDFs are requirements/history and are used to recover
intent. Current source, tests, and live checks decide implementation status.

### Repository documentation

The authoritative current documentation areas are:

- `docs/TPI-DEVELOPMENT/100-DIRECTIVES/`
- `docs/TPI-DEVELOPMENT/200-AUDITS/`
- `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/`
- `docs/TPI-DEVELOPMENT/400-FUTURE-DEVELOPMENT/`
- `docs/TPI-DEVELOPMENT/TPI-CURRENT-DEVELOPMENT-STATUS.md`
- `docs/TPI-MASTER-DEVELOPMENT/`

Historical reports are preserved. They are not silently rewritten to claim
new verification.

## Directive archive and functional scope

The directive archive is chronological, but some directives overlap, addenda
supersede earlier UI decisions, and release directives change the required
verification boundary. The following is the working map.

### Early StudioFlow workspace and UI directives

| Directive family | Requirement recovered | Current interpretation |
| --- | --- | --- |
| TPI-STUDIOFLOW-012 and addenda A-C | Replace the large My Studios panel with a compact control; use the Brand 1 area for My Studios; preserve project actions, independent workspaces, and production lock | Implemented in the bridge architecture and local contracts; live selector/menu UI accepted; server-backed mutations remain pending |
| TPI-STUDIOFLOW-013 | Local production-lock readiness | Implemented in local/bridge contracts; production behavior must remain protected and non-destructive |
| TPI-STUDIOFLOW-014 | Podcast/readiness and recording/storage boundaries | Partly represented in current application; physical-device and external-destination behavior requires separate acceptance |
| TPI-STUDIOFLOW-017 | Direct studio opening, save-before-switch, fail-closed switching, in-flight save handling, remembered studio restoration | Local contract 14/14; live editor UI accepted; live server-backed switch/save remains pending |
| TPI-STUDIOFLOW-019 | Intro/outro stage presentation, landscape 16:9, source-proportion preservation | Local contract 7/7 |
| TPI-STUDIOFLOW-020 | One-shot intro/outro playback and no accidental recording/livestream stop | Local contract 11/11 |
| TPI-STUDIOFLOW-021 | Unified Opera/browser workflow | Historical browser workflow; current acceptance must be repeated only with disposable or explicitly owner-controlled sessions |
| TPI-STUDIOFLOW-022 through 034 | Backup/recovery, active studio navigation, configuration integrity, title persistence, video overlay cleanup, real restore verification, startup, and Safari white-screen work | Implemented in varying degrees; each feature retains its own evidence level |
| TPI-STUDIOFLOW-037 | Safari/white-screen historical repair | Historical result retained; do not infer current browser compatibility from the old report alone |

### Workspace and My Studios directives

| Directive | Requirement recovered | Current status |
| --- | --- | --- |
| TPI-DEV-036 | D1-backed workspace persistence and configuration saves | Implemented in current backend/source contracts; live owner mutation not used in this repair |
| TPI-DEV-037 | Numbered Studios, list/create/select/switch, autosave, rename, duplicate, soft-delete/recover, last-selected restoration, ownership isolation, production locks, error handling | Offline contract 12/12; historical development acceptance reported 37/37; live UI accepted; live server-backed mutations remain pending |
| TPI-STUDIOFLOW-023 | Active studio navigation and workspace route restoration | Included in bridge and local test matrix |
| TPI-STUDIOFLOW-025 through 028 | Active workspace reconciliation, configuration integrity, title persistence, workspace repair | Included in current bridge/API behavior; protected owner state not rewritten |

### Persistence, backup, media, and recovery directives

| Directive | Requirement recovered | Current status |
| --- | --- | --- |
| TPI-STUDIOFLOW-047 | Recover completed development and preserve implementation history | Historical recovery basis; current source/runtime used for actual checks |
| TPI-STUDIOFLOW-048 | Persistent project saving, autosave, project identity, recovery snapshots, export/import, browser storage not being sole authority | Backend workspace/snapshot paths exist; current live authenticated save acceptance remains incomplete |
| TPI-STUDIOFLOW-049 | Portable configuration and complete backups, backup status, import validation, media references, browser download limitations | Local contracts exist; complete media-inclusive live acceptance is not claimed |
| TPI-STUDIOFLOW-022, 024, 030, 032, 033 | Backup architecture, local backup phases, real restore, and recovery verification | Historical and local evidence retained; no automatic owner restoration performed |
| TPI-STUDIOFLOW-031 | Video overlay cleanup | Local source/bridge behavior preserved; no live destructive media test |
| TPI-STUDIOFLOW-069 | Server-side custom media persistence, R2 references, authorization, workspace portability | Offline media contract 5/5; production media upload/retrieval was not exercised against owner data |

### Flicker, integration, release, and deployment directives

| Directive | Requirement recovered | Current status |
| --- | --- | --- |
| TPI-STUDIOFLOW-050 | Identify and eliminate full-page, React, persistence, asset, connection, and rendering loops | Offline stability contract 10/10; current bridge repair addresses a concrete DOM insertion failure |
| TPI-STUDIOFLOW-051/052 | Production migration readiness, fresh-browser initialization, missing session handling, no autosave of defaults | Historical requirements preserved; live schema writes were not performed here |
| TPI-STUDIOFLOW-053 | Read-only Crossroads data-integrity investigation | Preserved; no restore or owner-data repair performed |
| TPI-STUDIOFLOW-054/055 | Production preparation, source/integration reconciliation, one authoritative build | Source/build relationship documented; generated deployment output is separate from source |
| TPI-STUDIOFLOW-056/057 | Release checkpoint review and verification-test reconciliation | Test assertions were aligned to current contracts; no broad staging or unrelated commit performed |
| TPI-STUDIOFLOW-058 through 062 | Source checkpoint, website integration audit, backend separation, release-candidate review | Historical checkpoints preserved; current dirty working tree remains protected |
| TPI-STUDIOFLOW-063/064/065 | Master development registry and backend separation | Documentation and release-manifest work preserved; shared backend remains mixed-purpose and requires hunk-level care |
| TPI-STUDIOFLOW-066/067/068/069/070/071/072/073/074/075 | Isolated candidate preparation, acceptance, release blockers, media/guest readiness, final isolation, and controlled checkpoint | Historical release path; no unrelated changes were added in the latest repair |
| TPI-STUDIOFLOW-076 | Final production release preparation and approval gate | Production deployment authorization now exists from the owner, but schema/migration writes remain separately controlled |
| TPI-STUDIOFLOW-078/079 | Recover completed live functionality, connect production infrastructure, repair Brand 1/My Studios, deploy, verify | Latest live repair deployed; live selector/menu UI and 60-second stability accepted; server-backed persistence/media/guest acceptance remains pending |

The repository's archived StudioFlow directive search currently reaches
TPI-STUDIOFLOW-079. The PDFs contain later discussion and recommended next
work, but no later confirmed implementation record is treated as complete
without current source/runtime evidence.

### Related TPI development and operations directives

The StudioFlow work also depends on related non-StudioFlow directives:

- `TPI-DEV-011` through `TPI-DEV-035`: Administration, creator access,
  authentication, navigation, media/search, deployment, and shared website
  behavior. These must not be overwritten by a StudioFlow release.
- `TPI-OPS-002`: Development traffic protection.
- `TPI-OPS-004`: Cloudflare Worker inventory.
- `TPI-OPS-005`: Controlled development deployment.
- `TPI-OPS-006` through `TPI-OPS-021`: Local runtime, authentication,
  community, browser testing, local services, and article/traffic safeguards.
- `TPI-DEV-023`, `TPI-DEV-025`, and `TPI-DEV-027`: Studio deployment,
  backup/restore, acceptance, and controlled production release.

These related directives are dependencies and safeguards, not permission to
merge unrelated Administration, Community, Teams, or website experiments.

## Files and directories compared

### StudioFlow source files

The current authoritative StudioFlow source tree contains:

```text
/Users/toddknipple/Documents/StudioFlow/web/
  index.html
  package.json
  package-lock.json
  vite.config.ts
  tsconfig.json
  tsconfig.node.json
  src/App.tsx
  src/main.tsx
  src/styles.css
  src/useMediaDevices.ts
  src/storageLocations.ts
  src/pdfRenderer.ts
  src/googleDrive.ts
  src/vite-env.d.ts
  src/assets/BlackMountains.png
  src/assets/BlackWaves.png
  src/assets/BluePinkGradient.png
  src/assets/CyanSky.png
  src/assets/CyanWaves.png
  src/assets/Halloween1.png
  src/assets/Halloween2.png
  src/assets/Nebula.png
  src/assets/Planets.png
  src/assets/SFIcon.png
  scripts/check-destinations.mjs
  scripts/test-odysee-rtmp.mjs
  server/rtmp-bridge.mjs
  server/room-server.mjs
```

Primary source comparisons:

- `src/App.tsx`: StudioFlow UI, scenes, media, stage, recording,
  broadcasting, settings, workspace-facing behavior, and compositor behavior.
- `src/styles.css`: visual structure, asset panel, stage, controls, responsive
  layout, and the Brand 1 area that the bridge integrates with.
- `src/main.tsx`: application entry point.
- `vite.config.ts`: build output and asset generation.
- `package.json` and `package-lock.json`: build/test dependency provenance.
- `src/useMediaDevices.ts`: camera, microphone, and speaker behavior.
- `src/storageLocations.ts`: browser/file-system recording destination rules.
- `src/pdfRenderer.ts`: local document/media rendering path.
- `src/googleDrive.ts`: provider integration contract; do not treat provider
  presence as proof of live configured cloud persistence.
- `server/room-server.mjs`: local room development support.
- `server/rtmp-bridge.mjs`: local RTMP support; not proof of a production
  destination being configured.

### Generated website StudioFlow files

The live website integration currently compares these generated/deployment
files:

```text
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/studio/
  index.html
  assets/index-Cvy0xcXe.js
  assets/index-TsnuK4Ub.css
  assets/index-AccwBwcd.js       historical approved candidate asset
  assets/index-CjmN1suQ.js       historical source/build asset
  assets/index-j2x9m9vI.js        historical integrated asset
  assets/index-DXjilBOR.css       historical integrated CSS
  workspace-bridge.js
  workspace-asset-state-bridge.js
  production-lock-bridge.js
  brand-heading-bridge.js
  video-playback-reset-bridge.js
  backup-bridge.js
  backup-core.mjs
  navigation-bridge.js
  studioflow-012-overrides.css
```

The current HTML references:

- `/studio/assets/index-Cvy0xcXe.js`
- `/studio/assets/index-TsnuK4Ub.css`
- `/studio/workspace-bridge.js?tpi080=single-dropdown-v5`
- `/studio/workspace-asset-state-bridge.js?tpi080=media-sync-v2`
- `/studio/production-lock-bridge.js`
- `/studio/brand-heading-bridge.js?tpi074=legacy-brand-suppression-v1`
- `/studio/video-playback-reset-bridge.js?tpi031=video-overlay-v1`
- `/studio/backup-bridge.js?tpi032=restore-v1`
- `/studio/navigation-bridge.js`

Historical bundles are not deleted automatically. An unreferenced bundle is
not evidence that it is currently served.

### Website backend files

The following files are always compared at source and hunk level:

- `functions/api/[[path]].js`
  - Authentication and session endpoints.
  - Studio workspace list/create/get/update routes.
  - Duplicate, delete, restore, archive routes.
  - Workspace snapshots.
  - Studio media list/upload/retrieval routes.
  - Production start/heartbeat/stop/active routes.
  - Studio room and guest-token routes.
  - Live broadcast registration and state routes.
  - Existing Community, Administration, article, video, and member routes
    that must remain untouched.
- `worker.js`
  - Worker entry point.
  - Asset routing and `serveAssets` behavior.
  - API dispatch and route fallback behavior.
  - Public/protected route handling.
- `lib/auth.js`
  - Session extraction.
  - Authentication and ownership context.
  - Role and entitlement boundaries.
- `lib/outbound-fetch.js`
  - Local-only outbound request protection.
  - Production-safe fetch behavior.
- `lib/local-request-guard.js`
  - Local development protection only; must not become a production dependency.
- `wrangler.toml`
  - Production Worker, asset, D1, R2, compatibility-date, and route settings.
- `wrangler.local.toml`
  - Local-only bindings and guard values; never include in production release.
- `.dev.vars`
  - Local secrets/configuration; never expose or deploy.
- `scripts/local-dev.env`
  - Local-only environment; never include in production release.

### Database and storage files

The relevant schema and storage files are:

- `migrations/0053_studioflow_creator_production_lock.sql`
- `migrations/0054_studioflow_media_assets.sql`
- Earlier workspace, broadcast, room, guest, and production migrations in
  `migrations/`.
- `scripts/local-application-schema.mjs`
- `scripts/local-application-fixtures.mjs`
- `scripts/local-media-fixtures.mjs`
- `scripts/local-auth-fixtures.mjs`
- `studio/backup-core.mjs`
- `studio/backup-bridge.js`

Migration rules:

- Read the D1 ledger and physical schema separately.
- Do not replay additive migrations blindly.
- Do not reset production D1.
- Do not delete or overwrite owner records.
- A migration file being present does not mean it has been applied.
- A physical table being present does not prove the ledger is synchronized.

### Verification files

The StudioFlow-specific verification inventory includes:

```text
scripts/verify/tpi-studioflow-012-offline.mjs
scripts/verify/tpi-studioflow-012c-production-lock.mjs
scripts/verify/tpi-studioflow-012c-synthetic-model.mjs
scripts/verify/tpi-studioflow-014-offline.mjs
scripts/verify/tpi-studioflow-017-offline.mjs
scripts/verify/tpi-studioflow-019-video-stage.mjs
scripts/verify/tpi-studioflow-020-video-playback.mjs
scripts/verify/tpi-studioflow-023-active-studio.mjs
scripts/verify/tpi-studioflow-024-phase2.mjs
scripts/verify/tpi-studioflow-025-reconciliation.mjs
scripts/verify/tpi-studioflow-027-integrity.mjs
scripts/verify/tpi-studioflow-030-backup.mjs
scripts/verify/tpi-studioflow-031-video-overlays.mjs
scripts/verify/tpi-studioflow-032-restore.mjs
scripts/verify/tpi-studioflow-033-real.mjs
scripts/verify/tpi-studioflow-034-startup.mjs
scripts/verify/tpi-studioflow-036a-reset.mjs
scripts/verify/tpi-studioflow-037-safari.mjs
scripts/verify/tpi-studioflow-040-background-sections.mjs
scripts/verify/tpi-studioflow-040a-stale-assets.mjs
scripts/verify/tpi-studioflow-041-room-status-badge.mjs
scripts/verify/tpi-studioflow-041a-room-status-position.mjs
scripts/verify/tpi-studioflow-043-cache-busting.mjs
scripts/verify/tpi-studioflow-045-guest-audio.mjs
scripts/verify/tpi-studioflow-048-project-persistence.mjs
scripts/verify/tpi-studioflow-049-portable-backups.mjs
scripts/verify/tpi-studioflow-050-stability.mjs
scripts/verify/tpi-studioflow-052-fresh-browser.mjs
scripts/verify/tpi-studioflow-055-source-reconciliation.mjs
scripts/verify/tpi-studioflow-069-media.mjs
scripts/verify/tpi-dev-037-offline.mjs
```

Related local/browser/QA files are also compared when their scope intersects
StudioFlow:

- `scripts/e2e/tpi-dev-017-authenticated-browser.mjs`
- `scripts/e2e/tpi-ops-013-local-browser.mjs`
- `scripts/e2e/tpi-ops-015-local-browser.mjs`
- `scripts/e2e/tpi-ops-016-browser.mjs`
- `scripts/qa/tpi-dev-014-authenticated.mjs`
- `scripts/qa/tpi-dev-020-acceptance.mjs`
- `scripts/qa/tpi-dev-021-integration.mjs`
- `scripts/qa/tpi-dev-022-media-search-studio-events.mjs`
- `scripts/qa/tpi-dev-024-workspaces.mjs`
- `scripts/qa/tpi-dev-025-creator-acceptance.mjs`
- `scripts/qa/tpi-dev-037-final-acceptance.mjs`
- `scripts/qa/tpi-dev-037-my-studios.mjs`
- `scripts/qa/run-qa.mjs`

### Documentation files

The current handoff and status records are synchronized with:

- `docs/TPI-DEVELOPMENT/100-DIRECTIVES/DIRECTIVE-INDEX.md`
- `docs/TPI-DEVELOPMENT/TPI-CURRENT-DEVELOPMENT-STATUS.md`
- `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-079-RESULT.md`
- `docs/TPI-MASTER-DEVELOPMENT/03-TPI-CREATOR-SYSTEMS/01-TPI-CREATOR-STUDIO.md`
- `docs/TPI-MASTER-DEVELOPMENT/00-MASTER-DEVELOPMENT-CONTROL/05-RELEASE-REGISTER.md`
- `docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-MASTER-HANDOFF.md`

Historical directive result files remain under
`docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/` and are linked rather than
silently rewritten.

## Feature-by-feature status

| Feature | Local/source state | Live/deployment state | Remaining proof |
| --- | --- | --- | --- |
| Brand 1 replacement | Bridge replaces the legacy Brand 1 label with My Studios when the existing asset panel is present | New bridge deployed; live panel showed My Studios in the former Brand 1 area | Server-backed workspace acceptance |
| My Studios selector | Single full-width selector with current studio label and dropdown | New bridge deployed; live selector rendered and opened | Server-backed workspace acceptance |
| Studio Menu | Existing management actions are nested under the selector | Live menu opened and exposed 11 actions | Action-by-action mutation acceptance |
| Studio listing | `/api/studio/workspaces` and include-deleted list are used | Route remains in existing Worker | Authenticated live read with current owner session |
| Direct studio switching | Save-before-switch, production check, fail-closed behavior | Backend/bridge deployed from existing package | Disposable live workspace or owner-controlled non-destructive check |
| Workspace autosave | Debounced, overlapping-save guarded, server-confirmed status | Backend route and bridge deployed | Authenticated live save on disposable workspace |
| Project identity | Workspace IDs and broadcast linkage are checked before save | Existing route preserved | Live mutation acceptance |
| Rename/duplicate/delete/restore | Bridge actions and backend routes present | Existing production Worker retained | Live disposable workspace acceptance |
| Recovery snapshots | Snapshot list/create/detail/restore-as-new paths present | Existing routes retained | Live read/create on disposable workspace |
| Configuration export/import | JSON configuration backup path and validation present | Bridge deployed | Live browser download/import check |
| Complete project backup | Existing backup bridge/core integration present | Existing assets retained | Media-inclusive backup test |
| Portable backup status | Current/outdated/prepared/failed state model present | Bridge deployed | Live download confirmation workflow |
| Custom media | D1 metadata plus R2 object route implementation present | Existing D1/R2 bindings retained | Disposable live upload/retrieval and ownership test |
| Browser-local media | Existing IndexedDB/browser storage compatibility preserved | No owner browser data cleared | Fresh profile compatibility test |
| Scenes/layouts | Source bundle contains scene and layout UI | Current generated bundle deployed | Live editor visual and interaction acceptance |
| Backgrounds/motion backgrounds | Current bundle and asset state bridge present | Current generated assets deployed | Live editor asset-selection acceptance |
| Intro/outro | One-shot playback bridge and 16:9 stage contracts pass locally | Current generated assets and playback bridge retained | Live non-production playback check |
| Recording | Browser/local/external-folder contracts are represented | No recording data changed | Physical/browser destination acceptance |
| Guest room/Live Bridge | Existing room/guest routes and audio bridge preserved | No Live Bridge redesign | Safe disposable live guest acceptance |
| Authentication | Protected `/studio/`, API, and assets remain fail-closed | Live shell requires authentication | Authenticated and unauthenticated live matrix |
| Flicker/reload loop | Offline stability contract 10/10; reload paths absent | Latest bridge deployed; live panel remained stable for 60 seconds | Longer owner-session observation if required |
| Production lock | Server and bridge lock checks remain present | Existing binding/routes retained | Disposable production-session acceptance |

## Latest repair performed

### Root cause

The bridge's `injectIntoAssetPanel()` found `.brand-row` and then called
`host.insertBefore(panel, brand.nextSibling)`. That assumes the Brand row is a
direct child of `.asset-panel`. The bridge is integrated into a React-rendered
asset panel, and the Brand row can be nested under another direct child. When
the reference node is not a direct child, DOM insertion raises a
`NotFoundError`. The surrounding guarded startup then retries, but the visible
My Studios panel never becomes stable.

### Repair

The bridge now walks from the Brand row to the direct child of the asset-panel
host before inserting the panel. This preserves the existing host and React
structure. It does not replace the application bundle, change the API, change
authentication, change D1, change R2, or change owner data.

The HTML query string was rotated from `single-dropdown-v4` to
`single-dropdown-v5` so browsers request the repaired bridge instead of a
cached copy.

### Exact current source changes

- `studio/workspace-bridge.js`: corrected DOM insertion reference resolution.
- `studio/index.html`: rotated bridge cache-buster to v5.
- `scripts/verify/tpi-studioflow-017-offline.mjs`: aligned one stale assertion
  with the guarded current startup sequence.
- Documentation records: updated with the repair, deployment version, tests,
  and remaining live-editor verification limitation.

### Current hashes

```text
studio/index.html
9ebc7f0f08a8178ce92072ceabdf0f948e18efc7d5a69b5ae7e44fed1f398ede

studio/workspace-bridge.js
6f1d7045010c7c2053d00e03b517f2d89e9856bcb5e066b0a36ea267849d5676

scripts/verify/tpi-studioflow-017-offline.mjs
32f4241e0fa569540355e3c04d66ed7f2cb79db2d853c02bd4db164a787e7e62
```

The bridge and HTML were copied into the isolated deployment package and
verified with `cmp` before deployment.

## Tests run and results

### Focused offline contract suite

All of the following passed in the latest run:

```text
TPI-STUDIOFLOW-012   14/14
TPI-STUDIOFLOW-014   10/10
TPI-STUDIOFLOW-017   14/14
TPI-STUDIOFLOW-019    7/7
TPI-STUDIOFLOW-020   11/11
TPI-DEV-037          12/12
TPI-STUDIOFLOW-050   10/10
TPI-STUDIOFLOW-055   17/17
TPI-STUDIOFLOW-069    5/5
```

Commands used:

```sh
node scripts/verify/tpi-studioflow-012-offline.mjs
node scripts/verify/tpi-studioflow-014-offline.mjs
node scripts/verify/tpi-studioflow-017-offline.mjs
node scripts/verify/tpi-studioflow-019-video-stage.mjs
node scripts/verify/tpi-studioflow-020-video-playback.mjs
node scripts/verify/tpi-dev-037-offline.mjs
node scripts/verify/tpi-studioflow-050-stability.mjs
node --check studio/workspace-bridge.js
git diff --check -- studio/index.html studio/workspace-bridge.js scripts/verify/tpi-studioflow-017-offline.mjs
```

The tests cover:

- Bridge persistence boundary.
- Studio-scoped configuration and asset references.
- Independent Studio defaults.
- D1 workspace API contracts.
- Brand 1/My Studios replacement.
- Selector labels and management menu.
- Create/rename/duplicate/delete/restore contracts.
- Server-confirmed save statuses.
- Save-before-switch and in-flight save handling.
- Production lock protection.
- Intro/outro 16:9 stage behavior.
- One-shot compositor playback.
- No reload workaround or document navigation loop.
- Browser-local recording data remaining outside workspace JSON.
- Media persistence contract and R2 reference handling.

### Production D1 schema reconciliation read — 2026-10-20

A bounded read-only Wrangler query was run against the existing production D1
`tpi_contributor_portal`. It selected only StudioFlow schema metadata and the
migration ledger; it did not retrieve member records or media contents and it
reported zero writes.

Physical production schema confirmed:

- `studio_workspaces`, including `studio_number` and `deleted_at`.
- `studio_number_allocations`.
- `studio_production_sessions`.
- `studio_media_assets`.
- `studio_rooms`, including `production_session_id`.
- `live_broadcasts`, including `studio_workspace_id` and
  `production_session_id`.
- `studio_room_codes`, `studio_room_guests`, and `studio_room_signals`.
- Required StudioFlow indexes, including media ownership/workspace indexes,
  production-session status index, workspace indexes, and the live-broadcast
  workspace index.

The production `d1_migrations` ledger currently contains only:

- `0001_contributor_portal.sql`
- `0002_contributor_profiles.sql`

Therefore the physical schema is ahead of the ledger. This is not evidence that
0053 or 0054 should be replayed. The safe next step is a separately reviewed
ledger/schema reconciliation plan, followed by disposable end-to-end
acceptance. No production migration, ledger update, D1 write, R2 write, or
owner-workspace mutation was performed by this check.

An unauthenticated direct HTTP request to the live protected StudioFlow bridge
returned HTTP 403. The authenticated browser session was able to load the same
bridge and current bundles. This supports the fail-closed asset boundary, but
does not substitute for authenticated server-backed workspace/media acceptance.

A follow-up read-only count query found zero rows in production for
`studio_workspaces`, `studio_media_assets`, `studio_rooms`,
`studio_production_sessions`, and `live_broadcasts`. There is therefore no
existing disposable production fixture to reuse. Unauthenticated requests to
`/api/studio/workspaces`, `/api/studio/rooms`, and a workspace media route each
returned HTTP 401, confirming the routes are present and fail closed rather
than being absent.

### Historical directive verification recheck — 2026-10-20

The broader offline batch was also rerun. TPI-STUDIOFLOW-023 initially failed
4/14 because its maintained script still asserted the superseded
`active-title-v3` cache-buster and title-only `Select Studio` label contract.
The current documented contract is the explicit `My Studios: [current studio]
▾` selector and `single-dropdown-v5` bridge. The test was corrected to assert
that contract without weakening the reconciliation checks, and it now passes
14/14.

The remaining historical batches passed without source changes:

```text
TPI-STUDIOFLOW-024  23/23
TPI-STUDIOFLOW-025  11/11
TPI-STUDIOFLOW-027  21/21
TPI-STUDIOFLOW-030  13/13
TPI-STUDIOFLOW-031  12/12
TPI-STUDIOFLOW-032  11/11
TPI-STUDIOFLOW-033  10/10
TPI-STUDIOFLOW-041  10/10
TPI-STUDIOFLOW-041A 10/10
TPI-STUDIOFLOW-043  14/14
TPI-STUDIOFLOW-045  14/14
TPI-STUDIOFLOW-048  20/20
TPI-STUDIOFLOW-049  12/12
```

These are offline/source contracts. They do not substitute for live
server-backed save, media upload, or guest-room acceptance.

The current isolated development Worker also passed the authenticated synthetic
acceptance suites: TPI-DEV-025 Creator Studio 39/39, TPI-DEV-037 My Studios QA
32/32, and TPI-DEV-037 final acceptance 37/37. These covered workspace
creation/restoration, saves and version conflicts, import isolation, ownership
boundaries, numbering, rename, duplicate, archive/recovery, concurrent saves,
production deletion guards, and entitlement denial. Synthetic development rows
were archived by the harness; no production or RealtimeKit resource was used.

### Historical test evidence

Earlier records also report suites such as TPI-048, TPI-049, TPI-055,
TPI-069, and TPI-073 contract checks. These are preserved as historical
evidence. They are not substituted for the latest live authenticated test.

### Browser checks completed

Local:

- Local synthetic `local_admin` authentication was repaired only in isolated
  local D1 state.
- Local login returned success.
- Local StudioFlow home loaded.
- A disposable synthetic local stream/workspace was created.
- The current app entered the StudioFlow setup path.
- Browser automation became unreliable during the heavy editor/WebRTC stage;
  no owner data was involved.

Live:

- Authenticated live StudioFlow home loaded.
- Crossroads appeared in the live list.
- The live shell referenced
  `workspace-bridge.js?tpi080=single-dropdown-v5`.
- The current live Worker deployment completed successfully.
- Unauthenticated protection and existing bindings were not weakened.
- No production save, migration, media upload, restore, or owner-workspace
  mutation was performed.

### Live asset correspondence recheck — 2026-10-20

A fresh authenticated in-app browser session inspected the live StudioFlow
document before entering the heavy editor frame tree. The live document
reported the following StudioFlow runtime references:

```text
/studio/workspace-asset-state-bridge.js?tpi080=media-sync-v2
/studio/production-lock-bridge.js
/studio/workspace-bridge.js?tpi080=single-dropdown-v5
/studio/brand-heading-bridge.js?tpi074=legacy-brand-suppression-v1
/studio/video-playback-reset-bridge.js?tpi031=video-overlay-v1
/studio/backup-bridge.js?tpi032=restore-v1
/studio/assets/index-Cvy0xcXe.js
/studio/navigation-bridge.js
/studio/assets/index-TsnuK4Ub.css
```

A read-only `wrangler deployments list --name theparanormalinitiative --json`
recheck confirmed `93e5acef-6dc2-4d2d-aeed-edb72dda1c3c` is the current 100%
production version, created `2026-10-20T00:23:08.637106Z`. No deployment or
configuration write was performed by that inspection.

These references correspond to the current local `studio/index.html` and the
local generated bridge/bundle files. The two `index-Cvy0xcXe.js` and
`index-TsnuK4Ub.css` files are currently untracked generated artifacts in the
dirty worktree; `studio/index.html` and `studio/workspace-bridge.js` are
tracked files with local modifications. This confirms that the live page is
not serving the stale `index-j2x9m9vI.js` or `index-DXjilBOR.css` names that
remain as unreferenced historical/generated files in the dirty worktree.

The same session displayed the authenticated StudioFlow home and the protected
Crossroads entry. Clicking `Enter studio` caused the available browser
automation surface to time out while the editor's WebRTC/media frame tree was
initializing. That is an observation limitation, not evidence of a missing
asset; no additional live mutation was attempted.

The focused contracts were rerun on this date with these results:

```text
TPI-STUDIOFLOW-012  14/14
TPI-STUDIOFLOW-014  10/10
TPI-STUDIOFLOW-017  14/14
TPI-STUDIOFLOW-019   7/7
TPI-STUDIOFLOW-020  11/11
TPI-DEV-037         12/12
TPI-STUDIOFLOW-050  10/10
TPI-STUDIOFLOW-055  17/17
TPI-STUDIOFLOW-069   5/5
node --check studio/workspace-bridge.js  PASS
```

The post-entry live DOM assertion subsequently succeeded in the same browser
surface after reconnecting to the editor tab. `#tpi-my-studios-panel` was
present and visible; the selector rendered `My Studios: Crossroads of the
Unknown ▾`; the selector dropdown opened; and the nested Studio Menu exposed
11 management actions. A 60-second observation retained the panel and selector
without navigation or disappearance. The live editor also exposed Scenes,
Intro/Outro, backgrounds, motion backgrounds, media assets, recording, and
production controls.

The live panel reported `No server-saved Studios yet` while showing the
browser-local Crossroads configuration. Crossroads is protected, so no save,
create, delete, D1, or R2 mutation was attempted. Server-backed create,
switching, autosave, and media persistence remain pending a disposable
production identity/workspace or a separately approved owner-data operation.

Not yet conclusively verified live:

- Live save/autosave mutation on a disposable workspace.
- Live custom-media upload/retrieval on a disposable workspace.
- Live guest-room connection and microphone-isolation acceptance.
- Live physical recording destination behavior.
- Live production start/stop or broadcast behavior.

## Deployment history relevant to the current repair

The following versions are retained in the development records. The latest
one is authoritative for the current repair:

| Version | Role |
| --- | --- |
| `1a64e4bf-c783-425e-9bf3-d751ca7b79eb` | Earlier cache-busted/lifecycle-safe bridge deployment |
| `bc057478-ef7f-467c-8577-65f1a626fd8d` | Startup/lifecycle patch |
| `6edbdeea-0e91-4a01-8dbb-5a830a5bcc2f` | Guarded boot patch |
| `93e5acef-6dc2-4d2d-aeed-edb72dda1c3c` | Latest DOM insertion repair and v5 cache-buster |

Older Worker IDs in historical status documents may refer to other deployment
batches, Administration work, navigation work, or prior StudioFlow repairs.
Always verify the current Worker version before another release.

## Production safety and protected data

Protected owner assets:

- Studio: `Crossroads of the Unknown`
- Workspace ID: `43b20614-69da-4d82-af9d-063cace4b6cc`
- Broadcast ID: `studio-0ec3848f-5500-462c-a1da-f711d3148d49b`

The following are prohibited without a separate explicit, exact operation:

- Resetting or clearing production D1.
- Replaying all pending migrations.
- Deleting workspaces, studios, media, recordings, backups, or snapshots.
- Restoring Crossroads automatically.
- Clearing owner browser storage.
- Reading or displaying production member records or media contents.
- Exposing credentials, tokens, or secret values.
- Replacing the production Worker wholesale from a dirty development tree.
- Deploying `wrangler.local.toml`, `.dev.vars`, `scripts/local-dev.env`,
  `.local-dev/`, browser profiles, or local databases.
- Redesigning or replacing the existing Live Bridge.

The latest repair performed no production D1 or R2 writes. It uploaded only
two static assets to the existing Worker deployment.

## What is done

1. The local and live StudioFlow source/integration relationship is identified.
2. The current source repository, website repository, generated assets,
   bridge files, backend handlers, migrations, and verification scripts are
   cataloged.
3. The Brand 1/My Studios bridge lifecycle is implemented in the website
   integration.
4. The single-dropdown and nested Studio Menu behavior is implemented in the
   current bridge source.
5. The concrete DOM insertion failure was repaired.
6. The current bridge was cache-busted to v5.
7. Focused offline contracts pass.
8. The repair was deployed to the existing production Worker.
9. The live authenticated StudioFlow home and current bridge reference were
   observed.
10. Documentation was synchronized without committing or pushing.

## What is not yet done or not yet proven

1. A reliable fresh authenticated live-editor DOM capture after WebRTC/media
   initialization.
2. Live visual confirmation that the repaired My Studios panel is visible
   after entering the editor.
3. Live selector/menu click confirmation.
4. Disposable live workspace save/switch/autosave mutation acceptance.
5. Disposable live custom-media upload/retrieval and ownership acceptance.
6. Safe live guest-room and microphone-isolation acceptance using disposable
   credentials/gateway.
7. Full physical-device recording destination acceptance.
8. Full supported-broadcast-destination acceptance.
9. Any future D1 migration or ledger reconciliation that may be required by
   a separately approved production release.
10. A claim that every historical directive from the PDFs is complete in the
    current live environment.

## Recommended continuation order

### Step 1: Verify the repaired live editor visually

Use the already authenticated live browser session:

1. Refresh `https://paranormalinitiative.com/studio/`.
2. Select the existing Crossroads entry only for non-destructive viewing.
3. Enter the editor.
4. Confirm the Brand 1 row is replaced by the My Studios selector.
5. Open the selector and confirm the existing Studio Menu actions.
6. Do not click Save, Delete, Restore, Complete Backup, or production controls
   during this first check.

If the panel is absent, capture the visible editor screenshot and browser
console/network evidence before another code change.

### Step 2: Test a disposable live workspace

Only after Step 1 is visually stable:

1. Create a disposable test Studio using the owner-approved account.
2. Save a harmless configuration change.
3. Refresh and confirm restoration.
4. Switch between disposable Studios.
5. Confirm save failure behavior only with a controlled test, not by damaging
   a production record.
6. Delete or clean up only the disposable workspace after recording its result.

### Step 3: Test media and recovery separately

Use synthetic media and a disposable workspace. Verify that custom media and
configuration references behave as documented. Do not treat recordings as
custom Studio media and do not alter Crossroads media.

### Step 4: Test guest/Live Bridge separately

Use the existing Live Bridge and a disposable room/gateway. Do not rebuild the
guest system and do not fabricate a successful WebRTC result if the required
test configuration is unavailable.

### Step 5: Update the status records

After each verified batch, update:

- `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-079-RESULT.md`
- `docs/TPI-DEVELOPMENT/TPI-CURRENT-DEVELOPMENT-STATUS.md`
- `docs/TPI-MASTER-DEVELOPMENT/03-TPI-CREATOR-SYSTEMS/01-TPI-CREATOR-STUDIO.md`
- `docs/TPI-DEVELOPMENT/100-DIRECTIVES/DIRECTIVE-INDEX.md`
- This handoff document.

Do not mark the overall StudioFlow mission complete until live acceptance
evidence exists for the specific feature being reported.

## Reusable verification commands

From the website repository:

```sh
cd /Users/toddknipple/Documents/GitHub/paranormal-initiative-website

node scripts/verify/tpi-studioflow-012-offline.mjs
node scripts/verify/tpi-studioflow-014-offline.mjs
node scripts/verify/tpi-studioflow-017-offline.mjs
node scripts/verify/tpi-studioflow-019-video-stage.mjs
node scripts/verify/tpi-studioflow-020-video-playback.mjs
node scripts/verify/tpi-dev-037-offline.mjs
node scripts/verify/tpi-studioflow-050-stability.mjs
node scripts/verify/tpi-studioflow-055-source-reconciliation.mjs
node scripts/verify/tpi-studioflow-069-media.mjs
node --check studio/workspace-bridge.js
git diff --check
```

For local-only runtime work, confirm the configuration before starting a
Worker:

```sh
node scripts/verify-development-config.mjs
```

Use `wrangler.local.toml`, local D1/R2 state, and synthetic credentials only.
Do not substitute the production Wrangler configuration for local testing.

## Git and release-control rules

- Preserve the current dirty website working tree.
- Do not use `git add .` or `git add -A` for StudioFlow work.
- Use an explicit reviewed file manifest.
- Review shared backend hunks before including them.
- Never include local secrets, browser state, recordings, owner media,
  backups, or local databases.
- Do not commit or push unless a separate owner-approved checkpoint authorizes
  the exact files and message.
- Do not use the dirty development branch as an implicit production release.
- Keep source repository, generated website output, deployment package, Worker
  version, and live verification as separate provenance records.

## Final handoff decision

The current repair is deployed, the local StudioFlow contracts pass, and the
live selector/menu UI plus 60-second editor stability have now been accepted.
The remaining task is not another broad rebuild or historical investigation.
It is bounded server-backed persistence/media/guest acceptance using a
disposable production identity/workspace or a separately approved owner-data
operation. The protected Crossroads workspace must not be used to manufacture
that evidence.

Current decision: **continue with disposable server-backed acceptance; do not
declare the entire StudioFlow release complete yet.**

## TPI-STUDIOFLOW-081 controlled production acceptance — 2026-10-20

The owner-authorized disposable acceptance fixtures are now provisioned in
production without changing Crossroads. `TPI Acceptance Test A` was created by
the authenticated UI and has server workspace ID
`e5fe2c59-4209-4c59-aa52-7d869b049216`; `TPI Acceptance Test B` is the second
active fixture with server workspace ID
`2d851f4e-31b6-4fc4-87be-31b59e1f1103`. A controlled additive D1 fallback was
used for B after the browser editor automation became unstable. The refreshed
authenticated workspace API returns both rows; Crossroads remains at zero
server workspace rows.

The final production asset repair is Worker
`4fc9bcda-4b17-4c3a-a1f4-cc6d213a07de`. The package uploaded only the current
`studio/index.html` and `studio/workspace-bridge.js`, preserving existing
bindings and Worker code. The bridge includes the browser-local Crossroads
configuration export fallback, but the download destination was not
independently confirmed by the browser automation surface.

This batch is **PARTIAL**. A full live editor save/autosave/refresh/switch/
isolation observation, synthetic production media test, and RealtimeKit guest
acceptance remain pending. The full editor became unstable for accessibility
capture during media/frame initialization, so no unobserved behavior is being
called passed. Retain A and B until owner-approved cleanup.
## TPI-STUDIOFLOW-082 browser acceptance recovery — 2026-10-20

The owner reported that My Studios does not drop down in the live editor.
This run deliberately stopped before another deployment. A fresh live Home
surface was stable, but entering the editor caused the browser automation
surface to time out during targeted DOM/AX inspection and screenshot capture;
the same automation input failed to activate ordinary controls in the local
editor. The current evidence therefore identifies an automation/CDP blocker,
not a confirmed application defect. The source bridge still contains the
selector click handler, `aria-expanded` toggle, and visible-menu CSS.

No production code or data was changed. TPI-082 is **PARTIAL**. The next
required evidence is a reliable manual or alternate-browser click on the
authenticated live My Studios control, followed by the independent A/B
save/switch/refresh acceptance cycle. Crossroads remains protected.
