# TPI-DEV-016 — Desktop/Mobile Acceptance Audit

Status: PARTIAL — member surface passed; privileged roles blocked
Date: 2026-10-14
Development URL: `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev`

## Browser evidence

The real development Worker rendered successfully in the Codex in-app browser.
The browser session identified itself as the synthetic `TPI Development Member`
session before it was signed out for the attempted role switch.

### Ordinary member

| Viewport | Rendered | Horizontal overflow | Desktop sidebar | Mobile navigation | Admin link | Studio link |
| --- | --- | --- | --- | --- | --- | --- |
| 1280 × 800 | PASS | none | visible | hidden | hidden | hidden |
| 1440 × 900 | PASS | none | visible | hidden | hidden | hidden |
| 1920 × 1080 | PASS | none | visible | hidden | hidden | hidden |
| 375 × 812 | PASS | none | hidden | visible | hidden | hidden |
| 390 × 844 | PASS | none | hidden | visible | hidden | hidden |
| 430 × 932 | PASS | none | hidden | visible | hidden | hidden |

The member shortcuts menu opened and exposed ordinary member destinations such
as Files, Reels, Events, Para News, and ParaTube. No administration or Creator
Studio navigation was exposed.

### Anonymous/protected boundaries

- `/admin-center-preview/`: PASS — rendered the restricted Administration Center
  gate with sign-in and return links; no protected bundle or data was exposed.
- `/studio/`: PASS — rendered the protected “Creator Studio — Coming Soon”
  boundary with sign-in and return links.

## Not tested / blocked

- Authenticated admin dashboard and sidebar.
- Creator Partnership dashboard and application review.
- Account association controls.
- Founding 50 membership detail UI.
- Authenticated Creator Studio UI.
- Contributor-specific browser navigation.
- Revoked-creator visual denial and entitlement transition.
- Privileged-role desktop/mobile screenshots.

The browser viewport capability worked for the requested sizes. The blocker is
secure credential entry, not viewport support.

## Evidence handling

Screenshots were captured during the browser session for visual inspection, but
the available browser API did not persist them into the repository QA tree.
No credentials, cookies, or private member data were saved in the repository.
