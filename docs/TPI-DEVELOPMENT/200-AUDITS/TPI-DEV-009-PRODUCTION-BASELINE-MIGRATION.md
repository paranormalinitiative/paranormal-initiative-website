# TPI-DEV-009 — Production Baseline Migration Audit

Date: 2026-10-13
Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
Branch: `codex/tpi-development`
Cloudflare account: `221ea5479876fd303ddc87002b9e892d`

## Result

**Development deployment completed and verified. Production was not deployed or modified.**

The source-integrity issue from TPI-DEV-008 was resolved narrowly. Three dirty application files were proven byte-identical to the current production response, and the dirty sitemap generator was supported by the matching production sitemap output. A missing StudioFlow room-relay schema was added as an additive development migration only.

## Baseline and source reconciliation

| Item | Finding | Status |
| --- | --- | --- |
| Canonical repository | `git@github.com:paranormalinitiative/paranormal-initiative-website.git` | VERIFIED |
| Development branch | `codex/tpi-development` | VERIFIED |
| Source commit deployed | `7f3a3f14c517e526dccaec4d382d2c0a0306a5f9` | VERIFIED |
| Production source commit | Cloudflare reports `Unknown (deployment)`; no exact Git revision is available | UNKNOWN |
| Production current version before this work | `7e357215-2579-4c60-b27e-dd572a5656fe` | VERIFIED |
| Previous effective development version | `c8432743-71c7-4b5c-8cd1-9503cb81e038` | VERIFIED |

The following files were reconciled and committed; no unrelated application files were staged:

- `index.html` — local SHA-256 `c4992174b729e1b8d220c24dfd041951d3de008fe9041f747ed1b86d6e0c2c6f`, matching the production `/` response.
- `education-center.html` — local SHA-256 `8615ead285dbf7b2189ebec12358cfddc6610874044254262cb11a1ef7f3f831`, matching the production response.
- `sitemap.xml` — local SHA-256 `a736f2eecf16d29b6ce02d9d6f4fb3f9aaeae8d9e0b36d456e089fc52aba9b16`, matching production.
- `scripts/build-sitemap.js` — its exclusion and `noindex` behavior produces the matching production sitemap; the exact production source revision remains unavailable.
- `migrations/0049_studioflow_room_relay.sql` — new additive migration for the verified missing development relay tables.

The pre-existing dirty StudioFlow readiness document and the 2026-10-09 audit/research files remain uncommitted and untouched. They were preserved by the TPI-DEV-009 recovery checkpoint and excluded from the deployment package.

## Root cause of the prior deployment integrity problem

The clean archive used during TPI-DEV-008 did not contain the full intended application state. The working tree included application files that were not represented by the earlier Git revision, so a clean-checkout deployment could be internally consistent while omitting live baseline changes. TPI-DEV-008 added a fail-closed preflight; TPI-DEV-009 established which application overlay files were current production baseline and committed only those files.

The development deployment script now reports the source revision and refuses undocumented application changes. The validated source is reproducible from `7f3a3f1`; documentation-only dirty files are allowed and are excluded from the package.

## Development database compatibility

Read-only comparison found that development already had the applied `0041_live_interaction.sql` tables `live_broadcasts`, `live_comments`, and `live_reactions`. It lacked `studio_room_guests` and `studio_room_signals`, even though the current room-relay API directly reads and writes them. Production schema inspection verified their columns and types. The new migration mirrors that existing production table shape without copying data.

Applied only to development D1:

- Database: `tpi_contributor_portal_dev`
- ID: `4948ecc5-35de-4782-8f6b-b07fa1782b66`
- Migration: `0049_studioflow_room_relay.sql`
- Result: both tables present; row counts were zero; read-only verification reported zero rows written.

Production D1 `tpi_contributor_portal` was not migrated. Production R2 and development R2 remained separate (`tpi-contributor-media` versus `tpi-contributor-media-dev`). No private production data or media was copied.

## Build and verification

Passed:

- Development source preflight: `reproducibleFromHead: true`; Worker `theparanormalinitiative-dev`; development D1/R2 bindings; no uncommitted application files.
- Admin Center build: `tsc -b && vite build` passed. Vite emitted only a non-blocking chunk-size warning.
- Worker/API/script syntax checks and `git diff --check` passed.
- Existing video format, player, media grid, navigation, and Admin Center regression suites passed; Admin Center preview checks: `78/78`.
- Development smoke suite: `10/10`.
- Production smoke suite: `10/10`.
- Development `/tpi-videos.html`: HTTP 200; development feed/video checks returned the expected development markers.
- Anonymous development `/studio/`: HTTP 403.
- Anonymous development `/admin-center-preview/`: HTTP 403.
- Development `/live-video`: HTTP 200 with `Coming Soon`.
- Development and production sitemap SHA-256: both `a736f2eecf16d29b6ce02d9d6f4fb3f9aaeae8d9e0b36d456e089fc52aba9b16`.

Not fully verified:

- Owner-authenticated production StudioFlow workflows, because no owner credentials or session were used.
- Full local API E2E harness, which remains blocked by the existing Wrangler `spawn EBADF` issue.
- Physical-device media workflows and external provider livestreaming.

## Deployment

Development-only deployment:

- Worker: `theparanormalinitiative-dev`
- URL: `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/`
- Version/deployment ID: `a6dded19-2f63-4a98-88c4-30ed3d02ca1b`
- Source: `7f3a3f14c517e526dccaec4d382d2c0a0306a5f9`
- D1: `tpi_contributor_portal_dev`
- R2: `tpi-contributor-media-dev`
- Cron: none in `wrangler.dev.toml`

Production deployment history still ends at `7e357215-2579-4c60-b27e-dd572a5656fe`; no production deploy command was run. `/admin-panel` and Creator Studio protection remained unchanged in the production smoke checks.

## Git and recovery

Committed and pushed only:

- `7f3a3f1` — `dev: reconcile production baseline and StudioFlow relay schema`

The private recovery checkpoint is `/private/tmp/tpi-dev-009-recovery-20261013/`; it contains the tracked patch, safe untracked documentation archive, file hashes, and baseline deployment context. Existing unrelated dirty work remains in the working tree and is not part of this commit.

## Owner verification URLs

- Development website: https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/
- Development TPI Videos: https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/tpi-videos
- Development Administration Center: https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/admin-center-preview/
- Development StudioFlow: https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/studio/

Owner acceptance remains pending. An owner-authenticated browser session is required to verify protected Administration Center and StudioFlow workflows; anonymous `403` responses verify protection only, not authenticated functionality.

## Remaining limitations

- Production has no recoverable exact Git source revision in Cloudflare deployment metadata.
- Public data intentionally differs between production and development; development uses isolated synthetic/test content.
- Broader authenticated member, admin, StudioFlow, Messenger, and responsive browser acceptance remains owner testing.
- The current local E2E runner still needs a separate Wrangler/Node investigation for `spawn EBADF`.
- The new relay migration is applied to development; production already had the tables and was intentionally left unchanged.
