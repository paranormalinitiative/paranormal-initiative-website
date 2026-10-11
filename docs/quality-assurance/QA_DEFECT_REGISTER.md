# QA Defect Register

## Resolved in TPI-QA-001 bootstrap

| Item | Cause | Resolution | Verification |
|---|---|---|---|
| Contributor article list expectation | Existing E2E expected `200` for an ordinary member, while the endpoint correctly requires contributor authorization | Updated expected result to `403` and clarified the assertion name | Full local suite 152/0 |
| Notification unread count assertions | Harness read `count`; API returns `unreadCount` | Updated all affected assertions to use `unreadCount` | Full local suite 152/0 |
| External scraper refresh in default regression | Live provider calls could hang and made the default suite nondeterministic | Made live scraper checks opt-in via `TPI_E2E_LIVE_SCRAPERS=1` | Default suite completes locally; opt-in remains separate |

## Open / not defects until reproduced

- Actual StudioFlow media transport, physical-device behavior, and external-provider output lack a reusable automated lab.
- Existing StudioFlow build chunk-size warning is recorded as a performance follow-up, not a release failure.
- Long-duration recording and native folder-picker behavior remain owner/device verification items.
