# STUDIOFLOW — RESTORE REACT STUDIO SWITCHING

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-20 21:23.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

====================================================================
THE PARANORMAL INITIATIVE
STUDIOFLOW — RESTORE REACT STUDIO SWITCHING
====================================================================

PRIORITY: CRITICAL
TARGET: EXISTING PRODUCTION STUDIOFLOW

CANONICAL REPOSITORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

====================================================================
OBJECTIVE
====================================================================

Implement the smallest safe repair identified in the
completed My Studios historical audit.

The root cause has been established:

The My Studios bridge changes selectedWorkspace and
localStorage, but the compiled StudioFlow React application
retains its previous activeBroadcastId state.

As a result, the selector changes while the editor
continues displaying the previous studio.

Restore the originally authorized switching workflow.

====================================================================
1. HISTORICAL AUTHORITY
====================================================================

Follow the original requirements established in:

TPI-STUDIOFLOW-012 ADDENDUM B
TPI-STUDIOFLOW-014
TPI-STUDIOFLOW-017
TPI-STUDIOFLOW-023
TPI-DEV-037

Also respect subsequent applicable identity and
persistence protections.

Consult the master historical archive and recovered
My Studios specification.

Do not redesign the feature.

====================================================================
2. REQUIRED REPAIR
====================================================================

Implement a reliable synchronization mechanism between:

- My Studios selectedWorkspace.
- StudioFlow activeBroadcastId.
- The actual React editor workspace.
- The displayed studio name.
- The active scene and its media.

The synchronization must update the actual application
state, not merely localStorage or the dropdown.

Preserve the original save-before-switch behavior.

Do not report a successful switch until the selected
studio is actually active in the editor.

Do not use an arbitrary timeout as proof of completion.

Use the smallest safe integration mechanism supported
by the existing architecture.

Do not edit generated bundles manually when the
maintained source and build process are available.

====================================================================
3. EXPECTED BEHAVIOR
====================================================================

When Studio A is open and the user selects Studio B:

1. Save Studio A completely.
2. Confirm the save succeeded.
3. Activate Studio B in the React application.
4. Load Studio B's workspace.
5. Restore Studio B's scenes, media, and configuration.
6. Update the editor title to Studio B.
7. Update the My Studios selector to Studio B.
8. Confirm all visible content belongs to Studio B.

When switching back to Studio A, perform the same
process in reverse.

If saving or switching fails:

- Do not report success.
- Do not silently show the wrong studio.
- Preserve the previous valid workspace.
- Display an accurate failure state.

====================================================================
4. CROSSROADS PROTECTION
====================================================================

Crossroads of the Unknown remains browser-local.

Known local broadcast ID:

broadcast-1792538987396

Do not attach Crossroads to Studio A or B.

Do not create a duplicate Crossroads studio.

Do not migrate Crossroads data.

Do not modify its scenes, media, or configurations.

Preserve the existing identity protections.

Any owner-data migration requires separate authorization.

====================================================================
5. VERIFICATION
====================================================================

Test with disposable studios.

Verify:

- Studio A to Studio B.
- Studio B to Studio A.
- Automatic save before switching.
- Correct React activeBroadcastId.
- Correct editor title.
- Correct workspace content.
- Correct active scene.
- Independent backgrounds and media.
- Persistence after refresh.
- Last-studio restoration.
- No cross-studio contamination.

Confirm existing Intro and Outro behavior remains intact.

Confirm motion-background playback remains functional.

Run all relevant StudioFlow regression tests.

====================================================================
6. PRODUCTION DEPLOYMENT
====================================================================

Use the canonical production repository.

Preserve unrelated dirty worktree changes.

Do not create another development website.

Do not modify Admin Center, Community, or Live Bridge.

Review the exact deployment package.

Deploy only after passing tests through the existing
production guard.

Do not bypass deployment protection.

Verify the new Worker version.

Perform live Firefox acceptance after deployment.

====================================================================
7. REQUIRED REPORT
====================================================================

Report:

- Exact synchronization defect repaired.
- Files changed.
- Historical directives satisfied.
- Test results.
- Live Studio A/B switching results.
- Editor title and workspace verification.
- Crossroads preservation confirmation.
- Deployment status.
- New Worker version.
- Remaining blockers.

Do not declare COMPLETE unless actual live studio
switching works in both directions.

====================================================================
END DIRECTIVE
====================================================================
