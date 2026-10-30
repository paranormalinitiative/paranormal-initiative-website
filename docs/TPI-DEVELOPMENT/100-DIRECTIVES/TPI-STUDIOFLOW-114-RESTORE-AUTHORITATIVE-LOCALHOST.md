# TPI-STUDIOFLOW-114 — Restore the authoritative local development environment

Date: 2026-10-29
Result: **COMPLETE / AUTHORITATIVE LOCALHOST VERIFIED / NOT DEPLOYED**
Production deployment: **PROHIBITED / NOT PERFORMED**
Data migration: **PROHIBITED / NOT PERFORMED**

## Objective and outcome

Directive 114 restored clarity around the owner-used StudioFlow localhost. The
authoritative environment is the existing local-only Cloudflare Worker at:

`http://127.0.0.1:8787/studio/`

The Worker was already running and was preserved. Its owner-facing persistent
state was not cleared, migrated, recreated, renamed or deleted. The redundant
Directive 113 preview at port 5192 was classified and stopped safely after its
source and evidence were preserved.

Teleprompter 092 was **not** staged into 8787 by this directive. The active
8787 asset is the approved Video Setup 091 bundle. This is intentional: the
directive required environment restoration and a safe integration path, while
the source-provenance manifest remains pinned to 091 and 8787 contains
persistent owner data. No asset replacement or data migration was authorized
or performed.

## Required documentation review

Reviewed before changes:

- Root `AGENTS.md`.
- `TPI-MASTER-AUTONOMOUS-AGENT-AUTHORITY.md`.
- `TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md`.
- `TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`.
- `009-TESTING-AND-VERIFICATION.md`.
- `TPI-CURRENT-DEVELOPMENT-STATUS.md`.
- `TPI-DEVELOPMENT-AGENT-HANDOFF.md`.
- `DIRECTIVE-INDEX.md`.
- Historical StudioFlow directive records 087–092 where available, and
  records 106–113.
- Existing local Worker configuration, launcher, status output, source
  provenance record and localhost/development records.

The documentation already identified `http://127.0.0.1:8787/` as the local
website and StudioFlow integration target in the runbook and source-to-live
workflow. Directive 113 failed to follow that established path because it
created a standalone Vite preview at 5192 for isolated feature acceptance and
reported that preview as the development access path. The omission was
procedural, not a missing port convention. This record and the canonical
workflow now make the distinction mandatory.

## Pre-change preservation state

| Location | Verified state |
| --- | --- |
| Website repository | `codex/tpi-development`, pre-change HEAD `fb74535495c076c2539467d395b86b72abdb5eab`; only the two pre-existing untracked historical directive files remained |
| Original StudioFlow checkout | `/Users/toddknipple/Documents/StudioFlow/web`, branch `main`; pre-existing `src/App.tsx` and `src/styles.css` modifications preserved |
| Teleprompter source worktree | `/Users/toddknipple/Documents/StudioFlow/web-109`, branch `codex/studioflow-109-teleprompter`, clean at `05a9aa5cd7b4ccb94d11162f244d2281fcd572bb` |
| D113 staging worktree | `/Users/toddknipple/Documents/StudioFlow/web-113-staging`, detached and clean at `05a9aa5cd7b4ccb94d11162f244d2281fcd572bb`; retained after stopping preview |
| Production Worker | Existing identity `91a8460e-1db1-440c-9643-a85b6e178fba`; not contacted or changed |
| Production asset baseline | 091 baseline and production manifest unchanged |

## Port 8787 — authoritative owner environment

| Inspection point | Verified result |
| --- | --- |
| Listener | `workerd` PID 1363; launcher PID 1185; Wrangler child PID 1300 |
| Startup | `npm run dev:local` / `node scripts/local-dev.mjs`, which launches local Wrangler with `wrangler.local.toml`, `--local`, `--persist-to .local-dev/state`, loopback IP and port 8787 |
| Working directory | `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website` |
| Repository | Website repository, branch `codex/tpi-development`, HEAD `fb74535495c076c2539467d395b86b72abdb5eab` at inspection time |
| Runtime | Local Cloudflare Worker in `workerd`, not Vite; loopback-bound and outbound-disabled |
| Backend | `wrangler.local.toml`: local D1 `tpi-local-foundation`, local R2 `tpi-local-media`, `TPI_ENV=local`, `TPI_LOCAL_ONLY=1` |
| Assets | `.local-dev/assets/studio/assets/index-D1h4nSZd.js` SHA-256 `4eed57a4f243c9474fb73957d9e567defb2bb43ef3bcc82c1749ba02cf92557`; `index-CcFjA_0p.css` SHA-256 `8501862945034d73a08df30e81291891491536edd82f16e0074b98a933e4cf69` |
| Anonymous/authenticated boundary | Anonymous `/api/auth/me` returned `200` with `{"user":null}`; protected `/api/studio/workspaces` returned `401`. No credential was printed or changed. |
| Browser origin | `http://127.0.0.1:8787`; the runbook requires this exact origin for local authenticated cookies |
| Studio records | Local D1 `studio_workspaces` and `studio_media_assets`, plus the existing browser-local StudioFlow records/snapshots described by the 087 architecture report |
| Recording/media storage | Local R2 `tpi-local-media` for Worker media objects and browser IndexedDB `studioflow-recordings`/browser library layers for StudioFlow recordings |
| Scripts/preferences | Existing StudioFlow browser-local storage remains origin-scoped. The approved 092 source uses `studioflow.teleprompterScripts` and `studioflow.teleprompterStudioState.v1`; those 092 behaviors were not claimed as present on the active 091 asset |

