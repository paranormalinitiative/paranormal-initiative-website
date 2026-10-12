# TPI-ADMIN-010 — Reactions Management

The existing read-only Reactions view and post-detail reaction display use
the protected `community_reactions` contract. They show reaction type,
associated target, timestamp, and contributor attribution where authorized.

Status: **PARTIAL**. Search, filtering, pagination, and error states are
covered by the existing preview implementation. Record-level reaction
moderation is not claimed because no supported moderation contract was found.
No destructive reaction controls were invented.
