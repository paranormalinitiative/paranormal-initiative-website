# TPI-VIDEOS-004 Production Verification

Status before release: NOT RUN.

Required post-deployment read-only checks:

- TPI API and public pages respond successfully.
- Anonymous `/tpi-broadcasts` returns only published public records.
- Anonymous draft detail and mutation remain denied.
- `/studio/` remains protected/owner-only.
- `/live-video` remains Coming Soon.
- No R2 or recording-storage mutation occurred.

Required owner-authenticated checks were not performed automatically: create a
draft, publish an upcoming listing, enter Studio, start/stop only with safe
test data, and verify the owner sees the integrated identity. External provider
delivery, playback decode, and physical-device behavior remain separate tests.
