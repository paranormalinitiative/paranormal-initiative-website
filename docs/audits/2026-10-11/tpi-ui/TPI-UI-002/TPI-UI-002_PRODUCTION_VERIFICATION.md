# TPI-UI-002 Production Verification

## Final runtime release

- Runtime commits: `8e8c0e9` and cache-busting follow-up `450b446`, both pushed
  to `origin/main`.
- Initial Cloudflare deployment: `b8edafb5-9c5d-46fb-ab49-fb5dafe3fcbf`.
- Final Cloudflare deployment: `ddddbb45-d518-46fa-b1e6-4c3f0d530f71`.
- Production URL: `https://theparanormalinitiative.paranormalsomerset.workers.dev`.

## Verification results

- Read-only production smoke: **PASS 10/10**.
- Public `/live-video` remains Coming Soon: **PASS**.
- Anonymous `/studio/` remains denied: **PASS 403**.
- Anonymous session, Messenger, notification, admin API, public discovery/feed,
  and private media boundaries: **PASS** in the 10/10 smoke.
- Versioned `/workspace-shell.css?v=2`: **PASS 200**, with the workspace
  Messenger docking and flexible layout rules.
- Versioned `/member-shell.js?v=56`: **PASS 200**, with workspace-aware
  collapsed Messenger positioning.
- Anonymous `/admin-panel.html` and `/member-dashboard.html` remain protected
  (`403`/redirect); no unauthenticated HTML access was claimed.

The first deployment exposed stale unversioned asset responses. The follow-up
commit changed the two workspace pages to request `workspace-shell.css?v=2` and
`member-shell.js?v=56`; the final deployment verified those versioned assets.

## Remaining owner verification

Authenticated owner/member visual review remains the final stop gate. No
approved signed-in browser session was available, so desktop, tablet, and phone
visual acceptance was not claimed and no credentials or cookies were invented.

No D1, R2, recording, membership, entitlement, role, or livestream state was
changed.
