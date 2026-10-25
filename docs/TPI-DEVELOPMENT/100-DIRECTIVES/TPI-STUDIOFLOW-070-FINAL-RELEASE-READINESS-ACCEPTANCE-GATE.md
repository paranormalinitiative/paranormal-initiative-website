# TPI-STUDIOFLOW-070 — FINAL RELEASE READINESS & ACCEPTANCE GATE

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
DIRECTIVE: TPI-STUDIOFLOW-070
FINAL RELEASE READINESS & ACCEPTANCE GATE
=====================================================================

ACTIVE MISSION:
TPI CREATOR STUDIO / STUDIOFLOW

PRIORITY:
CRITICAL

STATUS:
AUTHORIZED — LOCAL ACCEPTANCE AND RELEASE REVIEW

=====================================================================
1. OBJECTIVE
=====================================================================

Determine whether the isolated StudioFlow release
candidate is ready for an owner-approved Git checkpoint
and subsequent production release.

Do not introduce new features.

Do not reorganize the Master Development Tree.

Do not stage, commit, push, migrate production,
or deploy.

=====================================================================
2. AUTHORITATIVE RELEASE CANDIDATE
=====================================================================

/Users/toddknipple/Documents/GitHub/
tpi-studioflow-release-candidate

Expected branch:
codex/studioflow-release-candidate

Expected baseline:
7385f0cf24155f121bdc967a0985553daa8a05df

Verify actual branch, HEAD, and Git status.

Preserve the original website worktree and
authoritative StudioFlow source repository.

=====================================================================
3. MEDIA PORTABILITY ACCEPTANCE
=====================================================================

Use two genuinely separate disposable browser profiles.

With disposable users and workspaces:

- Upload custom image, video, and audio assets.
- Save workspace configuration.
- Refresh the first browser.
- Open the same workspace in the second profile.
- Verify authorized asset retrieval.
- Verify scene associations.
- Verify media playback or rendering.
- Verify cross-owner access is denied.
- Verify existing browser-local media compatibility.

Do not clear or alter owner browser storage.

Do not count two tabs in the same profile as
independent browser-profile acceptance.

Report exact results.

=====================================================================
4. REALTIMEKIT ACCEPTANCE
=====================================================================

Inspect the existing room and guest integration.

Determine whether isolated disposable credentials
and a safe test gateway are available.

If available, test:

- Room creation.
- Guest invitation.
- Guest authentication.
- Guest admission.
- Guest removal.
- Room closure.
- Production-session state.
- Unauthorized access denial.

If credentials are unavailable:

- Do not fabricate credentials.
- Do not use production secrets.
- Do not claim live guest acceptance passed.
- Record the exact missing prerequisites.
- Identify whether this is a launch blocker.

Do not repeatedly attempt unavailable services.

=====================================================================
5. MIGRATION READINESS
=====================================================================

Review:

0053_studioflow_creator_production_lock.sql

0054_studioflow_media_assets.sql

Verify:

- Execution order.
- Prerequisite schema.
- Existing-data compatibility.
- Required API dependencies.
- Backup procedure.
- Recovery procedure.
- Rollback limitations.
- Post-migration validation.

Test only against disposable local D1 state.

Do not execute production migrations.

Do not access production D1 or R2.

=====================================================================
6. FINAL BACKEND AND SECURITY REVIEW
=====================================================================

Review the exact candidate changes, especially:

functions/api/[[path]].js
worker.js
lib/auth.js
lib/outbound-fetch.js

Confirm:

- Only required StudioFlow changes are included.
- Existing website behavior is preserved.
- Authentication remains enforced.
- Workspace ownership is enforced.
- Private media retrieval is protected.
- Production-session authorization is enforced.
- Local-only files are excluded.
- No secrets or owner data are included.

Identify every remaining shared-code risk.

=====================================================================
7. RELEASE MANIFEST
=====================================================================

Produce an exact file-by-file release manifest.

Classify files as:

REQUIRED
DEFERRED
EXCLUDED

Explicitly exclude:

wrangler.local.toml
.dev.vars
Local databases
Disposable fixtures
Browser profiles
Credentials
Owner media
Recordings
Backups
.local-dev/
Unrelated website development

Verify the manifest against Git status.

Do not stage files.

=====================================================================
8. REGRESSION VERIFICATION
=====================================================================

Run applicable:

- StudioFlow regression tests.
- Media persistence tests.
- Workspace ownership tests.
- Authentication tests.
- Worker routing tests.
- Room and production-session tests.
- Migration compatibility tests.
- Syntax checks.
- git diff --check.

Record actual results.

Do not infer passing results from prior directives.

=====================================================================
9. RELEASE DECISION
=====================================================================

Return one of:

READY FOR OWNER-REVIEWED GIT CHECKPOINT

NOT READY — SPECIFIC BLOCKERS

BLOCKED — MISSING EXTERNAL TEST INFRASTRUCTURE

A Git checkpoint recommendation must not be
presented as production deployment approval.

If guest testing remains unavailable, explain
the release implications and available options
without silently disabling functionality.

=====================================================================
10. DOCUMENTATION
=====================================================================

Create:

docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/
TPI-STUDIOFLOW-070-RESULT.md

Update:

- Directive index.
- Current development status.
- Creator Studio module record.
- Shared dependency record where necessary.

Preserve existing historical documentation.

=====================================================================
11. STRICT PROHIBITIONS
=====================================================================

DO NOT:

- Stage.
- Commit.
- Push.
- Deploy.
- Apply production migrations.
- Access production resources.
- Use production credentials.
- Modify protected owner data.
- Reset or clean existing worktrees.
- Introduce unrelated features.
- Reorganize the master development folders.

=====================================================================
12. REQUIRED RESULT
=====================================================================

TPI-STUDIOFLOW-070 RESULT

A. REPOSITORY STATE
B. SECOND-BROWSER MEDIA ACCEPTANCE
C. REALTIMEKIT ACCEPTANCE
D. MIGRATION 0053/0054 READINESS
E. BACKEND AND SECURITY REVIEW
F. FINAL RELEASE MANIFEST
G. REGRESSION RESULTS
H. RELEASE DECISION
I. REMAINING BLOCKERS
J. NEXT RECOMMENDED ACTION

Provide exactly one next recommended action.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-070
=====================================================================
