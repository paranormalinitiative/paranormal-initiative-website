# RELEASE CHECKPOINT PREPARATION

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 19:29.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
TPI-STUDIOFLOW-056
RELEASE CHECKPOINT PREPARATION
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

PRIORITY:
HIGH

OBJECTIVE:
Review and organize the accumulated Git changes
into a safe, understandable release checkpoint.

THIS DIRECTIVE HAS ONE PURPOSE:
Determine exactly what should be included in
the next StudioFlow release commit.

=====================================================================
1. REPOSITORY
=====================================================================

/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

CURRENT BRANCH:
codex/tpi-development

AUTHORITATIVE STUDIOFLOW SOURCE:
/Users/toddknipple/Documents/StudioFlow/web

=====================================================================
2. WORKING TREE AUDIT
=====================================================================

Inspect all:

- Modified tracked files.
- Untracked files.
- Generated assets.
- StudioFlow source files.
- TPI integration files.
- Verification scripts.
- Documentation.
- Local development artifacts.
- Temporary files.
- Backup files.

Classify each file as:

A. REQUIRED RELEASE SOURCE

B. REQUIRED RELEASE ASSET

C. REQUIRED INTEGRATION

D. REQUIRED TEST OR SCRIPT

E. DOCUMENTATION

F. LOCAL-ONLY / EXCLUDE

G. UNRELATED / DEFER

H. REQUIRES OWNER REVIEW

Do not assume every untracked file belongs
in the release.

=====================================================================
3. RELEASE DEPENDENCY REVIEW
=====================================================================

Identify all files required to preserve:

- StudioFlow application.
- StudioFlow entry point.
- TPI workspace bridge.
- D1 persistence.
- Autosave.
- Recovery snapshots.
- Backup/export/import.
- Authentication.
- Guest waiting room.
- Room signaling.
- Current build pipeline.

Identify any missing dependencies.

=====================================================================
4. SOURCE REPOSITORY REVIEW
=====================================================================

Inspect the separate StudioFlow source tree.

Determine:

- Which source changes remain uncommitted.
- Whether the source has its own Git repository.
- Whether the website release depends on
  uncommitted source changes.
- How the authoritative source revision
  should be recorded for reproducibility.

Do not commit either repository.

=====================================================================
5. SECURITY AND DATA PROTECTION
=====================================================================

Identify files that must never be committed:

- Credentials.
- API tokens.
- Environment secrets.
- Local databases.
- Owner browser storage.
- Media containing private information.
- Recordings.
- Temporary backups.
- Recovery snapshots containing owner data.

Do not display secret values.

Do not delete excluded files.

=====================================================================
6. RELEASE CHECKPOINT PLAN
=====================================================================

Prepare a precise proposed release file manifest.

Separate:

- Files to include.
- Files to exclude.
- Files requiring review.
- Unrelated changes to preserve for later.

Recommend the safest Git checkpoint strategy.

Do not stage files.

Do not commit.

Do not push.

Do not reset or clean the repository.

=====================================================================
7. VALIDATION
=====================================================================

Verify:

- No required release dependency is omitted.
- No local-only data is included.
- No unrelated website functionality is replaced.
- Current source/build integration remains intact.
- Existing changes are preserved.

=====================================================================
8. REQUIRED RESULT
=====================================================================

TPI-STUDIOFLOW-056 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. WORKING TREE SUMMARY

B. FILE CLASSIFICATION

C. REQUIRED RELEASE FILES

D. EXCLUDED FILES

E. SOURCE REPOSITORY STATUS

F. SECURITY FINDINGS

G. PROPOSED RELEASE MANIFEST

H. RECOMMENDED CHECKPOINT PROCEDURE

I. REMAINING QUESTIONS

=====================================================================
FINAL INSTRUCTION
=====================================================================

Prepare a safe, reviewed release checkpoint.

Do not stage, commit, push, deploy, delete,
reset, or overwrite anything.

The next action will be determined after
reviewing the completed report.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-056
=====================================================================
