# TPI-STUDIOFLOW-136 — Complete Notes Workspace Recovery Investigation

Date: 2026-11-02
Classification: Source recovery / historical investigation / restoration planning
Environment: Local development and read-only production inspection
Production deployment: **NOT AUTHORIZED AND NOT PERFORMED**
Implementation: **NOT AUTHORIZED AND NOT PERFORMED**

## Final status

**INVESTIGATION COMPLETE — RESTORATION PLAN PENDING OWNER AUTHORIZATION**

The complete Notes workspace was located. It was **not deleted, corrupted or
lost**. It lives intact on the unmerged StudioFlow branch
`codex/studioflow-122-notes` at `a6784cf`, 62 commits ahead of `main` (`9f85f9d`),
whose merge-base is `main` itself. It reached production under TPI-STUDIOFLOW-126F
and TPI-STUDIOFLOW-127 and was then dropped from production by the TPI-STUDIOFLOW-130
release baseline, which pinned the release to a **parallel lineage that never
contained it**. Every release from TPI-130 through TPI-135R shipped without Notes.

No file was deleted, no branch was reset, no browser switch was involved, and no
owner Notes data in production was destroyed — because production never had the
Notes schema at all.

## 1. Repository state at investigation time

Both repositories were inspected read-only. Nothing was staged, committed,
stashed, checked out, reset, cleaned, built or restaged during this directive.

### Website repository

| Item | Value |
| --- | --- |
| Location | `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website` |
| Branch | `codex/tpi-development` |
| HEAD | `bc6a605f55a2f4396a51ea9710e0ea6291da73c0` |
| HEAD date | 2026-11-01 20:27:20 -0500 |
| HEAD subject | `docs(studioflow): record the TPI-135R production release` |
| Remote tracking | `origin/codex/tpi-development`, no ahead/behind divergence |
| Uncommitted modifications | none (clean tree) |
| Untracked files | none |
| Stashes | none |
| Worktrees | 12, including four historical `prunable` entries under `/private/tmp` |
| Current production Worker | `3082475b-80ad-4557-82d6-32618e3f7079` (TPI-135R) |

### StudioFlow source repository

| Item | Value |
| --- | --- |
| Location | `/Users/toddknipple/Documents/StudioFlow/web` |
| Branch | `main` |
| HEAD | `9f85f9d324e79373d7548b401658ec1be1d89c3c` |
| HEAD date | 2026-10-26 14:02:00 -0400 |
| HEAD subject | `fix(studioflow): keep background Studio activations from hijacking the view` |
| Remote | **none configured** — this repository has no GitHub remote |
| Uncommitted modifications | **`src/App.tsx` (+510/-…), `src/styles.css` (+51)** |
| Stashes | none |
| Worktrees | 12, including the Notes worktree below |
| Notes lineage worktree | `/Users/toddknipple/Documents/StudioFlow/web-122` @ `a6784cf` |

**Protected owner work.** The two modified files in `/Users/toddknipple/Documents/StudioFlow/web`
are the protected uncommitted owner work named in this directive. They were read
only through `git diff --stat` and `git show` of committed trees. They were not
overwritten, staged, reset, rebased, cleaned, built over or merged.

### Relevant local-only branches

StudioFlow repository: `codex/studioflow-122-notes` (`a6784cf`),
`codex/tpi-134` (`f44f3a0`), `codex/tpi-133` (`e608ca9`), `codex/tpi-131-release`
(`fb95c43`), `codex/tpi-131` (`9f85f9d`), plus the historical `091`, `109`, `111`,
`120`, `100`, `103` branches.

## 2. A. Original directive register (chronological)

The Notes system was developed across **23 recovered directive records**, all
dated 2026-10-31. `TPI-STUDIOFLOW-122C` does **not** exist in the archive; the
identifier was either never used or the record is missing. No record was
invented to fill the gap.

