# TPI-VIDEOS-002 Creator Publishing

Creator routes are implemented in `functions/api/[[path]].js` and surfaced by
`creator-videos.html` / `creator-videos.js`.

- `POST /api/tpi-videos` creates a draft owned by the authenticated contributor.
- `PUT /api/tpi-videos/:slug` edits metadata only after ownership/admin checks.
- `POST /api/tpi-videos/:slug/publish` and `/unpublish` are explicit lifecycle
  actions; publishing revalidates the source and required metadata.
- `POST /api/tpi-videos/:slug/remove` and `DELETE` soft-remove records.
- `GET ...?mine=true` exposes the creator’s own drafts and status history.

The existing paper editor now creates a draft and immediately performs the
explicit publish action, while a failed publish leaves the draft recoverable.
No recording is uploaded to TPI-managed R2. Local owner/member/anonymous
authorization assertions passed; authenticated production owner acceptance is
NOT YET VERIFIED.
