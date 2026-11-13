# Operational role badge assets

TPI keeps the Moderator and Administrator identity art here. These badges are
presentation only. Authority must come from server-side role and capability
records; an image or visible label never grants or implies permission.

## Separate badge families

| Family | Identities | Location |
|---|---|---|
| Community membership | TPI Member | `../community-membership/` |
| Founding membership | Founding Creator, Founding Contributor, Founding All-Access | `../founding-memberships/` |
| Operational service | Moderator, Administrator | this directory |
| Leadership / Society | Gold, Silver, Bronze, Board and leadership medallions | `../society-leadership/` |

A member may hold more than one independent identity. No badge replaces another.

## Current source artwork

The owner supplied transparent replacement badges on 2026-11-13. The Desktop
originals were copied byte-for-byte; the previous masters remain in Git for
historical provenance and are no longer used to make current display art.

| Identity | Source | Current repository master | SHA-256 |
|---|---|---|---|
| Administrator | `/Users/toddknipple/Desktop/AdminBadge.png` | `masters/AdministratorBadge2026Master.png` | `1deb4e0dd6a7eb4c53d67ac17d0755fe18bd2b63dfd95ef2b64362ea4e447d66` |
| Moderator | `/Users/toddknipple/Desktop/Moderator.png` | `masters/ModeratorBadge2026Master.png` | `721460e300056aa1862aa0b4b735e49c84a01beb19d0d17f0532f87c41566620` |

Both masters are 1254 × 1254 RGBA PNGs with real transparency. The superseded
2026-11-03 assets were JPEGs with opaque backgrounds; their defects do not apply
to the current source art.

## Web derivatives

Transparent optimized derivatives are in `web/`: PNG sizes 128, 256, and 512;
WebP sizes 256 and 512. They were generated from the current masters. Profile
surfaces may use them only when the associated operational role is confirmed by
server-side appointment state. Never reference a `masters/` file in the UI.

Regeneration uses Pillow with RGBA input, Lanczos fit to a square at the listed
sizes, optimized PNG, and WebP quality 90. Keep the original masters unchanged.

## Publishing and authority

`.assetsignore` and the guarded release candidate filter exclude
`assets/operational-roles/masters/`; only the web derivatives are published.
Staff appointments now resolve server-side from `staff_role_appointments`;
existing `owner`/`admin` account roles remain supported as Owner/Administrator.
No specific Moderator or other staff appointment is created by the role system
release. See the current role and release status in the linked documents.
See the [operational role policy](../../docs/TPI-DEVELOPMENT/400-FUTURE-DEVELOPMENT/TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md)
and [current authorization behavior](../../docs/TPI-DEVELOPMENT/007-SECURITY-AND-PERMISSIONS.md).
