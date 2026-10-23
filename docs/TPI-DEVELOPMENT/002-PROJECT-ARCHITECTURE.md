# Project Architecture

## Runtime

The root application is a Cloudflare Worker with static assets. worker.js handles server-side routes and APIs; the asset binding serves the website. Wrangler currently declares:

- Worker: theparanormalinitiative
- Account: 221ea5479876fd303ddc87002b9e892d
- D1 binding: TPI_DB -> tpi_contributor_portal (f36b9161-b517-4634-9857-bef4147cefe3)
- R2 binding: TPI_MEDIA -> tpi-contributor-media
- Scheduled trigger: 0 */6 * * *

## Administration Center

admin-center-app/ is the existing Refine + shadcn/ui application. Its protected preview route is /admin-center-preview/. The legacy production Administration Center at /admin-panel remains separate and must not be replaced by this directive.

## Data boundary

Production uses `tpi_contributor_portal` and `tpi-contributor-media`.
Development uses the separate `tpi_contributor_portal_dev` D1 database and
`tpi-contributor-media-dev` bucket through `wrangler.dev.toml`. Local work uses
isolated simulated state. Never substitute the root production configuration
for development or local testing.

## StudioFlow source boundary

Core StudioFlow source lives in `/Users/toddknipple/Documents/StudioFlow/web`.
The website repository's `studio/` directory is a deployable integration of its
generated build plus maintained TPI bridge files. The complete source-to-live
procedure is `TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`.

## Documentation boundary

The numbered workflow documents are an index and operating guide, not a replacement for historical directives. Existing documents remain in place and are linked through the directive index.
