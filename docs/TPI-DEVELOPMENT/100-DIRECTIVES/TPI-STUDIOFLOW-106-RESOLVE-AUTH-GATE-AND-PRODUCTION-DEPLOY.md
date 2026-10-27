# TPI-STUDIOFLOW-106 — Resolve authentication gate and complete production deployment

Date: 2026-10-27. **Result: COMPLETE — DEPLOYED_AND_VERIFIED. Owner acceptance: PENDING.**

## Objective and outcome

Directive 106 authorized resolving the protected local authentication
prerequisite that stopped Directive 105, completing the maintained guarded
release, and deploying the verified StudioFlow Video Setup 091 candidate to
`https://paranormalinitiative.com/studio/` — conditional on every mandatory
safeguard passing. Deployment of unverified code, enabling permanent deletion,
or discarding existing development remained prohibited.

Every mandatory gate passed. The exact verified candidate was deployed through
the maintained `scripts/tpi-release.mjs` guarded workflow and confirmed live.
Nothing was deployed that was not the verified candidate.

## Authentication prerequisite resolution (the Directive 105 blocker)

Directive 105 stopped because the isolated release worktree had no protected
local credential/persistent state, and because the maintained local verification
LaunchAgent (`com.tpi.local-development`) is bound to the canonical checkout and
therefore could not serve the isolated candidate. Both were environment
prerequisites, not application failures.

Resolution (owner-selected approach: preserve development to a commit, run the
release from the canonical checkout):

1. Committed the uncommitted in-progress development (Teleprompter 092, Video
   Setup 091, permanent-deletion work, directive records 090–099) byte-for-byte
   to the dedicated preservation branch `codex/studioflow-105-preserved-development`
   as commit `fc6fe45`. No development file was discarded, reset, cleaned, or
   overwritten; no credential or secret was committed (verified before staging).
2. Freed the `codex/tpi-development` branch name (the `website-105` worktree was
   detached at `9b3f033`, preserved) and checked the canonical checkout out to
   clean `codex/tpi-development` at `9b3f033`, exact origin parity (`0 0`).
3. Restarted the maintained local Worker so port `8787` serves the candidate
   (`studio/assets/index-D1h4nSZd.js` / `index-CcFjA_0p.css`). The protected
   credential file (`.local-dev/local-auth-credentials.json`, mode `0600`) and
   persistent `local_admin` D1 row were already present in the canonical checkout.

This made the managed verification service serve the actual candidate, so the
auth-lifecycle and Firefox gates verify the released code rather than the
preserved-development tree. The mixed-source provenance gap remains a known
limitation (below).

## Release traceability

- StudioFlow source commit: `6b9c3c4b6b40f0496012e5d718d32d75e149dcf6`.
- Website release commit (deployed): `9b3f0334a4c7c14d14d1ae0327fc9ec845493ec0`.
- Application candidate: `81a234a2ce91844a1a9ad33be524282dbb7d2874`
  (byte-identical: `git diff 81a234a HEAD -- studio/ functions/ worker.js wrangler.toml` empty).
- Authorized release branch: `codex/tpi-development`, clean tree, exact origin parity.

| Artifact | SHA-256 |
| --- | --- |
| `studio/assets/index-D1h4nSZd.js` | `4eed57a4f243c9474fb73957d9e567defb2bb43ef3bcc82c1749ba02fcf92557` |
| `studio/assets/index-CcFjA_0p.css` | `8501862945034d73a08df30e81291891491536edd82f16e0074b98a933e4cf69` |

## Gate results

- `npm run verify:local-auth-lifecycle`: **PASS** — credential preserved across
  managed Worker restart and StudioFlow rebuild; `local_admin` login 38/38 ×3;
  isolated Firefox `local_admin` acceptance 64/0.
- `npm run release:preflight`: **READY** — release safety contract, local asset
  staging, persistent auth, isolated QA/API E2E, Firefox release acceptance 64/0,
  Studio Management lifecycle 29/0, Studio ownership/dashboard 40/0, Studio
  deletion 31/0, Studio deletion safety 32/0, reproducible authoritative staging,
  Cloudflare access/rollback checks, and the guarded Wrangler dry-run (30,496
  assets, 606 KiB) all passed.
