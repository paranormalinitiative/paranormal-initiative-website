# Mystic Cloudflare AI Search Integration

**Date:** 2026-11-15 01:29 EST; deployed 2026-11-15 01:42 EST
**Scope:** Public/member-facing Mystic only
**Status:** Deployed and live verified.

**Production release:** `rel-afbcac6a73f3-8480846ec919`
**Worker version:** `7d6b3674-5396-463d-a4ef-247858b0c849`
**Source commit:** `afbcac6a73f3cc0d63c136d6c1c286b92fc71fcc`
**Rollback version:** `01ae8fc8-df88-48cf-bbe7-61689245b549`

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

The completed public refresh collected 250 sitemap URLs, finished with zero
errors and zero skipped items, and produced 1,744 vectors. The command-line
retrieval test returned real Ghostology 101 chunks from
`https://paranormalinitiative.com/ghostology-101.html`.

The Help Center article catalog remains the authoritative first path for common
member tasks such as profile editing, messaging, reporting a bug, login, and
privacy. This is intentional: the crawler sees published page text, while the
member Help Center catalog contains the concise TPI-specific task instructions.

## Final verification

- JavaScript syntax checks and Markdown-reference verification passed.
- Help Center separation passed **21/21**; anonymous member Help Center access
  remained public and anonymous Internal Help Center access remained denied.
- Local authentication lifecycle passed before restart, after restart, and after
  the StudioFlow rebuild; Firefox local acceptance passed **65/65**.
- Full Tier 1 release certification passed **38/38 gates** in **6m 43s**.
- Protected application integrity and exact-candidate hashing passed; StudioFlow
  source/build continuity remained unchanged.
- Production anonymous smoke passed **10/10**.
- Isolated production Firefox Developer Edition acceptance passed **65/65**;
  the owner browser profile was not accessed.
- Live `/api/mystic/ask` retrieval returned grounded Ghostology 101 sources.
- Live Help Center interaction verified the direct TPI ghost definition, the
  Ghostology/public education response, and the internal administrative boundary
  for “How do I ban someone?”.

## Future internal assistant

NOVA is intentionally deferred. Once the public Mystic experience is accepted,
NOVA may be designed as a separate internal assistant with separate knowledge,
authentication, role checks, and Help Desk/Admin sources. It must never share a
public retrieval route or public browser catalog with Mystic.
