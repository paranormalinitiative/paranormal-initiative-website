# TPI-ADMIN-008 — Feature parity matrix

| Area | Existing production/admin implementation | Protected preview status | Classification |
| --- | --- | --- | --- |
| Dashboard and analytics | Legacy admin overview, analytics, D1-backed counts | Real overview metrics plus protected `/admin/analytics` trends and source definitions | PARTIALLY WORKING |
| Administration activity | Existing audit activity data | Dedicated protected recent-activity feed; Audit Logs retains search and pagination | WORKING WITH LIMITATIONS |
| Member directory/detail | Existing admin member APIs and activity | Search, filters, sorting, pagination, detail/activity | WORKING WITH LIMITATIONS |
| Roles and permissions | Existing server-side authorization and account controls | Protected read-only role/capability summary from contributor records; role/title/capability mutations remain on Contributor Management | WORKING WITH LIMITATIONS |
| Account restrictions | Existing member capability flags and user-to-user restriction workflows | Protected read-only capability-restrictions list; no administrative suspension or user-to-user restriction mutation | WORKING WITH LIMITATIONS |
| Community overview and posts | Existing Community Feed admin API | Distinct protected overview metrics plus Posts & Comments record review with active/visible/hidden/deleted filtering and status updates | WORKING |
| Community comments/reactions | Existing Community Feed comment/reaction tables and member activity | Protected metadata-only Community Comments queue with visible/deleted/all filters and search; aggregate reaction metric remains read-only | WORKING WITH LIMITATIONS |
| Reports and moderation | Existing video and messenger report metadata/contracts | Protected unified metadata-only queue with status filters, safe metadata search, and server-backed pagination; no private evidence or resolution mutations | WORKING WITH LIMITATIONS |
| Moderation history/audit | Existing audit log API | Protected read-only audit and filtered moderation-history views with query pagination | WORKING WITH LIMITATIONS |
| Contributor management | Legacy invite/access controls | Protected directory, invite listing/generation, invite-type/access-level controls, and role/title updates through existing APIs | WORKING WITH LIMITATIONS |
| Paranormal Teams | Existing directory/approval APIs | Protected status filters, searchable directory, and pending approve/reject controls using existing server contracts | WORKING WITH LIMITATIONS |
| Education Center | Existing article and comment workflows | Published article listing plus article comment view; draft/editor mutations remain on contributor workflow | WORKING WITH LIMITATIONS |
| Creator partnership/Founding 50 | Existing protected APIs and closed award gate | Protected creator directory with server-side search/pagination, program summary, and status-filtered application review with server-backed pagination; explicit closed-award state preserved | WORKING WITH LIMITATIONS |
| Creator Studio access | Existing owner/admin gate and entitlement APIs | Protected read-only entitlement status with server-backed pagination; no grant/revoke/escalation controls | WORKING WITH LIMITATIONS |
| TPI Videos/channels | Existing contributor/video/channel APIs | Published creator-video listing plus protected metadata-only channel directory with visibility/search filters and server-backed pagination; channel lifecycle mutations remain limited | WORKING WITH LIMITATIONS |
| Events | Existing event APIs and `events` table | Protected metadata-only event review queue with approved/pending/rejected/cancelled/all filters, search, and server-backed pagination; mutations remain on existing workflow | WORKING WITH LIMITATIONS |
| Notifications | Existing `member_notifications` storage and protected delivery/send contracts | Protected metadata-only queue with unread/read/all filters and server-backed pagination; bodies and action URLs excluded; no mutation controls | WORKING WITH LIMITATIONS |
| Platform health | Existing scraper/operational data paths | Protected read-only provider states, latest summaries, and sanitized run history | WORKING WITH LIMITATIONS |
| Security/settings | Existing protected routes/settings contracts | Protected source-defined Security boundary summary plus read-only system settings with disabled mutation controls; server authorization preserved | WORKING WITH LIMITATIONS |
