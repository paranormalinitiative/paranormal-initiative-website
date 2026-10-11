# Defects and Repairs

## Repaired

- Server payloads did not expose a stable revision for the browser bridge. Added revision/sync metadata using the existing 0044 fields.
- Update and lifecycle requests could otherwise overwrite a newer server state. Added expected-revision conflict responses.
- Cross-origin mutation intent was not checked on the new bridge path. Added same-origin validation when Origin is supplied.
- The StudioFlow schedule had no durable bridge state or retry path. Added local sync metadata, one startup retry, manual retry, and conflict UI.
- Repeating create requests needed a clear idempotent contract. The existing owned-record return path is now covered by regression tests.

No unrelated media, camera, microphone, recording, R2, or authentication system was rebuilt.
