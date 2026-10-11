# TPI-ADMIN-001 Defects and Repairs

## Confirmed defect repaired

Legacy admin HTML entry points were not server-gated even though their APIs
were protected. `worker.js` now denies anonymous and ordinary-member requests
before serving those pages. Local probing then found that the static asset
redirect from `/admin-panel.html` to `/admin-panel` bypassed the first exact
path list; the extensionless and trailing-slash variants are now gated too.

## Remaining limitations

- Historical analytics are not instrumented.
- Founding 50 allocation and Creator Studio entitlement activation are not
  implemented or activated.
- Full signed-in production and physical responsive verification require an
  authorized test session/device.
- The existing admin activity view remains bounded but is not redesigned in
  this foundation batch.