| Directive | Status recorded | Objective | Associated source commit |
| --- | --- | --- | --- |
| `TPI-STUDIOFLOW-122` | PARTIAL / development candidate verified | Create the independent Notes workspace: three columns, owner-scoped persistence, rich editor, private sidebar, autosave, revisions, attachments | `96e28a3` |
| `122A` | PARTIAL / refinement verified | Connected workspace, collapsible Organization, resizable library, Focus Mode, professional icon toolbar | `fd4d275` |
| `122B` | COMPLETE / local / not deployed | Automatic note titles | `00d9960`, `fa262f7`, `8a68c67` |
| `122D` | COMPLETE / local / not deployed | User-created nested folders | `cb14498` |
| `122E` | (status line absent) | Home navigation and deletion-dialog usability | `046ae3a` |
| `122E1` | (status line absent) | Home Create layout, narrow-viewport Home rows | `1e08da2`, `c2a6f6e`, `0492fc4`, `3186141`, `b16bc2b`, `e58573e`, `be4d141` |
| `122F` | PARTIAL / local / not deployed | Notes completion: organization and research references | `1279896`, `ef2377f`, `b9a7772` |
| `122F1` | COMPLETE / local / not deployed | Notes organization rail sizing/collapse | `b9a7772` |
| `122F2` | (status line absent) | Attachment control cleanup | `009211f` |
| `122F2` addendum | (status line absent) | Editor focus restoration | `4caa882` |
| `122F2A` | (status line absent) | Editor document style | `95fc46b` |
| `122F2B` | (status line absent) | Image removal control | `a9f0207` |
| `122F2C` | (status line absent) | Focus styling | `eb6d09d` |
| `122F2D` | COMPLETE / local / not deployed | Editor padding | `6af7b10` |
| `122F3` | COMPLETE / local / not deployed | Organize panel sizing and wrapping | `7f3a3e3`, `0e1c36a`, `dd14d86`, `4eece2e` |
| `122F4` | PARTIAL / development only | Notes Trash with recoverable deletion | `ddc8eed` |
| `122F4A` | PARTIAL / local / not deployed | Trash restore and permanent deletion completion | `406ed88`, `d872334`, `14bebfe`, `f49a3f7`, `978f537`, `3d135bf`, `320daad`, `a3c9f47` |
| `122F4B` | PARTIAL | Final verification | `9703b08` |
| `122F4C` | COMPLETE | Firefox restore-notification visibility | `9703b08` |
| `122F5` | COMPLETE | Notes Trash closure | `a6784cf` lineage |
| `122H` | COMPLETE / local / not deployed | Podcast project export | `2621167`, `56f8ad7` |
| `122H1` | (status line absent) | Local podcast project folder sync | `8041e2f` |
| `122H2` | PARTIAL | Local folder verification; native filesystem path not proven | `ded5a3d` |

Owner corrections recorded inside those directives include the connected-panel
layout, the collapsible organization rail, the automatic title behaviour, nested
folders, trash restore notices, toolbar iconography, and editor focus behaviour.
The latest owner-approved version is the branch tip `a6784cf`, which retains all
of the above.

**Production authorization history.** `TPI-STUDIOFLOW-122` and every lettered
revision explicitly record `Production deployment: NOT AUTHORIZED AND NOT
PERFORMED`. Notes nevertheless reached production indirectly, through the
TPI-125/126/127 release baselines that pinned the same source lineage — see §5.

## 3. B. Notes feature inventory

Features below are **verified** from source on `codex/studioflow-122-notes` plus
the directive records. Items marked inferred are not claimed as approved
behaviour.

### Workspace and organization (verified)

- Router destination `notes` — `type Route` includes `"notes"` (`src/App.tsx:106`).
- Home page entry: a `CreateCard` `Notes` with icon `FileText` and subtitle
  "Write, research, and organize notes", placed **before** the Teleprompter card
  (`src/App.tsx:4041`).
- Dashboard/side navigation entry `Notes` with icon `FileText`, placed
  **between Destinations and Teleprompter** (`src/App.tsx:3405`).
- Three-column workspace: Organization, Note Library, Editor.
- Views: All Notes, Recent, Favorites, Archived, Trash.
- Collection types: `folder`, `podcast`, `episode`, `research`, with nesting via
  `parent_id`.
- Note lifecycle: create, rename, duplicate, favorite, pin, archive, trash,
  restore, permanent delete.
- Collection lifecycle: create, rename, safe delete (deleting a collection never
  deletes notes), note assignment.
- Search across title, body text and collection name; sort by modified, created
  and title.
- Right-rail `Notes` tab renders `NotesSidebar`, a private Studio-scoped list with
  an `Open Notes` action that opens the full workspace.

### Editor (verified)

- Contenteditable rich editor using browser primitives; no third-party editor
  dependency was added.
- Bold, italic, underline, strike, headings, bullet/numbered/checklists,
  alignment, quote, divider, highlight, text colour, links, tables, clear
  formatting, undo/redo, find.
- Sanitised paste; inline images and file drop with captions; image removal.
- Browser spellcheck exposed.

### Persistence and recovery (verified)

- Idle autosave with expected-version checks; stale writes rejected.
- Save states: Saving / All changes saved / Unable to save.
- Local draft recovery key `studioflow.notes.draft.v1`.
- Revision history with preview and restore; restore creates a new revision;
  retention bounded to the most recent 100 revisions per note.
- Layout preferences persisted at `studioflow.notes.layout.v1`.

### Attachments (verified backend, partial UI)

- Private attachment metadata and objects under the existing private `TPI_MEDIA`
  R2 binding, served through authenticated `/api/notes/attachments/:id` routes.
- Validated limits: images 32 MB, documents 50 MB, audio 50 MB, text 10 MB.
- Never published as unrestricted public URLs; embedded non-attachment
  `href`/`src` values are stripped on save.

### Podcast project export and folder sync (verified, with a browser caveat)

- Project ZIP export from podcast-associated collections, notes, episode metadata
  and private attachments (`src/projectExport.ts`, 262 lines).
- Local OS folder synchronisation (`src/projectFolderSync.ts`, 207 lines) using
  the **File System Access API** (`window.showDirectoryPicker`). This API is
  **not implemented in Firefox**; the feature fails closed with an explicit
  message: "Direct local folder access is unavailable in this browser. Use
  Download Project to create a ZIP copy instead."

