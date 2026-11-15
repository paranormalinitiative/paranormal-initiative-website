# The Paranormal Initiative — Internal Policies

**Audience:** Owner, Founder/CEO, authorized administrators, moderators, and
other credentialed staff with an active server-side appointment  
**Owner:** The Paranormal Initiative  
**Status:** Active internal policy reference  
**Effective date:** 2026-11-15  
**Review cadence:** Review when a protected behavior, role boundary, or policy
source changes; otherwise review at least quarterly.

## What this document does

This is the internal policy companion to
[`TPI-INTERNAL-HELP-DESK.md`](TPI-INTERNAL-HELP-DESK.md). The policy reference
answers **what is allowed, what is protected, and what must be escalated**. The
Help Desk answers **how to use the currently available interface**. Server-side
authorization and the current production behavior remain the final authority.

This document does not grant access, create a role, authorize a data change, or
make an unfinished Administration Center feature available.

## Policy hierarchy

Use the following order when sources appear to disagree:

1. The server-side authorization and safety boundary.
2. The current approved TPI interface and its supported workflow.
3. This active policy reference and the active Internal Help Desk.
4. A dated completion record, audit, or bug/repair record for historical
   context.
5. A proposal or future-work document, which is not an instruction to act.

If the current interface, server response, and documentation do not agree,
stop the action, preserve the safe evidence, and escalate. Do not choose the
most permissive interpretation.

## 1. Access and authority

- The Owner/Founder/CEO has the highest operational authority.
- Staff access is resolved server-side from the signed-in account and its
  active appointment or supported legacy role. A display title, badge,
  membership, honor, or client-side label never grants authority.
- Every staff member uses their own approved account. Shared credentials,
  copied sessions, direct-URL bypasses, and browser-storage permission edits are
  prohibited.
- Use the smallest capability that can complete the task. A person authorized
  for moderation is not automatically authorized for staff appointments,
  security settings, Founding Membership, private member records, or
  application administration.
- If a control is missing, treat that as an authorization or availability
  question first. Do not try another account or ask a member to expose private
  information to work around it.

## 2. Member privacy and data minimization

- Access member records only for a defined operational purpose.
- Review and share the minimum necessary field, image, message, or identifier.
- Do not place passwords, recovery codes, session cookies, API tokens, stream
  keys, private URLs, private messages, exact residential addresses, or member
  exports in Help Desk notes, screenshots, chat, commits, or release records.
- Before sharing a screenshot, check every visible tab, notification, message,
  address, token, and member record. Redact or omit anything unnecessary.
- Report accidental disclosure immediately. Do not delete evidence or silently
  rewrite the record.

## 3. Community standards and moderation

- Apply community standards consistently regardless of Founder, Board,
  Founding, Creator, Contributor, member, or staff status.
- Criticism of TPI, its leadership, a belief, or an investigation is not by
  itself a moderation violation.
- Review a report as an allegation or signal, not automatic proof.
- Separate content visibility, report status, member-to-member blocking,
  account blocking, temporary restriction, and staff appointment actions. They
  are different decisions with different authority requirements.
- Recuse and escalate when a personal relationship, financial interest, or
  other conflict could affect the decision.
- Threats, doxxing, credible immediate danger, or matters outside TPI’s role
  require appropriate safety or emergency escalation. TPI is not an emergency
  service.

## 4. Reports, restrictions, and appeals

The current system supports the implemented report and moderation workflows
documented in the Help Desk. A complete report-triage queue, warning and
temporary-restriction workflow, staff suspension workflow, and formal appeals
surface are not yet available as a complete product.

Until those surfaces are implemented and verified:

- Do not promise a member a specific appeal status, review deadline, or
  restriction type that the interface does not show.
- Record the safe report reference, concern, date/time, and next owner when an
  appeal or unresolved restriction question is received.
- Do not invent a manual database status or use an unrelated account action as
  a substitute for an unavailable workflow.
- Escalate unresolved policy decisions to the authorized owner or designated
  decision-maker.

