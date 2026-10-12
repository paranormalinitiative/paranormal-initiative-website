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
- pending messenger reports, explicitly labelled as non-unified;
- Founding 50 allocations without activating awards.

Analytics now includes the available community-reaction trend in addition to
members, posts, comments, videos, and events.

## Verification result

PASS at source/build level. Authenticated live data rendering remains blocked
without an authorized administrator browser session.
