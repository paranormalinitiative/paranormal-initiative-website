# Dashboard implementation

The preview dashboard reads `/api/admin/overview?range=...` and displays real
member, visible-community-post, published-video, and pending-messenger-report
counts. Cards drill into the corresponding preview or capability view.

The report metric is explicitly labeled as messenger-report-only. It is not a
unified reports queue. Optional query failures remain unavailable rather than
becoming fabricated zeroes. Range presets use the existing today/7d/30d/90d
contract.