### Not verified / inferred

- Offline and network-interruption recovery: **not tested** per the D122 record.
- Structured research-reference block UX: recorded as **deferred**.
- Full theme matrix and Chrome/Safari/tablet/mobile matrices: **not executed**.

### The old far-right Notes (separate feature, verified)

The right rail tab `Notes` (icon `ClipboardList`, positioned above Teleprompter
in the rail) is a single plain textarea bound to one `studioNotes` string, with a
word count and a `Clear` button. It persists to browser `localStorage` key
`studioflow.studioNotes` only, as a single global value — **not per Studio and
not account-backed**. It is a lightweight scratchpad, not a workspace.

On `codex/studioflow-122-notes` that rail panel is replaced by `NotesSidebar`,
which bridges into the full workspace. That replacement is a behaviour change
that the owner has not been asked to approve; this directive does not act on it.

## 4. C. Source recovery map

### Files introduced or substantially changed (`main` → `codex/studioflow-122-notes`)

| Path | Change | Role |
| --- | --- | --- |
| `src/NotesView.tsx` | **new, 754 lines** | `NotesSidebar` + `NotesView` workspace, editor, organization, trash, revisions |
| `src/App.tsx` | +1399 / -433 | `notes` route, Home card, side-nav entry, rail bridge, route/notes-intent persistence, hydration guard |
| `src/styles.css` | +858 / -… | Notes workspace, editor and rail styling |
| `src/projectExport.ts` | **new, 262 lines** | Podcast project ZIP export |
| `src/projectFolderSync.ts` | **new, 207 lines** | Local folder sync (File System Access API) |
| `src/localRecordingDeletion.ts` | new, 86 lines | Recording-deletion work (not Notes) |
| `src/useMediaDevices.ts`, `src/voiceFx.ts` | modified | Recording-audio work (not Notes) |
| `scripts/check-recording-audio.mjs`, `check-screen-sharing.mjs`, `check-teleprompter.mjs`, `check-local-recording-deletion.mjs` | new | Source-level checks (not Notes) |
| `package.json` | +3 scripts | The three check scripts above |

`NotesView.tsx` imports only `react`, `lucide-react` (already a dependency on
`main` — no new package was added) and its two sibling modules
`./projectExport` and `./projectFolderSync`.

### Commits

Branch head: `a6784cfe490f57d413dce99135f148936f854c9f` — `fix StudioFlow
production card border colors`, 2026-10-31 23:21:13 -0400.

First Notes commit: `7a5c36a` — `feat: add private StudioFlow Notes workspace`,
2026-10-31 10:43:29 -0400.

`29` commits touch `src/NotesView.tsx`, `src/projectExport.ts` or
`src/projectFolderSync.ts`. The remaining commits on the branch carry the
Teleprompter, recording-audio, screen-sharing and deletion work that shares the
same lineage — they are **not** part of Notes and must not be swept in.

### Website-repository integration artefacts that still exist

- `migrations/0055_studioflow_notes.sql`, `0056_studioflow_note_automatic_titles.sql`,
  `0057_studioflow_note_trash_metadata.sql`
- `functions/api/[[path]].js` — the complete Notes REST backend is **still
  present on the release branch**, including trash metadata and title mode
- Ten verification scripts: `scripts/verify/tpi-studioflow-122-notes.mjs`,
  `-122e-home-navigation.mjs`, `-122e1-home-create-layout.mjs`,
  `-122f-notes-completion.mjs`, `-122f4-notes-trash.mjs`,
  `-122f4a-restore-notice.mjs`, `-122f4c-firefox-notice.mjs`,
  `-122h-project-export.mjs`, `-122h1-project-folder.mjs`
- Two registered npm scripts: `test:studioflow:122h-export`,
  `test:studioflow:122h1-project-folder`
- Build artefacts retained in `studio/assets/`: `index-C48-jDnZ.js`,
  `index-6-25XtSS.js`, `index-D6SZajag.css`, `index-DCzHEnai.css`,
  `index-CSTJXjG2.js`, `index-CphVaGhF.css`, and the rest of the historical set

Nothing Notes-related was removed from the website repository.

## 5. D. Branch divergence timeline

### Nothing was deleted — the branch was never merged

`git merge-base main codex/studioflow-122-notes` = `9f85f9d`, which **is** `main`'s
HEAD. The Notes branch is a pure fast-forward candidate: `0` behind, `62` ahead.
`main` contains no Notes commit (`7a5c36a`, `9b27de1`, `a6784cf` all report
`NOT in main`).

### The release lineage is a parallel branch from the same base

The lineage that actually produced every build from TPI-130 onward is:

```
9f85f9d (main)
  → 859febc  feat(studioflow): activate safe permanent deletion flow
  → fb95c43  fix(studioflow): preserve zero-studio deletion state
  → 044ea8e  fix(studioflow): anchor the Studio actions menu to its card
  → e608ca9  fix(studioflow): keep a single Studio actions menu open
  → 820d680  fix(studioflow): restore teleprompter scene items and production item colors
  → f44f3a0  feat(studioflow): cue Scene teleprompter scripts into the live reader
```

