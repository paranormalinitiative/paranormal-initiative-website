# TPI-ADMIN-006 Baseline

Date: 2026-10-12
Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
Branch: `main`
Baseline HEAD: `88178d2aaab00058f85affda47093723f2f9e20b`

## Safety boundary

This directive continues the isolated ADMIN-005 React/Refine preview. The
production Administration Center remains `/admin-panel`; this batch does not
replace it. The preview is served at `/admin-center-preview/` and is protected
in `worker.js` for owner/admin sessions, including direct asset requests.

No production database, R2 object, authentication system, Creator Studio
system, or public `/live-video` behavior is changed by this baseline.

## Working-tree boundary

Pre-existing unrelated changes observed before ADMIN-006 are intentionally
excluded from this directive:

- `STUDIOFLOW_READINESS_AUDIT.md`
- `education-center.html`
- `index.html`
- `scripts/build-sitemap.js`
- `sitemap.xml`
- existing `docs/audits/2026-10-09/` material and the competitive-audit report

Only ADMIN-006 files and the existing `admin-center-app/` preview source are
eligible for this batch. No unrelated dirty file may be staged.

## Cloudflare target

- Account: `221ea5479876fd303ddc87002b9e892d`
- Worker: `theparanormalinitiative`
- D1: `TPI_DB` → `tpi_contributor_portal` →
  `f36b9161-b517-4634-9857-bef4147cefe3`
- R2: `TPI_MEDIA` → `tpi-contributor-media`
- Production custom domain: `paranormalinitiative.com`

These values are pinned in `wrangler.toml`. Deployment must use a clean
archive of the verified commit and must target the protected preview only.

## Existing implementation

ADMIN-005 added `admin-center-app/` (React 19, Vite, Refine, TanStack Query,
Tailwind v4, shadcn-compatible primitives) and generates assets into the
tracked `admin-center-preview/` directory. The relevant prior commits are
`3f9aaeabe637b19fe8726c94f138629a7373d4da` (preview foundation) and
`53ea53c` (documentation evidence). The existing preview uses the same
`/api/admin/*` contracts as the legacy page and does not introduce a second
backend.

Build command: `cd admin-center-app && npm run build`.

## Existing API and schema boundary

The current protected API includes overview/analytics, members and member
activity, community posts, classic comments, audit logs, creator partnership,
Founding 50, Creator Studio entitlements, contributors, teams, settings,
scraper runs, and event-related handlers. Existing migrations currently end at
`0048_creator_partnership_admin.sql`; no ADMIN-006 migration is justified for
this batch.

## Baseline decision

Proceed with a data-backed preview refinement: complete navigation taxonomy,
real overview/analytics, server-side member filters/pagination/detail safety,
community post/comment moderation adapters, loading/error/empty states, and
explicit capability boundaries for resources whose existing contracts are
not yet sufficient. Do not claim full ADMIN-006 completion until the owner
reviews the preview and the remaining resource integrations are completed.
