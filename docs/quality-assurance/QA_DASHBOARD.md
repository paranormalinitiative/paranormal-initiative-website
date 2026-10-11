# QA Dashboard

Last updated: 2026-10-11

## Current release-health snapshot

| Gate | Result | Evidence |
|---|---|---|
| TPI syntax and shell checks | PASS | `scripts/qa/run-qa.mjs` baseline |
| TPI local social regression | PASS — 152/152, 0 failures | `scripts/e2e/api-e2e.sh`, external scrapers disabled |
| StudioFlow build | PASS | `npm run build` in canonical web workspace |
| StudioFlow room/RTMP syntax | PASS | `npm run check:room`, `npm run check:rtmp` |
| Anonymous production boundary smoke | PASS — 10/10 | `scripts/qa/production-smoke.mjs`, read-only GETs |
| Actual StudioFlow media pipelines | PARTIAL/BLOCKED | see coverage matrix |
| Physical devices and external providers | NOT YET VERIFIED | owner/device/provider testing required |
| Production deployment for this QA batch | NOT APPLICABLE | tests/docs/CI only; no runtime assets changed |

## Readiness interpretation

The automated QA system is established and the deterministic local social baseline is green. That does not certify camera, microphone, WebRTC guest transport, public broadcast, physical storage pickers, cloud-provider integrations, or multi-hour reliability. Those remain visible in the matrix until executed with evidence.

## Evidence locations

- Baseline JSON reports: `docs/quality-assurance/reports/`.
- Detailed social assertions: `scripts/e2e/api-e2e.sh`.
- StudioFlow status and owner verification: `/Users/toddknipple/Documents/StudioFlow/PROJECT_STATUS.md`.
