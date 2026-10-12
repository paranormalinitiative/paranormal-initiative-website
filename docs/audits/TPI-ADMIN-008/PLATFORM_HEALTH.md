# TPI-ADMIN-008 — Platform health

The protected preview now exposes the existing `/admin/scraper-runs` contract
as a read-only Platform Health view. It shows explicit provider states,
latest completed scraper/provider summaries, and recent sanitized run history.
The view does not invoke refresh jobs or expose credentials. Providers marked
`not_configured` remain visibly non-operational.

Authenticated runtime verification remains pending an authorized owner/admin
session; no scraper job was started during this batch.

System Settings is intentionally separate from Platform Health. Its preview
surface reads `/admin/settings` and renders the four current access flags as
disabled controls; it does not invoke the POST mutation contract.

The preview does not claim a complete Platform Health workspace. Existing TPI
operational sources include scraper-run records, Worker observability, D1, R2,
scheduled tasks, and application routes, but they do not yet form one verified
admin health contract with consistent permissions and failure semantics.

Status: NOT IMPLEMENTED IN PREVIEW. No paid telemetry or fabricated metric was
introduced.
