# TPI-MEDIA-001 Defects and Repairs

## Repaired

**TPI Videos desktop grid showed three cards instead of four.** Root cause was the more-specific shared member-shell `auto-fill` rule. The page now uses matching `body.member-mode .video-grid` specificity and renders four cards at the wide desktop target.

## Not repaired because no defect was confirmed

No StudioFlow rebuild, database replacement, storage migration, public livestream launch, or public creator-recording URL invention was performed.

## Open limitations

Actual creator recording-to-public playback, physical device interruption/recovery, authenticated production workflows, long-duration behavior, and formal accessibility remain unverified.
