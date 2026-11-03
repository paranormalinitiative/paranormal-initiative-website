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

---

# Addendum 001A — Admin UI cleanup and test-registry isolation

Date: 2026-11-03. Status: **COMPLETE LOCALLY — READY FOR OWNER ACCEPTANCE — NOT
DEPLOYED.** Parent record above is preserved unchanged; this addendum records the
correction pass.

## 17. Owner finding

In the canonical Administration Center, the assignment form rendered the class
label and the native `<select>` inline:

`Founding Membership classFounding Creator (FC)`

The label ran directly into the control. The username field looked correct only
because `<Input>` is a block-level element; a bare `<select>` is inline-level and
inherited no form spacing.

## 18. Correction

The three assignment fields now use the application's existing `form-field`
pattern (label above control, 7px gap) and the select is rendered as a
full-width block control with the same height, border, radius, focus ring and
text colour as the adjacent text input. This is a layout correction, not a text
hack: no space characters were inserted into the label.

Browser acceptance measures the rendered geometry instead of trusting the
markup: the dropdown's top must be at least 4px below the label's bottom, its box
must fill the field, and the label-to-control gap must match the username and
administrative-note fields within 2px (Firefox and Chromium).

## 19. Review fixtures are local-only

The local review environment contains five intentional fixtures:

| Number | Account | Purpose |
|---|---|---|
| `FC-001` | `tpi_review_creator` | Founding Creator |
| `FCT-001` | `tpi_review_contributor` | Founding Contributor |
| `FAA-001` | `tpi_review_allaccess` | Founding All-Access |
| `FC-002` | `tpi_review_dual` | Dual access (FC + explicit Contributor grant) |
| `FC-003` | `tpi_review_ui_check` | Browser acceptance issuance check |

They are development/test data. They are not real TPI issuance, they are not
tracked by Git (`.local-dev` is untracked), and they exist only in the local D1
database at `.local-dev/state/v3`.

## 20. Isolation proof

- Migration `0058` seeds only the three class definitions. It contains no
  `INSERT` into `founding_memberships`, `member_entitlements`,
  `creator_incentive_participation`, or `contributors`, no review account name,
  and no `FC-001`/`FCT-001`/`FAA-001` assignment literal. The regression suite now
  asserts each of these against the migration text.
- The fixture driver (`npm run local:creator-incentive-review`) requires
  `--local-only`, a loopback review origin, the local-only Wrangler
  configuration, and a Worker that reports `localReviewData` before it creates
  any account. Each guard is fail-closed and unit-tested with production inputs.
- Production read-only verification (2026-11-03): Worker version
  `daa5aee1-304f-4e96-89a8-86aac2df98e9`; production D1 contains only the
  pre-existing `founding50_allocations` and `founding50_applications` tables;
  `member_entitlements`, `founding_memberships`,
  `founding_membership_classes`, `founding_membership_history` and
  `creator_incentive_participation` do not exist; `0058` is listed by Wrangler as
  a migration still to be applied. No production Founding number has been
  consumed.

## 21. Expected first production numbers

A clean production schema (classes seeded, no assignments) reports 50 left / 0
issued for each class, with next numbers `FC-001`, `FCT-001`, and `FAA-001`.
Local fixtures cannot reach it: they are not in a migration, not in the build
output, not in the release candidate, and not reachable through the guarded
driver. The Administration Center always computes capacity from the connected
registry, so counts are `50 left / 0 issued` at first launch and update as real
assignments occur — never hard-coded to empty.

## 22. Environment indicator

The registry response carries a server-decided `localReviewData` flag derived
from the Worker's own environment (`TPI_ENV=local` + `TPI_LOCAL_ONLY=1`).
Production cannot satisfy it, so production never renders the notice. In the
local review environment one notice appears above the class cards:

> **Local review data** — Development review fixtures — these memberships are
> not production memberships and do not consume or reserve any production
> Founding number.

## 23. Updated regression totals

| Suite | Before 001A | After 001A |
|---|---|---|
| Membership/registry/numbering/guard suite | 99 | **130** |
| Isolated API E2E | 282 | **285** |
| Firefox DE + Chromium acceptance | 22 | **28** |

No existing assertion was weakened or removed. New assertions cover the clean
production-shaped registry, the migration audit, the fixture-driver guards, the
review-data flag, the rendered field geometry, and the indicator.

## 24. Certification

The previous certification was invalidated by the application change. The
current candidate was recertified with `npm run release:certify`. Receipt values
are reported to the owner in the 001A implementation report and stored in
`.local-dev/release-preflight.json`. `npm run release:production` was **not**
run.

## 25. Unchanged

Entitlement architecture (cumulative capabilities, All-Access union, permanent
numbering, non-recycling, 50-per-class limits, audit history, server-side
authorization, Nova hooks) is untouched. Creator Incentive financial policy
remains **UNRESOLVED — OWNER DECISION REQUIRED**.

## 26. Official badge artwork imported

The three owner-supplied master badges were imported byte-for-byte into
`assets/founding-memberships/masters/` on 2026-11-03:

| Class | Master file | Badge identity |
|---|---|---|
| `FC` | `FoundingCreatorBadgeMaster.png` | Founding Creator |
| `FCT` | `FoundingContributorBadgeMaster.png` | Founding Contributor |
| `FAA` | `FoundingAllAcceessBadgeMaster.png` | Founding All-Access |

The original spelling `FoundingAllAcceessBadgeMaster.png` is preserved; the
owner's master file was neither renamed nor re-encoded. SHA-256 digests, the
class mapping, and the reproduction recipe for web derivatives (`512`, `256`,
`128` PNG and `512`/`256` WebP under `assets/founding-memberships/web/`) are
recorded in `assets/founding-memberships/README.md`.

Badges remain presentation only. `primaryBadge()` derives identity from the
assigned class code, the API returns badge metadata from resolved membership
rows, and no image or DOM change can grant a capability. Community display
surfaces are not implemented yet (see 27).

## 27. Permanent roadmap items recorded

Two requirements are now recorded as future work and must stay visible in the
development roadmap until completed:

1. **TPI Administration Center — Complete Quality & Functional Audit.** The
   Administration Center is becoming a critical operational system (community,
   Creator, Contributor, Founding Membership, incentive, permission, moderation,
   publishing, Nova, Education Center administration). A dedicated Admin Panel
   directive must verify every navigation item, form, control, server-side
   authorization path, account isolation boundary, responsive layout, Firefox
   Developer Edition and Chrome behavior, visual consistency, accessibility,
   error handling, loading/empty states, confirmation behavior, audit behavior,
   deep links, refresh persistence, data integrity, and production safety, to
   the standard "complete, consistent, secure, and flawless for normal
   administrative use." It was **not** attempted under 001A.
2. **Founding Membership Badge Integration & Community Display.** Master
   artwork is imported and web derivatives exist; the member profile, feed/member
   identity, Administration Center, and membership display surfaces must be
   implemented and verified before the Founding Membership experience is
   considered completely finished.

## 28. 001A scope boundary

001A delivered the field-spacing correction, the review-registry isolation
proof, and the badge asset import with documentation. It did not implement
community badge surfaces and did not perform the Administration Center audit;
both remain roadmap items recorded above. Production was not deployed.
