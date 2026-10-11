# TPI-VIDEOS-003 Production Verification

Pre-deployment baseline was read-only: authored TPI catalog empty, scraped discovery source present, `/studio/` protected, and `/live-video` Coming Soon.

Release evidence:

- Git commit: `d71e7b4` pushed to `origin/main`.
- Additive D1 migration 0043: applied successfully to `TPI_DB`; 5 queries, 8 rows written, no existing records deleted.
- Cloudflare Worker version: `df467a8d-03e4-4df0-8da2-d96e04e05be2`.
- `GET /api/tpi-videos`: `200`; approved discovered records returned with `sourceType=discovered`.
- `GET /api/tpi-videos?source=discovered`: `200`.
- Anonymous `GET /api/tpi-videos?following=true`: `401 Member login required`.
- `/tpi-videos`, `/tpi-video`, `/tpi-channel`: `200`; deployed source selector, Following tab, load-more, follow, and Community-share UI strings present.
- `/studio/`: `403` and Coming Soon gate retained.
- `/live-video`: `200` and Coming Soon surface retained.

Required remaining checks: authenticated creator/member production workflow, external provider playback, production notification delivery, and physical/mobile browser acceptance. No production member follow/share/comment mutation was performed; those remain NOT YET VERIFIED.
