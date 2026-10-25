# TPI-STUDIOFLOW-062 — WEBSITE REPOSITORY INVESTIGATION & CHANGE-CONTROL AUDIT

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
THE PARANORMAL INITIATIVE
TPI-STUDIOFLOW-062
WEBSITE REPOSITORY INVESTIGATION & CHANGE-CONTROL AUDIT
=====================================================================

PRIORITY:
CRITICAL

STATUS:
AUTHORIZED — INVESTIGATION ONLY

PROJECT:
The Paranormal Initiative

=====================================================================
1. OBJECTIVE
=====================================================================

Investigate the large number of modified and
untracked files in the TPI website repository.

The owner is concerned that these changes may
originate from Administration Panel development
or other previously completed website projects.

We must determine:

1. What these files actually are.

2. Which TPI system they belong to.

3. Why they remain uncommitted.

4. Whether they represent completed development,
   unfinished work, generated artifacts, or
   temporary files.

5. Whether multiple development efforts have
   unintentionally become mixed together.

6. How to prevent this from happening again.

DO NOT CLEAN UP OR COMMIT ANYTHING.

THIS IS AN INVESTIGATION.

=====================================================================
2. TARGET REPOSITORY
=====================================================================

/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

Expected branch:

codex/tpi-development

Previously reported HEAD:

7385f0cf24155f121bdc967a0985553daa8a05df

Previously reported:

37 modified tracked files
269 untracked paths
0 staged files

Verify the actual current state.

Do not assume these counts remain unchanged.

=====================================================================
3. COMPLETE CHANGE INVENTORY
=====================================================================

Inventory every modified and untracked path.

Do not summarize away important files.

For each file, determine:

- Exact path.
- Git status.
- File type.
- Approximate size.
- Associated TPI subsystem.
- Whether it appears generated or hand-authored.
- Whether it is referenced by active code.
- Whether it contains potentially sensitive material.
- Whether it is required by an existing feature.
- Whether its purpose is known or uncertain.

Produce a complete inventory in Markdown.

Do not display credential values or private data.

=====================================================================
4. ADMINISTRATION PANEL INVESTIGATION
=====================================================================

Specifically investigate whether changed files
belong to:

- Administration Panel.
- Contributor Portal.
- User account management.
- Authentication and authorization.
- Article management.
- Content publishing.
- Contributor permissions.
- Administrative dashboards.
- Website configuration.
- Admin API endpoints.
- Admin-related database migrations.

Identify exact paths and relevant Git history.

Determine whether these changes appear to
come from prior Administration Panel development.

Do not claim attribution without evidence.

Distinguish:

CONFIRMED
LIKELY
UNKNOWN

=====================================================================
5. STUDIOFLOW INVESTIGATION
=====================================================================

Identify changes associated with:

- StudioFlow frontend.
- StudioFlow backend.
- StudioFlow authentication.
- StudioFlow project persistence.
- StudioFlow backup and recovery.
- Guest rooms.
- StudioFlow production locks.
- StudioFlow verification.
- StudioFlow documentation.

Determine whether any StudioFlow changes
overlap Administration Panel functionality.

Identify mixed-purpose files.

Do not modify them.

=====================================================================
6. OTHER WEBSITE DEVELOPMENT
=====================================================================

Identify changes belonging to other TPI work,
including where applicable:

- Public website pages.
- Educational content.
- Repository books.
- Contributor features.
- Article publishing.
- Website redesign.
- Other applications.
- Development tooling.
- Testing.
- Documentation.
- Experimental features.

Group changes by actual subsystem.

Do not assume every file belongs to StudioFlow.

=====================================================================
7. GIT HISTORY INVESTIGATION
=====================================================================

Perform a read-only review of local Git history.

Investigate:

- Recent commits.
- Existing development branches.
- Prior Administration Panel commits.
- StudioFlow-related commits.
- Relevant file history.
- Current uncommitted changes.

Determine whether the repository has been used
for several projects without corresponding
Git checkpoints.

Where possible, identify when changes were
introduced.

Use Git history and available documentation
as evidence.

IMPORTANT:

File modification timestamps alone do not
prove who or what created a change.

Do not invent historical attribution.

=====================================================================
8. UNTRACKED FILE ANALYSIS
=====================================================================

Determine why 269 untracked paths were reported.

Separate:

A. Legitimate new source files.

B. Legitimate documentation.

C. Generated build assets.

D. Temporary development artifacts.

E. Local-only configuration.

F. Sensitive or private files.

G. Historical files.

H. Unknown files.

Identify directories responsible for the
largest portions of the count.

Determine whether existing .gitignore rules
are insufficient.

Do not modify .gitignore yet.

Do not delete or move any files.

=====================================================================
9. MIXED BACKEND FILE ANALYSIS
=====================================================================

Review:

functions/api/[[path]].js
worker.js
lib/auth.js

Determine which changes belong to:

- Administration Panel.
- StudioFlow.
- Shared authentication.
- Contributor Portal.
- Other website systems.

Identify whether the changes are separable
into independent commits.

Document hunk-level boundaries.

Do not stage or rewrite code.

=====================================================================
10. RISK ASSESSMENT
=====================================================================

