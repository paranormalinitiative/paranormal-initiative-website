# The Paranormal Initiative — Internal Help Desk

**Audience:** Owner, Founder/CEO, authorized administrators, moderators, and
other credentialed staff with an active server-side appointment
**Owner:** The Paranormal Initiative
**Status:** Protected internal operations reference
**Last updated:** 2026-11-15

## Nova internal Help Desk assistant

The protected Help Desk includes **Ask Nova**, the TPI Everything Assistant for
authorized internal people. Nova can explain the documented Administration
Center, staff roles, moderation, reports, security, policy, release, member
support, StudioFlow handoff, Creator Studio, Nova Editorial Workspace, and
operational procedures in this reference set.

The internal assistant uses the separate Cloudflare AI Search instance
`tpi-nova-internal`, backed by the private R2 source `tpi-nova-internal-knowledge`.
It is not the public Mystic index. The `/api/nova/ask` internal route requires
the same server-side active staff authorization as the protected Help Desk and
fails closed for anonymous members.

Nova explains documented procedures; it cannot grant access, change roles, ban
members, delete data, deploy releases, inspect private messages, or bypass a
server-side permission check. Owners, Executives, Full Administrators,
Administrators, and Moderators receive the internal assistant according to the
same role boundary that controls the Help Desk and Administration Center. When
the documentation does not answer a situation, Nova directs the user to the
internal request and escalation path.

## Relationship to Mystic and Nova

The public Help Center's Ask Mystic assistant is not an internal operator and
does not have access to this Help Desk. It searches only member-facing help
articles. Internal procedures, moderation actions, staff roles, member records,
audit details, and Administration Center workflows remain available only
through this protected Help Desk and the server-side authorization boundary.
Nova is the protected TPI Everything Assistant layered onto this Help Desk;
Mystic remains public-only and paranormal-focused.

## Purpose

The Internal Help Desk explains how authorized internal people use the
Administration Center, moderation tools, member controls, publishing queues,
security views, audit records, and operational handoffs.

It is not a public Help Center, not a role-granting system, and not a shortcut
around authorization. The Help Desk describes existing controls and approved
procedures; the server remains the authority for access.

The website experience is the protected internal Help Desk reached through the
Administration Center. It must not be listed as a normal member-navigation
destination or served to an anonymous member.

## Access boundary

- The Owner/Founder/CEO has the highest operational authority.
- Legacy administrator access remains supported by the maintained authorization
  model.
- Active appointed Executive, Full Administrator, Administrator, or Moderator
  staff may see only the controls their server-side capability permits.
- A title, badge, Founding Membership, contributor status, or visible menu item
  does not grant authority by itself.
- Direct URLs, article routes, search routes, contact routes, and internal data
  assets must receive the same server-side access protection.
- Use the [Administration Center role and action matrix](200-AUDITS/2026-11-15-ADMINISTRATION-CENTER-ROLE-MATRIX-AUDIT.md)
  before taking a role-sensitive action. It records the current boundary for
  Owner, Executive, Full Administrator, Administrator, Moderator, and Member.
- The Member Help Center remains separate and may be linked for public-facing
  instructions, but member content must not be used to disclose internal
  procedures.

## Navigation model

The Help Desk uses expandable topic groups so a large operational library stays
scannable without putting every procedure in one long menu.

### Staff orientation and boundaries

- Start here: how internal TPI work is organized
- Choose the smallest authority needed
- Never share credentials or private member data

### Administration Center

- Navigate the Administration Center
- Use the dashboard, health, and audit views
- Understand the protected system areas and their data sources

### Moderation, abuse, and reports

- Review an abuse or community report
- Use the protected Reports & Moderation queue to triage video, messenger, and member bug reports
- Record a concise factual triage note before marking a report reviewed, dismissed, or actioned
- Remember that the queue exposes metadata only; private conversation evidence remains protected
- Hide or remove a community post or comment
- Use the moderation decision checklist
- Issue a documented warning or time-limited content restriction from
  **Enforcement & Appeals** when the server-side role permits it
- Use only the supported scopes: posting, commenting, messaging, or all
  community activity; temporary restrictions are limited to 1–720 hours
- Review a member appeal and record a factual decision note; accepting an
  appeal revokes the linked active action
- Revoke an active warning or temporary restriction with a reason
- Escalate threats, doxxing, or immediate safety concerns

### Members, roles, and restrictions

- Block or restore a member account
- Understand staff roles and appointments
- Use **Staff Directory & Capability Inspection** to review a staff member's
  effective role, allowed Administration Center areas, capability boundaries,
  and appointment/revocation history; this view is read-only and cannot change
  permissions
- Handle member records and private contact data
- Keep account blocking separate from content moderation and member-to-member
  blocking
- Do not use Enforcement & Appeals for permanent bans, staff suspension,
  content deletion, or private-message review; those actions are outside this
  slice and must be escalated through the documented authority path
- Members can review their own safety notices in Settings and submit one open
  appeal per active action
- Use **Membership & Entitlements** for one read-only, server-derived view of
  effective staff role, account capability flags, Creator/Contributor access,
  Founding Membership identity, Creator Studio access, Nova authority, and
  active restrictions
- Treat the Membership & Entitlements view as inspection only; do not infer
  authority from a title, badge, or navigation item, and do not add mutation
  controls to this view
- If an optional entitlement or moderation source is unavailable, record it as
  unavailable and escalate; never treat missing data as permission

### Content, teams, and publishing

- Review and publish contributor content
- Operate content, teams, events, and media queues
- Keep editorial review separate from publication
- Confirm the approved Nova version before publishing

### Creator Studio, Nova, and events

