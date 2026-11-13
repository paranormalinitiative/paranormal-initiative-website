# TPI-OPS-017 — Member Right Rail Order

Date: 2026-11-12
Status: **LOCAL BROWSER CHECK PASSED; GUARDED RELEASE PENDING**

## Requested order

The shared member right rail now places these panels in order:

1. My Pulse
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

## Scope and release

Only `member-home.html` changes the application UI. No profile, membership,
honor, feed, Studio, or other production data is modified. No Haunted Location
books or standalone Repository books are in scope. Guarded preflight, deployment,
and live acceptance results will be recorded here after release.
