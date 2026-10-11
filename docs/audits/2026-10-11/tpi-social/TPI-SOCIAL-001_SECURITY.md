# Security

## Verified

- session/member/admin role gates in local API tests;
- conversation membership for message routes;
- owner/admin checks for content mutations;
- private-library R2 owner metadata gate;
- repaired Messenger attachment participant gate;
- production anonymous notification denial and `/studio/index.html` 403;
- no production data/R2 mutation during audit.

## Limitations

Authenticated production penetration testing, browser cache behavior, upload
content scanning, and external provider credential handling were not performed.
