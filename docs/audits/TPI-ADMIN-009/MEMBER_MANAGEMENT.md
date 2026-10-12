# TPI-ADMIN-009 — Member management

Status: **COMPLETE WITH LIMITATIONS**.

The preview uses the existing protected member listing and activity contracts.
It supports server-side search, status and role filters, sorting, pagination,
member selection, profile/activity tabs, reactions, videos, reports,
moderation history, and 25-record activity paging. Block/reactivate actions use
the existing confirmation-gated endpoints and audit path.

Private Messenger conversation bodies are not returned or rendered. Broader
administrative suspension, capability restriction, and user-to-user blocking
remain separate existing workflows and are not represented as new controls.

Automated source/contract checks passed. Authenticated owner/admin rendering
and safe mutation acceptance remain pending.
