# TPI-STUDIOFLOW-074 — CREATE CONTROLLED STUDIOFLOW GIT CHECKPOINT

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 22:12.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
THE PARANORMAL INITIATIVE
DIRECTIVE: TPI-STUDIOFLOW-074
CREATE CONTROLLED STUDIOFLOW GIT CHECKPOINT
=====================================================================

PRIORITY: CRITICAL

ACTIVE MISSION:
STUDIOFLOW PRODUCTION UPDATE

PREVIOUS DIRECTIVE:
TPI-STUDIOFLOW-073 — COMPLETE

OBJECTIVE:

Create one clean local Git checkpoint containing
only the StudioFlow production update.

Do not push or deploy.

=====================================================================
1. AUTHORITATIVE RELEASE CANDIDATE
=====================================================================

Repository:

/Users/toddknipple/Documents/GitHub/
tpi-studioflow-release-candidate

Required branch:

codex/studioflow-release-candidate

Expected baseline:

7385f0cf24155f121bdc967a0985553daa8a05df

Verify all three before proceeding.

STOP if the branch or baseline differs unexpectedly.

=====================================================================
2. VERIFY THE APPROVED RELEASE MANIFEST
=====================================================================

Read:

docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/
TPI-STUDIOFLOW-073-RESULT.md

Use the exact 37-path release manifest documented
under TPI-073.

Do not generate a new broad release manifest.

Do not include additional runtime files without
documenting and obtaining approval.

Verify the manifest against the current candidate.

Confirm:

- Required StudioFlow runtime files are present.
- Required bridges are present.
- Generated assets match approved source.
- Shared backend files contain isolated changes.
- Required migrations are present.
- No unrelated changes are included.

If the exact manifest cannot be verified,
STOP before staging.

=====================================================================
3. PROTECT EXISTING DEVELOPMENT
=====================================================================

Preserve:

- Original website development worktree.
- Original StudioFlow source.
- Existing production Live Bridge.
- Existing website authentication.
- Existing community functionality.
- Existing Administration functionality.
- Existing owner workspaces and recordings.

Do not alter excluded candidate files.

=====================================================================
4. STAGE ONLY APPROVED FILES
=====================================================================

Stage only the exact manifest paths.

Do not use:

git add .
git add -A

Do not stage entire directories indiscriminately.

After staging, inspect:

git diff --cached --name-status

git diff --cached --stat

git diff --cached --check

git diff --cached

Confirm every staged path is authorized.

For shared backend files, inspect the actual
staged hunks.

If an unauthorized change is staged,
remove it from the index before proceeding.

Do not modify unrelated working files.

=====================================================================
5. SECURITY AND DATA EXCLUSION
=====================================================================

Verify staged content contains no:

- Credentials.
- Tokens.
- Secret values.
- Local environment files.
- Browser profiles.
- Local databases.
- Owner recordings.
- Owner media.
- Backup archives.
- Production data exports.
- Local Wrangler compatibility overrides.

STOP if sensitive material is detected.

=====================================================================
6. FINAL REGRESSION VERIFICATION
=====================================================================

Run the maintained StudioFlow release tests.

Verify:

- StudioFlow build correspondence.
- StudioFlow bridge integrity.
- Authentication compatibility.
- Live Bridge route preservation.
- Workspace persistence.
- Media persistence.
- Worker routing.
- Website navigation.
- JavaScript syntax.
- Staged diff integrity.

Report exact results.

STOP if a required regression fails.

=====================================================================
7. CREATE LOCAL COMMIT
=====================================================================

Only after all previous checks pass:

Create one local commit.

Commit message:

feat(studioflow): isolate production studio update and preserve live bridge

Do not amend unrelated commits.

Do not push.

Do not deploy.

=====================================================================
8. VERIFY COMMIT
=====================================================================

Report:

- Commit SHA.
- Branch.
- Parent commit.
- Exact committed file list.
- Number of committed files.
- Whether any unexpected paths were included.
- Remaining unstaged changes.
- Remaining untracked files.

Verify:

git show --stat --oneline HEAD

git status --short

Ensure excluded local files remain untouched.

=====================================================================
9. DOCUMENTATION
=====================================================================

Create:

docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/
TPI-STUDIOFLOW-074-RESULT.md

Update:

- Directive index.
- Current development status.
- Creator Studio development record.
- Master release register, if present.

Record the actual Git commit SHA.

Documentation updates must not silently
expand the approved runtime release scope.

If documentation cannot be included in the
same authorized checkpoint, leave it as a
separate local change and report its status.

=====================================================================
10. STRICT PROHIBITIONS
=====================================================================

NO Git push.

NO Cloudflare deployment.

NO production migrations.

NO production database access.

NO production R2 modifications.

NO production credential access.

NO unrelated development.

NO Live Bridge redesign.

NO owner-data modifications.

=====================================================================
11. REQUIRED RESULT
=====================================================================

TPI-STUDIOFLOW-074 RESULT

A. PRE-COMMIT VERIFICATION
B. EXACT STAGED FILES
C. SECURITY EXCLUSION CHECK
D. REGRESSION RESULTS
E. COMMIT SHA
F. COMMITTED FILE COUNT
G. REMAINING LOCAL CHANGES
H. RELEASE CHECKPOINT STATUS
I. NEXT REQUIRED PRODUCTION STEP

=====================================================================
SUCCESS:

A clean, verified local StudioFlow commit exists.

No unrelated changes were committed.

No production resources were touched.

No push or deployment occurred.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-074
=====================================================================
