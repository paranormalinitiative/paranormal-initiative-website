# TPI-STUDIOFLOW-078 — STUDIOFLOW PRODUCTION RECOVERY

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-19 16:45.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
THE PARANORMAL INITIATIVE
DIRECTIVE: TPI-STUDIOFLOW-078

STUDIOFLOW PRODUCTION RECOVERY
RESTORE COMPLETED DEVELOPMENT FUNCTIONALITY
=====================================================================

PRIORITY: CRITICAL

MISSION TYPE:
PRODUCTION REPAIR AND ENVIRONMENT RECONCILIATION

THIS IS NOT A REBUILD.

THIS IS NOT A REDESIGN.

THIS IS NOT A NEW FEATURE DEVELOPMENT PROJECT.

=====================================================================
OWNER'S CURRENT SITUATION
=====================================================================

The updated TPI website has already been deployed
to the live Cloudflare production environment.

However, the deployed StudioFlow application is
missing functionality that was previously completed
and working in development.

The suspected cause is incomplete alignment between
development and production infrastructure.

This may include:

- Missing Worker routes.
- Missing Worker bindings.
- Missing API integrations.
- Missing database tables or columns.
- Missing environment configuration.
- Missing R2 connections.
- Incorrect asset paths.
- Incorrect production routing.
- Missing frontend functionality.
- Incorrect deployment configuration.

Do not assume every missing feature is caused
by Cloudflare infrastructure.

Determine the actual cause for each failure.

The owner wants the existing development work
restored to production.

DO NOT REBUILD STUDIOFLOW.

=====================================================================
SECTION 01
IMMEDIATE PRODUCTION PROTECTION
=====================================================================

Before making changes:

1. Identify the currently deployed Worker version.

2. Identify the current production Git commit.

3. Record the production deployment configuration.

4. Identify the current production D1 database.

5. Identify the current production R2 bucket.

6. Record current Worker bindings.

7. Preserve the previous working Worker version.

8. Establish a rollback procedure.

9. Identify the latest known working production
   StudioFlow functionality.

10. Preserve all existing production data.

Do not roll back the entire website simply
because StudioFlow is incomplete.

Do not deploy additional changes before
identifying the current production baseline.

Do not run database migrations automatically.

=====================================================================
SECTION 02
RECOVER ALL STUDIOFLOW DEVELOPMENT REQUIREMENTS
=====================================================================

Search the existing development repositories
and historical directive documentation.

Original StudioFlow source:

/Users/toddknipple/Documents/StudioFlow/web

Website repository:

/Users/toddknipple/Documents/GitHub/
paranormal-initiative-website

Isolated StudioFlow release candidate:

/Users/toddknipple/Documents/GitHub/
tpi-studioflow-release-candidate

Review all available StudioFlow directives,
including early development directives,
letter-suffixed directives, and later
release directives.

Use the original development instructions
as the functional specification.

Do not merely archive them.

Determine which completed features are
missing from the current production deployment.

=====================================================================
SECTION 03
BRAND 1 RECOVERY
=====================================================================

CRITICAL FEATURE:

BRAND 1

The owner specifically identifies Brand 1
as functionality developed previously.

Recover the exact Brand 1 implementation
from the authoritative development source.

Determine:

- What Brand 1 represents in the application.
- How Brand 1 was created.
- Where Brand 1 is stored.
- Which studio or workspace owns Brand 1.
- Which interface controls manage Brand 1.
- Which assets are associated with Brand 1.
- How Brand 1 is loaded.
- How Brand 1 is saved.
- Whether Brand 1 is browser-local,
  database-backed, or both.
- Which API endpoints it requires.
- Whether production contains its data.

Do not invent a replacement Brand 1 feature.

Do not create a duplicate Brand 1.

Do not overwrite existing branding assets.

Compare development behavior with
the currently deployed production behavior.

Restore the existing approved implementation
through the smallest necessary correction.

