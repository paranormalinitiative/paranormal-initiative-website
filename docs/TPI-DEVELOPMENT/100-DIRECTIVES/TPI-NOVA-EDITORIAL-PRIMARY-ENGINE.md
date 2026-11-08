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

**DEPLOYED_AND_VERIFIED — 2026-11-08.** The guarded website release completed
successfully with release ID `rel-a2d10f97af48-579f6bd87a4c`.

- Production Worker: `42783d89-c43b-4ffe-87ad-e4f7eb4c4d62` at 100% traffic.
- Rollback Worker: `99ca2347-3181-4525-b9eb-d28cb61cf42a`.
- Website/source commit: `a2d10f97af482d437044b5a30343ad7a3f10a210`.
- Approved StudioFlow bundle commit: `eefb7de9518809d98726062aee478a4111c921a5`.
- Deployment timestamp: `2026-11-08T01:38:03.951Z`.
- `paper-editor.js`: `7391dc36b1c71629f3288965f6787f9840bf9a23a3a72bff0244817e2580c187`.
- Nova JavaScript: `content-editor-DImj3Ihg.js`, SHA-256
  `b29738d923cd35055a41182f89aa73709f13a2702d9caffc6e6ae1ee434e4041`.
- Nova CSS: `content-editor-CRrU71X0.css`, SHA-256
  `44012e8049c14ad32abee0e732c7ddcda3affe8df1ba61909b8a224d4fc7a060`.
- Production smoke: 10/10 PASS.
- Live isolated Firefox acceptance: 65/65 PASS.
- `/paper-editor.html` remains authentication-protected; the anonymous 403 is
  the expected contributor boundary. The deployed `paper-editor.js` and Nova
  bundle assets are present and served with revalidation headers.

The production release keeps StudioFlow on its prior Notes bundle. Nova Edit
was intentionally not placed in `/studio/`; the existing Content Editor route
`/paper-editor.html` is the production home for GenOffice/Nova.

The release reuses the pre-change D1 export above and the focused additive
schema bootstrap. No production content records were rewritten or deleted.
The historical D1 migration ledger drift remains documented; the bootstrap is
the recorded reconciliation for this release and must not be replayed as a
normal migration without a separate audit.

