# TPI-STUDIOFLOW-122F.5 — Notes Trash Completion, Acceptance Closure & Development Baseline

Date: 2026-10-31  
Status: **COMPLETE**  
Environment: `http://127.0.0.1:8787/studio/`  
Production deployment: **NOT AUTHORIZED / UNCHANGED**

## Accepted baseline

- StudioFlow source: `9703b087e91e85e0f791f618a90f9b2c4eeb5160`
  - checkout: `/Users/toddknipple/Documents/StudioFlow/web-122`
  - branch: `codex/studioflow-122-notes`
  - clean.
- Website repository before this closure: `378b43acdb0a08bd745148c432e1e0ccd61cac0b`.
- Previous website integration: `dfe2acd5abd060fe220e34a91ddc6d708b40107d`.
- Website closure commit: `dce748e8c47404c117cbf107939e2629cdcf7741`.
- GitHub parity: verified for `codex/tpi-development`.
- Original mixed source checkout remains preserved with its pre-existing changes.

## Final acceptance consolidation

The 122F.4A–122F.4C sequence is accepted in development:

| Requirement | Result |
|---|---|
| Firefox authentication | PASS |
| Trash collection rendering | PASS |
| Trash note selection | PASS |
| Browser Restore action | PASS |
| Missing-folder fallback notification | PASS |
| Notification persistence | PASS |
| Notification dismissal | PASS |
| Restoration to All Notes | PASS |
| Note content preservation | PASS |
| Attachment-free permanent deletion | PASS |
| Attachment-bearing permanent deletion | PASS |
| Shared-reference protection | PASS |
| Revision preservation | PASS |
| Storage-failure safety | PASS |
| Notes regression | PASS |
| Release safety | PASS — 21/21 |
| Production unchanged | YES |

Supporting records:

- [122F.4A implementation record](TPI-STUDIOFLOW-122F4A-NOTES-TRASH-COMPLETION.md)
- [122F.4B verification record](TPI-STUDIOFLOW-122F4B-FINAL-VERIFICATION.md)
- [122F.4C Firefox record](TPI-STUDIOFLOW-122F4C-FIREFOX-NOTIFICATION.md)
- [Firefox verification harness](../../../scripts/verify/tpi-studioflow-122f4c-firefox-notice.mjs)

## Preserved Firefox evidence

The temporary screenshots existed and were copied into the permanent evidence
location:

- [Trash note before Restore](evidence/TPI-STUDIOFLOW-122F4C/trash-before-restore.png)
  - SHA-256: `eb5005c22c2cac9fd300117e262898d515f46f231f52deb5b512b20b50c410a4`
- [Fallback notification after Restore](evidence/TPI-STUDIOFLOW-122F4C/restore-notice-visible.png)
  - SHA-256: `d510cad3b8702332ff9edf25adb53d9f1328b68023529c50e31b8bb35c82305b`

Firefox Developer Edition `160.0b3` visibly rendered:

`Note restored to All Notes because its original folder no longer exists.`

The notification remained visible through the observation period and cleared
after the next note action. The disposable test records were removed; no owner
notes or production data were used.

## Known limitation — R2 object cleanup

Permanent deletion removes verified note-owned D1 attachment, revision, and note
records when safe. The current schema does not provide sufficient ownership and
reference information to guarantee safe deletion of every underlying R2 object.
R2 objects are therefore retained where object-level cleanup cannot be proven
safe. This is intentional storage protection, not incomplete acceptance.

Any future R2 garbage-collection system requires separate investigation,
retention rules, reference accounting, and explicit authorization.

## Scope and safety

This closure changed no StudioFlow application source, API route, schema,
authentication behavior, attachment logic, or production resource. It only
preserves evidence, updates documentation/register records, and establishes the
accepted development baseline. No production deployment was performed.
