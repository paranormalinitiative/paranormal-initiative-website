# TPI-ADMIN-002 Baseline

Starting baseline: `cfaf512` on `main`, following the TPI-ADMIN-001 runtime
foundation (`29db893`) and Cloudflare deployment `9fe57737-4643-4171-a729-b9a8aa00ce19`.

The canonical application is the existing static HTML/Cloudflare Worker/D1
site. `admin-panel.html` is the protected entry point. The baseline already
had server-side admin HTML gates, live D1 overview counts, member controls,
community moderation, settings, team approvals, audit logging, and a truthful
Founding 50 status surface. It did not yet have real trend data, paginated
administrative directories, or Creator Partnership allocation records.

Unrelated dirty files were present before this directive and remain outside
the release boundary. No production membership, entitlement, recording, R2,
or public Creator Studio access is activated by this batch.
