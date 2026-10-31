# TPI-STUDIOFLOW-122F.1 — Organization Collapse Button Correction

Date: 2026-10-31
Status: **COMPLETE / AUTHORITATIVE LOCAL DEVELOPMENT / NOT DEPLOYED**
Production deployment: **NOT AUTHORIZED**

## Correction

The Notes collapsed state now reserves a dedicated 32px organization rail in
the workspace grid. The expand button is a normal grid item inside that rail,
with its own border and background separation. It no longer uses absolute
positioning over the Note Library. The expanded collapse button remains beside
the `Organize` heading. Existing selected note, editor DOM, autosave state and
library width are unchanged.

At narrow responsive widths the rail becomes a full-width, keyboard-accessible
toggle row rather than overlapping the stacked panels.

## Provenance

| Item | Value |
| --- | --- |
| Source worktree | `/Users/toddknipple/Documents/StudioFlow/web-122` |
| Source branch | `codex/studioflow-122-notes` |
| Source commit | `b9a7772fec70ceb4143deaa03963b89072a56564` |
| Website commit | `3ec0888a3e7b144473ede7284122c2aef8e5b416` |
| Development URL | `http://127.0.0.1:8787/studio/` |
| JavaScript | `index-lCAgDCwK.js` |
| JavaScript SHA-256 | `240717548162c54cdbad49289b375e6c17e9c85e058f012ab46cf01cbed5ed48` |
| CSS | `index-D9akxKCz.css` |
| CSS SHA-256 | `bc541f62a96352584b811fdc308bf4f4b71888fd7d586b4285887fbc2839f980` |
| Database/storage changes | none |
| Production | unchanged; not deployed |

## Acceptance

| Requirement | Result |
| --- | --- |
| Expanded button beside Organize | PASS |
| Collapsed state becomes a narrow rail | PASS |
| Expand button is inside the rail | PASS |
| Note Library heading unobstructed | PASS |
| Repeated collapse/expand path | PASS |
| Selected note/editor state preserved | PASS; layout-only source change |
| Responsive layout | PASS; desktop and narrow Firefox checks |
| Focused rail/non-overlap verifier | PASS, 13/13 |
| Maintained StudioFlow regression | PASS, 64/64 Firefox |
| Release safety | PASS, 21/21 |
| Source/staging provenance | PASS; clean build twice and verify-only |

The focused test used an isolated authenticated Firefox Developer Edition
profile and checked rendered geometry: the rail width was within the 24–40px
bound, its right edge was before the library panel, and the library heading was
inside the library bounds. No owner Studio, note, recording, database or
production service was used or modified.
