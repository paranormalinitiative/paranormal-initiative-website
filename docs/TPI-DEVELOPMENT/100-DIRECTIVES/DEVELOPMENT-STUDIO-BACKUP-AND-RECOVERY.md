# DEVELOPMENT STUDIO BACKUP AND RECOVERY INVESTIGATION

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 02:43.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

======================================================================
TPI-STUDIOFLOW-022
DEVELOPMENT STUDIO BACKUP AND RECOVERY INVESTIGATION
======================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

PRIORITY:
HIGH — DATA PROTECTION

ENVIRONMENT:
LOCAL DEVELOPMENT ONLY

STATUS:
AUTHORIZED FOR INVESTIGATION ONLY

PRIMARY DEVELOPMENT BROWSER:
Opera

CANONICAL DEVELOPMENT URL:
http://127.0.0.1:8787/studio/

DEVELOPMENT WORKER:
Port 8787

ROOM SERVER:
Port 8788

DEVELOPMENT BRANCH:
codex/tpi-development

======================================================================
1. OBJECTIVE
======================================================================

Investigate and document a reliable backup and recovery strategy
for StudioFlow's development environment.

StudioFlow now contains real Studio configurations, scenes,
uploaded media, guest settings, and other development data.

The owner has established Opera as the authoritative development
and testing browser.

Codex's isolated browser is reserved for synthetic testing.

The purpose of this directive is to determine how StudioFlow
can safely preserve and recover its development data without
risking existing Studios or interfering with ongoing development.

IMPORTANT:

This directive authorizes investigation and documentation only.

DO NOT implement a backup system yet.

DO NOT perform database restoration.

DO NOT modify existing Studio data.

DO NOT clear browser storage.

DO NOT perform database migrations.

======================================================================
2. INVESTIGATE CURRENT STORAGE ARCHITECTURE
======================================================================

Review the findings from TPI-STUDIOFLOW-021.

Confirm the current storage locations for:

A. SERVER-SIDE DATA

- Studio names
- Studio identifiers
- Scene configurations
- Scene ordering
- Guest settings
- Studio preferences
- Uploaded media metadata
- Media references
- Workspace configuration
- Last-modified timestamps
- Other persistent Studio records

Identify which data resides in the local development D1 database.

Identify the relevant database tables and relationships.

Do not modify database records.

B. BROWSER-SPECIFIC DATA

Investigate:

- localStorage
- IndexedDB
- Session storage
- Cookies
- Browser-specific preferences

Determine which browser-specific records are essential
for restoring the owner's StudioFlow workspace.

C. MEDIA STORAGE

Determine where uploaded StudioFlow media is stored.

Investigate:

- Intro videos
- Outro videos
- Background images
- Studio logos
- Scene artwork
- Audio files
- Guest avatars
- Recording files
- Other uploaded assets

Identify whether the actual media bytes reside in:

- Local development storage
- Cloudflare R2
- Browser IndexedDB
- Local filesystem
- D1 database
- Other storage systems

Distinguish media files from database references.

Do not assume that backing up metadata also backs up
the actual media.

======================================================================
3. IDENTIFY DATA LOSS RISKS
======================================================================

Investigate circumstances that could cause StudioFlow
development data to become unavailable.

Include:

1. Clearing Opera browser storage.
2. Clearing IndexedDB.
3. Resetting local development D1.
4. Rebuilding the development Worker.
5. Restarting local development services.
6. Changing localhost origins.
7. Switching browsers.
8. Changing development branches.
9. Replacing compiled StudioFlow assets.
10. Removing local media directories.
11. Browser crashes.
12. Interrupted Studio saves.
13. Partial database corruption.
14. Accidental Studio deletion.
15. Failed development migrations.

Classify each risk as:

LOW
MEDIUM
HIGH
CRITICAL

Explain what data would be affected.

Do not perform destructive tests.

======================================================================
4. INVESTIGATE BACKUP OPTIONS
======================================================================

Evaluate potential backup approaches.

OPTION A:
LOCAL DEVELOPMENT DATABASE BACKUP

Determine whether the local D1 database can be
safely exported or copied.

Identify the appropriate Cloudflare-supported
development database backup mechanism.

Do not execute a database export yet.

OPTION B:
STUDIO CONFIGURATION EXPORT

Investigate whether StudioFlow could support
exporting individual Studios.

Potential contents:

- Studio name
- Studio configuration
- Scene definitions
- Scene order
- Guest settings
- Media references
- Relevant preferences

Determine whether a portable JSON-based Studio
export would be appropriate.

Do not implement export functionality yet.

OPTION C:
MEDIA BACKUP

Determine how uploaded media files could be preserved
alongside Studio configuration backups.

Evaluate:

- Media manifests
- File checksums
- Missing media detection
- Asset dependency tracking
- Backup directory organization

Do not copy or modify media files yet.

OPTION D:
BROWSER-SPECIFIC DATA BACKUP

Determine whether essential Opera localStorage and
IndexedDB data can be exported safely.

Do not access or extract authentication cookies,
session tokens, or other credentials.

Do not copy private browser profile databases.

Determine whether a future application-level
export would be safer than copying browser internals.

======================================================================
5. INVESTIGATE RECOVERY REQUIREMENTS
======================================================================

Design a proposed recovery workflow.

The recovery system should eventually support:

A. FULL DEVELOPMENT RESTORE

Restore the complete development StudioFlow workspace
from a verified backup.

B. INDIVIDUAL STUDIO RESTORE

Restore one Studio without affecting unrelated Studios.

C. SCENE RECOVERY

Recover an accidentally deleted or damaged scene.

D. MEDIA RECOVERY

Identify and recover missing Studio media.

