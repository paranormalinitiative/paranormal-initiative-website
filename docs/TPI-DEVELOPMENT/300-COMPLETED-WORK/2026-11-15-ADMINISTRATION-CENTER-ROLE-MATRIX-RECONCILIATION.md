# Administration Center Role Matrix Reconciliation

**Date:** 2026-11-15  
**Scope:** Server-side staff roles, Administration Center access probes, and
internal role/action documentation  
**Status:** Deployed and live verified; protected boundary preserved

## Request

Continue the Administration Center roadmap with item 2: reconcile the
server-side role and capability matrix with every proposed Administration
Center action so authorized staff see the correct surface and protected
applications remain outside unrelated work.

## What was found

The Worker’s protected HTML gate already used the effective staff appointment
resolver. The `/api/editorial/access` response, which drives the React
Administration Center’s navigation scope, still checked only the legacy
`contributors.role` value. An appointed Executive, Full Administrator, or
Administrator could therefore pass the server gate but be presented with the
wrong limited interface.

## Changes made

- Added the shared `hasAdministrationCenterRole()` decision to
  `lib/staff-roles.js`.
- Updated the Worker HTML gate, `/api/auth/me`, and `/api/editorial/access` to
  use the same effective-role decision.
- Made `/api/editorial/access` return the effective staff role rather than the
  raw legacy account role.
- Added a complete role/action matrix audit covering Owner, Executive, Full
  Administrator, Administrator, Moderator, and Member boundaries.
- Added the corresponding protected Help Desk article for internal staff.
- Added regression checks that exclude Moderator and Member from the full
  Administration Center and detect future access-probe drift.
- Updated the Problems/Fixes/Featured Products reference and the generated
  Markdown index.

## Safety boundaries

This repair does not grant a new role, alter any member record, modify staff
appointments, or change entitlement rules. It only makes the navigation hint
agree with the existing server-side decision. It does not modify StudioFlow,
Creator Studio, Nova Editor Workspace, private media, D1, R2, Crossroads of the
Unknown, or public Mystic knowledge.

## Verification

- `node scripts/verify/tpi-staff-roles.mjs`: **22/22**.
- `node scripts/qa/tpi-admin-006-preview.mjs`: **82/82**.
- `node scripts/verify/tpi-release-impact.mjs`: **15/15**.
- `node --check worker.js` and `node --check functions/api/[[path]].js`: passed.
- `npm run verify:release-safety`: **37/37**.
- Full guarded preflight: **38/38** gates passed in **6m44s**.
- Production anonymous smoke: **10/10**.
- Live isolated Firefox Developer Edition acceptance: **65/65**.
- `npm run verify:markdown-reference`: passed; **1,078** Markdown files indexed.
- Help Center source separation: **19/19** source checks passed. The local
  HTTP probe could not connect because the maintained Worker service was not
  available in this execution environment.

The exact certified candidate `rel-0cb07bb0ba42-24c5cfb8e77e` was deployed as
Worker version `53382ceb-b9d1-46c0-ab94-0bd039a3611f` and confirmed at 100% of
production traffic. The protected-application integrity guard remained clean.

## Release state

The release used the maintained clean-tree and parity checks, local
authentication lifecycle, certified preflight candidate, guarded production
deployment, anonymous smoke, and live Firefox acceptance. A release-runner
stabilization was included because the first two production attempts exposed a
transient login-to-Member-Home redirect race while entering StudioFlow. The
runner now waits for the settled identity and retries only that known
Member-Home redirect; other access-denied or unexpected pages still fail
closed. StudioFlow application source and protected application bytes were not
changed.
