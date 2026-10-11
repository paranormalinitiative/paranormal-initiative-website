# TPI-ADMIN-002 Analytics

Implemented ranges: Today, 7 days, 30 days, and 90 days. Custom date parsing
is supported by the server range helper for future callers. Charts group real
`created_at` timestamps for contributors, Community Feed posts/comments, TPI
Videos, and events. Empty ranges show an empty state; unavailable tables show
unavailable. No historical trend is fabricated.

Metric definitions are returned by `/api/admin/analytics`.