Identify risks involving:

- Accidental inclusion of unrelated changes.
- Uncommitted completed development.
- Loss of work.
- Authentication regressions.
- Administration Panel regressions.
- Production deployment contamination.
- Generated assets becoming stale.
- Local secrets entering Git.
- Multiple agents editing the same repository.
- Conflicting development branches.
- Missing rollback checkpoints.

Rank risks:

CRITICAL
HIGH
MEDIUM
LOW

Explain the evidence for each rating.

=====================================================================
11. PREVENTION STRATEGY
=====================================================================

Design a practical TPI change-control policy.

The policy must address:

A. Project ownership

Each development task must identify the
repository and subsystem it owns.

B. Pre-task Git inspection

Agents must inspect repository status before
modifying files.

C. File-scope boundaries

Agents must declare intended file modifications.

D. Unexpected changes

Agents must stop before modifying files
outside their authorized scope.

E. Commit discipline

Completed work must receive reviewed
Git checkpoints.

F. Multi-agent coordination

Multiple agents must not unknowingly modify
the same working tree.

G. Generated files

Define which generated assets belong in Git.

H. Local-only files

Define what must remain excluded.

I. Documentation

Maintain the authoritative TPI development
records after every completed directive.

J. Production protection

No deployment without explicit authorization
and a reviewed release checkpoint.

K. Recovery

Document how to recover safely from
uncommitted or mixed development.

L. Worktree isolation

Evaluate whether separate Git worktrees,
branches, or development directories would
prevent future cross-project contamination.

Recommend the simplest safe arrangement.

DO NOT IMPLEMENT THE POLICY YET.

=====================================================================
12. PROPOSED REPOSITORY ORGANIZATION
=====================================================================

Evaluate a practical structure for:

- Website development.
- Administration Panel development.
- StudioFlow integration.
- Shared backend/API development.
- Production release preparation.

Determine whether these should use:

- Separate branches.
- Separate Git worktrees.
- Separate repositories where appropriate.
- Shared integration checkpoints.

Do not restructure repositories.

Do not create or delete branches.

Do not create worktrees.

Provide recommendations only.

=====================================================================
13. DOCUMENTATION
=====================================================================

Create:

docs/TPI-DEVELOPMENT/
300-COMPLETED-WORK/
TPI-STUDIOFLOW-062-RESULT.md

Also create a detailed inventory document:

docs/TPI-DEVELOPMENT/
TPI-WEBSITE-REPOSITORY-CHANGE-INVENTORY.md

Update:

docs/TPI-DEVELOPMENT/
100-DIRECTIVES/DIRECTIVE-INDEX.md

docs/TPI-DEVELOPMENT/
TPI-CURRENT-DEVELOPMENT-STATUS.md

Documentation-only writes are authorized.

Record:

- Full file inventory.
- Subsystem classification.
- Administration Panel findings.
- StudioFlow findings.
- Untracked file analysis.
- Mixed backend findings.
- Risk assessment.
- Proposed prevention policy.
- Recommended repository organization.
- Remaining uncertainties.

Preserve historical records.

Do not stage or commit documentation.

=====================================================================
14. STRICT PROHIBITIONS
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
- Delete files.
- Move files.
- Modify application code.
- Modify .gitignore.
- Create branches.
- Create worktrees.
- Deploy.
- Modify Cloudflare.
- Apply database migrations.
- Modify production resources.
- Access or modify owner data.
- Delete recordings or backups.

Do not run destructive Git commands.

Do not perform uncontrolled remote requests.

=====================================================================
15. REQUIRED RESULT
=====================================================================

TPI-STUDIOFLOW-062 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. REPOSITORY STATE

B. COMPLETE FILE INVENTORY

C. ADMINISTRATION PANEL FINDINGS

D. STUDIOFLOW FINDINGS

E. OTHER WEBSITE DEVELOPMENT

F. GIT HISTORY FINDINGS

G. UNTRACKED FILE ANALYSIS

H. MIXED BACKEND FINDINGS

I. RISK ASSESSMENT

J. CHANGE-CONTROL POLICY

K. REPOSITORY ORGANIZATION RECOMMENDATION

L. DOCUMENTATION UPDATED

M. NEXT RECOMMENDED ACTION

Provide one recommended next action only.

=====================================================================
16. COMPLETION CONDITIONS
=====================================================================

Mark COMPLETE only when:

- Every changed and untracked path is inventoried.
- Administration Panel changes are identified
  as far as evidence permits.
- StudioFlow changes are identified.
- Other subsystem changes are classified.
- Mixed backend files are analyzed.
- Git history has been reviewed.
- Untracked file causes are explained.
- Risks are documented.
- A prevention strategy is proposed.
- Markdown documentation is synchronized.
- No application or Git state was changed.

=====================================================================
FINAL INSTRUCTION
=====================================================================

The owner wants to understand why the website
repository contains so many uncommitted changes.

Investigate the actual cause.

Determine whether Administration Panel work
contributed to the situation.

Do not assume the answer.

Do not clean, commit, or deploy anything.

Preserve every existing file.

Provide a complete, evidence-based report and
a practical plan to prevent recurrence.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-062
=====================================================================
