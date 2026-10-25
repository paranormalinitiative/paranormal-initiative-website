# TPI-064 — STUDIOFLOW BACKEND SEPARATION & RELEASE MANIFEST

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 20:46.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
THE PARANORMAL INITIATIVE
DIRECTIVE: TPI-064
STUDIOFLOW BACKEND SEPARATION & RELEASE MANIFEST
=====================================================================

PRIORITY:
HIGH

ACTIVE MISSION:
TPI CREATOR STUDIO / STUDIOFLOW

STATUS:
AUTHORIZED — READ-ONLY CODE AUDIT AND DOCUMENTATION

=====================================================================
1. OBJECTIVE
=====================================================================

Prepare an exact, safe StudioFlow website integration
checkpoint without including unrelated website,
Administration Panel, or community development.

TPI-063 established the Master Development System.

This directive returns implementation focus to
TPI Creator Studio.

DO NOT STAGE OR COMMIT ANY FILES.

DO NOT DEPLOY.

=====================================================================
2. REPOSITORY
=====================================================================

/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

Expected branch:

codex/tpi-development

Expected HEAD:

7385f0cf24155f121bdc967a0985553daa8a05df

Authoritative StudioFlow source:

/Users/toddknipple/Documents/StudioFlow/web

Approved source commit:

a919a881705c4f21dc184a6f2af8a5096d68e5f4

Verify current repository state.

=====================================================================
3. SHARED BACKEND AUDIT
=====================================================================

Inspect:

functions/api/[[path]].js
worker.js
lib/auth.js

Perform a detailed hunk-level analysis.

For every changed hunk, identify:

- Exact file.
- Relevant function.
- Changed line ranges.
- Associated module.
- Dependencies.
- Whether StudioFlow requires it.
- Whether Administration requires it.
- Whether it affects authentication.
- Whether it affects existing production behavior.
- Whether it can be isolated safely.

Classify each hunk:

A. StudioFlow-specific.

B. Administration-specific.

C. Shared infrastructure.

D. Other website development.

E. Local-development-only.

F. Unknown / requires investigation.

Do not assume that every StudioFlow-related
change is safe to deploy.

=====================================================================
4. RELEASE DEPENDENCY ANALYSIS
=====================================================================

Determine which backend changes are necessary
for the current StudioFlow integration.

Identify dependencies involving:

- StudioFlow project persistence.
- Autosave.
- Workspace snapshots.
- Recovery.
- Backup/export.
- Guest signaling.
- Room sessions.
- Authentication.
- Recording permissions.
- Media storage.
- Production locks.

Identify whether StudioFlow backend changes
can be committed independently.

If changes cannot safely be separated,
explain the exact reason.

=====================================================================
5. WEBSITE INTEGRATION MANIFEST
=====================================================================

Prepare a file-by-file proposed checkpoint.

Include only necessary StudioFlow:

- Runtime entry points.
- Integration bridges.
- Verified generated assets.
- Build/staging scripts.
- Verification scripts.
- Relevant documentation.
- Required backend changes.

Separate:

REQUIRED
OPTIONAL
DEFERRED
EXCLUDED

Do not stage any files.

Do not remove historical bundles.

Do not modify generated assets.

=====================================================================
6. MIGRATION 0053
=====================================================================

Review:

migrations/
0053_studioflow_creator_production_lock.sql

Determine:

- Whether the migration is required for the
  current release.
- Which backend changes depend on it.
- Whether it is additive.
- Whether existing data is preserved.
- Whether production compatibility is proven.
- What backup and rollback procedures are needed.

Do not apply the migration.

Do not access production databases.

Clearly distinguish:

COMMITTING A MIGRATION FILE

from:

EXECUTING A MIGRATION.

=====================================================================
7. MASTER DEVELOPMENT REGISTRY
=====================================================================

Consult:

docs/TPI-MASTER-DEVELOPMENT/

Use the new module ownership records.

Update the Creator Studio development record
with the findings.

Update shared dependency records where necessary.

Do not mark StudioFlow production-ready.

=====================================================================
8. SECURITY EXCLUSIONS
=====================================================================

Exclude:

- .dev.vars
- wrangler.local.toml
- scripts/local-dev.env
- .local-dev/
- Local databases.
- Credentials.
- Tokens.
- Owner media.
- Recordings.
- Browser storage.
- Temporary fixtures.
- Unrelated website files.

Do not expose sensitive values in reports.

=====================================================================
9. VERIFICATION
=====================================================================

Perform applicable offline checks.

Verify:

- Exact source/build correspondence.
- StudioFlow integration references.
- Required bridge preservation.
- No unintended file changes.
- No unrelated backend modifications.
- No sensitive files in the proposed manifest.

Do not contact production resources.

=====================================================================
10. DOCUMENTATION
=====================================================================

Create:

docs/TPI-DEVELOPMENT/
300-COMPLETED-WORK/
TPI-064-RESULT.md

Update:

docs/TPI-DEVELOPMENT/
100-DIRECTIVES/DIRECTIVE-INDEX.md

docs/TPI-DEVELOPMENT/
TPI-CURRENT-DEVELOPMENT-STATUS.md

Update the relevant Creator Studio and
shared infrastructure module records under:

docs/TPI-MASTER-DEVELOPMENT/

Documentation-only writes are authorized.

No staging or commits.

=====================================================================
11. REQUIRED RESULT
=====================================================================

TPI-064 RESULT

A. REPOSITORY STATE

B. BACKEND HUNK CLASSIFICATION

C. STUDIOFLOW REQUIRED DEPENDENCIES

D. ADMINISTRATION / OTHER EXCLUSIONS

E. PROPOSED CHECKPOINT MANIFEST

F. MIGRATION 0053 ASSESSMENT

G. SECURITY REVIEW

H. VERIFICATION RESULTS

I. MASTER REGISTRY UPDATES

J. REMAINING RELEASE BLOCKERS

K. NEXT RECOMMENDED ACTION

Provide exactly one recommended next action.

=====================================================================
12. STRICT PROHIBITIONS
=====================================================================

DO NOT:

- Modify application code.
- Stage.
- Commit.
- Push.
- Pull.
- Fetch.
- Merge.
- Rebase.
- Reset.
- Clean.
- Stash.
- Create branches or worktrees.
- Deploy.
- Apply migrations.
- Modify Cloudflare.
- Access owner production data.
- Modify recordings or backups.

=====================================================================
FINAL INSTRUCTION
=====================================================================

The Paranormal Initiative now has an
authoritative modular development registry.

Use it to prepare the smallest safe StudioFlow
website integration checkpoint.

Preserve all unrelated work.

Do not stage, commit, or deploy.

Return an exact proposed release manifest
for owner review.

=====================================================================
END DIRECTIVE — TPI-064
=====================================================================
