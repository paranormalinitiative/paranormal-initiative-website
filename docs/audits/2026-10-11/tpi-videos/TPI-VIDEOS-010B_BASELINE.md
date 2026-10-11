# TPI-VIDEOS-010B Baseline

**Status:** In progress — acceptance continuation; not fully closed.

This acceptance continues the TPI-VIDEOS-010 duration/card repair without
rebuilding StudioFlow. The live TPI source remains this repository, while the
canonical StudioFlow source remains `/Users/toddknipple/Documents/StudioFlow/web`.

Carried-forward release evidence:

- TPI runtime commit `e91156846928fc39c79142d73cb10ea4338ff2f`.
- TPI documentation commit `92228be24def8b46bf38419464cd308bddaa7ce4`.
- Cloudflare runtime version `03d7b39f-9a13-44da-a45b-12d0c3632127`.
- Focused TPI duration/date, grid, and player regressions passed.
- StudioFlow build, room, and RTMP checks passed.
- Production boundary smoke passed 10/10.

The owner-only `/studio/` boundary, public `/live-video` Coming Soon state,
creator-owned recording storage, and no automatic recording upload to TPI R2
remain in force. No production data or StudioFlow source was changed by this
documentation batch.
