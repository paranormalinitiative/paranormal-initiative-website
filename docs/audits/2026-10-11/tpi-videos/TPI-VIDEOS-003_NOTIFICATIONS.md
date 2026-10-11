# TPI-VIDEOS-003 Notifications

Publishing a new authored video now targets followers of the owning channel through the existing `member_notifications` table and notification-preference helper. Follow actions notify the channel owner only for a newly inserted relationship. Existing notification preferences remain authoritative; muted `video` preferences suppress delivery.

Production notification delivery is NOT YET VERIFIED. No notification schema was changed.
