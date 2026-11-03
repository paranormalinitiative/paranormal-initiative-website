# Nova technology compatibility spike (TPI-NOVA-002)

Isolated experiment. **Not deployed. Not part of StudioFlow.** Nothing here is
imported by the website Worker, StudioFlow, or any production route.

This app exists only to prove that the Nova editor stack runs in Firefox Developer
Edition (authoritative) and Chromium, serialises to structured JSON, and builds to a
usable bundle. Results are recorded in
`docs/TPI-DEVELOPMENT/400-FUTURE-DEVELOPMENT/TPI-NOVA-PRODUCT-FAMILY-ARCHITECTURE-AND-ROADMAP.md`
§18.

## Isolation rules

- `experiments` and `experiments/**` are listed in the root `.assetsignore`, so this
  directory can never be uploaded as Worker assets.
- `dist/` is gitignored. `node_modules/` is gitignored by the root `.gitignore`.
- Do not import from this directory into the website or StudioFlow.
- Do not add D1, R2, Worker auth, APIs or Nova routes here. Persistence begins in
  Nova-003.

## Commands

```sh
cd experiments/nova-spike
npm install
npm run dev             # http://127.0.0.1:5180/
npm run typecheck
npm test                # vitest: document + slide model tests
npm run build           # tsc --noEmit && vite build
npm run check:firefox   # headless Firefox Developer Edition acceptance (needs dev server)
npm run check:chromium  # Chromium compatibility (needs dev server)
```

Browser checks expect the dev server on port 5180. The Firefox check uses
`geckodriver` and `/Applications/Firefox Developer Edition.app`; the Chromium check
uses the Playwright Chromium already installed in the repository root. Neither adds a
runtime dependency. `scripts/firefox-screenshot.mjs` launches a real Firefox window
and writes viewport PNGs to `/tmp` for visual inspection.

## What it proves

- Documents: paragraph, heading, bold, italic, bulleted and numbered lists, link,
  image node, table, undo, redo. Canonical storage is the versioned JSON envelope
  `{ format: "nova-document", version: 1, doc }`, never HTML.
- Slides: two-slide presentation with text, rectangle, image placeholder and
  background; select, drag, resize, reorder, duplicate, delete. Canonical storage is
  `{ format: "nova-presentation", version: 1, presentation }` and contains no
  selection, zoom, drag, transformer or guide state.

## Known limits

Both stacks are imported into one page here, which produces a single ≈1 MB chunk and
a Vite chunk-size warning. Nova must serve Documents and Slides as separate lazy
routes. Image elements are placeholders with no asset pipeline.
