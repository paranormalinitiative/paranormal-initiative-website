# DEVELOPMENT RECOVERY, FINAL INTEGRATION

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 15:07.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** [TPI-STUDIOFLOW-047-DEVELOPMENT-RECOVERY.md](TPI-STUDIOFLOW-047-DEVELOPMENT-RECOVERY.md)

---

=====================================================================
TPI-STUDIOFLOW-047
DEVELOPMENT RECOVERY, FINAL INTEGRATION
AND PRODUCTION RELEASE READINESS
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

PRIMARY REPOSITORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

STUDIOFLOW SOURCE:
/Users/toddknipple/Documents/StudioFlow/web

ENVIRONMENT:
LOCAL DEVELOPMENT

AUTHORITY:
FULL AUTONOMOUS ENGINEERING AUTHORITY
WITHIN THE DEFINED SAFETY BOUNDARIES

PRIORITY:
HIGH

=====================================================================
1. PROJECT OWNER INSTRUCTIONS
=====================================================================

The owner has completed a full Opera browser-data cleanup.

The owner now wants:

1. Local development services refreshed.
2. StudioFlow functionality verified.
3. Existing data inspected and preserved.
4. Outstanding StudioFlow changes integrated.
5. Markdown documentation updated.
6. Production deployment readiness established.

Codex is authorized to independently investigate,
implement, repair, test, document, and prepare the
application for production.

Do not stop for routine engineering approval.

Do not deploy to production without explicit
owner authorization.

=====================================================================
2. CRITICAL DATA SAFETY
=====================================================================

The owner manually cleared Opera browser data.

This may have affected browser-local StudioFlow data.

Before making further changes:

Inspect the current state of:

- Local D1 database.
- Studio workspaces.
- Studio broadcasts.
- Studio scenes.
- Studio assets.
- Local recordings.
- Browser-local storage, where accessible.
- IndexedDB, where accessible.
- Existing media files.
- Existing backups.

IMPORTANT:

Do not assume browser-local data survived.

Do not assume browser-local data was deleted.

Determine what actually remains.

Do not automatically restore old backups.

Do not overwrite newer data with older backups.

Do not recreate or reset owner studios.

Do not delete existing files.

=====================================================================
3. PROTECTED OWNER STUDIO
=====================================================================

STUDIO:
Crossroads of the Unknown

WORKSPACE ID:
43b20614-69da-4d82-af9d-063cace4b6cc

BROADCAST ID:
studio-0ec3848f-5500-462c-a1da-f711d3148d49

Inspect and report:

- Workspace existence.
- Broadcast existence.
- Scene configuration.
- Media references.
- Intro/outro references.
- Background references.
- Guest configuration.

Read-only inspection only.

Do not modify or recreate the studio.

If data is missing, report precisely what is missing.

=====================================================================
4. LOCAL DEVELOPMENT SERVICES
=====================================================================

Inspect the existing local service architecture.

Expected services may include:

- Local Worker: port 8787.
- Room server: port 8788.
- Guest gateway: port 8789.
- Existing LaunchAgent.
- StudioFlow asset watcher.

Determine which services are required.

Verify:

- Correct working directories.
- Correct startup commands.
- Correct environment configuration.
- Correct process ownership.
- No duplicate processes.
- No stale local asset staging.

Restart existing local services where necessary.

Do not reset databases.

Do not create duplicate background services.

Do not alter the temporary guest tunnel.

=====================================================================
5. VERIFY AUTOMATIC ASSET DELIVERY
=====================================================================

TPI-STUDIOFLOW-043 implemented:

- Automatic local asset staging.
- SHA-256 asset versioning.
- File watching.
- Atomic staging updates.

The owner previously reported that cache-busting
did not appear to work.

Now that Opera has been manually refreshed,
verify the complete delivery pipeline.

SOURCE
  |
  v
WATCHER
  |
  v
STAGED ASSETS
  |
  v
LOCAL WORKER
  |
  v
BROWSER

Confirm that the Worker serves current assets.

Compare actual served bytes against source and
staged asset hashes.

Do not add another cache-busting workaround.

Fix any confirmed delivery defect.

=====================================================================
6. BACKSTAGE INTERFACE CLEANUP
=====================================================================

Implement the approved TPI-STUDIOFLOW-044 layout.

Remove the visible Room Bridge Fallback status card
from the main backstage interface.

DESIRED LAYOUT:

[ OWNER CAMERA ] [ PRESENT OR INVITE ]

No diagnostic card between these elements.

No empty diagnostic column.

No status overlay on the camera.

Preserve the underlying Room Bridge functionality.

Do not modify guest connection logic merely to
remove the indicator.

If the existing Settings interface has a suitable
diagnostics area, the status may remain accessible there.

Do not create an elaborate new diagnostics dashboard.

=====================================================================
7. GUEST WAITING ROOM VERIFICATION
=====================================================================

TPI-STUDIOFLOW-045 implemented:

- Guest stage-state synchronization.
- Host-to-guest program audio return.
- Waiting guest microphone isolation.
- Stage admission signaling.
- Return to waiting after stage removal.
- Separate guest disconnection.
- Updated guest status messaging.

Verify these implementations remain intact.

EXPECTED WORKFLOW:

GUEST CONNECTS
      |
      v
WAITING AREA
- Guest appears in backstage participant row.
- Guest hears stage program audio.
- Guest microphone is excluded from stage audio.
      |
      v
OWNER SELECTS ADD TO STAGE
      |
      v
ACTIVE STAGE
- Guest participates in conversation.
- Guest appears in stage layout.
      |
      v
OWNER SELECTS REMOVE FROM STAGE
      |
      v
WAITING AREA
- Guest remains connected.
- Guest hears stage audio.
- Guest microphone is excluded from program mix.

