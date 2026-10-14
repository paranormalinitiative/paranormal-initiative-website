# TPI-DEV-019 — Administration Center Final Workflows

This directive completes the remaining development-only Administration Center workflow gaps after TPI-DEV-018. It covers Education Center article details and editing, recipient-scoped administrative notification management, Paranormal Teams history, and Creator Studio administration visibility.

## Boundaries

- Canonical checkout: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- Runtime: `theparanormalinitiative-dev`
- Production, production D1/R2, member accounts, authentication, secrets, deployments outside development, research imports, Tavily, and external scrapers remain out of scope.
- Founding 50 activation remains owner-gated and disabled in the development configuration.

## Implementation contract

### Education Center

`GET /api/admin/articles/:id` returns the supported article fields, including the existing `body_html` and `article_html` content, plus administrative history. `PUT`/`PATCH /api/admin/articles/:id` validates the title, destination, and body, preserves the existing article columns, writes `article.updated`, and requires the loaded `updated_at` value when supplied. A stale save returns `409 ARTICLE_EDIT_CONFLICT`; publication remains the existing separate status action.

### Notifications

The existing metadata queue remains bounded and does not expose notification bodies or action URLs. The queue now supports type filtering and identifies rows whose recipient is the current admin session. Detail, read, unread, and read-all actions are protected by recipient ownership. Non-owned notification detail remains metadata-only; owned detail may navigate to its existing action resource.

### Paranormal Teams

`GET /api/admin/teams/:id/history` returns the team summary, append-only verification events, claim records, and matching administrative audit rows. Team approval, rejection, status changes, verification events, and claim reviews now append audit records without rewriting historical evidence.

### Creator Studio administration

`GET /api/admin/creators/:username` aggregates the existing contributor account, partnership memberships, Founding 50 applications, Creator Studio entitlements, owned channels, and related administrative history. The interface is read-only for allocations and entitlements. Creator Studio access continues to use its separate entitlement gate.

## Verification

The implementation is validated by the focused `scripts/qa/tpi-dev-019-source.mjs` suite, the existing Administration Center preview suite, the TPI-DEV-018 suite, the prior authorization/partnership suites, TypeScript/Vite build, and JavaScript syntax checks. Authenticated browser visual acceptance remains a separate owner-acceptance step because the previously documented browser-launch limitation was not repeated or bypassed.
