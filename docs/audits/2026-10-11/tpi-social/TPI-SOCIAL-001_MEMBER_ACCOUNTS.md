# Member Accounts

## Findings

Session lookup joins `sessions` to active `contributors`; protected member,
contributor, admin, Messenger, notification, settings, and StudioFlow routes
use server-side guards. The local suite verifies anonymous denial for protected
routes, token identity, inactive/unauthorized behavior, and member action gates.

Status: **PASS locally**. Password-reset, registration abuse controls, and
physical browser cookie behavior were not independently exercised in this audit.
Production read-only `/api/notifications` returned 401; no account mutation was
performed against production.
