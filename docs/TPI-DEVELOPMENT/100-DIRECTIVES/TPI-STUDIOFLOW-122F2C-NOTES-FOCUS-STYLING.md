# TPI-STUDIOFLOW-122F.2C — Final Notes Editor Focus Styling Correction

Date: 2026-10-31  
Status: COMPLETE / AUTHORITATIVE LOCAL DEVELOPMENT / NOT DEPLOYED

## Objective

Remove the remaining green horizontal focus line from the Notes writing area
without changing the rich editor, automatic focus, caret, attachments,
autosave, revisions, or production state.

## Root cause

The line was produced by the scoped rule in the StudioFlow source stylesheet:

```css
.notes-rich-editor:focus-visible {
  box-shadow: inset 0 -2px 0 color-mix(in srgb, var(--blue) 58%, transparent);
}
```

The earlier D122F.2A perimeter box had already been removed. The remaining
`inset` shadow was the bottom-only focus cue visible across the writing area.

## Correction

The `:focus-visible` inset shadow was removed. The editor now uses only
scoped, theme-token surface tints:

```css
.notes-rich-editor:focus {
  background: color-mix(in srgb, var(--bg) 96%, var(--blue) 4%);
}

.notes-rich-editor:focus-visible {
  background: color-mix(in srgb, var(--bg) 93%, var(--blue) 7%);
}
```

No border, outline, or replacement line was added. The existing caret and
rich-editor focus behavior remain unchanged. The keyboard-visible indication
is the restrained document-surface tint, scoped only to `.notes-rich-editor`.

## Source and staged assets

- Source worktree: `/Users/toddknipple/Documents/StudioFlow/web-122`
- Source branch: `codex/studioflow-122-notes`
- Source commit: `eb6d09d991d851d8f92853e60a2ecb8c0f934e87`
- Website branch: `codex/tpi-development`
- JavaScript: `index-BZJV5-la.js` — SHA-256
  `a06403c49de188a6e5d534f00512e05da58271dde48f74bafe4598ae6d1306af`
- CSS: `index-CfXSYfAg.css` — SHA-256
  `ca4a20d0bbf23696f0baad2bdbe2c7f6f1961f1190b654457eccc4adcd33f415`
- Authoritative URL: `http://127.0.0.1:8787/studio/`

The isolated source build, exact asset manifest, staged assets, integrated
entry point, and reproducible second build all passed the provenance workflow.

## Verification

| Check | Result | Evidence |
| --- | --- | --- |
| Source rule inspection | PASS | The old `:focus-visible` inset shadow is absent; the new scoped background rules are present. |
| Live Firefox rendered editor check | PASS | The staged editor was reached in Firefox Developer Edition. Computed styles reported `box-shadow: none`, `border-bottom-style: none`, `border-bottom-width: 0px`, `outline-style: none`, and a non-transparent caret color. |
| Focused Notes acceptance | UNVERIFIED | The full disposable Notes harness was attempted twice and stalled before emitting a result; this is the same broader fixture-hydration instability recorded under D122F.2B. The targeted live focus-style check passed. |
| Existing caret/focus behavior | PASS (inherited) | D122F.2A and the 122F.2 addendum passed the start-caret and immediate-writing checks; this CSS-only change does not alter `NotesView.tsx` focus logic. |
| Maintained Firefox regression | PASS | 64/64 in an isolated Firefox Developer Edition profile; owner profile was not accessed. |
| Release safety | PASS | 21/21. |
| Source provenance and staging | PASS | Exact source commit, clean worktree, reproducible build, asset hashes, and staged asset comparison passed. |
| Production | UNCHANGED | No production command, route, asset, data, or Worker was modified. |

The full Notes harness limitation is not silently reclassified as a pass. It
does not invalidate the narrowly scoped CSS correction, but it leaves the
broader inherited D122F.2B attachment/image persistence gaps unchanged.

## Files changed

- StudioFlow source: `src/styles.css` only.
- Website verifier: `scripts/verify/tpi-studioflow-122-notes.mjs` updated to
  expect no editor shadow and to inspect live computed focus styles.
- Website staging manifest: `scripts/studioflow-release-baseline.json`.
- Website generated local candidate: `studio/index.html`,
  `studio/assets/index-BZJV5-la.js`, and `studio/assets/index-CfXSYfAg.css`.
- Documentation: this execution record and the maintained status, handoff,
  testing, source-to-live, and directive-index records.

No database migration, attachment-storage change, application-data change, or
production deployment occurred.

## Release status

This is a development-only correction staged for owner inspection on port
8787. It is not a production release candidate under the directive and does
not resolve the separate D122F.2B broader Notes verification gaps.
