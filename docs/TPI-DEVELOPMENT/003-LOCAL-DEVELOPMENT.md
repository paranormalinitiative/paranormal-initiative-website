# Local Development

## Use the canonical checkout

Run local development only from:

    /Users/toddknipple/Documents/GitHub/paranormal-initiative-website

Do not use the Desktop archive/research workspace for development deployment. Preserve its uncommitted work and research data; do not synchronize it automatically.

## Administration Center

The following scripts are verified from admin-center-app/package.json:

    cd /Users/toddknipple/Documents/GitHub/paranormal-initiative-website/admin-center-app
    npm install
    npm run dev

The Vite development server is configured with --host 127.0.0.1; the exact free port is selected by Vite and should be read from the command output. Use npm run build for a production build and npm run preview to serve the built application locally.

This Vite server is only for the separate Admin Center application. It is not
the StudioFlow owner-facing development environment and must not be substituted
for `http://127.0.0.1:8787/studio/`.

## Public Worker

The canonical local Worker is managed through the repository-scoped launcher:

    npm run dev:local

Use the owner-controlled LaunchAgent commands in the local user guide for
service lifecycle operations. Do not substitute an unscoped `npx wrangler dev`
command: the guarded launcher selects `wrangler.local.toml`, loopback port
8787, local D1/R2 simulations, and outbound-disabled environment variables.
Do not use remote D1 or R2 mutation commands while experimenting locally.

The official owner-facing StudioFlow URL is
`http://127.0.0.1:8787/studio/`. Its local D1/R2 state is persisted under the
repository's `.local-dev/state/v3`; changing ports creates a separate browser
origin and does not expose the owner's existing Studios or recordings.

## StudioFlow source and asset staging

The authoritative StudioFlow source is
`/Users/toddknipple/Documents/StudioFlow/web`; the integrated website copy is
`studio/`. Verify the source/integration candidate with:

    node scripts/stage-studioflow-authoritative.mjs

This builds twice in isolated temporary directories, preserves the maintained
TPI bridge layer, and checks generated asset equivalence. Local staged delivery
uses the current entry-point asset names and deterministic content versions:

    node scripts/stage-local-studio-assets.mjs

Verification-only staging does not copy a new build into `studio/`. To integrate
a reviewed source revision for commit and release, use
`node scripts/stage-studioflow-authoritative.mjs --apply`, then review every
changed website file. Neither command pushes Git nor deploys a Worker. Follow
`TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md` for the complete chain.

Do not hand-edit generated bundle filenames or introduce a second cache-busting
system. Keep local D1/R2 state, browser storage, recordings, owner media, and
credentials outside any release checkpoint.

## Checks

Use `git status --short` before and after work, preserve unrelated changes, and run `git diff --check` before any future commit. Run the relevant package tests and build scripts. Stop local servers with the terminal process control used to start them; do not kill unrelated processes.

Local tests must use isolated fixtures. Do not point local experiments at production D1/R2 for mutation, and do not treat the current workers.dev endpoint as a development server.

## Isolated development deployment

From the canonical checkout on `codex/tpi-development`, run:

    ./scripts/deploy-development.sh

The script verifies the branch and development bindings, stages a sanitized asset directory that excludes secrets and internal files, and deploys with `wrangler.dev.toml`. It must not be replaced with a generic `npx wrangler deploy` command.

This updates only the optional isolated development Worker. It does not update
`paranormalinitiative.com` and is not a substitute for the guarded production
release or live production acceptance.
