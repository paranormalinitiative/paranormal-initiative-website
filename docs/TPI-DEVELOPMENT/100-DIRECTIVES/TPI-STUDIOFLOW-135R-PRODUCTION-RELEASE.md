# TPI-STUDIOFLOW-135R — Authorized Production Release

Directive: TPI-STUDIOFLOW-135R (authorized production release of the
TPI-STUDIOFLOW-135 Scene production item persistence correction).
Release date: 2026-11-02.
Authorization: approved by the project owner.
Deployed at: **2026-11-02T01:14:50Z**.

## 1. Result

`TPI_PRODUCTION_DEPLOY=approved npm run release:production` finished
**DEPLOYED_AND_VERIFIED** with exit 0. The new Worker version is
**`3082475b-80ad-4557-82d6-32618e3f7079`**, receiving 100% of production
traffic. The rollback target is the previously active
**`4de115db-6537-41b5-9bf7-ae99cb0e20fc`**, which remains available.

Inside the guarded command: anonymous production smoke **10/10**, isolated
authenticated Firefox Developer Edition acceptance **64/64**, TPI-133 **44/44**,
TPI-134 **43/43**, TPI-135 **30/30**, Studio management, ownership, deletion and
deletion safety, authoritative staging verification and the guarded Wrangler dry
run all passed.

The release did not delete, recreate, reset or rewrite a Studio, D1 record, R2
object, membership, credential or browser-local Studio. Crossroads of the
Unknown was never opened by the release or by any verification run.

## 2. Released identity

| Item | Value |
| --- | --- |
| Branch | `codex/tpi-development` |
| Released website commit | `44c707f` (parity with `origin`, clean tree) |
| Approved source commit | `f44f3a08cfc0efa271385125c6780557aaa85fb9` (unchanged) |
| JavaScript | `studio/assets/index-D9yljEwa.js`, SHA-256 `e317fc07…` |
| CSS | `studio/assets/index-D6ZhUVW1.css`, SHA-256 `1baa338c…` |
| Previous Worker | `4de115db-6537-41b5-9bf7-ae99cb0e20fc` |
| New Worker | `3082475b-80ad-4557-82d6-32618e3f7079` |

The React bundle and stylesheet were not modified by TPI-135, so the released
asset identity is byte-identical to the owner-accepted TPI-134R build. Only the
unbundled `studio/workspace-bridge.js` and server-side normalizer changed, plus
the maintained regression suite. `scripts/studioflow-release-baseline.json`
needed no update.

## 3. Preflight

`npm run release:preflight` ended **READY, exit 0** at
`sourceCommit 44c707f8aa2417d4c74e1e19ae056a87b63e7487`,
`rollbackVersion 4de115db-6537-41b5-9bf7-ae99cb0e20fc`, verified
2026-11-02T01:04:07Z.

Verified inside preflight: branch, clean tree and GitHub parity; persistent
`local_admin` lifecycle; disposable D1/R2 E2E; QA and API E2E; reproducible
StudioFlow build; authoritative staging verification (`PASSED`); isolated and
maintained Firefox acceptances; Studio management, ownership, deletion and
deletion-safety regressions; TPI-133, TPI-134 and TPI-135; guarded Wrangler dry
run; final Git cleanliness and parity.

Runs before the READY one, and how each was handled (none bypassed):

| Run | Outcome |
| --- | --- |
| Preflight 1 | FAILED at the Firefox release acceptance with `Failed to decode response from marionette` — the browser never launched (0 checks executed, empty profile). Reproduced as passing twice standalone; not an application failure. |
| Preflight 2 | FAILED at TPI-135 **29/30**. Real cause found and corrected (see §5), not waived. |
| Preflight 3 | FAILED at `local_admin can access /studio/`; the Worker log shows `GET /studio/ 404` while `stage-local-assets` had deleted and was rewriting the asset tree. Pre-existing staging race, cleared on rerun. |
| Preflight 4 | **READY, exit 0.** |
| `release:production` 1 | FAILED at the `local_admin` Firefox acceptance (38 passed, 3 failed: video cards, video timer row, video slot menu). Reproduced **64/64 twice** standalone on the same commit and assets; a video-panel flake, not a regression. |
| `release:production` 2 | **DEPLOYED_AND_VERIFIED, exit 0.** |

## 4. Production acceptance

Asset verification on the live site, authenticated as the disposable
`qa-studioflow-prod` account:

