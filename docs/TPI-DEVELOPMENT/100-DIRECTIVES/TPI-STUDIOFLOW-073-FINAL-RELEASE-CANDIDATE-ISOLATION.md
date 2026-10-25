# TPI-STUDIOFLOW-073 — FINAL RELEASE CANDIDATE ISOLATION

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 22:02.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
THE PARANORMAL INITIATIVE
DIRECTIVE: TPI-STUDIOFLOW-073
FINAL RELEASE CANDIDATE ISOLATION
=====================================================================

PRIORITY: CRITICAL
ACTIVE MISSION: STUDIOFLOW PRODUCTION UPDATE

OWNER DIRECTION:

The existing live website and Live Bridge work.

We are updating existing StudioFlow functionality,
not rebuilding it.

Stop repeating investigations already completed
under TPI-067 through TPI-072.

OBJECTIVE:

Complete the actual isolation of the StudioFlow
release changes.

Produce a clean, exact, owner-reviewable Git
release checkpoint.

Do not deploy or push.

=====================================================================
1. VERIFY RELEASE ENVIRONMENT
=====================================================================

Candidate:

/Users/toddknipple/Documents/GitHub/
tpi-studioflow-release-candidate

Branch:

codex/studioflow-release-candidate

Website repository:

/Users/toddknipple/Documents/GitHub/
paranormal-initiative-website

StudioFlow source:

/Users/toddknipple/Documents/StudioFlow/web

Verify branch, worktree, and baseline.

Do not modify the original source.

Do not modify unrelated website development.

=====================================================================
2. ESTABLISH EXACT RELEASE DIFF
=====================================================================

Compare:

- Candidate baseline.
- Existing website StudioFlow implementation.
- Updated StudioFlow source.
- Current release candidate.

Identify only changes required for the
StudioFlow update.

Preserve working production behavior.

Do not include unrelated development.

=====================================================================
3. COMPLETE SHARED BACKEND EXTRACTION
=====================================================================

Perform the previously deferred hunk-level
isolation for:

functions/api/[[path]].js
worker.js
lib/auth.js
lib/outbound-fetch.js

This is an IMPLEMENTATION task.

Do not merely report that extraction is needed.

For each changed hunk:

- Identify its purpose.
- Determine whether StudioFlow requires it.
- Determine whether it affects existing routes.
- Preserve unrelated behavior.
- Remove unrelated changes from the candidate.
- Record the decision.

Do not overwrite whole files from the dirty
website development worktree.

Do not weaken existing authentication.

=====================================================================
4. PRESERVE EXISTING LIVE BRIDGE
=====================================================================

The existing Live Bridge is operational
on the live website.

Preserve the established guest-code workflow.

Do not rebuild the guest system.

Do not introduce new authentication behavior
without demonstrated necessity.

Review the candidate's:

/api/rooms/*
/api/room-codes/*

Determine whether these routes are:

A. Existing production routes.

B. New StudioFlow routes.

C. Routes used by a separate optional service.

D. Unused by the existing Live Bridge.

Use code and historical deployment evidence.

Do not infer a production defect solely from
the presence of requireAdmin.

If a candidate change would break an existing
guest route, restore the working baseline
behavior where it is safely identifiable.

If the required behavior cannot be established,
document the exact unresolved hunk and block
its promotion.

Do not create a broad authentication bypass.

=====================================================================
5. COMPLETE RELEASE MANIFEST
=====================================================================

Include only necessary:

- StudioFlow HTML entry point.
- Approved generated JS/CSS.
- Required StudioFlow bridges.
- Required workspace persistence.
- Required media persistence.
- Required backend integrations.
- Required migrations.
- Necessary verification scripts.

Exclude:

- wrangler.local.toml.
- Development credentials.
- Local databases.
- Browser profiles.
- Owner media and recordings.
- Backups and snapshots.
- Unrelated website changes.
- Unrelated community changes.
- Unrelated administration changes.

No local-only compatibility override may
enter the release.

=====================================================================
6. VERIFY DATABASE DEPENDENCIES
=====================================================================

Review migrations:

0053_studioflow_creator_production_lock.sql

0054_studioflow_media_assets.sql

Confirm their required code dependencies.

Verify both against a disposable database.

Document exact migration order.

Do not apply migrations to production.

=====================================================================
7. RELEASE REGRESSION TESTING
=====================================================================

Run:

- StudioFlow regression tests.
- Existing Live Bridge contracts.
- Guest invitation contracts.
- Authentication tests.
- Workspace persistence tests.
- Media persistence tests.
- Worker routing tests.
- Existing website smoke tests.
- JavaScript syntax checks.
- git diff --check.

Verify that candidate isolation has not
introduced missing imports or broken routes.

Report actual results.

=====================================================================
8. PREPARE GIT CHECKPOINT
=====================================================================

Produce the exact file list for the
StudioFlow release.

Verify no unrelated files are included.

Generate a release diff summary.

Create a proposed commit message.

Do not stage files.

Do not commit.

Do not push.

Do not deploy.

=====================================================================
9. DOCUMENTATION
=====================================================================

Create:

docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/
TPI-STUDIOFLOW-073-RESULT.md

Update:

- Directive index.
- Current development status.
- Creator Studio development record.

Do not reorganize unrelated documentation.

=====================================================================
10. REQUIRED RESULT
=====================================================================

TPI-STUDIOFLOW-073 RESULT

A. CANDIDATE GIT STATE
B. EXACT RELEASE FILE LIST
C. BACKEND HUNKS EXTRACTED
D. LIVE BRIDGE COMPATIBILITY FINDINGS
E. MIGRATION DEPENDENCIES
F. REGRESSION RESULTS
G. EXCLUDED CHANGES
H. PROPOSED GIT COMMIT
I. REMAINING RELEASE BLOCKERS
J. NEXT ACTION

=====================================================================
SUCCESS CONDITIONS
=====================================================================

COMPLETE:

All required StudioFlow changes are isolated.

No unrelated backend changes remain.

Existing Live Bridge behavior is preserved.

Required migrations are documented.

Automated regression tests pass.

Release file list is exact and reviewable.

No production resources were modified.

PARTIAL:

Any required backend hunk remains unresolved.

Any required file is missing.

Any security boundary remains ambiguous.

Any regression test fails.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-073
=====================================================================
