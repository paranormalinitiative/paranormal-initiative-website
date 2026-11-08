# TPI-NOVA-004R3 — Nova Editorial Workspace Controlled Migration Plan

Status: planning only. No application code, database migration, content migration,
template change, Education Center routing change or production deployment is
authorized by this document.

Repository evidence was taken from branch `codex/tpi-development` after
TPI-NOVA-004R2 (`e57c281`).

## 1. Product truth

- **Nova Edit** — the StudioFlow Notes successor for Creators. Its migration is a
  separate later directive and is not planned here.
- **Nova Editorial Workspace** — the successor to the existing Content Editor
  (`paper-editor.html` / `paper-editor.js`) for Contributors and editorial work.
- **Nova Core** — the shared technology: TipTap/ProseMirror editor, structured
  JSON envelope (`lib/nova.js`), owner-scoped storage (`migrations/0059_nova_core.sql`),
  versioned saves, revisions and the `nova-app/` shell.
- **Standalone `/nova/`** — a development and reference surface (`nova/`
  build output, `nova-app/`, `experiments/nova-spike/`). It is not a third
  permanent TPI product.

## 2. Existing system preservation

| Area | Current state (repository evidence) | Migration rule |
|---|---|---|
| Entry point | Content Editor at `paper-editor.html` | Keep route. Replace the editing engine behind it. |
| Destinations | 18 `#editor-destination` values, all valid (004R2) | Keep stored values exact. Presentation may change. |
| Templates | `templateStarters` (`paper-editor.js` ~78), `guideTemplateMap` (~117) | Preserve all. Transform to structured content. |
| TPI Video | Forces `tpi-videos.html`, disables selector (~148–163); publishes through `/api/tpi-videos` | Keep separate. See §6. |
| Article types | `articles.article_type` (added in `0002_article_type.sql`); select options in `paper-editor.html` | Keep the stored values exactly. |
| Metadata | `articles`: id, destination, href, title, subtitle, author, source, body_html, article_html, labels, status, created_by, created_at, updated_at, article_type | Preserve every column. |
| Public URLs | `published-article.html?id=<id>`; `href` values | Do not change. |
| Authorship | `author` (display), `created_by` (owner id) | Preserve. 004R2 ownership guard becomes a permanent requirement. |
| Comments | `comments` table (`0001_contributor_portal.sql`); video comments in `video_comments` (separate) | Do not move into Nova documents. Keep identifiers stable. |
| Videos | `tpi_videos` family of tables, separate API | Keep separate from `articles` and Nova items. |
| Legacy queue | `legacy-contributions.js` (57 lines) | Preserve until its relationship is mapped (§9). |
| Rendering | `includes.js` (`loadCloudflareArticleCards`, ~875), `search.js`, `published-article.js`, `/api/articles?destination=` | Do not rebuild in the first migration. |

## 3. Nova integration

**Shared editor.** The Editorial Workspace must consume the same TipTap/ProseMirror
editor, toolbar, link dialog and revisions panel as Nova Edit (`nova-app/src/documents/`:
`DocumentEditor.tsx`, `EditorToolbar.tsx`, `LinkDialog.tsx`, `RevisionsPanel.tsx`,
`editorExtensions.ts`). No second editor is built.

**Storage relationship.** Nova persistence is owner-scoped. Every read and write
filters on `owner_id` (`lib/nova.js` ~216, ~269). `nova_items` carries no article,
destination or publication field, which supports separation (§12).

**Revisions.** `nova_revisions` already provides content snapshots with a
unique `(item_id, revision_number)`, retention of the latest 50, and restore. The
Editorial Workspace gains these. `admin_audit_logs` remains audit history, not
document revisions.

**Autosave and conflicts.** Reuse the Nova model: `expectedVersion` is required
on every write, and a mismatch returns `409 nova_item_conflict` (`lib/nova.js`
~144–198). The legacy Content Editor autosave is replaced, not run in parallel.

**Local drafts.** Reuse `nova-app/src/lib/draft.ts` for local draft recovery.

## 4. Editorial workflow (target)

Current legacy flow: Create → Edit → Preview → Choose destination → **Publish directly**.

