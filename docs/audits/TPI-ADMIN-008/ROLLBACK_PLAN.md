# TPI-ADMIN-008 — Rollback plan

The existing `/admin-panel` is not replaced by this batch, so its prior
production implementation remains the immediate fallback. The protected
preview can be rolled back by redeploying a clean archive of the prior pushed
TPI commit and restoring its prior generated asset manifest.

Before any future promotion, record the live Worker Version ID and commit,
deploy from a clean committed archive, verify route and asset gates, and keep
the prior Worker version available for rollback. Do not use destructive Git
reset or database rollback operations as a release mechanism.
