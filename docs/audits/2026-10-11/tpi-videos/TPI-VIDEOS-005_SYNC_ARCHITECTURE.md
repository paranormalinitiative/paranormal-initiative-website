# Sync Architecture

The bridge is same-origin and cookie-authenticated:

1. Creator edits a local StudioFlow schedule.
2. Creator explicitly selects **Sync to TPI** or **Sync changes**.
3. StudioFlow creates or updates the linked TPI broadcast/listing using the stable local broadcast ID.
4. Creator explicitly selects **Publish to TPI Videos** for public/member visibility.
5. Refresh reads the authoritative server state without silently replacing local schedule fields.

The API is `POST /api/tpi-broadcasts`, `PUT /api/tpi-broadcasts/:id`, `GET /api/tpi-broadcasts/:id`, and the existing lifecycle action routes. This reuses the 004 schema and existing authentication rather than adding a parallel sync service.
