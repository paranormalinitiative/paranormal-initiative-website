# TPI-DEV-024 — Recording Recovery and Storage Verification

## Existing behavior preserved

The DEV-023 assessment found that StudioFlow already uses browser-managed
recording storage with IndexedDB recovery for incomplete sessions, optional
File System Access folder storage, local library metadata, and explicit export
controls. DEV-024 did not replace that model or add a second recording store.

The workspace bridge makes the boundary explicit in the UI:

> Workspace metadata syncs to your account. Recording files stay in Browser
> Storage until you explicitly export them.

Open and archive actions explicitly state that browser recordings remain
untouched. The bridge stores only counts and storage mode in the workspace
snapshot. No R2 upload is automatic, and no recording delete path was added.

## Verification

| Check | Status | Evidence |
| --- | --- | --- |
| Existing IndexedDB/recovery code preserved | PASSED | Generated StudioFlow bundle unchanged |
| Workspace save excludes recording blobs/file handles | PASSED | 13/13 offline checks; live sensitive-field assertion |
| Save does not upload recordings | PASSED | Bridge source check; no `/api/uploads` call |
| Archive does not delete recordings | PASSED | Source check and 23/23 live QA |
| Restore keeps existing local recordings in place | PASSED for implemented boundary | Bridge only changes supported local metadata and reloads |
| Manual browser recovery visual check | NOT TESTED | Owner browser acceptance required |
| Cross-device recording recovery | NOT IMPLEMENTED | Requires a separate approved storage/upload design |

## Recovery guidance

Creators should use StudioFlow's existing recovery UI and explicit export/local
backup controls before clearing browser storage, changing browser profiles, or
moving devices. DEV-024 does not imply that a saved workspace makes a browser
recording cloud-backed.
