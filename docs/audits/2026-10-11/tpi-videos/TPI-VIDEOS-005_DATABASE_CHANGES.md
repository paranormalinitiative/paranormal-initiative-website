# Database Changes

No new migration was needed. 005 reuses the additive columns and indexes delivered by `migrations/0044_tpi_broadcast_integration.sql`, especially `sync_version`, `last_sync_at`, broadcast/listing identity, schedule, visibility, playback, replay, and moderation fields.

No D1 reset, row deletion, R2 change, recording migration, or new infrastructure was performed.
