# TPI-UI-001 Regression Results

## Automated checks

- `node scripts/verify/workspace-layout.mjs` — **PASS**
- `node --check member-shell.js` — **PASS**
- `node --check admin-center.js` — **PASS**
- `node --check member-settings.js` — **PASS**
- `node --check includes.js` — **PASS**

The focused regression confirms that only the two dedicated routes carry `workspace-page`, that existing internal navigation hooks remain, that public include anchors remain, and that ordinary member pages are not converted to the dedicated shell.

Authenticated interaction, production visual layout, and mutation regression checks remain pending the production smoke phase and owner review.
