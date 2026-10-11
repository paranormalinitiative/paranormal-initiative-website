# TPI-VIDEOS-010 Release Report

## Release status

**Duration/card repair:** READY WITH LIMITATIONS.
**Full TPI-VIDEOS-010 completion:** NOT COMPLETE; remaining integration,
authenticated creator, physical-device, recording-recovery, and long-duration
acceptance items remain open.

## Release identifiers

- TPI website commit: `e91156846928fc39c79142d73cb10ea4338ff2f4`.
- Pushed to `origin/main`.
- Cloudflare Version ID: `03d7b39f-9a13-44da-a45b-12d0c3632127`.
- No StudioFlow source commit or remote push was created; its source was not
  changed.

## What shipped

Known discovered-provider seconds now render as readable duration badges;
creator-authored formatted timestamps are parsed safely; unknown values are
not fabricated; duration filters were added to the existing catalog controls;
publication dates are human-readable; featured metadata includes known
duration; card spacing was tightened; and the original provider/internal
watch routing remains intact.

## Verification

Focused duration/date regression, existing grid regression, and existing
player/provider regression passed. Elevated StudioFlow build, room syntax, and
RTMP syntax passed. Read-only production smoke passed **10/10**. Live browser
verification passed for the owner-reported duration examples, date rendering,
Under 1 minute filtering, direct Odysee routing, and protected navigation.

## Remaining limitations

Authenticated creator publication and actual authorized native playback,
physical device behavior, external provider sessions beyond routing, full
recording/recovery/export/long-session acceptance, and complete StudioFlow-to-
Feed-to-authorized-playback integration remain UNVERIFIED. Do not start
TPI-SOCIAL-003 until the remaining TPI-VIDEOS-010 acceptance work is reviewed
and completed.
