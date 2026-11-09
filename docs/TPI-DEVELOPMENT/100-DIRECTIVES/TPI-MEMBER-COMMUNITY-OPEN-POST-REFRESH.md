# Community Feed Open Post — In-Place Expansion Release

Date: 2026-11-09  
Status: **COMPLETE — DEPLOYED AND LIVE-VERIFIED**

## Objective

Make the compact Community Feed **Open post** action reveal the complete post
without a browser page reload, while preserving the canonical post URL and
Education Center navigation.

## Root cause

The action was rendered as a normal anchor and had no delegated in-page click
handler. Firefox therefore performed a full document navigation. In addition,
the non-own profile feed path did not pass the requested post ID to the feed
request, so a post outside the first page could not reliably be selected after
navigation.

## Correction

- Intercept `[data-post-open]` in the existing member-home event delegation.
- Prevent the default document navigation.
- Update the canonical `post=<id>#post-<id>` URL with `history.pushState`.
- Reload only the feed component and select the requested card in place.
- Pass `postId` through `api-client.js` and the member feed API so an authorized
  requested post is included even when it falls outside the first page.
- Preserve compact cards, full-body expansion, reactions, comments, editing,
  deletion, and stable post anchors.
- Keep real Education Center categories clickable; General Discussion remains
  a non-navigation feed label.

## Files

- `member-home.html` — in-place Open post interaction, profile-context URL
  handling, Education Center category links.
- `api-client.js` — optional targeted `postId` feed query.
- `functions/api/[[path]].js` — authorized requested-post inclusion.
- `scripts/qa/tpi-ops-011-member-home.mjs` — regression assertions for the
  no-reload path and category-link behavior.
- `docs/TPI-DEVELOPMENT/100-DIRECTIVES/evidence/TPI-MEMBER-COMMUNITY-OPEN-POST/open-post-live-firefox.png`
  — live Firefox evidence.

## Verification

| Check | Result |
|---|---|
| Focused member-home QA | **48/48 PASS** |
| Auth lifecycle | **38/38 PASS** |
| Guarded release preflight | **30 gates PASS** |
| Production smoke | **10/10 PASS** |
| Live isolated Firefox release acceptance | **65/65 PASS** |
| Live focused Open post test | **PASS** |

The focused live test used Firefox Developer Edition with a new isolated
Selenium profile and a disposable authenticated QA account. It created one
temporary General Discussion post through the authorized test fixture, opened
the live member feed, clicked the actual rendered **Open post** control, and
verified:

- compact body length: 398 characters;
- expanded body length: 1,260 characters;
- URL changed in place to the canonical `post=<id>#post-<id>` target;
- full body was rendered;
- no page reload was detected;
- the disposable post was deleted after the test.

Evidence: [live Firefox screenshot](evidence/TPI-MEMBER-COMMUNITY-OPEN-POST/open-post-live-firefox.png).

## Production release

- Source/website commit: `0a2fc260fa1ccd4ac56856a6992b7de56f1e1199`
- Release ID: `rel-0a2fc260fa1c-9033787d36ef`
- Production Worker: `13805918-374e-471a-adc9-01beb98c6e13`
- Traffic: **100%**
- Rollback Worker: `cd4a233c-8d05-4fcc-b244-b1fc01dd20dc`
- Candidate manifest digest: `cdb1a552044d29d7189bf17aaca8c80325ad541032b42005b04daff96dd09240`
- Changed production assets uploaded: `/admin-center-preview/release.json`,
  `/api-client.js`, and `/member-home.html`.

The release preflight required the documented website-only lineage override
because this repository's feed correction is on a sibling website commit line
relative to the previously certified StudioFlow source. No StudioFlow source
files or StudioFlow assets were changed by this release.

## Data and scope safety

No owner Firefox profile was opened or cleared. No real creator post, Studio,
Note, recording, membership, database record, or storage object was modified.
The release did not include Nova Edit, Messenger identity formatting, Friends,
bug-report intake, or account provisioning work; those remain separate scopes.
