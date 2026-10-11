# TPI-VIDEOS-010 Defects and Repairs

**Confirmed defect:** discovered-video duration seconds were rendered raw on
video cards and the catalog had no duration filter.

**Repair:** explicit source-unit metadata, safe normalization, `M:SS` /
`H:MM:SS` presentation, unknown-duration handling, duration filtering, and
readable UTC-based publication dates. Added regression coverage in
`scripts/qa/tpi-video-format-regression.mjs`.

No confirmed StudioFlow, authentication, storage, routing, or Feed-security
defect was changed in this batch.
