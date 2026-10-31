# TPI-STUDIOFLOW-122H.1 — Local Podcast Project Folders and Operating System Integration

**Status:** PARTIAL — implementation staged locally; native folder-picker and real filesystem acceptance remain unverified.

**Environment:** `http://127.0.0.1:8787/studio/` only. Production was not modified.

## Findings

Directive 122H already provides the authoritative project export path. Podcast projects, episodes, notes, research collections, and note attachments are represented by the Notes API and stored through the local Worker’s D1/R2-backed implementation. The existing exporter generates a bounded standard ZIP with offline HTML notes, relative attachment references, checksums, and explicit omissions for resources without a verified podcast-project association. Teleprompter scripts, recordings, artwork, guest information, and scenes remain unassociated in the current data model and are not guessed into a local project folder.

The browser does not have unrestricted filesystem access. The implementation therefore uses the permission-based File System Access API only when `showDirectoryPicker()` and IndexedDB are available. The authorized `FileSystemDirectoryHandle` and synchronization metadata are stored per project in the browser’s `studioflow-project-folders` IndexedDB database. The connected folder is not authoritative and does not replace D1/R2 or the ZIP export.

## Implemented behavior

- `Set Local Project Folder` opens the browser’s native, permission-gated directory picker.
- `Sync Project to Local Folder` is an explicit action; there are no background writes or bidirectional synchronization.
- The existing project packager is reused, so local files contain only verified project resources and the same manifest/omission information as the ZIP fallback.
- The directory structure is created from actual packaged file paths. Missing project associations do not create fictional directories or files.
- Existing local files are hashed before replacement. Unchanged files are skipped. Files changed outside StudioFlow are preserved and the StudioFlow version is written as a conflict copy.
- Files absent from a later export are never deleted automatically. Unrelated files in the selected folder are preserved.
- Folder name, connection status, last successful synchronization, and errors are shown in the Project Files dialog.
- `Open Project Folder` reports the browser limitation instead of falsely claiming it launched Finder or File Explorer. The creator can use the displayed folder name in the operating system’s file manager.
- Browsers without the API retain `Download Project` as the standard ZIP fallback.

## Source and assets

- StudioFlow source commit: `ded5a3d73c5838d56f3c5e1cb0a32534acdab44f`
- Source worktree: `/Users/toddknipple/Documents/StudioFlow/web-122` (clean)
- Generated JavaScript: `index-CZ1q5Q9d.js`
- JavaScript SHA-256: `89f744d4ca0a889001acb94f2afd6826609a8c64cee02ad23508f0f4da8a14b3`
- Generated CSS: `index-DtHLNYVn.css`
- CSS SHA-256: `720b9f58e86b2006281120234b4cb9a4bf7e2f2b7388b04badd4e2d3808eb668`
- Website staging baseline: `scripts/studioflow-release-baseline.json`

## Verification

| Check | Result |
|---|---|
| Source TypeScript/build | PASS |
| Reproducible authoritative staging | PASS |
| Existing ZIP export fallback, Firefox Developer Edition | PASS — 17/17 |
| Maintained Firefox StudioFlow regression | PASS — 64/64 |
| Release-safety checks | PASS — 21/21 |
| Authenticated local Chrome reaches Project Files dialog | PASS |
| Native folder selection in Chrome | UNVERIFIED — macOS chooser automation could not be completed without targeting the owner’s existing Chrome window |
| Real directory creation and file synchronization | UNVERIFIED |
| Independent Finder/File Explorer/Linux file-manager inspection | UNVERIFIED |
| Production deployment | NOT RUN — prohibited |

The real-filesystem gate is intentionally not reported as passed. The disposable Chrome harness is retained at `scripts/verify/tpi-studioflow-122h1-project-folder.mjs` and creates a temporary folder, attempts native selection, verifies output independently, and tests external-file conflict preservation when the native interaction is available.

## Data and safety

No D1/R2 migration, reset, deletion, ownership change, browser-storage clearing, or production operation was performed. The original mixed StudioFlow checkout remains preserved and was not modified. Disposable Notes fixtures used by the Firefox ZIP test were archived during cleanup. The authoritative Worker remains local-only on port 8787.

## Remaining blocker

Directive 122H.1 cannot be marked complete until a supported browser successfully completes the native folder chooser and writes a real authorized project directory that is independently inspected. The next acceptance run should use a visible Chrome session with the owner’s explicit local login already available, select a disposable test folder, sync it, inspect the files outside StudioFlow, and repeat after an external-file modification.
