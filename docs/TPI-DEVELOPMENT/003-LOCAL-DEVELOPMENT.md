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

## Public Worker

The root repository has no root package.json or root npm development script. Historical project documentation records Wrangler local development using:

    npx wrangler dev --compatibility-date 2026-07-15

That command was not re-run in this audit, so its current local port and current local D1 setup are not verified here. Do not use remote D1 or R2 mutation commands while experimenting locally.

## Checks

Use `git status --short` before and after work, preserve unrelated changes, and run `git diff --check` before any future commit. Run the relevant package tests and build scripts. Stop local servers with the terminal process control used to start them; do not kill unrelated processes.

Local tests must use isolated fixtures. Do not point local experiments at production D1/R2 for mutation, and do not treat the current workers.dev endpoint as a development server.

## Isolated development deployment

From the canonical checkout on `codex/tpi-development`, run:

    ./scripts/deploy-development.sh

The script verifies the branch and development bindings, stages a sanitized asset directory that excludes secrets and internal files, and deploys with `wrangler.dev.toml`. It must not be replaced with a generic `npx wrangler deploy` command.
