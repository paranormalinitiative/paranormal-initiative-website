# TPI-STUDIOFLOW-058 — AUTHORITATIVE SOURCE REPOSITORY CHECKPOINT PREPARATION

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 19:51.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
THE PARANORMAL INITIATIVE
TPI-STUDIOFLOW-058
AUTHORITATIVE SOURCE REPOSITORY CHECKPOINT PREPARATION
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

PRIORITY:
HIGH

DIRECTIVE TYPE:
Source Control / Release Preparation

STATUS:
AUTHORIZED FOR INVESTIGATION AND PREPARATION ONLY

=====================================================================
1. OBJECTIVE
=====================================================================

Prepare the authoritative StudioFlow source repository
for its first reviewed release checkpoint following
TPI-STUDIOFLOW-055, 056, and 057.

The objective is to establish a safe, reproducible,
documented source-code baseline before creating the
corresponding website integration checkpoint.

THIS DIRECTIVE HAS ONE PURPOSE:

Inspect, validate, and prepare the authoritative
StudioFlow source changes for an owner-approved
Git commit.

DO NOT CREATE THE COMMIT YET.

=====================================================================
2. AUTHORITATIVE SOURCE REPOSITORY
=====================================================================

SOURCE LOCATION:

/Users/toddknipple/Documents/StudioFlow/web

EXPECTED BRANCH:

main

PREVIOUSLY REPORTED HEAD:

8437b071c2bf1eda3d9df44dca53f95f08e6b032

PREVIOUSLY REPORTED MODIFIED FILES:

src/App.tsx
src/styles.css

IMPORTANT:

These values are historical reference points.

Verify the actual current repository state before
making assumptions.

Do not reset the repository to these values.

=====================================================================
3. GIT REPOSITORY INSPECTION
=====================================================================

Inspect:

- Current branch.
- Current HEAD.
- Working-tree status.
- Modified tracked files.
- Untracked files.
- Staged changes, if any.
- Existing remotes.
- Recent commit history.
- Ignore rules.

Identify whether any additional changes have
appeared since TPI-STUDIOFLOW-057.

Do not modify or discard unexpected changes.

If unrelated changes exist, classify them
separately and exclude them from the proposed
StudioFlow checkpoint.

=====================================================================
4. SOURCE CHANGE REVIEW
=====================================================================

Perform a detailed review of the current source diff.

Pay particular attention to:

src/App.tsx
src/styles.css

Identify changes associated with:

- StudioFlow project management.
- Save Project.
- Import Project Configuration.
- Project library behavior.
- Studio switching.
- Compositor behavior.
- Intro and outro playback.
- Guest integration.
- Current StudioFlow UI.
- Recent TPI fixes.

Confirm that the TPI-STUDIOFLOW-057 correction
remains present:

Intro and outro compositor clips must not loop.

Verify that the implementation does not introduce
unintended playback regressions.

Classify changes as:

A. Required StudioFlow source changes.

B. Required supporting changes.

C. Unrelated changes.

D. Changes requiring owner review.

Do not silently include unrelated modifications.

=====================================================================
5. SOURCE BUILD VERIFICATION
=====================================================================

Use the existing authoritative build process.

Run:

- TypeScript validation.
- Vite production build.
- Relevant source-level checks.
- Existing applicable verification scripts.

Do not install unnecessary dependencies.

Do not update package versions unless an existing
dependency is demonstrably preventing validation.

Record:

- Build command.
- Build result.
- Warnings.
- Generated asset names.
- Source revision.
- Source diff fingerprint.

A successful build must not be represented as
proof of production readiness.

=====================================================================
6. WEBSITE INTEGRATION COMPATIBILITY
=====================================================================

Perform a read-only compatibility review against:

/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

Verify that the current authoritative source
corresponds to the integrated StudioFlow build
from TPI-STUDIOFLOW-057.

Previously reported integrated JavaScript asset:

studio/assets/index-AccwBwcd.js

Verify the current actual asset references rather
than assuming the historical filename is current.

Check that:

- The source can reproduce the integrated bundle.
- The staging process remains compatible.
- Required TPI bridges remain referenced.
- No source changes would invalidate the current
  website integration.

DO NOT modify the website repository.

DO NOT restage generated website assets.

If a mismatch is discovered, document it rather
than expanding this directive into another repair.

=====================================================================
7. CHECKPOINT CONTENTS
=====================================================================

Prepare an exact proposed source checkpoint manifest.

For each candidate file, report:

- File path.
- Change classification.
- Reason for inclusion.
- Whether it contains unrelated changes.
- Whether it is safe to include.

Determine whether the proposed checkpoint can be
created without including unrelated modifications.

If mixed changes exist, identify the exact hunks
that should be included or excluded.

Do not stage files.

Do not create commits.

=====================================================================
8. REPRODUCIBILITY AND PROVENANCE
=====================================================================

Record:

- Repository path.
- Branch.
- Current HEAD.
- Proposed checkpoint files.
- Source diff fingerprint.
- Build commands.
- Build results.
- Corresponding website integration asset names.

Determine whether the current source tree can
reproduce the website integration build.

