# Mystic Cloudflare AI Search Integration

**Date:** 2026-11-15 01:29 EST  
**Scope:** Public/member-facing Mystic only  
**Status:** Source complete; guarded release and live verification pending.

## Objective

Give Mystic a grounded retrieval path for broad public TPI questions while
preserving the existing deterministic Help Center answers and keeping internal
Help Desk/Admin/Moderator knowledge out of the public assistant. NOVA remains a
separate future internal assistant and is intentionally not connected here.

## What was built

- Created the Cloudflare AI Search instance `tpi-mystic-public` in the account's
  `default` namespace.
- Configured the website crawler from `https://paranormalinitiative.com/` with
  public inclusion and exclusions for internal Help Center, Admin Center, API,
  member, moderation, Studio, Paper Editor, and Nova paths.
- Added the remote `AI_SEARCH` namespace binding to `wrangler.toml`.
- Added the unauthenticated public `/api/mystic/ask` route so signed-out Help
  Center visitors can ask questions.
- Added a strict public-only generation prompt and a second server-side source
  filter that rejects private paths and non-TPI origins.
- Preserved direct definition answers, Help Center article matching, source
  catalog matching, and the existing honest fallback before using AI Search.
- Added source links to Mystic responses when Cloudflare returns them.
- Added static regression coverage to the Help Center separation suite.

## Safety boundary

Mystic must not answer from or link to:

- Internal Help Desk articles
- Administration Center procedures
- Moderator/staff/owner instructions
- Private member pages or API responses
- StudioFlow, Nova Workspace, or Creator Studio protected surfaces
- Credentials, tokens, recovery codes, or private records

If a member asks for internal procedures, the existing public boundary response
continues to direct them to authorized support rather than querying internal
content.

## Retrieval evidence

Cloudflare's first public crawl discovered the maintained public sitemap with
250 URLs. At the last source check it reported 228 completed items, 1,360
vectors, and 11 individual Workers AI embedding timeouts. The command-line
retrieval test returned real Ghostology 101 chunks from
`https://paranormalinitiative.com/ghostology-101.html`.

The Help Center article catalog remains the authoritative first path for common
member tasks such as profile editing, messaging, reporting a bug, login, and
privacy. This is intentional: the crawler sees published page text, while the
member Help Center catalog contains the concise TPI-specific task instructions.

## Required final verification

Before marking this integration complete:

1. Confirm the AI Search crawl has settled and review any remaining indexing
   errors.
2. Run `node --check` on the changed JavaScript.
3. Run `npm run verify:help-center-separation` with the maintained local Worker.
4. Run `npm run verify:local-auth-lifecycle`.
5. Run `npm run release:preflight`.
6. Deploy only the certified candidate with
   `TPI_PRODUCTION_DEPLOY=approved npm run release:production`.
7. Verify live Mystic in Firefox with:
   - “What is a ghost?” — direct TPI definition.
   - “What is Ghostology 101?” — grounded public education answer/source.
   - “How do I update my profile?” — TPI Help Center guide.
   - “How do I report a bug?” — existing protected bug-report handoff.
   - “How do I ban someone?” — protected internal-boundary response.
8. Confirm the anonymous Internal Help Center remains denied and protected
   StudioFlow/Nova/Creator Studio bytes are unchanged.

## Future internal assistant

NOVA is intentionally deferred. Once the public Mystic experience is accepted,
NOVA may be designed as a separate internal assistant with separate knowledge,
authentication, role checks, and Help Desk/Admin sources. It must never share a
public retrieval route or public browser catalog with Mystic.
