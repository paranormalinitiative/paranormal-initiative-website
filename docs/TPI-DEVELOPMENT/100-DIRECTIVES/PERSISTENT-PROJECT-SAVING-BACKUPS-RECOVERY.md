# PERSISTENT PROJECT SAVING, BACKUPS & RECOVERY

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 15:12.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
TPI-STUDIOFLOW-048
PERSISTENT PROJECT SAVING, BACKUPS & RECOVERY
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

PRIMARY REPOSITORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

STUDIOFLOW SOURCE:
/Users/toddknipple/Documents/StudioFlow/web

AUTHORITY:
FULL AUTONOMOUS LOCAL IMPLEMENTATION

PRODUCTION DEPLOYMENT:
NOT AUTHORIZED

=====================================================================
1. OBJECTIVE
=====================================================================

Implement a reliable StudioFlow project-saving system.

The owner must be able to create, save, reopen, export,
import, and recover complete StudioFlow project setups.

Browser storage must not be the sole authoritative
location for saved projects.

Clearing browser cookies, cache, or site data must not
destroy projects that were successfully saved to the
persistent project store.

=====================================================================
2. INVESTIGATE EXISTING STORAGE
=====================================================================

Before implementation, inspect the current architecture.

Determine:

- How Studio workspaces are stored.
- How broadcasts are stored.
- How scenes are stored.
- Where background assets are stored.
- Where intro/outro media is stored.
- Which settings use localStorage.
- Which settings use IndexedDB.
- Which settings use D1.
- Which settings are already persisted outside Opera.
- Whether an existing backup system is present.

Reuse existing reliable persistence mechanisms.

Do not create a competing database unnecessarily.

Do not overwrite existing owner projects.

=====================================================================
3. SAVE PROJECT
=====================================================================

Add a clearly visible:

SAVE PROJECT

control to the StudioFlow interface.

The user must be able to save the current Studio
configuration as a named project.

A saved project should include:

- Project name.
- Project identifier.
- Creation date.
- Last-saved date.
- Studio configuration.
- Scenes.
- Scene layouts.
- Background selections.
- Motion background selections.
- Intro/outro configuration.
- Media references.
- Camera layout preferences.
- Microphone configuration preferences.
- Relevant production settings.

Do not save passwords, authentication tokens,
or sensitive device credentials.

Do not automatically include recordings.

Preserve project identity when updating an existing save.

=====================================================================
4. AUTOMATIC SAVING
=====================================================================

Implement automatic saving of project changes.

Requirements:

- Debounced saving.
- No unnecessary writes.
- No interruption to live production.
- Clear save status.
- Error reporting when saving fails.
- Protection against overlapping writes.
- No silent loss of unsaved changes.

Suggested status indicators:

SAVED
SAVING
UNSAVED CHANGES
SAVE FAILED

Manual Save Project must remain available.

=====================================================================
5. PERSISTENT LOCAL STORAGE
=====================================================================

Use an appropriate persistent storage mechanism
outside browser-only storage.

Investigate the existing local D1 architecture
and filesystem options.

Select the smallest reliable solution compatible
with the existing StudioFlow application.

IMPORTANT:

Cloudflare D1 is not automatically equivalent to
a portable local project file.

Ensure the selected persistence strategy is suitable
for both local development and the eventual
production architecture.

Do not assume a public website can write directly
to the owner's computer filesystem.

Use explicit export/download mechanisms where
browser security requires them.

Document the storage architecture clearly.

=====================================================================
6. PROJECT LIBRARY
=====================================================================

Provide a project management interface.

Display:

- Project name.
- Creation date.
- Last-saved date.
- Save status.

Allow the user to:

- Open an existing project.
- Save the current project.
- Export a project.
- Import a project.
- View available recovery snapshots.

Preserve existing My Studios navigation.

Do not redirect users unnecessarily to the
StudioFlow home screen.

Switching studios should preserve pending changes
and automatically open the selected studio.

=====================================================================
7. PROJECT EXPORT
=====================================================================

Implement:

EXPORT PROJECT

Provide two export options where feasible.

OPTION A:
PROJECT BACKUP

Contains:

- Configuration.
- Scenes.
- Layouts.
- Settings.
- Media references.

OPTION B:
COMPLETE PROJECT BACKUP

Contains:

- Project configuration.
- Scenes.
- Layouts.
- Settings.
- Required media assets.

Use a versioned, documented backup format.

Do not include:

- Passwords.
- Authentication tokens.
- Unrelated studios.
- Recordings unless separately and explicitly requested.

A complete backup must not rely exclusively on
absolute filesystem paths from the original computer.

Validate exported backup integrity.

