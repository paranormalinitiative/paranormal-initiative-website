# TPI-VIDEOS-001 Social Integration

## Current connections

- Authored TPI videos are surfaced in the member feed/rail and can produce member notifications on publication.
- Video comments, reactions, saves, and reports are separate from community post/comment reactions.
- Community posts can attach uploaded video files through the existing private/member media path.
- Live comments/reactions are separate tables and APIs with richer live moderation controls.

## Missing unified behavior

- No shared conversation thread connects a video comment to a community post.
- No public creator channel or subscription/follow graph for video.
- No cross-source playlist or watch-history model.
- No unified moderation queue across authored, scraped, member-uploaded, and live media.

## Plan constraint

Reuse existing member-shell and community components where behavior is genuinely shared, but do not merge data models merely to make screens look similar. A future video-social layer must retain source ownership, visibility, and moderation boundaries.
