# TPI-DEV-023 — Remaining Production Blockers

Date: 2026-10-14

The following items remain before any production consideration:

1. **Owner browser acceptance** — authenticated visual acceptance of the Admin
   Center and Events UI remains owner-required.
2. **Positive StudioFlow runtime** — room creation, participant/session flow,
   and livestream behavior were not exercised because they depend on the
   external RealtimeKit path and the development configuration keeps outbound
   side effects disabled.
3. **StudioFlow project persistence** — no project/workspace CRUD or
   cross-device persistence exists in this website checkout.
4. **Production readiness** — this directive did not authorize or perform a
   production deployment, D1/R2 change, import, authentication change, or
   member-account change.
5. **Worktree follow-up** — unrelated audit and historical documentation
   changes remain intentionally outside the TPI-DEV-023 checkpoint and must be
   handled separately if they are to be committed.

These are documented blockers or limitations, not silently converted into
passing functionality.

## Current-status addendum — TPI-DEV-026

This document preserves the DEV-023 snapshot. Subsequent directives changed the
current state:

- StudioFlow workspace metadata persistence, owner isolation, conflict handling,
  and archive behavior were implemented in DEV-024.
- Positive entitled-creator access and local JSON configuration backup/import
  were verified in DEV-025.
- The remaining StudioFlow limitations are browser visual/file-picker acceptance,
  browser session-restart recording recovery, and a separately authorized
  positive RealtimeKit test.
- Production deployment, production data changes, and the development migration
  ledger reconciliation remain open release-readiness concerns.
