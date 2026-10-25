# STUDIOFLOW PRODUCTION MIGRATION

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
TPI-STUDIOFLOW-051
STUDIOFLOW PRODUCTION MIGRATION
CONTROLLED LIVE DEPLOYMENT
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

PRIMARY REPOSITORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

STUDIOFLOW SOURCE:
/Users/toddknipple/Documents/StudioFlow/web

OBJECTIVE:
Migrate the completed StudioFlow application to the
live Paranormal Initiative website.

OWNER AUTHORIZATION:
Production migration is requested.

Codex may autonomously investigate, prepare, repair,
build, test, and stage the release.

Actual production deployment is authorized ONLY after
all release gates below pass.

If a gate fails, stop before deployment and report it.

=====================================================================
1. DEVELOPMENT AUTHORITY
=====================================================================

Codex has full engineering authority to:

- Inspect existing source and infrastructure.
- Identify the production deployment architecture.
- Correct migration-related defects.
- Build production assets.
- Run automated tests.
- Run isolated browser tests.
- Prepare database migrations.
- Validate production configuration.
- Update documentation.
- Execute the approved deployment procedure.
- Perform post-deployment smoke tests.
- Roll back the deployment if necessary.

Do not request routine implementation approval.

Do not interpret this authority as permission to
delete, overwrite, or reset production data.

=====================================================================
2. PRESERVE THE LIVE WEBSITE
=====================================================================

The Paranormal Initiative website already contains
important functionality.

Preserve all unrelated website areas.

Do not modify or remove:

- Standards & Ethics.
- Advisory Board.
- Early Access.
- Existing published articles.
- Existing user accounts.
- Existing repository content.
- Existing production data.
- Unrelated applications.

StudioFlow must integrate into the existing website
without disrupting its established functionality.

=====================================================================
3. INVESTIGATE CURRENT PRODUCTION ARCHITECTURE
=====================================================================

Identify:

- Existing Cloudflare Worker configuration.
- Production routes.
- StudioFlow routes.
- Authentication.
- D1 bindings.
- R2 bindings.
- Existing storage infrastructure.
- WebRTC signaling architecture.
- Guest invitation architecture.
- Recording storage architecture.

Determine whether the current implementation is
compatible with the production environment.

Do not assume local development configuration
can be deployed unchanged.

=====================================================================
4. STUDIOFLOW HOME PAGE STABILITY
=====================================================================

The owner previously reported rapid flickering
on the StudioFlow Home page in Opera.

Investigate this issue before deployment.

Determine whether it is caused by:

- React rendering.
- Project state synchronization.
- Autosave.
- Repeated initialization.
- Asset staging.
- Authentication.
- Navigation.
- Component remounting.

Implement the smallest reliable correction.

Verify the Home page remains stable for at least
60 seconds in a browser test.

Do not deploy a known continuously flickering UI.

=====================================================================
5. PRODUCTION ASSET BUILD
=====================================================================

Build StudioFlow from the current authoritative source.

Verify:

- JavaScript assets.
- CSS assets.
- HTML entry points.
- Asset references.
- Media paths.
- Production route compatibility.
- Authentication integration.

Ensure local development URLs and test-only settings
are not accidentally included in production behavior.

Preserve the existing asset versioning architecture
where appropriate.

=====================================================================
6. PROJECT PERSISTENCE
=====================================================================

Include TPI-STUDIOFLOW-048 and 049.

Required functionality:

- Save Project.
- Autosave.
- Project Saved status.
- Unsaved Changes status.
- Export Project.
- Import Project.
- Complete Project Backup.
- Backup Outdated indicator.
- Recovery Snapshots.

Verify that the production environment has the
required D1 and R2 bindings.

Do not assume local D1 records exist in production.

Do not automatically copy local databases into
production.

Do not automatically restore Crossroads.

Do not overwrite existing production studios.

=====================================================================
7. MEDIA STORAGE
=====================================================================

The owner reports that browser-local media assets
are no longer available.

Do not attempt unauthorized recovery.

Do not fabricate missing media.

Ensure StudioFlow supports reuploading:

- Backgrounds.
- Motion backgrounds.
- Intro videos.
- Outro videos.
- Music.
- Other supported media.

Verify that newly uploaded media can be saved
and restored through the intended production
storage architecture.

If uploaded media remains browser-local only,
report that limitation clearly.

Do not claim server-side media persistence
unless it is verified.

=====================================================================
8. GUEST WAITING ROOM
=====================================================================

Include TPI-STUDIOFLOW-045.

Verify:

- Guest joins waiting room.
- Guest hears stage program audio.
- Guest microphone is isolated.
- Add to Stage admits guest.
- Remove from Stage returns guest to waiting.
- Explicit guest removal disconnects guest.
- Recording remains independently controlled.
- Broadcasting remains independently controlled.

Confirm production HTTPS and WebRTC compatibility.

Verify signaling through the intended production
room-relay architecture.

Do not depend on the local room server on port 8788.

Do not deploy an unverified guest microphone path
that could include waiting guests in public audio.

