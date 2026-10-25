# TPI-STUDIOFLOW-084 — PRODUCTION MEDIA VERIFICATION AND CROSSROADS ASSET PROTECTION

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-20 18:25.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

====================================================================
THE PARANORMAL INITIATIVE
DIRECTIVE TPI-STUDIOFLOW-084
PRODUCTION MEDIA VERIFICATION AND CROSSROADS ASSET PROTECTION
====================================================================

STATUS: AUTHORIZED
PRIORITY: CRITICAL
IMPLEMENTATION TARGET: LIVE PRODUCTION WEBSITE

PRODUCTION WEBSITE:
https://paranormalinitiative.com

PRODUCTION STUDIOFLOW:
https://paranormalinitiative.com/studio/

DESIGNATED DEVELOPMENT BROWSER:
Firefox Developer Edition

LATEST REPORTED PRODUCTION WORKER:
b8d85644-afd2-487e-b46b-2e698fa12deb

Verify the current deployment before proceeding.

====================================================================
1. PRIMARY OBJECTIVE
====================================================================

Complete the outstanding StudioFlow media acceptance requirements
before the owner begins uploading or reloading assets for the
Crossroads of the Unknown podcast.

The existing production website is the implementation target.

DO NOT use the separate StudioFlow development website.

DO NOT rebuild StudioFlow.

DO NOT modify Crossroads of the Unknown.

The objective is to establish that StudioFlow can reliably upload,
store, retrieve, display, and preserve media assets.

====================================================================
2. PRESERVE EXISTING FUNCTIONALITY
====================================================================

The following functionality was previously verified in production:

- My Studios selector.
- Direct studio opening.
- Studio saving.
- Refresh restoration.
- Direct switching between studios.
- Independent workspace settings.
- Scene hydration.
- Intro and Outro scene visibility.

Preserve all existing working functionality.

Do not introduce regressions.

====================================================================
3. VERIFY PRODUCTION MEDIA INFRASTRUCTURE
====================================================================

Inspect the existing production implementation.

Verify:

- Media upload endpoints.
- Authentication requirements.
- Workspace ownership validation.
- Cloudflare R2 bindings.
- Media metadata persistence.
- File retrieval endpoints.
- Media URL generation.
- Browser media loading.
- Error handling.

Determine whether the existing media system is correctly
connected to the production infrastructure.

Do not create duplicate media systems.

Repair the existing implementation where necessary.

====================================================================
4. CREATE DISPOSABLE TEST MEDIA
====================================================================

Use TPI Acceptance Test A and TPI Acceptance Test B.

Generate disposable synthetic test assets:

1. One image file.
2. One short audio file.
3. One short video file.

Use recognizable test filenames.

Do not use owner media.

Do not use Crossroads assets.

Do not upload copyrighted or private production content.

====================================================================
5. VERIFY MEDIA UPLOAD
====================================================================

Using Firefox Developer Edition and the authenticated
production StudioFlow interface:

Open TPI Acceptance Test A.

Upload the synthetic image, audio, and video files.

For each upload, verify:

- The upload interface responds correctly.
- The request reaches the correct production endpoint.
- Authentication succeeds.
- The correct workspace is identified.
- The file is accepted.
- The upload completes successfully.
- The expected media metadata is recorded.
- The file exists in the intended R2 storage location.

Inspect Firefox Network Monitor and Console for errors.

If a failure occurs, identify and repair the underlying cause.

Do not stop at the first failed upload.

====================================================================
6. VERIFY MEDIA RETRIEVAL
====================================================================

After uploading:

1. Confirm the files appear in StudioFlow.
2. Open or preview the image.
3. Play the audio.
4. Play the video.
5. Refresh the browser.
6. Confirm all three assets remain available.
7. Close and reopen Acceptance Test A.
8. Confirm the assets are still present.
9. Verify retrieval from Cloudflare R2.

Confirm that media is genuinely persisted server-side.

Browser-local previews alone are insufficient.

====================================================================
7. VERIFY WORKSPACE ISOLATION
====================================================================

Switch from Acceptance Test A to Acceptance Test B.

Verify that:

- Acceptance Test B retains its own media configuration.
- Acceptance Test A media is not incorrectly assigned to B.
- Media ownership and access controls are enforced.
- Unauthorized cross-workspace access is rejected.

If the application intentionally supports a shared media library,
verify that sharing follows the existing approved design.

Do not introduce new sharing behavior.

Switch back to Acceptance Test A.

Confirm all uploaded test assets remain available.

====================================================================
8. VERIFY SCENE MEDIA INTEGRATION
====================================================================

Using disposable test assets:

- Assign the synthetic image to a test scene.
- Assign the synthetic audio where supported.
- Assign the synthetic video where supported.
- Save the studio.
- Refresh the browser.
- Confirm the scene assignments persist.
- Switch studios and return.
- Confirm the correct media is restored.

Do not modify owner scenes.

Do not replace existing Intro or Outro media.

Use only disposable acceptance studios.

====================================================================
9. CROSSROADS BACKUP VERIFICATION
====================================================================

Before recommending that the owner reload Crossroads assets,
independently verify the existing Crossroads backup.

