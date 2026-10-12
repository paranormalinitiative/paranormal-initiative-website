# API Contracts

Added protected read-only contracts:

- `GET /api/admin/community/comments/:id`
- `GET /api/admin/reports/:type/:id` for `video` and `messenger`

Extended existing bounded list contracts:

- `GET /api/admin/community/comments` — author, date, sort, direction, and
  filter metadata.
- `GET /api/admin/reports` — report type, date, sort, direction, and filter
  metadata.

Existing mutation contract preserved:

- `POST /api/admin/reports/:type/:id/status`

All routes use the existing server-side admin gate, parameterized D1 queries,
bounded limits, and safe metadata responses. No migration or new public API
was introduced.
