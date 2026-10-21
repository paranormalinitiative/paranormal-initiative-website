#!/bin/zsh

# Finder convenience launcher for the owner. Finder may open a brief Terminal
# window while this command starts the already-installed user LaunchAgent.
set -u
cd "/Users/toddknipple/Documents/GitHub/paranormal-initiative-website" || exit 1
export TPI_LOCAL_OWNER_CONTROL=1
NODE_BIN="/opt/homebrew/bin/node"

if ! "$NODE_BIN" scripts/local-dev-service.mjs start; then
  echo "TPI local development could not start. Run npm run dev:local:service:status for details."
  read -r "?Press Return to close..."
  exit 1
fi

if ! "$NODE_BIN" scripts/local-dev-service.mjs wait; then
  echo "TPI local Worker did not become ready at http://127.0.0.1:8787/"
  read -r "?Press Return to close..."
  exit 1
fi

/usr/bin/open "http://127.0.0.1:8787/"
