# TPI-VIDEOS-003 Following

Members can follow and unfollow public creator channels. The Following catalog filter is authenticated, server-side, private/no-store, and returns public published videos from followed channels only. Duplicate follows are idempotent and follow notifications are emitted only when a new relationship is created.

The feature is locally covered by the migration-backed API E2E suite. Production member follow behavior is NOT YET VERIFIED.
