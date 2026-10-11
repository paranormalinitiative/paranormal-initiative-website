# TPI-VIDEOS-006 Studio Synchronization Verification

## Main TPI-VIDEOS-005 implementation

Verified through the deterministic local D1/Worker suite:

- Stable create identity: PASS.
- Repeated create retry: PASS; existing record returned, no duplicate.
- Schedule/title update with current revision: PASS.
- Stale update: PASS; HTTP 409 conflict snapshot.
- Explicit publication: PASS; revision advances.
- Stale publication retry: PASS; HTTP 409 conflict snapshot.
- Server refresh: PASS.
- Scheduled cancellation: PASS; stable identity retained and upcoming
  discovery no longer includes the cancelled listing.
- Stale cancellation retry: PASS; explicit conflict.
- Cross-origin mutation: PASS; HTTP 403.

The current deterministic suite completed **211 PASS / 0 FAIL** after the
cancellation regression was added. The historical 005 release report recorded
207 checks before this 006 audit added four cancellation assertions.

## Offline recovery

Source inspection confirms failed requests preserve the local schedule and
store a pending operation with retry metadata. A real browser network
interruption followed by reload was not performed, so runtime offline recovery
is **NOT VERIFIED**.
