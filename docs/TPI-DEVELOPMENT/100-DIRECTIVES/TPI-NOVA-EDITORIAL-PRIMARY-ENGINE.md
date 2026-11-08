# TPI-NOVA — Editorial Workspace Primary Engine

## Scope

GenOffice/Nova is being migrated into the existing Content Editor, whose
authoritative route is `/paper-editor.html`. This is the contributor/editorial
workspace and is the main Nova editing engine for the site.

Nova Edit is **not** part of this release and is not being placed in StudioFlow.
The `/studio/` entrypoint remains on its previous StudioFlow bundle. A future
directive may add Nova Edit to StudioFlow separately.

## Implementation

- Server-backed editorial articles now open in the Nova editor automatically.
- Existing linked Nova articles open through the same route and preserve their
  article metadata, workflow state, autosave, revisions and publication boundary.
- The original `articles.body_html` and public snapshot remain unchanged during
  conversion; the Nova document is an owner-scoped working copy.
- The legacy contenteditable editor remains only as an explicit compatibility
  fallback when the Nova service is unavailable or a local/static legacy import
  cannot be migrated.
- TPI Video remains on its specialized editor path.
- Production D1 received a focused additive schema bootstrap because the
  physical production schema was ahead of its migration ledger. No historical
  migration replay, table drop, or data rewrite was performed.

## Production schema evidence

Pre-change export:

`/tmp/tpi-contributor-portal-before-nova-20261107.sql`

SHA-256:

`fdc94aa1ee6533082f2ea6cf858731ce1d33082a498c5e4c51e8e18eebd191ee`

Applied file:

`scripts/sql/tpi-nova-editorial-production-reconciliation.sql`

Verified production tables: `nova_collections`, `nova_items`,
`nova_revisions`, `article_editorial_submissions`, and
`article_editorial_events`.

Verified article columns: `nova_item_id`, `editorial_status`, `affiliation`,
`organization`, `correspondence`, and `website`.

Verified append-only event triggers remain present. Existing production counts
after schema application: 25 articles, 7 contributors, 128 Studios, 1 Note,
0 Nova items, 0 submissions and 0 events.

## Verification

- `node --check paper-editor.js`: PASS
- `scripts/verify/tpi-nova-editorial-production-schema.mjs`: 12 passed, 0 failed
- `scripts/verify/tpi-nova-004r4-shared-editor.mjs`: 13 passed, 0 failed
- `npm run build:content-editor-nova`: PASS
- Existing Nova foundation, workflow, table, submission and Slides checks were
  already passing before this focused migration; they remain release gates.

## Release state

The application release is not yet marked live until the guarded website
release, live Firefox acceptance of `/paper-editor.html`, and GitHub parity
are complete. No StudioFlow Nova Edit bundle is authorized in this release.

