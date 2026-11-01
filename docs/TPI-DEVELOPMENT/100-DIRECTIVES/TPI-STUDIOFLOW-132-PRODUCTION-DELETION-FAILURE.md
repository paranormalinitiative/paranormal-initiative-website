# TPI-STUDIOFLOW-132 — Production Studio Deletion Failure

Date: 2026-11-01
Environment: production inspection (read-only) plus the authoritative local
Worker `http://127.0.0.1:8787/studio/`
Browser: Mozilla Firefox Developer Edition 160.0b3, isolated disposable profile
Production deployment: none under 132 (read-only inspection); the correction
was released separately under **TPI-STUDIOFLOW-132R** — DEPLOYED AND VERIFIED,
owner acceptance pending (§14)

## 1. Status

**ROOT CAUSE CONFIRMED** for the failing code path, and **CORRECTED AND
VERIFIED** against a representative reproduction of the production condition.

**PARTIAL** in one respect only: the owner's own authenticated production
session and Firefox storage could not be inspected, so the specific Studio card
the owner clicked cannot be named. Everything that decides the disabled state
was recovered from the deployed bundle, from production D1 (read-only), and
from a real Firefox reproduction. See §13.

## 2. Current production Worker and assets

| Item | Observed value |
| --- | --- |
| Worker | `theparanormalinitiative` |
| Active version | `f4be38fb-9d26-45cb-9c48-5223a1d4c12c` — 100% traffic, created 2026-11-01T16:27:44Z |
| Previous version | `99ca2347-3181-4525-b9eb-d28cb61cf42a` (rollback target) |
| Expected JavaScript | `/studio/assets/index-B_8Inyh0.js` — SHA-256 `e250a5e41376be2861c1fe0747165a189da193ca2f180c596d49b19750fd1abe` |
| Expected CSS | `/studio/assets/index-C_oD8YSH.css` — SHA-256 `5bdc30cfd0945a8978cfff024af30af71886de0be8b13875b1abed3147f62040` |
| Entry document cache | `Cache-Control: no-store` (Worker `serveAssets`, `/studio/index.html`) |
| Service worker | None. No `serviceWorker` registration exists in `/studio/` or its bridges |

`git diff b48fd7e..HEAD` (the deployed release commit versus the current tree)
contains **documentation only**, so the deployed Worker code, bridges and
`studio/index.html` are byte-identical to this repository. The deployed
entrypoint therefore references the expected JavaScript and CSS, and the local
copies of those files reproduce the hashes recorded in the D131R release.

**Limitation:** `/studio/` and every `/studio/` asset are gated by
`hasCreatorStudioAccess` and return `403` plus the "Coming Soon" document for an
anonymous request, so the live asset bytes could not be fetched without the
owner's session. This confirms the deployment identity, not the owner's
browser-loaded bytes. The stale-bundle hypothesis is nevertheless excluded by a
stronger argument in §4.

## 3. The exact disabled-state expression

Recovered verbatim from the deployed bundle
(`studio/assets/index-B_8Inyh0.js`, identical in the previously live
`index-D5zopy5z.js`):

```js
const T = typed.trim() === studio.title.trim();
const scopeOk = mode === "studio-only" || (contentsAcknowledged && !!inventory);
const guard = mode === "with-contents"
  ? inventory?.server?.guardWithContents
  : inventory?.server?.guardStudioOnly;
const incomplete = !!(inventory && inventory.storage !== "browser-local" &&
  (inventory.serverUnavailable || !inventory.server ||
   inventory.server.productionsUnavailable ||
   inventory.server.mediaUnavailable ||
   inventory.server.snapshotsUnavailable));
const blockedReason = inventoryError || inventory?.serverUnavailable ||
  (incomplete ? "The server did not complete every deletion-inventory check." : "");
const canDelete = T && !!(inventory && !blockedReason && !incomplete) && scopeOk && !pending && !guard;
```

`Delete Studio Permanently` is `disabled: !canDelete`. The name comparison was
never the blocker.

## 4. Root causes

### Root cause A — a browser-only Studio is misclassified as server-backed

`studio/workspace-bridge.js` (`studioDeletionInventory`) reported storage as:

```js
storage: !target ? (snapshotPresent ? "both" : "browser-local") : (...)
```

