# TPI-VIDEOS-003 Comments and Reactions

Existing reactions, saves, reports, and member access checks were preserved. Migration 0043 adds nullable `video_comments.parent_id`; the API validates that replies target a visible comment on the same video. The watch page renders replies beneath their parent and provides a member-only Reply action.

The comment list now verifies the authored video visibility boundary before returning comments. Thread depth is intentionally rendered as one reply level to keep the surface bounded.
