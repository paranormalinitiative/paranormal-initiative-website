# TPI-PROJECT-001 — Administration content filtering

## Root cause

`handleAdminCommunityPosts` accepted `status=all`, and the Refine preview and
legacy Administration Center both defaulted to `all`. The resulting query had
no status predicate, so deleted Community Feed posts appeared in the normal
Community Overview list.

## Correction

- The API now defaults to `active` when no status is supplied.
- `active` means `cp.status IN ('visible', 'hidden')`.
- The preview and legacy UI default to `Active (not deleted)`.
- `Visible`, `Hidden`, and explicit `Deleted` views remain available.
- No title-specific filter was added.
- No production post was deleted, rewritten, or status-mutated.
- Member activity queries remain evidence-oriented and are not silently
  rewritten by this normal-list filter.

Deleted records therefore remain available through an explicit authorized
Deleted view while ordinary operational lists do not display them.
