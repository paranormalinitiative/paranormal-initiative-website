# TPI-STUDIOFLOW-034 — Automatic Server Startup and Local Runtime Reliability

Status: **CONDITIONALLY COMPLETE / LOCAL STARTUP AND RECOVERY VERIFIED**

## Findings

The existing architecture was a user-level macOS LaunchAgent named
`com.tpi.local-development`. It was installed with `RunAtLoad=true`,
`KeepAlive=true`, a valid repository working directory, and local-only
environment variables. The service process tree was verified as:

`launchd → local-dev-service.mjs → local-dev.mjs → Wrangler → workerd`

The original registration was present, but two reliability gaps were found:

1. The generated plist used the versioned Homebrew Cellar Node path. A normal
   Node upgrade could leave the LaunchAgent pointing at a nonexistent binary.
2. The launcher watched only the Wrangler parent. If `workerd` lost port 8787
   while Wrangler remained alive, launchd saw no process exit and could not
   recover the Worker.

The `install` command also had a launchd unload/bootstrap race: it attempted to
bootstrap immediately after `bootout` without waiting for the prior job to
finish unloading. This produced a transient macOS error 5 during verification.

## Corrections

- LaunchAgent generation now prefers the stable `/opt/homebrew/bin/node`
  symlink, with safe fallback paths.
- `scripts/local-dev.mjs` now has a bounded readiness watchdog. It allows a
  30-second cold start, then exits the launcher if port 8787 never becomes
  reachable. After readiness is observed, loss of the port exits the launcher
  so the existing LaunchAgent `KeepAlive` policy restarts the complete Worker.
- LaunchAgent installation now waits for a previous registration to unload
  before bootstrapping the same label.
- No production authentication or access checks were weakened.

## Access-gate findings

Host-level loopback checks reached the Worker successfully. Anonymous
`GET /studio/` requests returned the intended local Creator Studio `403`
access boundary; this is not a Worker startup failure. The route requires a
valid local session and the existing `hasCreatorStudioAccess` check. No bypass
was added.

Opera's existing owner tab continued to display a browser error document even
after the host Worker was healthy and after a tab-only refresh. The available
Opera automation therefore could not verify an authenticated owner session or
Studio UI state. No browser storage, cookies, IndexedDB, Studio, or media data
was changed.

## Verification

- LaunchAgent plist validated with `plutil`.
- LaunchAgent loaded and running under the GUI user domain.
- Stable Node path present in the installed plist.
- Worker listening on `127.0.0.1:8787`.
- Readiness check passed.
- Controlled 8787-only Worker termination caused the watchdog to exit and
  launchd to restart the service; a new Worker then listened on 8787.
- Ports 8788 and 8789 were not restarted or modified. They were not listening
  during this verification and remain a separate follow-up runtime condition.
- The focused startup suite passed 10/10.
- StudioFlow regression suites passed 129/129 across TPI-017, 023, 024 Phase 2,
  025, 027, 030, 031, 032, and 033.
- JavaScript syntax checks and `git diff --check` passed.

## Owner check

Use the repository terminal command below to inspect the service without
changing it:

```sh
TPI_LOCAL_OWNER_CONTROL=1 node scripts/local-dev-service.mjs status
TPI_LOCAL_OWNER_CONTROL=1 node scripts/local-dev-service.mjs wait
```

The expected result is a loaded LaunchAgent and a ready Worker on port 8787.
No reboot or logout test was performed; login-time behavior remains inferred
from the validated `RunAtLoad` LaunchAgent configuration.
