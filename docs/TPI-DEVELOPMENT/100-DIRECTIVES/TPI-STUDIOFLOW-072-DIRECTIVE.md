# TPI-STUDIOFLOW-072 — DIRECTIVE: TPI-STUDIOFLOW-072

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 21:57.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
THE PARANORMAL INITIATIVE
DIRECTIVE: TPI-STUDIOFLOW-072
PRODUCTION UPDATE PREPARATION
=====================================================================

PRIORITY: CRITICAL
MISSION: DEPLOY STUDIOFLOW IMPROVEMENTS

OWNER CONFIRMATION:

The existing live TPI website is operational.

StudioFlow and Live Bridge already work on the
live website, including guest invitation codes,
guest connections, and broadcast controls.

We are NOT rebuilding these systems.

We are updating StudioFlow with the improvements
developed during this project.

PRIMARY OBJECTIVE:

Prepare the isolated StudioFlow release candidate
for a safe, minimal production update.

Preserve all existing production functionality.

=====================================================================
1. AUTHORITATIVE LOCATIONS
=====================================================================

StudioFlow development source:

/Users/toddknipple/Documents/StudioFlow/web

Website repository:

/Users/toddknipple/Documents/GitHub/
paranormal-initiative-website

Isolated release candidate:

/Users/toddknipple/Documents/GitHub/
tpi-studioflow-release-candidate

Verify all repository paths and branches.

Do not modify the original StudioFlow source.

Do not disturb unrelated website development.

=====================================================================
2. ESTABLISH THE PRODUCTION BASELINE
=====================================================================

Inspect the existing website repository.

Identify the currently deployed production
revision using available deployment records,
Git history, and configuration.

Do not assume the current local branch
matches production.

If the deployed revision cannot be established,
report that explicitly.

Determine which StudioFlow components already
exist in the production baseline.

Identify which components were changed during
our StudioFlow development work.

Do not contact production services or access
production data.

=====================================================================
3. IDENTIFY ONLY THE NEW IMPROVEMENTS
=====================================================================

Compare:

A. Existing production StudioFlow implementation.

B. Authoritative updated StudioFlow source.

C. Isolated StudioFlow release candidate.

Produce a precise change inventory.

Include:

- StudioFlow interface improvements.
- StudioFlow workspace functionality.
- Studio switching and persistence.
- Scene management improvements.
- Production controls.
- StudioFlow asset updates.
- Media persistence improvements.
- Required backend changes.
- Required database migrations.

Only include changes necessary for the update.

Do not include unrelated features.

=====================================================================
4. PRESERVE WORKING LIVE BRIDGE
=====================================================================

The existing Live Bridge works in production.

Preserve:

- Guest invitation codes.
- Guest joining.
- Waiting room.
- Camera and microphone connections.
- WebRTC signaling.
- Add to Stage.
- Remove from Stage.
- Guest program audio.
- Guest consent messaging.
- Room closure.

Do not redesign or replace these features.

Do not change their authentication model
without evidence that the update requires it.

Compare candidate changes against the
working production implementation.

If an existing production route is unchanged,
leave it unchanged.

If an update would alter a working route,
document the exact change and its necessity.

Do not introduce unnecessary RealtimeKit
dependencies.

=====================================================================
5. SHARED BACKEND REVIEW
=====================================================================

Review:

functions/api/[[path]].js
worker.js
lib/auth.js
lib/outbound-fetch.js

Separate required StudioFlow modifications
from unrelated development.

Use hunk-level comparisons.

Preserve existing website functionality.

Do not replace shared backend files wholesale.

Document every required change.

=====================================================================
6. DATABASE AND MEDIA READINESS
=====================================================================

Review:

0053_studioflow_creator_production_lock.sql

0054_studioflow_media_assets.sql

Determine whether these migrations are
required for the new functionality.

Verify migration order and compatibility.

Use disposable databases for validation.

Do not apply production migrations.

Do not modify production R2 storage.

Prepare a migration and recovery plan
for owner review.

=====================================================================
7. RELEASE MANIFEST
=====================================================================

Produce an exact release manifest.

Classify every candidate file:

REQUIRED
UNCHANGED
DEFERRED
EXCLUDED

Exclude:

- Local-only Wrangler configuration.
- Development secrets.
- Browser profiles.
- Local databases.
- Test credentials.
- Owner workspaces.
- Owner recordings.
- Owner backups.
- Unrelated website modifications.
- Unrelated community modifications.
- Unrelated administration modifications.

Ensure generated StudioFlow assets match
the approved development source.

=====================================================================
8. REGRESSION VERIFICATION
=====================================================================

Run available automated checks.

Verify:

- Existing website routes.
- StudioFlow loading.
- StudioFlow authentication.
- Studio switching.
- Workspace persistence.
- Media persistence.
- Existing Live Bridge contracts.
- Guest invitation contracts.
- Shared backend compatibility.
- Worker startup.
- JavaScript syntax.
- git diff --check.

Report actual results.

Do not require unavailable disposable
RealtimeKit credentials merely to prepare
an update to already-working functionality.

Do not claim live acceptance was performed
if it was not.

=====================================================================
9. GIT RELEASE PREPARATION
=====================================================================

Prepare a clean release checkpoint.

Determine the exact files and hunks
that should be committed.

Verify unrelated development is excluded.

Do not stage or commit yet.

Do not push yet.

Do not deploy yet.

The purpose is to produce a final
owner-reviewable release package.

=====================================================================
10. DOCUMENTATION
=====================================================================

Create:

docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/
TPI-STUDIOFLOW-072-RESULT.md

Update:

- Directive index.
- Current development status.
- Creator Studio module record.

Do not reorganize unrelated documentation.

=====================================================================
11. REQUIRED RESULT
=====================================================================

TPI-STUDIOFLOW-072 RESULT

A. PRODUCTION BASELINE FINDINGS
B. EXACT STUDIOFLOW IMPROVEMENTS
C. LIVE BRIDGE PRESERVATION
D. SHARED BACKEND REVIEW
E. MIGRATION REQUIREMENTS
F. RELEASE MANIFEST
G. REGRESSION RESULTS
H. GIT RELEASE READINESS
I. REMAINING BLOCKERS
J. NEXT DEPLOYMENT ACTION

=====================================================================
12. STRICT PROHIBITIONS
=====================================================================

NO production deployment.
NO production migrations.
NO Git push.
NO Git commit.
NO production credential access.
NO owner-data modifications.
NO unrelated feature development.
NO Live Bridge redesign.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-072
=====================================================================
