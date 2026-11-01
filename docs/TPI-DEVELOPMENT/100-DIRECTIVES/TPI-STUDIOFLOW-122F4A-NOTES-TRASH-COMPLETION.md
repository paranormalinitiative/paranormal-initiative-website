# TPI-STUDIOFLOW-122F.4A — Notes Trash Restoration and Attachment-Safe Deletion

Date: 2026-10-31

Status: **PARTIAL / AUTHORITATIVE LOCAL DEVELOPMENT / NOT DEPLOYED**

## Baseline and scope

This correction continues TPI-STUDIOFLOW-122F.4 from source commit
`ddc8eed4321510a86da35d7a1bb35f0cf8b8a50e` and website integration commit
`619dee31a4a64101e29a8ac38db41676cd72d51c`. Production was not queried for
mutation and was not changed. The original mixed StudioFlow checkout and
unrelated worktrees were preserved.

The authoritative candidate is staged on `http://127.0.0.1:8787/studio/`.
The source UI correction is source commit
`9703b087e91e85e0f791f618a90f9b2c4eeb5160` in
`/Users/toddknipple/Documents/StudioFlow/web-122`, branch
`codex/studioflow-122-notes`.

## Restore notification correction

The API already performed the safe fallback by checking
`trash_collection_id` against the owner-scoped collection table. The client
had two weaknesses: it inferred a fallback notice from a null current folder,
which could mislabel an ordinary All Notes restore, and it stored the notice
alongside transient save-error state. The correction uses the server's
explicit `restoreNotice`/`restoredToAllNotes` result, uses the exact message

> Note restored to All Notes because its original folder no longer exists.

and keeps the status message mounted until the user selects another note or a
new action clears it. Normal restores do not show the fallback notice.

The server/API fallback and active-note restoration passed in the disposable
Firefox runs. The rendered Firefox notice remains **UNVERIFIED** because the
legacy Selenium fixture intermittently failed to select the disposable Trash
card after refresh; the focused Playwright Firefox attempt was blocked by the
local macOS Firefox `plugin-container` sandbox launch permission. No product
failure was inferred from that harness limitation.

## Attachment ownership and deletion procedure

Migration `0055_studioflow_notes.sql` defines one owner-scoped attachment row
per note, with a unique `object_key`; revisions separately store
`attachment_ids_json`. Migration `0057_studioflow_note_trash_metadata.sql`
adds recoverable Trash metadata. The API now:

1. Requires authentication, same-origin mutation, explicit
   `DELETE PERMANENTLY`, Trash status, and an optimistic version match.
2. Loads every attachment row for the selected note, including soft-hidden
   rows.
3. Checks for an object-key row owned by another note and for attachment-ID
   references in another note's revisions or HTML.
4. Fails closed with `note_shared_attachment_reference` when a shared or
   historical cross-note reference is detected.
5. Deletes only the selected note's attachment records, revisions, and Trash
   note in one D1 batch; repeated or stale requests cannot delete another
   note.
6. Deliberately retains the private R2 bytes. The current schema has no
   reference-counted cleanup ledger and D1/R2 has no atomic cross-store
   transaction, so deleting bytes during note deletion could destroy
   recoverable historical material. The response records
   `storageCleanup: retained_for_safe_recovery`.

The retained objects remain private and inaccessible through the Notes API
after their database records are removed. Storage garbage collection is not
introduced by this directive.

## Verification

| Requirement | Result | Evidence |
|---|---|---|
| Owner-scoped Trash actions | PASS | Actual local API and maintained Firefox suite |
| Restore to existing folder | PASS | Existing 122F.4 coverage |
| Missing-folder API fallback | PASS | Actual local Firefox API response and All Notes state |
| Missing-folder rendered notice | UNVERIFIED | Selenium card-selection timing failure; Playwright Firefox launch blocked by OS sandbox |
| Attachment-free permanent deletion | PASS | Actual local API/UI path |
| Multiple attachment upload | PASS | Two real private local attachment uploads |
| Attachment-bearing permanent deletion | PASS | Note and attachment records removed; attachment endpoints return 404 |
| Cross-note revision reference | PASS | Actual revision reference returns 409 `note_shared_attachment_reference`; protected note remains |
| Shared private object bytes | PASS / RETAINED | R2 bytes are intentionally preserved; no deletion path is invoked |
| Explicit confirmation and unauthorized access | PASS | Actual local Firefox/API checks |
| Maintained Notes regression | PASS | `scripts/verify/tpi-studioflow-122-notes.mjs`, all checks passed |
| Release safety | PASS | `npm run verify:release-safety`, 21/21 |
| Production | UNCHANGED | No production deployment or production data mutation |

Disposable records named `122F4` and their D1 attachment rows were removed
after testing. No owner-created Notes, projects, or production records were
used.

## Provenance

The reproducible staging workflow built the exact source commit twice and
matched both builds. The local candidate serves:

- JavaScript: `studio/assets/index-2zeoh76e.js`
  - SHA-256: `bbe0e82636bf2c80d9fd5a720590343f32895d2d79ddede86c432d684ead2912`
- CSS: `studio/assets/index-Y3KKfVMj.css`
  - SHA-256: `b60d93eb648c49585d5c57200a99313334a2ff390422e71cc0396365d02aae18`

The website integration changes are committed and pushed as website commit
`dfe2acd5abd060fe220e34a91ddc6d708b40107d` on `codex/tpi-development`.
Existing unrelated generated bundles in `studio/assets/` remain untracked and
were not deleted or staged.

## Remaining blocker

The exact Firefox-rendered missing-folder status notification must be rerun
with a stable isolated Firefox interaction session. Until that interaction is
observed, this directive remains **PARTIAL**, not COMPLETE. Production remains
unchanged and no deployment is authorized by this record.
