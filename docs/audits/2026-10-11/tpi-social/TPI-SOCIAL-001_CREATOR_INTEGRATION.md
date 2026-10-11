# Creator Integration

Creator Studio remains owner/authorized-user gated at `/studio/`; ordinary
visitors see the public boundary. TPI video/broadcast records use explicit
creator ownership, draft/publication lifecycle, and the existing authenticated
StudioFlow sync bridge.

Local E2E covers bridge identity, idempotency, revision conflict, publish, and
cancel behavior. No StudioFlow rebuild or recording-storage change was made.
Status: **PASS for existing local/API integration; signed-in production workflow
NOT VERIFIED**.
