# Release Pipeline Shared-API Optimization

## Incident record

- Date: 2026-11-14
- Time recorded: 14:58 EST
- Area: TPI release certification and deployment workflow
- Scope: Site-wide release process
- Problem: A server-backed member repair could escalate into the complete platform suite, including StudioFlow acceptance, even when protected applications were unchanged.

## What happened

The notification repair required both new notification targets and enrichment of existing notification records. Because the server/API source changed, the release was correctly treated as higher risk. However, the previous impact model grouped ordinary shared API work with full-platform work. That caused unnecessary StudioFlow rebuilds, browser acceptance, and unrelated application regression gates.

The measured full-platform preflight for the release-tooling change was 6m 36s. That cost is appropriate for changing the release machinery itself, but not for every future member or community API repair.

## How it was fixed

The release classifier now has four explicit profiles:

1. `website` — HTML, CSS, images, member pages, Help Center, and targeted website verification.
2. `shared-api` — `functions/` and non-security shared libraries that serve the website and member APIs.
3. `studioflow` — StudioFlow application source and its dedicated verification paths.
4. `full` — migrations, authentication/security libraries, Worker entry/configuration, release tooling, Nova, Administration Center, multiple applications, or ambiguous changes.

For `shared-api`, the release guard now runs:

- local authentication smoke;
- member/API boundary regression;
- notification and member-interaction source contracts when relevant;
- affected member profile/feed browser verification when relevant;
- protected-application byte integrity.

It does not rebuild StudioFlow, run StudioFlow lifecycle suites, or run live StudioFlow acceptance unless StudioFlow itself is part of the change. Nova and Creator Studio remain protected as well.

The complete platform profile remains available and is still required for security-sensitive, schema, release-system, application, or ambiguous changes.

## Verification

- Release-impact classifier: 12/12 passed.
- Release safety contract: 33/33 passed.
- Full certification for the pipeline change: 37 gates passed in 6m 36s.
- Production anonymous smoke: 10/10 passed.
- Live Firefox acceptance: 65/65 passed.
- Protected StudioFlow source commit remained `2c7c651f34839b0115596d632f1009214e4cd63d`.
- Production Worker version: `7c6df36d-7129-44fd-b1c5-3467de57b757`.
- Production release: `rel-1b9a3c9851d0-01434eb2bcdd`.
- Repository commit: `1b9a3c9851d07ba64db99d4207854deff8c608bd`.

## Expected future behavior

For a notification or member API repair touching `functions/api/[[path]].js` and `member-home.html`, the classifier now returns `shared-api`. The protected applications stay byte-locked, and the release does only the checks relevant to the shared member experience.

## Reference lesson

The safety boundary should follow the changed system. Protect stable applications with byte checks, but do not make every shared website API repair pay the cost of certifying unrelated applications. Test what changed, protect what did not, and reserve full certification for changes that can actually affect the full platform.
