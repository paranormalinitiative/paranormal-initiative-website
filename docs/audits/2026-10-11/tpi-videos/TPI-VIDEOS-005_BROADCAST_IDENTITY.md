# Broadcast Identity

The StudioFlow local `broadcast.id` is the stable idempotency key and is sent as `broadcastId`. TPI retains its existing `live_broadcasts.id`, generated `tpi_videos.id`, channel ID, slug, and ownership. A repeated create request returns the existing mapping rather than creating another listing.

The local record does not claim that a recording or external playback asset has been uploaded. The identity links schedule and publication state only.