Target flow: Create → Write/Edit → Format → Preview → Choose destination/department
→ Submit → Review → Publish, by explicit permission.

The legacy flow stays available until §8 Phase F is verified.

## 5. Permission separation

Settled architecture:

> **Contributor does not automatically equal Publisher.**
> Contributor access does not automatically grant Education Center publishing authority.

| Role | Authority (target) |
|---|---|
| Contributor | Create and edit own content; submit. |
| Reviewer / Editor | Review submitted content; return or request changes where authorized. |
| Publisher | Approve and publish within policy. |
| Administrator | Oversight and management. |

Current repository state, for the record: `requireContributor` (route line 229) allows any active
contributor to set `status: "published"` (`functions/api/[[path]].js`
`handleCreateArticle`). `requireAdmin` allows `owner` and `admin`. No review
state exists. No capability constants are added under this plan. They wait for a
separate permission-architecture authorization (`lib/membership-entitlements.js`
`CAPABILITY` (line 16) and `CAPABILITY_SETS` (line 25) are the likely home).

## 6. Destination and department presentation

Stored values stay as they are (`articles.destination`, 18 filenames). The new
selector presents a human label, a section description, and keeps the filename
internal. The mapping is a presentation table over the existing values, not a
rename. Routing redesign is out of scope.

TPI Video stays separate. The Editorial Workspace may show it as a choice that
opens the specialized video surface. Merging it into normal article publishing is
not planned.

## 7. Templates and document transformation

**Preserve all starter templates** (`templateStarters`, `guideTemplateMap`).

**Transform, not store raw HTML.** A template is converted from starter HTML to a
structured Nova document with a deterministic parser. The output must preserve:
headings, paragraphs, lists, emphasis, links, tables where present, and meaningful
document structure. The Nova document is stored as `nova-document` JSON, never as
raw HTML.

**Future template architecture.** Templates become data entries (key, label,
contribution type, optional department, starter document) in a registry. Each
registry entry is a separate module. No single giant editor component carries
every template.

**Current relationship (004R2 finding):** only the TPI Video template forces a
destination. No other template sets, recommends or depends on a department, and
none changes `article_type` or metadata. The registry must keep that rule explicit.

## 8. Migration phases

Each phase is independently reversible and leaves the legacy Content Editor working.

- **Phase A — Shared Nova editor extraction.** Move the TipTap editor, toolbar and
  link dialog from `nova-app/src/documents/` into a shared module both products
  import. Keep `experiments/nova-spike` tests passing.
- **Phase B — Editorial Workspace shell behind the existing route.** `paper-editor.html`
  mounts the shared editor. The legacy editor stays selectable until acceptance.
- **Phase C — Legacy article → structured document adapter.** One-way conversion for
  `body_html` and `article_html` (§10). Read-only preview first.
- **Phase D — Metadata, destination and template integration.** Destination
  presentation, article type, labels, template registry.
- **Phase E — Draft, autosave and revision integration.** `expectedVersion`,
  conflicts, revisions, local draft recovery. Remove the legacy autosave path.
- **Phase F — Submission, review and publisher permissions.** Only after the
  separate permission authorization. Until then the legacy direct-publish remains.
- **Phase G — LocalStorage and legacy conversion handling** (§9, §11).
- **Phase H — Owner acceptance and legacy editor retirement.** Only after
  verified parity and explicit owner approval.

## 9. Editorial document vs published article record

**Recommended: separate them.**

- The **editorial document** is Nova structured content, owner-scoped, versioned,
  with revisions.
- The **published article record** is the `articles` row: publication status,
  destination, href, author, created_by, article_type, labels, and the public
  identifier used by `published-article.html?id=`.

Repository evidence supports this. `nova_items` has no destination or publication
column, and `articles` has no version or revision column. Merging them would make
Nova Core the Education Center publishing database, which the directive rules out.

**Option A — Adapter model.** The `articles` row remains the publication record.
A Nova document is referenced from it (for example by a new nullable
`nova_item_id` column, added in a later migration). Existing rows are untouched.
Legacy HTML continues to render until a document is attached.

