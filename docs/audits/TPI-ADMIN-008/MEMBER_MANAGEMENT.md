# TPI-ADMIN-008 — Member management

The existing preview provides server-backed member search, status and role
filters, sorting, pagination, protected detail loading, bounded activity tabs,
and confirmation-gated block/reactivate actions. Private conversation bodies
are not returned by the member activity contract.

Roles & Permissions now has a protected read-only summary of contributor role,
active-account, and `can_post`/`can_comment`/`can_message` counts. It does not
invent a role editor; role/title/capability mutations remain on the existing
Contributor Management workflow. Account Restrictions remains a separate
boundary with a protected read-only list of accounts whose capability flags or
active state are restricted. It does not relabel user-to-user blocking as
administrative suspension or expose restriction mutations. Authorized browser
verification and safe test-account mutations remain pending.
