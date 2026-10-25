# STUDIOFLOW HISTORICAL RECOVERY AND PRODUCTION COMPLETION

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-20 20:32.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

====================================================================
THE PARANORMAL INITIATIVE
STUDIOFLOW HISTORICAL RECOVERY AND PRODUCTION COMPLETION
====================================================================

PRIORITY: CRITICAL
TARGET: EXISTING PRODUCTION STUDIOFLOW
WEBSITE: https://paranormalinitiative.com/studio/

CANONICAL REPOSITORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

BRANCH:
codex/tpi-development

====================================================================
1. OBJECTIVE
====================================================================

Restore and complete StudioFlow using the original historical
development directives.

The project owner has confirmed that the final StudioFlow
development conversations contain the most recent refinements
to the system.

These requirements must be recovered and compared against
the existing production implementation.

IMPORTANT:

StudioFlow already contains substantial working functionality.

DO NOT rebuild StudioFlow.

DO NOT replace the existing production application.

DO NOT create another development website.

DO NOT begin a new StudioFlow architecture.

We are completing the existing application using the
requirements we already established.

====================================================================
2. HISTORICAL REFERENCE LIBRARY
====================================================================

Use the historical archive established by TPI-MASTER-002.

LOCATION:

docs/TPI-MASTER-DEVELOPMENT/HISTORICAL-SOURCES/

Consult:

- Unified historical master.
- Original development conversations.
- Original StudioFlow directives.
- Subsequent amendments.
- Final development-site directives.
- Implementation reports.
- StudioFlow historical handoffs.
- Existing master directive register.

Search the entire StudioFlow history.

PAY SPECIAL ATTENTION TO THE FINAL STUDIOFLOW DIRECTIVES
NEAR THE END OF THE HISTORICAL CONVERSATIONS.

These later directives are especially important because
they describe the functionality refined during the final
development-site sessions.

Do not assume every late directive supersedes every
earlier requirement.

Recover the original requirement, its amendments,
and its final authorized form.

Record exact directive IDs and source locations.

====================================================================
3. RECOVER THE FINAL STUDIOFLOW REQUIREMENTS
====================================================================

Search for all requirements involving:

MY STUDIOS

- Creating studios.
- Independent studio identities.
- Studio numbering.
- Studio naming.
- Studio dropdown.
- Automatic studio registration.
- Automatic studio saving.
- Switching between studios.
- Opening the selected studio directly.
- Restoring the selected studio after refresh.
- Independent studio configurations.
- Independent workspaces.
- Independent media and scenes.
- Renaming studios.
- Duplicating studios.
- Deleting studios.
- Restoring studios.

STREAMYARD-INSPIRED FUNCTIONALITY

- Brand-style studio organization.
- Studio-specific settings.
- Studio-specific media.
- Studio-specific visual identity.
- Any owner-approved behavior discussed in comparison
  with StreamYard.

SCENES AND WORKSPACES

- Scene creation.
- Scene selection.
- Scene persistence.
- Background assignments.
- Motion backgrounds.
- Image backgrounds.
- Video backgrounds.
- Workspace layout.
- Scene switching.
- Saving and restoring scenes.

MEDIA MANAGEMENT

- Uploading images.
- Uploading audio.
- Uploading video.
- Motion backgrounds.
- Media libraries.
- Asset assignment.
- Asset replacement.
- Asset removal.
- Media deletion.
- Media persistence.
- Storage synchronization.

STUDIOFLOW CONTROLS

- Existing camera and microphone controls.
- Recording.
- Existing production controls.
- Creator integrations.
- Previously authorized interface refinements.

Recover all relevant historical directives and amendments.

Do not introduce functionality that was never authorized.

====================================================================
4. COMPARE DEVELOPMENT HISTORY WITH PRODUCTION
====================================================================

Inspect the existing production StudioFlow source.

Compare the final historically authorized behavior
against the current production implementation.

For every requirement, identify:

A. Original directive.

B. Latest applicable amendment.

C. Whether it was implemented on the development site.

D. Whether equivalent code exists in the canonical
   production repository.

E. Whether the feature is deployed.

F. Whether the feature works in live Firefox.

G. Whether the feature needs a repair.

H. Whether the feature is already working correctly.

Do not copy old development-site code blindly.

Some development functionality may already have been
integrated or improved in production.

Preserve newer working production behavior.

Use the final development directives as the historical
functional reference, not as authorization to overwrite
newer production improvements.

====================================================================
5. MY STUDIOS — CRITICAL PRIORITY
====================================================================

Investigate the current My Studios implementation.

The owner reports:

- Crossroads of the Unknown appears as the editor title.
- Crossroads is missing from the My Studios dropdown.
- The displayed workspace may belong to another studio.
- Previously assigned media/backgrounds may not appear
  under the correct studio identity.

Determine the actual studio identity, workspace identity,
and registry source.

Compare against the historical My Studios requirements.

Restore the authorized behavior:

Each studio must have its own persistent identity,
workspace, scenes, media assignments, and configuration.

Switching studios must save the current studio and
directly open the selected studio.

The dropdown must reflect the correct studios.

Do not create duplicate owner studios.

Do not overwrite or reassign Crossroads content.

If safe repair is blocked by unverified owner identity,
report the exact blocker and continue with independent,
non-destructive tasks.

====================================================================
6. MOTION BACKGROUND DELETION DEFECT
====================================================================

The owner reports:

