# TPI-VIDEOS-007 Baseline

Date: 2026-10-11

Canonical TPI source: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`

Canonical StudioFlow source: `/Users/toddknipple/Documents/StudioFlow/web`

## Existing behavior

`tpi-video.html` already provided metadata, comments, reactions, saves, sharing,
channel links, related videos, and embed/link actions. Its player path was not
source-aware: an embed rendered in an iframe, but a thumbnail rendered as the
player when no embed existed. The API already exposed validated provider URLs
and verified playback/replay fields, but production currently has no published
creator-authored rows.

## Scope boundary

This directive changes only the TPI Videos watch-page playback decision path,
its focused client helper, regression coverage, and documentation. StudioFlow
camera, microphone, recording, storage, scheduling, broadcast, and access
systems were not rebuilt or modified. Creator-owned local recordings are not
uploaded or made public by this change.

## Safety baseline

The public `/live-video` Coming Soon page, `/studio/` access boundary, TPI API
authorization, D1 data, R2 objects, and unrelated dirty working-tree files are
preserved.
