# TPI-STUDIOFLOW-010 — Recording Library Locations, External Storage and Cloud Destinations

Date: 2026-10-10
Canonical source: `/Users/toddknipple/Documents/StudioFlow/web`
Integration workspace: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`

## Implementation

The existing StudioFlow storage and recording systems were audited before this
batch. The implementation preserves the Browser Library, IndexedDB recording
blobs, sequential checkpoint chunks, recovery/discard, preview playback,
download, and delete paths.

The existing Settings interface now includes **Recording & Storage** with:

- current Library location;
- Change Library Location / Choose Folder;
- Open Library;
- Storage Information;
- Restore Default Location;
- Browser Library versus Computer Folder / External Drive destination;
- Save automatically after recording;
- Keep a local browser backup;
- disabled Remove temporary copy after verified save until migration safety is
  complete;
- explicit cloud-provider status.

For supported secure-context Chromium browsers, a selected folder receives
MediaRecorder chunks through a sequential writable stream. StudioFlow uses
collision-resistant names, checks permission, handles write/finalization failure,
reads the closed file back, verifies a non-zero exact byte count, and only then
indexes the file handle in the Library. IndexedDB checkpoints continue in
parallel as the recovery/fallback layer. Existing browser recordings are not
migrated and external originals are not silently deleted.

Google Drive and Dropbox remain **Requires Setup** because no verified OAuth,
credentials, resumable upload path, or real provider test exists. iCloud is
documented only as a local-folder fallback; no fake native API is used.

## Checks completed

- `git diff --check` — passed.
- `npm run check:room` — passed.
- `npm run check:rtmp` — passed.
- `npm run build` — passed (`tsc` and Vite production bundle).
- Local browser smoke — passed for the Settings tab, default Browser Library
  state, disabled unsupported folder destination, and fallback messaging.
- Generated candidate manifest — passed: canonical `dist/` and promoted JS/CSS
  assets are byte-identical; the existing TPI theme bridge was preserved.

## Evidence boundary

Actual selected-folder recording with owner camera/microphone media, controlled
folder disconnection/reload, long-session durability, native picker behavior on
all browsers, Google Drive/Dropbox upload, and iCloud-specific behavior remain
**NOT YET VERIFIED**. Camera, microphone, and creation of a local video
recording remain **OWNER VERIFIED — WORKING**, separately from automated checks.
Live broadcasting and webinar functionality remain **NOT YET VERIFIED**.

No production database change was made. The release copy changes only the
generated StudioFlow assets and documentation; the `/live-video` Coming Soon
surface and authenticated StudioFlow boundary remain preserved.
