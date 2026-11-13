# TPI-OPS-017 — Member Right Rail Order

Date: 2026-11-12
Status: **DEPLOYED AND LIVE VERIFIED — 2026-11-12**

## Requested order

The shared member right rail now places these panels in order:

1. Member activity summary (the “My Pulse” heading is hidden)
2. Honors & Distinctions
3. Active People
4. People to Discover
5. Recently Viewed Members
6. ParaNews Spotlight
7. Featured Content
8. Upcoming Events
9. Active Discussions

The separate Featured Video panel was removed from this rail because video
already appears in Featured Content and the requested rail sequence continues
from Featured Content directly to Upcoming Events. TPI Videos remains
accessible through its existing navigation and Featured Content entries.

## Verification

The official local Worker was checked with isolated Firefox using a synthetic
member account. Both `/member-home.html` and `/member-home?username=local_member`
render the nine shared rail sections in the order above. The removed video
panel is absent in both views. The change is shared by own and viewed-member
profiles through the common member-home renderer.

Guarded preflight certified the exact commit with 30 gates; isolated Firefox
release acceptance passed 65/65, and the additional Studio management,
ownership, deletion safety, scene persistence, Notes restoration, and mobile
acceptance gates all passed. Production anonymous smoke passed 10/10 and live
isolated Firefox acceptance passed 65/65. The Worker remained at 100% traffic.

Release: `rel-ea16819d85fc-f99594709ad1`

Source commit: `ea16819d85fc1ac5093e0bb8a0adc738040bcb3f`

Worker version: `c3ce48e0-d289-4309-bf35-518ef4c3b6aa`

Rollback version: `c48da23b-d832-49ed-97fd-38e398798807`

## Scope and release

Only `member-home.html` changes the application UI. No profile, membership,
honor, feed, Studio, or other production data was modified. No Haunted Location
books or standalone Repository books were in scope. The guarded production
runner reported `DEPLOYED_AND_VERIFIED` and did not trigger rollback.
