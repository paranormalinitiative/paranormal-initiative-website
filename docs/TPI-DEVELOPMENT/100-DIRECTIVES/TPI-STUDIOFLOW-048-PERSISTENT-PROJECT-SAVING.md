# TPI-STUDIOFLOW-048 — Persistent Project Saving, Backups & Recovery

## Scope

Implement persistent StudioFlow project saving in local development without
using browser storage as the authoritative project store. Crossroads of the
Unknown remains protected and is not used for write-path testing.

## Implementation direction

- Existing owner-scoped `studio_workspaces` records remain the authoritative
  project library and save store.
- Existing version-checked workspace updates remain the only project save
  mutation path. Autosave remains debounced, serialized, and independent of
  backup availability.
- The My Studios bridge now presents project-oriented controls: **Save
  Project**, project configuration export/import, and **View Recovery
  Snapshots**.
- Configuration exports retain the existing version-1 format for compatibility
  and now include project identifier, name, creation date, and last-saved
  metadata. Imports always create an independent Studio identity.
- Recovery snapshots are stored in the existing owner-scoped `TPI_MEDIA` R2
  binding under a generated workspace path. They contain the server-confirmed
  workspace configuration only; recordings and authentication material are not
  included. The server retains the newest 20 snapshots per workspace.
- Restoring a recovery snapshot is explicit and always creates a new Studio;
  it never overwrites the active project.
- The existing media-inclusive Backup & Recovery path remains separate. It is
  the path for actual media bytes, while project saves and configuration
  exports remain configuration-focused.

## Safety boundaries

No Crossroads write, browser-storage clear, D1 reset, production request,
deployment, commit, or push was performed for this directive. No migration was
needed: recovery snapshots use the existing R2 binding and the existing D1
workspace schema.

## Verification plan

The focused verification script uses synthetic project data only. It checks
manual save, debounced autosave, version protection, project metadata,
independent import, snapshot ownership/version checks, retention, explicit
restore-as-new behavior, media-backup separation, and Crossroads fixture
exclusion. Syntax and `git diff --check` are also required before completion.
