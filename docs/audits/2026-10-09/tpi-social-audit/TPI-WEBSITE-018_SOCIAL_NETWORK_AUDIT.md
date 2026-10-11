# TPI-WEBSITE-018 — Social Network Functional Audit

**Audit date:** 2026-10-10
**Repository:** `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
**Scope:** TPI member authentication, Community Feed, Messenger, notifications, profiles, settings, attachments, contributor/admin controls, teams, and public access boundaries. StudioFlow and The Cauldron were out of scope.

## Executive result

The social-network API and its local D1/R2 integration were exercised in an isolated Wrangler Worker with four disposable synthetic identities. The main multi-user regression suite passed **45/45 checks after repair**. A supplemental pass verified contributor publishing, member settings/directory, public teams, and admin boundaries.

One confirmed security defect was repaired: Messenger media could be fetched without authentication when a direct `/api/media/messenger/...` URL was known. Messenger media now requires an authenticated member session. Private-library ownership checks and public community-media behavior were preserved.

This is not a claim that every production or external-provider workflow is complete. No production member was logged in, no production D1/R2 data was mutated, and no email/OAuth/push/WebRTC/external-provider path was represented as verified.

## Isolated test environment

- Clean source snapshot: `/private/tmp/tpi-website-018-local`
- Local Wrangler state: `/private/tmp/tpi-website-018-state`
- Worker: `http://127.0.0.1:8789`
- D1: local `tpi_contributor_portal`, all 42 migrations applied
- R2: local Wrangler R2 binding; no Cloudflare bucket writes
- Test identities: `tpi018_user_a`, `tpi018_user_b`, `tpi018_contributor`, and `tpi018_admin`
- Synthetic passwords/emails existed only in temporary local state and were not sent to production.

The admin/contributor roles were assigned with a local-only SQL fixture after registration. The temporary state is disposable and is not part of the repository.

## Implemented surface inventory

The audit inventoried these live source surfaces:

- Registration, login, logout, session lookup, password-reset request boundary
- Member profile, username/password endpoints, personalization, themes, directory, block list, pulse
- Messenger conversations, membership, messages, read state, unread counts, presence, preferences, nicknames, mute/block/restrict/report routes, and uploads
- Community categories, posts, comments, reactions, attachments, edit/delete ownership, and notifications
- Notification listing, unread counts, preferences, read/read-all behavior, and chat notifications
- Contributor article draft/publishing boundary and contributor article list
- Admin members, member activity, community moderation, comments, settings, invites, teams, and related access guards
- Public teams/counts, public community categories/posts, and public profile/feed surfaces
- R2 media serving and private-library authentication boundary

## Evidence summary

### Local API and storage execution — PASS after repair

- 45/45 checks passed in the final synthetic multi-user regression suite.
- A and B registered/logged in, updated/read profiles, opened a direct Messenger conversation, exchanged messages, read messages, checked unread state, and verified notifications.
- C was denied direct access to A/B's conversation.
- A created a Community post; B commented and reacted; reaction toggle removed the reaction; ownership checks rejected B editing A's post and A deleting B's comment.
- Community and Messenger uploads were written to the local R2 binding and returned through the real Worker media path.
- Contributor draft creation succeeded for C; ordinary member article creation returned 403; anonymous contributor-article access returned 401.
- Admin member/activity/settings access succeeded for D; ordinary member admin access returned 403.
- Member personalization, block-list, directory, public teams, and team counts returned expected local responses.
- Empty message/profile validation and unauthorized conversation/post/comment operations returned the expected error classes.

### Browser UI smoke evidence — PASS/PARTIAL

Using the authenticated local browser session at `http://127.0.0.1:8789`:

- Member Home rendered the Community Feed, synthetic posts, comment counts, attachment card, and Messenger panel.
- Messenger showed the synthetic conversation and reply in the visible UI.
- Member Notifications rendered chat and Community notifications with unread counts and action controls.
- `admin-panel.html` showed **Access Required** for an ordinary member, confirming the UI boundary agrees with the server-side guard.
- A narrow 467×784 viewport screenshot was captured from the actual rendered member UI. Desktop/tablet layout was inspected in source/history but was not independently captured in this run; those widths remain PARTIAL for this directive.

### Production read-only boundary checks — PASS for anonymous surfaces

Read-only requests to `https://paranormalinitiative.com` returned:

- `/` — 200
- `/live-video` — 200; public Coming Soon page retained
- `/studio/` — 403 to an unauthenticated request
- `/api/auth/me` — `{ "user": null }`
- `/api/conversations` — 401
- `/api/notifications` — 401
- `/api/admin/members` — 403
- `/api/community/categories` — 200
- `/api/community/posts` — 200

No production login, mutation, upload, D1 query, R2 operation, or real-member test was performed.

## Release state

- Git commit: `c014d6a` — `Audit TPI social network and protect messenger media`
- GitHub: pushed to `origin/main`
- Cloudflare Worker: `theparanormalinitiative`
- Cloudflare Version ID: `a44a1bda-d385-44da-8f15-c269787a6cdf`
- Deployment source: clean archive of `c014d6a`; unrelated dirty files were excluded
- Production verification: `/live-video` retained Coming Soon; anonymous `/studio/` returned 403; anonymous `/api/conversations` and `/api/notifications` returned 401; anonymous `/api/admin/members` returned 403; anonymous `/api/media/messenger/...` returned 401; public community categories/posts remained 200.

The owner-only/public access boundary and `/live-video` behavior were preserved. No production member session, database mutation, R2 upload, or external provider action was used.

## Remaining owner/external verification

- Authenticated production member/contributor/admin browser journeys
- Email delivery, OAuth, push notifications, and any provider-specific integrations
- Physical iPhone/iPad/Android browser behavior and native Files/share workflows
- True conversation-level authorization for a Messenger attachment URL; the repair now requires authentication, while the current attachment key does not carry conversation identity for recipient-level authorization
- Desktop and tablet screenshots for this exact audit run
- Production mutation/recovery behavior using a sanctioned non-owner test account
