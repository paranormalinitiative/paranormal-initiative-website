# Database review

Existing tables used by this batch include `contributors`, `community_posts`,
`community_comments`, `comments`, `tpi_videos`, `events`, `messenger_reports`,
and `admin_audit_logs`. The existing admin queries are bounded and paginate
members/posts. No migration was added; migrations through `0048` remain
unchanged. Private conversation data is not queried by the new UI.