None of these six commits contains `a6784cf`. `merge-base 859febc a6784cf` is
`9f85f9d`. The two lineages are siblings from `main`: one carries
**Notes + podcast export + folder sync + private Teleprompter reader + its own
deletion implementation**, the other carries **a different deletion implementation
plus the 131/133/134/135 production corrections**.

### The release baseline is the actual mechanism of loss

`scripts/studioflow-release-baseline.json` records the single `source.approvedCommit`
that the staging and release workflow builds, and the expected asset hashes. Its
history is the loss event:

| Website commit | Date | Remembered directive | Pinned source | Notes present |
| --- | --- | --- | --- | --- |
| `d8abc8a` | 2026-10-31 11:22 | D122 | Notes lineage | yes |
| `3207013` | 2026-10-31 11:30 | D122A | `fd4d275` | yes |
| `970d943` | 2026-10-31 11:49 | D122B | Notes lineage | yes |
| `b7150f7` | 2026-10-31 12:05 | D122D | Notes lineage | yes |
| … | 2026-10-31 | D122E → D122H.1 | Notes lineage | yes |
| `dfe2acd` | 2026-10-31 21:00 | D122F.4A | `9703b08` | yes |
| `30115f5` / `c34d891` | 2026-10-31 22:00 / 22:55 | D125 | `52a3c0e` / `e2363fb` | yes |
| `9e47096` | 2026-10-31 23:25 | D126A | `a6784cf` | **yes — last Notes baseline** |
| `5ede01a` | 2026-11-01 01:54 | **D130R** | **`859febc`** | **no — removal point** |
| `7581899` | 2026-11-01 10:53 | D131 | `fb95c43` | no |
| `f182bc5` | 2026-11-01 14:07 | D133 | `e608ca9` | no |
| `6dc1525` | 2026-11-01 15:41 | D134 | `820d680` | no |
| `921c9a5` | 2026-11-01 17:03 | D134 | `f44f3a0` | no |

The pin moved from the Notes tip `a6784cf` to the sibling deletion lineage
`859febc` when the TPI-130 artefact baseline was approved. That is the exact
moment Notes left the shipping bundle. It was not a reset, a force-push, a
`git clean`, or a rebuild gone wrong — it was an approved baseline pointing at
the other branch.

### Production release timeline (dated)

| Release | Deployed source | Worker | Notes in build |
| --- | --- | --- | --- |
| `126F` | `a6784cf` | `1a6a2ab5-db20-4e43-9d10-18a0a1edc784` @ `2026-11-01T04:54:30.803Z` | **yes** |
| `127` | `ded5a3d` | `4108a0d7-5833-435f-8a0b-f6be8c1c8b27` | **yes** |
| `130` | `859febc` | `99ca2347-3181-4525-b9eb-d28cb61cf42a` (previous `1a6a2ab5`) | no |
| `131` | `fb95c43` | — | no |
| `132R` | `d9af902` | `cd37afb8-cc82-406a-9e15-e84b3dffa234` | no |
| `133` | `e608ca9` | — | no |
| `134R` | `f44f3a0` | `4de115db-6537-41b5-9bf7-ae99cb0e20fc` @ `2026-11-01T22:37:19Z` | no |
| `135R` | `f44f3a0` | `3082475b-80ad-4557-82d6-32618e3f7079` @ `2026-11-02T01:14:50Z` | no — current live |

TPI-130 is the release that removed Notes from production. Its record lists
`1a6a2ab5` — the TPI-126F Worker — as the immediate rollback/previous target,
which places TPI-130 directly after TPI-126F in the production Worker chain.

**Unresolved detail (stated for honesty).** TPI-127 records deploying
`4108a0d7`, but TPI-130's `previous Worker` is `1a6a2ab5` (126F), not `4108a0d7`.
The exact interleaving of the 126F and 127 Worker versions cannot be reconciled
from the records alone; there may have been an undocumented rollback between
them. This does not affect the conclusion: both shipped Notes, and TPI-130 ended it.

### Chrome / Firefox transition

The owner's recollection was investigated directly and the evidence does **not**
support the browser change as a cause.

