# TPI-DEV-012 — Authorization Matrix

## Authoritative model

| Account state | Administration Center | Content tools | Creator Studio / StudioFlow |
|---|---|---|---|
| Anonymous | Denied | Denied | Denied |
| Ordinary member | Denied | Denied | Denied |
| Contributor | Denied | Existing contributor tools, subject to ownership | Denied unless an active entitlement exists |
| Approved creator | Denied unless separately `admin`/`owner` | Existing contributor tools, subject to ownership | Allowed only with an active server-side entitlement |
| Administrator | Allowed by existing role gate | Allowed by existing role gate | Preserved existing access |
| Owner | Allowed by existing role gate | Allowed by existing role gate | Preserved existing access |

The `creator_studio_entitlements` table is checked for `entitlement_code = 'creator_studio_lifetime'` and `entitlement_state = 'active'`. When an entitlement references a partnership membership, that membership must also be `active`. Missing entitlement tables fail closed.

## Route and API boundaries

The Worker gates `/admin-center-preview/`, legacy administrative pages, contributor management pages, and `/studio/` before serving their application bundles. The API retains `requireAdmin` for Administration Center endpoints, `requireContributor` for content-management endpoints, and uses `requireStudioAccess` for Studio room and live-broadcast operations. Studio room guest-token issuance also verifies the authenticated caller owns the target room unless the caller is owner/admin.

## Evidence limitations

The development D1 entitlement query returned zero rows on 2026-10-13. The available browser session was an ordinary development member and no approved owner, administrator, contributor-with-entitlement, or synthetic entitlement fixture was authorized. Anonymous deny tests and static source checks can therefore be completed; positive authenticated role-matrix tests require owner-provided development sessions or a separately approved synthetic fixture.
