# TPI-STUDIOFLOW-137 — Complete Notes Workspace Restoration and Release Preparation

Status: **IMPLEMENTATION AND LOCAL ACCEPTANCE COMPLETE — PRODUCTION DEPLOYMENT
BLOCKED PENDING AUTHORIZED NOTES SCHEMA MIGRATION.**

Classification: feature recovery / integration / release preparation.
Production deployment: not authorized by this directive.
Authoritative browser: Firefox Developer Edition.

This directive restores the complete Notes workspace approved under the
TPI-STUDIOFLOW-122 family and recovered during
[TPI-STUDIOFLOW-136](TPI-STUDIOFLOW-136-COMPLETE-NOTES-RECOVERY-INVESTIGATION.md).
It is a restoration of existing approved functionality, not a redesign.

## 1. Recovered source and integration commits

The approved implementation was recovered intact from the unmerged
`codex/studioflow-122-notes` branch at `a6784cf`. Integration was performed in a
new isolated worktree at `/Users/toddknipple/Documents/StudioFlow/web-137` on
branch `codex/tpi-137-notes-restoration`, cut from the released lineage head
`f44f3a0`.

| Repository | Commit | Purpose |
| --- | --- | --- |
| StudioFlow source | `19c69d4` | Port the Notes workspace onto `f44f3a0` |
| StudioFlow source | `cd5e88b` | Keep the workspace open across a page refresh |
| Website repository | `44147cd` | Approved baseline, staged assets, acceptance and guards |

The historical Notes branch was **not** merged. `main` was not reset, the
historical build was not substituted for the current application, and no
unrelated branch was merged.

### Files recovered byte-identically from `a6784cf`

| File | Lines | SHA-256 blob |
| --- | --- | --- |
| `src/NotesView.tsx` | 754 | `a56b3d2f04ae6c75f7caefd8e4a9782d89b1381d` |
| `src/projectExport.ts` | 262 | `f3e5a3b2915d836c1522d942991e276e73bc3860` |
| `src/projectFolderSync.ts` | 207 | `311acf7089a7ed102b3f8d58e797e82ceaa649c2` |

These three modules are the whole Notes feature. They import only `react`,
`lucide-react` (already a dependency of the released lineage — no package was
added) and their two sibling modules.

### `src/App.tsx` integration

`App.tsx` is where the port was hand-applied, because the same file carries the
TPI-131/132R/133/134/135 corrections. The Notes-specific surface is small: the
feature commit that introduced it (`7a5c36a`) touched 30 lines, and four
navigation fixes added 35 more. Applied changes:

- `NotesView` import and the `notes` route added to the `Route` union.
- `readStoredRoute()` recognises `notes`.
- Route persistence includes `notes`.
- `storageKeys.notesWorkspaceIntent` session flag.
- The maintained activation bridge no longer steals the page back into the
  recording surface while the Notes intent is active.
- `{route === "notes" && <NotesView />}` rendering.
- Notes entry in the main navigation, between Destinations and Teleprompter.
- Notes card in the Home create grid, between On-Air webinar and Teleprompter.
- `finishStudio()` persists Home and clears the Notes intent.
- `readStoredRoute()` honours the Notes intent before the replayed Studio
  identity (see §5).

### Stylesheet

The Notes stylesheet could not be lifted as a whole-file diff: on the historical
branch `src/styles.css` also carries teleprompter, screen-sharing and recording
work that is not Notes. Instead the 205 rule blocks that style the classes
`NotesView.tsx` actually uses were extracted from `a6784cf:src/styles.css` and
appended unchanged — 884 lines covering 101 classes, including the
`@container notes-workspace` responsive block. Unrelated selectors were
excluded by construction, so no teleprompter, scene or deletion styling moved.

## 2. The older right-side Notes utility is unchanged

The historical implementation replaced the Studio rail's Notes panel with the
new `NotesSidebar`. The directive forbids that, so the replacement was **not**
ported: `rightTab === "Notes"` still renders the original `studioNotes`
textarea with its word count and Clear control, backed by
`studioflow.studioNotes` in `localStorage`.

The two features stay separate: the rail scratchpad is a global, browser-local
note; the complete workspace is account-backed and Studio-independent. Nothing
migrates between them, and no redirect connects them.

This is the one deliberate deviation from the historical implementation, and it
is required by the directive rather than by a technical limitation.

## 3. The workspace's two entry points

- **Home create grid** — `FileText` card, title `Notes`, description
  "Write, research, and organize notes", positioned between On-Air webinar and
  Teleprompter.
- **Main navigation** — `FileText` entry labelled `Notes`, positioned between
  Destinations and Teleprompter.

## 4. Persistence architecture

