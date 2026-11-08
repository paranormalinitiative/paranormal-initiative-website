# TPI-NOVA — Editorial Workspace Primary Engine

## Scope

GenOffice/Nova is being migrated into the existing Content Editor, whose
authoritative route is `/paper-editor.html`. This is the contributor/editorial
workspace and is the main Nova editing engine for the site.

Nova Edit is **not** part of this release and is not being placed in StudioFlow.
The `/studio/` entrypoint remains on its previous StudioFlow bundle. A future
directive may add Nova Edit to StudioFlow separately.

## 2026-11-08 — Slides integrated into the Content Editor

The existing GenOffice/Nova Slides surface is now available from the same
`/paper-editor.html` Content Editor shell. The integration reuses the existing
`SlidesSurface` and `nova-presentation` API rather than creating a second slide
system. Documents remain the primary document mode; Slides is a sibling
workspace mode within the editorial engine. Nova Edit remains outside
StudioFlow.

Local Firefox verification created a disposable presentation, renamed it,
added a text element, saved it, returned to the Slides library, refreshed the
page, and confirmed the presentation persisted. The focused Slides verifier
passed 11/11, Nova typecheck passed, the Content Editor build passed, and
`git diff --check` passed. This integration was then deployed through the
guarded production release recorded below.

The deployed release is `rel-ae6854fcec4e-fe465822e352`, Worker
`0e9c8080-4a2d-4451-9a37-464c69301baf` at 100% traffic, with rollback Worker
`1c063a9c-0c23-4592-ab53-351467442f80`. The exact release source commit is
`ae6854fcec4e7c6275c3cedc57b1f9a443042dea`; the approved StudioFlow bundle
remains `eefb7de9518809d98726062aee478a4111c921a5`.

Live Firefox verification opened the production Content Editor at
`/paper-editor`, switched to Slides, and rendered the integrated Slides
workspace. No production presentation was created. The NDE draft remained
unchanged.

## 2026-11-08 conversion correction and live acceptance

The first production deployment correctly routed the Content Editor to Nova,
but one grandfathered article still displayed the compatibility editor. The
root cause was the legacy article's semantic `<section><article>` wrapper:
`content-editor-nova-convert.js` treated those containers as unsupported and
discarded their block descendants, producing an empty Nova document. The API
correctly rejected that empty conversion with `nova_conversion_empty`; no
article body or public snapshot was changed.

The focused correction is source commit
`65481d73c51224abbeab299513633445c44d96a8`. The converter now recursively
walks semantic containers and block-containing wrappers while preserving
headings, paragraphs and supported inline content. The shared-editor contract
is now **14 passed, 0 failed**.

The exact certified candidate `rel-65481d73c512-87f66192b97e` was deployed
through the guarded release path at `2026-11-08T02:08:18Z` (recorded deploy
completion), activating Worker `1c063a9c-0c23-4592-ab53-351467442f80` at 100%
traffic. Rollback remains Worker `42783d89-c43b-4ffe-87ad-e4f7eb4c4d62`.
All 30 certification gates passed, anonymous production smoke passed 10/10,
and isolated Firefox Developer Edition release acceptance passed 65/65.

Owner-profile Firefox then opened the affected production article, confirmed
the explicit conversion, and visibly rendered the GenOffice document ribbon
with the legacy article content loaded in the document body. Evidence:
`docs/TPI-DEVELOPMENT/evidence/tpi-nova-editorial/production-genoffice-firefox-20261108.png`
(SHA-256
`116e9f5231fab933e97c5316207a3c199640120657402cf7f34d0da0704ca26f`). The
original `articles.body_html` and public snapshot remain protected; the Nova
working document is the owner-scoped editing copy.

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
after schema application and before the first owner-approved conversion: 25
articles, 7 contributors, 128 Studios, 1 Note, 0 Nova items, 0 submissions
and 0 events.

## Verification

- `node --check paper-editor.js`: PASS
- `scripts/verify/tpi-nova-editorial-production-schema.mjs`: 12 passed, 0 failed
- `scripts/verify/tpi-nova-004r4-shared-editor.mjs`: 14 passed, 0 failed
- `npm run build:content-editor-nova`: PASS
- Existing Nova foundation, workflow, table, submission and Slides checks were
  already passing before this focused migration; they remain release gates.

## Release state

**DEPLOYED_AND_VERIFIED — corrected and reverified 2026-11-08.** The guarded
website release completed successfully with release ID
`rel-65481d73c512-87f66192b97e`.

- Production Worker: `1c063a9c-0c23-4592-ab53-351467442f80` at 100% traffic.
- Rollback Worker: `42783d89-c43b-4ffe-87ad-e4f7eb4c4d62`.
- Website/source commit: `65481d73c51224abbeab299513633445c44d96a8`.
- Approved StudioFlow bundle commit: `eefb7de9518809d98726062aee478a4111c921a5`.
- Deployment timestamp: `2026-11-08T02:08:18Z` (release completion record).
- `paper-editor.js`: `7391dc36b1c71629f3288965f6787f9840bf9a23a3a72bff0244817e2580c187`.
- Nova JavaScript: `content-editor-DImj3Ihg.js`, SHA-256
  `b29738d923cd35055a41182f89aa73709f13a2702d9caffc6e6ae1ee434e4041`.
- Nova CSS: `content-editor-CRrU71X0.css`, SHA-256
  `44012e8049c14ad32abee0e732c7ddcda3affe8df1ba61909b8a224d4fc7a060`.
- Converter asset: `content-editor-nova-convert.js`, SHA-256
  `ef9c20e48a191b900fa111a223ff668ae02817c2d6d8686bf47011ad5713b5bc`.
- Production smoke: 10/10 PASS.
- Live isolated Firefox acceptance: 65/65 PASS.
- Live owner-profile Firefox GenOffice conversion: PASS; the affected legacy
  article opened with the full Nova ribbon and preserved document content.
- `/paper-editor.html` remains authentication-protected; the anonymous 403 is
  the expected contributor boundary. The deployed `paper-editor.js` and Nova
  bundle assets are present and served with revalidation headers.

The production release keeps StudioFlow on its prior Notes bundle. Nova Edit
was intentionally not placed in `/studio/`; the existing Content Editor route
`/paper-editor.html` is the production home for GenOffice/Nova.

The release reuses the pre-change D1 export above and the focused additive
schema bootstrap. No production content records were deleted. The one
explicit owner-approved conversion created and linked the Nova working copy;
the original article body and public snapshot were preserved byte-for-byte.
The historical D1 migration ledger drift remains documented; the bootstrap is
the recorded reconciliation for this release and must not be replayed as a
normal migration without a separate audit.