=====================================================================
SECTION 04
MY STUDIOS RECOVERY
=====================================================================

CRITICAL FEATURE:

MY STUDIOS

The application supports multiple studios.

The owner previously identified and corrected
the following navigation problem:

Selecting a studio from My Studios opened
the StudioFlow home screen rather than
opening the selected studio directly.

REQUIRED BEHAVIOR:

1. Open StudioFlow.

2. Select My Studios.

3. Display available studios.

4. Select an existing studio.

5. Save the current studio state.

6. Switch directly to the selected studio.

7. Open that studio immediately.

8. Restore its saved configuration.

9. Do not redirect to StudioFlow Home.

10. Do not require another click to open it.

11. Preserve the selected studio after
    appropriate navigation or reload.

Recover the exact development implementation.

Verify the corresponding production code.

Verify any required API and database support.

Restore the completed behavior.

=====================================================================
SECTION 05
MULTIPLE STUDIO WORKSPACES
=====================================================================

Recover all completed workspace functionality.

This includes:

- Creating studios.
- Listing studios.
- Selecting studios.
- Opening studios.
- Switching studios.
- Saving studio configurations.
- Loading saved configurations.
- Workspace ownership.
- Workspace isolation.
- Workspace restoration.
- Broadcast/workspace relationships.

Do not replace the workspace architecture.

Do not convert existing workspaces
into a new data format without approval.

Do not overwrite existing workspace records.

=====================================================================
SECTION 06
AUTOSAVE AND PERSISTENCE
=====================================================================

Recover the completed autosave behavior.

Verify:

- Current workspace state is saved.
- Switching studios preserves changes.
- Returning to a studio restores changes.
- Reloading does not erase saved settings.
- Media selections remain associated
  with the correct workspace.
- Studio configuration remains consistent.

Inspect:

- Frontend save operations.
- Worker API routes.
- Database persistence.
- Browser storage.
- Workspace identifiers.
- Authentication context.

Determine whether production failures
are caused by missing persistence
infrastructure or frontend behavior.

Repair the actual defect.

=====================================================================
SECTION 07
STUDIO ASSETS AND MEDIA
=====================================================================

Recover completed StudioFlow media behavior.

Include:

- Custom media.
- Background assets.
- Motion backgrounds.
- Scene assets.
- Branding assets.
- Intro media.
- Outro media.
- Workspace media associations.
- Media Library behavior.

Inspect the approved server-side
media persistence implementation.

Verify:

- D1 metadata support.
- R2 storage bindings.
- Upload routes.
- Listing routes.
- Retrieval routes.
- Ownership validation.
- MIME validation.
- File-size validation.
- Media bridge integration.

Do not delete or recreate production assets.

Do not expose private media publicly.

=====================================================================
SECTION 08
SCENES AND PRODUCTION CONTROLS
=====================================================================

Compare development and production
implementations of:

- Scenes.
- Background selection.
- Motion backgrounds.
- Intro playback.
- Outro playback.
- Production controls.
- Studio interface state.
- Media playback.

Restore missing completed behavior.

Preserve one-shot playback behavior.

Avoid reload loops.

Avoid UI flickering.

=====================================================================
SECTION 09
LIVE BRIDGE PRESERVATION
=====================================================================

IMPORTANT:

The owner previously confirmed that
the existing production Live Bridge works.

Do not rebuild it.

Do not replace it.

Do not remove its routes.

Preserve:

- Guest invitation codes.
- Guest waiting room.
- Camera access.
- Microphone access.
- WebRTC signaling.
- Guest admission.
- Add to Stage.
- Remove from Stage.
- Guest audio.
- Program audio return.
- Room closure.

Verify that the recent production deployment
did not regress these functions.

If a regression exists, compare against
the last known working implementation.

Restore the existing behavior.

Do not introduce authentication bypasses.

=====================================================================
SECTION 10
RECORDING AND STORAGE
=====================================================================

Recover the existing recording functionality.

Inspect:

- Recording controls.
- Recording Library.
- Browser storage.
- Device storage.
- Folder storage.
- External drive support.
- Recovery behavior.
- Recording integrity.
- Recording destination settings.

Distinguish completed implementations
from planned or unverified integrations.

Do not claim that recordings are
server-persisted unless confirmed.

Do not upload large creator recordings
to R2 as an improvised solution.

Preserve existing recording data.

=====================================================================
SECTION 11
BROADCASTING AND SCHEDULING
=====================================================================

Recover all implemented broadcasting
and scheduling functionality.

Inspect:

- Broadcast creation.
- Broadcast management.
- Broadcast destinations.
- Session controls.
- Scheduling.
- RealtimeKit integration.
- Broadcast/workspace linkage.
- Livestream settings.

Compare the development implementation
against production.

Do not create fake platform integrations.

Do not claim unsupported broadcast
destinations are functional.

Restore only verified completed functionality.

=====================================================================
SECTION 12
CLOUDFLARE WORKER ALIGNMENT
=====================================================================

THIS IS A PRIMARY RECOVERY TARGET.

Compare the existing development
and production Worker configurations.

Identify:

- Worker entry points.
- API route handlers.
- Worker service bindings.
- D1 bindings.
- R2 bindings.
- Environment variable names.
- Required secrets.
- Authentication configuration.
- Compatibility dates.
- Deployment configuration.
- Asset routing.

Create a precise difference report.

For each missing StudioFlow function,
identify the backend dependency
required to restore it.

Do not create duplicate Workers
without demonstrated necessity.

Do not replace the entire production
Worker configuration with development settings.

Preserve unrelated website functionality.

=====================================================================
SECTION 13
DATABASE RECONCILIATION
=====================================================================

Inspect production D1 schema and
migration ledger separately.

Relevant migrations include:

0053_studioflow_creator_production_lock.sql

0054_studioflow_media_assets.sql

Determine whether required tables
and columns already exist.

Do not blindly replay migration 0053.

Do not apply every pending migration.

Do not modify migration history without
a verified reconciliation plan.

Prepare only the missing, necessary,
safe schema changes.

Preserve all production records.

=====================================================================
SECTION 14
FRONTEND DEPLOYMENT VERIFICATION
=====================================================================

Compare the deployed StudioFlow frontend
with the approved development build.

Check:

- Asset hashes.
- Build output.
- HTML entry points.
- JavaScript bundles.
- CSS bundles.
- Asset references.
- Browser caching.
- Worker cache policy.
- Studio route handling.

Determine whether missing functionality
is caused by deploying an older frontend
or serving stale assets.

Do not assume the Worker is responsible
for every missing feature.

=====================================================================
SECTION 15
AUTHENTICATION AND OWNERSHIP
=====================================================================

Preserve existing TPI authentication.

Verify StudioFlow API requests carry
the correct authenticated context.

Verify:

- Creator ownership.
- Workspace ownership.
- Media ownership.
- Broadcast ownership.
- Session authorization.
- Guest access controls.

Do not disable authentication
to make missing functionality appear.

Do not modify working guest routes
without evidence of a regression.

=====================================================================
SECTION 16
PROTECT OWNER WORKSPACES
=====================================================================

Protected workspace:

Crossroads of the Unknown

Workspace ID:

43b20614-69da-4d82-af9d-063cace4b6cc

Broadcast ID:

studio-0ec3848f-5500-462c-a1da-f711d3148d49b

Do not modify, reset, delete, or overwrite
this workspace or its associated data.

Use disposable test workspaces.

=====================================================================
SECTION 17
FEATURE-BY-FEATURE RECOVERY MATRIX
=====================================================================

Create a complete comparison table:

FEATURE
DEVELOPMENT STATUS
PRODUCTION STATUS
SOURCE FILE
REQUIRED API
REQUIRED DATABASE
REQUIRED BINDING
ROOT CAUSE
REPAIR REQUIRED
VERIFICATION RESULT