**Option B — Controlled conversion.** Existing bodies are converted into Nova
content and the publication record is rewritten to point at it. This changes the
content of live records and is higher risk.

**Recommendation: Option A.** It leaves existing published content untouched,
keeps rollback trivial, and allows conversion per article later.

## 10. Legacy HTML and existing D1 records

- `articles.body_html` and `articles.article_html` are the current content.
- A one-way converter maps supported HTML (headings, paragraphs, lists, emphasis,
  links, tables) to the Nova document schema. Unsupported markup is reported,
  not silently dropped, and the original HTML is kept.
- Perfect arbitrary-HTML fidelity is not required. Meaningful content and supported
  formatting must survive.
- **Nothing is converted under 004R3.** Conversion is a later, separately
  authorized phase, run per article with a before/after comparison.

Current live counts (from the 004R2 owner report): 2 drafts, 21 published.

## 11. LocalStorage fallback (`tpiPublishedArticles`)

The key is read in `includes.js` (888), `published-article.js` (17), `search.js`
(38) and `member-login.js` (1590), and read and written by `paper-editor.js`
(`PUBLISHED_ARTICLES_KEY` line 5; read line 285; write line 292).

Recommended approach, in order:

1. Keep reading the fallback everywhere it is read today. Do not erase it.
2. Add a one-time, explicit import tool that reads local records and offers to
   save them to the server. Nothing is deleted automatically.
3. Show a read-only legacy view for records not imported.
4. Deprecate the fallback only after server persistence is verified and the owner
   approves.

## 12. Legacy conversion queue

`legacy-contributions.js` must not be retired until its relationship to the
Editorial Workspace is mapped. Intended direction: a legacy page enters the
workspace as an editorial document through the Phase C adapter, with its existing
destination and metadata preserved. The mapping is documented in a later phase.

## 13. Comments and videos

- **Comments** stay in their existing tables (`comments`, `video_comments`) under their existing identifiers.
  Nova document JSON never contains comments.
- **Videos** stay in the `tpi_videos` family. A unified authoring experience may
  come later, but publication contracts remain separate unless separately redesigned.

## 14. Standalone `/nova/` classification

| Item | Classification |
|---|---|
| `nova-app/src/documents/*` (editor, toolbar, link dialog, revisions panel) | **Shared Core** — extract in Phase A |
| `nova-app/src/lib/draft.ts`, `api.ts`, `types.ts`, `format.ts` | **Shared Core** |
| `nova-app/src/shell/App.tsx`, `DocumentsSurface.tsx` | **Shared shell pattern** — Editorial Workspace builds its own shell on Core |
| `lib/nova.js`, `migrations/0059_nova_core.sql`, `lib/nova-limits.js` | **Shared Core server** — keep |
| `experiments/nova-spike/tests/*.test.ts`, `scripts/*-check.mjs` | **Test harnesses to retain** |
| `experiments/nova-spike/dist`, `nova/assets/*`, `nova-app/node_modules` | **Build output** — regenerate, do not version |
| `scripts/verify/tpi-nova-003-foundation.mjs`, `tpi-nova-004-editor.mjs`, `tpi-nova-004r2-article-ownership.mjs` | **Development evidence to retain** |
| `/nova/` route and its standalone shell | **Temporary** — retire only after Phase H |
| `experiments/nova-spike/` | **Temporary** — remove after extraction is verified |

Nothing is deleted under this plan.

## 15. Risks and owner decisions required before implementation

1. **Production security release.** The 004R2 ownership fix exists only on
   `codex/tpi-development`. Production still has the defect. It needs its own
   isolated release from the production baseline through the guarded workflow. Do
   not deploy current development HEAD, which contains unreleased Nova work.
2. **Publishing authority.** Who may publish (Phase F) and whether a Reviewer role
   is needed. Requires a separate permission authorization.
3. **Option A vs B.** Owner confirmation of the adapter model (§9 recommendation).
4. **Legacy conversion queue.** Its intended future and whether converted pages
   enter as drafts.
5. **LocalStorage policy.** Whether to offer import, a read-only legacy view, or
   both, and when deprecation may occur.
6. **TPI Video placement.** Whether it stays in a specialized surface or appears
   as a choice in the Editorial Workspace.
