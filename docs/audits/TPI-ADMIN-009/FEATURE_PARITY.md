# TPI-ADMIN-009 — Feature parity

| Area | Status | Evidence / boundary |
| --- | --- | --- |
| Dashboard and analytics | COMPLETE WITH LIMITATIONS | Existing protected overview and analytics contracts; unavailable sources remain explicit. |
| Member directory, profiles, activity | COMPLETE WITH LIMITATIONS | Server search/filter/sort/pagination, protected detail tabs, reactions, reports, moderation history, and activity paging. |
| Account management | PARTIAL | Existing block/reactivate workflow is preserved; broader suspension/restriction mutations remain on existing protected systems. |
| Community posts/comments | COMPLETE WITH LIMITATIONS | Active/visible/hidden/deleted posts, protected status changes, metadata-only Community Comments, and separate article comments. |
| Community reactions | PARTIAL | New read-only aggregate view plus member-detail reaction activity; record-level reaction management has no verified authoritative contract. |
| Reports and moderation | COMPLETE WITH LIMITATIONS | Metadata-only unified queue, search, paging, status/review audit controls; private evidence is excluded. |
| Contributor management | COMPLETE WITH LIMITATIONS | Directory, invite listing/generation, access levels, and title/role workflow use existing protected APIs. |
| Paranormal Teams | COMPLETE WITH LIMITATIONS | Status/search/paging and existing approval/rejection workflow. |
| Education and article comments | COMPLETE WITH LIMITATIONS | Published article paging and protected classic comment moderation; draft/editor workflow remains existing. |
| Creator partnership / Founding 50 | COMPLETE WITH LIMITATIONS | Directory and application review use existing contracts; award allocation remains gated. |
| Creator Studio access | PARTIAL | Read-only entitlement status; grant/revoke/escalation remain excluded. |
| Videos and channels | COMPLETE WITH LIMITATIONS | Published video paging and metadata-only channel directory; lifecycle mutations remain existing. |
| Events | PARTIAL | Protected metadata review queue; complete create/edit/review persistence is not claimed. |
| Notifications | PARTIAL | Safe metadata queue and paging; bodies, action URLs, and delivery mutations remain excluded. |
| Platform health | PARTIAL | Existing scraper/provider status and sanitized run history; no fabricated infrastructure telemetry. |
| Security and settings | COMPLETE WITH LIMITATIONS | Server gates preserved; four settings use the protected allowlist/confirmation/audit workflow. Authenticated acceptance remains pending. |

No item is classified as fully production-promoted. Owner/admin browser
acceptance and rollback verification are still required before any future
promotion decision.
