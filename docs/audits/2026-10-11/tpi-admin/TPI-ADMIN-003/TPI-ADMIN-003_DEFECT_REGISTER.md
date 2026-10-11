# TPI-ADMIN-003 Defect Register

## Confirmed defects

None confirmed in this acceptance batch. The local test harness failed during setup with Wrangler `spawn EBADF`; it did not produce an application assertion failure.

## Limitations / follow-up items

1. **Authenticated browser acceptance — BLOCKED.** An approved signed-in browser session is required to verify actual dashboard rendering, navigation interaction, tables, filters, charts, responsive layouts, and keyboard behavior.
2. **Administrative detail surfaces — NOT IMPLEMENTED as new views.** Videos, Content, Events, Notifications, and several System/Security surfaces remain truthful status/links to existing systems rather than pretending to be complete management workspaces.
3. **Custom analytics range — NOT IMPLEMENTED.** Preset ranges are implemented; no custom date picker exists.
4. **Current local regression rerun — BLOCKED.** Wrangler 4.110.0 failed before readiness with `spawn EBADF`; prior ADMIN-002 225/225 remains historical evidence only.

No runtime repair, migration, production write, or deployment was performed.
