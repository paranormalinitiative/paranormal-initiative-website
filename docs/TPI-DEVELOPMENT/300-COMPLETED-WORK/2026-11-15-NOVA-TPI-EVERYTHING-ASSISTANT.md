# Nova — TPI Everything Assistant

**Date:** 2026-11-15
**Audience:** Public members/visitors and authorized internal staff
**Status:** Implementation complete; guarded production release required

## Outcome

Nova is the official TPI support assistant. It has two deliberately separated
modes:

- **Public Member Help Center:** explains how to use TPI, member accounts,
  profiles, Community Feed, Messenger, notifications, media, policies,
  reporting, Education Center, public applications, StudioFlow, Creator Studio,
  and Nova Editorial Workspace.
- **Protected Internal Help Desk:** explains documented Administration Center,
  staff, moderation, security, policy, release, and operational procedures for
  authorized internal people.

Mystic remains TPI's public paranormal assistant. Nova does not replace Mystic
for Ghostology, haunted locations, paranormal concepts, books, or research.

## Implementation

- Added `nova-help-center.js` and `nova-help-center.css`.
- Added Nova to all public Help Center routes and all protected Help Desk routes.
- Added Nova to the shared public member/community shell without loading any
  internal data.
- Added `POST /api/nova/ask` with explicit `public` and `internal` audiences.
- Added server-side staff authorization for internal retrieval.
- Added a separate Cloudflare AI Search instance, `tpi-nova-internal`, backed by
  private R2 bucket `tpi-nova-internal-knowledge`.
- Kept the public assistant on the public `tpi-mystic-public` retrieval boundary.
- Updated the internal Help Desk article and all related Markdown references.

## Safety contract

Nova explains approved documentation. It cannot grant access, change roles, ban
members, delete data, inspect private messages, deploy releases, or bypass a
server-side permission check. It must say when no verified answer is available.
Public pages do not load `internal-help-center-data.js`; the internal API route
fails closed for anonymous and ordinary member sessions.

Stable applications remain protected. This change does not modify StudioFlow,
Creator Studio, or Nova Editor Workspace source or data.

## Verification evidence

- The protected AI Search index completed its first scheduled indexing job and
  returned internal release-boundary and policy chunks.
- Public and internal knowledge sources remain separate.
- Curated local article matching remains available if retrieval is unavailable.
- Syntax, source-separation, access-boundary, local lifecycle, release
  preflight, and Firefox acceptance remain required before production is
  called complete.

## Release record

Production deployment and live browser acceptance are recorded below after the
maintained release path completes:

- Website commit: pending
- Worker version: pending
- Release ID: pending
- Live Firefox result: pending
- Rollback reference: pending
