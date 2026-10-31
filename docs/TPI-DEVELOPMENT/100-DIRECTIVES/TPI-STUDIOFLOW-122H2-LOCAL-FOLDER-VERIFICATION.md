# TPI-STUDIOFLOW-122H.2 — Local Project Folder Verification and Completion

Date: 2026-10-31  
Status: **PARTIAL — Native filesystem verification outstanding**  
Environment: `http://127.0.0.1:8787/studio/`  
Production deployment: **Not authorized and not performed**

## Baseline

The authoritative local Worker was running on port 8787 with local D1/R2
persistence under `.local-dev/state/v3`. The staged application corresponds to
StudioFlow source commit `ded5a3d73c5838d56f3c5e1cb0a32534acdab44f`.

The served assets were independently hashed:

- JavaScript: `studio/assets/index-CZ1q5Q9d.js` —
  `89f744d4ca0a889001acb94f2afd6826609a8c64cee02ad23508f0f4da8a14b3`
- CSS: `studio/assets/index-DtHLNYVn.css` —
  `720b9f58e86b2006281120234b4cb9a4bf7e2f2b7388b04badd4e2d3808eb668`

The website repository was clean at the start of this verification except for
the focused native-browser verification-script changes recorded in this
directive. The original mixed StudioFlow checkout was not modified.

## Existing implementation findings

The implementation introduced by 122H.1:

- Reuses `downloadPodcastProject()` and its verified project-resource
  selection, manifest, relative paths, checksums, and ZIP fallback.
- Uses `showDirectoryPicker({ mode: "readwrite" })` when the browser exposes
  the File System Access API.
- Persists a permissioned `FileSystemDirectoryHandle` and sync metadata in the
  browser IndexedDB store `studioflow-project-folders`.
- Creates project and episode directories only from actual associated records.
- Writes only after the explicit `Sync Project to Local Folder` action.
- Preserves externally modified files and writes a `StudioFlow copy` conflict
  instead of silently overwriting them.
- Retains `Download Project` for Firefox and other browsers without direct
  folder-writing support.
- Does not launch Finder or File Explorer automatically and does not perform
  background or bidirectional synchronization.

The current project data model does not provide verified podcast associations
for recordings, backstage recordings, artwork, guest information, scenes, or
Teleprompter scripts. The exporter documents those omissions rather than
inventing relationships. Future recording export can preserve Backstage 1,
Main Podcast, and Backstage 2 as separate files once authoritative associations
exist; no recording changes were made here.

## Verification performed

### Isolated Chrome/macOS attempt

Environment: macOS 27.0, isolated Chrome for Testing `156.0.8078.4`, disposable
browser session and disposable local test resources.

The test authenticated successfully, created a disposable podcast project,
episode, and note through the real local Worker, opened the real Notes
workspace, opened the Project Files dialog, and confirmed that
`Set Local Project Folder` is presented. The test then attempted to complete
the native macOS directory picker.

The native picker did not become controllable in the available desktop/browser
automation session. No folder was connected, no files were written, and no
independent Finder verification was claimed. The focused harness was improved
to foreground the isolated browser and target its process rather than the
owner's personal Chrome window, but repeated runs still timed out before the
`Connected to ...` state.

Result: **UNVERIFIED / BLOCKED by the native picker interaction environment**.

### Firefox fallback

Firefox Developer Edition `160.0b3` completed the maintained project-export
acceptance against the authoritative Worker. The standard ZIP archive was
created and inspected, including the manifest, episode metadata, offline note
HTML, and explicit unassociated-resource omissions. Firefox remains the
documented ZIP fallback; direct local-folder writing was not represented as
available.

Result: **PASS for ZIP fallback**.

### Automated evidence

- `npm run test:studioflow:122h-export`: **PASS, 17/17**.
- `npm run test:studioflow:firefox`: **PASS, 64/64**.
- `npm run verify:release-safety`: **PASS, 21/21**.
- Local Worker status: **RUNNING**, port 8787, local-only loopback.
- Production: **UNCHANGED**.

The 122H.1 native-folder harness was run with a disposable test project and
temporary directory. It reached authentication and Project Files successfully,
but produced zero local files because native selection did not complete. The
required second-sync, independent filesystem, external-conflict, permission
revocation, refresh, and browser-restart gates therefore remain unverified.

## Files changed for this verification

- `scripts/verify/tpi-studioflow-122h1-project-folder.mjs` — improved isolated
  Chrome foregrounding/process targeting for the native-picker test.
- This execution record.
- The development status, handoff, testing, and directive index records were
  synchronized with the PARTIAL result.

No StudioFlow application source, D1 schema, R2 storage, owner Studio, media,
recording, authentication, or production asset was changed by 122H.2.

## Acceptance matrix

| Requirement | Result | Evidence |
|---|---|---|
| Supported browser exposes folder selection | UNVERIFIED | Chrome reached the control; native picker did not complete |
| Real folder permission granted | BLOCKED | Native picker interaction unavailable |
| Disposable project created | PASS | Authenticated local Worker test |
| Real directory created | UNVERIFIED | No directory write occurred |
| Project/episode metadata written locally | UNVERIFIED | Native sync not reached |
| Notes and attachments written locally | UNVERIFIED | Native sync not reached |
| Manifest/checksums independently inspected | UNVERIFIED | Native sync not reached |
| Finder/OS file-manager inspection | UNVERIFIED | No local export was created |
| Repeated synchronization | UNVERIFIED | Native sync not reached |
| External-file conflict protection | UNVERIFIED | Native sync not reached |
| Permission denial/revocation recovery | UNVERIFIED | Native picker interaction unavailable |
| Browser refresh/restart handle recovery | UNVERIFIED | Native connection not established |
| Firefox ZIP fallback | PASS | 122H export acceptance 17/17 |
| Existing project data preserved | PASS | Disposable resources only; no owner resources changed |
| Production unchanged | PASS | No production command or data operation performed |

## Release and handoff

This directive is not complete. Do not claim that StudioFlow can synchronize a
real project folder until a supported browser completes native directory
selection, writes real files, and those files are inspected independently of
StudioFlow. The next verification should be performed interactively in a
visible supported Chrome session with the owner or operator completing the OS
folder-picker action, followed by repeated-sync and conflict tests.

Source commit: `ded5a3d73c5838d56f3c5e1cb0a32534acdab44f`  
Website integration baseline: `78b4e8358504a298932b7d4d21d53a0fb6a55c08`  
Production deployment: **NO**
