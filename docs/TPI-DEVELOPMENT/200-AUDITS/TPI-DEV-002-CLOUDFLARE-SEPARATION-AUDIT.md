# TPI-DEV-002 Cloudflare Separation Audit

**Mode:** Read-only infrastructure audit and planning

**Audit date:** 2026-10-12

**Production changes:** None

**Cloudflare deployments:** None

## Executive finding

The preferred workers.dev address is not an independent development environment today. Cloudflare account metadata confirms that the account subdomain is `paranormalsomerset`, the Worker is `theparanormalinitiative`, and `paranormalinitiative.com` is a Custom Domain attached to that same Worker service in the production environment. The root Wrangler configuration also binds the production D1 and R2 resources.

The exact preferred hostname can be preserved only by retaining the current Worker name for development and moving production to a new Worker name. That is technically possible but carries a high production migration risk. The safer recommendation is a distinct development Worker and distinct stateful resources, accepting a new development hostname or a separately approved development custom domain.

## Verified topology

| Item | Finding | Classification |
| --- | --- | --- |
| Repository | `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website` | VERIFIED |
| Branch / HEAD at audit | `main` / `f09e4e63a325235c9378ce69c0a91855ae166daf` | VERIFIED |
| Cloudflare account | `221ea5479876fd303ddc87002b9e892d` | VERIFIED |
| Account name | Paranormalsomerset@gmail.com's Account | VERIFIED |
| Account workers.dev subdomain | `paranormalsomerset` | VERIFIED |
| Worker | `theparanormalinitiative` | VERIFIED |
| workers.dev URL | `https://theparanormalinitiative.paranormalsomerset.workers.dev/` | VERIFIED |
| Custom Domain | `paranormalinitiative.com` -> service `theparanormalinitiative`, environment `production` | VERIFIED |
| Zone routes | Empty route list for `paranormalinitiative.com` | VERIFIED; Custom Domain is the active attachment |
| Current active deployment | deployment `dcd5a35f-dbcd-4066-a49e-646223b7dfd3`, 100% version `7e357215-2579-4c60-b27e-dd572a5656fe` | VERIFIED |
| Worker handlers | `fetch` and `scheduled` | VERIFIED |
| Preview setting | Worker previews enabled; production Custom Domain previews disabled | VERIFIED |
| Git deployment integration | Cloudflare deployment records show source `wrangler`; no GitHub Actions production deploy was found in `.github` | VERIFIED / LIMITED |

