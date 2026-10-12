# TPI-ADMIN-010 — Community Management

## Implemented batch

Community Posts now uses the existing protected admin API with real database
records. The list supports bounded search, status filtering, author filtering,
created/updated sorting, direction, pagination, and a protected detail view.
The detail view includes the post, author, comments, and reactions without
exposing private Messenger data.

Existing status controls remain constrained to the already supported backend
operation. No new destructive deletion path was introduced.

## Status

- Posts: **WORKING** for the supported list/detail contract.
- Comments: **PARTIAL**, read-only queue and detail association are available;
  broader record-level moderation remains future work.
- Deleted content: **WORKING** at the list boundary; deleted posts remain
  excluded from ordinary active results and have an explicit view.
- Reports involving a post: **BLOCKED** by the absence of a supported
  community-post reports table/contract. The UI states this boundary.
