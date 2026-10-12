# Architecture assessment

Status: IMPLEMENTED — isolated preview foundation

The live TPI site is a Cloudflare Worker plus static assets. A root-level
React rewrite would risk the public site and the current `/admin-panel`, so
the implementation uses `admin-center-app/` as source and publishes only its
compiled output to the gated `/admin-center-preview/` path.

Existing authentication, D1, R2, Worker routing, admin APIs, and the legacy
HTML Administration Center remain the source of truth. The preview has no
second login, no second user database, no schema migration, and no direct R2
access.

The Worker gates the preview entry path and every generated asset with the
same owner/admin session check used by the existing admin routes. This is a
server-side boundary; the client does not decide whether the user is allowed
to load the application.

The first functional slice is intentionally narrow: protected dashboard
metrics, member search/detail/activity, safe member block/unblock controls,
analytics trend display, and audit activity. Existing systems not yet mapped
to a complete API contract remain links or documented limitations instead of
invented controls.
