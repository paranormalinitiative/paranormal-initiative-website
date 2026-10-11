# TPI-VIDEOS-004 Production Verification

Status: PASS for public/read-only release boundaries after deployment.

Runtime commit: `6d7e96f`.
Cloudflare Version ID: `2c2fe8d3-3389-48a4-8b12-f6026d02f1ef`.

Observed after deployment:

- `GET /api/tpi-broadcasts?status=upcoming` — HTTP 200, safe empty result.
- `GET /api/tpi-broadcasts?status=live` — HTTP 200, safe empty result.
- `GET /api/tpi-videos?pageSize=1` — HTTP 200, existing catalog served.
- `/studio/` — HTTP 403 and Coming Soon gate preserved.
- `/live-video` — HTTP 200 and Coming Soon content preserved.
- Anonymous `POST /api/tpi-broadcasts` — HTTP 401; no record created.

The following post-deployment read-only checks passed:

- TPI API and public pages respond successfully.
- Anonymous `/tpi-broadcasts` returns only published public records.
- Anonymous draft detail and mutation remain denied.
- `/studio/` remains protected/owner-only.
- `/live-video` remains Coming Soon.
- No R2 or recording-storage mutation occurred.

Owner-authenticated checks were not performed automatically: create a
draft, publish an upcoming listing, enter Studio, start/stop only with safe
test data, and verify the owner sees the integrated identity. External provider
delivery, playback decode, and physical-device behavior remain separate tests.