Cloudflare documents that a production workers.dev URL is formed from the Worker name and account subdomain, and that Custom Domains attach a hostname directly to a Worker. See the official [workers.dev documentation](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/) and [Custom Domains documentation](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

## Current bindings and dependencies

### Production bindings

The only inspected root Wrangler configuration contains:

| Binding | Resource | Identifier | Classification |
| --- | --- | --- | --- |
| `TPI_DB` | `tpi_contributor_portal` | `f36b9161-b517-4634-9857-bef4147cefe3` | VERIFIED production-bound D1 |
| `TPI_MEDIA` | `tpi-contributor-media` | bucket name | VERIFIED production-bound R2 |
| `ASSETS` | repository-root assets | Worker asset binding | VERIFIED |

The D1 inventory reported `tpi_contributor_portal` as a production database with 62 tables and approximately 13.4 MB from the read-only `d1 info` check. The R2 inventory contained `tpi-contributor-media`; no separate TPI development bucket was present. KV and Queues returned no TPI resources in the inspected account inventory. The unrelated Cauldron resource names were observed only in account-level inventory output and were not accessed or modified.

### Secrets and scheduled work

The Worker secret-name inventory returned only names, not values:

- `RESEND_API_KEY`
- `RESEND_FROM`
- `TPI_OWNER_SETUP_KEY`

The configured cron is `0 */6 * * *`. The scheduled handler runs event, news, and video scrapers and prunes scraper-run history. Development must not share these production secrets or scheduled writes.

### Website dependencies

The Worker uses D1 for authentication sessions, member/community data, administrative workflows, scheduling, scraper records, and other APIs. It uses R2 for member media and the public FFmpeg WASM route. Email uses the Resend-related secrets when configured. Authentication uses a D1-backed `tpi_session` cookie with `HttpOnly`, `Secure`, `SameSite=Lax`, and `Path=/`; the current code does not set a cookie `Domain`, so the cookie is host-only, but the session database is still shared and must not be treated as isolated.

## Version discrepancy investigation

Fresh read-only requests on 2026-10-12 produced the following:

| Check | workers.dev | paranormalinitiative.com | Result |
| --- | --- | --- | --- |
| Homepage status | 200 | 200 | Same |
| Homepage bytes | 19,312 | 19,312 | Same |
| Homepage SHA-256 | `c4992174b729e1b8d220c24dfd041951d3de008fe9041f747ed1b86d6e0c2c6f` | same | Byte-identical |
| `style.css?v=89` | 190,646 bytes; hash `7db3aef85940a97618efa4564ec5b4e703ce7c47d57a775e98e73f3d14d805de` | same | Byte-identical |
| `member-shell.css?v=62` | 82,760 bytes; hash `23803bea8a18d7e44f3b99289ab71bbf133768de02063263dcb3b801991cb18e` | same | Byte-identical |
| `includes.js` | 33,345 bytes; hash `ffa343dd736d1a4454252152cdaf519037b92c75b0d5ea8bd975fefb15b78496` | same | Byte-identical |
| `member-shell.js?v=55` | 231,298 bytes; hash `d2b2d0b2f820246e80b9c221f4e8066351c53d511e0c3c45f9a29f9b455c5d59` | same | Byte-identical |
| Cache header | `cf-cache-status: HIT`; `public, max-age=0, must-revalidate` | same | Same edge behavior |
| Cache-busted homepage | Same 19,312 bytes and hash | same | Same |

The Worker source does not branch on the hostname for normal asset or API handling; it constructs a URL for request-path handling and uses same-origin requests in the browser. No service-worker registration was found in the inspected source.

Therefore the reported discrepancy is **NOT REPRODUCED** as a hostname-specific version difference. The evidence rules out a currently observable different HTML, CSS, or JavaScript deployment. Plausible but unproven explanations include an older browser tab or local cache, a previous deployment observed before the current version, or confusion between the production Worker URL and a version/preview URL. Do not purge caches based on this audit. A fresh browser profile and cache-busting URL should be used for any owner follow-up.

The deployed homepage hash matches the current dirty working-tree `index.html` hash, while committed `HEAD:index.html` has a different hash. This is a verified source/deployment drift risk: the live deployment should not be assumed reproducible from the current commit until the unrelated dirty work is separately reviewed and committed or intentionally discarded by its owner.

## Access and route observations

Anonymous read-only checks returned:

- `/admin-panel`: 403 on both hosts.
- `/admin-center-preview/`: 403 on both hosts.
- `/live-video.html`: 307 to `/live-video` on both hosts.

These results verify the anonymous boundary only; no authenticated acceptance was performed. The production Custom Domain API record directly identifies service `theparanormalinitiative` in environment `production`. The account workers.dev subdomain and Worker naming identify the preferred workers.dev hostname. No separate development service or data environment was found.

## Classification of unknowns

- **VERIFIED:** Current Worker, account, Custom Domain attachment, account subdomain, latest 100% deployment/version, production bindings, secret names, cron, live HTML/assets, anonymous route boundaries.
- **LIKELY:** The workers.dev hostname and production Custom Domain currently execute the same active Worker deployment because both are attached to the same Worker service and returned identical assets; the deployment API is the strongest direct evidence.
- **UNKNOWN:** Whether a prior owner observation came from browser-local state, a previous deployment, an unlisted preview alias, or another URL; authenticated behavior on either host; current GitHub repository automation outside the checked-in `.github` files; exact Cloudflare Access policies not exposed by these checks.
- **BLOCKED:** Safe development deployment, because separate D1/R2/authentication resources and a distinct dev Worker target do not exist in the inspected configuration.

## Separation options

### Option A — New development Worker; retain production Worker

**Shape:** Keep `theparanormalinitiative` attached to `paranormalinitiative.com` and create a distinct development Worker, such as `theparanormalinitiative-dev`, with a separate Wrangler configuration, D1, R2, secrets, auth/session namespace, and cron policy.

- Feasibility: HIGH, subject to owner approval for resource creation.
- Exact preferred URL: NOT PRESERVED; the normal URL becomes `theparanormalinitiative-dev.paranormalsomerset.workers.dev`.
- Production risk: LOW after binding and route review.
- Deployment: development branch/config only; production config remains unchanged.
- Rollback: disable the dev deployment or revert the dev Worker; production is unaffected.
- Cost: separate resources increase usage, not necessarily base plan cost. D1 has included Free-plan limits but enforces daily row limits; R2 has a monthly free tier and charges beyond included storage/operations. See [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) and [R2 pricing](https://developers.cloudflare.com/r2/pricing/).
- Advantage: clearest isolation and simplest production rollback.
- Disadvantage: changes the preferred development hostname.

### Option B — Keep the current Worker name for development; move production

**Shape:** Preserve `theparanormalinitiative.paranormalsomerset.workers.dev` as development, create a new production Worker name, attach `paranormalinitiative.com` to it, and move production bindings/secrets/routes in a controlled migration.

- Feasibility: TECHNICALLY POSSIBLE, but not safe to execute without a separate migration directive.
- Exact preferred URL: PRESERVED for development.
- Production risk: HIGH; the existing custom domain, auth, D1/R2 bindings, cron, secrets, and rollback path must all be re-established on the new Worker.
- Deployment: two Worker configs and a carefully controlled custom-domain transition.
- Rollback: requires moving the Custom Domain back or deploying a known-good production Worker; certificate/DNS propagation and state continuity must be proven.
- Cost: second Worker and duplicate stateful resources may increase usage; D1/R2 limits and billing still depend on usage.
- Advantage: satisfies the exact hostname preference.
- Disadvantage: turns a development requirement into a production migration and creates the largest blast radius.

### Option C — Named Wrangler environments / preview deployments

**Shape:** Add a named development environment with separate environment-specific bindings, `workers_dev = true` or explicit preview configuration, separate secrets, and a development route. Cloudflare documents that named environments can deploy as suffixed Worker services and that preview URLs use a prefix such as `<preview>-<worker>.<subdomain>.workers.dev`.

- Feasibility: MEDIUM to HIGH after testing the exact current Wrangler version and binding behavior.
- Exact preferred URL: NOT PRESERVED; a named environment/preview receives a prefixed or suffixed hostname.
- Production risk: MEDIUM unless the environment explicitly defines every route and binding; an environment file must prevent accidental inheritance of production resources.
- Deployment: `--env development` or a dedicated preview pipeline, never the production command.
- Rollback: environment-specific rollback is straightforward if stateful resources are separate.
- Cost: similar to Option A for separate D1/R2 usage; previews alone do not create a safe data boundary.
- Advantage: one repository can express environment configuration and reduce configuration drift.
- Disadvantage: easy to misconfigure; preview URLs and Worker versions are not substitutes for separate D1/R2/authentication.

Cloudflare’s current [environment guidance](https://developers.cloudflare.com/workers/wrangler/environments/) and [preview guidance](https://developers.cloudflare.com/workers/previews/) support the suffixed/prefixed URL behavior. The existing TPI configuration has no environment blocks today.

## Recommendation

Recommend **Option A**, with Option C as an implementation style only if the final configuration makes the development Worker, D1, R2, secrets, authentication, and cron independently verifiable. Do not recommend Option B solely to preserve the hostname; its production migration risk is disproportionate.

The exact preferred URL is therefore **not safely preservable without moving production**. That tradeoff should be explicit in the owner approval decision.
