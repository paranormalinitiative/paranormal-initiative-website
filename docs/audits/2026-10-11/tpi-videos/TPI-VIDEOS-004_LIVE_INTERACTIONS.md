# TPI-VIDEOS-004 Live Interactions

Existing `live_comments`, `live_reactions`, cursor polling, rate limits, and
moderation routes were reused. No duplicate comments/reactions tables or new
social identity was created.

Because the new listing resolves to the existing `live_broadcasts.id`, the
existing live interaction endpoints remain compatible with the integrated
identity. Actual multi-member production interaction and external live media
transport remain NOT YET VERIFIED.
