# Administration Center — Enforcement Action Review Gate

**Date:** 2026-11-15  
**Time zone:** America/New_York  
**Audience:** Authorized Administration Center staff  
**Status:** Source complete; guarded production release pending

## What was needed

The protected Enforcement & Appeals workflow already supported warnings,
temporary restrictions, revocation, appeals, required reasons, audit logging,
member notices, and server-side staff checks. Its new-action form, however,
submitted immediately when staff pressed the form button. That made it too easy
to record an action before reviewing the target, scope, duration, and reason.

## What was changed

- Changed the primary form action from immediate submission to **Review action**.
- Added a review state that displays the target username, action type, scope,
  duration, and reason before any write occurs.
- Added **Cancel** so staff can discard the review without a request or database
  change.
- Added the explicit **Confirm & record action** step as the only UI path that
  submits the protected mutation.
- Editing any reviewed field clears the pending review so the confirmation can
  never apply to stale form values.

## Safety preserved

The existing server boundary remains authoritative. Only authorized staff can
reach the route; staff accounts, the acting account, permanent bans, deletion,
private-message review, and protected applications remain outside this
workflow. Reasons remain required, temporary restrictions remain limited to
1–720 hours, and completed actions continue to write the audit record and
member notice through the existing server contract.

## Verification

- Administration Center source contracts: **91/91**.
- Administration Center production build: passed.
- Release-impact classifier: **15/15**.
- Release-safety contract: **37/37**.
- Local browser check showed the review state for `@BillH` and displayed
  **Confirm & record action** without submitting the action.
- No moderation action was created during the UI check.
- Protected StudioFlow, Creator Studio, Nova Workspace, private media, and
  owner data were not changed.

## Next step

Run the maintained release preflight, deploy only the exact certified
Administration Center candidate, and verify the review gate live in the Owner
session. Do not submit a real moderation action as part of acceptance.
