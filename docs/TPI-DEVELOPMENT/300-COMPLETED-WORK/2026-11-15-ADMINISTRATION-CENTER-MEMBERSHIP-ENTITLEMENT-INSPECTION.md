# Administration Center — Membership & Entitlement Inspection

**Date:** 2026-11-15  
**Time zone:** America/New_York  
**Audience:** Owner, Executive, and Full Administrator effective roles  
**Status:** Deployed and live Owner-verified

## What was needed

The Administration Center had separate Member Directory, Roles & Permissions,
Creator Studio, Founding Membership, Staff Directory, and Account Restrictions
views. There was no single, server-derived place to answer: “What can this
member actually access, and why?”

## What was changed

- Added the protected read-only `GET /api/admin/membership-entitlements`
  contract.
- Added **Membership & Entitlements** under the Administration Center Members
  group.
- Combined account state, effective staff role, posting/commenting/messaging
  flags, Creator and Contributor capability resolution, explicit Nova editorial
  authority, Founding Membership identity, Creator Studio access, entitlement
  sources, and active moderation actions.
- Derived access from the existing server-side resolvers and records. The UI
  does not infer authority from badges, titles, or menu visibility.
- Added bounded search and pagination plus summary counts for returned,
  active, staff, Creator-capable, Contributor-capable, Creator Studio, and
  restricted accounts.
- Added explicit schema availability indicators. Optional missing schemas fail
  closed and are labeled rather than becoming an access grant.
- Limited the view to Owner, Executive, and Full Administrator effective roles;
  legacy Administrator access is denied by the server allowlist.

## What did not change

This slice is inspection-only. It does not grant, revoke, suspend, deactivate,
appoint, promote, demote, or alter memberships, entitlements, Creator Studio,
Nova editorial authority, or moderation actions. Existing confirmed workflows
remain the only mutation paths.

StudioFlow, Creator Studio, Nova Editor Workspace, private media, Crossroads of
the Unknown, D1 production data, and R2 data were not changed by this work.

## Verification

- Administration Center source contracts: **90/90**.
- Administration Center production build: passed.
- `git diff --check`: passed.
- Local asset refresh: **283** changed paths refreshed in place; protected
  application directories were not included.
- Local authentication lifecycle: **38/38**.
- No production migration was required.
- Guarded preflight certified the exact candidate with **38 gates** in
  **6m42s**.
- Production anonymous smoke passed **10/10**.
- Live isolated Firefox Developer Edition acceptance passed **65/65**.
- Live Owner/Founder/CEO acceptance confirmed the Membership & Entitlements
  navigation item, 10 live account records, and Todd Wayne's Owner record with
  Creator Studio access and read-only inspection details.

## Safeguard

The API is protected by `requireAdmin` and the effective staff-role route
allowlist. The response is metadata-only and omits credentials, session
material, private contact data, private messages, and private evidence. The
source contract rejects accidental POST-based mutation wiring. Future mutation
controls must remain separate, reasoned, confirmed, audited, and server
authorized.

## Production release

- Release: `rel-1bd4528c0d1e-6432f3fdd589`
- Source commit: `1bd4528c0d1e1e28c9e09a7ee667fc478dc3ff88`
- Worker version: `60e536c8-b2a5-412a-b704-2b9fa4885a4`
- Rollback version: `eadb134b-08f1-473b-af09-2189e3314c1a`
- Deployed at: **2026-11-15 20:50 EST**
- Worker traffic: **100%** on the new version

The next Administration Center slice is controlled mutation design, beginning
with the smallest owner-confirmed workflow rather than adding broad “do
everything” controls.