- Firefox Developer Edition is the documented authoritative acceptance browser in
  every Notes directive (`122` through `122H2`) and in TPI-120 through TPI-135.
  D122's matrix records `Chrome/Safari compatibility | NOT TESTED | Firefox
  Developer Edition was the executed browser`.
- Chrome appears only as a **compatibility target**: TPI-120/121 screen-sharing
  capability checks, and the `Chrome/Safari/device matrix` rows that every Notes
  directive lists as not executed.
- The only genuine Chrome dependency in the Notes feature set is
  `src/projectFolderSync.ts`, which needs `window.showDirectoryPicker` — the File
  System Access API that Firefox does not implement. That feature fails closed in
  Firefox with a documented fallback, and is unrelated to Notes availability.
- The prior TPI-134 handoff already recorded the same conclusion: *"Those were
  reported missing and were genuinely absent from the bundle … Chrome was not
  involved."*
- No repository record documents a period in which Chrome became the
  authoritative testing browser, and no checkout, merge, reset or branch change
  correlates with a browser change.

**Conclusion: temporal coincidence.** The disappearance coincides with the
TPI-130 baseline re-pin on 2026-11-01 01:54, not with any browser transition.
Browser selection cannot remove source code, and no evidence of source removal
exists — the source is intact and 62 commits ahead on its own branch.

## 6. E. Interface comparison

| Surface | Historical development (`a6784cf`) | Current source (`main` + protected work) | Release branch (`f44f3a0`) | Live production (135R) |
| --- | --- | --- | --- | --- |
| Home page Notes card | **present** — 4th of 5 Create cards, between On-Air webinar and Teleprompter | absent | **absent** | **absent** |
| Main nav Notes entry | **present** — between Destinations and Teleprompter | absent | **absent** | **absent** |
| `notes` route | **present** in `type Route` | absent | **absent** | **absent** |
| Complete Notes workspace (`NotesView.tsx`) | **present**, 754 lines | file absent | **file absent** | **absent** |
| Right-rail Notes tab | present, bridges to workspace via `NotesSidebar` | present, single textarea | present, single textarea | present, single textarea |
| Notes editing (rich) | **present** | absent | absent | absent |
| Notes persistence (account-backed) | **present** (`/api/notes`, D1) | backend present, no UI | backend present, no UI | **no UI** |

Live production verification:

- `https://paranormalinitiative.com/studio/` is auth-gated; anonymous visitors
  receive the "Creator Studio — Coming Soon" page, and `/studio/assets/*` returns
  `403` for unauthenticated requests (including a deliberately nonexistent path),
  so live bundle bytes could not be read anonymously under this directive.
- Identity was therefore established by **hash equality**, which is stronger than
  a text grep. The live JavaScript recorded in TPI-135R is
  `index-D9yljEwa.js`, SHA-256 `e317fc07…`. The repository copy
  `studio/assets/index-D9yljEwa.js` hashes to exactly
  `e317fc071f4968e375f8b11970d862692a3fe28fa1cc55140d3471d884f55246` — and that
  file is the recorded build of `f44f3a0`. The live bundle is provably the
  `f44f3a0` build.
- Marker counts in that build: `notesWorkspaceIntent` **0**, `NotesView` **0**,
  `studioflow.notes.layout` **0**, `studio_note_collections` **0**;
  `studioflow.studioNotes` **1**, `"Write private show notes"` **1**. Only the old
  right-rail scratchpad survives.
- The TPI-126F production artefact `studio/assets/index-CSTJXjG2.js` hashes to
  exactly `94d5ba56…`, matching its release record, and contains
  `notesWorkspaceIntent` **×2** and `studioflow.notes.layout` **×1**. The complete
  Notes workspace was therefore genuinely present in a shipped production bundle.

## 7. F. Persistence assessment

### How the original Notes data was stored

- **Account-backed D1**, owner-scoped by `owner_id` with `ON DELETE CASCADE`:
  `studio_note_collections` (with `parent_id` for nesting and `collection_type`),
  `studio_notes` (`title`, `body_html`, `body_text`, `status`
  active/archived/trash, `is_favorite`, `is_pinned`, `version`, plus `title_mode`,
  `deleted_at` and `trash_collection_id` from later migrations),
  `studio_note_revisions` (bounded to 100 per note), `studio_note_attachments`
  (private objects in `TPI_MEDIA`).
- Migrations: `0055` (base schema), `0056` (`title_mode`), `0057` (`deleted_at`,
  `trash_collection_id`).
- REST surface under `/api/notes` — list/create/update/delete/duplicate/archive/
  trash/restore/permanent-delete, collections, revisions, attachments — all behind
  `requireStudioAccess`.
- **Browser-local** preferences only: `studioflow.notes.layout.v1` (layout),
  `studioflow.notes.draft.v1` (draft recovery), and the old
  `studioflow.studioNotes` scratchpad.
- Notes are **independent of Studio workspaces**: there is no Studio foreign key.
  A note is bound to its owner and, optionally, a collection. "Studio Notes" is
  the private rail view of the same owner-scoped set.

### Production D1 risk assessment

Production D1 was **never migrated** for Notes. The workflow record states for both
Notes-bearing releases: *"Production had no D1/R2 migration or destructive data
operation."* Consequence: the API returns `notes_schema_unsupported` against a
production database without `studio_notes`, so the deployed Notes UI could not
persist anything in production.

Therefore:

- **No owner Notes data exists in production, and none was destroyed.** There is
  nothing to migrate and nothing at risk on the production side.
- **No production D1 notes rows can be recovered** — they were never created.
- The Notes tables, backend and one genuine owner note **do** exist in the local
  environment.

### Local data verified (read-only copy, never opened for write)

`.local-dev/state/v3` D1 contains the Notes schema and:

| Measure | Value |
| --- | --- |
| `studio_note_collections` | 3 (`Crossroads of the Unknown` / podcast, `Eps 1` / episode, `Testing project` / podcast) |
| `studio_notes` | 204 (20 active, 184 trash) |
| `studio_note_revisions` | 429 |
| `studio_note_attachments` | 0 |
| Created range | 2026-10-31T14:50:13Z → 2026-11-01T03:17:12Z |
| Owners | `local-ops009-admin` (1), `local-ops028-test-admin` (203) |