If reproducibility depends on uncommitted changes,
document that dependency explicitly.

Do not modify Git history.

=====================================================================
9. SECURITY AND DATA PROTECTION
=====================================================================

Inspect the proposed checkpoint for accidental
inclusion of:

- API credentials.
- Authentication secrets.
- Environment files.
- Local databases.
- Private configuration.
- Owner media.
- Recordings.
- Recovery snapshots.
- Browser storage.
- Generated temporary files.

Do not display secret values.

Exclude any sensitive or local-only material
from the proposed checkpoint.

Do not delete excluded files.

=====================================================================
10. STRICT PROTECTION REQUIREMENTS
=====================================================================

DO NOT:

- Commit.
- Push.
- Pull.
- Fetch.
- Merge.
- Rebase.
- Reset.
- Clean.
- Stash.
- Switch branches.
- Create tags.
- Deploy.
- Modify Cloudflare resources.
- Modify production D1 or R2.
- Modify owner studios.
- Modify Crossroads of the Unknown.
- Delete recordings or media.
- Clear browser storage.
- Modify unrelated website features.

Do not rewrite source files simply to make
the working tree appear cleaner.

Do not modify Git configuration.

This directive is preparation and verification only.

=====================================================================
11. DOCUMENTATION SYNCHRONIZATION
=====================================================================

Follow the permanent TPI documentation policy.

Update the existing authoritative Markdown records
in the website documentation repository.

DOCUMENTATION-ONLY WRITES ARE AUTHORIZED.

Update:

docs/TPI-DEVELOPMENT/
  100-DIRECTIVES/DIRECTIVE-INDEX.md

docs/TPI-DEVELOPMENT/
  TPI-CURRENT-DEVELOPMENT-STATUS.md

Create the appropriate TPI-STUDIOFLOW-058 result
document under:

docs/TPI-DEVELOPMENT/
  300-COMPLETED-WORK/

Record:

- Current source repository state.
- Reviewed source changes.
- Build results.
- Reproducibility evidence.
- Proposed checkpoint contents.
- Excluded files.
- Remaining risks.
- Owner approval requirement.

Preserve historical reports.

Do not claim a checkpoint was committed.

Do not stage or commit documentation changes.

=====================================================================
12. REQUIRED VALIDATION
=====================================================================

Before reporting completion:

1. Confirm source repository status.

2. Confirm the current source diff.

3. Confirm source build results.

4. Confirm compositor intro/outro behavior.

5. Confirm website integration compatibility.

6. Confirm checkpoint manifest completeness.

7. Confirm sensitive files are excluded.

8. Confirm no Git commit was created.

9. Confirm no Git push occurred.

10. Confirm no production resources were modified.

11. Confirm Markdown documentation was updated.

12. Run git diff --check where applicable.

=====================================================================
13. REQUIRED RESULT FORMAT
=====================================================================

TPI-STUDIOFLOW-058 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. SOURCE REPOSITORY STATE

- Repository:
- Branch:
- HEAD:
- Modified files:
- Untracked files:
- Staged files:

B. SOURCE DIFF REVIEW

- Changes identified:
- Required changes:
- Unrelated changes:
- Owner-review items:

C. BUILD VERIFICATION

- TypeScript:
- Vite:
- Warnings:
- Generated assets:

D. TPI-057 REGRESSION VERIFICATION

- Intro playback:
- Outro playback:
- Project management:
- Other applicable checks:

E. WEBSITE INTEGRATION COMPATIBILITY

- Current website asset:
- Source/build correspondence:
- TPI bridge compatibility:
- Remaining discrepancies:

F. PROPOSED SOURCE CHECKPOINT

- Exact files:
- Inclusion rationale:
- Exclusions:
- Mixed hunks:
- Recommended commit description:

G. SECURITY REVIEW

- Sensitive files:
- Excluded material:
- Remaining concerns:

H. DOCUMENTATION UPDATED

- Markdown files modified:
- Directive index:
- Current status:
- Result document:

I. OWNER APPROVAL REQUIRED

State explicitly whether the proposed checkpoint
is ready for owner authorization.

J. NEXT RECOMMENDED ACTION

Provide one recommended next action only.

=====================================================================
14. COMPLETION CONDITIONS
=====================================================================

Mark COMPLETE only when:

- The source changes have been reviewed.
- The source builds successfully.
- Relevant regressions have been checked.
- Website integration compatibility is verified.
- The proposed checkpoint manifest is complete.
- Security exclusions are documented.
- Markdown records are synchronized.
- No commit or push has occurred.

If any condition cannot be verified, report
PARTIAL or BLOCKED with the exact reason.

=====================================================================
FINAL INSTRUCTION
=====================================================================

Prepare the authoritative StudioFlow source
repository for a safe, reviewed Git checkpoint.

DO NOT COMMIT.

DO NOT PUSH.

DO NOT DEPLOY.

DO NOT MODIFY PRODUCTION.

Preserve all existing owner data and development
work.

Return the complete TPI-STUDIOFLOW-058 report
for owner review before proceeding.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-058
=====================================================================
