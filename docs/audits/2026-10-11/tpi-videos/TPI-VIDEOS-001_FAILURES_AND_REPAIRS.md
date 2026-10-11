# TPI-VIDEOS-001 Failures and Repairs

## Confirmed findings

### F-001 — Draft authored-video API exposure

- **Severity:** P1 pre-publication security gate.
- **Evidence:** `functions/api/[[path]].js`, `handleListTpiVideos` accepts `status` without authorization; `handleGetTpiVideo` returns any slug without status/access filtering.
- **Production impact today:** no current authored rows (`GET /api/tpi-videos` returned an empty list), so no live draft was exposed in the sampled environment.
- **Required repair:** enforce server-side publication and member/public access policy; reserve draft/status overrides for authorized contributor/admin calls; add regression tests for anonymous, member, contributor, and owner roles.
- **Repair status:** not changed in this audit-only directive; must precede first authored publication.

### F-002 — Unspecified embed trust policy

- **Severity:** P1 design/security gate.
- **Evidence:** authored `embed_url` is accepted and rendered by `tpi-video.html`; no visible provider allowlist is enforced in the API path.
- **Required repair:** validate approved origins/provider patterns server-side and retain a safe external-link fallback.
- **Repair status:** not changed.

## Operational limitations

- No published authored record means playback and social controls could not be verified end-to-end in production.
- No authenticated owner/member browser session was used; role-specific visual and interaction evidence remains required.
- Physical mobile, real WebRTC guest transport, RTMP capture, and long-duration media tests remain deferred.

No destructive action, migration, production content mutation, credential change, or runtime repair was performed.
