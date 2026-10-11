# TPI-SOCIAL-001 Architecture

## Existing layers

- Pages: static member/public HTML, shared `header.html`, `footer.html`, and `includes.js`.
- Client behavior: member shell, settings, feed, Messenger, profiles, notifications, and library scripts.
- API: `functions/api/[[path]].js`, guarded by session, member, contributor, or admin helpers.
- Persistence: D1 migrations under `migrations/`; R2 media is addressed through `/api/media/...`.
- Tests: `scripts/e2e/api-e2e.sh`, `scripts/e2e/member-settings.mjs`, and QA scripts.

The architecture is additive and route-driven. Community tables replaced the
retired forum model; Messenger has conversation participants and message rows;
profile personalization is stored in `member_personalization`. Creator/video
features integrate through existing broadcast/video routes and do not share
private Messenger storage authorization.
