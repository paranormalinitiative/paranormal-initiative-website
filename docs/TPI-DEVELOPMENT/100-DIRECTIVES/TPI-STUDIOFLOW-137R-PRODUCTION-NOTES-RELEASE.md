# TPI-STUDIOFLOW-137R — Production Notes Release

Status of the deployed release: **COMPLETE — PRODUCTION VERIFIED**
Addendum 01 (Home layout patch): **verified locally, awaiting owner inspection
before it replaces the production Worker. Not deployed.**

Date: 2026-11-02
Worker: `theparanormalinitiative`
Database: `tpi_contributor_portal` (`f36b9161-b517-4634-9857-bef4147cefe3`)

## A. Authorization

Owner authorization for production execution of the Notes restoration, migrations
`0055`–`0057`, and the guarded Worker release. Owner visual acceptance of the
TPI-137A Notes workspace: "looks good my friend. Lets deploy this one to the
production site." Addendum 01 extended the same release with two Home layout
corrections and repeated the requirement that the owner inspect the corrected
build before it replaces the production Worker.

## B. Starting state

| Item | Value |
| --- | --- |
| Production Worker before release | `3082475b-80ad-4557-82d6-32618e3f7079` |
| StudioFlow source | `9113baf` on `codex/tpi-137-notes-restoration` (worktree `web-137`) |
| Website release commit | `91b90c7` on `codex/tpi-development` |
| Staged JavaScript | `index-PJlxxK5f.js` — `7e7406463a7ba7ff…` |
| Staged CSS | `index-7UmKFnSB.css` — `9a815d2b7cc8c638…` |
| Source worktree | clean |
| Website worktree | clean |

Both asset hashes matched `scripts/studioflow-release-baseline.json` before any
production change.

## C. Pre-migration D1 state (read-only)

Live inspection of `tpi_contributor_portal`, not an assumption from earlier
directives:

- 68 tables, 205 indexes.
- **Zero** note-related objects: no `studio_note_*` tables, no indexes.
- No Notes rows existed, so there was no Notes data to preserve or migrate.
- Database identity confirmed as production (`served_by: v3-prod`, ENAM/IAD).

### Recovery evidence

D1 Time Travel is available for this database and was verified before migration:

```
current bookmark: 0000067a-00000056-00005117-0dadf9be072a311c2db5d6f3d955c1b6
restore: wrangler d1 time-travel restore tpi_contributor_portal --bookmark=…
```

Also preserved: the full `sqlite_master` snapshot of every table and index
definition taken immediately before migration, the migration SQL itself, the
Worker ID, and per-step timestamps below.

**Worker rollback does not reverse a D1 schema migration.** Rolling
`theparanormalinitiative` back to `3082475b…` would restore the previous
application against the *migrated* database; it would not remove the Notes
tables or columns.

## D. Migration execution

No blanket `wrangler d1 migrations apply` was used at any point. The production
`d1_migrations` ledger is unreliable (2 rows against 60 files, with objects
present whose migrations are absent), so each migration was applied explicitly
by file, in order, and verified before the next one.

| Migration | Method | Timestamp (UTC) | Result | Verified |
| --- | --- | --- | --- | --- |
| `0055_studioflow_notes.sql` | `wrangler d1 execute … --file` | 03:30:38 | success, 19 rows written | 4 tables + 5 explicit indexes present |
| `0056_studioflow_note_automatic_titles.sql` | `--file` | 03:30:50 | success | `studio_notes.title_mode` present |
| `0057_studioflow_note_trash_metadata.sql` | `--file` | 03:30:57 | success | `deleted_at`, `trash_collection_id` present |

`0055` is idempotent (`IF NOT EXISTS`). `0056` and `0057` are **not**: they use
plain `ALTER TABLE … ADD COLUMN`, because SQLite has no
`ADD COLUMN IF NOT EXISTS`. They must never be re-run; each was applied exactly
once.

## E. Post-migration schema

| Measure | Before | After | Expected delta |
| --- | --- | --- | --- |
| Tables | 68 | 72 | +4 Notes tables |
| Indexes | 205 | 218 | +7 explicit + 6 implicit PK/UNIQUE |
| Notes tables | 0 | 4 | — |
| Explicit Notes indexes | 0 | 7 | — |
| Notes rows | — | 0 / 0 / 0 / 0 | no unexplained data |

