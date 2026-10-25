# FRESH-BROWSER SESSION & HOME PAGE FLICKERING

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-21 22:44.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
TPI-STUDIOFLOW-052
FRESH-BROWSER SESSION & HOME PAGE FLICKERING
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

PRIORITY:
CRITICAL — PRODUCTION RELEASE BLOCKER

AUTHORITY:
FULL AUTONOMOUS LOCAL INVESTIGATION AND REPAIR

=====================================================================
1. CONFIRMED OWNER OBSERVATION
=====================================================================

StudioFlow previously worked in Opera.

The owner cleared Opera cookies, browsing history,
and associated browser data.

Afterward, StudioFlow Home began rapidly flickering.

TPI-STUDIOFLOW-050 removed three document reload paths.

However, the owner has now confirmed:

THE FLICKERING CONTINUES.

Therefore, TPI-050 did not resolve the observed problem.

Do not mark this incident resolved.

=====================================================================
2. PRIMARY INVESTIGATION
=====================================================================

Investigate StudioFlow initialization when the
browser has:

- No previous authentication cookies.
- No saved workspace selection.
- No previous localStorage entries.
- No previous IndexedDB entries.
- No cached StudioFlow assets.

Use an isolated disposable browser profile.

DO NOT CLEAR THE OWNER'S OPERA DATA.

Determine whether missing browser state causes:

- Authentication loops.
- Workspace restoration loops.
- Repeated initialization.
- Route reconciliation loops.
- React component remounting.
- Repeated API requests.
- Repeated loading-state transitions.

Do not assume missing browser state is the cause.

=====================================================================
3. CAPTURE ACTUAL BROWSER EVIDENCE
=====================================================================

Before modifying source, capture:

- Browser console errors.
- Network request patterns.
- Authentication responses.
- Navigation events.
- Document reload counts.
- Component mount/unmount activity.
- Workspace initialization events.
- Repeated API calls.
- Relevant timestamps.

Determine exactly what is flickering.

Distinguish:

A. Full document reloads.
B. React application remounts.
C. Home page component rerenders.
D. CSS visibility changes.
E. Authentication redirects.
F. Workspace loading-state oscillation.

Identify the triggering event and its cause.

=====================================================================
4. AUTHENTICATION SAFETY
=====================================================================

Inspect how StudioFlow behaves when authentication
cookies are missing or expired.

Expected behavior:

- Show a stable authentication-required state.
- Allow legitimate reauthentication.
- Resume normal initialization after authentication.
- Never enter a visual or navigation loop.

Preserve existing authentication protections.

Do not bypass authentication.

Do not weaken the local Worker's 403 response.

Do not fabricate authentication credentials.

=====================================================================
5. WORKSPACE INITIALIZATION
=====================================================================

Inspect:

studio/workspace-bridge.js

And all related StudioFlow initialization code.

Verify that:

- Missing workspace selection is handled safely.
- Missing browser-local metadata is handled safely.
- Server-backed workspace records remain authoritative.
- Missing media does not cause initialization loops.
- Workspace selection does not repeatedly reset.
- Saving does not repeatedly trigger loading.
- Loading does not repeatedly trigger saving.

Do not automatically restore or overwrite owner data.

=====================================================================
6. PRODUCTION READINESS
=====================================================================

This is a release-blocking issue for:

TPI-STUDIOFLOW-051

Do not deploy StudioFlow while this issue persists.

A new visitor must be able to open StudioFlow
without existing browser data.

An existing user must be able to return after
clearing cookies and authenticate normally.

=====================================================================
7. IMPLEMENTATION
=====================================================================

After identifying the root cause:

- Implement the smallest reliable fix.
- Preserve autosave.
- Preserve project persistence.
- Preserve project switching.
- Preserve portable backups.
- Preserve recovery snapshots.
- Preserve guest functionality.
- Preserve current UI design.

Do not disable functionality merely to hide symptoms.

=====================================================================
8. REQUIRED VERIFICATION
=====================================================================

Test in an isolated browser profile:

TEST A:
Completely fresh browser state.

TEST B:
Unauthenticated StudioFlow access.

TEST C:
Authenticated StudioFlow access using legitimate
available test authentication.

TEST D:
Missing workspace selection.

TEST E:
Missing browser-local media.

TEST F:
Repeated page refresh.

TEST G:
Switching between Studios.

TEST H:
Saving a project.

TEST I:
Stable Home page for at least 120 seconds.

TEST J:
No repeated navigation, mount, or loading loop.

If authenticated testing is unavailable,
report that limitation explicitly.

Do not claim complete verification without it.

=====================================================================
9. DATA PROTECTION
=====================================================================

PROTECTED STUDIO:
Crossroads of the Unknown

WORKSPACE:
43b20614-69da-4d82-af9d-063cace4b6cc

DO NOT:

- Reset D1.
- Clear owner browser data.
- Delete media.
- Delete recordings.
- Restore backups.
- Modify Crossroads.
- Overwrite existing Studios.

Use synthetic test data only.

=====================================================================
10. PRODUCTION RESTRICTIONS
=====================================================================

NO production deployment.

NO production database changes.

NO Cloudflare configuration changes.

NO Git commit.

NO Git push.

TPI-STUDIOFLOW-051 remains blocked until the
flickering issue is resolved and verified.

=====================================================================
11. REQUIRED FINAL REPORT
=====================================================================

TPI-STUDIOFLOW-052 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. REPRODUCTION RESULTS

B. CONFIRMED ROOT CAUSE

C. BROWSER EVIDENCE

D. SOURCE REPAIR

E. FRESH-BROWSER VERIFICATION

F. AUTHENTICATION VERIFICATION

G. 120-SECOND STABILITY TEST

H. REGRESSION RESULTS

I. FILES MODIFIED

J. DATA PROTECTION

K. PRODUCTION RELEASE STATUS

L. REMAINING LIMITATIONS

=====================================================================
FINAL INSTRUCTION
=====================================================================

The owner confirms StudioFlow Home continues
flickering after TPI-STUDIOFLOW-050.

Investigate the actual browser behavior.

Prioritize missing-session and fresh-browser
initialization without assuming either is the cause.

Do not deploy until the issue is resolved.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-052
=====================================================================
