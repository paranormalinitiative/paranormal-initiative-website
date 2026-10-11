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

## TPI-VIDEOS-005-A — Navigation branding verification

Cloudflare runtime Version ID: `3626c893-7043-4cb5-9dbb-7e8011bf7fde` from
TPI commit `e1ddab2`.

Cache-busted production verification passed on 2026-10-11:

- `/member-sidebar.html` returned 200 and contains `TPI Creator Studio` with
  the unchanged `/studio/` destination.
- `/member-shell.js` returned 200 and contains the matching mobile visible
  label, aria label, and `/studio/` destination.
- Anonymous `/studio/` returned 403 and retained the Creator Studio Coming
  Soon gate.
- Public `/live-video` returned 200 and retained the Coming Soon message.

The deployed source and static regression preserve the owner-only access
boundary. An authenticated owner DOM session was not available, and the local
member-settings browser portion could not run because Playwright is not
installed; these remain owner/browser-environment acceptance items. No
StudioFlow functionality, D1 data, R2 storage, or authentication rule was
changed by this addendum.

Documentation-sync Cloudflare Version ID that published this verification
record: `24edd085-67ae-4522-b2c5-de2086902828`.
