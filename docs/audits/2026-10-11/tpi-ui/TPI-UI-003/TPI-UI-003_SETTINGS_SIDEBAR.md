# TPI-UI-003 Settings Sidebar

The Settings Center retains its existing Settings-specific categories and
`data-settings-nav` search/navigation hooks. Its sidebar now uses the same
outer positioning model as Administration rather than a narrower centered page
wrapper.

Implemented alignment:

- flexible `248px` sidebar column;
- flexible main content column;
- 24px outer gap;
- sticky top position at the same workspace offset;
- matching border radius, padding, background, and border treatment;
- preserved Settings search input, details navigation, status region, and
  existing JavaScript filtering.

The implementation does not copy Administration navigation items into Settings
and does not remove or invent Settings features.