Read-only persistence inspection found 1,018 `studio_workspaces` rows, 951
`studio_media_assets` rows, one `studio_production_sessions` row, and 3,894
R2 objects. No row or object was modified.

The endpoint remained available after the preview was retired. Anonymous
`/studio/` returned the expected `403` gate, and the Worker status remained
RUNNING on port 8787.

## Port 5192 — temporary D113 preview

| Inspection point | Verified result |
| --- | --- |
| Listener | Node/Vite PID 45602; stopped by the maintained terminal session after this audit |
| Startup | `npm run preview -- --host 127.0.0.1 --port 5192` |
| Working directory | `/Users/toddknipple/Documents/StudioFlow/web-113-staging` |
| Source | Detached commit `05a9aa5cd7b4ccb94d11162f244d2281fcd572bb` |
| Runtime/backend | Vite static preview; no Cloudflare Worker, D1/R2 binding or authenticated backend |
| Assets | `index-Ce54wjuX.js` SHA-256 `4440217bc7fb07807bf0e47630906c9b59c0050e8d6c8a97bbe29ecc9bc96fa6`; `index-D7-9JtPq.css` SHA-256 `be00c2115d1f8014a015d7c07a527684b1c4b328b401177475fe52dd27441fed` |
| Browser origin/storage | `http://127.0.0.1:5192`; separate localStorage/IndexedDB/cookie origin from 8787; D113 used disposable browser profiles/data |
| Owner data | No owner D1/R2 data, authenticated session or 8787 browser storage was used |
| Final status | Stopped; port 5192 no longer had a listener. Worktree and D113 evidence remain intact |

### Brand 1 discrepancy

Brand 1 is a built-in StudioFlow default label in the feature source; its
presence is not proof that a bundle is old. The observed difference was caused
by different origins and runtimes: 8787 is an authenticated Worker-backed
origin with persistent local D1/R2 and bridge assets, while 5192 was a fresh
standalone Vite origin with independent browser-local state and no Worker API.
The two environments were never equivalent and no Studio was copied or
renamed to make them look alike.

## Recovery snapshot and verification

Before stopping 5192, the following snapshot was created and verified:

`/private/tmp/tpi114-backup-20261029-2335`

- D1 SQLite backup: `owner-d1.sqlite`; `PRAGMA integrity_check` returned `ok`;
  Studio counts remained 1,018 workspaces and 951 media rows.
- R2 metadata backup: `r2-metadata.sqlite`; integrity returned `ok` and the
  object count was 3,894.
- R2 media copy: `r2-tpi-local-media`, 3,894 blobs, approximately 81 MB.
- Runtime/config snapshots: `local-worker.json`, `wrangler.local.toml` and
  `index.html`.
- Browser-local owner storage was not copied, cleared or opened; it remains in
  place at the exact 127.0.0.1:8787 origin. The source and historical storage
  records identify its localStorage/IndexedDB mechanism without exposing its
  contents.

## Teleprompter 092 integration path

The active 8787 bundle is the 091 asset pair, not the D112 feature build. The
active asset lacks `studioflow.teleprompterStudioState.v1`, the Studio-scoped
assignment marker, and the presenter-only marker that are present in the D113
feature bundle. Therefore Teleprompter 092 is **not present on 8787**.

The safe future path is:

1. Preserve the current production baseline manifest and 8787 owner state.
2. Create a separate reviewed development candidate that records approved
   source commit `05a9aa5cd7b4ccb94d11162f244d2281fcd572bb` and both generated
   feature asset hashes.
3. Build from an isolated clean worktree, stage only the verified feature
   assets into a development integration surface, and keep the bridge/API
   layer compatible with the local Worker.
4. Authenticate against preserved 8787 state in Firefox Developer Edition,
   verify existing Studio selection, recordings, scripts and preferences, and
   rerun the required Teleprompter/audio/privacy regressions.
5. Only after that reviewed development acceptance decide whether a later
   release directive updates the source baseline. No such integration was
   performed by Directive 114.

## Verification results

| Check | Result |
| --- | --- |
| 8787 listener and launcher | PASS — maintained Worker remained running |
| 8787 source/config/runtime identity | PASS |
| Owner D1/R2 persistence snapshot | PASS — integrity verified; counts/object set preserved |
| Owner browser storage | PRESERVED — not cleared, migrated or modified; contents not opened |
| Owner Studios/recordings | PRESERVED — persistent stores unchanged; no recreation or migration |
| 5192 classification | PASS — temporary D113 Vite preview identified |
| 5192 retirement | PASS — only PID 45602 preview stopped; port closed |
| Teleprompter 092 on 8787 | NO — not staged; 091 asset remains active |
| Production | PASS — no production endpoint, Worker, route, manifest, credential or data change |

## Files changed

- `docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-STUDIOFLOW-114-RESTORE-AUTHORITATIVE-LOCALHOST.md`
- `docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`
- `docs/TPI-DEVELOPMENT/TPI-CURRENT-DEVELOPMENT-STATUS.md`
- `docs/TPI-DEVELOPMENT/TPI-DEVELOPMENT-AGENT-HANDOFF.md`
- `docs/TPI-DEVELOPMENT/100-DIRECTIVES/DIRECTIVE-INDEX.md`

No StudioFlow source, generated 8787 asset, production manifest, D1 row, R2
object, browser storage entry, owner Studio or recording was changed.
