# TPI-ADMIN-008 — Feature parity matrix

| Area | Existing production/admin implementation | Protected preview status | Classification |
| --- | --- | --- | --- |
| Dashboard and analytics | Legacy admin overview, analytics, D1-backed counts | Real overview metrics and bounded trend cards | PARTIALLY WORKING |
| Member directory/detail | Existing admin member APIs and activity | Search, filters, sorting, pagination, detail/activity | WORKING WITH LIMITATIONS |
| Roles and permissions | Existing server-side authorization and account controls | Navigation boundary; no role editor | NOT IMPLEMENTED IN PREVIEW |
| Community posts | Existing Community Feed admin API | Active/visible/hidden/deleted filtering and status updates | WORKING |
| Community comments/reactions | Existing APIs and member activity | Classic comments are separate; aggregate reaction metric added | PARTIALLY WORKING |
| Reports and moderation | Existing report metadata/contracts | No unified report queue contract | PARTIALLY WORKING |
| Moderation history/audit | Existing audit log API | Audit and filtered moderation-history views | WORKING WITH LIMITATIONS |
| Contributor management | Legacy invite/access controls | Protected directory, invite listing/generation, invite-type/access-level controls, and role/title updates through existing APIs | WORKING WITH LIMITATIONS |
| Paranormal Teams | Existing directory/approval APIs | Protected status filters, searchable directory, and pending approve/reject controls using existing server contracts | WORKING WITH LIMITATIONS |
| Education Center | Existing article and comment workflows | Article comment view; broader publishing is transitional | PARTIALLY WORKING |
| Creator partnership/Founding 50 | Existing protected APIs and closed award gate | Protected transitional views | PARTIALLY WORKING |
| Creator Studio access | Existing owner/admin gate and entitlement APIs | Protected transitional link | PARTIALLY WORKING |
| TPI Videos/channels | Existing contributor/video/channel APIs | Transitional link; no private recording exposure | PARTIALLY WORKING |
| Events | Existing event APIs | Transitional link | PARTIALLY WORKING |
| Notifications | Existing member notification APIs | Transitional link | NOT INTEGRATED |
| Platform health | Existing scraper/operational data paths | Protected read-only provider states, latest summaries, and sanitized run history | WORKING WITH LIMITATIONS |
| Security/settings | Existing protected contracts | Transitional boundaries; no broad settings mutation | PARTIALLY WORKING |
