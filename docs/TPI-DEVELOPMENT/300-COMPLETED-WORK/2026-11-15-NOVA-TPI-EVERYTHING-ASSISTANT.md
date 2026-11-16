# Nova — TPI Everything Assistant

**Date:** 2026-11-15
**Audience:** Public members/visitors and authorized internal staff
**Status:** Deployed and live verified

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

- The private Cloudflare source was uploaded to R2 and the protected AI Search
  indexing job was started; retrieval returned the revised Help Desk and policy
  guidance.
- Public and internal knowledge sources remain separate, and anonymous internal
  retrieval fails closed.
- Curated local article matching remains available if retrieval is unavailable.
- Help Center separation passed **26/26** checks; release safety passed
  **37/37** checks; local authentication lifecycle passed **38/38** checks;
  local Firefox StudioFlow acceptance passed **65/65** without changing
  StudioFlow.
- The exact certified release passed **13** preflight gates in **23.7 seconds**,
  anonymous production smoke **10/10**, and live public Nova browser acceptance
  answered the profile-update question with the verified TPI guide.

## Release record

Production deployment and live browser acceptance:

- Website commit: `0cede55a393d089f57ca6d44ef15b78a60c92ae8`
- Worker version: `98040d28-927f-48b2-9022-b2274ab7ae06`
- Release ID: `rel-0cede55a393d-df67016fd878`
- Live public browser result: **PASS**
- Anonymous production smoke: **10/10**
- Rollback reference: `b00b96d8-c0a6-4ca8-a137-63bfd980ce0f`