=====================================================================
8. PROJECT IMPORT
=====================================================================

Implement:

IMPORT PROJECT

Requirements:

- Validate backup format.
- Validate backup version.
- Validate file integrity where possible.
- Reject malformed archives.
- Prevent unsafe archive paths.
- Avoid overwriting existing projects.
- Handle duplicate project names safely.
- Preserve existing owner data.

Imported projects should open as independent projects
unless the user explicitly selects a supported
restore-over-existing workflow.

Do not silently overwrite Crossroads of the Unknown.

=====================================================================
9. RECOVERY SNAPSHOTS
=====================================================================

Implement automatic recovery snapshots.

Requirements:

- Keep a limited history.
- Use configurable retention where practical.
- Avoid unnecessary duplicate snapshots.
- Allow users to preview snapshot metadata.
- Allow explicit restoration.
- Preserve current project state before restoration.
- Never silently overwrite the active project.

Use an appropriate retention strategy that avoids
unbounded storage growth.

=====================================================================
10. MEDIA SAFETY
=====================================================================

Project backups must distinguish between:

- Media references.
- Actual media files.
- Recorded program output.

Do not assume a media reference guarantees that
the underlying file still exists.

When exporting a complete project:

- Identify missing media.
- Report incomplete backups.
- Preserve media filenames where safe.
- Validate media availability.
- Avoid including unrelated files.

Never delete existing owner media.

=====================================================================
11. CROSSROADS PROTECTION
=====================================================================

PROTECTED PROJECT:

Crossroads of the Unknown

WORKSPACE:
43b20614-69da-4d82-af9d-063cace4b6cc

BROADCAST:
studio-0ec3848f-5500-462c-a1da-f711d3148d49

Do not modify this project during testing.

Do not overwrite its existing settings.

Do not automatically restore old backups.

Use synthetic test projects.

=====================================================================
12. FAILURE AND RECOVERY TESTING
=====================================================================

Test:

1. Create project.
2. Save project.
3. Reload StudioFlow.
4. Reopen saved project.
5. Modify project.
6. Autosave changes.
7. Manually save project.
8. Switch projects.
9. Return to previous project.
10. Export configuration backup.
11. Export complete backup.
12. Import configuration backup.
13. Import complete backup.
14. Restore recovery snapshot.
15. Handle missing media.
16. Handle corrupted backup.
17. Handle duplicate project names.
18. Handle interrupted saves.
19. Handle storage failures.
20. Verify saved projects survive browser-site-data loss.

Use isolated test fixtures.

Do not clear the owner's browser storage.

Do not reset local D1.

=====================================================================
13. DOCUMENTATION
=====================================================================

Update relevant Markdown documentation.

Document:

- Project persistence architecture.
- Save Project behavior.
- Autosave behavior.
- Project library.
- Backup format.
- Import procedure.
- Recovery snapshots.
- Media handling.
- Storage limitations.
- Local versus production behavior.
- Disaster recovery procedures.

Do not claim a backup is complete unless
its required assets have been verified.

=====================================================================
14. DEVELOPMENT AUTHORITY
=====================================================================

Codex may independently:

- Inspect source.
- Implement persistence.
- Modify StudioFlow components.
- Modify local storage APIs.
- Add necessary database migrations.
- Add backup/import modules.
- Add automated tests.
- Run local development services.
- Run isolated browser tests.
- Update documentation.
- Repair related defects.

Do not request routine approval.

Do not apply migrations to owner or production
databases without explicit authorization.

Do not deploy to production.

Do not commit or push.

=====================================================================
15. REQUIRED FINAL REPORT
=====================================================================

TPI-STUDIOFLOW-048 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. STORAGE ARCHITECTURE

Explain where projects are saved.

B. SAVE PROJECT

Explain manual saving behavior.

C. AUTOSAVE

Explain automatic persistence.

D. PROJECT LIBRARY

Explain opening and switching projects.

E. EXPORT

Explain available backup formats.

F. IMPORT

Explain restoration behavior.

G. RECOVERY

Explain snapshot retention and restoration.

H. MEDIA

Explain how media files are protected.

I. TEST RESULTS

Provide actual verification results.

J. FILES MODIFIED

List changed files.

K. DOCUMENTATION

List updated Markdown files.

L. PRODUCTION COMPATIBILITY

Explain whether the system is ready for deployment.

M. REMAINING LIMITATIONS

Identify outstanding issues.

=====================================================================
FINAL INSTRUCTION
=====================================================================

StudioFlow must treat saved projects as valuable
production assets.

Browser storage must not be the only protection
for an owner's studio setup.

Implement a dependable project-saving and
recovery system with multiple layers of protection.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-048
=====================================================================