- Troubleshoot Creator Studio and Nova access
- Preserve StudioFlow, Nova, Creator Studio, and owner data boundaries
- Escalate application defects without changing stable applications during
  unrelated website work

### Security, privacy, and audit

- Internal policy index and source-of-truth rules
- Security and audit practices for internal work
- Run a privacy review before sharing or publishing
- Keep credentials, recovery data, session material, and private member data
  out of notes and screenshots

### Daily operations and workflow

- Use the daily operations checklist
- Hand off an internal task cleanly
- Create a complete bug/repair and release record
- Record owner, target, action, result, and next step

### Incidents, outages, and continuity

- Respond to a suspected security incident
- Handle an outage or degraded service
- Preserve evidence and escalate instead of improvising destructive changes

### Policy source of truth

The active policy companion is [`TPI-INTERNAL-POLICIES.md`](TPI-INTERNAL-POLICIES.md).
Use it for authority, privacy, moderation, reports, account actions, content,
protected applications, security, incident response, and documentation rules.
Use this Help Desk for the current interface procedure. If the policy, current
server response, and interface disagree, stop and escalate; do not select the
most permissive interpretation.

### Staff reference and training

- New staff training path
- Shared vocabulary and decision checklists
- Role-specific escalation and recusal reminders

## Core procedures

### Administrative actions

1. Confirm the signed-in identity and active capability.
2. Confirm the exact target member, content item, or operational record.
3. Read the relevant report, policy, or source record before acting.
4. Use the smallest supported action that addresses the issue.
5. Enter a concise, factual reason where the workflow supports one.
6. Confirm the resulting status and audit record.
7. Escalate when authority, evidence, or safety is unclear.

### Block or restore a member

The current interface uses `Block Member` to deactivate an account so it cannot
log in or post. Restoration uses `Unblock / Restore Member`.

- Do not block an account as a substitute for hiding one post or comment.
- Do not block your own account.
- Confirm the reason, authority, target, and resulting status.
- Restore only when the documented condition and authority are clear.
- Keep the account action separate from member-to-member blocking in Messenger.

### Moderation

- Treat a report as a signal to review, not automatic proof of a violation.
- Apply the same standards regardless of Founder, Board, Founding, Creator,
  Contributor, member, or staff status.
- Do not moderate criticism merely because it is unfavorable to TPI.
- Recuse and escalate when a personal relationship or conflict could affect the
  decision.
- Do not copy private messages or sensitive member information into a note when
  a protected link or minimal description is sufficient.

### Publishing and applications

- Review content under the applicable editorial or operational authority.
- Keep drafts, review decisions, approved snapshots, and published visibility
  distinct.
- Do not modify StudioFlow, Nova, Creator Studio, or other protected
  application files during unrelated website work.
- If a stable application appears to be involved, stop scope expansion,
  document the dependency, and use the protected application workflow.

### Bug, repair, and release records

For a meaningful incident or repair, record the date, time zone, reporter,
audience, environment, route, visible symptom, scope, checks performed,
confirmed cause, exact fix, verification, release/rollback result, and the
safeguard that prevents recurrence. Use the maintained
`TPI-PROBLEMS-FIXES-AND-FEATURED-PRODUCTS.md` reference and a dated completion
record when the work changes user-facing behavior. Never include passwords,
tokens, cookies, private member data, or secret-bearing URLs.

## Security and incident response

- Never paste passwords, recovery codes, session cookies, API tokens, stream
  keys, private URLs, or production secrets into the Help Desk.
- Do not clear owner browser storage or use the owner’s browser profile for
  acceptance testing.
- Do not delete production D1 rows, R2 objects, Studios, recordings, or
  Crossroads of the Unknown data as a troubleshooting step.
- Preserve timestamps, URLs, visible errors, request IDs, and safe screenshots.
- During a suspected security incident, stop unrelated changes, preserve
  evidence, notify the incident owner, and follow the approved escalation path.
- Do not rotate secrets, change roles, publish explanations, or perform a
  destructive migration unless the authorized incident owner directs it.

## Handoffs and audit quality

Every internal handoff should state:

- what happened and when;
- the exact route, record, or product involved;
- what was checked;
- what action was taken, if any;
- who owns the next step;
- what remains unverified; and
- whether a protected application, owner data, authentication boundary, or
  production release is affected.

Avoid vague notes such as “fixed” or “handled.” The record should allow another
authorized person to understand the decision without reconstructing it from
private chat history.

## Relationship to the Member Help Center

The Member Help Center explains ordinary member tasks, policies, privacy,
safety, media, and reporting. The Internal Help Desk explains authorized
operations. If an internal procedure would help a member understand a decision,
write a safe member-facing explanation separately; do not expose the procedure
itself.

## Maintenance and release boundary

1. Verify the current Administration Center interface and server-side policy
   before changing this document.
2. Keep internal instructions aligned with the actual authorization model.
3. Record intentional behavior changes and affected roles explicitly.
4. Do not add credentials, private member records, production identifiers, or
   secret-bearing URLs.
5. Keep the Help Desk route and data namespace protected by the Worker.
6. Run the Help Center separation regression after changes.
7. Treat Administration Center, authentication, moderation, security, and
   application changes as higher-impact than ordinary public documentation.
8. Update [`TPI-INTERNAL-POLICIES.md`](TPI-INTERNAL-POLICIES.md), the relevant
   Help Desk article, and the bug/repair record together when a policy or
   operational behavior changes.

The internal UI data currently lives in `internal-help-center-data.js` and is
rendered by the shared Help Center shell only after the internal audience gate
has passed. This Markdown file is the operational reference; it does not grant
access and must never be used to bypass the server.
