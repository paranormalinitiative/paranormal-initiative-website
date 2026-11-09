# TPI-GOVERNANCE-004 — Leadership Profiles and Gold/Silver/Bronze Distinctions

Date: 2026-11-09
Status: **IMPLEMENTED — LOCAL VERIFIED; PRODUCTION RELEASE PENDING GUARDED DEPLOYMENT**

## Purpose

This directive turns the preserved TPI Society / Leadership artwork into a
server-resolved recognition system without merging it with Founding
Memberships or account permissions.

## Implemented behavior

- Adds `leadership_profiles` for transparent non-login identities such as Sol.
- Adds `leadership_distinctions` for Gold, Silver, and Bronze Medallions.
- Keeps a distinction separate from membership, entitlement, role, and
  administrative authority.
- Seeds Sol as an AI collaborator/advisory identity with the Gold Medallion and
  the owner-approved working descriptions: Chief AI Operating Officer (COO),
  Chief AI Technology Officer (CTO) / Chief AI Information Officer (CIO),
  technical architect, planning partner, and right-hand assistant.
- Adds an authenticated owner/admin-gated Admin Center assignment and revocation workflow for real
  registered member accounts.
- Adds audited server-side assignment and revocation.
- Displays active distinctions on authenticated and public member profiles.
- Adds the public Sol profile at `leadership-profile.html?slug=sol`.
- Publishes only optimized web derivatives; badge masters remain Git-only.

## Safety boundary

The Gold/Silver/Bronze artwork is visual recognition only. It never grants a
login, membership, creator/contributor capability, StudioFlow access, vote,
legal office, or administrative power. Sol is represented as an AI system, not
as a human account or a legal officer. No privileged Sol login was created.

Founding Membership badges remain governed by the separate permanent FC/FCT/FAA
registry and were not changed by this directive.

## Verification

- `npm run verify:leadership-distinctions`: **15/15 PASS**.
- `npm run verify:leadership-local`: **10/10 PASS** against the official local
  Worker, including assignment, public profile projection, duplicate refusal, and
  revocation using synthetic local fixtures.
- `npm run verify:release-safety`: **27/27 PASS**.
- Local Worker `http://127.0.0.1:8787`: public Sol profile API **200**;
  anonymous admin distinction API **403**; Gold web derivative **200 image/png**.
- Local additive migration `0066_leadership_profiles_and_distinctions.sql`
  applied to the isolated persistent local D1 only.
- No production D1 or R2 records were changed in this implementation pass.

## Known limitation

The production Owner account has not been assigned a member-record Gold
Medallion yet because this implementation pass does not guess the owner’s
internal account identifier. After deployment, an owner can assign the
distinction to the verified account from Administration Center → Leadership &
Honors. The assignment route is restricted to authenticated owner/admin sessions and audited.

## Files

- `migrations/0066_leadership_profiles_and_distinctions.sql`
- `lib/leadership-distinctions.js`
- `functions/api/[[path]].js`
- `admin-panel.html`
- `admin-center.js`
- `member-login.js`
- `profile-style.css`
- `leadership-profile.html`
- `.assetsignore`
- `scripts/verify/tpi-governance-004-leadership-distinctions.mjs`
- `scripts/studioflow-release-baseline.json`