Determine:

- Whether a backup file exists.
- Where it was saved.
- Whether it is readable.
- Whether its structure is valid.
- Whether it contains the expected studio configuration.
- Whether it includes actual media files or only references.

Do not assume that a studio configuration backup also contains
the underlying image, audio, or video files.

Do not modify Crossroads.

Do not overwrite browser-local storage.

Do not import a backup into Crossroads.

If no valid backup exists, investigate the existing
non-destructive backup functionality.

Create a verified backup only through an approved process
that preserves the original studio and its existing data.

Do not claim a backup exists without identifying and
validating the actual artifact.

====================================================================
10. PRODUCTION REPAIRS
====================================================================

If testing reveals defects:

1. Identify the exact failing component.
2. Inspect the existing production source.
3. Determine the root cause.
4. Apply the smallest reliable repair.
5. Run focused regression tests.
6. Review the changed-file manifest.
7. Deploy the reviewed repair.
8. Verify the deployed Worker version.
9. Repeat the failed production test.
10. Confirm the complete media workflow passes.

Do not modify unrelated website functionality.

Do not replace the production media architecture without
specific authorization.

====================================================================
11. MANDATORY COMPLETION POLICY
====================================================================

This directive follows TPI-MASTER-001B.

FINISH WHAT YOU START.

Do not stop after:

- Investigating the media system.
- Identifying a broken endpoint.
- Modifying JavaScript.
- Fixing one upload type.
- Deploying a Worker.
- Passing an API test.

Continue until image, audio, and video acceptance tests pass
through the actual production StudioFlow interface.

If browser automation fails, use Firefox Developer Tools to
diagnose the problem.

Do not classify a browser automation limitation as an
application defect without evidence.

If an actual application defect exists, repair it.

If a genuine external blocker requires owner authorization,
document the exact action required.

Never falsely report completion.

====================================================================
12. PRODUCTION SAFETY
====================================================================

PROTECT:

- Crossroads of the Unknown.
- Existing owner studios.
- TPI Acceptance Test A.
- TPI Acceptance Test B.
- Existing media and recordings.
- Browser-local studio data.
- Authentication.
- Administration.
- Community.
- Live Bridge.
- Cloudflare D1 and R2 data.

DO NOT:

- Reset databases.
- Delete owner media.
- Overwrite Crossroads.
- Clear browser storage.
- Replay migrations blindly.
- Delete production R2 objects.
- Start public broadcasts.
- Deploy unrelated working-tree changes.

Disposable test assets must remain identifiable.

Do not automatically delete test assets or test studios.
Record them for owner-approved cleanup.

====================================================================
13. REQUIRED COMPLETION REPORT
====================================================================

Provide:

A. CURRENT PRODUCTION WORKER VERSION

B. MEDIA INFRASTRUCTURE VERIFICATION

C. IMAGE UPLOAD AND RETRIEVAL RESULT

D. AUDIO UPLOAD AND RETRIEVAL RESULT

E. VIDEO UPLOAD AND RETRIEVAL RESULT

F. REFRESH PERSISTENCE RESULT

G. WORKSPACE ISOLATION RESULT

H. SCENE MEDIA ASSIGNMENT RESULT

I. CROSSROADS BACKUP VERIFICATION

J. DEFECTS IDENTIFIED AND REPAIRED

K. FILES MODIFIED

L. DEPLOYMENT VERSION

M. FINAL LIVE VERIFICATION EVIDENCE

N. OWNER ASSET RELOAD READINESS

====================================================================
14. COMPLETION CRITERIA
====================================================================

Report:

COMPLETE — PRODUCTION VERIFIED

only when:

- Image upload and retrieval work.
- Audio upload and retrieval work.
- Video upload and retrieval work.
- Media persists after refresh.
- Workspace isolation is verified.
- Scene media assignments persist.
- R2 storage is confirmed.
- Existing StudioFlow functionality remains operational.
- Crossroads backup status is independently established.
- No owner data was damaged or overwritten.

If the media tests pass but the Crossroads backup remains
unverified, do not declare the owner asset reload process
fully ready.

Identify the precise outstanding backup requirement.

====================================================================
15. FINAL INSTRUCTION
====================================================================

COMPLETE THE PRODUCTION MEDIA SYSTEM.

VERIFY IT USING DISPOSABLE TEST ASSETS.

CONFIRM CLOUDFLARE R2 PERSISTENCE.

VERIFY MEDIA RESTORATION AFTER REFRESH.

VERIFY STUDIO WORKSPACE ISOLATION.

VERIFY THE CROSSROADS BACKUP.

PROTECT ALL EXISTING OWNER DATA.

DO NOT ASK THE OWNER TO RELOAD CROSSROADS ASSETS
UNTIL THE MEDIA SYSTEM HAS PASSED PRODUCTION ACCEPTANCE
AND THE EXISTING CROSSROADS DATA IS SAFELY ACCOUNTED FOR.

FINISH THE DIRECTIVE BEFORE MOVING TO THE NEXT ONE.

====================================================================
END DIRECTIVE TPI-STUDIOFLOW-084
====================================================================
