# CRITICAL STUDIO INTERFACE FLICKERING / RELOAD LOOP

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 15:22.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
TPI-STUDIOFLOW-050
CRITICAL STUDIO INTERFACE FLICKERING / RELOAD LOOP
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

PRIMARY REPOSITORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

STUDIOFLOW SOURCE:
/Users/toddknipple/Documents/StudioFlow/web

PRIORITY:
CRITICAL

AUTHORITY:
FULL AUTONOMOUS LOCAL INVESTIGATION AND REPAIR

PRODUCTION DEPLOYMENT:
NOT AUTHORIZED

=====================================================================
1. REPORTED PROBLEM
=====================================================================

The owner opened StudioFlow in Opera at:

http://localhost:8787/studio/

The StudioFlow interface began rapidly flashing,
disappearing, and reappearing.

The behavior is severe and continuous.

The owner describes it as:

"The studio is glitching in and out, in and out
really fast."

This occurred following recent changes involving:

- TPI-STUDIOFLOW-043 asset staging/cache-busting.
- TPI-STUDIOFLOW-045 guest audio.
- TPI-STUDIOFLOW-047 integration.
- TPI-STUDIOFLOW-048 project persistence.

TPI-STUDIOFLOW-049 may also be relevant if its
implementation has already begun.

Do not assume which change caused the problem.

=====================================================================
2. IMMEDIATE OBJECTIVE
=====================================================================

Identify and eliminate the rapid StudioFlow
flickering/reloading behavior.

The application must remain visually stable.

The studio must not repeatedly mount, unmount,
navigate, reload, or reset itself.

Do not redesign the interface.

Do not modify unrelated functionality.

=====================================================================
3. INVESTIGATE THE ACTUAL FAILURE
=====================================================================

Determine whether the flickering is caused by:

A. FULL PAGE RELOAD LOOP

- Repeated navigation.
- Window.location changes.
- Reload calls.
- Authentication redirects.
- Service Worker behavior.

B. REACT RENDER LOOP

- Repeated state updates.
- useEffect dependency loops.
- Component remounting.
- Unstable state synchronization.

C. PROJECT PERSISTENCE LOOP

- Autosave triggering reload.
- Project load triggering save.
- Save responses triggering another load.
- Version conflicts.
- Dirty-state synchronization errors.

D. ASSET DELIVERY LOOP

- File watcher repeatedly staging assets.
- Staging changes triggering another watcher event.
- Worker serving inconsistent assets.
- HTML or JavaScript version mismatch.

E. CONNECTION RECONNECTION LOOP

- Room server reconnection.
- Guest gateway retries.
- WebRTC state changes.
- Repeated participant initialization.

F. VISUAL RENDERING FAILURE

- CSS animation or visibility changes.
- Repeated layout reconstruction.
- Camera preview initialization.
- Graphics acceleration or media rendering.

Use evidence to identify the actual cause.

=====================================================================
4. BROWSER DIAGNOSTICS
=====================================================================

Use an isolated local browser session to reproduce.

Inspect:

- Browser console errors.
- Network requests.
- Navigation events.
- React component lifecycle.
- Project load/save requests.
- Authentication redirects.
- Asset requests.
- Room connection events.

Determine whether the document itself reloads
or whether only the StudioFlow interface rerenders.

Do not clear the owner's Opera storage.

Do not reset authentication credentials.

Do not modify owner browser settings.

=====================================================================
5. PROTECT OWNER DATA
=====================================================================

PROTECTED STUDIO:
Crossroads of the Unknown

WORKSPACE:
43b20614-69da-4d82-af9d-063cace4b6cc

BROADCAST:
studio-0ec3848f-5500-462c-a1da-f711d3148d49

DO NOT:

- Reset local D1.
- Delete studios.
- Delete scenes.
- Delete media.
- Delete recordings.
- Clear browser storage.
- Restore old backups.
- Overwrite owner configurations.

Use synthetic test projects.

=====================================================================
6. IMPLEMENT THE FIX
=====================================================================

Once the root cause is identified:

- Implement the smallest reliable repair.
- Preserve project saving.
- Preserve autosave.
- Preserve project switching.
- Preserve guest audio routing.
- Preserve Room Bridge functionality.
- Preserve backgrounds and motion backgrounds.
- Preserve current layout.

Do not disable essential features merely to hide
the flickering.

Do not introduce another cache-busting workaround.

=====================================================================
7. TESTING
=====================================================================

Verify:

1. StudioFlow loads successfully.
2. No continuous flashing occurs.
3. No repeated page navigation occurs.
4. No React render loop occurs.
5. No continuous project load/save loop occurs.
6. No repeated authentication redirects occur.
7. No asset watcher loop occurs.
8. No repeated room reconnection loop occurs.
9. Studio selection remains stable.
10. Save Project remains functional.
11. Autosave remains functional.
12. Guest waiting room remains functional.
13. Camera preview remains stable.
14. Backgrounds remain functional.
15. Motion backgrounds remain functional.

Observe the application continuously for at least
60 seconds in an isolated browser.

Do not declare success based only on syntax checks.

=====================================================================
8. LOCAL DEVELOPMENT SERVICES
=====================================================================

Codex may:

- Inspect the existing Worker on port 8787.
- Inspect the room server on port 8788.
- Inspect the guest gateway on port 8789.
- Inspect the local asset watcher.
- Restart existing local services if required.
- Repair confirmed local configuration defects.

Do not create duplicate services.

Do not change the temporary guest tunnel.

=====================================================================
9. DOCUMENTATION
=====================================================================

Document:

- Root cause.
- Affected components.
- Repair.
- Regression tests.
- Verification results.

Update relevant Markdown development records.

=====================================================================
10. AUTHORITY
=====================================================================

Codex has full authority to investigate, repair,
test, and document this issue locally.

Do not stop for routine engineering approval.

Stop only if the repair would require:

- Destructive owner-data operations.
- Production deployment.
- Production configuration changes.
- Backup restoration.
- Changes outside the approved scope.

=====================================================================
11. HARD RESTRICTIONS
=====================================================================

NO production deployment.
NO Cloudflare production writes.
NO database reset.
NO browser storage clearing.
NO owner media deletion.
NO recording deletion.
NO backup restoration.
NO Git commit.
NO Git push.

Preserve existing working-tree changes.

=====================================================================
12. REQUIRED FINAL REPORT
=====================================================================

TPI-STUDIOFLOW-050 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. CONFIRMED ROOT CAUSE

B. AFFECTED COMPONENTS

C. REPAIR IMPLEMENTED

D. BROWSER VERIFICATION

E. TEST RESULTS

F. FILES MODIFIED

G. DATA PROTECTION

H. REMAINING LIMITATIONS

=====================================================================
FINAL INSTRUCTION
=====================================================================

The owner reports severe, rapid StudioFlow
interface flickering.

Find the actual cause and correct it.

Do not assume caching is responsible.

Do not declare the problem fixed until browser
behavior has been verified.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-050
=====================================================================
