# TPI-VIDEOS-003 Security

Server-side controls remain authoritative: draft/status queries require an appropriate authenticated owner/admin context, Following requires a member session, follow mutations reject self-follow and non-public channels, and Community sharing requires an authenticated member plus a published public authored video. Comment reads now enforce authored-video visibility. Responses containing member-specific state are no-store/private.

No stream keys, recording objects, StudioFlow sessions, R2 recording storage, production credentials, or database rows were exposed or migrated destructively. `/studio/` and `/live-video` boundaries remain preserved.
