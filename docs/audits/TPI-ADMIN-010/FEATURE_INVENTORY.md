# TPI-ADMIN-010 — Feature Inventory

Status labels reflect source inspection and safe local tests; they are not
owner acceptance or authenticated production acceptance.

| Area | Status | Evidence / limitation |
|---|---|---|
| Dashboard | WORKING | Protected overview and authoritative metric contracts; unavailable metrics remain labeled. |
| Analytics | PARTIAL | Existing protected analytics contract and date controls are wired; production-authenticated visual acceptance remains pending. |
| Community posts | WORKING | Real listing, search, status filter, author filter, sorting, pagination, protected detail, comments, reactions. |
| Community comments | PARTIAL | Protected read-only queue and post-detail association; record-level moderation is not added in this batch. |
| Community reactions | PARTIAL | Read-only listing/detail attribution where supported; destructive moderation contract is absent. |
| Reports & moderation | PARTIAL | Existing protected metadata queue and resolution history; community-post report evidence is unavailable in the current schema. |
| Members | WORKING | Existing protected directory/detail/activity contracts with bounded server pagination; consequential production mutations were not exercised. |
| Creators / Founding 50 | PARTIAL | Existing protected read-only queues and entitlements; allocation and activation intentionally not exposed. |
| Content / Education / Videos | PARTIAL | Existing protected listings and article-comment moderation; broader workflow parity remains. |
| Contributors / Teams | WORKING | Existing protected directory, invite, and team approval contracts preserved. |
| Events | PARTIAL | Protected review queue is read-only; complete create/persist workflow is not claimed. |
| Platform Health | PARTIAL | Existing read-only scraper/health contracts; unsupported infrastructure metrics are not fabricated. |
| Audit / Security | WORKING | Protected audit views and server-side gates verified locally; authenticated production review pending. |
| Administrative roles | BLOCKED | New role model explicitly deferred by owner; current authorization is preserved and documented. |
