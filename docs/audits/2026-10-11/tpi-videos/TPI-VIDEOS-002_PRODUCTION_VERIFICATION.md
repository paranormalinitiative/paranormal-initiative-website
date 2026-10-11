# TPI-VIDEOS-002 Production Verification

Deployment: Cloudflare Worker version `165b50e5-0e84-4179-ad33-208173095123`
on 2026-10-11.

The additive channel schema was applied explicitly from
`migrations/0042_tpi_video_channels.sql` after read-only inspection confirmed
that Wrangler's migration history was not usable for a selective apply. No
historical migrations were replayed.

Required boundary checks:

- anonymous catalog does not expose drafts or private authored records;
- `/studio/` remains owner/authentication protected;
- `/live-video` remains the public Coming Soon page;
- no production recording storage, R2 recording upload, or unrelated database
  data is changed;
- creator-authenticated publish/channel workflow is separately identified.

Observed production results:

- standard anonymous boundary smoke: PASS 10/10;
- anonymous `/api/tpi-videos`: PASS 200 and JSON catalog;
- anonymous `?status=draft`: PASS 200 with an empty list;
- anonymous nonexistent video/channel detail: PASS 404;
- unauthenticated creator create: PASS 401;
- `/studio/`: PASS 403;
- `/live-video`: PASS 200 with Coming Soon.

Authenticated owner publishing/channel workflow: NOT YET VERIFIED in
production because no owner session was supplied to automation. No production
video rows were created by the verification.