=====================================================================
9. DATABASE SAFETY
=====================================================================

Inspect all required migrations.

Classify each migration as:

- Non-destructive.
- Potentially destructive.
- Not required.

Only non-destructive, backward-compatible migrations
may be applied under this directive.

Before any production migration:

- Verify the target database.
- Verify required bindings.
- Confirm a usable rollback/recovery strategy.
- Confirm existing data will be preserved.

Do not reset D1.

Do not drop production tables.

Do not delete production records.

Do not overwrite owner projects.

If a destructive migration is required, stop and
request separate authorization.

=====================================================================
10. RELEASE GATES
=====================================================================

Production deployment may proceed only when:

GATE A:
StudioFlow Home page flickering is resolved.

GATE B:
Production build succeeds.

GATE C:
Automated regressions pass.

GATE D:
Authentication behavior is verified.

GATE E:
Required D1 and R2 bindings are verified.

GATE F:
Project saving and loading are verified.

GATE G:
Export and import are verified.

GATE H:
Guest microphone isolation is verified.

GATE I:
Production signaling architecture is verified.

GATE J:
A rollback procedure is prepared.

GATE K:
Existing production website functionality is
protected from unrelated changes.

If any gate fails, do not deploy.

Report the blocker and the required correction.

=====================================================================
11. CONTROLLED DEPLOYMENT
=====================================================================

Once every release gate passes:

- Record the current production Worker version.
- Preserve rollback information.
- Deploy the verified StudioFlow release.
- Avoid unrelated production changes.
- Apply only verified, non-destructive migrations.
- Verify production routes.
- Verify authentication.
- Verify StudioFlow loads correctly.
- Verify project saving.
- Verify project switching.
- Verify guest invitation behavior.
- Verify recording and broadcasting controls.

Do not start an actual public livestream.

Do not create unnecessary production data.

Do not modify existing owner projects during testing.

=====================================================================
12. POST-DEPLOYMENT VALIDATION
=====================================================================

After deployment, verify:

1. Existing website remains accessible.
2. StudioFlow Home page loads correctly.
3. No continuous flickering.
4. Authentication remains intact.
5. Studio selection works.
6. Save Project works.
7. Autosave works.
8. Export Project works.
9. Import Project works.
10. Background upload interface works.
11. Motion Backgrounds remain available.
12. Guest waiting room works.
13. Stage admission works.
14. Guest removal works.
15. Recording controls remain independent.
16. Broadcasting controls remain independent.

If a critical regression is confirmed, execute the
prepared rollback procedure.

Do not delete production data during rollback.

=====================================================================
13. DOCUMENTATION
=====================================================================

Update relevant Markdown documentation.

Document:

- Production architecture.
- Deployment procedure.
- Production routes.
- D1 bindings.
- R2 bindings.
- Guest signaling.
- Media persistence.
- Backup and recovery.
- Release verification.
- Rollback procedure.
- Known limitations.

Update:

- Directive index.
- Current development status.
- Completed-work records.

Clearly distinguish verified production behavior
from local or synthetic test results.

=====================================================================
14. PROTECTED OWNER DATA
=====================================================================

Crossroads of the Unknown

LOCAL WORKSPACE:
43b20614-69da-4d82-af9d-063cace4b6cc

LOCAL BROADCAST:
studio-0ec3848f-5500-462c-a1da-f711d3148d49

Do not overwrite this studio.

Do not assume local and production identifiers
refer to the same records.

Do not automatically migrate local owner data.

Preserve existing production studio identities.

=====================================================================
15. RESTRICTIONS
=====================================================================

NO production database reset.
NO destructive migration.
NO deletion of production records.
NO deletion of owner media.
NO deletion of recordings.
NO browser storage clearing.
NO automatic backup restoration.
NO unrelated website redesign.
NO paid infrastructure activation.
NO Git commit or push unless separately authorized.

Do not modify the temporary guest tunnel.

Preserve existing working-tree changes.

=====================================================================
16. REQUIRED FINAL REPORT
=====================================================================

TPI-STUDIOFLOW-051 RESULT

STATUS:
DEPLOYED / PARTIAL / BLOCKED

A. HOME PAGE STABILITY

B. PRODUCTION ARCHITECTURE

C. BUILD RESULTS

D. AUTHENTICATION

E. PROJECT SAVING

F. PORTABLE BACKUPS

G. MEDIA STORAGE

H. GUEST AUDIO AND SIGNALING

I. DATABASE SAFETY

J. DEPLOYMENT STATUS

K. POST-DEPLOYMENT VERIFICATION

L. DOCUMENTATION UPDATED

M. FILES MODIFIED

N. REMAINING LIMITATIONS

O. ROLLBACK INFORMATION

=====================================================================
FINAL INSTRUCTION
=====================================================================

The owner has requested migration of StudioFlow
to the live Paranormal Initiative website.

Complete the engineering work autonomously.

Deploy only after all release gates pass.

Protect existing production data and unrelated
website functionality.

If a release gate cannot be verified, stop safely
and report the blocker.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-051
=====================================================================
