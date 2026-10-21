# TPI-DEV-037 — My Studios

Status: **IMPLEMENTED AND DEPLOYED / DEVELOPMENT FINAL ACCEPTANCE PASSED / AUTHENTICATED PRODUCTION MUTATIONS NOT TESTED**  
Date: 2026-10-15  
Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`  
Branch: `codex/tpi-development`

## Scope

Implement numbered, account-owned Studio management in the existing StudioFlow
right-side production customization panel. The implementation reuses the
existing `studio_workspaces` object and adds only the development-first metadata
needed for permanent numbers and recoverable deletion:

- `studio_number` — permanent per-owner number assigned by a durable counter.
- `deleted_at` — soft-deletion timestamp; a deleted Studio keeps its number.
- `studio_number_allocations` — owner-scoped concurrency-safe next-number state.

The existing workspace IDs, local broadcast IDs, saved state, archived rows,
recordings, browser media, member accounts, entitlements, and production data
remain separate and preserved.

## Product behavior

- The user-facing label is **MY STUDIOS**.
- The selector is inserted before the existing `.brand-row` in StudioFlow’s
  `.asset-panel`; no second StudioFlow shell or theme system was introduced.
- The three-dot management menu provides exactly Rename Studio, Duplicate
  Studio, and Delete Studio.
- Studio numbers are allocated atomically and are never derived by counting or
  reused after deletion.
- Delete is recoverable through Recently Deleted Studios and does not delete
  recordings or media.
- Switching, duplicate, and delete operations are blocked while an active
  recording/livestream or recovery/finalization state is present. Deleting a
  scheduled production is blocked; scheduling does not block ordinary switching.
- Autosave is debounced and reports Saving, Workspace saved/Saved, or an
  explicit error. A successful status is shown only after the API confirms the
  write.
- Cross-tab signaling and unload protection are best-effort browser safeguards;
  they do not replace server-side ownership or production-state checks.

## Data protection

Only an allow-listed configuration snapshot is persisted. It may include
supported backgrounds, scenes, logo placement, style/widget/general settings,
guest permissions, banners, and orientation. Recording files, browser file
handles, uploaded media, destinations, stream credentials, tokens, and private
browser storage are not uploaded or deleted by this feature.

## Development migration gate

The exact additive migration is:

`migrations/0052_my_studios.sql`

It was applied to `tpi_contributor_portal_dev` and verified without changing the
17 existing development workspace rows. The TPI-DEV-037 Production
Authorization Addendum subsequently authorized the same migration for
production. It was applied there after a fresh private backup and post-
migration verification.

The production backup path, checksum, migration result, preservation checks,
and compatible application deployment are recorded in the completion report.
No historical migrations were executed and the migration ledger remains
unchanged.

## Verification requirements

Development verification covered numbering, concurrency, rename, duplicate,
soft-delete/recovery, owner isolation, production-state guards, entitlement
denial, existing workspace preservation, recording exclusion, save retry, and
configuration isolation. The final isolated development acceptance passed
37/37 checks against deployed version `cf58029d-62be-409f-98ff-58591b020641`.
It also verified that the concurrent-save defect found during acceptance was
repaired fail-closed and that the losing writer receives `409
workspace_conflict`. The same corrected application source was then promoted
to production as `05c5d075-8d28-4f72-a4c8-a8edba01bb10`.

Production read-only route protection and D1 preservation checks passed.
Authenticated production Studio mutations remain **NOT TESTED** because no
dedicated production test identity was authorized; no real production member
workspace was touched.
