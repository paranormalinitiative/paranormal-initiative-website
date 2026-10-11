# TPI-ADMIN-002 Roles and Permissions

| Role | Admin read access | Leadership/award actions |
|---|---|---|
| Owner | Yes | Owner-only role changes, settings, and Founding 50 award endpoint (still activation-gated) |
| Administrator | Yes | Existing authorized admin operations; cannot award Founding 50 or change owner leadership |
| Moderator | Existing member behavior | No Administration Center access unless separately represented as admin |
| Contributor/Creator | No | No administrative or self-award access |
| Member | No | No administrative access |
| Anonymous | No | No access |

The server enforces the boundary through `requireAdmin` and `requireOwner`;
the UI is not the security mechanism.
