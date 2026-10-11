# Offline Recovery

When a bridge request fails, StudioFlow preserves the local schedule and stores a pending operation, timestamp, attempt count, and error in the same local broadcast metadata. The next authenticated app load attempts each pending operation once; the row also exposes a manual Retry sync control. A successful response clears the pending operation.

No failed bridge request deletes recordings, schedules, or library entries. Physical offline/network-loss testing in a signed-in production browser remains an owner verification item.
