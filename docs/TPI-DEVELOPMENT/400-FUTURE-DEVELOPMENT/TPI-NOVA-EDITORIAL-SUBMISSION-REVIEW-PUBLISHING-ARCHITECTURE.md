# TPI-NOVA-004R6A — Editorial Submission, Review and Publishing Authority Architecture

**Status:** Architecture complete (004R6A1). Implementation not started.
**Application code:** not modified by this record.
**Database migrations:** none created by this record.
**Production:** not touched.
**Current 004R5 workflow:** preserved.

Baseline: branch `codex/tpi-development`, HEAD and `origin/codex/tpi-development` at `02a0acd0`. Migrations 0059 and 0060 and the 004R5 application changes have not reached production (roadmap §21.11).

Next phase: **TPI-NOVA-004R6B — Workflow foundation** (see §22). R6B is now implemented server-side: capabilities, `0061_article_editorial_workflow.sql`, and `lib/editorial-workflow.js`, verified by `npm run verify:nova-004r6b`. No UI or public-route change; direct publishing is unchanged.

## 0. Central rules

1. **Publication visibility and editorial workflow are separate.** `articles.status` (`draft`/`published`) keeps its current meaning and decides what the public can see. `articles.editorial_status` tracks the review workflow. Neither field writes into the other.
2. **A published article stays live while its Nova working document is revised.** Public `body_html`, `article_html`, URL, destination and search representation stay on the last approved publication snapshot. Only an authorised publish action replaces that snapshot.
3. **Publication snapshots exactly `approved_nova_version`.** It never snapshots whatever version is current at publish time.
4. **Review feedback is never public content.** Notes live in an append-only editorial event log, not in comments, the Nova body, Nova revisions or the general admin audit log.
5. **Authority is capability-based and server-side.** Writing, reviewing and publishing are separate capabilities. Badges, payment and membership never grant them. Owner stays a separate, auditable authority.

## 1. Audit of current state

Every finding below was checked in source. Locations are the current line numbers.

### 1.1 Capabilities and roles

- `lib/membership-entitlements.js:16` defines `CAPABILITY` with only `creator` and `contributor`. No Editor, Reviewer, Publisher or Moderator capability exists.
- `CAPABILITY_SETS` (line 25) and `legacyRoleCapabilities` (~132) map `owner` and `admin` to both capabilities. `hasCapability` (~125) is a plain membership test.
- `functions/api/[[path]].js` `requireContributor` (~9030) checks `CAPABILITY.CONTRIBUTOR`.
- `requireAdmin` (~9056) checks `user.role` in `["owner","admin"]` directly and bypasses the capability model.
- `lib/auth.js:57` `hasCreatorStudioAccess` grants access to `owner` and `admin` by role.
- Editor and Publisher exist only as governance vocabulary (`docs/TPI-DEVELOPMENT/007-SECURITY-AND-PERMISSIONS.md` lines 70–117; `TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md` §14).

### 1.2 Article schema

- `articles` (`migrations/0001_contributor_portal.sql`): `status TEXT NOT NULL DEFAULT 'published'`, `created_by`, `author`, `body_html`, `article_html`, `updated_at`.
- `migrations/0002_article_type.sql`: `article_type`, default `'Research Paper'`.
- `migrations/0060_article_nova_link.sql`: nullable `nova_item_id` with a unique index.
- `nova_items` (`0059_nova_core.sql`): `owner_id`, `status` (`active`/`archived`/`trash`), `version`. `nova_revisions` holds document history.
- Only `draft` and `published` are used as article status values.

### 1.3 Every publish path today

| # | Surface | Location | Who can reach it | Check | Effect |
|---|---|---|---|---|---|
| P1 | `POST /api/articles` → `handleCreateArticle` | `functions/api/[[path]].js` ~3316 | any Contributor | `requireContributor`; upsert guarded by `created_by` | Client sends `status`. `status:"published"` is written directly with no review. `body_html` and `article_html` are overwritten on every save. |
| P2 | `POST /api/admin/articles/:id/status` → `handleAdminArticleStatus` | ~3500 | owner/admin | `requireAdmin` (role) | Toggles `draft`/`published`. Notifies members on publish. |
| P3 | `PUT /api/admin/articles/:id` → `handleAdminArticleUpdate` | ~3457 | owner/admin | `requireAdmin`; `expectedUpdatedAt` conflict check | Edits title, destination, body and HTML of any article. Records an audit row. Does not change status. |
| P4 | Content Editor publish → `publishToDestination` | `paper-editor.js` 2045–2090 | any Contributor | none beyond title | Sends `status:"published"` through `TPIApi.createArticle` (P1). Falls back to localStorage when the API is unavailable. |
| P5 | Content Editor draft save → `saveDraft` | `paper-editor.js` 1997–2026 | any Contributor | none | Sends `status:"draft"` through P1. Falls back to localStorage. Autosave (`scheduleAutosave`, 2028; Nova `scheduleNovaAutosave`) calls it. |
| P6 | localStorage publish (`tpiPublishedArticles`) | `paper-editor.js` 5, 285, 292, 2057–2090 | browser only | none | Writes `status:"published"` locally when no API exists. Not authoritative. |
| P7 | Legacy page import → `importLegacyPage` | `paper-editor.js` ~1828–1850, ~1836 | any Contributor | none | Writes `status:"published"` for an imported HTML page. |
| P8 | Legacy bulk conversion → `bulkConvertLegacyArticles` | `paper-editor.js` 1868–1912 | any Contributor | `window.confirm` only | Converts every `legacy-published` page to a published record via P1 (`status:"published"`) or localStorage. |
| P9 | `legacy-contributions.js` | loaded by 10 pages, including `admin-panel.html`, `member-dashboard.html`, `paper-editor.html`, `member-login.html` | page scripts | none | Supplies legacy page records. Its `status` values feed P7/P8. |
| P10 | TPI Video publish (`publishTpiVideo`) | `paper-editor.js` 2094–2130 | any Contributor/creator | video API | Separate `/api/tpi-videos/*/publish` path. Out of scope (§17). |
| P11 | Migration/fixture scripts | `scripts/build-legacy-conversion-migration.js` line 69; `scripts/local-application-fixtures.mjs` | developer tooling | none | Write `status:"published"` rows. Not runtime paths, but they set the precedent. |

