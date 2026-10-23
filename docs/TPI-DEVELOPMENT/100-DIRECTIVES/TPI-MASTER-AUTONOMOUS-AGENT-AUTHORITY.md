# TPI MASTER — Standing Autonomous Agent Authority

Effective: 2026-10-22

Status: ACTIVE / CONTROLLING OPERATIONAL AUTHORITY

Scope: The Paranormal Initiative canonical repository, development systems,
GitHub repository, Cloudflare Worker, and StudioFlow release workflow.

## Owner authorization

The owner grants every capable development agent standing authority to carry a
TPI directive through its complete engineering lifecycle:

1. Investigate the current source, runtime, history, and evidence.
2. Repair application code, tests, fixtures, tooling, configuration, and
   documentation.
3. Refactor when necessary to fix the cause rather than the symptom.
4. Run local, isolated, browser, integration, and regression verification.
5. Commit focused approved work to `codex/tpi-development`.
6. Push the verified commit to GitHub.
7. Run the guarded Cloudflare release preflight.
8. Deploy a verified release to `theparanormalinitiative` when the directive
   calls for production completion.
9. Perform live Firefox Developer Edition acceptance with disposable data.
10. Roll back a failed release, repair it, retest it, and redeploy it.

This authority is standing. An agent does not need a new owner message for each
ordinary code repair, test-harness repair, commit, push, guarded deployment,
live acceptance run, or rollback within the active TPI directive.

## Directive precedence

- The newest explicit owner instruction controls when requirements conflict.
- This directive supersedes permanent interpretations of older phrases such as
  `do not deploy`, `owner approval required`, `do not commit`, `do not push`,
  `no restart`, or `stop after reporting` once that older task has ended.
- Those phrases remain part of the historical record and remain accurate for
  the execution in which they were issued; they are not continuing global
  restrictions on later work.
- A new task-specific instruction that explicitly says `read-only`, `research
  only`, `do not deploy`, or otherwise narrows the current task still controls
  that current task.
- A historical report may describe a blocker, but it does not authorize an
  agent to stop when the blocker can now be safely repaired with available
  tools and this standing authority.

## Required autonomous behavior

When a repairable failure appears, the agent must investigate, repair, rerun
the failed gate, and continue. Routine problems with Wrangler, local services,
fixtures, browser automation, build assets, Git state, or test launchers are
work to complete—not final blockers.

Agents may independently:

- control the maintained local LaunchAgent services;
- repair persistent local development authentication;
- create and use isolated disposable test databases, buckets, accounts,
  browser profiles, Studios, and media;
- modify maintained application source and build/release tooling;
- reconcile generated assets with authoritative source;
- create focused commits and push `codex/tpi-development`;
- inspect Cloudflare state and run guarded Wrangler operations;
- deploy verified application releases and execute a guarded rollback;
- update all affected directive, status, handoff, and result records.

Agents must not manufacture success. Builds, tests, deployment, and live
acceptance are separate evidence gates and must be reported separately.

## Maintained release control

Every agent must follow
`../TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md`. It is the plain-language, exact
staging, cleanup, commit, push, preflight, deployment, verification, rollback,
and final-cleanliness procedure.

StudioFlow work must also follow
`../TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`, which defines the separate
authoritative source, website integration, local runtime, development preview,
GitHub push, and production deployment states. None automatically updates the
next state.

The only maintained production path is:

```sh
npm run verify:local-auth-lifecycle
npm run release:preflight
TPI_PRODUCTION_DEPLOY=approved npm run release:production
```

The workflow requires a clean `codex/tpi-development` tree, exact GitHub parity,
persistent-local-auth verification, disposable E2E D1/R2 state, StudioFlow
build verification, isolated Firefox Developer Edition acceptance,
authoritative asset staging, Cloudflare account and Worker checks, rollback
capture, and the guarded Wrangler dry-run. Production mode repeats the gates,
deploys, verifies live, and automatically rolls back on critical failure.

Do not bypass this guard or deploy an undocumented dirty working tree.

## Firefox Developer Edition

Firefox Developer Edition is the default browser for:

- `http://127.0.0.1:8787/member-login.html`
- `https://paranormalinitiative.com/studio/`

Automated acceptance must use isolated disposable profiles, downloads,
cookies, localStorage, IndexedDB, and cache. Do not close or repurpose the
owner's open local or production tabs. Chromium may be used only for an
explicit compatibility requirement, such as direct folder access.

## Non-negotiable safety boundary

Standing authority does not include:

- exposing, logging, committing, or requesting private credentials;
- disabling authentication, authorization, or deployment safeguards;
- force-pushing or rewriting shared Git history;
- deleting production D1 rows or R2 objects;
- applying destructive or irreversible production migrations;
- clearing owner browser storage;
- deleting, recreating, migrating, or destructively testing Crossroads of the
  Unknown or another owner Studio;
- deploying code known to fail a critical gate;
- modifying another owner project outside TPI.

These actions require separate explicit owner approval because they are
irreversible, security-sensitive, or outside the project scope. Ordinary
additive application releases do not require another approval.

## Legitimate owner-interaction conditions

An agent should request only the minimum owner action when a private login,
macOS authorization prompt, unavailable account permission, irreversible data
operation, or missing rollback/security safeguard cannot be resolved safely by
the agent. After that action, the agent resumes and completes the directive.

## Completion rule

A production directive is complete only when the applicable implementation,
tests, GitHub push, guarded deployment, live acceptance, and rollback status
are recorded. If a critical live regression appears, rollback is part of the
task rather than a new task requiring another directive.
