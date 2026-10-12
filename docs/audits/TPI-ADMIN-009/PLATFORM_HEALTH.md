# TPI-ADMIN-009 — Platform health

Status: **PARTIAL — read-only operational view**.

The preview reads the existing scraper/provider status contract and sanitized
run history. It displays explicit provider capability states, latest completed
runs, result counts, errors, and durations where the API supplies them. It does
not claim CPU, RAM, paid telemetry, email-delivery health, or security-event
metrics that are not backed by an existing contract.

Refreshing the view does not start a scraper job. Authenticated runtime review
and broader operational monitoring integration remain owner-review items.
