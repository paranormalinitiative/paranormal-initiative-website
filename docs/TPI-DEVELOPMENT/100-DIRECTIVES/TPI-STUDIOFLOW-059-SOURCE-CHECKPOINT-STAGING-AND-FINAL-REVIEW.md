# TPI-STUDIOFLOW-059 — SOURCE CHECKPOINT STAGING AND FINAL REVIEW

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 19:57.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
THE PARANORMAL INITIATIVE
TPI-STUDIOFLOW-059
SOURCE CHECKPOINT STAGING AND FINAL REVIEW
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

PRIORITY:
HIGH

OBJECTIVE:
Stage and inspect the two approved StudioFlow
source files in preparation for a local Git commit.

THIS DIRECTIVE AUTHORIZES STAGING ONLY.

NO COMMIT IS AUTHORIZED.

=====================================================================
1. SOURCE REPOSITORY
=====================================================================

/Users/toddknipple/Documents/StudioFlow/web

EXPECTED BRANCH:
main

EXPECTED HEAD:
8437b071c2bf1eda3d9df44dca53f95f08e6b032

=====================================================================
2. PRE-STAGING VERIFICATION
=====================================================================

Verify:

- Current repository.
- Current branch.
- Current HEAD.
- Working-tree status.
- Existing staged changes.
- Current source diff.

Confirm the repository still matches the
TPI-STUDIOFLOW-058 audit.

Expected source diff fingerprint:

8d07fdfd01b7745631bb91d374d1e7acc6bc590ef2efabd485ac0241c1b8edbd

If the source diff has changed unexpectedly,
STOP and report the discrepancy.

Do not overwrite or discard changes.

=====================================================================
3. AUTHORIZED STAGING
=====================================================================

Stage exactly:

src/App.tsx
src/styles.css

Do not stage any other files.

Do not use:

git add .
git add -A

Use explicit file paths.

=====================================================================
4. STAGED DIFF REVIEW
=====================================================================

Inspect the complete staged diff.

Verify that it contains only reviewed
StudioFlow changes associated with:

- Guest admission.
- Waiting-room audio.
- Recording opt-in.
- Intro/outro compositor behavior.
- One-shot intro/outro playback.
- Background organization.
- Backstage interface.
- Guest status messaging.
- Responsive styling.

Confirm:

- No unrelated changes.
- No credentials.
- No private media.
- No environment secrets.
- No accidental deletions.
- No unexpected files.

If unexpected content is discovered,
STOP and report it.

Do not silently modify the staging area.

=====================================================================
5. VALIDATION
=====================================================================

Run:

- git diff --cached --check
- git diff --cached --stat
- git diff --cached --name-only
- git status --short

Confirm:

Exactly two staged files.

No additional staged files.

No commit created.

No push performed.

=====================================================================
6. PROPOSED COMMIT
=====================================================================

Prepare the following proposed commit message:

feat(studioflow): complete guest stage audio and studio UI integration

DO NOT EXECUTE THE COMMIT.

Return the exact proposed commit contents
for owner approval.

=====================================================================
7. DOCUMENTATION
=====================================================================

Update the existing TPI Markdown development
records to reflect:

TPI-STUDIOFLOW-059:
STAGED — AWAITING OWNER COMMIT AUTHORIZATION

Record:

- Staged file names.
- Staged diff verification.
- Source repository HEAD.
- Proposed commit message.
- Remaining approval requirement.

Do not stage documentation files.

=====================================================================
8. STRICT PROHIBITIONS
=====================================================================

DO NOT:

- Commit.
- Push.
- Pull.
- Merge.
- Rebase.
- Reset.
- Clean.
- Deploy.
- Modify Cloudflare.
- Modify production D1 or R2.
- Modify owner data.
- Modify the website application.
- Delete or restore files.

=====================================================================
9. REQUIRED RESULT
=====================================================================

TPI-STUDIOFLOW-059 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. SOURCE REPOSITORY

B. PRE-STAGING VERIFICATION

C. STAGED FILES

D. STAGED DIFF REVIEW

E. SECURITY VALIDATION

F. GIT VALIDATION RESULTS

G. DOCUMENTATION UPDATED

H. PROPOSED COMMIT MESSAGE

I. OWNER AUTHORIZATION REQUIRED

=====================================================================
FINAL INSTRUCTION
=====================================================================

Stage exactly the two reviewed StudioFlow
source files.

Inspect the staged contents.

Do not commit or push.

Return the result for owner approval.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-059
=====================================================================
