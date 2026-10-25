# TPI-STUDIOFLOW-060 — AUTHORIZED SOURCE CHECKPOINT COMMIT

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 20:00.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
THE PARANORMAL INITIATIVE
TPI-STUDIOFLOW-060
AUTHORIZED SOURCE CHECKPOINT COMMIT
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

PRIORITY:
HIGH

AUTHORIZATION:
OWNER APPROVED

DIRECTIVE TYPE:
Git Source Control / Release Checkpoint

=====================================================================
1. OBJECTIVE
=====================================================================

Create the first reviewed local Git checkpoint for
the authoritative StudioFlow source repository.

The owner has explicitly authorized committing
the two files reviewed and staged under:

TPI-STUDIOFLOW-058
TPI-STUDIOFLOW-059

THIS DIRECTIVE AUTHORIZES ONE LOCAL COMMIT ONLY.

No additional development work is authorized.

=====================================================================
2. AUTHORITATIVE REPOSITORY
=====================================================================

Repository:

/Users/toddknipple/Documents/StudioFlow/web

Expected branch:

main

Expected HEAD:

8437b071c2bf1eda3d9df44dca53f95f08e6b032

Expected staged files:

src/App.tsx
src/styles.css

Expected staged changes:

2 files changed
311 insertions
61 deletions

=====================================================================
3. PRE-COMMIT SAFETY CHECK
=====================================================================

Before committing, verify:

1. Repository path is correct.

2. Current branch is main.

3. HEAD matches the expected revision.

4. Exactly two files are staged.

5. The staged files are:

   src/App.tsx
   src/styles.css

6. No unrelated files are staged.

7. No unexpected source changes occurred.

8. git diff --cached --check passes.

9. No sensitive files or credentials are staged.

10. The staged diff matches the reviewed
    TPI-STUDIOFLOW-059 checkpoint.

If any condition fails:

STOP.

Do not commit.

Report the discrepancy.

=====================================================================
4. AUTHORIZED COMMIT
=====================================================================

If all safety checks pass, create exactly
one local Git commit.

Commit message:

feat(studioflow): complete guest stage audio and studio UI integration

The commit must contain exactly:

src/App.tsx
src/styles.css

Do not amend existing commits.

Do not create additional commits.

Do not change branches.

=====================================================================
5. POST-COMMIT VERIFICATION
=====================================================================

After committing, verify:

- New HEAD exists.
- Commit message is correct.
- Exactly two files were committed.
- Commit contains the expected changes.
- Working tree is clean.
- No unrelated changes were included.
- No remote push occurred.

Record:

- Previous HEAD.
- New HEAD.
- Commit message.
- Committed files.
- Commit statistics.
- Repository status.

=====================================================================
6. BUILD AND SOURCE VALIDATION
=====================================================================

Run the existing authoritative source build.

Verify:

- TypeScript compilation passes.
- Vite build passes.
- Current source remains compatible with
  the integrated website assets.
- TPI-057 compositor correction remains present.

Do not modify source files to resolve
unexpected failures.

If validation fails, report the failure.

Do not reset or rewrite the commit.

=====================================================================
7. DOCUMENTATION SYNCHRONIZATION
=====================================================================

Follow the permanent TPI documentation policy.

Update the website repository Markdown records.

Update:

docs/TPI-DEVELOPMENT/
100-DIRECTIVES/DIRECTIVE-INDEX.md

docs/TPI-DEVELOPMENT/
TPI-CURRENT-DEVELOPMENT-STATUS.md

Create:

docs/TPI-DEVELOPMENT/
300-COMPLETED-WORK/
TPI-STUDIOFLOW-060-RESULT.md

Document:

- Owner authorization.
- Previous source HEAD.
- New source HEAD.
- Commit message.
- Exact committed files.
- Validation results.
- Source repository status.
- Remaining release requirements.

Documentation-only modifications are authorized.

Do not stage or commit documentation changes
in the website repository.

=====================================================================
8. STRICT PROHIBITIONS
=====================================================================

DO NOT:

- Push to GitHub.
- Configure a Git remote.
- Deploy to Cloudflare.
- Modify production resources.
- Apply database migrations.
- Modify production D1.
- Modify production R2.
- Modify the website application.
- Modify owner studios.
- Modify Crossroads of the Unknown.
- Delete recordings.
- Clear browser storage.
- Reset Git history.
- Rebase.
- Merge.
- Amend commits.
- Create tags.
- Create additional commits.

No production activity is authorized.

=====================================================================
9. REQUIRED RESULT
=====================================================================

TPI-STUDIOFLOW-060 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. OWNER AUTHORIZATION

B. PRE-COMMIT VERIFICATION

C. COMMIT CREATED

- Previous HEAD:
- New HEAD:
- Commit message:
- Files committed:
- Commit statistics:

D. POST-COMMIT REPOSITORY STATUS

E. BUILD VERIFICATION

F. WEBSITE INTEGRATION COMPATIBILITY

G. DOCUMENTATION UPDATED

H. SECURITY AND DATA PROTECTION

I. REMAINING RELEASE REQUIREMENTS

J. NEXT RECOMMENDED ACTION

Provide one recommended next action only.

=====================================================================
10. COMPLETION CONDITIONS
=====================================================================

Mark COMPLETE only when:

- The authorized commit exists.
- Exactly two approved files were committed.
- Commit contents are verified.
- Source repository status is verified.
- Source build passes.
- Documentation is synchronized.
- No push or deployment occurred.
- No production or owner data was modified.

=====================================================================
FINAL INSTRUCTION
=====================================================================

The owner has authorized creation of this
specific local Git checkpoint.

Create exactly one commit containing:

src/App.tsx
src/styles.css

Do not commit anything else.

Do not push.

Do not deploy.

Return the verified commit information.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-060
=====================================================================
