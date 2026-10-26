# TPI-STUDIOFLOW-087 — Phase 1 Architecture Report

Directive: [TPI-STUDIOFLOW-087-INDEPENDENT-STUDIOS-DASHBOARDS-PRODUCTION-OWNERSHIP.md](100-DIRECTIVES/TPI-STUDIOFLOW-087-INDEPENDENT-STUDIOS-DASHBOARDS-PRODUCTION-OWNERSHIP.md)

Date: October 25, 2026 (investigation completed 22:16 EDT and after)
Status: `PHASE 1 COMPLETE — READ-ONLY — NO APPLICATION CHANGES IN THIS PHASE`
Scope: read-only architecture investigation. No application code, production
Studio data, or deployment was modified. Read-only D1 inspection used the
maintained guarded access path; row counts only, no writes.

Baseline verified before investigation (Directive §2):

- Website repository HEAD: `8d988e1` (documentation), application `af7fbc0`.
- Canonical StudioFlow source HEAD: `44f9478`.
- These match the directive's stated baseline. No subsequent development was
  found in either repository.

---

## A. Root cause of the homepage and My Studios inconsistency

The homepage and the My Studios selector resolve **different record types with
different filters**. They are not two views of one collection.

### What the homepage displays

`HomeView` (canonical source `src/App.tsx`) renders `Broadcast[]` read from
browser-local `studioflow.broadcasts`, filtered to
`upcomingBroadcasts = broadcasts.filter((b) => !b.endedAt)`. The "Past" tab
does not show ended broadcasts at all; it shows `libraryItems` (finished
recordings). An explicit code comment states: "Ended shows leave the Home page
so they cannot be reused."

Every row the owner sees on the homepage ("New Test", "Testing", "Test",
"Testing 123", "TPI", "Acceptance Test A") is therefore a **browser-local
Broadcast record** — a production or a Studio host record — with no `endedAt`.
The homepage has no concept of a Studio identity. It is a production list that
accidentally also contains Studio host records, which is precisely why
production titles and Studio names appear mixed together.

### What My Studios displays

The My Studios selector (maintained bridge `studio/workspace-bridge.js`) lists:

1. **Server-backed Studios** — `studio_workspaces` rows from
   `/api/studio/workspaces`, identified by workspace UUID (`studioNumber`,
   title, `localBroadcastId`), plus
2. **Browser-only Studios** — local broadcast records not bound to any server
   workspace (`localBroadcastCandidates()`), **regardless of `endedAt`**.

### Why Crossroads of the Unknown is missing from the homepage

Crossroads is a browser-only Studio (confirmed by read-only D1 inspection:
no `studio_workspaces` row for it exists under the owner account). Its host
broadcast record lives in `studioflow.broadcasts`. The homepage hides any
record with `endedAt` set; My Studios does not. Two concrete mechanisms
produce the owner-observed state, both consistent with the code:

1. **Ended-show exclusion** — if the Crossroads host record has `endedAt` set
   (for example after a completed production), the homepage filters it out
   while My Studios continues to list it as a browser-only Studio; or
2. **Host-record loss with snapshot survival** — the host broadcast record was
   removed from `studioflow.broadcasts` while the browser-local Studio snapshot
   (`studioflow.tpiLocalStudioSnapshots.v1`) survived; My Studios recovery and
   the local-snapshot path can still reach the Studio.

Definitive per-record confirmation requires a read-only diagnostic in the
owner's browser (localStorage is browser-local and not server-readable). A
read-only snippet is provided in section F; it destroys nothing.

**Conclusion (A):** Crossroads is not missing because it needs recreation, and
it was not damaged. The homepage simply does not list Studio identities — it
lists non-ended Broadcast records. The homepage and My Studios must be made to
resolve the same authorized Studio collection.

---

## B. Existing Studio and production data architecture

### Studio identity (permanent)

| Layer | Record | Identifier | Storage |
|---|---|---|---|
| Server Studio | `studio_workspaces` row | workspace UUID + `studio_number` + `local_broadcast_id` | Cloudflare D1 `tpi_contributor_portal`, scoped `owner_id` |
| Browser-only Studio | host Broadcast record + local snapshot | broadcast id (`studio-…`) | `studioflow.broadcasts` + `studioflow.tpiLocalStudioSnapshots.v1` in browser localStorage |

