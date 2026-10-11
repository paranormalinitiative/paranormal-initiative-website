# TPI-ADMIN-001 Local E2E Evidence

**Environment:** Fresh local Wrangler Worker, local D1, migrations 0001-0047,
`scripts/e2e/seed-local.sql`, isolated port 8793, scrapers disabled.

The existing repository regression suite completed with **213 PASS / 0 FAIL**.
It covered authentication, Community Feed, Messenger, notifications,
Education, TPI Videos, broadcast identity/lifecycle, StudioFlow synchronization
safety, and scraper security. This is local synthetic multi-user evidence; it
is not a signed-in production or physical-device result.

The first orchestrator attempt stopped before assertions because sandbox policy
blocked the local server bind. The direct retry with local-server permission
completed successfully. No production systems were contacted or changed.

Additional local Worker probes passed:

- Anonymous `/admin-panel.html`, `/admin-panel`, `/admin-panel/`,
  `/admin-advanced-settings`, `/admin-events`, and `/teams/admin`: **403**.
- Seeded ordinary member on those same entry points: **403**.
- Seeded admin following the `/admin-panel.html` redirect: **200** and the
  Administration Center rendered.
- Seeded admin `/api/admin/overview`, `/api/admin/founding-50`, and
  `/api/admin/audit-logs`: **200** with live local D1 responses.
- Anonymous `/studio/`: **403**; public `/live-video`: **200**.
