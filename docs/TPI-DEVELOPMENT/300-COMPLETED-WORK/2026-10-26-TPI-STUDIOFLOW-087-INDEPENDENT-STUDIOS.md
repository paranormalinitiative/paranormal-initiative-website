# 2026-10-26 — TPI-STUDIOFLOW-087 Independent Studios, Studio Dashboards, and Production Ownership

Directive: TPI-STUDIOFLOW-087, archived verbatim at
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-STUDIOFLOW-087-INDEPENDENT-STUDIOS-DASHBOARDS-PRODUCTION-OWNERSHIP.md`
and registered in `DIRECTIVE-INDEX.md`.
Status: `IMPLEMENTED / LOCAL TESTED / DEPLOYED / LIVE VERIFIED / OWNER
ACCEPTANCE PENDING`.
Durable evidence: `evidence/2026-10-26-studioflow-087-production-suite.json`
(authenticated production suite, PASS 40/40, account `production_qa`, base
`https://paranormalinitiative.com`).

## A. Root cause of homepage and dropdown inconsistency

The homepage and the My Studios selector operated on different record types
over different stores. The Home page listed **Broadcast records** (per-browser
IndexedDB, non-ended rows), while My Studios listed **Studio identities**
(server studio-workspace rows plus browser-local Studio records) resolved
through the workspace bridge. Entries such as "New Test", "Testing", "Test",
"TPI", and "Acceptance Test A" were production/broadcast records, not
Studios — the homepage had no Studio-card section at all, so production titles
were the only things it could show. The two surfaces therefore could never
resolve the same identities. Full Phase 1 analysis:
`docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-087-ARCHITECTURE-REPORT.md`.

## B. Existing Studio and production data architecture

- **Studio identity** is the stable host key `localBroadcastId`
  (`StudioEntry.key`). Server-backed Studios are account-scoped studio
  workspace rows (D1) linked to that host key on activation
  (`studioWorkspaceId`, recorded by the workspace bridge). Browser-local
  Studios live in the browser's IndexedDB broadcast store and are exposed
  through the same bridge (`listStudios`, `openLocalWorkspace`, with the
  missing-snapshot and corrupted-snapshot recovery protections from
  TPI-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001 preserved).
