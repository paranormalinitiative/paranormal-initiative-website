# TPI-STUDIOFLOW-061 — WEBSITE INTEGRATION CHECKPOINT AUDIT

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 20:14.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
THE PARANORMAL INITIATIVE
TPI-STUDIOFLOW-061
WEBSITE INTEGRATION CHECKPOINT AUDIT
=====================================================================

STATUS:
AUTHORIZED — AUDIT AND DOCUMENTATION ONLY

OBJECTIVE:
Prepare a safe, reviewed Git checkpoint for the
StudioFlow integration in the TPI website repository.

Do not stage, commit, push, or deploy.

=====================================================================
1. REPOSITORIES
=====================================================================

WEBSITE REPOSITORY:

/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

EXPECTED BRANCH:

codex/tpi-development

AUTHORITATIVE STUDIOFLOW SOURCE:

/Users/toddknipple/Documents/StudioFlow/web

APPROVED SOURCE COMMIT:

a919a881705c4f21dc184a6f2af8a5096d68e5f4

Verify actual repository states before proceeding.

=====================================================================
2. WEBSITE WORKING-TREE AUDIT
=====================================================================

Inspect:

- Current branch and HEAD.
- Modified tracked files.
- Untracked files.
- Existing staged files.
- Recent commits.
- Git ignore rules.
- Current integration assets.
- Existing documentation changes.

Do not alter existing work.

Classify every changed or untracked file as:

A. Required StudioFlow integration.
B. Required StudioFlow backend.
C. Required verification/documentation.
D. Unrelated website development.
E. Local-only or sensitive material.
F. Requires further review.

Produce an exact file manifest.

=====================================================================
3. STUDIOFLOW INTEGRATION REVIEW
=====================================================================

Review:

- studio/index.html
- studio/assets/
- StudioFlow bridge scripts.
- Authoritative staging scripts.
- Build verification scripts.
- StudioFlow configuration.
- StudioFlow documentation.

Confirm that the integrated assets correspond to
the approved source commit.

Expected assets:

studio/assets/index-AccwBwcd.js
studio/assets/index-TsnuK4Ub.css

Verify actual hashes and references.

Do not assume historical filenames remain current.

Identify obsolete generated assets that are
unreferenced, but do not delete them.

=====================================================================
4. BACKEND AND AUTHENTICATION REVIEW
=====================================================================

Perform a detailed, read-only review of relevant
StudioFlow backend changes.

Pay particular attention to:

functions/api/[[path]].js
worker.js
lib/auth.js

Identify:

- StudioFlow-specific changes.
- Unrelated website changes.
- Authentication dependencies.
- Project saving and autosave dependencies.
- Recovery and backup dependencies.
- Guest signaling dependencies.
- Recording and media dependencies.
- Production-lock dependencies.

These are potentially mixed-purpose files.

Review at the hunk level.

Do not assume entire files belong in the
StudioFlow checkpoint.

If a change cannot be safely separated,
report the exact conflict.

Do not rewrite backend code under this directive.

=====================================================================
5. DATABASE MIGRATION REVIEW
=====================================================================

Review the pending StudioFlow migration:

0053_studioflow_creator_production_lock.sql

Verify:

- Exact schema changes.
- Dependencies.
- Migration ordering.
- Existing production compatibility.
- Rollback considerations.
- Whether migration must be included in the
  eventual website checkpoint.

DO NOT APPLY THE MIGRATION.

DO NOT MODIFY DATABASES.

A successful migration review does not authorize
production migration execution.

=====================================================================
6. SECURITY AND EXCLUSION REVIEW
=====================================================================

Exclude from the proposed checkpoint:

- Credentials and tokens.
- Environment secrets.
- Local development databases.
- Owner media and recordings.
- Recovery snapshots.
- Browser storage.
- Temporary build files.
- Local authentication fixtures.
- Private backups.
- Unrelated website changes.
- Unrelated experiments.

Pay particular attention to:

wrangler.local.toml
scripts/local-dev.env
.local-dev/
.dev.vars

Do not delete excluded files.

Do not expose secret values in reports.

=====================================================================
7. BUILD AND VERIFICATION
=====================================================================

Run existing applicable offline/local checks.

Verify:

- StudioFlow source commit correspondence.
- Authoritative staging reproducibility.
- Website integration asset hashes.
- Bridge compatibility.
- StudioFlow regression checks.
- JavaScript syntax where applicable.
- git diff --check.

Do not run uncontrolled remote requests.

Do not contact production endpoints.

Do not mutate owner data.

Do not restage website assets.

=====================================================================
8. RELEASE CHECKPOINT MANIFEST
=====================================================================

Prepare an exact proposed website checkpoint.

For each file report:

- File path.
- Git status.
- Classification.
- Inclusion or exclusion.
- Reason.
- Dependencies.
- Whether hunk-level staging is required.

Identify the smallest coherent StudioFlow
integration checkpoint.

Separate backend, schema, and documentation
concerns where appropriate.

Do not stage anything.

Do not create commits.

=====================================================================
9. DOCUMENTATION
=====================================================================

Follow the permanent TPI Markdown documentation
synchronization policy.

Update:

docs/TPI-DEVELOPMENT/
100-DIRECTIVES/DIRECTIVE-INDEX.md

docs/TPI-DEVELOPMENT/
TPI-CURRENT-DEVELOPMENT-STATUS.md

Create:

docs/TPI-DEVELOPMENT/
300-COMPLETED-WORK/
TPI-STUDIOFLOW-061-RESULT.md

Record:

- Approved source commit.
- Website repository state.
- Complete file classification.
- Integration compatibility.
- Backend review findings.
- Migration review findings.
- Security exclusions.
- Proposed checkpoint structure.
- Remaining risks.
- Owner approval requirements.

Documentation writes only are authorized.

Do not stage or commit documentation.

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
- Delete files.
- Modify application code.
- Restage generated assets.
- Deploy.
- Modify Cloudflare resources.
- Apply migrations.
- Access or modify owner studios.
- Modify Crossroads of the Unknown.
- Delete recordings or backups.
- Clear browser storage.

=====================================================================
11. REQUIRED RESULT
=====================================================================

TPI-STUDIOFLOW-061 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. REPOSITORY STATE

B. FILE CLASSIFICATION

C. SOURCE COMMIT CORRESPONDENCE

D. WEBSITE INTEGRATION REVIEW

E. BACKEND AND AUTHENTICATION REVIEW

F. DATABASE MIGRATION REVIEW

G. SECURITY EXCLUSIONS

H. VERIFICATION RESULTS

I. PROPOSED CHECKPOINT MANIFEST

J. DOCUMENTATION UPDATED

K. OWNER APPROVAL REQUIREMENTS

L. NEXT RECOMMENDED ACTION

Provide one recommended next action only.

=====================================================================
COMPLETION CONDITIONS
=====================================================================

Mark COMPLETE only when:

- Website changes are fully classified.
- StudioFlow integration files are identified.
- Mixed backend changes are reviewed.
- Migration dependencies are documented.
- Sensitive files are excluded.
- Verification results are recorded.
- A proposed checkpoint manifest exists.
- Markdown documentation is synchronized.
- No staging, commit, push, or deployment occurred.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-061
=====================================================================
