# StudioFlow Storage Audit

StudioFlow continues to persist schedules in `studioflow.broadcasts` in browser localStorage. Recording media and recovery data remain in the existing IndexedDB/storage-location paths. The TPI bridge stores only synchronization metadata inside each local broadcast: server broadcast ID, listing/channel IDs, revision, server state, pending operation, retry error, and conflict snapshot.

No recording blob, stream key, destination credential, or private media is sent to TPI by this bridge. Existing creator-owned storage and recording recovery remain unchanged. Folder and browser storage behavior are not reclassified as cloud synchronization.