Findings:
- A Contributor can publish their own article with no reviewer. The gate is authorship, not editorial authority (P1, P4, P7, P8).
- The server trusts the client `status` in P1. The same handler also overwrites `body_html` from the client.
- Admin and owner act through role checks, not capabilities (P2, P3). Admin edits any article with no ownership restriction.
- The Nova routes (`PUT /api/articles/:id/nova/item`, `POST /api/articles/:id/nova`) autosave the working document but do not change `body_html` or `status`. They are the correct base for the new model.
- Public list `GET /api/articles` (`handleListArticles`, ~3530) filters `status = 'published'`. This is the only public filter and must stay that way.

### 1.4 Who reads and lists content

| Surface | Location | Filter | Effect of a new editorial state |
|---|---|---|---|
| Public list API | `handleListArticles` ~3530 (`WHERE a.status='published'`) | `status` only | None if `editorial_status` is never used as a visibility filter. |
| Contributor list API | `handleContributorArticles` ~3560 (by `created_by`) | none | Must return `editorial_status` so the dashboard can show it. |
| Contributor dashboard | `member-login.js` ~1590–1600 | `status !== "published"` = drafts; `status === "published"` = published | Must show a workflow badge. Must not treat `submitted` as public. |
| Contributor list (localStorage) | `member-login.js` 1590, `published-article.js` 17, `search.js` 38–39, `includes.js` 888 | `status === "published"` | Local only. Must not change visibility. |
| Member home rail | `member-home.html` ~2806 (`/api/articles`), ~3146 (counts `a.status === "published" \|\| a.published`) | API returns published only | None while the public API keeps the published filter. The `a.published` fallback must be removed in R6F. |
| Search | `search.js` ~45 (`/api/articles`), 38–39 (local published only) | published only | None while the public API keeps its filter. The local path returns published items only. |
| Education Center cards | `includes.js` ~877 (`/api/articles?destination=`), 888 (local) | published only | None while the public filter holds. |
| Published article page | `published-article.js` ~17, ~31 (`listArticles`) | loads by id from the public list | Renders the public record only. Must never read Nova. |
| Admin overview counts | `functions/api/[[path]].js` 701–704, 760, 805–819, 2298 | `status = 'published'` | Counts only published. Keep. |

Finding: the public read path is correct. No public surface reads a Nova document, and none filters by `editorial_status`. R6 must keep it that way.

### 1.5 Who writes, edits and publishes

- **Writes:** any Contributor creates an article (P1, P5).
- **Edits:** the owning Contributor (P1); any article via Admin (P3).
- **Publishes:** the owning Contributor directly (P1, P4, P7, P8), or owner/admin (P2).
- **Reviews:** nobody. No review state, queue or reviewer identity exists.

### 1.6 Governance mapping

| Authority | Governance rule | Current implementation | Gap |
|---|---|---|---|
| Contributor | Writes and edits own content. Does not imply publication (`TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md` §14). | `contributor` capability; owner authorship; direct publish (P1). | Must lose direct publish. |
| Editorial Reviewer | Reviews and edits authorised educational content (`007` line 109). | Not implemented. | Needs `EDITORIAL_REVIEW`. |
| Editorial Publisher | Publishes and unpublishes official Education Center material (`007` line 110). | Not implemented; admin/owner publish implicitly. | Needs `EDITORIAL_PUBLISH`. |
| Admin | Manages broader editorial permissions and configuration (`007` line 111). | Role `admin`; unrestricted article access. | Must not be the everyday reviewer or publisher. |
| Owner / Founder | Separate organisational authority, not an ordinary membership capability. | Role `owner`, also mapped to Creator and Contributor. | Stays separate. |

