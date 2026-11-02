# TPI-CREATOR-INCENTIVE-001 — Founding Membership Entitlements, Dual Access, and Creator Incentive System

Status: **IMPLEMENTED, TESTED, CERTIFIED CANDIDATE PREPARED — LOCAL/DEVELOPMENT
ONLY. PRODUCTION NOT DEPLOYED (NOT AUTHORIZED BY THIS DIRECTIVE).**

Date: 2026-11-02

Related records:

- [Founding Membership Registry specification](../TPI-FOUNDING-MEMBERSHIP-REGISTRY.md)
- [Security and permissions](../007-SECURITY-AND-PERMISSIONS.md)
- [Nova product family architecture](../400-FUTURE-DEVELOPMENT/TPI-NOVA-PRODUCT-FAMILY-ARCHITECTURE-AND-ROADMAP.md)
- Browser evidence: [`docs/audits/TPI-CREATOR-INCENTIVE-001/`](../../audits/TPI-CREATOR-INCENTIVE-001/)

## 1. Existing-system inventory (before this directive)

| Area | Existing state | Action taken |
|---|---|---|
| Account model | `contributors` table with a single `role` column (`owner`, `admin`, `creator`, `contributor`, `member`) and session-backed auth | **Extended**; role semantics preserved as a legacy capability source |
| Creator Partnership / Founding 50 | Additive migration `0048`, owner-gated allocation, `creator_studio_entitlements`, application review, admin audit | **Preserved untouched**; the legacy entitlement now also resolves as a Creator capability source |
| Creator Studio gate | `hasCreatorStudioAccess()` reading one entitlement table | **Minimal integration**: same gate, now asks for the resolved Creator capability |
| Editorial access | `requireContributor()` checking the role list | **Minimal integration**: same gate, now asks for the resolved Contributor capability |
| Membership UI | Legacy `admin-panel.html` (Founding 50 section) and the canonical React Administration Center (`admin-center-app` → `admin-center-preview`) | **Extended** the canonical app with a Founding Memberships view; legacy HTML kept as a protected bookmark |
| Foundational entitlement model | **Missing** | **Created** (`migrations/0058`, `lib/membership-entitlements.js`) |
| FC / FCT / FAA classes and permanent numbering | **Missing** | **Created** (`lib/founding-memberships.js`) |
| Cumulative / dual access | **Missing**; the single `role` column is exactly the last-value-wins shape the directive requires eliminating for memberships | **Created** a capability ledger; nothing overwrites another source |
| Creator Incentive records | **Missing** (only "next track" statements) | **Created** eligibility + participation tracking only |
| Nova entitlements | Architecture record only | **Created** entitlement contract; **no Nova UI built** |

No second membership system was created beside an authoritative one: the new
registry is additive to `contributors`, `creator_partnership_memberships`,
`creator_studio_entitlements`, and `admin_audit_logs`.

## 2. Creator Incentive source rules

Every repository record that mentions Creator Incentive was read:
`MASTER_BUILD_PLAN.md`, `TPI_NEXT_BUILD_TASKS.md`, `CONTRIBUTOR_PORTAL_PLAN.md`,
`docs/TPI-DEVELOPMENT/TPI-CURRENT-DEVELOPMENT-STATUS.md`,
`docs/planning/TPI-DOCS-001_MASTER_STATUS.md`, `007-SECURITY-AND-PERMISSIONS.md`,
the Nova architecture record, and the `docs/audits/` ADMIN-00x Creator
Partnership records.

The authoritative records define: the three membership identities, the
Creator/Contributor/Dual capability model, mandatory cumulative entitlements,
the separation of membership from administrative/editorial authority, the
Founding 50 program shape, and "no automatic award, no public promise".

No record defines incentive amounts, payout values, qualification thresholds,
point systems, revenue percentages, reward schedules, approval requirements,
payout frequency, creator eligibility earnings rules, or accounting rules.

