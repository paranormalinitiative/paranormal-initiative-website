# TPI-VIDEOS-010 Duration Repair

Production `videos.duration_seconds` values were confirmed as durations, not
view counts. The deployed formatter accepts explicit seconds for discovered
providers and explicit `M:SS`/`H:MM:SS` values for creator-authored records.
Numeric values without a proven unit, nulls, zero, invalid, and negative values
remain unrendered rather than being guessed.

Verified examples: `4418 → 1:13:38`, `799 → 13:19`, `31 → 0:31`,
`140 → 2:20`, `1648 → 27:28`, `900 → 15:00`, `341 → 5:41`, and
`60 → 1:00`.