Notes are account-backed through `/api/notes`, which was still present on the
released lineage; the UI was the only missing half. Verified end to end:

- `POST /api/notes` creates a note; the editor autosaves and the footer
  `Save now` control forces a save.
- `GET /api/notes?status=all` is the authoritative read; the acceptance suite
  compares the typed title and body against that response, not against browser
  storage.
- Editing increments `version`; trash, restore and permanent delete move
  `status` and `deleted_at`.
- Collections assign through `collection_id`; nested folders already worked on
  the released schema through `parent_id`.
- The workspace keeps local drafts (`NOTEdraft` keys) only as crash recovery;
  a draft never overrides the server record silently.

Notes are owner-scoped, not Studio-scoped. Switching Studios does not move or
hide them, which is the approved behaviour: a note belongs to the account that
wrote it.

## 5. One genuine compatibility defect found and fixed

On the released lineage the maintained `studio/workspace-bridge.js` replays the
last active Studio at startup and writes `studioflow.route = "studio"`
(bridge line 485). The historical branch never met that behaviour, so a
refreshed Notes page was replaced by the recording surface — the workspace
opened, then vanished on reload.

`cd5e88b` fixes it in the application rather than by changing the bridge:
`readStoredRoute()` returns `notes` when the session Notes intent is set, and a
new effect clears that intent for every other route so the flag cannot outlive
the workspace. The acceptance suite now asserts both the reload survival and
that the page is not redirected into a Studio.

## 6. Database and migration state

Migrations `0055_studioflow_notes.sql`, `0056_studioflow_note_automatic_titles.sql`
and `0057_studioflow_note_trash_metadata.sql` create `studio_note_collections`,
`studio_notes`, `studio_note_revisions` and `studio_note_attachments`.

They were applied to a disposable SQLite database in order and verified: all
four tables and seven indexes are created, and the resulting `studio_notes`
carries `title_mode`, `deleted_at` and `trash_collection_id`.