Include every recovered StudioFlow feature.

Do not mark a feature as missing
without verifying its actual behavior.

Do not mark a feature as repaired
without testing it.

=====================================================================
SECTION 18
IMPLEMENTATION RULES
=====================================================================

This mission is to FIX the deployed system.

Use the existing completed development code.

Do not rebuild working features.

Do not redesign StudioFlow.

Do not create new application architecture.

Do not merge unrelated website changes.

Do not overwrite production data.

Implement the smallest necessary repairs
in an isolated release branch.

Preserve the existing live website.

=====================================================================
SECTION 19
TESTING
=====================================================================

Run all maintained StudioFlow regression tests.

Verify:

- Studio loading.
- Brand 1.
- My Studios.
- Studio switching.
- Autosave.
- Workspace restoration.
- Media persistence.
- Scene selection.
- Intro/outro playback.
- Guest waiting room.
- Live Bridge compatibility.
- Recording controls.
- Broadcast session behavior.
- Authentication.
- Website navigation.

Use local or disposable test data.

Avoid uncontrolled automated traffic
against deployed Cloudflare Workers.

Do not use real owner workspaces
for destructive tests.

=====================================================================
SECTION 20
PRODUCTION REPAIR RELEASE
=====================================================================

Prepare a targeted production repair.

Before production-changing operations:

1. Record current deployed Worker version.

2. Record current Git commit.

3. Prepare verified backups.

4. Identify exact repair files.

5. Identify exact database changes.

6. Identify exact binding changes.

7. Run regression tests.

8. Prepare rollback procedure.

9. Present the repair manifest
   for owner approval.

STOP BEFORE PRODUCTION CHANGES.

After explicit approval:

- Apply approved infrastructure corrections.
- Deploy the verified repair.
- Test the live StudioFlow application.
- Verify Brand 1.
- Verify My Studios.
- Verify workspace persistence.
- Verify existing Live Bridge.
- Confirm unrelated TPI functions remain working.
- Record the deployed revision.

=====================================================================
SECTION 21
FINAL REPORT
=====================================================================

Create:

TPI-STUDIOFLOW-078-RESULT.md

Include:

A. CURRENT PRODUCTION DEPLOYMENT

B. DEVELOPMENT SOURCE COMPARISON

C. BRAND 1 RECOVERY

D. MY STUDIOS RECOVERY

E. WORKSPACE PERSISTENCE RECOVERY

F. MEDIA AND ASSET RECOVERY

G. LIVE BRIDGE STATUS

H. RECORDING STATUS

I. BROADCASTING STATUS

J. WORKER DIFFERENCES

K. DATABASE DIFFERENCES

L. FRONTEND DIFFERENCES

M. ROOT CAUSES

N. REPAIRS IMPLEMENTED LOCALLY

O. TEST RESULTS

P. REMAINING PRODUCTION ACTIONS

Q. APPROVAL REQUIREMENTS

=====================================================================
SUCCESS CRITERIA
=====================================================================

The existing completed StudioFlow
development functionality is recovered.

Brand 1 behaves as designed.

My Studios opens the selected studio directly.

Studio switching saves and restores state.

Existing media and branding remain intact.

Existing Live Bridge functionality remains intact.

Production Worker and database dependencies
support the approved StudioFlow implementation.

No owner data is lost.

No unrelated TPI functionality is damaged.

No unnecessary infrastructure is created.

=====================================================================
FINAL OWNER INSTRUCTION
=====================================================================

WE ARE NOT REBUILDING STUDIOFLOW.

WE ARE FIXING THE LIVE DEPLOYMENT.

THE DEVELOPMENT WORK HAS ALREADY BEEN DONE.

RECOVER IT.

COMPARE IT.

RECONNECT IT.

REPAIR IT.

VERIFY IT.

DO NOT START OVER.

=====================================================================
END DIRECTIVE
TPI-STUDIOFLOW-078
=====================================================================
