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

## Current role policy

Future Owner, Assistant Administrator, and Moderator roles remain planning items. TPI-DEV-001 does not change role assignments or permissions.
