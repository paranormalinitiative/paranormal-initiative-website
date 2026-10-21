# TPI-OPS-006 — Local Development Environment Assessment

**Status:** Assessment complete; implementation intentionally not started.

**Scope:** Read-only assessment of the canonical TPI Worker, local bindings,
authentication, storage, StudioFlow, and agent access. This record does not
claim that a complete local environment is operational.

## Safety boundary

No local Worker was started by this directive. No remote development session,
deployment, database or R2 mutation, account creation, data copy, public
tunnel, package installation, application edit, authentication change,
StudioFlow change, commit, push, or merge was performed.

The existing StudioFlow room server on `127.0.0.1:8788` was observed but not
stopped or modified. No public browser QA was run.

## Repository and current-state evidence

| Item | Observed value | Classification |
| --- | --- | --- |
| Canonical checkout | `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website` | VERIFIED |
| Branch | `codex/tpi-development` | VERIFIED |
| HEAD | `7385f0cf24155f121bdc967a0985553daa8a05df` | VERIFIED |
| Root package manifest | None | VERIFIED |
| Worker entry | `worker.js` | VERIFIED |
| Production config | `wrangler.toml` | VERIFIED |
| Development config | `wrangler.dev.toml` | VERIFIED |
| Local Worker port | 8787 is free; no server was started | VERIFIED |
| Existing StudioFlow room service | `127.0.0.1:8788`, pre-existing PID observed | VERIFIED |
| Local D1/R2 state | `.wrangler/state` exists, but no verified TPI bootstrap/database state was established by this directive | VERIFIED / INCOMPLETE |
| Current worktree | Dirty with pre-existing user changes | VERIFIED; preserved |

The worktree was not cleaned, reset, or normalized. All unrelated changes
remain outside this documentation-only change.

## Existing application architecture

The canonical application is a Cloudflare Worker with static assets and an API
router. `worker.js` serves assets through `env.ASSETS`, routes `/api/*` to
`functions/api/[[path]].js`, applies page/server gates, injects development
indicators, and owns the scheduled scraper entry point. The application has no
root `package.json`; the React Administration Center is a separate Vite app in
`admin-center-app/`.

The existing local documentation describes the Admin Center Vite workflow and
historical `wrangler dev` usage, but a current end-to-end local Worker setup was
not verified. The guarded deployment script is remote/development deployment
machinery and is not a local launcher.

## Cloudflare binding assessment

