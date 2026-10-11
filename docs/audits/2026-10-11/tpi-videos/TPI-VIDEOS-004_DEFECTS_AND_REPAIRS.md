# TPI-VIDEOS-004 Defects and Repairs

## D-004-001 — playback synchronization column mismatch

Status: repaired and regression-tested.

The first local lifecycle run found that the synchronization helper wrote
`playback_url` to `tpi_videos` although the initial additive migration had only
added that field to `live_broadcasts`. The fix added the missing additive
`tpi_videos.playback_url` column and updated creation/edit/sync paths.

Verification: fresh migration replay plus the full E2E suite passed 199/199.

No other confirmed application defect was found in this batch. Unavailable
external media, provider, physical-device, and authenticated production tests
remain unverified rather than being listed as repairs.
