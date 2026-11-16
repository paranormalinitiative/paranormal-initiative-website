# Administration Center Parity and Permissions Audit

**Date:** 2026-11-15 21:54 EST  
**Scope:** Legacy `/admin-panel`, reactive `/admin-center-preview/`, server role resolution, and protected route contracts  
**Status:** Complete baseline audit; no production code or data changed

## Purpose

The reactive Administration Center is being streamlined into the long-term
operational center, but the existing legacy Administration Center remains in
production. This audit compares the two surfaces before any replacement or
large migration is attempted.

The objective is simple: determine what is actually equivalent, what is newer,
what is still a separate workflow, and whether the server permissions match the
visible administrative experience.

## Findings

### 1. The two surfaces are not yet one-for-one

The reactive Center currently defines **35 navigation resources** across
Dashboard, Members, Community, Creators, Governance, Content & Publishing, and
System. The legacy Center currently exposes **22 navigation entries** across its
combined panels.

This difference is expected at the current integration stage. The reactive
Center contains newer bounded resources such as Membership & Entitlements,
Staff Directory, Account Restrictions, Enforcement & Appeals, Moderation
History, Reactions, Board Members, Creator Channels, and the protected Help
Desk. The legacy Center retains established combined panels and links to
separate protected workflows such as advanced settings and event management.

The legacy route must therefore remain in place until each difference is
classified and accepted.

### 2. Authorization is server-side and remains the source of truth

The current authorization chain is intact:

1. `effectiveStaffRole()` resolves the active appointment or supported legacy
   role.
2. `hasAdministrationCenterRole()` controls full Center eligibility.
3. `mayUseAdminRoute()` applies the route allowlist for narrower staff roles.
4. Protected HTML and API handlers enforce the session and role boundary.
5. The client navigation is only a usability layer and does not grant access.

Owner and Executive remain full Center roles. Full Administrator and
Administrator are intentionally narrower. Moderator remains on the focused
`/moderation` surface rather than receiving the full Center.

### 3. The role-inspection catalog is incomplete

`STAFF_DIRECTORY_AREAS` currently documents the established administration
areas but does not yet enumerate every newer reactive resource, including:

- Membership & Entitlements;
- Staff Directory;
- Account Restrictions;
- Reactions;
- Moderation History;
- Creator Channels; and
- the protected Help Desk boundary.

This does not grant an unauthorized role access, because the server route
allowlist still decides access. It does mean that the capability inspection
view is not yet a complete explanation of the current Center. Expanding this
catalog is the first implementation repair from this audit.

### 4. Protected applications remain outside the audit boundary

No StudioFlow source, Creator Studio application source, Nova Editor Workspace,
private media, D1 data, R2 objects, credentials, sessions, or owner data were
changed. The audit only inspected the Administration Center source, its
protected APIs, and existing documentation.

## Verification

- Reactive Administration Center production build: passed.
- Reactive Administration Center source contracts: **92/92**.
- Live Owner Firefox verification: passed for protected navigation and the
  Creator Channels read-only boundary.
- Legacy route: retained as the current production surface; no replacement was
  attempted.
- Working tree: clean before this documentation-only record.

## Required follow-up order

1. Expand `STAFF_DIRECTORY_AREAS` to include every current Center resource and
   label each one by its actual server route and action boundary.
2. Make reactive navigation visibility reflect the same server-derived role
   boundaries for usability, while preserving server enforcement as the real
   gate.
3. Build a row-by-row parity matrix with one of three decisions: **migrate**,
   **integrate**, or **preserve as a separate protected workflow**.
4. Run disposable-session acceptance for Owner, Executive, Full Administrator,
   Administrator, Moderator, editorial-only, and ordinary member boundaries.
5. Only after those checks pass should the Owner decide whether any legacy route
   should be retired or redirected.

## Reusable rule

Never treat matching menu labels as feature parity. Compare the data contract,
server authorization, mutation boundary, audit behavior, and owner acceptance
for each administrative area before consolidating or replacing the existing
workflow.