Tables: `studio_notes`, `studio_note_collections`, `studio_note_revisions`,
`studio_note_attachments`. Indexes: `idx_studio_notes_owner_collection_status`,
`idx_studio_notes_owner_search`, `idx_studio_notes_owner_title_mode`,
`idx_studio_notes_owner_status_deleted`, `idx_studio_note_collections_owner_parent`,
`idx_studio_note_revisions_note_created`, `idx_studio_note_attachments_note`.

Required columns verified: `title_mode`, `deleted_at`, `trash_collection_id`.
The delta is exactly the Notes objects; no unrelated schema object changed.
`scripts/verify/tpi-studioflow-137-production-schema.mjs` reported **PASS** from
the live schema.

## F. Preflight

`npm run release:preflight` → **READY, exit 0** at `91b90c7`, with
`3082475b…` as the rollback target at that moment.

## G. Deployment

| Item | Value |
| --- | --- |
| Command | `TPI_PRODUCTION_DEPLOY=approved npm run release:production` |
| Previous Worker | `3082475b-80ad-4557-82d6-32618e3f7079` |
| New Worker | `da8c4757-f9d9-42ce-af79-da7a0362c786` |
| Version created | 2026-11-02T03:46:02Z |
| Traffic | 100% on `da8c4757…` (verified, not inferred) |
| Source commit | `91b90c7` |
| Result | `DEPLOYED_AND_VERIFIED`, exit 0 |

The guarded workflow ran the production schema gate, the full preflight, the
guarded upload, the anonymous production smoke, and the live isolated Firefox
acceptance before confirming traffic. No rollback occurred.

## H. Production QA

Firefox Developer Edition against `https://paranormalinitiative.com`, using the
dedicated production QA account. QA records are created and removed by the suite;
owner data is never used as a test fixture.

| Acceptance | Result |
| --- | --- |
| TPI-137 Notes restoration and persistence (production) | **37/37 PASS** |
| TPI-137A Notes visual acceptance (production) | **67/67 PASS** |
| True mobile viewport acceptance (production) | **19/19 PASS** |
| Anonymous production smoke | PASS |
| Live Firefox release acceptance (production) | PASS |

Verified on production: both Notes entry points (Home create card between On-Air
webinar and Teleprompter; navigation entry between Destinations and Teleprompter),
direct-route refresh, route intent cleared on other routes, create, edit, autosave,
explicit save, refresh persistence, rich-text formatting, search, sorting,
favorites, collections, folders, podcast project and episode, archive, trash,
restore, revision history, export, account isolation, and the legacy right-side
scratchpad remaining independent.

Two harness defects were found and fixed rather than worked around:

1. The suites assumed local-only sign-in. Production redirects to `/member-home`
   before the session settles, so an early Studio request landed on the login
   page. Both suites now re-authenticate and re-navigate.
2. The leftover sweep posted an invalid permanent-delete payload (the API
   requires `confirmation: "DELETE PERMANENTLY"` and `expectedVersion`), so it
   silently left notes behind and its assertion could never fail. It now deletes
   correctly and asserts zero remaining. Production QA leftovers were swept
   afterwards.

Visual QA on production confirmed the organization rail renders as approved flat
rows (no browser-default boxes), the workspace container is active, the library
stays inside its panel, long titles ellipsize, the toolbar wraps as approved, and
the save control is reachable.

## I. Responsive QA

The TPI-137A limitation — Firefox refusing to render below 500 CSS pixels on this
host — is closed. A same-origin `390`/`375` px frame produces a genuine CSS
viewport (media queries, container queries and layout resolve against it), and
was run against production:

| Viewport | Result |
| --- | --- |
| 390 × 844 | 19/19 checks in the shared run: real 390px viewport, no horizontal overflow, container active, navigation usable, library usable, editor usable, toolbar accessible, save reachable |
| 375 × 812 | same, at a real 375px viewport |
| 1920 × 1080 / 1440 × 900 / 1280 × 800 | verified in the visual and Home suites |
| 1024 × 768 / 834 × 1194 | verified (single-column collapse) |

Windowed Firefox was also attempted and clamps to 500px, as did
`layout.css.devPixelsPerPx` scaling — recorded so no one repeats that dead end.

## J. Regression results

| Suite | Result |
| --- | --- |
| TPI-133 floating Studio actions menu | 44/44 PASS |
| TPI-134 colours, Scene drag, Teleprompter | 43/43 PASS |
| TPI-135 Scene persistence | 30/30 PASS |
| Studio ownership and dashboard | 40 PASS |
| Studio deletion and archive | 32 PASS |
| Studio deletion safety | 26 checks, 0 failed |
| Studio management lifecycle | 29 PASS |
| Maintained Firefox release acceptance | 64 PASS |
| Continuity and lineage guard | 14/14 PASS |
| Release workflow safety contract | PASSED |

