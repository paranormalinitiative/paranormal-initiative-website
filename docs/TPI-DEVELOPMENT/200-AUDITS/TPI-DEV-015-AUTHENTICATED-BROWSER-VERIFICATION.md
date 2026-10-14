# TPI-DEV-015 — Authenticated and Browser Verification

Date: 2026-10-14

## Summary

Status: **PARTIAL — AUTHENTICATED HTTP PASS; VISUAL ACCEPTANCE LIMITED**

The final development deployment was checked against synthetic identities and
the anonymous browser boundary. No real creator application, membership,
invite, or account was used.

## Automated authenticated verification

`node scripts/qa/tpi-dev-014-authenticated.mjs` passed **57/57** checks:

- Anonymous Admin Center API denial.
- Anonymous Creator Studio denial.
- Invalid-password rejection for all six synthetic role fixtures.
- Real login and session introspection.
- Member, contributor, admin, owner, entitled-creator, and revoked-creator
  route boundaries.
- Direct Administration Center preview protection.
- Legacy admin redirect behavior.
- Member denial of admin-linked application creation.

`node scripts/qa/tpi-dev-014-inactive.mjs` passed **2/2** checks for inactive
login denial and inactive application association rejection.

## Browser evidence

The Codex in-app browser opened the development Administration Center preview
without a session and visibly rendered the restricted gate at a 360px-wide
mobile-style viewport. The gate stated that the Administration Center is
restricted to authorized owner and administrator accounts and provided only
sign-in/return paths. The protected application bundle was not exposed.

This is a real browser rendering check, but it is not a full responsive
acceptance pass. Authenticated desktop/mobile visual verification is **NOT
TESTED / BLOCKED** because the available browser session did not contain the
synthetic credentials and no connected desktop Chrome session was available.
The authenticated behavior is therefore supported by the HTTP suite, not by a
claim of visual browser acceptance.

## Safety

- Browser target: development Worker only.
- Production: not opened or contacted.
- Browser forms: no mutating form was submitted.
- Credentials: not printed, copied into reports, or transmitted through the
  browser automation layer.
