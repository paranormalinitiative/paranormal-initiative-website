# Notifications

Notification categories, unread counts, read state, chat links, community post
links, education publication notifications, and per-category preferences are
implemented. Local E2E verifies independent read state, mute suppression and
restoration, canonical community/education links, and outsider denial for chat
notifications.

Production anonymous `/api/notifications` returned 401. Status: **PASS locally;
production authenticated state NOT VERIFIED**.