The overwhelming majority are automated-acceptance fixtures
(`D122 disposable note …`, `D122D folder note …`, 184 already in Trash). Exactly
**one** genuine owner-authored note exists — `Crosroads of the Unknown`
(204 characters, owner `local-ops009-admin`) — alongside the podcast/episode
collections that acceptance runs created.

**Data conclusion:** the *application data set* is essentially disposable test
residue, not a lost owner corpus. Preservation still matters, but restoration is
not blocked by any data recovery problem.

### Compatibility requirement for restoration

Because the Notes API still exists on the release branch while the UI does not,
restoring the UI alone would expose an API whose tables are absent in production.
A restoration directive must apply migrations `0055`–`0057` to production D1
(additive, `CREATE TABLE IF NOT EXISTS` / `ADD COLUMN`) **before** enabling the
workspace, and must prove genuine account-backed save-and-reload — the exact
standard TPI-135 established for Scene persistence, where a browser-local check
could never observe a server-side discard.

## 8. G. Restoration recommendation

**Recommended approach: Option C — Compatibility Adaptation**, performed as a
controlled port in an isolated worktree. Option A alone is insufficient; Option B
as written is unsafe; Option D is unnecessary because the evidence is complete.

### Why not simply switch the build back (the "obvious" fix)

The complete Notes build already exists and is hash-verified against a real
production release (`index-CSTJXjG2.js` / `index-CphVaGhF.css`, source `a6784cf`).
Re-pointing `studio/index.html` and the baseline at it would take minutes — and
would **regress five shipped releases**: TPI-131 zero-studio deletion,
TPI-132R deletion repair, TPI-133 floating Studio actions menu, TPI-134 scene drag
and production-item colours, and TPI-135 scene-item persistence. `a6784cf` has
none of them. This is the single most important restoration risk and it is
explicitly rejected.

### Why not Option B (port the whole branch)

A lineage merge conflicts in 22 places inside the hardened deletion subsystem
(recorded in the TPI-134 handoff) and would drag in unrelated unreviewed work:
recording-audio repair, screen sharing, private Teleprompter reader, and the
branch's own competing deletion implementation. Notes does not need any of it.

### Recommended plan

Port **only** the Notes feature surface onto the current approved release commit
`f44f3a0` in a fresh isolated worktree, so the protected `main` working tree and
its uncommitted `App.tsx` / `styles.css` are never touched.

| Step | Action | Risk |
| --- | --- | --- |
| 1 | Create isolated worktree at `f44f3a0` (e.g. `web-136`) | none |
| 2 | Bring `src/NotesView.tsx`, `src/projectExport.ts`, `src/projectFolderSync.ts` across **unchanged** — all three are new files, so there is no collision | low |
| 3 | Bring the `styles.css` Notes block across as an additive append, verified to not disturb 131/133/134/135 rules | low |
| 4 | Re-apply the `App.tsx` Notes integration **by hand** against `f44f3a0`: `notes` in `type Route`, the `FileText` Home `CreateCard` before Teleprompter, the `FileText` side-nav entry between Destinations and Teleprompter, `route === "notes"` rendering, the `notesWorkspaceIntent` session intent, the route-persistence and hydration guards, and the right-rail `NotesSidebar` bridge | **highest** — this is the file carrying protected owner work and 1399 changed lines |
| 5 | Decide explicitly whether the rail `Notes` textarea is replaced by `NotesSidebar` or retained beside it — an owner-visible behaviour change requiring approval | medium |
| 6 | Keep `functions/api/[[path]].js` unchanged (backend already present) and verify against it | low |
| 7 | Apply `0055`–`0057` to production D1 only under separate authorization, before enabling the UI | medium — additive only |
| 8 | Rebuild, restage, verify provenance and hash | low |

### Required dependencies

- `lucide-react` — already a dependency; no new package is required.
- `functions/api/[[path]].js` Notes routes — already on the release branch.
- Migrations `0055`, `0056`, `0057` — present, not yet in production.
- Account-backed D1 for real save/reload verification.
- Firefox Developer Edition for authoritative acceptance.
- Optional and Chromium-only: local folder sync (`showDirectoryPicker`). It must
  keep its documented Firefox fallback and must not be presented as working in
  Firefox.

### Data compatibility

Additive migrations against an existing database; `CREATE TABLE IF NOT EXISTS`
and nullable `ADD COLUMN` with defaults mean no existing row is rewritten. Notes
are owner-scoped and Studio-independent, so no Studio or Scene data shape changes.
The single genuine local note and the local collections are preserved untouched.

### Regression testing requirements

- Existing Notes suites already in the repository:
  `tpi-studioflow-122-notes.mjs`, `-122e`, `-122e1`, `-122f`, `-122f4`,
  `-122f4a`, `-122f4c`, `-122h`, `-122h1` — they reference the `web-122`
  worktree, so the paths must be re-pointed at the restoration worktree.
