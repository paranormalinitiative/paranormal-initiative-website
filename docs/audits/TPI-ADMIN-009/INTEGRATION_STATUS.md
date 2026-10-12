# TPI-ADMIN-009 — Integration status

The installed Refine + shadcn/ui application remains the only new
Administration Center. It calls the existing Worker contracts through
`admin-center-app/src/lib/api.ts` and keeps all administrative API routes behind
the existing server-side owner/admin gate.

Current integrated preview resources include overview, analytics, activity,
members, community overview, posts, Community Comments, Reactions, reports,
moderation history, article comments, contributors, teams, creator directory,
Founding 50 review, Creator Studio entitlements, channels, published Education,
published videos, events, notifications, Platform Health, roles, restrictions,
Security, Audit Logs, and System Settings.

The new Reactions view is intentionally read-only. It uses the existing
`communityReactions.total` overview metric and links the owner to per-member
reaction activity already returned by the protected member activity contract.
It does not invent record-level reaction endpoints or mutations.

Partial resources display their limitation and, where necessary, link to the
existing protected implementation. No decorative control is presented as a
verified mutation.
