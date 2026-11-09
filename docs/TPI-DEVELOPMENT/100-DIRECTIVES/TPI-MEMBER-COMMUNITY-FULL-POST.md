# Community Feed Full Posts and Canonical Open Links

Date: 2026-11-09  
Status: **COMPLETE — DEPLOYED AND VERIFIED**

## Objective

Community feed cards now show the complete post directly in the feed. The
existing **Open post** action remains available as a canonical navigation path
to the post location, including posts that are not on the first feed page.

## Root cause

`renderCommunityCard` truncated post bodies with `substring(0, 400)`. In
addition, hash-only navigation did not ask the feed API to include a requested
post when that post was outside the initial page, and post body text was not
linkified. Together these made a visible post incomplete and could leave the
Open post target unable to locate the actual card.

## Correction

- Render the full post title and body in every community feed card.
- Escape post text and safely linkify URLs present in the post body.
- Preserve clickable internal links for approved TPI destinations such as the
  Education Center, published articles, Paper Editor, and Member Home.
- Keep the visible **Open post** action, now using `?post=<id>#post-<id>`.
- Add an optional `postId` feed query so the requested visible community post
  is included even when it is beyond the first page.
- Preserve the existing stable anchor, scroll, highlight, reactions, comments,
  sharing, editing, and deletion controls.

## Files modified

- `api-client.js` — optional targeted post query for community feed requests.
- `functions/api/[[path]].js` — include an authorized visible target post in a
  requested feed page without changing normal pagination.
- `member-home.html` — full-body rendering, safe linkification, and canonical
  Open post navigation.
- `scripts/qa/tpi-ops-011-member-home.mjs` — maintained assertions for full
  bodies and target loading.

## Focused verification

- Syntax and whitespace checks: PASS.
- TPI-OPS-011 member-home QA: **42/42 PASS**.
- Isolated Firefox Developer Edition disposable-post check: **PASS**.
  - Body length rendered: 327.
  - Expected body length: 327.
  - Target card visible and hash-selected: true.
  - Education Center URL was rendered as a clickable link.
  - Open post URL contained the post query and hash anchor.
  - Targeted API page loaded the requested post outside the first page.
- The real Steve Glanz post was not edited or destructively tested. The
  correction applies to all authorized community posts rendered by the feed.

## Release verification

- Website source commit: `c916ee45fa2b99aaa69d0d87413da851dc879c83`.
- Branch: `codex/tpi-development`.
- GitHub parity: verified before certification and deployment.
- Guarded release preflight: **CERTIFIED**, 30 gates passed.
- Release ID: `rel-c916ee45fa2b-0232626142f1`.
- Production Worker: `ae0e5d09-543a-4979-974d-b28174088c42` at 100% traffic.
- Rollback Worker: `2ce0b94d-5eb7-45dd-a55f-7965da187668`.
- Production anonymous smoke: **10/10 PASS**.
- Live isolated Firefox Developer Edition acceptance: **65/65 PASS**.
- Deployment result: **DEPLOYED_AND_VERIFIED**.

The release candidate also passed the maintained StudioFlow lifecycle,
ownership, deletion, Teleprompter, Notes, mobile, and release-safety suites.
The deliberate StudioFlow sibling-lineage port was recorded in the preflight
override; the approved StudioFlow source and staged markers were verified and
its assets were unchanged by this community-feed correction.

## Live artifact check

- `https://paranormalinitiative.com/member-home` returned HTTP 200.
- Cache-Control: `public, max-age=0, must-revalidate`.
- Live HTML contained `renderFeedBody`, `getRequestedPostId`, and targeted
  `post` navigation markers.
- Live entrypoint SHA-256:
  `d5f1a20f246ff10349a8d4a4981db52aa0d13829ac1362c8d6c30faed3a33993`.
- `/api/feed?limit=1&offset=0&scope=community` returned HTTP 200.

No creator data, posts, membership records, database records, or storage
objects were changed by the deployment. The disposable local verification post
was removed during test cleanup.

If an already-open tab still shows the old truncated card, open a fresh tab or
hard-refresh the Member Home page.
