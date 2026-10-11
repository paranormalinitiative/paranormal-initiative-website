# TPI-UI-002 Root Cause

The shared workspace header used a flexible row, but the authenticated floating
Messenger panel's collapsed-dock routine still placed it at the top of the
viewport. On dedicated workspace pages that dock could occupy the same visual
band as the new title and action controls.

The workspace content also retained broad legacy constraints: the admin and
settings layouts did not explicitly own their route-scoped maximum width,
grid columns, or responsive card transitions. That allowed the page-specific
containers to appear narrower or more widely spaced than the available shell.

The correction is structural: the Messenger dock now uses a workspace-safe
position, headers reflow at an intentional tablet breakpoint, and both
workspace grids explicitly use `minmax(0, 1fr)` flexible content columns.

Post-deployment verification also found that the unchanged asset query strings
allowed an older edge-cached workspace stylesheet and member-shell script to be
served. The two workspace HTML entry points now use the next cache-busting
versions so the verified refinement reaches browsers.
