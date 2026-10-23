# StudioFlow Release Runtime Readiness Repair

Date: 2026-10-22

## Finding

The managed local Worker can report a listening process before the homepage
and `/studio/` surface are ready. The release workflow then treated a single
local authentication check during that startup window as a release failure.

## Repair

- The release runner now waits for both the local homepage and StudioFlow
  surface after managed restarts and builds.
- Local authentication checks retry up to three times with bounded backoff.
- Production deployment and application behavior are unchanged.

## Safety

The workflow still requires a clean exact commit, complete QA, guarded
Wrangler deployment, live acceptance, and automatic rollback on genuine
production failure.
