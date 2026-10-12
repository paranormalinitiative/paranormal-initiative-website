# TPI-PROJECT-001 — Theme verification

TPI-ADMIN-007B had already replaced the protected Refine preview's generic
white/blue palette with the exact six-theme system sourced from TPI `style.css`
and `member-shell.js`. This directive preserved that implementation and did
not invent new colors or introduce a second preview application.

The existing theme regression suite verifies the TPI dark tokens, semantic
shadcn mappings, sidebar/chart variables, all six themes, and removal of the
former generic light palette. The normal default remains the existing `cryptid`
theme architecture; other supported themes remain `seance`, `cosmic`, `asylum`,
`fieldops`, and `gothicnight`.
