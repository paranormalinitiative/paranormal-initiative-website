# TPI-UI-003 Root Cause

The Settings workspace was not using the same effective outer geometry as
Administration. Although both pages had two-column grids, the Settings page
still applied a `width: min(100%, 1600px)` centered wrapper. At wide desktop
sizes that created an unnecessary inset and made the sidebar appear detached
from the Administration reference.

The account control was the collapsed state of the existing floating Messenger
panel. `member-shell.js` appended it to `document.body` and positioned it with
fixed viewport coordinates. The prior TPI-UI-002 top offset moved it away from
the header but did not reserve layout space, so it could still cover the first
sidebar/profile content row.

The repair uses existing primitives: Settings now fills the workspace content
column with the Administration sidebar width and treatment, while the
collapsed Messenger control is mounted into a dedicated header slot on the two
workspace routes. Opening Messenger returns the full existing panel to its
body-level movable position. No arbitrary content margin or business-logic
change was used.
