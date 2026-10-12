# Security review

PASS for the isolated preview boundary, with owner acceptance still required
before any production replacement decision.

- Entry path and every preview asset are gated in `worker.js`.
- Admin APIs continue to use `requireAdmin`/`requireOwner`.
- Existing `tpi_session` and `getSessionUser` are reused.
- No client-only hidden-button or CSS gate is used.
- No stream keys, recordings, message bodies, R2 objects, or provider secrets
  are loaded by the preview dashboard.
- `/studio` and public `/live-video` behavior is untouched.
- Source files and node modules are excluded from Cloudflare asset publishing.
- Member activity remains behind the current admin endpoint.

Required follow-up: test anonymous, ordinary-member, admin, and owner sessions
against a deployed protected preview before owner acceptance.
