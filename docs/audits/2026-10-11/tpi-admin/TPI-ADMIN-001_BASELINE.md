# TPI-ADMIN-001 Baseline

**Date:** 2026-10-11
**Source:** `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
**Status:** Baseline and foundation batch implemented; owner review remains required.

## Existing boundary

The canonical site already had `admin-panel.html`, `admin-advanced-settings.html`,
`admin-events.html`, `teams/admin.html`, owner/admin API routes, contributor
roles, D1, R2, the Community Feed, notifications, TPI Videos, and protected
StudioFlow routes. This directive extends those systems. It does not create a
second admin application or replace the Worker/API/authentication architecture.

## Safety decisions

- Existing dirty files outside this batch were preserved and not staged.
- `/studio/` remains owner/admin protected and `/live-video` remains Coming Soon.
- Founding 50 is displayed as **not activated**. No account was awarded and no
  Creator Studio entitlement was granted.
- Audit records contain actor/action/target metadata only; no message bodies,
  recordings, stream keys, or private media are stored.

## Current implementation

The batch adds the server-side admin HTML gate, live D1-backed overview metrics,
the additive `admin_audit_logs` migration, audit read API, Founding 50 status API,
and a responsive left-side Administration Center navigation in the existing
admin panel. Remaining module gaps are recorded in the companion documents.