For a Studio that exists **only in browser storage** (`target === null`, no
server workspace row) but has a browser-local recovery snapshot
(`snapshotPresent === true` — the normal result of any earlier save), the
inventory claimed `storage: "both"` while returning early, so it never loaded a
server inventory. The dialog therefore entered the server-completeness branch
with `server === null`:

- `incomplete` became `true` permanently;
- `blockedReason` became "The server did not complete every deletion-inventory
  check.";
- `canDelete` stayed `false` for every confirmation attempt;
- the dialog also mislabelled the Studio as "server-saved with a browser-local
  recovery snapshot".

Nothing the owner could type, retry, refresh or re-open could ever satisfy that
condition, because no server record exists to be checked. A Studio containing
recovery snapshots was thereby treated as undeletable with no documented safety
requirement behind it.

### Root cause B — a blocked Studio produced no explanation

The server reports each deletion guard as an object, e.g.
`{"code":"studio_production_active","error":"Studio changes are unavailable while a recording or livestream is active…"}`.
The bridge passed that object through as `inventory.server.guardStudioOnly`, and
the dialog renders the guard as its status text. React threw
`Minified React error #31 … args[]=object with keys {code, error}` while
rendering, so the dialog never committed the guard state and froze on
"Preparing the deletion inventory…". The lifecycle state was:

```json
{"errs":["Error: Minified React error #31; ... args[]=object%20with%20keys%20%7Bcode%2C%20error%7D"],
 "inv":[{"call":"…"},{"call":"…"},
        {"resolved":"…","storage":"server","hasServer":true,"guard":"object"},
        {"resolved":"…","storage":"server","hasServer":true,"guard":"object"}]}
```

Every Studio blocked by an active recording/livestream or a scheduled
production therefore presented a permanently "loading" inventory with no
explanation and no way to proceed.

### What the failure was not

- **Not a stale bundle.** The gating expression, the dialog markup and the
  inventory host logic are byte-identical between `index-D5zopy5z.js` (live when
  the owner successfully deleted three Studios) and `index-B_8Inyh0.js` (live
  now). A cached older bundle cannot explain the symptom, and the entry document
  is `no-store` with content-hashed assets.
- **Not confirmation-string handling.** Typed and pasted exact names both
  activate deletion once the gating passes (§9).
- **Not ownership or authorization.** The server-side inventory and purge
  authorization are unchanged and still enforced.
- **Not an existing "no deletion" lockout.** TPI-130 replaced that lockout; the
  deployed bundle has no such path.

## 5. Production evidence that narrowed the cause

Read-only queries against production D1 (`tpi_contributor_portal`, SELECT only):

- `studio_workspaces` holds 120 rows; 103 are deleted.
- Owner account `Todd_Wayne` / `5d9e7ec6-9507-487a-96fd-00441f7f7570` has exactly
  three rows, all **permanently purged** at `2026-11-01T06:13:00Z`,
  `06:13:18Z` and `06:14:11Z` (`title = ''`, `state_json = '{}'`, `status =
  'archived'`). Permanent deletion therefore succeeded in production that
  morning, on the bundle then live (`index-D5zopy5z.js`).
- No live (`deleted_at IS NULL`) row exists for the owner account, so any Studio
  still listed in the owner's production "My Studios" is a **browser-local**
  Studio. That is exactly the state in which root cause A makes deletion
  impossible.

## 6. Reproduction

`scripts/verify/tpi-studioflow-132-legacy-local-deletion.mjs`, Firefox Developer
Edition, authoritative local Worker, isolated disposable profile, synthetic
`TPI-132 ` fixtures only.

Before the correction (recorded run):

| Observation | Value |
| --- | --- |
| Inventory `storage` | `"both"` |
| Inventory `server` | `null` |
| Inventory `workspaceId` | `null` |
| Inventory `localRecoverySnapshot` | `true` |
| Dialog label | "server-saved with a browser-local recovery snapshot" |
| Dialog status | "Deletion is unavailable until the complete safety inventory is verified: The server did not complete every deletion-inventory check." |
| Exact name typed | button `disabled: true`, label `Delete Studio Permanently` |

After the correction the same condition reports `storage: "browser-local"`,
shows no server-inventory demand, activates the button on the exact name, and
performs the deletion.

## 7. Correction

`studio/workspace-bridge.js` — two minimal integration-layer changes; no
StudioFlow bundle rebuild, no API change, no schema change:

