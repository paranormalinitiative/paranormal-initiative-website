# TPI-STUDIOFLOW-102 — Resolve cross-tab recording deletion safety

Date: 2026-10-26. Result: **BLOCKED**. No production deployment authorized or performed.

## Owner scope

Resolve the ownership race on the isolated Directive 100 branches without redesigning browser-local recordings or importing 091/092. Coordinate all ownership writers, protect against uncoordinated older tabs, revalidate at deletion, preserve atomic cleanup and reload-safe scope/retry evidence. Remove Directive 101's block only after verification. Stop if reliable coordination cannot be established without changing storage architecture; retain fail-closed behavior and do not invent browser guarantees.

## Baseline and changes

- Source: `codex/studioflow-100-deletion-isolation`, unchanged clean commit `0a10451997e19a09ef2aae94bb9b25395603bfac`.
- Website starting checkpoint: `71ac06ba0755d5e91ae97a4d30b2267230d0e426` on `codex/studioflow-100-deletion-server`.
- Added `scripts/verify/tpi-studioflow-102-local-boundary.mjs` and updated this directive, index, status, and handoff. Website result commit is the commit introducing this file (`git log -1 --format=%H -- docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-STUDIOFLOW-102-CROSS-TAB-RECORDING-DELETION-SAFETY.md`).
- No source implementation changes, server changes, generated website assets, push, merge or deployment. Original development trees were not edited. 091/092 worktrees and changes were not imported.

## Ownership-writer inventory and stop condition

The isolated App's library persistence effect writes the whole library array. Recording completion callbacks (Program and Backstage), checkpoint recovery, preview hydration, library removal, and Studio deletion update library state. Recording/blob writes and removal run independently of that localStorage effect. Workspace bridge `write`, `applyState`/`hydrateWorkspace`, local snapshot persistence, cache refresh, restore/import and switching update reference-bearing configuration and cached workspace state.

Adding a common Web Lock to all current paths could serialize cooperating code, but **cannot constrain an already-running older tab**. Existing metadata remains in localStorage and blobs in IndexedDB. localStorage offers no transaction that spans both stores. Web Locks are cooperative; a heartbeat or BroadcastChannel acknowledgement cannot prove there are no suspended/unresponsive legacy tabs. A service-worker client inventory would neither cover uncontrolled old tabs nor revoke their storage access. An IndexedDB versionchange handshake does not revoke localStorage access or prevent old code reopening its database.

Real Firefox reproduced a second tab writing ownership metadata while the first held an exclusive lock. Thus current writer coordination alone cannot satisfy mandatory older-tab protection. No speculative coordination protocol was added, and the existing content-deletion refusal remains intact before server/local mutation. **All-writer coordination is NOT implemented; content deletion is NOT restored.** This is the directive's explicit stop condition, not a claim that the race was repaired.

## Executed verification

Command from isolated website:

```sh
node scripts/verify/tpi-studioflow-102-local-boundary.mjs ../source-100
```

The test transpiles the exact source safety module using existing TypeScript, serves it from an ephemeral loopback-only HTTP fixture, and runs headless Firefox Developer Edition through existing Selenium/geckodriver. WebDriver creates an isolated disposable profile. No credentials, owner Studios, production API or recordings are used. No screenshot or visual review was performed.

**8/8 PASS:**

1. Uncoordinated second tab writes localStorage while the first holds exclusive Web Lock (unsafe boundary reproduced).
2. First tab observes the new shared reference and classifies it as protected.
3. Candidate coordinator refuses destructive action with available browser locks.
4. Real IndexedDB explicit transaction abort rolls back both queued removals.
5. Injected actual IndexedDB transaction abort records an incomplete server-complete retry journal and retains blob.
6. Browser refresh retains scope/candidate/retry evidence.
7. Changed retry mode fails after refresh.
8. Same-scope helper retry skips server and preserves unrelated blob; original candidate list remains pinned despite a larger supplied retry list.

These tests exercise the actual ownership/helper/coordinator module and real browser storage. They do not exercise the App's IndexedDB adapter or full Studio dialog. Helper retry is deliberately tested independently of the application coordinator; it must not be used to bypass that coordinator.

Other required checks rerun:

- Existing local suite: **22/22 PASS** (`node scripts/check-local-recording-deletion.mjs`).
- TypeScript: **PASS** (`./node_modules/.bin/tsc --noEmit`).
- Production build: **PASS** (`npm run build`), existing chunk-size warning only.
- 093 purge-safety regression: **PASS**, actual handler in VM with mocked storage/auth dependencies; no server code changed.
- New script syntax and diff whitespace: **PASS**.

## Unverified requirements

Not run as end-to-end scenarios: two fully participating application tabs, concurrent recording completion, workspace switching during cleanup, actual reload mid-in-flight App cleanup, full dialog studio-only/contents flows, and full application post-interruption recovery. The stop condition prevents enabling the unsafe destructive application path just to test it. Existing unit fixtures cover shared/missing/duplicate ownership, modes, stale metadata and unrelated recordings, but are not substitutes for those acceptance scenarios. No new source commit exists because no source repair could safely satisfy the stated constraints.

## Next action

Keep content cleanup blocked. An explicitly reviewed compatibility transition is needed before enabling physical blob deletion: establish authoritative transactionally coordinated references for all writers while retaining browser-local blobs, and define how legacy references/tabs are protected. That would alter the current metadata coordination architecture and requires a separately scoped decision; no server recording storage is necessary or proposed. Alternatively retain legacy blobs permanently and scope any future deletion to a demonstrably isolated post-transition generation. Do not assume a user warning or closing visible tabs establishes absence of stale tabs.

Status: verification evidence added; implementation incomplete; safety not verified; NOT DEPLOYED; NOT OWNER ACCEPTED.
