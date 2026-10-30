# Developer Onboarding

## Standing agent authority

`100-DIRECTIVES/TPI-MASTER-AUTONOMOUS-AGENT-AUTHORITY.md` is the current
controlling operations policy. It authorizes agents to finish active TPI work,
including focused commits, GitHub pushes, guarded production deployment, live
Firefox verification, and rollback. Older directive-specific limits remain
historical evidence and do not permanently disable those operations.

## READ BEFORE MODIFYING TPI

### Use this folder

Use only the canonical source checkout:

    /Users/toddknipple/Documents/GitHub/paranormal-initiative-website

The Desktop folder at `/Users/toddknipple/Desktop/paranormal-initiative-website` is an older archive/research workspace with unique uncommitted StudioFlow/member-site work and Paranormal Teams research data. Do not delete, overwrite, synchronize, merge, or deploy from it. Valuable material must be audited separately before incorporation.

### Use this branch carefully

The maintained branch is `codex/tpi-development`. Confirm it before work,
preserve unrelated changes, and use it as the source for the guarded production
release workflow. Do not merge or push to `main` unless a current owner
instruction explicitly changes the branch policy.

### Know the environments

- Official owner-facing StudioFlow local environment:
  `http://127.0.0.1:8787/studio/`, started with `npm run dev:local` and backed
  by local D1/R2 state under `.local-dev/state/v3`.
- Production Worker: `theparanormalinitiative`
- Production URL: `https://paranormalinitiative.com/`
- Production D1: `tpi_contributor_portal`
- Production R2: `tpi-contributor-media`
- Existing workers.dev endpoint: production-bound; not safe for development
- Optional isolated remote development Worker: `theparanormalinitiative-dev`
- Optional remote development URL:
  `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev`

The optional remote development environment has separate D1, R2, host-scoped
sessions, test accounts, and no cron or Resend configuration. It is not the
owner-facing local StudioFlow environment and must not be substituted for port
8787. Do not add production secrets or bindings to it.

### Standing authority and separate approval boundary

Agents may repair and deploy TPI application code through the maintained guard.
Do not use the production Wrangler target as development, request or expose
owner passwords/tokens, bypass authentication, rewrite Git history, modify The
Cauldron & The Craft, or perform destructive production D1/R2 operations.
Irreversible migrations, owner-data deletion, membership activation, or other
security-sensitive state changes require separate explicit owner approval.

### How to work and test

1. Inspect `git status --short`, branch, and HEAD.
2. Make changes only in the canonical checkout.
3. Create a recoverable checkpoint before substantial work.
4. Run the smallest relevant tests and build checks.
5. Use isolated fixtures; never use production data for destructive testing.
6. When an optional public development preview is needed, use
   `./scripts/deploy-development.sh`. Its preflight requires
   `codex/tpi-development` and the development bindings, and its staging step
   excludes secrets and internal files. This preview does not update or prove
   production.
7. Preserve evidence, including the exact URL and deployment identifier.

The deployment gate also requires the package to be reproducible from the
reviewed Git revision. If application files are uncommitted, stop and review
them before deployment; do not use a clean archive and do not silently deploy
an undocumented working-tree overlay. `node scripts/verify-development-config.mjs
--report-only` inventories the state without deploying.

### When Todd interaction is needed

Standing authority covers ordinary application releases. Request only the
minimum Todd interaction needed for a private production sign-in, macOS
permission prompt, unavailable account authorization, or irreversible
owner-data decision. Do not stop for routine repairable engineering issues.

### How to recover from mistakes

Preserve unrelated changes. Prefer targeted restoration, revert commits, and the last verified deployment. Do not force-push, rewrite shared history, or assume that a code rollback restores D1/R2 data. For an uncertain state, stop and record the current commit, target, and deployment before changing anything.

## First session

    cd /Users/toddknipple/Documents/GitHub/paranormal-initiative-website
    git status --short
    git branch --show-current
    git rev-parse HEAD

Read 001-DEVELOPER-START-HERE.md, the applicable directive index entry, and the relevant audit before changing code.

For StudioFlow, also read
`TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`. A source edit, local test,
development-Worker deploy, GitHub push, and production deploy are five distinct
events. Never describe one as proof of another.

## Local Administration Center

    cd /Users/toddknipple/Documents/GitHub/paranormal-initiative-website/admin-center-app
    npm install
    npm run dev

Use the URL printed by Vite. Build with npm run build; preview the build with npm run preview.

## Review and release

Run `git diff --check`, review only the intended files, run the relevant tests,
and preserve unrelated dirty files. Push only to the approved repository and
verified development branch. Then follow the exact sequence in
`TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md`: run
`npm run verify:local-auth-lifecycle`, run `npm run release:preflight`, and only
after it reports `READY` run
`TPI_PRODUCTION_DEPLOY=approved npm run release:production`. Never invoke the
production Wrangler deployment directly or omit the preflight.

## Always-protected operations

Do not deploy the production target as a development sandbox, run destructive
remote migrations, delete production D1/R2 data, weaken authentication, expose
private routes, reveal secrets, force-push shared history, destructively test
owner Studios, or modify The Cauldron & The Craft. A normal guarded TPI code
deployment is authorized; these irreversible or security-sensitive operations
are not implied by that authority.

## Where to find records

- Numbered workflow: docs/TPI-DEVELOPMENT/
- Directives: docs/TPI-DEVELOPMENT/100-DIRECTIVES/
- Audits: docs/TPI-DEVELOPMENT/200-AUDITS/
- Completed work links: docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/
- Future work: docs/TPI-DEVELOPMENT/400-FUTURE-DEVELOPMENT/
- Original historical documentation: repository docs/ and root Markdown files
