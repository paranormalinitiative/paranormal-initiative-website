# TPI-VIDEOS-004 Scheduling

Implemented fields: `scheduled_at` and `scheduled_timezone` on the canonical
broadcast and linked TPI listing. ISO schedule parsing is validated and the
timezone label is retained for display/integration purposes.

Explicit publication requires a future scheduled time when one is supplied.
Publication does not start a broadcast automatically. The existing StudioFlow
behavior remains the source of actual Go Live control.

Local isolated E2E: PASS for creation, draft visibility, explicit publication,
upcoming discovery, and authorization. Daylight-saving transitions, physical
device clocks, and automatic provider scheduling: NOT YET VERIFIED.
