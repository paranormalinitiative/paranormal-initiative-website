# TPI-DEV-025 — Creator Entitlement Verification

## Development fixture

The existing development entitlement register contained active synthetic
member-role creator fixtures `tpi-dev014-filler-02` through `-49`. DEV-025 used
`tpi-dev014-filler-02` as Creator A and `-03` as Creator B. Their credentials
were derived at runtime from the existing DEV-014 fixture mechanism; no
credential values were committed or printed, and no entitlement or Founding 50
mutation was performed.

## Results

| Check | Result |
| --- | --- |
| Active entitlement / server-derived Studio access | PASSED |
| Creator role remains member, not admin | PASSED |
| `/studio/` access | PASSED, HTTP 200 |
| Administration Center separation | PASSED, HTTP 403 |
| Ordinary member Studio denial | PASSED, HTTP 403 |
| Revoked creator Studio denial | PASSED, HTTP 403 |
| Creator A/B private workspace isolation | PASSED, HTTP 404 cross-account |
| Founding 50 activation gate | PASSED, HTTP 423 |

The existing DEV-014 role matrix also passed 57/57 after the change. Creator
Studio access does not grant Administration Center access.