Settled rules applied: Contributor is not Publisher; Creator is not Publisher; membership is not authority; operational roles are separate; Admin is not automatically Publisher (`007` lines 74–75, 107–117).

### 1.7 Administration Center

- The Administration Center is the production `admin-panel.html` (`/admin-panel`). `admin-center-app/src/app.tsx` (~712) holds the Education Center article list and detail in the protected Refine preview. Per `008-ADMINISTRATION-CENTER.md`, new management areas are indexed in the future-work register.
- Its security section states that Admin APIs are owner/admin required. That remains true for oversight. It is not the editorial review rule.

### 1.8 Legacy and import paths

- Legacy pages (`legacy-contributions.js`) become articles only through P7/P8, and those paths write `status:"published"`.
- The 004R5 conversion path (migration 0060 and its Nova link) links an existing article to a Nova document. It does not change `status`.
- Existing rows default to `status='published'` (`0001`). Existing drafts are `status='draft'`.

### 1.9 Tests that assume two states

| Test | Assumption | R6 impact |
|---|---|---|
| `scripts/verify/tpi-nova-004r2-article-ownership.mjs` line 117 and 144 | owner can publish directly under the legacy workflow | Keeps passing for `legacy` articles. Must add a case that `editorial_status='submitted'` cannot publish directly. |
| `scripts/verify/tpi-nova-004r5-persistence.mjs` line 193 and 284 | seeds and checks `status='published'`; conversion leaves `status` unchanged | Keep. Add `editorial_status` expectations in R6B. |
| `scripts/local-application-fixtures.mjs` 149–159 | seeds `published` rows | Keep. These rows are `legacy`. |
| Any test that asserts `GET /api/articles` lists drafts | none found | No change. Public list must keep published-only. |

No test is changed by this architecture record.

## 2. Governance: authority boundaries

| Dimension | Authority | May do | May not do |
|---|---|---|---|
| Writing | `contributor` capability, article owner | Create, edit own drafts, submit, withdraw while `submitted`, resubmit after `changes_requested` | Publish, approve, review own submission |
| Review | `EDITORIAL_REVIEW` | See queue, read submitted Nova version, start review, request changes with a note, approve | Publish. Approve own submission. Edit the Contributor's Nova document |
| Publication | `EDITORIAL_PUBLISH` | Publish an approved version, correct destination or article type through an audited action, unpublish | Approve own work when it was also the submitter (see §9) |
| Admin | role `admin` today | Oversight: audit, emergency unpublish, ownership overrides | Automatic Publisher. Editorial review without `EDITORIAL_REVIEW` |
| Owner / Founder | separate organisational authority | Final override, audited | Being modelled as a plain capability or an editorial flag |

Decisions:
- **Admin does not automatically equal Publisher.** Admin gets no `EDITORIAL_PUBLISH` by role. If governance later grants Admin editorial authority, that is an explicit capability grant.
- **Owner is not a capability.** Owner's authority is a separate organisational dimension. Owner actions go through the same audit trail as any other, with the actor recorded.
- **One person may hold both review and publish.** The capabilities stay distinct. Self-approval is still refused (§9).

## 3. Reviewer versus Editor

Recommendation: one capability, `EDITORIAL_REVIEW`. It covers queue access, reading the submitted version, leaving notes, requesting changes and approving. Splitting it into Reviewer and Editor adds role names without a workflow difference. Revisit only if governance requires approval to be stronger than ordinary review. Then add a separate capability.

## 4. Workflow state machine

### 4.1 Canonical editorial states

Stored in `articles.editorial_status`:

| Value | Meaning |
|---|---|
| `legacy` | Article predates the workflow. Keeps current direct behaviour. Default for existing rows. |
| `draft` | Editable, not submitted. |
| `submitted` | Submitted version is locked and waiting for review. |
| `in_review` | A reviewer has started. Locked. |
| `changes_requested` | Returned to the Contributor with a note. Editable. |
| `approved` | Exact `approved_nova_version` recorded. Locked and waiting for publication. |

**`published` is not an editorial state.** Publication is `articles.status = 'published'`. Keeping a second `published` value would duplicate that authority. Publication history is the event log (`published` event) and `published_by` / `published_at` on the submission.

### 4.2 Transitions

| From | To | Actor | Condition |
|---|---|---|---|
| (none / `legacy`) | `draft` | Contributor | Conversion to Nova (004R5 path) |
| `draft` | `submitted` | Contributor (owner) | Creates submission row with `submitted_nova_version` |
| `submitted` | `draft` | Contributor (owner) | Withdrawal, only while `submitted` (§6) |
| `submitted` | `in_review` | Reviewer (`EDITORIAL_REVIEW`, not submitter) | Starts review |
| `in_review` | `changes_requested` | Reviewer (not submitter) | Note required |
| `in_review` | `approved` | Reviewer (not submitter) | `approved_nova_version` = current version = submitted version |
| `changes_requested` | `submitted` | Contributor (owner) | Resubmits. New submission row with new `submitted_nova_version`. Prior row superseded. |
| `approved` | `in_review` | Reviewer (not submitter) | Reopens review, with note |
| `approved` | `submitted`/`draft` | Publisher or Admin oversight | Only when the approval is no longer valid (§7) |
| `approved` | publication | Publisher (`EDITORIAL_PUBLISH`, not submitter) | Publishes exactly `approved_nova_version`. Sets `articles.status='published'` and the public snapshot. Editorial status returns to `draft` for the next revision, or stays `approved` until the next submission. Chosen: stays `approved` marked as published in the submission row, so the history is visible. |

