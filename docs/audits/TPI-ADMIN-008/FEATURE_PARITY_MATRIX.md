# TPI-ADMIN-008 — Feature parity matrix

| Area | Existing production/admin implementation | Protected preview status | Classification |
| --- | --- | --- | --- |
| Dashboard and analytics | Legacy admin overview, analytics, D1-backed counts | Real overview metrics and bounded trend cards | PARTIALLY WORKING |
| Member directory/detail | Existing admin member APIs and activity | Search, filters, sorting, pagination, detail/activity | WORKING WITH LIMITATIONS |
| Roles and permissions | Existing server-side authorization and account controls | Protected read-only role/capability summary from contributor records; role/title/capability mutations remain on Contributor Management | WORKING WITH LIMITATIONS |
| Account restrictions | Existing member capability flags and user-to-user restriction workflows | Protected read-only capability-restrictions list; no administrative suspension or user-to-user restriction mutation | WORKING WITH LIMITATIONS |
| Community posts | Existing Community Feed admin API | Active/visible/hidden/deleted filtering and status updates | WORKING |
| Community comments/reactions | Existing APIs and member activity | Classic comments are separate; aggregate reaction metric added | PARTIALLY WORKING |
| Reports and moderation | Existing video and messenger report metadata/contracts | Protected unified metadata-only queue with status filters; no private evidence or resolution mutations | WORKING WITH LIMITATIONS |
| Moderation history/audit | Existing audit log API | Audit and filtered moderation-history views | WORKING WITH LIMITATIONS |
| Contributor management | Legacy invite/access controls | Protected directory, invite listing/generation, invite-type/access-level controls, and role/title updates through existing APIs | WORKING WITH LIMITATIONS |
| Paranormal Teams | Existing directory/approval APIs | Protected status filters, searchable directory, and pending approve/reject controls using existing server contracts | WORKING WITH LIMITATIONS |
| Education Center | Existing article and comment workflows | Published article listing plus article comment view; draft/editor mutations remain on contributor workflow | WORKING WITH LIMITATIONS |
| Creator partnership/Founding 50 | Existing protected APIs and closed award gate | Protected creator directory, program summary/application review, and explicit closed-award state | WORKING WITH LIMITATIONS |
| Creator Studio access | Existing owner/admin gate and entitlement APIs | Protected read-only entitlement status; no grant/revoke/escalation controls | WORKING WITH LIMITATIONS |
| TPI Videos/channels | Existing contributor/video/channel APIs | Published creator-video listing plus protected metadata-only channel directory; channel lifecycle mutations remain limited | WORKING WITH LIMITATIONS |
| Events | Existing event APIs | Approved event listing; admin review/creation remains on existing workflow | WORKING WITH LIMITATIONS |
| Notifications | Existing `member_notifications` storage and protected delivery/send contracts | Protected metadata-only queue with unread/read/all filters; bodies and action URLs excluded; no mutation controls | WORKING WITH LIMITATIONS |
| Platform health | Existing scraper/operational data paths | Protected read-only provider states, latest summaries, and sanitized run history | WORKING WITH LIMITATIONS |
| Security/settings | Existing protected routes/settings contracts | Protected source-defined Security boundary summary plus read-only system settings with disabled mutation controls; server authorization preserved | WORKING WITH LIMITATIONS |
