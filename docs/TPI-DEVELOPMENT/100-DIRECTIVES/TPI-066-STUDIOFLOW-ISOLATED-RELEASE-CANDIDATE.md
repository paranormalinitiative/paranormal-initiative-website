# TPI-066 — STUDIOFLOW ISOLATED RELEASE CANDIDATE

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 21:07.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
THE PARANORMAL INITIATIVE
DIRECTIVE: TPI-066
STUDIOFLOW ISOLATED RELEASE CANDIDATE
=====================================================================

PRIORITY:
CRITICAL

ACTIVE MISSION:
TPI CREATOR STUDIO / STUDIOFLOW

STATUS:
AUTHORIZED — ISOLATED RELEASE CANDIDATE PREPARATION

=====================================================================
1. OBJECTIVE
=====================================================================

Prepare a production-safe StudioFlow release candidate
without including unrelated website development.

TPI-065 completed the outbound-fetch extraction but
identified remaining mixed backend changes.

This directive authorizes creation of an isolated
release candidate.

DO NOT COMMIT.
DO NOT PUSH.
DO NOT DEPLOY.
DO NOT APPLY PRODUCTION MIGRATIONS.

=====================================================================
2. SOURCE REPOSITORIES
=====================================================================

WEBSITE:

/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

Expected branch:

codex/tpi-development

Expected HEAD:

7385f0cf24155f121bdc967a0985553daa8a05df

STUDIOFLOW SOURCE:

/Users/toddknipple/Documents/StudioFlow/web

Expected approved commit:

a919a881705c4f21dc184a6f2af8a5096d68e5f4

Verify repository states.

If they differ, stop and report.

=====================================================================
3. PRESERVE THE EXISTING WEBSITE WORKTREE
=====================================================================

The current website repository contains substantial
uncommitted development.

Preserve every existing modification.

Do not:

- Reset.
- Clean.
- Stash.
- Overwrite.
- Delete.
- Move existing source files.
- Stage existing worktree changes.

Record the initial Git status and file hashes.

=====================================================================
4. ISOLATED RELEASE CANDIDATE
=====================================================================

Create a separate Git worktree from the verified
website HEAD.

Suggested location:

/Users/toddknipple/Documents/GitHub/
tpi-studioflow-release-candidate

Suggested branch:

codex/studioflow-release-candidate

Before creation:

- Verify the destination does not exist.
- Verify the branch does not already exist.
- Verify the baseline is correct.

If any condition is uncertain, stop.

The release candidate must begin from the clean,
verified website baseline.

Do not copy the entire dirty website worktree.

=====================================================================
5. CONTROLLED STUDIOFLOW EXTRACTION
=====================================================================

Using the TPI-064 and TPI-065 findings,
construct an explicit release manifest.

Copy or apply only the required StudioFlow changes
into the isolated worktree.

Include:

- StudioFlow runtime entry point.
- Current approved JS/CSS assets.
- Required bridge files.
- Workspace persistence.
- Snapshot and recovery functionality.
- Production session endpoints.
- Broadcast/workspace linkage.
- Required Worker routing.
- Required authentication integration.
- Production-safe outbound-fetch dependency.
- Required verification scripts.

Do not copy unrelated Administration, community,
article, scraper, or website changes.

For shared backend files:

- Extract individual required changes.
- Preserve existing baseline functionality.
- Avoid whole-file replacement.
- Record exact functions and patches applied.

If safe extraction is not possible, report BLOCKED.

=====================================================================
6. OUTBOUND FETCH SECURITY
=====================================================================

Review:

lib/outbound-fetch.js

Confirm:

- Production compatibility.
- Safe default behavior.
- Local development protection.
- No unintended outbound requests.
- No credential exposure.
- No security regression.

Do not remove local protections from the
original development environment.

=====================================================================
7. MIGRATION 0053
=====================================================================

Include the migration file in the proposed
release candidate only if its schema is required
by the selected StudioFlow backend code.

If included:

- Do not execute it.
- Verify SQL syntax where possible.
- Document schema dependencies.
- Document backup requirements.
- Document rollback/recovery limitations.
- Document the intended migration order.

Do not access production D1.

=====================================================================
8. LOCAL WORKER READINESS
=====================================================================

Investigate the TPI-065 startup failures.

Determine why local HTTP probes to:

/

and

/studio/

failed.

Check:

- Worker process.
- Port binding.
- Startup logs.
- Local configuration.
- Asset routing.
- Required environment variables.

Do not modify global system services.

Do not modify LaunchAgents.

Do not contact production endpoints.

Use isolated local ports if runtime testing
requires starting the release candidate.

If the Worker cannot start, document the
exact blocker.

=====================================================================
9. VERIFICATION
=====================================================================

Run applicable checks against the isolated
release candidate:

- JavaScript syntax.
- StudioFlow API tests.
- Authentication regression.
- Worker routing.
- StudioFlow bridges.
- Source/build correspondence.
- Local HTTP readiness.
- Production-session logic.
- Backup/recovery contracts.
- Security checks.
- git diff --check.

Document every test result.

Do not claim production readiness based solely
on local tests.

=====================================================================
10. RELEASE MANIFEST
=====================================================================

Create an exact release manifest containing:

- File path.
- Change purpose.
- Originating source.
- Required dependency.
- Test evidence.
- Excluded unrelated changes.
- Migration requirements.
- Remaining production blockers.

Verify no local-only secrets or data are included.

=====================================================================
11. DOCUMENTATION
=====================================================================

Update the master development records for
Creator Studio and shared dependencies.

Create:

docs/TPI-DEVELOPMENT/
300-COMPLETED-WORK/
TPI-066-RESULT.md

Update:

docs/TPI-DEVELOPMENT/
100-DIRECTIVES/
DIRECTIVE-INDEX.md

docs/TPI-DEVELOPMENT/
TPI-CURRENT-DEVELOPMENT-STATUS.md

Documentation changes in the original website
worktree are allowed only for these records.

Do not copy the entire master development
documentation tree into the release candidate
unless explicitly required.

=====================================================================
12. STRICT PROHIBITIONS
=====================================================================

DO NOT:

- Stage changes.
- Commit.
- Push.
- Deploy.
- Apply production migrations.
- Modify Cloudflare.
- Access production D1 or R2.
- Modify owner workspaces.
- Modify recordings.
- Modify backups.
- Modify browser storage.
- Delete unrelated files.
- Modify the original website source.

=====================================================================
13. REQUIRED RESULT
=====================================================================

TPI-066 RESULT

A. ORIGINAL REPOSITORY STATE

B. ISOLATED WORKTREE CREATED

C. EXACT RELEASE MANIFEST

D. SHARED BACKEND EXTRACTION

E. OUTBOUND-FETCH SECURITY

F. MIGRATION 0053 DECISION

G. LOCAL WORKER READINESS

H. VERIFICATION RESULTS

I. EXCLUDED CHANGES

J. REMAINING PRODUCTION BLOCKERS

K. NEXT RECOMMENDED ACTION

Provide exactly one recommended next action.

=====================================================================
COMPLETION REQUIREMENTS
=====================================================================

Mark COMPLETE only if:

- The original worktree is preserved.
- The isolated release candidate exists.
- Required StudioFlow changes are extracted.
- Shared backend dependencies are resolved.
- No unrelated development is included.
- Local verification passes.
- No secrets or owner data are included.
- No commits, pushes, or deployments occurred.

Otherwise report PARTIAL or BLOCKED.

=====================================================================
END DIRECTIVE — TPI-066
=====================================================================
