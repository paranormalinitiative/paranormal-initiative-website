# Community Feed

The dedicated `community_*` model is the current feed system; the retired forum
tables/routes are not the active write path. Local multi-user E2E verifies post
creation, cross-member visibility, edit/delete ownership, moderation hiding,
posting-disabled behavior, media/link handling, and notification integration.

Production read-only `/api/feed` and `/api/community/posts` returned 200.

Status: **PASS for local/API coverage**. Signed-in visual and long-feed browser
performance checks remain pending.