Rules:
- Every transition writes one row to `article_editorial_events` in the same D1 batch. A transition without an event is refused.
- A transition checks the current state, the actor, the capability and the version.
- Contributor never enters `approved` or publication. Reviewer never publishes without `EDITORIAL_PUBLISH`.

## 5. Publication state and editorial state

| Question | Field | Values |
|---|---|---|
| Can the public see it? | `articles.status` | `draft`, `published` |
| Where is it in review? | `articles.editorial_status` | §4.1 |
| What was submitted, approved and published? | `article_editorial_submissions` | per round, immutable versions |
| What happened, when, by whom? | `article_editorial_events` | append-only |

`articles.status` changes only in the publication action (and in the existing legacy paths until R6F retires them). `editorial_status` changes only through the workflow transition function (§4.2). Public code reads `status` only.

## 6. Withdrawal

- Allowed only in `submitted`, before a reviewer starts the review.
- Returns `editorial_status` to `draft`. The submission row is marked `withdrawn`.
- Not allowed in `in_review` or later. A reviewer must request changes or approve. The Contributor can then respond.
- Withdrawal is an event.

## 7. Version integrity

Nova documents use `nova_items.version` and `expectedVersion` on writes (`lib/nova.js` ~144).

- **`submitted_nova_version`:** recorded at submission. Review is bound to this version.
- **`approved_nova_version`:** recorded at approval. Equal to `submitted_nova_version` by definition.
- **Locking (§8) prevents change** between submission and approval, so the two values match in normal use.
- **Publication** requires: current `nova_items.version` = `approved_nova_version` = the version snapshotted. If they differ, publication fails with 409 and the approval is marked stale.
- **Stale approval:** if the working document ever changes after approval (for example through a path not covered by the lock), the approval is invalid. It returns to `submitted` or `draft` and needs a fresh review.

This is a non-negotiable integrity rule. The publish step must not use "whatever version is current."

## 8. Content locking

Recommended model: **lock on submission.**

- `submitted`, `in_review` and `approved`: Contributor editing of the Nova document is refused. The Nova autosave routes (`PUT /api/articles/:id/nova/item`) must check `editorial_status` and return 423 or 409 with a clear message.
- `changes_requested` and `draft`: editable.
- Reason: a fixed submitted version is the review target. The version check is then simple, and approvals cannot go stale silently.
- A later collaborative-review model can relax the lock. It is not part of R6.

## 9. Published revision model

- An article with `articles.status = 'published'` stays public while its Nova working document is revised.
- A Contributor who edits a published article moves `editorial_status` to `draft` for the new revision. The public snapshot is unchanged. The public list, search, Education Center cards and published page keep the last approved snapshot.
- A new revision cannot be submitted over a live article without the same review.
- Publication replaces `body_html`, `article_html` and `updated_at` with the snapshot of `approved_nova_version`. The URL (`href`), article id and destination do not change unless a destination correction is approved (§11).
- The public URL and article id never change on publication.
- While a revision is in review, the previous approved snapshot stays live. Unpublishing is a separate publish action that sets `articles.status='draft'` and is audited.

## 10. Publication security checklist

Every publish request must verify all of these server-side:

1. Caller holds `EDITORIAL_PUBLISH`. Role `owner`/`admin` alone is not enough.
2. Caller is not the submitter of the approved submission (self-publication refused).
3. Article `editorial_status` is `approved` and the approval row exists.
4. `approved_nova_version` is recorded.
5. Current `nova_items.version` equals `approved_nova_version`.
6. The snapshot is built from exactly `approved_nova_version`.
7. Reviewed destination and article type match the publication target.
8. Ownership is valid: `articles.created_by` matches the submission, and `articles.nova_item_id` matches the submission's Nova item.
9. Article is not `legacy`, unless it was explicitly brought into the workflow.
10. A publication event is written in the same batch as the status change.
11. The server, not the client, writes `body_html` and `article_html`. Clients never send `status` for workflow publication.

## 11. Destination and article type authority

**Destination** (all 18 values preserved; none removed or renamed):
- Contributor proposes a destination while drafting.
- Changing destination after submission invalidates the current review. Work returns to an editable state and must be resubmitted.
- Publisher may correct destination only through an audited workflow action with an event.
- A reviewer may request a destination change. It is not a silent edit.
- Publication never silently changes an approved destination.

**Article type** (default `Research Paper`):
- Contributor selects while drafting. Kept separate from workflow state. Never used as a status.
- Changing it after approval invalidates approval unless the approved submission explicitly includes the new value.
- Reviewer may request a correction. The Publisher confirms the final value.

