# TPI Community Workstation — Friends, Bug Reports, and Messenger Identity

Date: 2026-11-09  
Status: **COMPLETE — DEPLOYED AND VERIFIED**

## Friends visual consistency correction — 2026-11-10

The Friends page had drifted away from the shared member-shell design. Its
page-local styles left the search field and action buttons as native browser
controls, used a separate panel treatment, and repeated the Friends heading
inside a page that already receives the shared member heading.

The correction reuses the established `member-panel`, `member-input`,
`member-btn`, `member-section-title`, and `member-meta` patterns. Member rows
now use the active theme surface, border, typography, hover, focus, and mobile
rules. Search and follow/unfollow controls remain unchanged functionally.

Focused verification passed 12/12, including Friends route/authentication
checks, shared-control styling, and the responsive mobile layout. The change
is limited to `friends.html` and the existing community verification script.

## Scope

This release completes the requested member-workstation additions without
changing StudioFlow or Nova Edit behavior:

- Added authenticated Friends navigation with member search, follow, unfollow,
  and a persistent following list.
- Added authenticated **Report a bug** navigation and submission form.
- Routed bug reports into the protected Administration Center report queue.
- Normalized Messenger display names and usernames so both remain readable and
  distinguishable in rosters, conversations, and read receipts.

The Friends and bug-report actions are member-scoped and fail closed when the
session is unauthenticated. Bug-report records retain the reporter, title,
description, page URL, user agent, status, and administrative review fields.

## Storage and authorization

Migration `0065_member_social_and_bug_reports.sql` adds only:

- `member_follows`, keyed by follower/following account IDs with self-follow
  protection and a uniqueness constraint.
- `member_bug_reports`, keyed by report ID and reporter account ID, with review
  status fields and indexes for the protected admin queue.

The migration was applied to the local schema and then to the production D1
database `tpi_contributor_portal` (`f36b9161-b517-4634-9857-bef4147cefe3`). The
remote execution completed successfully with 6 queries and 10 rows written;
existing records were not modified. Production schema readiness reported both
new tables present and no pending required migrations before deployment.

## Verification

- Community workstation focused checks: **9/9 PASS**.
- `node --check member-shell.js`: **PASS**.
- `node --check functions/api/[[path]].js`: **PASS**.
- `git diff --check`: **PASS**.
- Guarded release certification: **30/30 gates PASS**.
- Local authentication lifecycle: **38/38 PASS**.
- Isolated Firefox Developer Edition local acceptance: **65/65 PASS**.
- Isolated API and regression suites: **PASS**, including Studio lifecycle
  29/29, ownership/dashboard 40/40, deletion/archive 32/32, deletion safety
  26/26, production-item/Teleprompter 43/43, scene persistence 30/30, Notes
  restoration 37/37, Notes visual 67/67, Home 41/41, and mobile 19/19.
- Anonymous production smoke: **10/10 PASS**.
- Live isolated Firefox production acceptance: **65/65 PASS**.

The live browser acceptance used a disposable Firefox profile; the owner’s
Firefox profile was not accessed. No creator Studio, recording, Note, script,
or production data was used for destructive testing.

## Production release

- Website/source commit: `9a1ccc6a3b570fc8e2c3f9e84a7c479c84c63a75`
- StudioFlow source baseline: `2c7c651f34839b0115596d632f1009214e4cd63d`
- Release: `rel-9a1ccc6a3b57-00b3315dfc7e`
- Release manifest digest: `e189213cbdb735f1b55a9b475d22d8a8ff22f1d41e5c1f1f17350e36c5d9262c`
- Production Worker: `a74f05ae-3026-44f9-9eeb-41f45019a315`
- Traffic: **100%**
- Rollback Worker: `b40bd498-5b70-43e5-be33-c6a312964eae`
- Final deployment status: **DEPLOYED_AND_VERIFIED**

Key deployed asset hashes:

| Asset | SHA-256 |
|---|---|
| `studio/assets/index-BAUieVoD.js` | `06315f104af7ddef7637d4f2001556d50a1770fc9b21e354ffaa60ab946bfb0b` |
| `studio/assets/index-V2mQ_DP8.css` | `6e68faa590fb4a116d57b71bb768835e6b901c8ffdd903eee75267d4fad9899b` |
| `studio/index.html` | `98f050274c7855e0f74ee74d10951564715269a4557bb99d8ae959dae1dd49d2` |
| `admin-center-preview/assets/index-D4ux9iee.js` | `bb86188b4e7d80508773c2c430fb3e8b730b294653d37925b66fd80f3aee21b5` |
| `friends.html` | `1b4882845245d8b9ccd874250201a52e532da867df1efb65eabfe4920fa67a69` |
| `bug-report.html` | `7707bea6bebff5a0a620ce070d802a8b126c979dce86c7f5f817c82252641b8d` |
| `member-shell.js` | `e018708bd2375499ffd5104e57c05533b6be7d984bd71aa76c249e822ad749ec` |
| `member-sidebar.html` | `3b8abd5fb58c81ddbbb3fd3d8bf676ce057e8a59da41bee3be604065352081cf` |

The release uploaded 8 new or modified static assets; the remaining 642 assets
were already present in the Cloudflare asset store. No production deployment
rollback was required.

## Remaining limitation

The requested permanent **Sol** Full Access Co-Founder / Assistant Director
account and gold-medallion privileges were not created. A real account identity,
credential, and explicit role/entitlement record were not supplied, and the
release must not invent credentials or grant privileged production access. This
is intentionally left as a separate, explicit account-provisioning task.

