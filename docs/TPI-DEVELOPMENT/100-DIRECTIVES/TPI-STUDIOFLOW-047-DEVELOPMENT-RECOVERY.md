# TPI-STUDIOFLOW-047 — Development Recovery and Release Readiness

## Scope

Local-only recovery and integration review after the owner cleared Opera browser
data. No production endpoint, production database, deployment, commit, or push
is authorized by this record.

## Required safety posture

- Crossroads of the Unknown remains protected at workspace
  `43b20614-69da-4d82-af9d-063cace4b6cc`.
- Its broadcast identity remains
  `studio-0ec3848f-5500-462c-a1da-f711d3148d49`.
- Browser-local media and recordings are not assumed recoverable after browser
  data cleanup.
- Existing D1 data is inspected read-only; no backup is restored automatically.

## Integration targets

1. Verify the local Worker, room server, gateway, LaunchAgent, and asset watcher.
2. Verify source → generated asset → staged asset delivery using deterministic
   SHA-256 versions.
3. Remove the visible Room Bridge status card from the main backstage row while
   retaining the status summary in the existing People/diagnostics panel.
4. Re-run guest waiting-room, admission, removal, audio-routing, and StudioFlow
   regression checks.
5. Reconcile current local implementation and limitations for a future,
   separately authorized production release.

## Release boundary

Local readiness is not production readiness. A production release requires a
separate approval, authenticated production acceptance, HTTPS/WebRTC validation,
production room signaling verification, and an explicit deployment decision.
