# TPI-VIDEOS-006 Notifications

Local tests verified notification preference behavior, publication/replay
notification code paths, community/video-related notification eligibility,
duplicate suppression expectations, and unread-count behavior. The API suite
distinguishes stored notifications from retrieved notifications.

Production anonymous access to `/api/notifications` remained denied with HTTP
401. An authenticated production account was not available, so notification
display, owner delivery, schedule-change delivery, cancellation delivery, and
replay delivery remain **NOT VERIFIED** in production.

No fabricated notification was sent to a real member.
