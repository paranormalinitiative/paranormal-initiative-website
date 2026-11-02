# TPI-CREATOR-INCENTIVE-001 — Acceptance evidence

Date: 2026-11-02. Environment: isolated local Worker (`workerd`) on
`http://127.0.0.1:8787`, local D1 at `.local-dev/state/v3`. Production was not
contacted for any write.

## Automated suites

| Suite | Command | Result |
|---|---|---|
| Entitlement model, registry, numbering, rollback | `npm run verify:creator-incentive` | **99 / 99 PASS** |
| Isolated API E2E (whole suite, incl. membership matrix) | `TPI_E2E_ISOLATED=1 bash scripts/e2e/api-e2e.sh` | **282 / 282 PASS** |
| Admin workflow browser acceptance | `npm run verify:creator-incentive-browser` | **22 / 22 PASS** |

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
- form issuance produces a permanent number, or refuses a repeat submission and
  reports the existing number
- registry refreshes with the issued account
- capability inspection reports Contributor capability without Creator, the
  correct badge identity, and Creator Incentive ineligibility for
  Contributor-only
- the unresolved financial-policy label is visible
- a Contributor-only member is refused the registry (`403`), the assignment
  endpoint (`403`), and the Administration Center HTML (`403`)

Chromium (compatibility smoke): same rendering, same refusals, duplicate
issuance refused with the existing number, capability inspection identical, zero
console errors. Authorization outcomes did not differ between browsers.

Screenshots: `firefox-founding-memberships.png`,
`chromium-founding-memberships.png`.

## Owner review accounts

Prepared by `npm run local:creator-incentive-review`:

| Number | Account | Capabilities | Badge |
|---|---|---|---|
| `FC-001` | `tpi_review_creator` | creator | Founding Creator |
| `FCT-001` | `tpi_review_contributor` | contributor | Founding Contributor |
| `FAA-001` | `tpi_review_allaccess` | contributor + creator | Founding All-Access |
| `FC-002` | `tpi_review_dual` | contributor + creator (dual access) | Founding Creator |
| — | `local_member` | none (ordinary control) | none |

Passwords are stored only in the gitignored
`.local-dev/creator-incentive-review.json` (mode 600) and are never printed.

## Not performed (intentional)

- Production migration and production deployment (separate directive required).
- Nova UI, Nova Edit, Nova Editorial Workspace, Education Center publishing.
- StudioFlow behavior changes.
- Badge master artwork changes.