Consequently this directive implements **eligibility and participation tracking
only** and reports every financial rule as
**UNRESOLVED — OWNER DECISION REQUIRED** in the API, the admin UI, and
`lib/membership-entitlements.js`. No financial value, threshold, or schedule was
invented.

## 3. Membership architecture

`founding_membership_classes` (seeded) and `founding_memberships` (registry):

- `FC` / `FCT` / `FAA`, 50 lifetime numbers each, 150 total.
- Permanent numbers `PREFIX-NNN`, monotonic, never recycled.
- One membership per class per account; duplicate assignment refused with the
  existing number.
- States `active` / `suspended` / `revoked`; revocation preserves issuance.
- Issuing account, timestamp, notes, and full state history recorded.
- Storage-level uniqueness, capacity, prefix, and padding constraints.

## 4. Entitlement architecture

`member_entitlements` is a ledger of `(account, capability, source)` rows.
Resolution unions four legitimate sources: active Founding Memberships, explicit
administrative grants, legacy Creator Studio entitlements, and the existing
account role.

Union semantics are implemented once (`mergeCapabilities`) and shared by every
consumer, so a new capability added to the Creator set reaches All-Access
without a second permission list being edited.

## 5. Founding All-Access is the union (proof)

`CAPABILITY_SETS = { creator: [creator], contributor: [contributor] }` and the
`FAA` class is declared as `[...CAPABILITY_SETS.creator, ...CAPABILITY_SETS.contributor]`.
The permanent suite asserts that the FAA capability list equals
`mergeCapabilities(FC, FCT)`, that All-Access holds every entitlement of both
groups, and that an FAA issuance writes exactly two capability rows (one per
capability) rather than a third permission implementation.

## 6. No last-role-wins (proof)

- Adding Contributor to Creator keeps Creator; adding Creator to Contributor
  keeps Contributor, in the model, in real assignments, and over HTTP.
- Both orderings are asserted in the permanent suite and in the API E2E suite.
- Revoking one source row leaves the other source row active and effective.
- The capability ledger cannot overwrite a row belonging to a different source:
  uniqueness is scoped by `(contributor, capability, source_type, source_id)`.

The remaining single-value `role` column is preserved deliberately for legacy
compatibility (directive §34) and now *contributes* capabilities instead of
deciding them.

## 7. Registry, numbering, limits, audit

See [the registry specification](../TPI-FOUNDING-MEMBERSHIP-REGISTRY.md) for the
full contract. Permanent tests prove: prefix, zero-padding, sequence behaviour,
uniqueness, duplicate refusal, non-recycling after suspension/revocation, the
50-issuance lifetime limit, and that `FC-051` cannot exist or be issued.

## 8. Administrative workflow

Canonical Administration Center → **Creators → Founding Memberships**:

1. Read class capacity, lifetime issuance, remaining numbers, next number, and
   exhaustion state.
2. Issue a membership to an existing registered account by username, choosing
   `FC`, `FCT`, or `FAA`; the server returns the issued number and the resulting
   capability set.
3. Resolve any account's real capability set, badge identity, memberships, and
   Creator Incentive eligibility.
4. Review the permanent registry including state and issuing administrator.

The legacy `admin-panel.html` section was also extended for operators who reach
it directly, but the canonical entry point is the React Administration Center.
Deep links (`/admin-panel#founding-memberships`) now open the intended view.

## 9. Security

Server-side only; see §"Implemented authorization" in
[007-SECURITY-AND-PERMISSIONS.md](../007-SECURITY-AND-PERMISSIONS.md). Negative
tests cover anonymous access, ordinary-member access, forged payloads,
cross-account mutation, duplicate numbers, duplicate class assignment,
Creator-only and Contributor-only capability boundaries, suspended membership,
and incentive enrolment of a Contributor-only account. Account isolation is
tested with five representative accounts.

## 10. Creator Incentive integration

`incentiveEligibility()` derives eligibility from capability + account state +
participation state. Enrollment through the API re-checks the Creator capability
server-side. Financial policy is surfaced as unresolved in every response that
mentions eligibility.

