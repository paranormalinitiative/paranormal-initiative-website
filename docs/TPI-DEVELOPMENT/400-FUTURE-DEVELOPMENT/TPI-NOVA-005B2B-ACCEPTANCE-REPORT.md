# TPI-NOVA-005B2B — Professional Tables Acceptance Report

**Date:** 2026-11-07
**Status:** COMPLETE
**Authoritative development origin:** `http://127.0.0.1:8787/`
**Scope:** Bounded professional table schema, central table commands, contextual Design/Layout controls, and browser persistence.

## Result

Nova tables now support a structured professional-table foundation without changing
the canonical document envelope or adding a database migration.

Implemented:

- bounded table width, percentage width, AutoFit, alignment and indentation;
- bounded table style presets, borders and border colours;
- bounded row height and cell shading/alignment;
- central insert, row, column, merge, split, sizing and formatting commands;
- Home and Insert table actions plus contextual Design and Layout ribbon controls;
- renderer and browser-converter parity for rich table attributes;
- exact legacy simple-table output preservation;
- unsafe table values rejected before publication HTML;
- live table editing, autosave, reload, read-only and responsive acceptance.

## Verification

| Gate | Result |
|---|---:|
| Focused 005B2B table verifier | 6 passed, 0 failed |
| Nova Core verifier | 105 passed, 0 failed |
| Shared-editor verifier | 13 passed, 0 failed |
| Publication snapshot verifier | 60 passed, 0 failed |
| Persistence verifier | 67 passed, 0 failed |
| Home ribbon verifier | 5 passed, 0 failed |
| Nova 005B2A foundation verifier | 23 passed, 0 failed |
| Full browser acceptance | 134 passed, 0 failed |
| Firefox Developer Edition | 80 passed, 0 failed |
| Responsive acceptance | 5 passed, 0 failed |
| Chromium secondary smoke | 7 passed, 0 failed |
| TypeScript, syntax and diff checks | passed |

## Browser acceptance

Authenticated Firefox acceptance on the integrated 8787 origin verified table
insertion, header-row creation, row and column add/remove, cell editing,
autosave, reload, read-only state and responsive layout. Chromium completed the
secondary shell, edit, reload and tablet-width smoke pass.

The persistent 8787 Worker was not restarted or replaced. Production was not
touched.

## Environment and cleanup

- The 8788 room-server log remains the original healthy startup line, but no
  listener was present during this verification pass; no 8788 process was changed.
- The Nova Core verifier now chooses a free ephemeral port by default, matching
  the other disposable verifiers.
- No fixed 8792 Worker listener exists.
- Throwaway verifier state was isolated from the official `.local-dev` state.

## Attribution boundary

The table implementation is Nova-owned source. GenOffice remains a behaviour and
capability reference only; no GenOffice source was copied or imported.

**TPI-NOVA-005B2B — COMPLETE — PROFESSIONAL TABLE FOUNDATION VERIFIED**