- **Productions** are Broadcast records stamped `isProduction: true` with
  `studioId` (the owning Studio's host key) at creation.
- **Recordings** are library items carrying `studioId` (TPI-035 storage);
  dashboard Recordings sections filter by it.
- No schema migration was required: ownership rides the existing `studioId`
  fields. Optimistic-concurrency save protections are untouched.

## C. Final Studio organization and ownership model

The owner-approved Riverside-inspired model: **STUDIO → its productions,
media, scenes, branding, and settings.** Every Studio is a permanent,
independent production environment with its own dashboard. Production
ownership is stamped at creation from the stable Studio key — never from the
current dropdown selection or a title match — switching Studios never
reassigns existing productions, and each dashboard lists only its own Studio's
records. No Reusable Studios, no new Projects/Business hierarchy, no
replacement of the working identity or switching system.

## D. Explanation and correction of Crossroads' missing homepage entry

Crossroads was missing because the homepage listed non-ended Broadcast
records; a server-backed Studio with no such record in that browser could
never appear. The homepage "My Studios" section now builds its cards from
`window.__tpiStudioWorkspace.listStudios()` — the same authorized Studio
collection (server + browser-local) the My Studios selector resolves — so
every openable Studio appears as a card regardless of its Broadcast records,
and production titles can no longer masquerade as Studio names. Verified on
authenticated production with the QA account (Directive Test 1 asserts the
card list equals the bridge Studio collection). Nothing was recreated or
reset; the owner's own account display remains part of owner acceptance.

## E. Homepage and dashboard implementation

- **My Studios cards** (Home): title, Studio number, storage note
  ("Saved to your account" / "This Studio is saved in this browser only"),
  active highlight, and actions — Enter Studio, Open Dashboard, Manage
  Productions, Studio Settings, and More Actions (Rename Studio; Archive or
  Restore Archived Studio).
- **Studio dashboard** (per Studio): Enter Studio, Create Livestream, Start
  Recording, Create Webinar; My Productions table (Enter studio / Edit /
  Delete) filtered to that Studio; Recordings table filtered to that Studio;
  Studio Settings (rename and archive/restore inline, with a note that
  renaming keeps the Studio ID and its attached data). Archived Studios show a
  restore notice instead of appearing active.
- **Creation is split**: "Create New Studio" (My Studios dialog) creates a
  clean permanent Studio with the four default items (Intro Video, Scene 1,
  Scene 2, Outro Video) via the maintained clean-creation path; "Create New
  Production" (create-recording dialog) creates a production inside an
  existing Studio and offers an **Owning Studio** selector — pre-selected when
  launched from that Studio's dashboard, otherwise chosen explicitly ("No
  Studio selected" is possible and ownership is never silently assigned).
- Existing entry points (Create Livestream, Record, On-Air webinar,
  Teleprompter) and the established visual identity are retained.

## F. Recording, livestream, and webinar ownership

Productions created inside a Studio (or with an Owning Studio selected) are
stamped with that Studio's stable key at creation; recordings and their
snapshots carry `studioId`. Verified on production with disposable QA-087
fixtures (Directive Tests 6–8): a recording created in QA Studio A is stamped
with A's Studio ID, does not appear as Studio B's production, and ownership
survives a browser refresh. Historical productions without a reliable owning
Studio were **not** moved or assigned — they remain preserved and unassigned,
reported as ambiguous per directive §6.

## G. Studio management functionality implemented

- **Rename Studio** — works from card More Actions and dashboard Studio
  Settings; the Studio ID, productions, recordings, and scenes stay attached
  (Directive Test 9). A rename that leaves the title unchanged now returns
  cleanly instead of failing before it can apply, so genuine failures keep
  their feedback path.
- **Archive Studio** — hides an inactive Studio from the active listing
  without deleting configuration or productions; the card and dashboard show
  it as Archived (Directive Test 10).
- **Restore Archived Studio** — returns an archived Studio to the active
  listing. The function server was missing the restore route (archive
  round-tripped to a 404); `POST /api/studio/my-studios/:id/restore` now
  completes the round trip.

## H. Features deferred for owner approval

- **Permanent Studio deletion** — not implemented. Directive §9 requires
  separate owner approval before any irreversible cascading deletion.
  Investigation found deletion must decide shared-media handling and the fate
  of the Studio's recordings; the existing soft-delete (Recently Deleted with
  restore) remains the only deletion path. Proposed next step: a "Delete
  Studio" action behind explicit confirmation that soft-deletes first, with
  permanent purge only under separate approval.
- **Bulk historical production reassignment** — not performed; no reliable
  ownership evidence exists, so historical rows were preserved unassigned.
- **Destructive browser-local/server reconciliation** — not performed; the
  existing browser-local recovery mechanisms remain intact.

## I. Files and database changes

Application (canonical source `/Users/toddknipple/Documents/StudioFlow/web`):

- `src/App.tsx` — My Studios cards, per-Studio dashboard, Studio vs
  production creation split, Owning Studio selector.
- `src/styles.css` — Studio card, dashboard, and settings styling.

Website integration (`paranormal-initiative-website`):

- `functions/api/[[path]].js` — Studio restore route for archive/restore
  round trips.
- `studio/workspace-bridge.js` — unchanged-title rename guard preserving the
  failure-feedback path.
- `studio/assets/index-DrvWLCkX.js`, `studio/assets/index-DIiKaF2R.css` —
  built bundles.
- `scripts/stage-studioflow-authoritative.mjs` — cache-buster advanced to
  `tpi087=studio-management-v2`.
- `scripts/verify/tpi-studioflow-087-studio-ownership.mjs` — new maintained
  regression suite (40 checks).
- `scripts/tpi-release.mjs` — `release:preflight` runs the 087 suite.
- `scripts/verify/tpi-release-safety.mjs` — contract pinning both the
  lifecycle and the 087 ownership suites inside the preflight.
- `package.json` — suite script registration.

**Database: no schema changes and no migrations.** (The owner-approved
Testing 123 reset belongs to TPI-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001 and is
not part of this directive.)

## J. Local and authenticated production verification

Local:

| Suite | Result |
| --- | --- |
| `verify:studioflow-087-studio-ownership` | 40/40 |
| `verify:studioflow-studio-lifecycle` | 29/29 |
| `verify:studioflow-033-workspace-roundtrip` | 26/26 |
| `verify:studioflow-035-recording-storage` | pass (recording ownership + isolation) |
| `verify:local-auth-lifecycle` | 64/64 (Firefox acceptance included) |

