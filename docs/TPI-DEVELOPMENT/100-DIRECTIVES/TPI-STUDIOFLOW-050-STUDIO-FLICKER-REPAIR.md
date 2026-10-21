# TPI-STUDIOFLOW-050 — Studio Flicker / Reload Loop Repair

## Scope

Local-only investigation and repair of the rapid StudioFlow flicker reported
in Opera at `/studio/`. No production resources, owner Studio data, browser
storage, D1 records, media, or backups were modified.

## Investigation result

The confirmed reload hazard was in the generated StudioFlow integration bridge
at `studio/workspace-bridge.js`. Workspace reconciliation used
`window.location.reload()` in three paths: workspace selection, route
normalization after refresh, and fallback from the Studio route when no valid
workspace was available. The bridge is attached to the Studio shell and can be
reattached while the application is already running; a reload re-enters the
bridge and can produce a rapid navigation/remount loop.

Source inspection found no equivalent reload call in the workspace asset-state
bridge, local asset staging/cache-busting scripts, or the guest-audio bridge.
The asset watcher stages atomically and the existing save path already guards
overlapping writes. The room/guest code was not changed.

## Correction

- Workspace selection now applies the verified workspace state and calls the
  existing render path in place.
- Route reconciliation updates the remembered route key without navigating or
  reloading the document.
- Existing save-before-switch, production-lock, version, and workspace identity
  protections remain active.
- No second cache-busting system was introduced.

The canonical StudioFlow source remains separate from the repository's
generated/deployment-facing `studio/` output; the repair was made at the
integration boundary that is actually served by this repository.

## Verification

- Focused TPI-050 stability checks: 10/10.
- TPI-017 reconciliation regression: 14/14.
- Broader StudioFlow regression set: 170/170.
- JavaScript syntax checks: passed.
- `git diff --check`: passed.
- Opera accessibility observation: the currently visible StudioFlow page had
  no accessibility-tree changes during the available observation window.
- Authenticated owner Studio view: not directly exercised in this pass; the
  isolated browser surface reached the intentional Creator Studio access gate.

The browser evidence supports stability of the visible local page but does not
claim a full 60-second authenticated Studio session or physical media-device
verification.