- Permanent deletion gates: **PASS** — both permanent deletion modes remain
  unavailable ("exact name cannot enable unavailable permanent deletion",
  "archived Studio permanent confirmation remains disabled", blocked deletion
  preserves production ownership). No destructive production data operation ran.
- `TPI_PRODUCTION_DEPLOY=approved npm run release:production`: **DEPLOYED_AND_VERIFIED**.

## Production deployment

- Deployed Worker version: `91a8460e-1db1-440c-9643-a85b6e178fba`
  (created 2026-10-27T20:41:35Z), confirmed at 100% traffic.
- Immediate rollback version: `17b9f9d5-717e-42a9-92d1-14b0dd717ef6`.
- Upload: 5 new files, 606.03 KiB / gzip 114.12 KiB, bindings
  `TPI_DB` (tpi_contributor_portal), `TPI_MEDIA` (tpi-contributor-media), `ASSETS`.
- No DNS, secret, unrelated Worker, D1, or R2 change. No production Studio or
  recording created, modified, or deleted.

## Live verification (non-destructive)

- Live anonymous production smoke: **PASS 10/10**.
- Live isolated Firefox Developer Edition acceptance (synthetic `production_qa`
  account, disposable profile): **64/0** — production_qa authentication succeeds,
  StudioFlow loads, every right-rail panel (incl. **Voice FX**) opens exclusive,
  video timers and sound/music pads render, My Studios switching/persistence,
  portable backup/restore, and narrow-width layout all verified.
- Active Worker `91a8460e…` confirmed at 100% traffic via Wrangler.
- Video Setup 091 (Directive 103/104 requirement): **9/0** freshly verified on the
  byte-identical candidate with synthetic capture — Setup has no duplicate Voice FX,
  camera/microphone capture live, Camera/Microphone/Speaker selectors present,
  microphone level meter responds to synthetic audio, microphone level control
  present, selected devices persist into the Studio, and in-Studio Voice FX
  initializes.

Bare `curl` to `/studio/` receives a branded `403` "Creator Studio — Coming Soon"
gate page (`server: cloudflare`); StudioFlow is an authenticated surface, so
non-browser clients without the QA session see the gate. Authenticated browser
access (the authoritative Firefox acceptance) loads StudioFlow correctly. This is
expected site behavior, not a deployment defect.

## Distinguishable status

IMPLEMENTED / SOURCE INTEGRATED / AUTOMATED TESTED / RELEASE VERIFIED / **DEPLOYED** /
OWNER ACCEPTED (PENDING).

## Remaining limitations

- **Physical-device and owner acceptance remain separate.** Camera/microphone
  selection and level monitoring were verified with synthetic capture devices on
  the byte-identical candidate; verification with real camera/microphone hardware
  and final owner acceptance of the live interface remain pending owner action.
- **Source provenance gap (non-blocking for this release).** The maintained
  `stage-studioflow-authoritative.mjs` build/verify step compiles the mixed
  development source tree (`web` @ `9f85f9d` + uncommitted 092/091 changes), not
  the clean candidate commit `6b9c3c4`. It is a reproducibility/health gate and
  does not compare against or overwrite the committed `studio/` assets, so the
  deployed bytes remain the verified candidate (confirmed by the artifact hash
  check and the byte-identity with `81a234a`). Retargeting the authoritative
  source to the clean candidate commit is recommended for future releases so the
  provenance gate reproduces the exact released source.
- Both permanent deletion modes remain intentionally unavailable; the cross-tab
  recording-deletion safety work (Directives 101–102) is preserved on its branches
  and not deployed.

## Documentation and preservation

Preserved development is recoverable from `codex/studioflow-105-preserved-development`
(`fc6fe45`); the original StudioFlow source worktrees (`web-091`, `source-103`,
`web-9f85`) were not modified. This record and the register/status/handoff updates
are documentation-only; no second no-op Worker deployment was performed for them.
