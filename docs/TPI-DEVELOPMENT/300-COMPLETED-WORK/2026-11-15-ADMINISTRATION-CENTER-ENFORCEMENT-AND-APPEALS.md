# Administration Center Enforcement and Appeals

**Date:** 2026-11-15  
**Status:** Source complete; guarded production release pending  
**Scope:** Administration Center and member Settings only

## What was added

The Administration Center now has an **Enforcement & Appeals** area for the
smallest useful moderation action after report triage:

- A warning for a non-staff member.
- A temporary restriction for posting, commenting, messaging, or all community
  activity.
- A required factual reason for every issued action.
- A server-enforced expiration between 1 and 720 hours.
- A revoke action that requires a reason and writes an audit record.
- A member-facing Settings panel showing warnings, restrictions, expiration,
  status, and appeal decisions.
- One open member appeal per active action.
- Staff review states of under review, accepted, and denied.
- A required reviewer response note.
- Acceptance of an appeal automatically revokes the linked active action.

## Safety boundaries

This is not a general-purpose ban or surveillance system. It does not add:

- Permanent bans.
- Staff suspension or staff-role changes.
- Content deletion.
- Private-message bodies or private conversation inspection.
- A client-side permission shortcut.
- Any change to StudioFlow, Creator Studio, Nova Editor Workspace, private
  media, or protected application deployment artifacts.

The server checks the effective staff role, refuses staff targets, refuses
self-targeting, validates scope/reason/duration, and records issue, revoke, and
appeal decisions in the existing administrative audit trail. If migration 0072
is not present in an environment, the read endpoints identify
`migration_pending` and the enforcement lookup fails closed without bypassing
existing capability checks.

## Data change

`migrations/0072_moderation_enforcement_and_appeals.sql` adds only:

- `member_moderation_actions`
- `moderation_appeals`
- Supporting indexes and one-open-appeal uniqueness

The maintained local schema verification applied the migration successfully.
No production member, report, message, recording, StudioFlow, Creator Studio,
Nova Editor Workspace, D1, R2, or Crossroads data was rewritten during source
verification.

## Verification before release

- Administration Center contract checks: **86/86**
- Release-safety checks: **37/37**
- Administration Center TypeScript/Vite build: passed
- Worker syntax check: passed
- Maintained local schema: migration 0072 **APPLIED**
- Protected-application source boundary: unchanged

The exact production migration, release identifier, Worker version, production
smoke, and live acceptance results must be appended here after the runbook's
guarded release completes.
