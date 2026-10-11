# TPI-VIDEOS-004 Live Discovery

Added `GET /api/tpi-broadcasts` with public-safe filters:

- `upcoming`: published, scheduled, future, visible listings.
- `live`: published live listings with verified playback only.
- `ended`: completed broadcasts without a published replay.
- `replay`: completed broadcasts with an explicitly published replay.

Private drafts are excluded from anonymous and ordinary-member discovery.
Members may read member-visible published listings when authenticated.

Local isolated E2E: PASS for upcoming and replay discovery and for excluding
unpublished and unverified-live records. Production catalog population remains
empty/unchanged until an owner explicitly publishes a real listing.