Idempotency: `0055` is safe to re-run (`CREATE TABLE IF NOT EXISTS`); `0056` and
`0057` are **not** — SQLite has no `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, so
a second application fails with `duplicate column name`. They must be applied
exactly once, in order, in a single authorized transaction set.

Local development database: the Notes schema is present with 3 collections,
204 notes, 429 revisions and 0 attachments. Most of that is synthetic test data
(203 notes belong to `local-ops028-test-admin`, 184 already in Trash); the one
genuine owner note is `Crosroads of the Unknown` (204 characters). No existing
Notes row was deleted, recreated or overwritten during this directive.

### Production schema — verified read-only

`wrangler d1 execute tpi_contributor_portal --remote` (read-only `SELECT`
against `sqlite_master`) returns **no** `studio_note_*` table or index. The
`d1_migrations` ledger holds only two rows while 60 migration files exist and
`studio_media_assets` (0054) is present without `studioflow_workspaces` (0051),
so the ledger is **not** an authoritative record of production schema and a
blanket `wrangler d1 migrations apply` must not be used against production.

Consequence: the complete Notes workspace is fully functional locally but
**cannot persist in production**, because its tables do not exist there. No
production Notes data exists or was lost.

## 7. Release safeguards (directive §10)

Two independent guards were added to the guarded release path.

**Approved-feature continuity and lineage guard** —
`scripts/verify/tpi-studioflow-137-notes-continuity.mjs`, run by
`release:preflight`. It fails when:

- the approved commit does not descend from `source.previousApprovedCommit`
  (the exact TPI-130 failure) unless `TPI_RELEASE_LINEAGE_OVERRIDE` carries a
  written justification, which is echoed into the release output;
- the approved source no longer contains the Notes route, the Home create card,
  the navigation entry, the mounted workspace component or the module import;
- the staged bundle no longer contains the `notesWorkspaceIntent`,
  `notes-rich-editor` or `studioflow.notes.layout` markers;
- the staged bundle no longer contains the older right-side scratchpad.

**Production schema readiness** —
`scripts/verify/tpi-studioflow-137-production-schema.mjs`, run by
`release:production` before any upload. It reads
`productionSchemaRequirements` from the release baseline and refuses to deploy
while a required table is missing, naming the pending migrations. It currently
reports `BLOCKED` with all four tables missing, which is the enforced reason
production cannot ship this feature yet.

The baseline therefore records both `approvedCommit` and
`previousApprovedCommit`, so the ancestry check is meaningful for the next
release too.

## 8. Verification performed

Reproducibility: `stage-studioflow-authoritative.mjs --apply` built the approved
commit twice from a clean disposable worktree, both builds identical
(`reproducibleBuilds: true`), generated assets matched the recorded baseline
(`matches: true`) and the staged tree matched the build (`matches: true`). All
eleven maintained bridge files were preserved.

Firefox Developer Edition, fresh disposable profile, synthetic `test_admin`
account: **36/36** —
`scripts/verify/tpi-studioflow-137-notes-restoration.mjs`.

| Area | Result |
| --- | --- |
| Login, restored build identity | PASS |
| Notes card present, correct copy, correct position | PASS |
| Notes navigation present, between Destinations and Teleprompter | PASS |
| Workspace opens from Home card and from navigation | PASS |
| Organization, library and editor panels render | PASS |
| Create, title, body, save, "All changes saved" | PASS |
| Server-side storage confirmed through `/api/notes` | PASS |
| Survives a page refresh and is not redirected into a Studio | PASS |
| Edit persists, version increments | PASS |
| Folder creation and note organization persist | PASS |
| Search narrows the library | PASS |
| Move to Trash, restore, active server-side again | PASS |
| Older right-side scratchpad present, independent, no data leak | PASS |
| Disposable data removed afterwards | PASS |

Existing regression suites, run against the restored candidate:

| Suite | Result |
| --- | --- |
| Maintained Firefox acceptance (`tpi-studioflow-firefox-acceptance`) | 64/64 PASS |
| TPI-133 floating Studio actions menu | 44/44 PASS |
| TPI-134 production colors, Scene drag, live Teleprompter cue | 43/43 PASS |
| TPI-135 Scene item persistence | 30/30 PASS |
| TPI-087 Studio ownership and dashboards | 40 PASS |
| TPI-088 Studio deletion and archive | 32 PASS |
| TPI-089 deletion safety and data integrity | 26 PASS |
| TPI-137 Notes continuity and lineage guard | 14/14 PASS |
| Release safety contract | PASS |

No regression was found in deletion, Studio management, ownership, teleprompter
playback, production colors or Scene persistence.

## 9. Owner development work preserved

`/Users/toddknipple/Documents/StudioFlow/web` was never modified. Before and
after this directive:

| File | SHA-256 (unchanged) |
| --- | --- |
| `src/App.tsx` | `543f467145b8fcf473368e04059b4190609bcf585aa09c3bc413f46fa4a5e764` |
| `src/styles.css` | `190be155e1aa304b6ef6fbcd9df50917e5f7120306fb6651dc8a23168e1f0cc1` |

The branch stays at `9f85f9d` with exactly those two modified files. Nothing was
stashed, cleaned, reset or overwritten.

## 10. Remaining limitations

- `src/projectFolderSync.ts` needs `window.showDirectoryPicker`, so local project
  folder sync is Chromium-only by design. It fails closed in Firefox and falls
  back to the ZIP download, exactly as approved. Firefox is the acceptance
  browser; folder sync itself was not exercised natively in this directive.
- An independent second-account access test was not executed. Owner scoping is
  enforced server-side by `owner_id = user.id` on every Notes query and was
  proven by the recorded TPI-122 acceptance; this directive did not re-run a
  two-account isolation test, so it is not claimed here.
- Version-history browsing and attachment upload were not re-exercised in this
  run; their endpoints and UI are present and unchanged from the approved
  implementation.
- The historical TPI-122 verification scripts still reference the `web-122`
  worktree paths and were not re-pointed. The maintained replacement for them is
  the single TPI-137 suite above.

## 11. Production readiness

Implementation is complete and reproducible. Production deployment is
**blocked**, by design and by an enforced gate, on one remaining authorization:

1. Approve migrations `0055`, `0056`, `0057` for production D1
   `tpi_contributor_portal`, applied once each, in order, under a migration
   release — not through a blanket `d1 migrations apply`, because the ledger is
   incomplete.
2. Re-run `node scripts/verify/tpi-studioflow-137-production-schema.mjs`; it must
   report `PASS`.
3. Then, and only then, `TPI_PRODUCTION_DEPLOY=approved npm run release:production`.

Until step 1 is authorized, the guarded release refuses to deploy, so the
workspace cannot reach production in a state where it silently fails to save.

## 12. Owner acceptance before deployment

At `http://127.0.0.1:8787/studio/` in Firefox Developer Edition:

1. The Home page shows **Notes** between On-Air webinar and Teleprompter.
2. The left navigation shows **Notes** between Destinations and Teleprompter.
3. Both open the complete workspace — organization rail, note library and
   editor, with the original layout.
4. Create a note, type, save, refresh: it is still there.
5. Create a folder, file a note into it, reopen.
6. Move a note to Trash and restore it.
7. Confirm the old right-side Notes panel in a Studio is unchanged and still
   its own separate scratchpad.