1. `studioDeletionInventory` now classifies storage by the presence of a server
   workspace: `target ? (snapshotPresent ? "both" : "server") : "browser-local"`.
   The recovery snapshot is still disclosed through `localRecoverySnapshot`, and
   the server-completeness requirement still applies to every Studio that has a
   server record.
2. A new `studioDeletionGuardMessage` normalizes the server's `{ code, error }`
   guard to its message before it reaches the dialog, so a blocked Studio shows
   why it is blocked instead of crashing the render.

Preserved unchanged: server-side authorization, ownership checks, active
recording/livestream guard, scheduled-production guard, shared-media and
recordings protection, both deletion modes, exact-name confirmation, the
`Delete Studio Permanently` label, optimistic version pinning, idempotent purge
and the local tombstone.

## 8. Files changed

Website repository:

- `studio/workspace-bridge.js` — the two corrections above.
- `scripts/verify/tpi-studioflow-132-legacy-local-deletion.mjs` — new regression
  suite.
- `scripts/verify/tpi-studioflow-130-deletion-button.mjs` — test-only
  reliability corrections found while reconciling this failure: the guard
  assertion now reads the whole dialog (the guard paragraph is a sibling of the
  inventory container, so the old selector could never see it), each browser leg
  uses its own disposable fixture identities (the Chrome leg previously collided
  with a purged Studio), and the disposable card is awaited before it is read.
- `package.json` — registers `verify:studioflow-132-legacy-local-deletion`.
- This record.

No StudioFlow source change, migration, Worker change or deployment artifact
change was required.

## 9. Regression results

| Check | Result |
| --- | --- |
| `verify:studioflow-132-legacy-local-deletion` (new) | **PASS — 28/28** |
| `verify:studioflow-089-deletion-safety` | **PASS — 26/26** |
| `verify:studioflow-088-studio-deletion` | **PASS — 32/32** |
| `verify:release-safety` | **PASSED** |
| `verify:studioflow-130-deletion-button` | **PASS — Firefox and Chrome legs** (see §10) |

The new suite covers, in Firefox against the real application:

- browser-only Studio without a snapshot (control) — enabled;
- **browser-only Studio with a recovery snapshot** — the production failure;
- server-backed Studio with scenes and both recovery-snapshot scopes — enabled;
- archived Studio — enabled;
- scheduled-production guard — reason shown, deletion correctly blocked;
- incomplete server inventory (injected 500) — disclosed, deletion correctly
  blocked;
- incorrect name — disabled; exact typed name — enabled; exact pasted
  name — enabled;
- after deletion: record and snapshot removed for that Studio only, tombstone
  written, other Studios untouched.

## 10. Firefox verification

Firefox Developer Edition is the browser used for every failing-then-passing
observation in this directive. The reproduction, the correction verification and
the guard-message verification were performed in real Firefox UI
interactions — typing into `[data-testid=studio-delete-confirmation]`, reading
the rendered button state, and clicking the real submit control.

Two auxiliary harness defects were corrected so the maintained 130 suite reports
truthfully; both are test-only and are declared here as intentional changes:

- guard assertion scope (sibling paragraph, §8);
- per-browser disposable fixture identities.

The owner's Firefox profile, session, local storage, IndexedDB and cache were
never touched. No service worker or owner production session was modified.

## 11. Existing creator data preservation

- No production Studio, recording, Note, scene, script, media object, D1 row or
  R2 object was created, modified or deleted.
- Production D1 was accessed read-only (`SELECT`/`PRAGMA` only).
- All verification fixtures were synthetic `TPI-132 ` Studios in an isolated
  disposable profile on the local Worker, and were removed by the suite; a
  read-only check afterwards shows no `TPI-132 ` rows remain.

## 12. Production deployment status

**DEPLOYED AND VERIFIED under TPI-STUDIOFLOW-132R** — see §14. At the time of
the investigation the correction was not deployed; the separately authorized
132R directive released it through the guarded workflow.

## 13. Remaining blockers

1. **Not PRODUCTION VERIFIED.** The correction is not live, and per this
   directive production status cannot be claimed until the owner confirms the
   button activates on `https://paranormalinitiative.com/studio/`.
