# TPI-ADMIN-008 — Community moderation

Community post management uses the existing protected API. The normal view
defaults to active (`visible` and `hidden`) records; deleted rows remain in D1
and require the explicit Deleted filter. No title-specific exclusion or data
deletion was introduced.

Classic article comments remain under Education Center / Article Comment
Moderation. Community Feed content is not conflated with article comments.

Reports & Moderation now has a protected metadata-only queue backed by the
existing `video_reports` and `messenger_reports` tables. It supports open,
pending, reviewed, dismissed, actioned, and all-status browsing without
exposing private message bodies, conversation IDs, report details, recordings,
or stream data. Bounded status/review-audit controls update only the existing
review fields through a protected endpoint; authenticated owner/admin
acceptance remains pending.
