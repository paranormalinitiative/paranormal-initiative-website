# TPI-065 — STUDIOFLOW PRODUCTION-SAFE BACKEND EXTRACTION

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 20:52.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
THE PARANORMAL INITIATIVE
DIRECTIVE: TPI-065
STUDIOFLOW PRODUCTION-SAFE BACKEND EXTRACTION
=====================================================================

PRIORITY:
CRITICAL

ACTIVE MISSION:
TPI CREATOR STUDIO / STUDIOFLOW

STATUS:
AUTHORIZED — CONTROLLED LOCAL CODE CHANGES

=====================================================================
1. OBJECTIVE
=====================================================================

Prepare the shared website backend for a safe,
independently reviewable StudioFlow release.

TPI-064 identified StudioFlow changes mixed with:

- Administration infrastructure.
- Shared authentication.
- Website routing.
- Local-development protections.
- Other website functionality.

The objective is to separate production-safe
StudioFlow changes without losing existing work.

DO NOT DEPLOY.

DO NOT COMMIT.

DO NOT STAGE.

=====================================================================
2. REPOSITORY
=====================================================================

/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

Expected branch:

codex/tpi-development

Expected HEAD:

7385f0cf24155f121bdc967a0985553daa8a05df

Verify current state before modifying anything.

If branch or HEAD differs, stop and report.

=====================================================================
3. PRE-CHANGE SAFETY RECORD
=====================================================================

Before editing:

- Record git status.
- Record current file hashes.
- Record exact diffs for target files.
- Identify pre-existing changes.
- Confirm no files are staged.

Target files:

functions/api/[[path]].js
worker.js
lib/auth.js

Do not overwrite unrelated modifications.

Do not run destructive Git commands.

If changes cannot be separated safely,
stop and report BLOCKED.

=====================================================================
4. LOCAL REQUEST GUARD
=====================================================================

Investigate:

lib/local-request-guard.js

Determine whether production code imports
or depends on this local-only module.

The production release must not depend on
a local-development-only guard.

However:

DO NOT REMOVE EXISTING LOCAL PROTECTIONS.

Preserve local development safety.

Choose the smallest safe implementation that:

- Maintains local request protection.
- Avoids introducing a production dependency
  on local-only tooling.
- Preserves Worker behavior.
- Does not alter unrelated application logic.

Document the decision and exact changes.

=====================================================================
5. BACKEND EXTRACTION
=====================================================================

Review and isolate the StudioFlow-required
changes identified in TPI-064.

Includes:

- Workspace persistence.
- Workspace snapshots.
- Recovery snapshots.
- Production-lock endpoints.
- Room production guards.
- Broadcast/workspace linkage.
- Studio asset normalization.
- Required authentication integration.
- Required Worker routing.

Do not blindly copy or replace whole files.

Do not remove Administration functionality.

Do not modify unrelated community features.

Do not change production authentication
semantics without an explicit documented
dependency and verification.

IMPORTANT:

A clean StudioFlow checkpoint may require
selected Git hunks rather than rewriting code.

Prefer preserving correct existing code
and preparing an exact patch/manifest.

If no source edits are necessary, make none.

=====================================================================
6. RELEASE PATCH PREPARATION
=====================================================================

Create a proposed StudioFlow backend patch
or exact hunk selection manifest.

The manifest must identify:

- Target file.
- Required functions.
- Exact changed hunks.
- Shared dependencies.
- Excluded changes.
- Expected resulting behavior.
- Required verification.

Do not apply the patch to a separate branch.

Do not stage the patch.

Do not commit.

=====================================================================
7. MIGRATION 0053
=====================================================================

Review the migration dependency.

Determine whether StudioFlow production-lock
routes require schema 0053 before activation.

Document:

- Required migration order.
- Compatibility requirements.
- Backup requirements.
- Recovery strategy.
- Production verification steps.

Do not apply the migration.

Do not access production D1.

=====================================================================
8. VERIFICATION
=====================================================================

Run relevant local/offline checks:

- JavaScript syntax.
- StudioFlow API tests.
- Authentication regression tests.
- Local Worker routing tests.
- StudioFlow bridge tests.
- Integration manifest checks.
- git diff --check.

Do not access production.

Do not run uncontrolled network requests.

If existing tests cannot verify the required
behavior, report the gap.

=====================================================================
9. MASTER DEVELOPMENT DOCUMENTATION
=====================================================================

Update:

docs/TPI-MASTER-DEVELOPMENT/
03-TPI-CREATOR-SYSTEMS/
01-TPI-CREATOR-STUDIO.md

docs/TPI-MASTER-DEVELOPMENT/
00-MASTER-DEVELOPMENT-CONTROL/
04-SHARED-DEPENDENCIES.md

docs/TPI-DEVELOPMENT/
100-DIRECTIVES/
DIRECTIVE-INDEX.md

docs/TPI-DEVELOPMENT/
TPI-CURRENT-DEVELOPMENT-STATUS.md

Create:

docs/TPI-DEVELOPMENT/
300-COMPLETED-WORK/
TPI-065-RESULT.md

Document:

- Exact code changes, if any.
- Local guard handling.
- StudioFlow backend manifest.
- Verification results.
- Release blockers.
- Next action.

Do not mark StudioFlow production-ready.

=====================================================================
10. STRICT PROHIBITIONS
=====================================================================

DO NOT:

- Stage files.
- Commit.
- Push.
- Pull.
- Fetch.
- Merge.
- Rebase.
- Reset.
- Clean.
- Stash.
- Create branches.
- Create worktrees.
- Deploy.
- Apply migrations.
- Modify Cloudflare.
- Access owner production data.
- Modify owner workspaces.
- Modify recordings or backups.
- Delete unrelated code.

=====================================================================
11. REQUIRED RESULT
=====================================================================

TPI-065 RESULT

A. REPOSITORY STATE

B. PRE-CHANGE SAFETY RECORD

C. LOCAL REQUEST GUARD FINDINGS

D. BACKEND EXTRACTION DECISION

E. EXACT RELEASE PATCH / HUNK MANIFEST

F. MIGRATION DEPENDENCIES

G. VERIFICATION RESULTS

H. DOCUMENTATION UPDATED

I. REMAINING BLOCKERS

J. NEXT RECOMMENDED ACTION

Provide exactly one next recommended action.

=====================================================================
FINAL INSTRUCTION
=====================================================================

Prepare the smallest production-safe StudioFlow
backend release change set.

Preserve all existing Administration,
community, website, and local-development work.

Do not stage, commit, push, or deploy.

If safe extraction requires an additional
controlled step, explain it rather than
risking unrelated development.

=====================================================================
END DIRECTIVE — TPI-065
=====================================================================
