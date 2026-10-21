# TPI-STUDIOFLOW-052 — Fresh-Browser Session & Home Page Flickering

Status: BLOCKED / DATA-INTEGRITY INCIDENT REQUIRES OWNER REVIEW

This directive investigates the local-only StudioFlow flicker reported after
Opera browser data was cleared. Production deployment remains prohibited.

## Scope and safety

The initial investigation used a disposable local browser context and the
synthetic `local_admin` credential fixture. The first authenticated diagnostic
run did not yet block application mutations. Because a fresh StudioFlow context
can autosave the selected server workspace, that run issued PATCH requests for
the protected Crossroads workspace. Further browser verification was stopped;
the corrected harness blocks all Studio workspace mutation requests.

No browser storage was cleared. No production endpoint was accessed. No
database reset, backup restore, commit, or deployment was performed.

## Confirmed causes

Two local-development defects were identified:

1. `.local-dev/assets/studio/workspace-bridge.js` was stale. The local staging
   helper and watcher restaged only the hashed bundle, CSS, and HTML, leaving an
   older bridge containing `window.location.reload()` route-reconciliation
   paths. The Worker served that stale bridge.
2. On a fresh authenticated browser context, `refresh()` selected the
   server-backed workspace but did not hydrate its saved state before the
   autosave interval compared local defaults with the server state. That caused
   repeated autosave PATCH attempts even after the document reload loop was
   removed.

## Authorized source repair

- `scripts/stage-local-studio-assets.mjs` now atomically stages all mutable
  StudioFlow runtime bridges and exposes the runtime file allow-list.
- `scripts/local-dev.mjs` now watches those runtime files and restages them
  with the existing debounced local pipeline.
- `studio/workspace-bridge.js` now hydrates the selected server workspace and
  establishes its saved fingerprint while autosave is suppressed. User edits
  continue to use the existing debounced, version-checked save path.
- The verification harness blocks workspace mutations and records blocked
  mutation attempts so fresh-session testing cannot write owner data.

## Verification plan

The corrected isolated harness verifies unauthenticated 403 stability,
legitimate local authentication, Studio rendering, refresh stability, document
navigation counts, auth/workspace request counts, served bridge metadata, and a
120-second stability window. It must be rerun only with the mutation guard
enabled after owner data disposition is resolved.

