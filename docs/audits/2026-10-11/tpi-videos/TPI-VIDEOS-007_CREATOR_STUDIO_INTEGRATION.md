# TPI-VIDEOS-007 Creator Studio Integration

The existing TPI-VIDEOS-005/006 bridge remains the single StudioFlow-to-TPI
identity path. This directive does not add a second sync system and does not
change the bridge API.

StudioFlow schedules and listing metadata may synchronize through the existing
authenticated bridge. Browser-local StudioFlow recording blobs and folder
handles are not public URLs and are not automatically uploaded, published, or
sent to TPI playback. A creator must provide an approved public playback source
through the existing publication workflow before TPI can render it.

Status: bridge preserved; public recording playback integration remains
unverified and intentionally not inferred from local recording success.
