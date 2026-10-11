# TPI-VIDEOS-004 Replay Management

Added explicit owner replay metadata action:
`POST /api/tpi-broadcasts/:id/replay`.

Replay publication stores a validated approved-provider reference and marks
the replay as published. It does not upload recording data, move a creator
file into TPI storage, or claim that the replay has been decoded successfully.
Unpublishing preserves the broadcast identity and metadata while removing it
from public replay discovery.

Local isolated E2E: PASS for replay publication and public replay discovery.
Actual replay playback/download verification: NOT YET VERIFIED.
