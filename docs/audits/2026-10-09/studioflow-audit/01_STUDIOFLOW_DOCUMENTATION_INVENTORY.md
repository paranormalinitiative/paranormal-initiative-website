# StudioFlow Documentation Inventory

## Purpose

This report inventories the documentation used to assess StudioFlow and separates current guidance from historical or overstated material.

## Primary documentation

| Document | Assessment | Use in this audit |
|---|---|---|
| `TPI_STUDIOFLOW_AND_SITE_REBUILD_PLAN.md` | Strongest current planning summary | Baseline for local/prototype capability and production gaps |
| `STUDIOFLOW_MASTER_TODO.md` | Mixed current and historical entries | Timeline, known work, and unresolved phases; date-label older claims |
| `STUDIOFLOW_READINESS_AUDIT.md` | Partly stale | Historical readiness baseline; update claims against current source |
| `STUDIOFLOW_FULL_AUDIT.md` | Partly stale | Feature buckets and earlier gaps; not authoritative for current WebRTC/source state |
| `CLOUDFLARE_PORTAL_SETUP.md` | Infrastructure guidance | Cloudflare, D1, RealtimeKit configuration context |
| `MIMO_DIRECTIVE.md` | Deployment/scope direction | Confirms generated `studio/` boundary and private Studio access |
| `MASTER_BUILD_PLAN.md` | Broad project plan | Product context, not current StudioFlow proof |
| `PHASE1_IMPLEMENTATION_MAP.md` | Historical implementation map | Prior scope and route context |
| `PHASE2A_ODYSEE_REPORT.md` | Destination-specific history | Destination planning context only |
| `SITE_STREAMLINING_PLAN.md` | Potentially overstated | Requires reconciliation before being used as readiness evidence |
| `UI_REDESIGN_LOG.md` | Design history | Useful for intent, not behavioral verification |
| `contributor-guidelines/tpi-videos.md` | Content guidance | Relevant to video/content boundaries, not StudioFlow runtime proof |
| `itc-visual-studio/README.md` | Adjacent product documentation | Not evidence of StudioFlow capability |

## Current-versus-stale documentation findings

The older full/readiness audits describe a local room server and, in places, say there is no `RTCPeerConnection`. The current source now contains host/guest WebRTC and a production D1 signaling relay path. Those statements are historical and must not be copied into a current status report without date qualification.

The same older audits remain directionally correct about the missing production transport, missing RealtimeKit frontend integration, local-only FFmpeg bridge, lack of cloud recording persistence, and incomplete recovery behavior.

`STUDIOFLOW_MASTER_TODO.md` includes an October session entry consistent with the current D1 relay direction, while earlier issue rows remain stale. The document is therefore useful as a change log, not as a single current-state checklist.

## Canonical source and generated output

The source of truth is `/Users/toddknipple/Documents/StudioFlow/web`. The TPI `studio/` directory is generated deployment output and should not be edited directly. The current JavaScript bundle in `studio/assets/` matches the canonical `dist/assets/` bundle by SHA-256, but the source tree contains uncommitted changes and was deliberately not rebuilt. Deployment parity with current source remains unproven.

## Documentation conclusion

The documentation set is useful but has no single authoritative, continuously updated completion ledger. The audit reports in this directory should be treated as the current snapshot until the owner accepts a source/build/runtime verification process and updates the older plans.