- Optimistic concurrency: `version` column, `expectedVersion` on PATCH.
- Lifecycle: `status` (`active` / `archived`), `deleted_at` (soft delete),
  "Recently Deleted" + restore already implemented (API and bridge).
- Workspace configuration snapshot (`state_json`) nests the host broadcast
  identity (`state.broadcast`) plus the full per-Studio configuration (scenes,
  scene panel items, media slots, branding, timers). This is the system that
  the emergency recovery fixed; it remains the authority and is not replaced.

Read-only D1 inspection of the owner account (`5d9e7ec6-…`) found exactly
three server Studios: **TPI Acceptance Test A** (Studio 1), **TPI Acceptance
Test B** (Studio 2), **Testing 123** (Studio 3, `a75afc38-c7a6-452d-9460-5d746712d411`,
clean four-item state, version 19). No "Crossroads of the Unknown" row exists —
Crossroads is browser-local, matching the earlier parity findings.

### Productions (livestreams, recordings, webinars)

| Record | Identifier | Ownership today | Storage |
|---|---|---|---|
| `Broadcast` (live / recording / webinar) | `broadcast-<ts>` or studio host id | **none** (no Studio field) | `studioflow.broadcasts` (browser) |
| `LibraryItem` (finished recording) | library id | indirect `broadcastId` only | `studioflow.libraryItems` (browser) |
| Recording checkpoint / session | session id | indirect `broadcastId` only | IndexedDB `studioflow-recordings` |
| `live_broadcasts` (server sync) | broadcast id | **`studio_workspace_id` FK already exists** | D1 |
| `studio_production_sessions` (production lock) | creator | **`studio_workspace_id` NOT NULL FK already exists** | D1 |
| `studio_media_assets` (uploaded media) | asset id | **`workspace_id` FK already exists** | D1 |

Key finding: **server-side Studio ownership columns already exist and are
enforced** (`live_broadcasts.studio_workspace_id`,
`studio_production_sessions.studio_workspace_id`, `studio_media_assets.workspace_id`,
`getProductionWorkspace()` resolution). The gap is entirely client-side: the
local `Broadcast` record has no `studioId`, so the homepage, dashboards, and
local production lists cannot attribute productions to Studios.

### Relationship diagram (current)

```
studio_workspaces (server, permanent identity)
  └─ local_broadcast_id ──► studioflow.broadcasts[] (browser-local records)
                              ├─ host record (doubles as "the Studio" locally)
                              └─ production records (no Studio field)  ◄── gap
studioflow.libraryItems[] ── broadcastId ──► broadcast (indirect ownership)
studio_production_sessions / live_broadcasts / studio_media_assets ── workspace FK (already correct)
```

---

## C. Proposed Studio organization and ownership model (smallest safe implementation)

The Riverside-inspired model maps onto the existing architecture without
replacing the Studio identity system:

1. **Studio** = the existing identity (server workspace UUID, or the browser-only
   host broadcast id). Unchanged. Every recovery, integrity, and switching
   protection is preserved.
2. **Production** = existing `Broadcast` records (live / recording / webinar)
   plus `LibraryItem` recordings, each carrying a new **`studioId`** field set
   at creation time from the owning Studio's stable identifier.
   - Created from a Studio dashboard or inside a Studio → `studioId` = current
     Studio.
   - Created from the global homepage → owner selects the owning Studio.
   - Switching Studios never rewrites existing `studioId` values.
3. **Homepage** = Create entry points (unchanged) + a **My Studios section** of
   permanent Studio cards, resolved from the same collection as the My Studios
   dropdown (server workspaces + browser-only Studios). The existing
   "Streams and recordings" table remains as the productions overview
   (preserving working behavior per Directive §2); Studio cards never appear
   in it and production titles never appear as Studio cards.
4. **Studio Dashboard** = a per-Studio view listing only that Studio's
   productions and recordings (client-side filter on `studioId`, reusing the
   existing production table components), with Enter Studio / Create
   Livestream / Start Recording / Create Webinar / Studio Settings actions.