2. **Owner session inaccessible.** The owner's authenticated production session
   and Firefox storage could not be inspected, so the exact Studio card the
   owner clicked is not named. The mechanism is confirmed and reproduced; the
   instance is inferred from production data (§5).
3. **Owner account has no live server-backed Studios.** The owner may still see
   browser-local cards from earlier work. After the corrected release, those
   delete normally and are tombstoned; if the owner wants them gone from the
   listing sooner, that is the documented "browser-only Studio" path.
4. The StudioFlow source still renders the guard object directly; the bridge now
   supplies a message, so the next StudioFlow build should render the guard
   message explicitly to keep the contract durable.
5. Owner acceptance is still required: the button activating in the owner's own
   production session has not yet been confirmed by the owner.

## 14. TPI-STUDIOFLOW-132R — production release

Status: **DEPLOYED AND VERIFIED** on 2026-11-01.

| Item | Value |
| --- | --- |
| Implementation commit | `98e0ac8` (`fix(studioflow): unblock permanent deletion of browser-local Studios`) |
| Documentation commit | `d9af902` (`docs(studioflow): record TPI-132 production deletion failure`) |
| Release source commit | `d9af9024506e792221a111c7ec8c4016f7f69112` (clean, GitHub parity) |
| Previous Worker | `f4be38fb-9d26-45cb-9c48-5223a1d4c12c` |
| New Worker | `cd37afb8-cc82-406a-9e15-e84b3dffa234` (100% traffic) |
| Rollback target | `f4be38fb-9d26-45cb-9c48-5223a1d4c12c` |
| JavaScript | `index-B_8Inyh0.js` — `e250a5e41376be2861c1fe0747165a189da193ca2f180c596d49b19750fd1abe` |
| CSS | `index-C_oD8YSH.css` — `5bdc30cfd0945a8978cfff024af30af71886de0be8b13875b1abed3147f62040` |
| Entrypoint (staged file) | `ba80f8b040b6411b8d46cf1908a04a7a4a657834e479197d81c6d07508d79c64` |
| Live workspace bridge | `9e69ee7064a9314be1026646f3d6d34ff1e123695ff996e3edd208d2911ac573` (identical to the release commit) |

Gate results for the exact deployed commit:

| Gate | Result |
| --- | --- |
| `verify:local-auth-lifecycle` | PASS — 64/64 plus lifecycle PASS |
| `release:preflight` | **READY** — release safety, 3 × 38 authentication phases, StudioFlow staging verification, isolated QA/API E2E, Firefox release acceptance 64/64, Studio lifecycle 29/29, ownership 40/40, deletion/archive 32/32, deletion safety 26/26, Cloudflare checks, guarded dry-run |
| `release:production` | **DEPLOYED_AND_VERIFIED** — production smoke 10/10, live isolated Firefox acceptance 64/64 |

Focused post-deployment production acceptance (isolated disposable Firefox
profile, approved synthetic QA account, non-destructive): **18/18 PASS**.

- Production serves the corrected bridge: storage classification and guard
  normalization both present in the live `workspace-bridge.js`, hash-identical
  to the release commit.
- Production entrypoint references `index-B_8Inyh0.js` and
  `index-C_oD8YSH.css`; both served with the recorded hashes; entry document
  `no-store`.
- A browser-local Studio holding a recovery snapshot is now classified
  `browser-local`, still discloses its snapshot, no longer demands a server
  inventory, keeps deletion disabled for an incorrect name, and **activates
  `Delete Studio Permanently`** for the exact name.
- A disposable server-backed Studio activates deletion with the exact name.
- A guarded Studio shows a readable safety explanation and stays undeletable.
- Both disposable QA fixtures were purged; no owner Studio was touched and no
  permanent deletion of a real creator Studio was performed.

Owner data after the release is unchanged: the owner account still has its
three previously purged rows with identical ids, timestamps and versions, and
no live server-backed Studio row. No D1 migration, reset, R2 cleanup or
browser-storage change occurred.

Rollback procedure: the maintained guarded rollback to
`f4be38fb-9d26-45cb-9c48-5223a1d4c12c`, followed by the same authentication,
Studio access, smoke and Firefox acceptance checks.

**Owner acceptance remains pending**: the directive's completion criterion is
the owner confirming that `Delete Studio Permanently` activates in the owner's
own production Firefox session. The owner does not need to complete a deletion
to confirm this.
