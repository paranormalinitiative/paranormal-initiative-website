# TPI STUDIOFLOW — CROSSROADS SAVE FAILURE

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-20 21:40.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

====================================================================
TPI STUDIOFLOW — CROSSROADS SAVE FAILURE
AND MY STUDIOS SWITCHING BLOCKER
====================================================================

PRIORITY: CRITICAL

CURRENT PRODUCTION WORKER:
55f865aa-68f4-48b5-bcab-29b878bc4c42

====================================================================
CONFIRMED OWNER-REPORTED FAILURE
====================================================================

The owner is working in:

CROSSROADS OF THE UNKNOWN

When selecting another studio from My Studios,
StudioFlow displays:

"The current studio could not be saved.
It remains active. Retry the save before switching."

The owner reports that saving is not yet properly
connected for this studio.

Previous disposable Studio A/B switching tests passed,
but they did not cover this browser-local Crossroads case.

DO NOT REPORT MY STUDIOS COMPLETE.

====================================================================
1. SEARCH ORIGINAL DIRECTIVES
====================================================================

Search the complete TPI Master Directive Archive,
not just the current implementation documents.

Find all original requirements concerning:

- Automatic studio saving
- Browser-local studio persistence
- Server-backed studio persistence
- Save before switching
- Independent studio workspaces
- My Studios
- Save status
- Studio recovery
- Local storage
- Save destinations
- Storage-location selection

Prioritize:

TPI-STUDIOFLOW-012 ADDENDUM B
TPI-STUDIOFLOW-017
TPI-STUDIOFLOW-023
TPI-STUDIOFLOW-024 THROUGH 033
TPI-STUDIOFLOW-048 THROUGH 050
TPI-DEV-037
TPI-STUDIOFLOW-079

Find the original implementation reports and
existing development source code.

Identify which saving functionality was actually
implemented and which parts reached production.

====================================================================
2. INVESTIGATE ACTUAL CROSSROADS
====================================================================

Use the authenticated Firefox Developer Edition session.

Known browser-local broadcast ID:

broadcast-1792538987396

Crossroads currently has no verified server workspace ID.

Inspect the exact failing save operation.

Determine:

- Which save function is called?
- What data is being saved?
- Where is it supposed to be saved?
- Does it require a server workspace ID?
- Does the browser-local save mechanism still work?
- Is the save failing because Crossroads is not
  registered in the server workspace registry?
- Is the application reporting a failure even when
  browser-local persistence succeeds?
- Is a network request failing?
- Is there an identity mismatch?

Capture the actual error and relevant call path.

Do not assume the cause.

====================================================================
3. PRESERVE CROSSROADS
====================================================================

DO NOT:

- Delete or recreate Crossroads.
- Rename its studio identity.
- Assign it to Acceptance Studio A or B.
- Replace its scenes or media.
- Clear localStorage or IndexedDB.
- Migrate it to D1 or R2.
- Upload or replace its motion background.
- Bypass the save-before-switch protection.

Do not perform destructive tests on Crossroads.

====================================================================
4. DETERMINE THE CORRECT SAVE CONTRACT
====================================================================

The historical design requires:

- Independent studios.
- Automatic saving.
- Direct studio switching.
- Reliable restoration.
- No loss of studio data.

Determine how the existing architecture should
safely save a browser-local studio before switching
to a server-backed studio.

Distinguish between:

A. Saving studio configuration.

B. Saving scene and media references.

C. Preserving browser-local media blobs.

D. Server workspace persistence.

E. Exporting recordings to user-selected storage.

These are not necessarily the same operation.

Do not introduce a new cloud-storage system as
a workaround for this save failure.

====================================================================
5. SAFE REPAIR
====================================================================

Once the exact cause is established:

Repair the smallest verified defect in the
existing save/switch integration.

Preserve fail-closed behavior if persistence
cannot be confirmed.

Do not treat a localStorage write alone as proof
that all Crossroads data is safely persisted.

Do not perform owner-data migration without
explicit authorization.

If the required repair cannot be completed without
migrating Crossroads, STOP and report the exact
migration proposal for owner approval.

====================================================================
6. VERIFICATION
====================================================================

Test the repaired behavior with disposable
browser-local and server-backed studios first.

Verify:

- Local studio save succeeds.
- Scenes and settings persist.
- Media blobs remain available.
- Switching to another studio succeeds.
- Returning restores the original studio.
- Refresh preserves the correct studio.
- No cross-studio data contamination.
- Save failures still prevent unsafe switching.

After disposable tests pass, inspect Crossroads
without modifying its content.

Do not claim Crossroads switching is verified
unless the actual owner workflow is safely tested.

====================================================================
7. DEPLOYMENT
====================================================================

If the repair is proven safe and does not require
owner-data migration:

Run focused regressions.

Use the existing guarded production deployment.

Preserve unrelated worktree changes.

Verify the deployed version and live behavior.

If Crossroads switching requires an owner-data
migration or other owner-data changes, do not
deploy that portion without approval.

====================================================================
REQUIRED REPORT
====================================================================

1. Exact historical saving directives.
2. Existing saving implementation.
3. Actual Crossroads save error.
4. Root cause.
5. Whether local persistence is functioning.
6. Whether server identity is required.
7. Smallest safe repair.
8. Files changed.
9. Tests performed.
10. Live Firefox results.
11. Crossroads preservation confirmation.
12. Deployment version or remaining blocker.

====================================================================
END DIRECTIVE
====================================================================
