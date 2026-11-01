# TPI-STUDIOFLOW-122F.4 — Notes Trash, Restore, and Permanent Deletion

Date: 2026-10-31
Environment: `http://127.0.0.1:8787/studio/`
Status: **PARTIAL / DEVELOPMENT ONLY / NOT DEPLOYED**

## Existing architecture

Notes already used an owner-scoped `studio_notes.status` field with `active`,
`archived`, and `trash` values. The prior Trash action was therefore a soft
delete, but it did not record a deletion timestamp or retain the pre-trash
folder independently. Trash also lacked a note-level restore/permanent-delete
workflow. Attachments are private owner-scoped records backed by the existing
media storage; revisions are retained separately, with the existing latest-100
revision policy. Folder deletion uses safe `ON DELETE SET NULL` behavior.

## Implementation

- Added additive local migration `0057_studioflow_note_trash_metadata.sql`
  with `deleted_at`, `trash_collection_id`, and an owner/status index. The
  migration was applied to local D1 only; production was not touched.
- Trash now preserves content, title, folder/project association, attachments,
  and revisions while recording `deleted_at` and the prior collection.
- Trash notes are visible in the existing three-column workspace, display their
  deletion time, and open read-only.
- Restore returns the note to its prior folder when it still exists. If that
  folder is gone, the server restores to All Notes and returns an explicit
  fallback signal; the client displays the destination notice.
- Permanent deletion is available only for trashed notes, requires the exact
  confirmation phrase `DELETE PERMANENTLY`, and is guarded by owner, Trash
  status, and optimistic version checks. It deletes only the selected note and
  its revisions.
- Attachment-bearing permanent deletion fails closed with
  `note_attachment_cleanup_blocked`. No R2 object or attachment record is
  deleted until shared-reference and historical-revision cleanup is separately
  proven safe.
- Trashed notes cannot be edited or autosaved. Existing active-note autosave,
  revisions, attachments, titles, folders, and project associations remain
  unchanged.

## Files

Website repository:

- `functions/api/[[path]].js`
- `migrations/0057_studioflow_note_trash_metadata.sql`
- `scripts/local-application-schema.mjs`
- `scripts/studioflow-release-baseline.json`
- `scripts/verify/tpi-studioflow-122f4-notes-trash.mjs`
- this execution record and synchronized development-status documents

StudioFlow source worktree:

- `src/NotesView.tsx`
- `src/styles.css`

## Verification

The focused Firefox Developer Edition suite exercised disposable records on
port 8787. It passed 21/22 checks: login, Trash navigation, soft delete,
read-only Trash editing, deletion timestamps, restore, content/folder/revision
preservation, cancel/confirm permanent deletion, unauthenticated rejection,
explicit-confirmation enforcement, ownership guards, attachment fail-safe
behavior, and autosave protection. The server/API fallback to All Notes passed;
the browser-only visible missing-folder notice remained inconsistent in the
automated harness and is recorded as **UNVERIFIED** rather than overstated.

The maintained Firefox Notes regression passed all listed checks. Release
safety passed 21/21. `node --check` passed for the Worker API and focused
verifier. Reproducible source staging passed twice from the exact approved
source commit, with no obsolete bundle references. Disposable `122F4` notes
and collections were cleaned from local D1; no owner records were changed.

## Provenance

- Source commit: `ddc8eed4321510a86da35d7a1bb35f0cf8b8a50e`
- Website integration commit: `619dee31a4a64101e29a8ac38db41676cd72d51c`
- Documentation synchronization commit: `33b4cad8afe9477210e3c363763930b959239f96`
- JavaScript: `index-C7r7gqow.js`, SHA-256
  `5c5ba8b78bc638b0258b2f1fa1d5c85fcdcd934d4e51c424d8e318074b38982a`
- CSS: `index-Y3KKfVMj.css`, SHA-256
  `b60d93eb648c49585d5c57200a99313334a2ff390422e71cc0396365d02aae18`
- Production: unchanged; no deployment authorized or performed

## Remaining limitation

Permanent deletion of notes with attachments is intentionally blocked until a
separate approved cleanup design proves that R2 objects and shared/historical
references can be removed safely. No automatic Trash purge was added.
