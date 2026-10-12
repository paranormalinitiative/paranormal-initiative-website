#!/bin/sh
set -eu

node scripts/verify-development-config.mjs
exec node scripts/deploy-development.mjs
