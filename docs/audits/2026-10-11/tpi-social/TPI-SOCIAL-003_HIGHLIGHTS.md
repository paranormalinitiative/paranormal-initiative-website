# TPI-SOCIAL-003 Highlights

Highlights are stored in `member_personalization`, validated against the
existing allow-list, and read with the authenticated member owner id. Public
profile style lookup reads only the requested active public profile.

Result: **PASS for local API/SQLite ownership and validation**. No new highlight
options, migration, or public exposure was introduced. Browser visual and
computed-style verification remains pending the Playwright dependency.
