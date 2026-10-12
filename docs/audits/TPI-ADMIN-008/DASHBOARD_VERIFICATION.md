# TPI-ADMIN-008 — Dashboard verification

## Source verification

The overview API reads real TPI D1 tables and returns unavailable markers when
an optional table is absent. The preview displays:

- total and active members;
- visible community posts and comments;
- community reactions;
- published TPI Videos;
- creator channels;
- published Education Center articles;
- approved Paranormal Teams;
- open video and messenger report metadata through the protected Reports &
  Moderation queue; private evidence and resolution controls remain excluded;
- Founding 50 allocations without activating awards.

Analytics now queries the protected `/admin/analytics` endpoint directly and
renders its available community-reaction trend in addition to members, posts,
comments, videos, and events. Each trend card uses the endpoint's source
definition when available.

## Verification result

PASS at source/build level. Authenticated live data rendering remains blocked
without an authorized administrator browser session.
