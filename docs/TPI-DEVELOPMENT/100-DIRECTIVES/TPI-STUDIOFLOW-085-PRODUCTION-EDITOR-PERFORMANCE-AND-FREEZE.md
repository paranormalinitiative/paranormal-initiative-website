# TPI-STUDIOFLOW-085 — PRODUCTION EDITOR PERFORMANCE AND FREEZE REPAIR

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-20 20:19.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

====================================================================
THE PARANORMAL INITIATIVE
DIRECTIVE TPI-STUDIOFLOW-085
PRODUCTION EDITOR PERFORMANCE AND FREEZE REPAIR
====================================================================

STATUS: AUTHORIZED
PRIORITY: CRITICAL
TARGET: LIVE PRODUCTION STUDIOFLOW

PRODUCTION:
https://paranormalinitiative.com/studio/

BROWSER:
Firefox Developer Edition

LATEST REPORTED WORKER:
17f9a096-0eb6-4c75-a889-71fb9a9d418d

Verify current deployment before making changes.

====================================================================
1. PRIMARY OBJECTIVE
====================================================================

StudioFlow is experiencing serious performance problems.

The owner reports:

- Firefox displays a slow-script warning.
- The editor becomes nearly unresponsive.
- Video playback becomes extremely slow.
- Background media cannot be uploaded reliably.
- Media deletion controls cannot be used reliably.
- Panels respond slowly or fail to open.
- The slowdown began BEFORE the attempted MP4 upload.

Identify and repair the underlying performance defects.

Do not assume the MP4 file caused the problem.

====================================================================
2. FIREFOX DEVELOPER TOOLS INVESTIGATION
====================================================================

Use Firefox Developer Edition's built-in developer tools.

Inspect:

- JavaScript execution.
- Console errors.
- Performance profiles.
- Long-running tasks.
- Mutation observers.
- Event listeners.
- Rendering loops.
- Repeated DOM updates.
- Autosave activity.
- Workspace hydration.
- Media preview processing.
- Video playback.
- Memory consumption.
- Network requests.

Capture the exact source of the slow-script warning.

Identify the responsible JavaScript file, function,
and execution path.

Do not guess.

====================================================================
3. INVESTIGATE REPEATED EXECUTION
====================================================================

Previous StudioFlow defects involved repeated DOM
reconciliation and unnecessary state updates.

Check whether similar problems remain.

Investigate:

- MutationObserver feedback loops.
- Recursive event dispatch.
- Repeated scene serialization.
- Duplicate event listeners.
- Excessive autosave requests.
- Repeated workspace hydration.
- Video preview reinitialization.
- Continuous DOM replacement.
- Unnecessary media element recreation.
- Repeated background assignment.

Apply idempotence guards and other targeted repairs
where supported by evidence.

Do not disable required functionality to hide the problem.

====================================================================
4. TEST VIDEO BACKGROUNDS
====================================================================

StudioFlow must support MP4 files used as:

- Intro videos.
- Animated scene backgrounds.
- Outro videos.

Using disposable test media and Acceptance Test A:

Verify:

- MP4 selection.
- Upload.
- Preview.
- Scene background assignment.
- Video playback.
- Looping where appropriate.
- Save and autosave.
- Refresh restoration.
- Studio switching.
- Media deletion controls.

Distinguish deleting a scene assignment from deleting
an uploaded media asset.

Do not delete existing owner media.

====================================================================
5. VERIFY EDITOR RESPONSIVENESS
====================================================================

Test:

- Opening StudioFlow.
- Entering a studio.
- Opening and closing panels.
- Switching scenes.
- Switching studios.
- Uploading media.
- Selecting media.
- Assigning backgrounds.
- Removing disposable assignments.
- Saving changes.
- Refreshing.
- Reopening studios.

The editor must remain responsive throughout.

Verify that video playback does not cause excessive
CPU usage or repeated scene reconstruction.

====================================================================
6. PROTECT CROSSROADS
====================================================================

The owner has created a new Crossroads of the Unknown
studio in Firefox Developer Edition.

THIS IS PRODUCTION OWNER DATA.

Do not:

- Delete Crossroads.
- Reset its workspace.
- Clear browser storage.
- Remove existing media.
- Replace scenes.
- Import synthetic backups.
- Overwrite its configuration.
- Recreate the studio.

Use disposable acceptance studios for mutation testing.

Inspect Crossroads only through non-destructive
diagnostic operations.

====================================================================
7. REPAIR AND DEPLOY
====================================================================

Identify the actual defects.

Repair the existing production implementation.

Use the smallest reliable changes.

Run focused regression tests.

Preserve:

- Image uploads.
- Audio uploads.
- Video uploads.
- D1/R2 persistence.
- Scene assignments.
- Autosave.
- Workspace isolation.
- My Studios switching.
- Scene hydration.
- Existing authentication.
- Live Bridge.

Review the exact deployment manifest.

Do not deploy unrelated dirty working-tree changes.

Deploy through the established guarded production process.

Verify the actual deployed Worker version.

====================================================================
8. LIVE PRODUCTION ACCEPTANCE
====================================================================

Using Firefox Developer Edition:

Repeat the previously failing workflows.

Confirm:

- No recurring slow-script warning.
- No sustained JavaScript execution loop.
- Panels open promptly.
- Scene switching remains responsive.
- Video previews play normally.
- MP4 background assignments work.
- Background videos persist after refresh.
- Media controls remain usable.
- Disposable media removal works.
- Autosave remains functional.

Use performance measurements and Firefox diagnostics
to support the results.

Do not report success based only on offline tests.

====================================================================
9. MANDATORY COMPLETION
====================================================================

FINISH WHAT YOU START.

Do not stop after identifying a performance problem.

Do not stop after changing JavaScript.

Do not stop after deployment.

Continue through live production verification.

If an external blocker prevents safe completion,
document the exact blocker and required owner action.

Never claim unverified functionality is complete.

====================================================================
10. REQUIRED REPORT
====================================================================

Provide:

A. ROOT CAUSE OF SLOW-SCRIPT WARNING
B. RESPONSIBLE FILES AND FUNCTIONS
C. PERFORMANCE MEASUREMENTS
D. FILES MODIFIED
E. REPAIRS IMPLEMENTED
F. DEPLOYED WORKER VERSION
G. EDITOR RESPONSIVENESS RESULT
H. MP4 BACKGROUND RESULT
I. VIDEO PLAYBACK RESULT
J. MEDIA REMOVAL RESULT
K. AUTOSAVE RESULT
L. REFRESH RESTORATION RESULT
M. REGRESSION TEST RESULTS
N. CROSSROADS DATA PROTECTION CONFIRMATION
O. REMAINING BLOCKERS
P. FINAL STATUS

====================================================================
FINAL ORDER
====================================================================

DIAGNOSE THE LIVE EDITOR PERFORMANCE PROBLEM.

REPAIR THE UNDERLYING CAUSE.

VERIFY MP4 BACKGROUND FUNCTIONALITY.

RESTORE RESPONSIVE EDITOR OPERATION.

PROTECT CROSSROADS OF THE UNKNOWN.

DEPLOY AND VERIFY THE REPAIR IN FIREFOX DEVELOPER EDITION.

FINISH THE DIRECTIVE.

====================================================================
END DIRECTIVE TPI-STUDIOFLOW-085
====================================================================
