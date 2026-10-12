# Security and Permissions

## Current boundary

The existing Worker and production domain remain protected. The audit did not request credentials, cookies, or tokens and did not bypass authentication. Anonymous authenticated-feature acceptance is therefore not claimed.

Because the current workers.dev target maps to the same configured Worker and stateful bindings, development authentication cannot yet be considered independent. Treat session validation, cookies, APIs, and administrative permissions as production-sensitive until a separate environment is configured.

## Required checks for an isolated environment

- Separate cookie/session namespace and authentication configuration.
- Server-side authorization on every administrative API.
- Protected preview assets and direct URLs.
- No stream keys, private recordings, private messages, or tokens in logs or client payloads.
- Synthetic test accounts and fixtures.
- Explicit owner approval before granting new permissions or implementing new administrative roles.

Development authentication uses the separate development D1 session store, host-scoped `tpi_session` cookies without a Domain attribute, and development-only `tpi-dev-owner` / `tpi-dev-member` accounts. The current auth implementation uses random database-backed session tokens rather than a signing secret. Production credentials, cookies, private member data, and secrets were not copied into development. The development config has no Resend secrets and sets `TPI_DISABLE_OUTBOUND=1`.

Runtime checks passed: anonymous Admin Center access returned 403; the development owner logged in and received Admin Center/API access; the ordinary development member logged in but remained denied from Admin Center; `.dev.vars` and temporary deployment config probes returned 404.

## Current role policy

Future Owner, Assistant Administrator, and Moderator roles remain planning items. TPI-DEV-001 does not change role assignments or permissions.
