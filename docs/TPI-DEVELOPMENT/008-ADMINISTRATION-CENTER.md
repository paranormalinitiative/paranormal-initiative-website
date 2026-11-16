# Administration Center

## 2026-11-15 command-center audit

The preview now has a streamlined Command Center layer on top of the existing
protected overview contract. It shows the live administrative data-source
state, relative operational queues, NOVA readiness gates, and protected
application boundaries before the detailed metric cards. It uses only
authoritative overview values and explicitly shows unavailable sources; it does
not claim complete site uptime or invent health numbers.

The complete audit and next-phase roadmap are in
[TPI Administration Center Command Center Audit](200-AUDITS/2026-11-15-ADMIN-CENTER-COMMAND-CENTER-AUDIT.md).
The dashboard is a preview improvement only. It does not promote the preview,
connect NOVA, change staff authority, or modify StudioFlow, Creator Studio,
Nova Editor Workspace, private media, D1, or R2.

## Applications

The installed Refine + shadcn/ui application remains in admin-center-app/ and is previewed at /admin-center-preview/. The existing legacy administration application remains at /admin-panel.

The preview must remain protected and separate. It must not be promoted to /admin-panel by this workflow.

## Integration status

The preview application has prior completed work and protected-route deployments recorded in the TPI-ADMIN-009, TPI-ADMIN-010, and TPI-ADMIN-010B audit records. Those records remain the source of detailed feature status. TPI-DEV-001 does not rebuild or replace either administration application.

## Development requirement

The Administration Center is now available for authenticated development testing at `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/admin-center-preview/`. Its APIs use the isolated development D1. Owner access returned HTTP 200 and the protected admin overview/member APIs returned data for the synthetic development records. Ordinary member access remained HTTP 403. Do not claim production acceptance from these preview results.

The existing `/admin-panel` remains the production Administration Center and was not replaced.

## Owner review requirement

The intended review path is an authenticated development account on the isolated development website. Todd should be able to open `/admin-center-preview/`, navigate the pages, inspect real development functionality, and approve or reject the change without sharing passwords, cookies, or tokens. Until the isolated backend and test accounts are implemented and verified, this is an approved requirement rather than an available acceptance environment.

The existing `/admin-panel` remains the production Administration Center and must not be replaced by the preview during development work.

## Operational staff management

The initial staff appointment and moderation surfaces are implemented under the
2026-11-13 staff-role work. The existing `/admin-panel` includes a Staff Roles
view; server APIs restrict it to Owner and Executive. It records appointment
and revocation reasons and preserves history. A separate `/moderation` surface
lets staff with moderation authority hide or remove Community Feed posts and
comments with an audited reason. These controls do not grant authority from
badges or client state.

Legacy Owner and Administrator accounts remain supported. Explicit Executive,
Full Administrator, Administrator, and Moderator assignments now resolve
server-side from `staff_role_appointments`. The Owner appoints/revokes Executive
and Full Administrator; the Owner or Executive appoints/revokes Administrator
and Moderator. Assignment forms require a reason. Existing admin APIs apply a
server-side role allowlist, with protected Owner/Executive and staff-peer
boundaries. The broader complete-quality audit remains open for capabilities
not covered by the initial implementation. The role model is
[TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md](400-FUTURE-DEVELOPMENT/TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md)
(TPI-GOVERNANCE-003B).

The completed 2026-11-15 role/action reconciliation is recorded in
[`200-AUDITS/2026-11-15-ADMINISTRATION-CENTER-ROLE-MATRIX-AUDIT.md`](200-AUDITS/2026-11-15-ADMINISTRATION-CENTER-ROLE-MATRIX-AUDIT.md).
It is the quick reference for matching the Center’s proposed areas to the
effective server-side role, route allowlist, and separate product capabilities.

### Staff Directory & Capability Inspection

The Administration Center now includes a read-only **Staff Directory &
Capability Inspection** view. It is available only to the Owner, Executive, and
Full Administrator effective roles. The view derives each staff member's
effective role from the same server-side appointment and legacy-role resolver
used by protected routes; it does not trust a client badge, title, or navigation
item.

