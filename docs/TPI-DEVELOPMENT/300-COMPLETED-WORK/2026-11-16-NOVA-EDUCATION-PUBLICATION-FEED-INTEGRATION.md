# Nova Education Publication Feed Integration

## Outcome

Nova Editor Workspace publication already writes the authoritative published
Education Center article. The missing sitewide handoff was discovery: the
signed-in Member Home activity stream was requesting the discussion-only feed
scope, which filtered published Education articles out of the member-facing
feed even though the backend could already render article cards.

Member Home now uses the complete public discovery stream. When an approved
contributor publishes Education Center content through Nova, the feed includes
one article card with the contributor identity, article type, title, summary,
and link to the published Education Center page. Existing explicit
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
2. A draft, review-only, or moderation-removed article does not appear in the
   public feed.
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
| Production guarded release | **Pending at initial record** |
| Production live acceptance | **Pending at initial record** |

## Files

- `functions/api/[[path]].js` — article feed timestamp projection.
- `member-home.html` — complete discovery-feed loading and refresh detection.
- `scripts/verify/tpi-member-interactions.mjs` — sitewide source contracts.
- `scripts/verify/tpi-nova-004r6e-publish.mjs` — exact-once publication-to-feed
  regression.
- `docs/TPI-DEVELOPMENT/TPI-PROBLEMS-FIXES-AND-FEATURED-PRODUCTS.md` — symptom
  lookup and repair record.

## Release record

This record is updated with the exact certified release, Worker version,
rollback version, production smoke result, and live browser acceptance after
the guarded deployment completes.
