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

## Operational staff management (future)

The preserved roadmap item **TPI Administration Center — Complete Quality &
Functional Audit** covers the eventual staff-facing work: a staff directory, role
assignment and suspension, permission inspection, appointment notes, audit
history, and role-state management. Future UI should show only the tools the signed-in
account's resolved capabilities permit.

Current production behavior is unchanged: `/admin-panel`, the protected admin
pages, and every admin API require an owner-or-admin session, and there is no
Moderator tier, staff directory, or role-assignment surface yet. The role model
that this work must implement is
[TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md](400-FUTURE-DEVELOPMENT/TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md)
(TPI-GOVERNANCE-003B).

That record, as amended by TPI-GOVERNANCE-003B1, also fixes the conduct standard the
future staff surface must support: viewpoint-neutral moderation, protection for
criticism of TPI and its leadership, recusal and escalation, documented fair process,
equal application regardless of status, the working staff oath, and the rule that
service recognition never reactivates expired authority. A future staff directory or
oath-acknowledgment surface is not designed or implemented here, and the audit
roadmap item recorded above is unchanged.
