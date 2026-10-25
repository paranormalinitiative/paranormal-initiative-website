# TPI-STUDIOFLOW-084B — SCENE PERSISTENCE REPAIR AND CROSSROADS BACKUP VERIFICATION

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

====================================================================
THE PARANORMAL INITIATIVE
DIRECTIVE TPI-STUDIOFLOW-084B
SCENE PERSISTENCE REPAIR AND CROSSROADS BACKUP VERIFICATION
====================================================================

STATUS: AUTHORIZED
PRIORITY: CRITICAL
TYPE: PRODUCTION REPAIR AND ACCEPTANCE COMPLETION

CONTINUATION OF:
TPI-STUDIOFLOW-084
TPI-STUDIOFLOW-084A

PRODUCTION WEBSITE:
https://paranormalinitiative.com

PRODUCTION STUDIOFLOW:
https://paranormalinitiative.com/studio/

AUTHORIZED IMPLEMENTATION REPOSITORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

DESIGNATED DEVELOPMENT AND VERIFICATION BROWSER:
Firefox Developer Edition

LATEST REPORTED PRODUCTION WORKER:
100ff967-a7f8-4b83-9aa9-1aeb3b3212fd

Verify the actual deployed Worker before making changes.

====================================================================
1. PRIMARY OBJECTIVE
====================================================================

FINISH THE REMAINING REQUIREMENTS OF TPI-STUDIOFLOW-084.

The previous directive successfully repaired image uploads.

The following production functionality has passed acceptance:

- Image uploads.
- Image retrieval.
- Cloudflare R2 image persistence.
- D1 image metadata persistence.
- Audio upload and retrieval.
- Video upload and retrieval.
- Refresh restoration of uploaded media.
- Workspace media isolation.

DO NOT REBUILD THESE SYSTEMS.

Two requirements remain:

A. Repair server-backed scene image assignment persistence.

B. Create and independently verify a genuine backup of
   Crossroads of the Unknown.

Both requirements must be completed before recommending
that the owner reload actual Crossroads podcast assets.

====================================================================
2. PRODUCTION IMPLEMENTATION AUTHORITY
====================================================================

The existing live production website and its repository are
the only authorized implementation targets.

DO NOT:

- Use the separate StudioFlow development application.
- Rebuild StudioFlow from another repository.
- Replace the existing workspace architecture.
- Introduce a second media persistence system.
- Introduce a second scene management system.
- Modify unrelated production functionality.

Historical TPI directives remain the requirements authority.

Preserve all existing working behavior.

====================================================================
3. INVESTIGATE SCENE IMAGE ASSIGNMENT FAILURE
====================================================================

The previous production acceptance test established:

- A valid PNG uploaded successfully.
- The image appeared in the StudioFlow interface.
- The asset persisted in Cloudflare R2.
- Its metadata persisted in D1.
- The image remained retrievable after refresh.

HOWEVER:

The saved scene configuration contained:

customBackground: null

This means the visual editor displayed the image without
conclusively persisting its assignment to the scene.

This is the defect to investigate and repair.

Using Firefox Developer Edition, inspect:

1. Scene image selection.
2. Image assignment event handlers.
3. Current scene state.
4. Workspace scene state.
5. Scene serialization.
6. Autosave triggers.
7. Manual save behavior.
8. Workspace save request payload.
9. Production save endpoint.
10. Server-side scene persistence.
11. Workspace hydration.
12. Scene restoration after refresh.

Determine exactly where the assigned image reference
is being lost.

Do not assume the database is responsible.

Trace the complete state transition from the image
selection event through the server-backed save.

====================================================================
4. VERIFY THE EXISTING SCENE DATA MODEL
====================================================================

Inspect the existing production scene implementation.

Determine how the application currently represents:

- Scene backgrounds.
- Custom background images.
- Uploaded media references.
- Asset identifiers.
- Asset URLs.
- Scene-specific settings.
- Workspace-level settings.
- Intro scenes.
- Outro scenes.
- Default scenes.
- Additional user-created scenes.

Identify the authoritative field or structure used by
the existing production scene renderer.