| Check | Result |
| --- | --- |
| `/studio/` for an authenticated account | 200, references `index-D9yljEwa.js` and `index-D6ZhUVW1.css` |
| JavaScript served | 200, 922,904 bytes, SHA-256 `e317fc071f4968e3…` |
| CSS served | 200, 110,723 bytes, SHA-256 `1baa338c09f29395…` |
| `workspace-bridge.js` served | 200, 124,712 bytes, carries the `teleprompter-script` kind, keeps `teleprompterScriptId`, and carries the legacy-snapshot guard |
| Active Worker | `3082475b-80ad-4557-82d6-32618e3f7079` at 100% |

Account-backed persistence on production —
`TPI_FIREFOX_BASE_URL=https://paranormalinitiative.com` with the production QA
credentials: **PASSED 30/30**. That run creates a Studio through the real
dashboard, drags a Teleprompter script into My Scenes, saves through the
workspace API, reads the authoritative stored snapshot, performs a genuine
browser reload, clicks the restored row, and drives the live teleprompter
(Play/Pause/Reset, starting paused at the beginning), then switches to a second
Studio, confirms the first Studio's data is untouched, removes the row, confirms
the removal survives a reload and is not resurrected, replays a legacy snapshot,
and purges its own disposable records.

Existing functionality on production: the maintained acceptance inside the
release passed 64/64 (panels and panel exclusivity, foreground menu behaviour,
sound and music pads, Studio switching, auth), and the TPI-135 production run
exercises Scene drag, the Scenes panel and the live teleprompter. The five
production-item colors are unchanged by construction: the served bundle hashes
are byte-identical to the owner-accepted TPI-134R build.

## 5. Correction made during this directive

Preflight 2 exposed a genuine defect in the TPI-135 work, fixed in `44c707f`
before any deployment:

- The bridge's legacy-snapshot guard existed but the gate's assertion was
  racy: it read the Scenes panel once, at mount, and returned an empty array the
  moment the panel element existed, before the application had restored and
  painted rows. It passed by timing luck in earlier runs and failed here.
- The same run proved that a snapshot without a stored panel makes the released
  application derive its own panel from that Studio's Scenes (`intro`, its own
  Scenes, `outro`). The guard now writes exactly that derived panel into the
  browser copy, so display and storage agree and a previously open Studio's rows
  can never survive in it.
- The check now waits for the row set to settle and asserts the real guarantee:
  the snapshot stays readable and every row belongs to this Studio's own Scenes.
  It still fails on another Studio's rows, on a resurrected row, or on an error.
  The row-count expectation it replaced was wrong about the released app, and
  is not a behavior change to the product.

This is the only assertion changed in this directive; no other test was
weakened, skipped or suppressed.

## 6. Production data

- No Studio was deleted, recreated, renamed or reset. No workspace, Scene,
  production item or recording was altered by the release.
- No manual D1 or R2 operation was performed. No migration ran: the change is
  inside the existing `state_json` payload.
- Every verification Studio belonged to a disposable QA account and was purged
  by the suite that created it.
- The QA account still holds the nine Studios it already had before this
  release, including three disposable acceptance Studios from the TPI-134R
  release (`TPI-134R Live Acceptance …`, `TPI-134R Probe …`). They were left
  untouched; deleting production data was not authorized.

## 7. Rollback

`4de115db-6537-41b5-9bf7-ae99cb0e20fc` remains the verified rollback target and
is still selectable. Rollback restores the previous Worker only; it performs no
data operation, and the new Worker wrote no schema or data shape that the
previous version cannot read.

## 8. Limitations and open items

- Production now persists Scene Teleprompter rows across refresh, Studio
  switching and sessions. Owner acceptance on the live site is still pending and
  must not be assumed from these automated results.
- The TPI-134 suite's production mode seeds browser-local rows, which an
  account-backed Studio does not render, so its production run stops at that
  seeding step. Colors are verified instead by byte-identical bundle hashes plus
  the local 43/43 run; the harness limitation is recorded, not hidden.
- The TPI-133 floating-menu suite hardcodes local credentials and has no
  production mode; it ran 44/44 locally inside the release.
- Pre-existing and unchanged: `verify:studioflow-035` asserts the unreleased
  private reader; `tpi-studioflow-048` reports 18/20 on older bridge source
  strings (reproduces on untouched `HEAD`, not in the preflight set);
  `tpi-studioflow-033` is BLOCKED without its synthetic media fixture, which the
  preflight supplies.
- The source lineage is unchanged: the StudioFlow working tree
  (`/Users/toddknipple/Documents/StudioFlow/web`) contains the owner's
  uncommitted `src/App.tsx` and `src/styles.css` edits. The release never reads
  that tree — authoritative staging builds a disposable detached worktree of
  `f44f3a08…` — so those edits are not in the shipped bundle.
