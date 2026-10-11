# TPI-VIDEOS-004 Broadcast Identity

Implemented: `POST /api/tpi-broadcasts` creates one stable `live_broadcasts`
record and one linked draft `tpi_videos` listing. The broadcast ID is unique,
creator-owned, and re-opening the same ID is idempotent for its owner.

The existing contributor account and channel remain the ownership authority.
No new account, channel, or social-network identity was introduced.

Local isolated E2E: PASS. Anonymous creation and ordinary-member creation were
rejected; creator ownership and draft reopening passed.
