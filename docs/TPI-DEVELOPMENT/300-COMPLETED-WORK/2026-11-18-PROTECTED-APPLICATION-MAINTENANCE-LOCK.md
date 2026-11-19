# Protected Application Maintenance Lock — 2026-11-18

## Decision

StudioFlow and Nova Editorial Workspace are stable applications in maintenance
mode. They are not part of ordinary website iteration and must not be rebuilt,
re-staged, or reopened for full browser acceptance just because another site
surface changes.

## Guarded behavior

- Published StudioFlow bytes under `/studio/`, Nova bytes under `/nova/`, and
  Nova Editorial Workspace bytes under `/content-editor-nova/` remain protected
  by the immutable candidate hash guard.
- Website, profile, feed, notification, documentation, test, and release-record
  changes carry those approved bytes forward unchanged.
- The complete isolated QA harness skips its optional StudioFlow build under
  the lock while continuing shared Worker, authentication, API, and public
  surface checks.
- Direct StudioFlow/Nova changes or shared Worker/runtime changes under
  `functions/`, `lib/`, `worker.js`, or Wrangler configuration reopen the
  protected application checks automatically.

## Live verification

The guarded release preflight passed **20/20** recorded gates for source
commit `5cb78d002c4692b51f1de99ae940eed4d5a93523`. The lock was active during
certification: the isolated QA output explicitly reported that StudioFlow
workspace checks were skipped, and the protected application integrity guard
passed.

- Release ID: `rel-5cb78d002c46-17f52656cb12`
- Worker version: `f0538997-789a-4857-ad2d-0e1cc2cd359f`
- Live anonymous smoke: **10/10 PASS**
- Traffic: **100% on the new Worker version**
- Production upload: **one release metadata file only**; protected app bytes
  were unchanged
- Rollback version retained: `6c6738b2-d2e5-433a-abde-c08a52ed498f`

This release did not modify StudioFlow data, Nova documents, owner accounts,
member content, or browser storage.
