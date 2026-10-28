# TPI-STUDIOFLOW-108 — Integrate Authoritative Source-Provenance Workflow

Directive: TPI-STUDIOFLOW-108
Type: Development Infrastructure Integration
Priority: HIGH
Production Deployment: NOT AUTHORIZED — nothing was deployed
Git Push: AUTHORIZED — restricted to the verified integration and this documentation
Result: **COMPLETE**

## Objective

Integrate the verified Directive 107 source-provenance improvements into the
authorized website development branch, verify that existing release safeguards
remain operational, and push the clean integration to the remote repository.

## Authoritative baseline (unchanged)

- Live production: `https://paranormalinitiative.com/studio/` on Worker
  `91a8460e-1db1-440c-9643-a85b6e178fba`
- Approved StudioFlow source commit `6b9c3c4b6b40f0496012e5d718d32d75e149dcf6`
- Known-good assets: `index-D1h4nSZd.js` SHA-256 `4eed57a4…`,
  `index-CcFjA_0p.css` SHA-256 `850186…`

The deployed application and the recorded Directive 106 deployment baseline
were not modified at any point in this directive.

## Phase A — Repository state verified

- Directive 107 commit `3b55fe9` exists on `codex/studioflow-107-source-provenance`,
  tree clean, and is exactly one commit ahead of the authorized branch baseline
  `b5cd1b7` — fast-forward integration possible.
- `codex/tpi-development` local and `origin/codex/tpi-development` both at
  `b5cd1b7` before integration (origin parity, no unexpected remote changes).
- `codex/studioflow-105-preserved-development` intact at `fc6fe45`; the mixed
  StudioFlow development checkout untouched.

## Phase B — Directive 107 change scope confirmed

`3b55fe9` touches exactly the permitted scope: the source-provenance staging
workflow (`scripts/stage-studioflow-authoritative.mjs`), the approved source
baseline (`scripts/studioflow-release-baseline.json`), the source-provenance
regression suite (`scripts/verify/tpi-studioflow-107-source-provenance.mjs`),
one `package.json` script entry, and the Directive 107 record plus register,
status, handoff and workflow documentation. A path-scoped diff confirmed zero
changes to `studio/`, `functions/`, `migrations/`, Wrangler configuration,
existing verification suites, or QA tooling. No application or Worker changes.

## Phase C — Integration

Fast-forwarded `codex/tpi-development` from `b5cd1b7` to `3b55fe9` with
`git merge --ff-only`. No conflicts, no history rewriting, no unrelated commits
reset. Teleprompter 092 and permanent-deletion development remain excluded.

## Phase D — Verification

- `npm run verify:studioflow-107-provenance`: **20/20 PASS** — approved clean
  source PASS; dirty worktree REJECT; incorrect commit REJECT; missing commit
  REJECT; unauthorized source path REJECT; mixed development tree REJECT;
  verify-only leaves staged assets unchanged; apply requires the approved
  identity; two clean builds identical; known-good assets reproduced; tampered
  staged assets detected; existing release guards intact.
- `scripts/verify/tpi-studioflow-025-reconciliation.mjs`: **12/12 PASS**.
- `scripts/verify/tpi-studioflow-055-source-reconciliation.mjs`: **17/17 PASS**
  (staging bridge/entry-point parity, including the authoritative staging
  verifier's maintained bridge-layer preservation).
- No test assertions were weakened.

## Phase E — Production artifact preservation

- `studio/index.html` still references `/studio/assets/index-D1h4nSZd.js` and
  `/studio/assets/index-CcFjA_0p.css`.
- Recomputed SHA-256 values match the approved baseline exactly:
  `index-D1h4nSZd.js` = `4eed57a4f243c9474fb73957d9e567defb2bb43ef3bcc82c1749ba02fcf92557`;
  `index-CcFjA_0p.css` = `8501862945034d73a08df30e81291891491536edd82f16e0074b98a933e4cf69`.
- Path-scoped diff `b5cd1b7..3b55fe9` over `studio/`, `functions/`,
  `migrations/`, `wrangler.toml` and `wrangler.local.toml` is empty: Worker
  application code, server API behavior, entry points and production
  configuration unchanged. No rebuild or restaging was performed.

## Phase F — Push

Before push: working tree clean, fresh `git fetch` confirmed remote HEAD still
`b5cd1b7`. Pushed `codex/tpi-development` normally (no force):
`b5cd1b7..3b55fe9`. Local and remote HEAD both `3b55fe9` — exact origin parity.

## Phase G — Documentation

This record plus updates to the directive register, current development status
and agent handoff, committed and pushed on `codex/tpi-development`.

## Final report

| Field | Result |
|---|---|
| AGENTS.md Reviewed | YES |
| Development Playbook Reviewed | YES |
| Directive 107 Source Commit | `3b55fe9` |
| Authorized Branch | `codex/tpi-development` |
| Integration Commit | `3b55fe9` (fast-forward from `b5cd1b7`) |
| Final Remote HEAD | `3b55fe9` at integration push; docs commit follows on the same branch |
| Origin Parity | PASS |
| Source-Provenance Tests | PASS (20/20) |
| Release-Safety Checks | PASS (025 12/12, 055 17/17) |
| Production Asset Hashes | MATCH (`4eed57a4…` / `850186…`) |
| Worker Application Code | UNCHANGED |
| Original Development Preserved | YES (`codex/studioflow-105-preserved-development` `fc6fe45`; mixed checkout untouched) |
| Production Deployment | NOT DEPLOYED |

## Status

- IMPLEMENTED: source-provenance workflow integrated into the authorized branch.
- AUTOMATED TESTED: 20/20 focused regression; 025 and 055 pass.
- RELEASE VERIFIED: not applicable — tooling-only change, no release.
- DEPLOYED: **no**. No Cloudflare command was invoked; production unchanged.
- OWNER ACCEPTED: pending (unchanged from Directive 106).

## Remaining items

- The next source release must record its new approved commit and asset hashes
  in `scripts/studioflow-release-baseline.json` as part of its release commit.
- Physical-device and owner acceptance of the live Video Setup 091 interface
  remain pending (unchanged from Directive 106).