- `verify:studioflow-134-firefox`, TPI-133, TPI-037 scenes panel, Studio
  ownership, Studio deletion and deletion safety, release safety and TPI-107
  provenance must all still pass — these guard the five corrections at risk.
- A new account-backed Notes save-and-reload gate (TPI-135 standard) before any
  release, plus an explicit check that the rail Notes behaviour is the approved one.
- Browser acceptance in Firefox Developer Edition with a disposable profile.

### Estimated risk

**HIGH.** `App.tsx` is the single highest-collision file in the project: it holds
1399 lines of Notes-era change in one lineage, 510 lines of protected uncommitted
owner work in the other, and every UI correction from 131 through 135. The
feature itself is mechanically recoverable; the merge surface is the risk.

### Proposed acceptance criteria

1. Home page shows a `Notes` card between On-Air webinar and Teleprompter.
2. Main navigation shows `Notes` between Destinations and Teleprompter.
3. Both open the three-column workspace, not the rail scratchpad.
4. Create / edit / rename / organize / search / favorite / archive / trash /
   restore / permanent delete all function.
5. A note created in Firefox survives a full page reload **and** a different
   browser session on the same account (genuine account-backed proof).
6. Revision history restores without losing newer content.
7. The 131/133/134/135 behaviours are unchanged: zero-studio deletion, floating
   Studio actions menu, production-item colours, Scene drag, Scene teleprompter
   cueing, and account-backed Scene item persistence.
8. Studio deletion and its safety guards remain intact.
9. No existing Studio, recording, script, Scene or owner note is altered.
10. Live acceptance in Firefox Developer Edition after the guarded release.

## 9. H. Feature-loss prevention recommendation

The root cause is precise and therefore cheaply preventable: **the release
baseline's `approvedCommit` moved between sibling lineages with no ancestry
assertion and no feature-presence check.** Recommended, in descending value:

1. **Baseline ancestry assertion (highest value, lowest cost).** In
   `release:preflight`, assert that the new `source.approvedCommit` descends from
   the previously approved commit. A sibling-lineage jump then fails loudly and
   requires an explicit, recorded override naming the features being dropped.
   This single check would have blocked the TPI-130 event.
2. **Feature-presence regression test in `release:preflight`.** Assert that
   approved feature markers exist in the built bundle (e.g.
   `notesWorkspaceIntent`, `studioflow.notes.layout`), so a build that silently
   drops a surface fails the gate rather than shipping. The marker technique used
   in §6 is directly reusable and already distinguishes the two builds cleanly.
3. **Approved-feature inventory.** A maintained file mapping each owner-approved
   surface to its source commit and a marker string, diffed at every baseline
   change.
4. **Release candidate comparison.** Record for each release which markers were
   present in the previous baseline and which are now absent, with a reason.
5. **Implemented-but-unreleased register.** Notes, podcast export, folder sync,
   the private Teleprompter reader and recording-audio work were all
   implemented-but-unreleased across many directives. A single register would have
   made the gap visible long before the owner noticed.
6. **Explicit owner approval before dropping an accepted feature.** The TPI-134
   record already flagged the loss as "still awaiting its own directive"; the
   process should treat an accepted-feature disappearance as release-blocking by
   default rather than as a known limitation.
7. **Documentation of source lineage per release.** Every release record should
   name the lineage branch, not only the commit hash, so a lineage switch is
   visible to a human reader.

Not implemented under this directive, per its scope restrictions.

## 10. Final investigation report

**1. Was the original complete Notes implementation located?**
Yes. `codex/studioflow-122-notes` at `a6784cf`, worktree
`/Users/toddknipple/Documents/StudioFlow/web-122`. Intact, unmodified, 62 commits
ahead of `main`, merge-base `9f85f9d`.

**2. Which directives created and refined it?**
23 records, all dated 2026-10-31: `122`, `122A`, `122B`, `122D`, `122E`, `122E1`,
`122F`, `122F1`, `122F2` (+ addendum), `122F2A`–`122F2D`, `122F3`, `122F4`,
`122F4A`–`122F4C`, `122F5`, `122H`, `122H1`, `122H2`. `122C` does not exist in
the archive and no record was invented for it.

**3. What did the approved version contain?**
See §3: three-column workspace with nested collections and five views, full note
and folder lifecycle, rich contenteditable editor, autosave with stale-write
protection, draft recovery, 100-deep revision history, private attachments,
podcast ZIP export, Chromium-only local folder sync, a Home page card, a main
navigation entry before Teleprompter, and a rail bridge.

**4. Where are its source files and commits?**
`src/NotesView.tsx` (new, 754 lines), `src/projectExport.ts` (new, 262),
`src/projectFolderSync.ts` (new, 207), plus `src/App.tsx` (+1399) and
`src/styles.css` (+858). First commit `7a5c36a` (2026-10-31 10:43:29 -0400), tip
`a6784cf` (2026-10-31 23:21:13 -0400); 29 commits touch the Notes files. Backend
and migrations already exist on the release branch.

