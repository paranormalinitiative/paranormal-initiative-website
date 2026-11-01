# TPI-STUDIOFLOW-122F.4B — Final Notes Trash Verification

Date: 2026-10-31  
Status: **PARTIAL**  
Environment: `http://127.0.0.1:8787/studio/`  
Production deployment: **PROHIBITED / UNCHANGED**

## Baseline

- Website repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
  - branch: `codex/tpi-development`
  - HEAD: `91f77f8a049d92767d410ab56d27f74d405c5922`
  - tracked release files clean; unrelated generated bundles remain untracked and were preserved.
- Isolated StudioFlow source: `/Users/toddknipple/Documents/StudioFlow/web-122`
  - branch: `codex/studioflow-122-notes`
  - HEAD: `9703b087e91e85e0f791f618a90f9b2c4eeb5160`
  - clean.
- Original mixed checkout: `/Users/toddknipple/Documents/StudioFlow/web`
  - branch: `main`
  - pre-existing `src/App.tsx` and `src/styles.css` modifications preserved untouched.
- Local Worker: running on port 8787 with D1/R2 under `.local-dev/state/v3`; no production resources were used.

## Firefox notification verification

Firefox Developer Edition version: `160.0b3`.

The isolated Selenium suite successfully logged in with the synthetic `tpi_test_admin` account and created disposable records. Its UI setup repeatedly failed to select the newly hydrated Trash card after refresh, so the Restore control was not activated in that run. The resulting `.notes-trash-status` element was therefore not visible evidence.

The direct disposable API check independently returned:

```json
{
  "restoreNotice": "Note restored to All Notes because its original folder no longer exists.",
  "restoredToAllNotes": true,
  "note": { "status": "active", "collectionId": null, "bodyText": "API fallback content" }
}
```

Result: **Firefox-visible fallback notification — UNVERIFIED / ENVIRONMENTAL BLOCKER**. The API fallback and restoration integrity are PASS, but API evidence is not substituted for browser-visible evidence. No application change was made to accommodate the test runner.

## Storage-failure safety verification

A disposable trashed note was created in local D1. A database trigger was added only for that note to raise an injected delete failure. The permanent-delete request returned:

```text
HTTP 503
{"error":"Notes storage is temporarily unavailable.","code":"notes_backend_unavailable"}
```

After the failed batch, the note remained `status=trash`, its revision count remained `1`, and its attachment count remained unchanged. Removing the test trigger allowed the same explicitly confirmed request to succeed. The disposable trigger, note, folder, and test data were then removed.

The current permanent-delete path does not call R2. It deliberately retains R2 objects because the Notes schema has no reference-counted cleanup ledger or atomic D1/R2 transaction. Therefore, an R2 deletion failure is not applicable to this path, and no object deletion was introduced.

Attachment and shared-reference checks from the maintained Trash suite passed:

- multiple private attachments deleted with the selected note;
- attachment metadata became inaccessible after note deletion;
- a cross-note revision reference returned `409 note_shared_attachment_reference`;
- the shared-reference note remained protected;
- unauthenticated deletion and missing confirmation were rejected.

Result: **Storage-failure safety — PASS for applicable current path**. Network-abort, unavailable-binding, and injected attachment-validation failures were not separately exercised because doing so would require disrupting the shared Worker or replacing its storage binding.

## Regression results

- Maintained Firefox Notes suite: **PASS** (`TPI-STUDIOFLOW-122`, all reported checks passed).
- Maintained `TPI-STUDIOFLOW-122F.4` suite: **FAIL as a whole** because its Trash-card UI setup could not reliably select the hydrated card; attachment deletion and shared-reference checks passed within the run.
- Release safety: **PASS — 21/21** (`npm run verify:release-safety`).
- Disposable local records after testing: **0 matching notes, 0 matching attachments**.

## Acceptance matrix

| Requirement | Result |
|---|---|
| Missing-folder API fallback | PASS |
| Firefox-visible fallback notification | UNVERIFIED |
| Notification persistence | UNVERIFIED |
| Note restoration integrity | PASS |
| Attachment-free deletion | PASS |
| Attachment-bearing deletion | PASS |
| Shared-reference protection | PASS |
| Revision handling | PASS |
| Database failure safety | PASS |
| R2 safety | PASS — no R2 deletion performed |
| Notes regression | PASS |
| Release safety | PASS |
| Production unchanged | YES |

## Scope and safety

No application source, database schema, R2 object, authentication behavior, or production deployment was changed under this verification directive. The only new artifact is this execution record. The overall directive remains **PARTIAL** until real Firefox UI evidence shows the exact fallback notification rendered and remaining notification-persistence behavior is exercised through the browser.
