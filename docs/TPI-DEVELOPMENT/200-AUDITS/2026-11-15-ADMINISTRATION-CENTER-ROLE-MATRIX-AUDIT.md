# Administration Center Role and Action Matrix Audit

Date: 2026-11-15  
Scope: The Paranormal Initiative Administration Center, `/moderation`, and the
server-side role and capability gates  
Status: Completed baseline reconciliation

## Why this audit exists

The Administration Center has more sections than the original Owner/Admin
surface. This audit records which authority source controls each kind of work,
which actions are currently available, and which actions must remain separate.
The matrix is a safety reference; it does not grant access.

The server is authoritative. A hidden menu item is only a usability measure,
and a visible menu item is never permission. Every API route must still resolve
the signed-in account, its effective staff appointment, and any separate
capability required by that action.

## Role boundary

| Authority | Full Administration Center | Focused Moderation | Staff appointments | Professional entitlements |
|---|---:|---:|---:|---:|
| Owner | Yes | Yes | Full authority | Owner-gated actions as implemented |
| Executive | Yes | Yes | Appoint/revoke Administrator and Moderator; cannot appoint/revoke Executive or Full Administrator | Separate capability gates still apply |
| Full Administrator | Yes, excluding protected ownership, staffing, governance, entitlement, security, and settings areas | Yes | No | No entitlement administration |
| Administrator | Allowlisted routine operational routes | Yes | No | No professional entitlement grants |
| Moderator | No | Yes | No | No |
| Member | No | No | No | Membership or explicit product capability only |

The effective role is resolved from the explicit active appointment. Legacy
`owner` remains Owner and legacy `admin` remains Administrator when no active
appointment overrides that baseline. Titles, badges, Founding Memberships,
and client-side values never substitute for this resolution.

## Administration Center action matrix

The following describes the current integrated navigation and its underlying
server boundary.

| Center area | Current action boundary | Owner / Executive | Full Administrator | Administrator | Moderator |
|---|---|---:|---:|---:|---:|
| Overview, Analytics, Activity | Read operational summaries and bounded activity | Read | Read | Read | Separate queue only |
| Member Directory | Read member records and permitted activity | Read / manage | Read / manage | Read / manage | No |
| Member profile/access actions | Update routine member fields or participation flags; staff and Owner protection remains server-side | Yes | Members only | Members only | No |
| Account blocking/restoring | Change active state for ordinary members; never self, Owner, or protected staff peers | Yes | Members only | Members only | No |
| Roles & Permissions | Read-only role/capability summary | Yes | Protected from this role | Not available | No |
| Account Restrictions view | Read capability-restriction queue | Yes | Protected from this role | Protected from this role; member access actions remain separately allowlisted | No |
| Community posts/comments/reactions | Read metadata and supported moderation controls | Yes | Yes | Yes | Use `/moderation` |
| Reports & Moderation | Review metadata, permitted details, resolve supported report states with an audit record | Yes | Yes | Yes | Focused moderation queue |
| Moderation History / Audit Logs | Read bounded audit history | Yes | Audit Logs available; protected settings/security remain separate | Audit Logs available | No |
| Creator directory / channels / Studio access | Read or manage only where the route’s explicit boundary permits | Yes | Protected | Protected | No |
| Founding 50 / Founding Memberships | Existing protected workflows; activation and entitlement behavior remains separately gated | Yes | Protected | Protected | No |
| Leadership / Board Members | Governance records and distinctions | Yes | Protected | Protected | No |
| Contributors / Editorial Review | Contributor administration is separate from Nova review/publish capabilities | Yes | Contributor routes only | Contributor routes only | No |
| Education Center / TPI Videos / Events | Existing protected content and event workflows | Yes | Routine routes permitted where allowlisted | Routine routes permitted where allowlisted | No |
| Notifications | Read the protected operational queue and change only the acting recipient’s read state | Yes | Yes | Yes | No |
| Platform Health / Security / System Settings | Protected operational/configuration views | Yes | Protected | Protected | No |
| Help Desk | Internal procedures only; access is separately staff-gated | Yes | Yes | Yes | Staff Help Desk access; not full Center access |

## Separate capability boundaries

These are intentionally not inferred from the staff role:

- Creator Studio access is resolved through the Creator capability and its
  existing entitlement rules. The Administration Center must not modify
  StudioFlow behavior or private Studio data as a side effect of routine admin
  work.
- Nova Editorial Review and Editorial Publish are separate capabilities. A
  staff role does not automatically grant either one.
- Education Center publication remains a separate editorial decision. A
  Contributor or All-Access membership does not automatically grant unrestricted
  publication authority.
- Founding Memberships, badges, honors, and incentives are not staff authority.

## Safeguards verified in this reconciliation

1. `effectiveStaffRole()` is the single role-resolution source for the API and
   protected HTML access path.
2. Administration Center eligibility is centralized in
   `hasAdministrationCenterRole()` and includes Owner, Executive, Full
   Administrator, and Administrator only.
3. The `/editorial/access` probe now returns the effective appointed role and
   the same full-Center decision as the server HTML gate. This prevents an
   appointed staff account from being incorrectly reduced to an editorial-only
   shell.
4. `mayUseAdminRoute()` remains an allowlist for route groups; handler-level
   checks still protect Owner, Executive, staff peers, entitlements, and
   mutation-specific rules.
5. Moderator work remains on `/moderation`, not the full Administration Center.
6. The regression suite checks legacy roles, appointed roles, missing additive
   schema behavior, route boundaries, staff appointment controls, and the
   effective-role access probe.

## Not claimed as complete

The following remain future work and must not be presented as available:

- staff suspension;
- appeals and member report follow-up beyond the supported metadata triage queue;
- moderator warnings and temporary restrictions;
- appeals;
- a complete staff directory;
- expanded per-capability inspection;
- pages and groups administration;
- internal NOVA retrieval and administration automation.

## Evidence

- Source authority: `lib/staff-roles.js`, `worker.js`, and
  `functions/api/[[path]].js`.
- Regression check: `node scripts/verify/tpi-staff-roles.mjs`.
- UI contract checks: `node scripts/qa/tpi-admin-006-preview.mjs`.
- Policy references: `docs/TPI-DEVELOPMENT/007-SECURITY-AND-PERMISSIONS.md`,
  `docs/TPI-DEVELOPMENT/008-ADMINISTRATION-CENTER.md`, and
  `docs/TPI-DEVELOPMENT/TPI-INTERNAL-POLICIES.md`.