## 11. Future Nova contract (not built)

`describeCapabilities()` produces:

| Entitlement | Creator | Contributor | All-Access |
|---|---:|---:|---:|
| `studioFlowNovaEdit` | Yes | No | Yes |
| `novaEditDocuments` / `novaEditSlides` | Yes | No | Yes |
| `novaEditorialWorkspace` | No | Yes | Yes |
| `novaDocs` / `novaSlides` | No | Yes | Yes |
| `educationContentSubmission` | No | Yes | Yes |
| `educationCenterPublishing` | No | No | No |
| `creatorIncentives` | Yes | No | Yes |

`FEATURE_AVAILABILITY` is `false` for every Nova surface, so holding the
entitlement cannot expose an unfinished tool. No Nova UI, no rename of Notes, no
GenOffice integration, and no Education Center publishing change were made.

## 12. Testing

| Suite | Result |
|---|---|
| `npm run verify:creator-incentive` (model, registry, numbering, rollback) | **99/99 PASS** |
| Isolated API E2E (`scripts/e2e/api-e2e.sh`, includes the new membership block) | **282/282 PASS** |
| Browser acceptance (`verify:creator-incentive-browser`, Firefox DE + Chromium) | **22/22 PASS** |
| StudioFlow regressions / full certification | Run by the OPS-005 certification command; see §14 |

The membership suite is registered in `scripts/qa/run-qa.mjs`, so the maintained
quality gate and the OPS-005 certification execute it on every release.

Shared-infrastructure regressions: the Creator Studio gate and editorial gate
changed, so the existing authenticated API E2E suite (which exercises StudioFlow
production endpoints and contributor article routes) was run in full and passed.

## 13. Database

- New migration: `migrations/0058_founding_membership_entitlements.sql`
  (additive `CREATE TABLE IF NOT EXISTS` only; no `ALTER`, no drops).
- Applied **locally only** to `.local-dev/state/v3` and registered in
  `scripts/local-application-schema.mjs`.
- Tested against a clean disposable database (suite) and a full migration replay
  (isolated E2E worker).
- Production D1 was not touched. No production migration ran.

## 14. Browser acceptance

Firefox Developer Edition (authoritative, isolated disposable profile):
administrator sign-in, view reachability, deep link, class capacity, registry,
form issuance, duplicate refusal, capability inspection, badge identity,
unresolved-policy label, plus refusal of the registry, assignment, and admin HTML
for a Contributor-only member.

Chromium (compatibility smoke): identical rendering, identical refusals, no
console errors. Authorization outcomes did not differ between browsers.

## 15. Certification and source control

The release candidate is certified with the OPS-005 workflow
(`npm run release:certify`, the alias of `release:preflight`) against the
committed HEAD of `codex/tpi-development` after GitHub parity. The certification
receipt (release id, tier, gate results, manifest digest) is written to
`.local-dev/release-preflight.json` and reported to the owner in the directive's
final implementation report. `npm run release:production` was **not** run:
production deployment is a separate directive.

## 16. Remaining owner-policy decisions

1. **Creator Incentive financial policy** — amounts, payout values, thresholds,
   points, revenue percentages, reward schedules, approval requirements, payout
   frequency, earnings eligibility rules, accounting rules. All unresolved.
2. **Founding Membership transitions** — whether an `FC` holder who later
   receives `FAA` keeps, upgrades, or retires the earlier number is not defined.
   The data model preserves both permanently; no automatic transition is
   performed.
3. **Creator Incentive administration depth** — dashboards, approval workflow,
   and reporting beyond eligibility/participation require the financial rules to
   exist first.
4. **Badge artwork** — original master artwork was not modified, and no artwork
   exists in this repository. Presentation currently uses the recorded identity
   (label + colour); derivative asset generation is deferred.
5. **Broad feed/profile badge rollout** — the data and public-profile payload are
   implemented; a full community-surface redesign was intentionally out of scope.
