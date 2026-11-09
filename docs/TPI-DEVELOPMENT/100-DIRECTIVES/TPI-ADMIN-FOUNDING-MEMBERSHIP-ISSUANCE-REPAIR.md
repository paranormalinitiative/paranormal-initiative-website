# TPI-ADMIN — Founding Membership Issuance Investigation and Repair

Date: 2026-11-08  
Environment: Official local Worker, `http://127.0.0.1:8787`  
Production: **UNCHANGED — NO DEPLOYMENT AUTHORIZED**  
Status: **COMPLETE — DEVELOPMENT VERIFIED**

Implementation commit: `3ac6c6c`  
Website/source repository: `codex/tpi-development`

## Root cause

The existing issuance form accepted free-form text and sent it to an exact
`contributors.username` lookup. It did not provide an administrator-only
member search or resolve a selected account to its internal contributor ID.
The lookup also did not remove a leading `@`. The screenshot's value
`@HRmoss7` therefore could not match a stored username such as `HRmoss7`, and
the administrator had no reliable way to distinguish a valid account from a
typo before submitting.

The permanent allocator was not the defect. `assignFoundingMembership` already
uses the existing class-specific unique constraints, sequential non-recycled
numbering, capability ledger, append-only history, and an atomic D1 batch.

## Implementation

### API

- Added the admin-only `GET /api/admin/founding-memberships/members?search=...`
  endpoint.
- Search matches username, display name, or registered email for active
  existing accounts, returns at most 25 results, and masks returned email
  values.
- Added scoped `@` normalization for Founding Membership username lookup.
- Assignment accepts the selected `accountId` and re-resolves the active
  contributor server-side. The server never trusts client-supplied capability
  or membership-number values.
- Existing `requireAdmin` authorization and the existing transactional
  allocator remain unchanged.

### Administration UI

- Replaced the ambiguous free-text issuance field with an administrator-only
  search and result picker.
- The selected member is shown with display name and username before issuance.
- Added an explicit confirmation dialog showing the selected member, class,
  proposed next permanent number, and server-defined capabilities.
- Errors close the confirmation dialog and remain visible through the existing
  administration notice channel; no false success state is shown.

No database migration or numbering change was required.

## Verification

All checks below used the official loopback Worker and disposable/local review
accounts. No production membership number or production account was used.

| Check | Result |
| --- | --- |
| Focused API lookup/authorization | **8/8 PASS** |
| Existing Founding Membership source/ledger verifier | **155/155 PASS** |
| Firefox Developer Edition browser workflow | **48/48 PASS** |
| Chromium compatibility smoke with isolated browser context | **13/13 PASS** |
| Administration Center preview checks | **81/81 PASS** |
| Administration functional checks | **16/16 PASS** |
| Administration source/navigation checks | **9/9 PASS** |
| Release-safety contract | **27/27 PASS** |
| Admin app TypeScript/Vite build | **PASS** |
| Worker JavaScript syntax check | **PASS** |

Focused API evidence included:

- Leading `@username` search resolves the existing account.
- Display-name search resolves the existing account.
- Registered-email search resolves the existing account.
- Email output is masked.
- Leading `@username` assignment reaches duplicate protection and reports the
  existing permanent number without allocating another number.
- An ordinary member receives `403` for the search endpoint.

Browser evidence:

- [Firefox Founding Memberships evidence](../../audits/TPI-CREATOR-INCENTIVE-001/firefox-founding-memberships.png)
- [Chromium Founding Memberships evidence](../../audits/TPI-CREATOR-INCENTIVE-001/chromium-founding-memberships.png)
- Maintained browser harness:
  `scripts/verify/tpi-creator-incentive-001-browser.mjs`
- Focused API harness:
  `scripts/verify/tpi-admin-founding-membership-issuance.mjs`

## Files changed

- `functions/api/[[path]].js` — protected member search, `@` normalization,
  and selected-account resolution.
- `admin-center-app/src/app.tsx` — search/select/confirm issuance workflow.
- `admin-center-app/src/index.css` — member-result and selected-member styling.
- `scripts/verify/tpi-creator-incentive-001-browser.mjs` — browser assertions
  updated for the repaired workflow.
- `scripts/verify/tpi-admin-founding-membership-issuance.mjs` — focused
  loopback API verification.
- `admin-center-preview/index.html` and generated assets — rebuilt local admin
  application package.
- `docs/audits/TPI-CREATOR-INCENTIVE-001/firefox-founding-memberships.png`
  and `chromium-founding-memberships.png` — refreshed local evidence.

## Asset hashes

Local rebuilt admin package:

- `admin-center-preview/index.html` —
  `fbd1cb4476866ff2a37892c87c564df7ef090f6b5b74c32932142b81d993740b`
- `admin-center-preview/assets/index-d-sLgPuv.js` —
  `d0b134bfe63e44bcb884538764771af108353e76a1bf72143ac9664d74c19281`
- `admin-center-preview/assets/index-C733K_jm.css` —
  `b89bc2474e952e11abac9f98261ec44615d440cedc08c1c9fc01b9f2e8e6ec91`

These are development assets only. They were staged into the official local
Worker for browser acceptance and were not deployed to production.

## Data and deployment safety

- Existing `0058_founding_membership_entitlements.sql` remains unchanged.
- Existing class limits FC/FCT/FAA, permanent number allocation, uniqueness,
  suspension/revocation accounting, entitlement mapping, and history remain
  intact.
- No production API, D1 database, R2 bucket, or creator record was modified.
- No production deployment occurred.
- Existing unrelated work was not reset or cleaned.

## Remaining limitations

The UI has been verified locally in Firefox Developer Edition and Chromium.
This directive intentionally stops before production deployment, so production
live verification is not part of this record. The existing Founding Membership
numbering and membership records remain governed by the current migration and
server-side transaction; no schema change was needed for the repair.