## 12. Direct-publish surfaces to retire or constrain

R6 must remove or constrain every surface below. "Remove direct publishing" is not enough on its own; each surface is listed with the required change.

| # | Surface | Required change | Phase |
|---|---|---|---|
| P1 | `POST /api/articles` (`handleCreateArticle`, ~3316): accepts `status:"published"` from any Contributor | Refuse `status:"published"` unless the legacy workflow is still active for that article. For Nova-backed articles, publication goes only through the workflow route. Server ignores client `body_html` for workflow articles. | R6E (constrain), R6F (retire) |
| P2 | `POST /api/admin/articles/:id/status` (`handleAdminArticleStatus`, ~3500) | Requires `EDITORIAL_PUBLISH` or documented emergency unpublish. Publishing goes through the workflow publish route. Unpublish is audited. | R6E |
| P3 | `PUT /api/admin/articles/:id` (`handleAdminArticleUpdate`, ~3457): edits body and HTML of any article | Admin edits of workflow articles must go through a revision or be refused. Must not change a published snapshot silently. Keep audit. | R6F |
| P4 | Content Editor publish (`publishToDestination`, `paper-editor.js` 2045–2090) | Replace the direct publish with "Submit for review" for Nova-backed articles. Legacy articles keep behaviour until R6F. | R6C (submit), R6F (retire) |
| P5 | Content Editor draft save and autosave (`saveDraft` 1997, `scheduleAutosave` 2028, Nova autosave) | Autosave of a locked Nova document refused. Draft save keeps `status:"draft"` only. | R6C |
| P6 | localStorage publish (`tpiPublishedArticles`, `paper-editor.js` 5, 285, 292, 2057–2090) | Stop writing `published` locally for any new article. Read-only compatibility for existing local records. Not authoritative. | R6F |
| P7 | Legacy page import (`importLegacyPage`, `paper-editor.js` ~1828–1850) | Imports enter as `legacy` or `draft`, never `published`. | R6C |
| P8 | Legacy bulk conversion (`bulkConvertLegacyArticles`, `paper-editor.js` 1868–1912) | Converts to `draft` for Nova conversion. Stops publishing legacy pages in bulk. Requires a new directive to publish them. | R6C |
| P9 | `legacy-contributions.js` | Legacy records keep `status` as read input. Its `published` values must not drive new writes. | R6F |
| P10 | TPI Video publish | Out of scope (§17). | none |
| P11 | Fixture and migration scripts | Test data only. Keep `legacy` for seeded published rows. | R6B |

Also constrain:
- `member-home.html` ~3146: the `a.published` fallback must not count unpublished work as published.
- `handleCreateArticle`'s notification on publish (~3375) and `handleAdminArticleStatus`'s notification (~3514) must fire only from the workflow publish action.

## 13. Schema proposal (additive, not written)

`articles` (one additive column):
- `editorial_status TEXT NOT NULL DEFAULT 'legacy'`, with the §4.1 values.
- `status` is unchanged.

`article_editorial_submissions` (new). One row per submission round. Versions and identities are immutable once set.
- `id TEXT PRIMARY KEY`
- `article_id TEXT NOT NULL REFERENCES articles(id)`
- `nova_item_id TEXT NOT NULL`
- `submitted_by TEXT NOT NULL`
- `submitted_at TEXT NOT NULL`
- `submitted_nova_version INTEGER NOT NULL`
- `submitted_destination TEXT NOT NULL`
- `submitted_article_type TEXT NOT NULL`
- `reviewer_id TEXT` (the reviewer who started the review)
- `review_started_at TEXT`
- `approved_by TEXT`
- `approved_at TEXT`
- `approved_nova_version INTEGER`
- `published_by TEXT`
- `published_at TEXT`
- `outcome TEXT NOT NULL` (`open`, `withdrawn`, `superseded`, `approved`, `stale`, `published`)
- `superseded_by TEXT`
- `created_at TEXT NOT NULL`
- `updated_at TEXT NOT NULL`

`article_editorial_events` (new, append-only):
- `id TEXT PRIMARY KEY`
- `article_id TEXT NOT NULL REFERENCES articles(id)`
- `submission_id TEXT`
- `actor_id TEXT NOT NULL`
- `event_type TEXT NOT NULL` (`submitted`, `withdrawn`, `review_started`, `changes_requested`, `resubmitted`, `approved`, `reopened`, `stale`, `publication_started`, `published`, `unpublished`, `destination_corrected`)
- `from_state TEXT`
- `to_state TEXT NOT NULL`
- `nova_version INTEGER`
- `note TEXT`
- `visible_to_contributor INTEGER NOT NULL DEFAULT 1`
- `created_at TEXT NOT NULL`

