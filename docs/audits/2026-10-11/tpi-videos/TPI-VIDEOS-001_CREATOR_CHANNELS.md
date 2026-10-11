# TPI-VIDEOS-001 Creator Channels

## Current state

The current TPI model has `created_by` on `tpi_videos` and contributor authorization for create/update/delete, but it does not have a public video-channel entity, channel slug, channel profile, subscriber/follow relation, creator video dashboard, or channel-level moderation policy. The contributor guide describes publishing a TPI Video but not operating a persistent creator channel.

## Planned channel model

Before implementation, define:

1. Channel identity owned by a contributor or approved organization.
2. Stable handle, title, description, avatar/banner, links, status, and moderation owner.
3. Video membership and publication states: draft, review, published, unlisted, archived, removed.
4. Follow/subscription notifications without coupling them to the existing general member notification taxonomy prematurely.
5. Channel-level reports, takedown, appeals, and ownership transfer.
6. Clear relationship to external provider channels and creator-owned storage.

## Acceptance boundary

Do not advertise “creator channels” as available until a member can create/manage a channel, publish an authorized video, view the channel page, and exercise the moderation/takedown path with audit evidence.
