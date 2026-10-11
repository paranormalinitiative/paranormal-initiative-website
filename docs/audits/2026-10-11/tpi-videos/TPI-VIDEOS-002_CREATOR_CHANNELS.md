# TPI-VIDEOS-002 Creator Channels

The channel foundation links one public channel to each contributor through
`tpi_video_channels.owner_id`. A channel is created lazily from the existing
member identity, with a normalized slug and editable name, description,
artwork, and visibility.

Routes:

- `GET/PUT /api/tpi-channels/me` for the authenticated creator’s channel.
- `GET /api/tpi-channels/:slug` for a public channel and its published public
  videos.

The member shell and paper editor link to `creator-videos.html`; public channel
pages use `tpi-channel.html`. No new identity system or social subscription
system was introduced. Channel-page production/authenticated acceptance remains
NOT YET VERIFIED.