**Canonical state authority** (resolves duplicate authority):
- `articles.editorial_status` is the **only** current workflow state. Fast UI and API reads use it.
- `article_editorial_submissions.outcome` is **not** a workflow state. It records the fate of one submission round (open, withdrawn, superseded, approved, stale, published). It never drives the article state; the transition function sets both in one batch.
- `article_editorial_events` is the **historical** record. It is never used to derive current state.
- Consistency rule: each transition updates `editorial_status`, the affected submission row and appends one event, in one D1 batch. A mismatch is a bug and the verifier must detect it.

`published` is not stored as an editorial state. Publication is `articles.status` plus the publication event.

## 14. API surface (proposed)

Article-scoped routes, with the required capability and the state each route accepts:

| Route | Purpose | Capability | Accepted from |
|---|---|---|---|
| `POST /api/articles/:id/submission` | Submit the current Nova version | `contributor`, article owner | `draft`, `changes_requested` |
| `DELETE /api/articles/:id/submission` | Withdraw | `contributor`, article owner | `submitted` only |
| `GET /api/editorial/queue` | List `submitted`, `in_review` | `EDITORIAL_REVIEW` | — |
| `GET /api/editorial/articles/:id` | Read-only Nova (submitted version), events, metadata | `EDITORIAL_REVIEW` | any submitted state |
| `POST /api/editorial/articles/:id/start-review` | `submitted` → `in_review` | `EDITORIAL_REVIEW`, not submitter | `submitted` |
| `POST /api/editorial/articles/:id/request-changes` | Requires note | `EDITORIAL_REVIEW`, not submitter | `in_review` |
| `POST /api/editorial/articles/:id/approve` | Records `approved_nova_version` | `EDITORIAL_REVIEW`, not submitter | `in_review` |
| `POST /api/editorial/articles/:id/reopen` | `approved` → `in_review`, with note | `EDITORIAL_REVIEW`, not submitter | `approved` |
| `POST /api/editorial/articles/:id/publish` | Publishes exactly `approved_nova_version` | `EDITORIAL_PUBLISH`, not submitter | `approved` |
| `POST /api/editorial/articles/:id/destination` | Audited destination correction | `EDITORIAL_PUBLISH` | `approved` (with new approval rule) |

Rules for every route:
- Check current state, actor, capability and version.
- Actor and submitter identities come from the authenticated session, never the request body.
- Notes are sent in the body and stored only in `article_editorial_events`.

Existing routes:
- `POST /api/articles`, `POST /api/admin/articles/:id/status` and `PUT /api/admin/articles/:id` keep their behaviour until R6E constrains them (§12).
- `GET /api/articles` remains published-only.
- The Nova routes keep ownership checks and gain the §8 lock check.

## 15. Contributor UX

Actions by state:

| State | Contributor may | Contributor may not |
|---|---|---|
| `legacy` | Keep editing as today until converted to Nova. Converted items become `draft`. | Publish through the new path until converted |
| `draft` | Edit, autosave, preview, choose destination and article type, submit | Publish directly |
| `submitted` | View status, withdraw (returns to `draft`) | Edit Nova (locked), change destination |
| `in_review` | View status and reviewer notes | Edit Nova (locked), withdraw |
| `changes_requested` | Edit, read reviewer notes, resubmit (new submission row) | Submit without a new version |
| `approved` | View status | Edit, change destination, publish |

Live article behaviour: once published, the public article stays live in every state. Contributor edits reach public content only through a new approved and published revision.

Where it lives: inside the Nova Editorial Workspace and the Content Editor. Adds the workflow status, Submit, Withdraw, reviewer notes and Resubmit. No new application.

## 16. Editorial UX (Administration Center)

- Editorial review is a section of the existing Administration Center, not a new application. The Education Center article list in `admin-center-app/src/app.tsx` (~712) and the production `admin-panel.html` are the candidate homes. R6D picks one. **Decided in R6D:** the React Administration Center (`admin-center-app/`, served at `/admin-panel`) is the home; the legacy `admin-panel.html`/`admin-center.js` surface is untouched.
- **Queue:** `submitted` and `in_review` items with author, destination, article type and submitted version.
- **Review:** read-only Nova preview of the submitted version, metadata and event history.
- **Request changes:** requires a note. Visible to the Contributor. Stored in `article_editorial_events` only.
- **Approve:** requires the current version to equal the submitted version. Records `approved_nova_version`.
- **Publish:** shows the approved version and final destination, then requires `EDITORIAL_PUBLISH`. Publication writes the snapshot of the approved version (§10).
- Admin oversight (audit, emergency unpublish) sits in the same section and is audited. It does not grant review or publish by role.

## 16A. TPI-NOVA-004R6C2 — Contributor workflow implemented

Implemented: Submit, Withdraw (before review start), and Resubmit for Contributors; server-side Nova locking for submitted, in-review and approved items; refusal of crafted direct publication for enrolled articles; version pinning to the server-resolved Nova version; published-snapshot preservation; TPI Video exclusion; read-only editor driven by server state.

Not implemented: Editorial Review queue, Reviewer actions UI, Publisher UI, and retirement of legacy direct publication (R6E).

## 16B. TPI-NOVA-004R6C3 — Final acceptance and milestone close

