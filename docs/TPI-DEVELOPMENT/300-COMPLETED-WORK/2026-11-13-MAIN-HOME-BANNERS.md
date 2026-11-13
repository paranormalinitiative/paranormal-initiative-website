# Main Website Banners on Both Home Pages

Date: 2026-11-13
Status: **DEPLOYED AND LIVE VERIFIED**

## Change

Added the supplied `Main Website Banner.png` to the public landing page and the
signed-in Member Home. The site stores a shared copy at
`assets/main-website-banner.png`. Both views show the entire 2172 × 724 image at
its native 3:1 aspect ratio, with the rounded border treatment used by the
Education Center banner.

The signed-in banner appears above the home feed and right rail. The same
shared page also renders member profiles, so the site banner is hidden in
profile mode; a member's own banner remains controlled by their profile.

## Verification

- `npm run verify:member-profile-feed`: **33/33 passed**.
- `npm run verify:member-profile-feed-firefox`: **33/33 passed**, including
  visible image dimensions and full aspect ratio on the public and member home.
- `npm run verify:local-auth-lifecycle`: **38/38 passed** before and after the
  managed Worker restart and StudioFlow build; isolated Firefox acceptance
  passed **65/65**.
- `npm run release:preflight`: **30 release gates passed**; exact candidate
  certified as `rel-baec1094a400-690375b626c2`.
- Guarded production deployment: **DEPLOYED_AND_VERIFIED**. Anonymous live
  smoke passed **10/10**, production Firefox acceptance passed **65/65**, and
  the new Worker version reached **100% traffic**.
- Additional isolated live Firefox acceptance passed **3/3**: public landing
  banner visible and uncropped; signed-in Member Home banner visible and
  uncropped; member profile view keeps the shared site banner hidden.

## Release identity

- Source commit: `baec1094a4004a4434fcbeb257737062934b84ce`
- Release: `rel-baec1094a400-690375b626c2`
- Worker: `theparanormalinitiative`
- Deployed Worker version: `bf5b1570-3d63-4dad-a435-d1fefce49603`
- Rollback version: `07e4ef2b-9598-43a1-a2b1-290120516d07`
- Release branch: `codex/tpi-development`
