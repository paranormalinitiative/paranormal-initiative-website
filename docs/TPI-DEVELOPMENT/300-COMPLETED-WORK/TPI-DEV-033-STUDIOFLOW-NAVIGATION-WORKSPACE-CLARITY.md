# TPI-DEV-033 — StudioFlow Navigation and Workspace Clarity

Date: 2026-10-14

Status: COMPLETE WITH LIMITATIONS / DEVELOPMENT AND PRODUCTION DEPLOYED

Source commit: `a9eddef` (`fix: clarify StudioFlow navigation and workspace failures`)

## Scope completed

- StudioFlow's existing Return to Paranormal Initiative control now targets the
  canonical signed-in member homepage, `/member-home.html`, through the
  environment-relative `studio/navigation-bridge.js`.
- The existing `/explore` route was inspected and preserved. It is the active
  Community Feed implementation, is not present in the normal member sidebar,
  and was not deleted or redirected.
- The workspace bridge now explains that it saves supported configuration only.
  Recordings remain in browser storage until the member downloads them
  separately; workspace save, export, import, refresh, restore, and archive do
  not upload or delete recording files.
- Workspace errors now distinguish signed-out access, denied access, missing
  workspaces, conflicts, invalid/oversized configuration, unavailable schema,
  unavailable backend, and network failure.
- The workspace API now returns a structured 503 response for an unavailable
  workspace schema/backend instead of allowing the frontend to display the
  generic `Workspace request failed.` message.
- Existing owner-scoped authorization, optimistic version checks, archive
  behavior, recording recovery, StudioFlow editing/broadcast functionality,
  member personalization, and administration work were preserved.

## Repository and deployment provenance

| Item | Result |
|---|---|
| Repository | `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website` |
| Branch | `codex/tpi-development` |
| Application source | `a9eddef` |
| Development Worker | `theparanormalinitiative-dev` |
| Development version | `6ed0aa64-e647-45eb-b099-a21bb1c10184` |
| Production Worker | `theparanormalinitiative` |
| Production version | `50648f16-2bce-49e9-ac70-5ff7292dba4b` |
| Development D1 | `tpi_contributor_portal_dev` |
| Production D1 | `tpi_contributor_portal` |
| R2 changes | None |
| Database migrations | None |
| Data imports | None |

The guarded release procedures staged the same application source commit for
both environments. Production staging excluded `data/`, `docs/`, `migrations/`,
`scripts/`, `lib/`, `functions/`, `admin-center-app/`, and local configuration
files. No deployment command ran a migration or import.

## `/explore` determination

`explore.html` and `explore.js` are a working Community Feed surface using the
existing community-feed API, composer, filters, media, read state, and sharing
behavior. The route is not a duplicate that can be safely removed. It is not in
`member-sidebar.html`; the StudioFlow return control was the relevant normal
navigation defect. The route remains reachable and the underlying posts/member
data were not changed.

## Workspace schema finding

Development contains the additive `studio_workspaces` schema and passed the
existing persistence/isolation suites. Existing production D1 reconciliation
evidence records that production does not currently contain the workspace table
and that migration 0051 remains outside this directive's authorization. No
migration was run. The production API now reports this boundary explicitly to an
authorized caller as `workspace_schema_unsupported`, with an export-and-retry
recovery message. Anonymous production access correctly stops at
`auth_required` before any workspace query.

Therefore development workspace persistence is verified. Production workspace
persistence remains blocked pending a separate schema/migration authorization;
this is not treated as a successful production save capability.

## Verification results

### Offline/source checks — PASSED

- JavaScript syntax checks for API and StudioFlow bridge files.
- TPI-DEV-033 offline checks: 15/15.
- Existing DEV-024 workspace offline checks: 17/17.
- Workspace layout regression: passed.
- TPI-UI-003 workspace regression: passed.
- DEV-032 navigation checks: 12/12.
- `git diff --check`: passed before the application commit.

### Development runtime — PASSED

- DEV-024 guarded workspace QA: 23/23.
- DEV-025 creator entitlement/backup/isolation QA: 39/39.
- DEV-032 navigation checks: 12/12.
- Existing synthetic owner login: HTTP 200.
- Authenticated `/studio/`: HTTP 200.
- Authenticated `/studio/navigation-bridge.js`: HTTP 200.
- Authenticated `/member-home.html`: HTTP 200.
- Runtime bridge content targets `/member-home.html`.
- Cross-account workspace reads/updates/archive attempts remained denied.
- Recording blobs and provider credentials remained excluded from workspace state.

### Production runtime — PASSED for non-destructive checks

- Existing read-only production smoke: 10/10.
- Public shell: HTTP 200.
- Public Community Feed category and feed boundaries: HTTP 200.
- Anonymous StudioFlow route: HTTP 403.
- Anonymous workspace API: HTTP 401 with `code: "auth_required"`.
- Anonymous Messenger, notification, admin, and private-media boundaries
  retained their expected denial responses.
- `/explore`: HTTP 200.

An authenticated production workspace mutation was not performed. No production
owner credential was used, and production does not currently have the workspace
schema according to the existing reconciliation evidence. Production
workspace-save capability is therefore `NOT TESTED / BLOCKED BY SCHEMA`, not
claimed as passed.

## Preservation and safety

- Existing StudioFlow bundle editing, broadcast, recording, library, and local
  recovery logic was not replaced.
- No existing recording was uploaded, deleted, or overwritten.
- No member, post, message, media, settings, or authentication data was
  deleted or imported.
- Founding 50 activation remained locked.
- No external RealtimeKit room or livestream was created.
- The pre-existing unrelated worktree changes remain outside the DEV-033
  commit and were not staged.
- No push or merge was performed.

## Changed files

- `functions/api/[[path]].js`
- `studio/index.html`
- `studio/navigation-bridge.js`
- `studio/workspace-bridge.js`
- `scripts/qa/tpi-dev-033-studioflow.mjs`
- `scripts/verify/tpi-dev-024-offline.mjs` (updated assertions for clarified
  control labels)

## Remaining limitations

1. Production saved-workspace persistence requires a separately authorized
   production schema/migration review and release. This directive did not run
   one.
2. Browser file-picker/download and visual acceptance should still be performed
   by the owner on development and production sessions.
3. A real production owner session was not used for destructive or mutating
   workspace actions; production data remained untouched.

## Recommended next step

Treat DEV-033 as complete for the navigation and error-clarity correction. The
next separate directive should address production `studio_workspaces` schema
compatibility only after approved backup, migration-ledger reconciliation, and
rollback evidence are available. Until then, production members should use
Export Workspace for local configuration preservation and download recordings
from StudioFlow's existing Library.
