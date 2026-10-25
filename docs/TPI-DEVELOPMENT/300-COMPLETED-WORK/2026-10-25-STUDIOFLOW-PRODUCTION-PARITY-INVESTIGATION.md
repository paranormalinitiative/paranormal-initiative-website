# StudioFlow Production Parity Investigation — Root-Cause Report & Repair Plan

Status: INVESTIGATION COMPLETE — repairs PROPOSED, not implemented
Authorization: `100-DIRECTIVES/STUDIOFLOW-PRODUCTION-PARITY-INVESTIGATION-AUTHORIZATION.md`
(archived 2026-10-25, commit `2f656e7`)

## WHO

FreeBuff development agent, under the master authority directive and the
StudioFlow Source-to-Live Workflow, with the owner's read-only parity
investigation authorization.

## WHAT

An independent, read-only investigation answering three questions:

1. Are the original StudioFlow source, the GitHub website integration, and
   the authenticated production application running the same implementation?
2. Why does the production Studio named "Testing 123" display a
   Crossroads-like configuration while the local Studio displays a different
   arrangement?
3. What current-state documentation contradicts independently verified
   results?

No application code was modified, no production Studio data was created or
changed, and no Worker was deployed.

## WHEN

- 2026-10-25 — investigation, evidence capture, and documentation
  reconciliation.

## WHERE

- Production: `https://paranormalinitiative.com/studio/` (authenticated
  isolated QA account `qa-studioflow-014`; credentials were used only in
  memory and never printed, logged, or committed)
- Website integration: `studio/` in this repository (branch
  `codex/tpi-development`, application checkpoint `e83b732`)
- Original source: `/Users/toddknipple/Documents/StudioFlow/web`
- Evidence scripts (local scratch, not release artifacts):
  `.local-dev/tmp/directive-archive/parity-investigation.mjs`,
  `bridge-parity.mjs`, `bridge-parity-full.mjs`

## HOW — Evidence

### 1. Authenticated bundle comparison (live ↔ website integration)

Using the maintained `/api/auth/login` acceptance flow with the isolated
production QA credential, every deployed StudioFlow artifact was fetched
from production and hashed against this repository. All thirteen files are
byte-identical:

| Live artifact | Result |
| --- | --- |
| `/studio/assets/index-BZ_tF0DV.js` | MATCH (sha256 `c318988828766ef9…`) |
| `/studio/assets/index-8wAEEeJ8.css` | MATCH (sha256 `c788bff8dfc8abd0…`) |
| `workspace-bridge.js` | MATCH |
| `workspace-asset-state-bridge.js` | MATCH |
| `production-lock-bridge.js` | MATCH |
| `audio-soundboard-bridge.js` | MATCH |
| `backup-bridge.js` / `backup-core.mjs` | MATCH |
| `navigation-bridge.js` | MATCH |
| `brand-heading-bridge.js` | MATCH |
| `video-playback-reset-bridge.js` | MATCH |
| `video-clip-management-bridge.js` | MATCH |
| `studioflow-012-overrides.css` | MATCH |

Anonymous requests to `/studio/` return the intentional 403 entitlement gate
("Creator Studio — Coming Soon"), so anonymous checks cannot prove parity;
the authenticated comparison above is the valid test.

The live HTML differs from `studio/index.html` in exactly two additions,
both expected and non-divergent:

1. The theme bootstrap script injected by `worker.js`
   (`EARLY_THEME_BOOTSTRAP`, the TPI-DEV-034 early non-white theme
   bootstrap).
2. The Cloudflare analytics beacon.

Script/style reference lists are otherwise identical.

### 2. Source build ↔ website integration

`node scripts/stage-studioflow-authoritative.mjs --verify-only` reports:

- `generatedAssetsMatchIntegratedCandidate: true`
- `reproducibleBuilds: true`
- `obsoleteBundleReferences: { oldJavaScript: false, oldCss: false }`
- Entry point sha256 `cbce64694a5d434d9b05c7926cd1587420d0013484325050f885d217b465cce4`

Conclusion: original source → website integration → production is a single
implementation chain. **No implementation divergence exists at the asset,
bridge, or build level.** The owner's symptoms are not caused by stale or
mixed deployments.

### 3. Studio identity / persistence ("Testing 123")

Read-only workspace inventory of the isolated QA account: 8 workspaces /
14 studios. **No Studio named "Testing 123" exists on the QA account** — it
is owner-account data on production, outside the isolated QA credential
scope, and its stored state was therefore not inspected.