## 5. Member accounts and role boundaries

- `Block Member` deactivates an account so it cannot log in or post until an
  authorized person restores it. It is stronger than hiding one item.
- Do not block your own account. Confirm target, authority, reason, and result
  before and after an account action.
- `Unblock / Restore Member` is used only when the documented restoration
  condition and authority are clear.
- Staff appointments are separate from membership, Contributor/Creator
  capabilities, Founding Membership, honors, and profile titles.
- Owner and Executive authority is broader than Administrator and Moderator
  authority. The server-side role matrix, not a visible menu, controls the
  action.

## 6. Content, editorial, and publishing

- Keep drafts, review decisions, approved snapshots, and public publication
  distinct.
- Editorial review does not equal publication. Publish only the exact approved
  version when the account has the required capability.
- Check privacy, consent, evidence-aware language, metadata, destination, and
  policy fit before publishing.
- Do not paste replacement HTML, publish stale content, or use a general member
  action to solve an editorial or event-record problem.

## 7. Protected applications and release boundaries

StudioFlow, Nova Editor Workspace, Creator Studio, and other explicitly stable
applications are protected from unrelated website and Administration Center
work.

- A Help Desk, policy, navigation, profile, feed, or ordinary Admin Center
  change must not modify, rebuild unnecessarily, or replace protected
  application bytes.
- An application change is authorized only when the task explicitly concerns
  that application and the relevant source-to-live workflow is followed.
- Shared authentication, Worker, binding, migration, dependency, or release
  tooling changes may affect more than one surface and require the broader
  verification profile.
- The release process must classify the change, run the smallest safe relevant
  checks, compare protected application bytes, and fail closed on unexpected
  changes.
- Never manually copy an old generated bundle or edit a hashed application
  asset to make a check pass. Use the maintained source and staging workflow.

## 8. Security and incident response

When credentials, private data, authorization, or a protected route may be
compromised:

1. Stop the action and do not continue probing the boundary.
2. Preserve the date/time, route, visible result, request ID, browser, and
   other safe context.
3. Sign out of an exposed session when appropriate, without copying its
   credentials or tokens.
4. Notify the authorized incident owner through the internal escalation path.
5. Follow approved containment instructions.

Do not delete production D1 rows, R2 objects, Studios, recordings, Crossroads
of the Unknown data, or audit evidence as an improvised fix. Do not rotate
secrets, change roles, or publish an incident explanation without the
authorized incident owner’s direction.

## 9. Bug, repair, and release records

Every meaningful repair should be recorded in the maintained bug/repair
reference and, when appropriate, a dated completion record. Include:

- date, time, and time zone;
- reporter and affected audience, without unnecessary private data;
- environment, browser/device, route, and visible symptom;
- scope and what was checked;
- confirmed cause or clearly labeled working hypothesis;
- exact fix and intentional behavior changes;
- focused and regression verification evidence;
- deployment or rollback result, if applicable; and
- the safeguard that should prevent recurrence.

Use precise language such as **deployed and live verified**, **local only**,
**blocked**, or **not yet implemented**. “Fixed” alone is not an adequate
operational record.

## 10. Documentation and future assistants

- Public Member Help Center content is safe for members and for Mystic’s public
  knowledge boundary.
- Internal Help Desk and policy content is protected and must not be loaded by
  the public Mystic assistant.
- NOVA is a future internal assistant boundary. It must not be connected to
  internal sources until this policy set, the Help Desk inventory, and the
  authenticated retrieval boundary are complete and tested.
- Every policy change updates its date, the relevant Help Desk article, and the
  bug/repair or completion record when behavior changed.

## Review checklist

Before marking a policy or procedure complete, confirm:

- the rule matches server-side authorization;
- the procedure exists in the current protected Help Desk interface;
- implemented and future behavior are clearly separated;
- public Mystic cannot retrieve the internal material;
- the change does not touch protected applications unnecessarily;
- the relevant regression check exists and passes; and
- the record identifies the date, time, evidence, owner, and next review.

