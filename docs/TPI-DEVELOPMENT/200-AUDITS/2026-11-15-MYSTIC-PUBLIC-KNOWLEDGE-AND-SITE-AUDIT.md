# Mystic Public Knowledge and Site Audit

**Date:** 2026-11-15
**Scope:** Public TPI website, public Help Center, Mystic retrieval, and the
protected public/internal knowledge boundary
**Status:** Complete for the current public phase; NOVA/internal auditing is
deferred until the public experience is accepted.

## Objective

Confirm that Mystic can use the large public TPI site as a knowledge base,
that the public pages are reachable, that common member guidance still uses
the curated Help Center answers, and that internal procedures remain outside
the public assistant.

## Crawl and site results

- Cloudflare AI Search instance: `tpi-mystic-public`.
- Source: `https://paranormalinitiative.com/` through the maintained sitemap.
- Sitemap collection: **250 unique URLs**.
- Read-only HTTP audit: **250/250 returned HTTP 200**.
- Final refresh job: `3c2386a5-38cb-4599-92e2-427ae79a8036`.
- Final crawl state: **0 queued, 0 running, 0 errors, 0 skipped**.
- Final vector count: **1,744**.
- Cloudflare's completion counter reports **249 indexed files** after 250 URL
  collection; no fetch, embedding, or skip error remains. This accounting
  difference is being observed through the scheduled sync and is not a broken
  public URL.

The first refresh produced 12 embedding timeouts. A second recovery pass
reduced that to 2, and the final retry cleared all timeout records. No public
source file or repository content was modified to hide or bypass an error.

## Retrieval matrix

Live `/api/mystic/ask` checks returned grounded public sources for:

- The Paranormal Initiative overview.
- Ghostology 101.
- Paranormal investigation methods.
- EVP and ITC research.
- Education Center learning paths.
- Public haunted-location research.

The live Help Center interaction also verified:

- The direct TPI definition for “What is a ghost?”.
- The curated Education Center response for Ghostology questions.
- The curated profile and bug-report guidance paths.
- The protected refusal for “How do I ban someone?” with member-support routing.

## Safety boundary

The crawler excludes internal Help Center, Admin Center, API, member,
moderation, Studio, Paper Editor, and Nova paths. The Worker applies a second
same-origin public-path filter before returning sources. The public browser
catalog contains only `public-member` knowledge. Internal Help Desk and
Administration Center pages do not mount Mystic.

## Repository and Markdown review

The repository contains the public Help Center, public source catalog, research
pages, Education Center, Ghostology lessons, EVP/ITC material, equipment
references, public articles, and haunted-location directory pages. The
repository also contains internal operational Markdown, but those documents
are not added to the public AI Search source and must remain reserved for the
future NOVA/internal assistant.

Adding more Markdown is not required for the current public crawl to answer
the tested public questions. Future public knowledge additions should first
be written as reviewed public Help Center or website content, then included
by the maintained sitemap and refreshed through AI Search.

## Outcome

The public Mystic integration is live and functioning. No public sitemap URL
failure, unsafe source leak, or retrieval failure was found in this audit.
The next major phase is a separate owner-led Administration Center and Help
Desk review, followed later by NOVA with independent authentication,
authorization, and internal knowledge sources.
