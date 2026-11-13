# Staff Roles and Moderation

Date: 2026-11-13
Status: **IMPLEMENTED IN SOURCE — GUARDED RELEASE AND LIVE ACCEPTANCE PENDING**

## Owner-approved role model

| Role | Authority |
|---|---|
| Owner | Highest protected authority; manages all staff appointments. |
| Executive | Explicit CEO, Founder, Director, or Assistant Director appointment. Full platform authority except Owner transfer; may appoint/revoke Administrators and Moderators. |
| Full Administrator | Broad delegated Admin Center and moderation access; cannot change staff appointments, protected staff accounts, executive authority, high-impact security/configuration, Founding assignments, leadership honors, Creator incentives, or professional entitlements. |
| Administrator | Allowlisted routine administration and member/content operations; cannot change staff, protected accounts, security, ownership, or professional entitlements. |
| Moderator | Dedicated Feed moderation surface; can hide/remove Feed posts and comments with a reasoned audit record. No account, Admin Center, or staff authority. |
| Member | Standard community participation and separately granted Creator/Contributor capabilities. |

Membership, Creator/Contributor access, Founding status, staff office, badges,
and honors remain separate. Badges and profile labels are presentation only;
the server resolves authority from the account and active staff appointment.
Existing legacy Owner/Admin roles remain mapped as Owner/Administrator.
Appointments are explicit, single-active-role, reason-required, audited, and
revocable with history retained. No member received a new staff appointment
during this work.

## Implemented surfaces

- Additive migration `0071_staff_role_appointments.sql` stores appointment
  history and prevents multiple active staff appointments per account.
- Owner/Executive Staff Roles view lists appointments and supports reasoned
  assignment/revocation. Only Owner can assign Executive or Full Administrator;
  only Owner/Executive can appoint Administrator or Moderator.
- Server API enforces role-specific allowlists and protected account safeguards.
- A dedicated `/moderation` page and API allow Moderators and higher staff to
  review Community Feed posts/comments and hide/remove with a reason.
- Shared profile Honors & Distinctions and member navigation reflect
  server-provided staff identity. Those visuals do not grant permissions.
- Migration `0071` was applied to the official local development database only
  after a SQLite backup and integrity check. No local account rows were altered.

## Explicit future work

This increment does not include member report intake/triage, warnings,
temporary posting restrictions, appeals, staff suspension, permanent bans,
staff appointment notifications, or expanded staff tiers. Admin/Moderator
badges are not qualifications. These follow-up capabilities remain on the
future-work register.

## Verification and release record

- `npm run verify:staff-roles`: **14/14 passed**.
- `npm run verify:profile-honors-wall`: **13/13 passed**.
- `npm run verify:member-profile-feed`: **35/35 passed** after updating its
  staff-identity contract.
- Node syntax checks for the API, Worker, member shell, and Admin Center passed.
- Migration applied successfully against a disposable SQLite database, with
  duplicate-active appointment constraint verified.
- Full disposable API E2E: **300/300 passed**, including the appointed
  Moderator queue, member denial, Administrator staff-appointment denial,
  Owner appointment register, protected Owner/Moderator block checks, and
  least-privilege administrative boundaries.
- `npm run verify:local-auth-lifecycle`: **38/38** authentication checks and
  **65/65** isolated Firefox Developer Edition acceptance checks passed; no
  remote requests or owner browser profile access.
- Source syntax checks and `git diff --check` passed.
- Release preflight, push, production release, and live acceptance remain
  pending. Do not treat the implementation as live until those gates complete.

Update this record and the current development status with exact release IDs,
Worker version, and live acceptance results only after the guarded workflow
finishes successfully.