## K. Data safety

- Production Notes data created for QA: disposable acceptance notes and folders
  under the production QA account, all removed. The production Notes tables end
  with **zero rows**.
- No owner note was created, edited, moved or deleted in production. Production
  had no Notes data before this release, so there was nothing to migrate, and the
  owner's local `Crosroads of the Unknown` note was not copied to production.
- Local owner data untouched: the local note remains at revision 30 with revision
  29 retained; audit was read-only against a snapshot.
- No D1 reset, deletion or destructive schema operation. No migration other than
  `0055`–`0057` was applied.
- Protected owner source in `/Users/toddknipple/Documents/StudioFlow/web`
  unchanged: `src/App.tsx` `543f4671…`, `src/styles.css` `190be155…`, `main` at
  `9f85f9d`.

## L. Known limitations

- Native local-folder sync requires a browser folder API that Firefox does not
  provide; the approved fallback was verified and the capability is reported as a
  browser limitation, not a release failure.
- Below 1100px the dashboard content column cannot shrink below its content, so
  the Home page scrolls horizontally by ~37px at 1024/834. This is pre-existing
  and independent of this release: it measures identically with the previous
  create-grid rule. The remedy is one declaration on the dashboard grid
  (`minmax(0, 1fr)`), which would change every dashboard page and is deliberately
  left for an explicit decision.
- Production acceptance authenticates as a `member`-role QA account; admin-only
  surfaces are covered by the local suites, not by production QA.

## M. Addendum 01 — Home layout corrections

Two owner-identified Home defects, fixed as CSS-only changes on the same lineage.

### M1. Create card wrapping

**Previous approved fix:** `c2a6f6e` "Balance Home Create card layout"
(2026-10-31) changed `.create-grid` from
`repeat(auto-fit, minmax(240px, 1fr))` to `repeat(5, minmax(0, 1fr))` with 3/2/1
column breakpoints at 1180/760/560.

**Why it stopped applying:** `c2a6f6e` lives on the sibling lineage and is *not*
an ancestor of `f44f3a0`, the head this lineage released from
(`git merge-base --is-ancestor` → not an ancestor). The Notes restoration added
the fifth card to a tree that had never received the balancing rule, so the
auto-fit rule packed four cards and pushed Teleprompter onto a second row.

**Correction:** restored the five-across rule, then adapted the breakpoints to
this app's real content width — the sidebar leaves only ~172px per card at a
1280px window, so five-across now begins at 1280 with a compact icon (32px,
8px padding) in the 1280–1360 band, the balanced three-across layout covers
768–1279, and two/one columns follow. Nothing was redesigned; the card keeps its
structure, order and behaviour.

### M2. My Studios spacing

The Home header (`.home-page > .broadcast-table-header`) sat directly against the
Studio list or empty state, which carries its own top border. Added an 18px
`margin-bottom` scoped to the Home header only, leaving the shared header used by
the Studio dashboards untouched. Button appearance and alignment unchanged.

### M3. Verification

`scripts/verify/tpi-studioflow-137r-home-layout.mjs` measures rendered geometry:
five cards present in the approved order, all on one row at 1920/1440/1280, no
overlap, no horizontal overflow, no card content clipped, ≥12px between the My
Studios header and the panel below, and balanced rows with readable cards at
1024/834. Result: **41/41 PASS**.

Source commits: `52acf68` (five-across + spacing), `8aba8dd` (band start),
`eefb7de` (cascade order). Pending assets:
`index-ChuELpxr.js` (`7e7406463a7ba7ff…`, **JavaScript bytes unchanged**) and
`index-CxnemqTQ.css` (`cc1c01425b52bbca…`).

Preflight with the addendum: **READY, exit 0** at `e1ac570`, with
`da8c4757…` — the currently deployed Worker — as the rollback target. Gate
results: Notes 37/37, Notes visual 67/67, Home layout 41/41, mobile 19/19,
TPI-133 44/44, TPI-134 43/43, TPI-135 30/30, ownership 40, deletion 32,
deletion safety 26/0 failed, lifecycle 29, maintained acceptance 64, continuity
14/14, staging verification PASS, guarded dry-run READY.

**The addendum patch has not been deployed.** Per addendum §4 (STATE D), the
owner inspects the corrected build before it replaces the production Worker.
Production therefore still serves `da8c4757…` with the Notes release, and the
Home card wrapping is still visible there until the patch is approved.
