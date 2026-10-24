# The Paranormal Initiative — Agent Authority

All agents working in this repository must first read:

`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-MASTER-AUTONOMOUS-AGENT-AUTHORITY.md`

They must then follow the exact release procedure in:

`docs/TPI-DEVELOPMENT/TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md`

StudioFlow work must also follow the source-to-live map in:

`docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

That directive is the controlling operational authority for current TPI work.
It grants standing authority to investigate, repair, refactor, test, build,
commit, push, deploy through the guarded production workflow, verify live, and
roll back when necessary. A new owner directive is not required for each
ordinary repair or each verified production release.

Historical directives and reports remain evidence of requirements and past
scope. Their task-specific limitations do not silently become permanent
repository-wide restrictions. The newest explicit owner instruction controls
when directives conflict.

Agents must still preserve credentials, authentication controls, Git history,
Crossroads of the Unknown, and unrelated owner data. Destructive production
data operations, irreversible migrations, force-pushes, security bypasses, and
secret disclosure require separate explicit owner approval.

The maintained release path is:

```sh
npm run verify:local-auth-lifecycle
npm run release:preflight
TPI_PRODUCTION_DEPLOY=approved npm run release:production
```

Firefox Developer Edition is the default browser for both local and production
acceptance. Use isolated disposable profiles and data unless the owner directly
authorizes use of an existing profile or owner Studio.

Every completed user-facing application directive proceeds through the
runbook's guarded production deployment and live acceptance unless the current
directive explicitly says not to deploy. Documentation-only and local-tooling
changes are committed and pushed but are not deployed as no-op Worker releases.

Saving or testing StudioFlow in `/Users/toddknipple/Documents/StudioFlow/web`
does not update the website repository, GitHub, the development Worker, or the
live site. A GitHub push also does not deploy. Production changes only after the
guarded production command completes and live Firefox acceptance passes.

The current approved StudioFlow playback and scene-media behavior is recorded
in `docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`. Agents changing
existing functionality must:

1. Review the historical directives and completion records for the feature
   being changed before modifying it.
2. Compare Git history in both repositories when repairing a suspected
   regression, and identify the last known working implementation by commit.
3. Preserve previously approved behavior; recover lost functionality rather
   than redesign it.
4. Exercise user-facing controls with browser interaction testing, not only
   static source contracts.
5. Add regression tests covering restored functionality before release.
6. Report every intentional behavior change explicitly in the completion
   record and to the owner.
