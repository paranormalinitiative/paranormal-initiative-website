# PRODUCTION RELEASE PREPARATION & LIVE MIGRATION

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
TPI-STUDIOFLOW-054
PRODUCTION RELEASE PREPARATION & LIVE MIGRATION
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

PRIMARY REPOSITORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

STUDIOFLOW SOURCE:
/Users/toddknipple/Documents/StudioFlow/web

PRIORITY:
CRITICAL — PRODUCTION MIGRATION

OWNER DECISION:
The owner has elected to rebuild Crossroads of the
Unknown rather than restore its older configuration.

Do not perform further Crossroads recovery work.

Preserve existing records and snapshots without
modification or deletion.

PRIMARY OBJECTIVE:
Prepare and deploy StudioFlow to the existing live
Paranormal Initiative website.

=====================================================================
1. ENGINEERING AUTHORITY
=====================================================================

Codex has full autonomous authority to:

- Investigate the production architecture.
- Repair local build and deployment issues.
- Reconcile source and staged assets.
- Repair Wrangler authentication configuration.
- Verify production D1 and R2 bindings.
- Prepare safe database migrations.
- Verify StudioFlow authentication.
- Verify project persistence.
- Verify media storage.
- Verify guest signaling.
- Run tests.
- Prepare rollback procedures.
- Deploy when all release gates pass.

Do not repeatedly request routine engineering approval.

Never expose credentials or tokens.

If interactive Cloudflare authentication is required,
request the owner's participation only for that step.

=====================================================================
2. PRESERVE EXISTING WEBSITE
=====================================================================

Production Worker:
theparanormalinitiative

Production D1:
tpi_contributor_portal

Production R2:
tpi-contributor-media

Preserve:

- Existing website pages.
- Existing published articles.
- Existing user accounts.
- Existing repositories.
- Existing applications.
- Standards & Ethics.
- Advisory Board.
- Early Access.

Do not overwrite unrelated production functionality.

=====================================================================
3. RECONCILE STUDIOFLOW BUILD
=====================================================================

Identify the authoritative StudioFlow source.

Build the latest application.

Reconcile generated assets with the website
repository.

Ensure the deployed entry point references the
correct JavaScript and CSS assets.

Include all current StudioFlow features from
TPI-STUDIOFLOW-045 through TPI-STUDIOFLOW-052.

Verify the repaired workspace bridge is included.

Do not serve obsolete bridge files.

=====================================================================
4. CLOUDFLARE AUTHENTICATION
=====================================================================

Investigate Wrangler OAuth error 10000.

Verify:

- Active Cloudflare account.
- Wrangler authentication status.
- Required permissions.
- Existing production resource access.

Use the existing account and resources.

Do not create replacement databases or buckets.

Do not modify unrelated Cloudflare settings.

=====================================================================
5. PRODUCTION DATABASE
=====================================================================

Verify the existing production D1 binding.

Determine whether StudioFlow requires any
additional tables or columns.

Use only backward-compatible migrations.

Do not reset production D1.

Do not delete or overwrite existing records.

Preserve all production user and website data.

=====================================================================
6. MEDIA PERSISTENCE
=====================================================================

Determine exactly where StudioFlow stores:

- Background images.
- Motion backgrounds.
- Intro videos.
- Outro videos.
- Music.
- Uploaded media.
- Recordings.

Ensure project media can persist independently
of browser cookies, cache, and localStorage.

Reuse existing Cloudflare R2 infrastructure
where appropriate.

Do not introduce paid services.

Do not claim media persistence until verified.

If server-side media persistence requires additional
engineering, implement and test it before deployment.

Do not silently migrate or overwrite owner media.

=====================================================================
7. PROJECT SAVING
=====================================================================

Verify:

- Save Project.
- Autosave.
- Unsaved Changes.
- Project Saved.
- Backup Outdated.
- Export Project.
- Import Project.
- Backup Complete Project.
- Recovery Snapshots.

Verify that saved projects survive:

- Browser refresh.
- Logout/login.
- A new browser session.
- Missing browser-local state.

Use synthetic test projects.

Do not modify Crossroads.

=====================================================================
8. GUEST WAITING ROOM
=====================================================================

Verify production compatibility for:

- Guest invitation links.
- Guest waiting room.
- Guest hearing stage audio.
- Waiting guest microphone isolation.
- Add to Stage.
- Remove from Stage.
- Explicit guest disconnect.
- Recording controls.
- Broadcasting controls.

Verify HTTPS/WebRTC signaling.

Do not depend on local ports 8788 or 8789.

Do not begin a public broadcast during testing.

=====================================================================
9. RELEASE CHECKPOINT
=====================================================================

Prepare a reviewed release checkpoint.

Preserve the existing working tree.

Do not discard unrelated changes.

If the deployment workflow requires a Git commit
or push, stop and request separate authorization.

Prepare a rollback plan before deployment.

Preserve the current production version.

=====================================================================
10. RELEASE GATES
=====================================================================

Deployment may proceed only when:

A. StudioFlow build is current.

B. Staged assets match the authoritative build.

C. Flickering repair is included.

D. Authentication is verified.

E. Production D1 binding is verified.

F. Production R2 binding is verified.

G. Project persistence is verified.

H. Media persistence is verified.

I. Export/import is verified.

J. Guest signaling and microphone isolation
   are verified.

K. Existing website functionality is protected.

L. Rollback procedure is ready.

If any critical gate fails, stop before deployment.

=====================================================================
11. PRODUCTION DEPLOYMENT
=====================================================================

When all gates pass and the existing deployment
workflow permits a safe release:

Deploy StudioFlow to the live website.

Perform post-deployment verification.

Do not overwrite existing production studios.

Do not delete production media.

Do not alter unrelated website functionality.

If deployment requires an unapproved Git commit,
Git push, destructive migration, or additional
privileged action, stop and report the requirement.

=====================================================================
12. POST-DEPLOYMENT TESTING
=====================================================================

Verify:

- Live website remains operational.
- StudioFlow loads.
- Authentication works.
- Studio creation works.
- Studio selection works.
- Save Project works.
- Autosave works.
- Export/import works.
- Media uploads persist.
- Guest invitation works.
- Guest admission works.
- Recording controls remain independent.
- Broadcasting controls remain independent.

Use disposable test data.

Do not start an actual public livestream.

=====================================================================
13. DOCUMENTATION
=====================================================================

Update:

- Directive index.
- Current development status.
- Production architecture documentation.
- Deployment procedures.
- Completed-work report.

Document all remaining limitations.

=====================================================================
14. REQUIRED FINAL REPORT
=====================================================================

TPI-STUDIOFLOW-054 RESULT

STATUS:
DEPLOYED / READY FOR RELEASE / BLOCKED

A. SOURCE BUILD

B. ASSET RECONCILIATION

C. CLOUDFLARE AUTHENTICATION

D. PRODUCTION D1

E. PRODUCTION R2

F. MEDIA PERSISTENCE

G. PROJECT SAVING

H. GUEST SIGNALING

I. RELEASE CHECKPOINT

J. ROLLBACK PLAN

K. DEPLOYMENT STATUS

L. PRODUCTION VERIFICATION

M. REMAINING BLOCKERS

=====================================================================
FINAL INSTRUCTION
=====================================================================

The owner has decided to rebuild Crossroads
of the Unknown from scratch.

Do not allow optional recovery work to delay
StudioFlow production migration.

Focus exclusively on preparing the current
application for a safe live release.

Deploy only after all critical release gates pass.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-054
=====================================================================
