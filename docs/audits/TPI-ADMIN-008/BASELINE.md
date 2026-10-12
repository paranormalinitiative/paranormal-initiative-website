# TPI-ADMIN-008 — Baseline

## Scope

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `main`
- Baseline HEAD: `9cd1f91d4a75c3794674ee3dc4297071c7859087`
- Production Administration Center: `/admin-panel`
- Protected Refine preview: `/admin-center-preview/`
- Cloudflare account: `221ea5479876fd303ddc87002b9e892d`

The checkout contains unrelated pre-existing dirty files. They are preserved
and remain outside this directive's staged scope.

## Existing systems

`/admin-panel` is the existing production administration surface. The Refine
and shadcn/ui application is a protected preview, not a replacement. Existing
Worker authorization, D1, R2, Creator Studio, `/live-video`, and legacy admin
contracts remain in place.

## Baseline limitations

The preview has implemented overview, analytics, member directory/detail,
Community Feed post management, classic article-comment moderation, audit logs,
moderation history, TPI theme tokens, and the ADMIN-007A isolation repair.
Creator, reports, publishing, events, notifications, health, settings, and
role/restriction workspaces remain partial integrations or capability links.
Authenticated production browser acceptance is not available in this run.

## Current incremental status

The baseline above records the starting state and is preserved as history. Since
that capture, the protected preview has added metadata-only Reports &
Moderation, Notifications, Creator Channels, Roles & Permissions, and Account
Restrictions views using existing TPI tables/contracts. These additions remain
read-only where no complete safe mutation contract exists; `/admin-panel`
promotion, authenticated owner/admin acceptance, and rollback verification
remain gated.
