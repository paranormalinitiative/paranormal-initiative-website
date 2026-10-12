# TPI-ADMIN-009 — Remaining work

The following remain partial or blocked:

- Authenticated owner/admin browser acceptance across the navigation.
- Role-matrix and session-expiry verification.
- Rollback verification using the preserved `/admin-panel` route.
- Record-level reaction moderation, because no authoritative safe contract is
  currently integrated.
- Broader role/capability, suspension, notification-delivery, channel-lifecycle,
  event-lifecycle, and Creator Studio entitlement mutations.
- Physical/live verification of provider integrations and operational telemetry
  not exposed by existing contracts.
- Full Wrangler local API harness remains environment-limited by the prior
  `spawn EBADF` failure before assertions; isolated in-memory contract evidence
  remains distinct from that blocked harness.

Do not promote the preview over `/admin-panel` until the owner explicitly
accepts the finished application and the critical workflow/rollback gates pass.