The previous result reported:

customBackground: null

However, do not assume that customBackground is necessarily
the only valid persistence field.

Confirm the intended production data contract before
changing the implementation.

Preserve backward compatibility with existing studios.

Do not introduce incompatible scene schemas.

====================================================================
5. REPAIR SCENE IMAGE PERSISTENCE
====================================================================

Using TPI Acceptance Test A:

1. Open the studio directly.
2. Select a disposable test scene.
3. Select a previously uploaded synthetic PNG.
4. Assign it as the scene background.
5. Confirm the image appears in the editor.
6. Trigger the existing save mechanism.
7. Inspect the actual save request.
8. Verify the correct workspace identifier.
9. Verify the correct scene identifier.
10. Verify the assigned media reference is included.
11. Confirm the server accepts the save.
12. Retrieve the saved workspace state.
13. Confirm the scene-media assignment is persisted.

If any step fails:

- Identify the precise cause.
- Repair the existing implementation.
- Run focused tests.
- Repeat the failed step.

Do not stop after making the image visible in the editor.

The image assignment must survive an actual
server-backed save and subsequent retrieval.

====================================================================
6. VERIFY AUTOSAVE AND RESTORATION
====================================================================

After repairing scene assignment:

A. MANUAL SAVE

Assign the synthetic PNG to a disposable scene.

Save the workspace.

Confirm the server-backed scene state contains the
expected media reference.

B. AUTOSAVE

Change the scene background using the existing editor.

Wait for the normal autosave process.

Confirm the change is persisted server-side.

C. REFRESH

Refresh Firefox Developer Edition.

Confirm the correct image remains assigned.

D. REOPEN

Close the studio and reopen Acceptance Test A.

Confirm the correct scene and background are restored.

E. STUDIO SWITCHING

Switch from Acceptance Test A to Acceptance Test B.

Confirm B retains its independent scene configuration.

Switch back to Acceptance Test A.

Confirm the original scene image assignment is restored.

F. FULL RELOAD

Perform a normal browser reload.

Confirm scene assignments remain correct.

Do not clear cookies, local storage, IndexedDB,
or any existing owner browser data.

====================================================================
7. VERIFY SCENE HYDRATION AND ISOLATION
====================================================================

Previous repairs addressed a scene hydration defect that
caused existing scenes to disappear from the interface.

Prevent regression.

Verify:

- Existing scenes are preserved.
- Scene order is preserved.
- Scene names are preserved.
- Scene identifiers remain stable.
- Scene-specific settings are preserved.
- Scene background assignments remain correct.
- Switching studios does not mix scene data.
- Refreshing does not replace existing scenes.
- Autosave does not overwrite newer scene state
  with stale hydrated state.

Use only disposable acceptance studios for
scene mutation testing.

Do not modify Crossroads scenes.

====================================================================
8. CROSSROADS BACKUP — CRITICAL REQUIREMENT
====================================================================

The previous directive found no independently verified
backup of the real Crossroads of the Unknown studio.

The available TPI-033 backup package contained
synthetic test data.

It is NOT an acceptable Crossroads backup.

A genuine Crossroads backup must now be created
and independently validated.

THIS OPERATION MUST BE NON-DESTRUCTIVE.

Crossroads of the Unknown is owner production content.

Its existing state must remain unchanged.

====================================================================
9. IDENTIFY THE AUTHORITATIVE CROSSROADS DATA
====================================================================

Before creating the backup, identify all existing
Crossroads data sources.

Inspect, without modifying:

- The authenticated production workspace listing.
- Server-backed workspace records.
- Existing scene configuration.
- Browser-local workspace storage.
- Existing media metadata.
- Existing R2 media references.
- Existing export or backup mechanisms.

Determine whether Crossroads is:

A. Fully server-backed.

B. Browser-local.

C. Partially synchronized between browser and server.

D. Distributed across multiple storage mechanisms.

Do not assume the production D1 database contains
the complete Crossroads workspace.

Do not assume browser-local data is already backed up.

Do not overwrite one data source with another.

If multiple copies exist, identify their differences
before attempting any synchronization.

