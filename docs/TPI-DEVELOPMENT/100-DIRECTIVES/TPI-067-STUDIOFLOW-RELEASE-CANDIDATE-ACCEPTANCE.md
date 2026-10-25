# TPI-067 — STUDIOFLOW RELEASE CANDIDATE ACCEPTANCE

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 21:16.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-22-STUDIOFLOW-RELEASE-ACCEPTANCE-RACE.md](../300-COMPLETED-WORK/2026-10-22-STUDIOFLOW-RELEASE-ACCEPTANCE-RACE.md)
**Previously archived variant(s):** none

---

=====================================================================
THE PARANORMAL INITIATIVE
DIRECTIVE: TPI-067
STUDIOFLOW RELEASE CANDIDATE ACCEPTANCE
=====================================================================

PRIORITY:
CRITICAL

ACTIVE MISSION:
TPI CREATOR STUDIO / STUDIOFLOW

STATUS:
AUTHORIZED — LOCAL RELEASE ACCEPTANCE

=====================================================================
1. OBJECTIVE
=====================================================================

Complete release-candidate acceptance testing for
the isolated StudioFlow website integration.

The release candidate was prepared under TPI-066.

This directive must determine whether the candidate
is ready for an owner-reviewed Git commit and push.

DO NOT DEPLOY TO PRODUCTION.

DO NOT APPLY PRODUCTION MIGRATIONS.

DO NOT STAGE OR COMMIT.

=====================================================================
2. RELEASE CANDIDATE
=====================================================================

Repository:

/Users/toddknipple/Documents/GitHub/
tpi-studioflow-release-candidate

Expected branch:

codex/studioflow-release-candidate

Expected baseline:

7385f0cf24155f121bdc967a0985553daa8a05df

Verify the branch and baseline.

Preserve the original website worktree.

=====================================================================
3. RELEASE MANIFEST VERIFICATION
=====================================================================

Review the exact files included in the candidate.

Confirm:

- StudioFlow assets match approved source.
- Required bridges are present.
- StudioFlow backend routes are present.
- Required authentication integration is present.
- Shared outbound-fetch behavior is safe.
- Migration 0053 is included but unapplied.
- Unrelated website development is excluded.
- No secrets or local databases are included.

Generate a final candidate file manifest.

Identify any unresolved shared-code dependencies.

=====================================================================
4. LOCAL RUNTIME COMPATIBILITY
=====================================================================

Investigate the compatibility-date mismatch.

Current repository date:

2026-07-18

Installed workerd supports through:

2026-07-15

Determine the supported tooling upgrade path.

Prefer updating isolated development tooling
rather than changing production compatibility
settings.

Do not change the production compatibility date
merely to satisfy an outdated local runtime.

Do not modify global tooling without approval.

If isolated tooling cannot be updated safely,
document the exact limitation.

=====================================================================
5. AUTHENTICATED STUDIOFLOW ACCEPTANCE
=====================================================================

Run an authenticated local browser acceptance test
against the isolated release candidate.

Use disposable test credentials and workspaces.

Do not use protected owner StudioFlow data.

Verify:

- Authentication.
- StudioFlow route access.
- Studio selection.
- Workspace loading.
- Workspace switching.
- Autosave.
- Workspace snapshots.
- Recovery.
- Asset loading.
- Navigation.
- Production controls.
- Logout and access restrictions.

Confirm that unauthorized visitors cannot access
protected StudioFlow routes or assets.

If authenticated testing cannot be completed,
report the exact blocker.

Do not claim acceptance passed without
actually executing the test.

=====================================================================
6. MEDIA AND ROOM ACCEPTANCE
=====================================================================

Verify locally where possible:

- Media upload.
- Media persistence.
- Media retrieval.
- Workspace asset association.
- Room creation.
- Guest invitation.
- Guest connection.
- Session state.
- Production-lock behavior.
- Room closure.

Use disposable test data only.

Do not access production media or owner recordings.

If the guest gateway is unavailable,
identify whether it is required for this release.

Do not modify unrelated services.

=====================================================================
7. MIGRATION 0053 READINESS
=====================================================================

Prepare a migration readiness assessment.

Document:

- Prerequisite schema.
- Required execution order.
- Compatibility with existing records.
- Backup requirements.
- Rollback and recovery strategy.
- Required post-migration verification.

Do not execute the migration against production.

Do not access production D1.

Do not mark migration approved.

=====================================================================
8. SECURITY VERIFICATION
=====================================================================

Verify:

- Authentication boundaries.
- Cookie behavior.
- Protected StudioFlow assets.
- Workspace ownership enforcement.
- Production-session authorization.
- Outbound-fetch restrictions.
- No sensitive data in the release candidate.
- No local-only configuration included.

Report any unresolved security risks.

=====================================================================
9. REGRESSION TESTING
=====================================================================

Run:

- StudioFlow focused tests.
- Worker routing tests.
- Authentication tests.
- Backup/recovery tests.
- Room-status tests.
- Relevant shared-backend regression tests.
- JavaScript syntax checks.
- git diff --check.

Document exact pass/fail counts.

=====================================================================
10. DOCUMENTATION
=====================================================================

Create:

docs/TPI-DEVELOPMENT/
300-COMPLETED-WORK/
TPI-067-RESULT.md

Update:

docs/TPI-DEVELOPMENT/
100-DIRECTIVES/
DIRECTIVE-INDEX.md

docs/TPI-DEVELOPMENT/
TPI-CURRENT-DEVELOPMENT-STATUS.md

Update:

docs/TPI-MASTER-DEVELOPMENT/
03-TPI-CREATOR-SYSTEMS/
01-TPI-CREATOR-STUDIO.md

Keep the original website development records
synchronized without modifying unrelated code.

=====================================================================
11. STRICT PROHIBITIONS
=====================================================================

DO NOT:

- Stage.
- Commit.
- Push.
- Deploy.
- Apply production migrations.
- Modify Cloudflare.
- Access production D1 or R2.
- Modify protected owner workspaces.
- Modify owner recordings or backups.
- Modify global system services.
- Delete unrelated development.
- Reset or clean existing worktrees.

=====================================================================
12. REQUIRED RESULT
=====================================================================

TPI-067 RESULT

A. RELEASE CANDIDATE STATE

B. FINAL FILE MANIFEST

C. RUNTIME COMPATIBILITY

D. AUTHENTICATED BROWSER ACCEPTANCE

E. MEDIA AND ROOM ACCEPTANCE

F. MIGRATION READINESS

G. SECURITY VERIFICATION

H. REGRESSION RESULTS

I. REMAINING BLOCKERS

J. RELEASE CHECKPOINT RECOMMENDATION

Provide exactly one recommended next action.

=====================================================================
COMPLETION CONDITIONS
=====================================================================

Mark COMPLETE only if:

- Candidate manifest is verified.
- Local runtime compatibility is resolved.
- Authenticated StudioFlow acceptance passes.
- Required media and room tests pass.
- Security checks pass.
- No unrelated code is included.
- No production resources are modified.

Otherwise report PARTIAL or BLOCKED.

=====================================================================
END DIRECTIVE — TPI-067
=====================================================================
