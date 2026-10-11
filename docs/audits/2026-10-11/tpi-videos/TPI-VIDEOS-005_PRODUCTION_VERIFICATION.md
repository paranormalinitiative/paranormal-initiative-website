# Production Verification

Cloudflare deployment: `fced668f-8949-4e5e-8153-663462702084` from TPI commit `d743a67`.

Verified on 2026-10-11 against `https://paranormalinitiative.com`:

- `GET /api/tpi-broadcasts?status=upcoming` returned 200 with a safe empty public list.
- `GET /api/tpi-broadcasts?mine=true` without a session returned 401.
- Anonymous `POST /api/tpi-broadcasts` returned 401 and did not create data.
- `GET /studio/` and `/studio/index.html` without a session returned 403 with the protected Creator Studio Coming Soon page.
- `GET /live-video` returned 200 and rendered the existing Coming Soon pill/message.
- The 005 release report URL returned 200.

Limit: a signed-in owner/contributor browser session was not available in this run, so authenticated browser mutation controls, notification inbox delivery, and physical offline behavior remain owner verification items.

Required after deployment:

- authenticated owner/contributor: create local schedule, Sync to TPI, refresh, edit/reschedule, publish, unpublish, cancel;
- ordinary member and logged-out browser: no Creator Studio/API access beyond existing Coming Soon/protection;
- public `/live-video`: unchanged Coming Soon;
- direct API calls: anonymous/member mutation denial and no private draft exposure;
- notification inbox: publication/replay notification with video preference enabled;
- no R2 or recording-storage writes.

The deployment preserved `/studio/` authentication, public `/live-video`, creator-owned recording storage, and unrelated production data. No D1 migration or R2 change was performed.
