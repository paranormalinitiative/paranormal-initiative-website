# TPI-DEV-003 Development Workflow Verification

**Mode:** Read-only inspection and proposal

**Date:** 2026-10-12

**Implementation performed:** None

## Executive result

The canonical GitHub checkout is the latest TPI website source. The Desktop checkout is an older, independently dirty working copy that contains unique Paranormal Teams verification material and modified StudioFlow/member-site files. It must be preserved and must not be copied over the canonical checkout.

The current repository has no isolated development branch or Cloudflare development environment. Both checked-out Wrangler configurations target the production Worker and production D1/R2 resources. GitHub pushes currently trigger the QA workflow only; they do not automatically deploy Cloudflare. A manual Wrangler deploy from either folder would target production.

This report proposes a safe workflow but does not create it.

## Workspace comparison

| Workspace | HEAD / date | Branches | Git status | Wrangler target | Assessment |
| --- | --- | --- | --- | --- | --- |
| `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website` | `3579fe8` on 2026-10-12; `origin/main` is `f09e4e6` | local `main`, `seo-indexing-foundation`; remote `origin/main`, `origin/cloudflare/workers-autoconfig`, `origin/seo-indexing-foundation` | Local `main` is ahead by one unpushed documentation commit plus unrelated dirty files | `theparanormalinitiative`; production D1/R2 | **Canonical/latest source** |
| `/Users/toddknipple/Desktop/paranormal-initiative-website` | `3ba8d1d` on 2026-10-06; aligned with its `origin/main` | local `main`; remote `origin/main`, `origin/cloudflare/workers-autoconfig`, `origin/seo-indexing-foundation` | Modified site/StudioFlow files and untracked data/scripts | Same Worker, same production D1/R2 | **Preserved research/development copy; not release source** |

The Desktop folder is the existing TPI-named Desktop workspace Todd originally used for website development. Its exact historical purpose is not encoded in a formal repository marker, but its age, branch, matching remote, and unique working material identify it as the older development/research copy.

## Desktop work at risk

The Desktop checkout contains approximately 188 MB under untracked `data/`, including Paranormal Teams verification evidence, CSV inputs, review queues, JSONL results, handoffs, and enrichment tools. It also contains untracked `scripts/scrape-teams.py` and `scripts/scrape-teams-v2.py`.

Modified Desktop tracked files include:

- `live-video.html`
- `member-shell.css`
- `member-shell.js`
- `member-sidebar.html`
- `podcast.html`
- `MASTER_BUILD_PLAN.md`
- `STUDIOFLOW_FULL_AUDIT.md`
- `STUDIOFLOW_MASTER_TODO.md`
- `STUDIOFLOW_READINESS_AUDIT.md`
- `TPI_STUDIOFLOW_AND_SITE_REBUILD_PLAN.md`

These files were inspected only; none were moved, deleted, overwritten, staged, or committed. The data should be separately reviewed before any future archival or migration decision.

## Repository and branch findings

Both workspaces point to:

`git@github.com:paranormalinitiative/paranormal-initiative-website.git`

The canonical checkout has no dedicated development branch. The recommended future branch is `codex/tpi-development` (or another owner-approved name), created only after approval. The Desktop checkout must not be used as a second push source.

The canonical checkout currently has unrelated dirty files and one local documentation commit not pushed to `origin/main`. TPI-DEV-003 does not alter, clean, reset, or push that state.

## Cloudflare production verification

Read-only Wrangler checks confirmed:

- Account: `221ea5479876fd303ddc87002b9e892d`
- Worker: `theparanormalinitiative`
- Website: `https://paranormalinitiative.com/`
- D1 binding: `TPI_DB` -> `tpi_contributor_portal`, ID `f36b9161-b517-4634-9857-bef4147cefe3`
- R2 binding: `TPI_MEDIA` -> `tpi-contributor-media`
- Cron: `0 */6 * * *`
- Secret names: `RESEND_API_KEY`, `RESEND_FROM`, `TPI_OWNER_SETUP_KEY` (values not inspected)
- Latest observed production deployment version: `7e357215-2579-4c60-b27e-dd572a5656fe`

Authentication is D1-backed through the host-only `tpi_session` cookie and the shared production sessions table. This is not a development boundary.

## GitHub automation verification

The only checked-in GitHub workflow is `.github/workflows/qa.yml`. It runs the TPI quality gate on pushes, pull requests, and manual dispatch. It has read-only repository permissions and contains no Wrangler deploy command.

The deployment instructions in `MIMO_DIRECTIVE.md` describe a manual `npx wrangler deploy` from the repository. Therefore:

- A GitHub push currently triggers QA, not Cloudflare deployment.
- A manual Wrangler deploy from the canonical checkout targets production.
- A manual Wrangler deploy from the Desktop checkout also targets production because both Wrangler files use the same Worker and production resource identifiers.
- No development deployment should be attempted with either current Wrangler file.

## Current status

| Requirement | Status | Finding |
| --- | --- | --- |
| Canonical latest source identified | VERIFIED | GitHub checkout is newer and contains the current Administration Center and development documentation |
| Desktop unique work identified | VERIFIED | 188 MB verification data plus modified site/StudioFlow files |
| Production configuration verified | VERIFIED | Worker, D1, R2, cron, auth, and secret names confirmed read-only |
| GitHub auto-deploy verified | VERIFIED | No auto-deploy; QA workflow only |
| Dedicated development branch | NOT IMPLEMENTED | Requires owner approval |
| Independent Cloudflare development | BLOCKED | Separate Worker/D1/R2/auth resources do not exist |
| Production changed by TPI-DEV-003 | NO | No deployment or infrastructure mutation performed |
