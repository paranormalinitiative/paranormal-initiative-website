# TPI-VIDEOS-004 Lifecycle

The additive lifecycle boundary uses the existing broadcast states:
`ready`, `live`, `ended`, and `cancelled`. Validated owner actions are exposed
at `/api/tpi-broadcasts/:id/status`; existing StudioFlow start/stop endpoints
use the same transition rules.

Invalid transitions are rejected. A live listing is not made publicly live by
status alone: playback must be independently verified before `is_live` or
public live discovery is enabled.

Local isolated E2E: PASS for ready → live → ended, invalid authorization, and
suppression of unverified live media.