A motion background was deleted.

The deletion appeared to succeed.

However, the deleted background remained visible in
the StudioFlow workspace.

The background disappeared only after another motion
background was assigned.

THIS IS A CONFIRMED OWNER-REPORTED DEFECT.

Investigate the complete deletion and rendering flow.

Determine whether the defect involves:

- Media-library state.
- Active scene assignment.
- Workspace rendering.
- Cached asset references.
- Persisted scene configuration.
- Browser-local state.
- Server-backed state.
- Deletion event handling.
- UI synchronization.

Recover the historical deletion requirements before
implementing changes.

EXPECTED BEHAVIOR:

When a user removes a background from the active scene,
the background must disappear from the scene immediately.

When a user deletes an asset from the studio media library,
the UI must not continue displaying a stale deleted asset.

If an asset is still assigned to a scene, the system must
follow the historically authorized deletion policy.

If the historical policy is unclear, report the ambiguity
rather than inventing destructive behavior.

Deleting an asset must not silently delete unrelated
studio content.

The editor must accurately reflect the saved state.

Test:

1. Assign a motion background.
2. Remove it from the scene.
3. Verify immediate visual removal.
4. Refresh.
5. Verify it remains removed.
6. Reopen the studio.
7. Verify it remains removed.
8. Delete a disposable media asset.
9. Verify the appropriate UI and storage behavior.
10. Verify no stale scene references remain.

Use disposable acceptance studios and assets.

DO NOT delete the owner's Crossroads media.

====================================================================
7. OTHER MEDIA AND SCENE REGRESSIONS
====================================================================

Using the historical requirements, verify:

- Uploaded media appears in the correct studio.
- Media remains available after refresh.
- Scenes retain their assigned backgrounds.
- Switching studios does not exchange media.
- Deleting an assignment updates the workspace.
- Replacing media updates the workspace.
- Removing media does not leave a stale preview.
- Scene changes persist correctly.
- Studio switching does not overwrite scene state.

Repair verified defects without disturbing
unrelated working functionality.

====================================================================
8. PRODUCTION-ONLY DEVELOPMENT POLICY
====================================================================

There is ONE authoritative TPI website implementation.

The existing production website repository is the
sole implementation target.

Do not maintain a separate deployed development website.

Do not create a competing StudioFlow implementation.

Make source changes only in the canonical repository.

Use local tests and disposable acceptance studios
to validate changes before guarded deployment.

Do not experiment with owner data.

Do not promote an older development-site snapshot
over newer working production code.

====================================================================
9. DATA PROTECTION
====================================================================

Protect:

- Crossroads of the Unknown.
- All existing studios.
- All owner-uploaded media.
- All scenes and configurations.
- Browser-local studio records.
- Cloudflare D1 records.
- Cloudflare R2 objects.
- Authentication and account records.

Do not:

- Clear browser storage.
- Reset studios.
- Delete owner media.
- Recreate Crossroads.
- Import synthetic data into owner studios.
- Run blind database migrations.
- Overwrite existing owner scenes.
- Perform destructive owner-data testing.

Use disposable acceptance studios.

If a change requires destructive owner-data operations,
stop that specific operation and request authorization.

====================================================================
10. IMPLEMENTATION AND VERIFICATION
====================================================================

After completing the historical comparison:

Identify the smallest safe repairs needed.

Implement those repairs in the existing production
repository.

Run focused regression tests.

Use Firefox Developer Edition for browser acceptance.

Verify the actual live StudioFlow application.

Check:

- My Studios.
- Studio switching.
- Independent workspaces.
- Media uploads.
- Background assignment.
- Background removal.
- Media deletion.
- Scene persistence.
- Refresh persistence.
- Reopening persistence.

Preserve unrelated dirty working-tree changes.

Review deployment scope.

Deploy verified repairs through the established
guarded production process.

Do not deploy unverified or destructive changes.

If one feature remains blocked, continue with other
independent safe repairs.

====================================================================
11. REQUIRED REPORT
====================================================================

Provide:

1. Final historical StudioFlow directive chronology.

2. Exact original directive references.

3. Latest authorized requirements.

4. Development-site implementation history.

5. Current production implementation comparison.

6. Working features that were preserved.

7. Missing functionality.

8. Verified regressions.

9. My Studios findings.

10. Crossroads identity findings.

11. Motion-background deletion root cause.

12. Repairs completed.

13. Regression test results.

14. Live Firefox acceptance results.

15. Production deployment result and Worker version.

16. Remaining blockers.

17. Final completion status.

Do not mark StudioFlow complete while known
critical regressions remain unresolved.

====================================================================
FINAL INSTRUCTION
====================================================================

SEARCH THE ORIGINAL STUDIOFLOW DEVELOPMENT HISTORY.

PRIORITIZE THE FINAL DEVELOPMENT CONVERSATIONS.

RECOVER THE FUNCTIONALITY WE ALREADY DESIGNED.

COMPARE IT AGAINST THE EXISTING PRODUCTION SITE.

PRESERVE WHAT ALREADY WORKS.

REPAIR WHAT IS MISSING OR BROKEN.

VERIFY THE REPAIRS ON THE LIVE WEBSITE.

DO NOT REBUILD STUDIOFLOW.

DO NOT CREATE ANOTHER DEVELOPMENT WEBSITE.

DO NOT DISTURB OWNER DATA.

====================================================================
END DIRECTIVE
====================================================================
