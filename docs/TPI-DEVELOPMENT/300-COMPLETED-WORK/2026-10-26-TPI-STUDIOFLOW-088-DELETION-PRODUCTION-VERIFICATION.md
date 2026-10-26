# TPI-STUDIOFLOW-088 — Deletion & Archive Management: Production Verification and Production Repairs

Date: 2026-10-26
Status: `DEPLOYED / LIVE VERIFIED (agent) — OWNER ACCEPTANCE PENDING`
Directive: TPI-STUDIOFLOW-088 Permanent Studio Deletion and Archive Management
(archived verbatim in `100-DIRECTIVES/`).

## 1. Summary

Authenticated production verification of the Studio deletion/archive suite
reproduced two production-only defects that local runs could not reach. Both
were repaired through the maintained source-to-live workflow and re-verified
on the live website with disposable QA Studios:

1. **Background Studio activations hijacked the interface.** The boot-time
   Studio replay (`refresh({ activate: true })`) and active-identity
   convergence called the React activation bridge, whose callback
   unconditionally `setRoute("studio")`. On production's slower API the replay
   completed seconds after load — while the owner (or the QA suite) was
   already working on Home — and forced the interface into the studio view
   mid-flow. Deletion runs died with `visible cards: []` and
   `route: "studio"` exactly at the browser-local deletion step.
2. **Studio archive/restore failed silently on a version conflict.**
   `archiveStudioByKey` / `restoreStudioByKey` sent the menu's cached
   `expectedVersion` with no retry; the server correctly answers
   `workspace_conflict` (409) when the Studio's own autosave bumped the
   version first, and the React catch swallowed the failure with no status
   message. The owner's click did nothing and said nothing.

## 2. Existing deletion behaviour discovered (directive §11)

- Permanent deletion runs through `POST /api/studio/workspaces/:id/purge`
  with `expectedVersion` optimistic concurrency and a one-shot retry on
  `workspace_conflict`; productions are preserved and detached
  (`studio_workspace_id` cleared), stored media is untouched, and the
  identity is tombstoned (`studioflow.tpiLocalStudioDeleted.v1`) against
  stale browser-local record recreation.
- Archive (`status = 'archived'`, version bump) and Restore (`status =
  'active'`, `deleted_at` cleared, version bump) are separate routes from
  deletion and never remove data.
- Browser-local Studios delete through `removeLocalStudioRecord` +
  `tombstoneStudio`; unrelated snapshots and recovery copies are preserved.
- Failure surfacing was incomplete: archive/restore/missing-target rejections
  were swallowed (repaired, see §4).

## 3. Final Archive versus Delete semantics

- **Archive** — preserve: hidden from the active listing, available in the
  Archived Studios view with Restore and Delete actions, configuration,
  productions and recordings intact.
- **Delete** — remove permanently: typed-name confirmation required, Studio
  identity + saved scenes + configuration removed, productions preserved but
  detached, media untouched, identity tombstoned.

## 4. Application changes

| File | Change |
| --- | --- |
| `src/App.tsx` (StudioFlow source `9f85f9d`) | Activation requests carry `background`; background activations restore state but never navigate after owner interaction (`pointerdown`/`mousedown`/`keydown`/`touchstart`/`click` arm the guard). Activation resolution is keyed on identity, not route, so background activations cannot jam bridge switch bookkeeping. `deleteStudio` compares every Studio identity (key, workspaceId, activeBroadcastId) before selecting the safe Home destination. |
| `studio/workspace-bridge.js` (`5e206a7`, `6d9facb`, `7da1fb5`) | Boot replay, `tpi:studio-activation-ready` replay and identity convergence mark activations `{ background: true }`; switch bookkeeping commits every completed outcome except a production-lock refusal; archive/restore retry once with the fresh version from a `workspace_conflict` response (`lifecycleStudioRequest`) and surface every failure in the panel status; missing-target rejections report themselves. |
| `scripts/verify/tpi-studioflow-088-studio-deletion.mjs` | New Test 11 (background activation cannot move the owner off Home; foreground activation still opens the Studio environment), retried card-menu interactions for archive/restore, and failure probes that record panel status, visible card sources, catalog entries and the server record. |

