# TPI-UI-001 Layout Audit

## Root cause

The generic member shell wrapped the two dedicated pages without route-specific layout rules. That produced a generic member sidebar plus the page's own internal sidebar, and left public header/footer spacing active.

## Correction

`workspace-shell.css` is loaded only by the two dedicated pages. Its selectors are scoped to `body.workspace-page` and hide the public header/footer and generic member navigation, remove the generic left offset, and give the existing page content the full available width. The ordinary member pages retain the existing shared shell.

No business logic, API route, database, R2, recording, role, or membership code was changed.