Status: R6C is complete as the Contributor side of the editorial workflow and is local-only. Production has not received R6C.

Accepted: the published-revision snapshot test (published legacy article, newer unpublished Nova edit, submission leaves `articles.status`, `body_html` and the public `article_html` snapshot unchanged, and the public page keeps the old text); the Firefox console review (zero errors); public regression on 8787; and fixture cleanup with a local-only, scoped procedure. The append-only event triggers were suspended only on the authoritative local DB and restored from the exact 0061 definitions, then verified. No schema or migration was added.

Not implemented: the Editorial Review queue, Request Changes reviewer controls, the Approval UI and the Publisher UI. `tpi-videos.html` and its specialized publish path are unchanged.

## 16C. TPI-NOVA-004R6D — Editorial Review Queue and reviewer actions implemented

Status: implemented and locally accepted; production has not received R6D. Publishing is still not implemented.

Delivered:

- **Queue:** an Editorial Review section inside the existing React Administration Center (no new app, route or shell). Default queue is `submitted` + `in_review`; Changes Requested and Approved are optional filters. Published rows, legacy articles and TPI Video are excluded. Rows carry title, Contributor, article type, destination, submitted date/time, round, status and the submitted Nova version.
- **Authority:** `EDITORIAL_REVIEW` only, resolved from an active `member_entitlements` row through `resolveMemberEntitlements`. `requireAdmin` is not a substitute, ordinary Admin is not equivalent, and `EDITORIAL_PUBLISH` is not required. `migrations/0062_editorial_capabilities.sql` widens the entitlement capability CHECK so editorial capabilities can be granted at all (0058 permitted only `creator`/`contributor`).
- **Exact-version review:** the review surface renders the pinned `submitted_nova_version` read-only — newest `nova_revisions` row at or below the version, the live item only when `nova_items.version` equals it exactly, otherwise `submitted_version_unavailable`, which blocks approval. Reviewer notes never enter the document body.
- **Transitions:** Start Review (`submitted → in_review`, records reviewer and `review_started_at`), Request Changes (`in_review → changes_requested`, note required), Approve (`in_review → approved`). One active reviewer per round; a second reviewer cannot silently take ownership (`review_owned_by_another_reviewer`). Reassignment is deferred. Withdrawal stays refused once review starts.
- **Feedback:** `article_editorial_events.note` is the single feedback record. The Contributor sees the note and timestamp next to the workflow controls while `changes_requested`, with the editor unlocked, autosave active, Resubmit available and direct Publish unavailable (R6C unchanged).
- **Approval integrity:** approver ≠ submitter, reviewed metadata unchanged, no version drift, pinned version resolvable; records `approved_by`, `approved_at`, `approved_nova_version = submitted_nova_version` and an event. The Contributor state is Approved — Awaiting Publication, read-only, with no publish, withdraw, edit or resubmit.
- **Non-publication:** `articles.status`, `body_html` and the public snapshot are untouched by review and approval. All transitions run in `lib/editorial-workflow.js`; handlers do not restate the rules.

Not implemented at R6D: the Publisher UI, publication of an approved version, and retirement of legacy direct publishing. R6E implemented the Publisher side; legacy retirement remains R6F.

## 16D. TPI-NOVA-004R6E — Authorized publication of approved Nova content implemented

Status: implemented and locally accepted; production has not received R6E.

Delivered:

- **Publisher authority:** `EDITORIAL_PUBLISH` from the entitlement ledger, resolved by `requirePublisher`. Ordinary Admin, Contributor, Creator and `EDITORIAL_REVIEW` do not imply it. `worker.js` accepts either editorial capability for `/admin-panel` entry so a Publisher-only account can reach the Administration Center; Reviewer-only accounts still cannot publish and Publisher-only accounts still get no review controls.
- **Surface:** the Approved Publication workspace inside the existing React Administration Center (no new app, route or shell, no `/nova-publisher/`). It lists `editorial_status='approved'` articles with a valid approved open submission and excludes TPI Video.
- **Exact approved version:** publication resolves `approved_nova_version` and renders it from `nova_revisions`, using the live `nova_items` row only when its version equals the approved version exactly. Missing, shadowed, empty or unreconstructable versions fail closed; there is no fallback to the current document, no client-supplied HTML and no browser-local recovery copy. Changed current versions and drifted destination/article-type are refused.
- **Server-generated snapshot:** `lib/nova-document-html.js` deterministically renders the approved document to `body_html`/public `article_html`, mirroring the browser converter. Requests that supply `body_html`, `article_html` or publication state are refused `422 publication_payload_refused`.
- **Atomic replacement:** a single D1 batch sets `articles.status='published'`, the snapshot fields and `updated_at`, marks the approved submission `outcome='published'` with `published_by`/`published_at`, and appends the `published` event (`approved → approved`). Article id, href, owner, `created_by`, destination and article type are preserved; the previous snapshot stays live until the replacement commits, so there is no unpublish window.
- **Editorial state:** `editorial_status` remains `approved`; no `published` editorial state exists. The Contributor sees Published — Live in the Education Center and a locked document, with no new revision cycle opened (R6F).
- **Separation of duties:** `published_by != submitted_by`, enforced server-side (`403 self_publication_refused`). Reviewer and Publisher may coincide when both capabilities are legitimately held.
- **Admin bypass:** for enrolled articles the Admin status and update routes return `409 editorial_workflow_publish_refused`; legacy articles keep their administrative behavior, are not mass-enrolled, and TPI Video keeps its specialized publish path. The Contributor direct-publish block from R6C is preserved, and every `[data-action="publish"]` control is now hidden for enrolled articles, including the settings drawer.
- **Notifications:** at most one `education` notification per publication, only when the article was not already published, excluding the submitter. Review transitions do not notify, so publication is announced once.
- **No schema change:** `0062_editorial_capabilities.sql` already provided `editorial_publish`.

