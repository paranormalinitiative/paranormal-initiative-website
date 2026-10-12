# TPI-DEV-002 Safe Migration Plan

This is a plan only. No resources, routes, domains, secrets, databases, buckets, schedules, or deployments were changed by TPI-DEV-002.

## Target architecture

Recommended target:

| Concern | Development | Production |
| --- | --- | --- |
| Worker | New distinct Worker, for example `theparanormalinitiative-dev` | Existing `theparanormalinitiative` |
| URL | New workers.dev URL or separately approved dev hostname | `https://paranormalinitiative.com/` |
| D1 | New development database with synthetic fixtures | `tpi_contributor_portal` (`f36b9161-b517-4634-9857-bef4147cefe3`) |
| R2 | New development bucket for test media | `tpi-contributor-media` |
| Auth | Separate session secret/namespace and test accounts | Existing production session/auth boundary |
| Cron | Disabled by default or development-only schedule | Existing six-hour scraper schedule |
| Admin | Protected `/admin-center-preview/` using dev auth | Existing `/admin-panel` and protected production preview |

## Phase 0 — Owner approval gate

Prerequisites:

- Approve the loss of the exact workers.dev hostname, or explicitly approve the riskier production migration in Option B.
- Approve names for the development Worker, D1 database, and R2 bucket.
- Approve development authentication and test-account policy.
- Approve whether development scrapers are disabled, manually triggered, or run against synthetic fixtures.

Failure condition: missing approval or any resource name that overlaps production.

Rollback: no changes have occurred; remain in the current state.

## Phase 1 — Build isolated configuration

Required changes:

1. Add a reviewed development Wrangler configuration or explicit named environment.
2. Set a distinct Worker name and explicit development `workers_dev`/preview behavior.
3. Bind only the development D1 and R2 resources.
4. Use separate secret names/values and a separate session namespace.
5. Set development cron to disabled or a safe development schedule.
6. Keep production configuration in a separately reviewed file or explicit production environment.
7. Add CI checks that reject production resource IDs in development config.

Verification:

- `wrangler deploy --dry-run` for each config reports the intended Worker and bindings.
- No production D1 ID, production bucket name, production custom domain, or production secret is present in the development config.
- Session cookies and test accounts are scoped only to the development host.

Failure condition: any inherited production binding, route, secret, cron, or custom domain.

Rollback: delete the un-deployed config changes from the branch; no Cloudflare mutation should have occurred.

## Phase 2 — Provision isolated state

Required changes, only after approval:

1. Create a development D1 database.
2. Apply schema migrations in order against the development database.
3. Seed only synthetic accounts, teams, posts, comments, reports, and media metadata.
4. Create a development R2 bucket with test-only objects and restricted access.
5. Do not copy passwords, sessions, private messages, private recordings, or private production media.

Verification:

- Schema table inventory matches the required application contract.
- Login/logout works with a development test account only.
- Development writes are visible only in the development D1/R2 resources.
- Production D1/R2 identifiers and sampled read-only metadata remain unchanged.

Failure condition: test data appears in production or development requests can reach production state.

Rollback: stop the dev Worker, revoke its development secrets, and remove only the newly created development test resources under a separately approved cleanup action. Never delete production resources.

## Phase 3 — Deploy development

Required changes:

- Deploy only the development config from a non-production branch or explicit development pipeline.
- Keep production `main` deployment automation disabled unless separately authorized.
- Publish the Administration Center under the protected development route.

Verification:

- Record the development deployment ID and version.
- Verify public pages, member auth, Community Feed, profiles, notifications, Messenger, videos, Education Center, Paranormal Teams, Creator Studio restrictions, and Administration Center against synthetic data.
- Verify anonymous users cannot reach protected admin assets or APIs.
- Verify production `/admin-panel`, `/live-video`, auth, D1, and R2 are unchanged.

Failure condition: production route changes, production binding references, auth crossover, or a public admin asset.

Rollback: roll back the development Worker version only; production is not touched.

## Phase 4 — Development acceptance

The owner reviews the development URL with a development test account. This is not production acceptance. Record navigation, responsive, authentication, administrative, media, and error findings. Repair and re-test on development only.

## Phase 5 — Separate production release

Prerequisites:

- Development acceptance complete.
- Owner explicitly authorizes a production release.
- Production diff reviewed against the approved commit.
- Production bindings, authentication, custom domain, cron, D1/R2 state, and rollback version recorded.

No production deployment is authorized by TPI-DEV-002.

## Option B alternate migration gate

If the owner insists on preserving `theparanormalinitiative.paranormalsomerset.workers.dev` for development, a separate directive must authorize moving `paranormalinitiative.com` to a new Worker. That directive must first deploy and validate the new production Worker, verify all bindings and secrets, confirm the custom-domain attachment, perform authenticated and anonymous smoke tests, then execute a short controlled domain transition with a documented rollback. The current Worker must not be renamed or deleted as an ad hoc step.

## Cost planning

Cloudflare’s current D1 documentation states that the Free plan includes prototyping/experimentation but enforces daily row limits; R2 has included monthly storage and operation allowances with usage charges beyond them. Separate development resources therefore may remain within current included limits for low-volume testing, but media and test traffic can create billable usage or hit Free-plan limits. Confirm current account billing before provisioning. Do not use production storage to avoid a development cost.

## Owner approvals required

1. Choose Option A/C (recommended) or explicitly authorize the higher-risk Option B.
2. Approve development resource names and creation.
3. Approve synthetic-data and test-account policy.
4. Approve development secrets and session namespace.
5. Approve development cron behavior.
6. Approve any later production promotion separately.