7. **Route.** Confirm the first migration keeps the Content Editor route (§2).
8. **Owner acceptance.** Pending visual acceptance of the Nova pass (roadmap §21.9).

## 16. Smallest safe next directive

A Phase A directive only: extract the shared Nova editor components into a shared
module, keep the `experiments/nova-spike` tests passing, and change no Content
Editor behaviour.

## 17. TPI-NOVA-004R4 — shared editor integrated into the Content Editor

**Shared module.** `nova-app/src/shared-editor/` holds the generic editor
(`NovaEditor.tsx`) plus copies of `editorExtensions.ts`, `EditorToolbar.tsx`,
`LinkDialog.tsx` and `Modal.tsx`. The copies keep `/nova/` source untouched.
This is duplication to reconcile later. `DocumentEditor.tsx` is not extracted
whole because it is coupled to Nova API persistence; only pure editing pieces
are shared. The shared module contains no destinations, article types,
publishing, roles or StudioFlow logic.

**Integration approach.** `paper-editor.html` gains a development mode selector
(`data-editor-mode`, default `legacy`, Nova option labelled "development").
Nova mode lazy-loads a separate build, `content-editor-nova/`, from
`nova-app/vite.content-editor.config.ts`, and reads the hashed asset names from
the built page at runtime. `/nova/` is not rebuilt or changed. The Nova
document becomes the body source only while Nova mode is active, through
`buildArticleHtml()`. Metadata, destination and publish code are unchanged.
Access follows the existing Contributor gate; the Creator Studio gate on
`/nova/` is not reused.

**Template conversion (`content-editor-nova-convert.js`).** Supported:
paragraphs, headings, bold/italic, lists, links and tables. Unsupported markup is
reported in an `unsupported` list and shown in the status line. It is not
silently dropped. Output is escaped. The converter changes no template
definition. TPI Video stays on the legacy path and is not offered in Nova mode.

**Compatibility.** Legacy article HTML converts into a Nova document for
editing. The Nova document renders back to article HTML for preview and save
through the existing `cleanHtml` path. Switching modes writes no article row.

**Verification so far.** `scripts/verify/tpi-nova-004r4-shared-editor.mjs`
(13 checks, passing): legacy default, Nova option, metadata ids and destination
present, bundle isolation from `/nova/`, unchanged save/publish reads, converter
rendering and escaping, generic shared source, and no article-write call in
the mode switch. `nova-app` typecheck and the Content Editor build pass.

**Not yet verified (blockers).**
- Firefox visual and interaction verification of the Content Editor Nova mode.
  The local Worker on 8787 is not running, and restarting it needs owner
  authorization (`TPI_LOCAL_OWNER_CONTROL=1 npm run dev:local:service:restart`).
- Real-DOM template conversion inside the browser. The verifier tests the pure
  render path only.
- The 004R2 ownership defect remains in production until a separately
  authorized guarded release.

**Remaining deferred items.** Nova persistence linkage, article adapter
(Option A), submission/review/publish permissions, and legacy retirement.

**Permission rule (recorded, not implemented).** Contributor access does not
automatically grant publishing authority.

## 18. TPI-NOVA-004R5 — structured document persistence linked to existing articles

Production has not received the 0059/0060 Nova Editorial Workspace persistence
work under this milestone.

**Foundation.** `0059_nova_core.sql` provides the Nova Core tables.
`0060_article_nova_link.sql` adds nullable `articles.nova_item_id` with a
partial unique index. Both are applied locally only. No schema work was added
beyond these two migrations.

**Option A.** One article links to one Nova document. The `articles` row remains
the publication record. There is no cascade and no automatic unlinking. The
server creates the Nova item and ignores any client-supplied `novaItemId`.
Duplicate links return the existing item and never create a second one.

**Access.** Contributors reach `POST /api/articles/:id/nova` and
`GET|PUT /api/articles/:id/nova/item`. Standalone `/api/nova/*` stays gated by
Creator Studio access. Article ownership is `created_by === user.id`.

