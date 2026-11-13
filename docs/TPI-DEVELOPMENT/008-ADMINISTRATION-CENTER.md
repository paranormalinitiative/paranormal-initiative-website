# Administration Center

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

Not yet implemented: staff suspension, member report intake and triage, warning
and temporary restriction actions, appeals, a full staff directory, and an
expanded per-capability inspection interface. Moderators currently manage
Community Feed posts and comments only. Do not describe these future tools as
available.

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
