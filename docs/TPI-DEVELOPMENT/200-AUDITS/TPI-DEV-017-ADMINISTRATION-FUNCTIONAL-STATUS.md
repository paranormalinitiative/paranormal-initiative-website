# TPI-DEV-017 — Administration Functional Status

Status: **PARTIAL COMPLETION — TARGETED INTEGRATION ADDED**

## Module status

| Module | Status | Evidence |
| --- | --- | --- |
| Dashboard and analytics | PASSED | Existing protected overview/analytics contracts |
| Member directory/detail | PASSED | Search, filters, pagination, activity, block/unblock, capability controls, in-app notice |
| Creator Partnership / Founding 50 | PASSED WITH GATE | Application create/review and readiness; activation remains fail-closed |
| Creator Studio administration | PASSED WITH LIMITATION | Entitlement queue and separation preserved; no private media exposure |
| Education Center | PASSED WITH LIMITATION | Protected article listing and draft/publish status workflow |
| TPI Videos | PASSED WITH LIMITATION | Protected listing and publish/unpublish/remove lifecycle |
| Community Feed moderation | PASSED | Post status, comments, report metadata, detail, and audit boundaries |
| Paranormal Teams | IMPROVED | Submission status plus protected team-claim queue and review controls |
| Notifications | PASSED WITH LIMITATION | Protected delivery metadata; member-scoped in-app send remains available |
| Settings | PASSED WITH LIMITATION | Four existing account-access flags with confirmation and audit |
| Events, roles, restrictions, channels | READ-ONLY | No authoritative mutation contract was added or invented |

## Security boundaries

The new team-claim UI calls only the existing `/admin/teams/claims` contract
and its approve/reject endpoints. The backend remains the authorization and
transaction boundary. Approval creates the existing team-owner membership
relationship; it does not import teams or alter Paranormal Teams research data.

Founding 50 activation, role escalation, private StudioFlow media, production
resources, member passwords, and external notifications remain protected.

## Remaining work

Authenticated rendered acceptance, event mutation design, granular role or
restriction mutation design, channel administration, and administrative
notification composition require either existing authoritative contracts or
separate owner decisions. They are not represented as fake controls.