Cloudflare documents local `wrangler dev` as a local `workerd` runtime with
local simulations for supported bindings. D1 and R2 are both supported in
local development, and local state can be persisted to a chosen directory.
See [Cloudflare local development](https://developers.cloudflare.com/workers/local-development/),
[D1 local development](https://developers.cloudflare.com/d1/best-practices/local-development/),
and [R2 Workers API local development](https://developers.cloudflare.com/r2/get-started/workers-api/).

This means a local-first implementation is technically feasible without
connecting to production resources. It does not mean this repository is ready
to run locally today: the current configs point at named Cloudflare resources,
the migration history has drift/ordering issues, and no approved local schema
bootstrap or fixture procedure has been verified.

| Capability | Assessment | Required before implementation is called complete |
| --- | --- | --- |
| Worker execution | CONDITIONALLY READY | Add and verify a local-only Wrangler config and launcher |
| Static assets | LIKELY COMPATIBLE | Verify asset packaging and Worker asset routing locally |
| D1 | SUPPORTED BY PLATFORM; NOT READY IN THIS REPO | Build a local schema snapshot/bootstrap from reviewed SQL; never use remote bindings |
| R2 | SUPPORTED BY PLATFORM; NOT READY IN THIS REPO | Use a dedicated local persistence path and synthetic media fixtures |
| Scheduled jobs | MUST BE DISABLED | Local config must have no cron and local code must not trigger scrapers by default |
| Admin Center Vite app | LOCALLY BUILDABLE IN ISOLATION | Coordinate its proxy/base URL with the local Worker |

Cloudflare’s default local binding behavior is distinct from
`wrangler dev --remote`; the future local workflow must not use remote bindings
or `--remote` for routine development.

## Authentication and authorization

Authentication is database-backed. `lib/auth.js` reads the `tpi_session` cookie,
joins sessions to contributors, enforces expiration/active status, and applies
creator entitlement checks. API authorization is therefore structurally
compatible with local execution, but it requires synthetic local D1 fixtures.

The current login cookie is `HttpOnly; Secure; SameSite=Lax`. Plain HTTP local
testing may not preserve a Secure cookie in every browser context. A future
implementation must choose one of two explicit, local-only solutions:

1. Serve local development over HTTPS with a trusted local certificate; or
2. Add a narrowly scoped local-only cookie policy that cannot be selected by
   development or production deployments.

The second option must fail closed outside `TPI_ENV=local`; production and
hosted development cookie behavior must remain unchanged.

Required synthetic role coverage includes anonymous, ordinary member, muted
member, creator-entitled, admin/owner, revoked-entitlement, and cross-account
records. Existing `scripts/e2e/seed-local.sql` is a useful fixture starting
point, but it is not yet a verified complete local application fixture.

## Storage and media

The application uses D1 for relational state and `env.TPI_MEDIA` for profile,
article, messenger, StudioFlow, and other media paths. No remote D1 export or
R2 object copy is authorized for local development. Local media must be
synthetic and separately namespaced.

The repository’s migration set is not a safe one-command local bootstrap as-is:
it contains duplicate/out-of-sequence names and historical schema drift. The
future implementation must create a reviewed local schema manifest rather than
blindly replaying the entire historical backlog or assuming remote migration
ledger completeness.

## External services and outbound isolation

The source contains outbound-capable paths for Resend email, RealtimeKit,
external link previews, event/news/video feeds, and third-party media embeds.
Production scheduled scraping is disabled by the development Wrangler config,
but a local environment needs a stronger fail-closed boundary.

The future local guard should:

- set an explicit local environment marker;
- reject production and hosted-development Worker targets;
- disable scheduled and manual external refresh by default;
- stub email, RealtimeKit, scraper, and link-preview calls;
- allow only fixture/localhost targets unless a test explicitly opts in;
- preserve same-origin relative API calls;
- log blocked outbound attempts without secrets.

No code was changed to add that guard in OPS-006.

## StudioFlow and local collaboration

The separate StudioFlow web project has a loopback Vite workflow and a
pre-existing room server on `127.0.0.1:8788`. That room server uses in-memory
rooms, guests, signals, and SSE; it is not a D1/R2 persistence substitute and
its state disappears on restart. It must remain a separate, explicitly started
local dependency.

Workspace persistence belongs to the Worker/D1 path and needs the local D1
binding. Browser recordings remain browser-local unless a creator explicitly
exports them; local development must not auto-upload or delete them. External
RealtimeKit/RTMP behavior must be disabled or mocked locally.

## Agent and browser access

Access from a same-machine browser to `127.0.0.1` is the safest expected model.
FreeBuff/OpenCode agent browser reachability was not verified in this
assessment. A future implementation must test the actual execution topology
before claiming multi-agent access. It must not solve reachability with a public
tunnel, port forwarding, or a default LAN bind. Separate synthetic browser
profiles and account fixtures are required for concurrent agents.

## Assessment result

| Gate | Result |
| --- | --- |
| Source architecture understood | PASSED |
| Local Worker concept supported by platform | PASSED, platform-level |
| Current local Worker launch verified | NOT TESTED by design |
| Local D1 schema/bootstrap verified | BLOCKED / NOT READY |
| Local R2 persistence verified | NOT TESTED |
| Local auth session flow verified | NOT TESTED |
| Outbound isolation verified | NOT READY |
| StudioFlow loopback dependency identified | PASSED |
| Multi-agent/browser reachability verified | NOT TESTED |
| Local environment implementation | NOT AUTHORIZED in OPS-006 |

**Conclusion:** the repository has a viable path to a safe local-first
environment, but the environment is not operationally verified. The next
authorized directive should implement the isolated local config, fixture
bootstrap, outbound guard, launcher, and test matrix described in the companion
architecture and implementation-plan documents.