For each recognized staff account, authorized viewers can inspect the effective
role, base account role, office title, active state, capability set, allowed
Administration Center areas, appointment metadata, and appointment/revocation
history. The response is deliberately minimized: it does not expose passwords,
tokens, private contact details, session material, or private member content.

This view cannot appoint, revoke, promote, demote, suspend, or otherwise change
authority. Staff-role mutation remains in the existing Staff Roles workflow and
continues to require the applicable server-side authority and a reason. Legacy
Administrator accounts are intentionally not granted this directory route;
their existing bounded routes remain unchanged. The API is `GET
/api/admin/staff-directory`, and the server returns 403 when the effective role
is outside the inspection boundary.

### Membership & Entitlement Inspection

The Administration Center now also has a read-only **Membership & Entitlements**
view for Owner, Executive, and Full Administrator effective roles. It combines
the account's effective staff role, account state, post/comment/message flags,
Creator and Contributor capability sources, explicit Nova editorial authority,
Founding Membership identity, Creator Studio access, entitlement sources, and
active moderation actions in one searchable, paginated view.

The API is `GET /api/admin/membership-entitlements`. It is server-derived and
metadata-only; it does not expose credentials, session material, private
contact details, private messages, or private evidence. Missing optional
entitlement, staff-appointment, or moderation schemas fail closed and are
reported as unavailable rather than granting access. Legacy Administrator
accounts are intentionally denied this broader inspection view.

No mutation controls are presented. Granting or revoking an entitlement,
changing account state, appointing staff, changing Creator Studio access, and
moderating an account remain separate confirmed and audited workflows. The
completed record is [Administration Center Membership & Entitlement
Inspection](300-COMPLETED-WORK/2026-11-15-ADMINISTRATION-CENTER-MEMBERSHIP-ENTITLEMENT-INSPECTION.md).

The first report-intake and triage workflow is now implemented for video,
messenger, and member bug reports: authorized staff can filter the safe queue,
open protected metadata detail, choose a supported review outcome, and record
a required triage note for reviewed, dismissed, or actioned decisions. Private
message evidence remains outside the surface, and report triage does not itself
apply a member restriction.

The next enforcement slice is implemented under **Enforcement & Appeals**.
Authorized administrators can issue a reasoned warning or a time-limited
restriction against a non-staff member, scoped to posting, commenting,
messaging, or all community activity. Temporary restrictions are limited to
1–720 hours and are enforced server-side when the affected member attempts the
matching action. Members can review their own notices in Settings and submit
one open appeal per active action. Staff decisions require a response note;
accepting an appeal revokes the linked action. All issue, revoke, and appeal
decisions are written to the existing administrative audit trail.

This slice deliberately does not add permanent bans, staff suspension, content
deletion, private-message review, or a new authority tier. It is additive and
uses migration `0072_moderation_enforcement_and_appeals.sql`; missing-schema
responses fail closed as `migration_pending` rather than bypassing the
authorization boundary. The protected application boundary remains unchanged:
StudioFlow, Creator Studio, Nova Editor Workspace, private media, and their
source/deployment artifacts are not part of this work. Moderators continue to
manage Community Feed posts and comments only.

This report-triage slice is deployed and live verified in release
`rel-33a090f8a72c-497b729bbec3` (Worker
`771c0fbc-27a8-4af0-8d6a-1e994d0aa9ad`). Anonymous production smoke passed
**10/10**; no report data, migration, private evidence, or protected
application was changed by the release.

That record, as amended by TPI-GOVERNANCE-003B1, also fixes the conduct standard staff
must support: viewpoint-neutral moderation, protection for criticism of TPI and its
leadership, recusal and escalation, documented fair process, equal application
regardless of status, the working staff oath, and the rule that service recognition
never reactivates expired authority. The oath acknowledgment and help surfaces remain
future work, and the complete-quality audit remains open.

The future management areas this Center must eventually carry — membership and
entitlement administration, Founding Membership administration, role management and
permission inspection, staff history, honors and distinction management, audit
records, and Community Standards enforcement tools — are indexed in
[TPI-FUTURE-WORK-REGISTER.md](400-FUTURE-DEVELOPMENT/TPI-FUTURE-WORK-REGISTER.md)
(TPI-GOVERNANCE-003B2). Nothing in that register is implemented or authorized to
start.
