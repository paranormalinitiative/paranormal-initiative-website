# Existing Reporting Architecture

## Community data

`community_posts`, `community_comments`, and `community_reactions` are the
current Community Feed tables. `community_comments` has `post_id`, author,
body, status, timestamps, and no `parent_id`; therefore the current schema
does not represent nested comment replies.

## Supported report data

- `video_reports`: supported metadata, status, reporter, video reference, and
  review fields.
- `messenger_reports`: supported metadata, status, reporter/reported account,
  and review fields. Conversation bodies and conversation identifiers remain
  private and are not returned by the admin queue/detail APIs.

No community-post or community-comment report table/contract was found. The
preview reports this as unsupported instead of presenting fake report records.

## Audit data

`admin_audit_logs` records actor, role, action, target, metadata JSON, and
timestamp. Report detail reads bounded history for the specific report target.
