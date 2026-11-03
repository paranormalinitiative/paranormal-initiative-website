# TPI-CREATOR-INCENTIVE-001 — Acceptance evidence

Date: 2026-11-02, addendum 001A 2026-11-03. Environment: isolated local Worker
(`workerd`) on `http://127.0.0.1:8787`, local D1 at `.local-dev/state/v3`.
Production was not contacted for any write.

## Automated suites

| Suite | Command | Result |
|---|---|---|
| Entitlement model, registry, numbering, rollback, isolation guards | `npm run verify:creator-incentive` | **130 / 130 PASS** |
| Isolated API E2E (whole suite, incl. membership matrix) | `TPI_E2E_ISOLATED=1 bash scripts/e2e/api-e2e.sh` | **285 / 285 PASS** |
| Admin workflow browser acceptance | `npm run verify:creator-incentive-browser` | **28 / 28 PASS** |

Parent implementation totals were 99 / 282 / 22; 001A added assertions without
weakening any existing one.

## Browser acceptance detail

Firefox Developer Edition (authoritative; isolated disposable profile created for
the run, removed afterwards):

- local administrator sign-in
- reciprocal reachability of the canonical Administration Center view
- `/admin-panel#founding-memberships` deep link opens the view directly
- all three class ranges render (`FC-001`–`FC-050`, `FCT-001`–`FCT-050`,
  `FAA-001`–`FAA-050`)
- lifetime issuance and remaining capacity render
- permanent registry lists real issued numbers
- the **Local review data** notice renders with the "not production
  memberships" explanation
- the class label sits above the dropdown (rendered geometry: ≥4px clearance,
  block-level control), the dropdown fills its field, and its label-to-control
  gap matches the username and administrative-note fields within 2px
- form issuance produces a permanent number, or refuses a repeat submission and
  reports the existing number
- registry refreshes with the issued account
- capability inspection reports Contributor capability without Creator, the
  correct badge identity, and Creator Incentive ineligibility for
  Contributor-only
- the unresolved financial-policy label is visible
- a Contributor-only member is refused the registry (`403`), the assignment
  endpoint (`403`), and the Administration Center HTML (`403`)

Chromium (compatibility smoke): same rendering, same geometry result, same
restructured notice, same refusals, duplicate issuance refused with the existing
number, capability inspection identical, zero console errors. Authorization
outcomes did not differ between browsers.

Screenshots: `firefox-founding-memberships.png`,
`chromium-founding-memberships.png`, `chromium-review-indicator.png`.

## Registry isolation evidence

- `migrations/0058_founding_membership_entitlements.sql` inserts only the three
  class definitions. The suite asserts it contains no insert into
  `founding_memberships`, `member_entitlements`,
  `creator_incentive_participation`, or `contributors`, no `tpi_review_` account
  name, and no `FC-001`/`FCT-001`/`FAA-001` literal.
- A disposable database with the schema and no assignments reports 50 left / 0
  issued for FC, FCT, and FAA, with next numbers `FC-001`, `FCT-001`, `FAA-001`.
- `scripts/lib/local-review-guard.mjs` refuses a production origin, a
  non-loopback host, the retired port 5192, a production Wrangler configuration,
  a missing `--local-only` flag, and a Worker that does not report
  `localReviewData`.
- `git ls-files .local-dev` is empty.

Production read-only verification, 2026-11-03:

| Check | Command | Result |
|---|---|---|
| Worker version | `wrangler deployments status --name theparanormalinitiative` | `daa5aee1-304f-4e96-89a8-86aac2df98e9` (unchanged) |
| Membership tables in production | `wrangler d1 execute tpi_contributor_portal --remote` | only `founding50_allocations`, `founding50_applications` |
| Migration 0058 state | `wrangler d1 migrations list --remote` | listed as still to be applied |

No production Founding number has been consumed.

## Owner review accounts

Prepared by `npm run local:creator-incentive-review`:

| Number | Account | Capabilities | Badge |
|---|---|---|---|
| `FC-001` | `tpi_review_creator` | creator | Founding Creator |
| `FCT-001` | `tpi_review_contributor` | contributor | Founding Contributor |
| `FAA-001` | `tpi_review_allaccess` | contributor + creator | Founding All-Access |
| `FC-002` | `tpi_review_dual` | contributor + creator (dual access) | Founding Creator |
| `FC-003` | `tpi_review_ui_check` | creator | Founding Creator |
| — | `local_member` | none (ordinary control) | none |

Passwords are stored only in the gitignored
`.local-dev/creator-incentive-review.json` (mode 600) and are never printed.

## Not performed (intentional)

- Production migration and production deployment (separate directive required).
- Nova UI, Nova Edit, Nova Editorial Workspace, Education Center publishing.
- StudioFlow behavior changes.
- Badge master artwork changes.