Root-cause mechanism, established from deployed code and history:

- Before the Integrated Studio Management & Scene System Recovery (website
  commit `a952796`, chain through `e83b732`), the workspace asset-state
  bridge merged the **active** localStorage asset configuration into
  workspace CREATE payloads. Creating a new Studio therefore copied the
  previously active Studio's media assignments and scene configuration into
  the new workspace — producing exactly the reported symptom: a new Studio
  ("Testing 123") with a Crossroads-like arrangement.
- The deployed bridge now sends explicit clean defaults on create:
  `workspace-bridge.js` `createStudio()` uses `defaultStudioState(title, id)`,
  and `workspace-asset-state-bridge.js` states: *"A normal create request
  already contains the new Studio's explicit clean defaults. Merging active
  localStorage here would copy the previous Studio's media assignments into
  the new workspace."* Backup restores are the only intentional-copy path.
- Production serves this corrected bridge byte-identical to the repository
  (evidence §1), so the create path is clean today. "Testing 123" retains
  the state captured at creation time (pre-fix); the local Studio copy uses
  separate localStorage and clean defaults, hence the different arrangement.

This is a **data condition from a pre-fix creation**, not an implementation
parity problem. No repair of application code is indicated.

## Documentation reconciliation (performed)

Authorized reconciliation of current-state Markdown, preserving historical
records and separating reported from independently verified results:

1. `TPI-CURRENT-DEVELOPMENT-STATUS.md` — the recovery section simultaneously
   claimed "Production remains on the previously recorded Worker until the
   complete release preflight and guarded deployment pass" and "The release
   deployed Worker `7bddac9c…`". The first sentence predated the deploy;
   corrected, with suite counts explicitly labeled as the releasing agent's
   reported results.
2. `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md` — "Current production baseline"
   still pinned the TPI-036 Worker `076c9614…`; updated to the integrated
   recovery with the independently verified asset hashes, and Worker version
   IDs labeled reported-only (they are not exposed to HTTP clients).
3. Historical completion records under `300-COMPLETED-WORK/` were left
   untouched.

## Archive Git-exclusion conflict (resolved)

The local `.git/info/exclude` rule targeting the directive archive was
verified not to be required by any active workflow: no script or document
references it, it hid zero files at verification time, and the release
tooling's clean-tree gate is satisfied by committing archives (the
Archiving Standard's own path — ignoring them risks silent archival loss).
The rule was removed; all archived directives remain tracked under
`100-DIRECTIVES/` (the recovered 149-directive historical archive intact),
nothing is ignored there, and the working tree is clean.

## Proposed repair plan (for owner review — NOT implemented)

1. **"Testing 123" remediation (requires explicit owner approval —
   production data change).** Options:
   - (a) Recommended: create a replacement Studio under the fixed create
     path and re-assign the intended scenes/media, then retire the stale
     Studio; or
   - (b) a targeted, documented cleanup of the copied configuration fields
     in that workspace's stored state, performed as an owner-approved
     operation with a recorded rollback.
2. **Optional audit:** an owner-run read-only report of any pre-fix Studios
   whose configuration mirrors another Studio's media assignments, so other
   stale copies can be found without touching data.
3. **Regression coverage:** add a maintained assertion that a newly created
   Studio does not inherit the active Studio's media assignments
   (create-from-active-context → assert clean). Behavioral confirmation of
   the clean-create path against production with a disposable QA Studio is
   deferred to the repair phase, since this investigation prohibited
   production writes.
4. **Documentation:** record the owner's chosen remediation and its
   verification in the completion records after the repair phase.

## Remaining uncertainty (explicit)

- Suite counts quoted in recovery/release records (64/64, 20/20, 33/33, …)
  are **reported** claims; they were not re-run during this read-only
  investigation.
- Worker version IDs (`7bddac9c…`, `871c0ae7…`) come from release records;
  Cloudflare does not expose them to HTTP clients, so they remain reported,
  not independently verified.
- "Testing 123"'s stored configuration was not read directly (owner-account
  scope). The root-cause mechanism is established from deployed code and
  history; confirming the specific stored state needs owner authorization.
- Live behavioral verification of the clean-create path awaits authorization
  to create a disposable QA Studio on production.

## Verdict

Original StudioFlow source, GitHub website integration, and authenticated
production are running the **same implementation** (byte-identical bundles,
bridges, and reproducible build). The reported Studio discrepancies are a
historical create-path data condition that the deployed recovery already
prevents going forward; remediating existing owner data is the only
proposed repair and awaits owner direction.