Database and storage changes: **none**. No schema migration, no data
mutation; only additive browser-local tombstone/snapshot behaviour that was
already in place. Crossroads of the Unknown and all owner Studios were
untouched; all suite fixtures were disposable QA Studios on the isolated QA
account and were purged at both ends of every run.

## 5. Confirmation safeguards (unchanged, verified)

- The dialog shows the exact Studio name, productions count, recordings
  count where available, the media impact statement, and a permanent-deletion
  warning; the destructive button stays disabled until the exact name is
  typed; opening the dialog deletes nothing; cancel leaves everything
  untouched (Tests 1a–2c on production).

## 6. Regression results

Local (managed Worker `http://127.0.0.1:8787`, disposable Firefox Developer
Edition profiles):

- 088 deletion suite: **39/39** (37 maintained checks + Test 11a/11b)
- 087 ownership suite: **40/40**
- Studio lifecycle suite: **29/29**
- Local auth lifecycle: **64/64** (credential preserved)

Guarded release preflight (repeated for each deployment): all suites green —
auth lifecycle 64/64, lifecycle 29/29, ownership 40/40, deletion 39/39,
authoritative staging verification, release-safety contract 20/20.

Known open items carried forward: the five pre-existing static-contract suite
failures and the timing-sensitive 030 rapid-upload step remain documented and
are not silently marked resolved.

## 7. Production verification (directive §8–§9)

Authenticated production runs against `https://paranormalinitiative.com` with
the isolated QA account and disposable `TPI-088 ` Studios (evidence:
`evidence/2026-10-26-studioflow-088-production-suite.json`):

- Pre-repair reproduction (Worker `25f3d4ea`): the run died mid-Test-8 with
  `More Actions is unavailable … visible cards: []` and fatal state
  `route: "studio"` — the boot-replay view hijack, exactly as diagnosed.
- Post-repair (Worker `fb9ffdb9`): **39/39 PASS** — Tests 1–9 (confirmation
  safeguards, permanent deletion, isolation, refresh persistence, browser-local
  deletion with other-snapshot preservation, archive/restore, archived-Studio
  deletion), plus Test 11a/11b and the release-gate checks.

## 8. Deployment identifiers

| Round | Website commit | Production Worker | Rollback checkpoint |
| --- | --- | --- | --- |
| View-hijack repair | `5e206a7` (source `9f85f9d`) | `d0dc37a5-3cbb-405f-a066-f9de06ab9916` | `25f3d4ea-fc70-4de6-9e34-2a353aed583e` |
| Archive/restore conflict repair | `6d9facb` | `5ee8b6d2-1b27-4ff4-81fe-5ea80fcc3029` | `d0dc37a5-3cbb-405f-a066-f9de06ab9916` |
| Restore diagnostics + failure surfacing | `7da1fb5` | `fb9ffdb9-137f-4e9e-b5a3-6c5c5fe1e91b` (live) | `5ee8b6d2-1b27-4ff4-81fe-5ea80fcc3029` |

All three releases ran the maintained path
(`verify:local-auth-lifecycle` / `release:preflight` /
`TPI_PRODUCTION_DEPLOY=approved release:production`) with live anonymous smoke
and live isolated Firefox Developer Edition acceptance
(`DEPLOYED_AND_VERIFIED`). Source repository
`/Users/toddknipple/Documents/StudioFlow/web` is local-only by design (no
remote); the website repository is pushed to
`origin/codex/tpi-development`.

## 9. Remaining risks / limitations

- A background activation completing within milliseconds of the owner's very
  first interaction can still land its view change; the guard arms on the
  first input event, so the window is one event-loop instant wide.
- The 030 rapid-upload step and the five static-contract suite failures remain
  open (pre-existing, documented).
- Owner acceptance is still required: only the owner can confirm the live
  StudioFlow interface personally. Status remains **AGENT VERIFIED — OWNER
  ACCEPTANCE PENDING**.