Authenticated production (isolated QA account `production_qa`, Firefox
Developer Edition): guarded-release smoke 10/10, live Firefox QA acceptance
PASS, and the 087 suite **40/40 with zero failures** against
`https://paranormalinitiative.com` (evidence JSON above). Directive Tests 1–13
were exercised live: homepage cards matching the Studio collection, dashboards
showing only their own productions and recordings, direct entry with saved
configuration, A→B→A switching with independent configurations, exit to Home,
recording ownership, production isolation, refresh persistence, rename,
archive/restore round trip, clean four-item creation, browser-local recovery
(visible "browser only" note; no snapshot deleted), and existing-Studio
preservation. The suite's account-dependent checks report `HEADLESS_WARN`
(never silently pass) when no QA account is available.

Status: `LIVE VERIFIED` by the agent. `OWNER ACCEPTANCE PENDING` — only the
owner can declare OWNER ACCEPTED.

## K. Commits, Worker deployment, and rollback checkpoint

- Source commit: `db3aab4` (StudioFlow canonical repository, `main`).
- Website integration commits on `codex/tpi-development` (pushed to origin):
  `37803f3` (docs: 087 verbatim archive + Phase 1 architecture report) and
  `815fb85` (fix: Studio switching, rename, and archive/restore reliability).
- Production Worker: `b4605f5f-f33e-4f1d-8082-b12fc8bf5bdf`
  (`DEPLOYED_AND_VERIFIED` via the guarded release).
- Rollback checkpoint: `6bbdae3d-f424-4373-87ff-84030df50a49` (previous
  verified production Worker, preserved and recoverable).
- Live application assets: `/studio/assets/index-DrvWLCkX.js`
  (sha256 `3454d311e04d254035dc79ea718fda6a5f094d4c4297c3a87520f73ebdf6504f`)
  and `/studio/assets/index-DIiKaF2R.css`, cache-buster
  `tpi087=studio-management-v2`; preflight confirmed a reproducible build
  matching the staged bundles.
- Data safety: no destructive production data operations. Crossroads of the
  Unknown, Testing 123, and Browser Only Crossroads were not modified.

## L. Markdown documentation synchronization

Updated:

- `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/2026-10-26-TPI-STUDIOFLOW-087-INDEPENDENT-STUDIOS.md` (this record)
- `docs/TPI-DEVELOPMENT/TPI-CURRENT-DEVELOPMENT-STATUS.md`
- `docs/TPI-DEVELOPMENT/TPI-DEVELOPMENT-AGENT-HANDOFF.md`
- `docs/TPI-DEVELOPMENT/009-TESTING-AND-VERIFICATION.md`
- `docs/TPI-DEVELOPMENT/100-DIRECTIVES/DIRECTIVE-INDEX.md` (087 status)

Earlier in the 087 stream (commit `37803f3`): the verbatim directive archive
and `docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-087-ARCHITECTURE-REPORT.md`. All
status labels distinguish IMPLEMENTED / LOCAL TESTED / DEPLOYED / LIVE VERIFIED
/ OWNER ACCEPTED; no record claims owner acceptance.

## M. Remaining known issues

1. **Owner acceptance pending** — the owner should confirm on
   `https://paranormalinitiative.com/studio/` that Crossroads of the Unknown
   and every authorized Studio now appear as homepage cards, that dashboards
   show only each Studio's own productions, and that Enter Studio lands in the
   selected Studio's configuration.
2. **Historical productions without reliable Studio ownership** remain
   unassigned and preserved; they appear in the library but in no Studio
   dashboard. Reassignment requires owner direction.
3. **Permanent Studio deletion** awaits owner approval (section H).
4. **Pre-existing suite failures remain documented and open** (not resolved by
   this work): the five static-contract suites
   (`tpi-studioflow-048-project-persistence`,
   `tpi-studioflow-049-portable-backups`, `tpi-dev-024-offline`,
   `tpi-dev-037-offline`, `tpi-studioflow-022-media-organization`) fail on
   stale source-literal expectations, and
   `verify:studioflow-030-browser`'s rapid-upload step is timing-sensitive
   (one flaky failure in four runs; passes on re-run).
5. **Management feedback channel** — rename/archive/restore failures surface
   through the in-app bridge message (visible in the My Studios dialog and
   Studio Menu) rather than a dedicated dashboard toast.
