# TPI-DEV-018 — Administration Center Functional Completion

This directive continues TPI-DEV-017 in the development-only checkout. It authorizes source implementation, synthetic/offline verification, and guarded deployment to `theparanormalinitiative-dev`. Production, database imports, Tavily research, external scraping, pushes, and merges remain out of scope.

The implementation uses the existing Administration Center preview, protected Worker routes, D1 schema, authorization helpers, and audit contracts. Unsupported operations remain bounded rather than being represented by placeholder controls.

## Safety boundaries

- Canonical source: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- Development Worker only: `theparanormalinitiative-dev`
- Founding 50 activation remains fail-closed with `FOUNDING50_DEVELOPMENT_ACTIVATION=disabled`.
- Paranormal Teams research data remains separate from Administration Center mutations.
- The authenticated Playwright visual runner from TPI-DEV-017 is preserved; its Chrome launch limitation is documented separately and is not repeated here.

## Functional focus

1. Surface real review-queue metrics on the dashboard.
2. Add creator-application detail and confirmed review-note persistence.
3. Add team detail and confirmed approval/rejection actions.
4. Add protected TPI Video detail inspection using the existing video endpoint.
5. Preserve all prior member, community, content, notification, settings, and claim-review boundaries.
