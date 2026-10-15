# TPI-DEV-024 — StudioFlow Security Verification

## Authorization boundaries

- Workspace routes use the existing server-side `hasCreatorStudioAccess`
  capability through `requireStudioAccess`.
- Missing, revoked, or unavailable entitlement state remains fail-closed.
- Workspace queries include `owner_id = user.id`; an admin/owner does not
  automatically read another creator's private workspace.
- Mutations reject cross-origin requests using the existing same-origin
  policy.
- Optimistic version checks prevent silent overwrites of a newer saved copy.
- State is bounded to 32 KiB and normalized through an explicit allow-list.
- Secret-like values, file handles, recording blobs, and stream destinations
  are not part of the persisted schema or accepted snapshot.
- Archive is a status transition, not deletion.

## Development runtime evidence

The deployed QA used existing synthetic development accounts loaded from the
local credential file without printing credential values:

| Principal | Result |
| --- | --- |
| `tpi-dev014-owner` | Studio access; own workspace save/update/archive |
| `tpi-dev014-admin` | Studio access; own workspace save/archive; cannot read owner workspace |
| `tpi-dev014-revoked` | Authenticated but no Studio access; workspace API HTTP 403 |

The ordinary positive entitled-creator path was not claimed as live-verified;
the available synthetic creator fixture was revoked and no entitlement was
created by DEV-024. Existing DEV-014 authorization evidence and offline gate
checks remain the controlling record for the entitlement implementation.

## Protection status

PASSED: development-only config and guarded deployment.
PASSED: anonymous workspace API denial (HTTP 401).
PASSED: authorized bridge asset is available; anonymous bridge asset remains
protected by the Studio host gate.
PASSED: deployment provenance reports commit `53e8826` on
`codex/tpi-development`.
NOT PERFORMED: production deployment, production D1/R2 access, membership or
entitlement mutation, Founding 50 activation, external room/livestream, push,
or merge.
