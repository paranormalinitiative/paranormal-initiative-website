# TPI-VIDEOS-002 Baseline

Date: 2026-10-11

Canonical source: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`

Scope: repair the two TPI-VIDEOS-001 security findings and implement the
smallest safe creator-publishing/channel foundation without changing
StudioFlow, Creator Studio access, `/live-video`, scraped discovery, or
creator recording storage.

Baseline findings:

- The existing scraped catalog remains read-only discovery data.
- `tpi_videos` already existed but its authored create/update/lifecycle path
  required server-side ownership and publication controls.
- The source and embed validation path required a single reviewed allowlist.
- No creator-owned channel table existed before migration 0042.
- Production inspection was anonymous/read-only; no production rows were
  created by this batch.

Status: implementation complete locally; production status is recorded in
`TPI-VIDEOS-002_PRODUCTION_VERIFICATION.md` and the release report.