====================================================================
10. CREATE A NON-DESTRUCTIVE CROSSROADS BACKUP
====================================================================

Create a genuine backup of the existing
Crossroads of the Unknown studio.

The backup must preserve, where present:

- Studio identity.
- Workspace configuration.
- Scene names.
- Scene identifiers.
- Scene ordering.
- Scene settings.
- Background assignments.
- Layout information.
- Media references.
- Media metadata.
- Existing production asset relationships.

Where actual media files are accessible and exportable,
include them in the portable backup.

If the existing export mechanism does not include
actual media files, determine whether it can safely
be extended to support them.

Do not invent missing media.

Do not substitute synthetic media for real assets.

Do not overwrite existing Crossroads data.

Do not create a new Crossroads workspace as a substitute
for backing up the existing one.

Do not silently synchronize local and server copies.

====================================================================
11. BACKUP ARTIFACT VERIFICATION
====================================================================

A successful export notification is not sufficient.

Identify the actual backup artifact.

Record:

- Backup filename.
- Exact filesystem location.
- File format.
- File size.
- Creation timestamp.
- SHA-256 checksum.
- Workspace identifier.
- Number of scenes.
- Number of media references.
- Number of actual media files included.

Inspect the artifact independently of the export UI.

Verify:

1. The file exists.
2. The file is readable.
3. The archive structure is valid.
4. The workspace identity matches Crossroads.
5. The expected scene configuration is present.
6. Media references are represented correctly.
7. Included media files are readable.
8. File manifests match actual archive contents.
9. No synthetic acceptance workspace was substituted.
10. The artifact can be parsed without corruption.

If actual media files are unavailable, report exactly
which assets are missing and where their references point.

Do not declare the backup media-inclusive unless
the media files are actually contained in the artifact.

====================================================================
12. BACKUP RECOVERY VALIDATION
====================================================================

A backup is only useful if its contents can be recovered.

Validate the backup using an isolated, non-production
inspection or restoration environment.

Do not restore it into the existing Crossroads workspace.

Do not overwrite any production workspace.

Do not create a public broadcast.

Verify that the backup can reconstruct:

- Studio configuration.
- Scene ordering.
- Scene settings.
- Media references.
- Included media assets.

Where a full restoration cannot safely be performed,
complete the strongest available offline validation
and explicitly document the remaining recovery limitation.

Do not claim full recovery verification if only archive
inspection was performed.

====================================================================
13. BACKUP SAFETY RULES
====================================================================

ABSOLUTELY PROHIBITED:

- Clearing browser storage.
- Resetting IndexedDB.
- Deleting Crossroads.
- Replacing Crossroads scenes.
- Renaming Crossroads.
- Importing synthetic test data into Crossroads.
- Overwriting existing media.
- Running destructive database migrations.
- Deleting R2 objects.
- Recreating Crossroads from incomplete server data.
- Treating an empty D1 workspace as authoritative
  over existing browser-local content.

The original Crossroads workspace must remain intact.

If the existing browser profile is required to access
Crossroads data, use the authenticated owner environment
without resetting or replacing its storage.

If authorization or browser access is genuinely required
from the owner, identify the precise action needed.

Do not risk data loss to satisfy the backup requirement.

====================================================================
14. PRODUCTION DEPLOYMENT
====================================================================

For any scene persistence repair:

1. Inspect the current production implementation.
2. Confirm the actual deployed Worker version.
3. Identify the exact files requiring modification.
4. Apply the smallest safe correction.
5. Run focused regression tests.
6. Run syntax checks.
7. Run git diff --check.
8. Review the deployment file manifest.
9. Exclude unrelated dirty working-tree changes.
10. Deploy through the established guarded
    production deployment process.
11. Confirm the new Worker version.
12. Verify the repaired behavior on the live website.

Do not deploy a backup implementation without testing
its export and validation behavior.

Do not modify unrelated website systems.

====================================================================
15. MEDIA REGRESSION TESTING
====================================================================

After scene persistence repairs, recheck:

IMAGE:
- Upload.
- D1 metadata.
- R2 retrieval.
- Browser preview.