Verification: `scripts/verify/tpi-nova-004r6e-publish.mjs` 60 passed / 0 failed; Firefox Developer Edition authoritative workflow plus Chromium smoke 80 passed / 0 failed across disposable fixtures; real local articles fingerprint-identical before and after (`1eea9b37008c9d68`). Local-only; production untouched.

## 17. TPI Video — out of scope

TPI Video is **out of scope for the initial Education Center editorial workflow.** It keeps its own direct publishing path (`tpi_videos.status`, `/api/tpi-videos/*/publish`). It does not use the Nova document or the article workflow. A future directive may decide whether video publishing needs its own review system.

## 18. Destinations (all 18 preserved)

Destinations are part of the approved record (§11). No destination value is replaced or removed.

## 19. Legacy and Nova-backed articles

- Legacy articles (no `nova_item_id`) keep `editorial_status='legacy'` and current behaviour. No mass migration.
- A legacy article enters the workflow only through conversion to Nova (004R5 path), which leaves it `draft`.
- Nova-backed drafts follow the full workflow.
- Nova-backed published articles remain published. Any new revision follows §9.
- `legacy` articles may remain published indefinitely. They are not forced through review.

## 20. Notifications

`notifyActiveMembers` already runs on publish (P1, P2). Workflow notifications (submitted, changes requested, approved, published) are a later phase. Email is not involved today. Publication notifications move to the workflow publish action in R6E.

## 21. Deferred governance (does not block 004R6A)

These are operational-role decisions. They are recorded here and deferred to the operational-roles roadmap:

- Senior Moderator and Lead Moderator.
- Assistant Administrator.
- Admin tier naming.
- Full permission matrix beyond the editorial capabilities here.
- Who may appoint each organisational role.
- Broader community moderation hierarchy.

004R6A needs only the boundaries in §2: Contributor, Editorial Review, Editorial Publish, Admin oversight and Owner oversight. Those are settled.

Other pre-existing security work (not part of this architecture): the production security release of the 004R2 ownership fix (migration plan §15) remains open.

## 22. Implementation sequence (not started)

- **R6B — Workflow foundation.** Add `EDITORIAL_REVIEW` and `EDITORIAL_PUBLISH` to `CAPABILITY`. Add the additive schema (§13). Write the server-side transition function with event and submission writes in one batch, and tests for every transition, self-approval refusal, withdrawal limits, and version mismatch. No UI. No public behaviour change.
- **R6C — Contributor submission.** Submit, withdraw and resubmit routes and the Contributor UI. Nova lock on `submitted`/`in_review`/`approved`. Legacy import and bulk conversion (P7, P8) move to `draft`. Firefox Developer Edition acceptance.
- **R6D — Review queue.** Queue, read-only Nova review, request changes, approve, in the Administration Center. Firefox Developer Edition acceptance.
- **R6E — Publication. Implemented.** The publish route with the §10 checklist, snapshot of `approved_nova_version`, audit and events. Constrains P1, P2 and the Content Editor publish button (P4) for enrolled articles; legacy behavior retained. Firefox Developer Edition acceptance passed.
- **R6F — Revisions and retirement.** Published-article revision workflow (§9). Retire direct publish paths P1, P4, P6 and P9 for Nova-backed content. Constrain P3. Remove the `member-home.html` `published` fallback. Update the tests named in §1.9.

Each phase is independently testable and gets a Firefox Developer Edition acceptance run before the next begins.

## 23. Scope of this record

This record:
- does not add migrations or change the schema;
- does not change application code, article status, public rendering, buttons, permissions or the Administration Center;
- does not touch production;
- does not claim that review or publication is implemented.

Implementation status: **architecture complete; implementation not started.**

## 24. Verification of the audit

- Every publish surface in §12 was located in source at the line numbers cited (P1–P11), plus the Admin and public read paths in §1.3–§1.4.
- Tests that assume two states are listed in §1.9.
- Governance mappings cite `007-SECURITY-AND-PERMISSIONS.md` and `TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md`.
- Nothing in §1–§22 depends on an unaudited item. All items named in the earlier §21 open list are now audited (§1.3–§1.9).
