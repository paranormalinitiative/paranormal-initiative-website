# TPI-DEV-026 — Production Release Checklist

This checklist is a plan only. No production release steps were executed.

## Pre-release

- [ ] Owner visual acceptance complete for member, Events, Administration Center,
  and StudioFlow surfaces.
- [ ] Browser workspace backup/import verified.
- [ ] Browser session-restart recording recovery verified.
- [ ] RealtimeKit decision recorded and any controlled test completed or deferred.
- [ ] Development D1 migration ledger reconciled.
- [ ] Production-compatible migration sequence reviewed.
- [ ] Configuration, bindings, environment variables, and secrets reviewed.
- [ ] Approved external backup prepared outside Cloudflare.
- [ ] Rollback source, migration, and data plan rehearsed.

## Release authorization

- [ ] Owner explicitly authorizes production release.
- [ ] Exact source commit and production target independently verified.
- [ ] Migration order approved.
- [ ] Production deployment guard passes.
- [ ] No unrelated worktree files are included.

## Post-release verification

- [ ] Authentication and member sessions.
- [ ] Member Home and Community Feed.
- [ ] Messaging and notifications.
- [ ] Events.
- [ ] StudioFlow and creator entitlements.
- [ ] Media and search.
- [ ] Existing D1 records and R2 objects.
- [ ] Creator applications, memberships, audit history, and Founding 50 gate.
- [ ] Rollback decision window remains open until verification is complete.
