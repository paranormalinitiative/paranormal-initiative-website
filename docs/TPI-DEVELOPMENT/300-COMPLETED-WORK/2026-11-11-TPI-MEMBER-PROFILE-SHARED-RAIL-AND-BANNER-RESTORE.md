# Member Profiles: Shared Right Rail and Owner Banner Restore

Date: 2026-11-11
Status: `DEPLOYED_AND_VERIFIED`

## Changes

- Kept the shared profile right rail visible when viewing another member, so
  member profile pages use the same layout.
- Loaded the viewed member's honors and distinctions into that shared rail;
  the rail no longer shows the viewer's honors while visiting someone else's
  profile.
- Restored the TPI banner fallback only for Todd Wayne when no custom banner
  is set. A saved custom banner takes precedence, and profiles without a saved
  banner remain blank for all other members.
- No production profile, media, membership, or honors records were modified.

## Verification

- Focused member profile API checks: 31/31 passed.
- Focused isolated Firefox profile checks: 32/32 passed, including the shared
  right rail on another member's profile, that profile's founding honor in the
  rail, the blank-banner behavior for an account without a saved banner, and
  preservation of a saved custom banner.
- Guarded release preflight: certified; all 30 release gates passed.
- Production schema readiness: passed; all required tables and columns were
  present and no migration was pending.
- Production anonymous smoke: 10/10 passed.
- Production isolated Firefox Developer Edition acceptance: 65/65 passed.
- New Worker version verified at 100% traffic; rollback was not needed.

The profile-specific Firefox checks used synthetic local members. The
production Firefox acceptance is the repository's standard authenticated
StudioFlow release smoke; no authenticated Todd or Heather production browser
session was used.

## Release

- Source commit: `534c27bfd7a2c82b160d0d042ce3f28acf7687d4`
- Release ID: `rel-534c27bfd7a2-30c6eb1fc999`
- Worker: `theparanormalinitiative`
- Deployed version: `6c66bb71-a4f4-494d-84ee-e1f29c5cf5bd`
- Rollback version: `e770f866-9e43-4f4a-b918-aeb436f13562`
- Guarded release result: `DEPLOYED_AND_VERIFIED`