AUDIO:
- Authenticated retrieval.
- Playback.

VIDEO:
- Authenticated retrieval.
- Playback.

WORKSPACE:
- Save.
- Autosave.
- Refresh.
- Direct studio switching.
- Independent workspace settings.
- Scene hydration.

Do not allow the scene persistence repair to break
the media functionality verified under 084A.

====================================================================
16. MANDATORY COMPLETION POLICY
====================================================================

This directive follows TPI-MASTER-001B.

FINISH WHAT YOU START.

Do not stop after:

- Finding the defective event handler.
- Identifying the serialization problem.
- Updating JavaScript.
- Passing offline tests.
- Deploying a Worker.
- Displaying the image in the editor.
- Triggering a backup download.
- Finding an existing backup filename.

Continue through actual production verification
and independent backup artifact validation.

If an unavoidable authorization or external access
blocker prevents safe completion, report the exact
blocked operation and the minimum owner action required.

Do not fabricate evidence.

Do not report unverified tests as passed.

====================================================================
17. REQUIRED FINAL REPORT
====================================================================

Provide the following:

A. PRE-REPAIR WORKER VERSION

B. SCENE ASSIGNMENT ROOT CAUSE

C. FILES MODIFIED

D. REPAIR IMPLEMENTATION SUMMARY

E. DEPLOYED WORKER VERSION

F. SCENE IMAGE ASSIGNMENT RESULT

G. SERVER-BACKED SAVE RESULT

H. AUTOSAVE RESULT

I. REFRESH RESTORATION RESULT

J. STUDIO SWITCHING RESULT

K. SCENE HYDRATION REGRESSION RESULT

L. IMAGE REGRESSION RESULT

M. AUDIO REGRESSION RESULT

N. VIDEO REGRESSION RESULT

O. CROSSROADS DATA SOURCE IDENTIFICATION

P. CROSSROADS BACKUP ARTIFACT LOCATION

Q. BACKUP FILE SIZE AND SHA-256

R. BACKUP CONTENTS AND MEDIA INVENTORY

S. BACKUP RECOVERY VALIDATION RESULT

T. REMAINING RISKS OR BLOCKERS

U. OWNER ASSET RELOAD READINESS

V. FINAL STATUS

====================================================================
18. COMPLETION CRITERIA
====================================================================

Report:

COMPLETE — PRODUCTION VERIFIED

only when:

1. Scene image assignments persist server-side.
2. Manual save works.
3. Autosave works.
4. Refresh restoration works.
5. Studio switching preserves independent scene data.
6. Scene hydration remains correct.
7. Image, audio, and video regressions pass.
8. A genuine Crossroads backup artifact exists.
9. The backup artifact is independently validated.
10. Backup contents and media coverage are documented.
11. Existing Crossroads data remains unchanged.
12. Production deployment and live verification succeed.

If scene persistence passes but backup verification
cannot be safely completed, report the exact
remaining backup blocker.

Do not declare owner asset reload readiness until
the existing Crossroads data has been safely accounted for.

====================================================================
19. FINAL ORDER
====================================================================

REPAIR THE SCENE IMAGE ASSIGNMENT DEFECT.

VERIFY SERVER-BACKED SCENE PERSISTENCE.

VERIFY MANUAL SAVE AND AUTOSAVE.

VERIFY REFRESH AND DIRECT STUDIO SWITCHING.

PRESERVE ALL EXISTING SCENES.

CREATE A REAL CROSSROADS BACKUP.

INDEPENDENTLY VALIDATE THE BACKUP ARTIFACT.

PROTECT ALL OWNER DATA.

DO NOT ASK THE OWNER TO RELOAD CROSSROADS ASSETS
UNTIL THE REMAINING ACCEPTANCE GATES PASS.

COMPLETE TPI-STUDIOFLOW-084.

THEN RESUME THE MASTER DIRECTIVE REGISTER
FROM ITS NEXT UNFINISHED CHRONOLOGICAL ITEM.

====================================================================
END DIRECTIVE TPI-STUDIOFLOW-084B
====================================================================
