# TPI-ADMIN-008 — Authenticated browser tests

Status: **BLOCKED — authorized administrator session required.**

No authorized production browser session was available during this batch.
Therefore dashboard rendering, navigation/API interaction, member detail
actions, creator/team/contributor workflows, responsive authenticated states,
console behavior, and safe mutation checks are not claimed as passed.

Owner acceptance procedure:

1. Sign in with an authorized TPI owner/admin account.
2. Open `https://paranormalinitiative.com/admin-center-preview/`.
3. Verify the dashboard metrics, distinct Community routes, member detail, and
   audit views.
4. Verify transitional links open only their protected existing workflows.
5. Confirm no private data, stream keys, recordings, or unauthorized controls
   are exposed.
6. Test only disposable/safe records for mutations.
