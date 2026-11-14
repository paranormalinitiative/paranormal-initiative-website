# Member Profile Media Permissions and Save Repair

## Incident record

- **Date:** 2026-11-14
- **Time reported:** 14:00:56 ET
- **Reported by:** Todd Wayne, Owner/Founder/CEO
- **Area:** Member Profile, Community Feed, shared profile API, profile media storage
- **Scope:** Site-wide member experience; applies to regular signed-in members
- **Protected applications changed:** None. StudioFlow, Nova Editorial Workspace,
  and Creator Studio were not modified, rebuilt, or live-accepted.

## What happened

Bill Heiland reported that he could not update his profile picture or background
banner. The visible failure looked like a permissions problem, so the complete
member journey was checked rather than only the upload endpoint.

The upload endpoints already used the authenticated `requireMember` boundary,
which means an anonymous visitor is denied while a normal signed-in member is
allowed. The actual blocker was later in the profile flow:

1. The profile editor marked the account email field as required.
2. The client stopped the upload/save flow when an account had no recovery email.
3. The server then rejected a profile save without an email, even after media
   had already been uploaded.

This made a permitted member appear unable to add an avatar or banner and could
leave confusing partial upload state.

## Permission findings

| Check | Result |
| --- | --- |
| Anonymous profile-photo upload | Denied with `401` |
| Authenticated regular-member profile-photo upload | Allowed with `200` |
| Authenticated regular-member profile-banner upload | Allowed with `200` |
| Uploaded photo media readback | `200`, image content |
| Uploaded banner media readback | `200`, image content |
| Existing account with blank email can save profile media | Allowed |
| Existing account email is preserved when the form submits blank | Preserved |

## Repair applied

- Kept avatar and banner upload routes authenticated through the shared
  `requireMember` boundary.
- Removed the unnecessary required-email gate from the member profile editor.
- Allowed existing accounts without an email to save media and profile fields.
- Continued validating any email address that a member does provide.
- Preserved an existing email when a blank value is submitted, preventing an
  unrelated media save from erasing recovery information.
- Kept existing image validation, supported-format handling, 12 MB limit, and
  clear HEIC/HEIF guidance.
- Advanced the shared profile script cache version from `v49` to `v50` on all
  affected member and administration-facing pages.
- Added source, API, and Firefox regression checks for authorization, upload,
  media readback, save behavior, and cleanup.

## Verification record

- Member interaction source contracts: **10/10 passed**.
- Local member profile/feed API checks: **47/47 passed**.
- Isolated Firefox profile-media acceptance: **49/49 passed**.
- Guarded shared-API preflight: **11 gates passed in about 31 seconds**.
- Production anonymous safety smoke: **10/10 passed**.
- Production disposable regular-member probe:
  - anonymous upload denied: **401**;
  - member photo upload: **200**;
  - member banner upload: **200**;
  - photo and banner readback: **200/200**;
  - profile cleanup: **200**.
- The disposable production account was restored to blank avatar, banner, and
  correspondence values after verification.

## Release record

- **Source repair commit:** `d1cb8a5c`
- **Documentation follow-up commit:** `2616f632`
- **Certified release:** `rel-d1cb8a5c5d5c-5088f9e96a85`
- **Release profile:** `shared-api`
- **Certification time:** 2026-11-14 14:08:57 ET
- **Production Worker version:** `fbfd467e-f231-4cc6-8769-23103a47e959`
- **Deployment duration:** about 19 seconds after certification
- **Protected-app policy:** StudioFlow, Nova Workspace, and Creator Studio were
  protected by the integrity guard and excluded from this unrelated repair.

## Reusable lesson

Profile-media permissions must be checked end to end: session authorization,
editor validation, upload storage, follow-up profile save, media readback,
cache freshness, and cleanup. A correct permission on the upload route is not
enough if the editor or the subsequent save rejects the same member.

## Source references

- [`member-profile.html`](../../../member-profile.html) — profile editor field
- [`member-login.js`](../../../member-login.js) — upload and save flow
- [`functions/api/[[path]].js`](../../../functions/api/[[path]].js) — upload and profile API
- [`tpi-member-interactions.mjs`](../../../scripts/verify/tpi-member-interactions.mjs) — permission contracts
- [`tpi-member-profile-feed.mjs`](../../../scripts/verify/tpi-member-profile-feed.mjs) — API regression checks
- [`tpi-member-profile-feed-firefox.mjs`](../../../scripts/verify/tpi-member-profile-feed-firefox.mjs) — browser regression checks
- [`TPI-PROBLEMS-FIXES-AND-FEATURED-PRODUCTS.md`](../TPI-PROBLEMS-FIXES-AND-FEATURED-PRODUCTS.md) — living incident reference
