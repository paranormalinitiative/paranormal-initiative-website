# Nova Education Publication Feed Integration

## Outcome

Nova Editor Workspace publication already writes the authoritative published
Education Center article. The missing sitewide handoff was discovery: the
signed-in Member Home activity stream was requesting the discussion-only feed
scope, which filtered published Education articles out of the member-facing
feed even though the backend could already render article cards.

Member Home now uses the complete public discovery stream. When a contributor
with publishing access publishes Education Center content through Nova, the
feed includes one article card with the contributor identity, article type,
title, summary, and link to the published Education Center page. Standard
Contributor publications in open Education subjects do not wait for reviewer
or publisher approval. Existing explicit
`scope=community` callers remain discussion-only.

## What changed

- Removed the posts-only scope from Member Home's shared activity-feed loads,
  profile-feed loads, and load-more action.
- Updated the feed refresh check to detect a newly published article as well as
  a new Community Feed post or video.
- Ordered article feed entries by their current `updated_at` value (falling
  back to `created_at`) so a newly published existing draft is discoverable at
  the time it becomes public.
- Kept the existing article projection instead of creating a duplicate
  `community_posts` record. The article ID is the stable feed identity, so a
  republish or refresh cannot create duplicate announcement posts.
- Preserved the existing public-only article visibility rule: only
  `articles.status = 'published'` enters the public feed.

## Protection rules

1. Nova publication remains the source of truth; the feed is a read-only
   discovery projection and cannot publish or edit an article.
2. A draft or moderation-removed article does not appear in the public feed.
   Historical articles already enrolled in the editorial workflow continue to
   follow their recorded state; that workflow is not the default for new
   standard Contributor publications.
3. The explicit posts-only API scope remains available and is not broadened.
4. The feed card links to the article's stored canonical `href`; it does not
   construct an alternate destination or expose internal editorial data.
5. No Community Feed post is synthesized for an article, preventing duplicate
   content, duplicate reactions, and duplicate moderation records.
6. StudioFlow, Creator Studio, Nova storage, private media, and owner data are
   outside this change and were not modified.

## Verification

| Check | Result |
| --- | ---: |
| Nova publication verifier, including exact-once feed discovery | **66/66** |
| Member interaction source contracts | **33/33** |
| JavaScript syntax checks | **PASS** |
| Local member/profile/feed acceptance | **47/47** |
| Disposable local port-8787 publication → public feed check | **PASS** |
| Guarded production preflight | **40/40 gates; Tier 1 full/shared-API profile** |
| Production anonymous smoke | **10/10** |
| Live isolated Firefox Developer Edition acceptance | **65/65** |
| Live public feed/page probe | **PASS** — 36 feed items, including 23 article cards; Member Home requests the complete feed |

## Files

- `functions/api/[[path]].js` — article feed timestamp projection.
- `member-home.html` — complete discovery-feed loading and refresh detection.
- `scripts/verify/tpi-member-interactions.mjs` — sitewide source contracts.
- `scripts/verify/tpi-nova-004r6e-publish.mjs` — exact-once publication-to-feed
  regression.
- `docs/TPI-DEVELOPMENT/TPI-PROBLEMS-FIXES-AND-FEATURED-PRODUCTS.md` — symptom
  lookup and repair record.

## Release record

The exact certified candidate was deployed without recertification because the
candidate bytes remained sealed and unchanged:

- Release: `rel-6d82f7e349f7-7eb0976ad7d9`
- Source commit: `6d82f7e349f7e80bc86c73c1d23cd3bc9ed5adf9`
- Production Worker version: `617e1f7a-647c-4d45-9b1d-dbf828ed29e5`
- Rollback version: `e72e8de9-ddbe-4c52-af28-d50d34c51019`
- Traffic: **100%** on the new Worker
- Certified deployable bytes: **799 assets + 25 Worker source files + 1 configuration**
- Certification manifest digest: `74fe7a1e0d182a99a7f51d84c62134df1e0d44c4db183f206479a0317f4ced41`

The release changed only the shared feed projection/client loading and its
verification/documentation. StudioFlow, Creator Studio, Nova storage, private
media, and owner data were not modified.
