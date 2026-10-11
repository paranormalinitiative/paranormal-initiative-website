# Idempotency

Create retries use the stable `broadcastId`; the server returns the existing owned record. Updates and lifecycle actions carry the last known revision. The API returns the current record with `409` and `code: conflict` when the revision is stale, preventing duplicate publication or blind overwrites.

The bridge suppresses duplicate in-flight calls per local broadcast in the browser. Repeated external provider operations remain outside this directive.