**Conversion.** HTML→Nova conversion runs in the browser through
`TPINovaConvert.htmlToNovaDoc`. The server refuses empty documents when the
stored article has text (`nova_conversion_empty`, 422) and refuses a
non-empty legacy article without a conversion document
(`nova_conversion_required`, 422). A new blank article is allowed.

**Persistence and recovery.** Autosave uses `expectedVersion`. A stale save
returns 409, the newer document is preserved, and the stale local content stays
recoverable. Local recovery is keyed `tpi-nova-draft:<novaItemId>`. Revisions
live in `nova_revisions`. Restore creates a new current version and leaves
article metadata unchanged.

**Lifecycle.** Archive and trash of a linked Nova item leave the article
untouched. Article delete leaves the Nova item in place. Both are covered by
the server verifier.

**Publication.** The publish snapshot is produced client-side (`novaDocToHtml`)
and written through the existing publish path. Ordinary Nova autosave never
rewrites `body_html`. TPI Video stays on the legacy path.

**Verified.** The server verifier passes 67/67. Firefox Developer Edition passes
30 browser-observed checks (11 + 19) as a Contributor without Studio access,
including standalone `/api/nova/*` 403, explicit conversion, the 422 refusals,
unsupported-markup warning, autosave, reload, stale-save conflict, per-item
recovery, live preview, publish snapshot, public rendering and TPI Video. Chromium
passes 27 browser-observed checks (11 + 16), including duplicate-link prevention.
Firefox remains authoritative.

**Deferred Editorial Workspace UI.** Contributor-facing revision history interface
and Contributor-facing archive/trash/restore interface. Nova Core lifecycle
behaviour is already verified at the persistence/API layer; these are
product-surface enhancements, not blockers for structured document persistence.

Revision persistence is operational in Nova Core; Contributor-facing revision-history
controls are deferred to a later Editorial Workspace milestone. Nova lifecycle
separation is verified at the persistence/API layer. Contributor-facing
archive/trash/restore controls are deferred.

Production now has the focused additive Nova Editorial schema bootstrap
`scripts/sql/tpi-nova-editorial-production-reconciliation.sql`; the historical
global migration ledger remains unreconciled and was not replayed.

## 19. TPI-NOVA-005A — Nova Editorial Workspace visual foundation (complete, local)

**Product.** `/paper-editor.html` is now the **Nova Editorial Workspace** and is the
flagship/master Nova product. `/nova/` remains a development and reference surface
only; its routing and access are unchanged.

**Documents foundation.** Documents Home; Nova-native editor with the shared toolbar
and contained canvas; Education Center inspector; publication and workflow chips;
Legacy Compatibility for pre-Nova articles.

**Article metadata.** Migration `0064_article_publication_metadata.sql` adds nullable
`affiliation`, `organization`, `correspondence` and `website` columns to articles.
There is no backfill. The nine-field metadata set persists through the article API.

**Save behaviour.** The editor tracks body and metadata dirty state separately. A
no-op save does nothing. Metadata-only, body-only and combined saves are supported.
Writes are serialised, and a stale `expectedVersion` returns a Conflict.

**Workflow separation.** Contributor, Reviewer and Publisher are distinct authorities.
Verified lifecycle: Submit, Submitted lock, Start Review, Request Changes, Changes
Requested save, Resubmit, second review, Approve, Publish, Start New Revision.

**Publication safety.** A working Nova Draft Revision does not replace the public
snapshot until an authorised publication. The public route serves `articles.body_html`
and `articles.article_html`, and the unpublished working document stays private.

**Legacy compatibility.** Grandfathered legacy articles (`editorial_status = legacy`,
no Nova item) enter Nova automatically when they are opened from the server-backed
Content Editor. Conversion preserves the original article body and public snapshot.
If Nova is unavailable, the original editor remains an explicit compatibility fallback.

**Slides.** Reserved. Not implemented.

**Acceptance authority.** Temporary local Reviewer and Publisher grants were created
for the acceptance run and then removed by exact ID. The product grant route was not
changed.

**Orphan.** Nova item `209fa2f1-8825-4766-a047-c7405cba7ad8` has no reliable
provenance and is retained intentionally.

**Not claimed by 005A.** Professional Documents, custom fonts, Slides, and any
GenOffice embedding, port or fork are not complete.
