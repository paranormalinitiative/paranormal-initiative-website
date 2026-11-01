# TPI-STUDIOFLOW-122F.4C — Final Firefox Notification Verification

Date: 2026-10-31  
Status: **COMPLETE**  
Environment: `http://127.0.0.1:8787/studio/`  
Production deployment: **PROHIBITED / UNCHANGED**

## Baseline

- Website HEAD: `1ac328c1ff1d989b7494866361cb56419459a30f` on `codex/tpi-development`
- StudioFlow source: `9703b087e91e85e0f791f618a90f9b2c4eeb5160` on `codex/studioflow-122-notes`
- Original mixed source checkout was not modified.
- Local Worker: port 8787, local D1/R2 under `.local-dev/state/v3`.

## Firefox evidence

- Browser: Firefox Developer Edition `160.0b3`
- Account: `tpi_test_admin` synthetic local test account; credentials excluded.
- Disposable note ID: `b2ee9089-f4dd-4e94-be67-73803723bb12`
- Disposable folder ID: `c7e07d06-965b-4df6-9f56-207993ddcafb`
- Test harness: `scripts/verify/tpi-studioflow-122f4c-firefox-notice.mjs`
- Evidence directory: `/tmp/tpi-122f4c-evidence/`

Screenshots captured from the actual Firefox window:

- [Trash note before Restore](/tmp/tpi-122f4c-evidence/trash-before-restore.png)
- [Fallback notification after Restore](/tmp/tpi-122f4c-evidence/restore-notice-visible.png)

The final run passed all focused checks:

1. Firefox authentication succeeded.
2. The disposable missing-folder fixture was confirmed through the API.
3. The Notes view and Trash collection rendered.
4. The actual Trash card was selected by its unique visible title.
5. Restore was executed through the Firefox interface.
6. The exact visible notification rendered:
   `Note restored to All Notes because its original folder no longer exists.`
7. The notification remained visible for three seconds without another note action.
8. The note returned to All Notes with its content intact.
9. Selecting the restored note again cleared the notification.

## Harness investigation and correction

The previous harness waited on broad page text after refresh and used a direct DOM lookup without confirming the target card had finished rendering or that the selected title matched the disposable record. The corrected isolated harness waits for the Notes view, active Trash navigation, the rendered `button.notes-library-card`, the title input selection, and the Restore control. It uses no application-code changes.

## Regression and safety

- Maintained Firefox Notes regression: **PASS**.
- Release safety: **PASS — 21/21**.
- Disposable records remaining after the run: **0 notes, 0 attachments**.
- Application source changes: **NONE**.
- Database schema changes: **NONE**.
- R2/storage changes: **NONE**.
- Production: **UNCHANGED**.

## Acceptance matrix

| Requirement | Result |
|---|---|
| Firefox authentication | PASS |
| Trash collection rendering | PASS |
| Trash note selection | PASS |
| Browser Restore action | PASS |
| Exact fallback notification visible | PASS |
| Notification persistence | PASS |
| Notification dismissal | PASS |
| Restored note in All Notes | PASS |
| Content preservation | PASS |
| Notes regression | PASS |
| Release safety | PASS |
| Production unchanged | YES |

The 122F.4A–122F.4C browser-visible acceptance sequence is now verified. No production deployment was performed.
