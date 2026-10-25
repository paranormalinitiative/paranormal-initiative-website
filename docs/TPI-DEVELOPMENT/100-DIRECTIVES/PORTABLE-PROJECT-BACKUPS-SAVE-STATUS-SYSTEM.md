# PORTABLE PROJECT BACKUPS & SAVE STATUS SYSTEM

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
TPI-STUDIOFLOW-049
PORTABLE PROJECT BACKUPS & SAVE STATUS SYSTEM
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

Extend TPI-STUDIOFLOW-048 with a dependable,
user-controlled portable backup system.

Users must be able to save StudioFlow projects to:

- Internal computer drives.
- External hard drives.
- USB storage.
- Network drives.
- Cloud-synchronized folders.

StudioFlow must clearly distinguish:

1. Unsaved project changes.
2. Successfully saved project changes.
3. Portable backups that are current.
4. Portable backups that are outdated.

The objective is reliable project protection without
requiring additional paid cloud infrastructure.

=====================================================================
2. INVESTIGATE EXISTING IMPLEMENTATION
=====================================================================

Inspect TPI-STUDIOFLOW-048.

Identify:

- Existing Save Project behavior.
- Existing autosave behavior.
- Existing project export functionality.
- Existing project import functionality.
- Existing media-inclusive backup functionality.
- Existing R2 recovery snapshots.
- Existing project version metadata.
- Existing workspace persistence.
- Existing dirty-state tracking.

Reuse these mechanisms.

Do not create duplicate saving systems.

=====================================================================
3. SAVE STATUS INDICATOR
=====================================================================

Implement a clear project save status.

Required states:

UNSAVED CHANGES

SAVING...

PROJECT SAVED

SAVE FAILED

The status must reflect actual persistence results.

Do not display PROJECT SAVED until the server
confirms the save succeeded.

Handle failed saves without discarding changes.

Preserve the existing debounced autosave.

=====================================================================
4. PORTABLE BACKUP STATUS
=====================================================================

Track the relationship between the current project
version and the last successfully exported backup.

Required states:

NO PORTABLE BACKUP

BACKUP CURRENT

BACKUP OUTDATED

BACKUP FAILED

When project content changes after an export,
the backup becomes outdated.

When a complete export successfully finishes,
record the exported project version.

Do not claim BACKUP CURRENT merely because an
export request was initiated.

Account for browser download limitations.

If completion cannot be verified, use an accurate
status such as:

BACKUP PREPARED — CONFIRM FILE SAVED

Do not falsely guarantee that a file exists on
an external drive.

=====================================================================
5. EXPORT PROJECT
=====================================================================

Provide a clearly accessible:

EXPORT PROJECT

control.

Allow users to download a portable project backup.

Include:

- Project name.
- Project identifier.
- Creation date.
- Export date.
- Project version.
- Scenes.
- Layouts.
- Settings.
- Background configuration.
- Intro/outro configuration.
- Media references.

Use a versioned backup format.

Validate backup structure before export.

Do not include authentication secrets.

=====================================================================
6. COMPLETE PROJECT BACKUP
=====================================================================

Provide a separate option:

BACKUP COMPLETE PROJECT

Include:

- Project configuration.
- Scenes.
- Layouts.
- Settings.
- Available media assets.

Do not automatically include recordings.

Validate media availability.

Report missing media.

Do not label an incomplete backup as complete.

Avoid dependencies on absolute filesystem paths.

Use a portable archive format.

=====================================================================
7. BACKUP DESTINATION
=====================================================================

Allow users to choose where exported backups
are saved through supported browser mechanisms.

Support ordinary browser downloads.

Where supported, investigate optional user-selected
file or directory access.

Do not assume every browser supports the same
filesystem APIs.

Do not silently request broad filesystem access.

Do not require users to grant permanent access
to their drives.

Ensure the standard download/export workflow
remains available in Opera, Safari, and other
supported browsers.

A cloud-synchronized folder should work as a
normal user-selected backup destination.

Do not integrate paid cloud APIs.

=====================================================================
8. BACKUP REMINDERS
=====================================================================

When a project has changed since its last
portable backup, display:

BACKUP OUTDATED

Provide a convenient action:

BACK UP NOW

Do not interrupt active recording or broadcasting.

Avoid excessive notifications.

Do not display repeated alerts after every
minor adjustment.

Use a persistent, unobtrusive status indicator.

=====================================================================
9. IMPORT PROJECT
=====================================================================

Preserve and verify existing import functionality.

Support:

- Configuration-only project imports.
- Complete project backup imports.

Validate:

- Archive structure.
- Manifest version.
- File integrity.
- Media references.
- Duplicate project names.
- Project identity conflicts.

Do not overwrite existing studios automatically.

Imported projects should receive independent
identifiers unless the user explicitly chooses
a supported restore operation.

=====================================================================
10. RECOVERY SNAPSHOTS
=====================================================================

Preserve TPI-STUDIOFLOW-048 recovery snapshots.

Do not confuse:

R2 CONFIGURATION SNAPSHOTS

with:

PORTABLE PROJECT BACKUPS

These serve different purposes.

Clearly distinguish them in the interface.

Do not change snapshot retention without
a demonstrated technical need.

=====================================================================
11. PROJECT SWITCHING
=====================================================================

Preserve the existing My Studios navigation.

When switching projects:

- Detect pending changes.
- Attempt to save them.
- Confirm successful persistence.
- Open the selected project automatically.

If saving fails, warn the user before switching.

Do not silently discard changes.

Do not redirect to StudioFlow Home unnecessarily.

=====================================================================
12. FAILURE HANDLING
=====================================================================

Handle:

- Interrupted downloads.
- Export generation failures.
- Missing media.
- Disconnected external drives.
- Insufficient storage.
- Unsupported filesystem APIs.
- Failed server saves.
- Import corruption.
- Project version conflicts.

Never report a backup as complete without
sufficient verification.

Preserve the user's current project.

=====================================================================
13. TESTING
=====================================================================

Use isolated test projects.

Test:

1. Project change detection.
2. Autosave status.
3. Manual Save Project.
4. Save failure reporting.
5. Export Project.
6. Complete Project Backup.
7. Backup version tracking.
8. Backup outdated detection.
9. Backup current detection.
10. Download failure handling.
11. Import Project.
12. Complete backup import.
13. Duplicate project handling.
14. Missing media reporting.
15. Project switching.
16. Browser reload.
17. Browser storage loss simulation.
18. Recovery snapshot compatibility.
19. Opera download compatibility.
20. Safari fallback compatibility.

Do not clear owner browser data.

Do not reset D1.

=====================================================================
14. DATA PROTECTION
=====================================================================

PROTECTED STUDIO:
Crossroads of the Unknown

WORKSPACE:
43b20614-69da-4d82-af9d-063cace4b6cc

BROADCAST:
studio-0ec3848f-5500-462c-a1da-f711d3148d49

Do not modify this studio during testing.

Do not delete owner media.

Do not modify existing recordings.

Do not restore backups automatically.

Do not overwrite current project data.

=====================================================================
15. DOCUMENTATION
=====================================================================

Update relevant Markdown documentation.

Document:

- Save status.
- Autosave behavior.
- Backup status.
- Backup version tracking.
- Export formats.
- Complete project backups.
- Import procedures.
- Browser compatibility.
- External drive limitations.
- Recovery procedures.
- Media handling.
- Known limitations.

Clearly explain that browser downloads do not
guarantee successful storage on external media.

=====================================================================
16. DEVELOPMENT AUTHORITY
=====================================================================

Codex may autonomously:

- Inspect source.
- Implement UI changes.
- Modify project persistence logic.
- Extend export/import functionality.
- Add backup metadata.
- Implement backup reminders.
- Add regression tests.
- Run local development services.
- Run isolated browser tests.
- Update documentation.

Do not request routine approval.

Do not deploy to production.

Do not commit or push.

=====================================================================
17. REQUIRED FINAL REPORT
=====================================================================

TPI-STUDIOFLOW-049 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. SAVE STATUS

Explain change detection and persistence states.

B. BACKUP STATUS

Explain current/outdated backup tracking.

C. EXPORT

Describe portable project exports.

D. COMPLETE BACKUP

Describe media-inclusive backups.

E. IMPORT

Explain import validation and restoration.

F. STORAGE DESTINATIONS

Explain local/external/cloud-folder support.

G. RECOVERY SNAPSHOTS

Confirm compatibility.

H. TEST RESULTS

Provide automated and browser verification results.

I. FILES MODIFIED

List all changed files.

J. DOCUMENTATION

List updated Markdown files.

K. DATA PROTECTION

Confirm owner data remains unchanged.

L. REMAINING LIMITATIONS

Identify anything requiring additional verification.

=====================================================================
FINAL INSTRUCTION
=====================================================================

StudioFlow must provide a reliable way for users
to protect their projects independently of the browser.

Project saving, portable backups, and recovery must
be clear, dependable, and easy to use.

Implement the required functionality autonomously.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-049
=====================================================================