**5. Was it ever deployed to production?**
**Yes.** TPI-126F deployed `a6784cf` as Worker `1a6a2ab5…` at
`2026-11-01T04:54:30.803Z`, artefact `index-CSTJXjG2.js` (SHA-256 `94d5ba56…`,
hash-verified against its release record, and containing `notesWorkspaceIntent`).
TPI-127 deployed `ded5a3d` as Worker `4108a0d7…`. The Notes UI was live but could
not persist, because production D1 was never migrated.

**6. Why is it missing from the current StudioFlow interface?**
Its branch was never merged into `main`, and the release baseline's
`source.approvedCommit` was switched from the Notes tip `a6784cf` to the sibling
lineage `859febc` when the TPI-130 artefact baseline was approved on 2026-11-01
01:54. Every release since — 130, 131, 132R, 133, 134R, 135R — built from the
sibling lineage, which has never contained Notes. Nothing was deleted.

**7. Did the Chrome/Firefox transition contribute?**
No. Firefox Developer Edition was the authoritative acceptance browser throughout
every Notes directive. Chrome appears only as a compatibility target for screen
sharing and as the sole browser supporting the Notes local-folder sync (File
System Access API). No checkout, merge, reset or deployment correlates with a
browser change; the TPI-134 handoff independently recorded "Chrome was not
involved". The coincidence is temporal.

**8. Does the original Notes data still exist?**
Production: no Notes data ever existed (schema never migrated), so nothing was
lost there. Local: the schema exists with 204 notes, 3 collections, 429 revisions
and 0 attachments, but 203 notes belong to an automated test account and 184 are
already in Trash; exactly one genuine owner-authored note exists
(`Crosroads of the Unknown`, 204 characters). The data set is disposable test
residue, and it is intact.

**9. Can the complete workspace be restored without rebuilding it?**
The *components* can be restored verbatim — all three Notes modules are new files
with zero collision against the release lineage. The *integration* cannot: the
`App.tsx` wiring must be re-applied against `f44f3a0` because the release lineage
carries five later corrections that the Notes branch lacks. Swapping the old
verified bundle back is technically possible but would regress TPI-131, 132R, 133,
134 and 135, so it is rejected.

**10. What is the safest restoration approach?**
Option C — Compatibility Adaptation via a controlled port into an isolated
worktree based on `f44f3a0`, keeping the three Notes modules unchanged, hand-
applying the `App.tsx` integration, deciding the rail-Notes behaviour with the
owner, and applying migrations 0055–0057 to production only under separate
authorization. Risk: **HIGH**, driven almost entirely by `App.tsx` collision with
protected owner work.

**11. What existing production features could be affected?**
Zero-studio deletion (131), deletion failure repair (132R), the floating Studio
actions menu (133), Scene drag-and-drop and production-item colours (134), and
Scene production-item persistence with its account-backed gate (135); plus Studio
ownership, Studio switching, recording state and the workspace bridge. The rail
Notes behaviour is the one intentional user-visible change to negotiate.

**12. What exact implementation directive should follow?**
`TPI-STUDIOFLOW-137 — Controlled Complete Notes Restoration onto the Release
Lineage`: isolated worktree at `f44f3a0`; add the three Notes modules unchanged;
additively append the Notes styles; hand-apply the `App.tsx` Notes integration
with an explicit rail-Notes decision; keep the existing `/api/notes` backend;
apply migrations 0055–0057 to production under separate authorization before
enabling; require an account-backed save/reload gate plus the TPI-131/133/134/135
regression suites; and complete the guarded release with Firefox Developer Edition
live acceptance.

## 11. Missing evidence and limitations

- `TPI-STUDIOFLOW-122C` has no record in the archive; its scope cannot be
  reconstructed.
- `122E`, `122E1`, `122F2`, `122F2` addendum, `122F2A`–`122F2C` and `122H1` do not
  carry machine-readable `Status:` lines; their status is inferred from body text
  only and is reported as recorded, not as approved.
- The TPI-126F/127/130 Worker chain is inconsistent (`130` names `1a6a2ab5` as
  previous while `127` records `4108a0d7`). An undocumented rollback may have
  occurred. The conclusion is unaffected.
- Live production bundle contents could not be read anonymously: `/studio/` is
  auth-gated and `/studio/assets/*` returns `403` without authentication, including
  for nonexistent paths. Identity was established by exact SHA-256 equality with
  the recorded live hash instead of by reading live bytes. No owner credentials
  were used.
- The Notes build was not launched in isolation and no historical browser
  acceptance was executed. This directive is investigative; the build and staging
  commands were deliberately not run, and the protected working tree was not built.
- No owner-authored Chrome-transition record exists in the repository; the
  browser question is answered from directive and handoff evidence.

## 12. Behaviour changes and protected state

- No application source was modified in either repository.
- `src/App.tsx` and `src/styles.css` in `/Users/toddknipple/Documents/StudioFlow/web`
  remain exactly as found, with their uncommitted owner work intact.
- No branch was merged, reset, rebased, checked out or cleaned.
- No build, staging, migration or deployment command was run.
- No production database, R2 object, Studio, Scene, recording, script or note was
  read for write or modified. Production inspection was read-only and anonymous.
- The local D1 was inspected through a **copy** and never opened for write.
- This record adds documentation only.
