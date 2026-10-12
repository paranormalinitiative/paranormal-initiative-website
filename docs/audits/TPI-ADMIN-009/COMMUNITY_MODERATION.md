# TPI-ADMIN-009 — Community moderation

Status: **COMPLETE WITH LIMITATIONS**.

Community Overview uses authoritative aggregate metrics. Posts & Comments uses
the protected community-post contract with search, status filters, paging, and
existing status controls. Deleted posts are excluded from the default active
view and remain available through an explicit Deleted filter.

Community Comments is metadata-only and read-only because no safe mutation
contract was verified for that queue. Classic article comments remain separate
under Education Center and retain their existing approve/delete endpoints.

Reactions now has a dedicated protected aggregate view. Record-level reaction
moderation is explicitly not claimed until an authoritative backend contract is
available.