Recording and broadcasting must remain independently
controlled.

Verify that no recording or broadcast begins
automatically during admission.

=====================================================================
8. AUDIO TESTING
=====================================================================

Run available local audio tests.

Test:

- Host microphone routing.
- Waiting guest microphone isolation.
- Admitted guest microphone routing.
- Host-to-guest program audio.
- Intro/outro playback routing.
- Stage removal.
- Guest readmission.
- Recording independence.
- Broadcasting independence.

Use synthetic media devices where possible.

Do not activate a public livestream.

Do not automatically record owner conversations.

If physical microphone/speaker testing requires
owner participation, document the exact test steps.

Do not claim physical verification without evidence.

=====================================================================
9. STUDIOFLOW REGRESSION TESTING
=====================================================================

Verify:

- Authentication.
- Studio selection.
- Studio switching.
- Studio persistence.
- Scene selection.
- Scene persistence.
- Backgrounds.
- Motion Backgrounds.
- Intro/outro playback.
- Camera preview.
- Microphone controls.
- Add to Stage.
- Remove from Stage.
- Guest invitations.
- Guest waiting room.
- Stage audio.
- Recording controls.
- Broadcast controls.
- Responsive layouts.

Use isolated fixtures for destructive tests.

Preserve owner data.

=====================================================================
10. MARKDOWN DOCUMENTATION
=====================================================================

Locate existing StudioFlow and TPI project
Markdown documentation.

Update the relevant documents to reflect
the current implementation.

Document:

1. StudioFlow architecture.
2. Local development environment.
3. Worker configuration.
4. Room server.
5. Guest gateway.
6. Asset staging.
7. Automatic cache-busting.
8. Studio management.
9. Scene management.
10. Backgrounds and Motion Backgrounds.
11. Guest waiting room.
12. Stage admission.
13. Stage removal.
14. Program audio routing.
15. Recording and broadcasting controls.
16. Local testing procedures.
17. Known limitations.
18. Production deployment requirements.

Preserve existing historical documentation.

Do not rewrite unrelated project documentation.

Correct outdated technical instructions.

Clearly distinguish implemented features from
planned or unverified functionality.

=====================================================================
11. PRODUCTION READINESS REVIEW
=====================================================================

Inspect the production deployment architecture.

READ-ONLY REVIEW ONLY.

Determine:

- Which StudioFlow assets would be deployed.
- Which Worker files would change.
- Which routes would be affected.
- Whether production environment variables are required.
- Whether database migrations are required.
- Whether room signaling requires production services.
- Whether guest audio requires additional infrastructure.
- Whether HTTPS requirements are satisfied.
- Whether production authentication is compatible.
- Whether current storage architecture is production-ready.
- Whether recording and media persistence are reliable.
- Whether the deployment could affect the existing website.

Do not assume local success means production readiness.

Identify blockers before deployment.

Do not contact production endpoints unnecessarily.

=====================================================================
12. RELEASE PREPARATION
=====================================================================

Prepare a production release plan.

Include:

- Files required for deployment.
- Configuration requirements.
- Database migration requirements, if any.
- Required services.
- Deployment order.
- Smoke tests.
- Rollback strategy.
- Known limitations.
- Data preservation requirements.

Do not execute the release.

Do not modify production infrastructure.

Do not create or activate production resources.

=====================================================================
13. AUTONOMOUS IMPLEMENTATION AUTHORITY
=====================================================================

Codex may independently:

- Inspect source files.
- Inspect local databases read-only.
- Inspect existing backups read-only.
- Restart existing local services.
- Repair local development configuration.
- Modify StudioFlow source.
- Modify local asset staging scripts.
- Fix confirmed application defects.
- Add regression tests.
- Run local builds.
- Run local browser tests.
- Update Markdown documentation.
- Prepare release documentation.

Do not request routine approval.

Stop only if:

- Owner data would be overwritten.
- A destructive operation is required.
- Production deployment is required.
- Production configuration must be changed.
- Paid infrastructure must be activated.
- Existing backups must be restored.
- The requested behavior is ambiguous in a way that
  could materially change the product.

=====================================================================
14. HARD RESTRICTIONS
=====================================================================

NO production deployment.
NO production database changes.
NO production Worker changes.
NO Cloudflare production writes.
NO local D1 reset.
NO browser storage clearing.
NO owner media deletion.
NO recording deletion.
NO automatic backup restoration.
NO temporary guest tunnel changes.
NO Git commit.
NO Git push.

Preserve existing working-tree changes.

=====================================================================
15. REQUIRED FINAL REPORT
=====================================================================

TPI-STUDIOFLOW-047 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. LOCAL ENVIRONMENT

Report Worker, room server, gateway, and watcher status.

B. OWNER DATA

Report what survived the Opera reset.

C. CACHE-BUSTING

Report whether current assets are being served.

D. BACKSTAGE LAYOUT

Confirm Room Bridge display removal.

E. GUEST AUDIO

Report waiting-room and stage audio verification.

F. STUDIOFLOW FUNCTIONALITY

Report regression testing results.

G. DOCUMENTATION

List Markdown files updated.

H. PRODUCTION READINESS

Report READY / NOT READY and explain why.

I. RELEASE PLAN

Summarize required deployment steps.

J. FILES MODIFIED

List all changed files.

K. DATA PROTECTION

Confirm no protected owner data was modified.

L. REMAINING BLOCKERS

Identify anything requiring owner action.

=====================================================================
FINAL INSTRUCTION
=====================================================================

The owner wants StudioFlow stabilized and prepared
for its first production release.

Codex has full authority to complete local engineering,
testing, documentation, and release preparation.

Do not stop for routine implementation approval.

Do not reset owner data.

Do not deploy to production without explicit
owner authorization.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-047
=====================================================================
