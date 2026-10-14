# TPI-DEV-014 — Authenticated Role and Creator Lifecycle Verification

Date: 2026-10-14

## Scope and safety

Status: **PASSED WITH LIMITATIONS**

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- HEAD: `3467881f92905ad2ccd7f4593a852d2cd0e75765`
- Development Worker: `theparanormalinitiative-dev`
- Development D1: `tpi_contributor_portal_dev`
- Development R2: `tpi-contributor-media-dev`
- Production: not contacted, deployed, or mutated.
- Desktop research checkout: not touched.
- Tavily/Facebook/research systems: not contacted.
- Commits and pushes: not performed.

The real `tpi-dev-owner` account was preserved. All new accounts use the
`tpi-dev014-` namespace and synthetic `.invalid` contact values. Passwords
were generated locally, stored outside the repository with restrictive file
permissions, and never printed.

## Implementation

Existing functionality reused:

- `/api/auth/login`, `/api/auth/me`, and durable cookie sessions.
- `requireMember`, `requireContributor`, `requireAdmin`, and `requireOwner`.
- `hasCreatorStudioAccess` and the host/API Studio gates.
- Founding 50 application intake, review, audit, and allocation handlers.
- Existing Administration Center preview and creator read models.
- Existing D1 membership, entitlement, history, and admin-audit tables.

New narrow compatibility repair:

- Added owner-protected `POST /api/admin/founding-50/memberships/:id/status`.
- Supported states: `active`, `suspended`, `revoked`.
- Membership and entitlement state change in one D1 batch.
- Every status transition records membership history and admin audit data.
- Allocated slots remain consumed after suspension/revocation/reactivation;
  no lifetime membership is silently recycled.

The development activation variable is explicitly deployed as `disabled`
outside an approved synthetic test window. Production uses its separate gate.

## Authenticated evidence

`scripts/qa/tpi-dev-014-authenticated.mjs` passed **57/57** checks:

- Anonymous admin API and Creator Studio denial.
- Invalid-password rejection for all six primary account roles.
- Real login and `/api/auth/me` role verification.
- Member denial of admin and contributor APIs.
- Contributor access to contributor tools without admin access.
- Admin/owner access to protected Administration Center APIs and preview.
- Authenticated legacy admin redirect behavior (`307`) for admin/owner.
- Creator Studio denial before entitlement.
- Direct admin-page denial for non-admin accounts.
- Member denial of application administration.

`scripts/qa/tpi-dev-014-inactive.mjs` passed **2/2** checks for inactive
login denial and inactive application association rejection.

## Application and entitlement lifecycle

`scripts/qa/tpi-dev-014-lifecycle.mjs` passed **33/33** checks:

- Invalid account and invalid URL rejection.
- Application detail persistence path.
- Rejection and rejected-application allocation denial.
- Member denial of application review.
- Admin approval and owner-only activation.
- Pre-activation Creator Studio denial.
- Post-activation Creator Studio access and server-derived capability.
- Admin denial of activation and revocation.
- Owner revocation, reactivation, and final revocation.
- Duplicate pending application denial.
- Audit history visibility and lifecycle action presence.

## Capacity and concurrency

Synthetic slots 2–49 were added as capacity-only fixtures after slot 1 was
activated and later revoked. `scripts/qa/tpi-dev-014-capacity.mjs` passed
**15/15** checks:

- Summary at 49 allocations: 49 allocated, 1 remaining.
- Two simultaneous final-slot requests: one `201`, one safe `409`.
- Summary at 50 allocations: 50 allocated, 0 remaining.
- Duplicate winner and approved 51st attempts: `409`.
- Winner Studio access and loser denial.
- Winner revocation preserved the allocation and removed Studio access.

Final synthetic state is 50/50 allocated; slot 1 and slot 50 are revoked,
capacity fillers occupy slots 2–49, and no slot is recycled.

## Activation-gate safety repair

The first gate-off probe found that removing a Wrangler variable did not
reliably clear the already-deployed development binding. Allocation correctly
returned `423`, but the status probe initially saw the stale approval value.
The development configuration was changed to explicitly deploy:

`FOUNDING50_DEVELOPMENT_ACTIVATION = "disabled"`

The development Worker was redeployed and the final gate-off check passed:

- Allocation mutation: `423`.
- Status mutation: `423`.
- Allocated/remaining state unchanged: passed.

This is why explicit disabled configuration is now part of the development
policy. The initial gate-off probe is recorded as **FAILED / REPAIRED**, not
silently counted as a pass.

## Offline and build regression results

- TPI-DEV-011 focused checks: **16/16 passed**.
- TPI-DEV-012 authorization checks: **16/16 passed**.
- TPI-DEV-013 partnership checks: **17/17 passed**.
- TPI-ADMIN-008 preview checks: **79/79 passed**.
- TPI-DEV-014 source checks: **9/9 passed**.
- Node syntax checks for changed Worker and QA/fixture scripts: **passed**.
- `admin-center-app` TypeScript/Vite build: **passed**.
- `git diff --check`: **passed**.

## Deployment record

The normal development deploy script refused to deploy uncommitted application
files, as designed. Because this directive prohibited commits, a temporary
sanitized staging directory was used with the same development-only exclusions
for data, docs, migrations, scripts, and production configuration.

- Test-window deployment: `1b74ce3a-5fc3-47c1-8326-539b24c7abc3` with explicit approval.
- Final fail-closed deployment: `248b497a-3286-4bb5-90ed-e260faa07ae6` with explicit disabled binding.
- No production deployment occurred.

## Limitations

- The existing Administration Center creator panels remain primarily
  read-oriented; the new lifecycle mutation is a protected API contract, not a
  new second administration UI.
- Full browser visual acceptance at desktop/mobile widths was not performed;
  direct authenticated HTTP route/API checks were performed.
- Studio room creation was not exercised because it would require configured
  external RealtimeKit credentials and would create external/media state.
- Synthetic cleanup was not executed so the development owner can inspect the
  resulting 50-slot and audit state. Use the manifest procedure only with a
  deliberate development cleanup decision.
- No real creator application, real Founding 50 membership, production
  entitlement, email, notification, publishing, or member-account workflow
  was used.
