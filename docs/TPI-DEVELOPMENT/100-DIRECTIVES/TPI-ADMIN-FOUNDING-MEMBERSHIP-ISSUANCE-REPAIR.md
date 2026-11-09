# TPI-ADMIN — Founding Membership Issuance Investigation and Repair

Date: 2026-11-08  
Environment: Official local Worker, `http://127.0.0.1:8787`; production release verified 2026-11-09
Production: **DEPLOYED AND VERIFIED**
Status: **COMPLETE — DEVELOPMENT VERIFIED AND DEPLOYED**

Implementation commit: `ec297489` (repair implementation); release website commit: `8798717c5577eec4cf11ad78658e382560d35504`
Integrated StudioFlow source: `0061dc692b07d571f9b1e022ef3949d9a50f4bf2`
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

These are the deployed Administration Center assets in the verified release:

- `admin-center-preview/index.html` — `fbd1cb4476866ff2a37892c87c564df7ef090f6b5b74c32932142b81d993740b`
- `admin-center-preview/assets/index-d-sLgPuv.js` — `d0b134bfe63e44bcb884538764771af108353e76a1bf72143ac9664d74c19281`
- `admin-center-preview/assets/index-C733K_jm.css` — `b89bc2474e952e11abac9f98261ec44615d440cedc08c1c9fc01b9f2e8e6ec91`

The release also retained the verified StudioFlow assets:

- `studio/index.html` integrated entrypoint — `919d8d92aa26d1bb150638cb2e9c9cefb7101f24472dfb911e1bf1aee3666f52`
- `studio/assets/index-Dvu9OCYf.js` — `765299359001600d4f5e9a982f9d243c1d5de2f9a03dbc114fc34d227be71607`
- `studio/assets/index-V2mQ_DP8.css` — `6e68faa590fb4a116d57b71bb768835e6b901c8ffdd903eee75267d4fad9899b`

## Data and deployment safety

- Existing `0058_founding_membership_entitlements.sql` remains unchanged.
- Existing class limits FC/FCT/FAA, permanent number allocation, uniqueness,
  suspension/revocation accounting, entitlement mapping, and history remain
  intact.
- No production schema migration, D1 reset, R2 reset, or creator-data deletion was performed by the release.
- Production Worker: `8ad865f0-14a5-402d-8349-fbe8c9b45cd2` at 100% traffic.
- Rollback Worker: `3bd482e0-00f3-4b35-ab7d-b372d8468b4d`.
- Live anonymous smoke: 10/10 PASS; isolated Firefox release acceptance: 65/65 PASS.
- Release gates passed: safety contract 27/27, authentication lifecycle 38/38, ownership 40/40, deletion 32/32, deletion safety 26/26, Notes 37/37, TPI-133 44/44, TPI-134 43/43, TPI-135 30/30, TPI-137A 67/67, and release certification 49/49.
- Existing unrelated work was not reset or cleaned.

## Remaining limitations

The focused Founding Membership API/browser verifier is intentionally loopback-only and was not pointed at production. The guarded production release verified the deployed Worker, assets, authentication, and live application smoke path. A pre-existing authenticated Chrome tab displayed its older free-text form during inspection; the deployed hashed assets contain the repaired search/select workflow, so a clean authenticated reload should be used if that stale tab persists.

The live registry observed during release verification contained Heather Riebel
(`HRMoss7`) as `FCT-001`, Steve Glanz (`sglanz`) as `FCT-002`, and an existing
`FCT-003` record for `Backwoods_Signal`. The current release did not issue that
third record. Future administrators can issue additional memberships from
`https://paranormalinitiative.com/admin-center-preview/#founding-memberships`:
select the class, search by username/display name/email, select the account,
review the proposed permanent number and capabilities, then confirm issuance.

The existing Founding Membership numbering and membership records remain
governed by the current migration and server-side transaction; no schema change
was needed for the repair.