E. NON-DESTRUCTIVE RESTORE

Allow recovery without automatically overwriting
newer Studio configurations.

F. BACKUP VALIDATION

Verify that a backup contains all required data
before allowing restoration.

G. RESTORE PREVIEW

Display what would change before applying a restore.

IMPORTANT:

These are design requirements only.

Do not implement restoration functionality.

Do not perform restoration tests against the owner's
existing Studios.

======================================================================
6. BACKUP INTEGRITY REQUIREMENTS
======================================================================

Investigate methods for ensuring backup reliability.

Include:

- Backup timestamps
- Studio identifiers
- Database schema version
- Application version
- Asset manifests
- File hashes
- Missing asset detection
- Backup completeness checks
- Corruption detection
- Recovery compatibility checks

Determine how a future backup system could verify
that all required components are present.

Do not calculate checksums by modifying original files.

Read-only checksum inspection is permitted when safe.

======================================================================
7. BACKUP SECURITY
======================================================================

Any future backup system must protect Studio data.

Investigate appropriate safeguards for:

- Local backup permissions
- Backup directory isolation
- Sensitive configuration fields
- Guest information
- Authentication data
- Backup encryption options
- Secure restoration
- Accidental overwrite prevention

Authentication cookies, API keys, access tokens,
and session credentials must not be included in
portable Studio backups.

Do not expose secrets in documentation or logs.

Do not upload backup data to external services.

======================================================================
8. PROPOSED BACKUP WORKFLOW
======================================================================

Develop a recommended future workflow.

The owner should eventually be able to:

1. Open StudioFlow in Opera.
2. Access Studio backup controls.
3. Select an individual Studio or all Studios.
4. Create a backup.
5. Verify the backup completed successfully.
6. Download or save the backup locally.
7. Restore a Studio when necessary.
8. Preview the restoration before applying changes.
9. Confirm the restoration.
10. Continue working without affecting unrelated Studios.

Evaluate whether these controls should eventually
be available through:

- StudioFlow Settings
- My Studios
- A dedicated Backup & Recovery screen

Recommend the most appropriate location.

Do not modify the StudioFlow interface yet.

======================================================================
9. DEVELOPMENT ENVIRONMENT PROTECTION
======================================================================

Preserve the established TPI-STUDIOFLOW-021 workflow.

Opera remains the authoritative development browser.

Codex's browser remains an isolated synthetic
testing environment.

DO NOT:

- Clear Opera storage.
- Delete IndexedDB records.
- Delete Studios.
- Delete scenes.
- Modify uploaded media.
- Reset the local D1 database.
- Change development database bindings.
- Restart unrelated services.
- Modify the temporary guest testing tunnel.
- Deploy to production.
- Modify production databases.
- Commit changes.
- Push changes.

Preserve the current dirty worktree.

Do not perform destructive storage experiments.

Do not access production storage.

======================================================================
10. DOCUMENTATION REQUIREMENTS
======================================================================

Create:

TPI-STUDIOFLOW-022-BACKUP-RECOVERY-INVESTIGATION.md

Place the document within the existing TPI development
documentation structure.

Include:

1. Executive summary.
2. Current storage architecture.
3. Development D1 storage findings.
4. Browser-specific storage findings.
5. Uploaded media storage findings.
6. Data loss risk assessment.
7. Backup strategy comparison.
8. Recommended backup architecture.
9. Proposed individual Studio export format.
10. Proposed full-workspace backup format.
11. Media preservation strategy.
12. Backup integrity requirements.
13. Recovery workflow.
14. Security considerations.
15. Implementation phases.
16. Remaining unknowns.
17. Recommended next directive.

Update:

- Directive index
- Current development status
- Investigation documentation

Do not mark backup implementation as complete.

======================================================================
11. VERIFICATION
======================================================================

Verify that the investigation has not modified:

- Existing Studios
- Scene configurations
- Media assets
- Browser storage
- Local development D1 records
- Guest settings
- Recording data
- Production systems

Run appropriate read-only verification.

Run:

git diff --check

Do not execute destructive tests.

Do not run database migrations.

======================================================================
12. COMPLETION REPORT
======================================================================

Codex must report:

1. Where StudioFlow stores its actual Studio data.
2. Where uploaded media bytes are stored.
3. Which data is shared across browsers.
4. Which data is specific to Opera.
5. Which data is currently vulnerable to loss.
6. Whether a full backup is technically feasible.
7. Whether individual Studio backups are feasible.
8. Whether media can be included in backups.
9. Recommended backup format.
10. Recommended storage location.
11. Recommended recovery architecture.
12. Proposed implementation phases.
13. Any limitations or unresolved questions.
14. Confirmation that no Studio data was modified.

======================================================================
13. ACCEPTANCE CRITERIA
======================================================================

TPI-STUDIOFLOW-022 is complete when:

- All known StudioFlow storage locations are documented.
- Browser-specific and shared data are distinguished.
- Media storage is identified.
- Data loss risks are assessed.
- A practical backup architecture is recommended.
- Individual Studio recovery is considered.
- Full workspace recovery is considered.
- Non-destructive restoration is addressed.
- Security requirements are documented.
- No existing Studio data has been modified.
- No production systems have been accessed.
- Development documentation is updated.

IMPORTANT:

THIS IS AN INVESTIGATION DIRECTIVE.

DO NOT BUILD THE BACKUP SYSTEM YET.

DO NOT EXPORT OR RESTORE LIVE STUDIO DATA.

DO NOT DEPLOY TO PRODUCTION.

DO NOT COMMIT OR PUSH.

======================================================================
END DIRECTIVE — TPI-STUDIOFLOW-022
======================================================================
