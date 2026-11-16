# Administration Center — Staff Directory & Capability Inspection

**Date:** 2026-11-15  
**Time zone:** America/New_York  
**Audience:** Owner, Executive, and Full Administrator effective roles  
**Status:** Source complete; guarded production release pending

## What was needed

The Administration Center had role-management and capability-inspection pieces,
but no single read-only directory showing the recognized staff accounts, their
effective server role, the areas that role can use, or the appointment history
behind that access. That made it harder to review authority at a glance and
created pressure to infer permissions from visible labels.

## What was changed

- Added `GET /api/admin/staff-directory` behind the existing `requireAdmin`
  server gate.
- Limited the new directory to Owner, Executive, and Full Administrator
  effective roles.
- Derived effective roles from the maintained appointment and legacy-role
  resolver instead of client state, badges, titles, or menu visibility.
- Added a read-only Administration Center view with staff search, role summary,
  capability inspection, allowed-area mapping, appointment metadata, and
  appointment/revocation history.
- Kept the response minimized: no passwords, tokens, session material, private
  contact details, or private member content are returned.
- Kept all authority mutation in the existing Staff Roles workflow. The new
  directory cannot appoint, revoke, promote, demote, suspend, or grant access.
- Intentionally denied the new directory route to legacy Administrator accounts
  while preserving their existing bounded Administration Center routes.

## Verification

- Administration Center source contract: **88/88**.
- Worker syntax check: passed.
- Administration Center production build: passed.
- `git diff --check`: passed before release preparation.
- No migration was added or applied.
- No StudioFlow, Creator Studio, Nova Editor Workspace, private media, D1, R2,
  Crossroads of the Unknown, or member data was changed.

The local policy check confirmed that Owner, Executive, and Full Administrator
are eligible for the directory while the legacy Administrator role is denied by
the server allowlist. The exact guarded production release, anonymous boundary
check, and live Owner Firefox acceptance are recorded here once completed.

## Safeguard

This is an inspection-only surface. The server remains the authority for every
route and capability. Any future staff-role mutation must remain in the
separate reasoned workflow, preserve appointment history, and pass its own
authorization and audit checks. A client-side change cannot make a staff member
more powerful.
