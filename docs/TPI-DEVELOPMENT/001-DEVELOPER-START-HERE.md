# Developer Start Here

## Before changing code

1. Work only in /Users/toddknipple/Documents/GitHub/paranormal-initiative-website.
2. Run git status --short and preserve unrelated changes.
3. Read the applicable directive in docs/TPI-DEVELOPMENT/100-DIRECTIVES/DIRECTIVE-INDEX.md.
4. Confirm whether the work is local-only, preview-only, or explicitly production-authorized.
5. Do not use the configured root wrangler.toml for development deployment until isolation is verified.

## Source and feature locations

- Public pages and site assets are in the repository root.
- The Cloudflare Worker entry point is worker.js.
- Wrangler configuration is wrangler.toml.
- The new Administration Center source is admin-center-app/.
- Historical audits and implementation reports remain under docs/.

## Safe workflow

Use the sequence in 005-PRODUCTION-DEPLOYMENT.md: local work, local tests, isolated Cloudflare development, development acceptance, owner approval, then separately authorized production release.

## Evidence rules

Label results as verified, implemented, partial, blocked, or not tested. A successful build is not proof of authentication, state isolation, or authenticated production behavior.
