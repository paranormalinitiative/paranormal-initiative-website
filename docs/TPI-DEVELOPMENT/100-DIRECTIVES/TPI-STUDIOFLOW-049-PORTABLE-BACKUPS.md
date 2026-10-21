# TPI-STUDIOFLOW-049 — Portable Project Backups & Save Status System

## Scope

This directive extends TPI-STUDIOFLOW-048 locally. The existing D1-backed
`studio_workspaces` record remains authoritative for saved Studio projects.
Portable backups are separate artifacts and do not replace server persistence
or R2 recovery snapshots.

## Implemented behavior

- My Studios exposes **Save Project**, **Export Project**, **Backup Complete
  Project**, and **Confirm Portable Backup Saved**.
- Server-backed saves use the visible states `UNSAVED CHANGES`, `SAVING...`,
  `PROJECT SAVED`, and `SAVE FAILED`.
- Existing debounced autosave and version-checked API writes remain in place.
- Configuration export creates a versioned JSON download containing project
  metadata, configuration, scenes, layouts, settings, and media references.
  Authentication secrets and recordings are excluded.
- A browser download can only be initiated by the application. Until the user
  confirms that the file was saved, the UI reports `BACKUP PREPARED — CONFIRM
  FILE SAVED`; it does not claim that an external, USB, network, or
  cloud-synchronized destination contains the file.
- Complete project backup delegates to the existing verified media-inclusive
  `backupNow({ force: true })` writer. It is marked current only after the
  writer verifies the package and completion marker and returns its manifest.
- Portable status is tracked per workspace and compared with the server
  workspace version: `NO PORTABLE BACKUP`, `BACKUP CURRENT`, `BACKUP OUTDATED`,
  and `BACKUP FAILED`.
- R2 configuration recovery snapshots remain distinct from portable backups.

## Compatibility and safety

No new persistence layer was introduced. Project saves continue to use the
existing D1 API and expected-version protection. Complete backups continue to
use the existing user-selected folder adapter and media collector. Standard
browser downloads remain the compatibility fallback for browsers without a
folder-writing API.

Portable status metadata is a convenience indicator stored in browser state;
the project and verified complete backup are not stored there. If browser site
data is cleared, the status indicator may need to be re-established by checking
or confirming the backup; this does not delete the D1 project or the backup
files.

## Verification plan

Run the focused TPI-STUDIOFLOW-049 checks, TPI-STUDIOFLOW-048 checks, relevant
StudioFlow regressions, JavaScript syntax checks, and `git diff --check`. Any
authenticated browser/download or external-destination verification must be
reported separately from static and synthetic verification.
