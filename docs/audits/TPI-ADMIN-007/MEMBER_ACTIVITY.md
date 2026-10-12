# Member activity

Status: **PARTIALLY WORKING**.

The existing `/admin/members/:username/activity` contract now returns bounded
records for community activity, classic comments, video comments, TPI Videos,
articles, reactions, report metadata, and member-targeted audit history.
Reactions are read from existing community, article, and video reaction
tables. Video reports are read from `video_reports`. Messenger reports expose
only report metadata and member relation; conversation identifiers, message
bodies, and unrelated conversations are not returned.

The current endpoint exposes a `hasMore` signal per activity category. The
preview opens page one with a 25-record server bound; deeper page controls are
still a remaining UX task.
