# TPI-VIDEOS-006 Security

Verified locally:

- Anonymous broadcast/video mutations are denied.
- Ordinary members cannot create or modify creator broadcasts.
- Cross-creator draft access is denied.
- Owner checks use server-side session identity.
- Stale revisions return HTTP 409 instead of overwriting newer state.
- Cross-origin bridge mutations return HTTP 403.
- Drafts and unpublished listings are excluded from public discovery.
- Unsupported/unsafe video sources are rejected.
- `/studio/` remains protected by the Worker gate.

Production read-only checks confirmed `/studio/index.html` returned HTTP 403,
`/live-video` returned HTTP 200 with Coming Soon, and anonymous notifications
remained denied. No credentials, stream keys, recordings, R2 objects, or D1
production records were exposed or changed.

CSRF behavior beyond the existing same-origin header policy, session expiry,
rate-limit saturation, and authenticated cross-account production checks remain
owner-environment acceptance items.