5. **Management** = Rename (exists), Enter Studio (exists), Open Dashboard
   (new), Archive/Restore (**already supported end-to-end by the API**;
   `status='archived'` + `includeArchived` listing — surfaced in the UI),
   Delete (already exists as soft delete with Recently Deleted + restore).

### Ownership rules (Directive §6)

- `studioId` is stamped once at creation and never reassigned.
- Historical productions without `studioId` remain **unowned** and are listed
  under an explicit "Unassigned" heading. No historical reassignment is
  performed (that is a Directive approval-gated item).
- Browser-local Studios keep their existing recovery mechanisms; **no
  migration into D1 is performed or proposed in this phase**.
- Server rows (`live_broadcasts`, `studio_production_sessions`,
  `studio_media_assets`) already carry correct workspace ownership and need no
  migration.

### What is explicitly NOT built

- No Reusable Studios, no templates, no Projects/Business hierarchy.
- No replacement of the Studio identity or switching system.
- No database migration is required for the model above — existing columns
  cover server ownership; the client-side `studioId` rides in existing JSON
  (`studioflow.broadcasts` / workspace `state_json`).

---

## D. Crossroads homepage entry — explanation and planned correction

Explained in section A: Crossroads is intact but invisible to the homepage
because the homepage lists non-ended Broadcast records, not Studios. The
correction is the My Studios homepage section (section C.3), which resolves
Crossroads as a browser-only Studio through the same collection the dropdown
already uses. No Crossroads data is touched.

---

## E. Relevant database tables and APIs (no changes required)

- `studio_workspaces` — Studio identity, `status` (active/archived),
  `deleted_at` soft delete, `version` optimistic concurrency,
  `studio_number` display numbering.
- `/api/studio/workspaces` (+ `/delete`, `/restore`, `/duplicate`,
  `/snapshots`) — full lifecycle already present; list supports
  `includeArchived` and `includeDeleted`.
- `studio_production_sessions` + `/api/studio/production/active` — production
  lock already keyed to `studio_workspace_id`.
- `live_broadcasts.studio_workspace_id`, `studio_media_assets.workspace_id` —
  existing ownership FKs.
- Client: `studioflow.broadcasts`, `studioflow.libraryItems`,
  `studioflow.tpiLocalStudioSnapshots.v1`, `studioflow.tpiWorkspaceCache.v2`.

## F. Read-only owner diagnostic (browser console, destroys nothing)

To confirm which mechanism hides Crossroads in the owner's own profile, run in
the StudioFlow page console and share the output:

```js
(() => {
  const reads = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
  const broadcasts = reads("studioflow.broadcasts") || [];
  return {
    broadcasts: broadcasts.map((b) => ({ id: b.id, title: b.title, endedAt: b.endedAt || null, kind: b.kind })),
    localSnapshots: Object.keys(reads("studioflow.tpiLocalStudioSnapshots.v1") || {}),
    recovery: Object.keys(reads("studioflow.tpiLocalStudioSnapshots.recovery.v1") || {})
  };
})();
```

## G. Approval-gated items identified (not executed)

1. **Bulk historical production reassignment** — any backfill of `studioId` onto
   pre-existing productions requires owner approval; default is "Unassigned".
2. **Database migration for permanent deletion** — hard deletion of Studios
   (and any cascading effect on recordings/media) is reported separately and
   awaits owner approval; soft delete + restore is what will ship.
3. **Destructive browser-local/server reconciliation** — none proposed.
4. **Irreversible deletion** — none proposed.

## H. Implementation plan (Phases 2–5, non-destructive)

1. Phase 2 — homepage My Studios cards; per-Studio dashboard view; direct
   entry; Studio-vs-production creation separation; same collection as the
   dropdown.
2. Phase 3 — `studioId` stamped on new productions (homepage picker or
   current Studio), preserved across switches; historical records untouched.
3. Phase 4 — Rename / Archive / Restore surfaced from Studio cards (existing
   API), deletion investigated and reported (section G).
4. Phase 5 — extend the maintained lifecycle suite with Directive Tests 1–14,
   run maintained regressions unchanged, guarded release, authenticated
   production verification.

Protected throughout: Crossroads of the Unknown, Testing 123 (four clean
items), browser-local snapshots and recovery records, save-integrity and
unsaved-change protections, and the 29/29 lifecycle baseline (checks are only
added, never removed).
