# TPI-STUDIOFLOW-131 — Final Studio Deletion

Date: 2026-11-01  
Environment: authoritative local Worker, `http://127.0.0.1:8787/studio/`  
Browser: Mozilla Firefox Developer Edition 160.0b3  
Production: **UNCHANGED; no deployment authorized**

## Result

**PARTIAL — final active-Studio deletion, zero-Studio persistence, and Studio recreation passed in real Firefox.** The exact combined final-archived-Studio browser workflow was not repeated because the owner authorization was limited to the disposable `TPI-131 Final Manual Studio`; the maintained archived-deletion regression passed independently.

## Root cause

The Worker purge path did not impose a minimum-Studio rule. The failure was in the React catalog reconciliation after a successful purge: `deleteStudio` rebuilt `studioCatalog` from the stale `broadcasts` closure. During the final-Studio transition, that stale host record could be reintroduced into the catalog while the bridge was already converging to an empty authoritative workspace list. The result was a stale Studio card or invalid active selection rather than a stable zero-Studio home state.

## Correction

The isolated source correction changes the post-delete reconciliation from:

```ts
setStudioCatalog(readStudioEntries(broadcasts));
```

to:

```ts
setStudioCatalog(readStudioEntries());
```

The bridge is authoritative after a purge, so the zero-Studio state is read from the refreshed workspace bridge with no stale React fallback. Existing ownership, exact-name confirmation, inventory, optimistic-version, recording/livestream, shared-media, and deletion-mode safeguards were not changed. No default Studio is created.

## Firefox acceptance

The workflow was exercised manually in an isolated Firefox Private Browsing window using two fresh local-only QA accounts. The owner Firefox profile and owner Studios were not used.

| Scenario | Result |
|---|---|
| Fresh disposable account starts with no Studios | PASS — `No Studios yet` rendered |
| Create two disposable Studios | PASS |
| Delete one while another remains | PASS — the remaining Studio stayed visible |
| Exact-name confirmation and button label | PASS — `Delete Studio Permanently`; button enabled only after exact name |
| Final active Studio inventory | PASS — zero livestreams, recording sessions, webinars, scheduled productions, saved recordings, and stored media |
| Delete final active Studio through Firefox UI | PASS |
| Empty My Studios state after deletion | PASS — `No Studios yet` and create explanation rendered |
| Refresh after final deletion | PASS — deleted Studio did not reappear |
| Automatic Studio recreation | PASS — no replacement appeared |
| Create and open a new Studio after zero state | PASS — `TPI-131 Recreated` opened in StudioFlow |
| Final archived Studio through this exact manual flow | UNVERIFIED — separate destructive browser action not authorized |
| Archived eligible deletion regression | PASS — maintained 088 suite covered archived restore/delete |

The visible Firefox evidence was captured in the CUA browser session. The final post-recreation screenshot showed `TPI-131 Recreated` open in StudioFlow; the zero-state and deletion states were observed directly in the preceding Firefox accessibility-rendered UI. No permanent screenshot file was available from the native CUA session, so no screenshot path is claimed.

## Regression and build results

| Check | Result |
|---|---|
| `verify:studioflow-088-studio-deletion` | PASS — 32/32 |
| `verify:studioflow-089-deletion-safety` | PASS — 26/26 |
| `verify:local-auth-lifecycle` | PASS — 64/64; local administrator restart/build/login/browser lifecycle |
| `verify:release-safety` | PASS — 21/21 |
| Authoritative staging `--verify-only` | PASS — clean detached build, generated assets match staged candidate |
| Reproducible build | PASS — two clean builds match |
| Existing Studio lifecycle harness | UNVERIFIED — this macOS Selenium invocation emitted no completion JSON; no result is claimed |
| Existing TPI-130 button harness | UNVERIFIED — same Selenium runner completion issue; focused button behavior was manually verified in Firefox |

Staging evidence:

- Source commit: `fb95c43ce79dd0dfcf3f880eb34555d746c5c8ce`
- Integrated entrypoint SHA-256: `ba80f8b040b6411b8d46cf1908a04a7a4a657834e479197d81c6d07508d79c64`
- JavaScript: `studio/assets/index-B_8Inyh0.js` — `e250a5e41376be2861c1fe0747165a189da193ca2f180c596d49b19750fd1abe`
- CSS: `studio/assets/index-C_oD8YSH.css` — `5bdc30cfd0945a8978cfff024af30af71886de0be8b13875b1abed3147f62040`
- No obsolete JavaScript or CSS bundle references were found.

## Files changed

Website repository:

- `studio/index.html` — points the local Worker at the verified JavaScript artifact.
- `studio/assets/index-B_8Inyh0.js` — compiled artifact from the isolated source commit.
- `scripts/studioflow-release-baseline.json` — records the 131 source identity and hashes.
- `scripts/verify/tpi-studioflow-131-final-studio.mjs` — isolated disposable final-Studio harness; supports read-only inventory inspection and explicit test-account credential files.
- This execution record.

Source repository:

- `src/App.tsx` in the isolated reproducible source commit above, with the one-line authoritative-catalog correction.
- The canonical `/Users/toddknipple/Documents/StudioFlow/web` checkout remains dirty with pre-existing unrelated `src/App.tsx` and `src/styles.css` changes; it was not reset, cleaned, or overwritten.

No database migration, API authorization change, storage cleanup, or production data change was made.

## Data and production safety

- Test accounts and Studios were local-only synthetic records.
- The authorized deletion inventory showed no recordings, media, productions, or scheduled activity for the deleted final Studio.
- No real creator Studio, recording, Note, script, scene, shared media object, or account was targeted.
- Production deployment was not attempted; production remains unchanged.
- The previously authorized `flame.html` cleanup remains the only unrelated file cleanup; no other untracked files were deleted.

## Remaining limitation

The combined “last Studio is archived, then delete it through the Firefox UI” case remains unverified in this run because the owner’s deletion authorization was exclusive to the named disposable `TPI-131 Final Manual Studio`. The server/maintained regression covers archived eligible deletion, and the real Firefox run covers the last active Studio plus zero-state refresh/recreation. A separate disposable archived-final browser action can close this remaining verification gap.
